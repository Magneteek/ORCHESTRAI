#!/usr/bin/env node
/**
 * split-export.js
 *
 * Splits a multi-section Bricks "copy elements" JSON (where all sections are
 * pasted at once) into individual per-section template files.
 *
 * Usage:
 *   node split-export.js <input.json> [output-dir]
 *
 * Output dir defaults to ./templates/
 * Each section is written as <component-name>.json where the name is derived
 * from the section's label (e.g. "Content Section Zulu" → content-section-zulu).
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputDir = process.argv[3] || path.join(__dirname, 'templates');

if (!inputFile || !fs.existsSync(inputFile)) {
  console.error('Usage: node split-export.js <input.json> [output-dir]');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const allElements   = raw.content       ?? [];
const allClasses    = raw.globalClasses ?? [];
const source        = raw.source        ?? 'bricksCopiedElements';
const sourceUrl     = raw.sourceUrl     ?? '';
const version       = raw.version       ?? '2.3.5';

// Build a fast element-by-ID map
const elementMap = Object.fromEntries(allElements.map(el => [el.id, el]));

// Collect all descendant element IDs (BFS) for a root element ID
function collectDescendants(rootId) {
  const result = [];
  const queue  = [rootId];
  while (queue.length) {
    const id = queue.shift();
    const el = elementMap[id];
    if (!el) continue;
    result.push(el);
    (el.children ?? []).forEach(cid => queue.push(cid));
  }
  return result;
}

// Derive a component name slug from a Bricks label
// "Content Section Zulu" → "content-section-zulu"
function labelToSlug(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Find all root-level section elements
const rootSections = allElements.filter(el => el.parent === 0);

if (!rootSections.length) {
  console.error('No root sections found (parent=0). Make sure the JSON is a Bricks copy export.');
  process.exit(1);
}

console.log(`Found ${rootSections.length} root section(s):\n`);

for (const rootEl of rootSections) {
  const slug = labelToSlug(rootEl.label ?? rootEl.name ?? rootEl.id);
  const elements = collectDescendants(rootEl.id);

  // Collect all class IDs referenced by this section's elements
  const usedClassIds = new Set();
  for (const el of elements) {
    (el.settings?._cssGlobalClasses ?? []).forEach(id => usedClassIds.add(id));
    // Also capture class IDs in nested settings (e.g. icon fill color references)
  }

  // Filter globalClasses to only those used by this section
  const globalClasses = allClasses.filter(cls => usedClassIds.has(cls.id));

  const template = { content: elements, source, sourceUrl, version, globalClasses };
  const outFile  = path.join(outputDir, `${slug}.json`);

  fs.writeFileSync(outFile, JSON.stringify(template, null, 2));
  console.log(`  ✅  ${slug} → ${path.relative(process.cwd(), outFile)} (${elements.length} elements, ${globalClasses.length} classes)`);
}

console.log('\nDone. Review each file then write manifests.');
