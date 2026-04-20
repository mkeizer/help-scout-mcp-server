#!/usr/bin/env bash
# triage-status.sh — quick health check of the triage cron
#
# Shows: crontab entry, current lock state, last 5 runs, and the
# tail of the most recent log.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$REPO_ROOT/logs/triage"
LOCK_FILE="$REPO_ROOT/.triage-cron.lock"

echo "=== crontab entry ==="
crontab -l 2>/dev/null | grep -F run-triage-cron.sh || echo "(no crontab entry found)"
echo

echo "=== current run ==="
if [[ -e "$LOCK_FILE" ]] && fuser "$LOCK_FILE" >/dev/null 2>&1; then
  echo "RUNNING — lock held by:"
  fuser -v "$LOCK_FILE" 2>&1 | tail -n +2
  echo
  pgrep -af "claude -p /triage" || true
else
  echo "idle (lock not held)"
fi
echo

echo "=== last 5 runs ==="
if [[ -d "$LOG_DIR" ]]; then
  ls -lt "$LOG_DIR"/*.log 2>/dev/null | head -5 | awk '{printf "%s %s %6s  %s\n", $6, $7, $5, $NF}'
else
  echo "(no logs yet)"
fi
echo

echo "=== runs today ==="
TODAY=$(date +%Y-%m-%d)
COUNT=$(ls "$LOG_DIR/${TODAY}"*.log 2>/dev/null | wc -l)
echo "$COUNT log(s) for $TODAY"
echo

LATEST=$(ls -t "$LOG_DIR"/*.log 2>/dev/null | head -1 || true)
if [[ -n "$LATEST" ]]; then
  echo "=== tail: $(basename "$LATEST") ==="
  tail -20 "$LATEST"
fi
