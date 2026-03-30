# Is het mogelijk om SSH toegang te krijgen voor mijn pakket?

> Bron: https://help.keurigonline.nl/article/80-is-het-mogelijk-om-ssh-toegang-te-krijgen-voor-mijn-pakket

SSH is beschikbaar in het **Plus** en **Pro** pakket en staat daar standaard aan. In het Start-pakket is SSH niet beschikbaar.

## Verbinding maken

Om verbinding te maken met SSH gebruik je **poort 2020** (niet de standaard poort 22).

Voorbeeld met een terminal:

```
ssh gebruikersnaam@jouwdomein.nl -p 2020
```

Vervang `gebruikersnaam` door je DirectAdmin-gebruikersnaam en `jouwdomein.nl` door je domeinnaam. Je wachtwoord is hetzelfde als dat van DirectAdmin.

## Veelgestelde vragen

### Ik heb een Start-pakket, kan ik SSH krijgen?

SSH is niet beschikbaar in het Start-pakket. Je kunt upgraden naar Plus of Pro via [Mijn KeurigOnline](https://mijn.keurigonline.nl).

### Welke poort moet ik gebruiken?

Poort **2020**. De standaard SSH-poort (22) werkt niet op onze servers.

### Kan ik SFTP gebruiken?

Ja, SFTP werkt ook via poort 2020. In FileZilla kies je protocol "SFTP - SSH File Transfer Protocol" en vul je poort 2020 in.

## Gerelateerde artikelen

- [SFTP foutmelding: Received unexpected end-of-file](../technisch/sftp-foutmelding-unexpected-end-of-file.md)
