---
name: triage-next
description: Pick up the next Koos-assigned active ticket and triage it.
---

# /triage next

Automatically pick the next ticket to triage and run `/triage` on it.

## Steps

### 1. Find the next ticket

Use `structuredConversationFilter` with these parameters:
- `assignedTo: 903748` (Koos bot user ID)
- `status: "active"`
- `inboxId: "111589"` (KeurigOnline)
- `sortBy: "createdAt"`
- `sortOrder: "asc"` (oldest first)
- `limit: 25`

Parse the results to find the first ticket with `tags: []` (no tags = not yet triaged).

Tickets worden via Help Scout workflows op Koos gezet. **Let op:** `searchConversations` ondersteunt geen assignee filter, gebruik altijd `structuredConversationFilter` hiervoor.

### 2. Filter: first ticket without tags

The result set may contain tickets already triaged in a previous session. Pick the **first ticket with an empty tags array** (`tags: []`). Tickets that have been triaged already have tags like `security`, `imunify-alert`, etc.

Additionally skip if:
- **MIGRATIE VEREIST** in subject (snoozed internal jobs, leave active)
- **Autoreply:** or **Auto Reply:** in subject
- Subject is **"Cron "** (cron daemon output, can be closed directly)

### 3. Present the pick

Show the user which ticket was selected:
```
Volgende ticket: #[number] — [subject]
Van: [customer name] ([email])
Aangemaakt: [timestamp]
```

### 4. Run triage

Execute the full `/triage` workflow on the selected ticket (invoke the triage skill with the conversation ID).

If no qualifying tickets are found, report: "Geen onbehandelde tickets gevonden."
