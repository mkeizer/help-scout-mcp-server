# MCP SSH Gateway — Whitelist Reference

Complete command & path whitelist voor de drie triage-scopes. Read-only tenzij expliciet gemarkeerd. Bedoeld als spec voor de MCP `ssh-gateway` config (`cmd_run` / `fs_read` / `cmd_mutate`).

Drie scopes, elk een andere trust-boundary:

| # | Scope | Waar draait het | Wie authoriseert |
|---|-------|-----------------|------------------|
| 1 | **Local triage-host** | Onze eigen triage-container (buiten klantservers) | Lokale allowlist in `settings.local.json` |
| 2 | **Remote user-shell** | CageFS user-shell op cl0*.keurigonline.nl (DirectAdmin user, geen sudo) | Gateway user-scope, per-account key |
| 3 | **Remote root** | Root-shell op cl0* (DA admin scope) | Gateway root-scope, strenge audit + mutate-muur |

Standaard wrappers op alle scopes: `LC_ALL=C`, `timeout <N>`, output truncate, binary-guard, secret-mask voor known-secret bestanden.

---

## Scope 1 — Local triage-host

Alles wat vanaf onze triage-container draait om externe diagnose te doen zonder in te loggen op een klantserver.

### 1.1 DNS / WHOIS
```
dig <domain> [A|AAAA|MX|TXT|NS|CAA|PTR|DS|DNSKEY] +short
dig -x <ip> +short
dig +trace <domain>
dig @<ns> <domain> <type> +short
host <domain>
nslookup <domain>
whois <domain>
whois <ip>
kdig +tls <domain> @<ns>
```

### 1.2 Reachability / path
```
ping -c 3 -W 3 <host>
ping6 -c 3 -W 3 <host>
traceroute -n -q 1 -w 2 <host>
traceroute6 -n <host>
mtr -r -c 5 -w <host>
```

### 1.3 Port probes / banners
```
bash -c '</dev/tcp/<host>/<port>'     # silent TCP probe
nc -zv -w 3 <host> <port>
nc -vn <host> <port>                   # banner grab
timeout 5 nmap -Pn -p <ports> <host>   # alleen eigen infra of met expliciete toestemming
```

### 1.4 TLS / HTTP
```
curl -sI --max-time 10 <url>
curl -so /dev/null -w '%{http_code} %{time_total}s %{redirect_url}\n' <url>
curl -skvI <url> 2>&1 | head -40
openssl s_client -servername <h> -connect <h>:443 -showcerts </dev/null
openssl s_client ... | openssl x509 -noout -dates -subject -issuer -ext subjectAltName
openssl x509 -in <pem> -text -noout
```

### 1.5 Mail-diagnostiek (extern)
```
dig <d> MX +short
dig _dmarc.<d> TXT +short
dig default._domainkey.<d> TXT +short
dig <selector>._domainkey.<d> TXT +short
openssl s_client -starttls smtp -connect <mx>:25 -crlf
```

### 1.6 IP / reputation / geo (read-only web)
```
curl -s https://ipinfo.io/<ip>/json
curl -s https://www.checkip.nl/
```

Bestaande MCP's: `mcp__dnsscan__dns_scan`, `mcp__dnsscan__check_keurigonline`, `mcp__helpscout__*`.

### 1.7 Utils / glue
```
timeout <N> <cmd>
awk|sed|sort|uniq|cut|tr|xargs|jq
base64 -d
date -u +%s
date -d '<ts>' -u '+%F %T'
python3 -c '<expr>'
```

### 1.8 Repo scripts
```
scripts/client-lookup.sh <email|account>
scripts/unassign-conversation.sh <id>
scripts/next-koos-ticket.sh
scripts/triage-status.sh
```

### 1.9 Bewust NIET in lokale whitelist
- Interactief: `ssh` zonder `-o BatchMode=yes`, `telnet`, `less`, `vim`, `top` zonder `-bn1`
- Schrijf-ops op klant-infra (horen in scope 2/3 mutate)
- Stealth / brute-force: `nmap -sS` op vreemde hosts, `hydra`, `nikto`

---

## Scope 2 — Remote user-shell (CageFS)

User-scope in DirectAdmin/CloudLinux. Geen sudo. Alleen `~`, `/tmp/$USER`, en CageFS-zichtbare systeem-files. Onze top-use cases: quota, WordPress health, Imunify follow-up, log-inspectie, mail storage.

### 2.1 Orient
```
whoami; id; hostname; pwd; uname -a; uptime; date
ls -la ~
ls -la ~/domains/
cat /proc/loadavg
cat /proc/$$/cgroup                  # LVE-ID
```

### 2.2 Schijfruimte / quota (grootste usecase)
```
du -sh ~
du -hd1 ~ | sort -h
du -hd1 ~/domains 2>/dev/null | sort -h
du -sh ~/domains/*/public_html 2>/dev/null
du -sh ~/application_backups 2>/dev/null          # Installatron
du -sh ~/.trash ~/backup 2>/dev/null
quota -s
df -h ~
ls -laSh <path> | head -30
find ~ -type f -size +100M -printf '%10s  %p\n' 2>/dev/null | sort -n | tail -30
find ~/imap -type d -maxdepth 3 -exec du -sh {} \; 2>/dev/null
```

### 2.3 Logs (user-scope)
```
ls -la ~/domains/<d>/logs/
tail -n 200 ~/domains/<d>/logs/<date>.error.log
tail -n 500 ~/domains/<d>/logs/<date>.log
grep -iE 'error|fatal|denied|503|500' ~/domains/<d>/logs/<date>.error.log | tail -50
zcat ~/domains/<d>/logs/*.gz 2>/dev/null | tail -n 200
tail -n 200 ~/.php/error_log 2>/dev/null
```

### 2.4 Processen / resources (CageFS-zicht)
```
ps -fu $USER
ps auxf
top -bn1 | head -40
free -h
```

### 2.5 PHP / webserver config
```
php -v; php -m
php -r 'echo ini_get("memory_limit"),"\n";'
cat ~/.php.ini 2>/dev/null
cat ~/domains/<d>/public_html/.user.ini 2>/dev/null
cat ~/domains/<d>/public_html/.htaccess 2>/dev/null
grep -E 'DB_NAME|DB_USER|DB_HOST|WP_DEBUG|table_prefix' ~/domains/<d>/public_html/wp-config.php
# Full wp-config.php lezen: alleen via secret-mask wrapper in de gateway
```

### 2.6 WordPress (wp-cli — hoofdhamer bij support + malware)
```
wp --path=<p> core version
wp --path=<p> core verify-checksums
wp --path=<p> core check-update
wp --path=<p> plugin list --format=csv
wp --path=<p> plugin list --update=available --format=csv
wp --path=<p> theme list --format=csv
wp --path=<p> user list --role=administrator --format=csv --fields=ID,user_email,user_login,user_registered
wp --path=<p> option get siteurl
wp --path=<p> option get home
wp --path=<p> option get admin_email
wp --path=<p> db size --size_format=mb
wp --path=<p> db check
wp --path=<p> cron event list
wp --path=<p> maintenance-mode status
wp --path=<p> transient delete --expired    # milde mutate
```

### 2.7 Malware / Imunify-triage
```
file <pad>
head -c 500 <pad>
md5sum <pad>; sha256sum <pad>
cat <pad>                         # alleen < 50KB — wrapper guard
wc -l <pad>; wc -c <pad>
find ~/domains/*/public_html -type f -name '*.php' -mtime -30 2>/dev/null | head -100
find ~/domains/*/public_html -type f -name '*.php' -path '*/uploads/*' 2>/dev/null
find ~/domains/*/public_html -type f -name '*.php' -mmin -60 2>/dev/null
grep -rEln 'eval\s*\(|base64_decode\s*\(|gzinflate|str_rot13|preg_replace.*\/e|assert\s*\(' ~/domains/*/public_html 2>/dev/null
find ~ -perm -o+w -type f -not -path '*/cache/*' -not -path '*/tmp/*' 2>/dev/null | head -50
find ~ -name '.htaccess' -newer ~/.bash_logout 2>/dev/null
```

### 2.8 E-mail (user-scope)
```
ls -la ~/imap/<domain>/
du -sh ~/imap/<domain>/*/ 2>/dev/null
cat ~/.forward 2>/dev/null
find ~/imap/<d>/<user>/.logs -type f 2>/dev/null -exec tail -n 50 {} +
grep -iE 'quota|exceed|full|over' ~/imap/<d>/<user>/dovecot*.log 2>/dev/null
cat ~/etc/<domain>/passwd 2>/dev/null          # DA mailboxes
```

### 2.9 Archive / backup (zonder uitpakken)
```
file <arch>
tar -tzf <tgz> | head -20
unzip -l <zip> | head -20
zcat <gz> | head -50
```

### 2.10 Git / deploy
```
git -C <p> log --oneline -20
git -C <p> status
git -C <p> remote -v
git -C <p> diff --stat HEAD~5..HEAD
```

### 2.11 SSH / access sanity
```
ls -la ~/.ssh/
cat ~/.ssh/authorized_keys
wc -l ~/.bash_history 2>/dev/null
tail -50 ~/.bash_history 2>/dev/null
```

### 2.12 Cron
```
crontab -l
```

### 2.13 Gateway wrappers (user-scope)
- Default prefix `LC_ALL=C timeout 30` op elke read
- `--max-output=1MB` truncatie (wp-cli / grep explosies dempen)
- Path-confinement: alleen `~`, `/tmp/$USER`; geen `/etc/shadow`
- Secret-mask in `cat wp-config.php` — auto-redact `DB_PASSWORD`, `AUTH_KEY`, `SECURE_AUTH_KEY`, `NONCE_KEY`, `LOGGED_IN_KEY`, `NONCE_SALT`, salts
- Binary-guard: weiger `cat` op files > 10MB, route via `head`/`tail`

### 2.14 NIET in user-read-whitelist (via cmd_mutate)
- `rm`, `mv`, `chmod`, `chown`, `kill`, `pkill`
- `tail -f`, `watch` (interactief, blokkeert gateway)

---

## Scope 3 — Remote root

DA admin scope, waar we de echte infra-data krijgen: webserver access/error logs, Exim mainlog, DA data, CSF firewall, LVE, mail configs.

### 3.1 Service-status & systemd (infra-incidents — bijv. sshd-down zoals #1287686)
```
systemctl status sshd|httpd|lsws|nginx|exim|dovecot|mariadb|mysqld|named|csf|lfd|imunify360
systemctl is-active <svc>
systemctl show <svc> -p MainPID,ActiveState,SubState,ExecMainStartTimestamp
journalctl -u <svc> --no-pager -n 500
journalctl --since '10 min ago' --no-pager
ss -tlnp
ss -tnp
ss -s
lsof -i :<port>
lsof -p <pid>
lsof -u <user>
netstat -tlnp
netstat -anp | grep <port>
```

### 3.2 DirectAdmin internals
```
ls /usr/local/directadmin/data/users/<user>/
cat /usr/local/directadmin/data/users/<user>/user.conf
cat /usr/local/directadmin/data/users/<user>/domains.list
cat /usr/local/directadmin/data/users/<user>/domains/<domain>.conf
cat /usr/local/directadmin/data/users/<user>/domains/<domain>.pointers
cat /usr/local/directadmin/data/users/<user>/users.list
cat /usr/local/directadmin/data/users/<user>/packages/*.conf
cat /usr/local/directadmin/data/admin/packages/<pkg>.pkg     # pakketdefinities (sync knowledge/prijzen/)
tail -n 500 /usr/local/directadmin/logs/errortaskq.log
tail -n 500 /usr/local/directadmin/logs/security.log
tail -n 500 /usr/local/directadmin/logs/system.log
tail -n 500 /usr/local/directadmin/logs/directadmin.log
cat /usr/local/directadmin/conf/directadmin.conf
cat /usr/local/directadmin/custombuild/options.conf
cat /usr/local/directadmin/data/users/<user>/domains/<d>.cert.info
```

### 3.2.1 DirectAdmin login blacklist / whitelist (brute-force auto-blocks)

DA blokkeert IPs automatisch na te veel mislukte logins. Klanten (en wijzelf) komen soms op de blacklist terecht. Bestanden:

- `/usr/local/directadmin/data/admin/ip_blacklist` — geblokkeerde IPs (one IP per line)
- `/usr/local/directadmin/data/admin/ip_whitelist` — permanent whitelisted (nooit geblokkeerd)

**Read (scope 3):**
```
cat /usr/local/directadmin/data/admin/ip_blacklist
grep <ip> /usr/local/directadmin/data/admin/ip_blacklist
cat /usr/local/directadmin/data/admin/ip_whitelist 2>/dev/null
wc -l /usr/local/directadmin/data/admin/ip_blacklist
```

**Mutate (via `cmd_mutate` — zie mutate-sectie):**
- Ontblokkeren: regel met `<ip>` uit `ip_blacklist` halen
- Permanent whitelisten: `<ip>` toevoegen aan `ip_whitelist` (bestand aanmaken als het niet bestaat)
- **Na wijziging**: `service directadmin restart` (of `systemctl restart directadmin`) — zonder restart blijft DA de oude lijst gebruiken

Gerelateerd: `tail -n 200 /var/log/directadmin/login.log` voor de login-pogingen zelf (pad varieert per install, check ook `/usr/local/directadmin/data/admin/brute_log`).

### 3.3 Webserver logs (realtime, per-domain — user specifiek gevraagd)
```
tail -n 500 /var/log/httpd/domains/<domain>.log
tail -n 500 /var/log/httpd/domains/<domain>.error.log
grep -E '503|500|502|HTTP/1\.[01]" 5' /var/log/httpd/domains/<domain>.log | tail -50
tail -n 500 /var/log/httpd/access_log
tail -n 500 /var/log/httpd/error_log
tail -n 500 /var/log/httpd/suexec_log
tail -n 500 /usr/local/lsws/logs/access.log
tail -n 500 /usr/local/lsws/logs/error.log
tail -n 500 /usr/local/lsws/logs/stderr.log
ls /usr/local/lsws/conf/vhosts/<user>/
cat /etc/httpd/conf/extra/httpd-includes.conf
cat /etc/httpd/conf/extra/directadmin-vhosts.conf
```

### 3.4 Exim mail (deliverability, DKIM, quota, queue)
```
cat /etc/virtual/domainowners
cat /etc/virtual/domainips               # outbound IP per domein — DKIM alignment
cat /etc/virtual/limit
cat /etc/virtual/limit_<user>
cat /etc/virtual/usage/<domain>_out
cat /etc/virtual/<domain>/passwd
cat /etc/virtual/<domain>/aliases
cat /etc/virtual/<domain>/filter
cat /etc/virtual/blocked_incoming_ips
cat /etc/virtual/spam_score
tail -n 500 /var/log/exim/mainlog
grep <email> /var/log/exim/mainlog | tail -100
exigrep <pat> /var/log/exim/mainlog
exim -bp
exim -bpc
exim -Mvh <msgid>
exim -Mvb <msgid>
exim -Mvl <msgid>
exiwhat
tail -n 200 /var/log/exim/rejectlog
tail -n 200 /var/log/exim/paniclog
```

### 3.5 Dovecot (IMAP/POP)
```
tail -n 500 /var/log/maillog
grep <user>@<domain> /var/log/maillog | tail -100
doveadm user <user>@<domain>
doveadm quota get -u <user>@<domain>
doveadm who
ls /etc/dovecot/conf.d/
cat /etc/dovecot/conf.d/<file>
```

### 3.6 MySQL / MariaDB (global)
```
mysql -e "SHOW PROCESSLIST" | head -50
mysql -e "SHOW VARIABLES LIKE '%connections%'"
mysql -e "SHOW STATUS LIKE 'Threads%'"
mysqladmin status
mysqladmin processlist
tail -n 200 /var/log/mysqld.log
cat /etc/my.cnf
ls /etc/my.cnf.d/
```

### 3.7 CSF / lfd (firewall IP-checks — website-"werkt-niet"-usecase)
```
csf -g <ip>
csf -t
csf -l | grep <port>
grep <ip> /var/log/lfd.log | tail -30
cat /etc/csf/csf.deny
cat /etc/csf/csf.allow
grep -E '^(TCP_IN|TCP_OUT|CC_DENY|LF_|DENY_)' /etc/csf/csf.conf
```

### 3.8 CloudLinux LVE / CageFS (503 / resource-issue — zie memory)
```
lveinfo --user=<user>
lveinfo --by-usage=cpu --period=1d
lveinfo --period=1d | head -40
lveps -p
dbtop --batch --iter 1
cloudlinux-selector php --json get --user=<user>
cagefsctl --user-status <user>
cat /etc/cl.selector/native.conf
```

### 3.9 Imunify360
```
imunify360-agent malware list --user <user>
imunify360-agent malware list --path '<pad>'
imunify360-agent features
imunify360-agent doctor
tail -n 200 /var/log/imunify360/console.log
```

### 3.10 SSL / LetsEncrypt
```
cat /etc/letsencrypt/live/<d>/cert.pem | openssl x509 -noout -dates -subject -issuer
ls /etc/letsencrypt/live/
tail -n 300 /var/log/letsencrypt/letsencrypt.log
cat /usr/local/directadmin/data/users/<user>/domains/<d>.cert.info
```

### 3.11 DNS (bind/named)
```
cat /var/named/<domain>.db
named-checkzone <domain> /var/named/<domain>.db
rndc status
grep <domain> /etc/named.conf
```

### 3.12 System / security / auth
```
tail -n 200 /var/log/secure        # SSH login attempts
tail -n 200 /var/log/messages
tail -n 200 /var/log/cron
last -a | head -50
lastb -a | head -30                # failed logins
who
dmesg -T | tail -100
```

### 3.13 Process tree (global)
```
ps auxf
pstree -aup
top -bn1 | head -50
free -h
vmstat 1 3
iostat -xy 1 2
cat /proc/loadavg
cat /proc/meminfo
cat /proc/cpuinfo | head -20
```

### 3.14 Network diagnostiek
```
ip a
ip r
ip -6 r
iptables -L -n | head -80
ip6tables -L -n | head -80
conntrack -L 2>/dev/null | wc -l
tcpdump -i any -c 50 -nn port <p>   # korte sample, timeout-wrapped
ss -s
ss -tnp state established
```

### 3.15 Backup-tooling
```
ls /home/<user>/application_backups/
du -sh /home/<user>/application_backups/*/
jetbackup5-cli --help
/usr/local/installatron/installatron --listinstalls --username=<user>
```

### 3.16 Config & env (/etc)
```
grep -iE '^(port|permitrootlogin|passwordauth|allowusers)' /etc/ssh/sshd_config
cat /etc/hosts
cat /etc/resolv.conf
cat /etc/redhat-release
cat /etc/os-release
cat /proc/1/cmdline                # systemd/init
ls /etc/php*/
cat /etc/php.d/*.ini
```

### 3.17 Account-wissel naar user (vanuit root)
```
sudo -u <user> -i bash -c '<scope-2-cmd>'
runuser -l <user> -c '<scope-2-cmd>'
```

Hiermee kan je vanuit root-scope elke scope-2-read draaien zonder aparte SSH-hop.

### 3.18 Gateway wrappers (root-scope)
- Default `timeout 60`, `LC_ALL=C`, output-truncate op 2MB
- Path-allowlist voor `cat`/`tail`/`head`:
  - `/etc/{virtual,directadmin,dovecot,httpd,ssh,csf,letsencrypt,nginx,lsws,php*,my.cnf*,named.conf,hosts,resolv.conf}`
  - `/usr/local/{directadmin,lsws,installatron}`
  - `/var/log/{httpd,exim,dovecot,maillog,secure,messages,cron,letsencrypt,imunify360,lfd,mysqld*}`
  - `/var/named`
  - `/home/*` (read-only)
- Secret-mask auto-redact:
  - `cat wp-config.php` — DB_PASSWORD, AUTH_KEY, salts
  - `cat /usr/local/directadmin/conf/mysql.conf` — mysql root pass
  - `cat /etc/my.cnf.d/*pass*`
  - `cat /usr/local/directadmin/conf/directadmin.conf` — admin creds
- Binary-guard: weiger `cat` op files > 10MB, route via `head`/`tail`
- Harde blocklist op write-paden zonder cmd_mutate-escalatie
- Audit log: elke root-read loggen met timestamp + caller + command + path

---

## Mutate-only (buiten read-whitelist — aparte goedkeuring via `cmd_mutate`)

Destructief of shared-state. Nooit in read-scope, altijd expliciete approval + audit.

### Filesystem
```
rm, rm -rf
mv
chmod, chown
truncate
:> file         # truncate via redirect
```

### Services
```
systemctl start|stop|restart|reload <svc>
service <svc> start|stop|restart
service directadmin restart                # verplicht na edit ip_blacklist/ip_whitelist
systemctl restart directadmin              # equivalent
```

### DirectAdmin login blacklist / whitelist
Workflow: klant of wij zijn door brute-force detector op DA geblokkeerd → IP uit blacklist halen (of vooraf whitelisten) → DA service herstarten.

```
# Unblock: verwijder IP uit blacklist
sed -i '/^<ip>$/d' /usr/local/directadmin/data/admin/ip_blacklist

# Permanent whitelisten (bestand aanmaken als nog niet bestaat)
echo '<ip>' >> /usr/local/directadmin/data/admin/ip_whitelist
chown diradmin:diradmin /usr/local/directadmin/data/admin/ip_whitelist
chmod 644 /usr/local/directadmin/data/admin/ip_whitelist

# Activeren
service directadmin restart
```

Wrapper-eis: IP-validatie (regex `^[0-9a-fA-F:.]+$`) vóór echo/sed om injectie te voorkomen.

### Firewall
```
csf -d <ip>      # deny
csf -a <ip>      # allow
csf -dr <ip>     # deny remove
csf -ar <ip>     # allow remove
csf -r           # restart
csf -x           # disable
csf -e           # enable
iptables -A|-D|-I|-F
ip6tables -A|-D|-I|-F
```

### Mail queue
```
exim -Mrm <id>   # remove from queue
exim -Mg <id>    # give up
exim -Mt <id>    # thaw
exim -Mf <id>    # freeze
exicyclog        # rotate
```

### Processes
```
kill, kill -9
pkill
fuser -k
```

### Imunify
```
imunify360-agent malware cleanup
imunify360-agent malware remove
imunify360-agent malware restore
```

### DirectAdmin API writes
```
da user suspend|unsuspend
da user password <user> <new>
da domain add|remove
```

### MySQL writes
```
mysql -e 'UPDATE|DELETE|DROP|ALTER|CREATE'
mysqldump  # strictly read, maar kan lock-gevoelig zijn — mutate-classificatie optioneel
```

### SSH keys / users
```
adduser, userdel
passwd
usermod
ssh-keygen
```

### NEVER (ook niet via mutate) — scripts die sshd crashen
- `adminssh/create` API endpoint — **KAPOT, crasht sshd** (tweemaal bevestigd op cl03, zie memory `feedback_adminssh_bug.md`)

---

## Cross-scope guards (op álle drie de scopes)

- `LC_ALL=C` standaard → voorspelbare output voor parsing
- Output truncation (1MB user, 2MB root) → geen context-flood
- Interactief-detect: weiger `less`/`vim`/`top` zonder `-bn1`/`-b`/`-n` flags
- Binary-detect: bij non-text file, route naar `file`/`head -c` i.p.v. `cat`
- Secret-mask pipeline op known-secret paths
- Audit trail: command + path + timestamp + caller naar gateway-log
- Per-call `timeout` wrapper (scope-afhankelijk)
- Max concurrent calls per scope (voorkom fork-bomb via gateway)

---

## Integratie-checklist voor de gateway

- [ ] Drie scopes gescheiden met eigen auth & allowlist-file
- [ ] Root-scope achter extra approval-gate (2FA of per-run prompt)
- [ ] `cmd_run` = scope 1+2+3 read / `cmd_mutate` = aparte allowlist (hierboven)
- [ ] `fs_read` path-allowlist per scope (zie 2.13 / 3.18)
- [ ] Secret-mask config (wp-config, mysql.conf, DA conf)
- [ ] Audit log doorschrijven naar central log
- [ ] Emergency kill-switch op gateway (one-flag disable alle mutates)
- [ ] Per-account SSH-key rotation schema (user-scope keys)
- [ ] Circuit breaker: na N mutate-fouten dicht
- [ ] Geen automatische approval van patronen met `>`, `|tee`, `|sh`, backticks, `$(...)` buiten whitelist
