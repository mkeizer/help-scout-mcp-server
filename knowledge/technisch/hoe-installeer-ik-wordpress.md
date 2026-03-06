# Hoe installeer ik WordPress?

> Bron: https://help.keurigonline.nl/article/57-hoe-installeer-ik-wordpress

In deze WordPress handleiding leer je vrijwel alles wat je met het krachtige WordPress kan: een complete website bouwen.

We beginnen bij het begin. Na het volgen van alle stappen heb jij een mooie, veilige, snelle en stabiele WordPress website staan!

## Hoofdstuk 1: De installatieJe kan WordPress vaak semi-automatisch installeren via je webhosting-provider. Dit scheelt een hoop gedoe en werkt vaak net zo fijn. Ook qua veiligheid hoef je niets te missen, aangezien tools zoals Installatron het ook mogelijk maken om een aangepaste admin-gebruiker en database prefix te kiezen.

Je kan WordPress vaak semi-automatisch installeren via je webhosting-provider. Dit scheelt een hoop gedoe en werkt vaak net zo fijn. Ook qua veiligheid hoef je niets te missen, aangezien tools zoals Installatron het ook mogelijk maken om een aangepaste admin-gebruiker en database prefix te kiezen.

Als je handmatig moet of wil installeren dan kan dat uiteraard ook. We zullen beide manieren behandelen:

**WordPress Installeren met Installatron**

Als je een webhostingaccount hebt met Installatron dan ga je als volgt te werk:

- Login in je DirectAdmin omgeving en kies eventueel de gewenste domeinnaam- Scroll naar beneden en klik op het logo van WordPress. Als deze er niet staat klik je op “Installatron Applications Installer” en daarna op het logo van WordPress- Klik op “Installeer deze applicatie”- Het veld domein staat standaard ingevuld op www.<jouwdomeinnaam>, dit is in de meeste gevallen prima.- Het veld pad is standaard leeg, tenzij Installatron een andere applicatie aantreft in jouw public_html map. Laat dit veld leeg als je WordPress direct op jouw domeinnaam wilt draaien. Als je WordPress wil draaien op <jouwdomein>/blog dan vul je ‘blog’ in als pad.- De versie staat standaard op de laatst mogelijke, wat uiteraard ook aan te raden is.- Lees en accepteer de gebruikersvoorwaarden- Kies voor “Niet automatisch updaten”. Dit is wel aan te raden voor kleine/standaard blogs zonder veel poespas.- Kies voor “Database instellingen automatisch beheren”.- Vul je administrator gebruikersnaam in, bij voorkeur iets anders dan ‘admin’- Vul een sterk wachtwoord in of laat het willekeurig aangemaakte wachtwoord staan- Verander eventueel je e-mailadres- Geef je website titel op- Kies voor “Nee, geen multi site”- Klik op Installeren- Binnen 30 seconden is jouw WordPress klaar voor gebruik. Je krijgt een e-mail ter bevestiging waar ook je gebruikersgegevens in staan.**WordPress handmatig installeren**

Als je WordPress met de hand wil installeren heb je de volgende zaken nodig:

- Webhosting met minimaal PHP 5.3 en MySQL 5- FTP Account- DatabasegegevensAls je deze gegevens bij de hand hebt ga je als volgt te werk:

- Ga naar de downloadpagina van WordPress en download de laatste versie van WordPress.- Pak het ZIP bestand uit en zet de bestanden op je bureaublad- Open je favoriete FTP client (als je nog geen hebt, download dan FileZilla) en maak verbinding met de server- Open links, op je eigen computer, de map wordpress op je bureaublad. Open rechts de map public_html van de juiste domeinnaam (of soms heet die htdocs)- Sleep alle bestanden van links naar rechts- Als hij helemaal klaar is ga je naar je domeinnaam en zie je als het goed is de WordPress installer- Klik op de knop “Create a Configuration File” en daarna op “Let’s Go!”- Vul de database gegevens in zoals je die hebt aangemaakt. De database server is in 99% van de gevallen ‘localhost’. Vul bij prefix 4 willekeurige letters in en daarna een _, bijvoorbeeld ‘htwp_’.- Klik op “Submit” en daarna “Run the Install”- Geef je website titel op- Vul je administrator gebruikersnaam in, bij voorkeur iets anders dan ‘admin’- Vul een sterk wachtwoord in- Vul je e-mailadres in- Vink het laatste vinkje uit als je nog niet gevonden wilt worden in de zoekmachines. Je kan dit later altijd weer aanzetten.- Klik op “Install WordPress”- Als alles is goed gegaan krijg je een bevestiging van de installatie. Je kan nu inloggen in je Dashboard.## Hoofdstuk 2: ConfigurerenNa een succesvolle installatie van WordPress is het tijd om je installatie naar wens aan te passen. We gaan in dit hoofdstuk van de Nederlandse WordPress Handleiding alle pagina’s bij langs die je kan vinden onder de knop “Instellingen”.

**Algemeen**

Hier vind je de algemene instellingen. Hier kan je de websitetitel en de ondertitel aanpassen. De ondertitel wordt in veel thema’s niet getoond, maar kan wel gevonden worden door de zoekmachines. Zet hier dus niet zomaar wat neer!

De rest van de instellingen zullen standaard goed staan.

Wat nog wel een belangrijkste instelling is, is het vinkje achter “Lidmaatschap”. Vind “Iedereen kan registreren” aan als je wilt dat je bezoekers zich kunnen registreren om zo reacties achter te laten. Overigens is dit registreren niet per sé verplicht om te reageren. Hier komen we later op terug.

**Schrijven**

In de categorie schrijven kan je de standaarden instellen voor nieuwe berichten. Zo kan je kiezen in welke categorie hij standaard komt en welk formaat hij standaard krijgt. Voor links kan je instellen in welke categorie hij komt.

Categorieën kan je aanmaken via “Berichten > Categorieën” en “Links > Categorieën”.

De “Bericht via e-mail” functie is handig voor als je op reis bent en niet overal kan of wil inloggen op je WordPress omgeving. Zo kan je e-mails aan een speciaal geprepareerd e-mailadres sturen om deze automatisch te laten inladen door WordPress.

**Lezen**

Hier vind je één van de belangrijkste instellingen als je van je blog een website wilt maken. Hier kan je namelijk uitzetten dat je homepage de laatste berichten toont. Als je je berichten elders op de website wilt tonen en je op de home een andere pagina wilt laten zien dan kies je voor de optie “Een statische pagina”. Selecteer daarna de pagina die je als voorpagina wil en een pagina die je als berichtpagina wil laten dienen.

Hier kan je ook instellen of je gevonden wilt kunnen worden door de zoekmachines.

**Reacties**

De belangrijkste instelling op de reactie pagina is “Sta toe dat bezoekers kunnen reageren op nieuwe artikelen”. Hiermee stel je een standaard in voor nieuwe pagina’s en berichten. Als je een normale website bouwt zonder mogelijkheden om te reageren kan je dit vinkje dus uitzetten.

Als je wel reacties wil toestaan dan kan je daaronder nog kiezen om het vinkje voor “Gebruikers moeten ingelogd zijn om te kunnen reageren” uit te zetten. Het voordeel is dat je waarschijnlijk meer reacties krijgt, omdat het makkelijker wordt. Het nadeel is natuurlijk dat het een stuk anoniemer is en dat de kwaliteit van de reacties achteruit kan gaan.

Wat in dat laatste geval, en voor sommige website sowieso, handig is om aan te vinken is de optie achter “Voor een reactie verschijnt”: “Een administrator moet de reactie altijd toelaten”. Zo worden alle reacties netjes in een wachtrij gezet en kan je zelf bepalen welke reactie getoond mag worden en welke niet.

**Media**

Hier stel je de standaarden in voor de afbeeldingen in de mediabibliotheek.

Ook kan je het upload pad instellen via WordPress gebruikt voor de media. Als je problemen hebt met uploaden dan is dit de eerste instelling die je moet controleren.

**Permalinks**

Hier stel je de Permalinks in. Het is belangrijk dat je dit sowieso één keer doet, anders krijg je nooit mooie URL’s.

In de meeste gevallen volstaat de optie “Jaar, maand en naam”. Maar je kan er ook voor kiezen om de dag ook nog te tonen.

Tip: Na het installeren van veel plug-ins dien je op de pagina Permalinks opnieuw op “Wijzigingen opslaan” te klikken, ook al wijzig je niets! Hiermee zorg je er voor dat de nieuwe plug-in zijn mooie URL’s ook gaan werken.

## Hoofdstuk 3: Template installerenIn dit hoofdstuk leer je hoe je een thema  moet installeren. Gratis thema’s kan je zonder enige kennis van FTP installeren via de wp-admin van je WordPress installatie. Betaalde thema’s moet je vaak installeren via FTP. Kleinere thema’s kan je ook installeren via de wp-admin.

Gratis WordPress thema zoeken en installeren

- Log eerst in in je dashboard- Ga naar Weergave en dan Thema’s- Klik op de tab Thema’s installeren- Selecteer je zoekopties en klik op “Thema’s zoeken”- Of: Klik op “Uitgelicht” of “Nieuwste” in het submenu bovenaan.- Klik bij het gewenste thema op “Nu Installeren”- Klik op “Live voorbeeld” of kies gelijk voor “Activeren”- Ga naar je homepage en ontdek het verschil!De meeste thema’s bieden mogelijkheden om de template aan te passen via “Weergave > Theme Options” en vaak ook “Weergave > Bewerker”.

Betaald WordPress thema installeren

Als je een betaalde thema hebt gedownload van bijvoorbeeld ThemeForest, dan krijg je meestal een zip bestand met daarin het thema. Dit zip bestand bevat meestal de bron bestanden, een handleiding, en nóg een zip bestand. Dat zip bestand moet je uploaden naar WordPress:

- Log eerst in in je dashboard- Ga naar Weergave en dan Thema’s- Klik op de tab “Thema’s installeren”- Klik op “Uploaden” in het submenu bovenaan- Zoek het zip bestand op via bladeren en klik op uploaden- Klik op “Live voorbeeld” of kies gelijk voor “Activeren”- Ga naar je homepage en ontdek het verschil!WordPress thema installeren via FTP

Soms kan het ook zo zijn dat het automatisch uploaden en installeren niet werkt. Dit kan komen door een kleine upload limiet van je hoster, een configuratie fout in de temp map of een te langzame internetverbinding in combinatie met de upload time-out. In dat geval dien je het thema handmatig up te loaden naar de juiste map:

- Pak de zip met de templat er in uit, en zorg dat je een map hebt die de php bestanden bevat- Log in via FTP met je favoriete FTP client (of download FileZilla)- Zoek op je computer (links) de map op die uit je template zip kwam, open hem niet- Ga op de server (rechts) naar de map: wp-content/plugins (zit waarschijnlijk onders iets als domains/jouwdomeinnaam/public_html, of htdocs)- Sleep de map zelf (dus inclusief inhoud) naar rechts zodat hij bij de standaard templates (“twentyeleven”, twentytwelve”) komt te staan.- Log in in je dashboard- Ga naar Weergave en dan Thema’s- Klik op “Live voorbeeld” of kies gelijk voor “Activeren” onder je nieuwe thema- Ga naar je homepage en ontdek het verschil!## Hoofdstuk 4: Plug-ins installerenEr zijn legio plug-ins te vinden in de database van WordPress. Voor elke oplossing, koppeling, functie of widget is bijna wel een oplossing. Meestal zelfs meerdere. Hoe weet je nou waar je op moet zoeken en welke je moet hebben?

In dit hoofdstuk leer je hoe je de plugins zoekt en installeert, en hoe je de meest essentiële plugins moet instellen.

Plugins zoeken en installeren

- Ga naar Plugins > Nieuwe plugin- Typ een zoekopdracht in- Of: klik op Uitgelichte, Populairste of Nieuwste- Klik bij de gewenste plugin op “Nu Installeren”- Als de installatie voltooid is klik je op “Activeren”Klaar, de plugin is nu klaar voor gebruik

Aanbevolen plugins

WordPress SEO by Yoast

De SEO plugin van Joost de Valk is eigenlijk een must voor elke WordPress installatie. Deze plugin zorgt er in grote lijnen voor dat Google je website goed kan indexeren. Natuurlijk is WordPress out of the box al redelijk zoekmachine-vriendelijk, maar deze plugin geeft net even wat extra’s.

InstallatieZoek op SEO Yoast en installeer de plugin “WordPress SEO” door Joost de valk.

InstellingenHet belangrijkste is dat je de homepage hier voorziet van mooie META informatie. Als je je homepage als berichtenpagina hebt ingesteld heb je daar namelijk anders geen toegang tot. Ga daarvoor naar Titels & Meta’s en dan tabblad Home.

Eigenlijk staan de meeste instellingen van deze plugin al goed.

Als je last hebt van lelijke titels ga je naa “Titels & Meta’s” en vink je “Forceer herschrijven titels” aan.

BackWPup

Goeie back-ups is heel belangrijk. Zeker bij een open-source applicatie als WordPress waar van alles fout kan gaan tijdens het updaten. Ook bestaan er altijd potentiële veiligheidsrisico’s waardoor je website offline kan gaan.

Met BackWPup haal je een tool binnen die volledig automatisch back-ups maakt en voor je weg zet op de lokale schijf, een externe FTP server of zelfs via Dropbox. Ik heb al eerder geschreven over deze plugin, dat lees je hier.

Installatie

Zoek op BackWPup en installeer de plugin “BackWPup” door Daniel Hüsken.

Instellingen

Als je een nieuwe taak aanmaakt wordt standaard de gehele WordPress installatie meegenomen. Je kan kiezen voor 5 export mogelijkheden:

Lokale map: gebruik het voorbeeld die er onder staat of vul zelfs iets in (meestal /home/GEBRUIKERSNAAM/)

Back-up naar e-mail: stuur eenvoudig een e-mail met een back-up. Niet aan te raden als je een grote website hebt.

Back-up naar FTP-server: ideaal om meerdere back-ups te bewaren van meerdere WordPress websites. Gebruik een FTP server of een netwerk schijf thuis met ingebouwde FTP server.

Back-up naar Dropbox: Koppel het script met Dropbox en hij zet de back-ups automatisch weg in je zelf uit te kiezen Dropbox map. Daarna zullen je aangesloten apparaten hem uiteraard ook zo snel mogelijk binnen halen. Zo heb je meerdere back-ups van je back-up!

Back-up naar Sugarsync, Amazon S3, Google Cloud Storage, Microsoft Azure en Rackspace Cloud: Dit zijn meer geavanceerde diensten die niet aan te raden zijn voor “beginners”.

## Hoofdstuk 5: Content en menu&#39;sIn dit hoofdstuk leer je pagina’s en menu’s beheren. Een pagina hoeft namelijk niet per sé in het menu te staan. Maar ook andersom geldt: een menu item hoef niet per sé een pagina te zijn.

Als je niet met menu’s werkt zal WordPress automatisch een menu maken waarin je pagina’s op alfabetische volgorde getoond worden. Eventueel kan je de volgorde zelf bepalen met de eigenschap “Volgorde”.

Zodra je een menu gekozen hebt op de pagina “Weergave > Menu’s” bij de instelling “Primary Menu” wordt je nieuw aan te maken menu getoond.

Een menu aanmaken in WordPress

Een menu aanmaken is heel simpel. Volg de volgende stappen:

- Ga naar Weergave en dan naar Menu’s- Klik bovenin op het tabje met de “+”- Vul de menunaam in, bijvoorbeeld “Hoofdmenu”- Klik op “Menu aanmaken”- Zoek links naar de pagina’s die je in je menu wilt tonen, selecteer ze en klik op “Aan menu toevoegen”- of zoek links de categorieën op van je blogposts op, selecteer ze en klik op “Aan menu toevoegen”- Sleep de menu-items op de gewenste volgorde.- Klik op “Menu opslaan”- Selecteer linksboven je nieuwe menu “Hoofdmenu” en klik op “Opslaan”Tip: Door een menu-item naar rechts te slepen wordt het een sub-item van het menu-item er boven!

Pagina’s aanmaken in WordPress

Het aanmaken van pagina’s is heel simpel. Volg onderstaande stappen om een pagina aan te maken:

- Ga naar “Pagina’s” en dan naar “Nieuwe Pagina”- Vul de titel in in de grote balk- Controleer eventueel de permalink, en wijzig waar nodig.- Schijf de content van de pagina in het grote vak, voeg eventueel media toe.- Kies rechts optioneel het sjabloon en kies bij “Hoofd” alleen een pagina als de huidige pagina een sub-pagina moet worden- Klik op  ”Publiceren” om de pagina op te slaan.## Hoofdstuk 6: BeveiligenEr zijn een aantal basis regels waar je je aan dient te houden om je website veilig te houden. Ze zijn niet allemaal verplicht maar probeer er zoveel mogelijk op te volgen. Ook zijn er plug-ins die je kunnen helpen om de veiligheid te controleren of zelfs om je website te bewaken.

Basis regels voor een veilige WordPress website

- **Houd alles up to date!**- Download nooit illegale templates of plug-ins.- Gebruik geen simpele wachtwoorden- Verwijder onnodige beheerders- Verwijder uitgeschakelde plug-ins en thema&#39;s- Laat geen installatie of test-bestanden achter op de FTP- Installeer één website per domein- Zet meerdere WordPress website in gescheiden pakketten- Maak geregeld back-ups## Hoofdstuk 7: VersnellenHet sneller maken van een WordPress kan op veel manieren. Het makkelijkst is om er een plug-in in te zetten. De plug-in die we aanraden door zijn eenvoud is "WP Super Cache" van Automattic. Automattic is ook het bedrijf achter WordPress.

Na het inschakelen van de plug-in moet de cache nog aangezet worden. Dit doe je bij Instellingen > WP Super Cache. Klik op On, sla het op, en je bent eigenlijk al klaar.

Er zijn wel meerdere opties om de cache nog ietsje sneller te laden, maar hier komt vaak enige technische kennis bij kijken. De meest simpele vorm van caching is vaak al voldoende om bezoekers supersnel een pagina te serveren.


