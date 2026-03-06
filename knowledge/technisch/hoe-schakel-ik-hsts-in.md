# Hoe schakel ik HSTS in?

> Bron: https://help.keurigonline.nl/article/117-hoe-schakel-ik-hsts-in

HSTS staat voor HTTP Strict Transport Security. Het is een beveiligingsmechanisme dat ervoor zorgt dat een webbrowser altijd een beveiligde HTTPS-verbinding gebruikt in plaats van een onveilige HTTP-verbinding. Wanneer een website HSTS inschakelt, stuurt deze een speciale instructie naar de browser om voortaan alleen nog maar via HTTPS verbinding te maken met die website. Dit helpt om verschillende aanvallen te voorkomen, zoals man-in-the-middle-aanvallen, waarbij een aanvaller het verkeer tussen de gebruiker en de website onderschept en mogelijk kan wijzigen. HSTS zorgt er dus voor dat de communicatie tussen de gebruiker en de website altijd versleuteld en veilig is.

Je schakelt het eenvoudig in je .htaccess bestand. Zet onderstaande code bovenin de .htaccess:

RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}

Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" env=HTTPS
Lukt het niet? Neem gerust contact op met onze helpdesk.


