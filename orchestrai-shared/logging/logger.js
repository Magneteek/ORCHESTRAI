/**
 * Centralized Logging Module for ORCHESTRAI
 *
 * Provides structured JSON logging with different levels and formatters.
 * Replaces scattered console.log statements with proper logging infrastructure.
 *
 * Usage:
 *   const logger = require('./orchestrai-shared/logging/logger');
 *
 *   logger.info('Agent started', { agentName: 'seo-research', executionId });
 *   logger.error('Pipeline failed', { error, pipelineId, stage });
 *   logger.debug('Memory lookup', { nodeId, traversalDepth });
 *
 * Log Levels (from highest to lowest priority):
 *   - fatal: Application crash, immediate attention required
 *   - error: Error conditions that need investigation
 *   - warn: Warning conditions that might need attention
 *   - info: General informational messages (default)
 *   - debug: Detailed debugging information
 *   - trace: Very detailed tracing information
 */

const pino = require('pino');
const path = require('path');

// Determine environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

// Configure log level (can be overridden by LOG_LEVEL env var)
const LOG_LEVEL = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Base logger configuration
const pinoConfig = {
  level: LOG_LEVEL,

  // Format timestamps as ISO 8601
  timestamp: pino.stdTimeFunctions.isoTime,

  // Add useful context to all logs
  base: {
    pid: process.pid,
    hostname: require('os').hostname(),
    environment: process.env.NODE_ENV || 'development'
  },

  // Custom formatters for better readability
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        host: bindings.hostname,
        env: bindings.environment
      };
    }
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'api_key',
      'accessToken',
      'access_token',
      'secret',
      'authorization',
      '*.password',
      '*.token',
      '*.apiKey'
    ],
    censor: '[REDACTED]'
  }
};

// Development: Use pretty printing for human readability
// Production: Use JSON for machine parsing
if (isDevelopment && !isTest) {
  pinoConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{msg} {context}',
      errorLikeObjectKeys: ['err', 'error']
    }
  };
}

// Test environment: Silent logging
if (isTest) {
  pinoConfig.level = 'silent';
}

// Create the logger instance
const logger = pino(pinoConfig);

/**
 * Create a child logger with additional context
 * Useful for adding domain/module/component context to all logs
 *
 * @param {Object} bindings - Additional context fields
 * @returns {Object} Child logger instance
 *
 * @example
 *   const agentLogger = logger.child({ domain: 'seo', agent: 'keyword-research' });
 *   agentLogger.info('Starting analysis', { keywords: 120 });
 *   // Output: { domain: 'seo', agent: 'keyword-research', msg: 'Starting analysis', keywords: 120 }
 */
logger.createChild = function(bindings) {
  return this.child(bindings);
};

/**
 * Create a logger for a specific domain
 *
 * @param {string} domain - Domain name (seo, content, api, etc.)
 * @returns {Object} Domain-specific logger
 */
logger.forDomain = function(domain) {
  return this.child({ domain });
};

/**
 * Create a logger for a specific agent
 *
 * @param {string} agentName - Agent name
 * @param {string} domain - Domain name (optional)
 * @returns {Object} Agent-specific logger
 */
logger.forAgent = function(agentName, domain = null) {
  const bindings = { agent: agentName };
  if (domain) bindings.domain = domain;
  return this.child(bindings);
};

/**
 * Create a logger for a specific pipeline
 *
 * @param {string} pipelineName - Pipeline name
 * @param {string} executionId - Execution ID for correlation
 * @returns {Object} Pipeline-specific logger
 */
logger.forPipeline = function(pipelineName, executionId) {
  return this.child({
    pipeline: pipelineName,
    executionId
  });
};

/**
 * Log with execution context (executionId for tracing)
 *
 * @param {string} level - Log level
 * @param {string} executionId - Execution ID
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
logger.withExecution = function(level, executionId, message, context = {}) {
  this[level]({ executionId, ...context }, message);
};

/**
 * Log with timing information
 * Returns a function that logs completion time when called
 *
 * @param {string} operation - Operation name
 * @param {Object} context - Additional context
 * @returns {Function} Timer function to call when operation completes
 *
 * @example
 *   const timer = logger.time('Pipeline execution', { pipelineId });
 *   await executePipeline();
 *   timer(); // Logs duration automatically
 */
logger.time = function(operation, context = {}) {
  const start = Date.now();
  this.debug({ operation, ...context }, `Starting: ${operation}`);

  return (error = null) => {
    const duration = Date.now() - start;
    const logContext = { operation, duration, ...context };

    if (error) {
      this.error({ ...logContext, error }, `Failed: ${operation} (${duration}ms)`);
    } else {
      this.info(logContext, `Completed: ${operation} (${duration}ms)`);
    }
  };
};

/**
 * Flush logs (important for process exit)
 * Call this before process.exit() to ensure all logs are written
 */
logger.flush = function() {
  return new Promise((resolve) => {
    pino.destination().on('finish', resolve);
    pino.destination().end();
  });
};

// Export singleton logger
module.exports = logger;
