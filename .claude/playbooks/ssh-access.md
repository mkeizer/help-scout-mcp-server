# SSH Access Playbook

Load when a triage requires SSH to a cl-server or shared hosting account.

## Key & standard connection

Permanente triage-key `claude-triage-permanent` (ed25519, `/home/claude/.ssh/ko-triage`) staat geïnstalleerd op alle `cl*.keurigonline.nl` shared hosting servers. SSH werkt voor elk account met pakket dat SSH toestaat (Plus, Pro, legacy L/XL/XXXL). Start en legacy S/M hebben geen SSH.

```bash
ssh -i /home/claude/.ssh/ko-triage -p 2020 <account>@cl<NN>.keurigonline.nl
```

Username = DirectAdmin-accountnaam (bijv. `ahfot6162`). Server = de cluster van dat account (via `drs.package-search(domain)` → product_name bevat vaak `cl*`, of via DNS scan van een domein, of via `fs_read grep /etc/virtual/domainowners`).

## Regels

### 1. Probeer ALTIJD direct SSH eerst
Ongeacht welk pakket de klant heeft. De key staat overal. De pakket-beperking op SSH (Start, legacy S/M) is officieel policy maar de praktijk wijkt soms af. De enige manier om zeker te weten of SSH werkt is het daadwerkelijk proberen. **Presumeer niet op basis van het DRS product_name dat SSH niet kan — draai het commando.**

### 2. FABRICEER GEEN SSH TOEGANG
Gebruik de KO API endpoint `adminssh/create` **NOOIT**. Die is kapot en crasht sshd op de server (tweemaal gebeurd op cl03, 2026-03-24 en 2026-03-26).

### 3. Als SSH niet werkt
Bij concrete error zoals `Permission denied`, `Connection refused`, `shell returned exit code 1`, `Account disabled`:
- Stop met zelf proberen
- Noteer de **exacte foutmelding** in de tech note
- Ga direct naar de @Anyone escalatie-note

**Besteed geen extra tokens aan het opsommen van commando's die een collega zou moeten draaien als dezelfde commando-set al in een eerder ticket voor dit account staat.** Schrijf dan: "Zie SSH-instructies in ticket #XXXXX." Als dit het eerste ticket voor dit account is, schrijf de commando-set eenmalig.

### 4. "Pakket zou geen SSH toelaten" is geen reden om niet te proberen
De tech note moet altijd kunnen zeggen ofwel "SSH geprobeerd, gaf [exacte error]" of "SSH werkte, inspectie uitgevoerd". **Nooit** "niet geprobeerd want pakket M". Bij Start / legacy S/M: vermeld als context — "Pakket Start, SSH waarschijnlijk niet beschikbaar. SSH toch geprobeerd, fout: [exacte error]."

## Hulp vragen via @Anyone note

Gebruik `createNote` met @Anyone mention, wees expliciet. Twee vormen:

### Vorm A — vraag om SSH toegang te openen
```
@Anyone Kunnen jullie SSH toegang openen voor account <naam> op <server>?
Ik wil malware in <pad> inspecteren. Key-comment: claude-triage-permanent.
```

### Vorm B — vraag om read-only commando's te laten uitvoeren (voorkeur)
```
@Anyone Zou iemand de volgende commando's kunnen uitvoeren als <user>@<server>
en de output in deze thread plakken?

  du -sh ~/domains/<domain>/public_html/
  find ~/domains/<domain>/public_html -name '*.php' -path '*/uploads/*.php'
  ls -la ~/domains/<domain>/public_html/wp-content/plugins/
  cat ~/<verdacht-bestand>

Alleen read-only, geen wijzigingen nodig.
```

**Vorm B voorkeur** voor simpele inspecties (geen interactieve shell nodig). Vorm A voor situaties waar je zelf rond moet kunnen kijken of wijzigingen moet maken.

## Urgentie en deadlines

Altijd urgentie in @Anyone note:
- **"Actie vereist binnen 24 uur"** — security, actieve dreiging
- **"Actie vereist binnen 48 uur"** — passieve malware, non-critical

**Bij 3e recurrence of hoger voor hetzelfde account:**
- Voeg tag `needs-human-urgent` toe naast `recurrence-escalated`
- Begin de @Anyone note met: "ESCALATIE: [domein] — [N]e malware-melding zonder actie. Eerder geëscaleerd in #XXXXX, nog steeds niet opgepakt."

## Read-only beperkingen

Via de claude-key: CageFS isolatie, geen root, geen toegang tot logs/mailqueue/DA API. Voor dingen die daarbuiten liggen — mailqueue inspectie, systeem-logs, DA admin API — heb je altijd staff nodig via @Anyone.
