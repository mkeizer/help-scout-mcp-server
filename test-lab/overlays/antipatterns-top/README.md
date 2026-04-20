# Overlay: antipatterns-top

Same content as production `.claude/commands/triage.md` but with a compact
**Step 0** block inserted BEFORE Step 1. That block summarizes the 11
anti-patterns so they land in the model's initial planning context
instead of buried ~500 lines deeper.

Hypothesis: anti-patterns at the top = better upfront planning = fewer
wasted tool calls. Test-lab runs measure whether this is actually true.

The original detailed anti-patterns section is preserved lower in the
document for reference — Step 0 points at it.
