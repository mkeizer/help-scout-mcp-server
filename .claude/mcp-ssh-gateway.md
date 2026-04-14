# MCP SSH Gateway — Spec & Wishlist

Deze doc vervangt het eerdere `mcp-ssh-gateway-scopes.md`. Dat ging uit van een drie-scope model (lokaal / user-shell / root) met brede command-whitelists. De werkelijke gateway kiest een ander model en deze doc volgt dát model.

## Architectuur

**Eén sec-agent** logt in op elke managed server. De MCP-laag biedt geen shell-toegang aan ons, maar drie soorten operaties:

1. **`fs_list`** — find-achtige listing binnen path-allowlist
2. **`fs_read`** — full / tail / grep op een bestand binnen path-allowlist
3. **`cmd_run` + `cmd_mutate`** — aanroepen van vooraf-gedefinieerde **templates** met gevalideerde argument-schema's

Geen user-switch, geen `su - user`, geen free-form commando's. De veiligheid zit in:
- **Path allowlist** (alles buiten de lijst is onzichtbaar)
- **Template allowlist** (alleen gescripte ops met typed args)
- **Mutate-scheiding** (destructieve ops via eigen kanaal)
- **Fan-out via `server: "all"`** voor multi-server incidents

---

## Huidige capabilities (2026-04-14)

### Servers in inventory
- `vps333`

### fs path allowlist
```
/var/log, /var/log/**
/etc/httpd, /etc/httpd/**
/usr/local/apache, /usr/local/apache/**
/var/httpd, /var/httpd/**
/usr/local/directadmin/conf, /usr/local/directadmin/conf/**
/usr/local/directadmin/data, /usr/local/directadmin/data/**
/usr/local/directadmin/logs, /usr/local/directadmin/logs/**
/home/*/domains, /home/*/domains/**
/home/*/logs, /home/*/logs/**
/home/*/public_html, /home/*/public_html/**
/home/*/imap
/home/*/Maildir/.Junk
/opt/alt, /opt/alt/**
/var/cagefs, /var/cagefs/**
/etc/container, /etc/container/**
/etc/exim4, /etc/exim4/**
/etc/exim.conf
/etc/php*, /etc/php*/**
/etc/my.cnf, /etc/my.cnf.d, /etc/my.cnf.d/**
/etc/nginx, /etc/nginx/**
/etc/csf, /etc/csf/**
```

### Read templates (`cmd_run`)
| Template | Doel |
|---|---|
| `csf-query` | CSF firewall lookup (grep IP / templist) |
| `disk-usage` | df -h of du -sh met depth op allowlist-path |
| `dns` | A/AAAA/MX/TXT/PTR/NS/CNAME lookups (gateway-side) |
| `mail-queue` | Exim queue count + details |
| `net-connect` | TCP/TLS probe vanuit server naar host:port |
| `probe-url` | curl HEAD/GET vanuit server naar URL |
| `proc-inspect` | Deep /proc inspect van PID (cmdline, cwd, fds, net) |
| `processes` | ps aux, filter op user / name |
| `svc-status` | systemctl is-active/sub/load voor N units |
| `whois` | ipinfo.io lookup, fan-out |

### Mutate templates (`cmd_mutate`)
| Template | Doel |
|---|---|
| `csf-allow` | IP naar permanent allow |
| `csf-deny` | IP naar permanent deny |
| `csf-unallow` | IP uit allow halen |
| `csf-undeny` | IP uit deny halen |

---

## Coverage map — triage use cases

Gebaseerd op patronen uit CLAUDE.md en memory. ✅ volledig, ⚠️ deels, ❌ ontbreekt.

| Use case | Dekking | Toelichting |
|---|---|---|
| **Firewall IP-block** (website werkt niet) | ✅ | `csf-query grep`, mutate via `csf-unallow/undeny` |
| **Dienststatus** (sshd down, #1287686) | ✅ | `svc-status` |
| **Mail queue hangt** | ✅ | `mail-queue` |
| **DNS-diagnose** | ✅ | `dns` + externe `mcp__dnsscan__*` |
| **Externe bereikbaarheid** | ✅ | `probe-url`, `net-connect` |
| **Proces-onderzoek** | ✅ | `processes`, `proc-inspect` |
| **Algemene file-inspectie** | ✅ | `fs_list` + `fs_read` (full/tail/grep) |
| **Quota / disk** | ⚠️ | `disk-usage` wel, geen `quota -s`, geen top-20 grootste files |
| **Webserver-logs** | ⚠️ | `fs_read grep` werkt, geen 5xx-helper |
| **Exim-log onderzoek** | ⚠️ | `fs_read` op `/etc/exim*`, geen `exigrep`-template |
| **WordPress health + malware** | ❌ | geen wp-cli template |
| **Malware-triage signatures** | ❌ | alleen manual `fs_read grep` per-file |
| **DirectAdmin login blacklist/whitelist** | ❌ | read werkt, geen mutate |
| **Dovecot user / quota** | ❌ | geen template |
| **DirectAdmin user lookup** (pakket, domeinen) | ❌ | paden in allowlist, geen helper |
| **CloudLinux LVE** | ❌ | geen template (alleen op cl0* nodig) |
| **Imunify** | ❌ | geen template |
| **Service restart** | ❌ | alleen csf-mutates |
| **Exim queue manipulation** | ❌ | queue zichtbaar, geen remove/thaw/freeze |
| **File stat** (mtime/ctime) | ❌ | `fs_list` geeft mtime, geen ctime |
| **Find large files** | ❌ | fs_list heeft geen size-filter |
| **FCrDNS / PTR-forward match** | ⚠️ | losse PTR-lookups, geen cross-check |
| **Mail deliverability** (SPF/DKIM/DMARC + IP) | ❌ | geen alles-in-één report |
| **SMTP banner + HELO** vs PTR | ❌ | `net-connect` doet TCP/TLS, geen EHLO |
| **Email header parsing** | ❌ | compleet handmatig |
| **IP reputation / RBL** | ⚠️ | `whois` geeft geo/ASN, geen RBL |
| **SSL / TLS certificaat** | ❌ | geen template |
| **Let's Encrypt renewal status** | ❌ | `/etc/letsencrypt/**` niet in allowlist |
| **DNS zone file read** | ❌ | `/var/named/**` niet in allowlist |
| **Cron jobs per user** | ⚠️ | DA crontab via fs_read, geen helper |
| **Redis status per user** | ❌ | geen template |
| **LiteSpeed vhosts/logs** | ❌ | `/usr/local/lsws/**` niet in allowlist |
| **MySQL processlist / slow** | ⚠️ | logs via fs_read, geen live processlist |
| **SMTP recipient probe** | ❌ | geen template |
| **Exim outbound IP verify** | ❌ | `domainips` lezen, geen verify-template |
| **FTP login attempts** | ⚠️ | fs_read grep werkt, geen helper |
| **DirectAdmin API integratie** (als-klant kijken, pakket upgrades, LE renewal, etc.) | ❌ | niet ontsloten; `da api-url` wacht op wrapper |
| **User impersonation** (als-klant in DA UI / API kijken) | ❌ | geen template; unieke capability van DA-API |
| **Mailbox password reset** | ❌ | via DA API mogelijk, geen template |
| **LE renewal trigger** | ❌ | via `/api/server-tls/obtain` of domain-TLS, geen template |
| **Live DB processlist + kill** | ❌ | via `/api/db-monitor/processes`, veel schoner dan mysql-cli |
| **Exim-log user-scope** | ❌ | `/api/email-logs/user` met impersonation — geen root-grep nodig |
| **Active DA-sessies beheren** | ❌ | `/api/sessions` — destroy compromised sessions |

---

## Wishlist — templates om toe te voegen

Elk blok: args + output + `impl` (concreet shell-commando, opzettelijk plat zodat je 'm direct kan testen) + eventuele veiligheidsvereisten.

Convention in de `impl:` blocks:
- `{arg}` = template-argument, al gevalideerd
- `STDOUT` = raw output die de template moet parsen naar het JSON-output-schema
- Gebruik `LC_ALL=C` + `timeout` in productie

---

### Q1 — WordPress (hoogste prio)

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

### Q2 — Quota / storage

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

### Q3 — Logs (helpers bovenop `fs_read`)

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

### Q4 — DirectAdmin

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

### Q5 — Service-restart (mutate)

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

### Q6 — Mail

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

### Q7 — Malware response (mutate)

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

### Q8 — IP / rDNS / FCrDNS (mail-deliverability)

#### `fcrdns-check` (read, gateway-side — geen SSH nodig)
```
args: ip: string (IPv4 of IPv6)
output: { ip, ptr, forward_a, forward_aaaa, fcrdns_match, fcrdns_match_ipv4, fcrdns_match_ipv6, missing_records }
```

**impl:**
```bash
PTR=$(dig +short -x {ip} | sed 's/\.$//' | head -1)
[ -z "$PTR" ] && { echo '{"ptr":null,"fcrdns_match":false}'; exit; }
A=$(dig +short A    "$PTR")
AAAA=$(dig +short AAAA "$PTR")
# gateway vergelijkt: is {ip} in $A ∪ $AAAA ?
```

---

#### `mail-sender-diag` (read)
```
args: domain, dkim_selectors: [...], sender_ip?: string
output: combineert MX/SPF/DMARC/DKIM/outbound_ip/PTR/FCrDNS
```

**impl (parallel uitvoeren):**
```bash
dig +short MX  {domain}
dig +short TXT {domain}                               # SPF zit in deze TXT
dig +short TXT _dmarc.{domain}
for s in {dkim_selectors[@]}; do
  dig +short TXT $s._domainkey.{domain}
done
# outbound IP per domein:
grep -E "^{domain}:" /etc/virtual/domainips
# PTR van configured outbound IP:
dig +short -x <configured_ip>
# gateway tekent het overzicht + warnings
```

---

#### `ip-reputation-bulk` (read, gateway-side)
```
args: ips: [...] (max 50)
output per ip: { geo, org, asn, is_datacenter, blocklists: [..] }
```

**impl:**
```bash
# geo via bestaande whois-template (ipinfo.io)
curl -s https://ipinfo.io/{ip}/json
# RBL checks via DNS (gratis):
REV=$(echo {ip} | awk -F. '{print $4"."$3"."$2"."$1}')    # IPv4 reverse
for bl in zen.spamhaus.org bl.spamcop.net dnsbl.sorbs.net b.barracudacentral.org; do
  dig +short A "$REV.$bl"   # niet-lege response = listed
done
```

---

#### `smtp-banner-probe` (read, gateway-side)
```
args: host, port (default 25), starttls: bool (default true)
output: { connected, banner, helo_name, tls_cert_subject, tls_cert_san, helo_matches_ptr, helo_matches_fcrdns }
```

**impl:**
```bash
# swaks doet het allemaal: banner + EHLO + STARTTLS + cert
swaks --server {host}:{port} --helo swaks-probe.koonline.nl \
      --tls --quit-after FIRST-EHLO 2>&1
# alternatief zonder swaks:
echo -e "EHLO swaks-probe\r\nQUIT\r\n" | \
  openssl s_client -starttls smtp -connect {host}:{port} -servername {host} 2>&1
```

---

#### `email-header-analyze` (read, gateway-side, geen SSH)
```
args: headers: string (raw multiline)
output: from, return_path, alignment, received_chain, auth_results, warnings
```

**impl:** pure gateway-side parsing (Go / Node). Geen shell. Parse `Received:`, `Authentication-Results:`, `ARC-*`, `DKIM-Signature` headers.

---

### Q9 — Certificaten & DNS zones

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

### Q10 — Cron & scheduled tasks

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

### Q11 — Redis (per-user DA-feature)

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

### Q12 — SMTP / mail-delivery dieper

#### `smtp-rcpt-probe` (read, use with care)
```
args: recipient (user@domain), mail_from?, use_tls: bool (default true)
output: { mx_used, connected, tls, ehlo_response, rcpt_response, verdict }
safety: rate-limit max 10 probes/uur/domein, geen DATA phase
```

**impl:**
```bash
swaks --to {recipient} \
      --from {mail_from:-postmaster@koonline.nl} \
      --quit-after RCPT \
      --tls --helo probe.koonline.nl \
      --timeout 15 2>&1
```

---

#### `mail-outbound-ip-verify` (read)
```
args: domain
output: { configured_outbound_ip, expected_ptr, actual_exim_sending_ip, mismatch, last_sample_msgid, last_sample_headers_excerpt }
```

**impl:**
```bash
# verwachte outbound IP uit /etc/virtual/domainips:
CONFIG_IP=$(awk -F: -v d={domain} '$1==d{print $2}' /etc/virtual/domainips)
# PTR van verwachte IP:
dig +short -x "$CONFIG_IP"
# recente mainlog entries voor dit domein — zoek '=> ' en 'H=' regels:
grep -E "F=<[^@]+@{domain}>" /var/log/exim/mainlog | tail -20
# of: haal één recent msgid en dump:
MSGID=$(grep -E "@{domain}" /var/log/exim/mainlog | grep '<=' | tail -1 | awk '{print $3}')
exim -Mvh "$MSGID"
```

---

### Q13 — CloudLinux & Imunify (alleen op CL-servers)

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

### Q14 — LiteSpeed & MySQL inspectie

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

### Q15 — FTP-diagnostiek

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

### Q16 — DirectAdmin API-integratie (game-changer)

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

### Q17 — File-inspectie helpers

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

## Prioriteit voor implementatie

Volgorde gebaseerd op triage-frequentie:

0. **`da-api-get` generic + impersonation** — ontsluit in één klap 50+ endpoints; vervangt half onze huidige wishlist
1. **`wp-cli`** — onmisbaar voor malware-triage
2. **`fcrdns-check` + `mail-sender-diag`** — deliverability #1, vervangen 10+ handmatige stappen
3. **`svc-restart`** — na elke config-edit nodig (nu via DA-API `/api/system-services-actions/...`)
4. **`da-login-unblock` + `da-login-whitelist-add`** — hoge volume
5. **Allowlist `/etc/virtual/**`** + **`mail-user-sent`** — deliverability prereq
6. **`find-large-files` + `user-quota`** — quota-tickets
7. **`php-suspicious-scan`** — versnelt Imunify-follow-up 15min → 30sec
8. **`email-header-analyze`** — Gmail "show original" parsing
9. **`smtp-banner-probe`** — VPS-klanten met eigen MTA
10. **`file-stat` + `file-integrity`** — incident response polish
11. **`exim-log-search` + `mail-outbound-ip-verify`** — DKIM envelope-sender
12. **`tls-cert-inspect` + `letsencrypt-status`** — SSL/LE recurrent
13. **`user-cron`** — malware-schedules + cron-tickets
14. **`dns-zone-read`** — legacy-NS tickets
15. **`redis-status`** — licht, DA Redis use-case
16. **LVE + Imunify** — zodra `cl0*` in inventory
17. **`quarantine-file`** — na schone quarantine-flow
18. **`smtp-rcpt-probe`** — laatste, RBL-flag risk
19. **`mysql-processlist` + `ftp-user-attempts`** — nice-to-have
20. **`webserver-errors`** — helper, `fs_read grep` werkt al

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
