/**
 * PostgreSQL Connection Pool Manager
 *
 * Centralized singleton pool manager for PostgreSQL connections across ORCHESTRAI.
 * Prevents connection exhaustion and provides health monitoring.
 *
 * Features:
 * - Singleton pattern (one pool per database)
 * - Automatic reconnection on failure
 * - Connection health checking
 * - Statistics tracking
 * - Integration with resource monitor
 * - Graceful shutdown handling
 */

const { Pool } = require('pg');
const EventEmitter = require('events');

class PostgreSQLPoolManager extends EventEmitter {
  constructor() {
    super();

    // Singleton instance storage
    this.pools = new Map();

    // Connection statistics
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      totalQueries: 0,
      errors: 0,
      lastHealthCheck: null
    };

    // Health check interval
    this.healthCheckInterval = null;
    this.healthCheckFrequency = 30000; // 30 seconds

    // Configuration defaults
    this.defaultConfig = {
      max: 20,                    // Maximum pool size
      min: 2,                     // Minimum pool size
      idleTimeoutMillis: 30000,   // Close idle clients after 30s
      connectionTimeoutMillis: 2000, // Return error after 2s if connection not available
      allowExitOnIdle: false,     // Keep pool alive
      maxUses: 7500,             // Close connection after 7500 queries (prevent memory leaks)
    };

    // Shutdown handler
    this._setupShutdownHandlers();
  }

  /**
   * Get or create a connection pool for a specific database
   * @param {string} poolName - Unique identifier for this pool
   * @param {object} config - PostgreSQL connection configuration
   * @returns {Pool} PostgreSQL connection pool
   */
  getPool(poolName = 'default', config = {}) {
    // Return existing pool if available
    if (this.pools.has(poolName)) {
      return this.pools.get(poolName);
    }

    // Create new pool with merged configuration
    const poolConfig = {
      ...this.defaultConfig,
      ...this._getConnectionConfig(config),
    };

    const pool = new Pool(poolConfig);

    // Set up event listeners
    this._setupPoolEventListeners(pool, poolName);

    // Store pool
    this.pools.set(poolName, pool);

    // Start health checks if not already running
    if (!this.healthCheckInterval) {
      this._startHealthCheck();
    }

    this.emit('pool-created', { poolName, config: poolConfig });

    return pool;
  }

  /**
   * Get connection configuration from environment or provided config
   * @private
   */
  _getConnectionConfig(customConfig) {
    return {
      user: customConfig.user || process.env.POSTGRES_USER || 'postgres',
      host: customConfig.host || process.env.POSTGRES_HOST || 'localhost',
      database: customConfig.database || process.env.POSTGRES_DATABASE || 'orchestrai',
      password: customConfig.password || process.env.POSTGRES_PASSWORD,
      port: customConfig.port || process.env.POSTGRES_PORT || 5432,
    };
  }

  /**
   * Set up event listeners for pool monitoring
   * @private
   */
  _setupPoolEventListeners(pool, poolName) {
    pool.on('connect', (client) => {
      this.stats.totalConnections++;
      this.emit('connection-created', { poolName, totalConnections: this.stats.totalConnections });
    });

    pool.on('acquire', (client) => {
      this.stats.activeConnections++;
      this.emit('connection-acquired', { poolName, activeConnections: this.stats.activeConnections });
    });

    pool.on('release', (client) => {
      this.stats.activeConnections--;
      this.stats.idleConnections++;
      this.emit('connection-released', { poolName });
    });

    pool.on('remove', (client) => {
      this.stats.totalConnections--;
      this.emit('connection-removed', { poolName, totalConnections: this.stats.totalConnections });
    });

    pool.on('error', (err, client) => {
      this.stats.errors++;
      console.error(`[PostgreSQL Pool "${poolName}"] Unexpected error:`, err);
      this.emit('pool-error', { poolName, error: err });
    });
  }

  /**
   * Execute a query using the pool
   * @param {string} poolName - Pool to use
   * @param {string} text - SQL query text
   * @param {array} params - Query parameters
   * @returns {Promise<object>} Query result
   */
  async query(poolName = 'default', text, params) {
    const pool = this.getPool(poolName);

    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;

      this.stats.totalQueries++;
      this.emit('query-executed', { poolName, duration, rows: result.rowCount });

      return result;
    } catch (error) {
      this.stats.errors++;
      this.emit('query-error', { poolName, error, query: text });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transaction management
   * @param {string} poolName - Pool to use
   * @returns {Promise<PoolClient>} PostgreSQL client
   */
  async getClient(poolName = 'default') {
    const pool = this.getPool(poolName);
    return await pool.connect();
  }

  /**
   * Perform health check on all pools
   * @returns {Promise<object>} Health status of all pools
   */
  async healthCheck() {
    const health = {
      healthy: true,
      pools: {},
      timestamp: new Date().toISOString()
    };

    for (const [poolName, pool] of this.pools.entries()) {
      try {
        const start = Date.now();
        await pool.query('SELECT 1');
        const responseTime = Date.now() - start;

        health.pools[poolName] = {
          status: 'healthy',
          responseTime,
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        };
      } catch (error) {
        health.healthy = false;
        health.pools[poolName] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    this.stats.lastHealthCheck = health.timestamp;
    this.emit('health-check-complete', health);

    return health;
  }

  /**
   * Start periodic health checks
   * @private
   */
  _startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      await this.healthCheck();
    }, this.healthCheckFrequency);
  }

  /**
   * Stop health checks
   * @private
   */
  _stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get current statistics
   * @returns {object} Connection pool statistics
   */
  getStats() {
    const poolStats = {};

    for (const [poolName, pool] of this.pools.entries()) {
      poolStats[poolName] = {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      };
    }

    return {
      ...this.stats,
      pools: poolStats
    };
  }

  /**
   * Gracefully close all pools
   * @returns {Promise<void>}
   */
  async closeAll() {
    console.log('[PostgreSQL Pool Manager] Closing all connection pools...');

    this._stopHealthCheck();

    const closePromises = [];

    for (const [poolName, pool] of this.pools.entries()) {
      closePromises.push(
        pool.end().then(() => {
          console.log(`[PostgreSQL Pool Manager] Closed pool: ${poolName}`);
          this.emit('pool-closed', { poolName });
        })
      );
    }

    await Promise.all(closePromises);
    this.pools.clear();

    console.log('[PostgreSQL Pool Manager] All pools closed');
  }

  /**
   * Close a specific pool
   * @param {string} poolName - Pool to close
   * @returns {Promise<void>}
   */
  async closePool(poolName) {
    const pool = this.pools.get(poolName);

    if (!pool) {
      console.warn(`[PostgreSQL Pool Manager] Pool "${poolName}" not found`);
      return;
    }

    await pool.end();
    this.pools.delete(poolName);
    this.emit('pool-closed', { poolName });

    // Stop health checks if no pools remain
    if (this.pools.size === 0) {
      this._stopHealthCheck();
    }
  }

  /**
   * Set up graceful shutdown handlers
   * @private
   */
  _setupShutdownHandlers() {
    const shutdown = async (signal) => {
      console.log(`[PostgreSQL Pool Manager] Received ${signal}, closing pools...`);
      await this.closeAll();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}

// Singleton instance
let instance = null;

/**
 * Get the singleton PostgreSQL pool manager instance
 * @returns {PostgreSQLPoolManager}
 */
function getPoolManager() {
  if (!instance) {
    instance = new PostgreSQLPoolManager();
  }
  return instance;
}

module.exports = {
  PostgreSQLPoolManager,
  getPoolManager
};
