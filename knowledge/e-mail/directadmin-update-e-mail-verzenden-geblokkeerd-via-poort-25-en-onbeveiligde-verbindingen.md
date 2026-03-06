# DirectAdmin update: E-mail verzenden geblokkeerd via poort 25 en onbeveiligde verbindingen

> Bron: https://help.keurigonline.nl/article/127-directadmin-update-e-mail-verzenden-geblokkeerd-via-poort-25-en-onbeveiligde-verbindingen

Sinds een recente serverupdate (DirectAdmin v1.676) is het verzenden van e-mail via **poort 25 of onbeveiligde verbindingen niet meer toegestaan**. Dit is gedaan om je e-mailverkeer beter te beveiligen.

### Wat is er veranderd?- **Poort 25** kan niet meer gebruikt worden voor het versturen van e-mail.- **Authenticatie zonder versleuteling** is geblokkeerd (dus geen "gewone" verbindingen meer).### Wat moet je doen?Controleer je e-mailinstellingen:

- Gebruik **poort 587 met STARTTLS**, of- Gebruik **poort 465 met SSL/TLS**- Zet **SMTP-verificatie aan** (gebruikersnaam + wachtwoord voor uitgaande mail)- Zorg dat versleuteling/SSL of TLS aanstaat### Hulp nodig?Volg onze stap-voor-stap handleiding voor je mailprogramma:

👉 [https://keurigonline.nl/email-instellen](https://keurigonline.nl/email-instellen)

Na aanpassen van de instellingen werkt e-mail verzenden weer normaal.

### Mogelijke foutmeldingen bij verkeerde instellingen**Outlook:**

- 0x800CCC80  – Geen ondersteunde authenticatiemethode- 0x800CCC7D  – Server ondersteunt geen SSL- 0x800CCC0E  – Geen verbinding met server mogelijk- 0x80042109  – Kan geen verbinding maken met SMTP-server**Thunderbird / Apple Mail:**

- *The server does not support the selected authentication method*
