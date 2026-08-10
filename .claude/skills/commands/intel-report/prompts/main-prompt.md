# Generate Comprehensive Intelligence Report Suite

**Command**: `/intel-report [client-name or project-uuid]`

---

## YOUR TASK

Generate a complete intelligence report suite for the specified client following the **EXACT** canonical structure. The number of pages is **DYNAMIC** based on client data (typically 5-12 pages depending on ICP segment count).

## CRITICAL REQUIREMENTS

### 1. Read Template First
**MANDATORY**: Before generating ANY content, read the canonical template:
```
/Users/krisbal/CLAUDEtools/ORCHESTRAI/orchestrai-domains/client-intelligence/CLIENT-INTELLIGENCE-REPORT-TEMPLATE.md
```

### 2. Load & Validate Client Data

**Step 1: Load all data files**
```
/projects/[client-uuid]/client-intelligence/integrated-client-context.json
/projects/[client-uuid]/deliverables/seo/keyword-research-VALIDATED.json
/projects/[client-uuid]/deliverables/seo/strategic-coherence-scorecard.json
/projects/[client-uuid]/deliverables/seo/semantic-cluster-analysis.json
```

**Step 2: VALIDATE REQUIRED DATA** (Check before proceeding):

```javascript
// Parse loaded data
const clientData = JSON.parse(integratedContext);
const seoData = JSON.parse(keywordResearch);

// Validation checks
const validation = {
  clientName: !!clientData.clientName,
  personas: Array.isArray(clientData.personas) && clientData.personas.length > 0,
  businessOverview: !!clientData.business?.overview || !!clientData.businessContext,
  seoKeywords: !!seoData.keywords && seoData.keywords.length > 0,
  minPersonas: clientData.personas?.length >= 1,
  maxPersonas: clientData.personas?.length <= 10,
  personaStructure: clientData.personas?.every(p => p.name && p.segment)
};

// STOP if critical data missing
if (!validation.clientName) {
  throw new Error("❌ CRITICAL: Missing client name in integrated-client-context.json");
}

if (!validation.personas) {
  throw new Error("❌ CRITICAL: No ICP personas found. Need at least 1 persona with name and segment.");
}

if (!validation.minPersonas) {
  throw new Error("❌ CRITICAL: At least 1 ICP segment required for report generation");
}

if (!validation.personaStructure) {
  throw new Error("❌ CRITICAL: Each persona must have 'name' and 'segment' fields");
}

// Success - log what we found
const personaCount = clientData.personas.length;
console.log(`✅ Validation passed: ${personaCount} ICP segment${personaCount > 1 ? 's' : ''} found`);
console.log(`📊 Generating ${5 + personaCount} total pages`);
clientData.personas.forEach((p, i) => {
  console.log(`   ${i + 1}. ${p.name} (${p.segment || 'Unknown segment'})`);
});
```

**Step 3: Sanitize persona names for filenames**
```javascript
function sanitizePersonaName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Max 50 chars
}

// Generate filenames
const icpPages = clientData.personas.map(persona => ({
  name: persona.name,
  filename: `icp-${sanitizePersonaName(persona.name)}-2025.html`,
  segment: persona.segment
}));
```

### 3. Generate Dynamic Page Structure

#### Main Hub Page
**Filename**: `intelligence-report-2025.html`

**Content**:
- Executive dashboard with 4 key metrics
- **Dynamic ICP summary cards** (automatically generates N cards based on persona count)
- Dynamic grid layout:
  - 1 persona: `grid-cols-1`
  - 2 personas: `grid-cols-1 md:grid-cols-2`
  - 3+ personas: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- SEO intelligence preview
- Competitive landscape overview
- Strategic priorities timeline
- Cross-links to ALL detail pages (both ICP and fixed pages)

#### ICP Detail Pages (DYNAMIC COUNT)
**Generate ONE page per persona**

**Filenames**: `icp-{sanitized-persona-name}-2025.html`

**Real Examples**:
- 1 persona client: `icp-enterprise-customers-2025.html`
- 3 persona client (Score or Not):
  - `icp-basketball-clubs-b2b-2025.html`
  - `icp-sports-fans-b2c-2025.html`
  - `icp-content-creators-b2c-2025.html`
- 5 persona client (QuartzIQ):
  - `icp-data-analysts-2025.html`
  - `icp-business-intelligence-teams-2025.html`
  - `icp-product-managers-2025.html`
  - `icp-executive-decision-makers-2025.html`
  - `icp-data-engineers-2025.html`

**Content per ICP page**:
- Complete psychographic profile
- Demographics (age, income, location, occupation)
- Pain points (5-7 items)
- Motivations (5-7 items)
- Goals (3-5 items)
- Fears/Objections (3-5 items)
- Unit economics (LTV, CAC, Payback, Churn)
- Acquisition channels (ranked by effectiveness)
- Customer journey map
- Communication preferences
- Trust factors

#### Fixed Pages (ALWAYS GENERATED)
1. **`psychographic-research-extensive-2025.html`**
   - Behavioral research (2000+ lines)
   - Cultural values analysis
   - Emotional triggers
   - Decision-making patterns
   - Chart.js visualizations (with maintainAspectRatio: true)

2. **`eos-framework-2025.html`**
   - Strategic execution plan
   - Core values
   - 10-year target
   - 3-year picture
   - 1-year goals
   - Quarterly rocks

3. **`competitive-intelligence-2025.html`**
   - Market landscape analysis
   - Competitor profiles (3-5 competitors)
   - SWOT analysis
   - Positioning recommendations
   - Competitive advantages

4. **`seo-strategy-comprehensive-2025.html`**
   - Complete SEO strategy
   - All keywords (not just top 10)
   - Semantic clusters
   - Content pillar strategy
   - Implementation roadmap

**Total Pages**: **5 + N** (where N = number of ICP personas)

### 4. Navigation Links (CRITICAL - MUST BE DYNAMIC)

**Main Hub → ICP Pages** (dynamically generate):
```javascript
// WRONG ❌ - Hardcoded
<a href="icp-basketball-clubs-b2b-2025.html">Basketball Clubs</a>
<a href="icp-sports-fans-b2c-2025.html">Sports Fans</a>

// CORRECT ✅ - Dynamic
${clientData.personas.map(persona => `
  <a href="icp-${sanitizePersonaName(persona.name)}-2025.html">
    ${persona.name}
  </a>
`).join('')}
```

**Main Hub → Fixed Pages**:
```html
<a href="psychographic-research-extensive-2025.html">Psychographic Research</a>
<a href="eos-framework-2025.html">EOS Framework</a>
<a href="competitive-intelligence-2025.html">Competitive Intelligence</a>
<a href="seo-strategy-comprehensive-2025.html">SEO Strategy</a>
```

**Back-to-Hub Links** (all detail pages):
```html
<a href="intelligence-report-2025.html" class="btn btn-secondary">
  ← Back to Intelligence Hub
</a>
```

### 5. Design System (NON-NEGOTIABLE)

**Colors**:
- Primary: `#667eea` (solid purple — hero backgrounds, metric cards, progress bars, chart fills)
- Primary dark: `#764ba2` (solid — hover states, secondary accents)
- Page background: `#f8f9ff`
- Cards: `#ffffff` with box shadows
- Text: `#1a202c` primary, `#718096` muted
- ❌ NO gradients of any kind — `linear-gradient`, `radial-gradient`, Tailwind gradient utilities — ALL FORBIDDEN

**Typography**:
- Font: Inter (Google Fonts, weights 300-800)
- Hero title: 4rem, weight 800
- Section headers: 2.5rem, weight 700
- Body: 1rem, weight 400

**Icons & Emoji**:
- ❌ NO emoji anywhere in the report — not in heroes, not as section decorators, not in cards
- ❌ NO icon fonts (Font Awesome, etc.)
- ❌ NO decorative SVG icons cluttering headers
- ✅ ICP avatar circles use the FIRST LETTER of the persona name (e.g. "C" for Carlos)
- ✅ Text and data hierarchy replaces icon decoration

**Layout**:
- Max width: 1400px
- Section padding: 80px vertical, 40px horizontal
- Card radius: 16-24px
- Responsive breakpoints: 768px, 1024px, 1440px

**CDN Dependencies**:
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### 6. Chart.js Configuration (CRITICAL)

**ALWAYS USE THIS CONFIGURATION** to prevent height inflation bug:
```javascript
options: {
  responsive: true,
  maintainAspectRatio: true,  // ← MUST BE TRUE!
  plugins: {
    legend: { position: 'bottom' }
  },
  scales: {
    y: { beginAtZero: true }
  }
}
```

**NEVER USE**:
```javascript
maintainAspectRatio: false  // ← CAUSES INFINITE HEIGHT BUG!
```

### 7. Dynamic Grid Layouts

**Main Hub - ICP Summary Cards**:
```javascript
// Determine grid class based on persona count
const getGridClass = (count) => {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
};

// Use in template
<div class="grid ${getGridClass(personaCount)} gap-8 mb-12">
  ${clientData.personas.map(persona => `
    <!-- ICP card -->
  `).join('')}
</div>
```

### 8. File Locations

**STANDARD: All pages in same folder for easy server deployment**

**Save all pages to**:
```
/projects/[client-uuid]/deliverables/client-intelligence/
├── intelligence-report-2025.html (main hub)
├── icp-{persona-1-name}-2025.html
├── icp-{persona-2-name}-2025.html
├── icp-{persona-N-name}-2025.html
├── psychographic-research-extensive-2025.html
├── eos-framework-2025.html
├── competitive-intelligence-2025.html
└── seo-strategy-comprehensive-2025.html (same folder, not /seo/)
```

✅ **Deployment**: Copy the entire `/client-intelligence/` folder to any server - all relative links work immediately!

✅ **No separate /seo/ directory**: All intelligence pages stay together for portability

### 9. Quality Checklist

Before delivering, verify:
- ✅ All N + 5 pages generated and saved (where N = persona count)
- ✅ Validation passed (logged persona count and names)
- ✅ Solid `#667eea` purple used throughout — run: `grep -c "linear-gradient\|radial-gradient" *.html` → must return 0
- ✅ No emoji anywhere — run: `grep -c "🏄\|🎨\|👑\|📊\|✅\|💡\|🌊" *.html` → must return 0
- ✅ ICP avatar circles show persona initial letter, not emoji
- ✅ Section headers are plain text — no icon or emoji prefix
- ✅ Inter font loads correctly
- ✅ All navigation links use correct dynamic paths
- ✅ Grid layout adapts to actual persona count
- ✅ Chart.js uses `maintainAspectRatio: true`
- ✅ No console errors in browser
- ✅ Responsive at 768px, 1024px, 1440px
- ✅ Print CSS works (Command+P preview)
- ✅ File sizes reasonable (<200KB per page except psychographic)
- ✅ Cross-links work bidirectionally
- ✅ No hardcoded "3 segments" or example persona names

---

## EXECUTION STEPS

1. **Identify Project**:
   - If given client name: Search for existing project UUID
   - If given UUID: Use directly
   - Verify project exists in `/projects/` directory

2. **Load & Validate Data**:
   - Read all 4 JSON data files
   - Run validation checks (see section 2)
   - Count personas and log findings
   - Generate sanitized filenames

3. **Read Template**:
   - Read `CLIENT-INTELLIGENCE-REPORT-TEMPLATE.md` completely
   - Note exact section structure and design values

4. **Generate Pages** (in order):
   - Start with main hub (uses summary data + dynamic navigation)
   - Generate N ICP detail pages (loop through personas)
   - Generate 4 fixed pages (psychographic, EOS, competitive, SEO)
   - Ensure consistent data across all pages

5. **Verify Navigation**:
   - Check all links in main hub (dynamic ICP links + fixed page links)
   - Check back-to-hub links in all detail pages
   - Check cross-links work

6. **Test Responsive Grid**:
   - Open main hub and verify ICP cards display correctly
   - Check grid adapts: 1 col → 2 col → 3 col at breakpoints

7. **Test Charts** (if applicable):
   - Open psychographic page
   - Verify charts render correctly
   - Confirm canvas height stays stable (not growing)

8. **Open Main Hub**:
   - Open `intelligence-report-2025.html` in browser
   - Provide file path to user
   - Log total page count

---

## EXAMPLE USAGE

### Example 1: Client with 1 persona
```bash
/intel-report rapidcoldplunge
```

**Expected Output**:
```
✅ Validation passed: 1 ICP segment found
📊 Generating 6 total pages
   1. Health-Conscious Athletes (B2C)

✅ Generated 6-page intelligence report suite
✅ Main hub: /projects/rapidcoldplunge-[uuid]/deliverables/client-intelligence/intelligence-report-2025.html
✅ ICP pages (1): icp-health-conscious-athletes-2025.html
✅ Fixed pages (4): psychographic, EOS, competitive, SEO
✅ All navigation links verified
✅ Grid layout: 1 column (single persona)
✅ Ready to review!
```

### Example 2: Client with 3 personas (Score or Not)
```bash
/intel-report scoreornot-6656f290-306b-4ddd-8540-e0883bb89c8a
```

**Expected Output**:
```
✅ Validation passed: 3 ICP segments found
📊 Generating 8 total pages
   1. Basketball Clubs (B2B)
   2. Sports Fans (B2C)
   3. Content Creators (B2C)

✅ Generated 8-page intelligence report suite
✅ Main hub: /projects/scoreornot-[uuid]/deliverables/client-intelligence/intelligence-report-2025.html
✅ ICP pages (3):
   - icp-basketball-clubs-b2b-2025.html
   - icp-sports-fans-b2c-2025.html
   - icp-content-creators-b2c-2025.html
✅ Fixed pages (4): psychographic, EOS, competitive, SEO
✅ All navigation links verified
✅ Grid layout: 3 columns (desktop)
✅ Ready to review!
```

### Example 3: Client with 5 personas
```bash
/intel-report quartziq
```

**Expected Output**:
```
✅ Validation passed: 5 ICP segments found
📊 Generating 10 total pages
   1. Data Analysts (B2B)
   2. BI Teams (B2B)
   3. Product Managers (B2B)
   4. Executives (B2B)
   5. Data Engineers (B2B)

✅ Generated 10-page intelligence report suite
✅ Main hub: /projects/quartziq-[uuid]/deliverables/client-intelligence/intelligence-report-2025.html
✅ ICP pages (5): [5 dynamically named files]
✅ Fixed pages (4): psychographic, EOS, competitive, SEO
✅ All navigation links verified
✅ Grid layout: 3 columns max (wraps to rows)
✅ Ready to review!
```

---

## TROUBLESHOOTING

### Validation Errors

**Error: "No ICP personas found"**
```bash
# Check integrated context file
cat /projects/[uuid]/client-intelligence/integrated-client-context.json | grep "personas"

# Should have array like:
"personas": [
  { "name": "Persona 1", "segment": "B2B", ... }
]
```

**Error: "Missing client name"**
```bash
# Check for clientName field
cat /projects/[uuid]/client-intelligence/integrated-client-context.json | grep "clientName"
```

### Navigation Issues

**If navigation links broken**:
- Verify all ICP filenames match sanitized persona names
- Check no spaces or special characters in filenames
- Ensure all files end with `-2025.html`
- Verify all pages are in same `/client-intelligence/` folder (no `/seo/` subdirectory)

**If grid layout wrong**:
- Check persona count in console log
- Verify grid class matches: 1 persona = 1 col, 2 = 2 cols, 3+ = 3 cols
- Test at different screen sizes (768px, 1024px, 1440px)

### Chart Issues

**If charts growing infinitely**:
- IMMEDIATELY set `maintainAspectRatio: true`
- Never use `maintainAspectRatio: false`
- Verify with browser inspector

### Template Issues

**If template not followed**:
- Re-read `CLIENT-INTELLIGENCE-REPORT-TEMPLATE.md`
- Check exact color values: `#667eea`, `#764ba2`
- Verify Inter font weights: 300, 400, 500, 600, 700, 800

---

## SUCCESS CRITERIA

The report is complete when:
1. ✅ Validation passed (logged persona count)
2. ✅ All N + 5 pages exist and open without errors
3. ✅ Navigation works in all directions (dynamic + fixed)
4. ✅ Grid layout adapts to actual persona count
5. ✅ Design matches canonical template exactly
6. ✅ Zero gradients — `grep -c "linear-gradient\|radial-gradient" *.html` returns 0
7. ✅ Zero emoji — no emoji in heroes, section headers, cards, or decorations
8. ✅ ICP avatar shows persona initial letter (not emoji)
9. ✅ Charts render correctly without height bugs (`maintainAspectRatio: true`)
10. ✅ Content is comprehensive and accurate
11. ✅ Print preview looks professional
12. ✅ Responsive design works at all breakpoints
13. ✅ No hardcoded assumptions about persona count

**DO NOT mark as complete until all pages are generated, validated, saved, and navigation verified.**
