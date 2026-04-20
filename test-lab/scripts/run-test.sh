#!/usr/bin/env bash
# run-test.sh — single test-lab triage run with dry-run hooks + config overlay.
#
# Usage:
#   test-lab/scripts/run-test.sh <config> <ticket-url>
#
# Example:
#   test-lab/scripts/run-test.sh sonnet-baseline https://secure.helpscout.net/conversation/3296563172/1288653
#
# What it does:
#   1. Swaps .claude/settings.json → test-lab/settings.dry-run.json (restored on exit)
#   2. Optionally overlays a different triage.md (restored on exit)
#   3. Exports CLAUDE_MODEL, CLAUDE_APPEND_SYSTEM_PROMPT_FILE, TEST_LAB_INTENDED_LOG
#   4. Invokes the production cron wrapper with the URL override
#   5. Copies the resulting log to test-lab/results/<runid>.log
#
# Safety: the dry-run hook blocks every mutating tool call. Live HS data is
# READ but never WRITTEN. Same for the SSH gateway. Running the same URL 100x
# leaves no side effects.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$LAB_DIR/.." && pwd)"

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <config-name-or-path> <ticket-url>" >&2
  echo "Configs available:" >&2
  ls "$LAB_DIR/configs/" | sed 's/^/  /' >&2
  exit 64
fi

CONFIG_ARG="$1"
URL="$2"

# Resolve config: plain name ('sonnet-baseline') or path.
if [[ -f "$CONFIG_ARG" ]]; then
  CONFIG_FILE="$CONFIG_ARG"
elif [[ -f "$LAB_DIR/configs/${CONFIG_ARG}.env" ]]; then
  CONFIG_FILE="$LAB_DIR/configs/${CONFIG_ARG}.env"
else
  echo "ERROR: config not found: $CONFIG_ARG" >&2
  exit 64
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"
: "${CONFIG_NAME:?CONFIG_NAME must be set in config file}"

TICKET_ID=$(echo "$URL" | awk -F/ '{print $NF}')
TS=$(date +%Y-%m-%dT%H%M%S)
RUNID="${CONFIG_NAME}__${TICKET_ID}__${TS}"

RESULT_LOG="$LAB_DIR/results/${RUNID}.log"
RESULT_INTENDED="$LAB_DIR/results/${RUNID}.intended.jsonl"
RESULT_REPORT="$LAB_DIR/results/${RUNID}.report.json"

echo "=== test-lab run ==="
echo "Config:   $CONFIG_NAME"
echo "Model:    ${CLAUDE_MODEL:-<default>}"
echo "Overlay:  ${TRIAGE_MD_OVERLAY:-<none>}"
echo "Ticket:   $URL"
echo "Runid:    $RUNID"
echo

# --- Swap settings.json -----------------------------------------------------
SETTINGS_SRC="$REPO_ROOT/.claude/settings.json"
SETTINGS_BAK=""
if [[ -f "$SETTINGS_SRC" ]]; then
  SETTINGS_BAK="${SETTINGS_SRC}.bak.$$"
  cp "$SETTINGS_SRC" "$SETTINGS_BAK"
fi
cp "$LAB_DIR/settings.dry-run.json" "$SETTINGS_SRC"

# --- Optionally overlay triage.md ------------------------------------------
TRIAGE_SRC="$REPO_ROOT/.claude/commands/triage.md"
TRIAGE_BAK=""
if [[ -n "${TRIAGE_MD_OVERLAY:-}" ]]; then
  OVERLAY_PATH="$TRIAGE_MD_OVERLAY"
  if [[ ! -f "$OVERLAY_PATH" ]]; then
    OVERLAY_PATH="$REPO_ROOT/$TRIAGE_MD_OVERLAY"
  fi
  if [[ ! -f "$OVERLAY_PATH" ]]; then
    echo "ERROR: overlay not found: $TRIAGE_MD_OVERLAY" >&2
    exit 64
  fi
  TRIAGE_BAK="${TRIAGE_SRC}.bak.$$"
  cp "$TRIAGE_SRC" "$TRIAGE_BAK"
  cp "$OVERLAY_PATH" "$TRIAGE_SRC"
fi

# --- Restore handler --------------------------------------------------------
restore() {
  local rc=$?
  if [[ -n "$SETTINGS_BAK" && -f "$SETTINGS_BAK" ]]; then
    mv "$SETTINGS_BAK" "$SETTINGS_SRC"
  fi
  if [[ -n "$TRIAGE_BAK" && -f "$TRIAGE_BAK" ]]; then
    mv "$TRIAGE_BAK" "$TRIAGE_SRC"
  fi
  echo "=== test-lab restore complete (exit $rc) ==="
  exit $rc
}
trap restore EXIT INT TERM

# --- Export run env --------------------------------------------------------
export CLAUDE_MODEL="${CLAUDE_MODEL:-}"
export CLAUDE_APPEND_SYSTEM_PROMPT_FILE="$LAB_DIR/triage-dry-run-notice.md"
export TEST_LAB_INTENDED_LOG="$RESULT_INTENDED"
: > "$RESULT_INTENDED"   # ensure sidecar exists + empty

# --- Invoke production wrapper ---------------------------------------------
set +e
bash "$REPO_ROOT/scripts/run-triage-cron.sh" "$URL"
WRAPPER_EXIT=$?
set -e

# --- Copy wrapper's log + report into test-lab/results/ --------------------
# Cron wrapper names its log logs/triage/<ts>-ticket-<id>.log with its own ts.
# Since we hold no other lock, the most recently modified file matching our
# ticket id is our run.
LATEST_LOG=$(ls -t "$REPO_ROOT/logs/triage/"*"-ticket-${TICKET_ID}.log" 2>/dev/null | head -1)
if [[ -n "$LATEST_LOG" && -f "$LATEST_LOG" ]]; then
  cp "$LATEST_LOG" "$RESULT_LOG"
  echo "Log copied:      $RESULT_LOG"
  # Matching report sidecar (same base, .report.json)
  REPORT_SRC="${LATEST_LOG%.log}.report.json"
  if [[ -f "$REPORT_SRC" ]]; then
    cp "$REPORT_SRC" "$RESULT_REPORT"
    echo "Report copied:   $RESULT_REPORT"
  fi
else
  echo "WARN: no matching log found under logs/triage/" >&2
fi

echo "Intended.jsonl:  $RESULT_INTENDED  ($(wc -l < "$RESULT_INTENDED") entries)"
echo "Wrapper exit:    $WRAPPER_EXIT"
exit $WRAPPER_EXIT
