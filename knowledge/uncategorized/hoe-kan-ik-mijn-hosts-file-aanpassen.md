# Hoe kan ik mijn hosts file aanpassen?

> Bron: https://help.keurigonline.nl/article/118-hoe-kan-ik-mijn-hosts-file-aanpassen

Met een hosts-bestand kun je een domeinnaam lokaal koppelen aan een specifiek IP-adres. Dit is handig als je een website wilt bekijken op een nieuwe server voordat de DNS is aangepast, bijvoorbeeld na een verhuizing.

## Wat is een hosts-bestand?

Een hosts-bestand is een bestand op je computer dat domeinnamen vertaalt naar IP-adressen. Je computer kijkt hier eerst, voordat het DNS wordt geraadpleegd. Zo kun je tijdelijk een domeinnaam naar een ander IP-adres laten wijzen, zonder dat andere bezoekers daar last van hebben.

## Hosts-bestand aanpassen op Windows

1. **Open Kladblok als administrator.** Zoek naar "Kladblok" via het startmenu, klik met de rechtermuisknop en kies "Als administrator uitvoeren".
2. **Open het hosts-bestand.** Ga naar Bestand > Openen en navigeer naar `C:\Windows\System32\drivers\etc\hosts`.
3. **Voeg een regel toe.** Voeg onderaan het IP-adres en de domeinnaam toe, bijvoorbeeld:
   ```
   192.168.0.1 keurigonline.nl
   192.168.0.1 www.keurigonline.nl
   ```
4. **Sla op.** Sla het bestand op.

## Hosts-bestand aanpassen op Mac

1. **Open Terminal.** Gebruik Spotlight (cmd + spatiebalk) en zoek naar "Terminal".
2. **Open het hosts-bestand.** Voer uit: `sudo nano /etc/hosts` en voer je wachtwoord in.
3. **Voeg een regel toe.** Voeg onderaan het IP-adres en de domeinnaam toe.
4. **Opslaan en afsluiten.** Druk op Control + O, dan Enter, dan Control + X.

## Belangrijk

Vergeet niet de aanpassingen te verwijderen zodra de verhuizing of het testen is voltooid. Zet een `#` voor de regel om deze tijdelijk uit te schakelen zonder te verwijderen:

```
#192.168.0.1 keurigonline.nl
```

## Gerelateerde artikelen

- [Waarom kan ik mijn domeinnaam niet bereiken?](../domeinnamen/waarom-kan-ik-mijn-domeinnaam-niet-bereiken.md)
- [Hoe verwijder ik de cache van mijn browser](../technisch/hoe-verwijder-ik-de-cache-van-mijn-browser.md)
