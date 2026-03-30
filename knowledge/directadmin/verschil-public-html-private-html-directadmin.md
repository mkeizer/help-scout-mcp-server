# Verschil tussen public_html en private_html in DirectAdmin

> Bron: https://help.keurigonline.nl/article/146-verschil-public-html-private-html-directadmin

Sinds een update van DirectAdmin (versie 1.695) wordt voor zowel HTTP als HTTPS dezelfde map gebruikt: `public_html`. Voorheen werden dit twee aparte mappen. In dit artikel leggen we uit wat er is veranderd en wat je moet doen als je website niet correct werkt.

## Wat is er veranderd?

Vroeger gebruikte DirectAdmin twee mappen per domein:

- **`public_html`** voor onbeveiligde verbindingen (HTTP)
- **`private_html`** voor beveiligde verbindingen (HTTPS)

Sinds DirectAdmin 1.695 wordt `public_html` gebruikt voor zowel HTTP als HTTPS. De map `private_html` is een symlink (snelkoppeling) naar `public_html`, zodat beide paden naar dezelfde bestanden verwijzen.

## Hoe herken je dit probleem?

- Je website toont andere inhoud via HTTPS dan via HTTP
- Je ziet een lege pagina of foutmelding op HTTPS, maar de site werkt wel via HTTP
- Na een serverupdate werkt je HTTPS-site niet meer zoals verwacht

### Krijg je opeens een 404 op je website?

Als je website voorheen in `private_html` stond en deze map niet is samengevoegd met `public_html`, dan kan je site na de update een 404-fout tonen. Google heeft je pagina's geindexeerd via HTTPS, maar de webserver vindt de bestanden niet meer omdat hij nu in `public_html` kijkt.

Dit valt extra op doordat:

- Bezoekers vanuit Google op een 404-pagina terechtkomen
- Je positie in zoekresultaten daalt omdat Google steeds meer 404's tegenkomt
- Google Search Console meldingen geeft over pagina's die niet meer gevonden worden

Hoe langer dit duurt, hoe meer schade aan je vindbaarheid. Los dit daarom zo snel mogelijk op.

## Oorzaak

Als je in het verleden bestanden in `private_html` hebt geplaatst (los van `public_html`), dan kunnen deze na de update niet meer bereikbaar zijn via HTTPS. De webserver kijkt nu namelijk alleen naar `public_html`.

## Oplossing

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222` en log in met je gebruikersnaam en wachtwoord.

2. **Open de Bestandsbeheerder.** Klik op **Bestandsbeheerder** (File Manager) in het menu.

3. **Ga naar je domeinmap.** Navigeer naar `/domains/jouwdomein.nl/`.

4. **Controleer de mappen.** Bekijk of `private_html` een symlink is naar `public_html`. Als dat zo is, hoef je niets te doen. Als het een aparte map is met bestanden erin, ga dan verder met de volgende stap.

5. **Verplaats je bestanden.** Kopieer de inhoud van `private_html` naar `public_html`. Controleer daarna of je website correct werkt via zowel HTTP als HTTPS.

6. **Ruim op.** Zodra alles werkt, kun je de oude `private_html`-map verwijderen of laten staan. De webserver gebruikt deze niet meer.

## Goed om te weten

- Nieuwe domeinen hebben automatisch een symlink van `private_html` naar `public_html`
- Je websitebestanden horen altijd in `/domains/jouwdomein.nl/public_html/`
- Gebruik je FTP? Stel dan als pad in: `/domains/jouwdomein.nl/public_html`

## Gerelateerde artikelen

- [Wat stel ik als pad of map in binnen mijn FTP programma?](../technisch/wat-stel-ik-als-pad-of-map-in-binnen-mijn-ftp-programma.md)
- [Hoe kan ik inloggen in DirectAdmin?](hoe-kan-ik-inloggen-in-directadmin.md)
- [Hoe vraag ik een gratis Let's Encrypt SSL-certificaat aan?](../technisch/hoe-vraag-ik-een-gratis-lets-encrypt-ssl-certificaat-aan.md)
