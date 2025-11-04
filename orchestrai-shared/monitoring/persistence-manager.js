/**
 * Persistence Manager
 * Handles saving/loading token monitor data to disk
 * Prevents data loss on restart
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class PersistenceManager {
  constructor(options = {}) {
    this.options = {
      dataDir: options.dataDir || path.join(os.homedir(), '.orchestrai-monitor'),
      sessionFile: 'session-data.json',
      historicalFile: 'historical-sessions.json',
      autoSaveInterval: options.autoSaveInterval || 30000, // 30 seconds
      maxHistoricalSessions: options.maxHistoricalSessions || 100,
      ...options
    };

    this.sessionPath = path.join(this.options.dataDir, this.options.sessionFile);
    this.historicalPath = path.join(this.options.dataDir, this.options.historicalFile);

    // Ensure data directory exists
    this.ensureDataDirectory();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    if (!fs.existsSync(this.options.dataDir)) {
      fs.mkdirSync(this.options.dataDir, { recursive: true });
      console.log(`✓ Created data directory: ${this.options.dataDir}`);
    }
  }

  /**
   * Save current session data
   * @param {Object} sessionData - Current session state
   */
  saveSession(sessionData) {
    try {
      const data = {
        ...sessionData,
        savedAt: Date.now(),
        version: '2.0'
      };

      // Atomic write using temp file
      const tempPath = this.sessionPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
      fs.renameSync(tempPath, this.sessionPath);

      return { success: true };
    } catch (error) {
      console.error('Error saving session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load current session data
   * @returns {Object|null} Session data or null if not found
   */
  loadSession() {
    try {
      if (!fs.existsSync(this.sessionPath)) {
        return null;
      }

      const data = JSON.parse(fs.readFileSync(this.sessionPath, 'utf8'));

      // Validate version
      if (data.version !== '2.0') {
        console.warn('⚠️  Session data version mismatch, starting fresh');
        return null;
      }

      console.log(`✓ Loaded session from ${new Date(data.savedAt).toLocaleString()}`);
      return data;
    } catch (error) {
      console.error('Error loading session:', error);
      // Return null on error - graceful fallback
      return null;
    }
  }

  /**
   * Archive current session to historical data
   * @param {Object} sessionData - Session to archive
   */
  archiveSession(sessionData) {
    try {
      let historical = this.loadHistorical();

      // Add new session
      historical.sessions.unshift({
        ...sessionData,
        archivedAt: Date.now()
      });

      // Keep only last N sessions
      if (historical.sessions.length > this.options.maxHistoricalSessions) {
        historical.sessions = historical.sessions.slice(0, this.options.maxHistoricalSessions);
      }

      // Update metadata
      historical.lastUpdated = Date.now();
      historical.totalSessions = historical.sessions.length;

      // Save
      const tempPath = this.historicalPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(historical, null, 2));
      fs.renameSync(tempPath, this.historicalPath);

      console.log(`✓ Archived session (${historical.totalSessions} total)`);
      return { success: true };
    } catch (error) {
      console.error('Error archiving session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load historical sessions
   * @returns {Object} Historical data
   */
  loadHistorical() {
    try {
      if (!fs.existsSync(this.historicalPath)) {
        return {
          sessions: [],
          lastUpdated: Date.now(),
          totalSessions: 0
        };
      }

      return JSON.parse(fs.readFileSync(this.historicalPath, 'utf8'));
    } catch (error) {
      console.error('Error loading historical data:', error);
      return {
        sessions: [],
        lastUpdated: Date.now(),
        totalSessions: 0
      };
    }
  }

  /**
   * Get sessions from last N hours
   * @param {number} hours - Number of hours to look back
   * @returns {Array} Sessions within timeframe
   */
  getRecentSessions(hours = 192) {
    const historical = this.loadHistorical();
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);

    return historical.sessions.filter(s =>
      (s.archivedAt || s.startTime || 0) > cutoff
    );
  }

  /**
   * Calculate P90 (90th percentile) token usage
   * @param {number} hours - Hours to look back
   * @returns {number} P90 token limit
   */
  calculateP90Limit(hours = 192) {
    const sessions = this.getRecentSessions(hours);

    if (sessions.length < 3) {
      // Not enough data, return default
      return 200000; // 200K default
    }

    const tokenTotals = sessions
      .map(s => s.totalTokens || 0)
      .filter(t => t > 0)
      .sort((a, b) => a - b);

    if (tokenTotals.length === 0) {
      return 200000;
    }

    // Calculate 90th percentile
    const p90Index = Math.floor(tokenTotals.length * 0.9);
    const p90Value = tokenTotals[p90Index];

    console.log(`📊 P90 Analysis: ${p90Value.toLocaleString()} tokens (${tokenTotals.length} sessions)`);

    return p90Value;
  }

  /**
   * Clear all persisted data
   */
  clearAll() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        fs.unlinkSync(this.sessionPath);
      }
      if (fs.existsSync(this.historicalPath)) {
        fs.unlinkSync(this.historicalPath);
      }
      console.log('✓ Cleared all persisted data');
      return { success: true };
    } catch (error) {
      console.error('Error clearing data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage stats
   */
  getStats() {
    const stats = {
      dataDir: this.options.dataDir,
      sessionExists: fs.existsSync(this.sessionPath),
      historicalExists: fs.existsSync(this.historicalPath),
      sessionSize: 0,
      historicalSize: 0,
      totalSessions: 0
    };

    if (stats.sessionExists) {
      stats.sessionSize = fs.statSync(this.sessionPath).size;
    }

    if (stats.historicalExists) {
      stats.historicalSize = fs.statSync(this.historicalPath).size;
      const historical = this.loadHistorical();
      stats.totalSessions = historical.totalSessions || 0;
    }

    return stats;
  }
}

module.exports = PersistenceManager;
