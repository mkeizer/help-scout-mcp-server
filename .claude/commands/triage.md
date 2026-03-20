---
name: triage
description: Triage a Help Scout ticket end-to-end. Reads the ticket, searches the knowledge base, runs live diagnostics, writes a tech note, drafts a reply, and applies tags.
---

# /triage Command

Triage a Help Scout support ticket from start to finish.

## Usage

```
/triage <ticket URL or conversation ID>
```

## Input

The user provides either:
- A Help Scout URL: `https://secure.helpscout.net/conversation/3250296223/...`
- A conversation ID: `3250296223`

Extract the conversation ID from the URL if needed (the first number after `/conversation/`).

## Workflow

Execute the following steps in order. Each step builds on the previous one.

---

### Step 1: Read the Ticket

Use `getConversationSummary` and `getThreads` (in parallel) to get:
- Subject, status, assignee, tags
- Full conversation history
- Customer name, email, company

**Key info to extract:**
- What is the customer asking/reporting?
- What has already been done (previous replies)?
- What is the latest unanswered message?
- Is there a specific domain, server, email address, or service mentioned?

**Dutch language nuances:**
- Customers often write questions as statements (missing `?`) — read for intent, not punctuation
- "Dus nu is mijn account stopgezet.." = "Is my account now stopped?" — they want confirmation
- When a customer "confirms" something right after a staff action, they're usually asking, not stating

#### Step 1b: Check for Linked/Previous Tickets

Customers often reply to old closed tickets, creating a new conversation that is a follow-up. The `getConversationSummary` tool returns a `linkedConversationIds` array when the API provides linked conversation references (e.g., forwarded conversations). It also returns `lineItems` showing state changes that may reference other tickets.

**When to look for linked tickets:**
1. **`linkedConversationIds` is present** — directly fetch those conversations with `getThreads`
2. **Subject starts with "Re:"** — indicates a reply to a previous conversation
3. **Customer references previous interaction** — phrases like "zie hieronder", "n.a.v. ons gesprek", "zoals besproken", "eerder contact gehad"
4. **Customer addresses a specific staff member** — e.g., "Hoi Maarten," when the ticket is unassigned
5. **Only 1 thread** in a conversation with a "Re:" subject — the earlier context is in the old ticket

**How to find the linked ticket (when not in `linkedConversationIds`):**
Search by customer and subject keywords:

```
comprehensiveConversationSearch(
  searchTerms: ["<key subject words>", "<customer domain>"],
  statuses: ["closed"],
  timeframeDays: 365
)
```

Look for closed conversations with the same subject and customer. Read the linked ticket's threads to understand the full history before drafting a reply.

**Important:** Include context from the linked ticket in your tech note (reference the old ticket ID) and factor the previous conversation into your reply. The customer expects continuity.

---

### Step 2: Classify the Problem

Determine the category based on the content:

| Category | Signals |
|----------|---------|
| DNS / Nameservers | domeinnaam, DNS, nameserver, A-record, AAAA, MX, CNAME, glue, DNSSEC |
| E-mail | mailbox, IMAP, POP, SMTP, spam, bouncing, doorsturen, wachtwoord mail |
| Hosting / Website | website down, error 500, wit scherm, PHP, WordPress, trage site, SSL |
| DirectAdmin | inloggen DA, PHP-versie, FTP, cronjob, database, backup |
| Domeinregistratie | bestellen, verhuizen, opzeggen, verlengen, quarantaine |
| Administratief | factuur, betaling, incasso, gegevens wijzigen, upgraden, opzeggen |
| Security | gehackt, malware, brute force, 2FA |

---

### Step 3: Search the Knowledge Base

Search the local knowledge base in `knowledge/` for relevant articles:

```
# Use Grep to search by keywords from the ticket
Grep pattern="<relevant keywords>" path="knowledge/" -i=true
```

**Search strategy:**
1. Search for specific technical terms (e.g., "glue record", "PHP versie", "IMAP instellen")
2. Search for the product/service mentioned (e.g., "SSL", "WordPress", "DNS")
3. Check `knowledge/prijzen/` if the question involves pricing or packages
4. Check `knowledge/begrippenlijst.md` for technical term definitions

Read the most relevant articles to inform your reply.

---

### Step 4: Run Live Diagnostics (if applicable)

Only run diagnostics relevant to the problem. Skip this step for administrative/billing questions.

#### 4a: DNS & Domain Diagnostics (preferred: MCP tools)

Use the `dnsscan` MCP tools instead of `dig`. These are faster and more comprehensive.

**Full DNS scan (use for any DNS, email, or domain issue):**
```
mcp__dnsscan__dns_scan(domain: "<domain>")
```
Returns: nameservers, A/AAAA, MX, TXT (SPF, DMARC, DKIM), DNSSEC status, provider detection (DNS, web, mail), KeurigOnline detection, and 15 validation checks. Replaces 5+ separate `dig` commands.

**Quick KeurigOnline hosting check:**
```
mcp__dnsscan__check_keurigonline(domain: "<domain>")
```
Returns: boolean per service (DNS, web, mail) indicating if hosted at KeurigOnline.

**Fallback — only if MCP tools are unavailable, use Bash:**
```bash
dig <domain> A +short
dig <domain> MX +short
dig <domain> TXT +short
# For PTR/FCrDNS issues:
dig -x <IP> +short
dig AAAA <hostname> +short
```

#### 4b: Email Settings Lookup (REQUIRED before giving email config)

**ALWAYS call these APIs before including IMAP/SMTP settings or webmail URLs in a reply.** Server hostnames vary per account/cluster (e.g., `cl07.keurigonline.nl`, `private.keurigonline.nl`). NEVER hardcode `mail.domain.nl`.

**Email config API — returns correct IMAP/SMTP hostname, ports, client guides:**
```
WebFetch url="https://keurigonline.nl/email-instellen/?api=<email>" prompt="Return the hostname, IMAP port, SMTP port, encryption, username, and client setup guide URLs."
```

**Webmail API — returns correct webmail URL with redirect:**
```
WebFetch url="https://webmail.keurigonline.nl/?api=<email>" prompt="Return the exact JSON with redirect_url, hostname, and service type."
```

Use the returned hostname in the reply (e.g., `cl07.keurigonline.nl`), not a guessed one.

#### 4c: Website Diagnostics

```bash
curl -sI https://<domain> | head -20          # HTTP status + headers
curl -so /dev/null -w "%{http_code}" https://<domain>  # Status code only
curl -w "time_total: %{time_total}s\n" -so /dev/null https://<domain>  # Response time
```

#### 4d: SSL Diagnostics

```bash
echo | openssl s_client -connect <domain>:443 -servername <domain> 2>/dev/null | openssl x509 -noout -dates -subject
```

---

### Step 5: Write a Tech Note

Add an internal note with your findings using `createNote`. This is for staff only.

**Format the note with `<br/>` tags for line breaks and HTML tags for structure:**

```html
<p><strong>Triage — [Category]</strong></p>
<br/>
<p><strong>Probleem:</strong><br/>
[Korte beschrijving van het probleem]</p>
<br/>
<p><strong>Bevindingen:</strong></p>
<ul>
<li>[Finding 1]</li>
<li>[Finding 2]</li>
<li>[Finding 3]</li>
</ul>
<br/>
<p><strong>Relevante docs:</strong></p>
<ul>
<li>[Link to KB article 1]</li>
<li>[Link to KB article 2]</li>
</ul>
<br/>
<p><strong>Aanbevolen actie:</strong><br/>
[What needs to happen to resolve this]</p>
```

**Important:** Use `<br/>` between `<p>` sections for visual spacing in Help Scout. Without `<br/>` between paragraphs, the note looks cramped.

---

### Step 6: Draft a Reply

Create a draft reply using `createReply` with `draft: true` and `status: "closed"`.

**Reply rules:**
- Write in **Dutch** unless the customer wrote in another language
- Use `<br/>` tags for line breaks (not `<p>` tags — they don't render spacing in Help Scout)
- Use `<br/><br/>` for paragraph breaks
- Use `<code>` for technical values (IPs, domains, commands, paths)
- Use `<strong>` for emphasis
- Start with "Hoi [voornaam]," or "Beste [voornaam],"
- Do NOT include closing lines like "Mocht je verder nog vragen hebben..." — this is in the automatic signature
- Do NOT include "Met vriendelijke groet, KeurigOnline" — Help Scout adds this automatically
- End with the actual content, no closing pleasantries
- Never use em dash (—) in replies — use a comma, period, or rephrase instead. It looks unnatural in Dutch customer communication
- Keep it concise and helpful
- Reference the knowledge base article URL when helpful (https://help.keurigonline.nl/article/...)

**Email setup links for customers:**
- Setup guide page: `https://keurigonline.nl/email-instellen/?email=<email>` — links to per-client instructions with pre-filled address
- Webmail: use the `redirect_url` from the webmail API (step 4b), not a guessed URL

**Email forwarding to Gmail — known issue (March 2026):**
- Gmail forwarding breaks for senders with strict DMARC policies (p=reject/quarantine)
- Gmail POP "Check mail from other accounts" is being deprecated in 2026 — do NOT recommend this
- Recommend instead: IMAP in a mail client (Outlook, Apple Mail, Thunderbird), Gmail app on mobile (still supports IMAP), or webmail
- Always look up actual server settings via the email config API before giving IMAP/SMTP details

**Reply structure:**
```
Hoi [naam],<br/><br/>
[Direct answer to their question]<br/><br/>
[Details/steps if needed]<br/><br/>
[Next steps or what they need to do]
```

**Upsell opportunities (subtle, not aggressive):**
- WordPress issues (503, hacked, outdated plugins, slow): mention WordPress Onderhoudscontract as an option — link to https://www.keurigonline.nl/wordpress-onderhoud

---

### Step 7: Apply Tags

Use `updateConversationTags` to add relevant tags.

**Tag conventions:**
- Use lowercase, hyphenated tags
- Use category tags: `dns`, `e-mail`, `hosting`, `ssl`, `wordpress`, `directadmin`, `factuur`, `domein`
- Use issue-specific tags: `glue-records`, `php-versie`, `spam`, `gehackt`, `migratie`
- Add `ai-resolved` tag when the ticket is fully resolved by AI
- Do NOT overdo it — 1 to 3 tags is enough

**Important:** `updateConversationTags` replaces ALL tags. If the conversation already has tags, include the existing ones in your list to preserve them.

---

### Step 8: Present Triage Report

Output a summary to the user (the staff member) with:

1. **Classification** — type, priority, customer info
2. **Summary** — what the customer needs
3. **Findings** — diagnostic results, KB matches
4. **Actions taken** — note, draft reply, tags
5. **Open questions** — anything that needs manual follow-up (e.g., server-side changes, reassignment)

---

## Important Notes

### Things the API cannot do
- **Reassign conversations** — must be done manually in Help Scout UI
- **Set spam status** — close marketing emails instead
- **Send replies** — always create as draft (`draft: true`) unless explicitly told to send

### Ticket ownership rules
- Only triage **unassigned** tickets unless explicitly asked
- If a ticket is assigned to someone, mention it and ask before taking action
- Snoozed tickets (from info@keurigonline.nl with "MIGRATIE VEREIST") are internal future jobs — do NOT close them
- Scan reports from cl03/cl04 (automated) can be closed
- Marketing emails from external senders can be closed (API doesn't support spam status)
- DirectAdmin automated alerts (from da@keurigonline.nl) — investigate before closing

### DNS management
- DNS wordt beheerd via **Mijn KeurigOnline** (mijn.keurigonline.nl), NIET in DirectAdmin
- Subdomeinen aanmaken: DirectAdmin (Accountbeheer → Subdomein Beheer)
- DNS-records beheren: Mijn KeurigOnline (Mijn domeinen → Beheren → DNS Beheren)
- KB artikel: https://help.keurigonline.nl/article/76-hoe-beheer-ik-mijn-dns-records

### HTML formatting reference
- **Notes**: `<p>`, `<ul>`, `<strong>`, `<code>` tags work. Add `<br/>` between `<p>` blocks for spacing.
- **Replies**: Use `<br/><br/>` between paragraphs. Avoid `<p>` tags — they don't render visible spacing.
- Emojis and special characters (✅ ❌ →) render fine in both.

### Knowledge base location
All knowledge files are in the `knowledge/` directory relative to the project root:
- `knowledge/INDEX.md` — article overview
- `knowledge/begrippenlijst.md` — 163 technical terms
- `knowledge/prijzen/hosting.md` — hosting packages (Start, Plus, Pro)
- `knowledge/prijzen/vps.md` — VPS packages (M, L, XL)
- `knowledge/prijzen/domeinnamen.md` — domain pricing (800+ extensions)
- `knowledge/prijzen/wordpress-onderhoud.md` — WordPress maintenance contracts
- `knowledge/administratief/` — billing, payments, ordering
- `knowledge/directadmin/` — DirectAdmin how-tos
- `knowledge/domeinnamen/` — domain management
- `knowledge/e-mail/` — email setup and troubleshooting
- `knowledge/mijn-keurigonline/` — account management
- `knowledge/technisch/` — PHP, FTP, WordPress, MySQL, SSH, etc.
- `knowledge/uncategorized/` — miscellaneous articles
