# Haiku Subagent Delegation

When a task is routine, pattern-matching, or high-volume parsing, delegate to Haiku 4.5 via the Agent tool with `model="haiku"`. Keeps Opus/Sonnet free for reasoning, saves tokens.

## When Haiku is the right call

### ✅ Good fits
- **Parsing large structured output** — logs, JSON dumps, CSV. You know roughly what's in there, just need extraction.
- **Known-pattern classification** — "does this alert match transient-eligible categories from playbook?"
- **Short replies in well-defined categories** — password reset confirmation, cert renewed, malware removed. No reasoning, just formatting.
- **Bulk text processing** — "summarize these 20 tickets in one sentence each"
- **Lookups against static playbooks** — "find the matching rule for signal X in playbook Y"

### ❌ Don't use Haiku for
- **Novel incident investigation** — needs reasoning across weak signals
- **Customer-facing tone-sensitive replies** — empathy, nuance, judgement calls
- **Architecture/design decisions**
- **Cross-system correlation** — "this Exim fail + that LVE fault + recent upload → what's going on?"
- **Anything where getting it 95% right is worse than not doing it** (security judgements, destructive actions)

## Invocation pattern

```
Agent(
  subagent_type: "general-purpose",
  model: "haiku",
  description: "Parse exim mainlog for top senders",
  prompt: "..."
)
```

## Worked examples

### Example A: log-parse for top senders

```
Agent(
  subagent_type: "general-purpose",
  model: "haiku",
  description: "Extract top senders from exim log",
  prompt: """
  Read /tmp/exim-mainlog-sample.txt (about 10k lines).
  For each line containing '<=', extract the sender email (after 'F=<' and before '>').
  Count occurrences per sender. Return the top 20 as JSON:
  [{"sender": "x@y.nl", "count": 123}, ...]
  No explanation — just the JSON.
  """
)
```

### Example B: playbook pattern matching

```
Agent(
  subagent_type: "general-purpose",
  model: "haiku",
  description: "Check if alert matches transient-eligible pattern",
  prompt: """
  Here is an alert subject + body:
  ---
  Subject: SSL renewal failed for klant.nl
  Body: Let's Encrypt DNS-01 challenge timed out.
  ---

  Here is the transient-eligible list from playbooks/transient-alerts.md:
  - SSL renewal failures
  - Let's Encrypt DNS-01 timeouts
  - DNS propagation errors
  - Backup retry failures
  - Autoreply mail bounces that recover on own

  Does this alert match? Answer JSON: {"match": true|false, "category": "<which one>"}
  """
)
```

### Example C: generate short canned reply

```
Agent(
  subagent_type: "general-purpose",
  model: "haiku",
  description: "Generate cert-renewed reply in Dutch",
  prompt: """
  Write a Dutch customer reply, voltooid verleden tijd, tone friendly.
  Context: SSL certificate for klant.nl was renewed.
  Rules: No em dash, no signature, no 'Mocht je nog vragen' phrase.
  Greeting: Goedemorgen, (voornaam onbekend).
  Closing: Fijne dag!
  Keep it 2-3 sentences max. Output only the reply body text.
  """
)
```

## Cost guidance

Rough per-call estimates (Sonnet 4.6 vs Haiku 4.5 input/output costs):
- Sonnet: $3/$15 per 1M tokens
- Haiku: $0.80/$4 per 1M tokens (roughly 4x cheaper on input, 4x cheaper on output)

For a 50k-token log-parse task that needs to happen 20x/day:
- Sonnet: ~$3/day
- Haiku: ~$0.80/day

Per-signal classification (small prompt + small output, ~2k tokens):
- Sonnet: ~$0.01 per call
- Haiku: ~$0.003 per call

At scale (e.g. 100+ triage-related classifications/day), the savings are meaningful. For one-off complex tasks, Sonnet is fine.

## Orchestration in /triage

Most of `/triage` stays on Sonnet/Opus because each ticket is novel enough. Places where Haiku makes sense **inside** a triage run:

1. **Step 2 classify** — if the 7 categories don't feel obvious, offload the "which category does this match" question to Haiku with the table as context. Save reasoning for the bits that need it.
2. **Step 3 KB search** — Haiku can run the greps and summarize which articles are relevant. Main agent picks from the shortlist.
3. **Tool error parsing** — if the tool output is a 50KB JSON log, Haiku extracts the relevant exception/error and returns a short structured summary.

## Caveats

- **Haiku can miss nuance** — always have Sonnet/Opus verify when the output affects customer-facing communication or destructive actions
- **Output schema discipline** — always specify expected output format (JSON, specific template) to avoid prose-drift
- **Don't stack Haiku calls** — if you need multiple Haiku calls in a chain, the error surface grows. Either batch into one bigger Haiku call or step back to Sonnet.
