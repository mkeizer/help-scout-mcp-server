# Hoe herstel ik een enkele website via JetBackup?

> Bron: https://help.keurigonline.nl/article/133-website-herstellen-via-jetbackup-bestanden-database-apart

JetBackup biedt geen optie om een specifieke website in een keer terug te zetten. Wil je toch een enkel domein herstellen, dan doe je dit in twee stappen: eerst de bestanden, daarna de database. Gebruik voor beide dezelfde backupdatum om conflicten te voorkomen.

## Stap 1: Bestanden herstellen

1. **Open JetBackup.** Log in op DirectAdmin en ga naar **Plugins > JetBackup 5**.
2. **Ga naar Restore & Download.** Klik op het tweede icoon in het linkermenu.
3. **Open geavanceerde instellingen.** Klik op **Show advanced settings**.
4. **Kies bestanden.** Klik op het map-icoon (Files). Wil je een oudere backup? Klik op **Choose other backup** en kies de gewenste datum.
5. **Selecteer de juiste map.** Klik op **Change files selection** en vink alleen de map van het betreffende domein aan, bijvoorbeeld `/domains/jouwdomein.nl`. Bevestig met **Select files**.
6. **Herstel.** Klik op **Restore** om de bestanden terug te zetten.

## Stap 2: Database herstellen

1. **Ga terug naar de geavanceerde instellingen.** Herhaal stap 1 t/m 3 hierboven.
2. **Kies de database.** Klik op het database-icoon (4e icoon). Klik op **Deselect all** en selecteer alleen de database die bij je domein hoort. De naam vind je in `wp-config.php` bij `DB_NAME`.
3. **Kies dezelfde datum.** Selecteer dezelfde backupdatum als bij de bestanden.
4. **Herstel.** Klik op **Restore** om de database terug te zetten.

## Na het herstellen

- Controleer of de website correct laadt (front-end en wp-admin).
- Gebruik je Redis of Memcached? Leeg de cache na de restore.
- Controleer de databasegegevens in `wp-config.php` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`).

## Gerelateerde artikelen

- [Hoe restore ik een backup via JetBackup](../technisch/hoe-restore-ik-een-backup-via-jetbackup.md)
- [Mijn website lijkt gehackt te zijn](../technisch/mijn-website-lijkt-gehackt-te-zijn.md)
- [Hoe kan ik inloggen in DirectAdmin?](../directadmin/hoe-kan-ik-inloggen-in-directadmin.md)
