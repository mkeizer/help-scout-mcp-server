# Hoe beveilig ik een map met een wachtwoord in DirectAdmin?

> Bron: https://help.keurigonline.nl/article/134-map-beveiligen-met-wachtwoord-in-directadmin

Met Password Protected Directories kun je een map op je website afschermen met een gebruikersnaam en wachtwoord. Bezoekers krijgen een loginvenster te zien voordat ze de inhoud kunnen bekijken. Handig voor een afgeschermd gedeelte, prive downloads of een klantportaal.

## Voorbereiding

- Bedenk welke map je wilt beveiligen, bijvoorbeeld `/domains/jouwdomein.nl/public_html/secure`.
- Heb je de map nog niet? Maak deze eerst aan via de File Manager of (S)FTP.

## Stappenplan

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222` en log in met je gebruikersnaam en wachtwoord.
2. **Open Password Protected Directories.** Navigeer naar Password Protected Directories (Beveiligde Mappen) in het menu.
3. **Voeg een beveiligde map toe.** Klik op **Add Protected Directory** en selecteer het pad van de map die je wilt beveiligen.
4. **Stel de prompt in.** Vul bij Protected Directory Prompt een titel in die bezoekers in het loginvenster zien, bijvoorbeeld "Beveiligd gedeelte".
5. **Maak een gebruiker aan.** Voer bij Set/Update User een gebruikersnaam in en stel een sterk wachtwoord in (of gebruik de generator).
6. **Activeer de beveiliging.** Klik op **Protect** om de beveiliging in te schakelen.

## Testen

Bezoek de URL van de beveiligde map, bijvoorbeeld `https://jouwdomein.nl/secure/`. Er verschijnt een loginvenster. Vul de gebruikersnaam en het wachtwoord in die je zojuist hebt aangemaakt.

## Gebruikers beheren

- Open Password Protected Directories en klik op de betreffende map.
- Je kunt extra gebruikers toevoegen of wachtwoorden wijzigen via Set/Update User.
- Verwijder je de map uit de lijst, dan is de beveiliging direct opgeheven.

## Veelvoorkomende problemen

- **Geen loginvenster zichtbaar:** controleer of je de juiste map-URL bezoekt, of dat een eigen `.htaccess` de instellingen overschrijft.
- **401/403 fout blijft terugkomen:** controleer de gebruikersnaam en het wachtwoord (hoofdlettergevoelig), of verwijder en maak de gebruiker opnieuw aan.
- **Pad niet te selecteren:** maak de map eerst aan via File Manager of (S)FTP en herlaad de pagina.

## Goed om te weten

- De beveiliging geldt voor de hele map en alle onderliggende bestanden en submappen.
- Dit is server-level bescherming (Apache/LiteSpeed) en staat los van WordPress of CMS-logins.

## Gerelateerde artikelen

- [Hoe kan ik inloggen in DirectAdmin?](../directadmin/hoe-kan-ik-inloggen-in-directadmin.md)
- [Mijn website lijkt gehackt te zijn](../technisch/mijn-website-lijkt-gehackt-te-zijn.md)
