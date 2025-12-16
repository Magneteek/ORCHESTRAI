# Intelligence Reports Design System

## 🚫 CRITICAL RULE: NO GRADIENTS

**NEVER use gradients in intelligence reports.** This design system uses ONLY:
- **Solid colors** (#667eea, #ffffff, etc.)
- **Translucent overlays** (rgba with opacity)
- **Subtle borders** (1-4px solid colors)
- **Box shadows** for depth (rgba-based)

---

## Color Palette

### Primary Colors (Solid)

```css
--primary-purple: #667eea
--secondary-purple: #764ba2
--primary-hover: #5568d3
--primary-active: #4a5bc2
```

**Usage:**
- `--primary-purple`: Main brand color (buttons, headers, accents)
- `--secondary-purple`: Footer backgrounds, darker elements
- `--primary-hover`: Button hover states
- `--primary-active`: Button active/pressed states

**Visual Swatches:**
- ![#667eea](https://via.placeholder.com/100x50/667eea/667eea.png) Primary Purple
- ![#764ba2](https://via.placeholder.com/100x50/764ba2/764ba2.png) Secondary Purple
- ![#5568d3](https://via.placeholder.com/100x50/5568d3/5568d3.png) Primary Hover
- ![#4a5bc2](https://via.placeholder.com/100x50/4a5bc2/4a5bc2.png) Primary Active

### Translucent Purple Variations

```css
--purple-10: rgba(102, 126, 234, 0.1)   /* Very subtle backgrounds */
--purple-20: rgba(102, 126, 234, 0.2)   /* Light overlays */
--purple-30: rgba(102, 126, 234, 0.3)   /* Hero badge borders */
--purple-50: rgba(102, 126, 234, 0.5)   /* Medium overlays */
--purple-80: rgba(102, 126, 234, 0.8)   /* Strong overlays */
```

**When to Use:**
- `--purple-10`: Hover states on white backgrounds
- `--purple-20`: Hero badge backgrounds with backdrop-blur
- `--purple-30`: Borders on translucent elements
- `--purple-50`: Shadows (e.g., `box-shadow: 0 10px 20px var(--purple-50)`)

### Background Colors (Solid)

```css
--bg-primary: #ffffff      /* White - main content areas */
--bg-secondary: #f7fafc    /* Very light gray - page backgrounds */
--bg-tertiary: #edf2f7     /* Light gray - card alternates */
--bg-quaternary: #e2e8f0   /* Medium gray - disabled states */
```

### Text Colors

```css
--text-primary: #1a202c    /* Almost black - headings, body text */
--text-secondary: #4a5568  /* Dark gray - secondary text */
--text-tertiary: #718096   /* Medium gray - labels, captions */
--text-muted: #a0aec0      /* Light gray - placeholder text */
--text-white: #ffffff      /* White - text on dark backgrounds */
```

### Semantic Colors (Solid)

#### Success (Green)
```css
--success: #10b981          /* Main green */
--success-bg: #d1fae5       /* Light green background */
--success-text: #065f46     /* Dark green text */
```

**Usage Example:**
```html
<div class="badge badge-success">Completed</div>
<div class="info-box">Strategic insight...</div>
```

#### Warning (Orange/Amber)
```css
--warning: #f59e0b
--warning-bg: #fef3c7
--warning-text: #92400e
```

#### Danger (Red)
```css
--danger: #ef4444
--danger-bg: #fee2e2
--danger-text: #991b1b
```

#### Info (Blue)
```css
--info: #3b82f6
--info-bg: #dbeafe
--info-text: #1e40af
```

### Translucent White

```css
--white-95: rgba(255, 255, 255, 0.95)  /* Nearly opaque */
--white-90: rgba(255, 255, 255, 0.9)   /* Hero text overlays */
--white-80: rgba(255, 255, 255, 0.8)
--white-50: rgba(255, 255, 255, 0.5)
--white-30: rgba(255, 255, 255, 0.3)   /* Borders on purple */
--white-20: rgba(255, 255, 255, 0.2)   /* Hero badges */
--white-10: rgba(255, 255, 255, 0.1)   /* Subtle overlays */
```

---

## Gradient Replacement Patterns

### ❌ NEVER Do This:

```css
/* WRONG - Gradient backgrounds */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* WRONG - Gradient text */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* WRONG - Gradient borders */
border-image: linear-gradient(to right, #667eea, #764ba2) 1;
```

### ✅ DO This Instead:

#### Hero Backgrounds
**OLD (Gradient):**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**NEW (Solid with Pattern):**
```css
background-color: #667eea;
/* Add subtle pattern overlay */
background-image: url('data:image/svg+xml,...');
```

#### Metric Cards
**OLD (Gradient):**
```css
.metric-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

**NEW (Solid Purple):**
```css
.metric-card {
  background-color: #667eea;
  color: #ffffff;
  border: 2px solid transparent;
}
.metric-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}
```

#### Text Emphasis
**OLD (Gradient Text):**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**NEW (Solid Color):**
```css
color: #667eea;
font-weight: 700;
```

#### Alternative Metric Cards
**NEW (White with Purple Border):**
```css
.metric-card-alt {
  background-color: #ffffff;
  border: 2px solid #667eea;
  color: #667eea;
}
```

#### Buttons
**OLD:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**NEW:**
```css
background-color: #667eea;
&:hover { background-color: #5568d3; }
&:active { background-color: #4a5bc2; }
```

#### Feature Cards
**OLD:**
```css
background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
```

**NEW:**
```css
background-color: #f7fafc;
border: 2px solid #e2e8f0;
```

---

## Typography Scale

### Font Sizes

```css
--font-xs: 0.75rem      /* 12px - Small labels */
--font-sm: 0.875rem     /* 14px - Table headers, captions */
--font-base: 1rem       /* 16px - Body text */
--font-lg: 1.125rem     /* 18px - Large body text */
--font-xl: 1.25rem      /* 20px - Small headings */
--font-2xl: 1.5rem      /* 24px - h4 */
--font-3xl: 1.875rem    /* 30px - h3 */
--font-4xl: 2.25rem     /* 36px - h2 */
--font-5xl: 3rem        /* 48px - Large metrics */
--font-6xl: 3.75rem     /* 60px - h1 */
--font-7xl: 4.5rem      /* 72px - Hero titles */
```

### Font Weights

```css
--font-light: 300       /* Subtitles */
--font-normal: 400      /* Body text */
--font-medium: 500      /* Nav links */
--font-semibold: 600    /* Subheadings */
--font-bold: 700        /* Headings */
--font-extrabold: 800   /* Hero titles, metric values */
```

### Line Heights

```css
--leading-tight: 1.25    /* Headings */
--leading-snug: 1.375    /* Tight paragraphs */
--leading-normal: 1.5    /* Body text */
--leading-relaxed: 1.625 /* Comfortable reading */
--leading-loose: 2       /* Widely spaced */
```

### Typography Usage Examples

```html
<!-- Hero Title -->
<h1 style="font-size: var(--font-7xl); font-weight: var(--font-extrabold); line-height: var(--leading-tight);">
  Score or Not
</h1>

<!-- Section Title -->
<h2 style="font-size: var(--font-4xl); font-weight: var(--font-bold);">
  Executive Dashboard
</h2>

<!-- Body Text -->
<p style="font-size: var(--font-base); line-height: var(--leading-relaxed); color: var(--text-secondary);">
  Description text...
</p>

<!-- Metric Value -->
<div style="font-size: var(--font-5xl); font-weight: var(--font-extrabold); color: var(--primary-purple);">
  84.2%
</div>
```

---

## Spacing Scale

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

**Usage Guidelines:**
- `--space-2` to `--space-4`: Component internal spacing (padding within buttons, badges)
- `--space-6` to `--space-8`: Spacing between elements
- `--space-10` to `--space-16`: Section spacing
- `--space-20` to `--space-24`: Major section padding

---

## Component Specifications

### Metric Cards (Solid Purple)

**Dimensions:**
- Min-width: 220px
- Padding: 32px (var(--space-8))
- Border-radius: 16px (var(--radius-xl))

**Colors:**
- Background: `#667eea` (solid, no gradient)
- Text: `#ffffff`
- Border on hover: `rgba(255, 255, 255, 0.3)`

**States:**
```css
/* Default */
background-color: #667eea;
color: #ffffff;

/* Hover */
transform: translateY(-4px);
box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
border: 2px solid rgba(255, 255, 255, 0.3);
```

**HTML Structure:**
```html
<div class="metric-grid">
  <div class="metric-card">
    <div class="metric-value">84.2%</div>
    <div class="metric-label">Strategic Coherence</div>
  </div>
</div>
```

### Metric Cards Alternative (White with Purple Border)

**Dimensions:** Same as above

**Colors:**
- Background: `#ffffff` (solid white)
- Border: `2px solid #667eea`
- Text value: `#667eea`
- Text label: `#718096`

**States:**
```css
/* Hover */
background-color: rgba(102, 126, 234, 0.1);
transform: translateY(-4px);
```

### ICP Cards

**Dimensions:**
- Min-width: 320px
- Padding: 32px (var(--space-8))
- Border-radius: 16px (var(--radius-xl))

**Colors:**
- Background: `#ffffff`
- Border: `2px solid #e2e8f0`
- Border on hover: `#667eea`
- Icon background: `#667eea` (solid circle)
- Icon text: `#ffffff`

**Icon Specs:**
- Size: 80px × 80px
- Border-radius: 50% (perfect circle)
- Font-size: 30px (var(--font-3xl))
- Font-weight: 700

**States:**
```css
/* Hover */
transform: translateY(-4px);
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
border-color: #667eea;
```

### Buttons

**Primary Button:**
- Background: `#667eea` (solid, no gradient)
- Color: `#ffffff`
- Padding: `12px 32px` (var(--space-3) var(--space-8))
- Border-radius: `8px`
- Font-weight: 600

**States:**
```css
/* Hover */
background-color: #5568d3;
transform: translateY(-2px);
box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

/* Active */
background-color: #4a5bc2;
transform: translateY(0);
```

**Secondary Button:**
- Background: `#ffffff`
- Color: `#667eea`
- Border: `2px solid #667eea`

**Hover:**
```css
background-color: rgba(102, 126, 234, 0.1);
```

### Badges

**Success Badge:**
```css
background-color: #d1fae5;
color: #065f46;
padding: 6px 14px;
border-radius: 20px;
font-size: 0.8rem;
font-weight: 600;
text-transform: uppercase;
```

**Warning Badge:**
```css
background-color: #fef3c7;
color: #92400e;
```

**Danger Badge:**
```css
background-color: #fee2e2;
color: #991b1b;
```

**Info Badge:**
```css
background-color: #dbeafe;
color: #1e40af;
```

**Purple Badge:**
```css
background-color: rgba(102, 126, 234, 0.2);
color: #667eea;
border: 1px solid #667eea;
```

### Tables

**Header:**
```css
background-color: #edf2f7;  /* Solid gray, no gradient */
border-bottom: 2px solid #cbd5e0;
padding: 16px 24px;
text-transform: uppercase;
font-size: 0.875rem;
font-weight: 600;
letter-spacing: 0.05em;
```

**Row:**
```css
border-bottom: 1px solid #e2e8f0;
padding: 16px 24px;
```

**Hover State:**
```css
background-color: #f7fafc;
```

### Info Boxes (NO GRADIENTS)

**Success/Info Box:**
```css
background-color: #d1fae5;
border: 2px solid #10b981;
border-left: 4px solid #10b981;
border-radius: 12px;
padding: 24px;
```

**Title:**
```css
color: #065f46;
font-size: 1.25rem;
font-weight: 700;
```

**Warning Box:**
```css
background-color: #fef3c7;
border: 2px solid #f59e0b;
border-left: 4px solid #f59e0b;
```

**Danger Box:**
```css
background-color: #fee2e2;
border: 2px solid #ef4444;
border-left: 4px solid #ef4444;
```

---

## Layout Grids

### Metric Grid
```css
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;  /* var(--space-6) */
}
```

### ICP Grid
```css
.icp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;  /* var(--space-8) */
}
```

### Feature Grid
```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```

### Container Widths
```css
.container { max-width: 1400px; }
.container-narrow { max-width: 1200px; }
.container-wide { max-width: 1600px; }
```

---

## Shadow System (NO GRADIENTS)

All shadows use rgba for soft, realistic depth:

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-purple: 0 10px 20px rgba(102, 126, 234, 0.3);
```

**Usage:**
- Cards: `--shadow-lg`
- Cards on hover: `--shadow-xl` or `--shadow-2xl`
- Purple buttons on hover: `--shadow-purple`
- Tables: `--shadow-md`

---

## Border Radius

```css
--radius-sm: 0.375rem   /* 6px - Small badges */
--radius-md: 0.5rem     /* 8px - Buttons */
--radius-lg: 0.75rem    /* 12px - Feature cards */
--radius-xl: 1rem       /* 16px - Metric cards */
--radius-2xl: 1.5rem    /* 24px - Section cards */
--radius-full: 9999px   /* Fully rounded - badges, icons */
```

---

## Responsive Breakpoints

### Mobile (max-width: 768px)

```css
@media (max-width: 768px) {
  /* Hero */
  .hero h1 { font-size: var(--font-5xl); }
  .hero .subtitle { font-size: var(--font-xl); }

  /* Sections */
  .section { padding: var(--space-8); }
  .card { padding: var(--space-6); }

  /* Grids */
  .metric-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-4);
  }

  .icp-grid {
    grid-template-columns: 1fr;
  }

  /* Container */
  .container { padding: 0 var(--space-4); }
}
```

---

## Template Usage Guide

### 1. Intelligence Hub Template

**File:** `master-templates/intelligence-hub.html`

**Variables to Replace:**
- `{{CLIENT_NAME}}` - Client company name
- `{{TAGLINE}}` - Hub subtitle
- `{{GENERATION_DATE}}` - Report generation date
- `{{STATS_GRID}}` - 4 metric cards HTML
- `{{BUSINESS_OVERVIEW}}` - Business description
- `{{SUCCESS_FACTORS}}` - Feature cards HTML
- `{{ICP_CARDS}}` - 3-5 ICP cards HTML
- `{{SEO_METRICS}}` - SEO metric cards
- `{{REPORTS_AVAILABLE}}` - Footer links

**Example Implementation:**
```javascript
const hubHTML = intelligenceHubTemplate
  .replace('{{CLIENT_NAME}}', 'Score or Not')
  .replace('{{TAGLINE}}', 'Client Intelligence Hub')
  .replace('{{GENERATION_DATE}}', 'December 6, 2025')
  .replace('{{STATS_GRID}}', generateMetricCards(metrics));
```

### 2. ICP Deep Dive Template

**File:** `master-templates/icp-deep-dive.html`

**Key Variables:**
- `{{PERSONA_NAME}}` - ICP segment name
- `{{REVENUE_WEIGHT}}` - Revenue percentage
- `{{DEMOGRAPHICS_GRID}}` - Demographic cards
- `{{PAIN_POINTS}}` - Pain point cards
- `{{ACQUISITION_CHANNELS}}` - Table rows
- `{{CASE_STUDIES}}` - Case study cards

### 3. Customizing Colors

To customize the color scheme while maintaining NO GRADIENTS:

```css
:root {
  /* Change primary purple to your brand color */
  --primary-purple: #your-color;
  --primary-hover: #your-hover-color;

  /* Adjust translucent versions */
  --purple-10: rgba(your-r, your-g, your-b, 0.1);
  --purple-20: rgba(your-r, your-g, your-b, 0.2);
  /* etc. */
}
```

**REMEMBER: Never add gradients. Only solid and translucent colors.**

---

## Print Styles

All templates include print-optimized styles:

```css
@media print {
  .no-print { display: none !important; }

  .hero {
    background-color: #ffffff;
    color: #1a202c;
    border-bottom: 4px solid #667eea;
    min-height: auto;
  }

  .section { page-break-inside: avoid; }
}
```

---

## File Structure

```
intelligence-reports/
├── design-system/
│   ├── design-system.css           # Main CSS file
│   └── DESIGN-SYSTEM.md           # This documentation
├── master-templates/
│   ├── intelligence-hub.html      # Main hub page
│   ├── icp-deep-dive.html        # ICP detail page
│   ├── psychographic-research.html
│   ├── eos-framework.html
│   └── seo-strategy.html
├── components/
│   └── component-library.html     # Interactive examples
└── README.md                       # Quick start guide
```

---

## Quick Reference: Gradient Replacements

| Element | ❌ OLD (Gradient) | ✅ NEW (Solid/Translucent) |
|---------|-------------------|----------------------------|
| Hero background | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `background-color: #667eea;` |
| Metric card | Gradient purple | `background-color: #667eea;` |
| Metric text | Gradient text effect | `color: #667eea;` |
| Button | Gradient background | `background-color: #667eea;` hover: `#5568d3` |
| Feature card | Light gradient | `background-color: #f7fafc; border: 2px solid #e2e8f0;` |
| Footer | Dark gradient | `background-color: #764ba2;` |
| Nav active | Gradient background | `background-color: #667eea;` |

---

## Best Practices

### ✅ DO:
- Use solid colors for all backgrounds
- Use translucent overlays (rgba) for depth
- Use border + box-shadow for visual interest
- Use color transitions for hover states
- Reference CSS variables for consistency

### ❌ DON'T:
- Use `linear-gradient()` anywhere
- Use `radial-gradient()` anywhere
- Use gradient text effects (`background-clip: text`)
- Use gradient borders
- Hardcode color values (use CSS variables)

---

## Support & Maintenance

For questions or updates to this design system, contact the ORCHESTRAI development team.

**Version:** 1.0.0
**Last Updated:** December 2025
**Maintained By:** ORCHESTRAI Multi-Agent System
