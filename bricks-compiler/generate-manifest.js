#!/usr/bin/env node
/**
 * Manifest auto-generator
 *
 * Reads a Bricks clipboard template JSON and outputs a draft YAML manifest.
 * Detects: string, html, media, icon, link, dynamic, array, compound_array slots.
 *
 * Review the draft and adjust:
 *   - required: true  for fields the agent must always fill
 *   - max_length      for copy-length guardrails
 *   - descriptions    for agent context
 *
 * Usage:
 *   node generate-manifest.js templates/my-section.json
 *   node generate-manifest.js templates/my-section.json --print   (stdout only)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const MANIFESTS_DIR = path.join(__dirname, 'manifests');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** class ID → human name map */
function buildIdToName(globalClasses) {
  const m = {};
  (globalClasses || []).forEach(c => { if (c.id && c.name) m[c.id] = c.name; });
  return m;
}

/** Most specific (longest) non-ACSS, non-utility class name for an element */
function bestClassName(el, idToName) {
  const skip = new Set(['btn--primary','btn--outline','focus-parent','clickable-parent']);
  const names = (el.settings?._cssGlobalClasses || [])
    .map(id => idToName[id])
    .filter(n => n && !n.startsWith('acss_import_') && !skip.has(n));
  if (!names.length) return null;
  return names.sort((a, b) => b.length - a.length)[0];
}

/** Derive a snake_case slot name from class name or label */
function slotName(el, idToName) {
  const cls = bestClassName(el, idToName);
  if (cls) {
    // Take the part after the last __ (BEM element)
    const part = cls.includes('__') ? cls.split('__').pop() : cls;
    return part.replace(/-/g, '_').replace(/^fr_/, '');
  }
  if (el.label) return el.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return el.name.replace(/-/g, '_');
}

const PLACEHOLDER_TEXTS = new Set([
  'your heading', 'main features', 'section heading', 'intro heading',
  'feature heading', 'this is just a placeholder', 'lorem ipsum',
  'accent heading', 'short description goes here', 'label',
  'introduce the below text', 'this is a super impactful statement',
  'today is the day', 'call to action', 'primary action', 'secondary action',
  'slide 1', 'slide 2', 'slide 3', 'tab', 'feature one', 'feature two',
  'feature three', 'feature four', 'this is an example heading',
  'this is just placeholder text',
]);

function looksLikePlaceholder(text) {
  if (!text) return false;
  const t = text.toLowerCase().replace(/<[^>]+>/g, '').trim();
  if (PLACEHOLDER_TEXTS.has(t)) return true;
  if (t.startsWith('lorem ipsum')) return true;
  if (t.startsWith('this is just placeholder')) return true;
  if (t.startsWith('placeholder')) return true;
  if (t.length < 80 && (t.includes('your heading') || t.includes('heading'))) return true;
  return false;
}

function isDynamic(text) {
  return typeof text === 'string' && /\{[a-z_]+\}/.test(text);
}

function isContentEl(el) {
  return ['heading','text-basic','text','image','icon','button'].includes(el.name);
}

function isContainerEl(el) {
  return ['section','container','block','div','fr-tabs','fr-slider','fr-slider-controls','fr-notes','code'].includes(el.name);
}

/** Extract a full subtree (root + all descendants) */
function subtree(elements, rootId) {
  const result = [], seen = new Set(), q = [rootId];
  while (q.length) {
    const id = q.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const el = elements.find(e => e.id === id);
    if (el) { result.push(el); (el.children||[]).forEach(c => q.push(c)); }
  }
  return result;
}

// ─── Slot detection ───────────────────────────────────────────────────────────

/**
 * Detect scalar slots from a set of elements.
 * Returns array of slot descriptor objects.
 */
function detectScalars(elements, idToName, opts = {}) {
  const slots = [];
  const seen  = new Set(); // deduplicate by class name

  elements.forEach(el => {
    if (isContainerEl(el)) return;

    const cls   = bestClassName(el, idToName);
    const key   = cls || (el.label || el.name);
    if (seen.has(key)) return;

    // ── image ───────────────────────────────────────────────────────────────
    if (el.name === 'image') {
      const img = el.settings?.image;
      if (!img) return;
      if (isDynamic(img.useDynamicData)) {
        // Dynamic featured image — not a user slot
        seen.add(key);
        slots.push({ name: slotName(el, idToName), type: 'dynamic',
          comment: `dynamic: ${img.useDynamicData}`, el });
        return;
      }
      if (img.isPlaceholder) {
        seen.add(key);
        slots.push({ name: slotName(el, idToName), type: 'media', el,
          target_class: cls, target_label: cls ? undefined : el.label });
      }
      return;
    }

    // ── icon ────────────────────────────────────────────────────────────────
    if (el.name === 'icon') {
      if (el.settings?.icon?.svg?.isPlaceholder) {
        seen.add(key);
        slots.push({ name: slotName(el, idToName), type: 'icon', el,
          target_class: cls, target_label: cls ? undefined : el.label });
      }
      return;
    }

    // ── button ──────────────────────────────────────────────────────────────
    if (el.name === 'button') {
      seen.add(key);
      const baseName = slotName(el, idToName) || (el.label||'cta').toLowerCase().replace(/\s+/g,'_');
      slots.push({ name: `${baseName}_text`, type: 'string', el,
        target_label: el.label, comment: 'Button label' });
      slots.push({ name: `${baseName}_link`, type: 'link', el,
        target_label: el.label, comment: 'Button URL — inserted even if absent in template' });
      return;
    }

    // ── text elements ────────────────────────────────────────────────────────
    if (['heading','text-basic','text'].includes(el.name)) {
      const raw = el.settings?.text || '';
      if (!raw) return;

      if (isDynamic(raw)) {
        seen.add(key);
        slots.push({ name: slotName(el, idToName), type: 'dynamic',
          comment: `dynamic Bricks tag: ${raw.substring(0,40)}`, el });
        return;
      }

      if (!looksLikePlaceholder(raw) && !opts.forceAll) return;

      const isHtml = el.name === 'text' || raw.includes('<p>') || raw.includes('<strong>');
      seen.add(key);
      slots.push({
        name: slotName(el, idToName),
        type: isHtml ? 'html' : 'string',
        el,
        target_class: cls,
        target_label: cls ? undefined : el.label,
      });
    }
  });

  return slots;
}

// ─── Array detection ──────────────────────────────────────────────────────────

/**
 * Find groups of elements with the same label (count > 1) → array slots.
 * Returns array of { label, instances, parentId, templateSubtree }
 */
function detectArrayGroups(elements) {
  const byLabel = {};
  elements.forEach(el => {
    if (!el.label || isContainerEl(el)) return;
    if (!byLabel[el.label]) byLabel[el.label] = [];
    byLabel[el.label].push(el);
  });

  const groups = [];
  for (const [label, instances] of Object.entries(byLabel)) {
    if (instances.length < 2) continue;
    // All must share the same parent
    const parents = new Set(instances.map(e => e.parent));
    if (parents.size !== 1) continue;
    const parentId = [...parents][0];
    const tmpl = subtree(elements, instances[0].id);
    groups.push({ label, instances, parentId, templateSubtree: tmpl });
  }

  return groups;
}

/**
 * Detect fr-tabs compound_array:
 * nav_template = "Navigation Item", content_template = "Tabs Item Wrapper"
 */
function detectTabs(elements) {
  const tabsEl = elements.find(e => e.name === 'fr-tabs');
  if (!tabsEl) return null;

  const navItem     = elements.find(e => e.label === 'Navigation Item');
  const contentItem = elements.find(e => e.label === 'Tabs Item Wrapper');
  if (!navItem || !contentItem) return null;

  const tmplSubtree = subtree(elements, contentItem.id);
  return { navItem, contentItem, tmplSubtree };
}

/**
 * Detect fr-slider(s):
 * Single slider → array of slides
 * Multiple sliders with same syncId → compound_array (TODO comment)
 */
function detectSliders(elements) {
  const sliders = elements.filter(e => e.name === 'fr-slider');
  if (!sliders.length) return null;

  // Check for syncId linking
  const syncIds = sliders.map(s => s.settings?.syncId).filter(Boolean);
  const isSynced = syncIds.length > 0 && new Set(syncIds).size < sliders.length;

  if (isSynced) {
    // Complex synced sliders — flag as TODO
    return { type: 'synced', sliders };
  }

  // Single slider — slides are the repeating element
  const firstSlider = sliders[0];
  const slides = firstSlider.children.map(cid => elements.find(e => e.id === cid)).filter(Boolean);
  if (slides.length < 2) return null;

  const tmplSubtree = subtree(elements, slides[0].id);
  return { type: 'single', slider: firstSlider, slides, templateSubtree: tmplSubtree };
}

// ─── YAML serialiser ──────────────────────────────────────────────────────────

function indent(str, n) {
  return str.split('\n').map(l => ' '.repeat(n) + l).join('\n');
}

function slotToYaml(slot, idToName) {
  const lines = [];

  if (slot.comment) lines.push(`# ${slot.comment}`);

  if (slot.type === 'dynamic') {
    lines.push(`${slot.name}:`);
    lines.push(`  type: dynamic`);
    if (slot.comment) lines.push(`  # ${slot.comment}`);
    return lines.join('\n');
  }

  lines.push(`${slot.name}:`);
  lines.push(`  type: ${slot.type}`);
  lines.push(`  required: false  # set to true if agent must always fill this`);

  if (slot.type === 'string') {
    const guessLen = slot.el?.name === 'heading' ? 80 : 200;
    lines.push(`  max_length: ${guessLen}`);
  }

  if (slot.target_class) lines.push(`  target_class: ${slot.target_class}`);
  if (slot.target_label) lines.push(`  target_label: "${slot.target_label}"`);

  if (slot.type === 'array' || slot.type === 'compound_array') {
    lines.push(`  min: 2`);
    lines.push(`  max: 6`);
    if (slot.template_label)  lines.push(`  template_label: "${slot.template_label}"`);
    if (slot.nav_template)    lines.push(`  nav_template: "${slot.nav_template}"`);
    if (slot.content_template) lines.push(`  content_template: "${slot.content_template}"`);
    if (slot.item_slots?.length) {
      lines.push(`  item_slots:`);
      for (const is of slot.item_slots) {
        lines.push(indent(slotToYaml(is, idToName), 4));
      }
    }
  }

  if (slot.type === 'link') {
    lines.push(`  # Value: { url: "https://...", type?: "external" } or plain URL string`);
    lines.push(`  # Inserted into settings.link even if absent in template`);
  }

  return lines.join('\n');
}

// ─── Main generator ───────────────────────────────────────────────────────────

function generateManifest(templatePath) {
  const raw      = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  const elements = raw.content || [];
  const idToName = buildIdToName(raw.globalClasses);

  const componentName = path.basename(templatePath, '.json');
  const rootSection   = elements.find(e => e.parent === 0 && e.name === 'section');
  const rootLabel     = rootSection?.label || componentName;

  const lines = [];

  lines.push(`# ${rootLabel}`);
  lines.push(`# AUTO-GENERATED — review required/max_length fields before use`);
  lines.push(`# Source: ${raw.sourceUrl || 'unknown'} (Bricks ${raw.version || ''})`);
  lines.push('');
  lines.push(`component: ${componentName}`);
  lines.push(`version: "${raw.version || '2.3.5'}"`);
  lines.push(`description: |`);
  lines.push(`  TODO: describe what this section is for`);
  lines.push('');
  lines.push('slots:');
  lines.push('');

  // ── Collect top-level structural regions ─────────────────────────────────
  // We process intro/header region, then array regions, then CTA region

  const allArrayGroups = detectArrayGroups(elements);
  const arrayRootIds   = new Set(allArrayGroups.flatMap(g => g.instances.map(e => e.id)));
  const tabsInfo       = detectTabs(elements);
  const sliderInfo     = detectSliders(elements);

  const framesWidgets = new Set(
    elements.filter(e => e.name.startsWith('fr-') && e.name !== 'fr-notes').map(e => e.id)
  );

  // ── Top-level non-array, non-widget scalar slots ──────────────────────────
  // Exclude elements that are inside array instances or widget subtrees
  const arraySubtreeIds = new Set(
    allArrayGroups.flatMap(g => g.instances.flatMap(inst => subtree(elements, inst.id).map(e => e.id)))
  );
  const widgetSubtreeIds = new Set(
    elements.filter(e => framesWidgets.has(e.id)).flatMap(e => subtree(elements, e.id).map(x => x.id))
  );

  const topLevel = elements.filter(e =>
    !arraySubtreeIds.has(e.id) &&
    !widgetSubtreeIds.has(e.id)
  );

  const topSlots = detectScalars(topLevel, idToName);

  if (topSlots.length) {
    lines.push(`  # ── Top-level slots ──────────────────────────────────────────────`);
    lines.push('');
    topSlots.forEach(s => {
      lines.push(indent(slotToYaml(s, idToName), 2));
      lines.push('');
    });
  }

  // ── Tabs compound_array ──────────────────────────────────────────────────
  if (tabsInfo) {
    const itemSlots = detectScalars(
      subtree(elements, tabsInfo.contentItem.id),
      idToName, { forceAll: true }
    );
    // Add nav label slot
    const navTabEl = subtree(elements, tabsInfo.navItem.id).find(e => e.label === 'Tab');

    lines.push(`  # ── Tabs ─────────────────────────────────────────────────────────`);
    lines.push('');
    lines.push(`  tabs:`);
    lines.push(`    type: compound_array`);
    lines.push(`    required: false`);
    lines.push(`    min: 2`);
    lines.push(`    max: 6`);
    lines.push(`    nav_template: "Navigation Item"`);
    lines.push(`    content_template: "Tabs Item Wrapper"`);
    lines.push(`    item_slots:`);
    lines.push(`      label:`);
    lines.push(`        type: string`);
    lines.push(`        required: false`);
    lines.push(`        max_length: 30`);
    if (navTabEl) lines.push(`        target_label: "${navTabEl.label}"`);
    lines.push(`        # Tab navigation label`);
    itemSlots.filter(s => s.type !== 'dynamic').forEach(s => {
      lines.push(indent(slotToYaml(s, idToName), 6));
      lines.push('');
    });
    lines.push('');
  }

  // ── fr-slider ────────────────────────────────────────────────────────────
  if (sliderInfo?.type === 'single') {
    const tmpl     = sliderInfo.templateSubtree;
    const itemSlots = detectScalars(tmpl, idToName, { forceAll: true });
    const slideLabel = sliderInfo.slides[0]?.label || 'Slide';

    lines.push(`  # ── Slider slides ────────────────────────────────────────────────`);
    lines.push('');
    lines.push(`  slides:`);
    lines.push(`    type: array`);
    lines.push(`    required: false`);
    lines.push(`    min: 2`);
    lines.push(`    max: 10`);
    lines.push(`    template_label: "${slideLabel}"`);
    lines.push(`    item_slots:`);
    itemSlots.filter(s => s.type !== 'dynamic').forEach(s => {
      lines.push(indent(slotToYaml(s, idToName), 6));
      lines.push('');
    });
    lines.push('');
  }

  if (sliderInfo?.type === 'synced') {
    lines.push(`  # ── Synced sliders (compound_array) ──────────────────────────────`);
    lines.push(`  # TODO: This section has ${sliderInfo.sliders.length} synced fr-slider elements`);
    lines.push(`  # (syncId: ${[...new Set(sliderInfo.sliders.map(s=>s.settings?.syncId))].join(', ')})`);
    lines.push(`  # Manual manifest required — see feature-section-boston.yaml as reference`);
    lines.push(`  slides:`);
    lines.push(`    type: compound_array`);
    lines.push(`    required: false`);
    lines.push(`    nav_template: "Slide (CSS)"     # title/nav slider slide`);
    lines.push(`    content_template: "Slide"        # main content slider slide`);
    lines.push(`    item_slots:`);
    lines.push(`      title:`);
    lines.push(`        type: string`);
    lines.push(`        target_label: "Title"`);
    lines.push(`      heading:`);
    lines.push(`        type: string`);
    lines.push(`        target_label: "Heading"`);
    lines.push(`      text:`);
    lines.push(`        type: string`);
    lines.push(`        target_label: "Accent Heading"  # check label in template`);
    lines.push(`      image:`);
    lines.push(`        type: media`);
    lines.push(`        target_label: "Media"`);
    lines.push('');
  }

  // ── Simple arrays ────────────────────────────────────────────────────────
  for (const group of allArrayGroups) {
    // Skip if this is actually the slide or nav item group (handled above)
    if (tabsInfo && (group.label === 'Navigation Item' || group.label === 'Tabs Item Wrapper')) continue;
    if (sliderInfo && ['Slide','Slide (CSS)'].includes(group.label)) continue;

    const itemSlots = detectScalars(group.templateSubtree, idToName, { forceAll: true });
    const arrName   = group.label.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');

    lines.push(`  # ── ${group.label} (${group.instances.length} in template → array) ────`);
    lines.push('');
    lines.push(`  ${arrName}:`);
    lines.push(`    type: array`);
    lines.push(`    required: false`);
    lines.push(`    min: 2`);
    lines.push(`    max: ${Math.max(group.instances.length + 2, 6)}`);
    lines.push(`    template_label: "${group.label}"`);
    lines.push(`    item_slots:`);
    itemSlots.filter(s => s.type !== 'dynamic').forEach(s => {
      lines.push(indent(slotToYaml(s, idToName), 6));
      lines.push('');
    });
    lines.push('');
  }

  // ── Strip / preserve notes ───────────────────────────────────────────────
  const hasFrNotes = elements.some(e => e.name === 'fr-notes');
  const hasCode    = elements.some(e => e.name === 'code');

  lines.push('# ── Builder-only elements ──────────────────────────────────────────────');
  lines.push('strip_elements:');
  if (hasFrNotes) lines.push('  - name: fr-notes');
  if (!hasFrNotes) lines.push('  [] # none detected');
  lines.push('');
  if (hasCode) {
    lines.push('# code elements are PRESERVED — they contain functional JS (e.g. heading line wrapper)');
  }

  return lines.join('\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const printOnly = args.includes('--print');
const files   = args.filter(a => !a.startsWith('--'));

if (!files.length) {
  // No args — generate for all templates
  const templates = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));
  if (!templates.length) {
    console.error('No templates found in templates/');
    process.exit(1);
  }
  console.log(`Generating manifests for ${templates.length} templates...\n`);
  templates.forEach(f => files.push(path.join(TEMPLATES_DIR, f)));
}

let generated = 0;
for (const file of files) {
  const templatePath = path.resolve(file);
  if (!fs.existsSync(templatePath)) {
    console.error(`Not found: ${templatePath}`);
    continue;
  }

  const componentName = path.basename(templatePath, '.json');
  const outPath       = path.join(MANIFESTS_DIR, `${componentName}.yaml`);

  try {
    const yaml = generateManifest(templatePath);

    if (printOnly) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`# ${componentName}`);
      console.log('='.repeat(60));
      console.log(yaml);
    } else {
      // Don't overwrite hand-edited manifests unless --force
      if (fs.existsSync(outPath) && !args.includes('--force')) {
        console.log(`⏭  Skipped ${componentName}.yaml (already exists — use --force to overwrite)`);
        continue;
      }
      fs.writeFileSync(outPath, yaml);
      const slotCount = (yaml.match(/^  [a-z_]+:/gm) || []).length;
      console.log(`✅ ${componentName}.yaml (${slotCount} slots detected)`);
      generated++;
    }
  } catch (err) {
    console.error(`❌ ${componentName}: ${err.message}`);
  }
}

if (!printOnly) console.log(`\nDone. ${generated} manifest(s) written to manifests/`);
