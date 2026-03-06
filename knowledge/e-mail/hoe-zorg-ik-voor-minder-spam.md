# Hoe zorg ik voor minder spam?

> Bron: https://help.keurigonline.nl/article/67-hoe-zorg-ik-voor-minder-spam

Om te beginnen met het instellen van een doorsturing moet je zijn ingelogd op DirectAdmin. De DirectAdmin-omgeving is altijd te benaderen via; https://jedomeinnaam.nl:2222

Zodra je bent ingelogd op DirectAdmin krijg je een navigatiebalk te zien. Klik op "Spamassassin instellen".

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664cb7b6d593d719515c96ef/file-xrJSe2qCzM.png)

Het kan zijn dat SpamAssassin onder je account nog niet is geactiveerd. In dat geval zal je een grote groene knop zien staan met &#39;Spamassassin Inschakelen&#39;. Doe dit eerst.

![](https://s3.amazonaws.com/helpscout.net/docs/assets/5acb572d0428630750923499/images/664da44f5940934e140f3ae3/file-Yeg7nujDx4.png)

Je kan zelf de zwaarte instellen van de spamfilter. Elke e-mail wordt gewaardeerd op bepaalde kenmerken en krijgt punten. Hoe lager de punten staan ingesteld onder "Welke score wilt u gebruiken?", hoe meer e-mail als SPAM zal worden gemarkeerd.

Standaard raden we de volgende instellingen aan:

- Waar moet de spam heen: Gebruiker Spambox- Hoge score blok: Ja, 9- Globale drempel? Ja, laag (5.0)- Onderwerp herschrijven? Ja- Spam bezorging:  Bijlagen gebruikenBinnen SpamAssassin kan je ook een whitelist en een blacklist aanmaken. E-mailadressen op de whitelist worden altijd doorgelaten terwijl e-mailadressen op de blacklist altijd worden geblokkeerd. 

Als je bijvoorbeeld alle e-mail van KeurigOnline altijd wil ontvangen vul je in bij de whitelist "*@keurigonline.nl"


