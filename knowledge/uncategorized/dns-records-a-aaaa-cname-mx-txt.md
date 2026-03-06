# DNS-records (A, AAAA, CNAME, MX, TXT)

> Bron: https://help.keurigonline.nl/article/136-dns-records-a-aaaa-cname-mx-txt

DNS-records zijn de bouwstenen die bepalen wat er met jouw domeinnaam gebeurt. Ze sturen bezoekers naar de juiste website, zorgen dat e-mail aankomt en maken verificaties mogelijk. Hieronder vind je een overzicht van de meest gebruikte records, wat ze doen en wanneer je ze inzet. Zo weet je precies welk record je nodig hebt.

## Hoe vul je DNS-records in?Ons systeem **normaliseert** je invoer. Dat betekent dat wat jij intypt niet altijd letterlijk zo wordt opgeslagen. Hieronder zie je per type hoe het werkt bij **keurigonline.nl**.




  - 
    **@** → staat voor de root van het domein.


    Je typt in:


    `@ → 203.0.113.5`
    Systeem slaat op:


    `keurigonline.nl. → 203.0.113.5`
  

  - 
    **Subdomein kort noteren** → je hoeft niet steeds de hele domeinnaam uit te typen, wij vullen dit aan.


    Je typt in:


    `mail → 203.0.113.6`
    Systeem slaat op:


    `mail.keurigonline.nl. → 203.0.113.6`
  

  - 
    **FQDN (volledige domeinnaam)** → je mag ook de volledige naam invullen. Een punt aan het eind is toegestaan, maar niet verplicht.


    Je typt in:


    `blog`
    Systeem slaat op:


    `blog.keurigonline.nl.`    
  

  - 
    **URL** → alleen relevant voor CNAME of redirect-records. Wij strippen `https://` en slashes aan het eind.


    Je typt in:


    `shop → https://shops.example.com/`
    Systeem slaat op:


    `shop.keurigonline.nl. → shops.example.com.`
  

  - 
    **IP-adres** → voor A (IPv4) of AAAA (IPv6) records kun je direct een IP-adres invullen.


    Je typt in:


    `@ → 203.0.113.5`
    Systeem slaat op:


    `keurigonline.nl. → 203.0.113.5`
    Je typt in:


    `@ → 2001:db8::1`
    Systeem slaat op:


    `keurigonline.nl. → 2001:db8::1`
  

## A-record (IPv4)Het meest gebruikte record. Een A-record  koppelt jouw domeinnaam aan een **IPv4-adres**. Dit is een numeriek adres zoals 192.0.2.1  dat de server van je website aanwijst.

**Wat het doet:**

- Verwijst een domein naar een IPv4  -adres.**Wanneer gebruiken:**

- Als je website bereikbaar moet zijn via een IPv4  -adres.- Bijvoorbeeld: jouwdomein.nl → 192.0.2.1  .## AAAA-record (IPv6)Een AAAA-record  lijkt op een A-record  , maar wijst naar een **IPv6-adres**. IPv6-adressen zien er langer uit, zoals 2001:db8::1  . Dit maakt je domein bereikbaar voor gebruikers die IPv6 gebruiken.

**Wat het doet:**

- Verwijst een domein naar een IPv6  -adres.**Wanneer gebruiken:**

- Als je server een IPv6  -adres heeft en je bezoekers ook via IPv6 toegang wilt geven.- Bijvoorbeeld: jouwdomein.nl → 2001:db8::1  .## CNAME-recordEen CNAME-record  (Canonical Name) maakt een alias van een andere domeinnaam. In plaats van een IP-adres te koppelen, wijs je een domeinnaam door naar een andere domeinnaam.

**Wat het doet:**

- Maakt een alias van een andere domeinnaam (naam → naam  in plaats van naam → IP  ).**Wanneer gebruiken:**

- Voor subdomeinen die je wilt laten doorverwijzen naar een hoofddomein of externe service.- Bijvoorbeeld: www.jouwdomein.nl → jouwdomein.nl  of blog.jouwdomein.nl → sites.example.com  .## MX-recordEen MX-record  (Mail Exchange) bepaalt welke mailservers e-mail voor jouw domein ontvangen. Zonder MX-records komt er geen mail binnen.

**Wat het doet:**

- Stuurt inkomende e-mail naar de juiste mailservers.**Wanneer gebruiken:**

- Altijd nodig wanneer je e-mail wilt ontvangen via je domein.- Bijvoorbeeld: 10 mail.jouwdomein.nl  (waar 10  de prioriteit aangeeft).## TXT-recordEen TXT-record  slaat vrije tekst op bij een domeinnaam. In de praktijk wordt dit gebruikt voor beveiliging, verificatie en e-mailauthenticatie.

**Wat het doet:**

- Slaat tekst op die door andere systemen kan worden uitgelezen.- Veel gebruikt voor SPF  , DKIM  en DMARC  -records.**Wanneer gebruiken:**

- Voor domeinverificatie, bijvoorbeeld bij Google Workspace of Microsoft 365.- Voor mailbeveiliging, zodat ontvangers weten dat jouw e-mail betrouwbaar is.- Voorbeeld SPF-record: v=spf1 include:_spf.google.com ~all **Tip:**

Wil je hulp bij het instellen van DNS-records of heb je vragen over e-mailconfiguratie of verificatie? Bezoek [help.keurigonline.nl](https://help.keurigonline.nl) of stuur een mail naar [info@keurigonline.nl](mailto:info@keurigonline.nl).


