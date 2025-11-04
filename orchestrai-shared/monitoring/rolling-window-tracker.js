/**
 * Rolling Window Tracker
 * Tracks token usage in a sliding 5-hour window
 * Critical for Anthropic's 5-hour rate limits
 */

class RollingWindowTracker {
  constructor(options = {}) {
    this.options = {
      windowSize: options.windowSize || (5 * 60 * 60 * 1000), // 5 hours in ms
      defaultLimit: options.defaultLimit || 400000, // 400K default (Pro tier)
      cleanupInterval: options.cleanupInterval || 60000, // Clean up every minute
      ...options
    };

    this.entries = []; // [{timestamp, inputTokens, outputTokens, totalTokens}, ...]
    this.adaptiveLimit = this.options.defaultLimit;

    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Add token usage to the rolling window
   * @param {number} inputTokens - Input tokens
   * @param {number} outputTokens - Output tokens
   */
  addTokens(inputTokens, outputTokens) {
    const entry = {
      timestamp: Date.now(),
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      totalTokens: (inputTokens || 0) + (outputTokens || 0)
    };

    this.entries.push(entry);
    this.cleanup();

    return entry;
  }

  /**
   * Clean up old entries outside the window
   */
  cleanup() {
    const cutoff = Date.now() - this.options.windowSize;
    this.entries = this.entries.filter(e => e.timestamp > cutoff);
  }

  /**
   * Get current usage in the rolling window
   * @returns {Object} Usage statistics
   */
  getCurrentUsage() {
    this.cleanup();

    const usage = this.entries.reduce((acc, entry) => ({
      inputTokens: acc.inputTokens + entry.inputTokens,
      outputTokens: acc.outputTokens + entry.outputTokens,
      totalTokens: acc.totalTokens + entry.totalTokens
    }), { inputTokens: 0, outputTokens: 0, totalTokens: 0 });

    return usage;
  }

  /**
   * Get percentage of limit used
   * @returns {number} Percentage (0-100)
   */
  getPercentageUsed() {
    const usage = this.getCurrentUsage();
    return (usage.totalTokens / this.adaptiveLimit) * 100;
  }

  /**
   * Get remaining tokens in window
   * @returns {number} Remaining tokens
   */
  getRemaining() {
    const usage = this.getCurrentUsage();
    return Math.max(0, this.adaptiveLimit - usage.totalTokens);
  }

  /**
   * Get time when window started
   * @returns {number|null} Timestamp of oldest entry
   */
  getWindowStart() {
    if (this.entries.length === 0) {
      return null;
    }
    return this.entries[0].timestamp;
  }

  /**
   * Get time since window started
   * @returns {number} Milliseconds since window start
   */
  getWindowAge() {
    const start = this.getWindowStart();
    if (!start) {
      return 0;
    }
    return Date.now() - start;
  }

  /**
   * Get time until window resets
   * @returns {number} Milliseconds until oldest entry expires
   */
  getTimeUntilReset() {
    const start = this.getWindowStart();
    if (!start) {
      return this.options.windowSize;
    }

    const windowEnd = start + this.options.windowSize;
    const remaining = windowEnd - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Calculate time until window is exhausted at current burn rate
   * @param {number} burnRate - Tokens per second
   * @returns {number|null} Milliseconds until exhausted, or null if not burning
   */
  getTimeUntilExhausted(burnRate) {
    if (!burnRate || burnRate <= 0) {
      return null;
    }

    const remaining = this.getRemaining();
    if (remaining <= 0) {
      return 0;
    }

    const secondsRemaining = remaining / burnRate;
    return secondsRemaining * 1000;
  }

  /**
   * Set adaptive limit based on P90 analysis
   * @param {number} limit - New limit
   */
  setAdaptiveLimit(limit) {
    if (limit && limit > 0) {
      this.adaptiveLimit = limit;
      console.log(`📊 5-hour window limit updated: ${limit.toLocaleString()} tokens`);
    }
  }

  /**
   * Get detailed window status
   * @returns {Object} Complete window status
   */
  getStatus() {
    this.cleanup();

    const usage = this.getCurrentUsage();
    const remaining = this.getRemaining();
    const percentageUsed = this.getPercentageUsed();

    return {
      window: {
        size: this.options.windowSize,
        sizeHours: this.options.windowSize / (1000 * 60 * 60)
      },
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        entryCount: this.entries.length
      },
      limit: {
        current: this.adaptiveLimit,
        remaining: remaining,
        percentageUsed: percentageUsed
      },
      timing: {
        windowStart: this.getWindowStart(),
        windowAge: this.getWindowAge(),
        timeUntilReset: this.getTimeUntilReset()
      },
      status: this.getWindowStatus(percentageUsed)
    };
  }

  /**
   * Get status level based on usage percentage
   * @param {number} percentage - Usage percentage
   * @returns {Object} Status info
   */
  getWindowStatus(percentage) {
    if (percentage >= 95) {
      return { level: 'critical', color: 'red', message: 'Near limit!' };
    } else if (percentage >= 80) {
      return { level: 'warning', color: 'yellow', message: 'High usage' };
    } else if (percentage >= 60) {
      return { level: 'caution', color: 'orange', message: 'Moderate usage' };
    } else {
      return { level: 'normal', color: 'green', message: 'Normal' };
    }
  }

  /**
   * Serialize for persistence
   * @returns {Object} Serialized data
   */
  serialize() {
    return {
      entries: this.entries,
      adaptiveLimit: this.adaptiveLimit,
      windowSize: this.options.windowSize
    };
  }

  /**
   * Deserialize from persisted data
   * @param {Object} data - Persisted data
   */
  deserialize(data) {
    if (data.entries && Array.isArray(data.entries)) {
      this.entries = data.entries;
      this.cleanup(); // Remove expired entries
    }

    if (data.adaptiveLimit) {
      this.adaptiveLimit = data.adaptiveLimit;
    }

    if (data.windowSize) {
      this.options.windowSize = data.windowSize;
    }

    console.log(`✓ Restored rolling window: ${this.entries.length} entries`);
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanup() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
    }

    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }
}

module.exports = RollingWindowTracker;
