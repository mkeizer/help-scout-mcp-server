#!/usr/bin/env python3
"""
compare.py — aggregate test-lab results into a markdown comparison table.

Reads test-lab/results/*.{log, intended.jsonl, report.json} and emits
test-lab/results/compare.md with:

  - one row per run (config, model, cost, turns, calls, errors, mutations,
    draft-reply char count)
  - per-config aggregate (avg cost per ticket)
  - draft-reply previews side-by-side for eyeball quality check

Usage:
  test-lab/scripts/compare.py                  # scan results/ dir
  test-lab/scripts/compare.py --filter sonnet  # only run_ids containing 'sonnet'
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

LAB_DIR = Path(__file__).resolve().parent.parent
RESULTS_DIR = LAB_DIR / "results"


USAGE_RE = re.compile(
    r"^Usage:\s*"
    r"input=(?P<input>\d+)\s+"
    r"output=(?P<output>\d+)\s+"
    r"cache_creation=(?P<cache_creation>\d+)\s+"
    r"cache_read=(?P<cache_read>\d+)\s+"
    r"cost_usd=(?P<cost_usd>[\d.]+)\s+"
    r"duration_ms=(?P<duration_ms>\d+)\s+"
    r"turns=(?P<turns>\d+)",
    re.MULTILINE,
)
MODEL_RE = re.compile(r"^Model:\s*(.+?)$", re.MULTILINE)
TOOL_CALL_RE = re.compile(r"^\[[\d:]+\]\s+\[tool\]\s+(\S+)", re.MULTILINE)
TOOL_ERROR_RE = re.compile(r"^\[[\d:]+\]\s+\[tool-error\]", re.MULTILINE)
RUN_NAME_RE = re.compile(r"^(?P<config>[^_]+(?:-[^_]+)*)__(?P<ticket>\d+)__(?P<ts>[\dT-]+)\.log$")


def parse_log(log_path: Path) -> dict:
    content = log_path.read_text(errors="replace")
    out = {"path": str(log_path)}
    m = USAGE_RE.search(content)
    if m:
        out.update({k: int(v) if k != "cost_usd" else float(v) for k, v in m.groupdict().items()})
    m = MODEL_RE.search(content)
    if m:
        out["model"] = m.group(1).strip()
    out["tool_calls"] = len(TOOL_CALL_RE.findall(content))
    out["tool_errors"] = len(TOOL_ERROR_RE.findall(content))
    return out


def parse_intended(path: Path) -> list[dict]:
    if not path.exists():
        return []
    events = []
    for line in path.read_text(errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return events


def parse_report(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def short_model(m: str | None) -> str:
    if not m:
        return "?"
    return re.sub(r"^claude-|\[[^\]]*\]|-\d{8}$", "", m).strip()


def fmt_tokens(n: int) -> str:
    if n >= 1_000_000:
        return f"{n/1_000_000:.2f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}k"
    return str(n)


def draft_chars(intended: list[dict]) -> int:
    total = 0
    for e in intended:
        tool = e.get("tool", "")
        if tool.endswith("createReply") or tool.endswith("createNote"):
            args = e.get("args", {})
            text = args.get("text") or ""
            total += len(text)
    return total


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--filter", help="substring match on run-id")
    ap.add_argument("--output", default=str(RESULTS_DIR / "compare.md"))
    args = ap.parse_args()

    if not RESULTS_DIR.exists():
        print(f"no results dir: {RESULTS_DIR}", file=sys.stderr)
        return 1

    rows = []
    for log in sorted(RESULTS_DIR.glob("*.log")):
        run_name = log.stem
        if args.filter and args.filter not in run_name:
            continue
        m = RUN_NAME_RE.match(log.name)
        if not m:
            continue
        base = log.with_suffix("")
        intended = parse_intended(base.with_suffix(".intended.jsonl"))
        report = parse_report(base.with_suffix(".report.json"))
        stats = parse_log(log)
        rows.append(
            {
                "runid": run_name,
                "config": m.group("config"),
                "ticket": m.group("ticket"),
                "ts": m.group("ts"),
                "model": short_model(stats.get("model")),
                "cost_usd": stats.get("cost_usd", 0.0),
                "duration_ms": stats.get("duration_ms", 0),
                "turns": stats.get("turns", 0),
                "tool_calls": stats.get("tool_calls", 0),
                "tool_errors": stats.get("tool_errors", 0),
                "output_tokens": stats.get("output", 0),
                "cache_read": stats.get("cache_read", 0),
                "mutations_intended": len(intended),
                "mutation_tools": sorted({e.get("tool", "") for e in intended}),
                "draft_chars": draft_chars(intended),
                "resolution": (report or {}).get("resolution", "?"),
            }
        )

    if not rows:
        print("no runs matched", file=sys.stderr)
        return 1

    out_lines = []
    out_lines.append("# Test-lab comparison\n")
    out_lines.append(f"Scanned {RESULTS_DIR} — {len(rows)} runs.\n")
    out_lines.append(
        "| Config | Ticket | Model | Cost | Turns | Calls | Err | Out tok | Mut |"
        " Draft chars | Resolution |"
    )
    out_lines.append(
        "|---|---|---|---|---|---|---|---|---|---|---|"
    )
    for r in sorted(rows, key=lambda x: (x["config"], x["ticket"], x["ts"])):
        out_lines.append(
            f"| {r['config']} | {r['ticket']} | {r['model']} | ${r['cost_usd']:.3f} |"
            f" {r['turns']} | {r['tool_calls']} | {r['tool_errors']} |"
            f" {fmt_tokens(r['output_tokens'])} | {r['mutations_intended']} |"
            f" {r['draft_chars']} | {r['resolution']} |"
        )

    # Aggregate per-config averages
    by_config: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_config[r["config"]].append(r)
    if len(by_config) > 1:
        out_lines.append("\n## Per-config averages\n")
        out_lines.append("| Config | Runs | Avg cost | Avg turns | Avg calls | Avg out tok |")
        out_lines.append("|---|---|---|---|---|---|")
        for config, items in sorted(by_config.items()):
            n = len(items)
            avg_cost = sum(i["cost_usd"] for i in items) / n
            avg_turns = sum(i["turns"] for i in items) / n
            avg_calls = sum(i["tool_calls"] for i in items) / n
            avg_out = sum(i["output_tokens"] for i in items) / n
            out_lines.append(
                f"| {config} | {n} | ${avg_cost:.3f} | {avg_turns:.1f} |"
                f" {avg_calls:.1f} | {fmt_tokens(int(avg_out))} |"
            )

    # Per-run mutation breakdown
    out_lines.append("\n## Intended mutations per run\n")
    for r in sorted(rows, key=lambda x: (x["config"], x["ticket"])):
        if not r["mutation_tools"]:
            continue
        out_lines.append(f"- **{r['runid']}** — {r['mutations_intended']} calls: " +
                         ", ".join(f"`{t.split('__')[-1]}`" for t in r["mutation_tools"]))

    out_path = Path(args.output)
    out_path.write_text("\n".join(out_lines) + "\n")
    print(f"wrote {out_path} ({len(rows)} rows)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
