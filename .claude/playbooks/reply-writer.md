# Reply Writer Playbook

Load when drafting a customer reply in Step 6 of /triage.

Sacred reply rules live in `memory/MEMORY.md` (Dutch, drafts-only, past tense, no em dash, no emojis, no signature, no offer-lines, `<br/>` HTML). This playbook adds the structure, templates, and context-specific rules.

## Create the draft

```
createReply(
  conversationId,
  text: "<html>",
  customer: <primaryCustomer.email>,
  draft: true,
  status: "closed"
)
```
Passing `status: closed` on a draft reply closes the ticket when the staff member sends the draft.

## Aanhef (opening)

### Start with name — ONLY when directly from `primaryCustomer.first`
"Hoi [voornaam]," or "Beste [voornaam],"

**Never derive a name from:**
- Tech notes
- Internal lineItems ("X assigned to you")
- Quoted email history
- Colleagues mentioned in threads
- Best-guess context

### If `primaryCustomer.first` empty/unknown/system-name
(e.g. "Imunify", "Cl05", "")

Use neutral, tijdsafhankelijke opening:
- "Goedemorgen," (06-12)
- "Goedemiddag," (12-18)
- "Goedenavond," (18-06)

Determined via `getServerTime`, geconverteerd naar Amsterdam-tijd (CET/CEST).

### Colleague-name sanity check
Als de naam matcht met een KO-collega (Ewoud, Maarten, Wouter, Pablo), **pauzeer en verifieer tegen `primaryCustomer.first`**. Een echte klant kan legitiem dezelfde voornaam hebben — de lijst is een warning, geen veto. Maar assumption-based greeting met collega-naam is bijna altijd bot pattern-matching op interne context i.p.v. customer object. Behandel als guilty until verified.

## Afsluiting (closing)

Op basis van dag + tijdstip via `getServerTime`, geconverteerd naar Amsterdam-tijd:
- **Maandag t/m donderdag**: "Fijne dag!" of korte succeswens passend bij onderwerp
- **Vrijdagmiddag/-avond (na 12:00)**: "Alvast een fijn weekend!"
- **Zaterdag**: "Fijn weekend!"
- **Zondag**: "Fijne zondag!"

**Controleer altijd de exacte dag via `getServerTime`** — reken NIET terug vanuit een eerdere aanroep. Een verkeerde daggroet ("Fijne zondag" op maandag) valt direct op bij de klant.

## Reply structure template

```
Hoi [naam],<br/><br/>

[Direct answer to their question]<br/><br/>

[Details/steps if needed]<br/><br/>

[Next steps or what they need to do]<br/><br/>

[Afsluiting — dag/tijd-afhankelijk]
```

HTML-tags:
- `<br/>` voor newlines, `<br/><br/>` tussen alinea's (geen `<p>` — die renderen geen spacing in Help Scout)
- `<code>` voor technische waarden (IPs, domeinen, commando's, paths)
- `<strong>` voor nadruk
- **Geen em dash** (—) — vervang door komma, punt of herformuleer

## Email setup links (in replies)

- **Setup guide page**: `https://keurigonline.nl/email-instellen/?email=<email>` — per-client instructies met vooringevuld adres
- **Webmail**: gebruik de `redirect_url` uit de webmail API (step 4b van triage), niet een gegokte URL

**ALTIJD** de email config API aanroepen voor IMAP/SMTP settings — hostnames variëren per cluster (`cl07.keurigonline.nl`, `private.keurigonline.nl`, etc.). NOOIT `mail.domain.nl` hardcoden.

## Email forwarding naar Gmail — known issue (March 2026)

- Gmail forwarding breekt voor senders met strict DMARC (`p=reject`/`quarantine`)
- Gmail POP "Check mail from other accounts" wordt deprecated in 2026 — **NIET aanbevelen**
- Aanbeveling in replies:
  - IMAP in mail client (Outlook, Apple Mail, Thunderbird)
  - Gmail app op mobiel (ondersteunt nog IMAP)
  - Webmail
- Altijd email config API checken vóór IMAP/SMTP details in reply

## Openstaande factuur die klant zegt te hebben betaald

Klanten betalen via iDEAL (direct) of bankoverschrijving (1-3 werkdagen vertraging). Als een klant zegt "ik heb al betaald" en `drs.invoice-search(client_id, status: 0)` toont de factuur nog open, is default **niet** dat de betaling is mislukt — meestal een bankoverschrijving onderweg. Eerst `drs.client-get.direct_debit`-check: bij `true` géén betaallink aanbieden (auto-incasso).

### ❌ Nooit stellig
- "De betaling is niet binnengekomen"
- "Mogelijk is de betaling niet correct afgerond"

Dit alarmeert onnodig en leidt tot dubbele betalingen.

### ✅ Wel
> "De betaling van factuur X is op dit moment nog niet zichtbaar in ons systeem. Als je per bankoverschrijving hebt betaald, kan het 1 tot 3 werkdagen duren voordat de betaling bij ons verwerkt is. In dat geval hoef je verder niks te doen."

Daarna **optioneel** iDEAL-betaallink als alternatief: "Wil je het liever direct afronden?" — niet als enige optie.

Ook voor proactieve betalingsherinneringen: eerst bankoverschrijving-disclaimer, dán betaallink.

## Upsell — WordPress Onderhoudscontract (subtiel)

Bij WP-gerelateerde tickets (503, gehackt, outdated plugins, traag, WooCommerce, pre-sales WP):
- Noem het WordPress Onderhoudscontract als **optie**, geen push
- Link: https://www.keurigonline.nl/wordpress-onderhoud
- Geen specifiek pakket/prijs noemen — laat klant zelf kiezen
- Niet in elk ticket — alleen als er een duidelijke link is (recurring issue, security)

## Tone

- Concise en behulpzaam — niet uitgebreid uitleggen wat de klant al weet
- Klant-perspectief: wat moeten ze doen, niet wat wij hebben gedaan (al staat dat er ook in VVT)
- Link naar KB artikels indien relevant (`https://help.keurigonline.nl/article/...`)
- Geen afsluitzinnen zoals "Mocht je verder nog vragen hebben..." (sacred rule 7 — redundant, staat al in auto-signature)
