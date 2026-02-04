/**
 * Template utilities for Facebook Ads Manager
 *
 * This module provides utilities for working with ad templates,
 * including dynamic field extraction, validation, and resolution.
 */

export {
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
} from './dynamic-fields';

export type {
  DynamicField,
  ResolvedTemplate,
  ValidationResult,
  JSONSchema,
} from './dynamic-fields';
