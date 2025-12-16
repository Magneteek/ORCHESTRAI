/**
 * Typed Error Hierarchy for ORCHESTRAI
 *
 * Provides consistent, predictable error handling across the system.
 * Replaces inconsistent throw/reject/silent failure patterns.
 *
 * Error Categories:
 * 1. RecoverableError - System can continue in degraded mode
 * 2. CriticalError - System cannot continue, requires intervention
 * 3. ValidationError - Input validation failed
 * 4. ConfigurationError - Configuration problem
 * 5. NetworkError - External service/network failure
 * 6. TimeoutError - Operation exceeded time limit
 * 7. ResourceError - Resource unavailable (memory, disk, etc.)
 *
 * Usage:
 *   throw new RecoverableError('MCP server unavailable', null, { service: 'mcp' });
 *   throw new CriticalError('Redis connection lost', { redisHost, redisPort });
 *   throw new ValidationError('Invalid agent config', validationErrors, { agentName });
 */

const logger = require('../logging/logger');

/**
 * Base Error Class
 * All ORCHESTRAI errors extend this
 */
class OrchestRAIError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for logging/transmission
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * Log this error with appropriate level
   */
  log(level = 'error') {
    logger[level](this.message, {
      error: this.name,
      context: this.context,
      stack: this.stack
    });
  }
}

/**
 * Recoverable Error
 *
 * System can continue operating, possibly in degraded mode.
 * Caller should handle gracefully (fallback, retry, etc.)
 *
 * Properties:
 * - recoverable: true
 * - fallback: Optional fallback value to use
 * - retryable: Whether operation can be retried
 *
 * @example
 *   try {
 *     await connectToMCP();
 *   } catch (error) {
 *     if (error.recoverable) {
 *       // Use fallback mode
 *       return error.fallback || useLocalMode();
 *     }
 *     throw error;
 *   }
 */
class RecoverableError extends OrchestRAIError {
  constructor(message, fallback = null, context = {}, retryable = false) {
    super(message, context);
    this.recoverable = true;
    this.fallback = fallback;
    this.retryable = retryable;
  }

  log() {
    super.log('warn'); // Recoverable errors are warnings
  }
}

/**
 * Critical Error
 *
 * System cannot continue operating safely.
 * Requires immediate intervention or shutdown.
 *
 * Properties:
 * - critical: true
 * - requiresShutdown: Whether system should shut down
 * - severity: HIGH, CRITICAL, FATAL
 *
 * @example
 *   throw new CriticalError(
 *     'Redis connection lost',
 *     { redisHost, redisPort },
 *     'CRITICAL',
 *     true  // requires shutdown
 *   );
 */
class CriticalError extends OrchestRAIError {
  constructor(message, context = {}, severity = 'HIGH', requiresShutdown = false) {
    super(message, context);
    this.critical = true;
    this.severity = severity;
    this.requiresShutdown = requiresShutdown;
  }

  log() {
    const level = this.severity === 'FATAL' ? 'fatal' : 'error';
    super.log(level);
  }
}

/**
 * Validation Error
 *
 * Input validation failed (schema validation, type checking, etc.)
 *
 * Properties:
 * - validationErrors: Array of specific validation failures
 * - field: Which field failed validation (if applicable)
 *
 * @example
 *   throw new ValidationError(
 *     'Agent configuration invalid',
 *     [
 *       { field: 'name', message: 'Name is required' },
 *       { field: 'domain', message: 'Domain must be string' }
 *     ],
 *     { agentConfig }
 *   );
 */
class ValidationError extends OrchestRAIError {
  constructor(message, validationErrors = [], context = {}) {
    super(message, context);
    this.validationErrors = Array.isArray(validationErrors) ? validationErrors : [validationErrors];
    this.field = this.validationErrors[0]?.field || null;
  }

  log() {
    logger.warn(this.message, {
      error: this.name,
      validationErrors: this.validationErrors,
      context: this.context
    });
  }
}

/**
 * Configuration Error
 *
 * System configuration is invalid or missing.
 * Usually detected at startup.
 *
 * Properties:
 * - configKey: Which configuration key is problematic
 * - expectedType: What type was expected
 * - actualValue: What value was found
 *
 * @example
 *   throw new ConfigurationError(
 *     'REDIS_URL environment variable not set',
 *     { configKey: 'REDIS_URL', expectedType: 'string' }
 *   );
 */
class ConfigurationError extends OrchestRAIError {
  constructor(message, context = {}) {
    super(message, context);
    this.configKey = context.configKey || null;
    this.expectedType = context.expectedType || null;
    this.actualValue = context.actualValue;
  }

  log() {
    logger.error(this.message, {
      error: this.name,
      configKey: this.configKey,
      expectedType: this.expectedType,
      context: this.context
    });
  }
}

/**
 * Network Error
 *
 * External service or network failure.
 * Usually retryable with backoff.
 *
 * Properties:
 * - service: Which service failed (DataForSEO, Redis, MCP, etc.)
 * - statusCode: HTTP status code (if applicable)
 * - endpoint: Which endpoint failed
 * - retryable: Whether retry makes sense
 *
 * @example
 *   throw new NetworkError(
 *     'DataForSEO API request failed',
 *     {
 *       service: 'DataForSEO',
 *       endpoint: '/v3/keywords_data',
 *       statusCode: 503,
 *       retryable: true
 *     }
 *   );
 */
class NetworkError extends OrchestRAIError {
  constructor(message, context = {}) {
    super(message, context);
    this.service = context.service || 'unknown';
    this.statusCode = context.statusCode || null;
    this.endpoint = context.endpoint || null;
    this.retryable = context.retryable !== false; // Default true
  }

  log() {
    logger.warn(this.message, {
      error: this.name,
      service: this.service,
      statusCode: this.statusCode,
      endpoint: this.endpoint,
      retryable: this.retryable,
      context: this.context
    });
  }
}

/**
 * Timeout Error
 *
 * Operation exceeded allowed time.
 * May be retryable depending on context.
 *
 * Properties:
 * - operation: What operation timed out
 * - timeout: Timeout value in ms
 * - elapsed: Actual elapsed time
 *
 * @example
 *   throw new TimeoutError(
 *     'Pipeline execution timeout',
 *     {
 *       operation: 'seo-research-pipeline',
 *       timeout: 30000,
 *       elapsed: 35000,
 *       pipelineId
 *     }
 *   );
 */
class TimeoutError extends OrchestRAIError {
  constructor(message, context = {}) {
    super(message, context);
    this.operation = context.operation || 'unknown';
    this.timeout = context.timeout || null;
    this.elapsed = context.elapsed || null;
  }

  log() {
    logger.warn(this.message, {
      error: this.name,
      operation: this.operation,
      timeout: this.timeout,
      elapsed: this.elapsed,
      context: this.context
    });
  }
}

/**
 * Resource Error
 *
 * Required resource is unavailable (memory, disk, connections, etc.)
 * May indicate capacity or quota issues.
 *
 * Properties:
 * - resource: What resource is unavailable
 * - limit: Resource limit (if applicable)
 * - current: Current usage (if applicable)
 *
 * @example
 *   throw new ResourceError(
 *     'Memory limit exceeded',
 *     {
 *       resource: 'memory',
 *       limit: 512 * 1024 * 1024,  // 512MB
 *       current: 600 * 1024 * 1024  // 600MB
 *     }
 *   );
 */
class ResourceError extends OrchestRAIError {
  constructor(message, context = {}) {
    super(message, context);
    this.resource = context.resource || 'unknown';
    this.limit = context.limit || null;
    this.current = context.current || null;
  }

  log() {
    logger.error(this.message, {
      error: this.name,
      resource: this.resource,
      limit: this.limit,
      current: this.current,
      context: this.context
    });
  }
}

/**
 * Pipeline Error
 *
 * Pipeline execution failed at a specific stage.
 * Includes stage information for debugging.
 *
 * Properties:
 * - pipelineId: Which pipeline failed
 * - stage: Which stage failed
 * - executionId: Execution ID for tracing
 * - cause: Original error that caused failure
 *
 * @example
 *   throw new PipelineError(
 *     'SEO research pipeline failed',
 *     {
 *       pipelineId: 'seo-research',
 *       stage: 'competitor-analysis',
 *       executionId: 'abc-123',
 *       cause: originalError
 *     }
 *   );
 */
class PipelineError extends OrchestRAIError {
  constructor(message, context = {}) {
    super(message, context);
    this.pipelineId = context.pipelineId || 'unknown';
    this.stage = context.stage || null;
    this.executionId = context.executionId || null;
    this.cause = context.cause || null;
  }

  log() {
    logger.error(this.message, {
      error: this.name,
      pipelineId: this.pipelineId,
      stage: this.stage,
      executionId: this.executionId,
      cause: this.cause?.message,
      context: this.context
    });
  }
}

/**
 * Agent Error
 *
 * Agent execution failed.
 * Includes agent-specific context.
 *
 * Properties:
 * - agentName: Which agent failed
 * - domain: Agent's domain
 * - taskId: Task ID being executed
 * - cause: Original error
 *
 * @example
 *   throw new AgentError(
 *     'SEO keyword research agent failed',
 *     {
 *       agentName: 'seo-keyword-research',
 *       domain: 'seo',
 *       taskId: 'task-789',
 *       cause: originalError
 *     }
 *   );
 */
class AgentError extends OrchestRAIError {
  constructor(message, context = {}) {
    super(message, context);
    this.agentName = context.agentName || 'unknown';
    this.domain = context.domain || null;
    this.taskId = context.taskId || null;
    this.cause = context.cause || null;
  }

  log() {
    logger.error(this.message, {
      error: this.name,
      agentName: this.agentName,
      domain: this.domain,
      taskId: this.taskId,
      cause: this.cause?.message,
      context: this.context
    });
  }
}

/**
 * Wrap unknown errors in typed error
 *
 * @param {Error} error - Original error
 * @param {string} operation - What operation failed
 * @param {Object} context - Additional context
 * @returns {OrchestRAIError} Typed error
 *
 * @example
 *   try {
 *     await riskyOperation();
 *   } catch (error) {
 *     throw wrapError(error, 'Pipeline execution', { pipelineId });
 *   }
 */
function wrapError(error, operation, context = {}) {
  if (error instanceof OrchestRAIError) {
    return error;
  }

  // Try to infer error type from message/context
  if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
    return new TimeoutError(
      `${operation} timeout: ${error.message}`,
      { operation, ...context, originalError: error.message }
    );
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new NetworkError(
      `${operation} network error: ${error.message}`,
      { operation, ...context, originalError: error.message }
    );
  }

  // Default: Wrap as generic OrchestRAI error
  return new OrchestRAIError(
    `${operation} failed: ${error.message}`,
    { operation, ...context, originalError: error.message, stack: error.stack }
  );
}

/**
 * Error handler middleware for Express
 *
 * @example
 *   app.use(errorHandler);
 */
function errorHandler(err, req, res, next) {
  const error = wrapError(err, 'HTTP Request', {
    method: req.method,
    path: req.path,
    query: req.query
  });

  error.log();

  res.status(error.statusCode || 500).json({
    error: {
      name: error.name,
      message: error.message,
      recoverable: error.recoverable || false,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
}

module.exports = {
  // Base class
  OrchestRAIError,

  // Specific error types
  RecoverableError,
  CriticalError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  ResourceError,
  PipelineError,
  AgentError,

  // Utilities
  wrapError,
  errorHandler
};
