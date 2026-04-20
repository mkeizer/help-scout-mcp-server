#!/usr/bin/env bash
# next-koos-ticket.sh
#
# Prints the URL of the oldest active ticket assigned to Koos
# (user ID 903748) in the KeurigOnline inbox (111589).
# Skips tickets that were triaged in the last 10 minutes (cooldown).
#
# Exit codes:
#   0  ticket found, URL printed to stdout
#   1  no qualifying ticket, nothing printed
#   2  auth or API error
#
# Intended for cron use, e.g.:
#   URL=$(scripts/next-koos-ticket.sh) && claude -p "/triage $URL"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${HELPSCOUT_APP_ID:?HELPSCOUT_APP_ID must be set (via .env or environment)}"
: "${HELPSCOUT_APP_SECRET:?HELPSCOUT_APP_SECRET must be set (via .env or environment)}"

KOOS_USER_ID="${KOOS_USER_ID:-903748}"
MAILBOX_ID="${MAILBOX_ID:-111589}"

# 1. OAuth2 client credentials token
TOKEN_RESPONSE=$(curl -sf -X POST https://api.helpscout.net/v2/oauth2/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$HELPSCOUT_APP_ID\",\"client_secret\":\"$HELPSCOUT_APP_SECRET\"}") || {
  echo "ERROR: token request failed" >&2
  exit 2
}

TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["access_token"])') || {
  echo "ERROR: could not parse token: $TOKEN_RESPONSE" >&2
  exit 2
}

# 2. Fetch active conversations assigned to Koos, oldest first
CONVERSATIONS=$(curl -sf -G "https://api.helpscout.net/v2/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "assigned_to=$KOOS_USER_ID" \
  --data-urlencode "status=active" \
  --data-urlencode "mailbox=$MAILBOX_ID" \
  --data-urlencode "sortField=createdAt" \
  --data-urlencode "sortOrder=asc") || {
  echo "ERROR: conversations request failed" >&2
  exit 2
}

# 3. Pick the first conversation that qualifies.
#
# Qualifying means: not a skip-subject AND not recently triaged (cooldown).
# Assignment to Koos IS the signal to triage, regardless of tags — a correctly
# finished triage never leaves the ticket active+assigned-to-Koos (see
# triage.md "Ticket ownership rules"), so re-processing the same ticket only
# happens if a human re-assigns it after the cooldown expires.
LOG_DIR="$REPO_ROOT/logs/triage"
CONVERSATIONS="$CONVERSATIONS" LOG_DIR="$LOG_DIR" python3 <<'PY'
import json, os, re, sys, glob, time

data = json.loads(os.environ["CONVERSATIONS"])
items = data.get("_embedded", {}).get("conversations", [])
log_dir = os.environ.get("LOG_DIR", "")

SKIP_SUBJECT = re.compile(
    r"MIGRATIE VEREIST|^Autoreply:|^Auto Reply:|^Cron ",
    re.IGNORECASE,
)

COOLDOWN_SECONDS = 600  # 10 minutes

def recently_triaged(ticket_number):
    """Check if a log file for this ticket was written in the last COOLDOWN_SECONDS."""
    if not log_dir:
        return False
    pattern = os.path.join(log_dir, f"*-ticket-{ticket_number}.log")
    logs = glob.glob(pattern)
    if not logs:
        return False
    newest = max(os.path.getmtime(f) for f in logs)
    return (time.time() - newest) < COOLDOWN_SECONDS

for conv in items:
    subject = conv.get("subject") or ""
    if SKIP_SUBJECT.search(subject):
        continue
    number = conv.get("number")
    if recently_triaged(number):
        print(f"SKIP: #{number} triaged {int(time.time() - max(os.path.getmtime(f) for f in glob.glob(os.path.join(log_dir, f'*-ticket-{number}.log'))))}s ago (cooldown {COOLDOWN_SECONDS}s)", file=sys.stderr)
        continue
    cid = conv.get("id")
    print(f"https://secure.helpscout.net/conversation/{cid}/{number}")
    sys.exit(0)

sys.exit(1)
PY
