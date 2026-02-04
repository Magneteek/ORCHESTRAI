/**
 * Example usage of dynamic field utilities
 *
 * This file demonstrates how to use the dynamic field system
 * for ad template customization.
 */

import type { AdTemplate } from '@prisma/client';
import {
  extractDynamicFields,
  validateFieldValues,
  resolveDynamicFields,
  parseFieldDefinitions,
  applyFieldDefaults,
  validateTemplateFields,
  previewTemplate,
  type DynamicField,
} from './dynamic-fields';

/**
 * Example 1: Creating a template with dynamic fields
 */
export function exampleCreateTemplate() {
  const template: Partial<AdTemplate> = {
    name: 'E-commerce Product Launch',
    category: 'Ecommerce',
    objective: 'CONVERSIONS',
    adCopy: {
      headline: '{{product_name}} - Now Available!',
      primaryText: 'Get {{discount_percent}}% off {{product_name}} for a limited time. Shop now at {{company_name}}!',
      description: 'Limited time offer',
      callToAction: 'SHOP_NOW',
    },
    creativeSpecs: {
      format: 'image',
      imageUrl: '{{product_image_url}}',
      dimensions: {
        width: 1200,
        height: 628,
      },
    },
    targetingConfig: {
      interests: ['Shopping', 'Online Shopping'],
      demographics: {
        ageMin: 25,
        ageMax: 54,
      },
    },
    campaignStructure: {
      budget: '{{daily_budget}}',
      bidStrategy: 'LOWEST_COST_WITH_BID_CAP',
      placements: ['feed', 'story'],
    },
  };

  return template;
}

/**
 * Example 2: Defining dynamic fields for the template
 */
export function exampleFieldDefinitions(): DynamicField[] {
  return [
    {
      name: 'company_name',
      type: 'text',
      required: true,
      placeholder: 'Your Company Name',
    },
    {
      name: 'product_name',
      type: 'text',
      required: true,
      placeholder: 'Product Name',
    },
    {
      name: 'discount_percent',
      type: 'number',
      required: true,
      validation: {
        min: 0,
        max: 100,
      },
      defaultValue: 20,
    },
    {
      name: 'product_image_url',
      type: 'url',
      required: true,
      placeholder: 'https://example.com/product.jpg',
    },
    {
      name: 'daily_budget',
      type: 'number',
      required: true,
      validation: {
        min: 5,
        max: 10000,
      },
      defaultValue: 50,
    },
  ];
}

/**
 * Example 3: Extract dynamic fields from a template
 */
export function exampleExtractFields() {
  const template = exampleCreateTemplate() as AdTemplate;
  const fields = extractDynamicFields(template);

  // Returns: ['company_name', 'daily_budget', 'discount_percent', 'product_image_url', 'product_name']
  return fields;
}

/**
 * Example 4: Validate field values
 */
export function exampleValidateFields() {
  const fields = exampleFieldDefinitions();

  // Valid values
  const validValues = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    discount_percent: 30,
    product_image_url: 'https://example.com/widget.jpg',
    daily_budget: 100,
  };

  const validResult = validateFieldValues(fields, validValues);
  // Returns: { valid: true, errors: [] }

  // Invalid values
  const invalidValues = {
    company_name: 'Acme Corp',
    product_name: '', // Empty required field
    discount_percent: 150, // Exceeds max
    product_image_url: 'not-a-url', // Invalid URL
    daily_budget: 2, // Below minimum
  };

  const invalidResult = validateFieldValues(fields, invalidValues);
  /* Returns: {
    valid: false,
    errors: [
      { field: 'product_name', message: 'Field "product_name" is required' },
      { field: 'discount_percent', message: 'Field "discount_percent" must be at most 100' },
      { field: 'product_image_url', message: 'Field "product_image_url" must be a valid URL' },
      { field: 'daily_budget', message: 'Field "daily_budget" must be at least 5' }
    ]
  } */

  return { validResult, invalidResult };
}

/**
 * Example 5: Resolve template with field values
 */
export function exampleResolveTemplate() {
  const template = exampleCreateTemplate() as AdTemplate;
  const values = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    discount_percent: 30,
    product_image_url: 'https://example.com/widget.jpg',
    daily_budget: 100,
  };

  const resolved = resolveDynamicFields(template, values);

  /* Returns: {
    adCopy: {
      headline: 'Super Widget - Now Available!',
      primaryText: 'Get 30% off Super Widget for a limited time. Shop now at Acme Corp!',
      description: 'Limited time offer',
      callToAction: 'SHOP_NOW'
    },
    creativeSpecs: {
      format: 'image',
      imageUrl: 'https://example.com/widget.jpg',
      dimensions: { width: 1200, height: 628 }
    },
    ...
  } */

  return resolved;
}

/**
 * Example 6: Parse field definitions from JSON
 */
export function exampleParseFieldDefinitions() {
  const jsonFields = [
    {
      name: 'company_name',
      type: 'text',
      required: true,
      placeholder: 'Your Company Name',
    },
    {
      name: 'daily_budget',
      type: 'number',
      required: true,
      validation: {
        min: 5,
        max: 10000,
      },
    },
  ];

  const fields = parseFieldDefinitions(jsonFields);
  // Returns typed DynamicField array
  return fields;
}

/**
 * Example 7: Apply default values
 */
export function exampleApplyDefaults() {
  const fields = exampleFieldDefinitions();
  const partialValues = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    product_image_url: 'https://example.com/widget.jpg',
    // Missing: discount_percent and daily_budget
  };

  const completeValues = applyFieldDefaults(fields, partialValues);

  /* Returns: {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    product_image_url: 'https://example.com/widget.jpg',
    discount_percent: 20,  // Default applied
    daily_budget: 50       // Default applied
  } */

  return completeValues;
}

/**
 * Example 8: Validate template consistency
 */
export function exampleValidateTemplateConsistency() {
  const template = exampleCreateTemplate() as AdTemplate;
  const fields = exampleFieldDefinitions();

  const result = validateTemplateFields(template, fields);
  // Returns: { valid: true, errors: [] }

  // Template with undefined field
  const invalidTemplate = {
    ...template,
    adCopy: {
      headline: '{{undefined_field}} - Check this out!',
    },
  } as AdTemplate;

  const invalidResult = validateTemplateFields(invalidTemplate, fields);
  /* Returns: {
    valid: false,
    errors: [
      {
        field: 'undefined_field',
        message: 'Field "undefined_field" is used in template but not defined'
      }
    ]
  } */

  return { result, invalidResult };
}

/**
 * Example 9: Preview template with sample data
 */
export function examplePreviewTemplate() {
  const template = exampleCreateTemplate() as AdTemplate;
  const fields = exampleFieldDefinitions();

  const preview = previewTemplate(template, fields);

  /* Returns resolved template with placeholders/defaults:
    {
      adCopy: {
        headline: 'Product Name - Now Available!',
        primaryText: 'Get 20% off Product Name for a limited time. Shop now at Your Company Name!',
        ...
      },
      ...
    }
  */

  return preview;
}

/**
 * Example 10: Complete workflow - Create and use template
 */
export async function exampleCompleteWorkflow(
  getTemplate: (id: string) => Promise<AdTemplate>,
  templateId: string
) {
  // 1. Load template from database
  const template = await getTemplate(templateId);

  // 2. Parse field definitions
  const fields = parseFieldDefinitions(template.dynamicFields ?? []);

  // 3. Extract all dynamic fields used in template
  const usedFields = extractDynamicFields(template);

  // 4. Validate template consistency
  const consistencyCheck = validateTemplateFields(template, fields);
  if (!consistencyCheck.valid) {
    throw new Error(`Template has undefined fields: ${consistencyCheck.errors.map(e => e.field).join(', ')}`);
  }

  // 5. Get user input values
  const userValues = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    product_image_url: 'https://example.com/widget.jpg',
  };

  // 6. Apply defaults for missing values
  const completeValues = applyFieldDefaults(fields, userValues);

  // 7. Validate all field values
  const validationResult = validateFieldValues(fields, completeValues);
  if (!validationResult.valid) {
    throw new Error(`Invalid field values: ${JSON.stringify(validationResult.errors)}`);
  }

  // 8. Resolve template with values
  const resolvedTemplate = resolveDynamicFields(template, completeValues);

  // 9. Use resolved template for ad creation
  return resolvedTemplate;
}

/**
 * Example 11: Error handling
 */
export function exampleErrorHandling() {
  const fields = exampleFieldDefinitions();

  try {
    const result = validateFieldValues(fields, {
      company_name: 'Acme',
      product_name: 'Widget',
      discount_percent: 150, // Invalid
      product_image_url: 'not-a-url', // Invalid
      daily_budget: 1, // Invalid
    });

    if (!result.valid) {
      // Handle validation errors
      for (const error of result.errors) {
        // Display to user or log
      }

      throw new Error('Field validation failed');
    }
  } catch (error) {
    if (error instanceof Error) {
      // Handle error
    }
  }
}

/**
 * Example 12: Type-safe field access
 */
export function exampleTypeSafeAccess() {
  interface TemplateFieldValues {
    company_name: string;
    product_name: string;
    discount_percent: number;
    product_image_url: string;
    daily_budget: number;
  }

  const fields = exampleFieldDefinitions();
  const values: TemplateFieldValues = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    discount_percent: 30,
    product_image_url: 'https://example.com/widget.jpg',
    daily_budget: 100,
  };

  // Type-safe validation
  const result = validateFieldValues(fields, values);
  return result;
}
