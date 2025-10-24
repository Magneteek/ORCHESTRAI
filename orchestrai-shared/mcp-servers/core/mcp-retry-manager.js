const EventEmitter = require('events');

/**
 * Retry manager with circuit breaker pattern for MCP servers
 * Handles retry logic and prevents cascade failures
 */
class MCPRetryManager extends EventEmitter {
  constructor(logger, options = {}) {
    super();
    this.logger = logger;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 60000;

    this.retryStates = new Map();
    this.circuitBreakers = new Map();
  }

  /**
   * Execute operation with retry logic
   * @param {string} operationId - Unique operation identifier
   * @param {Function} operation - Async operation to execute
   * @param {Object} options - Retry options
   * @returns {Promise} Operation result
   */
  async executeWithRetry(operationId, operation, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    const retryDelay = options.retryDelay || this.retryDelay;
    const backoffMultiplier = options.backoffMultiplier || 2;

    // Check circuit breaker
    if (this.isCircuitOpen(operationId)) {
      const error = new Error(`Circuit breaker open for ${operationId}`);
      error.code = 'CIRCUIT_OPEN';
      throw error;
    }

    let lastError;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.info(`Retry attempt ${attempt} for ${operationId}`, {
            delay: currentDelay
          });

          await this.delay(currentDelay);
          currentDelay *= backoffMultiplier;
        }

        const result = await operation();

        // Reset retry state on success
        this.resetRetryState(operationId);
        this.recordSuccess(operationId);

        this.emit('operation:success', { operationId, attempt });

        return result;
      } catch (error) {
        lastError = error;

        this.logger.warn(`Operation failed: ${operationId}`, {
          attempt,
          error: error.message
        });

        this.recordFailure(operationId);

        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          this.logger.info(`Non-retryable error for ${operationId}`, {
            error: error.message
          });
          throw error;
        }

        // Check if circuit should open
        if (this.shouldOpenCircuit(operationId)) {
          this.openCircuit(operationId);
          throw new Error(`Circuit breaker opened for ${operationId}`);
        }
      }
    }

    this.logger.error(`All retry attempts exhausted for ${operationId}`, {
      attempts: maxRetries + 1,
      lastError: lastError.message
    });

    this.emit('operation:failed', {
      operationId,
      attempts: maxRetries + 1,
      error: lastError
    });

    throw lastError;
  }

  /**
   * Check if error should not be retried
   */
  shouldNotRetry(error) {
    const nonRetryableCodes = [
      'EACCES',
      'ENOENT',
      'INVALID_CONFIG',
      'AUTHENTICATION_FAILED'
    ];

    return (
      nonRetryableCodes.includes(error.code) ||
      error.message.includes('not found') ||
      error.message.includes('invalid')
    );
  }

  /**
   * Record operation failure
   */
  recordFailure(operationId) {
    if (!this.retryStates.has(operationId)) {
      this.retryStates.set(operationId, {
        failures: 0,
        successes: 0,
        lastFailure: null
      });
    }

    const state = this.retryStates.get(operationId);
    state.failures++;
    state.lastFailure = Date.now();
  }

  /**
   * Record operation success
   */
  recordSuccess(operationId) {
    if (!this.retryStates.has(operationId)) {
      this.retryStates.set(operationId, {
        failures: 0,
        successes: 0,
        lastFailure: null
      });
    }

    const state = this.retryStates.get(operationId);
    state.successes++;
  }

  /**
   * Reset retry state
   */
  resetRetryState(operationId) {
    if (this.retryStates.has(operationId)) {
      this.retryStates.get(operationId).failures = 0;
    }
  }

  /**
   * Check if circuit should open
   */
  shouldOpenCircuit(operationId) {
    const state = this.retryStates.get(operationId);
    return state && state.failures >= this.circuitBreakerThreshold;
  }

  /**
   * Open circuit breaker
   */
  openCircuit(operationId) {
    this.logger.warn(`Opening circuit breaker for ${operationId}`, {
      failures: this.retryStates.get(operationId)?.failures,
      timeout: this.circuitBreakerTimeout
    });

    this.circuitBreakers.set(operationId, {
      state: 'open',
      openedAt: Date.now(),
      timeout: this.circuitBreakerTimeout
    });

    this.emit('circuit:opened', { operationId });

    // Auto-close circuit after timeout
    setTimeout(() => {
      this.halfOpenCircuit(operationId);
    }, this.circuitBreakerTimeout);
  }

  /**
   * Half-open circuit breaker (test if service recovered)
   */
  halfOpenCircuit(operationId) {
    const breaker = this.circuitBreakers.get(operationId);

    if (breaker && breaker.state === 'open') {
      this.logger.info(`Half-opening circuit breaker for ${operationId}`);

      breaker.state = 'half-open';
      this.emit('circuit:half-open', { operationId });
    }
  }

  /**
   * Close circuit breaker
   */
  closeCircuit(operationId) {
    this.logger.info(`Closing circuit breaker for ${operationId}`);

    this.circuitBreakers.delete(operationId);
    this.resetRetryState(operationId);

    this.emit('circuit:closed', { operationId });
  }

  /**
   * Check if circuit is open
   */
  isCircuitOpen(operationId) {
    const breaker = this.circuitBreakers.get(operationId);

    if (!breaker) {
      return false;
    }

    // If circuit is half-open, allow one attempt
    if (breaker.state === 'half-open') {
      return false;
    }

    return breaker.state === 'open';
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus(operationId) {
    const breaker = this.circuitBreakers.get(operationId);
    const state = this.retryStates.get(operationId);

    if (!breaker) {
      return {
        state: 'closed',
        failures: state?.failures || 0,
        successes: state?.successes || 0
      };
    }

    return {
      state: breaker.state,
      openedAt: breaker.openedAt,
      timeout: breaker.timeout,
      failures: state?.failures || 0,
      successes: state?.successes || 0
    };
  }

  /**
   * Get all circuit breaker statuses
   */
  getAllCircuitStatuses() {
    const statuses = {};

    // Get all operation IDs from both maps
    const operationIds = new Set([
      ...this.circuitBreakers.keys(),
      ...this.retryStates.keys()
    ]);

    operationIds.forEach(operationId => {
      statuses[operationId] = this.getCircuitStatus(operationId);
    });

    return statuses;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(operation, timeout) {
    return Promise.race([
      operation(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);
  }

  /**
   * Batch retry operations
   */
  async executeBatch(operations, options = {}) {
    const results = [];

    for (const [operationId, operation] of operations) {
      try {
        const result = await this.executeWithRetry(
          operationId,
          operation,
          options
        );
        results.push({ operationId, success: true, result });
      } catch (error) {
        results.push({
          operationId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Clear retry states
   */
  clearStates(operationId = null) {
    if (operationId) {
      this.retryStates.delete(operationId);
      this.circuitBreakers.delete(operationId);
      this.logger.info(`Retry states cleared for ${operationId}`);
    } else {
      this.retryStates.clear();
      this.circuitBreakers.clear();
      this.logger.info('All retry states cleared');
    }
  }

  /**
   * Get retry statistics
   */
  getStatistics() {
    const stats = {
      totalOperations: this.retryStates.size,
      openCircuits: 0,
      halfOpenCircuits: 0,
      closedCircuits: 0,
      operations: {}
    };

    this.circuitBreakers.forEach((breaker, operationId) => {
      if (breaker.state === 'open') stats.openCircuits++;
      if (breaker.state === 'half-open') stats.halfOpenCircuits++;
    });

    stats.closedCircuits =
      stats.totalOperations - stats.openCircuits - stats.halfOpenCircuits;

    this.retryStates.forEach((state, operationId) => {
      stats.operations[operationId] = {
        failures: state.failures,
        successes: state.successes,
        lastFailure: state.lastFailure,
        circuitState: this.getCircuitStatus(operationId).state
      };
    });

    return stats;
  }
}

module.exports = MCPRetryManager;
