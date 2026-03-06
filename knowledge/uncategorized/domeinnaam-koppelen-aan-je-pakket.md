# Domeinnaam koppelen aan je pakket

> Bron: https://help.keurigonline.nl/article/126-domeinnaam-koppelen-aan-je-pakket

Is er een domeinnaam besteld zonder pakket? Dan is die nog niet gekoppeld. De domeinnaam staat dan op de standaard nameservers van KeurigOnline. Om de domeinnaam te koppelen aan een bestaand pakket, moet het IP-adres van de server ingevuld worden bij de A-records.

## Stap 1: Log in op Mijn KeurigOnlineGa naar [https://mijn.keurigonline.nl/](https://mijn.keurigonline.nl/) en log in met de gegevens (klantnummer + wachtwoord).

## Stap 2: Zoek het IP-adres van het pakket- Ga naar [Diensten > Pakketten](https://mijn.keurigonline.nl/diensten/pakketten)- Zoek het pakket op waar je het domein aan wilt koppelen- Je kunt hier het IP-adres van de server vinden (bijvoorbeeld 46.182.218.204  )## Stap 3: Ga naar domeinen en open DNS beheren- Ga naar [Diensten > Domeinen](https://mijn.keurigonline.nl/diensten/domeinen)- Klik op de groene knop **"Beheren"** naast het domeinnaam die je wilt koppelen- Op de detailpagina, klik op het tabblad **"DNS beheren"**## Stap 4: Verwijder oude recordsVerwijder alle bestaande records met naam @  of  * die van het type **A** of **AAAA** (IPv6).

## Stap 5: Voeg nieuwe A-records toeVoeg twee nieuwe A-records toe met het juiste IP-adres van het pakket.

**Voorbeeld:**

Naam: @
Type: A
Waarde: 46.182.218.204
Naam: *
Type: A
Waarde: 46.182.218.204
## Stap 6: Wachten op activatieDe wijziging is meestal binnen een paar minuten actief, maar het kan enkele uren duren. Dit heet DNS-propagatie.

## Klaar!De domeinnaam is nu gekoppeld aan het juiste pakket mits je deze ook hebt toegevoegd binnen het pakket zelf natuurlijk (onder DirectAdmin -> Domein instellingen / Domain setup). 


