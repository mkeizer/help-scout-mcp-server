# Hoe kan ik mijn mail laten doorsturen?

> Bron: https://help.keurigonline.nl/article/139-hoe-kan-ik-mijn-mail-laten-doorsturen

Een e-mailforwarder stuurt automatisch alle binnenkomende e-mail van het ene adres door naar het andere. Handig als je meerdere adressen wilt beheren zonder aparte postvakken, of als je mail wilt doorsturen naar bijvoorbeeld Gmail.

## Stappenplan

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222` en log in.
2. **Ga naar Forwarders.** Navigeer naar **E-mailbeheer > Forwarders** en klik op **E-mailforwarder aanmaken**.
3. **Vul de gegevens in.** Vul bij E-mailforwarder het adres in dat moet doorsturen (bijvoorbeeld `info` of `sales`). Vul bij Bestemming het doeladres in waarnaar doorgestuurd moet worden.
4. **Maak de forwarder aan.** Klik op **Aanmaken** om de forwarder te activeren.

## Goed om te weten

- **Forwarder zonder postvak.** Als je alleen een forwarder aanmaakt zonder e-mailaccount, komt de mail alleen aan op het doeladres.
- **Forwarder met postvak.** Heb je zowel een e-mailaccount als een forwarder voor hetzelfde adres? Dan komt de mail op beide locaties aan.
- **Spam bij doorsturen.** Veel spamfilters behandelen doorgestuurde mail kritischer. Voeg het doorstuuradres toe als vertrouwd adres bij de ontvangende partij.
- **Gmail-test.** Test je een forwarder naar Gmail vanaf datzelfde Gmail-account, dan lijkt het alsof het niet werkt. Gmail verbergt mail die je zelf hebt verstuurd en die via een forwarder terugkeert. Test daarom vanaf een ander adres.

## Forwarder wijzigen of verwijderen

- **Wijzigen.** Ga naar **E-mailbeheer > E-mail doorsturen**, klik op het potlood-icoon naast de forwarder en pas de instellingen aan.
- **Verwijderen.** Vink de forwarder(s) aan en klik op **Verwijderen**.

## Gerelateerde artikelen

- [Hoe kan ik een e-mailadres aanmaken?](../e-mail/hoe-kan-ik-een-e-mailadres-aanmaken.md)
- [Hoe stuur ik mijn e-mail door?](../directadmin/hoe-stuur-ik-mijn-e-mail-door.md)
- [Hoe maak ik een catch-all adres?](hoe-maak-ik-een-catch-all-adres.md)
