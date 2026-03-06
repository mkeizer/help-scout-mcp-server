# Website herstellen via JetBackup (bestanden + database apart)

> Bron: https://help.keurigonline.nl/article/133-website-herstellen-via-jetbackup-bestanden-database-apart

JetBackup biedt geen eenvoudige optie om één specifieke website (domein) volledig in één keer terug te zetten. Wil je toch een enkel domein herstellen, doe dit dan in twee delen: **eerst de bestanden** en daarna **de database**. Gebruik voor beide delen *dezelfde backupdate* om conflicten te voorkomen. 

## Bestanden herstellen-  Log in op DirectAdmin en open **JetBackup 5** (via *Plugins → JetBackup 5* of rechtstreeks via je server-URL op poort 2222). 

Voorbeeldpad: /CMD_PLUGINS_RESELLER/jetbackup5/index.html  of /CMD_PLUGINS/jetbackup5/index.html  afhankelijk van je rol.

- Klik in het linkermenu op **Restore & Download** (2e icoon).- Klik op **Show advanced settings**.- Kies het **map-icoon** (Files).-  Wil je niet de meest recente backup? Selecteer **Choose other backup** en kies de gewenste datum. - Klik op **Change files selection**.-  Vink alleen de map van het betreffende domein aan, bijvoorbeeld: /domains/jouwdomein.nl , en bevestig met **Select files**. - Klik op **Restore** om de bestanden terug te zetten.## Database herstellen- Herhaal stap 1 t/m 3 hierboven om terug te keren naar de geavanceerde instellingen.- Kies het **database-icoon** (4e icoon in het menu).-  Klik op **Deselect all** en selecteer alleen de database die bij je domein hoort. 

De naam vind je in wp-config.php  bij DB_NAME . Voorbeeld: account_wp123 .

-  Selecteer **Choose other backup** indien nodig en kies **dezelfde datum** als bij de bestanden. - Klik op **Restore** om de database terug te zetten.## Belangrijk- Zorg dat de backupdate voor **bestanden** en **database** gelijk is.-  Controleer na afloop: front-end laadt, wp-admin werkt, en er zijn geen PHP-fouten in error_log . -  Gebruik je object caching (bijv. Redis/Memcached)? Leeg de cache na de restore om verouderde objecten te voorkomen. -  Afwijkende inloggegevens of DB-host? Verifieer DB_NAME , DB_USER , DB_PASSWORD , DB_HOST  in wp-config.php . 
