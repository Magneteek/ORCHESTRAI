const EventEmitter = require('events');
const path = require('path');
const MCPLogger = require('./mcp-logger');
const MCPConfigManager = require('./mcp-config-manager');
const MCPProcessManager = require('./mcp-process-manager');
const MCPHealthMonitor = require('./mcp-health-monitor');
const MCPRetryManager = require('./mcp-retry-manager');

/**
 * Main MCP Manager - Orchestrates all MCP server operations
 * Refactored with modular architecture and separation of concerns
 *
 * @class MCPManager
 * @extends EventEmitter
 *
 * @example
 * const manager = new MCPManager({
 *   configPath: './mcp-config.json',
 *   logLevel: 'info'
 * });
 *
 * await manager.initialize();
 * await manager.startAllEnabledServers();
 */
class MCPManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // Initialize logger
    this.logger = new MCPLogger({
      component: 'MCPManager',
      minLevel: options.logLevel || 'info',
      enableColors: options.enableColors !== false,
      enableTimestamps: options.enableTimestamps !== false
    });

    // Configuration path
    const configPath = options.configPath ||
      path.join(__dirname, '../mcp-config.json');

    // Initialize components
    this.configManager = new MCPConfigManager(configPath, this.logger.child('Config'));
    this.processManager = new MCPProcessManager(this.logger.child('Process'));
    this.retryManager = new MCPRetryManager(this.logger.child('Retry'), {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      circuitBreakerThreshold: options.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: options.circuitBreakerTimeout || 60000
    });

    this.healthMonitor = null; // Initialized after process manager
    this.isInitialized = false;

    // Bind event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for all components
   */
  setupEventHandlers() {
    // Process manager events
    this.processManager.on('server:started', (data) => {
      this.logger.success(`Server started: ${data.serverName}`);
      this.emit('server:started', data);
    });

    this.processManager.on('server:stopped', (data) => {
      this.logger.info(`Server stopped: ${data.serverName}`);
      this.emit('server:stopped', data);
    });

    this.processManager.on('server:error', (data) => {
      this.logger.error(`Server error: ${data.serverName}`, {
        error: data.error?.message
      });
      this.emit('server:error', data);
    });

    this.processManager.on('server:exit', (data) => {
      this.logger.warn(`Server exited: ${data.serverName}`, {
        code: data.code,
        signal: data.signal
      });
      this.emit('server:exit', data);
    });

    // Retry manager events
    this.retryManager.on('circuit:opened', (data) => {
      this.logger.warn(`Circuit breaker opened: ${data.operationId}`);
      this.emit('circuit:opened', data);
    });

    this.retryManager.on('circuit:closed', (data) => {
      this.logger.info(`Circuit breaker closed: ${data.operationId}`);
      this.emit('circuit:closed', data);
    });

    this.retryManager.on('operation:failed', (data) => {
      this.logger.error(`Operation failed after retries: ${data.operationId}`);
      this.emit('operation:failed', data);
    });
  }

  /**
   * Initialize MCP Manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.warn('MCP Manager already initialized');
      return;
    }

    this.logger.info('Initializing MCP Manager...');

    try {
      // Load configuration
      this.configManager.load();

      // Initialize health monitor
      const globalConfig = this.configManager.getGlobalConfig();
      this.healthMonitor = new MCPHealthMonitor(
        this.processManager,
        this.logger.child('Health'),
        {
          healthCheckInterval: globalConfig.serverConfig.healthCheckInterval
        }
      );

      // Setup health monitor events
      this.healthMonitor.on('server:unhealthy', (data) => {
        this.logger.warn(`Server unhealthy: ${data.serverName}`);
        this.emit('server:unhealthy', data);
      });

      this.healthMonitor.on('server:degraded', (data) => {
        this.logger.warn(`Server degraded: ${data.serverName}`);
        this.emit('server:degraded', data);
      });

      this.isInitialized = true;
      this.logger.success('MCP Manager initialized successfully');

      this.emit('manager:initialized');
    } catch (error) {
      this.logger.error('MCP Manager initialization failed', {
        error: error.message
      });
      this.emit('manager:error', { error });
      throw error;
    }
  }

  /**
   * Start a specific MCP server
   * @param {string} serverName - Server name
   * @param {Object} options - Start options
   * @returns {Promise<Object>} Server process info
   */
  async startServer(serverName, options = {}) {
    this.ensureInitialized();

    const serverConfig = this.configManager.getServerConfig(serverName);

    if (!serverConfig.enabled && !options.force) {
      this.logger.warn(`Server ${serverName} is disabled, skipping...`);
      return null;
    }

    // Use retry logic for server startup
    return await this.retryManager.executeWithRetry(
      `start:${serverName}`,
      async () => {
        return await this.processManager.startServer(
          serverName,
          serverConfig,
          options
        );
      },
      {
        maxRetries: options.maxRetries || 2,
        retryDelay: options.retryDelay || 2000
      }
    );
  }

  /**
   * Start all enabled servers
   * @param {Object} options - Start options
   * @returns {Promise<Array>} Array of start results
   */
  async startAllEnabledServers(options = {}) {
    this.ensureInitialized();

    const enabledServers = this.configManager.getEnabledServers();

    this.logger.info(`Starting ${enabledServers.length} enabled servers...`);

    const results = [];

    for (const serverName of enabledServers) {
      try {
        const result = await this.startServer(serverName, options);
        results.push({
          server: serverName,
          status: result ? 'started' : 'skipped',
          result
        });

        // Brief pause between server starts
        await this.delay(options.startDelay || 1000);
      } catch (error) {
        this.logger.error(`Failed to start ${serverName}`, {
          error: error.message
        });

        results.push({
          server: serverName,
          status: 'failed',
          error: error.message
        });

        // Continue with other servers unless stopOnError is true
        if (options.stopOnError) {
          throw error;
        }
      }
    }

    // Start health monitoring if servers are running
    if (results.some(r => r.status === 'started')) {
      this.healthMonitor.start();
    }

    this.logger.success(
      `Server startup complete: ${results.filter(r => r.status === 'started').length}/${enabledServers.length} started`
    );

    return results;
  }

  /**
   * Stop a specific server
   * @param {string} serverName - Server name
   * @param {Object} options - Stop options
   * @returns {Promise<void>}
   */
  async stopServer(serverName, options = {}) {
    this.ensureInitialized();

    return await this.processManager.stopServer(serverName, {
      graceful: options.graceful !== false,
      timeout: options.timeout || 5000
    });
  }

  /**
   * Stop all running servers
   * @param {Object} options - Stop options
   * @returns {Promise<void>}
   */
  async stopAllServers(options = {}) {
    this.ensureInitialized();

    // Stop health monitoring
    if (this.healthMonitor) {
      this.healthMonitor.stop();
    }

    await this.processManager.stopAll({
      graceful: options.graceful !== false,
      timeout: options.timeout || 5000
    });
  }

  /**
   * Restart a server
   * @param {string} serverName - Server name
   * @param {Object} options - Restart options
   * @returns {Promise<Object>} New server process info
   */
  async restartServer(serverName, options = {}) {
    this.ensureInitialized();

    const serverConfig = this.configManager.getServerConfig(serverName);

    return await this.retryManager.executeWithRetry(
      `restart:${serverName}`,
      async () => {
        return await this.processManager.restartServer(serverName, serverConfig);
      },
      options
    );
  }

  /**
   * Get server status
   * @param {string} serverName - Server name
   * @returns {Object} Server status
   */
  getServerStatus(serverName) {
    this.ensureInitialized();

    const processInfo = this.processManager.getServerInfo(serverName);
    const config = this.configManager.getServerConfig(serverName);

    if (!processInfo) {
      return {
        name: serverName,
        status: config.enabled ? 'not_running' : 'disabled',
        config: {
          enabled: config.enabled,
          priority: config.priority,
          capabilities: config.capabilities
        }
      };
    }

    return {
      ...processInfo,
      config: {
        enabled: config.enabled,
        priority: config.priority,
        capabilities: config.capabilities
      }
    };
  }

  /**
   * Get all servers status
   * @returns {Object} All servers status
   */
  getAllServersStatus() {
    this.ensureInitialized();

    const status = {};
    const configuredServers = Object.keys(
      this.configManager.config.mcpServers
    );

    configuredServers.forEach(serverName => {
      status[serverName] = this.getServerStatus(serverName);
    });

    return status;
  }

  /**
   * Get health status for all servers
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    this.ensureInitialized();

    if (!this.healthMonitor) {
      throw new Error('Health monitor not initialized');
    }

    return await this.healthMonitor.getAllServersHealth();
  }

  /**
   * Get health report
   * @returns {Object} Health report
   */
  getHealthReport() {
    this.ensureInitialized();

    if (!this.healthMonitor) {
      throw new Error('Health monitor not initialized');
    }

    return this.healthMonitor.getHealthReport();
  }

  /**
   * Get servers by capability
   * @param {string} capability - Capability name
   * @returns {Array<string>} Server names
   */
  getServersByCapability(capability) {
    this.ensureInitialized();

    return this.configManager.getServersByCapability(capability);
  }

  /**
   * Get integration status (for compatibility with existing code)
   * @returns {Promise<Object>} Integration status
   */
  async getIntegrationStatus() {
    this.ensureInitialized();

    const health = await this.getHealthStatus();
    const integrationStatus = {};

    Object.keys(health).forEach(serverName => {
      const serverHealth = health[serverName];
      const config = this.configManager.getServerConfig(serverName);

      integrationStatus[serverName] = {
        available: serverHealth.status === 'healthy',
        capabilities: config.capabilities || [],
        uptime: serverHealth.metrics?.uptime || 0,
        lastCheck: serverHealth.timestamp
      };
    });

    return integrationStatus;
  }

  /**
   * Get retry statistics
   * @returns {Object} Retry statistics
   */
  getRetryStatistics() {
    return this.retryManager.getStatistics();
  }

  /**
   * Get circuit breaker statuses
   * @returns {Object} Circuit breaker statuses
   */
  getCircuitStatuses() {
    return this.retryManager.getAllCircuitStatuses();
  }

  /**
   * Get log history
   * @param {Object} filters - Log filters
   * @returns {Array} Log history
   */
  getLogHistory(filters = {}) {
    return this.logger.getHistory(filters);
  }

  /**
   * Update server configuration
   * @param {string} serverName - Server name
   * @param {Object} updates - Configuration updates
   */
  updateServerConfig(serverName, updates) {
    this.ensureInitialized();

    this.configManager.updateServerConfig(serverName, updates);
  }

  /**
   * Save configuration
   */
  saveConfig() {
    this.ensureInitialized();

    return this.configManager.save();
  }

  /**
   * Watch configuration for changes
   * @param {Function} callback - Change callback
   */
  watchConfig(callback) {
    this.ensureInitialized();

    return this.configManager.watch(callback);
  }

  /**
   * Ensure manager is initialized
   * @private
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('MCP Manager not initialized. Call initialize() first.');
    }
  }

  /**
   * Delay helper
   * @private
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup and shutdown
   * @returns {Promise<void>}
   */
  async shutdown() {
    this.logger.info('Shutting down MCP Manager...');

    try {
      // Stop health monitoring
      if (this.healthMonitor) {
        this.healthMonitor.stop();
      }

      // Stop all servers
      await this.stopAllServers({ graceful: true, timeout: 10000 });

      // Unwatch config
      this.configManager.unwatch();

      // Remove all listeners
      this.removeAllListeners();

      this.isInitialized = false;

      this.logger.success('MCP Manager shutdown complete');
    } catch (error) {
      this.logger.error('MCP Manager shutdown failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get comprehensive system status
   * @returns {Promise<Object>} System status
   */
  async getSystemStatus() {
    this.ensureInitialized();

    const [healthStatus, retryStats, circuitStatuses] = await Promise.all([
      this.getHealthStatus(),
      Promise.resolve(this.getRetryStatistics()),
      Promise.resolve(this.getCircuitStatuses())
    ]);

    return {
      timestamp: Date.now(),
      initialized: this.isInitialized,
      servers: this.getAllServersStatus(),
      health: healthStatus,
      retry: retryStats,
      circuits: circuitStatuses,
      healthMonitoring: this.healthMonitor?.isMonitoring || false
    };
  }
}

module.exports = MCPManager;
