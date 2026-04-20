#!/usr/bin/env bash
# backfill-hs-meta.sh
#
# Fetches Help Scout conversation metadata (subject, customer, status) for each
# historical triage log and injects it after the "Log:" header line. Idempotent:
# skips logs that already have a "Subject:" line.
#
# Usage: scripts/backfill-hs-meta.sh
#
# Depends on HELPSCOUT_APP_ID + HELPSCOUT_APP_SECRET in .env, jq, curl.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$REPO_ROOT/logs/triage"
ENV_FILE="$REPO_ROOT/.env"

[[ -f "$ENV_FILE" ]] || { echo "ERROR: $ENV_FILE not found" >&2; exit 1; }
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${HELPSCOUT_APP_ID:?HELPSCOUT_APP_ID must be set}"
: "${HELPSCOUT_APP_SECRET:?HELPSCOUT_APP_SECRET must be set}"

HS_TOKEN=$(curl -sf -X POST https://api.helpscout.net/v2/oauth2/token \
  -H 'Content-Type: application/json' \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$HELPSCOUT_APP_ID\",\"client_secret\":\"$HELPSCOUT_APP_SECRET\"}" \
  | jq -r '.access_token')

[[ -n "$HS_TOKEN" && "$HS_TOKEN" != "null" ]] || { echo "ERROR: could not get HS token" >&2; exit 2; }

ENRICHED=0
SKIPPED=0
FAILED=0

for log in "$LOG_DIR"/*.log; do
  [[ -f "$log" ]] || continue
  # Skip non-triage logs (gateway-health etc.)
  [[ "$(basename "$log")" =~ -ticket- ]] || continue

  # Idempotent: skip if already enriched
  if grep -q '^Subject: ' "$log"; then
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  URL=$(grep -m1 '^Ticket: ' "$log" | awk '{print $2}')
  [[ -n "$URL" ]] || { FAILED=$((FAILED+1)); continue; }
  CONV_ID=$(echo "$URL" | awk -F/ '{print $(NF-1)}')
  [[ "$CONV_ID" =~ ^[0-9]+$ ]] || { FAILED=$((FAILED+1)); continue; }

  HS_CONV=$(curl -sf "https://api.helpscout.net/v2/conversations/$CONV_ID" \
    -H "Authorization: Bearer $HS_TOKEN" 2>/dev/null || true)
  if [[ -z "$HS_CONV" ]]; then
    echo "  skip (HS 404?): $(basename "$log")" >&2
    FAILED=$((FAILED+1))
    continue
  fi

  META=$(echo "$HS_CONV" | jq -r '
    [
      "Subject: \(.subject // "(geen onderwerp)")",
      "Customer: \((.primaryCustomer.first // "") + " " + (.primaryCustomer.last // "") | ltrimstr(" ") | rtrimstr(" "))\(if .primaryCustomer.email then " <" + .primaryCustomer.email + ">" else "" end)",
      "Status: \(.status // "")",
      "HSCreatedAt: \(.createdAt // "")",
      "Mailbox: \(.mailboxId // "")",
      "Tags: \(.tags // [] | map(.tag) | join(", "))"
    ] | .[]
  ' 2>/dev/null || true)

  [[ -n "$META" ]] || { FAILED=$((FAILED+1)); continue; }

  # Insert META after the "Log:" line
  TMP=$(mktemp)
  awk -v meta="$META" '
    /^Log:[[:space:]]/ && !done { print; print meta; done=1; next }
    { print }
  ' "$log" > "$TMP"
  mv "$TMP" "$log"
  ENRICHED=$((ENRICHED+1))
  # Rate-limit: HS allows ~400 req/min
  sleep 0.2
done

echo "Enriched: $ENRICHED  Skipped (already had meta): $SKIPPED  Failed: $FAILED"
