# Redis instellen voor WordPress via Unix socket

> Bron: https://help.keurigonline.nl/article/132-redis-instellen-voor-wordpress-via-unix-socket

Redis is een snelle in-memory database die gebruikt kan worden om de prestaties van je WordPress-website aanzienlijk te verbeteren. Veel caching-plugins, zoals **Redis Object Cache**, **LiteSpeed Cache** en **W3 Total Cache**, kunnen Redis gebruiken om gegevens tijdelijk op te slaan en zo de laadtijden te verkorten.

Op onze servers is Redis beschikbaar via een Unix socket. In deze handleiding leggen we uit hoe je Redis activeert in DirectAdmin en hoe je het kunt configureren in WordPress. De activatiestappen in DirectAdmin zijn voor alle plugins hetzelfde. Daarna vind je per plugin specifieke instructies.

Let op! Je kan maar 1 van de 3 opties gebruiken, niet tegelijkertijd.

## Redis activeren in DirectAdmin (voor alle plugins)- Log in op DirectAdmin:https://jouwdomein.nl:2222/evo/user/redis
*(Vervang **jouwdomein.nl*    * door het domein van je hostingaccount)*

- Zet **Redis** op **Ingeschakeld**.- Noteer het **pad naar het Redis socketbestand**, bijvoorbeeld:/home/USERNAME/.redis/redis.sock
*(Vervang **USERNAME*    * later in de configuratie door je hostinggebruikersnaam)*

**Let op:** Zie je geen optie om Redis in te schakelen? Neem dan contact met ons op, zodat we dit voor je kunnen activeren.

## Redis instellen in WordPressNa het activeren van Redis in DirectAdmin kun je deze koppelen aan WordPress.

De exacte stappen verschillen per plugin, maar het doel is hetzelfde: je website verbinden met het Redis socketbestand zodat object caching gebruikt kan worden. Hieronder vind je instructies per plugin.

Redis Object Cache- Zorg dat je de stap hierboven (Redis activeren in DirectAdmin (voor alle plugins)) hebt doorlopen- **Plugin installeren**- Ga in WordPress naar **Plugins > Nieuwe plugin**.- Zoek op **Redis Object Cache**.- Klik op **Nu installeren** en daarna op **Activeren**.- **wp-config.php aanpassen**

Voeg deze regels toe **boven** /* That&#39;s all, stop editing! */    :

// Redis via Unix socket
define( &#39;WP_REDIS_SCHEME&#39;, &#39;unix&#39; );
define( &#39;WP_REDIS_PATH&#39;, &#39;/home/USERNAME/.redis/redis.sock&#39; );

// Unieke prefix en database (voorkomt conflicten)
define( &#39;WP_REDIS_PREFIX&#39;, &#39;mijnsite_&#39; );
define( &#39;WP_REDIS_DATABASE&#39;, 0 ); // Kies tussen 0-15

// Timeouts
define( &#39;WP_REDIS_TIMEOUT&#39;, 1 );
define( &#39;WP_REDIS_READ_TIMEOUT&#39;, 1 ); 
*(Pas **USERNAME*    * en **WP_REDIS_PREFIX*    * aan naar jouw situatie.)*

- **Object Cache inschakelen**- Ga naar **Instellingen > Redis**.- Klik op **Enable Object Cache**.- Controleer of bij **Status** staat dat Redis actief is.## LiteSpeed Cache- Zorg dat je de stap hierboven (Redis activeren in DirectAdmin (voor alle plugins)) hebt doorlopen- **Plugin installeren**- Ga naar **Plugins > Nieuwe plugin**, zoek op **LiteSpeed Cache**, installeer en activeer.- **Redis inschakelen in LiteSpeed**- Ga naar **LiteSpeed Cache > Cache > Object**.

Zet **Object Cache** op **On**.

Stel de volgende waarden in:

- **Method**: Redis- **Host**: /home/USERNAME/.redis/redis.sock - **Port**: Aanpassen naar 0- **Default Object Lifetime**: 360- **Username**: leeg laten- **Password**: leeg laten- **Redis Database ID**: 0- Sla de instellingen op en controleer in het **Diagnostics**-gedeelte of Redis verbonden is.## W3 Total Cache- Zorg dat je de stap hierboven (Redis activeren in DirectAdmin (voor alle plugins)) hebt doorlopen- **Plugin installeren**- Ga naar **Plugins > Nieuwe plugin**, zoek op **W3 Total Cache**, installeer en activeer.- **Redis activeren in W3TC**- Ga naar **Performance > General Settings**.- Scroll naar **Object Cache** en kies bij **Method**: **Redis**.- Klik op **Save all settings**.- **Redis pad instellen**- Ga naar **Performance > Object Cache**.- Vul bij **Redis Database ID**: 0 *(of ander nummer indien meerdere sites)*.- Vul bij **Redis Socket Path**:/home/USERNAME/.redis/redis.sock
- Klik op **Save all settings**.Controleer via **Performance > Dashboard** of de Redis-verbinding actief is.


