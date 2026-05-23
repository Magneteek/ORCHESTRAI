/**
 * Global class merging and validation.
 *
 * When a page is assembled from multiple sections, their globalClasses arrays
 * must be merged without duplicates.
 *
 * Deduplication rules:
 *  1. Same class ID  → keep first occurrence (the one with more settings wins)
 *  2. _mappedId      → if two entries point to the same _mappedId, keep one
 *  3. ACSS classes   → category:"acss" means the plugin manages CSS; keep the ref
 *
 * Also validates that every class ID referenced in any element's
 * _cssGlobalClasses is defined in the merged classes array.
 * Missing refs are warnings (not errors) — they may exist on the target site.
 */

/**
 * Merge multiple globalClasses arrays into one deduplicated array.
 * @param {Array[]} arrays - each item is one section's globalClasses array
 * @returns {Array} merged, deduplicated globalClasses
 */
function mergeClasses(arrays) {
  const byId      = new Map(); // classId → class object
  const mappedSet = new Set(); // _mappedId values already represented

  const flat = arrays.flat().filter(Boolean);

  for (const cls of flat) {
    if (!cls.id) continue;

    // If a _mappedId alias is already covered, skip this duplicate
    if (cls._mappedId && cls._mappedId !== cls.id && mappedSet.has(cls._mappedId)) {
      continue;
    }

    if (!byId.has(cls.id)) {
      byId.set(cls.id, cls);
      if (cls._mappedId) mappedSet.add(cls._mappedId);
    } else {
      // Keep the richer version (has settings vs empty settings)
      const existing = byId.get(cls.id);
      const existingEmpty = !existing.settings || (Array.isArray(existing.settings) && existing.settings.length === 0) || Object.keys(existing.settings).length === 0;
      const newHasSettings = cls.settings && !Array.isArray(cls.settings) && Object.keys(cls.settings).length > 0;
      if (existingEmpty && newHasSettings) {
        byId.set(cls.id, cls);
      }
    }
  }

  return Array.from(byId.values());
}

/**
 * Check for class IDs referenced in elements but missing from globalClasses.
 * Returns array of warning strings (empty = all clear).
 */
function validateClassRefs(elements, globalClasses) {
  const known = new Set((globalClasses ?? []).map(c => c.id));
  const warnings = [];
  const reported = new Set();

  (elements ?? []).forEach(el => {
    (el.settings?._cssGlobalClasses ?? []).forEach(classId => {
      if (!known.has(classId) && !reported.has(classId)) {
        warnings.push(
          `Class ID "${classId}" referenced in [${el.name}] "${el.label ?? ''}" but not defined in globalClasses. ` +
          `Ensure this class exists on the target site.`
        );
        reported.add(classId);
      }
    });
  });

  return warnings;
}

module.exports = { mergeClasses, validateClassRefs };
