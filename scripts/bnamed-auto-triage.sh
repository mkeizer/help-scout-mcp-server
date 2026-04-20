#!/usr/bin/env bash
# bnamed-auto-triage.sh
#
# Auto-handles unassigned bNamed notifications in the KeurigOnline inbox:
#
#   - "[bNamed.net] Extra informatie nodig omtrent <domein>"
#       1e keer voor dit domein binnen WINDOW_DAYS → tag + close
#       (onze Notification-API heeft de klant al gemaild, niks te doen)
#       2e+ keer → tag 'bnamed-needs-escalation' + note met vorige ticket­
#       nummers (klant reageert niet, staff moet bellen / mail-logs checken)
#
#   - "[bNamed.net] Callback niet gelukt"
#       Altijd escaleren: onze Notification-API zelf was niet bereikbaar,
#       dus de klant heeft überhaupt geen mail gehad.
#
# Tickets krijgen geen assignee (blijven in Unassigned view voor de staff
# die escalaties oppakt).
#
# Idempotent: tickets die al gelabeld zijn met 'bnamed-auto-handled',
# 'bnamed-needs-escalation', of 'bnamed-callback-fail' worden overgeslagen.
#
# Usage:
#   scripts/bnamed-auto-triage.sh           # live
#   scripts/bnamed-auto-triage.sh --dry-run # print actions, don't modify
#
# Cron (elke 30 min):
#   */30 * * * * /home/claude/projects/kohelpscout/help-scout-mcp-server/scripts/bnamed-auto-triage.sh >/dev/null 2>&1
#
# Exit codes:
#   0  ran successfully
#   1  lock already held
#   2  auth or API error

set -euo pipefail

# Cron has a minimal PATH; extend it like run-triage-cron.sh does.
export PATH="/home/claude/.local/bin:/home/claude/.nvm/versions/node/v24.14.1/bin:/home/claude/.npm-global/bin:/usr/local/bin:/usr/bin:/bin"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
LOG_DIR="$REPO_ROOT/logs/bnamed-auto-triage"
LOCK_FILE="$REPO_ROOT/.bnamed-auto-triage.lock"

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi
export DRY_RUN

mkdir -p "$LOG_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "another bnamed-auto-triage run is in progress" >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: "${HELPSCOUT_APP_ID:?HELPSCOUT_APP_ID must be set (via .env or environment)}"
: "${HELPSCOUT_APP_SECRET:?HELPSCOUT_APP_SECRET must be set (via .env or environment)}"

MAILBOX_ID="${MAILBOX_ID:-111589}"
WINDOW_DAYS="${BNAMED_WINDOW_DAYS:-60}"

TS=$(date +%Y-%m-%dT%H%M%S)
LOG_FILE="$LOG_DIR/$TS.log"

# --- OAuth2 token ---------------------------------------------------------
TOKEN_RESP=$(curl -sf -X POST https://api.helpscout.net/v2/oauth2/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"client_credentials\",\"client_id\":\"$HELPSCOUT_APP_ID\",\"client_secret\":\"$HELPSCOUT_APP_SECRET\"}") || {
  echo "ERROR: token request failed" >&2
  exit 2
}

TOKEN=$(echo "$TOKEN_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])') || {
  echo "ERROR: could not parse token response" >&2
  exit 2
}

export TOKEN MAILBOX_ID WINDOW_DAYS

# --- Main logic (Python) --------------------------------------------------
{
  echo "=== bnamed-auto-triage ==="
  echo "Started:  $(date -Iseconds)"
  echo "Mailbox:  $MAILBOX_ID"
  echo "Window:   $WINDOW_DAYS days"
  echo "Dry run:  $DRY_RUN"
  echo "=========================="
  echo

  python3 <<'PY'
import json, os, re, sys, urllib.request, urllib.parse, urllib.error
from datetime import datetime, timezone, timedelta

TOKEN       = os.environ["TOKEN"]
MAILBOX_ID  = os.environ["MAILBOX_ID"]
WINDOW_DAYS = int(os.environ["WINDOW_DAYS"])
DRY_RUN     = os.environ.get("DRY_RUN", "0") == "1"

BASE = "https://api.helpscout.net/v2"
HEAD = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type":  "application/json",
}

EXTRA_INFO_RE = re.compile(
    r"\[bNamed\.net\]\s*Extra\s+informatie\s+nodig\s+omtrent\s+(?P<domain>\S+)",
    re.IGNORECASE,
)
CALLBACK_RE = re.compile(
    r"\[bNamed\.net\]\s*Callback\s+niet\s+gelukt",
    re.IGNORECASE,
)

# Skip tickets that already bear any of these markers
ALREADY_HANDLED = {
    "bnamed-auto-handled",
    "bnamed-needs-escalation",
    "bnamed-callback-fail",
}


def _request(method, path, body=None):
    url = f"{BASE}{path}"
    data = None
    if body is not None:
        data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=HEAD, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            if not raw:
                return None, resp.status
            return json.loads(raw), resp.status
    except urllib.error.HTTPError as e:
        msg = e.read()[:400].decode(errors="replace")
        raise RuntimeError(f"{method} {path} -> {e.code}: {msg}") from e


def api_get(path, params=None):
    if params:
        path = f"{path}?{urllib.parse.urlencode(params)}"
    return _request("GET", path)[0]


def api_put(path, body):    return _request("PUT",    path, body)[1]
def api_post(path, body):   return _request("POST",   path, body)[1]
def api_patch(path, body):  return _request("PATCH",  path, body)[1]


def tags_of(ticket):
    """Return list of tag strings from a conversation record."""
    raw = ticket.get("tags") or []
    out = []
    for t in raw:
        if isinstance(t, dict):
            out.append(t.get("tag") or t.get("name") or "")
        elif isinstance(t, str):
            out.append(t)
    return [t for t in out if t]


def is_unassigned(ticket):
    a = ticket.get("assignee")
    if not a:
        return True
    return (a.get("id") or 0) == 0


def fetch_bnamed_candidates():
    """All active tickets in the mailbox whose subject mentions bNamed."""
    out, page = [], 1
    while True:
        data = api_get("/conversations", {
            "mailbox":    MAILBOX_ID,
            "status":     "active",
            "query":      '(subject:"bNamed.net")',
            "sortField":  "createdAt",
            "sortOrder":  "asc",
            "page":       page,
        })
        items = (data or {}).get("_embedded", {}).get("conversations", []) or []
        out.extend(items)
        pg = (data or {}).get("page") or {}
        if page >= (pg.get("totalPages") or 1):
            break
        page += 1
    return out


def count_prior_for_domain(domain, exclude_id, cutoff_iso):
    """Count how many earlier 'Extra informatie nodig' tickets exist for
       this exact domain within the window (any status)."""
    # HS query supports subject substring match. We still confirm the
    # match client-side because the index is noisy.
    quoted = f'(subject:"{domain}")'
    data = api_get("/conversations", {
        "mailbox":   MAILBOX_ID,
        "query":     quoted,
        "sortField": "createdAt",
        "sortOrder": "desc",
    })
    items = (data or {}).get("_embedded", {}).get("conversations", []) or []
    prior = []
    for t in items:
        if t.get("id") == exclude_id:
            continue
        if (t.get("createdAt") or "") < cutoff_iso:
            continue
        subj = t.get("subject") or ""
        m = EXTRA_INFO_RE.search(subj)
        if not m:
            continue
        if m.group("domain").strip().lower() != domain.lower():
            continue
        prior.append(t.get("number"))
    return prior


def apply_tags(cid, tags):
    """Replace tags on a conversation (HS: array of strings)."""
    return api_put(f"/conversations/{cid}/tags", {"tags": tags})


def add_note(cid, html_body):
    return api_post(f"/conversations/{cid}/notes", {"text": html_body})


def close_ticket(cid):
    return api_patch(f"/conversations/{cid}",
                     {"op": "replace", "path": "/status", "value": "closed"})


def handle_callback_fail(t, existing_tags):
    cid, num = t["id"], t["number"]
    new_tags = sorted(set(existing_tags) | {"bnamed", "bnamed-needs-escalation", "bnamed-callback-fail"})
    note = (
        "<p><strong>Auto-escalatie (bNamed Callback niet gelukt)</strong></p>"
        "<p>bNamed rapporteert dat de callback naar onze Notification-API niet geslaagd is. "
        "Dit wijst op een probleem aan onze kant — de klant heeft waarschijnlijk "
        "geen notificatie-mail gehad.</p>"
        "<ul>"
        "<li>Check het domein-notificatie-endpoint op onze API</li>"
        "<li>Check logs rond het tijdstip van deze ticket</li>"
        "<li>Bij herhaling: escaleer naar dev</li>"
        "</ul>"
    )
    print(f"  → ESCALATE (callback-fail) #{num}: tags={new_tags}")
    if not DRY_RUN:
        apply_tags(cid, new_tags)
        add_note(cid, note)


def handle_extra_info(t, existing_tags, domain, cutoff_iso):
    cid, num = t["id"], t["number"]
    prior = count_prior_for_domain(domain, cid, cutoff_iso)
    occurrence = len(prior) + 1
    print(f"  domain={domain!r}  occurrence={occurrence}  priors={prior}")

    if occurrence == 1:
        new_tags = sorted(set(existing_tags) | {"auto-noise", "bnamed", "bnamed-auto-handled"})
        print(f"  → CLOSE #{num}: tags={new_tags}")
        if not DRY_RUN:
            apply_tags(cid, new_tags)
            close_ticket(cid)
    else:
        new_tags = sorted(set(existing_tags) | {"bnamed", "bnamed-needs-escalation"})
        prior_str = ", ".join(f"#{n}" for n in prior) or "—"
        note = (
            f"<p><strong>Auto-escalatie (bNamed)</strong></p>"
            f"<p>Dit is de <strong>{occurrence}e keer</strong> binnen {WINDOW_DAYS} dagen "
            f"dat bNamed om extra info vraagt voor <code>{domain}</code>.<br/>"
            f"Eerdere tickets: {prior_str}</p>"
            f"<p>Klant reageert niet op onze geautomatiseerde mails. Suggestie:</p>"
            f"<ul>"
            f"<li>Check mail-delivery / bounces voor het contact-e-mailadres</li>"
            f"<li>Overweeg telefonisch contact (telefoonnummer via drs.client-search/get)</li>"
            f"<li>Check of aanvraag nog binnen de bNamed-deadline valt</li>"
            f"</ul>"
        )
        print(f"  → ESCALATE #{num}: tags={new_tags}")
        if not DRY_RUN:
            apply_tags(cid, new_tags)
            add_note(cid, note)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
cutoff = (datetime.now(timezone.utc) - timedelta(days=WINDOW_DAYS)).isoformat()

try:
    candidates = fetch_bnamed_candidates()
except RuntimeError as e:
    print(f"ERROR fetching candidates: {e}", file=sys.stderr)
    sys.exit(2)

print(f"Fetched {len(candidates)} bNamed-subject active tickets\n")

processed = skipped_assigned = skipped_handled = skipped_other = 0

for t in candidates:
    num  = t.get("number")
    subj = t.get("subject") or ""
    cid  = t.get("id")
    tags = tags_of(t)

    print(f"--- #{num} ({cid}): {subj}")
    print(f"  tags: {tags}")

    if not is_unassigned(t):
        a = t.get("assignee") or {}
        print(f"  SKIP: assigned to {a.get('first','?')} {a.get('last','?')}")
        skipped_assigned += 1
        continue

    if ALREADY_HANDLED & set(tags):
        print("  SKIP: already handled in a previous run")
        skipped_handled += 1
        continue

    try:
        if CALLBACK_RE.search(subj):
            handle_callback_fail(t, tags)
            processed += 1
            continue

        m = EXTRA_INFO_RE.search(subj)
        if m:
            domain = m.group("domain").strip().rstrip(",.;:)").lower()
            handle_extra_info(t, tags, domain, cutoff)
            processed += 1
            continue

        print("  SKIP: other bNamed subject (vervallen, bevestiging, …)")
        skipped_other += 1
    except RuntimeError as e:
        print(f"  ERROR processing #{num}: {e}", file=sys.stderr)

print(
    f"\nSummary: processed={processed} "
    f"skipped_assigned={skipped_assigned} "
    f"skipped_already_handled={skipped_handled} "
    f"skipped_other={skipped_other}"
)
PY

  echo
  echo "Finished: $(date -Iseconds)"
} | tee "$LOG_FILE"

exit 0
