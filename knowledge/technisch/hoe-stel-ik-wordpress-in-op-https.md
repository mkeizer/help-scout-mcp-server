# Hoe stel ik WordPress in op HTTPS

> Bron: https://help.keurigonline.nl/article/92-hoe-stel-ik-wordpress-in-op-https

Nadat er een SSL-certificaat is geïnstalleerd zal er binnen WordPress ook ingericht moeten worden dat er gebruik gemaakt wordt van https:// om het certificaat ook daadwerkelijk actief te maken.

Er zijn verschillende manieren om HTTPS in WordPress te activeren. De eenvoudigste methode is het gebruik van een plugin, maar je kunt het ook handmatig doen. Hieronder laten we beide methoden zien!

## Manier 1: WordPress HTTPS handmatig activerenHet activeren van SSL met een plugin is eenvoudig, maar kan nadelen hebben. Plugins die HTTPS/SSL activeren, beweren vaak dat HTTPS blijft werken, zelfs als de plugin wordt uitgeschakeld of verwijderd. Dit is echter niet altijd het geval, en als er iets misgaat met de plugin, kan HTTPS/SSL stoppen met werken.

Wil je dit voorkomen en ben je een beetje handig? Dan is het handmatig activeren van WordPress HTTPS een goede optie. Lees verder om te ontdekken hoe je HTTPS permanent kunt activeren!

### **Wijzig het WordPress-adres en siteadres**:- Ga in het linkermenu naar Instellingen -> Algemeen.![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664ef1c45940934e140f3c1a/file-kaf4dnGMLP.png)

- Zoek het WordPress-adres en Siteadres. Deze zullen waarschijnlijk momenteel beginnen met "[http://jouwdomeinnaam.nl](http://jouwdomeinnaam.nl)".![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664ef1f51f3fa9421e286ff8/file-s2l0sAgoWi.png)

- Verander deze naar "[https://jouwdomeinnaam.nl](https://jouwdomeinnaam.nl)".![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664ef218dd0f8c60bb3fc1e8/file-ELGhPw4AS7.png)

Je zal nu opnieuw in moeten loggen op WordPress, maar je zal direct zien dat het groene slotje actief is.

## Manier 2: WordPress HTTPS activeren met een pluginLet op! Wij kunnen niet ondersteunen bij het instellen van deze plugin.

De meest gebruikte plugin voor dit doel is "Really Simple SSL". Hieronder leggen we uit hoe je deze plugin kunt gebruiken om HTTPS/SSL op je WordPress-site te activeren.

### **Installatie van Really Simple SSL**:- Ga in het linkermenu naar Plugins.- Zoek naar "Really Simple SSL" in het zoekvenster.- Installeer en activeer de plugin zodra je deze vindt.### **Configuratie van Really Simple SSL**:- Ga naar Instellingen -> SSL.- Really Simple SSL zal automatisch controleren of er een SSL-certificaat aanwezig is en enkele optimalisaties uitvoeren.- Na de installatie kun je verschillende opties aan- of uitzetten.### **Belangrijke opties**:- **Mixed Content Fixer**: Dit is vooral handig als je website al veel content heeft. Door deze optie in te schakelen, wordt ervoor gezorgd dat alle content via SSL wordt geladen.- **301-redirect**: Bij oudere websites is het verstandig om deze optie toe te voegen. Dit zorgt ervoor dat alle links worden omgezet naar HTTPS in plaats van HTTP.### **Controle**:- Controleer of je website nog goed werkt.- Kijk in je browser of er HTTPS en een slotje bij de URL staan.
