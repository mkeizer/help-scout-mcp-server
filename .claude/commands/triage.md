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

**Extract the FULL list of questions, not just the subject.**

A ticket can have a narrow subject ("error op mijn website") maar meerdere losse vragen in de body ("kunnen jullie dat fixen? moet ik een groter pakket? hoeveel domeinen kan ik kwijt? heb ik openstaande facturen?"). Elke vraag moet beantwoord worden in de draft reply. Als je één vraag mist, is de klant niet klaar — en als je tool-calls doet die één specifieke vraag beantwoorden kan een reviewer die voor "waste" aanzien zolang de vraag niet zichtbaar is in de scope.

**Scope-inventarisatie vóór je verder gaat:**
1. Lees de customer-thread body volledig (eerste `type: "customer"` thread in getThreads output).
2. Maak mentaal een lijst `Q1, Q2, … Qn` — elke zelfstandige vraag is er één, ook als ze in één alinea staan.
3. Houd die lijst naast je tijdens het triage. Elke tool-call die je overweegt moet aan minstens één Q bijdragen. Zo niet → sla 'm over.
4. Als de cron-wrapper actief is, staat `CustomerQuestion: Q1 | Q2 | …` bovenaan het log — dat is je ground-truth. Gebruik die.

**Key info to extract:**
- What is the customer asking/reporting? (may be multiple — see above)
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

#### Step 1c: Client & Context Lookup (DRS-native)

Use the `drs.*` MCP tools. `scripts/client-lookup.sh` is obsolete — DRS is richer, structured JSON, no 10-item cap, and adds `direct_debit` + `iban` + `payment_link`.

**Pick ONE identifier path — stop at the first match:**

| Have | Call | Notes |
|---|---|---|
| Email (from `primaryCustomer.email`, **never** `cl*@keurigonline.nl`/Imunify scanner) | `drs.client-search(field: "email", query: <email>)` | Prefer `status: "actief"` hit over opgezegd/fraude. Customer may have multiple client records — pick main. |
| DA username (e.g. `wvw294` from Imunify) | `drs.client-search(field: "username", query: <user>)` | 0 hits ≠ geen klant — sommige DA-users zitten niet in DRS (oude accounts, systeem). Fallback: `fs_read grep /etc/virtual/domainowners` op de cl*-server → echte DA-owner. |
| Alleen domein (abuse report, externe ref) | `drs.package-search(domain: <domain>, limit: 5)` | Pak `client_id` van eerste `Actief`/`Opgezegd` hit. Geen hits = domein niet bij KO — noteer, stop. |
| Niets bruikbaars | — | Tech note "client onbekend", escalate naar Anyone. |

**Altijd daarna:** `drs.client-get(client_id)` — levert alles in één call:
- **Identity:** name, email, all_emails, phone, company, address, status
- **Payment:** `direct_debit` (boolean) + `iban` (masked) — **load-bearing, zie guard hieronder**
- **Scope:** package_count, domain_count
- **Recent:** 5 laatste facturen met payment_method + paid/due status

**Diepere calls — alleen op basis van ticket-categorie (spaart tokens):**

| Ticket type | Extra call | Waarom |
|---|---|---|
| Betaalvraag / incasso | `drs.invoice-search(client_id, status: 0, limit: 20)` + zo nodig `drs.invoice-get(invoice_id)` voor `payment_link` | Onbetaalde facturen + iDEAL-link |
| Recent technisch issue | `drs.logboek-search(client_id, from_date: <7-30d>, limit: 20)` | Server-side wijzigingen die 't probleem kunnen hebben veroorzaakt |
| Meer dan 5 domeinen nodig | `drs.package-search(client_id, limit: 50)` | Voorbij de 5-recent cap van client-get |
| Malware / abuse | `drs.package-search(domain)` + `fs_read grep /etc/virtual/domainowners` op cl*-server | Bevestigt server + DA-user |

**🚨 Auto-incasso guard (kritisch):**

Als `drs.client-get.direct_debit == true`:
- **NOOIT** `payment_link` in een reply stoppen — ook niet bij openstaande factuur
- Klant betaalt via automatische incasso; iDEAL voorstellen = risico op dubbele afschrijving
- Tech-note: `Auto-incasso actief (IBAN: NL49****2472) — geen betaallink voorgesteld`

**Domein-autorisatie check:**

Uit `drs.package-search(client_id, limit: 50)` krijg je alle domeinen die de klant heeft. Als het ticket een domein noemt dat **niet** in die lijst staat:
- Tech-note: "Domein `<domein>` staat niet in account van `client_id <id>` — geen mutaties mogelijk"
- Draft reply: vraag om verduidelijking ("welke van je domeinen bedoel je?")
- Dit geldt voor ALLE wijzigingen (DNS, mail, hosting, opzeggingen).

**Pakkettype-check voor features (SSH/SFTP):**

`drs.package-search(client_id)` retourneert product_name per package. `Start` en legacy `S`/`M` hebben geen SSH. Plus, Pro, legacy L/XL/XXXL wel. Maar: **altijd daadwerkelijk SSH proberen** (zie `playbooks/ssh-access.md`) — pakket-naam is context, niet een verbod.

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

**Als de site vanuit onze kant wél werkt maar de klant meldt dat het niet werkt:**
Dit kan een **firewall blokkade** zijn (ModSecurity, LiteSpeed, of IP-ban). Vraag de klant om zijn/haar IP-adres op te zoeken via `www.checkip.nl` en dit door te geven. Met het IP-adres kunnen we server-side controleren of het IP geblokkeerd wordt. Via SSH: `csf -g <IP>` of in de LiteSpeed/ModSecurity logs zoeken.

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
<br/>
<p><strong>TL;DR:</strong><br/>
[Eén of twee zinnen: wat is er aan de hand en wat is de volgende stap]</p>
```

**Important:** Use `<br/>` between `<p>` sections for visual spacing in Help Scout. Without `<br/>` between paragraphs, the note looks cramped.

**TL;DR is verplicht** en staat altijd als laatste blok. Max 2 zinnen, zo geschreven dat een collega de hele note kan overslaan en toch weet waar het ticket over gaat en wat hij moet doen.

---

### Step 5b: Decide — Reply, Close, or Leave Open?

Before drafting a reply, decide the right end state for this ticket. Three options:

**A. Reply (most tickets)** — customer or sender needs an answer. Proceed to Step 6.

**B. Close without reply** — no action is needed by anyone, ever. Close via `updateConversationStatus`, skip Step 6 and Step 8. Examples below.

**C. Leave open for a colleague** — manual follow-up is needed that you cannot complete yourself (e.g. SSH on a server where the key doesn't work, customer notification that requires human judgement, server-side config change). Write the tech note describing exactly what's needed, apply tags, run the Step 8 unassign so it drops into Anyone's queue, and stop. Do NOT close.

**Critical rule: closing and requesting action are mutually exclusive.** If you close the ticket, there is no follow-up needed. If follow-up is needed, leave the ticket open. Closing "and also @Anyone please do X" is wrong — the ticket disappears from active queues and the request is lost. Pick one.

**Close directly without a draft reply (option B) when:**
- **False positive Imunify alert** — after inspecting the file(s), it turns out to be legitimate (nulled plugin that was already removed, `.config/htop/defunct` noise, empty file, etc.) AND nothing else needs doing
- **Duplicate Imunify/scan alert** — same file/account already reported in an earlier (open or closed) ticket and handled there
- **Automated scan reports from cl03/cl04** that don't contain anything actionable (clean scans, informational only)
- **Resolved-by-itself** — customer's own message shows the problem already went away (e.g., "oh, nevermind, it works now"), no reply needed
- **Marketing/spam from external senders** — Microsoft Proofpoint marketing, newsletter bounces, etc. (API can't set spam status, closing is the workaround)
- **Snoozed internal jobs are the exception** — tickets from `info@keurigonline.nl` met "MIGRATIE VEREIST" NIET sluiten, laten staan

**How to close without a draft:**
1. Write a tech note (Step 5) that explains **why** it was closed (e.g., "false positive, bestand was al eerder verwijderd", "duplicate van #xxxxx"). This is important — a bare close without context is worse than leaving it open.
2. Skip Step 6 (Draft a Reply).
3. Apply tags (Step 7) as normal, include `closed-no-reply` or similar if useful.
4. Close via `updateConversationStatus({conversationId, status: "closed"})`.
5. **Skip Step 8 (Unassign)** — a PATCH to `/assignTo` re-opens a closed ticket, which defeats the purpose. Closed is the terminal state; the ticket already drops off Koos's todo list.
6. Present the report (Step 9) — include "closed without reply, reason: ..." in the actions taken.

If in doubt, draft a reply instead of closing. A draft can be deleted; an unneeded close that gets re-opened leaves a messy trail.

---

### Step 6: Draft a Reply

Create a draft reply using `createReply` with `draft: true` and `status: "closed"`.

**Note vs reply — verschillende doelen, geen duplicatie.**

De tech note (Step 5) en de draft reply zijn voor verschillende lezers met verschillende informatiebehoeftes. Herhaal niet dezelfde feiten in beide.

| | Tech note (intern) | Draft reply (klant) |
|---|---|---|
| Lezer | Collega die de draft reviewed | Klant die de site wil terug |
| Doel | "Kan ik deze draft gerust verzenden?" | Antwoord op wat klant vroeg |
| Inhoud | Findings, root cause, technische paden, DRS-gegevens, wat je hebt gedaan/gelaten | Wat voor de klant relevant is om te weten/doen |
| Detail | Specifiek (paden, client_id, file-regel, commando) | Alleen zoveel als de klant nodig heeft om vooruit te komen |
| Lengte | Max 15 regels feitelijk | Zo kort als de vragen toelaten |

Voorbeeld bij een PHP parse-error:
- **Note:** `File: /home/maarten/domains/dotabase.nl/public_html/index.php regel 3 — "echo hallo welkom op mijn website;" (ontbrekende quotes). LiteSpeed STDERR bevestigt. Server/pakket prima. Advies: fix kost 5s via DA Bestandsbeheer, vraag akkoord.`
- **Reply:** `We zagen dat regel 3 van index.php een kleine fout heeft — de tekst mist aanhalingstekens. Zal ik die voor je corrigeren?`

Wat je in de reply NIET herhaalt: DRS client_id, disk-quota-getallen, DNS-records, pakket-limieten die niet gevraagd zijn. Dat is allemaal al in de note voor de reviewer.

**Reply rules:**
- Write in **Dutch** unless the customer wrote in another language
- **Write in voltooid verleden tijd — describe what has been done, never what we are going to do.** The draft is a ready-to-send message that goes out AFTER the fix is applied. If the reply is in future tense ("we gaan dit aanpassen", "we zijn ermee bezig", "we laten weten zodra het klaar is"), the staff member has to rewrite it. Instead write: "We hebben het zojuist aangepast. Het zou nu weer moeten werken, wil je het nogmaals proberen?" This applies to server-side fixes, DNS changes, settings updates, all infrastructure work. Assume the fix will be in place by the time the draft is sent.
- Use `<br/>` tags for line breaks (not `<p>` tags — they don't render spacing in Help Scout)
- Use `<br/><br/>` for paragraph breaks
- Use `<code>` for technical values (IPs, domains, commands, paths)
- Use `<strong>` for emphasis
- Start with "Hoi [voornaam]," or "Beste [voornaam]," — **only when the name is directly read from the `primaryCustomer.first` field on the conversation**. Never derive a name from tech notes, internal lineItems ("X assigned to you"), quoted email history, colleagues mentioned in threads, or best-guess context. Those are not the customer.
- If `primaryCustomer.first` is empty, unknown, or looks like a company/system name (e.g. "Imunify", "Cl05", ""): use a neutral opening "Goedemorgen," / "Goedemiddag," / "Goedenavond," (tijdsafhankelijk via `getServerTime`). Never fabricate a name.
- **Sanity check:** if the name you're about to use matches a KeurigOnline colleague (see `memory/project_colleagues.md`: Ewoud, Maarten, Wouter, Pablo), pause and re-verify against `primaryCustomer.first`. A real customer might legitimately share a first name, so the blocklist is a warning flag — not an absolute veto. But an assumption-based greeting with a colleague's name is almost always the bot pattern-matching on internal context instead of the customer object, so treat it as guilty until verified.
- Do NOT include closing lines like "Mocht je verder nog vragen hebben..." — this is in the automatic signature
- Do NOT include "Met vriendelijke groet, KeurigOnline" — Help Scout adds this automatically
- **Afsluiting op basis van dag + tijdstip** (bepaald via `getServerTime`, geconverteerd naar Amsterdam-tijd CET/CEST):
  - Maandag t/m donderdag: "Fijne dag!" of een korte succeswens passend bij het onderwerp
  - Vrijdagmiddag/-avond (na 12:00): "Alvast een fijn weekend!"
  - Zaterdag: "Fijn weekend!"
  - Zondag: "Fijne zondag!"
  - **Controleer altijd de exacte dag via `getServerTime`** — reken NIET terug vanuit een eerdere aanroep of aanname. Een verkeerde daggroet ("Fijne zondag" op maandag) valt direct op bij de klant.
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

**Openstaande factuur die de klant zegt te hebben betaald:**
- Klanten kunnen betalen via iDEAL (direct) of bankoverschrijving (1–3 werkdagen vertraging). Als `drs.invoice-search(client_id, status: 0)` de factuur nog open toont, is de default **niet** dat de betaling is mislukt — hoogstwaarschijnlijk is het een bankoverschrijving die nog onderweg is.
- **Eerst `direct_debit`-check** uit `drs.client-get` — bij `true` géén betaallink aanbieden (auto-incasso, zie Step 1c guard).
- **Nooit stellig zeggen** "de betaling is niet binnengekomen" of "mogelijk is de betaling niet correct afgerond" — dat alarmeert de klant onnodig en leidt tot dubbele betalingen.
- **Wel** schrijven: *"De betaling van factuur X is op dit moment nog niet zichtbaar in ons systeem. Als je per bankoverschrijving hebt betaald, kan het 1 tot 3 werkdagen duren voordat de betaling bij ons verwerkt is. In dat geval hoef je verder niks te doen."* Daarna optioneel `drs.invoice-get(invoice_id).payment_link` *"Wil je het liever direct afronden?"* — als alternatief, niet als enige optie.
- Dit geldt ook voor proactieve betalingsherinneringen: eerst bankoverschrijving-disclaimer, dan pas de betaallink.

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

### Step 8: Unassign the Ticket

As the final action, unassign the ticket so it drops out of Koos's todo list and becomes visible to the rest of the team for review and send-off. This must run **after** the tech note, draft reply, and tags are all in place, so the context above the unassign lineitem is complete.

```bash
scripts/unassign-conversation.sh <conversation_id>
```

The script does a `PATCH /v2/conversations/{id}` with `{"op":"replace","path":"/assignTo","value":null}`. Expected output: `unassigned: <id>`. Exit 0 on success, 2 on API error.

**Skip this step** if the ticket should explicitly stay with a human (e.g., ownership was transferred mid-triage, or the ticket was already assigned to a specific colleague before you started).

**Caveat:** a PATCH to `/assignTo` re-opens a closed conversation. In a normal triage flow the ticket is still active when this runs, so that's not an issue. If you closed the ticket earlier in the triage (rare), run the unassign first and then close via `updateConversationStatus`.

### Step 9: Present Triage Report

Output a summary to the user (the staff member) with:

1. **Classification** — type, priority, customer info
2. **Summary** — what the customer needs
3. **Findings** — diagnostic results, KB matches
4. **Actions taken** — note, draft reply, tags, unassigned
5. **Open questions** — anything that needs manual follow-up (e.g., server-side changes, reassignment)
6. **Link** — `https://secure.helpscout.net/conversation/{conversationId}/{number}` (altijd als laatste regel toevoegen)

---

### Step 10: Write Structured Report (suggestions & meta)

Write a JSON report alongside the log so we can aggregate suggestions across runs. The viewer at `/home/claude/projects/triage-viewer` reads these and shows patterns — "3 tickets wanted DirectAdmin tool X", "2x no KB article for Y" — which Maarten en Pablo forward to MCP/API/docs owners.

**Path:** `$TRIAGE_REPORT_PATH` (exported by the cron wrapper, ending in `.report.json`).

**If the env var is not set** (manual run, not via cron): skip this step silently.

**When to write:** ALWAYS, regardless of earlier failures. Even a partial report with `"resolution": "failed"` is useful. Do NOT block on tool errors elsewhere.

**Think honestly while you write it.** Per ticket, ask yourself:

- Was there a tool I *wished* existed? (e.g., "reset a mail-quota from outside the server", "pull a DirectAdmin user password", "flag an IP at the CSF level from the MCP") → `missingTools`
- Did I search the KB for something I expected to find and came back empty? → `missingDocs`
- Did I do something clumsy multiple times in a row? → `frictionPoints`
- Is this the Nth time I see the exact same pattern? → `recurringPattern`
- **Could THIS run have been faster, cheaper, or more accurate?** → `runRetrospective` (see below)

Only include what actually applies to *this* ticket. Empty arrays / null fields are fine.

**`runRetrospective` — self-improvement per run (optional, null all four sub-fields if nothing notable):**

We own the HS MCP and the SSH gateway MCP. Anything is buildable. After each run, briefly reflect on:

- `couldBeFaster` — where did I make >1 round-trip that a combined endpoint could have done in one? (e.g. `drs.client-search` → `drs.client-get` = 2 calls; a hypothetical `drs.client-resolve(email|username|id)` could do it in 1)
- `wouldReduceTokens` — where did a response include fields I didn't need? (e.g. `drs.client-get` returning 30 fields when the question only needed `direct_debit`)
- `wouldImproveAccuracy` — where did I guess or approximate because no tool gave me ground truth? (e.g. inferred package tier from product_name instead of an explicit `has_ssh` flag)
- `newToolIdea` — a capability that doesn't exist yet but would have saved the run (be specific: endpoint name, args, what it returns)

Calibration: do not invent retrospectives to look thoughtful. If the run was efficient, set all four to null. The viewer aggregates these to spot real patterns — noise pollutes the signal.

**Schema:**

```jsonc
{
  "ticket": "1287485",
  "ticketUrl": "https://secure.helpscout.net/conversation/.../1287485",
  "triagedAt": "2026-04-17T15:30:00+02:00",

  "classification": {
    "type": "DNS / Nameservers",           // matches Step 2 categories
    "priority": "Hoog|Middel|Laag",
    "category": "optional free-form sub-category"
  },

  "resolution": "resolved",                // see values below
  "confidence": "high",                    // low | medium | high

  "missingTools": [
    {
      "name": "directadmin_reset_user_password",
      "server": "ssh-gateway",             // "helpscout", "dnsscan", "ssh-gateway", "new", ...
      "why": "Customer asked for password reset, had to escalate",
      "workaround": "Anyone-note with DA UI steps",
      "priority": "medium"                  // low | medium | high
    }
  ],

  "missingDocs": [
    {
      "proposedTitle": "Hoe reset ik een FTP-wachtwoord via DirectAdmin",
      "category": "E-mail & FTP",          // maps to knowledge/ folder
      "outline": ["stap 1 ...", "stap 2 ..."],
      "whyMissing": "Searched 'FTP wachtwoord reset' in knowledge/, no hit",
      "priority": "medium"
    }
  ],

  "frictionPoints": [
    {
      "step": "ssh-gateway",
      "issue": "cmd_run timed out twice, had to fall back to @Anyone note"
    }
  ],

  "recurringPattern": {
    "signature": "imunify-nulled-wpap-recurrence",
    "note": "3rd time this exact file — auto-whitelist candidate?",
    "priorTickets": ["1285789", "1285848"]
  },

  "runRetrospective": {
    "couldBeFaster": "Made 4 DRS calls where a combined drs.client-full(email) endpoint returning client+open-invoices+recent-logboek in one shot would have sufficed — saves 3 round-trips on every billing triage.",
    "wouldReduceTokens": "drs.client-get returned 30 fields; this billing question only needed direct_debit + open_invoices. A ?fields= projection would have cut ~400 input tokens.",
    "wouldImproveAccuracy": null,
    "newToolIdea": "mail_forwarder-audit returned empty for dotabase.nl because the domain's aliases file is empty — but Exim stores the 'catch-all → nowhere' policy elsewhere. Tool could also check the catch-all config."
  }
}
```

**`resolution` values:**

| Value | Meaning |
|-------|---------|
| `resolved` | Draft reply + tags + unassigned, normal triage flow completed |
| `closed-no-reply` | Closed via Step 5b (false positive, duplicate, self-resolved) |
| `closed-transient` | Closed via transient-alert rule, first occurrence |
| `escalated-to-anyone` | Open, tech note requesting human action (SSH failed, needs DA-panel, etc.) |
| `no-action` | Left open without changes (unclear intent, awaiting clarification) |
| `failed` | Triage couldn't complete (API errors, etc.) — describe in `frictionPoints` |

**Write it via Bash heredoc** (quoted delimiter prevents shell expansion inside the JSON):

```bash
if [ -n "${TRIAGE_REPORT_PATH:-}" ]; then
  cat > "$TRIAGE_REPORT_PATH" <<'JSON'
{
  "ticket": "...",
  "ticketUrl": "...",
  "triagedAt": "...",
  "classification": { ... },
  "resolution": "...",
  "confidence": "...",
  "missingTools": [ ... ],
  "missingDocs": [ ... ],
  "frictionPoints": [ ... ],
  "recurringPattern": null
}
JSON
fi
```

**Validation:** must be valid JSON. If you're unsure, pipe through `python3 -m json.tool` to sanity-check:

```bash
python3 -m json.tool "$TRIAGE_REPORT_PATH" > /dev/null && echo "report ok"
```

**Guidelines for calibration:**
- Empty `missingTools` / `missingDocs` is *correct* when the ticket didn't surface anything new. Don't fabricate suggestions to look productive.
- `priority: high` = blocked real triage work. `medium` = would save meaningful time. `low` = nice-to-have.
- `confidence: low` on your own suggestions is honest — helps reviewers weight them.

---

### Token-efficiëntie (kostenbeheersing)

De triage cron draait onbeheerd en elke tool-call kost tokens. Vermijd herhaling en verbositeit:

- **Tech note**: max 15 regels feitelijke content (excl. HTML-tags en TL;DR). Gebruik bullets, geen proza. Als je meer dan 15 regels nodig hebt, snoei — de TL;DR vangt de rest op.
- **Geen herhaalde SSH-commando's**: als SSH faalt, schrijf de exacte fout eenmalig. Verwijs NIET naar "commando's die een collega kan draaien" als dit een recurrence/escalatie is voor een account waarvoor al een eerder ticket met die commando-set bestaat. Schrijf dan: "Zie SSH-instructies in ticket #XXXXX."
- **Recurrence-historie**: max 1 regel per eerder ticket. Format: `Prior: #1286587 (8 apr, gesloten zonder remediatie), #1286414 (6 apr, duplicate)`. Geen volledige samenvattingen van eerdere tickets.
- **Single-file findings**: inline beschrijven, geen markdown-tabel. Tabel alleen bij 3+ bestanden.
- **Triage report (stdout)**: max 30 regels totaal. Classificatie + samenvatting (2-3 zinnen) + acties genomen + open punten + link. Herhaal NIET de volledige tech note in het rapport — de note staat al op het ticket.

### Anti-patterns (observed in real runs — stop doing these)

Elke regel heeft een voorbeeld-ticket waar dit geld heeft gekost. Ken de regel, herken het bij jezelf tijdens de run, en stop.

1. **DRS is authoritative voor pakket- en domein-state.** Als `drs.package-search` een pakket toont als `Opgezegd`, is het antwoord daar al. Fallback naar `/etc/virtual/domainowners`, `da-user-info` of `find` op de server gaat altijd niks opleveren — opgezegde accounts bestaan server-side niet meer. Dit is een "ik zoek verder want ik vind niks"-loop die 3 extra tool calls kost en niks toevoegt.

2. **Tool-errors zijn signalen, geen uitnodigingen.** Als `da-user-info` of een andere cmd_run faalt, vraag je jezelf af: *had ik deze data nodig voor de reply?* Zo nee — drop hem, verder. Zo ja — check of DRS het antwoord al heeft. Een ToolSearch mid-run naar een alternatief tool voor data die niet load-bearing was, is pure context-vreter. Alleen recovery-searchen als de triage er echt niet zonder kan.

3. **Eén lookup per identifier.** Als je `drs.client-search(field: "email")` een `client_id` hebt, dan is dat de klant. Niet ook `drs.client-search(field: "name")` doen "voor de zekerheid". `drs.client-get(id)` heeft alles. Gerelateerde client-records (2e DRS-record, andere onderneming van dezelfde persoon) alleen opzoeken als ze *in scope van de vraag* zijn — als je in je tech note schrijft "niet relevant voor dit ticket", had je dat niet moeten opzoeken.

4. **Diagnose-scope matcht het symptoom.** "Mail werkt op telefoon, wachtwoord-prompt op desktop" = client-side config. Geen DNS/MX/SPF-scan, geen FCrDNS. De verschillende layers:
   - *Desktop client werkt niet, telefoon wel* → wachtwoord of SSL-setting in het client-programma
   - *Mails komen niet aan bij externe ontvanger* → deliverability (SPF/DKIM/DMARC/PTR)
   - *Mails komen niet binnen* → MX, Exim queue, quota
   - *Helemaal geen verbinding* → DNS, firewall, server status
   Kies de laag, kies de tools. Niet "alles maar scannen".

5. **Regel van 3 op zoek-patronen.** Zelfde file, zelfde vraag, escalerende patterns (`exact` → `case-insensitive` → `all servers`) = je zit in een dead-end. Stop. Het antwoord zit niet in die file. Bijna altijd heeft DRS het antwoord al of is het gewoon "bestaat niet".

6. **TodoWrite-drempel.** Voor <5 items OF <5min taken: skip TodoWrite. Doe gewoon. Drie todo-updates voor een 3-items lijst is meer context-churn dan de taak zelf. TodoWrite is voor meerstaps-werk waar een reviewer wil zien wat er gedaan is, niet voor "ik doe even A, B en C".

7. **ToolSearch front-loaded.** Één bulk-select aan het begin van de triage op basis van ticket-categorie (zie Step 2 classificatie). Recovery-ToolSearches mid-run zijn een smell: je planning klopte niet. Als je écht een tool nodig hebt die je niet geladen hebt, laad hem — maar tel mee dat dit volgende keer in de front-load moet.

8. **Structured tool vóór raw fs_read.** Voor info die een dedicated MCP-tool netjes terug kan geven (pakket-limieten, quota, user-config), begin je met die tool — niet met `fs_read` op de onderliggende file. Volgorde: `da-user-info` → `cl-lvectl` → `drs.*` → dan pas `fs_read` voor iets specifieks dat ontbreekt. Eerst grep'en in `user.conf` en dan alsnog `da-user-info` draaien is 2 calls verspild die 1 call had gekund.

9. **Root cause = stop met zoeken.** Zodra je de oorzaak hebt bevestigd (PHP parse-error regel 3, exim rejection code, quota full), *stop*. Geen nieuwe filters, geen "maar misschien is er nóg iets". Verdergraven na een duidelijke root cause is hindsight-geld: achteraf blijkt altijd dat niks van de extra calls in de reply terechtkwam.

10. **Tool-error fallback chain.** Als een MCP-tool errort, fallback naar de goedkoopste alternatieve databron die je al hebt — niet ToolSearch voor een nieuwe. Bijv. `drs.invoice-search(status: 0)` errort? → check `drs.client-get.recent_invoices[].amount_paid_eur` (die had je vaak al). Geen data = vaak ook een geldig antwoord ("geen openstaande facturen zichtbaar").

11. **Scope-check tegen CustomerQuestion.** Het log-header `CustomerQuestion:` toont de échte vragen van de klant. Lees die eerst. Reply moet elk deel-antwoord raken. Omgekeerd: als je een tool-call overweegt die geen van de vragen bedient, sla hem over. Voorbeeld: "error op mijn website" als subject + "heb ik openstaande facturen?" als 5e vraag = invoice-lookup is load-bearing, geen waste.

**Self-check moment:** als je over je 10e tool call heen gaat en de reply nog niet begonnen is, pauzeer. Vraag: *heb ik genoeg om te antwoorden?* Match het dan terug tegen `CustomerQuestion`. Vaak is het antwoord ja, en was het meeste erna exploratie die nergens toe leidde.

---

## Important Notes

### Things the API cannot do
- **Reassign conversations to a specific user** — must be done manually in Help Scout UI. *Unassigning* (to "Anyone") does work via `scripts/unassign-conversation.sh` — see Step 8.
- **Set spam status** — close marketing emails instead
- **Send replies** — always create as draft (`draft: true`) unless explicitly told to send
- **Combine PATCH ops in one request** — Help Scout rejects a JSON array of ops. Each op (status, assignTo, etc.) must be a separate request.

### Ticket ownership rules
- **Assigned to Koos (user ID 903748) = explicit authorization to run full triage, including Step 8 (unassign).** This is how the triage cron picks up work: assigning to Koos IS the "please triage this" signal. Never stop and ask for approval on a Koos-assigned ticket — run the full flow and unassign at the end so it drops out of Koos's todo list.
- Only triage **unassigned** or **Koos-assigned** tickets unless explicitly asked otherwise
- If a ticket is assigned to another human (not Koos), mention it and ask before taking action
- **Every triage run MUST end in one of these states for the ticket**, otherwise it stays stuck in Koos's queue:
  - `closed` via `updateConversationStatus` (false positive, duplicate, self-resolved) — skip Step 8
  - `unassigned` via `scripts/unassign-conversation.sh` (normal path — tech note + draft reply + tags, hand back to the team)
  - `pending` via `updateConversationStatus` (snoozed / deferred, rare) — still run Step 8 afterwards
  - Never leave it `active + assigned to Koos` after a completed triage. That is the one forbidden end state.
- Snoozed tickets (from info@keurigonline.nl with "MIGRATIE VEREIST") are internal future jobs — do NOT close them
- Scan reports from cl03/cl04 (automated) can be closed
- Marketing emails from external senders can be closed (API doesn't support spam status)
- DirectAdmin automated alerts (from da@keurigonline.nl) — investigate, then apply the **transient infra-alert rule** below

### Transient infra-alerts: close-first, escalate-on-repeat

Some alerts describe problems that usually self-heal before anyone can act (DNS propagation races, Let's Encrypt retries, temporary backup failures, brief rate limits). If we escalate every one of these, the queue fills up with noise. If we silently close every one, a genuinely broken system hides forever. Rule:

1. **Is this a transient-eligible alert?** Only these categories qualify:
   - DirectAdmin / webbserver.nl alerts about: SSL renewal failures, Let's Encrypt DNS-01 timeouts, DNS propagation errors, backup retry failures
   - Autoreply bounces from mail infrastructure that normally recovers on its own

   **NEVER transient** (always run full triage + escalate as appropriate):
   - Imunify malware detections — always investigate, even duplicates
   - Disk quota / LVE limit alerts — active resource issue, needs human action
   - Any conversation with a customer sender (not `da@`, not `support@webbsite.nl`, not system senders)
   - Anything where you found evidence of ongoing damage (e.g. backdoor accounts, modified files)

2. **Look for prior occurrences.** Use `comprehensiveConversationSearch` scoped to `status: closed` to find tickets with the same subject pattern + same affected domain/server, created within the last **24 hours**. Quote the exact search query in the tech note.

3. **Decide based on hit count:**
   - **0 hits = first occurrence** → write tech note explaining *why* it's likely transient + what would escalate it, apply tags including `transient-closed`, call `updateConversationStatus(closed)`. Skip Step 8 (unassign on a closed ticket re-opens it). If it recurs tomorrow, the next triage run will see this closed ticket and escalate.
   - **1+ hits = recurrence** → write tech note titled "Recurrence — escalation needed" linking to the prior ticket(s), apply tags including `recurrence-escalated`, run Step 8 (unassign) so a human picks it up. Do NOT close.

4. **In the triage report**, always state which branch you took: "First occurrence, closed" or "Nth occurrence (prior: #xxxxx), escalated to Anyone".

### Capturing tool errors verbatim

When an MCP tool call or shell command fails, **always capture the exact error message and include it in the tech note AND the triage report**. Do not summarize a failure as "denied", "failed", "couldn't", or "not allowed" — those words tell the reviewer nothing about what to fix.

Specifically:
- Quote the actual returned error (HTTP status code, Help Scout `logRef`, validation message, Zod error path, `ssh:` error line, etc.)
- State which tool/command produced the error
- State what you tried to do

Example wrong note: "createConversation was denied, please manually create the customer notification."

Example right note: "`createConversation` failed. Called with `mailboxId: 111589, customer: info@example.nl, status: closed, draft: true, subject: ..., text: ...`. API returned HTTP 422 `{\"message\":\"Validation failed\",\"_embedded\":{\"errors\":[{\"path\":\"status\",\"message\":\"must be one of [active, pending]\"}]}}`. A draft on a new conversation with `status: closed` is invisible in the UI — retry with `status: active`."

This rule is non-negotiable: a silent "denied" in a tech note is worse than not writing the note at all, because it looks like work was done when the problem is still there.

### Common createConversation pitfalls
- **ALWAYS use `status: "active"`** for new conversations (draft or otherwise). `status: "closed"` on a draft conversation makes the draft invisible in the UI even though the API returns success. This bit us before — see memory `feedback_createconversation_status.md`.
- For replies on existing tickets (`createReply`), `status: "closed"` on a draft is fine and actually useful (closes the ticket when the staff member sends the draft).

### Imunify alert workflow

Imunify alerts zijn interne scan-rapporten, geen klanttickets. De "klant" is de server (bijv. `cl05@keurigonline.nl`), niet de eigenaar van het account.

**Onze rol: bewustwording, niet opruimdienst.** KeurigOnline is een webhostingbedrijf. Zonder WordPress Onderhoudscontract is WordPress-beveiliging de verantwoordelijkheid van de klant zelf. Onze default bij een Imunify alert is dus: **klant informeren + onderhoudscontract aanbieden**, niet zelf opruimen. We helpen graag een handje, maar schoonmaak is geen gratis standaarddienst.

**Uitzonderingen waarin we wél zelf actie ondernemen:**
- **Actieve dreiging voor de server of andere klanten** (cryptominer met hoog CPU, mass-mailer, webshell die actief misbruikt wordt) — dan zetten we het proces stop en verwijderen de bestanden, ongeacht contract. Dit is server-hygiëne, geen klantservice.
- **Klant heeft een WordPress Onderhoudscontract** — dan valt opruimen onder wat ze betalen.
- **Klant heeft expliciet om hulp gevraagd** in een eerder ticket of in een follow-up reply.

In alle andere gevallen: informeren, contract aanbieden, niet zelf opruimen.

**Workflow:**

1. **Lees het alert** — welk account, welke bestanden, welke server, hoe vaak gerapporteerd.
2. **Zoek eerdere tickets** — Imunify rapporteert hetzelfde bestand bij elke scan als het niet verwijderd is. Search op accountnaam/domein. Als er al een ticket voor hetzelfde bestand bestaat → dit is een duplicaat, sluit dit ticket (zie stap 8).
3. **Probeer SSH** om het bestand te inspecteren. Probeer het **altijd**, ook als `drs.package-search` een pakket toont dat officieel geen SSH ondersteunt — de praktijk wijkt soms af. Concludeer pas "geen SSH" als het daadwerkelijke `ssh` commando faalt met een concrete error, niet op basis van een aanname. Zie "SSH access" sectie hieronder.
   - Bestand inspecteren (`file`, `head`, `cat`)
   - WP core verify-checksums (als WordPress)
   - `wp plugin list` + `wp user list` controleren
   - Zoek naar meer verdachte bestanden in uploads/
4. **Classificeer** het bestand:
   - **Actieve dreiging** — cryptominer (ELF binary, hoge CPU), mass-mailer, actieve webshell die verkeer ontvangt
   - **Passieve webshell/backdoor** — aanwezig maar geen aangetoonde actieve uitbuiting
   - **Nulled plugin** — license bypass, geen actieve hack
   - **False positive** — niet (meer) malware: bestand weg, ruis (`.config/htop/defunct`), legitieme code
   - **Duplicate** — zelfde bestand al in ander Imunify ticket behandeld
5. **Bepaal actie op basis van classificatie:**
   - **Actieve dreiging → zelf opruimen** (ongeacht contract). `rm <bestand>` via SSH. Server-hygiëne gaat voor.
   - **Passieve webshell / nulled plugin / "gewone" malware → NIET zelf opruimen** tenzij klant een onderhoudscontract heeft of er expliciet om heeft gevraagd. Verwijderen is hier verantwoordelijkheid van de klant.
   - **False positive → geen actie**, alleen documenteren.
   - **Duplicate → geen actie**, alleen documenteren welk oorspronkelijk ticket.
6. **Tech note** met alles: bestand(en), classificatie, of je SSH hebt geprobeerd en de exacte uitkomst, wat je wel/niet gedaan hebt en waarom.
7. **Klant informeren (bewustwording)** bij alle classificaties behalve false positive en duplicate. Gebruik `createConversation` met:
   - **`customer` (ontvanger-email) — prioriteitsvolgorde:**
     1. **WordPress admin-email** via SSH: `wp --path=~/domains/<domein>/public_html user list --role=administrator --format=csv --fields=user_email,user_login` — pak het eerste admin-adres dat géén `@cl0*.keurigonline.nl` of `@keurigonline.nl` is. Dit is de juiste primaire ontvanger: de persoon die de site daadwerkelijk beheert.
     2. **KO account-email** via `drs.package-search(domain: <domein>)` → `client_id` → `drs.client-get.email` (of eerste `all_emails`-item). Deze fallback werkt ook als WP niet bereikbaar is.
     3. **Help Scout search** alleen als DRS géén hit geeft: `comprehensiveConversationSearch` op het domein → haal `primaryCustomer.email` uit het meest recente klanticket (niet een Imunify-alert). Vindt klanten die ooit gemaild hebben over hetzelfde domein maar niet in DRS als eigenaar staan.
     4. **NOOIT** `primaryCustomer.email` van het Imunify-ticket zelf gebruiken — dat is `cl0*@keurigonline.nl`, de scanner, niet de klant.
     5. **Als geen van bovenstaande werkt** → geen draft aanmaken, maar tech note met "ontvanger onbekend via WP-admin + DRS + HS search — collega moet via DA-panel opzoeken" + Step 8 unassign.
   - **`customer.first` / aanhef** — gebruik `drs.client-get.name` (split op spatie voor first) als `client_id` bekend is, anders neutrale tijdsafhankelijke groet. NOOIT een naam uit de quoted body van DRS/Imunify/andere forwards halen — ons DRS adresseert alle verificatie-mails aan "Ewoud Hoitsma" als in-joke placeholder, dus een naam in de quoted body is per definitie onbetrouwbaar.
   - `mailboxId: 111589`
   - `status: "active"` ← **ALTIJD active, NOOIT closed.** Een draft op een closed conversation is onvindbaar in de UI (staat apart in memory `feedback_createconversation_status.md`).
   - `draft: true`
   - Onderwerp: iets als "Beveiligingsmelding op je website — actie nodig"
   - Inhoud (voltooid verleden tijd):
     - Wat onze scanner heeft gevonden en waar
     - Dat de klant zelf verantwoordelijk is voor WP-beveiliging (verouderde plugins/themes/kernel zijn de grootste oorzaak)
     - Concrete aanbevelingen (updates draaien, admin accounts nalopen, wachtwoorden resetten, sterke plugin verwijderen/vervangen)
     - Aanbod om het onderhoudscontract af te sluiten zodat wij dit soort dingen standaard voor ze oppakken, met link naar <https://www.keurigonline.nl/wordpress-onderhoud>
     - Eventueel de melding dat we bij actieve dreiging al de file(s) hebben verwijderd (als dat het geval was), en dat de oorzaak nog wel onderzocht moet worden om herhaling te voorkomen
8. **Eindstatus van het Imunify-ticket:**
   - **False positive, duplicate, of zelf opgeruimd + draft naar klant klaar** → sluiten (`updateConversationStatus` closed). Skip Step 8 unassign.
   - **Klant moet nog actie ondernemen (geen contract, passieve dreiging)** → laat het ticket open. Tech note + draft-naar-klant zijn dan de artefacten die een collega kan reviewen en versturen. Loop Step 8 (unassign) zoals normaal.
   - **SSH lukte niet en je kon niks inspecteren** → laat open, tech note met wat een collega moet checken, Step 8 unassign.
   - **Nooit** sluiten EN tegelijk om follow-up vragen. Zie Step 5b "Critical rule".

### SSH access

De permanente triage-key `claude-triage-permanent` (ed25519, `/home/claude/.ssh/ko-triage`) staat geïnstalleerd op alle `cl*.keurigonline.nl` shared hosting servers. SSH is mogelijk voor elk account waarvan het pakket SSH toestaat (Plus, Pro, legacy L/XL/XXXL). Start en legacy S/M hebben geen SSH.

**Standaard verbinding:**
```bash
ssh -i /home/claude/.ssh/ko-triage -p 2020 <account>@cl<NN>.keurigonline.nl
```

Username is de DirectAdmin-accountnaam (bijv. `ahfot6162`), server is de cluster van dat account (te vinden via `drs.package-search(domain)` → product_name bevat vaak `cl*`, of via `fs_read grep /etc/virtual/domainowners`, of via DNS scan van een domein van de klant).

**Regels:**
- **Probeer ALTIJD direct SSH eerst, ongeacht welk pakket de klant heeft.** De key staat overal. De pakket-beperking op SSH (Start, legacy S/M) is een officieel policy, maar de praktijk wijkt soms af. De enige manier om zeker te weten of SSH werkt is het daadwerkelijk te proberen. Presumeer niet op basis van het DRS `product_name` dat SSH niet kan — draai het commando.
- **FABRICEER GEEN SSH TOEGANG.** Gebruik de KO API endpoint `adminssh/create` NOOIT. Die is kapot en crasht sshd op de server (tweemaal gebeurd op cl03, 2026-03-24 en 2026-03-26).
- **Als SSH niet werkt** (je probeerde het en kreeg een concrete error zoals `Permission denied`, `Connection refused`, `shell returned exit code 1`, `Account disabled`): stop met zelf proberen. Noteer de exacte foutmelding in de tech note, en ga direct door naar de @Anyone escalatie-note. **Besteed geen extra tokens aan het opsommen van commando's die een collega zou moeten draaien als dezelfde commando-set al in een eerder ticket voor ditzelfde account staat.** Schrijf dan: "Zie SSH-instructies in ticket #XXXXX." Als dit het eerste ticket voor dit account is, schrijf de commando-set eenmalig.
- **"Pakket zou geen SSH toelaten" is geen voldoende reden om niet te proberen.** De tech note moet altijd kunnen zeggen "ssh geprobeerd, gaf [exacte error]" of "ssh werkte, inspectie uitgevoerd". Nooit "niet geprobeerd want pakket M". Als `client-lookup` een pakket-type retourneert dat waarschijnlijk geen SSH heeft (Start, legacy S/M), vermeld dat als context: "Pakket Start — SSH waarschijnlijk niet beschikbaar. SSH toch geprobeerd, fout: [exacte error]."

**Hulp vragen aan een collega via een interne note:**

Gebruik `createNote` met een @Anyone mention en wees expliciet over wat je nodig hebt. Twee vormen zijn bruikbaar:

*Vorm A — vraag om SSH toegang te openen:*
```
@Anyone Kunnen jullie SSH toegang openen voor account <naam> op <server>?
Ik wil malware in <pad> inspecteren. Key-comment: claude-triage-permanent.
```

*Vorm B — vraag om een set read-only commando's te laten uitvoeren en de output terug te posten:*
```
@Anyone Zou iemand de volgende commando's kunnen uitvoeren als <user>@<server>
en de output in deze thread plakken?

  du -sh ~/domains/<domain>/public_html/
  find ~/domains/<domain>/public_html -name '*.php' -path '*/uploads/*.php'
  ls -la ~/domains/<domain>/public_html/wp-content/plugins/
  cat ~/<verdacht-bestand>

Alleen read-only, geen wijzigingen nodig.
```

Vorm B is de voorkeur voor simpele inspecties waarbij je geen interactieve shell nodig hebt, want dan hoeft er niks ingesteld te worden. Vorm A is voor situaties waar je echt zelf rond moet kunnen kijken of bestanden moet wijzigen.

**Urgentie en deadlines in @Anyone notes:**
- Voeg altijd een urgentie-indicatie toe: "Actie vereist binnen 24 uur" (security, actieve dreiging) of "Actie vereist binnen 48 uur" (passieve malware, non-critical).
- Bij een **3e recurrence of hoger** voor hetzelfde account: voeg tag `needs-human-urgent` toe naast `recurrence-escalated`, en begin de @Anyone note met: "ESCALATIE: [domein] — [N]e malware-melding zonder actie. Eerder geëscaleerd in #XXXXX, nog steeds niet opgepakt."

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
