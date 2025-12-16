# Intelligence Reports Template System

**Complete template system for generating professional client intelligence reports with NO GRADIENTS - solid and translucent colors only.**

---

## 🚫 Critical Rule: NO GRADIENTS

This template system uses **ONLY solid colors and translucent overlays**. Every gradient from the original Score or Not design has been replaced with clean, modern solid color alternatives.

---

## Quick Start

### 1. Link the Design System

Add to your HTML `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../design-system/design-system.css">
```

### 2. Choose a Template

```
master-templates/
├── intelligence-hub.html          # Main intelligence hub (overview page)
├── icp-deep-dive.html            # Detailed ICP analysis
├── psychographic-research.html   # Behavioral research
├── eos-framework.html            # Strategic planning (V/TO)
└── seo-strategy.html             # SEO & keyword intelligence
```

### 3. Replace Template Variables

All templates use `{{VARIABLE_NAME}}` placeholders:

```javascript
const html = template
  .replace('{{CLIENT_NAME}}', 'Your Client')
  .replace('{{TAGLINE}}', 'Your Tagline')
  .replace('{{STATS_GRID}}', generateMetricCards());
```

### 4. Generate Report

Save as `.html` file and open in browser. Use browser print (Cmd/Ctrl+P) for PDF export.

---

## File Structure

```
intelligence-reports/
│
├── design-system/
│   ├── design-system.css          # Complete CSS system (NO GRADIENTS)
│   └── DESIGN-SYSTEM.md          # Comprehensive documentation
│
├── master-templates/              # Full page templates
│   ├── intelligence-hub.html
│   ├── icp-deep-dive.html
│   ├── psychographic-research.html
│   ├── eos-framework.html
│   └── seo-strategy.html
│
├── components/
│   └── component-library.html     # Interactive component examples
│
└── README.md                      # This file
```

---

## Template Overview

### Intelligence Hub (`intelligence-hub.html`)

**Purpose:** Main overview page linking to all detailed reports

**Sections:**
- Hero section (solid purple, NO gradient)
- Executive dashboard (4 metric cards)
- Business overview
- Critical success factors
- ICP summary cards (3-5 personas)
- SEO intelligence summary
- Competitive landscape
- Strategic priorities
- Psychographic preview
- Next actions timeline

**Variables:**
```
{{CLIENT_NAME}}
{{TAGLINE}}
{{GENERATION_DATE}}
{{STATS_GRID}}
{{BUSINESS_OVERVIEW}}
{{SUCCESS_FACTORS}}
{{ICP_CARDS}}
{{SEO_METRICS}}
{{STRATEGIC_PRIORITIES}}
{{REPORTS_AVAILABLE}}
```

### ICP Deep Dive (`icp-deep-dive.html`)

**Purpose:** Comprehensive analysis of a single customer profile

**Sections:**
- Header with persona name and metrics
- Sticky navigation
- Overview with key metrics
- Demographics grid
- Psychographics (values, motivations, behaviors)
- Pain points & challenges
- Value proposition
- Acquisition channels (table)
- Retention strategy
- Case studies
- Sub-segments

**Variables:**
```
{{PERSONA_NAME}}
{{REVENUE_WEIGHT}}
{{RELEVANCE_SCORE}}
{{DEMOGRAPHICS_GRID}}
{{PAIN_POINTS}}
{{ACQUISITION_CHANNELS}}
{{CASE_STUDIES}}
{{SUB_SEGMENTS}}
```

### Psychographic Research (`psychographic-research.html`)

**Purpose:** Deep behavioral and psychological analysis

**Sections:**
- Core values comparison matrix
- Emotional triggers by ICP
- Decision-making frameworks
- Communication preferences
- Detailed persona profiles
- Cross-segment opportunities

### EOS Framework (`eos-framework.html`)

**Purpose:** Entrepreneurial Operating System strategic planning

**Sections:**
- Vision (core values, purpose, 10-year target)
- Marketing strategy (3 uniques, proven process)
- 3-year picture
- 1-year plan
- Quarterly rocks (90-day priorities)
- Issues list
- Weekly scorecard
- Accountability chart

### SEO Strategy (`seo-strategy.html`)

**Purpose:** Keyword research and content strategy

**Sections:**
- SEO intelligence dashboard
- Quick win keywords (table)
- Content pillars
- Semantic clusters
- Keyword difficulty distribution
- Traffic projections
- Implementation timeline
- Content calendar
- Backlink strategy

---

## Color Customization

### Default Purple Theme

```css
--primary-purple: #667eea
--secondary-purple: #764ba2
--primary-hover: #5568d3
```

### Customizing Colors

1. Open `design-system/design-system.css`
2. Modify the `:root` variables:

```css
:root {
  /* Your brand colors (SOLID only, no gradients) */
  --primary-purple: #your-color;
  --primary-hover: #your-hover-color;

  /* Update translucent versions */
  --purple-10: rgba(R, G, B, 0.1);
  --purple-20: rgba(R, G, B, 0.2);
  /* etc. */
}
```

**CRITICAL:** Never add gradients. Only solid and translucent (rgba) colors.

---

## Component Examples

### Metric Card (Solid Purple)

```html
<div class="metric-grid">
  <div class="metric-card">
    <div class="metric-value">84.2%</div>
    <div class="metric-label">Strategic Coherence</div>
  </div>
</div>
```

### Metric Card Alternative (White with Purple Border)

```html
<div class="metric-card-alt">
  <div class="metric-value">55</div>
  <div class="metric-label">Keywords Analyzed</div>
</div>
```

### ICP Card

```html
<div class="icp-card">
  <div class="icp-icon">B2B</div>
  <h3 class="icp-title">Basketball Clubs</h3>
  <div class="icp-meta">
    <span class="icp-revenue-weight">40% Revenue Weight</span>
    <span> • 87.3% Relevance</span>
  </div>
  <p>Description...</p>
  <div class="icp-stats">
    <div class="icp-stats-grid">
      <div class="icp-stat"><strong>LTV:</strong> $30,000</div>
      <div class="icp-stat"><strong>CAC:</strong> $2,000</div>
    </div>
  </div>
  <a href="#" class="btn btn-primary">View Complete ICP →</a>
</div>
```

### Info Box (Success)

```html
<div class="info-box">
  <h3 class="info-box-title">🎯 Strategic Insight</h3>
  <div class="info-box-content">
    Your strategic insight text here...
  </div>
</div>
```

### Status Badges

```html
<span class="badge badge-success">Completed</span>
<span class="badge badge-warning">In Progress</span>
<span class="badge badge-danger">Blocked</span>
<span class="badge badge-info">Pending</span>
<span class="badge badge-purple">Featured</span>
```

### Buttons

```html
<a href="#" class="btn btn-primary">Primary Button</a>
<a href="#" class="btn btn-secondary">Secondary Button</a>
<a href="#" class="btn btn-white">White Button</a>
<a href="#" class="btn btn-primary btn-lg">Large Button</a>
```

### Feature Card

```html
<div class="feature-card">
  <h4 class="feature-card-title">Card Title</h4>
  <p class="feature-card-content">Card content goes here...</p>
</div>
```

### Data Table

```html
<div class="table-container">
  <table>
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Gradient Replacement Guide

| Original Element | ❌ Gradient Version | ✅ Solid/Translucent Version |
|------------------|---------------------|------------------------------|
| Hero background | Purple→darker purple gradient | Solid `#667eea` with pattern overlay |
| Metric cards | Gradient background | Solid `#667eea` background |
| Metric text | Gradient text effect | Solid `#667eea` color |
| Buttons | Gradient background | Solid `#667eea`, hover: `#5568d3` |
| Feature cards | Light gradient | Solid `#f7fafc` with border |
| Footer | Dark gradient | Solid `#764ba2` |
| Nav active state | Gradient | Solid `#667eea` |

---

## Print Styles

All templates include print-optimized CSS:

- Hide navigation and buttons (`.no-print` class)
- Convert purple hero to white with purple border
- Optimize section spacing
- Prevent page breaks within cards
- Maintain readability

**To Print:**
1. Open report in browser
2. Press Cmd+P (Mac) or Ctrl+P (Windows)
3. Select "Save as PDF"
4. Adjust margins if needed

---

## Responsive Design

Templates are mobile-first and fully responsive:

### Mobile (< 768px)
- Single column layouts
- Reduced font sizes
- Optimized spacing
- Touch-friendly buttons

### Tablet (768px - 1024px)
- 2-column grids where appropriate
- Medium spacing
- Optimized navigation

### Desktop (> 1024px)
- Full multi-column layouts
- Maximum spacing
- Hover effects enabled

---

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support
- Print: Optimized for PDF export

---

## Integration with ORCHESTRAI

### Node.js Template Rendering

```javascript
const fs = require('fs');

// Load template
const template = fs.readFileSync(
  './master-templates/intelligence-hub.html',
  'utf-8'
);

// Replace variables
const clientData = {
  name: 'Score or Not',
  tagline: 'Client Intelligence Hub',
  generationDate: new Date().toLocaleDateString(),
  metrics: [
    { value: '84.2%', label: 'Strategic Coherence' },
    { value: '36K', label: 'Monthly Search Volume' }
  ]
};

let html = template
  .replace('{{CLIENT_NAME}}', clientData.name)
  .replace('{{TAGLINE}}', clientData.tagline)
  .replace('{{GENERATION_DATE}}', clientData.generationDate);

// Generate metric cards
const metricCards = clientData.metrics.map(m => `
  <div class="metric-card">
    <div class="metric-value">${m.value}</div>
    <div class="metric-label">${m.label}</div>
  </div>
`).join('');

html = html.replace('{{STATS_GRID}}', metricCards);

// Save output
fs.writeFileSync('./output/intelligence-hub.html', html);
```

### Agent Integration

```javascript
// In ORCHESTRAI agent
const generateIntelligenceHub = async (clientData) => {
  const templatePath = path.join(
    __dirname,
    '../orchestrai-system/templates/global/intelligence-reports/master-templates/intelligence-hub.html'
  );

  const template = await fs.readFile(templatePath, 'utf-8');

  // Populate template
  const report = populateTemplate(template, clientData);

  // Save to client deliverables
  const outputPath = path.join(
    __dirname,
    `../projects/${clientData.projectId}/deliverables/client-intelligence/intelligence-hub.html`
  );

  await fs.writeFile(outputPath, report);

  return outputPath;
};
```

---

## Common Use Cases

### Use Case 1: Generate Intelligence Hub

```javascript
const hub = generateHub({
  clientName: 'Your Client',
  tagline: 'Intelligence Hub',
  metrics: [...],
  icps: [...],
  reports: [...]
});
```

### Use Case 2: Generate ICP Deep Dive

```javascript
const icpReport = generateICPDeepDive({
  personaName: 'Enterprise Buyers',
  revenueWeight: 45,
  demographics: [...],
  painPoints: [...],
  acquisitionChannels: [...]
});
```

### Use Case 3: Batch Generate All Reports

```javascript
const reports = generateAllReports({
  hub: hubData,
  icps: [icp1, icp2, icp3],
  psychographic: psychoData,
  eos: eosData,
  seo: seoData
});
```

---

## Troubleshooting

### Issue: Gradients appearing

**Solution:** Check that you're using `design-system.css` and not mixing with old gradient styles.

### Issue: Colors not matching

**Solution:** Ensure CSS variables are properly defined and template links to correct CSS file.

### Issue: Print layout broken

**Solution:** Check that `.no-print` class is applied to interactive elements.

### Issue: Mobile layout problems

**Solution:** Verify viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

---

## Examples & Demos

### Live Component Library

Open `components/component-library.html` in browser to see all components with code examples.

### Example Output

See Score or Not project deliverables for real-world examples:
- `/projects/scoreornot-.../deliverables/client-intelligence/intelligence-report-2025.html`

---

## Support & Documentation

- **Full Design System Docs:** `design-system/DESIGN-SYSTEM.md`
- **Component Library:** `components/component-library.html`
- **ORCHESTRAI Docs:** See main project README

---

## Version History

**v1.0.0** - December 2025
- Initial release
- Complete template system
- NO GRADIENTS rule enforced
- 5 master templates
- Complete component library
- Full documentation

---

## License

Part of ORCHESTRAI Multi-Agent System
© 2025 ORCHESTRAI

---

**Remember: This system uses ONLY solid colors and translucent overlays. Never add gradients.**
