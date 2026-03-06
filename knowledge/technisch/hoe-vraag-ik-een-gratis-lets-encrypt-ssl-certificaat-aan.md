# Hoe vraag ik een gratis SSL certificaat aan?

> Bron: https://help.keurigonline.nl/article/56-hoe-vraag-ik-een-gratis-lets-encrypt-ssl-certificaat-aan

## Wat is een gratis SSL-certificaat en waarom heb je het nodig?Een SSL-certificaat zorgt voor een beveiligde verbinding tussen een website en de bezoeker. Het herkent een website aan het slotje in de adresbalk en het feit dat de URL begint met **https** in plaats van **http**. De &#39;S&#39; staat voor *secure*.

## Wat doet een SSL-certificaat precies?- **Versleuteling van gegevens:** Alles wat een bezoeker invult op je site (zoals contactformulieren of inloggegevens) wordt versleuteld verstuurd. Hackers kunnen die informatie onderweg niet zomaar onderscheppen.- **Vertrouwen en professionaliteit:** Bezoekers zien dat jouw site veilig is. Dat wekt vertrouwen en komt professioneler over.- **Noodzakelijk voor webshops en formulieren:** Heb je een webshop of verzamel je persoonlijke gegevens? Dan is een SSL-certificaat zelfs wettelijk verplicht.- **Beter voor je vindbaarheid:** Google geeft beveiligde websites een streepje voor in de zoekresultaten.## Hoe maak je een Gratis Let's Encrypt certificaat aan?Om te beginnen met het installeren van een SSL-certificaat moet je zijn ingelogd op DirectAdmin. De DirectAdmin-omgeving is altijd te benaderen via; https://jedomeinnaam.nl:2222

Zodra je bent ingelogd op DirectAdmin krijg je een navigatiebalk te zien. Klik op Accountbeheer.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664da6bf5940934e140f3ae6/file-vEWuWTesH6.png)

Binnen Accountbeheer klik je op de optie &#39;SSL Certificaten&#39;.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664da6dfdd0f8c60bb3fc0c7/file-Io4eIS6Oxz.png)

Je krijgt nu een flink aantal opties. Selecteer hier &#39;Krijg een automatisch certificaat van ACME Provider&#39;.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664da72c1f3fa9421e286eb1/file-HSZ6MloFlr.png)

In principe kan je dit alles laten staan zoals het staat. Om de aanvraag in gang te zetten klik je op &#39;Opslaan&#39;. Het certificaat wordt nu op de achtergrond aangevraagd. Dit kan even duren.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664da7a91f3fa9421e286eb2/file-pkxZRgL21h.png)

Nadat de installatie is afgerond krijg je de melding dat het certificaat succesvol is opgeslagen.

Enkel in het CMS van je website zullen nog een aantal aanpassingen moeten gedaan worden voordat het groene slotje volledig actief is. Dit kun je het beste door je webdesigner laten doen.

Let op! Mocht je na het instellen van een SSL-certificaat op je website een rare witte pagina krijgen (zie voorbeeld hieronder) doorloop dan onderstaande stappen.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6683c368d593d719515cb3ef/file-Uppgr8APUD.png)

Ga binnen je DirectAdmin aan de rechterkant naar Accountbeheer -> Domein instellingen

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6683c3875173914f806c278a/file-zg9B6U5a1m.png)

Selecteer de domeinnaam waar het om gaat.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6683c457e1989867dcefea8f/file-oXtZfwkF9j.png)

Selecteer rechtsbovenin de optie &#39;Stel een symlink in voor private_html&#39;.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6683c46c1f3fa9421e288a7f/file-cB7QYyAswR.png)

Je krijgt nu een pop-up, klik hier op bevestig.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6683c48bdd0f8c60bb3fdd0b/file-TkwPwkegp9.png)

Je zal nu de website weer zonder problemen naar voren moeten krijgen.

## Hoe controleer je of je SSL-certificaat goed is?Gebruik tools zoals [SSL Labs](https://www.ssllabs.com/ssltest/) of [SSLShopper](https://www.sslshopper.com/ssl-checker.html). Vul je domeinnaam in en start de scan. Je krijgt een overzicht waarin je kunt zien of:


    - Je certificaat geldig is
    - De juiste certificaatketen (root & intermediate) actief is
    - Er geen fouten zijn in de configuratie
  Een groen vinkje en een ‘A’-score? Dan zit je goed.

## Welke soorten SSL-certificaten zijn er?
    - **DV (Domain Validated):** Basisbeveiliging, snel en vaak gratis (zoals Let's Encrypt).
    - **OV (Organization Validated):** Bevat ook bedrijfsgegevens, geschikt voor serieuze zakelijke sites.
    - **EV (Extended Validation):** De strengste validatie, met herkenbare bedrijfsvermelding in de browser. Ideaal voor webshops en banken.
  Bij KeurigOnline krijg je standaard een gratis DV-certificaat via Let's Encrypt. Wil je extra zekerheid of validatie? Dan regelen wij ook OV en EV certificaten van bijvoorbeeld DigiCert of GlobalSign.

## Is een gratis SSL-certificaat veilig?Ja, absoluut. Alle SSL-certificaten – gratis of betaald – gebruiken dezelfde versleuteling (meestal 256-bit). Het verschil zit ‘m in het validatieproces en de extra garanties. Betaalde certificaten bieden vaak een verzekering bij incidenten. Voor blogs, portfolio’s of kleine zakelijke sites is een gratis certificaat vaak meer dan voldoende.



## Hoe verbeter een SSL-certificiaat je Google Ranking?Google houdt van veilige websites. Een https-verbinding geeft je dus een voorsprong in de zoekresultaten. Daarnaast klikken bezoekers sneller op een veilige site, wat je doorklikratio verbetert – en dat merkt Google ook.


