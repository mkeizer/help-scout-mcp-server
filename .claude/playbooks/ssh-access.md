# SSH / Server Access Playbook

Load when a triage requires reading/acting on a cl-server or shared hosting account.

## Rule #0: Gateway first, direct SSH almost never

**Direct `ssh -i /home/claude/.ssh/ko-triage ...` is a last resort**, not the default. Sinds 2026-04 hebben we de `mcp__ssh-gateway__*` MCP die structured, audit-logged access geeft tot alle cl-servers. Voor >95% van triage-werk heb je direct SSH niet nodig.

### Wat kan via de gateway (spec: `.claude/mcp-ssh-gateway.md`)

**File inspection** — altijd eerst:
- `fs_list(server, root, name_pattern?)` — find-achtige listing
- `fs_read(server, path, mode=full|tail|grep, pattern?, recursive?)` — lees/tail/grep
- `fs_hash(server, path)` — sha256, fleet-wide compare mogelijk
- `fs_diff` — config-drift tussen servers

**Gestructureerde cmd_run templates** (~44 stuks) — vervangen de meeste `ssh ls/cat/grep` patterns:
- DirectAdmin: `da-user-info`, `quota-overview`, `user-quota`, `inode-overview`, `traffic-per-user`, `dkim-overview`, `uid-map`, `disk-usage`
- Webserver: `webserver-errors`, `webshell-scan-detect`, `litespeed-vhosts`, `lsws-app-sockets`
- CMS: `cms-inventory`, `wp-cli`, `wp-audit-all`
- Logs/mail: `mail-queue`, `exim-queue-detail`, `exim-log-search`, `dovecot-user`
- Files/forensics: `find-large-files`, `recent-uploads`, `recent-file-changes`, `processes`, `proc-inspect`
- Security: `csf-query`, `imunify`, `cron-audit-all`, `user-cron`
- Net/certs: `dns`, `dns-zone-read`, `whois`, `net-connect`, `probe-url`, `tls-cert-inspect`, `letsencrypt-status`
- CL-specific: `cl-lve`, `cl-lvectl`, `cl-lveps`, `lve-user-info`, `cl-mysql-governor`, `cl-php-selector`
- MySQL/Redis: `mysql-processlist`, `redis-status`
- Services: `svc-status`

Gebruik `mcp__ssh-gateway__introspect` om de live lijst te zien.

**Mutations** (schrijft naar server-state — vereist jouw expliciete approval per ticket):
- `cmd_mutate` templates (~21): `csf-allow/deny`, `da-*`, `exim-queue-action`, `imunify-mutate`, `lve-set-limit`, `service-reload/restart`, `wp-cli-mutate`
- `da.mutate` voor DA REST API (312 endpoints, 4 mutate allowed)

**DA REST API (read)**: `da.read` met endpoint keys uit `da_endpoints` tool.

## When direct SSH is still legit

Slechts drie scenario's, en alleen na expliciete bevestiging van de staff:

1. **Gateway template ontbreekt** én je hebt geverifieerd via `introspect` dat er echt niks is dat past. Flag als missing-tool in `runRetrospective.newToolIdea`.
2. **Actieve dreiging** (cryptominer, mass-mailer, webshell met live verkeer) waar je NU moet ingrijpen en gateway niet de exacte mutate heeft.
3. **Debug-sessie met een mens** die live meekijkt en een shell nodig heeft.

Voor al het andere: gateway. Geen SSH-bash.

## If you genuinely need SSH (case 1-3 above)

Permanente triage-key `claude-triage-permanent` (ed25519, `/home/claude/.ssh/ko-triage`) staat op alle `cl*.keurigonline.nl`. Pakketten met SSH: Plus, Pro, legacy L/XL/XXXL. Start en legacy S/M niet.

```bash
ssh -i /home/claude/.ssh/ko-triage -p 2020 <account>@cl<NN>.keurigonline.nl '<one-liner>'
```

Username via `fs_read grep /etc/virtual/domainowners` op cl<NN> of via `drs.package-search(domain)`. Cluster via DRS of `dns_scan`.

**Nooit** `adminssh/create` — crasht sshd (cl03, 2× in maart 2026).

## Als SSH niet werkt

Bij concrete error (`Permission denied`, `Connection refused`, `shell returned exit code 1`, `Account disabled`):
- Stop met zelf proberen
- Noteer de **exacte foutmelding**
- Ga naar de @Anyone escalatie-note (met exacte commando's die collega zou moeten draaien — eenmalig)
- Als dit niet het eerste ticket voor dit account is: verwijs naar het eerdere ticket i.p.v. alles opnieuw opschrijven

## Hulp vragen via @Anyone note

Gebruik `createNote` met @Anyone mention, wees expliciet. Twee vormen:

### Vorm A — vraag om SSH toegang te openen
```
@Anyone Kunnen jullie SSH toegang openen voor account <naam> op <server>?
Ik wil <X> inspecteren. Key-comment: claude-triage-permanent.
```

### Vorm B — vraag om commando's uit te voeren (voorkeur)
```
@Anyone Zou iemand deze read-only commando's willen draaien als <user>@<server>
en output hier plakken?

  <cmd 1>
  <cmd 2>

Alleen read-only, geen wijzigingen nodig.
```

Vorm B als collega het makkelijk even kan; Vorm A alleen als je een interactieve shell echt nodig hebt (zeldzaam).
