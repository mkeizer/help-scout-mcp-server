#!/usr/bin/env bash
# unassign-conversation.sh <conversation_id>
#
# Removes the assignee from a Help Scout conversation (assigns to "Anyone").
# Intended to be called as the final step of a triage so the ticket drops
# out of Koos's todo list once the draft/note/tags are in place.
#
# Exit codes:
#   0  unassigned successfully
#   1  usage error
#   2  auth or API error

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <conversation_id>" >&2
  exit 1
fi

CID="$1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${HELPSCOUT_APP_ID:?HELPSCOUT_APP_ID must be set (via .env or environment)}"
: "${HELPSCOUT_APP_SECRET:?HELPSCOUT_APP_SECRET must be set (via .env or environment)}"

TOKEN=$(curl -sf -X POST https://api.helpscout.net/v2/oauth2/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$HELPSCOUT_APP_ID\",\"client_secret\":\"$HELPSCOUT_APP_SECRET\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])') || {
  echo "ERROR: token request failed" >&2
  exit 2
}

HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  "https://api.helpscout.net/v2/conversations/$CID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"op":"replace","path":"/assignTo","value":null}')

if [[ "$HTTP" == "204" ]]; then
  echo "unassigned: $CID"
  exit 0
fi

echo "ERROR: unassign failed with HTTP $HTTP" >&2
exit 2
