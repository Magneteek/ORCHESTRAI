# Design System Quick Reference
## ORCHESTRAI Agent Quick Guide

**Use this for immediate reference when implementing design elements**

---

## 🎨 Color Tokens (Copy & Paste Ready)

### Primary Colors (60% Usage)
```css
primary-950  /* #0A0F17 - Deepest */
primary-900  /* #0A1929 - Dark backgrounds */
primary-800  /* #1A2944 - Medium dark */
primary-600  /* #357494 - Brand blue */
primary-500  /* #3F86A4 - Light blue */
primary-50   /* #E8F3F8 - Light tint */
```

### Accent Colors (10% Usage - CTAs)
```css
accent-600   /* #0891B2 - Darker accent */
accent-500   /* #06B6D4 - Primary CTA */
accent-400   /* #22D3EE - Hover states */
accent-50    /* #CFFAFE - Light tint */
```

### Neutral Colors
```css
neutral-950  /* #020617 - True black */
neutral-900  /* #0F172A - Dark text */
neutral-600  /* #475569 - Medium text */
neutral-300  /* #CBD5E1 - Light borders */
neutral-100  /* #F1F5F9 - Light backgrounds */
neutral-50   /* #F8FAFC - Off white */
```

### Semantic Colors
```css
success-500  /* #10B981 - Green */
warning-500  /* #F59E0B - Amber */
error-500    /* #EF4444 - Red */
info-500     /* #3B82F6 - Blue */
```

---

## 📝 Typography Classes (Ready to Use)

### Headlines
```css
/* Hero: 64px desktop, 48px mobile */
text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight

/* Section: 36px desktop, 30px mobile */
text-3xl lg:text-4xl font-bold leading-tight

/* Subheading: 20px */
text-xl font-semibold leading-snug
```

### Body Text
```css
/* Large body: 18px-20px */
text-lg lg:text-xl leading-relaxed

/* Default body: 16px */
text-base leading-relaxed

/* Small text: 14px */
text-sm leading-normal

/* Caption: 12px */
text-xs leading-normal
```

---

## 📐 Spacing Classes (8px Grid)

### Section Spacing
```css
/* Sections */
py-16 lg:py-20 xl:py-24

/* Containers */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* Component gaps */
space-y-6 lg:space-y-8
mb-12 lg:mb-16
```

### Component Spacing
```css
/* Card padding */
p-6

/* Button padding */
px-6 py-3    /* Standard */
px-8 py-4    /* Large */

/* Margins */
mt-4 lg:mt-6    /* Text margins */
mb-3 mb-4       /* Component margins */
```

---

## 🔲 Component Recipes

### Primary Button
```tsx
<Button className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-lg shadow-professional transition-all duration-200 min-h-[48px]">
  Call to Action
</Button>
```

### Secondary Button
```tsx
<Button className="border-2 border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 min-h-[48px]">
  Secondary Action
</Button>
```

### Professional Card
```tsx
<Card className="bg-gradient-to-br from-primary-50 to-neutral-50 border-primary-600/20 shadow-professional">
  <CardContent className="p-6">
    <h3 className="text-lg font-semibold text-neutral-900 mb-3 leading-snug">
      Card Title
    </h3>
    <p className="text-neutral-600 text-sm leading-relaxed">
      Card description
    </p>
  </CardContent>
</Card>
```

### Hero Section
```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-16 lg:py-20 xl:py-24">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-neutral-50 tracking-tight">
        Your Headline
      </h1>
      <p className="mt-4 lg:mt-6 text-lg lg:text-xl leading-relaxed text-neutral-300">
        Supporting description
      </p>
    </div>
  </div>
</section>
```

### Content Section
```tsx
<section className="py-16 lg:py-20 xl:py-24 bg-gradient-to-b from-neutral-50 to-neutral-100">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl text-center mb-12 lg:mb-16">
      <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-neutral-900 tracking-tight">
        Section Headline
      </h2>
      <p className="mt-4 lg:mt-6 text-lg lg:text-xl leading-relaxed text-neutral-600">
        Section description
      </p>
    </div>
  </div>
</section>
```

---

## 🎯 Quick Rules

### Color Distribution
- **60%**: Primary colors for backgrounds and large areas
- **30%**: Secondary/supporting colors
- **10%**: Accent colors for CTAs and highlights

### Typography Hierarchy
1. Hero headlines: `text-4xl lg:text-5xl xl:text-6xl font-bold`
2. Section headlines: `text-3xl lg:text-4xl font-bold`
3. Subheadings: `text-xl font-semibold`
4. Body text: `text-base leading-relaxed`

### Accessibility Minimums
- **Touch targets**: `min-h-[44px]` (mobile), `min-h-[48px]` (preferred)
- **Contrast**: 4.5:1 minimum for normal text
- **Focus rings**: `focus:ring-2 focus:ring-accent-500`

### Professional Shadows
```css
shadow-professional        /* Standard card shadow */
shadow-professional-md     /* Medium elevation */
shadow-professional-lg     /* High elevation */
```

---

**💡 Pro Tip**: Copy these classes directly into your components. They're battle-tested and follow all accessibility guidelines.

**📖 Full Documentation**: `/orchestrai-system/templates/global/design-systems/style-guides/professional-design-system-2025.md`