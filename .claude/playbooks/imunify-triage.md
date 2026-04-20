# Imunify Alert Playbook

Load this when a ticket is an Imunify malware alert (sender `cl0*@keurigonline.nl`, subject contains malware/scan markers).

## Role & responsibility

Imunify alerts zijn **interne scan-rapporten**, geen klanttickets. De "klant" is de server, niet de eigenaar van het account.

**Onze rol: bewustwording, niet opruimdienst.** KeurigOnline is een webhostingbedrijf. Zonder WordPress Onderhoudscontract is WP-beveiliging de verantwoordelijkheid van de klant zelf. Default bij een Imunify alert: klant informeren + onderhoudscontract aanbieden, niet zelf opruimen.

**Uitzonderingen waarin we wél zelf opruimen:**
- **Actieve dreiging** (cryptominer hoge CPU, mass-mailer, actieve webshell) — server-hygiëne, ongeacht contract
- **Klant heeft WordPress Onderhoudscontract** — dan valt opruimen onder de service
- **Klant heeft expliciet om hulp gevraagd** in eerder ticket of follow-up

## Workflow

### 1. Lees het alert
Welk account, welke bestanden, welke server, hoe vaak gerapporteerd.

### 2. Zoek eerdere tickets
Imunify rapporteert hetzelfde bestand bij elke scan. Search op accountnaam/domein. Als er al een open ticket voor hetzelfde bestand is → **duplicate, sluit dit ticket**.

### 3. Probeer SSH
Probeer **altijd**, ook bij pakket dat officieel geen SSH heeft. Concludeer pas "geen SSH" bij concrete error. Zie `ssh-access.md` playbook.

Op de SSH-shell:
- `file <path>` + `head <path>` om bestand te classificeren
- WP core verify-checksums (als WordPress)
- `wp plugin list` + `wp user list`
- Scan `uploads/` op meer verdachte bestanden

### 4. Classificeer

| Classificatie | Kenmerken |
|--------------|-----------|
| **Actieve dreiging** | Cryptominer (ELF binary, hoge CPU), mass-mailer, actieve webshell die verkeer ontvangt |
| **Passieve webshell/backdoor** | Aanwezig maar geen aangetoonde actieve uitbuiting |
| **Nulled plugin** | License bypass, geen actieve hack |
| **False positive** | Bestand weg, ruis (`.config/htop/defunct`), legitieme code |
| **Duplicate** | Zelfde bestand al in ander Imunify ticket behandeld |

### 5. Actie per classificatie

- **Actieve dreiging → zelf opruimen** (`rm <bestand>` via SSH) ongeacht contract
- **Passieve webshell / nulled / "gewone" malware → NIET zelf opruimen** tenzij contract of expliciete vraag
- **False positive → geen actie**, alleen documenteren
- **Duplicate → geen actie**, verwijs naar origineel ticket-ID

### 6. Tech note

Bestanden + classificatie + SSH uitkomst (exact) + wat je wel/niet gedaan hebt + reden.

### 7. Klant informeren (bewustwording)

Niet bij false positive of duplicate. Gebruik `createConversation`:

**`customer` (ontvanger-email) — prioriteitsvolgorde:**
1. **WordPress admin-email** via SSH: `wp --path=~/domains/<domein>/public_html user list --role=administrator --format=csv --fields=user_email,user_login` — pak het eerste admin-adres dat NIET `@cl0*.keurigonline.nl` of `@keurigonline.nl` is
2. **KO account-email** via `drs.package-search(domain)` → `client_id` → `drs.client-get.email` (of eerste `all_emails`). Werkt ook zonder SSH en zonder account-naam
3. **HS search** alleen als DRS niks heeft: `comprehensiveConversationSearch` op het domein → haal `primaryCustomer.email` uit meest recente klanticket (niet een Imunify-alert)
4. **NOOIT** `primaryCustomer.email` van het Imunify-ticket zelf — dat is `cl0*@keurigonline.nl`, de scanner
5. **Geen van bovenstaande** → geen draft. Tech note "ontvanger onbekend via WP-admin + DRS + HS search — collega moet via DA-panel opzoeken" + Step 8 unassign

**`customer.first` / aanhef** — `drs.client-get.name` (split op spatie voor first) als bekend, anders neutrale tijdsafhankelijke groet. NOOIT een naam uit quoted body van DRS/Imunify/forwards — ons DRS adresseert alle verificatie-mails aan "Ewoud Hoitsma" als placeholder.

**Andere velden:**
- `mailboxId: 111589`
- `status: "active"` ← ALTIJD active, NOOIT closed (draft op closed = onvindbaar)
- `draft: true`
- Subject: "Beveiligingsmelding op je website — actie nodig"

**Inhoud (voltooid verleden tijd):**
- Wat onze scanner heeft gevonden en waar
- Klant zelf verantwoordelijk voor WP-beveiliging (verouderde plugins/themes/kernel is de grootste oorzaak)
- Concrete aanbevelingen: updates draaien, admin accounts nalopen, wachtwoorden resetten, verdachte plugin verwijderen
- Aanbod onderhoudscontract met link naar https://www.keurigonline.nl/wordpress-onderhoud
- Indien actieve dreiging al opgeruimd: melden + dat oorzaak onderzocht moet worden

### 8. Eindstatus Imunify-ticket

- **False positive / duplicate / zelf-opgeruimd + draft klaar** → sluiten (`updateConversationStatus` closed). Skip unassign.
- **Klant moet actie ondernemen (geen contract, passieve dreiging)** → laat open, unassign (Step 8 normaal).
- **SSH lukte niet** → open, tech note met wat collega moet checken, unassign.
- **Nooit** sluiten EN om follow-up vragen — kies één.
