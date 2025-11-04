const fs = require('fs');
const path = require('path');

/**
 * Configuration manager for MCP servers
 * Handles loading, validating, and managing server configurations
 */
class MCPConfigManager {
  constructor(configPath, logger) {
    this.configPath = configPath;
    this.logger = logger || console;
    this.config = null;
    this.watchers = [];
  }

  /**
   * Load and validate configuration
   * @returns {Object} Loaded configuration
   */
  load() {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Configuration file not found: ${this.configPath}`);
      }

      const configData = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(configData);

      this.validate(config);
      this.config = this.normalize(config);

      this.logger.success?.('Configuration loaded successfully', {
        servers: Object.keys(this.config.mcpServers).length
      });

      return this.config;
    } catch (error) {
      this.logger.error?.('Failed to load configuration', {
        error: error.message,
        path: this.configPath
      });
      throw error;
    }
  }

  /**
   * Validate configuration schema
   */
  validate(config) {
    if (!config.mcpServers || typeof config.mcpServers !== 'object') {
      throw new Error('Configuration must contain mcpServers object');
    }

    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      this.validateServerConfig(serverName, serverConfig);
    }

    return true;
  }

  /**
   * Validate individual server configuration
   */
  validateServerConfig(serverName, config) {
    const required = ['name', 'command', 'args'];
    const missing = required.filter(field => !config[field]);

    if (missing.length > 0) {
      throw new Error(
        `Server ${serverName} missing required fields: ${missing.join(', ')}`
      );
    }

    if (config.priority && !['high', 'medium', 'low'].includes(config.priority)) {
      throw new Error(
        `Server ${serverName} has invalid priority: ${config.priority}`
      );
    }

    if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
      throw new Error(
        `Server ${serverName} has invalid enabled value: ${config.enabled}`
      );
    }
  }

  /**
   * Normalize configuration with defaults
   */
  normalize(config) {
    const normalized = {
      mcpServers: {},
      serverConfig: {
        maxConcurrentConnections: 10,
        connectionTimeout: 30000,
        retryAttempts: 3,
        healthCheckInterval: 60000,
        logLevel: 'info',
        ...config.serverConfig
      },
      securityConfig: {
        allowedOrigins: ['localhost:3000'],
        rateLimiting: {
          enabled: true,
          maxRequests: 1000,
          windowMs: 900000
        },
        pathValidation: true,
        sandboxed: true,
        ...config.securityConfig
      }
    };

    // Normalize server configurations
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      normalized.mcpServers[serverName] = {
        enabled: true,
        priority: 'medium',
        capabilities: [],
        env: {},
        ...serverConfig
      };
    }

    return normalized;
  }

  /**
   * Get server configuration by name
   */
  getServerConfig(serverName) {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    const serverConfig = this.config.mcpServers[serverName];
    if (!serverConfig) {
      throw new Error(`Server ${serverName} not found in configuration`);
    }

    return serverConfig;
  }

  /**
   * Get all enabled servers sorted by priority
   */
  getEnabledServers() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return Object.keys(this.config.mcpServers)
      .filter(name => this.config.mcpServers[name].enabled)
      .sort((a, b) => {
        const priorityA = priorityOrder[this.config.mcpServers[a].priority] || 2;
        const priorityB = priorityOrder[this.config.mcpServers[b].priority] || 2;
        return priorityA - priorityB;
      });
  }

  /**
   * Get servers by capability
   */
  getServersByCapability(capability) {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    return Object.entries(this.config.mcpServers)
      .filter(([_, config]) =>
        config.enabled &&
        config.capabilities &&
        config.capabilities.includes(capability)
      )
      .map(([name]) => name);
  }

  /**
   * Update server configuration
   */
  updateServerConfig(serverName, updates) {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    if (!this.config.mcpServers[serverName]) {
      throw new Error(`Server ${serverName} not found`);
    }

    this.config.mcpServers[serverName] = {
      ...this.config.mcpServers[serverName],
      ...updates
    };

    this.logger.info?.('Server configuration updated', { serverName, updates });
  }

  /**
   * Save configuration to file
   */
  save() {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(this.configPath, configData, 'utf8');

      this.logger.success?.('Configuration saved successfully');
      return true;
    } catch (error) {
      this.logger.error?.('Failed to save configuration', { error: error.message });
      throw error;
    }
  }

  /**
   * Watch configuration file for changes
   */
  watch(callback) {
    const watcher = fs.watch(this.configPath, (eventType) => {
      if (eventType === 'change') {
        this.logger.info?.('Configuration file changed, reloading...');
        try {
          this.load();
          callback(null, this.config);
        } catch (error) {
          callback(error);
        }
      }
    });

    this.watchers.push(watcher);
    return watcher;
  }

  /**
   * Stop watching configuration file
   */
  unwatch() {
    this.watchers.forEach(watcher => watcher.close());
    this.watchers = [];
  }

  /**
   * Resolve environment variables in configuration
   */
  resolveEnvVars(envConfig) {
    const resolved = {};

    for (const [key, value] of Object.entries(envConfig)) {
      if (typeof value === 'string') {
        resolved[key] = value.replace(/\$\{(\w+)\}/g, (match, varName) => {
          return process.env[varName] || match;
        });
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Get global server configuration
   */
  getGlobalConfig() {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }

    return {
      serverConfig: this.config.serverConfig,
      securityConfig: this.config.securityConfig
    };
  }
}

module.exports = MCPConfigManager;
