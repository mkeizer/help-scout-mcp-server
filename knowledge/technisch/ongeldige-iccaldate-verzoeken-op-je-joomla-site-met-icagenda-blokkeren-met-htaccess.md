# Ongeldige iccaldate-verzoeken op je Joomla-site (met iCagenda) blokkeren met .htaccess

> Bron: https://help.keurigonline.nl/article/128-ongeldige-iccaldate-verzoeken-op-je-joomla-site-met-icagenda-blokkeren-met-htaccess

Wanneer je op een Joomla-site de iCagenda-extension gebruikt om evenementen en kalenders weer te geven, gebeurt het soms dat crawlers (zoals Googlebot, Bingbot, SemrushBot, GPTBot, enz.) willekeurige of extreem ver verwijderde datums opvragen via de iccaldate  -parameter. Bijvoorbeeld:

https://jouwdomein.nl/index.php?option=com_icagenda&view=agenda&iccaldate=9266-07-01
Dergelijke verzoeken leiden vaak tot:

- **Vervuilde serverlogs**: talloze 200-responses voor onzinnige datums maken het moeilijker om echte fouten terug te vinden.- **Onnodige belasting**: iCagenda of je Joomla-backend probeert content te zoeken voor een onrealistisch jaar, wat CPU- en database-werk kost.- **Mogelijke PHP- of SQL-fouten**: als er geen degelijke validatie is, kunnen extreme datums onverwacht gedrag veroorzaken.In dit artikel laten we zien hoe je met een paar regels in je Joomla-root-.htaccess  bestand automatisch een **404 Not Found** teruggeeft wanneer het jaargedeelte van iccaldate  niet binnen een “redelijke” range ligt. Zo slaan bots met rare datums iCagenda en de rest van je Joomla-site over.

**Plugin in gebruik:** iCagenda ([https://www.icagenda.com/](https://www.icagenda.com/))

Deze instructie gaat ervan uit dat jouw Joomla-site iCagenda (de meestgebruikte evenementen- en kalender-extension voor Joomla) gebruikt om agenda’s weer te geven. iCagenda accepteert standaard iccaldate=YYYY-MM-DD  in de URL om meteen naar de juiste datum in de kalender te springen.

## 1. Het probleem met iCagenda en botsiCagenda biedt gebruikers de mogelijkheid om via een URL direct naar een bepaalde datum in de agenda te gaan, bijvoorbeeld:

https://jouwdomein.nl/index.php?option=com_icagenda&view=agenda&iccaldate=2025-06-10
iCagenda leest deze parameter uit (in de code van com_icagenda  ) en toont de evenementen rondom die datum.

**Maar** crawlers en bots proberen soms:

- **Onrealistische jaartallen**: iccaldate=3674-04-01  , iccaldate=313-1-1  , etc.- **Breedte-fuzzing**: alle mogelijke combinaties van jaar, maand en dag om te controleren of er content bestaat.Zonder controle leidt dit ertoe dat:

- iCagenda steeds database-calls draait om te zoeken naar evenementen in jaar 3674, wat uiteraard niets oplevert.- Je serverlog volloopt met 200-responses voor deze “ongekoppelde” datums.- Beheerders moeilijk echte problemen kunnen traceren tussen al dat noise.Daarom is het handiger om **vóór** iCagenda (en Joomla) een check op Apache-niveau te doen: laat alle iccaldate  -requests waarvan het jaartal niet in een vooraf bepaalde range ligt, meteen met een 404 terugkomen. Zo ziet iCagenda ze nooit.

2. iCagenda en .htaccess  : de oplossing2.1. Waarom .htaccess  bovenaan- **Prestaties**: Apache wijkt niet eens af naar PHP of iCagenda. De 404-antwoord komt zó terug, ideaal voor bots die anders door blijven gaan.- **Eenvoud**: Eén klein blok in .htaccess  volstaat; je raakt iCagenda-code niet aan.- **Onderhoud**: Als iCagenda in toekomstige versies iets verandert, blijft deze server-level-regel gewoon werken zolang het URL-patroon hetzelfde blijft.2.2. De .htaccess  -regelsPlaats de volgende regels **helemaal bovenaan** in je Joomla-root‐.htaccess  (voor alle iCagenda-en Joomla-regels). Deze instructie blokkeert elke iccaldate=<jaar>-<maand>-<dag>  waarvan het jaargedeelte niet in **2000–2025** valt. Pas deze range aan naar wat voor jouw site relevant is.

################################################################################
# 404 voor elk iccaldate-jaar dat niet tussen 2000 en 2025 valt (iCagenda)
################################################################################

RewriteEngine On

# 1) Match elk iccaldate=JAAR-M-D, waarbij JAAR uit 1 of meer cijfers bestaat
#    → ([0-9]+) legt elk jaargedeelte in %1
#    → [0-9]{1,2}-[0-9]{1,2} staat maand en dag toe als 1 of 2 cijfers
RewriteCond %{QUERY_STRING} (?:^|&)iccaldate=([0-9]+)-[0-9]{1,2}-[0-9]{1,2}(?:&|$) [NC]

# 2) Als dat gevangen JAAR (%1) NIET in 2000–2025 valt, trigger een 404
#    • 200[0-9]  → 2000–2009
#    • 201[0-9]  → 2010–2019
#    • 202[0-4]  → 2020–2024
#    • 2025      → exact 2025
RewriteCond %1 !^(200[0-9]|201[0-9]|202[0-4]|2025)$

# 3) Beide condities voldaan → direct een 404 (geen iCagenda, geen Joomla)
RewriteRule .* - [R=404,L]
Uitleg per regel- **RewriteEngine On**  

Zet de Apache-mod_rewrite-engine aan. Zelfs als Joomla/htaccess al mod_rewrite inschakelt, herhaal je dit voor de zekerheid.

**Eerste ****RewriteCond** ** : ****iccaldate=([0-9]+)-…**  

- (?:^|&)  zoekt naar het begin van de query‐string of een ampersand, zodat zowel ?iccaldate=…  als ?foo=bar&iccaldate=…  klopt.- ([0-9]+)  pakt elk jaargedeelte (één of meer cijfers) en slaat dat op in %1  . Dit vangt dus jaartallen zoals “313”, “3674” of “2023”.- -[0-9]{1,2}-[0-9]{1,2}  staat maand en dag van 1 of 2 cijfers toe (bijvoorbeeld “4-1” voor april 1, of “04-01”).- (?:&|$)  betekent “ofwel volgt er een extra parameter, of we zijn aan het einde van de query‐string.”

**Tweede ****RewriteCond** ** : ****%1 !^(200[0-9]|201[0-9]|202[0-4]|2025)$**  

%1  is het jaargedeelte dat we eerder gevangen hebben.

!^…$  betekent “niet gelijk aan één van de volgende patronen”:

- 200[0-9]  : 2000–2009- 201[0-9]  : 2010–2019- 202[0-4]  : 2020–2024- 2025  : exact 2025- Staat %1  niet in die reeks, dan is het een ongeldig jaartal en laten we de regel afgaan.

**RewriteRule .* - [R=404,L]**  

- .*  matcht **elke** path‐URL.- -  betekent “geen vervangende URI”—we willen alleen de statuscode 404, geen redirect of herschrijving.- [R=404,L]  stuurt onmiddellijk een HTTP 404-response en stopt verdere rewrite‐verwerking. Dit voorkomt dat iCagenda (of andere Joomla-code) ooit die parameter ziet.**Aanpassen van de jaarrange**

Als jouw iCagenda-kalender al evenementen bevat vanaf 2010 en wil je toelaten tot 2028, wijzig dan de tweede regel bijvoorbeeld in:

RewriteCond %1 !(201[0-9]|202[0-8])$
Hiermee zijn alleen de jaren 2010–2019 en 2020–2028 toegestaan. Alle andere jaartallen geven 404.

## 3. Context met standaard Joomla- en iCagenda-rulesEen typische Joomla-.htaccess  (die je vanuit htaccess.txt  hernoemt naar .htaccess  ) bevat al een heel aantal regels voor SEF-URL’s en beveiliging. Jouw aanvullende blokkade hoort **helemaal bovenaan** die standaardregels te staan. Een voorbeeld van de bovenkant van je .htaccess  :

#############################################################
# iCagenda: Block invalid iccaldate (jaar buiten 2000–2025) #
#############################################################

RewriteEngine On
RewriteCond %{QUERY_STRING} (?:^|&)iccaldate=([0-9]+)-[0-9]{1,2}-[0-9]{1,2}(?:&|$) [NC]
RewriteCond %1 !^(200[0-9]|201[0-9]|202[0-4]|2025)$
RewriteRule .* - [R=404,L]

#############################################################
##  Hieronder volgen de standaard Joomla- en iCagenda-sef- ##
##  en beveiligingsregels (die niet gewijzigd hoeven te   ##
##  worden voor deze opzet).                              ##
#############################################################
# --- Joomla stardard rewrite rules, beveiliging, etc. ---
# (de rest van het Joomla-htaccess-bestand …)
# --- iCagenda eigen rewrite rules komen daarna ---
# (als je iCagenda-SEF instelingen hebt, staan die hier)  
Door jouw regels helemaal bovenaan te plaatsen, weet je zeker dat bots met een ongeldig jaartal nooit verder gaan naar de Joomla- of iCagenda-logica. iCagenda ziet dus geen foute iccaldate  meer, en voert geen zoekacties uit op onrealistische jaartallen.

## 4. Testen en controleren- **Controleer dat mod_rewrite actief is**- Log in op je server en draai:apachectl -M | grep rewrite
- Je zou rewrite_module (shared)  moeten zien.- Controleer in de hoofdconfiguratie (bijv. /etc/httpd/conf/httpd.conf  of /etc/apache2/apache2.conf  ) dat de directory waar Joomla staat iets als dit heeft:<Directory "/var/www/html/joomla">
    AllowOverride All
</Directory>
- Als hier AllowOverride None  staat, wordt .htaccess  genegeerd. Pas dit aan en herstart Apache:sudo systemctl reload httpd   # CentOS/RHEL
sudo service apache2 reload   # Debian/Ubuntu
- **Test “goede” en “foute” data**- **Goede datum (verwacht 200)**curl -I "https://jouwdomein.nl/index.php?option=com_icagenda&view=agenda&iccaldate=2025-06-05"
- → HTTP/1.1 200 OK  (iCagenda toont de events rond 5 juni 2025)- **Foute datum (verwacht 404)**curl -I "https://jouwdomein.nl/index.php?option=com_icagenda&view=agenda&iccaldate=313-1-1"
- → HTTP/1.1 404 Not Found  (Apache blokkeert)- **Andere parameters + foute datum**curl -I "https://jouwdomein.nl/index.php?option=com_icagenda&view=agenda&userid=4&iccaldate=3674-04-01"
- → HTTP/1.1 404 Not Found  (Apache herkent alsnog iccaldate  en blokkeert)- **Controleer je access‐logs**

Zoek in iets als /var/log/httpd/access_log  of /var/log/apache2/access.log  naar regels waarin bots nu 404 krijgen in plaats van 200. Bijvoorbeeld:

52.167.144.169 - - [05/Jun/2025:11:09:50 +0200] "GET /index.php?option=com_icagenda&view=agenda&iccaldate=3674-04-01 HTTP/2.0" 404 389 "-" "bingbot/2.0"
20.171.207.188 - - [05/Jun/2025:11:09:50 +0200] "GET /index.php?option=com_icagenda&view=agenda&iccaldate=4310-04-01 HTTP/1.1" 404 495 "-" "GPTBot/1.2"
## 5. Extra tip: bots of user agents compleet negerenAls je bepaalde crawlers wílt voorkomen dat ze iCagenda überhaupt gebruiken—ook als ze wél geldige datums proberen—kun je nog een extra RewriteCond %{HTTP_USER_AGENT}  toevoegen. Bijvoorbeeld, stel dat je SemrushBot en ClaudeBot altijd wilt blokkeren:

###############################################
# Blokkeer SemrushBot en ClaudeBot altijd     #
###############################################

# 1) Voorkom dat SemrushBot of ClaudeBot ooit iCagenda zien (404)
RewriteCond %{HTTP_USER_AGENT} (SemrushBot|ClaudeBot|GPTBot|Amazonbot|meta-externalagent) [NC]
RewriteRule ^index\.php\?option=com_icagenda&view=agenda - [R=404,L]
- Vervang ^index\.php\?option=com_icagenda&view=agenda  door de juiste SEF‐URL of query‐string voor jouw iCagenda-archief.- Met deze regels komt elke request van die bots, ongeacht de iccaldate  -waarde, op een 404‐antwoord uit.**Let op**: Als je Googlebot wél wilt laten indexeren op basis van geldige datums, voeg deze botspecifieke regel dan alleen toe voor crawlers die je écht nooit in je kalender wilt hebben. Voor gewone bots volstaan de datums‐checkregels in sectie 2.2.

## 6. Afsluiting en bronnenDoor de bovenstaande .htaccess  -aanpassingen zorg je ervoor dat Joomla en iCagenda geen onrealistische iccaldate  -waarden hoeven te verwerken. Dat levert de volgende voordelen op:

- **Minder serverbelasting**: iCagenda draait alleen nog database-queries voor jaartallen die je daadwerkelijk gebruikt.- **Schone logs**: 404-responses voor foute datums voorkomen dat je log volraakt met nutteloze 200-respones.- **Betere SEO-ervaring**: zoekmachines krijgen duidelijke 404-statussen voor niet-bestaande datums en crawlen je site efficiënter.**Gebruikte plugin**: iCagenda ([https://www.icagenda.com/](https://www.icagenda.com/))

Aluminium mogelijkheden van iCagenda vind je op de officiële website. iCagenda is de populairste Joomla-extensie voor evenementenbeheer en ondersteunt onder andere weergave in maand-, week- en dagweergave, herhalende evenementen, en integratie met social sharing.

### Bronnen en documentatie- **iCagenda offciële website**: [https://www.icagenda.com/](https://www.icagenda.com/)- **Joomla .htaccess handling**: [https://docs.joomla.org/How_to_enable_a_.htaccess_file_in_Joomla](https://docs.joomla.org/How_to_enable_a_.htaccess_file_in_Joomla)- **Apache mod_rewrite documentatie**: [https://httpd.apache.org/docs/current/mod/mod_rewrite.html](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)Met deze stappen houd je ongewenste bots uit je iCagenda-kalender en voorkom je vervuilde logs en overbodige serverwerkzaamheden. Veel succes met het implementeren van deze oplossing op je Joomla-site!


