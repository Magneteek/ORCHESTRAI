# Generate Mini Intelligence Report (Single Page)

**Command**: `/mini-report [client-name or project-uuid]`

---

## YOUR TASK

Generate a **single-page executive intelligence dashboard** condensing all critical insights into one professional, printable report. Handles **1-10 ICP segments dynamically**.

## CRITICAL REQUIREMENTS

### 1. Read Template Reference
**Reference the canonical design system from**:
```
/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/client-intelligence/CLIENT-INTELLIGENCE-REPORT-TEMPLATE.md
```
Use same colors, fonts, and styling but condensed layout.

### 2. Load & Validate Client Data

**Step 1: Load files**
```
/projects/[client-uuid]/client-intelligence/integrated-client-context.json
/projects/[client-uuid]/deliverables/seo/keyword-research-VALIDATED.json
/projects/[client-uuid]/deliverables/seo/strategic-coherence-scorecard.json
```

**Step 2: VALIDATE REQUIRED DATA**:

```javascript
// Parse data
const clientData = JSON.parse(integratedContext);
const seoData = JSON.parse(keywordResearch);

// Validation
const validation = {
  clientName: !!clientData.clientName,
  personas: Array.isArray(clientData.personas) && clientData.personas.length > 0,
  businessOverview: !!clientData.business?.overview || !!clientData.businessContext,
  minPersonas: clientData.personas?.length >= 1,
  maxPersonas: clientData.personas?.length <= 10
};

// STOP if critical data missing
if (!validation.clientName) {
  throw new Error("❌ CRITICAL: Missing client name");
}
if (!validation.personas) {
  throw new Error("❌ CRITICAL: No ICP personas found. Need at least 1.");
}

// Log what we found
const personaCount = clientData.personas.length;
console.log(`✅ Validation passed: ${personaCount} ICP segment${personaCount > 1 ? 's' : ''}`);
console.log(`📄 Generating single-page mini dashboard`);
```

### 3. Single Page Structure

**File Name**: `intelligence-dashboard-mini-2025.html`

**Page Sections** (all on one page, no navigation):

#### Hero Section
- Client name (4rem, weight 800)
- One-line positioning statement
- "Executive Intelligence Dashboard" badge
- Generation date

#### Key Metrics Row (4 cards)
```html
<div class="grid grid-cols-4 gap-6">
  <div>Strategic Coherence: X%</div>
  <div>Search Volume: X/mo</div>
  <div>ICP Segments: ${personaCount}</div>  <!-- Dynamic -->
  <div>Market Opportunity: X/10</div>
</div>
```

#### Business Overview (2 paragraphs max)
- What the company does
- Unique value proposition
- Market positioning

#### ICP Segment Cards (DYNAMIC GRID)
**Dynamic grid layout based on persona count**:
```javascript
// Determine grid class
const getGridClass = (count) => {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
  if (count <= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // 5+ wrap
};

<div class="grid ${getGridClass(personaCount)} gap-6">
  ${clientData.personas.map(persona => `
    <div class="icp-mini-card">
      <!-- Card content -->
    </div>
  `).join('')}
</div>
```

**For each ICP segment** (condensed):
- Avatar icon
- Segment name
- Revenue weight + relevance percentage
- 2-sentence description (max 50 words)
- Unit economics (compact):
  - **LTV**: $X | **CAC**: $X
  - **Payback**: X mo | **Churn**: X%

#### SEO Quick Wins (Top 5 keywords only)
**Compact table format**:
```html
<table class="compact-table">
  <thead>
    <tr>
      <th>Keyword</th>
      <th>Vol</th>
      <th>Diff</th>
      <th>Timeline</th>
    </tr>
  </thead>
  <tbody>
    ${topKeywords.slice(0, 5).map(kw => `<tr>...</tr>`).join('')}
  </tbody>
</table>
```

#### Competitive Advantages (Top 4)
**4-item condensed list**:
1. Advantage name + 1 sentence (max 20 words)
2. Advantage name + 1 sentence (max 20 words)
3. Advantage name + 1 sentence (max 20 words)
4. Advantage name + 1 sentence (max 20 words)

#### Strategic Priorities (Q1-Q4 timeline)
**4 cards horizontally**:
- Q1 2026: Goal + 1 sentence
- Q2 2026: Goal + 1 sentence
- Q3 2026: Goal + 1 sentence
- Q4 2026: Goal + 1 sentence

#### Next Actions (30/60/90 days)
**3 columns**:
- **Days 1-30**: 3-4 action items (1 line each)
- **Days 31-60**: 3-4 action items (1 line each)
- **Days 61-90**: 3-4 action items (1 line each)

#### Footer
- Generation timestamp
- Link to full report (if exists): `intelligence-report-2025.html`
- Disclaimer: "Mini Dashboard - See full report for complete analysis"

### 4. Design System (Same as Full Report)

**Colors**:
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Background: White (#ffffff)
- Cards: White with shadows

**Typography**:
- Font: Inter (Google Fonts, weights 300-800)
- Hero title: 4rem, weight 800
- Section headers: 2rem, weight 700
- Body: 0.95rem, weight 400 (slightly smaller for density)

**Layout**:
- Max width: 1400px
- Section padding: 40px vertical (tighter than full report)
- Card radius: 12px (slightly tighter)
- **Print-optimized**: Fits on 3-4 printed pages max

**CDN Dependencies**:
```html
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

**NO CHART.JS** - Use visual cards and progress bars instead.

### 5. Condensed Content Rules

**Maximum Content Limits**:
- Business Overview: 2 paragraphs (150 words max total)
- ICP Descriptions: 2 sentences each (30-50 words max)
- SEO Keywords: Top 5 only (no exceptions)
- Competitive Advantages: 4 items, 1 sentence each (20 words max)
- Strategic Priorities: 1 sentence per quarter (15 words max)
- Next Actions: 3-4 items per month (1 line each, 10 words max)

**Visual Hierarchy**:
- Use cards, not tables (except SEO keywords)
- Use color-coded badges for status/priority
- Use progress bars instead of charts
- Use icons/emojis for quick scanning

**ICP Card Condensed Format**:
```html
<div class="mini-icp-card">
  <div class="avatar">${segment}</div>
  <h4>${name}</h4>
  <div class="badges">
    <span class="revenue">${revenueWeight}% Rev</span>
    <span class="relevance">${relevance}%</span>
  </div>
  <p class="description">${shortDescription}</p>
  <div class="economics-compact">
    <span>LTV: ${ltv}</span> | <span>CAC: ${cac}</span><br>
    <span>PB: ${payback}</span> | <span>Churn: ${churn}</span>
  </div>
</div>
```

### 6. Print Optimization

**Critical for Mini Reports**:
```css
@media print {
  /* Ensure fits on 3-4 pages max */
  section {
    page-break-inside: avoid;
    padding: 20px 10px;
  }

  /* Reduce spacing for density */
  .grid {
    gap: 12px !important;
  }

  /* ICP cards - dynamic print grid */
  .icp-mini-card {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Hide non-essential elements */
  .no-print {
    display: none !important;
  }

  /* Adjust font sizes for print */
  body {
    font-size: 11pt;
  }

  h1 { font-size: 24pt; }
  h2 { font-size: 18pt; }
  h3 { font-size: 14pt; }
}
```

### 7. File Location

**Save to**:
```
/projects/[client-uuid]/deliverables/client-intelligence/intelligence-dashboard-mini-2025.html
```

### 8. Quality Checklist

Before delivering, verify:
- ✅ Single HTML file (no external dependencies except CDN)
- ✅ Validation passed (logged persona count)
- ✅ ICP grid adapts to actual persona count (1-10 segments)
- ✅ Fits on 3-4 printed pages (Command+P preview)
- ✅ All critical data included (metrics, ICPs, SEO, competitive)
- ✅ Purple gradient consistent with full report
- ✅ Inter font loads correctly
- ✅ No Chart.js (use visual alternatives)
- ✅ Responsive at 768px, 1024px, 1440px
- ✅ Print CSS optimized
- ✅ File size < 50KB
- ✅ Link to full report works (if exists)
- ✅ No hardcoded "3 segments" references

---

## CONTENT PRIORITY

**MUST INCLUDE** (non-negotiable):
1. Key metrics (4 numbers including dynamic ICP count)
2. Business overview (2 paragraphs)
3. **ALL ICP segments** (regardless of count - grid adapts)
4. Top 5 SEO quick wins
5. Top 4 competitive advantages
6. Q1-Q4 strategic priorities
7. 30/60/90 day action plan

**CAN OMIT** (if space constrained):
- Detailed psychographic analysis (see full report)
- Extended keyword lists (see full report)
- Competitor profiles (see full report)
- Detailed EOS framework (see full report)
- Technical SEO details (see full report)

**NEVER OMIT**:
- Client name and positioning
- Dynamic ICP count in metrics
- All ICP segment cards (just condense if many)
- Unit economics
- Next actions

---

## VISUAL ALTERNATIVES TO CHARTS

Instead of Chart.js, use:

**Progress Bars** (for percentages):
```html
<div class="bg-gray-200 rounded-full h-4">
  <div class="bg-purple-600 h-4 rounded-full" style="width: 87.3%"></div>
</div>
<span class="text-sm text-gray-600">87.3% ICP Relevance</span>
```

**Metric Cards** (for numbers):
```html
<div class="metric-card">
  <div class="text-5xl font-bold text-purple-600">${personaCount}</div>
  <div class="text-gray-600">ICP Segments</div>
</div>
```

**Color-Coded Badges** (for status):
```html
<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
  ${persona.segment}
</span>
```

**Icon Lists** (for features):
```html
<li>
  <span class="text-purple-600 text-xl">✓</span>
  <span>${advantage}</span>
</li>
```

---

## EXECUTION STEPS

1. **Identify Project**:
   - Search for client project UUID
   - Verify project exists

2. **Load & Validate Data**:
   - Read integrated client context
   - Load SEO keywords and coherence scores
   - Count personas and log findings
   - Parse ICP segments and unit economics

3. **Generate Single Page**:
   - Start with hero section
   - Add key metrics (with dynamic ICP count)
   - Generate dynamic ICP grid (adapts to actual count)
   - Add all sections in order
   - Ensure content fits condensed limits
   - Use visual alternatives to charts

4. **Optimize for Print**:
   - Test Command+P preview
   - Verify fits on 3-4 pages
   - Check page breaks work correctly
   - Adjust spacing if needed

5. **Add Footer Link**:
   - Check if full report exists
   - Link to `intelligence-report-2025.html` if available

6. **Save and Open**:
   - Save to correct location
   - Open in browser for review
   - Log total ICP count

---

## EXAMPLE USAGE

### Example 1: Client with 1 persona
```bash
/mini-report rapidcoldplunge
```

**Expected Output**:
```
✅ Validation passed: 1 ICP segment
📄 Generating single-page mini dashboard

✅ Generated mini intelligence dashboard
✅ File: /projects/rapidcoldplunge-[uuid]/deliverables/client-intelligence/intelligence-dashboard-mini-2025.html
✅ ICP segments: 1 (single column layout)
✅ Fits on 3 printed pages
✅ All critical data included
✅ Ready for executive review!
```

### Example 2: Client with 3 personas
```bash
/mini-report scoreornot-6656f290-306b-4ddd-8540-e0883bb89c8a
```

**Expected Output**:
```
✅ Validation passed: 3 ICP segments
📄 Generating single-page mini dashboard

✅ Generated mini intelligence dashboard for Score or Not
✅ File: /projects/scoreornot-[uuid]/deliverables/client-intelligence/intelligence-dashboard-mini-2025.html
✅ ICP segments: 3 (Basketball Clubs, Sports Fans, Content Creators)
✅ Grid layout: 3 columns (desktop)
✅ Fits on 3 printed pages
✅ All critical data included
✅ Ready for executive review!
```

### Example 3: Client with 5 personas
```bash
/mini-report quartziq
```

**Expected Output**:
```
✅ Validation passed: 5 ICP segments
📄 Generating single-page mini dashboard

✅ Generated mini intelligence dashboard for QuartzIQ
✅ File: /projects/quartziq-[uuid]/deliverables/client-intelligence/intelligence-dashboard-mini-2025.html
✅ ICP segments: 5 (Data Analysts, BI Teams, PMs, Executives, Data Engineers)
✅ Grid layout: 3 columns (wraps to 2 rows)
✅ Fits on 4 printed pages (5 ICPs require extra space)
✅ All critical data included
✅ Ready for executive review!
```

---

## USE CASES

**Perfect for**:
- ✅ Executive presentations (board meetings)
- ✅ Quick investor updates
- ✅ Internal team briefings
- ✅ Email attachments (small file size)
- ✅ Print handouts (3-4 pages)
- ✅ Mobile viewing (single scroll)
- ✅ **Works with ANY persona count (1-10)**

**Not suitable for**:
- ❌ Deep psychographic analysis (use full report)
- ❌ Complete keyword research (use SEO strategy page)
- ❌ Detailed competitive profiles (use competitive intelligence page)

---

## TROUBLESHOOTING

### Validation Errors
**Error: "No ICP personas found"**
```bash
cat /projects/[uuid]/client-intelligence/integrated-client-context.json | grep "personas"
```

### Layout Issues
**Too many personas (5+) breaking layout**:
- Grid automatically wraps to multiple rows
- Each persona card remains readable
- Print may extend to 4 pages (acceptable)

**Single persona looking empty**:
- Use `grid-cols-1` for centered single card
- Increase card size for visual impact

### Print Issues
**Exceeding 4 pages**:
- Reduce section padding in print CSS
- Condense ICP descriptions further
- Remove non-critical visual elements

---

## SUCCESS CRITERIA

The mini report is complete when:
1. ✅ Single page with all required sections
2. ✅ Validation passed (logged persona count)
3. ✅ Dynamic ICP grid adapts to actual count
4. ✅ Fits on 3-4 printed pages (verified with Command+P)
5. ✅ All critical metrics and data included
6. ✅ No Chart.js dependencies (visual alternatives used)
7. ✅ Design matches canonical purple gradient theme
8. ✅ File size under 50KB
9. ✅ Print CSS optimized and tested
10. ✅ Link to full report works (if exists)
11. ✅ No hardcoded "3 segments" references

**The mini report should be immediately usable for executive meetings and presentations, regardless of ICP count.**
