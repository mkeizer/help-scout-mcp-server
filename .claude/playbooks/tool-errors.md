# Capturing Tool Errors Verbatim

Load when a triage involves an MCP tool failure or shell command error.

## The rule

When an MCP tool call or shell command fails, **always capture the exact error message and include it in the tech note AND the triage report**.

**Do not summarize** a failure as "denied", "failed", "couldn't", or "not allowed" — those words tell the reviewer nothing about what to fix.

## What to include

1. **Exact returned error** — HTTP status code, Help Scout `logRef`, validation message, Zod error path, `ssh:` error line, stderr output
2. **Which tool/command** produced the error
3. **What you tried to do** — the exact call + args

## Example

### ❌ Wrong
> `createConversation` was denied, please manually create the customer notification.

### ✅ Right
> `createConversation` failed. Called with `mailboxId: 111589, customer: info@example.nl, status: closed, draft: true, subject: ..., text: ...`. API returned HTTP 422 `{"message":"Validation failed","_embedded":{"errors":[{"path":"status","message":"must be one of [active, pending]"}]}}`. A draft on a new conversation with `status: closed` is invisible in the UI — retry with `status: active`.

## Why non-negotiable

A silent "denied" in a tech note is worse than not writing the note at all, because it looks like work was done when the problem is still there. The reviewer cannot act on "denied" — they need the exact error to decide whether to retry, change args, escalate, or escalate further.
