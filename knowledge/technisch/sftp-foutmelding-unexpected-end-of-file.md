# SFTP foutmelding: Received unexpected end-of-file from SFTP server

> Bron: https://help.keurigonline.nl/article/140-sftp-foutmelding-received-unexpected-end-of-file-from-sftp-server

Bij het verbinden via SFTP (bijvoorbeeld met FileZilla) kun je de volgende foutmelding krijgen:

```
FATAL ERROR: Received unexpected end-of-file from SFTP server
Could not connect to server
```

## Wat betekent deze foutmelding?

De server accepteert je verbinding, maar de authenticatie mislukt. Dit is dus geen verbindingsprobleem, de server is bereikbaar, maar je inloggegevens worden niet geaccepteerd.

## Oorzaak

De meest voorkomende oorzaak is een verkeerd wachtwoord. Dit kan gebeuren als:

- Je wachtwoord recent is gewijzigd
- Je een oud of opgeslagen wachtwoord gebruikt in FileZilla
- Er een typefout in je wachtwoord zit

## Oplossing

1. **Stel je wachtwoord opnieuw in.** Log in op [Mijn KeurigOnline](https://mijn.keurigonline.nl), ga naar **Pakketten** en stel daar je DirectAdmin-wachtwoord opnieuw in.
2. **Probeer opnieuw te verbinden.** Je DirectAdmin-wachtwoord is hetzelfde als je FTP/SFTP-wachtwoord. Gebruik het nieuwe wachtwoord in FileZilla.

## Correcte SFTP-instellingen

Controleer ook of je de juiste instellingen gebruikt in FileZilla:

- **Protocol:** SFTP - SSH File Transfer Protocol
- **Host:** je servernaam (bijv. `cl01.keurigonline.nl`)
- **Poort:** 22
- **Gebruikersnaam:** je DirectAdmin-gebruikersnaam
- **Wachtwoord:** je DirectAdmin-wachtwoord

Je servernaam en gebruikersnaam vind je terug in de welkomstmail die je bij het aanmaken van je pakket hebt ontvangen, of via [Mijn KeurigOnline](https://mijn.keurigonline.nl) onder **Pakketten**.

## Gerelateerde artikelen

- [Hoe kan ik inloggen op de FTP server?](hoe-kan-ik-inloggen-op-de-ftp-server.md)
- [Hoe kan ik het FTP wachtwoord wijzigen?](hoe-kan-ik-het-ftp-wachtwoord-wijzigen.md)
- [Kan niet via FTP verbinden (KPN-klanten)](ftp-problemen-kpn-klanten.md)
