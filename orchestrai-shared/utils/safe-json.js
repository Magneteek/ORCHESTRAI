/**
 * Safe JSON utilities for handling large objects and preventing Unicode issues
 */

class SafeJSON {
  /**
   * Safely stringify JSON with error handling for large objects and Unicode issues
   */
  static stringify(obj, replacer = null, space = 2) {
    try {
      // If the object is too large, truncate deeply nested structures
      const result = JSON.stringify(obj, (key, value) => {
        // Custom replacer logic
        if (replacer && typeof replacer === 'function') {
          value = replacer(key, value);
        } else if (replacer && Array.isArray(replacer)) {
          if (!replacer.includes(key)) {
            return undefined;
          }
        }
        
        // Truncate very large strings to prevent Unicode issues
        if (typeof value === 'string' && value.length > 100000) {
          return value.substring(0, 100000) + '... [TRUNCATED]';
        }
        
        // Limit array size for very large arrays
        if (Array.isArray(value) && value.length > 1000) {
          return [...value.slice(0, 1000), `... [${value.length - 1000} more items]`];
        }
        
        // Limit object properties for very large objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const keys = Object.keys(value);
          if (keys.length > 100) {
            const truncated = {};
            for (let i = 0; i < 100; i++) {
              truncated[keys[i]] = value[keys[i]];
            }
            truncated['...'] = `[${keys.length - 100} more properties]`;
            return truncated;
          }
        }
        
        return value;
      }, space);
      
      // Check if result is too large
      if (result && result.length > 1000000) { // 1MB limit
        console.warn('⚠️ JSON string is very large, consider using SafeJSON.truncate()');
      }
      
      return result;
    } catch (error) {
      console.error('❌ JSON stringify error:', error.message);
      
      // Fallback: create a safe representation
      return JSON.stringify({
        error: 'JSON_STRINGIFY_FAILED',
        message: error.message,
        type: typeof obj,
        isArray: Array.isArray(obj),
        keys: obj && typeof obj === 'object' ? Object.keys(obj).slice(0, 10) : undefined,
        stringified: false
      }, null, space);
    }
  }
  
  /**
   * Truncate large objects before stringifying
   */
  static truncate(obj, maxDepth = 5, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      return '[MAX_DEPTH_REACHED]';
    }
    
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length > 50) {
        return [
          ...obj.slice(0, 50).map(item => SafeJSON.truncate(item, maxDepth, currentDepth + 1)),
          `... [${obj.length - 50} more items]`
        ];
      }
      return obj.map(item => SafeJSON.truncate(item, maxDepth, currentDepth + 1));
    }
    
    const keys = Object.keys(obj);
    if (keys.length > 20) {
      const truncated = {};
      for (let i = 0; i < 20; i++) {
        truncated[keys[i]] = SafeJSON.truncate(obj[keys[i]], maxDepth, currentDepth + 1);
      }
      truncated['...'] = `[${keys.length - 20} more properties]`;
      return truncated;
    }
    
    const result = {};
    for (const key of keys) {
      result[key] = SafeJSON.truncate(obj[key], maxDepth, currentDepth + 1);
    }
    return result;
  }
  
  /**
   * Parse JSON with better error handling
   */
  static parse(jsonString, reviver = null) {
    try {
      return JSON.parse(jsonString, reviver);
    } catch (error) {
      console.error('❌ JSON parse error:', error.message);
      
      // Try to identify the issue
      if (error.message.includes('surrogate')) {
        console.warn('⚠️ Unicode surrogate pair issue detected');
        // Attempt to clean the string
        try {
          const cleaned = jsonString.replace(/[\ud800-\udfff]/g, '');
          return JSON.parse(cleaned, reviver);
        } catch (cleanError) {
          console.error('❌ Failed to clean JSON string');
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Safe logging of objects (automatically truncates)
   */
  static log(label, obj, maxDepth = 3) {
    console.log(label, SafeJSON.stringify(SafeJSON.truncate(obj, maxDepth)));
  }
}

module.exports = SafeJSON;