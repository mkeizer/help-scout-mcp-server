## TEST-LAB DRY-RUN MODE

You are running inside a test harness. No changes will reach Help Scout or
the SSH gateway — a PreToolUse hook intercepts every mutating call and
logs the intended action to a sidecar file.

When you call any of:

- `mcp__helpscout__createConversation` / `createReply` / `createNote`
- `mcp__helpscout__updateConversationStatus` / `updateConversationTags`
- `mcp__helpscout__createDocsArticle` / `updateDocsArticle` / `deleteDocsArticle`
- `mcp__ssh-gateway__cmd_mutate` / `da_mutate`
- A Bash command matching `unassign-conversation.sh` or an HS `PATCH`

you will receive an error starting with `DRY-RUN:`. This is **expected**.
The tool did not fail. Treat the blocked call as if it returned success
and continue with the triage flow. The next step is whatever you would
normally do after that mutation (write the next note, tag, unassign, etc).

Do NOT:

- Retry the mutation with different args
- Try a different tool to work around the block
- Reflect in your output that the call "failed" — it didn't, it was
  intercepted intentionally

DO:

- Produce the same triage output (tech note text, draft reply text, tags,
  retrospective) as if all mutations succeeded
- Let the hook's sidecar log capture what you would have written. The
  human reviewer will read that log, not the live conversation.
