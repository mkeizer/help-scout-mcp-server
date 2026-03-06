# Hoe kan ik mijn hosts file aanpassen?

> Bron: https://help.keurigonline.nl/article/118-hoe-kan-ik-mijn-hosts-file-aanpassen

Met een hosts-bestand kun je domeinnamen (zoals je eigen website) lokaal koppelen aan een specifiek IP-adres. Normaal gesproken bepaalt het DNS (Domain Name System) welk IP-adres bij een domeinnaam hoort. Als je wilt dat een bepaalde domeinnaam naar een andere server wijst dan die in het DNS staat, kun je dit aanpassen in je hosts-bestand. In dit artikel leggen we uit waarom een hosts-bestand handig kan zijn en hoe je het kunt aanpassen.

### Wat is een hosts-bestand?Een hosts-bestand is een bestand op je computer dat domeinnamen vertaalt naar IP-adressen. Als je computer een IP-adres opzoekt, kijkt hij eerst in het hosts-bestand. Als daar niets staat, gebruikt hij DNS.

### Waarom gebruik maken van een hosts-bestand?Bij het ontwikkelen van een nieuwe website kan de developer gebruikmaken van een eigen server, met een ander IP-adres dan in het DNS staat. Om toch de juiste server te bereiken, moet je het hosts-bestand aanpassen. Zo geef je bijvoorbeeld aan dat 192.168.0.1  de server is voor keurigonline.nl  en www.keurigonline.nl . Na deze wijziging zal de domeinnaam naar de juiste server wijzen, zolang de hosts-file is aangepast. Voor bezoekers die de hosts-file niet hebben aangepast, blijft de website normaal toegankelijk.

Wil je tijdelijk een andere server gebruiken, dan kun je een regel in het hosts-bestand uitschakelen door er een #  voor te zetten, zoals:

#192.168.0.1 keurigonline.nl
### Hosts-bestand aanpassen op WindowsOm het hosts-bestand op een Windows-computer aan te passen, volg je deze stappen:

- Zoek naar "Kladblok" via het startmenu.- Klik met de rechtermuisknop en kies "Als administrator uitvoeren".- Open het bestand via Bestand > Openen.- Navigeer naar C:\Windows\System32\drivers\etc\hosts  en open het.- Voeg het IP-adres en de domeinnaam toe.- Sla het bestand op.**Tip:** Vergeet niet de aanpassingen te verwijderen zodra de verhuizing is voltooid.

### Hosts-bestand aanpassen op MacVoor een Mac volg je deze stappen:

- Open Terminal via Spotlight (cmd + spatiebalk).- Voer de command sudo nano /etc/hosts  uit.- Voer je wachtwoord in (je ziet geen tekens verschijnen).- Voeg het IP-adres en de domeinnaam toe.- Sla op met Control + O en druk op enter.- Sluit af met Control + X.Met deze stappen kun je het hosts-bestand aanpassen op Windows en Mac om ervoor te zorgen dat een domeinnaam naar een specifieke server wijst.


