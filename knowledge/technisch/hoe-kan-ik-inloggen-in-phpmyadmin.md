# Hoe kan ik inloggen in phpMyAdmin?

> Bron: https://help.keurigonline.nl/article/79-hoe-kan-ik-inloggen-in-phpmyadmin

Met phpMyAdmin kun je eenvoudig je MySQL-database beheren via een webinterface. Bij KeurigOnline is phpMyAdmin beschikbaar via een eenvoudige link achter je domeinnaam.

## Stappenplan

1. **Open phpMyAdmin.** Ga in je browser naar `https://jouwdomein.nl/phpmyadmin` of `https://jouwdomein.nl/pma`. Beide adressen werken.
2. **Log in met je databasegegevens.** Vul je databasegebruikersnaam en wachtwoord in. Deze gegevens vind je in DirectAdmin onder **MySQL Management**, of in het bestand `wp-config.php` als je WordPress gebruikt.
3. **Selecteer je database.** Na het inloggen zie je links een lijst met databases. Klik op de database die je wilt beheren.

## Veelvoorkomende acties

- **Back-up maken.** Ga naar **Exporteren** en kies Snelle export om een SQL-bestand te downloaden.
- **Back-up terugzetten.** Ga naar **Importeren** en upload een eerder opgeslagen SQL-bestand.
- **Gegevens bewerken.** Klik op een tabel en daarna op **Bewerken** om rijen te bekijken of te wijzigen.
- **Tabel of kolom aanmaken.** Klik op **Structuur** en voeg nieuwe velden of tabellen toe.

## Let op

Maak altijd eerst een back-up voordat je iets wijzigt in phpMyAdmin. Log uit als je klaar bent en deel je databasegegevens nooit met derden.

## Gerelateerde artikelen

- [Hoe maak ik een MySQL database aan?](hoe-maak-ik-een-mysql-database-aan.md)
- [Hoe kan ik inloggen in DirectAdmin?](../directadmin/hoe-kan-ik-inloggen-in-directadmin.md)
- [Hoe installeer ik WordPress?](hoe-installeer-ik-wordpress.md)
