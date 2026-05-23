/**
 * Scalar slot filling — handles string, html, media, icon, link, insert types.
 * Array/compound_array slots are handled separately in array-clone.js.
 *
 * Targeting strategy: prefer target_class (robust, works even without labels).
 * Falls back to target_label when target_class is not specified.
 *
 * IMPORTANT: _cssGlobalClasses stores class IDs (short hashes), not names.
 * We build a name→ID map from the template's globalClasses to resolve targets.
 */

/**
 * Build bidirectional class name <-> ID maps from globalClasses array.
 */
function buildClassMap(globalClasses) {
  const nameToId = {};
  const idToName = {};
  (globalClasses || []).forEach(cls => {
    if (cls.id && cls.name) {
      nameToId[cls.name] = cls.id;
      idToName[cls.id] = cls.name;
    }
  });
  return { nameToId, idToName };
}

/**
 * Find the first element that has a given class name (via class ID lookup).
 */
function findByClass(elements, className, classMap) {
  const classId = classMap.nameToId[className];
  if (!classId) return null;
  return elements.find(el => el.settings?._cssGlobalClasses?.includes(classId)) ?? null;
}

/**
 * Find the first element with a given label.
 */
function findByLabel(elements, label) {
  return elements.find(el => el.label === label) ?? null;
}

/**
 * Resolve a slot's target element using target_class or target_label.
 */
function resolveTarget(elements, slotDef, classMap) {
  if (slotDef.target_class) return findByClass(elements, slotDef.target_class, classMap);
  if (slotDef.target_label) return findByLabel(elements, slotDef.target_label);
  return null;
}

/**
 * Apply a single slot value to a target element.
 * Mutates the target element directly (call on a deep-cloned array).
 */
function applySlot(targetEl, slotDef, value) {
  if (!targetEl) return;
  if (!targetEl.settings) targetEl.settings = {};

  switch (slotDef.type) {
    case 'string':
    case 'html':
      targetEl.settings.text = value;
      break;

    case 'media': {
      if (!targetEl.settings.image) targetEl.settings.image = {};
      targetEl.settings.image.url  = value.url;
      targetEl.settings.image.full = value.full ?? value.url;
      if (value.id !== undefined) targetEl.settings.image.id = value.id;
      if (value.filename)         targetEl.settings.image.filename = value.filename;
      targetEl.settings.image.isPlaceholder = false;
      delete targetEl.settings.image.path;   // strip source-server filesystem path
      break;
    }

    case 'icon': {
      if (!targetEl.settings.icon)      targetEl.settings.icon = {};
      if (!targetEl.settings.icon.svg)  targetEl.settings.icon.svg = {};
      targetEl.settings.icon.svg.url  = value.url;
      targetEl.settings.icon.svg.full = value.full ?? value.url;
      if (value.id !== undefined) targetEl.settings.icon.svg.id = value.id;
      targetEl.settings.icon.svg.isPlaceholder = false;
      delete targetEl.settings.icon.svg.path;
      // Keep library, height, width — those are structural styling, not slots
      break;
    }

    case 'link': {
      // Value can be a string URL or {type, url} object
      const url  = typeof value === 'string' ? value : value.url;
      const type = typeof value === 'string' ? 'external' : (value.type ?? 'external');
      targetEl.settings.link = { type, url };
      break;
    }

    case 'insert': {
      // Inserts an arbitrary field that may not exist in the template.
      // slotDef.path is relative to settings, e.g. "link.url"
      if (slotDef.path) {
        const parts = slotDef.path.replace(/^settings\./, '').split('.');
        let obj = targetEl.settings;
        for (let i = 0; i < parts.length - 1; i++) {
          if (obj[parts[i]] == null) obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
      }
      break;
    }

    // 'dynamic' and 'query' are pass-through — never touched
    default:
      break;
  }
}

/**
 * Fill all scalar slots in a (mutable) element array.
 * Array/compound_array slots are skipped here — handled by array-clone.js.
 */
function fillSlots(elements, globalClasses, slotDefs, slotValues) {
  const classMap = buildClassMap(globalClasses);
  const result = JSON.parse(JSON.stringify(elements)); // deep clone

  for (const [slotName, slotDef] of Object.entries(slotDefs ?? {})) {
    // Skip non-scalar slot types
    if (['array', 'compound_array', 'dynamic', 'query'].includes(slotDef.type)) continue;

    const value = slotValues?.[slotName];
    if (value == null) {
      if (slotDef.required) console.warn(`[WARN] Required slot "${slotName}" has no value`);
      continue;
    }

    const target = resolveTarget(result, slotDef, classMap);
    if (!target) {
      console.warn(`[WARN] Slot "${slotName}": target not found (class="${slotDef.target_class}" label="${slotDef.target_label}")`);
      continue;
    }

    applySlot(target, slotDef, value);
  }

  return result;
}

/**
 * Fill item slots within a SUBTREE of cloned elements.
 * Used by array-clone.js when filling per-item values.
 * Mutates the subtree array directly.
 */
function fillSubtreeSlots(subtree, slotDefs, itemValues, classMap) {
  for (const [slotName, slotDef] of Object.entries(slotDefs ?? {})) {
    if (['array', 'compound_array', 'dynamic', 'query'].includes(slotDef.type)) continue;

    const value = itemValues?.[slotName];
    if (value == null) continue;

    const target = resolveTarget(subtree, slotDef, classMap);
    if (!target) continue; // silently skip — target may be in the other branch of compound_array

    applySlot(target, slotDef, value);
  }
  return subtree;
}

module.exports = { fillSlots, fillSubtreeSlots, buildClassMap, findByClass, findByLabel };
