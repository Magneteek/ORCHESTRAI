/**
 * Slot value validation against manifest schema.
 * Returns an array of error strings. Empty = valid.
 */

function validateSlots(slotValues, slotDefs) {
  const errors = [];
  const values = slotValues ?? {};

  for (const [name, def] of Object.entries(slotDefs ?? {})) {
    const value = values[name];

    // Required check
    if (def.required && (value == null)) {
      errors.push(`Required slot "${name}" is missing`);
      continue;
    }
    if (value == null) continue; // optional, skip remaining checks

    switch (def.type) {
      case 'string':
      case 'html':
        if (typeof value !== 'string') {
          errors.push(`Slot "${name}": expected string, got ${typeof value}`);
        } else if (def.max_length && value.length > def.max_length) {
          errors.push(`Slot "${name}": ${value.length} chars exceeds max_length ${def.max_length}`);
        }
        break;

      case 'media':
        if (typeof value !== 'object' || !value.url) {
          errors.push(`Slot "${name}": media value must be an object with .url`);
        }
        break;

      case 'icon':
        if (typeof value !== 'object' || !value.url) {
          errors.push(`Slot "${name}": icon value must be an object with .url`);
        }
        break;

      case 'link':
        if (typeof value === 'string') break; // bare URL string is fine
        if (typeof value !== 'object' || !value.url) {
          errors.push(`Slot "${name}": link value must be a URL string or { url, type? } object`);
        }
        break;

      case 'array':
      case 'compound_array':
        if (!Array.isArray(value)) {
          errors.push(`Slot "${name}": expected array, got ${typeof value}`);
          break;
        }
        if (def.min != null && value.length < def.min) {
          errors.push(`Slot "${name}": needs at least ${def.min} items (got ${value.length})`);
        }
        if (def.max != null && value.length > def.max) {
          errors.push(`Slot "${name}": max ${def.max} items (got ${value.length})`);
        }
        // Validate each item's required sub-slots
        if (def.item_slots) {
          value.forEach((item, i) => {
            for (const [subName, subDef] of Object.entries(def.item_slots)) {
              if (subDef.required && item[subName] == null) {
                errors.push(`Slot "${name}[${i}].${subName}": required but missing`);
              }
            }
          });
        }
        break;

      // dynamic, query, insert — no validation
      default:
        break;
    }
  }

  return errors;
}

module.exports = { validateSlots };
