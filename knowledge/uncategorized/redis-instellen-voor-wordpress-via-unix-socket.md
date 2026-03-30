# Hoe stel ik Redis in voor WordPress via Unix socket?

> Bron: https://help.keurigonline.nl/article/132-redis-instellen-voor-wordpress-via-unix-socket

Redis is een snelle in-memory database die de prestaties van je WordPress-website aanzienlijk kan verbeteren. Caching-plugins zoals Redis Object Cache, LiteSpeed Cache en W3 Total Cache kunnen Redis gebruiken om gegevens tijdelijk op te slaan en zo de laadtijden te verkorten.

Op onze servers is Redis beschikbaar via een Unix socket. In deze handleiding leggen we uit hoe je Redis activeert en configureert. Je kunt maar een van de drie plugins hieronder gebruiken, niet tegelijkertijd.

## Stap 1: Redis activeren in DirectAdmin

1. **Open de Redis-pagina.** Log in op DirectAdmin en ga naar `https://jouwdomein.nl:2222/evo/user/redis` (vervang `jouwdomein.nl` door je eigen domein).
2. **Schakel Redis in.** Zet Redis op **Ingeschakeld**.
3. **Noteer het socketpad.** Bijvoorbeeld `/home/USERNAME/.redis/redis.sock` (vervang `USERNAME` door je hostinggebruikersnaam).

Zie je geen optie om Redis in te schakelen? Neem dan contact met ons op, dan activeren we dit voor je.

## Stap 2: WordPress configureren

Kies hieronder de plugin die je gebruikt.

### Optie A: Redis Object Cache

1. **Installeer de plugin.** Ga in WordPress naar **Plugins > Nieuwe plugin**, zoek op "Redis Object Cache", installeer en activeer.
2. **Bewerk wp-config.php.** Voeg deze regels toe boven de regel "That's all, stop editing!":
   ```php
   // Redis via Unix socket
   define( 'WP_REDIS_SCHEME', 'unix' );
   define( 'WP_REDIS_PATH', '/home/USERNAME/.redis/redis.sock' );

   // Unieke prefix en database (voorkomt conflicten)
   define( 'WP_REDIS_PREFIX', 'mijnsite_' );
   define( 'WP_REDIS_DATABASE', 0 );

   // Timeouts
   define( 'WP_REDIS_TIMEOUT', 1 );
   define( 'WP_REDIS_READ_TIMEOUT', 1 );
   ```
   Pas `USERNAME` en `WP_REDIS_PREFIX` aan naar jouw situatie.
3. **Activeer Object Cache.** Ga naar **Instellingen > Redis** en klik op **Enable Object Cache**. Controleer of de status aangeeft dat Redis actief is.

### Optie B: LiteSpeed Cache

1. **Installeer de plugin.** Zoek op "LiteSpeed Cache", installeer en activeer.
2. **Configureer Redis.** Ga naar **LiteSpeed Cache > Cache > Object** en stel in:
   - **Object Cache:** On
   - **Method:** Redis
   - **Host:** `/home/USERNAME/.redis/redis.sock`
   - **Port:** 0
   - **Default Object Lifetime:** 360
   - **Username en Password:** leeg laten
   - **Redis Database ID:** 0
3. **Controleer.** Sla op en controleer in het Diagnostics-gedeelte of Redis verbonden is.

### Optie C: W3 Total Cache

1. **Installeer de plugin.** Zoek op "W3 Total Cache", installeer en activeer.
2. **Activeer Redis.** Ga naar **Performance > General Settings**, scroll naar Object Cache en kies bij Method: **Redis**. Klik op **Save all settings**.
3. **Stel het socketpad in.** Ga naar **Performance > Object Cache** en vul in:
   - **Redis Database ID:** 0
   - **Redis Socket Path:** `/home/USERNAME/.redis/redis.sock`
   Klik op **Save all settings**.
4. **Controleer.** Ga naar **Performance > Dashboard** en controleer of de Redis-verbinding actief is.

## Gerelateerde artikelen

- [Kan ik gebruik maken van Redis?](../technisch/kan-ik-gebruik-maken-van-redis.md)
- [Waarom is mijn WordPress website langzaam?](../technisch/waarom-is-mijn-wordpress-website-langzaam.md)
- [Hoe installeer ik WordPress?](../technisch/hoe-installeer-ik-wordpress.md)
