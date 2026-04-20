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

# --- Pick next ticket ------------------------------------------------------
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

if [[ -z "$URL" ]]; then
  # defensive: nothing to do
  exit 0
fi

# Extract the ticket ID for the log filename
TICKET_ID=$(echo "$URL" | awk -F/ '{print $NF}')
TS=$(date +%Y-%m-%dT%H%M%S)
LOG_FILE="$LOG_DIR/${TS}-ticket-${TICKET_ID}.log"
REPORT_FILE="${LOG_FILE%.log}.report.json"

# Exported so /triage can write its structured report alongside the log.
# The triage command writes suggestions (missing tools, docs, friction) here;
# the viewer (projects/triage-viewer) aggregates them.
export TRIAGE_REPORT_PATH="$REPORT_FILE"
export TRIAGE_TICKET_ID="$TICKET_ID"
export TRIAGE_TICKET_URL="$URL"

# --- Run triage, capture everything ---------------------------------------
{
  echo "=== run-triage-cron.sh ==="
  echo "Started:  $(date -Iseconds)"
  echo "Ticket:   $URL"
  echo "Log:      $LOG_FILE"
  echo "=========================="
  echo

  # Run claude in non-interactive mode with the /triage command.
  # Capture stderr as well so API errors and tool failures are visible.
  # timeout 25m guards against a hung Claude session holding the flock
  # beyond the next cron tick (flock releases on crash, not on hang).
  # cd into REPO_ROOT so Claude discovers .claude/commands/triage.md as a
  # project-scoped command (cron's default CWD is $HOME, where /triage
  # resolves to "Unknown skill: triage").
  cd "$REPO_ROOT"
  if timeout 25m claude -p "/triage $URL" 2>&1; then
    CLAUDE_EXIT=0
  else
    CLAUDE_EXIT=$?
  fi

  echo
  echo "=========================="
  echo "Finished: $(date -Iseconds)"
  echo "Claude exit: $CLAUDE_EXIT"
} | tee "$LOG_FILE"

# Use the captured claude exit code as the script's exit code (but don't
# mask the tee pipeline — PIPESTATUS gives us what we need).
if [[ "${PIPESTATUS[0]}" -ne 0 ]]; then
  echo "ERROR: claude -p failed (see $LOG_FILE)" >&2
  exit 3
fi

exit 0
