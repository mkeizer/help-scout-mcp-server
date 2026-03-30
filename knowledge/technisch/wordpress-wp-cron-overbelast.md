# WordPress wp-cron.php overbelast: 503-fouten door achtergrondtaken

> Bron: https://help.keurigonline.nl/article/141-wordpress-wp-cronphp-overbelast-503-fouten-door-achtergrondtaken

WordPress gebruikt standaard een intern cron-systeem (`wp-cron.php`) om achtergrondtaken uit te voeren, zoals het publiceren van geplande berichten en het bijwerken van plugins. Dit systeem wordt bij elk paginabezoek geactiveerd. Op drukke websites kan dit leiden tot overbelasting en 503-foutmeldingen.

## Hoe herken je dit probleem?

In je Apache of LiteSpeed access log zie je regels zoals deze, soms tientallen per minuut:

```
POST /wp-cron.php?doing_wp_cron=1772837882.20 HTTP/1.1" 200 442 "WordPress/6.9"
POST /wp-cron.php?doing_wp_cron=1772837885.74 HTTP/1.1" 200 442 "WordPress/6.9"
POST /wp-cron.php?doing_wp_cron=1772837890.18 HTTP/1.1" 200 442 "WordPress/6.9"
```

Let op de User-Agent `WordPress/6.9`. Dit is WordPress zelf dat wp-cron aanroept, niet een externe bezoeker.

## Oorzaak

WordPress' ingebouwde cron is geen echte cron. Het werkt zo:

1. Een bezoeker (of bot) opent een pagina
2. WordPress controleert of er achtergrondtaken klaarstaan
3. Zo ja, dan start WordPress een apart HTTP-verzoek naar `wp-cron.php`
4. Bij veel gelijktijdige bezoekers ontstaan tientallen parallelle cron-verzoeken

Plugins zoals WooCommerce, backup-plugins en SEO-tools registreren vaak zware cron-taken. In combinatie met het hoge aantal aanroepen leidt dit tot CPU- en geheugenoverbelasting.

## Oplossing

### 1. Schakel de ingebouwde WP-Cron uit

Open `wp-config.php` via FTP of de Bestandsbeheerder in DirectAdmin en voeg deze regel toe boven "That's all, stop editing!":

```php
define('DISABLE_WP_CRON', true);
```

### 2. Stel een echte cronjob in via DirectAdmin

1. Log in op [Mijn KeurigOnline](https://mijn.keurigonline.nl) en open DirectAdmin via **Pakketten**
2. Ga naar **Cron Jobs** (onder Advanced Features)
3. Maak een nieuwe cronjob aan met interval **elke 15 minuten**
4. Gebruik als commando:
   ```
   wget -q -O /dev/null https://jouwdomein.nl/wp-cron.php?doing_wp_cron
   ```
   (vervang `jouwdomein.nl` door je eigen domeinnaam)

## Resultaat

- Geen onnodige wp-cron.php aanroepen meer bij elk paginabezoek
- Lagere CPU- en geheugenbelasting
- Geen 503-foutmeldingen meer door overbelasting
- Achtergrondtaken worden betrouwbaar elke 15 minuten uitgevoerd

## Liever dat wij dit regelen?

Met een [WordPress onderhoudscontract](https://www.keurigonline.nl/wordpress-onderhoud) (vanaf 20 euro/mnd) nemen we dit soort configuratie en optimalisatie volledig uit handen.

## Gerelateerde artikelen

- [Hoe maak ik een cronjob aan?](hoe-maak-ik-een-cronjob-aan.md)
- [Waarom is mijn WordPress website langzaam?](waarom-is-mijn-wordpress-website-langzaam.md)
- [Hoe installeer ik WordPress?](hoe-installeer-ik-wordpress.md)
