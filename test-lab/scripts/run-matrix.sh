#!/usr/bin/env bash
# run-matrix.sh — run a (configs × tickets) permutation, serially.
#
# Usage:
#   test-lab/scripts/run-matrix.sh <configs-file> <tickets-file>
#
# configs-file: one config name per line (each must exist in configs/)
# tickets-file: one HS conversation URL per line
#
# Example:
#   test-lab/scripts/run-matrix.sh \
#     test-lab/configs/_all.txt \
#     test-lab/tickets/smoke.txt
#
# Serial execution honors the cron wrapper's flock. A 4-configs × 2-tickets
# matrix takes ~40 min.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <configs-file> <tickets-file>" >&2
  exit 64
fi

CONFIGS_FILE="$1"
TICKETS_FILE="$2"
[[ -f "$CONFIGS_FILE" ]] || { echo "configs file not found: $CONFIGS_FILE" >&2; exit 64; }
[[ -f "$TICKETS_FILE" ]] || { echo "tickets file not found: $TICKETS_FILE" >&2; exit 64; }

total=0
failed=0
while IFS= read -r config; do
  [[ -z "$config" || "$config" =~ ^# ]] && continue
  while IFS= read -r url; do
    [[ -z "$url" || "$url" =~ ^# ]] && continue
    total=$((total + 1))
    echo
    echo "########################################"
    echo "# MATRIX RUN $total: $config × $url"
    echo "########################################"
    if ! bash "$LAB_DIR/scripts/run-test.sh" "$config" "$url"; then
      failed=$((failed + 1))
      echo "FAILED: $config × $url" >&2
    fi
  done < "$TICKETS_FILE"
done < "$CONFIGS_FILE"

echo
echo "=== matrix complete: $total runs, $failed failed ==="
