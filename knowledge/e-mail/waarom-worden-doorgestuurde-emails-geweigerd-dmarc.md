# Waarom worden doorgestuurde e-mails geweigerd? (DMARC)

> Bron: https://help.keurigonline.nl/article/147-waarom-worden-doorgestuurde-emails-geweigerd-dmarc

Stuur je e-mail door naar een ander adres (bijvoorbeeld Gmail) en krijgen afzenders een foutmelding terug? Dan heeft dit waarschijnlijk te maken met het **DMARC-beleid** van de afzender.

## Wat is het probleem?

Steeds meer domeinen stellen een streng DMARC-beleid in (`p=reject` of `p=quarantine`). Dit is een beveiligingsmaatregel die voorkomt dat iemand namens hun domein vervalste e-mail verstuurt.

Wanneer je een **forwarder** hebt ingesteld (bijvoorbeeld `info@jouwdomein.nl` → `jouwnaam@gmail.com`), gebeurt het volgende:

1. Een afzender stuurt een e-mail naar `info@jouwdomein.nl`
2. De mailserver stuurt deze automatisch door naar `jouwnaam@gmail.com`
3. Gmail controleert of de e-mail echt van de oorspronkelijke afzender komt (SPF/DKIM/DMARC)
4. **SPF faalt**, omdat het IP-adres van de doorstuurserver niet in het SPF-record van de afzender staat
5. Als de afzender een streng DMARC-beleid heeft, **weigert Gmail de e-mail**

De afzender krijgt dan een foutmelding zoals:

`Unauthenticated mail from voorbeeld.nl is not accepted due to domain's DMARC policy. Please contact the administrator of voorbeeld.nl domain if this was legitimate mail.`

## Waarom werkte het vroeger wel?

Steeds meer organisaties verscherpen hun e-mailbeveiliging. Google en Yahoo hebben sinds 2024 strengere eisen gesteld aan bulk-verzenders, waardoor meer domeinen DMARC met `p=reject` instellen. Het gevolg: doorgestuurde e-mails worden vaker geweigerd.

## Oplossing: e-mail ophalen in plaats van doorsturen

De betrouwbaarste oplossing is om je e-mail **niet meer door te sturen**, maar rechtstreeks op te halen via een e-mailprogramma. Zo speelt DMARC geen rol meer, omdat de e-mail niet wordt doorgestuurd maar direct uit je mailbox wordt gelezen.

### Optie 1: E-mailprogramma op je computer

Voeg je e-mailadres toe in Outlook, Apple Mail of Thunderbird. Gebruik de serverinstellingen die je vindt op:
[keurigonline.nl/email-instellen](https://keurigonline.nl/email-instellen/) (vul je e-mailadres in voor de juiste instellingen)

### Optie 2: Gmail-app op je telefoon

In de Gmail-app op Android of iPhone kun je een extern IMAP-account toevoegen. Ga naar **Instellingen** → **Account toevoegen** → **Overige** en vul de IMAP-gegevens in van je KeurigOnline-mailbox.

### Optie 3: Webmail

Je kunt je e-mail altijd lezen via webmail. Ga naar [webmail.keurigonline.nl](https://webmail.keurigonline.nl) en vul je e-mailadres in om direct naar je webmail te gaan.

## Forwarder verwijderen

Zodra je een van bovenstaande opties hebt ingesteld, kun je de forwarder verwijderen in DirectAdmin:

1. Log in op DirectAdmin via `https://jouwdomein.nl:2222`
2. Ga naar **E-mailbeheer** → **Forwarders**
3. Vink de forwarder aan en klik op **Verwijderen**

## Gerelateerde artikelen

- [Hoe kan ik mijn mail laten doorsturen?](hoe-kan-ik-mijn-mail-laten-doorsturen.md)
- [Hoe stel ik SPF, DKIM en DMARC in?](hoe-stel-ik-spf-dkim-en-dmarc-in.md)
- [Waarom krijg ik geen e-mail binnen?](waarom-krijg-ik-geen-e-mail-binnen.md)
- [Gmail stopt met ophalen van externe mailboxen (POP3)](gmail-stopt-met-ophalen-externe-mailboxen-pop3.md)
