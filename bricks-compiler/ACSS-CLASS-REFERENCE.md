# ACSS Class Reference
> Compiled from ACSS dashboard cheat sheet — May 2026
> Use this when writing HTML for the Bricks HTML-to-Bricks paste feature.
> Naming convention: double dash `--` throughout. No colons, no single dash.

---

## Pro Mode — Enabled Categories

Only these utility class categories are generated. Everything else → use ACSS variables in BEM class CSS.

| Category | ✅ Available | Use in HTML |
|---|---|---|
| Background Color | ✅ | `bg--primary`, `bg--ultra-dark` etc. |
| Section Padding | ✅ | `section--m`, `section--l` etc. |
| Smart Spacing | ✅ | `smart-spacing` |
| Text Color | ✅ | `text--primary`, `text--light`, `text--dark` etc. |
| Link Color | ✅ | link color utilities |
| Grid | ✅ | `grid--auto-4`, `grid--stack-even-m` etc. |
| Variable Grid | ✅ | `variable-grid` |
| Content Grid | ✅ | `content-grid`, `content--feature` etc. |
| Gap | ✅ | `gap--none`, `gap--m` etc. |
| Width | ✅ | `content-width` |
| Radius | ✅ | `radius--m`, `rounded--l` etc. |
| Aspect Ratio | ✅ | `aspect--16-9` etc. |
| Height | ✅ | height utilities |
| Columns & Masonry | ✅ | column layout utilities |
| Marker | ✅ | `marker--primary` etc. |
| Container Queries | ✅ | CQ utilities |
| Accessibility | ✅ | `clickable-parent` etc. |

## Pro Mode — Disabled (use variables instead)

| Category | ❌ Disabled | Use instead |
|---|---|---|
| Padding | ❌ `padding--m` | `padding: var(--space-m)` in BEM class |
| Margin | ❌ `margin-top--m` | `margin-top: var(--space-m)` in BEM class |
| Owl Spacing | ❌ `owl--m` | `margin-top: var(--space-m)` on children |
| Row Gap | ❌ `row-gap--m` | `row-gap: var(--space-m)` in BEM class |
| Buttons | ❌ `btn--primary` | Build as Bricks Component with ACSS vars |
| Icons | ❌ `icon--boxed` | BEM class + variables |
| Borders | ❌ `border-light` | `border: 1px solid var(--primary)` in BEM class |
| Box Shadows | ❌ `box-shadow--m` | `box-shadow: var(--box-shadow-m)` in BEM class |
| Opacity | ❌ `opacity--50` | `opacity: .5` in BEM class |
| Object Fit | ❌ `object-fit--cover` | `object-fit: cover` in BEM class |
| Breakout | ❌ `breakout--l` | Custom CSS in BEM class |
| Fades | ❌ `fade--bottom` | Custom CSS in BEM class |
| Flip | ❌ `flip--x` | `transform: scaleX(-1)` in BEM class |
| Overlays | ❌ `overlay-1` | BEM class with `::before` pseudo-element |
| Textures | ❌ `texture-1` | BEM class with background-image |
| Color Scheme | ❌ `color-scheme--alt` | Direct variable overrides |
| Line Clamp | ❌ `line-clamp--3` | `-webkit-line-clamp: 3` in BEM class |
| Forms | ❌ `form--dark` | BEM class with variables |
| Text Size | ❌ `text--s`, `text--xl` | `font-size: var(--text-s)` in BEM class |
| Text Align | ❌ `text--center` | `text-align: center` in BEM class |
| Text Transform | ❌ `text--uppercase` | `text-transform: uppercase` in BEM class |
| Text Weight | ❌ `text--700` | `font-weight: 700` in BEM class |
| Heading Classes | ❌ `h1`–`h6` | Use semantic HTML elements (inherit from theme) |
| Text Decoration | ❌ `text--underline` | `text-decoration: underline` in BEM class |
| Text Wrap | ❌ `balance` | `text-wrap: balance` in BEM class |

---

## Writing Rules (Pro Mode)

1. **Layout** → ACSS utility class (`grid--auto-4`, `section--m`, `gap--m`)
2. **Background** → ACSS utility class (`bg--primary`, `bg--ultra-dark`)
3. **Text colour** → ACSS utility class (`text--primary`, `text--light-muted`)
4. **Everything else** → ACSS variable in BEM class CSS (`font-size: var(--text-s)`)
5. **Font family** → never set — inherited from Bricks theme styles
6. **Transparency** → HSL partials (`hsl(var(--primary-h) var(--primary-s) var(--primary-l) / .15)`)

## BEM Naming Convention for Bricks

**Do NOT use double underscore `__`** — Bricks fails to generate compound CSS selectors for classes with `__` in the name.

Use single hyphen for block-element separator:

```
block-element        ← block and element (single hyphen)
block--modifier      ← modifier (double dash — keep this)
block-element--mod   ← element with modifier
```

Examples:
```
results-heading      ✅    results__heading    ❌
results-stat         ✅    results__stat       ❌
results-value        ✅    results__value      ❌
card--featured       ✅    card__featured      ❌
btn--primary         ✅    (ACSS convention, already correct)
```

Bricks generates: `.your-class.brxe-div { ... }` — only works with names Bricks can cleanly process.

---

## Color Scale Pattern

Every palette color (action, primary, secondary, tertiary, accent, base, shade) generates a full scale.
Replace `{color}` with any palette name:

```
{color}-ultra-dark
{color}-dark
{color}-semi-dark
{color}-medium
{color}               ← base shade
{color}-semi-light
{color}-light
{color}-ultra-light
{color}-comp          ← complementary
{color}-hover
```

---

## Section Padding

```css
section               /* default section padding */
section--xs
section--s
section--m            /* ← most common */
section--l
section--xl
section--xxl
section--none

/* DEPRECATED (still works but avoid) */
pad-section--xs … pad-section--xxl
```

---

## Padding

```css
padding               /* default padding */
padding--xs
padding--s
padding--m
padding--l
padding--xl
padding--xxl
padding--none

/* Header padding */
header--xs
header--s
header--m
header--l
header--xl
header--xxl

/* DEPRECATED */
pad--xs … pad--xxl
pad--none
pad-header--xs … pad-header--xxl
```

---

## Margin

```css
margin-top--xs
margin-top--s
margin-top--m
margin-top--l
margin-top--xl
margin-top--xxl

margin-bottom--xs
margin-bottom--s
margin-bottom--m
margin-bottom--l
margin-bottom--xl
margin-bottom--xxl

margin-block--xs
margin-block--s
margin-block--m
margin-block--l
margin-block--xl
margin-block--xxl

/* left / right / inline — exist but variants not confirmed */
```

---

## Gap

```css
gap
gap--none
gap--xs
gap--s
gap--m
gap--l
gap--xl
gap--xxl

/* Contextual gap */
container-gap
content-gap
grid-gap

/* Row gap */
row-gap--xs
row-gap--s
row-gap--m
row-gap--l
row-gap--xl
row-gap--xxl
```

---

## Owl Spacing (lobotomised owl — top margin on siblings)

```css
owl--xs
owl--s
owl--m
owl--l
owl--xl
owl--xxl
```

---

## Smart Spacing

```css
smart-spacing
```

---

## Grid — Auto (responsive, no breakpoints needed)

```css
/* Equal columns */
grid--auto-2
grid--auto-3
grid--auto-4
grid--auto-5
grid--auto-6
grid--auto-7
grid--auto-8
grid--auto-9
grid--auto-10
grid--auto-11
grid--auto-12

/* Ratio columns */
grid--auto-1-2
grid--auto-1-3
grid--auto-2-1
grid--auto-2-3
grid--auto-3-1
grid--auto-3-2

/* Behaviour */
grid--auto-rows
grid--auto-fill
grid--auto-fit

/* Stack at breakpoint — even columns */
grid--stack-even
grid--stack-even-xs
grid--stack-even-s
grid--stack-even-m
grid--stack-even-l
grid--stack-even-xl
grid--stack-even-xxl

/* Stack at breakpoint — any column count */
grid--stack-any
grid--stack-any-xs
grid--stack-any-s
grid--stack-any-m
grid--stack-any-l
grid--stack-any-xl
grid--stack-any-xxl
```

---

## Grid — Fixed

```css
grid

/* Column counts — with breakpoint variants */
grid--1
grid--s-1   grid--m-1   grid--l-1   grid--xl-1   grid--xxl-1
grid--2     /* + breakpoint variants follow same pattern */
grid--3
grid--4
grid--5
grid--6
grid--7
grid--8
grid--9
grid--10
grid--11
grid--12

/* Breakpoint pattern: grid--{bp}-{n} */
/* bp: s, m, l, xl, xxl */
/* e.g. grid--m-2 = 2 columns at m breakpoint and up */

grid-uneven
grid-alternate
grid-stack
grid-flow
```

---

## Grid — Placement

```css
col-start
col-end
row-start
row-end
col-span
row-span
order
order--first
order--last
```

---

## Content Grid / Variable Grid

```css
variable-grid
content-grid
content--feature
content--feature-max
content--full
content--full-safe
```

---

## Backgrounds

### Contextual (require dashboard assignment — see WORKFLOW.md Phase 1)
```css
bg--ultra-dark        /* → assign var(--neutral) for dark-scheme sites */
bg--dark
bg--light
bg--ultra-light
```

### Palette — full scale per color
```css
/* Pattern: bg--{color}-{shade} */

/* Action */
bg--action-ultra-dark  bg--action-dark  bg--action-semi-dark
bg--action-medium      bg--action
bg--action-semi-light  bg--action-light  bg--action-ultra-light
bg--action-comp        bg--action-hover

/* Primary */
bg--primary-ultra-dark  bg--primary-dark  bg--primary-semi-dark
bg--primary-medium      bg--primary
bg--primary-semi-light  bg--primary-light  bg--primary-ultra-light
bg--primary-comp        bg--primary-hover

/* Secondary */
bg--secondary-ultra-dark  bg--secondary-dark  bg--secondary-semi-dark
bg--secondary-medium      bg--secondary
bg--secondary-semi-light  bg--secondary-light  bg--secondary-ultra-light
bg--secondary-comp        bg--secondary-hover

/* Accent */
bg--accent-ultra-dark  bg--accent-dark  bg--accent-semi-dark
bg--accent-medium      bg--accent
bg--accent-semi-light  bg--accent-light  bg--accent-ultra-light
bg--accent-comp        bg--accent-hover

/* Base */
bg--base-ultra-dark  bg--base-dark  bg--base-semi-dark
bg--base-medium      bg--base
bg--base-semi-light  bg--base-light  bg--base-ultra-light
bg--base-comp        bg--base-hover

/* Shade (neutral palette) */
bg--shade-ultra-dark  bg--shade-dark  bg--shade-semi-dark
bg--shade-medium      bg--shade
bg--shade-semi-light  bg--shade-light  bg--shade-ultra-light
bg--shade-comp        bg--shade-hover

/* black & white, success, danger, warning, info — exist, exact classes TBC */
```

### Special background utility
```css
is-bg    /* full-width background image helper */
```

---

## Text Colors

### Contextual
```css
text--dark
text--dark-muted
text--light
text--light-muted
```

### Palette — full scale per color
```css
/* Pattern: text--{color}-{shade} */

/* Action */
text--action-ultra-dark  text--action-dark  text--action-semi-dark
text--action-medium      text--action
text--action-semi-light  text--action-light  text--action-ultra-light
text--action-comp        text--action-hover

/* Primary */
text--primary-ultra-dark  text--primary-dark  text--primary-semi-dark
text--primary-medium      text--primary
text--primary-semi-light  text--primary-light  text--primary-ultra-light
text--primary-comp        text--primary-hover

/* Accent */
text--accent-ultra-dark  text--accent-dark  text--accent-semi-dark
text--accent-medium      text--accent
text--accent-semi-light  text--accent-light  text--accent-ultra-light
text--accent-comp        text--accent-hover

/* Secondary, base, shade — follow same pattern */
```

---

## Typography

### Headings
```css
h1  h2  h3  h4  h5  h6    /* current */

/* DEPRECATED */
h--1  h--2  h--3  h--4  h--5  h--6
```

### Font Size
```css
text--xs
text--s
text--m
text--l
text--xl
text--xxl
text--larger
```

### Font Weight
```css
text--100  text--200  text--300  text--400  text--500
text--600  text--700  text--800  text--900
text--bold
```

### Font Style
```css
text--italic
text--oblique
```

### Text Align
```css
text--left
text--center
text--right
text--justify
```

### Text Transform
```css
text--uppercase
text--lowercase
text--capitalize
text--transform-none
```

### Text Decoration
```css
text--underline
text--underline-wavy
text--underline-dotted
text--underline-double
text--underline-dashed
text--overline
text--line-through
text--decoration-none
```

### Text Wrap
```css
balance
unbalance
```

### Line Clamp
```css
line-clamp--1
line-clamp--2
line-clamp--3
line-clamp--4
line-clamp--5
line-clamp--custom
```

---

## Buttons

### Colors
```css
btn--action
btn--primary       btn--primary-light    btn--primary-dark
btn--secondary     btn--secondary-light  btn--secondary-dark
btn--tertiary      btn--tertiary-light   btn--tertiary-dark
btn--accent        btn--accent-light     btn--accent-dark
btn--base          btn--base-light       btn--base-dark
btn--neutral       btn--neutral-light    btn--neutral-dark
btn--black
btn--white
```

### Style modifiers
```css
btn--outline      /* works with any color class */
btn--clear
```

### Sizes
```css
btn--xs
btn--s
btn--m
btn--l
btn--xl
btn--xxl
```

---

## Icons

```css
icon-list
icon--light
icon--dark
icon--boxed
icon--naked
icon--xs
icon--s
icon--m
icon--l
icon--xl
icon--xxl
```

---

## Borders

```css
border
border-light
border-dark
border-top
border-right
border-bottom
border-left
border-block
border-inline
```

---

## Border Radius

```css
/* Rounded (uses border-radius shorthand) */
rounded--xs
rounded--s
rounded--m
rounded--l
rounded--xl
rounded--xxl
rounded--50
rounded--circle

/* Radius (same effect, alternative naming) */
radius--xs
radius--s
radius--m
radius--l
radius--xl
radius--xxl
radius--50
radius--circle
radius--none
```

---

## Shadows

```css
box-shadow--m
box-shadow--l
box-shadow--xl
```

---

## Overlays

```css
overlay-1
overlay-2
overlay-3
overlay-4
overlay-5
```

---

## Textures

```css
texture-1
texture-2
texture-3
texture-4
texture-5
```

---

## Color Scheme

```css
color-scheme--main
color-scheme--alt
```

---

## Opacity

```css
opacity--5
opacity--10
opacity--20
opacity--30
opacity--40
opacity--50
opacity--60
opacity--70
opacity--80
opacity--90
opacity--95
```

---

## Aspect Ratio

```css
aspect--1-1
aspect--1-2
aspect--2-1
aspect--2-3
aspect--3-2
aspect--3-4
aspect--4-3
aspect--16-9
aspect--9-16
```

---

## Object Fit

```css
object-fit--cover
object-fit--contain
object-fit--top-left
object-fit--top-center
object-fit--top-right
object-fit--center-left
object-fit--center-right
object-fit--bottom-left
object-fit--bottom-center
object-fit--bottom-right
```

---

## Breakout

```css
breakout--s
breakout--m
breakout--l
breakout--xl
breakout--full
```

---

## Fades

```css
fade--block
fade--inline
fade--top
fade--right
fade--bottom
fade--left
```

---

## Flip

```css
flip--x
flip--y
flip--xy
flip--both
```

---

## Forms

```css
form--light
form--dark
```

---

## Misc Utilities

```css
clickable-parent
ribbon
smart-spacing
content-width
is-bg
balance
unbalance
```

---

## Frames Utilities (fr- prefix)

These are Frames-specific classes — require Frames plugin installed.

```css
/* Gap utilities */
fr-container-gap
fr-content-gap
fr-grid-gap

/* Typography */
fr-lede              /* constrains lede/lead text width */

/* Spacing */
fr-hero-padding

/* Text colour context */
fr-text--light
fr-text--dark

/* Background context */
fr-bg--light
fr-bg--dark
```

---

## Quick-Pick: Most Common Classes

```css
/* Dark navy section */
bg--shade  section--m

/* Light off-white section */
bg--base-ultra-light  section--m

/* Primary teal section */
bg--primary  section--m

/* Heading */
h2  text--light

/* Body text on dark bg */
text--s  text--light-muted

/* Primary CTA button */
btn--action  btn--l

/* Outline button on dark bg */
btn--outline  btn--l

/* 4-col responsive grid → 2-col → 1-col */
grid--auto-4  grid--stack-even-m

/* 3-col responsive grid */
grid--auto-3  grid--stack-any-m

/* Standard card padding */
padding--m  rounded--m

/* Icon in teal box */
icon--m  icon--boxed

/* Full-width background image */
is-bg
```

---

## Notes

- **Shade vs Neutral**: `bg--shade-*` classes correspond to the `shade` palette color (near-black overlays). The `neutral` palette color (site background) is accessed via contextual classes (`bg--ultra-dark`) or `var(--neutral)` directly.
- **Contextual bg classes** (`bg--ultra-dark`, `bg--dark` etc.) must be configured in ACSS Dashboard → Backgrounds & Text → Backgrounds before they work.
- **Deprecated classes** still function but will be removed in a future ACSS version. Avoid using them in new builds.
- **Grid breakpoint pattern**: `grid--{bp}-{n}` — bp options: `s`, `m`, `l`, `xl`, `xxl`.
- **Cheat sheet source of truth**: ACSS Dashboard → Cheat Sheet tab shows all classes actually generated on your specific install.
