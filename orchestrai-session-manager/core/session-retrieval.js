/**
 * Session Retrieval API
 * High-level API for querying and retrieving sessions
 */

const SessionStorage = require('./session-storage');
const SessionIdGenerator = require('./session-id-generator');

class SessionRetrieval {
  constructor(config = {}) {
    this.storage = new SessionStorage(config);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    return await this.storage.loadSession(sessionId);
  }

  /**
   * Get session transcript
   */
  async getTranscript(sessionId) {
    return await this.storage.loadTranscript(sessionId);
  }

  /**
   * Get session metadata (lightweight)
   */
  async getMetadata(sessionId) {
    return await this.storage.loadMetadata(sessionId);
  }

  /**
   * Search sessions with filters
   */
  async search(filters = {}) {
    return await this.storage.listSessions(filters);
  }

  /**
   * Get recent sessions
   */
  async getRecent(limit = 20) {
    return await this.storage.listSessions({ limit });
  }

  /**
   * Get sessions by agent type
   */
  async getByAgent(agentType, limit = 50) {
    return await this.storage.listSessions({ agentType, limit });
  }

  /**
   * Get sessions by project
   */
  async getByProject(projectId, limit = 50) {
    return await this.storage.listSessions({ projectId, limit });
  }

  /**
   * Get sessions by client
   */
  async getByClient(clientId, limit = 50) {
    return await this.storage.listSessions({ clientId, limit });
  }

  /**
   * Get sessions by date range
   */
  async getByDateRange(start, end, limit = 100) {
    return await this.storage.listSessions({
      dateRange: { start, end },
      limit
    });
  }

  /**
   * Get sessions by status
   */
  async getByStatus(status, limit = 50) {
    return await this.storage.listSessions({ status, limit });
  }

  /**
   * Find session that created a deliverable
   */
  async findByDeliverable(deliverablePath) {
    return await this.storage.findSessionByDeliverable(deliverablePath);
  }

  /**
   * Get related sessions
   */
  async getRelated(sessionId) {
    return await this.storage.findRelatedSessions(sessionId);
  }

  /**
   * Get session with full context (including related sessions)
   */
  async getWithContext(sessionId) {
    const session = await this.getSession(sessionId);
    const related = await this.getRelated(sessionId);

    return {
      session,
      related,
      deliverables: session.links.deliverables,
      project: session.links.project,
      client: session.links.client
    };
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    return await this.storage.getStats();
  }

  /**
   * Export session to JSON
   */
  async exportSession(sessionId, outputPath) {
    const fs = require('fs').promises;
    const session = await this.getSession(sessionId);

    await fs.writeFile(
      outputPath,
      JSON.stringify(session, null, 2),
      'utf8'
    );

    return outputPath;
  }

  /**
   * Get sessions that need review
   */
  async getNeedingReview(limit = 20) {
    // Get failed or warning sessions
    const failed = await this.search({ status: 'failed', limit: limit / 2 });
    const completed = await this.search({ status: 'completed', limit });

    const needReview = [...failed];

    // Add completed sessions with warnings
    for (const metadata of completed) {
      const session = await this.getSession(metadata.sessionId);
      if (session.warnings && session.warnings.length > 0) {
        needReview.push(metadata);
      }
    }

    return needReview.slice(0, limit);
  }

  /**
   * Get performance summary for agent type
   */
  async getAgentPerformance(agentType) {
    const sessions = await this.getByAgent(agentType, 100);

    let totalDuration = 0;
    let totalCost = 0;
    let totalTokens = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const metadata of sessions) {
      const session = await this.getSession(metadata.sessionId);

      if (session.status === 'completed') successCount++;
      if (session.status === 'failed') failureCount++;

      totalDuration += session.duration || 0;
      totalCost += session.metrics.cost || 0;
      totalTokens += session.metrics.totalTokens || 0;
    }

    return {
      agentType,
      totalSessions: sessions.length,
      successRate: sessions.length > 0 ? (successCount / sessions.length) * 100 : 0,
      averageDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
      totalCost,
      averageCost: sessions.length > 0 ? totalCost / sessions.length : 0,
      totalTokens,
      averageTokens: sessions.length > 0 ? totalTokens / sessions.length : 0
    };
  }
}

module.exports = SessionRetrieval;
