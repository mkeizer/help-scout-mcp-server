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

For technical issues, run real-time checks via Bash:

**DNS issues:**
```bash
dig <domain> A +short
dig <domain> AAAA +short
dig <domain> MX +short
dig <domain> NS +short
dig <domain> TXT +short
whois <domain> | grep -i "registrar\|nameserver\|status"
```

**Website issues:**
```bash
curl -sI https://<domain> | head -20          # HTTP status + headers
curl -so /dev/null -w "%{http_code}" https://<domain>  # Status code only
curl -w "time_total: %{time_total}s\n" -so /dev/null https://<domain>  # Response time
```

**SSL issues:**
```bash
echo | openssl s_client -connect <domain>:443 -servername <domain> 2>/dev/null | openssl x509 -noout -dates -subject
```

**E-mail issues:**
```bash
dig <domain> MX +short
dig <domain> TXT +short | grep -i "spf\|dkim\|dmarc"
# For PTR/FCrDNS issues:
dig -x <IP> +short
dig AAAA <hostname> +short
```

Only run diagnostics relevant to the problem. Skip this step for administrative/billing questions.

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

Create a draft reply using `createReply` with `draft: true`.

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
- Keep it concise and helpful
- Reference the knowledge base article URL when helpful (https://help.keurigonline.nl/article/...)

**Reply structure:**
```
Hoi [naam],<br/><br/>
[Direct answer to their question]<br/><br/>
[Details/steps if needed]<br/><br/>
[Next steps or what they need to do]
```

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
- **Send replies** — always draft unless explicitly told to send

### Ticket ownership rules
- Only triage **unassigned** tickets unless explicitly asked
- If a ticket is assigned to someone, mention it and ask before taking action
- Snoozed tickets (from info@keurigonline.nl with "MIGRATIE VEREIST") are internal future jobs — do NOT close them

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
- `knowledge/administratief/` — billing, payments, ordering
- `knowledge/directadmin/` — DirectAdmin how-tos
- `knowledge/domeinnamen/` — domain management
- `knowledge/e-mail/` — email setup and troubleshooting
- `knowledge/mijn-keurigonline/` — account management
- `knowledge/technisch/` — PHP, FTP, WordPress, MySQL, SSH, etc.
- `knowledge/uncategorized/` — miscellaneous articles
