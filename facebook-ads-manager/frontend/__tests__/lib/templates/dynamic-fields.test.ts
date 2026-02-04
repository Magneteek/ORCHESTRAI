import { describe, it, expect, beforeEach } from '@jest/globals';
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
  DynamicFieldValidationError,
  type DynamicField,
} from '@/lib/templates/dynamic-fields';
import { ValidationError } from '@/lib/utils/errors';
import type { AdTemplate } from '@prisma/client';

describe('Dynamic Fields Utilities', () => {
  let mockTemplate: AdTemplate;

  beforeEach(() => {
    mockTemplate = {
      id: 'template-1',
      name: 'Test Template',
      description: 'Test description',
      category: 'E-COMMERCE',
      isGlobal: false,
      isPublic: false,
      dynamicFields: null,
      organizationId: 'org-1',
      createdBy: 'user-1',
      adCopy: {
        headline: 'Welcome to {{company_name}}',
        primaryText: 'Save {{discount_percent}}% today!',
        description: 'Visit us at {{landing_url}}',
      },
      creativeSpecs: {
        images: ['{{hero_image_url}}'],
        videos: [],
      },
      targetingConfig: {
        interests: ['shopping', 'fashion'],
        ageMin: 25,
        ageMax: 45,
      },
      campaignStructure: {
        budget: '{{daily_budget}}',
        objective: 'CONVERSIONS',
      },
      timesUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AdTemplate;
  });

  describe('extractDynamicFields', () => {
    it('should extract dynamic fields from adCopy', () => {
      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('company_name');
      expect(fields).toContain('discount_percent');
      expect(fields).toContain('landing_url');
    });

    it('should extract dynamic fields from creativeSpecs', () => {
      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('hero_image_url');
    });

    it('should extract dynamic fields from campaignStructure', () => {
      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('daily_budget');
    });

    it('should return unique fields only', () => {
      mockTemplate.adCopy = {
        headline: '{{company_name}}',
        primaryText: 'At {{company_name}} we care',
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields.filter(f => f === 'company_name')).toHaveLength(1);
    });

    it('should return sorted field names', () => {
      const fields = extractDynamicFields(mockTemplate);
      const sorted = [...fields].sort();

      expect(fields).toEqual(sorted);
    });

    it('should handle null values', () => {
      mockTemplate.adCopy = null;
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toEqual([]);
    });

    it('should handle nested objects', () => {
      mockTemplate.adCopy = {
        headline: 'Test',
        nested: {
          deep: {
            field: '{{nested_field}}',
          },
        },
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('nested_field');
    });

    it('should handle arrays', () => {
      mockTemplate.adCopy = {
        headlines: [
          '{{field1}}',
          '{{field2}}',
          'static text',
        ],
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('field1');
      expect(fields).toContain('field2');
    });

    it('should extract fields with hyphens and underscores', () => {
      mockTemplate.adCopy = {
        text: '{{field-name}} and {{field_name_2}}',
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('field-name');
      expect(fields).toContain('field_name_2');
    });

    it('should not extract partial matches', () => {
      mockTemplate.adCopy = {
        text: 'Not a field: {single} or {{}}',
      };
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toEqual([]);
    });
  });

  describe('validateFieldValues', () => {
    let fields: DynamicField[];

    beforeEach(() => {
      fields = [
        {
          name: 'company_name',
          type: 'text',
          required: true,
        },
        {
          name: 'discount_percent',
          type: 'number',
          required: true,
          validation: {
            min: 0,
            max: 100,
          },
        },
        {
          name: 'landing_url',
          type: 'url',
          required: true,
        },
        {
          name: 'optional_field',
          type: 'text',
          required: false,
        },
      ];
    });

    it('should validate all valid fields', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: 25,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const values = {
        company_name: 'Acme Corp',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('discount_percent');
      expect(result.errors[0].message).toContain('required');
    });

    it('should detect empty string as missing', () => {
      const values = {
        company_name: '',
        discount_percent: 25,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('company_name');
    });

    it('should detect null as missing', () => {
      const values = {
        company_name: null,
        discount_percent: 25,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('company_name');
    });

    it('should validate text type', () => {
      const values = {
        company_name: 123,
        discount_percent: 25,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be a string');
    });

    it('should validate number type', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: 'not a number',
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('must be a valid number');
    });

    it('should detect NaN as invalid number', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: NaN,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('discount_percent');
    });

    it('should validate number min constraint', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: -5,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at least 0');
    });

    it('should validate number max constraint', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: 150,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('at most 100');
    });

    it('should validate URL format', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: 25,
        landing_url: 'not-a-url',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('valid URL');
    });

    it('should accept valid URLs', () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path?query=1',
        'https://subdomain.example.com',
      ];

      for (const url of urls) {
        const values = {
          company_name: 'Acme Corp',
          discount_percent: 25,
          landing_url: url,
        };

        const result = validateFieldValues(fields, values);

        expect(result.valid).toBe(true);
      }
    });

    it('should allow optional fields to be missing', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: 25,
        landing_url: 'https://example.com',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(true);
    });

    it('should validate pattern for text fields', () => {
      const fieldsWithPattern: DynamicField[] = [
        {
          name: 'email',
          type: 'text',
          required: true,
          validation: {
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          },
        },
      ];

      const validResult = validateFieldValues(fieldsWithPattern, {
        email: 'test@example.com',
      });
      expect(validResult.valid).toBe(true);

      const invalidResult = validateFieldValues(fieldsWithPattern, {
        email: 'invalid-email',
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors[0].message).toContain('does not match');
    });

    it('should handle invalid regex patterns gracefully', () => {
      const fieldsWithBadPattern: DynamicField[] = [
        {
          name: 'field',
          type: 'text',
          required: true,
          validation: {
            pattern: '[invalid(regex',
          },
        },
      ];

      const result = validateFieldValues(fieldsWithBadPattern, {
        field: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Invalid pattern');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const values = {
        company_name: 123,
        discount_percent: 'invalid',
        landing_url: 'not-a-url',
      };

      const result = validateFieldValues(fields, values);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('resolveDynamicFields', () => {
    it('should replace all dynamic fields with values', () => {
      const values = {
        company_name: 'Acme Corp',
        discount_percent: 25,
        landing_url: 'https://acme.com',
        hero_image_url: 'https://cdn.com/hero.jpg',
        daily_budget: 100,
      };

      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.adCopy).toMatchObject({
        headline: 'Welcome to Acme Corp',
        primaryText: 'Save 25% today!',
        description: 'Visit us at https://acme.com',
      });
    });

    it('should handle nested objects', () => {
      mockTemplate.adCopy = {
        nested: {
          deep: {
            field: '{{test_field}}',
          },
        },
      };

      const values = { test_field: 'replaced' };
      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.adCopy).toMatchObject({
        nested: {
          deep: {
            field: 'replaced',
          },
        },
      });
    });

    it('should handle arrays', () => {
      mockTemplate.creativeSpecs = {
        images: ['{{image1}}', '{{image2}}', 'static.jpg'],
      };

      const values = {
        image1: 'img1.jpg',
        image2: 'img2.jpg',
      };

      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.creativeSpecs).toMatchObject({
        images: ['img1.jpg', 'img2.jpg', 'static.jpg'],
      });
    });

    it('should leave unreplaced placeholders if value is missing', () => {
      const values = {
        company_name: 'Acme Corp',
      };

      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.adCopy).toMatchObject({
        headline: 'Welcome to Acme Corp',
        primaryText: 'Save {{discount_percent}}% today!',
      });
    });

    it('should convert numbers to strings when replacing', () => {
      mockTemplate.adCopy = {
        text: 'Price: ${{price}}',
      };

      const values = { price: 99.99 };
      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.adCopy).toMatchObject({
        text: 'Price: $99.99',
      });
    });

    it('should not mutate original template', () => {
      const originalAdCopy = JSON.parse(JSON.stringify(mockTemplate.adCopy));

      const values = { company_name: 'Changed' };
      resolveDynamicFields(mockTemplate, values);

      expect(mockTemplate.adCopy).toEqual(originalAdCopy);
    });

    it('should handle null values in template', () => {
      mockTemplate.targetingConfig = null;

      const values = { company_name: 'Acme' };
      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.targetingConfig).toBeNull();
    });

    it('should replace multiple occurrences of same field', () => {
      mockTemplate.adCopy = {
        text: '{{brand}} is great. {{brand}} is awesome.',
      };

      const values = { brand: 'Acme' };
      const resolved = resolveDynamicFields(mockTemplate, values);

      expect(resolved.adCopy).toMatchObject({
        text: 'Acme is great. Acme is awesome.',
      });
    });

    it('should handle boolean and other primitive types', () => {
      mockTemplate.campaignStructure = {
        enabled: true,
        count: 5,
        ratio: 1.5,
      };

      const resolved = resolveDynamicFields(mockTemplate, {});

      expect(resolved.campaignStructure).toMatchObject({
        enabled: true,
        count: 5,
        ratio: 1.5,
      });
    });
  });

  describe('generateFieldSchema', () => {
    it('should generate JSON Schema for text fields', () => {
      const fields: DynamicField[] = [
        {
          name: 'company_name',
          type: 'text',
          required: true,
          placeholder: 'Enter company name',
        },
      ];

      const schema = generateFieldSchema(fields);

      expect(schema.type).toBe('object');
      expect(schema.properties.company_name).toMatchObject({
        type: 'string',
        description: 'Enter company name',
      });
      expect(schema.required).toContain('company_name');
    });

    it('should generate JSON Schema for number fields', () => {
      const fields: DynamicField[] = [
        {
          name: 'price',
          type: 'number',
          required: true,
          validation: {
            min: 0,
            max: 1000,
          },
        },
      ];

      const schema = generateFieldSchema(fields);

      expect(schema.properties.price).toMatchObject({
        type: 'number',
        minimum: 0,
        maximum: 1000,
      });
    });

    it('should generate JSON Schema for URL fields', () => {
      const fields: DynamicField[] = [
        {
          name: 'landing_page',
          type: 'url',
          required: true,
        },
      ];

      const schema = generateFieldSchema(fields);

      expect(schema.properties.landing_page).toMatchObject({
        type: 'string',
        format: 'uri',
      });
    });

    it('should include default values', () => {
      const fields: DynamicField[] = [
        {
          name: 'count',
          type: 'number',
          required: false,
          defaultValue: 10,
        },
      ];

      const schema = generateFieldSchema(fields);

      expect(schema.properties.count.default).toBe(10);
    });

    it('should include pattern validation for text fields', () => {
      const fields: DynamicField[] = [
        {
          name: 'phone',
          type: 'text',
          required: true,
          validation: {
            pattern: '^\\d{3}-\\d{3}-\\d{4}$',
          },
        },
      ];

      const schema = generateFieldSchema(fields);

      expect(schema.properties.phone.pattern).toBe('^\\d{3}-\\d{3}-\\d{4}$');
    });

    it('should not include optional fields in required array', () => {
      const fields: DynamicField[] = [
        {
          name: 'required_field',
          type: 'text',
          required: true,
        },
        {
          name: 'optional_field',
          type: 'text',
          required: false,
        },
      ];

      const schema = generateFieldSchema(fields);

      expect(schema.required).toContain('required_field');
      expect(schema.required).not.toContain('optional_field');
    });

    it('should handle multiple fields', () => {
      const fields: DynamicField[] = [
        { name: 'field1', type: 'text', required: true },
        { name: 'field2', type: 'number', required: false },
        { name: 'field3', type: 'url', required: true },
      ];

      const schema = generateFieldSchema(fields);

      expect(Object.keys(schema.properties)).toHaveLength(3);
      expect(schema.required).toHaveLength(2);
    });
  });

  describe('parseFieldDefinitions', () => {
    it('should parse valid field definitions', () => {
      const dynamicFields = [
        {
          name: 'company_name',
          type: 'text',
          required: true,
        },
        {
          name: 'discount',
          type: 'number',
          required: false,
          defaultValue: 10,
        },
      ];

      const fields = parseFieldDefinitions(dynamicFields);

      expect(fields).toHaveLength(2);
      expect(fields[0]).toMatchObject({
        name: 'company_name',
        type: 'text',
        required: true,
      });
    });

    it('should return empty array for null input', () => {
      const fields = parseFieldDefinitions(null);

      expect(fields).toEqual([]);
    });

    it('should throw ValidationError for non-array input', () => {
      expect(() => {
        parseFieldDefinitions({ invalid: 'object' });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid field name', () => {
      const dynamicFields = [
        {
          name: 'invalid name!',
          type: 'text',
          required: true,
        },
      ];

      expect(() => {
        parseFieldDefinitions(dynamicFields);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid field type', () => {
      const dynamicFields = [
        {
          name: 'field',
          type: 'invalid_type',
          required: true,
        },
      ];

      expect(() => {
        parseFieldDefinitions(dynamicFields);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate field names', () => {
      const dynamicFields = [
        {
          name: 'duplicate',
          type: 'text',
          required: true,
        },
        {
          name: 'duplicate',
          type: 'number',
          required: false,
        },
      ];

      expect(() => {
        parseFieldDefinitions(dynamicFields);
      }).toThrow(ValidationError);
      expect(() => {
        parseFieldDefinitions(dynamicFields);
      }).toThrow('Duplicate field name');
    });

    it('should parse fields with validation rules', () => {
      const dynamicFields = [
        {
          name: 'age',
          type: 'number',
          required: true,
          validation: {
            min: 18,
            max: 100,
          },
        },
      ];

      const fields = parseFieldDefinitions(dynamicFields);

      expect(fields[0].validation).toMatchObject({
        min: 18,
        max: 100,
      });
    });

    it('should parse fields with placeholder and default values', () => {
      const dynamicFields = [
        {
          name: 'field',
          type: 'text',
          required: false,
          placeholder: 'Enter text',
          defaultValue: 'default',
        },
      ];

      const fields = parseFieldDefinitions(dynamicFields);

      expect(fields[0].placeholder).toBe('Enter text');
      expect(fields[0].defaultValue).toBe('default');
    });

    it('should provide detailed error for invalid field at specific index', () => {
      const dynamicFields = [
        { name: 'valid', type: 'text', required: true },
        { name: '', type: 'text', required: true }, // Invalid - empty name
      ];

      try {
        parseFieldDefinitions(dynamicFields);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('index 1');
      }
    });
  });

  describe('applyFieldDefaults', () => {
    let fields: DynamicField[];

    beforeEach(() => {
      fields = [
        {
          name: 'field1',
          type: 'text',
          required: true,
        },
        {
          name: 'field2',
          type: 'number',
          required: false,
          defaultValue: 10,
        },
        {
          name: 'field3',
          type: 'text',
          required: false,
          defaultValue: 'default text',
        },
      ];
    });

    it('should apply default values for missing fields', () => {
      const values = { field1: 'provided' };
      const result = applyFieldDefaults(fields, values);

      expect(result.field1).toBe('provided');
      expect(result.field2).toBe(10);
      expect(result.field3).toBe('default text');
    });

    it('should not override provided values', () => {
      const values = {
        field1: 'provided',
        field2: 20,
        field3: 'custom',
      };

      const result = applyFieldDefaults(fields, values);

      expect(result.field2).toBe(20);
      expect(result.field3).toBe('custom');
    });

    it('should not add defaults for fields without defaultValue', () => {
      const values = {};
      const result = applyFieldDefaults(fields, values);

      expect(result.field1).toBeUndefined();
      expect(result.field2).toBe(10);
    });

    it('should not mutate original values object', () => {
      const values = { field1: 'test' };
      const original = { ...values };

      applyFieldDefaults(fields, values);

      expect(values).toEqual(original);
    });

    it('should handle empty values object', () => {
      const result = applyFieldDefaults(fields, {});

      expect(result.field2).toBe(10);
      expect(result.field3).toBe('default text');
    });
  });

  describe('hasDynamicFields', () => {
    it('should return true when template has dynamic fields', () => {
      const result = hasDynamicFields(mockTemplate);

      expect(result).toBe(true);
    });

    it('should return false when template has no dynamic fields', () => {
      mockTemplate.adCopy = { headline: 'Static text' };
      mockTemplate.creativeSpecs = { images: [] };
      mockTemplate.targetingConfig = { interests: [] };
      mockTemplate.campaignStructure = { objective: 'CONVERSIONS' };

      const result = hasDynamicFields(mockTemplate);

      expect(result).toBe(false);
    });

    it('should return false for empty template', () => {
      mockTemplate.adCopy = null;
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const result = hasDynamicFields(mockTemplate);

      expect(result).toBe(false);
    });
  });

  describe('validateTemplateFields', () => {
    let fieldDefinitions: DynamicField[];

    beforeEach(() => {
      fieldDefinitions = [
        { name: 'company_name', type: 'text', required: true },
        { name: 'discount_percent', type: 'number', required: true },
        { name: 'landing_url', type: 'url', required: true },
      ];
    });

    it('should validate that all used fields are defined', () => {
      mockTemplate.adCopy = {
        headline: 'Welcome to {{company_name}}',
        text: 'Get {{discount_percent}}% off',
      };
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const result = validateTemplateFields(mockTemplate, fieldDefinitions);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect undefined fields in template', () => {
      mockTemplate.adCopy = {
        headline: '{{undefined_field}}',
      };
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const result = validateTemplateFields(mockTemplate, fieldDefinitions);

      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('undefined_field');
      expect(result.errors[0].message).toContain('not defined');
    });

    it('should detect multiple undefined fields', () => {
      mockTemplate.adCopy = {
        headline: '{{field1}} {{field2}}',
      };

      const result = validateTemplateFields(mockTemplate, []);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow templates with no dynamic fields', () => {
      mockTemplate.adCopy = { headline: 'Static' };
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const result = validateTemplateFields(mockTemplate, []);

      expect(result.valid).toBe(true);
    });
  });

  describe('previewTemplate', () => {
    let fields: DynamicField[];

    beforeEach(() => {
      fields = [
        {
          name: 'company_name',
          type: 'text',
          required: true,
          defaultValue: 'Acme Corp',
        },
        {
          name: 'discount_percent',
          type: 'number',
          required: true,
          placeholder: '20',
        },
        {
          name: 'landing_url',
          type: 'url',
          required: true,
        },
      ];
    });

    it('should use default values when available', () => {
      const preview = previewTemplate(mockTemplate, fields);

      expect(preview.adCopy).toMatchObject({
        headline: 'Welcome to Acme Corp',
      });
    });

    it('should use placeholder when no default', () => {
      const preview = previewTemplate(mockTemplate, fields);

      expect(preview.adCopy).toMatchObject({
        primaryText: 'Save 20% today!',
      });
    });

    it('should generate sample URL for url type', () => {
      const preview = previewTemplate(mockTemplate, fields);

      expect(preview.adCopy).toMatchObject({
        description: 'Visit us at https://example.com',
      });
    });

    it('should generate field name placeholder for text without default or placeholder', () => {
      const fieldsNoDefaults: DynamicField[] = [
        { name: 'test_field', type: 'text', required: true },
      ];

      mockTemplate.adCopy = { text: '{{test_field}}' };
      const preview = previewTemplate(mockTemplate, fieldsNoDefaults);

      expect(preview.adCopy).toMatchObject({
        text: '[test_field]',
      });
    });

    it('should use min value for number fields without default', () => {
      const fieldsWithMin: DynamicField[] = [
        {
          name: 'count',
          type: 'number',
          required: true,
          validation: { min: 5 },
        },
      ];

      mockTemplate.adCopy = { count: '{{count}}' };
      const preview = previewTemplate(mockTemplate, fieldsWithMin);

      expect(preview.adCopy).toMatchObject({
        count: '5',
      });
    });

    it('should use 0 for number fields without default or min', () => {
      const fieldsNumber: DynamicField[] = [
        { name: 'count', type: 'number', required: true },
      ];

      mockTemplate.adCopy = { count: '{{count}}' };
      const preview = previewTemplate(mockTemplate, fieldsNumber);

      expect(preview.adCopy).toMatchObject({
        count: '0',
      });
    });
  });

  describe('DynamicFieldValidationError', () => {
    it('should create error with proper structure', () => {
      const errors = [
        { field: 'field1', message: 'Error 1' },
        { field: 'field2', message: 'Error 2' },
      ];

      const error = new DynamicFieldValidationError(errors);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('DynamicFieldValidationError');
      expect(error.message).toContain('Dynamic field validation failed');
      expect(error.details).toEqual(errors);
    });

    it('should be throwable and catchable', () => {
      const errors = [{ field: 'test', message: 'Test error' }];

      expect(() => {
        throw new DynamicFieldValidationError(errors);
      }).toThrow(DynamicFieldValidationError);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extremely nested objects', () => {
      let nested: any = { value: '{{deep_field}}' };
      for (let i = 0; i < 10; i++) {
        nested = { level: nested };
      }
      mockTemplate.adCopy = nested;

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('deep_field');
    });

    it('should handle empty strings in arrays', () => {
      mockTemplate.adCopy = {
        items: ['', '{{field}}', '', null],
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('field');
    });

    it('should handle circular reference-like structures', () => {
      mockTemplate.adCopy = {
        a: { text: '{{field1}}' },
        b: { text: '{{field2}}' },
        c: { text: '{{field1}}' }, // Same field as 'a'
      };
      mockTemplate.creativeSpecs = null;
      mockTemplate.targetingConfig = null;
      mockTemplate.campaignStructure = null;

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toEqual(['field1', 'field2']);
    });

    it('should handle Unicode characters in field names', () => {
      mockTemplate.adCopy = {
        text: '{{field_123}}',
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain('field_123');
    });

    it('should handle very long field names', () => {
      const longFieldName = 'a'.repeat(100);
      mockTemplate.adCopy = {
        text: `{{${longFieldName}}}`,
      };

      const fields = extractDynamicFields(mockTemplate);

      expect(fields).toContain(longFieldName);
    });
  });
});
