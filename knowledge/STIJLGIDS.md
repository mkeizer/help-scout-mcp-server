# KeurigOnline Kennisbank.Stijlgids

Deze stijlgids beschrijft de standaard structuur, toon en opmaak voor alle kennisbank-artikelen op help.keurigonline.nl.

---

## Doel

Elke klant moet binnen 2 minuten het antwoord op zijn vraag vinden. Artikelen zijn geen blogposts, maar bondige handleidingen.

---

## Artikelstructuur (template)

Elk artikel volgt dit vaste sjabloon:

```markdown
# [Titel als vraag of kort statement]

[1-2 zinnen: wat is het probleem, of wat ga je leren in dit artikel]

## [Optioneel: uitleg/achtergrond]

Korte uitleg als context nodig is. Maximaal 3-4 zinnen.

## Stappenplan

1. **Staptitel**.korte uitleg van wat je doet
2. **Staptitel**.korte uitleg
3. **Staptitel**.korte uitleg

## Resultaat

[1-2 zinnen: wat is het verwachte resultaat na het volgen van de stappen]

## Gerelateerde artikelen

- [Gerelateerd artikel 1](link-naar-artikel)
- [Gerelateerd artikel 2](link-naar-artikel)
```

### Wanneer welke secties?

| Sectie | Verplicht? | Wanneer gebruiken |
|--------|-----------|-------------------|
| Titel (H1) | Ja | Altijd |
| Intro (1-2 zinnen) | Ja | Altijd |
| Uitleg/achtergrond | Nee | Alleen als context nodig is |
| Stappenplan | Ja* | Bij how-to artikelen |
| Oorzaak + Oplossing | Ja* | Bij troubleshooting artikelen |
| Resultaat | Nee | Bij how-to's waar het resultaat niet vanzelfsprekend is |
| Gerelateerde artikelen | Ja | Altijd minimaal 1-2 links |

*Kies het format dat past bij het type artikel (how-to of troubleshooting).

---

## Twee artikeltypes

### Type 1: How-to (handleiding)

Voor stap-voor-stap instructies. Gebruik genummerde stappen.

**Voorbeeld:**
```markdown
# Hoe maak ik een e-mailadres aan?

In DirectAdmin kun je eenvoudig een nieuw e-mailadres aanmaken voor je domeinnaam.

## Stappenplan

1. **Log in op DirectAdmin**.ga naar https://jouwdomein.nl:2222
   en log in met je gebruikersnaam en wachtwoord.

2. **Ga naar E-mail Accounts**.klik in het menu op
   E-mail Management en vervolgens op E-mail Accounts.

3. **Maak het account aan**.klik op Create Account,
   vul de gewenste gebruikersnaam en een sterk wachtwoord in,
   en klik op Create.

## Resultaat

Je nieuwe e-mailadres is direct actief. Je kunt het nu instellen
in je mailprogramma of openen via webmail.

## Gerelateerde artikelen

- [Hoe kan ik mijn e-mail lezen in een e-mail client?](../e-mail/hoe-kan-ik-mijn-e-mail-lezen-in-een-e-mail-client.md)
- [Hoe kan ik mijn e-mail lezen in webmail?](../e-mail/hoe-kan-ik-mijn-e-mail-lezen-in-webmail.md)
- [Hoe wijzig ik het wachtwoord van mijn mailbox?](../e-mail/hoe-wijzig-ik-het-wachtwoord-van-mijn-mailbox.md)
```

### Type 2: Troubleshooting (probleemoplossing)

Voor foutmeldingen en problemen. Gebruik het patroon: herkenning, oorzaak, oplossing.

**Voorbeeld:**
```markdown
# Waarom kan ik geen e-mail versturen?

Er zijn verschillende redenen waarom het versturen van e-mail
niet lukt. In dit artikel doorlopen we de meest voorkomende
oorzaken en oplossingen.

## Hoe herken je dit probleem?

Je krijgt een foutmelding bij het versturen, of je e-mail
komt niet aan bij de ontvanger.

## Mogelijke oorzaken

- **Verkeerde SMTP-instellingen**.controleer of je poort 465
  (SSL) of 587 (STARTTLS) gebruikt.
- **Wachtwoord gewijzigd**.als je wachtwoord recent is aangepast,
  moet je dit ook bijwerken in je mailprogramma.
- **Verzendlimiet bereikt**.op shared hosting geldt een
  verzendlimiet van 200 e-mails per uur.

## Oplossing

1. **Controleer je SMTP-instellingen**.gebruik poort 465 met SSL
   of poort 587 met STARTTLS.
2. **Stel je wachtwoord opnieuw in**.doe dit via DirectAdmin
   onder E-mail Accounts.
3. **Neem contact op**.als het probleem aanhoudt, neem contact
   op met onze helpdesk.

## Gerelateerde artikelen

- [Hoe kan ik mijn e-mail lezen in een e-mail client?](../e-mail/hoe-kan-ik-mijn-e-mail-lezen-in-een-e-mail-client.md)
- [Waarom krijg ik geen e-mail binnen?](../e-mail/waarom-krijg-ik-geen-e-mail-binnen.md)
```

---

## Toon en taalgebruik

### Aanspreekvorm

- Altijd **je/jij** (nooit "u" of "uw")
- Spreek de lezer direct aan: "Log in op DirectAdmin" (niet "Er moet ingelogd worden")
- Gebruik "we" voor KeurigOnline: "We raden aan..." / "Op onze servers..."

### Schrijfstijl

- **Kort en bondig.** Maximaal 1 scrolpagina per artikel.
- **Actieve zinnen.** "Klik op Opslaan" (niet "Er dient op Opslaan geklikt te worden").
- **Geen jargon zonder uitleg.** Leg technische termen uit bij eerste gebruik.
- **Geen emoji's** in artikeltekst of headers.
- **Geen em dash (—).** Gebruik een punt, dubbelepunt of komma. De em dash ziet er onnatuurlijk uit in Nederlandse tekst.
- **Geen aanhalingstekens als HTML entity** (`&#39;`). Gebruik gewoon `'`.

### Titels

- Formuleer als **vraag** waar mogelijk: "Hoe maak ik een subdomein aan?"
- Of als **kort statement** bij troubleshooting: "Mijn website lijkt gehackt te zijn"
- Geen leestekens behalve `?` bij vragen

### Links en verwijzingen

- Link naar **Mijn KeurigOnline** altijd als: `[Mijn KeurigOnline](https://mijn.keurigonline.nl)`
- Link naar **DirectAdmin** altijd als: `https://jouwdomein.nl:2222`
- Verwijs naar andere KB-artikelen met hun volledige titel
- Gebruik relatieve paden in de lokale markdown-kopie

---

## Opmaakregels

### Stappen

- Gebruik **genummerde lijsten** voor procedures (1, 2, 3...)
- Gebruik **bullets** alleen voor opsommingen zonder volgorde
- Elke stap begint met een **vetgedrukte actie** gevolgd door een punt: `1. **Log in op DirectAdmin.** Ga naar...`

### Kopjes

- H1 (`#`).alleen de titel, eenmalig
- H2 (`##`).hoofdsecties (Stappenplan, Oorzaak, Oplossing, etc.)
- H3 (`###`).subsecties binnen een H2
- Gebruik NOOIT `**bold tekst**` als vervanging voor een kopje

### Code en configuratie

- Gebruik codeblokken (```) voor: commando's, configuratiebestanden, foutmeldingen
- Gebruik inline code (`) voor: bestandsnamen, paden, poorten, domeinnamen
- Geef altijd aan welke taal het is: ```php, ```bash, etc.

### Help Scout Docs HTML-opmaak

Help Scout Docs gebruikt HTML, niet Markdown. Bij het publiceren via de Docs API gelden deze regels:

#### Code blocks

- Gebruik `<pre>...</pre>` (ZONDER `<code>`-tag). Help Scout rendert `<pre><code>` zonder newlines.
- Newlines in `<pre>` worden correct weergegeven.
- Voor inline code: gebruik `<code>...</code>`

```html
<!-- GOED -->
<pre>define('DISABLE_WP_CRON', true);</pre>

<!-- FOUT — geen newlines -->
<pre><code>define('DISABLE_WP_CRON', true);</code></pre>
```

#### Lijsten (ol/ul)

- Gebruik `<br/>` na de `<strong>`-actie, zodat de uitleg op een nieuwe regel begint:

```html
<ol>
<li><strong>Log in op DirectAdmin.</strong><br/>Ga naar https://jouwdomein.nl:2222</li>
<li><strong>Ga naar Cron Jobs.</strong><br/>Klik op Advanced Features</li>
</ol>
```

#### Geneste lijsten (ul in ol)

- Gebruik `<br/>` na de `<strong>`-actie, gevolgd door de `<ul>`:

```html
<ol>
<li><strong>Configureer Redis.</strong><br/>Stel de volgende waarden in:
<ul>
<li><strong>Object Cache:</strong> On</li>
<li><strong>Method:</strong> Redis</li>
</ul>
</li>
</ol>
```

#### Kopjes

- Gebruik alleen `<h2>` voor hoofdsecties. Vermijd `<h3>` omdat Help Scout die als aparte items toont in de "Op deze pagina"-sidebar.
- Gebruik `<strong>` binnen tekst voor sub-onderscheid waar nodig.

### Afbeeldingen

- Gebruik afbeeldingen alleen als tekst niet volstaat
- Voeg een korte beschrijving toe als alt-tekst
- Host op `static.keurigonline.nl` (niet op externe diensten)

---

## Standaard verwijzingen

Deze links/teksten komen vaak terug. Gebruik ze consistent:

| Onderwerp | Standaard formulering |
|-----------|----------------------|
| DirectAdmin openen | "Log in op DirectAdmin via `https://jouwdomein.nl:2222`" |
| Mijn KeurigOnline | "Log in op [Mijn KeurigOnline](https://mijn.keurigonline.nl)" |
| Wachtwoord resetten | "Stel je wachtwoord opnieuw in via [Mijn KeurigOnline](https://mijn.keurigonline.nl) onder **Pakketten**" |
| Contact opnemen | "Neem contact op met onze helpdesk via support@keurigonline.nl" |
| WordPress onderhoud upsell | "Met een [WordPress onderhoudscontract](https://www.keurigonline.nl/wordpress-onderhoud) (vanaf €20/mnd) nemen we dit soort werk uit handen." |
| VPS alternatief | "Dit is wel mogelijk op een eigen VPS. Neem contact op om de mogelijkheden te bespreken." |

---

## Upsell-regels

Subtiel, niet opdringerig. Alleen waar relevant:

- **WordPress onderhoudscontract**.bij: terugkerende problemen, gehackte sites, performance, verouderde plugins
- **VPS**.bij: features die niet op shared hosting beschikbaar zijn (SSH, Cloudflare, etc.)
- **Verhuisservice**.bij: artikelen over verhuizen of nieuwe klanten

Formulering: altijd als laatste sectie, maximaal 1 zin + link.

---

## Checklist voor nieuwe/herziene artikelen

Voordat een artikel live gaat:

- [ ] Volgt de template (intro, stappen/oorzaak+oplossing, gerelateerd)
- [ ] Gebruikt "je/jij" (niet "u")
- [ ] Geen `&#39;` of andere HTML entities
- [ ] Geen emoji's in tekst of headers
- [ ] Geen em dashes (—)
- [ ] Genummerde stappen bij procedures
- [ ] Minimaal 2 gerelateerde artikelen gelinkt (via `related` field)
- [ ] Maximaal 1 scrolpagina lang (of opgesplitst)
- [ ] Kopjes zijn H2 (niet H3, niet bold-als-kopje)
- [ ] Links naar Mijn KeurigOnline en DirectAdmin zijn consistent
- [ ] Geen relatieve markdown-paden (`../`, `.md`) in de HTML
- [ ] Code blocks gebruiken `<pre>` (zonder `<code>`)
- [ ] Lijststappen gebruiken `<br/>` na `<strong>`
- [ ] Afbeeldingen gehost op static.keurigonline.nl
- [ ] Bron-URL klopt en artikel is published in Help Scout

---

## Artikellengte-richtlijn

| Type | Ideale lengte |
|------|--------------|
| Korte FAQ | 5-15 regels |
| How-to handleiding | 20-50 regels |
| Troubleshooting | 20-40 regels |
| Uitgebreide tutorial | Opsplitsen in meerdere artikelen |

Het WordPress-installatieartikel (157 regels, 7 hoofdstukken) is een voorbeeld van wat opgesplitst moet worden in aparte artikelen.

---

## Categorie-indeling

Artikelen horen in maximaal 1-2 categorieën. De primaire categorie bepaalt de lokale mapstructuur.

| Categorie | Wanneer |
|-----------|---------|
| Administratief | Facturen, betalingen, gegevens wijzigen |
| DirectAdmin | Functies en instellingen binnen DirectAdmin |
| Domeinnamen | Registratie, verhuizing, DNS, SSL |
| E-mail | Aanmaken, instellen, problemen met e-mail |
| Mijn KeurigOnline | Functies van het klantenportaal |
| Technisch | FTP, PHP, databases, WordPress, server-gerelateerd |
