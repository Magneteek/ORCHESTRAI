# Google Ads Campaign Template — Beljenje Zob (Teeth Whitening)
**Template version**: 1.0 — April 2026
**Based on**: nasmehpg HLN Zobozdravstvo 2026 learnings
**Use for**: Any dental clinic in Slovenia running a professional whitening offer

---

## How to Use This Template

Replace every `[PLACEHOLDER]` before launching:

| Placeholder | What to fill in | Example |
|---|---|---|
| `[CLINIC_NAME]` | Short clinic brand name (for headlines) | Hiša Lepega Nasmeha |
| `[CITY]` | Primary city or area name | Kranj |
| `[PHONE]` | Clinic phone number | 01 82 82 0 82 |
| `[PRICE]` | Whitening package price | €279 |
| `[PACKAGE_VALUE]` | Total value of the package | €520 |
| `[SAVINGS]` | Price - Value (what they save) | €241 |
| `[WEBSITE]` | Clinic domain | nasmehpg.si |
| `[LP_URL]` | Landing page URL for this campaign | nasmehpg.si/beljenje-zob/ |
| `[CLINIC_ADDRESS]` | Full address for radius targeting | Podreber 14 D, Polhov Gradec |
| `[HOURS_*]` | Ad schedule per clinic hours | See Ad Scheduling section |

---

## Campaign Settings

| Setting | Value | Notes |
|---|---|---|
| Campaign name | `[CLINIC_NAME] – Beljenje Zob [YEAR]` | e.g. HLN – Beljenje Zob 2026 |
| Campaign type | **Search** | Never PMax for a local clinic |
| Goal | Leads / Phone call lead | |
| Networks | **Google Search only** | Uncheck Search Partners AND Display |
| Budget | €10–15/day | Start €10, scale after 20+ conversions |
| Bidding | **Maximize Clicks** (start) | Switch to Maximize Conversions after 20+ LP conversions |
| Location | 20km radius around `[CLINIC_ADDRESS]` | Adjust to 15km for dense urban areas (Ljubljana) |
| Language | Slovenian | |
| Rotation | Optimize: prefer best performing | |
| Start date | Immediately after LP is live | Do NOT launch without a live LP |

> **Critical**: Launch only after the landing page is live and LP click-to-call conversion tracking is confirmed working. Running without a live LP wastes every click.

---

## Ad Scheduling

Only show ads when the clinic can answer the phone. Replace with actual clinic hours:

| Day | Hours | Notes |
|---|---|---|
| Monday | `[HOURS_MON]` | e.g. 08:00–16:00 |
| Tuesday | `[HOURS_TUE]` | |
| Wednesday | `[HOURS_WED]` | |
| Thursday | `[HOURS_THU]` | |
| Friday | `[HOURS_FRI]` | |
| Saturday | OFF | Unless clinic is open |
| Sunday | OFF | |

---

## Conversion Tracking Setup

> **Slovenia does not support Google forwarding numbers.** Call extension tracking and duration-based call conversions do NOT work. Use LP-based tracking exclusively.

### Primary Conversion Action (the only one that matters)

| Setting | Value |
|---|---|
| Conversion name | `Klik na telefon – Beljenje Zob` |
| Source | Website |
| Category | Phone call lead |
| Trigger | Click on `tel:[PHONE]` link on landing page |
| Count | One per click |
| Optimization | **Primary** |

Setup via GTM:
1. Create a GTM trigger: Click → All clicks → Click URL contains `tel:`
2. Create a GTM tag: GA4 event `phone_click` + Google Ads conversion tag
3. In Google Ads: create conversion action → Website → import from GA4

### Secondary (optional, observation only)
- Form submission on LP (if LP has a contact form)
- Set to **Secondary / Observation** — never Primary

### Do NOT add:
- Call clicks from ads
- Call Extension
- Call Only Ads
These do not work in Slovenia and will pollute your conversion data.

---

## Campaign Structure: 2 Ad Groups

### Ad Group 1: Profesionalno Beljenje Zob
*High-intent queries — people ready to book*

**Keywords** — phrase and exact match only (no broad):
```
"beljenje zob"
[beljenje zob]
"profesionalno beljenje zob"
[profesionalno beljenje zob]
"beljenje zob pri zobozdravniku"
"beljenje zob zobozdravnik"
"beljenje zob [CITY]"
["beljenje zob [CITY]"]
"profesionalno beljenje"
```

**Headlines** (15 max, 30 chars each — customize `[PLACEHOLDERS]`):
```
1.  Beljenje Zob – [CITY]
2.  Beljenje Zob – [PRICE]
3.  Paket Vrednost [PACKAGE_VALUE]
4.  Prihranite [SAVINGS] – Beljenje
5.  Profesionalno Beljenje Zob
6.  Beljenje pri Zobozdravniku
7.  [CLINIC_NAME]
8.  Brezplačna Higiena + Beljenje
9.  Beljenje Zob – Naročite Se
10. Bela Zobozdravnik – Pokličite
11. Svetlejši Nasmeh po 1 Obisku
12. Varno Beljenje – Brez Škode
13. Paket [PRICE] – Omejeno
14. Beljenje Zob Blizu Vas
15. Nasmeh ki Prepriča
```

**Descriptions** (4 max, 90 chars each):
```
1. Profesionalno beljenje + brezplačna higiena + pasta. Vrednost [PACKAGE_VALUE] za [PRICE].
2. Prihranite [SAVINGS] – paket beljenja pri zobozdravniku. Pokličite za termin danes.
3. Beljenje zob pri zobozdravniku v [CITY]. Brezplačna dentalna higiena vključena.
4. Svetlejši nasmeh po enem obisku. Paket [PRICE] (vrednost [PACKAGE_VALUE]). Naročite se.
```

---

### Ad Group 2: Beljenje Zob Cena
*Price-researching queries — people comparing costs*

**Keywords**:
```
"beljenje zob cena"
[beljenje zob cena]
"cena beljenja zob"
"koliko stane beljenje zob"
"beljenje zob cenik"
"profesionalno beljenje zob cena"
"beljenje zob cena [CITY]"
```

**Headlines** (15 max, 30 chars each):
```
1.  Beljenje Zob – Samo [PRICE]
2.  Cena Beljenja: [PRICE] Paket
3.  Paket Vrednost [PACKAGE_VALUE]
4.  Prihranite [SAVINGS] – Beljenje
5.  Brez Skritih Stroškov
6.  [CLINIC_NAME] – Cena Beljenja
7.  Beljenje Zob Cena [CITY]
8.  Brezplačna Higiena Vključena
9.  Transparentne Cene – Pokličite
10. Theodent Pasta Gratis
11. Paket Beljenje – [PRICE]
12. Beljenje + Higiena [PRICE]
13. Kakovostno Beljenje po Ceni
14. Naročite Se – Prosta Mesta
15. Pokličite Za Cenik
```

**Descriptions** (4 max, 90 chars each):
```
1. Beljenje zob paket [PRICE] – vključuje higieno in pasto. Vrednost [PACKAGE_VALUE].
2. Transparentna cena: [PRICE] za celoten paket beljenja. Brez skritih doplačil. Pokličite.
3. Prihranite [SAVINGS] na profesionalnem beljenju v [CITY]. Naročite se danes.
4. Cena beljenja vključuje higieno + Theodent pasto. Paket vrednost [PACKAGE_VALUE] za [PRICE].
```

---

## Assets (Extensions)

### Call Asset
Add the clinic phone number — even though duration tracking doesn't work in Slovenia, the number shows as text and increases trust and CTR.

| Field | Value |
|---|---|
| Country | Slovenia |
| Phone number | `[PHONE]` |
| Call reporting | ON (even if tracking limited) |
| Schedule | Match ad schedule exactly |

### Sitelink Assets (4 minimum)
```
Beljenje Zob Paket    → [LP_URL]
O Ordinaciji          → [WEBSITE]/o-nas/
Kontakt & Naročilo    → [WEBSITE]/kontakt/
Cenik Storitev        → [WEBSITE]/cenik/
```

### Callout Assets (8 max, 25 chars each)
```
Brezplačna dentalna higiena
Theodent pasta gratis
Prihranite [SAVINGS]
Paket vrednost [PACKAGE_VALUE]
Brez čakalnih dob
Brezplačen posvet
Sodobna oprema
Prijazen tim
```

### Structured Snippets — Services
```
Profesionalno beljenje, Dentalna higiena, Estetska zobozdravstvo, Zobni pregled
```

---

## Negative Keywords (Campaign Level)

Add before launch — prevent all known waste:

**DIY / Not professional:**
```
trakovi
doma
sam
aktivno oglje
uv
led
home kit
gelovi
```

**Wrong intent / informational:**
```
brezplačno
brezplačna
forum
mnenja
izkušnje
kako
zakaj
recenzije
wiki
blog
```

**Wrong audience (contraindicated):**
```
nosečnost
nosečnica
doječe
otroke
otroci
mleko
mlečne
pod 18
```

**Wrong service / competitor search:**
```
laser
urgentna
urgentno
24h
nonstop
vikend
implantati
protetika
ortodontija
```

**Wrong country / wrong geo:**
```
zagreb
beograd
hrvaška
srbija
```

**Competitor names** — add local dental clinic names in the area:
```
[add competitor clinic names for the specific city/area]
```

---

## Landing Page Requirements

> The LP **must** be live before the campaign launches. Sending traffic to a homepage or dead URL wastes every click.

**Must-haves on the LP:**
- Headline matches ad copy (same offer, same price)
- `[PRICE]` prominently above the fold
- Package contents clearly listed
- Single primary CTA: tap-to-call `tel:[PHONE]` (mobile) + booking form (desktop)
- Trust signals: reviews, before/after photos, dentist credentials
- No navigation links out (zero exits)
- Mobile-first, loads in < 2 seconds

**LP URL**: `[LP_URL]`

**Tracking on LP:**
- GTM installed
- `tel:` click event firing to GA4 + Google Ads conversion
- Scroll depth (25/50/75/100%) as secondary signal only
- GA4 page view

Use the existing `lp-beljenje-zob.html` template from `/deliverables/development/` — replace `YOUR_GA_ID` and `YOUR_PIXEL_ID` before uploading.

---

## Multi-Location Deployment Notes

When running this for multiple clinics across Slovenia:

**One campaign per clinic** — do not combine multiple locations into one campaign. Reasons:
- Budget control per location
- Location-specific ad scheduling
- Location-specific performance reporting
- Different offers/prices per clinic

**Geo keyword variants to add per city:**
```
Ljubljana area:  "beljenje zob ljubljana", "beljenje zob lj"
Kranj area:      "beljenje zob kranj", "beljenje zob gorenjska"
Maribor area:    "beljenje zob maribor", "beljenje zob podravska"
Celje area:      "beljenje zob celje"
Koper area:      "beljenje zob koper", "beljenje zob primorska"
Novo Mesto:      "beljenje zob novo mesto", "beljenje zob dolenjska"
```

Add the relevant geo terms to Ad Group 1 only (the intent group). Price group stays city-agnostic.

---

## Expected Performance

Based on Slovenian dental market data (April 2026):

| Metric | Conservative | Target | Strong |
|---|---|---|---|
| CPC | €0.50–0.80 | €0.40–0.60 | < €0.40 |
| CTR | 8–12% | 12–18% | > 18% |
| Clicks/day at €10 | 12–20 | 16–25 | 25+ |
| LP conversion rate | 5–8% | 8–15% | 15%+ |
| Inquiries/month | 18–48 | 38–90 | 90+ |
| Cost per inquiry | €6–17 | €3–8 | < €3 |

Whitening CPCs are lower than implants (less competition). A well-run campaign with a strong LP should achieve cost per inquiry of €5–10.

---

## Launch Checklist

Before going live, confirm every item:

**Setup:**
- [ ] All `[PLACEHOLDERS]` replaced
- [ ] Campaign type: Search (not PMax, not Display)
- [ ] Search Partners: **unchecked**
- [ ] Display Network: **unchecked**
- [ ] Location: radius around clinic address set
- [ ] Ad scheduling: matches clinic hours exactly
- [ ] Negative keyword list uploaded

**Tracking:**
- [ ] LP is live at `[LP_URL]`
- [ ] GTM installed on LP
- [ ] `tel:` click trigger working in GTM preview
- [ ] Google Ads conversion action created (Website, Phone call lead)
- [ ] Conversion is set as **Primary** (only this one — no call extension conversions)
- [ ] Test click on mobile: confirm conversion fires

**Assets:**
- [ ] Call asset added with clinic phone
- [ ] Call asset schedule matches ad schedule
- [ ] Sitelinks added (4+)
- [ ] Callouts added (4+)
- [ ] Structured snippets added

**Ads:**
- [ ] Ad Group 1: RSA has 15 headlines + 4 descriptions
- [ ] Ad Group 2: RSA has 15 headlines + 4 descriptions
- [ ] Final URL points to `[LP_URL]` (not homepage)
- [ ] Ads approved before budget starts spending

---

## Post-Launch Optimization Schedule

**Week 1–2 (Learning phase):**
- Monitor search terms daily — add negatives for any irrelevant queries
- Do not change bids or budgets (let Maximize Clicks gather data)
- Watch for CTR < 5% on any headline → flag for replacement

**Week 3–4 (First optimization):**
- Review which ad group drives lower CPC + higher CTR
- Pause keywords with 20+ clicks and 0 conversions
- Add any new geo-modified terms showing up in search report

**After 20+ LP conversions:**
- Switch bidding to Maximize Conversions
- Set Target CPA at 1.5x your current cost per conversion (adjust gradually)
- Pause Ad Group with higher CPA if budget is limited

**Monthly:**
- Refresh callout assets with seasonal offers
- Update price/offer if changed
- Review competitor names in search report → add as negatives

---

*Template created: April 2026 | Based on nasmehpg campaign learnings*
*Store in: `/templates/google-ads/beljenje-zob-campaign-template.md`*
