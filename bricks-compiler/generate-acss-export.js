#!/usr/bin/env node
/**
 * generate-acss-export.js
 *
 * Generates a ready-to-import ACSS settings JSON from a simple design-config.yaml.
 * Uses an existing ACSS export as the base template (preserves all option flags,
 * button styles, component settings etc.) and patches only the design tokens.
 *
 * Usage:
 *   node generate-acss-export.js [design-config.yaml] [base-template.json] [output.json]
 *
 * Defaults:
 *   design-config.yaml    → ./design-config.yaml
 *   base-template.json    → ./acss-base-template.json
 *   output.json           → ./acss-export-[timestamp].json
 *
 * Then in WordPress: ACSS → Settings → Import → paste or upload the output JSON.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ─── HSL ↔ Hex helpers ───────────────────────────────────────────────────────

/** Parse "#rrggbb" → { r, g, b } (0–255) */
function parseHex(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Convert { r, g, b } (0–255) → { h, s, l } (h:0–360, s/l:0–100) */
function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default:  h = ((rn - gn) / d + 4) / 6; break;
  }
  // ACSS stores H as integer, S as integer, L with 1 decimal place
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),          // integer — ACSS rounds S to whole number
    l: Math.round(l * 1000) / 10,    // 1 decimal place
  };
}

/** hex → { h, s, l } */
function hexToHsl(hex) {
  return rgbToHsl(parseHex(hex));
}

// ─── ACSS color scale formula ────────────────────────────────────────────────
//
// CONFIRMED from ACSS export analysis:
//   • H and S are identical to the source hex across all shades
//   • L values are FIXED per shade level:
//       ultra-dark=10, dark=25, semi-dark=35, [main], semi-light=65, light=85, ultra-light=95
//   • hover ≈ main_L × 1.15  (for L<50), or main_L + (100-main_L) × 0.05 (for L≥50)
//
// This lets us generate the full 8-shade scale from a single hex value.

const SHADE_L = {
  'ultra-dark':  10,
  'dark':        25,
  'semi-dark':   35,
  'semi-light':  65,
  'light':       85,
  'ultra-light': 95,
};

/**
 * Compute the ACSS hover L value for a given main L.
 * ACSS uses: round(mainL) × 1.15  (verified against export — uses integer mainL, not float)
 */
function hoverL(mainL) {
  return Math.round(mainL) * 1.15;
}

/**
 * Generate all ACSS color scale keys for a named palette color.
 * Returns a flat object of key→value patches to merge into the settings.
 */
function generateColorScale(name, hex) {
  const { h, s } = hexToHsl(hex);
  const mainL = hexToHsl(hex).l;
  const patches = {};

  // Source hex
  patches[`color-${name}`] = hex;

  // Fixed L shades
  for (const [shade, l] of Object.entries(SHADE_L)) {
    patches[`${name}-${shade}-h`] = String(h);
    patches[`${name}-${shade}-s`] = String(s);
    patches[`${name}-${shade}-l`] = String(l);
    // _alt values mirror the main (ACSS dual-mode system, alt = light scheme)
    patches[`${name}-${shade}-h-alt`] = h;
    patches[`${name}-${shade}-s-alt`] = s;
    patches[`${name}-${shade}-l-alt`] = l;
  }

  // Hover
  const hL = hoverL(mainL);
  patches[`${name}-hover-h`] = String(h);
  patches[`${name}-hover-s`] = String(s);
  patches[`${name}-hover-l`] = String(hL);
  patches[`${name}-hover-h-alt`] = h;
  patches[`${name}-hover-s-alt`] = s;
  patches[`${name}-hover-l-alt`] = 1.15;  // ACSS stores alt hover as a multiplier

  return patches;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const [,, configPath, templatePath, outputPath] = process.argv;

  const configFile   = configPath   || 'design-config.yaml';
  const templateFile = templatePath || 'acss-base-template.json';

  if (!fs.existsSync(configFile)) {
    console.error(`❌  Design config not found: ${configFile}`);
    console.error(`    Create a design-config.yaml — see design-config.example.yaml`);
    process.exit(1);
  }
  if (!fs.existsSync(templateFile)) {
    console.error(`❌  Base template not found: ${templateFile}`);
    console.error(`    Export your current ACSS settings from WordPress and save as acss-base-template.json`);
    process.exit(1);
  }

  const config   = yaml.load(fs.readFileSync(configFile, 'utf8'));
  const settings = JSON.parse(fs.readFileSync(templateFile, 'utf8'));

  const patches = {};

  // ── Colors ──────────────────────────────────────────────────────────────────
  const colorNames = ['primary', 'secondary', 'accent', 'action', 'neutral', 'base'];
  for (const name of colorNames) {
    const hex = config.colors?.[name];
    if (!hex) { console.warn(`[WARN] No color.${name} in config — keeping template value`); continue; }
    Object.assign(patches, generateColorScale(name, hex));
    console.log(`  ✅  ${name}: ${hex} → H:${hexToHsl(hex).h} S:${hexToHsl(hex).s}% (scale applied)`);
  }

  // Shade (neutral greyscale) — derived from neutral hue but with S→0
  // ACSS shade is typically a pure greyscale (#1c1c1c) but honours the input if provided
  const shadeHex = config.colors?.shade || '#1c1c1c';
  Object.assign(patches, generateColorScale('shade', shadeHex));
  console.log(`  ✅  shade: ${shadeHex}`);

  // ── Spacing ─────────────────────────────────────────────────────────────────
  const sp = config.spacing || {};
  if (sp.base_max    != null) patches['base-space']             = String(sp.base_max);
  if (sp.base_min    != null) patches['base-space-min']         = String(sp.base_min);
  if (sp.scale       != null) patches['space-scale']            = String(sp.scale);
  if (sp.section_multiplier != null) patches['space-adjust-section'] = String(sp.section_multiplier);
  if (sp.section_x_max != null) patches['section-padding-x-max'] = String(sp.section_x_max);
  if (sp.section_x_min != null) patches['section-padding-x-min'] = String(sp.section_x_min);

  // ── Typography ──────────────────────────────────────────────────────────────
  const ty = config.typography || {};
  if (ty.base_text_desk         != null) patches['base-text-desk']           = String(ty.base_text_desk);
  if (ty.base_text_mob          != null) patches['base-text-mob']            = String(ty.base_text_mob);
  if (ty.heading_scale          != null) patches['heading-scale']            = String(ty.heading_scale);
  if (ty.heading_weight         != null) patches['heading-weight']           = String(ty.heading_weight);
  if (ty.heading_transform      != null) patches['heading-text-transform']   = ty.heading_transform;
  if (ty.heading_letter_spacing != null) patches['heading-letter-spacing']   = ty.heading_letter_spacing;
  if (ty.heading_font_family    != null) patches['heading-font-family']      = ty.heading_font_family;
  if (ty.heading_max_width      != null) patches['heading-max-width']        = ty.heading_max_width;
  if (ty.heading_line_height    != null) patches['heading-spacing']          = ty.heading_line_height;
  if (ty.paragraph_spacing      != null) patches['paragraph-spacing']        = ty.paragraph_spacing;
  if (ty.mob_heading_scale      != null) patches['mob-heading-scale']        = String(ty.mob_heading_scale);
  if (ty.mob_space_scale        != null) patches['mob-space-scale']          = String(ty.mob_space_scale);
  if (ty.body_line_height       != null) patches['body-line-height']         = String(ty.body_line_height);
  if (ty.lede_max_width         != null) patches['fr-lede-width']            = String(ty.lede_max_width);

  // ── Radius ──────────────────────────────────────────────────────────────────
  const ra = config.radius || {};
  if (ra.base  != null) patches['base-radius']    = String(ra.base);
  if (ra.scale != null) patches['radius-scale']   = String(ra.scale);

  // ── Viewport ────────────────────────────────────────────────────────────────
  const vp = config.viewport || {};
  if (vp.max != null) patches['vp-max'] = String(vp.max);
  if (vp.min != null) patches['vp-min'] = String(vp.min);

  // ── Breakpoints ─────────────────────────────────────────────────────────────
  const bp = config.breakpoints || {};
  if (bp.xs != null) patches['breakpoint-xs'] = bp.xs;
  if (bp.s  != null) patches['breakpoint-s']  = bp.s;
  if (bp.m  != null) patches['breakpoint-m']  = bp.m;
  if (bp.l  != null) patches['breakpoint-l']  = bp.l;
  if (bp.xl != null) patches['breakpoint-xl'] = bp.xl;

  // ── Buttons ─────────────────────────────────────────────────────────────────
  const btn = config.buttons || {};
  if (btn.border_width != null) patches['btn-border-width'] = btn.border_width;
  if (btn.min_width    != null) patches['btn-min-width']    = btn.min_width;
  if (btn.text_min     != null) patches['f-btn-text-size-min'] = btn.text_min;
  if (btn.text_max     != null) patches['f-btn-text-size-max'] = btn.text_max;
  if (btn.padding_y    != null) patches['f-btn-padding-y']  = btn.padding_y;
  if (btn.padding_x    != null) patches['f-btn-padding-x']  = btn.padding_x;
  if (btn.font_weight  != null) patches['f-btn-font-weight'] = String(btn.font_weight);
  if (btn.text_transform != null) patches['f-btn-text-transform'] = btn.text_transform;

  // ── Cards ────────────────────────────────────────────────────────────────────
  // fr-card-* = Frames card component tokens (used by all fr-card-* sections)
  // card-*    = ACSS global card tokens (auto-applied to [class*='card'] elements)
  const cards = config.cards || {};
  if (cards.fr_card_radius       != null) patches['fr-card-radius']          = cards.fr_card_radius;
  if (cards.fr_card_border_color != null) patches['fr-card-border-color']    = cards.fr_card_border_color;
  if (cards.fr_card_border_size  != null) patches['fr-card-border-size']     = cards.fr_card_border_size;
  if (cards.fr_card_border_style != null) patches['fr-card-border-style']    = cards.fr_card_border_style;
  if (cards.fr_card_padding      != null) patches['fr-card-padding']         = cards.fr_card_padding;
  if (cards.fr_card_gap          != null) patches['fr-card-gap']             = cards.fr_card_gap;
  if (cards.fr_card_avatar_radius!= null) patches['fr-card-avatar-radius']   = cards.fr_card_avatar_radius;
  if (cards.card_radius          != null) patches['card-radius']             = cards.card_radius;
  if (cards.card_padding         != null) patches['card-padding']            = cards.card_padding;
  if (cards.card_gap             != null) patches['card-gap']                = cards.card_gap;
  if (cards.card_heading_size    != null) patches['card-heading-size']       = cards.card_heading_size;
  if (cards.card_text_size       != null) patches['card-text-size']          = cards.card_text_size;
  if (cards.card_media_aspect    != null) patches['card-media-aspect-ratio'] = cards.card_media_aspect;
  if (cards.card_avatar_size     != null) patches['card-avatar-size']        = cards.card_avatar_size;
  if (cards.card_border_style    != null) patches['card-border-style']       = cards.card_border_style;
  if (cards.card_border_width    != null) patches['card-border-width']       = cards.card_border_width;
  if (cards.card_icon_size       != null) patches['card-icon-size']          = cards.card_icon_size;

  // ── Box Shadows ──────────────────────────────────────────────────────────────
  // ACSS exposes 3 named shadow slots: --shadow-m, --shadow-l, --shadow-xl
  const shadows = config.shadows || {};
  if (shadows.sm  != null) patches['box-shadow-1-value'] = shadows.sm;
  if (shadows.md  != null) patches['box-shadow-2-value'] = shadows.md;
  if (shadows.lg  != null) patches['box-shadow-3-value'] = shadows.lg;

  // ── Icons ────────────────────────────────────────────────────────────────────
  const icons = config.icons || {};
  if (icons.default_theme  != null) patches['icon-default-theme']  = icons.default_theme;
  if (icons.size_m         != null) patches['icon-size-m']         = icons.size_m;
  if (icons.size_l         != null) patches['icon-size-l']         = icons.size_l;
  if (icons.padding        != null) patches['icon-padding']        = icons.padding;
  if (icons.radius         != null) patches['icon-radius']         = icons.radius;

  // ── Scheme & global ─────────────────────────────────────────────────────────
  if (config.scheme != null) patches['website-color-scheme'] = config.scheme;

  // ── Custom global CSS ────────────────────────────────────────────────────────
  if (config.custom_css != null) patches['custom-global-css'] = config.custom_css;

  // ── Update timestamp ────────────────────────────────────────────────────────
  patches['timestamp'] = Math.floor(Date.now() / 1000);

  // ── Merge into settings ──────────────────────────────────────────────────────
  const output = { ...settings, ...patches };

  // ── Write output ─────────────────────────────────────────────────────────────
  const outFile = outputPath || `acss-export-${patches.timestamp}.json`;
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  const patchCount = Object.keys(patches).length;
  console.log(`\n✅  Generated: ${outFile}`);
  console.log(`    ${patchCount} values patched → ${Object.keys(output).length} total keys`);
  console.log(`\n    Import via: WordPress → ACSS → Settings → Import`);
}

main();
