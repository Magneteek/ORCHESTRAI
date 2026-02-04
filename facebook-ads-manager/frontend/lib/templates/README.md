# Dynamic Field System for Ad Templates

Phase 2 implementation of the Facebook Ads Manager enhancement plan.

## Overview

This module provides a robust system for managing dynamic fields in ad templates. It enables template creators to define placeholders that can be customized by users when creating campaigns, allowing for reusable and flexible ad templates.

## Features

- **Dynamic Field Extraction**: Automatically detect `{{field_name}}` placeholders in templates
- **Type-Safe Validation**: Validate field values against type definitions (text, number, url)
- **Field Resolution**: Replace placeholders with actual values throughout template structure
- **JSON Schema Generation**: Export field definitions as JSON Schema for runtime validation
- **Default Values**: Apply default values for optional fields
- **Preview Mode**: Generate sample data for template previews
- **Error Handling**: Comprehensive validation with detailed error messages

## Supported Field Types

- **text**: String values with optional pattern validation
- **number**: Numeric values with min/max constraints
- **url**: Valid URL strings (validated with URL constructor)

## API Reference

### Core Functions

#### `extractDynamicFields(template: AdTemplate): string[]`

Extract all dynamic field names from a template.

```typescript
const fields = extractDynamicFields(template);
// Returns: ['company_name', 'product_name', 'price']
```

#### `validateFieldValues(fields: DynamicField[], values: Record<string, any>): ValidationResult`

Validate field values against field definitions.

```typescript
const result = validateFieldValues(fields, {
  company_name: 'Acme Corp',
  product_name: 'Widget',
  price: 99.99
});

if (!result.valid) {
  for (const error of result.errors) {
    console.error(`${error.field}: ${error.message}`);
  }
}
```

#### `resolveDynamicFields(template: AdTemplate, values: Record<string, any>): ResolvedTemplate`

Replace all dynamic field placeholders with actual values.

```typescript
const resolved = resolveDynamicFields(template, {
  company_name: 'Acme Corp',
  product_name: 'Super Widget',
  price: 99.99
});

// Template placeholders are now replaced with actual values
```

#### `generateFieldSchema(fields: DynamicField[]): JSONSchema`

Generate JSON Schema from field definitions.

```typescript
const schema = generateFieldSchema(fields);
// Use with Ajv or other JSON Schema validators
```

#### `parseFieldDefinitions(dynamicFields: Json): DynamicField[]`

Parse and validate field definitions from JSON.

```typescript
const fields = parseFieldDefinitions(template.dynamicFields);
// Returns typed DynamicField[] with validation
```

### Helper Functions

#### `applyFieldDefaults(fields: DynamicField[], values: Record<string, any>): Record<string, any>`

Apply default values for missing fields.

#### `hasDynamicFields(template: AdTemplate): boolean`

Check if a template contains dynamic fields.

#### `validateTemplateFields(template: AdTemplate, fieldDefinitions: DynamicField[]): ValidationResult`

Validate that all template fields have definitions.

#### `previewTemplate(template: AdTemplate, fields: DynamicField[]): ResolvedTemplate`

Generate preview with sample/placeholder data.

## Type Definitions

### `DynamicField`

```typescript
interface DynamicField {
  name: string;
  type: 'text' | 'number' | 'url';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    min?: number;      // For number type
    max?: number;      // For number type
    pattern?: string;  // For text type (regex)
  };
}
```

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
```

### `ResolvedTemplate`

```typescript
interface ResolvedTemplate {
  adCopy: Json;
  creativeSpecs: Json;
  targetingConfig: Json;
  campaignStructure: Json;
}
```

## Usage Examples

### Basic Template with Dynamic Fields

```typescript
const template: Partial<AdTemplate> = {
  name: 'Product Launch Template',
  adCopy: {
    headline: '{{product_name}} - Now Available!',
    primaryText: 'Get {{discount}}% off at {{company_name}}',
    callToAction: 'SHOP_NOW'
  },
  creativeSpecs: {
    imageUrl: '{{product_image}}',
    format: 'image'
  },
  campaignStructure: {
    budget: '{{daily_budget}}'
  }
};

const fields: DynamicField[] = [
  {
    name: 'company_name',
    type: 'text',
    required: true,
    placeholder: 'Your Company Name'
  },
  {
    name: 'product_name',
    type: 'text',
    required: true
  },
  {
    name: 'discount',
    type: 'number',
    required: true,
    validation: { min: 0, max: 100 },
    defaultValue: 20
  },
  {
    name: 'product_image',
    type: 'url',
    required: true
  },
  {
    name: 'daily_budget',
    type: 'number',
    required: true,
    validation: { min: 5, max: 10000 },
    defaultValue: 50
  }
];
```

### Complete Workflow

```typescript
import {
  extractDynamicFields,
  validateFieldValues,
  resolveDynamicFields,
  applyFieldDefaults,
  DynamicFieldValidationError
} from '@/lib/templates';

async function createAdFromTemplate(
  template: AdTemplate,
  userValues: Record<string, any>
) {
  // 1. Parse field definitions
  const fields = parseFieldDefinitions(template.dynamicFields);

  // 2. Apply defaults
  const values = applyFieldDefaults(fields, userValues);

  // 3. Validate
  const validation = validateFieldValues(fields, values);
  if (!validation.valid) {
    throw new DynamicFieldValidationError(validation.errors);
  }

  // 4. Resolve template
  const resolved = resolveDynamicFields(template, values);

  // 5. Create ad with resolved template
  return createFacebookAd(resolved);
}
```

### Error Handling

```typescript
try {
  const result = validateFieldValues(fields, userValues);

  if (!result.valid) {
    // Display errors to user
    const errorMessages = result.errors.map(
      e => `${e.field}: ${e.message}`
    ).join('\n');

    throw new Error(`Validation failed:\n${errorMessages}`);
  }

  const resolved = resolveDynamicFields(template, userValues);
} catch (error) {
  if (error instanceof DynamicFieldValidationError) {
    // Handle validation error
    for (const err of error.details) {
      console.error(`Field ${err.field}: ${err.message}`);
    }
  }
}
```

## Field Naming Conventions

Dynamic field names must follow these rules:
- Only alphanumeric characters, underscores, and hyphens
- No spaces or special characters
- Case-sensitive matching

Valid examples:
- `{{company_name}}`
- `{{product-price}}`
- `{{discount_percent}}`
- `{{image_url_1}}`

Invalid examples:
- `{{company name}}` (space)
- `{{price$}}` (special char)
- `{{product.name}}` (dot)

## Validation Rules

### Text Fields
- Must be string type
- Optional pattern validation via regex
- Required fields cannot be empty strings

### Number Fields
- Must be valid numbers (not NaN)
- Optional min/max constraints
- Constraints are inclusive

### URL Fields
- Must be string type
- Validated using URL constructor
- Must be valid URL format

## Performance Considerations

- **Deep Cloning**: Uses `structuredClone()` for template resolution
- **Regex Matching**: Efficient pattern matching with pre-compiled regex
- **Validation**: Single-pass validation with early termination
- **Memory**: Safe cloning prevents template mutation

## Integration with Database

Dynamic field definitions are stored in the `dynamicFields` JSON column of the `AdTemplate` table:

```prisma
model AdTemplate {
  id              String   @id @default(uuid())
  dynamicFields   Json?    // Array of DynamicField objects
  // ... other fields
}
```

Example database value:
```json
[
  {
    "name": "company_name",
    "type": "text",
    "required": true,
    "placeholder": "Your Company Name"
  },
  {
    "name": "daily_budget",
    "type": "number",
    "required": true,
    "validation": { "min": 5, "max": 10000 },
    "defaultValue": 50
  }
]
```

## Testing

See `example-usage.ts` for comprehensive examples of all functionality.

## Future Enhancements (Phase 3)

Potential additions for future phases:
- Additional field types (date, enum, boolean)
- Conditional fields (show/hide based on other values)
- Field dependencies and validation rules
- Custom validation functions
- Field groups and sections
- Multi-language placeholder support

## Error Types

### `ValidationError`
Base error for validation failures (422 status code).

### `DynamicFieldValidationError`
Specialized error for dynamic field validation with structured error details.

## TypeScript Support

Full TypeScript support with strict type checking:
- All functions are fully typed
- Return types are explicit
- Generic types for extensibility
- Type guards for runtime safety

## Best Practices

1. **Always validate before resolving**: Run `validateFieldValues()` before `resolveDynamicFields()`
2. **Apply defaults early**: Use `applyFieldDefaults()` immediately after user input
3. **Check template consistency**: Run `validateTemplateFields()` when templates are created/updated
4. **Handle validation errors gracefully**: Display clear error messages to users
5. **Use preview mode**: Show users what the resolved template looks like
6. **Store field definitions in database**: Keep them with the template for consistency

## License

Internal use only - Facebook Ads Manager project.
