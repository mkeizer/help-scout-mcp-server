# Hoe stel ik SPF, DKIM en DMARC in?

> Bron: https://help.keurigonline.nl/article/143-hoe-stel-ik-spf-dkim-en-dmarc-in

SPF, DKIM en DMARC zijn drie DNS-records die samen bepalen of een e-mail echt van jouw domein afkomstig is. Zonder deze records kan je mail in de spamfolder van de ontvanger belanden, of zelfs helemaal geweigerd worden.

## Wat doen ze?

- **SPF** vertelt ontvangende mailservers welke servers e-mail mogen versturen namens jouw domein.
- **DKIM** voegt een digitale handtekening toe aan je e-mails, zodat de ontvanger kan controleren dat het bericht onderweg niet is gewijzigd.
- **DMARC** bepaalt wat er moet gebeuren met e-mails die niet door de SPF- of DKIM-controle komen (doorlaten, in quarantaine plaatsen of weigeren).

## SPF instellen

Voeg een TXT-record toe aan de DNS-zone van je domein. Waar je dit doet, hangt af van waar je nameservers staan:

- **Nameservers bij KeurigOnline:** beheer je DNS via [Mijn KeurigOnline](https://mijn.keurigonline.nl) > **Mijn domeinen** > **Beheren** > **DNS Beheren**.
- **Externe nameservers** (bijv. Cloudflare, TransIP, Versio): beheer je DNS bij die partij.

Maak een TXT-record aan met de volgende waarden:

| Naam | Type | Waarde |
|------|------|--------|
| `@` | TXT | `v=spf1 include:_spf.keurigonline.nl ~all` |

Dit record bevat alle mailservers van KeurigOnline die e-mail mogen versturen namens jouw domein.

**Gebruik je ook een externe maildienst?** Voeg dan de SPF-include van die dienst toe. Voorbeelden:

- Google Workspace: `v=spf1 include:_spf.keurigonline.nl include:_spf.google.com ~all`
- Microsoft 365: `v=spf1 include:_spf.keurigonline.nl include:spf.protection.outlook.com ~all`
- SMTP2GO: `v=spf1 include:_spf.keurigonline.nl include:spf.smtp2go.com ~all`

**Let op:** je mag maximaal een SPF-record per domein hebben. Combineer alles in een record.

## DKIM instellen

Bij KeurigOnline wordt DKIM automatisch gegenereerd op de mailserver. Hoe je het DKIM-record in je DNS krijgt, hangt af van waar je nameservers staan.

### Nameservers bij KeurigOnline

Als je nameservers op KeurigOnline staan (standaard), dan wordt het DKIM-record **automatisch** aangemaakt in je DNS-zone. Je hoeft hier zelf niets voor te doen.

Je kunt controleren of DKIM actief is:

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222`.
2. **Ga naar DNS-beheer.** Navigeer naar **Extra Programma's > DNS Beheer**.
3. **Zoek het DKIM-record.** Je ziet een TXT-record met de naam `x._domainkey` en een lange waarde die begint met `v=DKIM1`.

**DKIM niet aanwezig?** Neem contact op met onze helpdesk via support@keurigonline.nl. Wij activeren DKIM voor je.

### Externe nameservers (bijv. Cloudflare, TransIP)

Als je domein op externe nameservers staat maar je gebruikt de mailserver van KeurigOnline, dan moet je het DKIM-record **handmatig kopieren** naar je externe DNS-provider. De DKIM-sleutel wordt namelijk gegenereerd op onze mailserver, maar je DNS-zone wordt elders beheerd.

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222`.
2. **Ga naar DNS-beheer.** Navigeer naar **Extra Programma's > DNS Beheer**.
3. **Kopieer het DKIM-record.** Zoek het TXT-record met de naam `x._domainkey`. Kopieer de volledige waarde (begint met `v=DKIM1; k=rsa; p=...`).
4. **Voeg het record toe bij je DNS-provider.** Maak een nieuw TXT-record aan:

   | Naam | Type | Waarde |
   |------|------|--------|
   | `x._domainkey` | TXT | de gekopieerde DKIM-sleutel |

**Let op:** als het DKIM-record niet zichtbaar is in DirectAdmin, neem dan contact op met onze helpdesk. Wij genereren de sleutel en sturen hem naar je op zodat je die bij je DNS-provider kunt toevoegen.

## DMARC instellen

Voeg een TXT-record toe aan je DNS-zone (via Mijn KeurigOnline of je externe DNS-provider):

| Naam | Type | Waarde |
|------|------|--------|
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@jouwdomein.nl` |

**Kies je beleid.** De waarde `p=none` is een goed startpunt. Dit monitort alleen, zonder mail te blokkeren. Later kun je verscherpen:

- `p=none` : alleen rapporteren (aanbevolen om mee te starten)
- `p=quarantine` : verdachte mail naar spam
- `p=reject` : verdachte mail weigeren

**Tip:** begin altijd met `p=none` en bekijk de rapporten. Pas na een paar weken kun je veilig verscherpen naar `quarantine` of `reject`.

## Controleren of het werkt

Gebruik [mail-tester.com](https://www.mail-tester.com) om je e-mailconfiguratie te testen:

1. **Ga naar mail-tester.com.** Je krijgt een uniek e-mailadres te zien (bijvoorbeeld `test-abc123@srv1.mail-tester.com`).
2. **Stuur een testmail.** Verstuur een e-mail vanaf je eigen domein naar dat adres.
3. **Bekijk je score.** Klik op "Then check your score" en je krijgt een rapport met een score van 0 tot 10. De test controleert onder andere:

   - Of je SPF-record correct is ingesteld
   - Of je DKIM-handtekening geldig is
   - Of je DMARC-beleid actief is
   - Of je IP-adres op een blacklist staat

Een score van 9 of hoger betekent dat je e-mailconfiguratie in orde is.

## Gerelateerde artikelen

- [DNS-records (A, AAAA, CNAME, MX, TXT)](../uncategorized/dns-records-a-aaaa-cname-mx-txt.md)
- [Hoe beheer ik mijn DNS-records?](../mijn-keurigonline/hoe-beheer-ik-mijn-dns-records.md)
- [Waarom kan ik geen e-mail versturen?](waarom-kan-ik-geen-e-mail-versturen.md)
- [Hoe koppel ik een extern domein aan mijn KeurigOnline-pakket?](../uncategorized/extern-domein-koppelen-aan-je-pakket.md)
