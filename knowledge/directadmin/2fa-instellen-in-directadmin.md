# Hoe stel ik tweefactorauthenticatie (2FA) in voor DirectAdmin?

> Bron: https://help.keurigonline.nl/article/138-2fa-instellen-in-directadmin

Tweefactorauthenticatie (2FA) voegt een extra beveiligingslaag toe aan je DirectAdmin-account. Naast je gebruikersnaam en wachtwoord heb je een tijdelijke code nodig uit een authenticatie-app op je smartphone.

## Wat heb je nodig?

Een authenticatie-app op je smartphone, bijvoorbeeld:

- Google Authenticator
- Microsoft Authenticator
- Authy
- Een andere TOTP-compatibele app

## Stappenplan

1. **Log in op DirectAdmin.** Ga naar `https://jouwdomein.nl:2222` en log in met je gebruikersnaam en wachtwoord.
2. **Ga naar Twee-Staps Authenticatie.** Navigeer naar **Geavanceerde Functies > Twee-Staps Authenticatie**.
3. **Genereer een secret.** Klik op "Vereist een geldige tweestapsverificatiecode om in te loggen op dit account". DirectAdmin toont nu een QR-code.
4. **Scan de QR-code.** Open je authenticatie-app en scan de QR-code. De app voegt DirectAdmin toe en begint met het genereren van codes.
5. **Test de code.** Voer de 6-cijferige code uit je app in het testveld in en controleer of deze wordt geaccepteerd.
6. **Activeer 2FA.** Geef een herkenbare omschrijving op, vink de optie aan om 2FA te vereisen bij inloggen, en klik op **Save**.

## Resultaat

Je DirectAdmin-account is nu beveiligd met 2FA. Bij elke login heb je naast je wachtwoord ook een code uit je authenticatie-app nodig.

**Belangrijk:** Bewaar je backup-codes veilig voor het geval je geen toegang meer hebt tot je authenticatie-app. Zonder deze codes kun je niet meer inloggen.

## Gerelateerde artikelen

- [Hoe kan ik inloggen in DirectAdmin?](hoe-kan-ik-inloggen-in-directadmin.md)
- [Twee-factor-authenticatie (2FA) voor Mijn KeurigOnline](../mijn-keurigonline/twee-factor-authenticatie-2fa.md)
- [Google Authenticator instellen](../uncategorized/google-authenticator-instellen.md)
- [Geen 2FA-code in de e-mail gekregen?](../uncategorized/geen-2fa-code-in-de-e-mail-gekregen.md)
