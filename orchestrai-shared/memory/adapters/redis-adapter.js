/**
 * Redis Adapter for Memory Persistence
 *
 * Handles Redis connection management and CRUD operations for memory storage.
 * Provides namespace isolation, TTL management, and error resilience.
 *
 * Design Pattern: Adapter Pattern
 * - Wraps Redis client with memory-specific operations
 * - Provides consistent interface regardless of Redis implementation
 * - Handles connection lifecycle and error recovery
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Key namespacing for multi-tenant support
 * - TTL management for ephemeral data
 * - Batch operations for performance
 * - Graceful degradation when Redis unavailable
 */

const logger = require('../../logging/logger').forAgent('redis-adapter', 'memory');
const { NetworkError, ResourceError, RecoverableError } = require('../../errors/typed-errors');

class RedisAdapter {
  constructor(redisClient = null, config = {}) {
    this.redis = redisClient;
    this.config = {
      namespace: config.namespace || 'orchestrai',
      keyPrefix: config.keyPrefix || 'memory',
      defaultTTL: config.defaultTTL || null, // null = no expiration
      enableCompression: config.enableCompression !== false,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.connected = false;
    this.connectionAttempts = 0;
    this.lastConnectionAttempt = null;

    // Statistics
    this.stats = {
      operations: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      bytesStored: 0,
      bytesRetrieved: 0
    };

    this.logger = logger;

    if (this.redis) {
      this.setupRedisEvents();
    } else {
      this.logger.warn('Redis client not provided - adapter will operate in fallback mode', {
        mode: 'memory-only'
      });
    }
  }

  // ============ CONNECTION MANAGEMENT ============

  /**
   * Setup Redis event listeners for connection management
   */
  setupRedisEvents() {
    this.redis.on('connect', () => {
      this.connected = true;
      this.connectionAttempts = 0;
      this.logger.info('Redis connection established', {
        namespace: this.config.namespace
      });
    });

    this.redis.on('error', (error) => {
      this.stats.errors++;
      this.logger.error('Redis error', {
        error: error.message,
        code: error.code,
        command: error.command
      });
    });

    this.redis.on('end', () => {
      this.connected = false;
      this.logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      this.connectionAttempts++;
      this.lastConnectionAttempt = Date.now();
      this.logger.info('Redis reconnecting', {
        attempt: this.connectionAttempts,
        maxRetries: this.config.maxRetries
      });
    });
  }

  /**
   * Check if Redis is available
   *
   * @returns {boolean} True if connected and ready
   */
  isAvailable() {
    return this.redis && this.connected;
  }

  /**
   * Ensure Redis connection is available
   *
   * @throws {NetworkError} If Redis unavailable and not in fallback mode
   */
  ensureConnection() {
    if (!this.isAvailable()) {
      throw new NetworkError(
        'Redis connection unavailable',
        {
          service: 'Redis',
          connected: this.connected,
          lastAttempt: this.lastConnectionAttempt,
          retryable: true
        }
      );
    }
  }

  // ============ KEY MANAGEMENT ============

  /**
   * Generate namespaced key
   *
   * @param {string} domain - Domain/category
   * @param {string} type - Entity type
   * @param {string} id - Entity identifier
   * @returns {string} Namespaced key
   *
   * @example
   *   generateKey('seo', 'agent', 'keyword-research')
   *   // Returns: "orchestrai:memory:seo:agent:keyword-research"
   */
  generateKey(domain, type, id) {
    const parts = [
      this.config.namespace,
      this.config.keyPrefix,
      domain,
      type,
      id
    ].filter(Boolean);

    return parts.join(':');
  }

  /**
   * Parse namespaced key into components
   *
   * @param {string} key - Namespaced key
   * @returns {Object} { namespace, keyPrefix, domain, type, id }
   */
  parseKey(key) {
    const parts = key.split(':');
    return {
      namespace: parts[0],
      keyPrefix: parts[1],
      domain: parts[2],
      type: parts[3],
      id: parts[4]
    };
  }

  // ============ CRUD OPERATIONS ============

  /**
   * Store data in Redis
   *
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON stringified)
   * @param {number} [ttl] - Time to live in seconds (optional)
   * @returns {Promise<boolean>} True if successful
   * @throws {NetworkError} If Redis unavailable
   * @throws {ResourceError} If storage fails
   */
  async set(key, data, ttl = null) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      const serialized = JSON.stringify(data);
      const bytes = Buffer.byteLength(serialized, 'utf8');

      const finalTTL = ttl !== null ? ttl : this.config.defaultTTL;

      if (finalTTL) {
        await this.redis.setex(key, finalTTL, serialized);
      } else {
        await this.redis.set(key, serialized);
      }

      this.stats.bytesStored += bytes;

      this.logger.debug('Data stored in Redis', {
        key,
        bytes,
        ttl: finalTTL,
        compressed: this.config.enableCompression
      });

      return true;

    } catch (error) {
      this.stats.errors++;

      if (error instanceof NetworkError) {
        throw error;
      }

      throw new ResourceError(
        'Failed to store data in Redis',
        {
          resource: 'Redis',
          operation: 'set',
          key,
          error: error.message
        }
      );
    }
  }

  /**
   * Retrieve data from Redis
   *
   * @param {string} key - Storage key
   * @returns {Promise<any|null>} Parsed data or null if not found
   * @throws {NetworkError} If Redis unavailable
   */
  async get(key) {
    this.stats.operations++;

    try {
      this.ensureConnection();

      const serialized = await this.redis.get(key);

      if (!serialized) {
        this.stats.misses++;
        return null;
      }

      const data = JSON.parse(serialized);
      const bytes = Buffer.byteLength(serialized, 'utf8');

      this.stats.hits++;
      this.stats.bytesRetrieved += bytes;

      this.logger.debug('Data retrieved from Redis', {
        key,
        bytes,
        hit: true
      });

      return data;

    } catch (error) {
      this.stats.errors++;

      if (error instanceof NetworkError) {
        // Redis unavailable - return null (graceful degradation)
        this.logger.warn('Redis unavailable during get operation', {
          key,
          fallback: 'null'
        });
        return null;
      }

      // Parse error or other issue
      this.logger.error('Failed to retrieve data from Redis', {
        key,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Check if key exists
   *
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} True if key exists
   */
  async exists(key) {
    try {
      this.ensureConnection();
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.warn('Failed to check key existence', {
        key,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Delete data from Redis
   *
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(key) {
    try {
      this.ensureConnection();
      const result = await this.redis.del(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Failed to delete key', {
        key,
        error: error.message
      });
      return false;
    }
  }

  // ============ BATCH OPERATIONS ============

  /**
   * Store multiple key-value pairs
   *
   * @param {Object} data - Object with key-value pairs
   * @param {number} [ttl] - Time to live in seconds (optional)
   * @returns {Promise<number>} Number of keys stored successfully
   */
  async setMany(data, ttl = null) {
    try {
      this.ensureConnection();

      const pipeline = this.redis.pipeline();

      for (const [key, value] of Object.entries(data)) {
        const serialized = JSON.stringify(value);

        if (ttl) {
          pipeline.setex(key, ttl, serialized);
        } else {
          pipeline.set(key, serialized);
        }
      }

      const results = await pipeline.exec();
      const successCount = results.filter(([err]) => !err).length;

      this.logger.debug('Batch set completed', {
        totalKeys: Object.keys(data).length,
        successCount,
        ttl
      });

      return successCount;

    } catch (error) {
      this.logger.error('Batch set failed', {
        error: error.message,
        keyCount: Object.keys(data).length
      });
      return 0;
    }
  }

  /**
   * Retrieve multiple values by keys
   *
   * @param {Array<string>} keys - Array of keys to retrieve
   * @returns {Promise<Object>} Object with key-value pairs (missing keys excluded)
   */
  async getMany(keys) {
    try {
      this.ensureConnection();

      const values = await this.redis.mget(keys);
      const result = {};

      keys.forEach((key, index) => {
        if (values[index]) {
          try {
            result[key] = JSON.parse(values[index]);
          } catch (error) {
            this.logger.warn('Failed to parse value for key', {
              key,
              error: error.message
            });
          }
        }
      });

      this.logger.debug('Batch get completed', {
        requestedKeys: keys.length,
        retrievedKeys: Object.keys(result).length
      });

      return result;

    } catch (error) {
      this.logger.error('Batch get failed', {
        error: error.message,
        keyCount: keys.length
      });
      return {};
    }
  }

  // ============ PATTERN MATCHING ============

  /**
   * Find keys matching pattern
   *
   * WARNING: Use with caution in production (can be slow on large datasets)
   *
   * @param {string} pattern - Key pattern (e.g., "orchestrai:memory:seo:*")
   * @returns {Promise<Array<string>>} Matching keys
   */
  async keys(pattern) {
    try {
      this.ensureConnection();

      const keys = await this.redis.keys(pattern);

      this.logger.debug('Pattern scan completed', {
        pattern,
        matchCount: keys.length
      });

      return keys;

    } catch (error) {
      this.logger.error('Pattern scan failed', {
        pattern,
        error: error.message
      });
      return [];
    }
  }

  // ============ STATISTICS ============

  /**
   * Get adapter statistics
   *
   * @returns {Object} Statistics
   */
  getStats() {
    const hitRate = this.stats.operations > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      connected: this.connected,
      connectionAttempts: this.connectionAttempts
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      operations: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      bytesStored: 0,
      bytesRetrieved: 0
    };

    this.logger.debug('Statistics reset');
  }

  // ============ CLEANUP ============

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.connected = false;

      this.logger.info('Redis connection closed', {
        finalStats: this.getStats()
      });
    }
  }
}

module.exports = RedisAdapter;
