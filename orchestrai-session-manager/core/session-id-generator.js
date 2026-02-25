/**
 * Session ID Generator
 * Generates unique, sortable session IDs with timestamps
 */

const crypto = require('crypto');

class SessionIdGenerator {
  /**
   * Generate unique session ID
   * Format: ses-{date}-{random}
   * Example: ses-2026-02-12-a7f3b9c2
   *
   * Benefits:
   * - Sortable by date
   * - Human-readable
   * - Collision-resistant
   */
  static generate() {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const random = crypto.randomBytes(4).toString('hex'); // 8 chars
    return `ses-${date}-${random}`;
  }

  /**
   * Generate project-scoped session ID
   * Format: ses-{projectId}-{date}-{random}
   */
  static generateForProject(projectId) {
    const date = new Date().toISOString().split('T')[0];
    const random = crypto.randomBytes(3).toString('hex'); // 6 chars
    return `ses-${projectId}-${date}-${random}`;
  }

  /**
   * Generate agent-scoped session ID
   * Format: ses-{agentType}-{date}-{random}
   */
  static generateForAgent(agentType) {
    const date = new Date().toISOString().split('T')[0];
    const random = crypto.randomBytes(3).toString('hex');
    const agentShort = agentType.split('-')[0]; // First part of agent name
    return `ses-${agentShort}-${date}-${random}`;
  }

  /**
   * Generate fork session ID from parent
   * Format: ses-{date}-{random}-fork-{n}
   */
  static generateFork(parentSessionId) {
    const forkNumber = this._getForkNumber(parentSessionId);
    return `${parentSessionId}-fork-${forkNumber}`;
  }

  /**
   * Parse session ID to extract metadata
   */
  static parse(sessionId) {
    const parts = sessionId.split('-');

    if (parts[0] !== 'ses') {
      throw new Error(`Invalid session ID format: ${sessionId}`);
    }

    // Check if it's a fork
    const forkIndex = parts.indexOf('fork');
    const isFork = forkIndex !== -1;
    const forkNumber = isFork ? parseInt(parts[forkIndex + 1]) : null;

    // Extract date (YYYY-MM-DD)
    let dateStr;
    if (parts.length >= 4) {
      dateStr = `${parts[1]}-${parts[2]}-${parts[3]}`;
    }

    return {
      sessionId,
      date: dateStr ? new Date(dateStr) : null,
      isFork,
      forkNumber,
      parentSessionId: isFork ? parts.slice(0, forkIndex).join('-') : null
    };
  }

  /**
   * Validate session ID format
   */
  static validate(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }

    const pattern = /^ses-[\w]+-\d{4}-\d{2}-\d{2}-[a-f0-9]+(-fork-\d+)?$/;
    return pattern.test(sessionId);
  }

  /**
   * Get storage path for session
   * Returns: sessions/{year}/{month}/{sessionId}/
   */
  static getStoragePath(sessionId, basePath) {
    const parsed = this.parse(sessionId);

    if (!parsed.date) {
      throw new Error(`Cannot determine date from session ID: ${sessionId}`);
    }

    const year = parsed.date.getFullYear();
    const month = String(parsed.date.getMonth() + 1).padStart(2, '0');

    return `${basePath}/${year}/${month}/${sessionId}`;
  }

  /**
   * Helper: Get fork number from parent session ID
   */
  static _getForkNumber(parentSessionId) {
    // Check if parent already has forks
    const forkMatch = parentSessionId.match(/fork-(\d+)$/);
    if (forkMatch) {
      return parseInt(forkMatch[1]) + 1;
    }
    return 1;
  }
}

module.exports = SessionIdGenerator;
