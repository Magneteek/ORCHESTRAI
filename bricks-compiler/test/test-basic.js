/**
 * Basic compiler tests — run with: npm test
 * Tests the Foxtrot section end-to-end and validates output structure.
 */

'use strict';

const { compileSection, compilePage } = require('../index');
const assert = require('assert');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ─── Test data ────────────────────────────────────────────────────────────────

const foxtrotSlots = {
  heading: 'Zobozdravstvene storitve za vso družino',
  accent_heading: 'Naše storitve',
  lede: 'Celostna zobna oskrba od preventivnih pregledov do estetske stomatologije.',
  features: [
    {
      icon: { url: 'https://example.com/icons/preventiva.svg' },
      heading: 'Preventivni pregledi',
      text: 'Redni pregledi in čiščenje zob za dolgoročno zdravje.',
    },
    {
      icon: { url: 'https://example.com/icons/implantati.svg' },
      heading: 'Zobni vsadki',
      text: 'Trajne rešitve za manjkajoče zobe.',
    },
    {
      icon: { url: 'https://example.com/icons/protetika.svg' },
      heading: 'Protetika',
      text: 'Krone, mostički in proteze po meri.',
    },
  ],
  primary_cta_text: 'Naroči se na pregled',
  primary_cta_link: { url: 'https://kriznar.si/narocanje', type: 'external' },
  secondary_cta_text: 'Vse storitve',
  secondary_cta_link: { url: 'https://kriznar.si/storitve', type: 'external' },
};

// ─── Run tests ────────────────────────────────────────────────────────────────

console.log('\n=== Bricks Compiler Tests ===\n');

console.log('── Section: feature-section-foxtrot ──');

let result;
test('compileSection runs without error', () => {
  result = compileSection('feature-section-foxtrot', foxtrotSlots);
  assert.ok(result, 'result is truthy');
});

test('output has elements and globalClasses', () => {
  assert.ok(Array.isArray(result.elements), 'elements is array');
  assert.ok(Array.isArray(result.globalClasses), 'globalClasses is array');
  assert.ok(result.elements.length > 0, 'has elements');
  assert.ok(result.globalClasses.length > 0, 'has globalClasses');
});

test('all element IDs are 6-char alphanumeric', () => {
  result.elements.forEach(el => {
    assert.match(el.id, /^[a-z0-9]{6}$/, `bad ID: ${el.id} on [${el.name}]`);
  });
});

test('no duplicate element IDs', () => {
  const ids = result.elements.map(e => e.id);
  const unique = new Set(ids);
  assert.equal(ids.length, unique.size, 'duplicate IDs found');
});

test('all parent references resolve to existing elements or 0', () => {
  const idSet = new Set(result.elements.map(e => e.id));
  result.elements.forEach(el => {
    if (el.parent !== 0) {
      assert.ok(idSet.has(el.parent), `element ${el.id} has unresolved parent ${el.parent}`);
    }
  });
});

test('all children references resolve to existing elements', () => {
  const idSet = new Set(result.elements.map(e => e.id));
  result.elements.forEach(el => {
    (el.children ?? []).forEach(cid => {
      assert.ok(idSet.has(cid), `element ${el.id} has unresolved child ${cid}`);
    });
  });
});

test('heading slot filled correctly', () => {
  const heading = result.elements.find(el =>
    el.name === 'heading' && el.settings?.text === foxtrotSlots.heading
  );
  assert.ok(heading, 'heading text not found in output');
});

test('accent heading slot filled correctly', () => {
  const el = result.elements.find(e => e.settings?.text === foxtrotSlots.accent_heading);
  assert.ok(el, 'accent heading not found');
});

test('lede slot filled correctly', () => {
  const el = result.elements.find(e => e.settings?.text === foxtrotSlots.lede);
  assert.ok(el, 'lede not found');
});

test('correct number of feature cards cloned (3)', () => {
  const cards = result.elements.filter(el => el.label === 'Feature Card Foxtrot');
  assert.equal(cards.length, 3, `expected 3 cards, got ${cards.length}`);
});

test('feature card headings filled correctly', () => {
  const cardHeadings = result.elements
    .filter(el => el.name === 'heading' && el.settings?._cssGlobalClasses?.includes('zzlqtr'))
    .map(el => el.settings.text);
  assert.deepEqual(
    cardHeadings.sort(),
    foxtrotSlots.features.map(f => f.heading).sort(),
    'card headings mismatch'
  );
});

test('icon urls filled, isPlaceholder cleared, path stripped', () => {
  const icons = result.elements.filter(el => el.name === 'icon');
  assert.equal(icons.length, 3, `expected 3 icons, got ${icons.length}`);
  icons.forEach(el => {
    assert.ok(el.settings.icon.svg.url.startsWith('https://example.com'), 'icon url not filled');
    assert.equal(el.settings.icon.svg.isPlaceholder, false, 'isPlaceholder not cleared');
    assert.equal(el.settings.icon.svg.path, undefined, 'path not stripped');
  });
});

test('primary CTA text and link filled', () => {
  const btn = result.elements.find(el => el.label === 'Primary Action');
  assert.ok(btn, 'Primary Action button not found');
  assert.equal(btn.settings.text, foxtrotSlots.primary_cta_text);
  assert.equal(btn.settings.link?.url, foxtrotSlots.primary_cta_link.url);
});

test('secondary CTA text and link filled', () => {
  const btn = result.elements.find(el => el.label === 'Secondary Action');
  assert.ok(btn, 'Secondary Action button not found');
  assert.equal(btn.settings.text, foxtrotSlots.secondary_cta_text);
  assert.equal(btn.settings.link?.url, foxtrotSlots.secondary_cta_link.url);
});

test('no fr-notes elements in output', () => {
  const notes = result.elements.filter(el => el.name === 'fr-notes');
  assert.equal(notes.length, 0, 'fr-notes not stripped');
});

test('no placeholder paths remain in output', () => {
  const json = JSON.stringify(result.elements);
  assert.ok(!json.includes('cloudwaysapps.com'), 'source server path found in output');
});

test('original template IDs not present (all regened)', () => {
  const originalIds = ['cc333c','842abb','2a21a0','163155','e5bd33','b57956'];
  const outputIds = new Set(result.elements.map(e => e.id));
  originalIds.forEach(oldId => {
    assert.ok(!outputIds.has(oldId), `original template ID ${oldId} still in output`);
  });
});

console.log('\n── Page: compilePage ──');

test('compilePage returns clipboard format', () => {
  const pageSpec = {
    page_title: 'Test Page',
    slug: 'test-page',
    sections: [{ component: 'feature-section-foxtrot', slots: foxtrotSlots }],
  };
  const page = compilePage(pageSpec);
  assert.equal(page.clipboard.source, 'bricksCopiedElements');
  assert.ok(Array.isArray(page.clipboard.content));
  assert.ok(Array.isArray(page.clipboard.globalClasses));
  assert.equal(page.slug, 'test-page');
});

test('validation rejects missing required slot', () => {
  assert.throws(
    () => compileSection('feature-section-foxtrot', { features: [] }),
    /heading.*missing|Required slot/i
  );
});

test('validation rejects too few array items', () => {
  assert.throws(
    () => compileSection('feature-section-foxtrot', {
      heading: 'Test',
      features: [{ heading: 'One', text: 'Only one card', icon: { url: 'x' } }],
    }),
    /min|at least/i
  );
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) process.exit(1);
