# Triage model-matrix — 10-run analyse

**Ticket:** #1288653 "error op mijn website" — Maarten Keizer (dotabase.nl PHP parse-error op regel 3)
**Klantvragen (5):** site werkt niet / kunnen jullie fixen? / groter pakket? / hoeveel domeinnamen? / openstaande facturen?
**Datum:** 2026-04-20 · **Harness:** test-lab dry-run (no HS side effects)

## TL;DR

**Winner op cost:** **`haiku-antipatterns-top`** — $0.31 per triage (8× goedkoper dan Opus), 1 legit error, alle 5 vragen beantwoord.

**Quality-winner:** **Opus** — rijkste, meest genuanceerde drafts (~3000 chars), 0-1 legit errors, maar $2.50/run.

**Verliezer:** **Sonnet + antipatterns-top overlay** — de overlay maakte Sonnet verbose (2× output) en bracht 6-7 legit errors, $1.08/run. Overlay werkt tegen Sonnet.

## Alle runs (sorted by cost)

| # | Config | Model | Cost | Turns | Calls | Legit err | Out tok | Draft chrs |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| 1 | sonnet-baseline (noop*) | sonnet-4-6 | $0.25 | 6 | 5 | 0 | 2.8k | 0 |
| 2 | haiku-solo | haiku-4-5 | $0.26 | 20 | 19 | 5 | 6.4k | 2691 |
| 3 | **haiku-antipatterns-top** 🏆 | haiku-4-5 | **$0.31** | 18 | 17 | **1** | 4.9k | 1471 |
| 4 | haiku-solo | haiku-4-5 | $0.40 | 26 | 25 | 5 | 8.1k | 1663 |
| 5 | sonnet-baseline | sonnet-4-6 | $0.72 | 21 | 20 | 3 | 6.9k | 2612 |
| 6 | sonnet-baseline | sonnet-4-6 | $0.89 | 25 | 24 | 5 | 11.4k | 1939 |
| 7 | sonnet-antipatterns-top | sonnet-4-6 | $1.08 | 31 | 30 | 6 | 12.3k | 2626 |
| 8 | sonnet-antipatterns-top | sonnet-4-6 | $1.09 | 28 | 27 | 7 | 16.2k | 2397 |
| 9 | opus-antipatterns-top | opus-4-7 | $2.46 | 30 | 29 | **0** | 16.0k | 3050 |
| 10 | opus-baseline | opus-4-7 | $2.52 | 29 | 28 | 1 | 12.2k | 2995 |
| 11 | opus-baseline | opus-4-7 | $2.56 | 31 | 30 | 1 | 14.3k | 2827 |

*noop-detect: run zag een al bestaande draft van eerdere run en deed niks — niet representatief voor full triage.

## Cost / quality per config

| Config | Runs | Avg cost | Avg legit err | Avg draft chars |
|---|---:|---:|---:|---:|
| haiku-solo | 2 | $0.33 | 5.0 | 2177 |
| **haiku-antipatterns-top** | 1 | **$0.31** | **1.0** | 1471 |
| sonnet-baseline (excl noop) | 2 | $0.80 | 4.0 | 2276 |
| sonnet-antipatterns-top | 2 | $1.08 | 6.5 | 2512 |
| opus-baseline | 2 | $2.54 | 1.0 | 2911 |
| opus-antipatterns-top | 1 | $2.46 | 0.0 | 3050 |

## Effect van de `antipatterns-top` overlay

Overlay plaatst 12 anti-patterns in een compact Step 0 blok vóór Step 1 — dus in initial planning context.

| Model | Cost delta | Error delta | Verdict |
|---|---|---|---|
| Haiku | -6% ($0.33 → $0.31) | -80% (5 → 1) | ✅ duidelijke winst |
| Sonnet | +35% ($0.80 → $1.08) | +60% (4 → 6.5) | ❌ schadelijk (verbose) |
| Opus | -3% ($2.54 → $2.46) | neutraal | ≈ ruis |

**Verklaring:** Haiku leunt op expliciete planning-hints; Sonnet past de hints te letterlijk toe en wordt over-geëlaboreerd; Opus bedenkt het zelf al (overlay = redundant context).

## Draft reply vergelijking

### Haiku (winner, $0.31) — compact en direct

> Hoi Maarten,
>
> We hebben het probleem gevonden. Je index.php bestand op regel 3 heeft een kleine syntaxfout — de tekst mist aanhalingstekens.
>
> Huidige code: `echo hallo welkom op mijn website;`
>
> Dit zou moeten zijn: `echo "hallo welkom op mijn website";`
>
> Zal ik dit voor je corrigeren? Dan zou de website meteen weer moeten werken.
>
> Wat betreft je andere vragen: je huidt pakket (Pro) ondersteunt tot 20 domeinen, en je bent allemaal betaald — geen openstaande facturen.

**Observatie:** Adresseert alle 5 vragen in 5 zinnen. **Echter:** pakket-claim ("Pro, 20 domeinen") is fout — account is Pakket L, 84 packages, 83 domeinen. **Quality flaw.**

### Sonnet-baseline ($0.72) — gestructureerd, correct

> Goedenavond Maarten,
>
> We hebben de oorzaak van de 500-error op dotabase.nl gevonden. In `index.php` op regel 3 stond een PHP-syntaxfout: een string zonder aanhalingstekens. LiteSpeed gaf de volgende foutmelding:
>
> `PHP Parse error: syntax error, unexpected identifier "welkom", expecting "," or ";"`
>
> Dit lossen we zo op via DirectAdmin > Bestandsbeheer. Mag ik de fix doorvoeren, of wil je dat zelf doen?
>
> Dan je andere vragen:
>
> **Groter pakket nodig?**
> Nee. De fout zit in de code, niet in de servercapaciteit. Geen aanleiding voor een upgrade.
>
> **Hoeveel domeinnamen?**
> Je account telt momenteel 83 domeinen verdeeld over 84 pakketten. Het exacte domeinlimiet per pakket zie je in DirectAdmin onder Accountbeheer.
>
> **Openstaande facturen?**
> Geen. De vijf meest recente facturen zijn allemaal €0,00 — alles is in orde.
>
> Fijne avond!

**Observatie:** Correcte cijfers (83/84), nette kopjes per vraag, expliciete fix-vraag, tijdsafhankelijke groet.

### Opus ($2.46) — rijkst, meest genuanceerd

> Hoi Maarten,
>
> We hebben even naar `www.dotabase.nl` gekeken. De 500-foutmelding kwam door een kleine fout in regel 3 van je `index.php`:
>
> `echo hallo welkom op mijn website;`
>
> De tekst staat niet tussen aanhalingstekens, waardoor PHP de regel niet kan uitvoeren. Het zou moeten zijn:
>
> `echo "hallo welkom op mijn website";`
>
> Zal ik dit voor je aanpassen via DirectAdmin, of pas je het zelf even aan via Bestandsbeheer? Laat het ons even weten.
>
> **Je andere vragen:**
>
> **Moet ik een groter pakket?**
> Nee, het pakket heeft hier niks mee te maken. Je zit op Pakket L en dat is ruim voldoende voor een eenvoudige PHP-pagina.
>
> **Hoeveel domeinnamen kan ik kwijt?**
> Losse domeinregistraties zijn onbeperkt, daar zit geen maximum aan. Voor hosting hangen er meerdere domeinen binnen je Pakket L en daar zit nog ruimte. Wil je precies weten hoeveel sites je nog kunt toevoegen, dan kijken we dat graag voor je na.
>
> **Heb ik openstaande facturen?**
> Nee, je hebt geen betalingsachterstand. De posten die bij jou in het systeem openstaan zijn interne nul-facturen (€0,00) en vragen geen actie van je.
>
> Fijne avond!

**Observatie:** Correcte pakket-identificatie (Pakket L), genuanceerd ("losse domeinregistraties onbeperkt" vs "hosting-domeinen"), nuanceert de openstaande-factuur-status (interne nul-facturen), biedt zowel zelf-fix als onze fix aan.

## Welke tool-calls faalden echt?

De meeste "errors" in de ruwe tellers waren **dry-run-hook blocks** (intentioneel, vormen bewijs dat safety werkte). Onderstaand de echte legit errors:

### Haiku-antipatterns-top (1 legit error)
- `cmd_run find-large-files` — arg-vorm fout: `"args"` passed as string-encoded JSON i.p.v. object. Haiku corrigeerde zelf.

### Haiku-solo (5 legit errors elk)
- Merendeel: argument-naming (`username` i.p.v. `user`, `args` als string etc.)
- Overlay reduceerde dit met 80%

### Sonnet-antipatterns-top (6-7 legit errors)
- Sonnet probeerde meerdere niet-bestaande tool-varianten
- Overlay maakte hem OVER-exploratief

### Sonnet-baseline (3-5 legit errors), Opus (0-1)
- Sonnet-baseline: wat misc arg-naming, zelf-gecorrigeerd
- Opus: vrijwel geen echte errors

## Tech-note kwaliteit (korte check)

- **Haiku**: concrete findings in bullets, maar claimt "Pro pakket" (fout), note is 20 regels, duidelijk
- **Sonnet**: noemt client_id 3, meldt "DA user-info retourneerde lege config (account mogelijk reseller/admin-tier)" — **identificeert het gateway-bug!**, ~25 regels
- **Opus**: diepste context — noemt cp_id 51325, hoofd-domein maartenendominiek.wedding, direct_debit-status, IBAN-afwezigheid, duidt "20 openstaande nul-facturen" correct als intern, ~30 regels

## Beveelen

**Production triage** wordt hier de **trade-off**:

| Scenario | Aanbevolen | Rationale |
|---|---|---|
| Massa-triage (cost-sensitive) | **haiku-antipatterns-top** | $0.31/run, 5 vragen beantwoord, hoge doorlooptijd-capaciteit |
| Belangrijke tickets (kwaliteit boven alles) | **opus-baseline** | Correcte cijfers, genuanceerd taalgebruik, 0-1 errors |
| Middenweg (de default nu) | **sonnet-baseline** | Correcte feiten + $0.80/run, geen overlay-regressie |

**Niet aanbevolen:**
- `sonnet-antipatterns-top`: overlay maakt Sonnet slechter
- `opus-antipatterns-top`: overlay voegt niks toe aan Opus (marginaal goedkoper, ruis-niveau)

## Next steps

1. **Haiku quality-fix**: het "Pro, 20 domeinen" hallucineren-probleem adresseren. Mogelijk door DRS-resultaat expliciet in prompt te noemen: "check exact pakket-naam uit `drs.package-search(client_id).product_name`, niet gokken."
2. **Variance-run** op haiku-antipatterns-top (nu maar 1 sample).
3. **Andere tickets** — dit is 1 ticket-type (website-error met meerdere bij-vragen). Billing-only, malware, DNS-issue zouden andere model-hierarchy kunnen tonen.
4. **Advisor-tool experiment** — Haiku-executor + Opus-advisor zou Haiku's fact-hallucinations kunnen voorkomen zonder full Opus-cost.

---

*Gegenereerd door `test-lab/scripts/compare.py` + manual drilldown op 2026-04-20. Raw data in `test-lab/results/*.log` + `*.intended.jsonl` + `*.report.json`.*
