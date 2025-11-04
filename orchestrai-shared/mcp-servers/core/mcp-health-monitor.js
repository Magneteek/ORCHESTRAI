const EventEmitter = require('events');

/**
 * Health monitoring service for MCP servers
 * Performs periodic health checks and tracks server health metrics
 */
class MCPHealthMonitor extends EventEmitter {
  constructor(processManager, logger, options = {}) {
    super();
    this.processManager = processManager;
    this.logger = logger;
    this.healthCheckInterval = options.healthCheckInterval || 60000;
    this.healthHistory = new Map();
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * Start health monitoring
   */
  start() {
    if (this.isMonitoring) {
      this.logger.warn('Health monitoring already running');
      return;
    }

    this.logger.info('Starting health monitoring', {
      interval: this.healthCheckInterval
    });

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(
      () => this.performHealthChecks(),
      this.healthCheckInterval
    );

    this.emit('monitoring:started');
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    this.logger.info('Stopping health monitoring');

    clearInterval(this.monitoringInterval);
    this.isMonitoring = false;
    this.monitoringInterval = null;

    this.emit('monitoring:stopped');
  }

  /**
   * Perform health checks on all servers
   */
  async performHealthChecks() {
    const serversInfo = this.processManager.getAllServersInfo();
    const results = {};

    for (const [serverName, serverInfo] of Object.entries(serversInfo)) {
      try {
        const health = await this.checkServerHealth(serverName, serverInfo);
        results[serverName] = health;

        // Store health history
        this.recordHealthCheck(serverName, health);

        // Emit events based on health status
        if (health.status === 'unhealthy') {
          this.emit('server:unhealthy', { serverName, health });
        } else if (health.status === 'degraded') {
          this.emit('server:degraded', { serverName, health });
        }
      } catch (error) {
        this.logger.error(`Health check failed for ${serverName}`, {
          error: error.message
        });

        results[serverName] = {
          status: 'error',
          error: error.message,
          timestamp: Date.now()
        };
      }
    }

    this.emit('health:check-complete', results);
    return results;
  }

  /**
   * Check health of individual server
   */
  async checkServerHealth(serverName, serverInfo) {
    const health = {
      serverName,
      timestamp: Date.now(),
      status: 'healthy',
      checks: {},
      metrics: {}
    };

    // Process status check
    health.checks.processRunning = serverInfo.status === 'running';

    // Uptime check
    const uptime = serverInfo.uptime;
    health.metrics.uptime = uptime;
    health.checks.uptimeNormal = uptime > 0;

    // Output activity check (has the server produced output recently?)
    const lastOutput = serverInfo.metrics?.lastOutput;
    const outputTimeout = 300000; // 5 minutes
    health.checks.recentActivity =
      !lastOutput || Date.now() - lastOutput < outputTimeout;

    // Error rate check
    const errorCount = serverInfo.metrics?.errorCount || 0;
    const outputCount = serverInfo.metrics?.outputCount || 1;
    const errorRate = errorCount / outputCount;
    health.metrics.errorRate = errorRate;
    health.checks.lowErrorRate = errorRate < 0.5;

    // Memory usage check (if available)
    if (serverInfo.metrics?.memoryUsage?.length > 0) {
      const latestMemory =
        serverInfo.metrics.memoryUsage[
          serverInfo.metrics.memoryUsage.length - 1
        ];
      health.metrics.memoryUsage = latestMemory;
      health.checks.memoryNormal = latestMemory < 500 * 1024 * 1024; // 500MB
    }

    // Determine overall status
    const failedChecks = Object.values(health.checks).filter(v => !v).length;

    if (failedChecks === 0) {
      health.status = 'healthy';
    } else if (failedChecks <= 2) {
      health.status = 'degraded';
    } else {
      health.status = 'unhealthy';
    }

    return health;
  }

  /**
   * Record health check in history
   */
  recordHealthCheck(serverName, health) {
    if (!this.healthHistory.has(serverName)) {
      this.healthHistory.set(serverName, []);
    }

    const history = this.healthHistory.get(serverName);
    history.push(health);

    // Keep only last 100 checks
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get health status for specific server
   */
  async getServerHealth(serverName) {
    const serverInfo = this.processManager.getServerInfo(serverName);

    if (!serverInfo) {
      return {
        status: 'not_running',
        timestamp: Date.now()
      };
    }

    return await this.checkServerHealth(serverName, serverInfo);
  }

  /**
   * Get health status for all servers
   */
  async getAllServersHealth() {
    const serversInfo = this.processManager.getAllServersInfo();
    const health = {};

    for (const [serverName, serverInfo] of Object.entries(serversInfo)) {
      health[serverName] = await this.checkServerHealth(serverName, serverInfo);
    }

    return health;
  }

  /**
   * Get health history for a server
   */
  getHealthHistory(serverName, options = {}) {
    const history = this.healthHistory.get(serverName) || [];
    const limit = options.limit || history.length;
    const since = options.since || 0;

    return history
      .filter(h => h.timestamp >= since)
      .slice(-limit);
  }

  /**
   * Get health trends for a server
   */
  getHealthTrends(serverName) {
    const history = this.getHealthHistory(serverName);

    if (history.length === 0) {
      return null;
    }

    const statusCounts = {
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      error: 0
    };

    const errorRates = [];
    const uptimes = [];

    history.forEach(h => {
      statusCounts[h.status] = (statusCounts[h.status] || 0) + 1;
      if (h.metrics?.errorRate !== undefined) {
        errorRates.push(h.metrics.errorRate);
      }
      if (h.metrics?.uptime !== undefined) {
        uptimes.push(h.metrics.uptime);
      }
    });

    const avgErrorRate =
      errorRates.length > 0
        ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length
        : 0;

    const totalChecks = history.length;
    const healthPercentage = (statusCounts.healthy / totalChecks) * 100;

    return {
      serverName,
      totalChecks,
      statusDistribution: statusCounts,
      healthPercentage: Math.round(healthPercentage),
      avgErrorRate,
      currentStatus: history[history.length - 1].status,
      lastCheck: history[history.length - 1].timestamp
    };
  }

  /**
   * Get aggregated health report
   */
  getHealthReport() {
    const servers = Array.from(this.healthHistory.keys());
    const report = {
      timestamp: Date.now(),
      totalServers: servers.length,
      servers: {},
      summary: {
        healthy: 0,
        degraded: 0,
        unhealthy: 0
      }
    };

    servers.forEach(serverName => {
      const trends = this.getHealthTrends(serverName);
      report.servers[serverName] = trends;

      if (trends) {
        report.summary[trends.currentStatus]++;
      }
    });

    return report;
  }

  /**
   * Clear health history
   */
  clearHistory(serverName = null) {
    if (serverName) {
      this.healthHistory.delete(serverName);
      this.logger.info(`Health history cleared for ${serverName}`);
    } else {
      this.healthHistory.clear();
      this.logger.info('All health history cleared');
    }
  }
}

module.exports = MCPHealthMonitor;
