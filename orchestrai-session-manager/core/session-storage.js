/**
 * Session Storage
 * File-based storage implementation for agent sessions
 */

const fs = require('fs').promises;
const path = require('path');
const SessionIdGenerator = require('./session-id-generator');

class SessionStorage {
  constructor(config = {}) {
    this.basePath = config.basePath || path.join(__dirname, '../../sessions');
    this.config = config;
    this._ensureBasePath();
  }

  /**
   * Ensure base storage path exists
   */
  async _ensureBasePath() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create sessions directory:', error);
    }
  }

  /**
   * Get storage path for session
   */
  _getSessionPath(sessionId) {
    return SessionIdGenerator.getStoragePath(sessionId, this.basePath);
  }

  /**
   * Save session to disk
   */
  async saveSession(session) {
    const sessionPath = this._getSessionPath(session.sessionId);

    try {
      // Ensure directory exists
      await fs.mkdir(sessionPath, { recursive: true });

      // Save session data
      const sessionFile = path.join(sessionPath, 'session.json');
      await fs.writeFile(
        sessionFile,
        JSON.stringify(session, null, 2),
        'utf8'
      );

      // Save transcript separately for easy access
      const transcriptFile = path.join(sessionPath, 'transcript.json');
      await fs.writeFile(
        transcriptFile,
        JSON.stringify(session.transcript, null, 2),
        'utf8'
      );

      // Save metadata for quick search
      const metadataFile = path.join(sessionPath, 'metadata.json');
      await fs.writeFile(
        metadataFile,
        JSON.stringify({
          sessionId: session.sessionId,
          timestamp: session.timestamp,
          status: session.status,
          agentType: session.agent.type,
          duration: session.duration,
          projectId: session.links.project,
          clientId: session.links.client,
          tags: session.tags
        }, null, 2),
        'utf8'
      );

      return true;
    } catch (error) {
      console.error(`Failed to save session ${session.sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Load session from disk
   */
  async loadSession(sessionId) {
    const sessionPath = this._getSessionPath(sessionId);
    const sessionFile = path.join(sessionPath, 'session.json');

    try {
      const data = await fs.readFile(sessionFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Session not found: ${sessionId}`);
      }
      throw error;
    }
  }

  /**
   * Load session transcript
   */
  async loadTranscript(sessionId) {
    const sessionPath = this._getSessionPath(sessionId);
    const transcriptFile = path.join(sessionPath, 'transcript.json');

    try {
      const data = await fs.readFile(transcriptFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Fallback to full session
      const session = await this.loadSession(sessionId);
      return session.transcript;
    }
  }

  /**
   * Load session metadata (lightweight)
   */
  async loadMetadata(sessionId) {
    const sessionPath = this._getSessionPath(sessionId);
    const metadataFile = path.join(sessionPath, 'metadata.json');

    try {
      const data = await fs.readFile(metadataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Fallback to full session
      const session = await this.loadSession(sessionId);
      return {
        sessionId: session.sessionId,
        timestamp: session.timestamp,
        status: session.status,
        agentType: session.agent.type,
        duration: session.duration,
        projectId: session.links.project,
        clientId: session.links.client,
        tags: session.tags
      };
    }
  }

  /**
   * List all sessions (with filters)
   */
  async listSessions(filters = {}) {
    const sessions = [];

    try {
      // Read years
      const years = await fs.readdir(this.basePath);

      for (const year of years) {
        if (!year.match(/^\d{4}$/)) continue;

        const yearPath = path.join(this.basePath, year);
        const months = await fs.readdir(yearPath);

        for (const month of months) {
          if (!month.match(/^\d{2}$/)) continue;

          const monthPath = path.join(yearPath, month);
          const sessionDirs = await fs.readdir(monthPath);

          for (const sessionDir of sessionDirs) {
            if (!sessionDir.startsWith('ses-')) continue;

            try {
              const metadata = await this.loadMetadata(sessionDir);

              // Apply filters
              if (filters.agentType && metadata.agentType !== filters.agentType) {
                continue;
              }

              if (filters.status && metadata.status !== filters.status) {
                continue;
              }

              if (filters.projectId && metadata.projectId !== filters.projectId) {
                continue;
              }

              if (filters.clientId && metadata.clientId !== filters.clientId) {
                continue;
              }

              if (filters.dateRange) {
                const sessionDate = new Date(metadata.timestamp);
                if (filters.dateRange.start && sessionDate < new Date(filters.dateRange.start)) {
                  continue;
                }
                if (filters.dateRange.end && sessionDate > new Date(filters.dateRange.end)) {
                  continue;
                }
              }

              sessions.push(metadata);
            } catch (error) {
              // Skip invalid sessions
              continue;
            }
          }
        }
      }

      // Sort by timestamp (newest first)
      sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply limit
      if (filters.limit) {
        return sessions.slice(0, filters.limit);
      }

      return sessions;
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  /**
   * Search sessions by deliverable path
   */
  async findSessionByDeliverable(deliverablePath) {
    // This is inefficient but works for file-based storage
    // For production, use database with indexed deliverable paths
    const sessions = await this.listSessions({});

    for (const metadata of sessions) {
      const session = await this.loadSession(metadata.sessionId);
      if (session.links.deliverables.includes(deliverablePath)) {
        return session;
      }
    }

    return null;
  }

  /**
   * Find related sessions
   */
  async findRelatedSessions(sessionId) {
    const session = await this.loadSession(sessionId);
    const related = [];

    // Find sessions from same project
    if (session.links.project) {
      const projectSessions = await this.listSessions({
        projectId: session.links.project,
        limit: 20
      });

      related.push(...projectSessions.filter(s => s.sessionId !== sessionId));
    }

    // Find explicitly linked sessions
    for (const linkedId of session.links.relatedSessions) {
      try {
        const linkedSession = await this.loadMetadata(linkedId);
        related.push(linkedSession);
      } catch (error) {
        // Session not found
        continue;
      }
    }

    // Remove duplicates
    const uniqueSessions = new Map();
    for (const s of related) {
      uniqueSessions.set(s.sessionId, s);
    }

    return Array.from(uniqueSessions.values());
  }

  /**
   * Link deliverable to session
   */
  async linkDeliverable(sessionId, deliverable) {
    const session = await this.loadSession(sessionId);

    if (!session.links.deliverables.includes(deliverable.path)) {
      session.links.deliverables.push(deliverable.path);

      if (deliverable.type) {
        session.outputs.files.push({
          path: deliverable.path,
          type: deliverable.type,
          size: deliverable.size || 0,
          created: new Date().toISOString()
        });
      }

      await this.saveSession(session);
    }
  }

  /**
   * Delete session (soft delete - mark as archived)
   */
  async deleteSession(sessionId, hard = false) {
    if (hard) {
      // Hard delete - remove from disk
      const sessionPath = this._getSessionPath(sessionId);
      await fs.rm(sessionPath, { recursive: true, force: true });
    } else {
      // Soft delete - mark as archived
      const session = await this.loadSession(sessionId);
      session.archived = true;
      await this.saveSession(session);
    }
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    const sessions = await this.listSessions({});

    const stats = {
      totalSessions: sessions.length,
      byStatus: {},
      byAgent: {},
      byProject: {},
      totalDuration: 0,
      totalCost: 0
    };

    for (const metadata of sessions) {
      // By status
      stats.byStatus[metadata.status] = (stats.byStatus[metadata.status] || 0) + 1;

      // By agent
      stats.byAgent[metadata.agentType] = (stats.byAgent[metadata.agentType] || 0) + 1;

      // By project
      if (metadata.projectId) {
        stats.byProject[metadata.projectId] = (stats.byProject[metadata.projectId] || 0) + 1;
      }

      // Totals
      if (metadata.duration) {
        stats.totalDuration += metadata.duration;
      }
    }

    return stats;
  }
}

module.exports = SessionStorage;
