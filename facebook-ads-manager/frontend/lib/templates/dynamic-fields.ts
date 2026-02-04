import { z } from 'zod';
import { ValidationError } from '../utils/errors';
import type { AdTemplate, Prisma } from '@prisma/client';

/**
 * Dynamic field type definition
 */
export interface DynamicField {
  name: string;
  type: 'text' | 'number' | 'url';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

/**
 * Resolved template with all dynamic fields replaced
 */
export interface ResolvedTemplate {
  adCopy: Prisma.JsonValue;
  creativeSpecs: Prisma.JsonValue;
  targetingConfig: Prisma.JsonValue;
  campaignStructure: Prisma.JsonValue;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
}

/**
 * JSON Schema definition for dynamic fields
 */
export interface JSONSchema {
  type: 'object';
  properties: Record<string, any>;
  required: string[];
}

/**
 * Custom validation error for dynamic fields
 */
export class DynamicFieldValidationError extends ValidationError {
  constructor(errors: { field: string; message: string }[]) {
    super('Dynamic field validation failed', errors);
    this.name = 'DynamicFieldValidationError';
  }
}

/**
 * Regular expression to match dynamic field placeholders
 * Matches: {{field_name}}, {{field-name}}, {{field123}}
 */
const DYNAMIC_FIELD_PATTERN = /\{\{([a-zA-Z0-9_-]+)\}\}/g;

/**
 * Zod schema for dynamic field validation
 */
const dynamicFieldSchema = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, 'Field name must contain only alphanumeric characters, underscores, and hyphens'),
  type: z.enum(['text', 'number', 'url']),
  required: z.boolean(),
  placeholder: z.string().optional(),
  defaultValue: z.any().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

/**
 * Extract dynamic field placeholders from a template
 *
 * @param template - The ad template to extract fields from
 * @returns Array of unique field names found in the template
 *
 * @example
 * ```typescript
 * const fields = extractDynamicFields(template);
 * // Returns: ['company_name', 'product_price', 'landing_url']
 * ```
 */
export function extractDynamicFields(template: AdTemplate): string[] {
  const fields = new Set<string>();

  /**
   * Recursively search for dynamic fields in JSON structures
   */
  function searchInValue(value: any): void {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      let match: RegExpExecArray | null;
      const regex = new RegExp(DYNAMIC_FIELD_PATTERN.source, DYNAMIC_FIELD_PATTERN.flags);
      while ((match = regex.exec(value)) !== null) {
        fields.add(match[1]);
      }
    } else if (Array.isArray(value)) {
      value.forEach(searchInValue);
    } else if (typeof value === 'object') {
      Object.values(value).forEach(searchInValue);
    }
  }

  // Search in all template JSON fields
  searchInValue(template.adCopy);
  searchInValue(template.creativeSpecs);
  searchInValue(template.targetingConfig);
  searchInValue(template.campaignStructure);

  return Array.from(fields).sort();
}

/**
 * Validate field values against field definitions
 *
 * @param fields - Array of dynamic field definitions
 * @param values - Record of field values to validate
 * @returns Validation result with errors if any
 *
 * @example
 * ```typescript
 * const result = validateFieldValues(fields, { company_name: 'Acme Corp', product_price: 99.99 });
 * if (!result.valid) {
 *   throw new DynamicFieldValidationError(result.errors);
 * }
 * ```
 */
export function validateFieldValues(
  fields: DynamicField[],
  values: Record<string, any>
): ValidationResult {
  const errors: { field: string; message: string }[] = [];

  for (const field of fields) {
    const value = values[field.name];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: field.name,
        message: `Field "${field.name}" is required`,
      });
      continue;
    }

    // Skip validation if value is not provided and field is optional
    if (!field.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    switch (field.type) {
      case 'text':
        if (typeof value !== 'string') {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be a string`,
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be a valid number`,
          });
        } else {
          // Validate min/max constraints
          if (field.validation?.min !== undefined && value < field.validation.min) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" must be at least ${field.validation.min}`,
            });
          }
          if (field.validation?.max !== undefined && value > field.validation.max) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" must be at most ${field.validation.max}`,
            });
          }
        }
        break;

      case 'url':
        if (typeof value !== 'string') {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" must be a string`,
          });
        } else {
          try {
            new URL(value);
          } catch (e) {
            errors.push({
              field: field.name,
              message: `Field "${field.name}" must be a valid URL`,
            });
          }
        }
        break;
    }

    // Pattern validation for text fields
    if (field.type === 'text' && field.validation?.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: field.name,
            message: `Field "${field.name}" does not match the required pattern`,
          });
        }
      } catch (e) {
        errors.push({
          field: field.name,
          message: `Invalid pattern for field "${field.name}"`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Resolve dynamic fields in a template by replacing placeholders with actual values
 *
 * @param template - The ad template with dynamic fields
 * @param values - Record of field values to substitute
 * @returns Resolved template with all placeholders replaced
 *
 * @example
 * ```typescript
 * const resolved = resolveDynamicFields(template, {
 *   company_name: 'Acme Corp',
 *   product_price: 99.99,
 *   landing_url: 'https://example.com'
 * });
 * ```
 */
export function resolveDynamicFields(
  template: AdTemplate,
  values: Record<string, any>
): ResolvedTemplate {
  /**
   * Deep clone and resolve dynamic fields in any value
   */
  function resolveValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      // Replace all dynamic field placeholders
      return value.replace(DYNAMIC_FIELD_PATTERN, (match, fieldName) => {
        const fieldValue = values[fieldName];

        if (fieldValue === undefined || fieldValue === null) {
          return match;
        }

        // Convert to string for replacement
        return String(fieldValue);
      });
    } else if (Array.isArray(value)) {
      return value.map(resolveValue);
    } else if (typeof value === 'object') {
      const resolved: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = resolveValue(val);
      }
      return resolved;
    }

    return value;
  }

  // Deep clone and resolve all template fields
  return {
    adCopy: resolveValue(structuredClone(template.adCopy)),
    creativeSpecs: resolveValue(structuredClone(template.creativeSpecs)),
    targetingConfig: resolveValue(structuredClone(template.targetingConfig)),
    campaignStructure: resolveValue(structuredClone(template.campaignStructure)),
  };
}

/**
 * Generate JSON Schema from dynamic field definitions
 *
 * @param fields - Array of dynamic field definitions
 * @returns JSON Schema object for validation
 *
 * @example
 * ```typescript
 * const schema = generateFieldSchema(fields);
 * // Use schema for runtime validation with Ajv or similar
 * ```
 */
export function generateFieldSchema(fields: DynamicField[]): JSONSchema {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const field of fields) {
    const property: Record<string, any> = {};

    // Set base type
    switch (field.type) {
      case 'text':
      case 'url':
        property.type = 'string';
        if (field.placeholder) {
          property.description = field.placeholder;
        }
        if (field.type === 'url') {
          property.format = 'uri';
        }
        if (field.validation?.pattern) {
          property.pattern = field.validation.pattern;
        }
        break;

      case 'number':
        property.type = 'number';
        if (field.validation?.min !== undefined) {
          property.minimum = field.validation.min;
        }
        if (field.validation?.max !== undefined) {
          property.maximum = field.validation.max;
        }
        break;
    }

    // Set default value
    if (field.defaultValue !== undefined) {
      property.default = field.defaultValue;
    }

    properties[field.name] = property;

    // Track required fields
    if (field.required) {
      required.push(field.name);
    }
  }

  return {
    type: 'object',
    properties,
    required,
  };
}

/**
 * Parse and validate dynamic field definitions from JSON
 *
 * @param dynamicFields - JSON value containing field definitions
 * @returns Array of validated dynamic field objects
 * @throws {ValidationError} If field definitions are invalid
 *
 * @example
 * ```typescript
 * const fields = parseFieldDefinitions(template.dynamicFields);
 * // Returns typed DynamicField array
 * ```
 */
export function parseFieldDefinitions(dynamicFields: Prisma.JsonValue): DynamicField[] {
  if (!dynamicFields) {
    return [];
  }

  try {
    // Ensure it's an array
    if (!Array.isArray(dynamicFields)) {
      throw new ValidationError('Dynamic fields must be an array', {
        received: typeof dynamicFields,
      });
    }

    // Validate each field definition
    const fields: DynamicField[] = [];
    const fieldNames = new Set<string>();

    for (let i = 0; i < dynamicFields.length; i++) {
      const field = dynamicFields[i];

      try {
        const validated = dynamicFieldSchema.parse(field);

        // Check for duplicate field names
        if (fieldNames.has(validated.name)) {
          throw new ValidationError(`Duplicate field name: "${validated.name}"`, {
            index: i,
            field: validated.name,
          });
        }

        fieldNames.add(validated.name);
        fields.push(validated as DynamicField);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new ValidationError(`Invalid field definition at index ${i}`, {
            index: i,
            errors: error.errors,
          });
        }
        throw error;
      }
    }

    return fields;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError('Failed to parse dynamic field definitions', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Apply default values to field values object
 *
 * @param fields - Array of dynamic field definitions
 * @param values - Partial record of field values
 * @returns Complete record with defaults applied
 *
 * @example
 * ```typescript
 * const complete = applyFieldDefaults(fields, { company_name: 'Acme' });
 * // Returns: { company_name: 'Acme', product_price: 0, ... }
 * ```
 */
export function applyFieldDefaults(
  fields: DynamicField[],
  values: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = { ...values };

  for (const field of fields) {
    if (result[field.name] === undefined && field.defaultValue !== undefined) {
      result[field.name] = field.defaultValue;
    }
  }

  return result;
}

/**
 * Check if a template has any dynamic fields
 *
 * @param template - The ad template to check
 * @returns True if template contains dynamic field placeholders
 *
 * @example
 * ```typescript
 * if (hasDynamicFields(template)) {
 *   const fields = extractDynamicFields(template);
 *   // Handle dynamic fields...
 * }
 * ```
 */
export function hasDynamicFields(template: AdTemplate): boolean {
  return extractDynamicFields(template).length > 0;
}

/**
 * Validate that all dynamic fields in a template have definitions
 *
 * @param template - The ad template to validate
 * @param fieldDefinitions - Array of field definitions
 * @returns Validation result with missing field errors
 *
 * @example
 * ```typescript
 * const result = validateTemplateFields(template, fields);
 * if (!result.valid) {
 *   throw new Error(`Missing field definitions: ${result.errors.map(e => e.field).join(', ')}`);
 * }
 * ```
 */
export function validateTemplateFields(
  template: AdTemplate,
  fieldDefinitions: DynamicField[]
): ValidationResult {
  const usedFields = extractDynamicFields(template);
  const definedFields = new Set(fieldDefinitions.map(f => f.name));
  const errors: { field: string; message: string }[] = [];

  for (const fieldName of usedFields) {
    if (!definedFields.has(fieldName)) {
      errors.push({
        field: fieldName,
        message: `Field "${fieldName}" is used in template but not defined`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a preview of resolved template with sample data
 *
 * @param template - The ad template
 * @param fields - Array of field definitions
 * @returns Resolved template using placeholder or default values
 *
 * @example
 * ```typescript
 * const preview = previewTemplate(template, fields);
 * // Shows template with sample data filled in
 * ```
 */
export function previewTemplate(
  template: AdTemplate,
  fields: DynamicField[]
): ResolvedTemplate {
  const sampleValues: Record<string, any> = {};

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      sampleValues[field.name] = field.defaultValue;
    } else if (field.placeholder) {
      sampleValues[field.name] = field.placeholder;
    } else {
      // Generate sample values based on type
      switch (field.type) {
        case 'text':
          sampleValues[field.name] = `[${field.name}]`;
          break;
        case 'number':
          sampleValues[field.name] = field.validation?.min ?? 0;
          break;
        case 'url':
          sampleValues[field.name] = 'https://example.com';
          break;
      }
    }
  }

  return resolveDynamicFields(template, sampleValues);
}
