/**
 * Quick validation script for dynamic field utilities
 * Run this to verify all functions work correctly
 */

import type { AdTemplate } from '@prisma/client';
import {
  extractDynamicFields,
  validateFieldValues,
  resolveDynamicFields,
  generateFieldSchema,
  parseFieldDefinitions,
  applyFieldDefaults,
  hasDynamicFields,
  validateTemplateFields,
  previewTemplate,
  type DynamicField,
} from './dynamic-fields';

function createMockTemplate() {
  return {
    id: 'test-123',
    organizationId: 'org-123',
    name: 'Test Template',
    description: 'Test description',
    category: 'Ecommerce',
    objective: 'CONVERSIONS',
    visibility: 'private',
    version: 1,
    parentTemplateId: null,
    adCopy: {
      headline: '{{product_name}} - Limited Offer!',
      primaryText: 'Get {{discount}}% off at {{company_name}}',
      callToAction: 'SHOP_NOW',
    },
    creativeSpecs: {
      format: 'image',
      imageUrl: '{{product_image}}',
    },
    targetingConfig: {
      interests: ['Shopping'],
    },
    campaignStructure: {
      budget: '{{daily_budget}}',
      bidStrategy: 'LOWEST_COST',
    },
    dynamicFields: null,
    fieldSchema: null,
    isGlobal: false,
    requiresApproval: false,
    isPublic: false,
    timesUsed: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createMockFields(): DynamicField[] {
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
      name: 'discount',
      type: 'number',
      required: true,
      validation: { min: 0, max: 100 },
      defaultValue: 20,
    },
    {
      name: 'product_image',
      type: 'url',
      required: true,
    },
    {
      name: 'daily_budget',
      type: 'number',
      required: true,
      validation: { min: 5, max: 10000 },
      defaultValue: 50,
    },
  ];
}

/**
 * Test 1: Extract dynamic fields
 */
function testExtractFields(): boolean {
  const template = createMockTemplate() as AdTemplate;
  const fields = extractDynamicFields(template);

  const expected = ['company_name', 'daily_budget', 'discount', 'product_image', 'product_name'];
  const passed = JSON.stringify(fields) === JSON.stringify(expected);

  return passed;
}

/**
 * Test 2: Validate field values - Valid case
 */
function testValidateFieldsValid(): boolean {
  const fields = createMockFields();
  const values = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    discount: 30,
    product_image: 'https://example.com/widget.jpg',
    daily_budget: 100,
  };

  const result = validateFieldValues(fields, values);
  return result.valid && result.errors.length === 0;
}

/**
 * Test 3: Validate field values - Invalid case
 */
function testValidateFieldsInvalid(): boolean {
  const fields = createMockFields();
  const values = {
    company_name: 'Acme Corp',
    product_name: '',
    discount: 150,
    product_image: 'not-a-url',
    daily_budget: 2,
  };

  const result = validateFieldValues(fields, values);
  return !result.valid && result.errors.length === 4;
}

/**
 * Test 4: Resolve dynamic fields
 */
function testResolveFields(): boolean {
  const template = createMockTemplate() as AdTemplate;
  const values = {
    company_name: 'Acme Corp',
    product_name: 'Super Widget',
    discount: 30,
    product_image: 'https://example.com/widget.jpg',
    daily_budget: 100,
  };

  const resolved = resolveDynamicFields(template, values);

  const adCopy = resolved.adCopy as any;
  const creativeSpecs = resolved.creativeSpecs as any;
  const campaignStructure = resolved.campaignStructure as any;

  return (
    adCopy.headline === 'Super Widget - Limited Offer!' &&
    adCopy.primaryText === 'Get 30% off at Acme Corp' &&
    creativeSpecs.imageUrl === 'https://example.com/widget.jpg' &&
    campaignStructure.budget === '100'
  );
}

/**
 * Test 5: Generate JSON Schema
 */
function testGenerateSchema(): boolean {
  const fields = createMockFields();
  const schema = generateFieldSchema(fields);

  return (
    schema.type === 'object' &&
    schema.required.length === 5 &&
    schema.properties.company_name.type === 'string' &&
    schema.properties.discount.type === 'number' &&
    schema.properties.discount.minimum === 0 &&
    schema.properties.discount.maximum === 100 &&
    schema.properties.product_image.format === 'uri'
  );
}

/**
 * Test 6: Parse field definitions
 */
function testParseFieldDefinitions(): boolean {
  const jsonFields = [
    {
      name: 'test_field',
      type: 'text',
      required: true,
    },
    {
      name: 'num_field',
      type: 'number',
      required: false,
      defaultValue: 10,
    },
  ];

  try {
    const fields = parseFieldDefinitions(jsonFields);
    return fields.length === 2 && fields[0].name === 'test_field';
  } catch {
    return false;
  }
}

/**
 * Test 7: Apply field defaults
 */
function testApplyDefaults(): boolean {
  const fields = createMockFields();
  const partialValues = {
    company_name: 'Acme Corp',
    product_name: 'Widget',
    product_image: 'https://example.com/image.jpg',
  };

  const complete = applyFieldDefaults(fields, partialValues);

  return (
    complete.company_name === 'Acme Corp' &&
    complete.discount === 20 &&
    complete.daily_budget === 50
  );
}

/**
 * Test 8: Check has dynamic fields
 */
function testHasDynamicFields(): boolean {
  const template = createMockTemplate() as AdTemplate;
  const emptyTemplate = {
    ...template,
    id: 'empty-123',
    adCopy: { headline: 'Static headline' },
    creativeSpecs: {},
    targetingConfig: {},
    campaignStructure: {},
  };

  return hasDynamicFields(template) && !hasDynamicFields(emptyTemplate as AdTemplate);
}

/**
 * Test 9: Validate template fields
 */
function testValidateTemplateFields(): boolean {
  const template = createMockTemplate() as AdTemplate;
  const fields = createMockFields();

  const result = validateTemplateFields(template, fields);
  return result.valid && result.errors.length === 0;
}

/**
 * Test 10: Preview template
 */
function testPreviewTemplate(): boolean {
  const template = createMockTemplate() as AdTemplate;
  const fields = createMockFields();

  const preview = previewTemplate(template, fields);
  const adCopy = preview.adCopy as any;

  return (
    adCopy.headline.includes('Product Name') ||
    adCopy.headline.includes('[product_name]')
  );
}

/**
 * Run all tests
 */
export function runAllTests(): void {
  const tests = [
    { name: 'Extract Dynamic Fields', fn: testExtractFields },
    { name: 'Validate Fields (Valid)', fn: testValidateFieldsValid },
    { name: 'Validate Fields (Invalid)', fn: testValidateFieldsInvalid },
    { name: 'Resolve Dynamic Fields', fn: testResolveFields },
    { name: 'Generate JSON Schema', fn: testGenerateSchema },
    { name: 'Parse Field Definitions', fn: testParseFieldDefinitions },
    { name: 'Apply Field Defaults', fn: testApplyDefaults },
    { name: 'Has Dynamic Fields', fn: testHasDynamicFields },
    { name: 'Validate Template Fields', fn: testValidateTemplateFields },
    { name: 'Preview Template', fn: testPreviewTemplate },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }
}

// For manual testing in Node.js or browser console
if (typeof window === 'undefined' && require.main === module) {
  runAllTests();
}
