# Theme Reference — Site Design Tokens

> Generated from ACSS settings export. All values match what the live site resolves.  
> Root font-size: **62.5%** (1rem = 10px) · Viewport: **360px → 1280px** · Scheme: **dark**

---

## Color Palette

Use these CSS variable names in page specs and Bricks styles.

| Variable | Hex | Description |
|---|---|---|
| `--primary` | `#085a7d` | Dark teal — main brand colour |
| `--primary-dark` | `#085678` | Darker teal (dark mode headings, card bg) |
| `--primary-semi-dark` | `#0b79a8` | Mid-dark teal |
| `--primary-hover` | `#09678f` | Hover state |
| `--primary-semi-light` | `#57c5f4` | Light teal |
| `--primary-light` | `#b7e6fa` | Very light teal |
| `--primary-ultra-dark` | `#032230` | Near-black teal |
| `--primary-ultra-light` | `#e7f7fd` | Near-white teal |
| `--secondary` | `#8518ce` | Purple |
| `--secondary-dark` | `#4a0d72` | Deep purple |
| `--secondary-light` | `#dfbbf7` | Lavender |
| `--secondary-ultra-light` | `#f4e8fc` | Near-white purple |
| `--accent` | `#28b5f1` | Light blue (accent) |
| `--accent-hover` | `#33b9f2` | Accent hover |
| `--accent-dark` | `#085678` | Dark accent |
| `--action` | `#a5de21` | Lime green — CTA colour |
| `--action-dark` | `#536f11` | Dark lime |
| `--action-hover` | `#b3e342` | Action hover |
| `--action-ultra-light` | `#f6fce9` | Near-white lime |
| `--neutral` | `#080c0e` | Near-black (body bg, ultra-dark sections) |
| `--neutral-ultra-dark` | `#131c20` | Darkest bg — `bg--ultra-dark` |
| `--neutral-dark` | `#2f4551` | Dark section bg |
| `--neutral-semi-dark` | `#416171` | Mid-dark neutral |
| `--neutral-semi-light` | `#8eaebe` | Light neutral |
| `--neutral-light` | `#cedce3` | Very light neutral |
| `--neutral-ultra-light` | `#eff3f6` | Near-white neutral |
| `--base` | `#878e92` | Body text grey |
| `--base-dark` | `#3d4143` | Dark grey |
| `--base-light` | `#d7d9db` | Light grey |
| `--shade` | `#1c1c1c` | True dark shade |
| `--shade-dark` | `#404040` | Dark shade |
| `--shade-light` | `#d9d9d9` | Light shade |
| `--shade-ultra-light` | `#f2f2f2` | Near-white |
| `--black` | `#000000` | Pure black |
| `--white` | `#ffffff` | Pure white |

**Transparency utilities**: `--black-trans-10/20/30/50` · `--white-trans-10/20/30/50`

---

## Typography

**Base text** (body): `--text-m` = `clamp(1.6rem, calc(0.2174vw + 1.5217rem), 1.8rem)` — 16px → 18px

| Variable | Range | ~px |
|---|---|---|
| `--h1` | `clamp(3.981rem, …, 7.576rem)` | 40px → 76px |
| `--h2` | `clamp(3.318rem, …, 5.683rem)` | 33px → 57px |
| `--h3` | `clamp(2.765rem, …, 4.264rem)` | 28px → 43px |
| `--h4` | `clamp(2.304rem, …, 3.198rem)` | 23px → 32px |
| `--h5` | `clamp(1.92rem, …, 2.399rem)` | 19px → 24px |
| `--h6` | `clamp(1.6rem, …, 1.8rem)` | 16px → 18px |
| `--text-xl` | `clamp(1.8rem, …, 2.4rem)` | 18px → 24px |
| `--text-l` | `clamp(1.44rem, …, 1.8rem)` | 14.4px → 18px |
| `--text-m` | `clamp(1.6rem, …, 1.8rem)` | 16px → 18px |
| `--text-s` | `clamp(1.2rem, …, 1.35rem)` | 12px → 13.5px |

**Heading style**: `font-weight: 600` · `text-transform: uppercase` · `letter-spacing: 0.1em`  
**Heading scale**: 1.333 (Major Third) desktop / 1.2 mobile

---

## Spacing

All values are fluid `clamp()` — scale: **1.5×** per step.

| Variable | Min | Max | ~Pixels |
|---|---|---|---|
| `--space-3xs` | 0.474rem | 0.593rem | 4.7 → 5.9px |
| `--space-2xs` | 0.711rem | 0.889rem | 7.1 → 8.9px |
| `--space-xs` | 1.067rem | 1.333rem | 10.7 → 13.3px |
| `--space-s` | 1.6rem | 2.0rem | 16 → 20px |
| `--space-m` | 2.4rem | 3.0rem | 24 → 30px |
| `--space-l` | 3.6rem | 4.5rem | 36 → 45px |
| `--space-xl` | 5.4rem | 6.75rem | 54 → 67.5px |
| `--space-2xl` | 8.1rem | 10.125rem | 81 → 101px |
| `--space-3xl` | 12.15rem | 15.188rem | 121 → 152px |
| `--space-4xl` | 18.225rem | 22.781rem | 182 → 228px |
| `--space-5xl` | 27.338rem | 34.172rem | 273 → 342px |

**Section padding** (space × 4 multiplier):

| Variable | Min | Max | ~Pixels |
|---|---|---|---|
| `--section-space-xs` | 4.267rem | 5.333rem | 43 → 53px |
| `--section-space-s` | 6.4rem | 8.0rem | 64 → 80px |
| `--section-space-m` *(default)* | 9.6rem | 12.0rem | 96 → 120px |
| `--section-space-l` | 14.4rem | 18.0rem | 144 → 180px |
| `--section-space-xl` | 21.6rem | 27.0rem | 216 → 270px |
| `--section-space-2xl` | 32.4rem | 40.5rem | 324 → 405px |

Default section padding: `--section-padding-block: var(--section-space-m)` (96–120px).

---

## Border Radius

Scale: **1.5×** per step. Base = 1rem = 10px.

| Variable | Value | px |
|---|---|---|
| `--radius-xs` | 0.444rem | 4.4px |
| `--radius-s` | 0.667rem | 6.7px |
| `--radius` | 1.0rem | 10px |
| `--radius-l` | 1.5rem | 15px |
| `--radius-xl` | 2.25rem | 22.5px |

---

## Buttons

| Property | Value |
|---|---|
| Border width | `--btn-border-width: 2.5px` |
| Min width | `--btn-min-width: 140px` |
| Radius | `var(--radius)` = 10px |
| Text size | `clamp(1.4rem, …, 1.8rem)` (14px → 18px) |
| Padding | `0.75em 1.5em` |
| Font weight | 400 |
| Text transform | none (body text, unlike headings) |
| Transition | `.3s ease-in-out` |

**Dark bg default button**: background `var(--action)` (#a5de21) · text `var(--action-ultra-light)`

---

## Breakpoints

| Variable | px | Usage |
|---|---|---|
| `--bp-xs` | 360px | Mobile small |
| `--bp-s` | 480px | Mobile |
| `--bp-m` | 768px | Tablet |
| `--bp-l` | 992px | Tablet landscape |
| `--bp-xl` | 1280px | Desktop (max viewport) |

---

## Key Background Classes

| Class | Colour | Use for |
|---|---|---|
| `bg--ultra-dark` | `--neutral-ultra-dark` (#131c20) | Dark hero / pricing sections |
| `bg--dark` | `--neutral-dark` (#2f4551) | Dark feature sections |
| `bg--light` | `--neutral-ultra-light` (#eff3f6) | Light sections |
| `bg--primary` | `--primary` (#085a7d) | Primary-coloured sections |
| `bg--primary-dark` | `--primary-dark` (#085678) | Darker primary sections |

---

## Design Notes

- **Scheme**: Dark — default background is near-black (`--neutral-ultra-dark` #131c20), not white
- **Primary accent** (`--accent` #28b5f1) shares the same hue as `--primary` — they read as a blue-teal family
- **CTA colour** is `--action` (lime green #a5de21) — use for primary CTA buttons on dark backgrounds
- **Secondary** (purple #8518ce) is a distinct accent for feature highlights
- **Headings** always uppercase, tracked (0.1em letter-spacing), weight 600
- **Borders**: 1px solid with 20% transparency (black or white depending on bg)
- **Cards on dark bg**: background `var(--black)` (#000000), border `var(--border-color-light)`

---

*Full computed CSS custom properties: `theme.css`*  
*Machine-readable design tokens: `theme.yaml`*
