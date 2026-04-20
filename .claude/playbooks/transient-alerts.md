# Transient Infra-Alerts Playbook

Load when a DA/infra alert describes a problem that usually self-heals. Close-first, escalate-on-repeat.

## Why this rule exists

Some alerts describe problems that usually self-heal before anyone can act (DNS propagation races, Let's Encrypt retries, temporary backup failures, brief rate limits). Escalating every one = queue fills with noise. Silently closing every one = genuinely broken system hides forever.

## Step 1 — Is this transient-eligible?

### Transient-eligible categories (only these qualify)
- DirectAdmin / webbserver.nl alerts about:
  - SSL renewal failures
  - Let's Encrypt DNS-01 timeouts
  - DNS propagation errors
  - Backup retry failures
- Autoreply bounces from mail infrastructure that normally recovers on its own

### NEVER transient (always full triage + escalate)
- **Imunify malware detections** — always investigate, even duplicates (see `imunify-triage.md`)
- **Disk quota / LVE limit alerts** — active resource issue, needs human action
- **Any conversation with a customer sender** — not `da@`, not `support@webbsite.nl`, not system senders
- **Evidence of ongoing damage** — backdoor accounts, modified files, etc.

## Step 2 — Look for prior occurrences

Use `comprehensiveConversationSearch` scoped to `status: closed`:
- Same subject pattern
- Same affected domain/server
- Created within the last **24 hours**

**Quote the exact search query in the tech note.**

## Step 3 — Decide based on hit count

### 0 hits = first occurrence
- Write tech note explaining *why* it's likely transient + what would escalate it
- Apply tags including `transient-closed`
- `updateConversationStatus(closed)`
- **Skip Step 8** (unassign on closed re-opens)
- If it recurs tomorrow, next triage will see this closed ticket and escalate

### 1+ hits = recurrence
- Tech note titled **"Recurrence — escalation needed"** linking to prior ticket(s)
- Apply tags including `recurrence-escalated`
- Run Step 8 unassign (human picks up)
- **Do NOT close.** Keep the chain visible.

## Step 4 — Triage report

Always state which branch:
- "First occurrence, closed"
- "Nth occurrence (prior: #xxxxx), escalated to Anyone"
