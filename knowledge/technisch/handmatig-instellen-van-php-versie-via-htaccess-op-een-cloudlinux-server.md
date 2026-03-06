# Handmatig instellen van PHP-versie via .htaccess op een CloudLinux server

> Bron: https://help.keurigonline.nl/article/124-handmatig-instellen-van-php-versie-via-htaccess-op-een-cloudlinux-server

Je wilt handmatig de PHP-versie instellen voor je website op een CloudLinux-server door gebruik te maken van een .htaccess-bestand.


Door een specifieke handler toe te wijzen aan PHP-bestanden via de .htaccess, kun je een bepaalde PHP-versie configureren. Hieronder vind je de stappen en een voorbeeldconfiguratie.

**Stappen:**

- **Navigeer naar je websitebestand:**

Gebruik een FTP-client of de bestandsbeheerder in je hostingomgeving om naar de hoofdmap van je website te navigeren (meestal de public_html -map).

- **Maak of open het .htaccess-bestand:**

Controleer of er al een .htaccess-bestand bestaat. Zo niet, maak dan een nieuw bestand met de naam .htaccess .

- **Voeg de volgende code toe aan het .htaccess-bestand:**<FilesMatch "\.(php4|php5|php3|php2|php|phtml)$">
SetHandler application/x-httpd-php81
</FilesMatch>
- **Pas de handler aan de gewenste PHP-versie aan:**

In dit voorbeeld stelt de regel SetHandler application/x-httpd-php81  de PHP-versie in op PHP 8.1. Als je een andere PHP-versie wilt gebruiken, vervang dan php81  door de gewenste versie, bijvoorbeeld php74  voor PHP 7.4.

- **Sla de wijzigingen op:**

Sla het .htaccess-bestand op en upload het naar de server (indien lokaal aangepast).

- **Controleer je instellingen:**

Maak een testbestand genaamd phpinfo.php  in de root van je website met de volgende inhoud:

<?php
phpinfo();
?>
- Open dit bestand in je browser (bijvoorbeeld: https://jouw-domein.nl/phpinfo.php ) om te verifiëren of de juiste PHP-versie is ingesteld.**Veelvoorkomende problemen:**

- **500 Internal Server Error:** Controleer of de syntax van de .htaccess correct is en of de gekozen PHP-versie beschikbaar is op de server.- **PHP-versie verandert niet:** Dit kan te maken hebben met serverconfiguratie. Neem contact op met je hostingprovider als de wijziging niet wordt toegepast.**Let op:**

- Zorg ervoor dat je een back-up maakt van je .htaccess-bestand voordat je wijzigingen aanbrengt.
