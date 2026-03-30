# Hoe koppel ik een extern domein aan mijn KeurigOnline-pakket?

> Bron: https://help.keurigonline.nl/article/137-extern-domein-koppelen-aan-je-pakket

Heb je een domeinnaam bij een andere partij geregistreerd (bijv. TransIP, Cloudflare, GoDaddy) maar wil je die gebruiken met je KeurigOnline-pakket? Dan moet je de DNS-records bij je domeinprovider aanpassen zodat ze naar je KeurigOnline-server wijzen.

## Stappenplan

1. **Zoek het IP-adres van je pakket.** Log in op [Mijn KeurigOnline](https://mijn.keurigonline.nl), ga naar **Diensten > Pakketten** en noteer het IP-adres van je server (bijvoorbeeld `46.182.218.204`).
2. **Log in bij je domeinprovider.** Ga naar de DNS-instellingen of het zonebeheer van je domeinnaam.
3. **Verwijder oude A- en AAAA-records.** Verwijder alle bestaande DNS-records van het type A of AAAA met de naam `@` of `www`.
4. **Voeg nieuwe A-records toe.** Maak twee nieuwe A-records aan:

   | Naam | Type | Waarde |
   |------|------|--------|
   | `@` | A | het IP-adres van je pakket |
   | `www` | A | het IP-adres van je pakket |

5. **Voeg het domein toe in DirectAdmin.** Ga in DirectAdmin naar **Domeininstellingen (Domain Setup)** en voeg de domeinnaam toe aan je hostingpakket.
6. **Wacht op DNS-propagatie.** Na het opslaan duurt het meestal een paar minuten tot enkele uren voordat alles actief is.

## Resultaat

Je domeinnaam is nu gekoppeld aan je KeurigOnline-pakket, ook al wordt de domeinregistratie elders beheerd.

## Gerelateerde artikelen

- [Domeinnaam koppelen aan je pakket](domeinnaam-koppelen-aan-je-pakket.md)
- [DNS-records (A, AAAA, CNAME, MX, TXT)](dns-records-a-aaaa-cname-mx-txt.md)
- [Hoe kan ik de nameservers wijzigen van mijn domein?](../mijn-keurigonline/hoe-kan-ik-de-nameservers-wijzigen-van-mijn-domein.md)
