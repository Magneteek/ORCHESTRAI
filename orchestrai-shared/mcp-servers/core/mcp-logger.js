/**
 * Structured logging system for MCP server operations
 * Provides consistent, filterable logging across all MCP components
 */
class MCPLogger {
  constructor(options = {}) {
    this.component = options.component || 'MCP';
    this.minLevel = options.minLevel || 'info';
    this.enableColors = options.enableColors !== false;
    this.enableTimestamps = options.enableTimestamps !== false;
    this.logHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;

    this.levels = {
      debug: { priority: 0, color: '\x1b[36m', emoji: '🔍' },
      info: { priority: 1, color: '\x1b[32m', emoji: '📋' },
      warn: { priority: 2, color: '\x1b[33m', emoji: '⚠️' },
      error: { priority: 3, color: '\x1b[31m', emoji: '❌' },
      success: { priority: 1, color: '\x1b[32m', emoji: '✅' }
    };
  }

  /**
   * Log a message with specified level
   * @param {string} level - Log level (debug, info, warn, error, success)
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  log(level, message, metadata = {}) {
    const levelConfig = this.levels[level];
    const minLevelConfig = this.levels[this.minLevel];

    if (!levelConfig || levelConfig.priority < minLevelConfig.priority) {
      return;
    }

    const logEntry = {
      timestamp: Date.now(),
      level,
      component: this.component,
      message,
      metadata,
      iso: new Date().toISOString()
    };

    // Store in history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Format and output
    const formatted = this.formatLog(logEntry, levelConfig);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Format log entry for output
   */
  formatLog(entry, levelConfig) {
    const parts = [];

    if (this.enableTimestamps) {
      parts.push(`[${new Date(entry.timestamp).toLocaleTimeString()}]`);
    }

    if (this.enableColors) {
      parts.push(`${levelConfig.color}${levelConfig.emoji} [${entry.component}]${this.resetColor()}`);
    } else {
      parts.push(`${levelConfig.emoji} [${entry.component}]`);
    }

    parts.push(entry.message);

    if (Object.keys(entry.metadata).length > 0) {
      parts.push(JSON.stringify(entry.metadata));
    }

    return parts.join(' ');
  }

  resetColor() {
    return '\x1b[0m';
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  success(message, metadata) {
    this.log('success', message, metadata);
  }

  /**
   * Get log history with optional filtering
   */
  getHistory(filters = {}) {
    let filtered = [...this.logHistory];

    if (filters.level) {
      filtered = filtered.filter(entry => entry.level === filters.level);
    }

    if (filters.component) {
      filtered = filtered.filter(entry => entry.component === filters.component);
    }

    if (filters.since) {
      filtered = filtered.filter(entry => entry.timestamp >= filters.since);
    }

    return filtered;
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
  }

  /**
   * Create a child logger with different component name
   */
  child(componentName) {
    return new MCPLogger({
      component: `${this.component}:${componentName}`,
      minLevel: this.minLevel,
      enableColors: this.enableColors,
      enableTimestamps: this.enableTimestamps,
      maxHistorySize: this.maxHistorySize
    });
  }
}

module.exports = MCPLogger;
