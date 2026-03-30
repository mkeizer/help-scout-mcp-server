# Waarom krijg ik geen e-mail binnen?

> Bron: https://help.keurigonline.nl/article/68-waarom-krijg-ik-geen-e-mail-binnen

Er zijn verschillende redenen waarom e-mail niet binnenkomt. In dit artikel doorlopen we de meest voorkomende oorzaken en hoe je ze oplost.

## Mogelijke oorzaken

- **Mailbox zit vol.** Als je pakket geen opslagruimte meer heeft, worden nieuwe e-mails geweigerd. De afzender krijgt dan een bouncemelding terug.
- **Verkeerde instellingen in je mailprogramma.** Als je mailprogramma de inkomende mailserver niet kan bereiken, worden nieuwe berichten niet opgehaald.
- **Domeinnaam niet (meer) actief.** Als je domeinnaam niet meer gekoppeld is aan je pakket of de nameservers niet kloppen, komt e-mail niet aan.
- **E-mail belandt in spam bij de afzender.** Soms weigert de ontvangende mailserver (bijv. Gmail, Outlook) je e-mail vanwege ontbrekende SPF-, DKIM- of DMARC-records.
- **E-mail doorsturen actief zonder mailbox.** Als je een forwarder hebt ingesteld maar geen mailbox, wordt e-mail alleen doorgestuurd. Controleer of de forwarder correct werkt.

## Oplossing

1. **Controleer of je mailbox vol zit.** Log in op webmail via `https://jouwdomein.nl/webmail` en kijk hoeveel ruimte er nog beschikbaar is. Verwijder oude e-mails als je mailbox vol is.
2. **Controleer je mailinstellingen.** Zorg dat je de juiste instellingen gebruikt:
   - **Inkomende server (IMAP):** `mail.jouwdomein.nl`, poort `993` (SSL)
   - **Inkomende server (POP):** `mail.jouwdomein.nl`, poort `995` (SSL)
   - **Gebruikersnaam:** je volledige e-mailadres

   Meer details vind je op [keurigonline.nl/email-instellen](https://www.keurigonline.nl/email-instellen/).
3. **Controleer of je website bereikbaar is.** Ga naar je domeinnaam in de browser. Zie je je website? Dan is je domein actief en ligt het probleem niet bij de domeinkoppeling.
4. **Controleer je SPF, DKIM en DMARC.** Ontbrekende e-mailauthenticatie kan ervoor zorgen dat e-mail als spam wordt gemarkeerd of geweigerd. Zie: [Hoe stel ik SPF, DKIM en DMARC in?](hoe-stel-ik-spf-dkim-en-dmarc-in.md)
5. **Test met webmail.** Log in op `https://jouwdomein.nl/webmail` en stuur jezelf een testmail. Komt de mail daar wel aan maar niet in je mailprogramma? Dan ligt het aan de instellingen van je client, niet aan de server.

Kom je er niet uit? Neem dan contact op met onze helpdesk via support@keurigonline.nl. Vermeld je domeinnaam, het e-mailadres en een voorbeeld van een afzender waarvan je geen mail ontvangt.

## Gerelateerde artikelen

- [Hoe kan ik mijn e-mail lezen in een e-mail client?](hoe-kan-ik-mijn-e-mail-lezen-in-een-e-mail-client.md)
- [Waarom kan ik geen e-mail versturen?](waarom-kan-ik-geen-e-mail-versturen.md)
- [Hoe stel ik SPF, DKIM en DMARC in?](hoe-stel-ik-spf-dkim-en-dmarc-in.md)
- [Hoe kan ik mijn e-mail lezen in webmail?](hoe-kan-ik-mijn-e-mail-lezen-in-webmail.md)
