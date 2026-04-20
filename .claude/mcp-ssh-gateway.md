# MCP SSH Gateway — Spec & Wishlist

Deze doc vervangt het eerdere `mcp-ssh-gateway-scopes.md`. Dat ging uit van een drie-scope model (lokaal / user-shell / root) met brede command-whitelists. De werkelijke gateway kiest een ander model en deze doc volgt dát model.

## Architectuur

**Eén sec-agent** logt in op elke managed server. De MCP-laag biedt geen shell-toegang aan ons, maar drie soorten operaties:

1. **`fs_list`** — find-achtige listing binnen path-allowlist
2. **`fs_read`** — full / tail / grep (incl. `recursive=true`) op een bestand binnen path-allowlist
3. **`fs_hash`** — SHA-256 van een file; met `server: "all"` in één call fleet-wide → drift-detection
4. **`fs_diff`** — unified diff tussen twee servers (zelfde path) of twee paths op één server
5. **`cmd_run` + `cmd_mutate`** — aanroepen van vooraf-gedefinieerde **templates** met gevalideerde argument-schema's
6. **`audit_read`** — query het audit-log van de gateway zelf (wie deed wat, wanneer, successful)
7. **`da.read` + `da.mutate`** — directe DirectAdmin REST API calls met impersonation
8. **`mail_*`** — gateway-side mail-deliverability tools (geen SSH, puur DNS/SMTP/parsers)
9. **`drs.*`** — read-only DRS billing/CRM database

Geen user-switch, geen `su - user`, geen free-form commando's. De veiligheid zit in:
- **Path allowlist** (alles buiten de lijst is onzichtbaar)
- **Template allowlist** (alleen gescripte ops met typed args)
- **Mutate-scheiding** (destructieve ops via eigen kanaal)
- **Fan-out via `server: "all"`** voor multi-server incidents

---

## Huidige capabilities (laatste introspect: 2026-04-20)

### Servers in inventory
- `vps333` — ✅ bereikbaar
- `cl04` — ✅ bereikbaar (directadmin + exim active; auth-fix gelukt sinds 2026-04-17)
- `cl07` — ✅ bereikbaar (**operational note**: mariadb.service draait in `auto-restart` loop — mysql-processlist faalt daardoor tijdelijk; socket is wel up)
- `cl08` — ✅ bereikbaar
- cl01-cl03, cl05-cl06 zijn nog niet enrolled (prio onbekend).

### fs path allowlist (46 entries)
Paths staan in de introspect output. Belangrijke additions sinds de v1-spec:
- `/var/named, /var/named/**` (DNS zone file read werkt nu)
- `/etc/letsencrypt, /etc/letsencrypt/**` (LE cert status leesbaar)
- `/usr/local/lsws, /usr/local/lsws/**` (LiteSpeed vhosts/logs)
- `/var/lib/imunify360, /var/lib/imunify360/**`
- `/var/lib/mysql`, MySQL slow logs etc.

### Read templates (`cmd_run`, ~43 stuks — zie `introspect` voor live lijst)
| Template | Doel |
|---|---|
| **CloudLinux** |
| `cl-lve` | LVE resource usage stats (historical) |
| `cl-lvectl` | Configured LVE resource limits per user |
| `cl-lveps` | LVE container totals voor specifieke user |
| `cl-mysql-governor` | MySQL Governor per-user limits + usage |
| `cl-php-selector` | PHP versies beschikbaar + per-user selectie |
| `lve-user-info` | LVE snapshot voor één user (limits + usage + faults) |
| **CMS / WordPress** |
| `cms-inventory` | CMS detectie (WP/Joomla/Drupal) over alle users |
| `wp-cli` | Read-only wp-cli op WP-installatie (als owner van wp-config.php) |
| `wp-audit-all` | Security audit van alle WP-installs (core/plugins/versions/malware) |
| **Cron / scheduled** |
| `cron-audit-all` | Verdachte cron-patterns (curl, base64, /tmp, …) over alle users |
| `user-cron` | Cron jobs voor specifieke user (crontab + DA crontab.conf) |
| **DirectAdmin** |
| `da-user-info` | Account config + domeinen + mail/DB counts |
| `disk-usage` | df -h of du met depth |
| `dkim-overview` | DKIM status + selector/key voor alle domeinen |
| `inode-overview` | Inode-usage per DA-user, gesorteerd |
| `quota-overview` | Disk quota per DA-user, gesorteerd |
| `traffic-per-user` | Bandwidth deze maand per user |
| `uid-map` | UID → username mapping |
| `user-quota` | Disk quota + inode voor specifieke user |
| **DNS / TLS** |
| `dns` | A/AAAA/MX/TXT/PTR/NS/CNAME lookups (gateway-side) |
| `dns-zone-read` | BIND zone file parse voor domein (via `/var/named/{domain}.db`) |
| `letsencrypt-status` | LE cert expiry + renewal config voor domein |
| `tls-cert-inspect` | TLS cert ophalen van live host (gateway-side, geen SSH) |
| **File inspection** |
| `find-large-files` | Grootste files onder pad (path/size/mtime/owner) |
| `recent-file-changes` | Files gewijzigd laatste N uur onder user's public_html |
| `recent-uploads` | Recente files over alle users' public_html |
| **Logs / errors** |
| `exim-log-search` | `exigrep` over Exim mainlog |
| `exim-queue-detail` | Mail queue: sender/recipients/age/size/frozen status |
| `mail-queue` | Queue count + summary |
| `webserver-errors` | Errorlog-tail + 5xx samples voor domein |
| `webshell-scan-detect` | 404-aggregaties over access logs (scanner-detectie) |
| **Mail** |
| `dovecot-user` | uid/gid/home/quota + active sessions per user |
| **Network / firewall** |
| `csf-query` | CSF firewall lookup (IP/templist) |
| `net-connect` | TCP/TLS probe vanuit server naar host:port |
| `probe-url` | curl HEAD/GET vanuit server naar URL |
| `whois` | ipinfo.io lookup, fan-out |
| **LiteSpeed / MySQL** |
| `litespeed-vhosts` | LSWS vhost config (alle of specifiek domein) |
| `lsws-app-sockets` | App-sockets UP/DOWN per domein |
| `mysql-processlist` | Live `SHOW FULL PROCESSLIST` + optioneel slow log tail |
| **Process inspection** |
| `proc-inspect` | /proc voor PID (cmdline, cwd, fds, net) |
| `processes` | ps aux + filter op user/command |
| `svc-status` | systemctl is-active/sub/load voor N units |
| **Security / Imunify** |
| `imunify` | Imunify360 read-only status queries |
| `redis-status` | Redis status per DA-user (socket-based) |

### Mutate templates (`cmd_mutate`, 21 stuks)
| Template | Doel |
|---|---|
| **Firewall / IP** |
| `csf-allow` / `csf-unallow` | CSF permanent allow list |
| `csf-deny` / `csf-undeny` | CSF permanent deny list |
| `da-blacklist-add` / `da-blacklist-remove` | DA login `ip_blacklist` |
| `da-whitelist-add` / `da-whitelist-remove` | DA login `ip_whitelist` |
| **DirectAdmin user maintenance** |
| `da-cron-deny` | Disable cron voor DA-user (`/etc/cron.deny`) |
| `da-dkim-create` | DKIM keypair via DA's `dkim_create.sh` |
| `da-dnssec-enable` | DNSSEC activering via DA's `dnssec.sh` |
| `da-fix-user` | `fix_da_user.sh` — file ownership + permissions + mail |
| `da-letsencrypt-request` | LE cert request/renew via DA's `letsencrypt.sh` |
| `da-set-permissions` | `set_permissions.sh` fix |
| **Mail** |
| `exim-queue-action` | Remove / thaw / freeze Exim queue message |
| **Security / Imunify** |
| `imunify-mutate` | Imunify360 IP whitelist/blacklist + clean/ignore files |
| **CloudLinux** |
| `lve-set-limit` | Set LVE resource limit (nproc, ncpu, pmem, io, iops, mq) |
| **Gateway** |
| `server-reenroll` | Her-enroll van een server (sec-agent update) |
| **Service control** |
| `service-reload` | Graceful reload (allowlist: apache2, bind9, csf, directadmin, …) |
| `service-restart` | Hard restart (zelfde allowlist) |
| **WordPress** |
| `wp-cli-mutate` | State-changing WP-CLI (als file-owner) |

### DirectAdmin API
De gateway exposet de DirectAdmin API via `da.read`, `da.mutate`, `da.dangerous`:

- **311 endpoints** beschikbaar
- **51 read**, **4 mutate**, **4 dangerous**, **252 blocked**
- `schema_stale: false` — schema is actueel
- Endpoints te doorzoeken via `da_endpoints` tool

Read-voorbeelden: `/api/db-show/databases`, `/api/domain-tls/{domain}/certs`, `/api/admin-usage`.
Mutate-voorbeelden: `/api/system-services-actions/service/{service}/reload`.
Dangerous: `/api/restart`, `/api/version/update`.

### Mail-deliverability (`mail_*`, gateway-side + SSH-assisted)
Aparte namespace, **geen SSH nodig voor DNS/SMTP checks**. Sluit alles af wat Q8/Q12 wishlist-items beoogden.

| Tool | Doel | SSH? |
|---|---|---|
| `mail_auth-check` | Combineert SPF + DMARC + MX + DKIM-selectors + FCrDNS per MX-host | nee |
| `mail_fcrdns` | PTR → forward A/AAAA, aparte `match_ipv4`/`match_ipv6` flags | nee |
| `mail_rbl-check` | 12 RBL-zones parallel (zen.spamhaus, spamcop, sorbs, barracuda, uceprotect, 0spam, spfbl, dronebl, justspam, gbudb, surriel, manitu) | nee |
| `mail_smtp-banner` | SMTP connect + EHLO-capabilities + TLS-cert + HELO/PTR match | nee |
| `mail_parse-headers` | Raw headers (RFC 2822) → Received-chain, auth-results, alignment, warnings | nee |
| `mail_rcpt-probe` | RCPT-TO probe; banner → EHLO → MAIL FROM → RCPT → QUIT (geen DATA) | nee |
| `mail_outbound-verify` | `/etc/virtual/domainips` + Exim mainlog sample + PTR/FCrDNS | ja |
| `mail_auth-failures` | Top-N mailboxes met SMTP AUTH-failures per user (niet per IP, zoals fail2ban) | ja |
| `mail_send-count` | Top-N senders per volume (compromise-signal: baseline 20 → 5000/dag) | ja |
| `mail_forwarder-audit` | `/etc/virtual/*/aliases` uit, filterbaar op `external_only` | ja |
| `mail_frozen-summary` | Frozen messages in mainlog over tijdsvenster (werkt ook na queue purge) | ja |

### DRS billing/CRM (read-only)
Native DRS database-access via `drs.*` — vervangt (en obsoletede) `scripts/client-lookup.sh`.

- `drs.client-search` — email/username/name/company/phone/id
- `drs.client-get` — client + 5 recente facturen, package- en domain-count
- `drs.invoice-search` — filter op client_id / invoice_id / status
- `drs.invoice-get` — single invoice + line items (`vat_pct`, `in_collection` flag)
- `drs.package-search` — pakketten/domeinregistraties op client/domain/status
- `drs.logboek-search` — activity log met `flagged` + date-range + `contact_type` + `group`

Money in EUR floats, dates ISO-8601.

---

## Coverage map — triage use cases

Bijgewerkt 2026-04-17 op basis van live introspect. ✅ volledig, ⚠️ deels, ❌ ontbreekt.

| Use case | Dekking | Toelichting |
|---|---|---|
| **Firewall IP-block** (website werkt niet) | ✅ | `csf-query` + `csf-allow/deny` mutates |
| **Dienststatus** (sshd down, #1287686) | ✅ | `svc-status` |
| **Service restart/reload** | ✅ | `service-restart`, `service-reload` (whitelisted units) |
| **Mail queue hangt** | ✅ | `mail-queue`, `exim-queue-detail` |
| **Exim queue manipulation** | ✅ | `exim-queue-action` (remove/thaw/freeze) |
| **DNS-diagnose** | ✅ | `dns` + externe `mcp__dnsscan__*` |
| **DNS zone file read** | ✅ | `dns-zone-read` leest `/var/named/*.db` |
| **DNSSEC activeren** | ✅ | `da-dnssec-enable` mutate |
| **Externe bereikbaarheid** | ✅ | `probe-url`, `net-connect` |
| **Proces-onderzoek** | ✅ | `processes`, `proc-inspect` |
| **Algemene file-inspectie** | ✅ | `fs_list` + `fs_read` (full/tail/grep) |
| **Find large files** | ✅ | `find-large-files` |
| **Recent file changes / uploads** | ✅ | `recent-file-changes`, `recent-uploads` |
| **Quota / disk** | ✅ | `quota-overview`, `user-quota`, `inode-overview`, `disk-usage` |
| **Webserver-logs** | ✅ | `webserver-errors` (errorlog + 5xx samples), `webshell-scan-detect` |
| **Exim-log onderzoek** | ✅ | `exim-log-search` (`exigrep`) |
| **WordPress health + malware** | ✅ | `wp-cli`, `wp-audit-all`, `cms-inventory`, `wp-cli-mutate` |
| **Malware-triage signatures** | ✅ | `webshell-scan-detect`, `recent-uploads`, `recent-file-changes` |
| **DirectAdmin login blacklist/whitelist** | ✅ | `da-blacklist-add/remove`, `da-whitelist-add/remove` |
| **Dovecot user / quota** | ✅ | `dovecot-user` |
| **DirectAdmin user lookup** (pakket, domeinen) | ✅ | `da-user-info` |
| **CloudLinux LVE** | ✅ | `cl-lve`, `cl-lvectl`, `cl-lveps`, `lve-user-info`, `lve-set-limit` |
| **MySQL Governor** | ✅ | `cl-mysql-governor` |
| **PHP Selector** | ✅ | `cl-php-selector` |
| **Imunify** | ✅ | `imunify` (read) + `imunify-mutate` |
| **Redis status per user** | ✅ | `redis-status` |
| **LiteSpeed vhosts/logs** | ✅ | `litespeed-vhosts`, `lsws-app-sockets` |
| **MySQL processlist / slow** | ✅ | `mysql-processlist` (live SHOW PROCESSLIST + slow log tail) |
| **Cron jobs per user** | ✅ | `user-cron` + `cron-audit-all` (security scan) |
| **DirectAdmin API integratie** | ✅ | `da_api.available: true`, 311 endpoints, via `da.read`/`da.mutate` |
| **DRS client/invoice/package/logboek lookup** | ✅ | `drs.*` (6 tools), native CRM-access |
| **iDEAL betaallink bij onbetaalde factuur** | ✅ | `drs.invoice-get` + `drs.invoice-search` leveren `payment_link` (md5-hashed iDEAL URL) |
| **Auto-incasso detectie op client-niveau** | ✅ | `drs.client-get.direct_debit` (boolean) + `iban` (masked indien actief) |
| **Alle contact-emails voor client** | ✅ | `drs.client-get.all_emails` — dedup van email + secondary + invoice |
| **LE renewal trigger + status** | ✅ | `letsencrypt-status` + `da-letsencrypt-request` |
| **SSL / TLS certificaat inspectie** | ✅ | `tls-cert-inspect` (gateway-side, geen SSH nodig) |
| **DKIM overview / create** | ✅ | `dkim-overview` + `da-dkim-create` |
| **DA file-ownership repair** | ✅ | `da-fix-user`, `da-set-permissions` |
| **Traffic per user** | ✅ | `traffic-per-user` |
| **UID → user mapping** | ✅ | `uid-map` |
| **Disable user cron (first-response)** | ✅ | `da-cron-deny` |
| **FCrDNS / PTR-forward match** | ✅ | `mail_fcrdns` — aparte `match_ipv4`/`match_ipv6` flags |
| **Mail deliverability all-in-one** (SPF/DKIM/DMARC + IP) | ✅ | `mail_auth-check` — combined rapport |
| **SMTP banner + HELO vs PTR** | ✅ | `mail_smtp-banner` |
| **Email header parsing** | ✅ | `mail_parse-headers` — pure gateway-side |
| **IP reputation / RBL** | ✅ | `mail_rbl-check` — 12 zones parallel |
| **SMTP recipient probe** | ✅ | `mail_rcpt-probe` |
| **Exim outbound IP verify** | ✅ | `mail_outbound-verify` |
| **SMTP AUTH brute-force per mailbox** | ✅ | `mail_auth-failures` (per-mailbox ≠ fail2ban per-IP) |
| **Compromise detection (sender volume)** | ✅ | `mail_send-count` — baseline-shift signal |
| **Mail-forwarder audit** | ✅ | `mail_forwarder-audit` (DMARC-risk bij Gmail/Outlook targets) |
| **Frozen-queue historie** | ✅ | `mail_frozen-summary` — werkt ook na queue purge |
| **FTP login attempts** | ⚠️ | Geen dedicated template, wel via `fs_read grep` op pureftpd.log |
| **Mailbox password reset** | ⚠️ | Via DA API mogelijk (`da.mutate`), geen convenience-template |
| **Active DA-sessies beheren** | ⚠️ | Via DA API mogelijk, geen convenience-template |
| **File stat** (mtime/ctime/mode/magic) | ⚠️ | `fs_list` geeft mtime, geen ctime; `fs_hash` dekt integrity |
| **Config drift-detection tussen servers** | ✅ | `fs_hash` + `fs_diff` (zelfde path op N servers) |
| **Gateway audit-log inzien** | ✅ | `audit_read` — filter op action/server/tijd/success |
| **cl04 bereikbaarheid** | ✅ | sinds 2026-04-17, enrollment gefixt |
| **cl01, cl02, cl03, cl05, cl06 enrollment** | ❌ | Niet in inventory |

---

## Wishlist — templates om toe te voegen

Elk blok: args + output + `impl` (concreet shell-commando, opzettelijk plat zodat je 'm direct kan testen) + eventuele veiligheidsvereisten.

Convention in de `impl:` blocks:
- `{arg}` = template-argument, al gevalideerd
- `STDOUT` = raw output die de template moet parsen naar het JSON-output-schema
- Gebruik `LC_ALL=C` + `timeout` in productie

---

### Q1 — WordPress (hoogste prio) ✅ DONE
> `wp-cli`, `wp-cli-mutate`, `wp-audit-all`, `cms-inventory` live.

#### `wp-cli` (read)
Vaste sub-command whitelist, path moet onder `/home/*/public_html/**`.

```
args:
  path: string (match /home/*/public_html/*)
  command: enum   (zie onder)
  extra_args: array<string> (max 8, geen | > ; & backtick $(...))

allowed commands:
  core version
  core verify-checksums
  core check-update
  plugin list --format=csv
  plugin list --update=available --format=csv
  theme list --format=csv
  user list --role=administrator --format=csv --fields=ID,user_email,user_login,user_registered
  option get siteurl
  option get home
  option get admin_email
  db size --size_format=mb
  db check
  cron event list
  maintenance-mode status

output: { stdout, stderr, exit_code, parsed?: <command-specific> }
```

**impl:**
```bash
# {user} afgeleid uit owner van {path}/wp-config.php (stat -c %U)
sudo -u {user} -H wp --path={path} --skip-themes --skip-plugins --no-color {command}
```
`--skip-themes --skip-plugins` voorkomt dat een malafide theme/plugin wp-cli hijacked. `sudo -u` is nodig omdat wp-cli weigert als root zonder `--allow-root`.

Secret-mask: nooit `wp config get <key>` voor DB_PASSWORD/AUTH_KEY/salts.

---

#### `php-suspicious-scan` (read)
Bulk grep voor malware-patterns in een tree.

```
args:
  root: string (match /home/*/public_html/** of /home/*/domains/**)
  max_matches: int (default 200, max 1000)

output:
  [{ path, line_number, match_snippet (first 200 chars), pattern_name }]
```

**impl:**
```bash
grep -rEn --include='*.php' --max-count=50 -l \
  -e 'eval\s*\(' \
  -e 'base64_decode\s*\(' \
  -e 'gzinflate\s*\(' \
  -e 'str_rot13\s*\(' \
  -e 'preg_replace.*\/e' \
  -e 'assert\s*\(' \
  -e '@\s*(eval|system|exec|passthru|shell_exec)' \
  {root} 2>/dev/null | head -{max_matches}
```
Dan per hit-path: `grep -En -m 3 '<pattern>' {path}` voor line_number + snippet. Geen user-supplied patterns (echo-injection risk).

---

### Q2 — Quota / storage ✅ DONE
> `quota-overview`, `user-quota`, `inode-overview`, `find-large-files`, `disk-usage`, `traffic-per-user` live.

#### `find-large-files` (read)
```
args:
  root: string (allowlist path)
  min_size_mb: int (default 50)
  max_results: int (default 50, max 500)
  newer_than_days: int (optioneel)
output:
  [{ path, size_bytes, mtime, owner }], size desc
```

**impl:**
```bash
# zonder newer_than_days
find {root} -type f -size +{min_size_mb}M \
  -printf '%s\t%T@\t%u\t%p\n' 2>/dev/null \
  | sort -rn | head -{max_results}

# met newer_than_days
find {root} -type f -size +{min_size_mb}M -mtime -{newer_than_days} \
  -printf '%s\t%T@\t%u\t%p\n' 2>/dev/null \
  | sort -rn | head -{max_results}
```

---

#### `user-quota` (read)
```
args:
  user: string (valideer tegen /home/<user> bestaan)
output:
  { used_mb, limit_mb, files_used, files_limit, raw }
```

**impl:**
```bash
# DirectAdmin-side (betrouwbaarder dan Linux quota bij cagefs)
repquota -a 2>/dev/null | awk -v u={user} '$1==u'
# fallback:
quota -s -u {user} 2>/dev/null
# DA exposes quota in:
cat /usr/local/directadmin/data/users/{user}/quota
```

---

#### `deep-disk-usage` (read, uitbreiding op bestaande `disk-usage`)
Verhoog `depth` cap van 3 naar 5.

**impl (al bekend):**
```bash
du -h --max-depth={depth} {path} 2>/dev/null | sort -h
```

---

### Q3 — Logs (helpers bovenop `fs_read`) ✅ DONE
> `webserver-errors`, `exim-log-search` live.

#### `webserver-errors` (read)
```
args:
  domain: string
  minutes: int (default 60, max 1440)
output:
  { error_lines: [..], fivexx_count: N, fivexx_sample: [..] }
```

**impl:**
```bash
# error log tail (laatste N regels, gefilterd op tijd)
awk -v cutoff=$(date -d "{minutes} minutes ago" +%s) '
  { # parse Apache timestamp ...
  }
' /var/log/httpd/domains/{domain}.error.log | tail -200

# 5xx in access log
awk '$9~/^5[0-9][0-9]$/' /var/log/httpd/domains/{domain}.log | tail -50
```

---

#### `exim-log-search` (read)
```
args:
  pattern: string (email, domain, of message-id — regex `^[A-Za-z0-9@._\-]+$`)
  lines_before: int (default 2, cap 50)
  lines_after: int (default 20, cap 50)
  hours_back: int (default 24, max 168)
output:
  { matches: [{ msgid, from, to, status, log_excerpt }] }
```

**impl:**
```bash
# Exim's eigen tool — trekt alle log-regels van matching messages
exigrep -M -t {hours_back}h '{pattern}' /var/log/exim/mainlog
# of op custom range:
exigrep '{pattern}' /var/log/exim/mainlog
```

---

### Q4 — DirectAdmin ✅ DONE
> `da-user-info`, `da-blacklist-add/remove`, `da-whitelist-add/remove`, `da-fix-user`, `da-set-permissions`, `da-cron-deny` live. Zie ook Q16 (DA API).

#### `da-login-unblock` (mutate)
```
args:
  ip: string (strict IPv4/IPv6 regex ^[0-9a-fA-F.:/]+$)
  reason: string (<200 chars)
output:
  { removed: bool, lines_before, lines_after, service_restarted: bool }
safety:
  - atomic write via tempfile
```

**impl:**
```bash
set -eu
BL=/usr/local/directadmin/data/admin/ip_blacklist
BEFORE=$(wc -l < "$BL" 2>/dev/null || echo 0)
grep -Fxv '{ip}' "$BL" > "$BL.tmp" || true
mv "$BL.tmp" "$BL"
AFTER=$(wc -l < "$BL")
systemctl restart directadmin
echo "{\"removed\": $(( BEFORE != AFTER )), \"before\": $BEFORE, \"after\": $AFTER}"
```

---

#### `da-login-whitelist-add` (mutate)
```
args:
  ip: string
  reason: string
output:
  { added: bool, already_present: bool, service_restarted: bool }
```

**impl:**
```bash
set -eu
WL=/usr/local/directadmin/data/admin/ip_whitelist
touch "$WL"
chown diradmin:diradmin "$WL"
chmod 644 "$WL"
if grep -Fxq '{ip}' "$WL"; then
  echo '{"added": false, "already_present": true}'
else
  echo '{ip}' >> "$WL"
  systemctl restart directadmin
  echo '{"added": true, "already_present": false, "service_restarted": true}'
fi
```

---

#### `da-user-info` (read)
Consolideert `user.conf`, `domains.list`, `packages/*.conf`, status.

**impl:**
```bash
UDIR=/usr/local/directadmin/data/users/{user}
cat "$UDIR/user.conf"            # key=val form: package, creation_date, suspended, etc.
cat "$UDIR/domains.list"
cat "$UDIR/packages.list" 2>/dev/null
ls "$UDIR/domains/"              # per-domain dirs
# pakket-limieten komen uit:
PKG=$(awk -F= '$1=="package"{print $2}' "$UDIR/user.conf")
cat "/usr/local/directadmin/data/admin/packages/$PKG.pkg"
# subaccounts:
cat "$UDIR/users.list" 2>/dev/null
```

---

### Q5 — Service-restart (mutate) ✅ DONE
> `service-restart`, `service-reload` met whitelist van units live.

#### `svc-restart` (mutate)
```
args:
  service: enum (sshd, httpd, lsws, exim, exim4, dovecot, mariadb, mysqld, named, directadmin, php-fpm, csf, lfd)
  reason: string
output:
  { pre_state, post_state, duration_ms }
safety:
  - sshd vereist tweede confirm (lockout-risk)
  - rate-limit: max 3 restarts per svc per 10 min
```

**impl:**
```bash
set -eu
systemctl show {service} -p ActiveState,SubState --value
T0=$(date +%s%3N)
systemctl restart {service}
T1=$(date +%s%3N)
sleep 1
systemctl show {service} -p ActiveState,SubState --value
echo "duration_ms=$(( T1 - T0 ))"
```

---

### Q6 — Mail ✅ DONE
> `dovecot-user`, `dkim-overview`, `da-dkim-create`, `mail-queue`, `exim-queue-detail`, `exim-queue-action` live.

#### `mail-queue-action` (mutate)
```
args:
  message_id: string (^[0-9a-zA-Z-]{16,30}$)
  action: enum (remove, thaw, freeze, deliver)
output:
  { success, stderr }
```

**impl:**
```bash
case {action} in
  remove)  exim -Mrm {message_id} ;;
  thaw)    exim -Mt  {message_id} ;;
  freeze)  exim -Mf  {message_id} ;;
  deliver) exim -M   {message_id} ;;
esac
```

---

#### `dovecot-user` (read)
```
args: email: string (user@domain)
output: { uid, gid, home, quota_used_mb, quota_limit_mb, last_login_ts }
```

**impl:**
```bash
doveadm user {email}
doveadm quota get -u {email}
doveadm who -u {email}
```

---

#### `mail-user-sent` (read)
```
args: domain: string
output: { sent_last_hour, sent_last_day, sent_last_week, limit }
requires: allowlist /etc/virtual/**
```

**impl:**
```bash
cat /etc/virtual/usage/{domain}_out 2>/dev/null   # timestamps per send
cat /etc/virtual/limit                            # globale limit
cat /etc/virtual/limit_{user} 2>/dev/null         # per-user override
# gateway parst timestamps → buckets (hour/day/week)
```

---

### Q7 — Malware response (mutate) ✅ DONE
> `imunify-mutate`, `wp-cli-mutate`, `da-cron-deny` live. `da-fix-user` helpt bij perms-repair na schoonmaak.

#### `quarantine-file` (mutate)
```
args:
  path: string (allowlist path)
  reason: string
output:
  { quarantine_path, original_path, sha256 }
```

**impl:**
```bash
set -eu
QDIR="/root/quarantine/$(date +%F)"
mkdir -p "$QDIR"
HASH=$(sha256sum {path} | cut -d' ' -f1)
BASE=$(basename {path})
DEST="$QDIR/${HASH:0:12}-$BASE"
mv {path} "$DEST"
echo "{path}|$DEST|$HASH|{reason}|$(date -Iseconds)" >> /root/quarantine/.ledger
echo "{\"quarantine_path\":\"$DEST\",\"original_path\":\"{path}\",\"sha256\":\"$HASH\"}"
```

---

### Q8 — IP / rDNS / FCrDNS (mail-deliverability) ✅ DONE
> Namespace `mail_*` (gateway-side) vervangt alle losse Q8-items:
> - `mail_fcrdns` → FCrDNS cross-check met aparte v4/v6 flags
> - `mail_auth-check` → combined SPF/DMARC/MX/DKIM/FCrDNS rapport
> - `mail_rbl-check` → 12 RBL-zones parallel
> - `mail_smtp-banner` → EHLO-capture + TLS + HELO-match
> - `mail_parse-headers` → Received-chain + auth-results parsing

---

### Q9 — Certificaten & DNS zones ✅ DONE
> `letsencrypt-status`, `tls-cert-inspect`, `dns-zone-read`, `da-letsencrypt-request`, `da-dnssec-enable` live.

#### `tls-cert-inspect` (read, gateway-side)
```
args: host, port (default 443), starttls: enum (none, smtp, imap, pop3)
output: { subject, issuer, not_before, not_after, days_until_expiry, san, key_type, key_bits, signature_alg, chain, matches_host }
```

**impl:**
```bash
# starttls=none (HTTPS):
echo | openssl s_client -servername {host} -connect {host}:{port} \
      -showcerts 2>/dev/null </dev/null \
  | openssl x509 -noout -text

# starttls=smtp:
openssl s_client -starttls smtp -servername {host} -connect {host}:{port} \
  -showcerts </dev/null 2>/dev/null \
  | openssl x509 -noout -text

# parse met: -dates -subject -issuer -ext subjectAltName -serial -fingerprint
```

---

#### `letsencrypt-status` (read)
```
args: domain
output: { has_cert, cert_path, not_before, not_after, days_until_expiry, last_renewal_attempt, last_renewal_status, recent_errors }
requires: allowlist /etc/letsencrypt/live/** (exclude privkey.pem) + /var/log/letsencrypt/**
```

**impl:**
```bash
CERT=/etc/letsencrypt/live/{domain}/cert.pem
if [ -f "$CERT" ]; then
  openssl x509 -in "$CERT" -noout -dates -subject -issuer
fi
grep -E '{domain}|error|failure' /var/log/letsencrypt/letsencrypt.log | tail -30
# renewal taken:
ls -la /etc/letsencrypt/renewal/{domain}.conf
```

---

#### `dns-zone-read` (read)
```
args: domain
output: { zone_file_path, serial, ns_records, mx_records, a_records, txt_records, dnskey_present, last_modified }
requires: allowlist /var/named/**
```

**impl:**
```bash
ZONE=/var/named/{domain}.db
cat "$ZONE"                             # raw zone content
named-checkzone {domain} "$ZONE"        # validatie
stat -c '%y' "$ZONE"                    # last_modified
grep -E '^\s*[0-9]+\s+IN\s+SOA' "$ZONE" # serial
```

---

### Q10 — Cron & scheduled tasks ✅ DONE
> `user-cron`, `cron-audit-all` (security scan) live.

#### `user-cron` (read)
```
args: user
output: { crontab_entries, da_tasks, suspicious_lines }
requires: allowlist /var/spool/cron/{user} (single-file, geen glob)
```

**impl:**
```bash
# system crontab per user:
cat /var/spool/cron/{user} 2>/dev/null
# DA cron config:
cat /usr/local/directadmin/data/users/{user}/crontab.conf 2>/dev/null
# heuristic: verdachte regels
cat /var/spool/cron/{user} 2>/dev/null | \
  grep -E 'curl|wget|base64|/tmp/|bash -c|sh -c|php -r'
```

---

### Q11 — Redis (per-user DA-feature) ✅ DONE
> `redis-status` live.

#### `redis-status` (read)
```
args: user
output: { enabled, socket_path, pid, memory_used_mb, connected_clients, uptime_seconds, last_save_ts }
requires: allowlist /home/*/.redis/** en /var/lib/redis/**
```

**impl:**
```bash
SOCK=$(ls /home/{user}/.redis/redis.sock 2>/dev/null || \
       ls /var/lib/redis/{user}/redis.sock 2>/dev/null || \
       ls /var/run/redis/{user}.sock 2>/dev/null)
if [ -n "$SOCK" ] && [ -S "$SOCK" ]; then
  redis-cli -s "$SOCK" PING
  redis-cli -s "$SOCK" INFO server memory clients persistence
fi
```

---

### Q12 — SMTP / mail-delivery dieper ✅ DONE
> Ook via `mail_*` namespace:
> - `mail_rcpt-probe` — RCPT-TO probe zonder DATA, auto-MX-resolve
> - `mail_outbound-verify` — `/etc/virtual/domainips` + mainlog sample + PTR/FCrDNS
>
> Bonus toevoegingen niet in oorspronkelijke wishlist:
> - `mail_auth-failures` — per-mailbox SMTP-AUTH brute-force tracking
> - `mail_send-count` — compromise-detectie via sender-volume baseline
> - `mail_frozen-summary` — frozen queue historie (werkt ook na purge)
> - `mail_forwarder-audit` — `/etc/virtual/*/aliases` audit, filter `external_only` voor DMARC-risk

---

### Q13 — CloudLinux & Imunify (alleen op CL-servers) ✅ DONE
> `cl-lve`, `cl-lvectl`, `cl-lveps`, `cl-mysql-governor`, `cl-php-selector`, `lve-user-info`, `lve-set-limit`, `imunify`, `imunify-mutate` live.

Nog niet relevant voor `vps333` (geen CL), wél voor `cl0*` servers. Achter server-type flag.

#### `lve-info` (read)
```
args: user? (default: top-10 globaal), period: enum (10m, 1h, 1d)
output: { cpu_faults, mem_faults, io_faults, ep_faults, nproc_faults, peak_cpu_pct, peak_mem_mb, limits }
```

**impl:**
```bash
# specifieke user:
lveinfo --user={user} --period={period}
# top-users:
lveinfo --by-usage=cpu --period={period} | head -20
# huidige limiet-config:
lvectl list | grep -E "^{user}|^DEFAULT"
```

---

#### `imunify-malware-list` (read)
```
args: user?, limit: int (default 50)
output: { incidents: [...], total_count }
```

**impl:**
```bash
imunify360-agent malware list --user {user} --limit {limit} --json
# globaal:
imunify360-agent malware list --limit {limit} --json
```

---

### Q14 — LiteSpeed & MySQL inspectie ✅ DONE
> `litespeed-vhosts`, `lsws-app-sockets`, `mysql-processlist` live. Kill-query nog via DA API (`da.mutate`) niet via dedicated template.

Allowlist-uitbreidingen: `/usr/local/lsws`, `/usr/local/lsws/conf/**`, `/usr/local/lsws/logs/**`.

#### `mysql-processlist` (read)
```
args: filter_user?, filter_time_gt_s?
output: [{ id, user, host, db, command, time_s, state, info_snippet }]
```

**impl:**
```bash
# DA-cred-file is /usr/local/directadmin/conf/my.cnf (NIET mysql.conf — DA's eigen key=val format),
# en --defaults-extra-file moet de eerste optie zijn.
mysql --defaults-extra-file=/usr/local/directadmin/conf/my.cnf -N \
  -e "SELECT ID, USER, HOST, DB, COMMAND, TIME, STATE, LEFT(INFO, 200) \
      FROM information_schema.PROCESSLIST \
      WHERE COMMAND != 'Sleep' \
      ORDER BY TIME DESC"
```
Secret-mask op INFO-kolom (soms creds in query-text). Geverifieerd op cl07 (2026-04-14).

---

#### `mysql-slow-sample` (read)
```
args: limit: int (default 20), min_query_time_s: int (default 2)
output: [{ timestamp, user, db, query_time_s, rows_examined, query_excerpt }]
```

**impl:**
```bash
# slow-log pad uit config:
SL=$(mysql --defaults-extra-file=/usr/local/directadmin/conf/my.cnf -N \
     -e "SELECT @@slow_query_log_file")
tail -n 2000 "$SL" | \
  awk '/^# Time:/{ts=$0} /^# Query_time:/{qt=$3; re=$7} /^[^#]/{print ts"|"qt"|"re"|"$0}' | \
  tail -{limit}
# of pt-query-digest:
pt-query-digest --limit={limit} "$SL"
```

---

### Q15 — FTP-diagnostiek ⚠️ PARTIAL
> Geen dedicated FTP-template; wel via `fs_read grep` op proftpd/pure-ftpd logs.

#### `ftp-user-attempts` (read)
```
args: user?, ip?, hours_back: int (default 24)
output: { attempts: [...], summary: { total, success, failed, unique_ips } }
```

**impl:**
```bash
# pure-ftpd:
grep -E '{user}|{ip}' /var/log/pureftpd.log 2>/dev/null
# proftpd:
grep -E '{user}|{ip}' /var/log/proftpd/proftpd.log 2>/dev/null
# messages (fallback):
grep -E 'ftp.*({user}|{ip})' /var/log/messages 2>/dev/null
# filter op tijdwindow:
awk -v cutoff=$(date -d "{hours_back} hours ago" +%s) '...'
```

---

### Q16 — DirectAdmin API-integratie (game-changer) ✅ DONE
> DA API is live via `da.read` / `da.mutate` / `da.dangerous`. **311 endpoints** (51 read, 4 mutate, 4 dangerous, 252 blocked), schema niet stale. Doorzoeken via `da_endpoints` tool.

Naast SSH-templates zou de gateway ook de DirectAdmin REST API moeten ontsluiten. DA draait op poort 2222 op elke server, exposed een Swagger-gedocumenteerde JSON-API met **262 endpoints** (demo: <https://demo.directadmin.com:2222/static/swagger.json>), en biedt een magisch one-shot auth-mechanisme:

```bash
# temp admin-session, 24u geldig:
curl -s $(da api-url)/api/version

# temp impersonated user-session, 24u geldig:
curl -s $(da api-url --user=john)/api/session
```

De URL bevat een temp login-key. Geen password-knippen, geen stored creds. Voor een sec-agent gateway is dit ideaal: we schrapen nooit wachtwoorden, we genereren per-request (of per-session) een kortlevende key.

#### Veiligheid & operationele principes
- **Key opnieuw ophalen per template-call** (of cache max 5 min, zeker niet 24u vasthouden) — lekken is dan impact-gelimiteerd
- **Key nooit loggen** in audit-trail; alleen base-URL + endpoint + method + args
- `--user=` alleen impersonation als template expliciet per-user is; nooit impliciet escalaten naar admin
- Read-only endpoints default; mutates via `cmd_mutate` met audit + approval
- Request timeout default 10s, max 60s
- Response-truncation 1MB

---

#### `da-api-get` (read, generic)
Een algemene GET-wrapper met path-allowlist. Vervangt 80% van onze huidige SSH-based file reads.

```
args:
  path: string (match allowlist regex)
  as_user: string (optional — gebruikt --user={as_user} voor impersonation)
  query: object (optional — querystring)

output:
  { status_code, headers, body: <parsed JSON> }

allowlist-regex (voorlopig):
  ^/api/(info|version|session|session/.*|users/[^/]+/(config|usage|login-history)
    |login-history|login-keys/.*|admin-usage|search/.*
    |system-info/.*|system-services/.*|system-packages/.*
    |resource-usage/.*|global-resource-usage/.*
    |db-show/.*|db-monitor/.*
    |domain-tls/.*|server-tls/.*
    |redis/status|modsecurity/.*|modsecurity-audit-log/.*
    |email-logs.*|email-config/.*|emailvacation/.*
    |filemanager/.*|git/.*|messages|messages/.*|sessions
    |server-settings/.*|maintenance|license|plugins/.*)$
```

**impl:**
```bash
# gateway draait op server, dus da-binary is beschikbaar
BASE=$(da api-url${as_user:+ --user=$as_user})
curl -s --max-time 10 "$BASE{path}${query:+?$query}" \
     -H 'Accept: application/json'
```

---

#### `da-api-post` (mutate, generic met method + endpoint allowlist)
Meer restrictief: elke mutating endpoint moet in `mutation_allowlist` staan, geen generieke POST.

```
args:
  path: string (allowlist regex — aparte strictere list)
  method: enum (POST, PUT, PATCH, DELETE)
  body: object (optional)
  as_user: string (optional)
output:
  { status_code, body }
```

**mutation-allowlist (voorbeeld):**
```
POST   /api/system-services-actions/service/{sshd|httpd|exim|dovecot|mariadb|named|directadmin|php*}/restart
POST   /api/session/login-as/switch                    # impersonation
POST   /api/session/login-as/return
POST   /api/change-password                            # mailbox/FTP password reset
POST   /api/domain-tls/{domain}/certs/.../files        # LE replace (careful)
POST   /api/db-manage/databases/{db}/repair|optimize|check
POST   /api/db-monitor/processes/{id}/kill             # kill slow query
POST   /api/redis/enable|disable
POST   /api/phpmyadmin-sso/account-access              # SSO-URL voor klant
PUT    /api/domain-tls/{domain}/acme-config
POST   /api/server-tls/obtain                          # trigger LE renewal
POST   /api/clamav                                     # trigger scan
```

**impl:**
```bash
BASE=$(da api-url${as_user:+ --user=$as_user})
curl -s --max-time 30 -X {method} \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     ${body:+-d '$body'} \
     "$BASE{path}"
```

---

#### Welke use cases dit onmiddellijk oplost

| Triage-gebruik | DA-API-route | Was voorheen |
|---|---|---|
| Volledige klantinfo (pakket, quota, status, domeinen) | `GET /api/users/{u}/config` + `/usage` | handmatig `cat user.conf` + `domains.list` |
| Live MySQL processlist | `GET /api/db-monitor/processes` | `mysql --defaults-extra-file=...` |
| Kill slow query | `POST /api/db-monitor/processes/{id}/kill` | `mysql -e "KILL {id}"` |
| Redis aan/uit + status | `GET/POST /api/redis/*` | socket-probe + DA UI |
| Service-restart | `POST /api/system-services-actions/service/{svc}/restart` | `systemctl restart` + audit-log handmatig |
| User impersonatie (als klant kijken) | `POST /api/session/login-as/switch` | NIET MOGELIJK via SSH — game-changer |
| Mailbox password reset | `POST /api/change-password` + `as_user` | DA UI handmatig |
| Trigger LE-renewal | `POST /api/server-tls/obtain` of `POST /api/domain-tls/{d}/certs/.../refresh` | `certbot renew --cert-name` |
| SSL cert status per domein | `GET /api/domain-tls/{domain}/certs` | openssl x509 per pad |
| Exim log (user-scope!) | `GET /api/email-logs/user?as_user=X` | root-grep op mainlog |
| ModSecurity audit log parse | `GET /api/modsecurity-audit-log/summary` | `fs_read grep` op auditlog |
| Login history (brute-force review) | `GET /api/login-history`, `GET /api/users/{u}/login-history` | `/var/log/lfd.log` + `/var/log/secure` |
| Active sessions zien & killen | `GET /api/sessions` + `POST /api/sessions/destroy/{id}` | n.v.t. |
| ClamAV on-demand scan | `POST /api/clamav` + `GET /api/clamav/{pid}` | cli handmatig |
| DA search users door hele server | `GET /api/search/users-extended?query=...` | grep door `/usr/local/directadmin/data/users/` |
| Systeem-info (CPU/memory/load/FS) | `GET /api/system-info/{cpu|memory|load|fs|uptime}` | `uptime`, `free`, `df` los |

---

#### Endpoints die NIET via swagger zitten — legacy `CMD_*`

DA heeft naast de moderne `/api/*` ook een legacy HTTP-interface onder `/CMD_API_*`. Die geven JSON met de `json=yes` parameter. De sessie-key werkt op beide. Voor triage hebben we deze legacy endpoints nog nodig (geen moderne tegenhanger):

- `CMD_API_DNS_CONTROL` — DNS records lezen/schrijven per domein
- `CMD_API_POP` — mailaccounts beheren (create/delete/change quota)
- `CMD_API_EMAIL_FORWARDERS` — forwards
- `CMD_API_EMAIL_AUTORESPONDER` — autoresponders
- `CMD_API_FTP` — FTP-accounts
- `CMD_API_SHOW_DOMAINS` — domeinen per user (overlapt met `/api/users/{u}/config`)

Ze geven geen mooie JSON maar URL-encoded key=val responses. De gateway kan `da-legacy-cmd` als een derde template-type aanbieden als we DNS-editing willen:

```
da-legacy-cmd:
  args: command: enum(<allowlist>), as_user: string, params: object
  impl: curl -s "$(da api-url --user={as_user})/CMD_API_{command}?json=yes&$(urlencode {params})"
```

---

#### Prioriteit van DA-API-rollout

1. **`da-api-get`** generic read — ontsluit meteen 50+ endpoints zonder per-stuk template-werk
2. **`da-api-get` + `--user=`** impersonation voor user-scope endpoints
3. **Specifieke mutates** vóór generic mutate:
   - `svc-restart` via `/api/system-services-actions/...` (vervangt SSH `systemctl restart`)
   - `da-user-info` via `/api/users/{u}/config` + `/usage` (vervangt file-reads)
   - `mysql-processlist` via `/api/db-monitor/processes` (vervangt mysql-cli)
4. **Legacy CMD_ wrapper** pas als DNS/mail-account beheer vanaf de triage-laag echt nodig is (nu doen we dat nog in Mijn KeurigOnline of DA UI)

---

### Q17 — File-inspectie helpers ✅ DONE
> `find-large-files`, `recent-file-changes`, `recent-uploads` live.

#### `file-stat` (read)
```
args: path
output: { size, mode, uid_name, gid_name, atime, mtime, ctime, inode, mime_type, magic_type }
```

**impl:**
```bash
stat -c 'size=%s mode=%a uid=%U gid=%G atime=%X mtime=%Y ctime=%Z inode=%i type=%F' {path}
file --brief --mime-type {path}
file --brief {path}
```
ctime vs mtime detecteert `touch -t` tampering.

---

#### `file-integrity` (read)
```
args: path
output: { sha256, md5, size }
```

**impl:**
```bash
sha256sum {path}
md5sum {path}
stat -c %s {path}
```

---

### Q18 — DRS billing enrichment ✅ DONE
> Alle drie gaps gesloten (2026-04-20):
> - **`drs.client-get.all_emails`** — deduped union van email + `secondary_email` + `invoice_email`
> - **`drs.client-get.direct_debit`** (boolean) + `iban` (masked indien mandaat actief) — vervangt `billing_method`-interpretatie, load-bearing voor `feedback_auto_incasso_no_ideal.md`
> - **`drs.invoice-get.payment_link`** + idem op `drs.invoice-search` — iDEAL URL met correcte md5-hash (`betalen.keurigonline.nl/ideal/{client}/{invoice}/{md5}`)
>
> Triage-replies kunnen nu volledig zonder shell-fallback. **Guard:** altijd `direct_debit` checken vóór je `payment_link` aan een klant voorstelt — incasso-klanten krijgen geen iDEAL-push.

Nog open (optioneel, lage prio):
- Fleet-wide `drs.logboek-search` met alleen `flagged=true` zonder `client_id` — alleen bouwen als DRS actief flagging gebruikt.

---

## Allowlist-uitbreidingen

Paden die nu ontbreken maar voor triage gewenst zijn:
- `/etc/virtual`, `/etc/virtual/**` — Exim per-domain config (domainips, domainowners, usage, passwd per domain)
- `/var/log/exim`, `/var/log/exim/**` — mainlog/rejectlog/paniclog (check of al onder `/var/log/**`)
- `/var/log/httpd/domains/**` — per-domain access/error (idem)
- `/etc/letsencrypt/live/**` — cert dates (uitgezonderd `privkey.pem`)
- `/var/log/letsencrypt/**` — renewal error log
- `/var/named`, `/var/named/**` — zone files (DNS-triage, legacy NS)
- `/usr/local/lsws`, `/usr/local/lsws/conf/**`, `/usr/local/lsws/logs/**` — LiteSpeed
- `/etc/dovecot`, `/etc/dovecot/**` — dovecot config
- `/var/spool/cron/<user>` — per-user cron (single-file, niet glob)
- `/var/lib/redis`, `/var/lib/redis/<user>/**` — Redis user sockets/data
- `/home/*/.redis/**` — per-user Redis config (DA-standaard pad)
- `/var/log/pureftpd.log`, `/var/log/proftpd/**` — FTP attempts

**Secret-mask vereist** bij uitbreiding:
- `/usr/local/directadmin/conf/my.cnf` (MySQL da_admin cred in [client] format)
- `/usr/local/directadmin/conf/mysql.conf` (DA's eigen key=val format met user/passwd)
- `wp-config.php` bij read (salts, DB_PASSWORD)
- `/etc/my.cnf.d/*pass*`, alle `*_pass*`, `*_password*`, `*_secret*`, `*_token*` in `/etc/`
- `/etc/letsencrypt/live/*/privkey.pem` — **expliciet uitsluiten**, nooit leesbaar

---

## Monitoring

**`/health`** (public, geen bearer) — de enige publieke endpoint op `https://gateway.keurigonline.nl`. Retourneert `{"status":"ok", "timestamp", "timestamp_utc"}` in ~100ms. Alle andere endpoints geven `401 missing bearer token`.

Wat het wél zegt: gateway-proces leeft, Apache/2 reverse-proxy routeert, TLS + DNS ok.
Wat het **niet** zegt: bereikbaarheid naar cl0*/vps333 vanaf de gateway, Help Scout API-status, DRS-DB-status, dnsscan/bNamed MCPs.

**Gebruik in de triage-cron** (`scripts/run-triage-cron.sh`, sinds 2026-04-20):
- Pre-flight curl naar `/health` vóór Claude wordt gestart → bij non-200 of ontbrekend `"status":"ok"` wordt de run overgeslagen (exit 0, Claude niet gespawnd).
- Elke run schrijft één regel naar `logs/triage/cron-health.log`:
  - `gateway=ok hs=ok` → pre-flight clean
  - `gateway=down code=… body=…` → skip wegens gateway
  - `gateway=ok hs=down exit=2` → skip wegens HS API (next-koos-ticket.sh faalde)
- HS API-liveness is piggy-backed op `next-koos-ticket.sh` (de OAuth2 + conv-fetch zelf = probe). Geen aparte probe nodig.
- Uptime-% berekenen: `grep -c 'gateway=ok hs=ok' cron-health.log` vs `wc -l cron-health.log`.

**Aanbeveling voor externe monitoring**: `/health` opnemen in StatusCake / BetterUptime. Gateway-outage = alle klantdiagnostiek uit, dat wil je direct weten, niet pas na een rondje failing triage-runs.

---

## Argument-quirks & observed behavior (live-tested 2026-04-20)

Deze argument-schema's wijken af van wat je uit de template-naam zou gokken — handig om te weten voordat je ze aanroept:

| Template | Quirk |
|---|---|
| `dns` | Args = `hostnames: string[]` + `record_types: string[]`, maar returns alleen **eerste** type. Roep meermaals aan voor A/MX/TXT apart, of parseer uit `dns-zone-read.raw`. |
| `svc-status` | Arg heet `services: string[]` (niet `units`). Service-namen zonder `.service` suffix. |
| `csf-query` | Verplicht `action: "grep"\|"templist"` arg. |
| `imunify` | `action` enum: `"status"`, `"malware-list"`, `"blacklist-view"` (dash, niet underscore). |
| `whois` | Args = `ips: string[]` (niet `ip`); returns `byOrg` aggregatie. |
| `traffic-per-user` | Sorteert **ascending** — top-N geeft laagste verbruikers, niet hoogste. |
| `letsencrypt-status` | Leest alleen `/etc/letsencrypt/live/`; domeinen met DA-managed wildcard (opgeslagen in DA user-dir) rapporteren `has_cert: false` ondanks werkend cert. |
| `dns-zone-read` | Veld `serial` is null maar staat wel in `raw`. Parse zelf als je de serial nodig hebt. |
| `mysql-processlist` (cl07) | Faalt met "MySQL/MariaDB not available via local socket" wanneer mariadb.service in auto-restart-loop staat, ook al is socket up. |
| `da-user-info` | Retourneert leeg object voor users die niet via DA aangemaakt zijn (bijv. handmatig in `/etc/passwd`). Geen error. |
| `cms-inventory` | Scope = DA-users. Niet-DA users leveren `installs: []`. |
| `find-large-files` | `root` moet `/home/{user}` of dieper zijn; niet `/home/*`. |

---

## Design-principes voor nieuwe templates

1. **Typed args + regex-validatie** — geen free-string op paths, IPs, emails, commands
2. **Output structured** — JSON objects, niet raw shell (parseability)
3. **Truncation defaults** — max 1MB output, 500 lines, 200 matches; overridable binnen limits
4. **Read vs mutate gescheiden** — nooit read die schrijft, nooit mutate zonder audit-log
5. **Secret-mask server-side** — niet callerʼs verantwoordelijkheid
6. **Fan-out opt-in** — `server: "all"` alleen als idempotent en goedkoop (probe-url ✅, wp-cli verify-checksums ❌)
7. **Rate-limit mutates** — voorkom 50x sshd-restart
8. **Idempotent waar mogelijk** — `csf-allow` voor al-allowed IP is geen error
9. **Audit log** — mutates loggen centraal met caller + timestamp + args + result
10. **Versionable templates** — template-naam + versie voor traceable semantiek-changes

---

## Openstaande wishlist (na 2026-04-20 audit)

Alle Q1–Q18 items zijn ✅ DONE. Nog open:

1. **`ftp-user-attempts`** — FTP-login-parser (pureftpd.log / proftpd.log). Fallback is `fs_read grep`, maar dedicated template zou useful zijn.
2. **`file-stat` + `file-integrity`** — polish-templates: ctime/magic (`fs_hash` dekt sha256 al, `fs_list` geeft mtime).
3. **Mailbox password reset convenience-template** — nu via `da.mutate POST /api/change-password`, maar een `mailbox-pw-reset` wrapper met argument-validatie scheelt een roundtrip.
4. **Active DA-sessies beheren** — `da.read GET /api/sessions` + `da.mutate POST /api/sessions/destroy/{id}` wrapper.
5. **cl01-03, cl05-06 enrollment** — uitrollen als die servers in productie komen.
6. **DRS fleet-wide `logboek-search flagged=true`** — alleen bouwen als DRS actief flagging gebruikt.
7. **Argument-quirks normaliseren** — bovenstaande tabel impliceert dat enkele templates een arg-naming pass kunnen gebruiken (`dns.record_types` één-per-call, `traffic-per-user` default sort descending, `letsencrypt-status` ook DA-cert-dir scannen).

8. **`drs.client-summary(client_id)`** — middenklasse-call tussen `drs.client-search` (7 velden, ~170 tok) en `drs.client-get` (30 velden + 5 nested invoices, ~720 tok). Triage heeft 80% van de tijd `direct_debit` + `package_count` + `domain_count` + `open_invoices_count` nodig, maar niet de 5 recente facturen als objecten. Shape:
   ```json
   {
     "client_id": 3, "name": "...", "email": "...", "all_emails": [...],
     "company": "...", "status": "actief",
     "direct_debit": false, "iban": null,
     "package_count": 84, "domain_count": 83,
     "open_invoices_count": 0, "open_invoices_total_eur": 0.0
   }
   ```
   ~250 tok, bespaart ~470 tok per lookup op de fat call. Over ~100 triage-runs per week ≈ 47k tokens / week minder — signaal, niet wereldschok, maar gratis winst.

   Alternatief: `fields` projection param op bestaande `drs.client-get` (GraphQL-stijl). Minder tools, meer regex in de gateway-laag. Voorkeur hangt af van hoe jullie de gateway architect hebben — een aparte tool is de duidelijkste API, projection is flexibeler.

---

## Buiten scope

Dingen die de gateway bewust **niet** moet aanbieden:
- Free-form `bash -c` of `sh -c` — sluit model-injection uit
- Interactieve shells, `vim`, `less`
- File-writes buiten gescripte mutate-templates
- `rm -rf` of wildcard deletes (quarantine is het alternatief)
- Root password resets / key rotation (ops, niet triage)
- Opzetten/afbreken van SSH-keys op klantaccounts (`adminssh/create` bovendien kapot)
- Reading `shadow`, `/root/**`, `/etc/ssh/*_key` (private host keys)
- Reading `/etc/letsencrypt/live/*/privkey.pem`
