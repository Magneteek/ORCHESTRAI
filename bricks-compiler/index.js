/**
 * Bricks Compiler
 *
 * Converts a page spec (list of {component, slots}) into Bricks Builder
 * clipboard JSON — the same format produced when you copy elements in Bricks.
 *
 * Output can be:
 *   a) pasted directly into the Bricks editor (clipboard format)
 *   b) written to WP postmeta _bricks_page_content_2 via REST API / WP-CLI
 *
 * Usage:
 *   const { compilePage } = require('./index');
 *   const result = compilePage(pageSpec);
 *   // result.clipboard  → paste into Bricks
 *   // result.bricks_content + result.bricks_global_classes → write to WP
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { regenIds }         = require('./lib/id-regen');
const { fillSlots }        = require('./lib/slot-fill');
const { cloneArraySlots }  = require('./lib/array-clone');
const { mergeClasses, validateClassRefs } = require('./lib/class-merge');
const { validateSlots }    = require('./lib/validators');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const MANIFESTS_DIR = path.join(__dirname, 'manifests');

// ─── Loaders ──────────────────────────────────────────────────────────────────

function loadTemplate(componentName) {
  const file = path.join(TEMPLATES_DIR, `${componentName}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Template not found: ${file}\nRun: save your Bricks clipboard export as templates/${componentName}.json`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadManifest(componentName) {
  const file = path.join(MANIFESTS_DIR, `${componentName}.yaml`);
  if (!fs.existsSync(file)) {
    throw new Error(`Manifest not found: ${file}\nCreate a slot manifest at manifests/${componentName}.yaml`);
  }
  return yaml.load(fs.readFileSync(file, 'utf8'));
}

// ─── Element stripping ────────────────────────────────────────────────────────

/**
 * Remove elements matching strip_elements rules + all their descendants.
 * Also patches parent containers' children arrays.
 */
function stripElements(elements, rules) {
  if (!rules || !rules.length) return elements;

  const toStrip = new Set();

  elements.forEach(el => {
    const match = rules.some(r =>
      (r.name  && el.name  === r.name)  ||
      (r.label && el.label === r.label)
    );
    if (match) toStrip.add(el.id);
  });

  // Propagate: strip all descendants of stripped elements
  let changed = true;
  while (changed) {
    changed = false;
    elements.forEach(el => {
      if (!toStrip.has(el.id) && el.parent && toStrip.has(el.parent)) {
        toStrip.add(el.id);
        changed = true;
      }
    });
  }

  return elements
    .filter(el => !toStrip.has(el.id))
    .map(el => ({
      ...el,
      children: (el.children ?? []).filter(cid => !toStrip.has(cid)),
    }));
}

// ─── Section compiler ─────────────────────────────────────────────────────────

/**
 * Compile one section: template + slot values → { elements, globalClasses }
 */
function compileSection(componentName, slotValues = {}) {
  const template = loadTemplate(componentName);
  const manifest = loadManifest(componentName);

  // Validate slot values against manifest schema
  const errors = validateSlots(slotValues, manifest.slots);
  if (errors.length) {
    throw new Error(`[${componentName}] Slot validation errors:\n  ${errors.join('\n  ')}`);
  }

  // Deep clone template data — never mutate originals
  let elements     = JSON.parse(JSON.stringify(template.content ?? []));
  const globalClasses = JSON.parse(JSON.stringify(template.globalClasses ?? []));

  // 1. Strip non-content elements (fr-notes, etc.)
  elements = stripElements(elements, manifest.strip_elements);

  // 2. Expand array/compound_array slots (clone subtrees)
  elements = cloneArraySlots(elements, globalClasses, manifest.slots, slotValues);

  // 3. Fill scalar slots (string, html, media, icon, link, insert)
  //    NOTE: must run before regenIds so target_id still resolves original template IDs.
  elements = fillSlots(elements, globalClasses, manifest.slots, slotValues);

  // 4. Regenerate all element IDs (fresh unique IDs per compile — avoids Bricks collisions)
  elements = regenIds(elements);

  // 5. Warn about undefined class references
  const classWarnings = validateClassRefs(elements, globalClasses);
  classWarnings.forEach(w => console.warn(`[WARN][${componentName}] ${w}`));

  return { elements, globalClasses };
}

// ─── Page compiler ────────────────────────────────────────────────────────────

/**
 * Compile a full page from a page spec.
 *
 * Page spec format:
 * {
 *   page_title: "My Page",
 *   slug: "my-page",
 *   sections: [
 *     { component: "feature-section-foxtrot", slots: { heading: "...", ... } },
 *     { component: "content-section-yankee",  slots: { ... } },
 *   ]
 * }
 *
 * Returns:
 * {
 *   page_title, slug,
 *   clipboard: { content, source, sourceUrl, version, globalClasses },  ← paste into Bricks
 *   bricks_content: [...],         ← write to _bricks_page_content_2 postmeta
 *   bricks_global_classes: [...],  ← merge into bricks_global_classes WP option
 * }
 */
function compilePage(pageSpec) {
  const allElements = [];
  const allClassArrays = [];

  for (const section of (pageSpec.sections ?? [])) {
    const { elements, globalClasses } = compileSection(section.component, section.slots);
    allElements.push(...elements);
    allClassArrays.push(globalClasses);
  }

  const mergedClasses = mergeClasses(allClassArrays);

  return {
    page_title: pageSpec.page_title,
    slug:       pageSpec.slug,

    // Full clipboard format — paste directly into Bricks editor
    clipboard: {
      content:      allElements,
      source:       'bricksCopiedElements',
      sourceUrl:    pageSpec.source_url ?? 'https://bricks-compiler.local',
      version:      '2.3.5',
      globalClasses: mergedClasses,
    },

    // Separate arrays for WP REST API / WP-CLI publishing
    bricks_content:        allElements,
    bricks_global_classes: mergedClasses,
  };
}

module.exports = { compilePage, compileSection, loadTemplate, loadManifest };
