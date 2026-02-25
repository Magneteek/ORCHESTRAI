/**
 * Session Bridge - Connect Trigger System with Session Manager
 *
 * This integrates triggered agent executions with session capture
 */

class SessionBridge {
  constructor(options = {}) {
    // Session Manager instance
    this.sessionManager = options.sessionManager || null;

    // Queue Manager instance
    this.queueManager = options.queueManager || null;

    if (!this.sessionManager) {
      console.warn('Session Manager not provided - sessions will not be captured');
    }
  }

  /**
   * Execute agent invocation (called by queue manager)
   */
  async executeAgentInvocation(job) {
    const { agent, prompt, parameters, metadata, priority } = job;

    try {
      // Start session if session manager available
      let sessionId = null;
      if (this.sessionManager) {
        const session = await this.sessionManager.startSession({
          agentType: agent,
          prompt,
          parameters: {
            ...parameters,
            triggeredBy: metadata.triggerType,
            triggerId: metadata.triggerId
          },
          projectContext: {
            triggeredBy: 'trigger-system',
            triggerType: metadata.triggerType,
            eventType: metadata.eventType
          },
          invokedBy: 'trigger-system',
          tags: ['triggered', metadata.triggerType, metadata.eventType]
        });

        sessionId = session.sessionId;
      }

      // For now, we return the invocation info
      // In production, this would actually invoke the agent via Task tool
      const result = {
        success: true,
        sessionId,
        agent,
        metadata,
        message: 'Agent invocation queued (Task tool integration pending)'
      };

      // Complete session if started
      if (sessionId && this.sessionManager) {
        await this.sessionManager.endSession(sessionId, {
          status: 'completed',
          outputs: { result },
          metadata: {
            note: 'Triggered execution - full Task tool integration pending'
          }
        });
      }

      return result;

    } catch (error) {
      // Record failure in session if started
      if (sessionId && this.sessionManager) {
        await this.sessionManager.endSession(sessionId, {
          status: 'failed',
          error: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Get session for triggered job
   */
  async getJobSession(jobId) {
    if (!this.sessionManager) {
      return null;
    }

    // Search sessions by metadata
    const sessions = await this.sessionManager.search({
      metadata: {
        triggeredJob: jobId
      }
    });

    return sessions.length > 0 ? sessions[0] : null;
  }
}

module.exports = SessionBridge;
