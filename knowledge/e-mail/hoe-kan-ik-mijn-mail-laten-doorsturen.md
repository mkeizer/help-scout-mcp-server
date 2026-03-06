# Hoe kan ik mijn mail laten doorsturen?

> Bron: https://help.keurigonline.nl/article/139-hoe-kan-ik-mijn-mail-laten-doorsturen

Een e-mailforwarder (ook wel e-mailalias of doorstuuradres genoemd) stuurt automatisch alle binnenkomende e-mail van het ene adres door naar het andere. Het ontvangende adres kan een e-mailaccount binnen je eigen hostingpakket zijn, maar ook een extern adres zoals Gmail of Outlook.

## Wanneer gebruik je een e-mailforwarder?E-mailforwarders zijn handig wanneer je meerdere e-mailadressen wilt beheren zonder voor elk adres een apart postvak te gebruiken. Bijvoorbeeld:

- Je stuurt sales@voorbeeld.nl en info@voorbeeld.nl beide door naar één centraal postvak- Je stuurt specifieke adressen door naar je persoonlijke Gmail-account- Je wilt tijdelijk mail van een adres doorsturen naar een collegaDe oorspronkelijke mailheaders blijven behouden bij doorsturen, waardoor je altijd kunt zien naar welk adres de e-mail oorspronkelijk was gestuurd.

## Belangrijke overwegingen### Forwarder zonder e-mailaccountAls je alleen een forwarder aanmaakt zonder een bijbehorend e-mailaccount, komt de e-mail alleen aan op het doelacres.

### Forwarder met e-mailaccountLet op: wanneer je een e-mailaccount én een forwarder met hetzelfde adres hebt, komt de e-mail op beide locaties aan. Bijvoorbeeld:

- Je hebt het e-mailaccount [info@voorbeeld.nl](mailto:info@voorbeeld.nl) aangemaakt in DirectAdmin- Je hebt een forwarder ingesteld die [info@voorbeeld.nl](mailto:info@voorbeeld.nl) doorstuurt naar [voorbeeld@gmail.com](mailto:voorbeeld@gmail.com)- E-mails naar [info@voorbeeld.nl](mailto:info@voorbeeld.nl) komen dan zowel in het DirectAdmin-account als in je Gmail aan### Spam en doorgestuurde e-mailVeel spamfilters behandelen doorgestuurde e-mail kritischer, waardoor deze vaker in de spam belandt. Om dit te voorkomen, kun je het doorstuuradres als alias of vertrouwd adres toevoegen bij de ontvangende partij.

## E-mailforwarder aanmaken- [Log in op DirectAdmin](https://help.keurigonline.nl/article/47-hoe-kan-ik-inloggen-in-directadmin)- Ga naar **E-mailbeheer** → **Forwarders** en klik op **E-mailforwarder aanmaken**![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6900a6cc5e54145f690e6e89/file-zD0cMlBK5i.png)

- Vul de volgende gegevens in: - **E-mailforwarder**: Het e-mailadres dat moet doorsturen (bijvoorbeeld &#39;info&#39; of &#39;sales&#39;)- **Bestemming toevoegen**: Het e-mailadres waarnaar doorgestuurd moet worden- **Toevoegen**: Gebruik deze knop om meerdere doelladressen toe te voegen![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/6900a6feb5cc1e06c349b39f/file-O0sE2ywS7U.png)

- Klik op **Aanmaken** om de forwarder te activeren**Let op bij Gmail:** Test je een forwarder naar Gmail vanaf datzelfde Gmail-account, dan lijkt het alsof het niet werkt. Gmail verbergt e-mails die je zelf hebt verstuurd naar een forwarder die terugkeert naar hetzelfde account (dit wordt als duplicaat beschouwd). Test daarom vanaf een ander e-mailadres.

## E-mailforwarder wijzigen- Ga naar **E-mailbeheer** → **E-mail doorsturen**- Klik op het potlood-icoon naast de forwarder die je wilt aanpassen- Pas de instellingen aan en sla op## E-mailforwarder verwijderen- Ga naar **E-mailbeheer** → **E-mail doorsturen**- Vink de forwarder(s) aan die je wilt verwijderen- Klik op **Verwijderen** en bevestig je keuze
