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
| **Algemene file-inspectie** (kaasbaas demo) | ✅ | `fs_list` + `fs_read` (full/tail/grep) |
| **Quota / disk** | ⚠️ | `disk-usage` template wel, geen `quota -s`, geen "vind top-20 grootste files" |
| **Webserver-logs** | ⚠️ | `fs_read grep` werkt op `/var/log/httpd/**`, maar geen 5xx-helper |
| **Exim-log onderzoek** | ⚠️ | `fs_read` op `/etc/exim*`, maar `/var/log/exim*` zit in `/var/log/**` allowlist — check bestandsnaam. Geen `exigrep`-template |
| **WordPress health + malware** | ❌ | geen wp-cli template |
| **Malware-triage signatures** | ❌ | alleen manual `fs_read grep` per-file; geen bulk-scan template |
| **DirectAdmin login blacklist/whitelist** | ❌ | `fs_read` op `/usr/local/directadmin/data/admin/ip_blacklist` werkt, maar geen mutate-template voor unblock/whitelist + `service directadmin restart` |
| **Dovecot user / quota** | ❌ | geen template; `/var/log/maillog` is leesbaar via fs_read |
| **DirectAdmin user lookup** (pakket, domeinen vanaf server) | ❌ | paden zijn in allowlist, maar handmatig knippen. Template zou helpen |
| **CloudLinux LVE** | ❌ | geen `lveinfo`/`lveps` template (irrelevant als server geen CL is — vps333 is geen CL, dus nu niet urgent) |
| **Imunify** | ❌ | geen template |
| **Service restart** (na DA whitelist edit, na config change) | ❌ | alleen csf-mutates, geen `systemctl restart <svc>` template |
| **Exim queue manipulation** | ❌ | queue zichtbaar via `mail-queue`, maar geen remove/thaw/freeze |
| **File stat** (mtime/ctime tampering) | ❌ | `fs_list` geeft mtime maar geen ctime |
| **Find large files** (quota-troubleshoot) | ❌ | fs_list heeft geen size-filter |
| **FCrDNS / PTR-forward match** (Gmail 550-5.7.25) | ⚠️ | `dns` template geeft losse PTR, maar geen cross-check. Handmatige stappen |
| **Mail deliverability diagnostiek** (SPF/DKIM/DMARC + outbound IP match) | ❌ | geen alles-in-één report. Losse `dns` calls + `/etc/virtual/domainips` handmatig |
| **SMTP banner + HELO** vs PTR | ❌ | `net-connect` doet TCP/TLS, geen SMTP EHLO-banner inspectie |
| **Email header parsing** (SPF/DKIM alignment uit raw headers) | ❌ | compleet handmatig nu |
| **IP reputation / blocklist check** | ⚠️ | `whois` geeft geo/ASN, geen RBL check |
| **SSL / TLS certificaat inspectie** (HTTPS, SMTP) | ❌ | geen template |
| **Let's Encrypt renewal status** (bekende infra-alert recurrence) | ❌ | `/etc/letsencrypt/**` niet in allowlist |
| **DNS zone file read** (legacy NS issues) | ❌ | `/var/named/**` niet in allowlist |
| **Cron jobs per user** (malware schedules detection) | ⚠️ | DA crontab.conf via fs_read werkt, geen helper |
| **Redis status per user** (DA Redis feature) | ❌ | geen template |
| **CloudLinux LVE** (503 memory-use case) | ❌ | geen template (alleen op cl0* nodig) |
| **Imunify malware-list** | ❌ | geen template (alleen op CL) |
| **LiteSpeed vhosts/logs** | ❌ | `/usr/local/lsws/**` niet in allowlist |
| **MySQL processlist / slow** | ⚠️ | logs via fs_read, geen live processlist |
| **SMTP recipient probe** (bestaat ontvanger) | ❌ | geen template |
| **Exim outbound IP verify** (DKIM envelope-sender issues) | ❌ | `/etc/virtual/domainips` lezen, geen verify-template |
| **FTP login attempts** (KPN firewall use case) | ⚠️ | fs_read grep werkt, geen helper |

---

## Wishlist — templates om toe te voegen

Gegroepeerd naar use case. Voor elke: doel, args, output, veiligheidsvereiste.

### Q1 — WordPress (hoogste prio; 40% van malware-tickets)

#### `wp-cli` (read)
Vaste sub-command whitelist, path moet onder `/home/*/public_html/**`.

```
args:
  path: string (verplicht, match /home/*/public_html/*)
  command: enum (zie hieronder)
  extra_args: array<string> (beperkt, geen | > ; & ; max 8)

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
```

Secret-mask: nooit `wp config get <key>` voor DB_PASSWORD/AUTH_KEY/salts.

#### `php-suspicious-scan` (read)
Bulk grep voor malware-patterns in een tree.

```
args:
  root: string (moet match /home/*/public_html/** of /home/*/domains/**)
  max_matches: int (default 200, max 1000)

output:
  { path, line_number, match_snippet (first 200 chars), pattern_name }[]

patterns (ERE, vaste set):
  eval\s*\(
  base64_decode\s*\(
  gzinflate\s*\(
  str_rot13\s*\(
  preg_replace.*\/e
  assert\s*\(
  @\s*(eval|system|exec|passthru|shell_exec)
  \\x[0-9a-f]{2}.*\\x[0-9a-f]{2}.*\\x[0-9a-f]{2}    # hex-encoded strings
```

Geen user-supplied patterns — dat is echo-injection risk.

### Q2 — Quota / storage (2e grootste use case)

#### `find-large-files` (read)
```
args:
  root: string (allowlist path)
  min_size_mb: int (default 50)
  max_results: int (default 50, max 500)
  newer_than_days: int (optioneel)
output:
  [{ path, size_bytes, mtime, owner }], gesorteerd op size desc
```

#### `user-quota` (read)
```
args:
  user: string (valideer tegen /home/<user> bestaan)
output:
  { used_mb, limit_mb, files_used, files_limit, blocks_quota_output }
```

#### `dir-breakdown` (read, uitbreiding op disk-usage)
`disk-usage` bestaat al, maar `depth` is 0-3. Soms wil je 4+ op specifiek knelpunt (bijv. `~/application_backups/*/*`). Overweeg depth tot 5 of een aparte deep-du template.

### Q3 — Logs (free-form grep & tail binnen allowlist)

`fs_read` heeft al full/tail/grep, dus dit deel is goed. Wel twee **helpers** op top:

#### `webserver-errors` (read)
Per-domain errors samenvatten. Intern: tail -n N `/var/log/httpd/domains/<d>.error.log` + grep 5xx in access log.
```
args:
  domain: string
  minutes: int (default 60)
output:
  { error_lines: [..], fivexx_count: N, fivexx_sample: [..] }
```

#### `exim-log-search` (read)
Wrapper om `exigrep`.
```
args:
  pattern: string (email, domain, of message-id — valideer tegen spatieloze regex)
  lines_before: int, lines_after: int (cap 50)
  hours_back: int (default 24, max 168)
output:
  { matches: [{ msgid, from, to, status, log_excerpt }] }
```

### Q4 — DirectAdmin

#### `da-login-unblock` (mutate)
```
args:
  ip: string (strict IPv4/IPv6 regex)
  reason: string (<200)
actions:
  sed -i '/^<ip>$/d' /usr/local/directadmin/data/admin/ip_blacklist
  service directadmin restart
safety:
  - atomic write via tempfile
  - return diff (voor/na line count)
```

#### `da-login-whitelist-add` (mutate)
```
args:
  ip: string
  reason: string
actions:
  create /usr/local/directadmin/data/admin/ip_whitelist if missing (chown diradmin:diradmin, chmod 644)
  grep-insert (geen duplicates)
  service directadmin restart
```

#### `da-user-info` (read)
Consolideert wat nu handmatig uit `user.conf` + `domains.list` + packages moet. Eén call → klantinfo.
```
args:
  user: string
output:
  {
    username, package, quota_mb, bandwidth_mb, domains: [..],
    sub_accounts: [..], suspended: bool, creation_date, server
  }
```

### Q5 — Service-restart (mutate)

#### `svc-restart` (mutate)
Tegenover `svc-status`. Strict service-allowlist.
```
args:
  service: enum (sshd, httpd, nginx, lsws, exim|exim4, dovecot, mariadb|mysqld, named, directadmin, php*-fpm, csf, lfd)
  reason: string
actions:
  systemctl restart <svc>
output:
  pre/post status, restart duration
safety:
  no restart op sshd zonder warning/confirm-twice (kan je lockout)
  rate-limit: max 3 restarts per service per 10 min
```

### Q6 — Mail

#### `mail-queue-action` (mutate)
```
args:
  message_id: string (regex ^[0-9a-zA-Z-]+$)
  action: enum (remove, thaw, freeze, deliver)
actions:
  exim -Mrm|-Mt|-Mf|-M <id>
```

#### `dovecot-user` (read)
```
args:
  email: string (user@domain)
output:
  { uid, gid, home, quota_used, quota_limit, last_login_ts }
intern: doveadm user + quota get
```

#### `mail-user-sent` (read)
Lees /etc/virtual/usage/<domain>_out (zit in `/etc/exim*` allowlist? Check — nee, staat onder `/etc/virtual/`. **Gateway-allowlist moet uitgebreid naar `/etc/virtual/**`.**)
```
args:
  domain: string
output:
  { sent_last_hour, sent_last_day, sent_last_week, limit }
```

### Q7 — Malware response (mutate)

#### `quarantine-file` (mutate)
Iets tussen delete en laten staan.
```
args:
  path: string (allowlist path)
  reason: string
actions:
  mkdir -p /root/quarantine/<YYYY-MM-DD>/
  mv <path> /root/quarantine/<YYYY-MM-DD>/<hash>-<basename>
  log entry met oorspronkelijk pad + mover
output:
  { quarantine_path, original_path, sha256 }
```

Nooit direct `rm` — quarantine laat roll-back toe.

### Q8 — IP / rDNS / FCrDNS (mail-deliverability)

Context uit memory: Gmail error 550-5.7.25 = missende/mismatched PTR of forward DNS. Veelvoorkomend bij VPS-klanten met eigen Exim of custom A-record die niet matcht met outbound IP.

#### `fcrdns-check` (read)
Gegeven één IP: geeft PTR + reverse confirmation.
```
args:
  ip: string (IPv4 of IPv6)
output:
  {
    ip,
    ptr: "mail.example.com",
    forward_a: ["1.2.3.4"],
    forward_aaaa: ["2a00:..."],
    fcrdns_match: true/false,       # host(ptr) ∋ ip ?
    fcrdns_match_ipv4: bool,
    fcrdns_match_ipv6: bool,
    missing_records: ["AAAA"]        # welke lookups niks teruggaven
  }
```
Dekking van de klassieke valkuilen in memory: PTR wel gezet, maar AAAA ontbreekt → Gmail reject.

#### `mail-sender-diag` (read)
De "alles-in-één" voor mail-deliverability. Neemt domein + optioneel selector, retourneert één report.
```
args:
  domain: string
  dkim_selectors: array<string> (optioneel; default ["default", "mail", "google"])
  sender_ip: string (optioneel — als klant klaagt over specifieke bounce)
output:
  {
    mx: [..],
    spf: { record, all_qualifier, ip_includes_sender: bool/null },
    dmarc: { policy, pct, rua, sp, adkim, aspf },
    dkim: { <selector>: { present, key_size, public_key_summary } },
    outbound_ip_expected: string,     # uit /etc/virtual/domainips
    outbound_ip_ptr: string,
    outbound_fcrdns: bool,
    sender_ip_fcrdns: bool/null,      # alleen als sender_ip meegegeven
    warnings: [..]                    # bijv. "SPF -all maar outbound IP niet in include"
  }
```
Intern combineert `dig` (MX/TXT/A), PTR-lookup, en `fs_read` op `/etc/virtual/domainips`. **Vereist allowlist-uitbreiding naar `/etc/virtual/**`.**

#### `ip-reputation-bulk` (read)
Uitbreiding op `whois`: naast ipinfo.io ook reputation-bronnen.
```
args:
  ips: array<string> (max 50)
output per ip:
  { geo, org, asn, is_datacenter: bool, blocklists: ["spamhaus", "uceprotect"]? }
```
Alleen vrije/publieke bronnen; geen rate-limited commerciële API's.

#### `smtp-banner-probe` (read)
Belangrijke aanvulling op `net-connect`: check wat de MTA zélf in z'n banner zet.
```
args:
  host: string
  port: int (default 25; ook 587, 465)
  starttls: bool (default true)
output:
  {
    connected: bool,
    banner: "220 mail.example.com ESMTP Exim ...",
    helo_name: string,                # wat server zegt
    tls_cert_subject: string,
    tls_cert_san: [..],
    helo_matches_ptr: bool,           # banner-hostname vs reverse DNS
    helo_matches_fcrdns: bool
  }
```
Combineert EHLO check met FCrDNS — onthult klassieke "Exim presenteert zich als cl05 maar PTR wijst naar iets anders" probleem.

#### `email-header-analyze` (read, gateway-side — geen SSH nodig)
Plak raw e-mail headers, krijg SPF/DKIM/DMARC results uitgesplitst.
```
args:
  headers: string (raw, multiline)
output:
  {
    from: "...", return_path: "...", envelope_from: "...",
    alignment: {
      spf_alignment: "aligned"|"relaxed"|"fail",
      dkim_alignment: "aligned"|"relaxed"|"fail",
      dmarc_result: "pass"|"fail"
    },
    received_chain: [{ host, ip, timestamp }],
    auth_results: { spf, dkim, dmarc, arc },
    warnings: ["envelope-from domain ≠ from domain"]
  }
```
Memory-context: klanten sturen screenshots van Gmail "show original" en we moeten manueel de `Authentication-Results` parsen. Template automatiseert dat.

### Q9 — Certificaten & DNS zones

#### `tls-cert-inspect` (read, gateway-side)
Uitgebreider dan `smtp-banner-probe`'s TLS-info: voor HTTPS + mail + arbitrary poort.
```
args:
  host: string
  port: int (default 443)
  starttls: enum (none, smtp, imap, pop3)  # default none
output:
  { subject, issuer, not_before, not_after, days_until_expiry,
    san: [..], key_type, key_bits, signature_alg,
    chain: [{ subject, issuer, ca }],
    matches_host: bool }
```
Dekking: "SSL werkt niet", cert-expiry monitoring, LE-renewal checks.

#### `letsencrypt-status` (read)
Per-domain LE cert-inventaris vanaf de server zelf.
```
args:
  domain: string
output:
  { has_cert, cert_path, not_before, not_after, days_until_expiry,
    last_renewal_attempt, last_renewal_status,
    recent_errors: [..] }   # uit /var/log/letsencrypt/letsencrypt.log
```
Vereist allowlist-uitbreiding: `/etc/letsencrypt/live/**` (uitgezonderd `privkey.pem`) + `/var/log/letsencrypt/**`.

#### `dns-zone-read` (read)
Zone file vanaf de autoritatieve server.
```
args:
  domain: string
output:
  { zone_file_path, serial, ns_records, mx_records, a_records,
    txt_records, dnskey_present, last_modified }
```
Vereist allowlist: `/var/named/**`. Relevant bij "DNS beheer werkt niet" (legacy nameservers memory).

### Q10 — Cron & scheduled tasks

#### `user-cron` (read)
Cronjobs van een specifieke user, inclusief malware-cronjobs die via DA geplant zijn.
```
args:
  user: string
output:
  { crontab_entries: [..], last_run_log_snippet: [..],
    webmin_tasks: [..],         # uit DA taskqueue
    suspicious_lines: [..] }    # heuristics: curl|bash|base64|/tmp|wget
```
Pad: `/usr/local/directadmin/data/users/<u>/crontab.conf` (al in allowlist).
Extra allowlist nodig: `/var/spool/cron/<user>` (alleen specifieke user-file, niet glob).

### Q11 — Redis (per-user DA-feature)

Context uit memory: `reference_redis_directadmin.md` — klanten kunnen Redis zelf inschakelen via DA > Geavanceerd > Redis.

#### `redis-status` (read)
```
args:
  user: string
output:
  { enabled: bool, socket_path, pid, memory_used_mb,
    connected_clients, uptime_seconds, last_save_ts }
```
Intern: redis-cli -s <socket> PING + INFO. Socket in `~/.redis/<user>.sock` of `/var/lib/redis/<user>/`.

### Q12 — SMTP / mail-delivery dieper

#### `smtp-rcpt-probe` (read, use with care)
Verifieer of een extern mailadres accepteert. Handig bij "mail komt niet aan" → ligt bij ontvanger.
```
args:
  recipient: string (user@domain)
  mail_from: string (default MAILER-DAEMON@<our domain>)
  use_tls: bool (default true)
output:
  { mx_used, connected, tls, ehlo_response,
    rcpt_response: "250 OK" | "550 User unknown" | ...,
    verdict: "accepted" | "rejected" | "unclear" }
```
Safety:
- Rate-limit: max 10 probes per uur per domein (voorkom RBL-flag)
- Geen DATA phase — alleen MAIL FROM / RCPT TO / QUIT
- Afvang voor catch-all ontvangers (altijd 250 → "unclear")

#### `mail-outbound-ip-verify` (read)
Memory `feedback_exim_outbound_ip.md`: check wat Exim daadwerkelijk stuurt, niet wat DNS/config zegt.
```
args:
  domain: string
output:
  { configured_outbound_ip,          # /etc/virtual/domainips
    expected_ptr,
    actual_exim_sending_ip,          # uit recente mainlog entries
    mismatch: bool,
    last_sample_msgid,
    last_sample_headers_excerpt }
```
Geen echte test-mail sturen — parse recente Exim-log entries.

### Q13 — CloudLinux & Imunify (alleen op CL-servers)

Nog niet relevant voor `vps333` (geen CL), wél voor `cl0*` servers zodra die in de inventory komen. Kan achter een server-type flag.

#### `lve-info` (read)
```
args:
  user: string (optioneel; leeg = top-10 globaal)
  period: enum (10m, 1h, 1d)
output:
  { cpu_faults, mem_faults, io_faults, ep_faults, nproc_faults,
    peak_cpu_pct, peak_mem_mb, limits: {..} }
```
Memory: `feedback_503_check_lve_limits.md` — altijd LVE limits checken bij 503.

#### `imunify-malware-list` (read)
```
args:
  user: string (optioneel)
  limit: int (default 50)
output:
  { incidents: [{ file, hash, type, detected_at, status, size }],
    total_count }
```

### Q14 — LiteSpeed & MySQL inspectie

#### Allowlist-uitbreidingen (direct leesbaar via `fs_read`)
- `/usr/local/lsws`, `/usr/local/lsws/conf/**`, `/usr/local/lsws/logs/**`
- `/usr/local/lsws/conf/vhosts/<user>/**` voor per-user OLS vhost config

#### `mysql-processlist` (read)
```
args:
  filter_user: string (optioneel)
  filter_time_gt_s: int (optioneel — alleen queries > N sec)
output:
  [{ id, user, host, db, command, time_s, state, info_snippet }]
```
Secret-mask op eventuele passwords in INFO-kolom (soms komen creds in query-text).

#### `mysql-slow-sample` (read)
Laatste N entries uit slow query log.
```
args:
  limit: int (default 20)
  min_query_time_s: int (default 2)
output:
  [{ timestamp, user, db, query_time_s, rows_examined, query_excerpt }]
```

### Q15 — FTP-diagnostiek

Memory: `feedback_kpn_ftp_firewall.md` (KPN modem blokkeert FTP). Op dit moment alleen "vraag IP + error aan klant".

#### `ftp-user-attempts` (read)
Parse pure-ftpd/proftpd logs voor specifieke user of IP.
```
args:
  user: string (optioneel)
  ip: string (optioneel)
  hours_back: int (default 24)
output:
  { attempts: [{ ts, ip, user, success: bool, error_code }],
    summary: { total, success, failed, unique_ips } }
```

### Q16 — File-inspectie helpers

#### `file-stat` (read)
Ontbreekt nu: `fs_list` geeft wel mtime, geen ctime. Voor tamper-detectie cruciaal.
```
args:
  path: string
output:
  { size, mode, uid_name, gid_name, atime, mtime, ctime, inode, mime_type, magic_type }
```

#### `file-integrity` (read)
```
args:
  path: string
output:
  { sha256, md5, size }
```

---

## Allowlist-uitbreidingen

Paden die nu ontbreken maar voor triage gewenst zijn:
- `/etc/virtual`, `/etc/virtual/**` — Exim per-domain config (domainips, domainowners, usage, passwd per domain)
- `/var/log/exim` of specifiek `/var/log/exim/mainlog` — voor grep/tail (check: al gedekt via `/var/log/**`?)
- `/var/log/httpd/domains/**` — idem, check of dit onder `/var/log/**` valt
- `/etc/letsencrypt/live/**` — voor cert dates (maar **geen** `privkey.pem`)
- `/var/log/letsencrypt/**` — renewal error log
- `/var/named`, `/var/named/**` — zone files (DNS-triage, legacy NS)
- `/usr/local/lsws`, `/usr/local/lsws/conf/**`, `/usr/local/lsws/logs/**` — LiteSpeed
- `/etc/dovecot`, `/etc/dovecot/**` — dovecot config
- `/var/spool/cron/<user>` — per-user cron (alleen specifieke file, niet glob)
- `/var/lib/redis`, `/var/lib/redis/<user>/**` — Redis user sockets/data
- `/home/*/.redis/**` — per-user Redis config (DA-standaard pad)

**Secret-mask vereist** bij uitbreiding:
- `/usr/local/directadmin/conf/mysql.conf`
- Wp-config.php bij read
- `/etc/my.cnf.d/*pass*`
- Alle `*_pass*`, `*_password*`, `*_secret*`, `*_token*` patterns in `/etc/`

---

## Design-principes voor nieuwe templates

1. **Typed args + regex-validatie** — geen free-string op paths, IPs, emails, of commands
2. **Output structured** — JSON objects, geen raw shell output (zodat de MCP-client betrouwbaar kan parsen)
3. **Truncation defaults** — max 1MB output, max 500 lines, max 200 matches; overridable binnen limits
4. **Read vs mutate gescheiden** — nooit een read-template dat stiekem schrijft, nooit een mutate zonder audit-log
5. **Secret-mask is server-side** — niet de verantwoordelijkheid van de caller om creds eruit te knippen
6. **Fan-out opt-in** — `server: "all"` alleen als template idempotent en goedkoop is (probe-url ✅, wp-cli verify-checksums ❌)
7. **Rate-limit op mutates** — voorkom dat een bug in de caller sshd 50x herstart
8. **Idempotent waar mogelijk** — `csf-allow` van een al-allowed IP moet geen error zijn
9. **Audit log** — mutate-templates loggen naar centrale log met caller + timestamp + args + result
10. **Versionable templates** — template-naam + versie, zodat wijzigingen in semantiek traceable zijn

---

## Prioriteit voor implementatie

Volgorde gebaseerd op triage-frequentie:

1. **`wp-cli`** — onmiddellijk onmisbaar voor malware-triage
2. **`fcrdns-check` + `mail-sender-diag`** — deliverability is onze #1 mail-usecase, en deze twee templates vervangen 10+ handmatige stappen
3. **`svc-restart`** — nodig zodra je config edits hebt (ook na DA whitelist)
4. **`da-login-unblock` + `da-login-whitelist-add`** — hoge-volume KB-topic
5. **Allowlist `/etc/virtual/**`** + **`mail-user-sent`** — deliverability-tickets (prerequisite voor `mail-sender-diag`)
6. **`find-large-files` + `user-quota`** — quota-tickets
7. **`php-suspicious-scan`** — versnelt Imunify-follow-up van 15 min naar 30 sec
8. **`email-header-analyze`** — veel tickets bevatten gekopieerde Gmail "show original" headers
9. **`smtp-banner-probe`** — bij VPS-klanten die eigen MTA draaien
10. **`file-stat` + `file-integrity`** — incident response polish
11. **`exim-log-search` + `mail-outbound-ip-verify`** — Exim-troubleshoot & DKIM-envelope memory
12. **`tls-cert-inspect` + `letsencrypt-status`** — SSL/LE is een recurrente transient-alert
13. **`user-cron`** — malware-cronjobs + "mijn cron werkt niet" tickets
14. **`dns-zone-read`** — legacy-NS tickets
15. **`redis-status`** — licht, maar handig voor DA Redis tickets
16. **LVE + Imunify templates** — zodra `cl0*` in inventory komt
17. **`quarantine-file`** — pas nadat we een schone quarantine-flow hebben
18. **`smtp-rcpt-probe`** — laatste in volgorde, risicovol door RBL-flagging
19. **`mysql-processlist` + `ftp-user-attempts`** — nice-to-have, fs_read grep werkt al
20. **`webserver-errors`** — helper, `fs_read grep` werkt al

---

## Buiten scope

Dingen die de gateway bewust **niet** moet aanbieden:
- Free-form `bash -c` of `sh -c` — sluit model-injection attack surface uit
- Interactieve shells, `vim`, `less`
- File-writes buiten gescripte mutate-templates
- `rm -rf` of wildcard deletes (quarantine is het alternatief)
- Root password resets / key rotation (dat is ops-werk, niet triage-werk)
- Opzetten/afbreken van SSH-keys op klantaccounts (dat deed `adminssh/create` — die API is bovendien kapot)
- Reading `shadow`, `/root/**`, `/etc/ssh/*_key` (private SSH host keys)
