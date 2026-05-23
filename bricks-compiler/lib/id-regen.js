/**
 * ID regeneration — gives every element a fresh 6-char ID on each compile.
 * Bricks IDs are 6-char alphanumeric lowercase (e.g. "9479a4").
 * Parent/children references are remapped to match new IDs.
 * _attributes arrays get fresh IDs too (used for data-* attribute bindings).
 */

function genId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Regenerate all element IDs in-place on a deep clone.
 * @param {Array} elements - flat element array from Bricks clipboard
 * @returns {Array} new array with fresh IDs, parents and children remapped
 */
function regenIds(elements) {
  const idMap = new Map();

  // Pass 1: generate a new ID for every element
  elements.forEach(el => {
    if (el.id) idMap.set(el.id, genId());
  });

  // Pass 2: apply new IDs and remap all references
  return elements.map(el => {
    const out = JSON.parse(JSON.stringify(el));

    // Own ID
    if (out.id) out.id = idMap.get(el.id) ?? out.id;

    // Parent reference (root elements have parent: 0)
    if (out.parent !== 0 && out.parent != null) {
      out.parent = idMap.get(el.parent) ?? el.parent;
    }

    // Children references
    if (Array.isArray(out.children)) {
      out.children = out.children.map(childId => idMap.get(childId) ?? childId);
    }

    // _attributes internal IDs (e.g. data-heading bindings used by Frames JS)
    if (Array.isArray(out.settings?._attributes)) {
      out.settings._attributes = out.settings._attributes.map(attr => ({
        ...attr,
        id: genId(),
      }));
    }

    return out;
  });
}

module.exports = { genId, regenIds };
