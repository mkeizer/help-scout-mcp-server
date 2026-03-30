# Welke PHP versies bieden jullie aan?

> Bron: https://help.keurigonline.nl/article/welke-php-versies-bieden-jullie-aan

Op alle hostingpakketten van KeurigOnline kun je zelf kiezen welke PHP versie je wilt gebruiken. We ondersteunen meerdere versies zodat je altijd compatibel bent met je website of applicatie.

## Beschikbare PHP versies

| Versie | Status | Aanbevolen? |
|--------|--------|-------------|
| PHP 8.5 | Nieuwste versie | **Ja** |
| PHP 8.4 | Actief ondersteund | Ja |
| PHP 8.3 | Actief ondersteund | Ja |
| PHP 8.2 | Security-only updates | Acceptabel |
| PHP 8.1 | End of life | Nee, upgraden aanbevolen |
| PHP 8.0 | End of life | Nee, upgraden aanbevolen |
| PHP 7.4 | End of life | Nee, upgraden noodzakelijk |

## Welke versie moet ik kiezen?

Gebruik altijd de **nieuwste versie die je website ondersteunt**. Nieuwere PHP versies zijn sneller, veiliger en gebruiken minder geheugen.

**WordPress:** vanaf WordPress 6.4 wordt PHP 8.2 of hoger aanbevolen. De meeste actuele themes en plugins werken goed met PHP 8.3 en 8.4. Test je site na het upgraden.

**Joomla, Drupal, Laravel:** controleer de documentatie van je CMS of framework voor de aanbevolen PHP versie.

## PHP versie wijzigen

Je kunt je PHP versie zelf aanpassen via DirectAdmin. Welke handleiding je nodig hebt, hangt af van je servertype:

- **CloudLinux-server** (adresbalk bevat `cl0x.keurigonline.nl`): De PHP versie wordt per pakket ingesteld. Alle domeinen binnen hetzelfde pakket delen dezelfde PHP versie. Volg de handleiding [Hoe verander ik mijn PHP-versie? (CloudLinux)](https://help.keurigonline.nl/article/22-hoe-verander-ik-mijn-php-versie-cloudlinux)
- **Andere servers:** De PHP versie kan per domein worden ingesteld. Je kunt dus voor elk domein binnen je pakket een andere versie kiezen. Volg de handleiding [Hoe wijzig ik de versie van PHP?](https://help.keurigonline.nl/article/19-hoe-wijzig-ik-de-versie-van-php)

## End of life versies

PHP versies die end of life zijn krijgen geen beveiligingsupdates meer. We raden sterk aan om zo snel mogelijk te upgraden. Websites op verouderde PHP versies lopen risico op beveiligingsproblemen en presteren minder goed.

Weet je niet zeker of je website compatibel is met een nieuwere versie? Met een [WordPress onderhoudscontract](https://www.keurigonline.nl/wordpress-onderhoud) (vanaf 20 euro/mnd) kunnen we dit voor je testen en uitvoeren.

## Gerelateerde artikelen

- [Welke PHP versie draait er op mijn hostingpakket?](welke-php-versie-draait-er-op-mijn-hostingpakket.md)
- [Hoe wijzig ik de versie van PHP?](hoe-wijzig-ik-de-versie-van-php.md)
- [Hoe verander ik mijn PHP-versie? (CloudLinux)](../directadmin/hoe-verander-ik-mijn-php-versie-cloudlinux.md)
- [Handmatig instellen van PHP-versie via .htaccess op een CloudLinux server](handmatig-instellen-van-php-versie-via-htaccess-op-een-cloudlinux-server.md)
