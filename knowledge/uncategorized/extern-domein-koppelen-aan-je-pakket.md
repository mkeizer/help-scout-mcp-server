# Extern domein koppelen aan je pakket

> Bron: https://help.keurigonline.nl/article/137-extern-domein-koppelen-aan-je-pakket

Heb je een domeinnaam bij een andere partij geregistreerd, maar wil je die gebruiken met je KeurigOnline-pakket? Volg dan onderstaande stappen om de domeinnaam extern te koppelen.

### Stap 1: Zoek het IP-adres van je pakket- Log in op [Mijn KeurigOnline](https://mijn.keurigonline.nl/)- Ga naar **Diensten → Pakketten**- Zoek het pakket waar je de domeinnaam aan wilt koppelen- Noteer het **IP-adres van de server** (bijvoorbeeld 46.182.218.204 )### Stap 2: Log in bij je domeinproviderLog in bij de partij waar je domeinnaam is geregistreerd (bijv. TransIP, Cloudflare, GoDaddy, etc.). Zoek daar het onderdeel **DNS-instellingen** of **Zonebeheer**.

### Stap 3: Verwijder oude A- en AAAA-recordsVerwijder alle bestaande DNS-records van het type **A** of **AAAA** met de naam @  of * . (Dit zorgt ervoor dat het domein straks alleen naar je KeurigOnline-pakket verwijst.)

### Stap 4: Voeg nieuwe A-records toeMaak twee nieuwe A-records aan met het IP-adres van je pakket:

NaamTypeWaarde@A46.182.218.204*A46.182.218.204Gebruik het IP-adres dat hoort bij jouw pakket, niet het voorbeeld hierboven.

### Stap 5: Controleer of het domein ook is toegevoegd in DirectAdminGa in je KeurigOnline-beheerpaneel naar **DirectAdmin → Domeininstellingen (Domain Setup) **en controleer of de domeinnaam daar is toegevoegd aan je hostingpakket.

### Stap 6: Wachten op DNS-propagatieNa het opslaan van de DNS-wijzigingen duurt het meestal een paar minuten tot enkele uren voordat alles actief is. Dit proces heet **DNS-propagatie**.

### Klaar!Je domeinnaam is nu gekoppeld aan je KeurigOnline-pakket, ook al wordt de domeinregistratie elders beheerd.


