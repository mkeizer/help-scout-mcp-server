# Password Protected Directories / Beveiligde Mappen in DirectAdmin

> Bron: https://help.keurigonline.nl/article/134-map-beveiligen-met-wachtwoord-in-directadmin

Met **Password Protected Directories / Beveiligde Mappen** kun je een map op je website afschermen met een gebruikersnaam en wachtwoord. Bezoekers krijgen eerst een loginvenster te zien voordat ze de inhoud kunnen bekijken. Dit is handig voor een afgeschermd gedeelte (*members area*), privé downloads of een klantportal. 

## Voorbereiding- Log in op DirectAdmin en open **Password Protected Directories / Beveiligde Mappen**. De URL loopt altijd via :2222/evo/user/protected-directories .- Bedenk welke map je wilt beveiligen, bijvoorbeeld: /domains/jouwdomein.nl/public_html/secure .- Heb je de map nog niet? Maak deze eerst aan via de *File Manager* of (S)FTP.![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/68ac37078e97a048e5e61a62/file-aaX9uoAyeR.png)

## Map beveiligen (stappen)- Ga naar **Password Protected Directories / Beveiligde Mappen** in DirectAdmin.- Klik op **Add Protected Directory / Beveiligde map toevoegen**.- Selecteer het **Path / Pad** (de map) die je wilt beveiligen. 

Tip: gebruik bij voorkeur een submap zoals /public_html/secure .

- Vul **Protected Directory Prompt / Beveiligde Directory Prompt** in: de titel die bezoekers in het loginvenster zien. 

Voorbeeld: Beveiligd gedeelte  of Klantenportal .

- Maak een gebruiker aan: - **Set/Update User / Gebruiker instellen/bijwerken**: voer een gebruikersnaam in.- **Password / Wachtwoord**: stel een sterk wachtwoord in of gebruik de generator.- Klik op **Protect / Beveilig** om de beveiliging in te schakelen.![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/68ac3712862bcf0840f643fe/file-rnyyqC5FSB.png)

## Wat vul je precies in?- **Path / Pad:** de map die je wilt afschermen (bijv. /public_html/secure ).- **Protected Directory Prompt / Beveiligde Directory Prompt:** de titel in het loginvenster (vrij in te vullen).- **Set/Update User / Gebruiker instellen/bijwerken:** de gebruikersnaam die toegang krijgt.- **Password / Wachtwoord:** het wachtwoord dat bij de gebruiker hoort.## Beveiligde map testen- Bezoek de URL van de map, bijvoorbeeld: https://jouwdomein.nl/secure/ .- Er verschijnt een loginprompt in je browser.- Vul de zojuist aangemaakte gebruikersnaam en wachtwoord in.## Gebruikers beheren- Open **Password Protected Directories / Beveiligde Mappen** en klik op de betreffende map.- Je kunt extra gebruikers toevoegen of wachtwoorden wijzigen via *Set/Update User*.- Verwijder je de map uit de lijst, dan is de beveiliging direct opgeheven.## Veelvoorkomende problemen- **Geen loginprompt zichtbaar:** controleer of je echt de map-URL bezoekt, of dat een eigen .htaccess  de instellingen overschrijft.- **401/403 blijft terugkomen:** controleer de gebruikersnaam/wachtwoord (hoofdlettergevoelig), of verwijder en maak de gebruiker opnieuw aan.- **Pad niet te selecteren:** maak de map eerst aan via File Manager of (S)FTP en herlaad de pagina.## Belangrijk- De beveiliging geldt voor de hele map en alle onderliggende bestanden/submappen.- Dit is een **server-level bescherming** (Apache/LiteSpeed) en staat los van WordPress of CMS-logins.- Gebruik altijd sterke wachtwoorden en geef alleen toegang aan de juiste personen.## Beveiliging verwijderenVerwijder je de map in **Password Protected Directories / Beveiligde Mappen**, dan is de inhoud weer vrij toegankelijk. 


