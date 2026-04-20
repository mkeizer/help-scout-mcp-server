#!/usr/bin/env bash
# run-triage-cron.sh
#
# Cron entrypoint: picks the next Koos-assigned ticket and runs /triage on it
# in a fresh Claude session, capturing ALL output to a timestamped log file
# under logs/triage/ for later review.
#
# Usage (cron):
#   */5 * * * * /home/claude/projects/kohelpscout/help-scout-mcp-server/scripts/run-triage-cron.sh >/dev/null 2>&1
#
# Usage (manual, one specific ticket — bypasses the Koos-queue pick):
#   scripts/run-triage-cron.sh https://secure.helpscout.net/conversation/<convId>/<ticketId>
#
# When a URL arg is provided, next-koos-ticket.sh is skipped and the wrapper
# runs the full triage pipeline (HS meta + streaming + usage) on that one ticket.
#
# Exit codes:
#   0  triage ran successfully, no ticket to pick up, or gateway unhealthy (no-op)
#   1  lock already held (another run in progress)
#   2  next-koos-ticket.sh failed unexpectedly
#   3  claude invocation failed

set -euo pipefail

# Cron runs with a minimal PATH (/usr/bin:/bin). Claude, node, and other
# user-level tools live outside that, so extend PATH explicitly.
export PATH="/home/claude/.local/bin:/home/claude/.nvm/versions/node/v24.14.1/bin:/home/claude/.npm-global/bin:/usr/local/bin:/usr/bin:/bin"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$REPO_ROOT/logs/triage"
LOCK_FILE="$REPO_ROOT/.triage-cron.lock"

mkdir -p "$LOG_DIR"

# --- Lock: prevent overlapping runs ---------------------------------------
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "another triage run is in progress, skipping" >&2
  exit 1
fi

# --- Pre-flight liveness logging ------------------------------------------
# One greppable line per run in $LOG_DIR/cron-health.log:
#   <iso-ts> gateway=ok hs=ok             → triage proceeds (or no-ticket)
#   <iso-ts> gateway=down code=502 body=…  → skipped (Claude not started)
#   <iso-ts> gateway=ok hs=down exit=2     → skipped (HS API unreachable)
#
# Rationale: outage-diagnostic without digging through per-run logs, plus
# a positive proof-of-life so you can compute effective uptime with `wc -l`
# and `grep skip`.
#
# Gateway check uses public /health (no bearer), returns {"status":"ok"} in
# <200ms. Catches DNS/TLS/proxy/gateway-process-down. Not caught: gateway
# up but one backend cl0* unreachable (rare enough to accept one wasted run).
# HS API liveness is piggy-backed on next-koos-ticket.sh (its OAuth2 + fetch
# already fails with exit 2 when HS is down — no separate probe needed).
HEALTH_URL="${GATEWAY_HEALTH_URL:-https://gateway.keurigonline.nl/health}"
HEALTH_LOG="$LOG_DIR/cron-health.log"

HEALTH_RESPONSE=$(curl -sS --max-time 5 -w '\n%{http_code}' "$HEALTH_URL" 2>&1 || true)
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [[ "$HEALTH_CODE" != "200" ]] || ! echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
  printf '%s gateway=down code=%s body=%s\n' \
    "$(date -Iseconds)" "${HEALTH_CODE:-none}" "$(echo "$HEALTH_BODY" | head -c 200 | tr '\n' ' ')" \
    >> "$HEALTH_LOG"
  exit 0
fi

# --- Pick next ticket (or use URL override) --------------------------------
# When a URL is passed as $1, skip the Koos-queue pick and use that ticket.
if [[ $# -ge 1 && "$1" =~ ^https?:// ]]; then
  URL="$1"
  printf '%s gateway=ok hs=ok source=manual\n' "$(date -Iseconds)" >> "$HEALTH_LOG"
  echo "manual trigger: $URL" >&2
else
  set +e
  URL=$("$SCRIPT_DIR/next-koos-ticket.sh")
  PICK_EXIT=$?
  set -e

  if [[ $PICK_EXIT -eq 2 ]]; then
    # HS API unreachable (OAuth2 or fetch failed). Log & treat as no-op so cron
    # doesn't keep alerting on it — we'll see it in cron-health.log instead.
    printf '%s gateway=ok hs=down exit=%s\n' "$(date -Iseconds)" "$PICK_EXIT" >> "$HEALTH_LOG"
    exit 0
  fi

  # Positive proof-of-life: pre-flight all green.
  printf '%s gateway=ok hs=ok\n' "$(date -Iseconds)" >> "$HEALTH_LOG"

  if [[ $PICK_EXIT -eq 1 ]]; then
    # no qualifying ticket
    exit 0
  fi

  if [[ $PICK_EXIT -ne 0 ]]; then
    echo "ERROR: next-koos-ticket.sh exited $PICK_EXIT" >&2
    exit 2
  fi
fi

if [[ -z "$URL" ]]; then
  # defensive: nothing to do
  exit 0
fi

# Extract the ticket ID for the log filename
TICKET_ID=$(echo "$URL" | awk -F/ '{print $NF}')
CONVERSATION_ID=$(echo "$URL" | awk -F/ '{print $(NF-1)}')
TS=$(date +%Y-%m-%dT%H%M%S)
LOG_FILE="$LOG_DIR/${TS}-ticket-${TICKET_ID}.log"
REPORT_FILE="${LOG_FILE%.log}.report.json"

# Exported so /triage can write its structured report alongside the log.
# The triage command writes suggestions (missing tools, docs, friction) here;
# the viewer (projects/triage-viewer) aggregates them.
export TRIAGE_REPORT_PATH="$REPORT_FILE"
export TRIAGE_TICKET_ID="$TICKET_ID"
export TRIAGE_TICKET_URL="$URL"

# --- Capture HS metadata (subject, customer, status) before invoking Claude --
# Cron wrapper has .env with HELPSCOUT_APP_ID + HELPSCOUT_APP_SECRET. Rather than
# letting Claude derive subject/customer from its own context (AI-generated),
# we grab the real HS fields once here so the log carries authoritative metadata.
HS_META_LINES=""
if [[ -f "$REPO_ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  set -a; source "$REPO_ROOT/.env"; set +a
  if [[ -n "${HELPSCOUT_APP_ID:-}" && -n "${HELPSCOUT_APP_SECRET:-}" && -n "$CONVERSATION_ID" ]]; then
    HS_TOKEN=$(curl -sf -X POST https://api.helpscout.net/v2/oauth2/token \
      -H 'Content-Type: application/json' \
      -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$HELPSCOUT_APP_ID\",\"client_secret\":\"$HELPSCOUT_APP_SECRET\"}" \
      2>/dev/null | jq -r '.access_token // empty' 2>/dev/null || true)
    if [[ -n "$HS_TOKEN" ]]; then
      HS_CONV=$(curl -sf "https://api.helpscout.net/v2/conversations/$CONVERSATION_ID" \
        -H "Authorization: Bearer $HS_TOKEN" 2>/dev/null || true)
      if [[ -n "$HS_CONV" ]]; then
        HS_META_LINES=$(echo "$HS_CONV" | jq -r '
          [
            "Subject: \(.subject // "(geen onderwerp)")",
            "Customer: \((.primaryCustomer.first // "") + " " + (.primaryCustomer.last // "") | ltrimstr(" ") | rtrimstr(" "))\(if .primaryCustomer.email then " <" + .primaryCustomer.email + ">" else "" end)",
            "Status: \(.status // "")",
            "HSCreatedAt: \(.createdAt // "")",
            "Mailbox: \(.mailboxId // "")",
            "Tags: \(.tags // [] | map(.tag) | join(", "))"
          ] | .[]
        ' 2>/dev/null || true)
      fi
    fi
  fi
fi

# --- Run triage with STREAMING output -------------------------------------
# --output-format stream-json emits one NDJSON event per line as they arrive.
# We format each event into a human-readable line and append to the log live,
# so `tail -f <log>` shows the run in progress. The viewer's SSE watcher also
# re-renders incrementally. `tee >(...)` forks the stream so we can capture
# the final `result` event separately for usage/cost extraction.
cd "$REPO_ROOT"
RESULT_FILE=$(mktemp)
trap 'rm -f "$RESULT_FILE"' EXIT

# Header first — needed for HS metadata parsing even if claude fails early.
{
  echo "=== run-triage-cron.sh ==="
  echo "Started:  $(date -Iseconds)"
  echo "Ticket:   $URL"
  echo "Log:      $LOG_FILE"
  [[ -n "$HS_META_LINES" ]] && echo "$HS_META_LINES"
  echo "=========================="
  echo
} > "$LOG_FILE"

set +e
timeout 25m claude -p "/triage $URL" --output-format stream-json --verbose 2>&1 \
  | tee >(jq -c 'select(.type == "result")' > "$RESULT_FILE" 2>/dev/null) \
  | while IFS= read -r line; do
      t=$(jq -r '.type // empty' <<<"$line" 2>/dev/null)
      ts=$(date +%H:%M:%S)
      case "$t" in
        assistant)
          # Emit text and tool-calls separately so the viewer can timestamp
          # tool-boundary lines while leaving assistant text paragraphs clean.
          jq -r '
            (.message.content // [])[]
            | if .type == "text" then "__TEXT__\n" + .text
              elif .type == "tool_use" then
                "__TOOL__ " + .name + " " +
                ((.input // {}) | tostring | if length > 160 then .[0:160] + "…" else . end)
              else empty end
          ' <<<"$line" 2>/dev/null | \
          awk -v ts="$ts" '
            BEGIN { mode = "" }
            /^__TEXT__/ { mode = "text"; next }
            /^__TOOL__ / { sub(/^__TOOL__ /, ""); printf "[%s] [tool] %s\n", ts, $0; mode = ""; next }
            mode == "text" { print }
          '
          ;;
        user)
          # Tool results — one stamped line per result.
          jq -r '
            (.message.content // [])[]
            | select(.type == "tool_result")
            | if .is_error == true then "[tool-error]" else "[tool-ok]" end
          ' <<<"$line" 2>/dev/null | awk -v ts="$ts" '{ printf "[%s] %s\n", ts, $0 }'
          ;;
        system)
          # Only surface interesting system events; drop hook_started / hook_response noise.
          jq -r 'if (.subtype // "") == "init" then "[session init]" else empty end' <<<"$line" 2>/dev/null | \
          awk -v ts="$ts" 'NF { printf "[%s] %s\n", ts, $0 }'
          ;;
      esac
    done >> "$LOG_FILE"
CLAUDE_EXIT=${PIPESTATUS[0]}
set -e

USAGE_LINE=""
if [[ -s "$RESULT_FILE" ]] && jq -e . "$RESULT_FILE" >/dev/null 2>&1; then
  USAGE_LINE=$(jq -r '"input=\(.usage.input_tokens // 0) output=\(.usage.output_tokens // 0) cache_creation=\(.usage.cache_creation_input_tokens // 0) cache_read=\(.usage.cache_read_input_tokens // 0) cost_usd=\(.total_cost_usd // 0) duration_ms=\(.duration_ms // 0) turns=\(.num_turns // 0)"' "$RESULT_FILE")
fi

{
  echo
  echo "=========================="
  echo "Finished: $(date -Iseconds)"
  echo "Claude exit: $CLAUDE_EXIT"
  [[ -n "$USAGE_LINE" ]] && echo "Usage: $USAGE_LINE"
} >> "$LOG_FILE"

if [[ $CLAUDE_EXIT -ne 0 ]]; then
  echo "ERROR: claude -p failed (see $LOG_FILE)" >&2
  exit 3
fi

exit 0
