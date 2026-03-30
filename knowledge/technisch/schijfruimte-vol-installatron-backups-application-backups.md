# Schijfruimte vol door Installatron backups (application_backups)

> Bron: https://help.keurigonline.nl/article/149-schijfruimte-vol-installatron-backups-application-backups

Is je schijfruimte vol, terwijl je website zelf niet zo groot is? Controleer dan de map `application_backups`. Dit is de standaard backup-map van **Installatron**, de tool waarmee je WordPress en andere applicaties installeert en beheert.

## Wat is application_backups?

Installatron maakt automatisch een backup bij elke handeling, zoals updates van WordPress, plugins of thema's. Als backup-rotatie niet is ingesteld, worden oude backups niet automatisch verwijderd. Dit kan snel oplopen tot honderden megabytes of zelfs gigabytes.

## Hoe controleer ik hoeveel ruimte het inneemt?

Log in op DirectAdmin via `https://jouwdomein.nl:2222` en ga naar **Extra Programma's** → **Installatron**. Klik op je applicatie (bijvoorbeeld WordPress) en ga naar het tabblad **Backups**. Daar zie je een overzicht van alle opgeslagen backups met hun grootte.

## Backups opruimen

1. Log in op DirectAdmin: `https://jouwdomein.nl:2222`
2. Ga naar **Extra Programma's** → **Installatron**
3. Klik op je applicatie (bijv. WordPress)
4. Ga naar het tabblad **Backups**
5. Verwijder oude backups die je niet meer nodig hebt

## Backup-rotatie instellen (aanbevolen)

Om te voorkomen dat backups zich blijven opstapelen, kun je een rotatie instellen:

1. Ga in Installatron naar je applicatie
2. Klik op het tandwiel-icoon (**Instellingen**)
3. Zoek de instelling voor **Automatic Backup**
4. Stel het maximaal aantal backups in op **2** of **3**
5. Sla de instellingen op

Hiermee worden oude backups automatisch verwijderd wanneer er een nieuwe wordt gemaakt.

## Kan ik de map application_backups handmatig legen?

Ja, via FTP of de Bestandsbeheerder in DirectAdmin kun je de inhoud van de map `application_backups` in je homedirectory verwijderen. Let op: doe dit alleen als je zeker weet dat je de backups niet meer nodig hebt.

## Gerelateerde artikelen

- [Hoe restore ik een backup via JetBackup](../uncategorized/website-herstellen-via-jetbackup-bestanden-database-apart.md)
- [Hoe installeer ik WordPress?](hoe-installeer-ik-wordpress.md)
