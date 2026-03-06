# Tweefactorauthenticatie (2FA) instellen in DirectAdmin

> Bron: https://help.keurigonline.nl/article/138-2fa-instellen-in-directadmin

Tweefactorauthenticatie (2FA) voegt een extra beveiligingslaag toe aan je DirectAdmin-account. Naast je gebruikersnaam en wachtwoord heb je een tijdelijke code nodig die wordt gegenereerd door een authenticatie-app op je smartphone. Dit maakt je account aanzienlijk veiliger tegen onbevoegde toegang.

## Wat heb je nodig?Voordat je begint, zorg dat je een authenticatie-app op je smartphone hebt geïnstalleerd. Geschikte apps zijn:

- Google Authenticator- Microsoft Authenticator- Authy- Een andere TOTP-compatibele authenticatie-app## Stap voor stap: 2FA activeren### 1. Inloggen op DirectAdminLog eerst in op je DirectAdmin-account. Als je niet weet hoe dit moet, [volg dan deze instructies om in te loggen op DirectAdmin](https://help.keurigonline.nl/article/47-hoe-kan-ik-inloggen-in-directadmin).

### 2. Navigeer naar Twee-Staps AuthenticatieGa in het menu naar **Geavanceerde Functies** en klik op **Twee-Staps Authenticatie**.

### 3. Secret genererenKlik op de knop Vereist een geldige tweestapsverificatiecode om in te loggen op dit account

. DirectAdmin genereert nu een unieke code en toont een QR-code op je scherm.

### 4. QR-code scannenOpen je authenticatie-app op je smartphone en scan de QR-code die op het scherm wordt getoond. De app voegt DirectAdmin nu toe aan je lijst met accounts en begint met het genereren van tijdelijke codes.

### 5. Code testenVoordat je 2FA activeert, test je eerst of alles correct werkt. Voer de 6-cijferige code die je authenticatie-app toont in het testveld in en controleer of deze wordt geaccepteerd.

### 6. 2FA activerenNa een succesvolle test kun je 2FA activeren:

- Geef een herkenbare omschrijving op. Deze naam zie je terug in je authenticatie-app en helpt je om het account te identificeren.- Vink de optie aan: **"Vereis een geldige tweestapsverificatiecode om in te loggen op dit account"**- Klik op **Save** om je instellingen op te slaan.## Je account is nu beveiligdVanaf nu is je DirectAdmin-account beveiligd met tweefactorauthenticatie. Bij elke login moet je naast je gebruikersnaam en wachtwoord ook een tijdelijke code invoeren uit je authenticatie-app.

**Belangrijk:** Bewaar je backup-codes veilig voor het geval je geen toegang meer hebt tot je authenticatie-app. Zonder deze codes en zonder toegang tot je app kun je niet meer inloggen.

## Hulp nodig?Kom je er niet uit of heb je vragen over het instellen van 2FA? Neem dan contact op met onze supportafdeling.


