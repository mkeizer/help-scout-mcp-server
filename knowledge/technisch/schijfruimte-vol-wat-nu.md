# Schijfruimte vol, wat nu?

> Bron: https://help.keurigonline.nl/article/151-schijfruimte-vol-wat-nu

Als je pakket vol zit, kan dat verschillende gevolgen hebben: je website geeft een foutmelding (503), je kunt geen e-mail meer ontvangen, of je kunt geen bestanden meer uploaden.

## Wat neemt de meeste ruimte in?

De schijfruimte wordt gedeeld door drie onderdelen:

- **Website bestanden** — websitebestanden, afbeeldingen, plugins, thema's
- **E-mail** — alle e-mails in je mailboxen (inclusief bijlagen)
- **Backups** — automatische backups van Installatron (de map `application_backups`)

Vaak zijn het de **Installatron backups** die ongemerkt veel ruimte innemen.

## Ruimte vrijmaken

### 1. Installatron backups opruimen (vaak de grootste winst)

1. Log in op DirectAdmin: `https://jouwdomein.nl:2222`
2. Ga naar **Extra Programma's** → **Installatron**
3. Klik op je applicatie → tabblad **Backups**
4. Verwijder oude backups
5. Stel backup-rotatie in (maximaal 2-3 bewaren)

Meer details: [Schijfruimte vol door Installatron backups](schijfruimte-vol-installatron-backups-application-backups.md)

### 2. Oude e-mails verwijderen

Via [webmail.keurigonline.nl](https://webmail.keurigonline.nl), vooral berichten met grote bijlagen. Prullenbak legen.

### 3. Ongebruikte website bestanden opruimen

Via Bestandsbeheerder of FTP: ongebruikte thema's, plugins, oude media, cache en logbestanden.

## Structurele oplossing: upgraden

| Pakket | Schijfruimte | Prijs/maand (excl. BTW) |
|--------|-------------|------------------------|
| Start | 5 GB | €3,95 |
| Plus | 50 GB | €7,95 |
| Pro | 100 GB | €14,95 |

Upgraden via [Mijn KeurigOnline](https://mijn.keurigonline.nl/diensten/pakketten).

## Gerelateerde artikelen

- [Schijfruimte vol door Installatron backups (application_backups)](schijfruimte-vol-installatron-backups-application-backups.md)
- [Welk hostingpakket past bij mij?](../administratief/welk-hostingpakket-past-bij-mij.md)
