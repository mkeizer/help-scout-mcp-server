#!/usr/bin/env python3
"""
Backfill .report.json files from existing triage logs.

Scans logs/triage/*.log, extracts what's visible (classification, priority,
resolution, tags, friction signals), writes a skeleton .report.json next to
each log. Does NOT fabricate missingTools / missingDocs — those stay empty
until live triages emit them via Step 10.

Idempotent: overwrites existing .report.json files. For a unique ticket with
multiple logs, only the most recent log produces a report.

Usage:
    python3 scripts/backfill-reports.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

LOGS_DIR = Path("/home/claude/projects/kohelpscout/help-scout-mcp-server/logs/triage")
FILENAME_RE = re.compile(r"^(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})-ticket-(\d+)\.log$")


def parse_filename(name: str):
    m = FILENAME_RE.match(name)
    if not m:
        return None
    y, mo, d, h, mi, s, ticket = m.groups()
    ts = datetime.fromisoformat(f"{y}-{mo}-{d}T{h}:{mi}:{s}")
    return {"ticket": ticket, "timestamp": ts, "ts_iso": f"{y}-{mo}-{d}T{h}:{mi}:{s}"}


def extract(text: str) -> dict:
    """Pull fields we can recognise from the log body."""
    # Ticket URL
    ticket_url_m = re.search(r"^Ticket:\s*(https?://\S+)", text, re.M)
    ticket_url = ticket_url_m.group(1).strip() if ticket_url_m else None

    started_m = re.search(r"^Started:\s*(.+)$", text, re.M)
    finished_m = re.search(r"^Finished:\s*(.+)$", text, re.M)
    exit_m = re.search(r"^Claude exit:\s*(-?\d+)", text, re.M)

    # Classification / priority — various formats the logs use
    type_m = re.search(r"(?:\*\*)?Classification(?:\*\*)?\s*[:\-]\s*(.+?)(?:\n|$)", text)
    prio_m = re.search(r"(?:\*\*)?Priority(?:\*\*)?\s*[:\-]\s*(.+?)(?:\n|$)", text)
    if not type_m:
        type_m = re.search(r"\*\*Type:\*\*\s*(.+?)(?:\n|$)", text)
    if not prio_m:
        prio_m = re.search(r"\*\*Prioriteit:\*\*\s*(.+?)(?:\n|$)", text)

    def clean_md(s: str | None) -> str | None:
        if s is None:
            return None
        # Strip leading/trailing **, __, : and whitespace that survives the capture
        return re.sub(r"^[\*_:\s]+|[\*_\s]+$", "", s).strip()

    classification_type = clean_md(type_m.group(1) if type_m else None)
    priority = clean_md(prio_m.group(1) if prio_m else None)

    # Summary
    summ_m = re.search(
        r"###?\s*Samenvatting\s*\n+([\s\S]*?)(?=\n#{2,3}\s|\n={5,}|\Z)", text
    )
    if not summ_m:
        summ_m = re.search(r"\*\*Summary:\*\*\s*(.+?)(?:\n\n|\Z)", text)
    summary = summ_m.group(1).strip() if summ_m else None
    if summary:
        summary = " ".join(summary.split())[:500]

    # Actions section (for tags + resolution inference) — supports multiple heading styles
    actions_m = re.search(
        r"(?:###?\s*(?:Acties uitgevoerd|Acties|Actions taken|Actions)|(?:\*\*)?(?:Acties uitgevoerd|Acties|Actions taken|Actions)(?:\*\*)?\s*:?)\s*\n+([\s\S]*?)(?=\n#{2,3}\s|\n={5,}|\n\*\*(?:Open|TL;DR|Link)|\n\[|\Z)",
        text,
    )
    actions = actions_m.group(1) if actions_m else ""

    # Tags
    tag_line_m = re.search(r"Tags?:\s*(.+)", actions) if actions else None
    tags = []
    if tag_line_m:
        # backtick-delimited first, comma-separated fallback
        bt = re.findall(r"`([^`]+)`", tag_line_m.group(1))
        if bt:
            tags = [t.strip() for t in bt if t.strip()]
        else:
            tags = [t.strip() for t in re.split(r"[,]", tag_line_m.group(1)) if t.strip()]

    # Resolution heuristics — order matters. Fall back to full body if actions
    # section wasn't matched (many logs use unconventional markdown).
    body_lower = text.lower()
    actions_lower = actions.lower() if actions else body_lower
    search_text = actions_lower if actions else body_lower

    resolution = None
    if re.search(r"gesloten als duplicate|gesloten\s+\(.*duplicate", search_text):
        resolution = "closed-no-reply"
    elif re.search(r"\bclosed-no-reply\b", body_lower) or re.search(
        r"gesloten zonder reply", search_text
    ):
        resolution = "closed-no-reply"
    elif re.search(r"transient-closed", body_lower):
        resolution = "closed-transient"
    elif re.search(r"recurrence-escalated|@anyone", body_lower):
        resolution = "escalated-to-anyone"
    elif re.search(r"unassign(ed)?|ticket unassigned", search_text):
        resolution = "resolved"
    elif re.search(r"gesloten|ticket (?:is\s+)?closed|\bclosed\b", search_text) and "unassign" not in search_text:
        resolution = "closed-no-reply"
    elif exit_m and exit_m.group(1) != "0":
        resolution = "failed"
    else:
        resolution = "no-action"

    # Friction signals from body text
    friction: list[dict] = []

    if re.search(r"SSH\s+naar\s+\S+\s+faalde|Permission denied|ssh[:\s].*(?:refused|denied)", text, re.I):
        friction.append(
            {
                "step": "ssh-gateway",
                "issue": "SSH-verbinding faalde (Permission denied / Connection refused).",
            }
        )
    if re.search(r"(?:client.?lookup|drs\.client-(?:search|get)).*(?:geen resultaat|faalde|no result|niet gevonden)", text, re.I):
        friction.append(
            {
                "step": "drs-lookup",
                "issue": "Klant kon niet gevonden worden via drs.client-search.",
            }
        )
    if re.search(r"handmatig", body_lower):
        friction.append(
            {
                "step": "manual-action",
                "issue": "Handmatige actie vereist — collega moet iets via DA-panel of UI doen.",
            }
        )
    if re.search(r"@anyone", body_lower):
        # Only add if we didn't already flag manual
        if not any(f["step"] == "anyone-escalation" for f in friction):
            friction.append(
                {
                    "step": "anyone-escalation",
                    "issue": "Triage moest escaleren via @Anyone note (kon niet zelf oplossen).",
                }
            )

    # Recurrence pattern
    recurring = None
    rec_m = re.search(r"(?:Prior|Eerdere tickets?)\s*:?\s*((?:#\d+[\s,]*)+)", text)
    if rec_m:
        prior_tickets = re.findall(r"#(\d+)", rec_m.group(1))
        sig_source = classification_type or "recurrence"
        recurring = {
            "signature": re.sub(r"\W+", "-", sig_source.lower()).strip("-") + "-recurrence",
            "note": "Eerdere tickets genoemd in log.",
            "priorTickets": prior_tickets,
        }
    elif re.search(r"\bduplicate\b|\brecurrence\b|\b(?:\d+e)\s+keer\b|derde|vierde|vijfde", text, re.I):
        # Mentioned recurrence but no explicit prior ticket IDs
        recurring = {
            "signature": "recurrence-without-prior-ids",
            "note": "Log vermeldt herhaling maar geen specifieke eerdere ticket-IDs extraheerbaar.",
        }

    return {
        "ticket_url": ticket_url,
        "started": started_m.group(1).strip() if started_m else None,
        "finished": finished_m.group(1).strip() if finished_m else None,
        "exit_code": int(exit_m.group(1)) if exit_m else None,
        "classification_type": classification_type,
        "priority": priority,
        "summary": summary,
        "tags": tags,
        "resolution": resolution,
        "friction": friction,
        "recurring": recurring,
    }


def build_report(log_path: Path, parsed_fn: dict, extracted: dict) -> dict:
    classification: dict = {}
    if extracted["classification_type"]:
        classification["type"] = extracted["classification_type"]
    if extracted["priority"]:
        classification["priority"] = extracted["priority"]

    report = {
        "ticket": parsed_fn["ticket"],
        "ticketUrl": extracted["ticket_url"],
        "triagedAt": extracted["started"] or extracted["finished"] or parsed_fn["ts_iso"],
        "classification": classification or None,
        "resolution": extracted["resolution"],
        "confidence": "medium",  # backfill confidence — log-derived, not live
        "missingTools": [],  # retros don't fabricate these
        "missingDocs": [],
        "frictionPoints": extracted["friction"],
        "recurringPattern": extracted["recurring"],
        "_source": "backfill",  # marker so viewer can distinguish retros from live reports
    }
    # Keep tags in the report? Not in schema — but useful. Stash under _tags.
    if extracted["tags"]:
        report["_tags"] = extracted["tags"]
    # Drop null classification key if empty
    if not classification:
        report["classification"] = None
    return report


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not LOGS_DIR.exists():
        print(f"logs dir not found: {LOGS_DIR}", file=sys.stderr)
        return 1

    logs = sorted(LOGS_DIR.glob("*.log"))
    by_ticket: dict[str, tuple[datetime, Path]] = {}
    for log in logs:
        pf = parse_filename(log.name)
        if not pf:
            continue
        cur = by_ticket.get(pf["ticket"])
        if cur is None or pf["timestamp"] > cur[0]:
            by_ticket[pf["ticket"]] = (pf["timestamp"], log)

    written = 0
    skipped_live = 0
    for ticket, (_ts, log_path) in sorted(by_ticket.items()):
        report_path = log_path.with_name(log_path.stem + ".report.json")

        # Preserve any live report (non-backfill) that might already exist
        if report_path.exists():
            try:
                existing = json.loads(report_path.read_text())
                if existing.get("_source") != "backfill":
                    skipped_live += 1
                    continue
            except json.JSONDecodeError:
                pass  # corrupt — overwrite

        text = log_path.read_text(errors="replace")
        pf = parse_filename(log_path.name)
        extracted = extract(text)
        report = build_report(log_path, pf, extracted)

        if args.dry_run:
            print(f"[dry-run] {report_path.name}: resolution={report['resolution']}, friction={len(report['frictionPoints'])}")
        else:
            report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
            written += 1

    print(
        f"\nBackfill done. {written} reports written, {skipped_live} live reports preserved. "
        f"Unique tickets: {len(by_ticket)}."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
