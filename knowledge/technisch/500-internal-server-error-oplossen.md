# 500 Internal Server Error oplossen

> Bron: https://help.keurigonline.nl/article/145-500-internal-server-error-oplossen

Een 500 Internal Server Error betekent dat er iets misgaat op de server bij het laden van je website. De foutmelding zelf geeft weinig details, maar de oorzaak is meestal eenvoudig op te lossen.

## Hoe herken je dit probleem?

Je ziet een witte pagina met de tekst "500 Internal Server Error" of "Internal Server Error". Soms toont je browser een eigen foutpagina. De website is niet bereikbaar, maar je kunt nog wel inloggen in DirectAdmin.

## Mogelijke oorzaken

- **Fout in .htaccess.** Een typfout of ongeldige regel in je `.htaccess`-bestand is de meest voorkomende oorzaak.
- **Verkeerde bestandsrechten.** Bestanden moeten op `644` staan en mappen op `755`. Andere waarden (zoals `777`) veroorzaken een 500-fout.
- **PHP-geheugen vol.** Je website heeft meer geheugen nodig dan is toegestaan.
- **Incompatibele PHP-versie.** Je website is niet compatibel met de ingestelde PHP-versie.
- **Kapotte plugin of thema (WordPress).** Een recente update van een plugin of thema bevat een fout.

## Oplossing

Doorloop de stappen hieronder. Begin bij stap 1: de error log geeft je meestal direct de oorzaak.

### Stap 1: Bekijk de Apache error log

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222`
2. **Ga naar Siteoverzicht / Statistieken / Logs.** Je vindt dit onder **Systeem Info & Bestanden**
3. **Klik op Fouten Logboek.** Klik bij de domeinnaam waar het om gaat op **Fouten Logboek**. Hier zie je precies welke fout de 500-error veroorzaakt, bijvoorbeeld een syntax error in PHP, een ongeldig pad, of een probleem met `.htaccess`

Met de foutmelding uit de error log kun je gericht verder zoeken. Hieronder staan de meest voorkomende oplossingen.

### Stap 2: Controleer je .htaccess-bestand

1. **Open de Bestandsbeheerder in DirectAdmin.** Ga naar Bestandsbeheerder
2. **Ga naar de map `public_html`.** Zoek het bestand `.htaccess`. Als je het niet ziet, schakel dan verborgen bestanden in
3. **Hernoem het bestand tijdelijk.** Hernoem `.htaccess` naar `.htaccess_backup`
4. **Test je website.** Werkt de site weer? Dan zit de fout in je `.htaccess`. Maak een nieuw bestand aan met alleen de basisregels

Standaard `.htaccess` voor WordPress:

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

### Stap 3: Controleer bestandsrechten

1. **Open de Bestandsbeheerder.** Controleer de rechten van bestanden en mappen in `public_html`
2. **Stel de juiste rechten in.** Mappen: `755`. Bestanden: `644`. Gebruik nooit `777`

Je kunt rechten ook in bulk herstellen via SSH of FTP:

```bash
find ~/domains/jouwdomein.nl/public_html -type d -exec chmod 755 {} \;
find ~/domains/jouwdomein.nl/public_html -type f -exec chmod 644 {} \;
```

### Stap 4: Verhoog het PHP-geheugen

Open of maak een `php.ini`-bestand in je `public_html` map en voeg toe:

```ini
memory_limit = 256M
```

Voor WordPress kun je ook deze regel toevoegen aan `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '256M');
```

### Stap 5: Wissel van PHP-versie

Sommige websites werken niet met de nieuwste PHP-versie. Probeer een andere versie via DirectAdmin onder **Accountbeheer** en **Domein instellingen**. Zie het artikel [Hoe verander ik mijn PHP-versie?](https://help.keurigonline.nl/article/59-hoe-verander-ik-mijn-php-versie-cloudlinux) voor de stappen.

### Stap 6: Schakel plugins uit (WordPress)

1. **Open de Bestandsbeheerder.** Ga naar `public_html/wp-content/`
2. **Hernoem de map `plugins`.** Hernoem deze naar `plugins_uit`. WordPress schakelt dan alle plugins uit
3. **Test je website.** Werkt de site weer? Hernoem de map terug naar `plugins` en schakel plugins een voor een in via het WordPress-dashboard om de schuldige te vinden

## Kom je er niet uit?

Als geen van de stappen helpt, neem dan contact op met onze helpdesk via support@keurigonline.nl. Vermeld welke stappen je al hebt geprobeerd, dan kunnen we sneller helpen.

## Gerelateerde artikelen

- [Ik krijg een vreemde witte pagina op mijn website](../technisch/ik-krijg-een-vreemde-witte-pagina-op-mijn-website.md)
- [Hoe verander ik mijn PHP-versie?](../directadmin/hoe-verander-ik-mijn-php-versie-cloudlinux.md)
- [Hoe restore ik een backup via JetBackup](../technisch/hoe-restore-ik-een-backup-via-jetbackup.md)
- [WordPress wp-cron.php overbelast: 503-fouten](../technisch/wordpress-wp-cron-overbelast.md)
