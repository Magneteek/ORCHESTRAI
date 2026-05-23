/**
 * Array slot expansion — handles 'array' and 'compound_array' slot types.
 *
 * array:          simple repeating elements in a single branch (e.g. stat cards)
 * compound_array: two parallel branches that must expand together (e.g. tabs nav+content,
 *                 synced slider main+title)
 *
 * Both run BEFORE the final regenIds pass, so clones get a full ID regen sweep
 * together with the rest of the section elements.
 *
 * _hidden._cssClasses (Frames JS hooks like "fr-tabs__link", "fr-slide splide__slide")
 * are preserved verbatim on every clone — they are wiring strings, not element IDs.
 */

const { genId } = require('./id-regen');
const { buildClassMap, findByClass, findByLabel, fillSubtreeSlots } = require('./slot-fill');

// ─── Subtree helpers ─────────────────────────────────────────────────────────

/**
 * Return the root element + all its descendants from a flat element array.
 */
function extractSubtree(elements, rootId) {
  const result = [];
  const queue  = [rootId];
  const seen   = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const el = elements.find(e => e.id === id);
    if (el) {
      result.push(el);
      if (el.children) queue.push(...el.children);
    }
  }
  return result;
}

/**
 * Deep-clone a subtree and give every element a fresh ID.
 * Parent of the root is set to newParentId.
 * All internal parent/children references are remapped consistently.
 * _hidden._cssClasses strings are preserved as-is.
 */
function cloneSubtree(subtree, newParentId) {
  const idMap = new Map();
  subtree.forEach(el => idMap.set(el.id, genId()));

  return subtree.map(el => {
    const out = JSON.parse(JSON.stringify(el));

    out.id = idMap.get(el.id);

    // Root element gets the new parent; inner elements get remapped parent
    out.parent = (el.id === subtree[0].id)
      ? newParentId
      : (idMap.get(el.parent) ?? el.parent);

    if (Array.isArray(out.children)) {
      out.children = out.children.map(cid => idMap.get(cid) ?? cid);
    }

    // _attributes IDs are internal Bricks references — regen them too
    if (Array.isArray(out.settings?._attributes)) {
      out.settings._attributes = out.settings._attributes.map(attr => ({
        ...attr,
        id: genId(),
      }));
    }

    // _hidden._cssClasses → PRESERVE EXACTLY (Frames JS hooks)
    // (already preserved by JSON deep clone — no action needed)

    return out;
  });
}

// ─── Remove existing instances + their descendants ────────────────────────────

function removeSubtrees(elements, rootIds) {
  const toRemove = new Set();
  rootIds.forEach(id => extractSubtree(elements, id).forEach(el => toRemove.add(el.id)));
  return elements.filter(el => !toRemove.has(el.id));
}

// ─── Simple array ─────────────────────────────────────────────────────────────

/**
 * Find all existing template instances, remove them, clone N new ones.
 * Updates the parent container's children array.
 */
function handleSimpleArray(elements, classMap, slotName, slotDef, items) {
  const templateLabel = slotDef.template_label;
  const existing = elements.filter(el => el.label === templateLabel);

  if (!existing.length) {
    console.warn(`[WARN] array slot "${slotName}": no element with label "${templateLabel}"`);
    return elements;
  }

  const templateRoot   = existing[0];
  const templateSubtree = extractSubtree(elements, templateRoot.id);
  const parentId        = templateRoot.parent;

  // Remove all existing instances
  let result = removeSubtrees(elements, existing.map(e => e.id));

  // Clone N times and fill per-item slots
  const newChildIds   = [];
  const newElements   = [];

  for (const itemValues of items) {
    const clone = cloneSubtree(templateSubtree, parentId);
    fillSubtreeSlots(clone, slotDef.item_slots, itemValues, classMap);
    newChildIds.push(clone[0].id);
    newElements.push(...clone);
  }

  // Update parent's children list (keep other children like CTA wrappers intact)
  result = result.map(el => {
    if (el.id !== parentId) return el;
    // Replace the block of array-item child IDs with the new ones
    // Other children (non-array siblings) are preserved
    const otherChildren = (el.children ?? []).filter(
      cid => !existing.find(e => e.id === cid) // remove old instance IDs
    );
    return { ...el, children: [...otherChildren, ...newChildIds] };
  });

  result.push(...newElements);
  return result;
}

// ─── Compound array ───────────────────────────────────────────────────────────

/**
 * Expand two parallel subtrees (nav + content) together.
 * Both must end up with the same item count.
 *
 * slotDef shape:
 *   nav_template: label of the nav item template element
 *   content_template: label of the content item template element
 *   item_slots: flat map of all per-item slots
 *     (each slot's target_label/target_class resolves within the correct subtree;
 *      missing targets are silently skipped — no need for in: nav/content markers)
 */
function handleCompoundArray(elements, classMap, slotName, slotDef, items) {
  const navLabel     = slotDef.nav_template;
  const contentLabel = slotDef.content_template;

  const navInstances     = elements.filter(el => el.label === navLabel);
  const contentInstances = elements.filter(el => el.label === contentLabel);

  if (!navInstances.length || !contentInstances.length) {
    console.warn(`[WARN] compound_array slot "${slotName}": missing nav ("${navLabel}") or content ("${contentLabel}") template`);
    return elements;
  }

  const navTemplate      = navInstances[0];
  const contentTemplate  = contentInstances[0];
  const navSubtree       = extractSubtree(elements, navTemplate.id);
  const contentSubtree   = extractSubtree(elements, contentTemplate.id);
  const navParentId      = navTemplate.parent;
  const contentParentId  = contentTemplate.parent;

  // Remove all existing instances
  let result = removeSubtrees(elements, [
    ...navInstances.map(e => e.id),
    ...contentInstances.map(e => e.id),
  ]);

  const newNavIds      = [];
  const newContentIds  = [];
  const newElements    = [];

  for (const itemValues of items) {
    // Clone nav subtree and fill nav-side slots
    const navClone = cloneSubtree(navSubtree, navParentId);
    fillSubtreeSlots(navClone, slotDef.item_slots, itemValues, classMap);

    // Clone content subtree and fill content-side slots
    const contentClone = cloneSubtree(contentSubtree, contentParentId);
    fillSubtreeSlots(contentClone, slotDef.item_slots, itemValues, classMap);

    newNavIds.push(navClone[0].id);
    newContentIds.push(contentClone[0].id);
    newElements.push(...navClone, ...contentClone);
  }

  // Update parent containers' children arrays
  result = result.map(el => {
    if (el.id === navParentId) {
      const others = (el.children ?? []).filter(cid => !navInstances.find(e => e.id === cid));
      return { ...el, children: [...others, ...newNavIds] };
    }
    if (el.id === contentParentId) {
      const others = (el.children ?? []).filter(cid => !contentInstances.find(e => e.id === cid));
      return { ...el, children: [...others, ...newContentIds] };
    }
    return el;
  });

  result.push(...newElements);
  return result;
}

// ─── Main entry ───────────────────────────────────────────────────────────────

/**
 * Process all array/compound_array slots in a section's element array.
 * Returns a new array with array items expanded and filled.
 */
function cloneArraySlots(elements, globalClasses, slotDefs, slotValues) {
  const classMap = buildClassMap(globalClasses);
  let result = JSON.parse(JSON.stringify(elements));

  for (const [slotName, slotDef] of Object.entries(slotDefs ?? {})) {
    const items = slotValues?.[slotName];

    if (slotDef.type === 'array') {
      if (!Array.isArray(items) || !items.length) continue;
      result = handleSimpleArray(result, classMap, slotName, slotDef, items);
    } else if (slotDef.type === 'compound_array') {
      if (!Array.isArray(items) || !items.length) continue;
      result = handleCompoundArray(result, classMap, slotName, slotDef, items);
    }
  }

  return result;
}

module.exports = { cloneArraySlots, extractSubtree, cloneSubtree };
