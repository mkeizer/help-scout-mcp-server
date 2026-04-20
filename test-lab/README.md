# Test-lab

Dry-run triage harness. Lets us iterate on model choice, hook config, and
triage.md variants against live Help Scout tickets WITHOUT writing
anything back to HS or the SSH gateway.

## Safety guarantee

A PreToolUse hook (`settings.dry-run.json`) intercepts every mutating
tool before it reaches the network:

| Tool | What it would do | Test-lab behaviour |
|---|---|---|
| `mcp__helpscout__createConversation/Reply/Note/updateConversationStatus/updateConversationTags/createDocsArticle/updateDocsArticle/deleteDocsArticle` | Write to HS | Blocked; full args appended to `results/<runid>.intended.jsonl` |
| `mcp__ssh-gateway__cmd_mutate/da_mutate` | Change server state | Blocked; same sidecar log |
| Bash matching `unassign-conversation.sh` / HS `PATCH` | Unassign ticket | Blocked; same sidecar log |

Read-only tools (`getConversationSummary`, `getThreads`, `drs.*`, `fs_read`,
`cmd_run` read templates, `dns_scan`, etc.) pass through untouched, so the
triage gets real live data to reason about. Running the same URL 100
times produces no HS side effects.

## Usage

```bash
# Single run
test-lab/scripts/run-test.sh sonnet-baseline \
  https://secure.helpscout.net/conversation/3296563172/1288653

# Matrix (configs × tickets)
echo sonnet-baseline > /tmp/configs.txt
echo opus-baseline   >> /tmp/configs.txt
echo haiku-solo      >> /tmp/configs.txt
echo 'https://secure.helpscout.net/conversation/3296563172/1288653' > /tmp/tickets.txt
test-lab/scripts/run-matrix.sh /tmp/configs.txt /tmp/tickets.txt

# Aggregate comparison
python3 test-lab/scripts/compare.py         # → results/compare.md
python3 test-lab/scripts/compare.py --filter sonnet
```

## Directory layout

```
test-lab/
├── settings.dry-run.json       # Hook config that blocks all mutators
├── triage-dry-run-notice.md    # Appended to system prompt so the model
│                               # knows DRY-RUN: errors = "treat as success"
├── configs/*.env               # Per-variant settings (model, overlays)
├── overlays/<name>/triage.md   # Optional triage.md variants per config
├── scripts/
│   ├── run-test.sh             # One config × one ticket → one run
│   ├── run-matrix.sh           # Loop configs × tickets
│   └── compare.py              # Aggregate results → markdown table
└── results/                    # Per-run artefacts (gitignored content)
    ├── <config>__<ticket>__<ts>.log           # streamed Claude output
    ├── <config>__<ticket>__<ts>.intended.jsonl # blocked mutations
    └── <config>__<ticket>__<ts>.report.json   # Step 10 structured report
```

## Adding a new config

```bash
cat > test-lab/configs/my-experiment.env <<'EOF'
CONFIG_NAME=my-experiment
CLAUDE_MODEL=sonnet
TRIAGE_MD_OVERLAY=test-lab/overlays/my-variant/triage.md
EOF
```

If the overlay is not set, the production `.claude/commands/triage.md`
is used unchanged.

## What `run-test.sh` does under the hood

1. Backs up `.claude/settings.json` and swaps in `settings.dry-run.json`.
2. Optionally backs up `.claude/commands/triage.md` and swaps in overlay.
3. Exports `CLAUDE_MODEL`, `CLAUDE_APPEND_SYSTEM_PROMPT_FILE`, and
   `TEST_LAB_INTENDED_LOG` (absolute path under `results/`).
4. Invokes `scripts/run-triage-cron.sh <url>` — the production wrapper.
   Gateway-health pre-flight, HS metadata capture, streaming formatter,
   and Usage/Model footer all come along for free.
5. Copies the wrapper's log + report.json from `logs/triage/` into
   `test-lab/results/` under the runid name.
6. Restores settings.json and triage.md on exit (EXIT/INT/TERM trap).

## Limits

- **Hook-blocked mutations may confuse older model runs.** The system-prompt
  addition explicitly tells the model to treat DRY-RUN: as success. If the
  model retries or gives up, that's a calibration issue to flag in
  `runRetrospective`.
- **No parallel matrix runs** — the production flock is still honored.
  A 4×2 matrix is ~40 min serial.
- **Production Koos-cron still runs** independently. If it fires during a
  test-lab run, the lock blocks it silently (no-op). No pollution.
- **Read-only calls to DRS/gateway/HS still cost real API requests.** Rate
  limits apply. Don't matrix-blast 100 tickets at once.
