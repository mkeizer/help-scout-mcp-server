# Hoe kan ik inloggen in phpMyAdmin?

> Bron: https://help.keurigonline.nl/article/79-hoe-kan-ik-inloggen-in-phpmyadmin

Met **phpMyAdmin** kun je eenvoudig je MySQL‑database beheren via een webinterface.

Bij KeurigOnline is phpMyAdmin altijd beschikbaar via een eenvoudige link.

### ✅ **Stap 1: phpMyAdmin openen**Je kunt phpMyAdmin openen door achter je hostnaam of domeinnaam één van de volgende paden te typen:

- https://jouwdomein.nl/phpmyadmin 

**of**

- https://jouwdomein.nl/pma 🔹 **Voorbeeld:**

Heb je het domein voorbeeldsite.nl ?

Ga dan naar:

https://voorbeeldsite.nl/phpmyadmin 

of

https://voorbeeldsite.nl/pma 

Beide adressen werken, kies wat je het prettigst vindt.

### ✅ **Stap 2: Inloggen op phpMyAdmin**Je hebt hiervoor je **database‑gegevens** nodig.

Deze gegevens vind je in je hostingpakket of in de configuratie van je website (bijvoorbeeld in het bestand wp-config.php  als je WordPress gebruikt).

- **Gebruikersnaam:** de databasegebruiker- **Wachtwoord:** het wachtwoord dat bij deze gebruiker hoort- **Database:** de naam van je database (deze kies je na het inloggen in phpMyAdmin)💡 Twijfel je over je gegevens?

Log in op DirectAdmin en kijk bij **MySQL Management** voor een overzicht van je databases en gebruikers.

### ✅ **Stap 3: Database selecteren**Na het inloggen zie je links een lijst met databases.

Klik op de database die je wilt beheren. Je ziet nu alle tabellen in die database.

### **Veelvoorkomende acties in phpMyAdmin**Hier zijn een paar dingen die je makkelijk kunt doen:

- 📥 **Back‑up maken:**

Ga naar **Exporteren** en kies *Snelle export* om een SQL‑bestand te downloaden.

- 📤 **Back‑up terugzetten:**

Ga naar **Importeren** en upload een eerder opgeslagen SQL‑bestand.

- ✏️ **Gegevens bewerken:**

Klik op een tabel en daarna op **Bewerken** of **Weergeven** om rijen te bekijken of te wijzigen.

- ➕ **Nieuwe tabel of kolom aanmaken:**

Klik op **Structuur** en voeg nieuwe velden of tabellen toe.

### **Veilig werken**- ✔️ Maak altijd eerst een back‑up voordat je iets wijzigt.- ✔️ Log uit als je klaar bent.- ✔️ Deel je database‑gegevens nooit met derden.
