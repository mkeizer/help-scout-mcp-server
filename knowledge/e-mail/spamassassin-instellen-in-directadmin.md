# SpamAssassin instellen in DirectAdmin

> Bron: https://help.keurigonline.nl/article/67-spamassassin-instellen-in-directadmin

SpamAssassin is een open-source spamfilter dat binnenkomende e-mails beoordeelt op spamkenmerken. Elke e-mail krijgt een score: hoe hoger de score, hoe groter de kans dat het spam is. In DirectAdmin kun je zelf instellen wat er met spam gebeurt.

## SpamAssassin inschakelen

1. Log in op DirectAdmin via `https://jedomeinnaam.nl:2222`
2. Klik in de navigatiebalk op **Spamassassin instellen**
3. Als SpamAssassin nog niet actief is, klik je op de groene knop **SpamAssassin Inschakelen**

## Basisinstellingen

### Waar moet de spam heen? (Blocking strategy)

| Optie | Wat het doet | Aanbevolen? |
|-------|-------------|-------------|
| **Inbox** | Spam wordt niet geblokkeerd en komt gewoon in je inbox | Nee |
| **Main Spambox** | Spam gaat naar de algemene spammap van je hoofd-IMAP-account | Nee |
| **User Spambox** | Spam gaat naar de spammap van het betreffende e-mailaccount | ✅ Ja |
| **Delete** | Spam wordt direct verwijderd van de server | Nee — je kunt legitieme mails kwijtraken |

**Aanbevolen: User Spambox.** Zo belandt spam in de spammap van het juiste e-mailaccount en kun je af en toe controleren of er geen legitieme mail tussen zit.

### Hoge score blok (High score block)

Naast de normale spamfilter kun je instellen dat e-mails met een zeer hoge spamscore automatisch verwijderd worden. Dit is bedoeld voor overduidelijke spam.

| Optie | Wat het doet |
|-------|-------------|
| **Nee** | Gebruik alleen de globale drempel — alles wat als spam wordt gemarkeerd gaat naar de spammap |
| **Ja** | E-mails met een score hoger dan de ingestelde drempel worden automatisch verwijderd |

**Aanbevolen: Ja, met een drempel van 9.** Zo worden alleen overduidelijke spam-mails verwijderd. Stel deze waarde niet te laag in (bijv. 5), want dan kunnen legitieme mails zoals nieuwsbrieven en mailings ook verwijderd worden zonder dat je het merkt.

⚠️ **Let op:** bij een drempel van 5 worden veel marketing-mails en nieuwsbrieven automatisch verwijderd. Dit is een veelvoorkomende oorzaak van "ik ontvang geen mails meer van...".

## Geavanceerde instellingen

### Globale drempel (Global threshold)

| Optie | Score | Effect |
|-------|-------|--------|
| **Laag** | 5.0 | Strenger — meer spam geblokkeerd, maar ook meer kans op fout-positieven |
| **Medium** | 10.0 | Losser — meer spam komt door, minder kans op fout-positieven |
| **Hoog** | 15.0 | Zeer los — bijna alles wordt doorgelaten |
| **Custom** | Zelf instellen | Fijnafstemming mogelijk |

**Aanbevolen: Laag (5.0).** Dit is de standaardinstelling en biedt een goede balans tussen spambescherming en het doorlaten van legitieme mail.

### Onderwerp herschrijven (Rewrite subject)

Als deze optie is ingeschakeld, wordt het onderwerp van spam-mails voorzien van een label zoals `*****SPAM*****`. Hierdoor kun je in je mailprogramma eenvoudig een filter aanmaken.

**Aanbevolen: Ja**, met het standaard label `*****SPAM*****`.

### Spam bezorging (Spam delivery)

| Optie | Wat het doet |
|-------|-------------|
| **Geen bijlagen** | SpamAssassin voegt alleen extra headers toe aan de e-mail, de inhoud blijft ongewijzigd |
| **Bijlagen gebruiken** | De originele spam-mail wordt als bijlage (message/rfc822) bijgevoegd in een nieuw rapport. Veiliger, want de originele mail wordt niet direct geopend |
| **Tekst-bijlagen** | Zelfde als hierboven, maar als text/plain. Nodig bij sommige mailprogramma's die bijlagen automatisch openen |

**Aanbevolen: Bijlagen gebruiken.** Dit is de veiligste optie: de originele spam wordt bewaard maar niet automatisch geopend.

## Whitelist en blacklist

### Whitelist (altijd doorlaten)

E-mailadressen op de whitelist worden nooit als spam gemarkeerd, ongeacht hun spamscore. Handig voor afzenders die onterecht als spam worden gefilterd.

Voorbeelden:
- `*@keurigonline.nl` — alle mail van KeurigOnline doorlaten
- `*@nieuwsbrief.nl` — alle mail van een specifiek domein doorlaten
- `jan@voorbeeld.nl` — een specifiek adres doorlaten

### Blacklist (altijd blokkeren)

E-mailadressen op de blacklist worden altijd als spam aangemerkt, ongeacht hun inhoud.

Voorbeelden:
- `*@spamdomain.com` — alle mail van een domein blokkeren
- `*.icu` — alle mail van .icu-domeinen blokkeren (veelgebruikt door spammers)

### Bayes-gegevens

SpamAssassin leert na verloop van tijd welke mails spam zijn en welke niet (Bayesiaans filter). Via de knop **Delete Data** kun je deze geleerde gegevens wissen. Dit maakt wat schijfruimte vrij, maar reset ook het leerproces van SpamAssassin.

**Tip:** gebruik deze optie alleen als SpamAssassin structureel verkeerde beslissingen neemt. Normaal gesproken hoef je dit niet aan te raken.

## Onze aanbevolen instellingen

| Instelling | Aanbevolen waarde |
|------------|-------------------|
| Waar moet de spam heen? | User Spambox |
| Hoge score blok | Ja, drempel **9** |
| Globale drempel | Laag (5.0) |
| Onderwerp herschrijven | Ja — `*****SPAM*****` |
| Spam bezorging | Bijlagen gebruiken |

## Veelvoorkomende problemen

### Ik ontvang geen nieuwsbrieven of mailings meer
Controleer de instelling **Hoge score blok**. Als deze op een lage waarde staat (bijv. 5), worden nieuwsbrieven en marketing-mails mogelijk automatisch verwijderd. Verhoog de drempel naar **9** en voeg de afzender toe aan de **whitelist**.

### Ik krijg nog steeds veel spam
Controleer of SpamAssassin is ingeschakeld en of de globale drempel op **Laag (5.0)** staat. Voeg terugkerende spamafzenders toe aan de **blacklist**.

### Legitieme mail wordt als spam gemarkeerd
Voeg het e-mailadres of domein van de afzender toe aan de **whitelist**. Gebruik het formaat `*@domein.nl` om alle mail van dat domein door te laten.

## Gerelateerde artikelen

- [Waarom krijg ik geen e-mail binnen?](waarom-krijg-ik-geen-e-mail-binnen.md)
- [Hoe stel ik SPF, DKIM en DMARC in?](hoe-stel-ik-spf-dkim-en-dmarc-in.md)
