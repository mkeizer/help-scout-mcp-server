# SFTP foutmelding: Received unexpected end-of-file from SFTP server

> Bron: https://help.keurigonline.nl/article/140-sftp-foutmelding-received-unexpected-end-of-file-from-sftp-server

Bij het verbinden via SFTP (bijvoorbeeld met FileZilla) kun je de volgende foutmelding krijgen:

```
FATAL ERROR: Received unexpected end-of-file from SFTP server
Could not connect to server
```

## Wat betekent deze foutmelding?

Deze foutmelding betekent dat de server je verbinding wel accepteert, maar dat de **authenticatie mislukt**. Dit is dus geen verbindingsprobleem — de server is bereikbaar, maar je inloggegevens worden niet geaccepteerd.

## Oorzaak

De meest voorkomende oorzaak is een **verkeerd wachtwoord**. Dit kan gebeuren als:

- Je wachtwoord recent is gewijzigd
- Je een oud of opgeslagen wachtwoord gebruikt in FileZilla
- Er een typefout in je wachtwoord zit

## Oplossing

Stel je wachtwoord opnieuw in via Mijn KeurigOnline:

1. Log in op [Mijn KeurigOnline](https://mijn.keurigonline.nl)
2. Ga naar **Pakketten**
3. Stel daar je DirectAdmin-wachtwoord opnieuw in

Je DirectAdmin-wachtwoord is hetzelfde als je FTP/SFTP-wachtwoord. Na het resetten kun je opnieuw verbinding maken in FileZilla met het nieuwe wachtwoord.

## Correcte SFTP-instellingen

Controleer ook of je de juiste instellingen gebruikt in FileZilla:

- **Protocol:** SFTP - SSH File Transfer Protocol
- **Host:** je servernaam (bijv. `cl01.keurigonline.nl`)
- **Poort:** 22
- **Gebruikersnaam:** je DirectAdmin-gebruikersnaam
- **Wachtwoord:** je DirectAdmin-wachtwoord

Je servernaam en gebruikersnaam vind je terug in de welkomstmail die je bij het aanmaken van je pakket hebt ontvangen, of via Mijn KeurigOnline onder **Pakketten**.
