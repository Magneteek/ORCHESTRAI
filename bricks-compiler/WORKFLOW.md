# Bricks + ACSS + Frames: Agency Page-Build Workflow (Option B)

> **Option B** means: compiler-generated sections (Track A) + native Bricks Components for global atoms (Track B). The two tracks never overlap. Read the architecture section before you start.
> **ACSS class reference**: `bricks-compiler/ACSS-CLASS-REFERENCE.md` — use this when writing HTML for the Bricks HTML-to-Bricks paste feature.

---

## 1. Overview + Architecture

### The Two Tracks

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT WORDPRESS SITE                             │
│                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
│  │  TRACK A: bricks-compiler   │  │  TRACK B: Native Components  │ │
│  │  (section-level content)    │  │  (global atoms & site shell) │ │
│  │                              │  │                              │ │
│  │  Source of truth:            │  │  Source of truth:            │ │
│  │  manifests/*.yaml            │  │  WordPress database          │ │
│  │  templates/*.json            │  │  (bricks_components option)  │ │
│  │  pages/*.json (page spec)    │  │                              │ │
│  │                              │  │  Built: once per site in     │ │
│  │  Workflow:                   │  │  Bricks editor, manually     │ │
│  │  1. Write page spec JSON     │  │                              │ │
│  │  2. node cli.js spec.json    │  │  Atoms: Button, Badge, Card  │ │
│  │     --clipboard              │  │  Site-global: Header, Footer │ │
│  │  3. Cmd+V in Bricks          │  │  CTA Bar, Cookie Bar         │ │
│  │                              │  │                              │ │
│  │  What compiler fills:        │  │  What they do:               │ │
│  │  - All text slots            │  │  - Edit once → update every  │ │
│  │  - All links                 │  │    instance site-wide        │ │
│  │  - Array items (features,    │  │  - Properties panel exposed  │ │
│  │    testimonials, FAQs…)      │  │    to client in Bricks       │ │
│  │  - Fresh IDs (no collisions) │  │                              │ │
│  │                              │  │  What they do NOT do:        │ │
│  │  What compiler cannot fill:  │  │  - Appear in page specs      │ │
│  │  - Slider images (shared     │  │  - Get compiled or pasted    │ │
│  │    CSS class)                │  │  - Exist inside clipboard    │ │
│  │  - Secondary CTA buttons     │  │    JSON output               │ │
│  │  - data-rating attributes    │  │                              │ │
│  │  - Nested array items        │  │                              │ │
│  │  - Form shortcodes           │  │                              │ │
│  └──────────────────────────────┘  └──────────────────────────────┘ │
│                                                                      │
│  ACSS v3 variables underpin everything — set once in Phase 1         │
│  Frames CSS classes used by both tracks — never hardcode pixel vals  │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Distinction

A compiled section may contain markup that visually looks like an atom Component — a button, a stat block, a card — but inside the pasted clipboard JSON it is **literal element markup, not a Component reference**. That is intentional. The compiler fills static content into that markup. When the global atom changes (e.g. you redesign the Button Component), update the Component in Bricks; when a section needs new copy, recompile from the page spec.

### File Locations

```
bricks-compiler/
├── cli.js                     ← compile a page spec to clipboard or file
├── generate-acss-export.js    ← generate ACSS import JSON from design-config.yaml
├── index.js                   ← core compilePage() / compileSection() functions
├── wp-import.js               ← batch WP importer (XWR / PHP eval-file / JSON)
├── design-config.yaml         ← client design tokens (edit per site)
├── design-config.example.yaml ← copy this to start
├── acss-base-template.json    ← base ACSS settings (preserved flags + component config)
├── manifests/                 ← one YAML per section template
│   ├── hero-section-barcelona.yaml
│   ├── social-proof-alpha.yaml
│   └── ... (60+ manifests)
├── templates/                 ← Bricks clipboard JSON exports (one per manifest)
│   ├── hero-section-barcelona.json
│   └── ...
└── examples/                  ← real page specs you can reference
    ├── drnl-homepage.json
    └── drnl-service-page.json
```

---

## 2. Prerequisites

### Licenses and Accounts

| Tool | Minimum tier | Notes |
|---|---|---|
| Bricks Builder | Agency / Lifetime | Required for multi-site. v2.0+ for Components. |
| ACSS v3 | Agency | One license covers all client sites. |
| Frames | Any tier | CSS classes must be present in the Bricks settings JSON. |
| WordPress | Self-hosted | WP.com does not support Bricks. |
| Node.js | v18+ | Required for the compiler. `node -v` to verify. |

### Local Setup (one time)

```bash
cd bricks-compiler
npm install          # installs js-yaml and dependencies
node cli.js --help   # verify the CLI works
```

### WordPress Setup Per Site

1. WordPress installed with permalink structure set: `/%postname%/` (or client's required structure). **Set this before importing any content** — changing it later invalidates all internal links.
2. Bricks Builder installed and activated. Bricks → Settings confirms editor opens on a test page.
3. ACSS v3 installed, not yet configured.
4. Frames installed (WordPress plugin version).
5. Form plugin installed: CF7, Fluent Forms, or GHL embed script.
6. SEO plugin installed: SEOpress or Yoast (confirm with client before install).

### Your Compiler Is Tied to a Specific Bricks + Frames Version

The templates in `templates/*.json` are Bricks clipboard exports from **Bricks 2.3.5**. If the client's Bricks version differs significantly, paste a test section and verify elements render. The `version` field in `compilePage()` output is hardcoded to `"2.3.5"` — update `index.js` line 174 if needed.

---

## 3. Component Starter Kit — 11 Native Bricks Components

Build in this exact order. Each depends on ACSS variables being stable, and later components may visually contain atoms from earlier ones. **Do not build these before Phase 1 is complete and ACSS variables are verified.**

### Build Order Summary

| # | Component | Category | Time | Depends on |
|---|---|---|---|---|
| 1 | Button Primary | Atoms | 15 min | ACSS action/primary vars |
| 2 | Badge / Tag | Atoms | 10 min | ACSS color vars |
| 3 | Icon + Text Row | Atoms | 10 min | — |
| 4 | Stat Block | Atoms | 10 min | ACSS heading scale |
| 5 | Card | Cards | 20 min | Button (for card CTA) |
| 6 | Testimonial Card | Cards | 20 min | Card structure decisions |
| 7 | Team Member Card | Cards | 15 min | — |
| 8 | Cookie Bar | Site-Global | 15 min | — |
| 9 | Header | Site-Global | 45–60 min | WP Custom Menu |
| 10 | Footer | Site-Global | 30 min | Header (template system verified) |
| 11 | CTA Bar | Site-Global | 20 min | Final offer copy confirmed |

### Step-by-Step for Each Component

For every component, the process is:

1. Bricks editor → Components panel → New Component
2. Name: `[Type] — [Variant]` (e.g. "Button Primary", "Card Feature")
3. Category: `Atoms`, `Cards`, or `Site-Global`
4. Build element tree. Apply ACSS utility classes for spacing/type. No hardcoded pixel values.
5. For each editable field: click purple "+" next to the control → Create Property → fill definition
6. Save. Drag onto Component Library test page. Set test values. Check mobile at 360px.

---

### Component 1 — Button Primary

The first build reveals whether ACSS variables are correctly wired (`--action`, `--primary`, font scale).

**Do not create separate components per style. One component, one `style` Select.**

| Property ID | Label | Type | Options / Notes |
|---|---|---|---|
| `label` | Button Text | text | Required |
| `link` | Destination | link | Required |
| `style` | Style | select | `primary` / `outline` / `ghost` |
| `size` | Size | select | `sm` / `md` / `lg` |
| `icon_url` | Icon | image | Optional — SVG, shown left of label |
| `icon_position` | Icon Position | select | `left` / `right` — active only when icon_url is set |
| `full_width` | Full Width | toggle | Expands to `width: 100%` on container |

---

### Component 2 — Badge / Tag

Standalone label atom. No link. Used in hero sections as proof chips and inside content sections.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `label` | Badge Text | text | Required, max 30 chars |
| `style` | Colour Style | select | `neutral` / `primary` / `accent` / `success` / `warning` |
| `size` | Size | select | `sm` / `md` |

No icon on this component. An icon badge is a different atom — build separately if needed.

---

### Component 3 — Icon + Text Row

Single line item: SVG icon left, text right. Used in feature lists and "what's included" sections.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `icon` | Icon | image | SVG, 24px |
| `label` | Line Text | text | Required |
| `style` | Icon Style | select | `check` / `cross` / `arrow` / `neutral` |

---

### Component 4 — Stat Block

Large bold value + descriptor label. Used standalone in hero and CTA sections.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `value` | Metric Value | text | Required — "10 Years", "98%", "2,500+" |
| `label` | Descriptor | text | Required — "Proven track record" |
| `theme` | Theme | select | `light-bg` / `dark-bg` |

---

### Component 5 — Card

Generic content card: icon + heading + body + optional link. The atom inside every feature grid section.

**Do not expose a `style` or `colour` property on Card.** Colour variations are handled via Global classes.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `icon` | Icon | image | SVG, 48px |
| `heading` | Card Heading | text | Required |
| `body` | Body Text | text | 1–3 sentences |
| `link_text` | Link Label | text | Optional "Learn more" |
| `link_url` | Link URL | link | Optional |

---

### Component 6 — Testimonial Card

Quote-focused atom for standalone use outside compiled testimonial sections.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `quote` | Quote Text | text | Required, max 220 chars |
| `author_name` | Author Name | text | Required |
| `author_title` | Author Title | text | Job title or company |
| `author_photo` | Author Photo | image | Square headshot, 96×96px |
| `star_rating` | Stars | select | `3` / `4` / `5` |
| `platform_logo` | Platform Logo | image | Google/Trustpilot SVG |

---

### Component 7 — Team Member Card

| Property ID | Label | Type | Options |
|---|---|---|---|
| `photo` | Photo | image | Square, 400×400px minimum |
| `name` | Full Name | text | Required |
| `title` | Role | text | Required |
| `bio` | Bio | text | Optional, 2–3 sentences |
| `linkedin_url` | LinkedIn | link | Optional |

---

### Component 8 — Cookie Bar (Site-Global)

Build this before the Header to test the Bricks global template system.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `cookie_text` | Message | text | Required |
| `accept_text` | Accept Label | text | Required |
| `decline_text` | Decline Label | text | Required |
| `policy_link_text` | Policy Link Text | text | "Privacy Policy" |
| `policy_link_url` | Policy Link URL | link | `/privacy-policy/` |
| `position` | Bar Position | select | `bottom` / `top` |

Include the JS cookie logic inline in a Code element inside the Component template.

After saving: Bricks → Settings → Templates → Cookie Notice → select Cookie Bar Component.

---

### Component 9 — Header (Site-Global)

Build after Cookie Bar. Nav links are **NOT** properties — use a Bricks Menu element pointed at a WordPress Custom Menu. The nav CTA button is a property.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `site_logo` | Logo (default) | image | Light version for dark nav |
| `site_logo_scrolled` | Logo (scrolled) | image | Variant for sticky light-bg state |
| `logo_link` | Logo Link | link | Always `/` |
| `nav_cta_text` | Nav CTA Label | text | "Book a Call" / "Get Quote" |
| `nav_cta_link` | Nav CTA URL | link | Required |
| `nav_cta_style` | Nav CTA Style | select | `primary` / `outline` |
| `phone_display` | Phone Text | text | Optional formatted number |
| `phone_link` | Phone Link | link | `tel:+...` |

Build the mobile menu drawer inside the same Header Component template (hamburger + off-canvas panel). Do not build it as a separate Component.

After saving: Bricks → Settings → Templates → Header → select Header Component.

---

### Component 10 — Footer (Site-Global)

Social icon links: do **NOT** use Properties. Add a Bricks Social Icons element inside the template. Change it per client directly in the Component editor — faster than engineering a repeater for 3–5 icons that change once per year.

Footer nav columns: use Bricks Menu elements or hardcode per client.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `site_logo` | Footer Logo | image | Often lighter/smaller variant |
| `logo_link` | Logo Link | link | `/` |
| `tagline` | Brand Tagline | text | Under logo |
| `company_name` | Company Name | text | Copyright line |
| `founded_year` | Founded Year | text | "2019" |
| `address` | Address | text | Optional |
| `phone_display` | Phone Text | text | Optional |
| `phone_link` | Phone Link | link | `tel:+...` |
| `email_display` | Email Text | text | Optional |
| `email_link` | Email Link | link | `mailto:...` |

After saving: Bricks → Settings → Templates → Footer → select Footer Component.

---

### Component 11 — CTA Bar (Site-Global)

Build last. You now know the client's exact offer language. Building it earlier means rebuilding when the brief finalizes. Used in 1–2 positions per page. Editing its copy updates every instance simultaneously.

| Property ID | Label | Type | Options |
|---|---|---|---|
| `headline` | Headline | text | Required |
| `subtext` | Supporting Copy | text | 1 sentence |
| `primary_cta_text` | CTA Label | text | Required |
| `primary_cta_link` | CTA URL | link | Required |
| `secondary_cta_text` | Secondary Label | text | Optional |
| `secondary_cta_link` | Secondary URL | link | Optional |
| `bg_style` | Background | select | `dark` / `primary` / `light` |

**ACSS integration for `bg_style`:** Create three Bricks global classes — `.cta--dark`, `.cta--primary`, `.cta--light` — each setting `--section-bg` to the appropriate ACSS variable. On the outer section container inside the Component, connect `globalClasses` to the `bg_style` Select property.

---

### Component Export (Backup)

After building all 11:

1. Bricks Components panel → Export All
2. Save as `components-[client]-[date].json` in the project folder

This is your recovery file if `wp_options` is corrupted or the site needs cloning.

---

## 4. Phase-by-Phase Workflow

---

### Phase 1: New Site Setup

**Purpose:** Install the full toolchain and lock in the design system before a single section is built. Every subsequent phase depends on ACSS variables being correct.

**Time: 45–90 minutes**

**Tools: ACSS dashboard, bricks-compiler CLI, Bricks settings panels, WP dashboard**

---

#### Step 1.1 — WordPress + Plugin Install (15 min)

1. Install WordPress. Set permalink structure immediately: WP Admin → Settings → Permalinks → `/%postname%/`. Do not change this later.
2. Install Bricks Builder, activate license. Verify Bricks editor opens on a test page.
3. Install ACSS v3, activate. Run the initial setup wizard. Set scheme (`dark` or `light`) to match the client's primary page background.
4. Install Frames (WordPress plugin version). Confirm Frames panel appears in the Bricks editor.
5. Install form plugin (CF7 / Fluent Forms / GHL embed). Confirm a test shortcode renders.

#### Step 1.2 — Import Bricks Starter Files (5 min)

1. Bricks → Settings → upload the **ACSS Bricks Settings JSON** (from the ACSS setup page). This sets default element behaviors: headings use ACSS variables, not pixel values.
2. Bricks → Settings → Theme Styles → upload the **ACSS Bricks Theme JSON**. This wires `<body>`, `<h1>`–`<h6>`, links, and `<p>` to `--root-font-size`, `--content-width`, etc.

**Do not skip these two uploads.** Without them, every heading element defaults to a Bricks pixel value instead of the ACSS fluid scale.

#### Step 1.3 — Configure design-config.yaml (10 min)

```bash
cd /path/to/bricks-compiler
cp design-config.example.yaml design-config.yaml
```

Open `design-config.yaml` and fill in client-specific values. Minimum required fields:

```yaml
colors:
  primary:   "#085a7d"   # Main brand colour — links, focus rings, primary buttons
  secondary: "#8518ce"   # Secondary accent — highlights, secondary CTAs
  accent:    "#28b5f1"   # Decorative highlights, badges
  action:    "#a5de21"   # CTA colour — primary buttons on dark backgrounds
  neutral:   "#080c0e"   # Near-black — body/section backgrounds (dark scheme)
  base:      "#878e92"   # Body text colour
  shade:     "#1c1c1c"   # Cards, overlays (greyscale dark)

typography:
  base_text_desk: 18     # Body text size at max viewport (px)
  base_text_mob:  16     # Body text size at min viewport (px)
  heading_scale:  1.333  # Type scale (1.333=Major Third, 1.25=Major Second)
  heading_weight: 600

spacing:
  base_max: 30           # --space-m maximum (desktop), px
  base_min: 24           # --space-m minimum (mobile), px
  scale: 1.5             # Spacing scale per step
  section_multiplier: 4  # Section padding = space × this value

radius:
  base: "1rem"           # "0" for sharp corners
  scale: 1.5

viewport:
  max: 1280
  min: 360

scheme: dark             # "dark" or "light"
```

#### Step 1.4 — Generate and Import ACSS Settings (5 min)

```bash
node generate-acss-export.js design-config.yaml acss-base-template.json acss-export-client.json
```

Output: `acss-export-client.json`

In WordPress: Automatic CSS → Settings → Import/Export → upload or paste contents of `acss-export-client.json` → Save. ACSS rebuilds its stylesheet.

#### Step 1.5 — Verify Design System in Browser (10 min)

1. Open any page in the Bricks editor. Add a heading element. Confirm its font size shows as a CSS variable reference (`--step-2`, not a pixel value).
2. Add a `var:primary` background utility class to a div. Confirm it renders the correct brand colour.
3. Check `--space-m` in browser DevTools. Confirm it is a fluid `clamp()` value.
4. If any value is wrong: fix `design-config.yaml` → regenerate → reimport → re-verify. **Do not proceed to Phase 2 with incorrect variables.**

**Phase 1 gate:** ACSS variables verified in browser DevTools. All colours, type scale, and spacing match the design brief. Bricks headings use ACSS variables, not pixel values.

---

### Phase 2: Global Atom Component Build

**Purpose:** Build all 11 native Bricks Components in dependency order. Built once per site; never touched by the compiler.

**Time: 3–5 hours for all 11 components**

**Tools: Bricks editor only**

---

#### Step 2.1 — Create a Component Library Test Page (5 min)

1. WP Admin → Pages → Add New → title "Component Library — DO NOT PUBLISH". Set status to Draft.
2. Open in Bricks editor. This is your visual test surface for all 11 components.

#### Step 2.2 — Build Atoms 1–7 (2–3 hours)

For each atom, following the process described in Section 3. Verify on the test page at 360px and 1280px before moving to the next.

**Verification checklist per atom:**
- [ ] Properties panel visible on right side when Component is selected
- [ ] Changing a property value updates the canvas in real time
- [ ] Mobile layout correct at 360px
- [ ] ACSS utility classes used throughout (zero hardcoded pixel values)

#### Step 2.3 — Build Cookie Bar and Assign Global Template (15 min)

1. Build as above. Include JS cookie logic in a Code element.
2. After saving: Bricks → Settings → Templates → Cookie Notice → select Cookie Bar.
3. Open a blank test page. Verify the Cookie Bar appears and dismiss works.

#### Step 2.4 — Build Header (45–60 min)

1. Layout: logo, Bricks Menu element (pointing at WP Custom Menu), nav CTA button, optional phone.
2. Add mobile hamburger + off-canvas drawer inside the same Component template.
3. Test at 360px, 768px, 1280px.
4. After saving: Bricks → Settings → Templates → Header → select Header Component.

#### Step 2.5 — Build Footer (30 min)

1. Layout: logo column, tagline, 2–3 nav column groups (Bricks Menu elements), contact column, Social Icons element.
2. Wire Properties.
3. After saving: Bricks → Settings → Templates → Footer → select Footer Component.

#### Step 2.6 — Build CTA Bar Last (20 min)

Build only after offer copy is finalized. Follow the ACSS global class integration steps in Section 3.

**Phase 2 gate:** All 11 Components saved and verified. Header and Footer appear correctly on a blank test page (check WP Admin → Settings → Templates confirms assignments). Component Library test page shows all atoms rendering correctly.

---

### Phase 3: Page Layout Generation (bricks-compiler)

**Purpose:** For each page in scope, write a page spec JSON and run the compiler to produce clipboard-ready output for every section.

**Time: 30–90 min per page** (writing the spec is the majority of the time — compiling takes seconds)

**Tools: bricks-compiler CLI, text editor**

---

#### Page Spec Format

The page spec references compiler section templates (manifests) — **not** native Bricks Components.

```json
{
  "page_title": "Homepage",
  "slug": "/",
  "source_url": "https://client-domain.com",

  "_notes": [
    "Hero secondary CTA must be set manually — not slot-fillable.",
    "Hero slider images (6) replace manually in Bricks after pasting.",
    "Social proof star rating: set data-rating attribute manually in Bricks Attributes panel."
  ],

  "sections": [
    {
      "component": "hero-section-barcelona",
      "_notes": [
        "Secondary CTA button: set link and label manually in Bricks.",
        "6 slider images: replace each manually after pasting."
      ],
      "slots": {
        "accent_heading": "Short proof chip",
        "heading": "Main value proposition headline",
        "lede": "Supporting paragraph, 1–2 sentences.",
        "primary_cta_text": "Get Started",
        "primary_cta_link": { "url": "/contact/" }
      }
    },
    {
      "component": "social-proof-alpha",
      "_notes": [
        "star rating: select 'Rating Alpha' element → Bricks Attributes → data-rating='4.9'",
        "badge_logo: upload platform SVG to Media Library first, then update this slot."
      ],
      "slots": {
        "badge_text": "Reviewed on",
        "badge_reviews": "4.9 · 200+ reviews",
        "stats": [
          { "value": "10 Years",  "description": "In business" },
          { "value": "98%",       "description": "Client satisfaction" },
          { "value": "500+",      "description": "Projects delivered" }
        ]
      }
    },
    {
      "component": "feature-section-foxtrot",
      "slots": {
        "heading": "How it works",
        "accent_heading": "Simple Process",
        "lede": "Three steps to get started.",
        "features": [
          { "heading": "Step 1 — Discovery", "text": "We review your goals and current situation." },
          { "heading": "Step 2 — Strategy",  "text": "We build a plan tailored to your market." },
          { "heading": "Step 3 — Execution", "text": "We implement, measure, and optimise." }
        ],
        "primary_cta_text": "Get Started",
        "primary_cta_link": { "url": "/contact/" }
      }
    }
  ]
}
```

**Key rule:** The `"component"` key refers to the manifest filename stem in `manifests/` — not a native Bricks Component. Native Components are placed manually in Phase 4.

Use `_notes` on section entries to flag where a Component should be placed manually relative to that section. The compiler ignores unknown keys silently.

#### Step 3.1 — Choose Section Templates (10–20 min)

Review `bricks-compiler/manifests/` for the right template per section. The manifest's `description` field explains the layout and slot constraints. Check `min`/`max` on array slots before writing the spec.

#### Step 3.2 — Write the Page Spec (20–60 min)

Name it `pages/[slug].json` inside the project folder. Keep file-based source of truth in git.

#### Step 3.3 — Validate and Compile (2 min)

```bash
cd /path/to/bricks-compiler
node cli.js ../project/pages/homepage.json --clipboard
```

The compiler:
- Validates all required slots are present
- Expands array slots (clones subtrees per item)
- Fills scalar slots via `target_class` / `target_label` / `target_id`
- Regenerates all element IDs (fresh UUIDs — no collisions when pasting multiple sections)
- Copies the result to the macOS clipboard

Read the console for `[WARN]` messages. A warning about a missing target class means a slot value was silently dropped. Fix the manifest or slot value before pasting.

#### Step 3.4 — Compile All Pages

```bash
# Each page compiled to a file (keep for recompile if copy changes before launch)
node cli.js pages/homepage.json     homepage-clipboard.json
node cli.js pages/services.json     services-clipboard.json
node cli.js pages/contact.json      contact-clipboard.json
node cli.js pages/about.json        about-clipboard.json
```

**Phase 3 gate:** All page specs compile without errors. No required slot warnings in output. Output clipboard JSON files saved for each page.

---

### Phase 4: Content Fill and Refinement (Bricks Editor)

**Purpose:** Paste compiled sections into Bricks, place Component instances, and handle everything the compiler cannot fill.

**Time: 1–3 hours per page**

**Tools: Bricks editor primarily**

---

#### Step 4.1 — Create the WordPress Page

WP Admin → Pages → Add New. Set slug, title, page template (if using a page-specific template). Open in Bricks editor.

#### Step 4.2 — Clear Default Content

If Bricks adds a default container, delete it. Start with an empty canvas.

#### Step 4.3 — Paste the Compiled Output

Re-run compile with `--clipboard` immediately before pasting (clipboard does not persist across reboots):

```bash
node cli.js pages/homepage.json --clipboard
```

In the Bricks editor canvas: **Cmd+V**. All sections appear in one paste operation.

#### Step 4.4 — Verify Slot Fill

Scan each section visually:
- [ ] All headings contain correct copy (no template placeholder text)
- [ ] Array item count matches the spec (count features, testimonials, FAQ items)
- [ ] Links are set (hover over CTAs, verify URL in browser bar)

#### Step 4.5 — Fix Manual-Only Items

| Item | Why manual | How to fix |
|---|---|---|
| Hero slider images | All 6 share the same CSS class — cannot individually target | Select each slide image element → upload client image |
| Secondary CTA button | Shares parent container class with primary button | Select the button → set link URL + label in Bricks panel |
| Star rating `data-rating` | Stored as HTML attribute, not Bricks settings field | Select the rating element → Bricks Attributes panel → `data-rating="4.9"` |
| Platform badge logo (`badge_logo`) | Requires a URL that exists on the target server | Upload SVG to WP Media Library first, then update slot and recompile — OR set image manually in Bricks |
| Yearly price tier | Second price field in same card as monthly — ambiguous target | Select the price element directly → type value |
| Feature list inside pricing cards | Nested array — compiler does not fill nested arrays | Select each `<li>` → type content directly |
| Form shortcode | Live WP shortcode render — cannot be in static JSON | Add a Shortcode element → paste `[your_form_shortcode]` |
| Video background | `<video>` source, poster, autoplay attributes | Set in Bricks HTML element attributes panel |
| Map embed | Google Maps iframe URL | Paste embed URL into the map element |
| JS code block activation | Code elements must be manually activated in Bricks | Select Code element → check "Execute code" |

#### Step 4.6 — Place Component Instances

After pasting compiled sections, drag native Bricks Components from the Components panel into position:

- **CTA Bar:** drag below the hero section and above the footer-adjacent section
- **Additional Stat Blocks:** drag into custom layout areas not covered by compiler sections
- **Newsletter Signup:** if in scope, drag into position

Set each Component's Properties in the right-side Property panel.

#### Step 4.7 — Set SEO Fields

Open SEOpress (or Yoast) panel. Set:
- Meta title
- Meta description
- OG image (upload client hero image)

Do not leave these blank. The compiler does not set SEO fields.

**Phase 4 gate:** Every page opens in Bricks without broken elements. All sections display correct copy. All links resolve correctly. No placeholder images remain. SEO fields set on every page. Mobile view checked at 360px and 768px.

---

### Phase 5: Deploy and Handoff

**Purpose:** Performance verification, DNS cutover, and delivery of client-editable Component documentation.

**Time: 2–4 hours**

**Tools: Browser DevTools, Lighthouse, WP-CLI (SSH), browser**

---

#### Step 5.1 — Performance Audit (30 min)

Run Lighthouse on the homepage and one interior page. Targets: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 90.

Common Bricks/Frames LCP issues and fixes:

| Issue | Fix |
|---|---|
| Hero image not preloaded | Add `fetchpriority="high"` to the hero image element via Bricks Attributes panel |
| LCP shifts on scroll | Check sticky header height is not causing layout shift |
| Bricks generating render-blocking CSS | ACSS → Settings → Output Method → External (non-render-blocking) |

After all pages are final:

```bash
# Via WP-CLI (SSH)
wp bricks regenerate_assets --allow-root
```

This regenerates per-page external CSS files with clean IDs.

#### Step 5.2 — Mobile QA Pass (45 min)

Test every page at 360px, 480px, 768px. Specifically check:
- [ ] Header nav collapses and hamburger open/close works
- [ ] Hero image crop is correct in portrait orientation
- [ ] CTA button tap target minimum 48×48px
- [ ] Forms are usable on touch
- [ ] Cookie Bar appears and dismisses

#### Step 5.3 — WP Hardening (15 min)

1. Add to `wp-config.php`:
   ```php
   define('DISALLOW_FILE_EDIT', true);
   ```
2. Remove unused themes. Set Bricks as active theme.
3. Bricks → Settings → Builder Access → confirm correct user role is locked in.

#### Step 5.4 — DNS and SSL (30 min)

1. Point DNS to production server.
2. Verify SSL certificate is active on the production domain.
3. If migrating from staging URL:
   ```bash
   wp search-replace 'https://staging.client.com' 'https://client.com' --allow-root
   ```

#### Step 5.5 — Export and Archive (15 min)

```bash
# 1. Export Bricks Components (Bricks UI)
# Components panel → Export All
# Save as: deliverables/components-[client]-[date].json

# 2. Export ACSS settings (ACSS UI)
# ACSS → Import/Export → copy textarea
# Save as: deliverables/acss-settings-[client]-[date].txt
```

Commit to git:
```bash
git add pages/homepage.json pages/services.json pages/contact.json design-config.yaml
git commit -m "chore: add page specs and design config for [client]"
```

These files are the source of truth for reconstructing any page.

#### Step 5.6 — Client Handoff Documentation (30 min)

Deliver a "How to edit your site" document covering:

- **Edit text inside a section:** Bricks editor → click the text element → type directly
- **Edit Component Properties** (logo, phone number, nav CTA): Bricks editor → Components panel → click the Component on canvas → Properties panel on right
- **Add a new FAQ item:** Bricks editor → find the FAQ section → duplicate the last Q+A row → update question and answer text
- **Do not add new sections without talking to your agency** — the compiler page specs will be out of sync

**Phase 5 gate:** Lighthouse ≥ 90 on homepage. DNS resolved on production domain. SSL active. Components and ACSS settings archived. Page spec JSON files committed to project git repo.

---

## 5. bricks-compiler Reference

### Core Commands

| Command | What it does |
|---|---|
| `node cli.js spec.json` | Compile page spec, print clipboard JSON to stdout |
| `node cli.js spec.json out.json` | Compile to file |
| `node cli.js spec.json --clipboard` | Compile and copy to macOS clipboard (Cmd+V in Bricks) |
| `node generate-acss-export.js design-config.yaml acss-base-template.json out.json` | Generate ACSS import file from design config |
| `node wp-import.js spec.json` | Generate WXR + PHP eval-file for batch WP import |
| `node wp-import.js --scan ./html-folder` | Scan a folder of HTML files and generate bulk WP import |

### CLI Output Fields

After compile, the result object contains:

| Field | Use |
|---|---|
| `result.clipboard` | Paste directly into Bricks editor — the full clipboard JSON |
| `result.bricks_content` | Write to `_bricks_page_content_2` postmeta |
| `result.bricks_global_classes` | Merge into `bricks_global_classes` WP option |
| `result.page_title` | Page title from spec |
| `result.slug` | URL slug from spec |

### Manifest Anatomy

Every manifest has these fields. All are required unless noted:

```yaml
component: section-name        # Must match template filename stem
version: "2.3.5"               # Bricks version the template was exported from
description: |                 # Human-readable description (check before using)
  What this section looks like. Array constraints. Manual-only items.

slots:
  slot_name:
    type: string|html|link|media|icon|array|compound_array
    required: true|false
    max_length: 80             # string types only
    min: 1                     # array types only
    max: 6                     # array types only
    target_class: fr-class-name   # preferred targeting method
    target_label: "Element Label" # fallback targeting
    target_id: "abc123"           # use when class/label are ambiguous
    description: "What this slot fills"
    item_slots:                # array types only — nested slot definitions
      key:
        type: string
        target_class: ...

strip_elements:
  - name: fr-notes             # Remove by Bricks element name
  - label: "Headline Line Styles"  # Remove by Bricks element label
```

### Targeting Resolution Order

The compiler resolves slot targets using this priority:

1. `target_id` — most specific, use when multiple elements share class/label
2. `target_class` — preferred for most slots; resolves via `globalClasses` ID lookup
3. `target_label` — fallback when no class is available

### Array Slots

Array slots clone template subtrees — one clone per item in your spec. Constraints:

- `min` / `max` are validated. Under-minimum raises an error. Over-maximum silently truncates.
- Nested arrays (`item_slots` containing another array) are **not supported** — fill nested items manually in Bricks after pasting.
- Items cloned from template include all element settings from the original — only the filled slots are overwritten.

### WP-CLI Batch Import (Method B)

For pushing multiple pre-approved pages to staging or production without opening Bricks editor:

```bash
# Generate WXR (WordPress XML import)
node wp-import.js --scan ./deliverables/content/wordpress-html \
  --name clientname \
  --site https://client.com \
  --type page \
  --status draft

# Import output files
# Option A: WP Admin → Tools → Import → WordPress → upload wp-import-[name].xml
# Option B (SSH):
wp eval-file wp-import-clientname.php --allow-root
```

The PHP eval-file is idempotent — skips posts whose `post_name` already exists. Sets SEOpress meta (title, description, canonical, focus keyword) from the spec.

### Slot Types and Settings Field Mapping

| Slot type | Settings field written | Notes |
|---|---|---|
| `string` | `settings.text` | Heading, text elements |
| `html` | `settings.text` | Rich text elements (content, accordion answer) |
| `link` | `settings.link` | Button, anchor elements |
| `media` | `settings.image` | Image elements |
| `icon` | `settings.icon` | Icon elements |
| `insert` | `settings.text` (raw HTML) | Shortcodes, embeds — use sparingly |

---

## 6. ACSS design-config Quickstart

For each new client, edit `design-config.yaml`. Required decisions in the order that matters:

### Step 1 — Define Scheme

```yaml
scheme: dark   # "dark" = dark backgrounds, light text (default)
               # "light" = light backgrounds, dark text
```

Most service business sites: `dark`. ACSS uses this to set default text/background assumptions.

### Step 2 — Define the 7 Colours

ACSS generates the full scale (ultra-dark → ultra-light) from each hex automatically. Provide the client's exact brand colours:

```yaml
colors:
  primary:   "#085a7d"   # Main brand — links, focus rings, primary nav CTA
  secondary: "#8518ce"   # Secondary — highlights, secondary CTAs, badges
  accent:    "#28b5f1"   # Decorative — icon fills, chip backgrounds
  action:    "#a5de21"   # CTA colour — MUST pass contrast on dark backgrounds
  neutral:   "#080c0e"   # Near-black — section backgrounds (dark scheme)
  base:      "#878e92"   # Body text colour
  shade:     "#1c1c1c"   # Cards, overlays (pure greyscale dark)
```

**Contrast check:** `action` colour is used for CTA buttons on dark sections. It must pass 4.5:1 contrast ratio against the section background. Use browser DevTools accessibility checker.

### Step 3 — Set Typography Scale

```yaml
typography:
  base_text_desk: 18     # Increase to 20 for text-heavy service sites
  base_text_mob:  16     # Usually 2px smaller than desk
  heading_scale:  1.333  # 1.25 = gentler scale (many heading levels), 1.414 = bold contrast
  heading_weight: 600    # 700 for bolder brand
  heading_transform: none        # "uppercase" for industrial/editorial brands
  heading_letter_spacing: "0em"  # "0.1em" pairs with uppercase headings
```

### Step 4 — Set Spacing

```yaml
spacing:
  base_max: 30           # Increase to 36–40 for spacious premium sites
  base_min: 24           # Increase to 28 for sites with large base text
  scale: 1.5             # Do not change — affects all derived spacing steps
  section_multiplier: 4  # Increase to 5–6 for very airy layouts
```

### Step 5 — Set Border Radius

```yaml
radius:
  base: "1rem"           # "0" = sharp corners (tech, industrial brands)
                         # "1.5rem" = rounder (consumer, wellness brands)
```

### Step 6 — Regenerate and Import

```bash
node generate-acss-export.js design-config.yaml acss-base-template.json acss-export-new-client.json
```

Import in WordPress: ACSS → Settings → Import/Export → Upload JSON.

### Common Mistakes

| Mistake | Result | Fix |
|---|---|---|
| Importing before Bricks settings JSON is uploaded | Headings revert to pixel values | Upload Bricks settings JSON first, then reimport ACSS |
| Using a low-contrast `action` colour | CTA buttons fail WCAG AA | Test contrast in DevTools, pick a higher-lightness action colour |
| Setting scheme before choosing background colours | Wrong ACSS assumptions throughout | Decide dark vs light first, then pick colours |
| Changing `spacing.scale` | All derived spacing steps break | Leave at 1.5 unless you are rebuilding from scratch |

---

## 7. Time Budget

### Per Component (Phase 2)

| Component | Time |
|---|---|
| Button Primary | 15 min |
| Badge / Tag | 10 min |
| Icon + Text Row | 10 min |
| Stat Block | 10 min |
| Card | 20 min |
| Testimonial Card | 20 min |
| Team Member Card | 15 min |
| Cookie Bar | 15 min |
| Header | 50 min |
| Footer | 30 min |
| CTA Bar | 20 min |
| **Total Phase 2** | **~3.5 hours** |

### Per Page (Phases 3–4)

| Page Complexity | Spec Writing | Compile | Content Fill | Total |
|---|---|---|---|---|
| Simple (3–4 sections, no FAQ/pricing) | 25 min | 2 min | 45 min | ~75 min |
| Standard (5–7 sections) | 45 min | 3 min | 90 min | ~2.5 hours |
| Complex (8+ sections, pricing, testimonials) | 70 min | 5 min | 120 min | ~3.5 hours |

### Full 5-Page Site

| Phase | Time |
|---|---|
| Phase 1: Setup + design system | 60–90 min |
| Phase 2: All 11 components | 3–4 hours |
| Phase 3: Write + compile 5 page specs | 4–6 hours |
| Phase 4: Content fill (5 pages × ~2h avg) | 8–12 hours |
| Phase 5: Deploy + QA + handoff | 3–4 hours |
| **Total** | **18–26 hours** |

Experienced build (second site with same component kit): Phase 2 drops to 1 hour (no rebuilding — export/import the Component JSON from the previous site and update brand values).

---

## 8. Cheat Sheet

### Design System

```bash
# Generate ACSS import from client design config
node generate-acss-export.js design-config.yaml acss-base-template.json acss-export-client.json

# Verify which design-config is active
head -5 design-config.yaml
```

### Compiler

```bash
# Compile page spec to macOS clipboard (then Cmd+V in Bricks)
node cli.js pages/homepage.json --clipboard

# Compile to file (keep for reuse)
node cli.js pages/homepage.json homepage-clipboard.json

# Compile to stdout (inspect the JSON)
node cli.js pages/homepage.json | jq '.content | length'

# Compile all pages at once
for f in pages/*.json; do
  out="${f/pages\//}"; out="${out/.json/-clipboard.json}"
  node cli.js "$f" "$out" && echo "OK: $f"
done
```

### WP Import

```bash
# Batch import HTML files from a deliverables folder
node wp-import.js --scan ./deliverables/content/wordpress-html \
  --name clientname --site https://client.com --type page --status draft

# Via WP-CLI (SSH) — idempotent, skips existing posts
wp eval-file wp-import-clientname.php --allow-root

# Regenerate Bricks CSS files after all pages are published
wp bricks regenerate_assets --allow-root
```

### Bricks Editor

```
Paste compiled output:         Cmd+V in canvas
Duplicate an element:          right-click → Duplicate
Add Component to canvas:       Components panel → drag onto canvas
Set element attribute:         select element → Attributes tab (right panel)
Check element CSS classes:     select element → Style tab → Classes field
Find element by label:         Cmd+F in Bricks editor (element search)
```

### Per-Page Checklist

```
[ ] Page spec compiled without errors or WARN messages
[ ] All headings: correct copy (no template placeholder text)
[ ] All array items: count matches spec (features, FAQs, testimonials)
[ ] All CTA links: set and resolving (hover → verify URL)
[ ] Hero slider images: replaced with client assets
[ ] Secondary CTA button: link and label set manually
[ ] Star rating data-rating attribute: set in Bricks Attributes panel
[ ] Form shortcode: Shortcode element added with correct [shortcode]
[ ] CTA Bar Component: placed after hero and before footer section
[ ] SEO fields: meta title, description, and OG image set
[ ] Mobile check: 360px layout correct
[ ] Page published or set to intended status
```

### Manifest Quick Lookup

When choosing a section for a page spec entry, use this table:

| You need | Use |
|---|---|
| Split hero, animated image columns, dark bg | `hero-section-barcelona` |
| Centered hero, light/dark, single image | `hero-section-cali` |
| Minimal hero, large heading only | `hero-section-north` |
| Hero with video background | `hero-section-papa` |
| Hero with form or quiz embed | `hero-section-quebec` |
| Hero with offset image, 2-column | `hero-section-victor` |
| Review badge + stat bar | `social-proof-alpha` (sub-component, paste inside a section) |
| 2-col social proof + logos | `social-proof-section-lima` |
| Icon feature grid (2–6 cards) | `feature-section-foxtrot` |
| Feature cards + large image | `feature-section-boston` |
| Feature steps (numbered) | `feature-section-iceland` |
| 2-col feature layout | `feature-section-victor` |
| Rich text content block | `content-section-golf` |
| Content + image (2-col) | `content-section-alpha` |
| Content + stats below | `content-section-yankee` |
| Testimonials, auto-scrolling slider + logos | `testimonial-section-juliet` |
| Testimonial grid | `testimonial-grid-india` |
| Pricing + monthly/yearly toggle | `pricing-section-charlie` |
| Simple pricing (no toggle) | `pricing-section-echo` |
| Comparison pricing table | `pricing-section-kilo` |
| FAQ accordion, sticky sidebar | `faq-section-alpha` |
| FAQ card layout | `faq-card-bravo` |
| FAQ grid | `faq-grid-bravo` |
| Logo grid with heading | `logo-section-charlie` |
| CTA with image mosaic grid | `cta-section-indigo` |
| CTA, dark bg, centered | `cta-section-sierra` |
| CTA, split 2-col | `cta-section-tango` |
| Contact form section | `contact-section-alpha` |
| Contact with address/map | `contact-section-echo` |
| Image/hero carousel | `slider-section-basel` |

### Compiler Cannot Fill — Quick Reference

```
Hero slider images              → replace each manually (6 images, shared class)
Secondary CTA button            → set link + label directly in Bricks
Star rating (data-rating)       → Bricks Attributes panel on rating element
Platform badge logo (badge_logo)→ upload SVG to WP Media first
Yearly pricing tier             → select price element directly, type value
Pricing card feature list items → nested array — type each <li> directly
Form shortcode                  → add Shortcode element, paste [shortcode]
Video background                → HTML element attributes panel
Map embed iframe                → paste Google Maps embed URL
Nav menu links                  → WP Appearance → Menus
Social icons in footer          → edit in Footer Component template directly
Logo strip (shared class)       → testimonial-section-juliet logos, replace manually
JS code block activation        → select Code element → check "Execute code"
```
