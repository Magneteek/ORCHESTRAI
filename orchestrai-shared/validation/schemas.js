/**
 * Zod Validation Schemas for ORCHESTRAI
 *
 * Provides runtime type validation for core data structures.
 * Replaces manual validation checks with declarative schemas.
 *
 * Usage:
 *   const { AgentConfigSchema } = require('./orchestrai-shared/validation/schemas');
 *
 *   const config = AgentConfigSchema.parse(userInput);
 *   // Throws ValidationError if invalid
 *
 * Or use safe parsing:
 *   const result = AgentConfigSchema.safeParse(userInput);
 *   if (!result.success) {
 *     // Handle validation errors: result.error
 *   }
 */

const { z } = require('zod');
const { ValidationError } = require('../errors/typed-errors');

/**
 * Agent Configuration Schema
 *
 * Validates agent initialization configuration
 */
const AgentConfigSchema = z.object({
  name: z.string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Agent name must be lowercase alphanumeric with hyphens'),

  domain: z.string()
    .min(1, 'Domain is required')
    .regex(/^[a-z-]+$/, 'Domain must be lowercase letters with hyphens'),

  capabilities: z.array(z.string()).optional().default([]),

  timeout: z.number()
    .positive('Timeout must be positive')
    .max(600000, 'Timeout must be less than 10 minutes')
    .optional()
    .default(30000),

  retries: z.number()
    .int('Retries must be an integer')
    .min(0, 'Retries cannot be negative')
    .max(5, 'Maximum 5 retries')
    .optional()
    .default(3),

  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),

  memoryEnabled: z.boolean().optional().default(true),

  metadata: z.record(z.any()).optional().default({})
});

/**
 * Pipeline Specification Schema
 *
 * Validates pipeline execution specification
 */
const PipelineSpecSchema = z.object({
  pipelineId: z.string()
    .min(1, 'Pipeline ID is required')
    .regex(/^[a-z0-9-]+$/, 'Pipeline ID must be lowercase alphanumeric with hyphens'),

  projectId: z.string()
    .uuid('Project ID must be a valid UUID')
    .optional(),

  stages: z.array(z.object({
    name: z.string().min(1, 'Stage name is required'),
    agent: z.string().min(1, 'Agent is required'),
    timeout: z.number().positive().optional(),
    retries: z.number().int().min(0).max(5).optional(),
    dependsOn: z.array(z.string()).optional()
  })).min(1, 'At least one stage is required'),

  executionMode: z.enum(['sequential', 'parallel', 'hybrid']).optional().default('sequential'),

  timeout: z.number().positive().optional().default(300000), // 5 minutes

  onError: z.enum(['stop', 'continue', 'retry']).optional().default('stop'),

  metadata: z.record(z.any()).optional().default({})
});

/**
 * Project Metadata Schema
 *
 * Validates project metadata structure
 */
const ProjectMetadataSchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),

  projectName: z.string()
    .min(1, 'Project name is required')
    .max(200, 'Project name must be less than 200 characters'),

  clientId: z.string().optional(),

  domain: z.string().min(1, 'Domain is required'),

  status: z.enum(['planning', 'active', 'completed', 'archived']).default('active'),

  createdAt: z.coerce.date(),

  updatedAt: z.coerce.date(),

  tags: z.array(z.string()).optional().default([]),

  settings: z.object({
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.boolean().default(true)
  }).optional().default({}),

  metadata: z.record(z.any()).optional().default({})
});

/**
 * Memory Node Schema
 *
 * Validates crystalline memory node structure
 */
const MemoryNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),

  type: z.enum(['core', 'domain', 'task', 'observation']),

  data: z.record(z.any()),

  connections: z.array(z.string()).optional().default([]),

  metadata: z.object({
    createdAt: z.coerce.date(),
    accessCount: z.number().int().min(0).default(0),
    lastAccessed: z.coerce.date().optional()
  }).optional(),

  weight: z.number().min(0).max(1).optional().default(0.5),

  tags: z.array(z.string()).optional().default([])
});

/**
 * Task Specification Schema
 *
 * Validates agent task specification
 */
const TaskSpecSchema = z.object({
  taskId: z.string().optional().default(() => require('uuid').v4()),

  type: z.string().min(1, 'Task type is required'),

  description: z.string().optional(),

  input: z.record(z.any()),

  timeout: z.number().positive().optional().default(30000),

  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),

  retries: z.number().int().min(0).max(5).optional().default(3),

  context: z.record(z.any()).optional().default({}),

  metadata: z.record(z.any()).optional().default({})
});

/**
 * API Response Schema
 *
 * Validates API response structure
 */
const APIResponseSchema = z.object({
  success: z.boolean(),

  data: z.any().optional(),

  error: z.object({
    name: z.string(),
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional()
  }).optional(),

  metadata: z.object({
    timestamp: z.coerce.date(),
    executionTime: z.number().optional(),
    requestId: z.string().optional()
  }).optional()
});

/**
 * Webhook Event Schema
 *
 * Validates webhook event payloads
 */
const WebhookEventSchema = z.object({
  event: z.string().min(1, 'Event type is required'),

  timestamp: z.coerce.date(),

  data: z.record(z.any()),

  source: z.string().min(1, 'Event source is required'),

  signature: z.string().optional(),

  metadata: z.record(z.any()).optional().default({})
});

/**
 * Environment Config Schema
 *
 * Validates environment configuration
 */
const EnvironmentConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().int().positive().default(5501),

  REDIS_URL: z.string().url().optional(),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional().default('info'),

  // Add other environment variables as needed
});

/**
 * Validation Helper Functions
 */

/**
 * Validate and throw typed error on failure
 *
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @param {string} context - Context description for error
 * @returns {any} Validated data
 * @throws {ValidationError} If validation fails
 */
function validate(schema, data, context = 'data') {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    throw new ValidationError(
      `${context} validation failed`,
      errors,
      { data }
    );
  }

  return result.data;
}

/**
 * Validate with custom error message
 *
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @param {string} errorMessage - Custom error message
 * @returns {any} Validated data
 * @throws {ValidationError} If validation fails
 */
function validateWithMessage(schema, data, errorMessage) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(errorMessage, result.error.errors, { data });
  }

  return result.data;
}

/**
 * Partial validation (allows optional fields)
 *
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {any} Validated data
 */
function validatePartial(schema, data) {
  return schema.partial().parse(data);
}

/**
 * Create middleware for Express route validation
 *
 * @param {z.ZodSchema} bodySchema - Schema for request body
 * @param {z.ZodSchema} querySchema - Schema for query params
 * @param {z.ZodSchema} paramsSchema - Schema for route params
 * @returns {Function} Express middleware
 */
function createValidationMiddleware(bodySchema, querySchema, paramsSchema) {
  return (req, res, next) => {
    try {
      if (bodySchema) {
        req.body = validate(bodySchema, req.body, 'request body');
      }
      if (querySchema) {
        req.query = validate(querySchema, req.query, 'query parameters');
      }
      if (paramsSchema) {
        req.params = validate(paramsSchema, req.params, 'route parameters');
      }
      next();
    } catch (error) {
      next(error); // Pass to error handler
    }
  };
}

module.exports = {
  // Schemas
  AgentConfigSchema,
  PipelineSpecSchema,
  ProjectMetadataSchema,
  MemoryNodeSchema,
  TaskSpecSchema,
  APIResponseSchema,
  WebhookEventSchema,
  EnvironmentConfigSchema,

  // Helper functions
  validate,
  validateWithMessage,
  validatePartial,
  createValidationMiddleware,

  // Re-export zod for custom schemas
  z
};
