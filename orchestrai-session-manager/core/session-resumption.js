/**
 * Session Resumption & Forking
 * Enable resuming and forking agent sessions
 */

const SessionStorage = require('./session-storage');
const SessionIdGenerator = require('./session-id-generator');

class SessionResumption {
  constructor(config = {}) {
    this.storage = new SessionStorage(config);
  }

  /**
   * Resume session from specific point
   */
  async resumeSession(sessionId, options = {}) {
    const originalSession = await this.storage.loadSession(sessionId);

    // Validate session can be resumed
    if (!originalSession.resumable) {
      throw new Error(`Session ${sessionId} is not resumable`);
    }

    // Determine resume point
    const resumePoint = options.resumePoint || originalSession.transcript.length;

    // Create resumed session context
    const resumedContext = {
      sessionId: SessionIdGenerator.generate(),
      parentSessionId: sessionId,
      isResume: true,
      resumePoint,

      // Copy relevant context from original
      agent: originalSession.agent,
      projectContext: originalSession.invocation.projectContext,

      // Truncate transcript to resume point
      priorTranscript: originalSession.transcript.slice(0, resumePoint),

      // New prompt
      newPrompt: options.prompt || options.newPrompt,

      // Carry forward deliverables
      existingDeliverables: originalSession.links.deliverables,

      // State from resume point
      resumeState: this._getResumeState(originalSession, resumePoint)
    };

    return resumedContext;
  }

  /**
   * Fork session to explore alternative approach
   */
  async forkSession(sessionId, options = {}) {
    const originalSession = await this.storage.loadSession(sessionId);

    // Determine fork point
    const forkPoint = options.forkPoint || originalSession.transcript.length;

    // Generate fork session ID
    const forkedSessionId = SessionIdGenerator.generateFork(sessionId);

    // Create forked session context
    const forkedContext = {
      sessionId: forkedSessionId,
      parentSessionId: sessionId,
      forkedFrom: sessionId,
      isFork: true,
      forkPoint,

      // Copy context
      agent: originalSession.agent,
      projectContext: originalSession.invocation.projectContext,

      // Transcript up to fork point
      priorTranscript: originalSession.transcript.slice(0, forkPoint),

      // New direction
      newPrompt: options.prompt || options.newPrompt,
      forkReason: options.reason || 'Exploring alternative approach',

      // State at fork point
      forkState: this._getResumeState(originalSession, forkPoint)
    };

    // Link original and fork
    await this._linkForkedSessions(sessionId, forkedSessionId);

    return forkedContext;
  }

  /**
   * Get all forks of a session
   */
  async getForks(sessionId) {
    const originalSession = await this.storage.loadSession(sessionId);
    const forks = [];

    // Find forked sessions
    const allSessions = await this.storage.listSessions({ limit: 1000 });

    for (const metadata of allSessions) {
      if (metadata.sessionId.startsWith(sessionId + '-fork')) {
        const forkedSession = await this.storage.loadSession(metadata.sessionId);
        forks.push({
          sessionId: forkedSession.sessionId,
          forkPoint: forkedSession.forkPoint,
          timestamp: forkedSession.timestamp,
          status: forkedSession.status,
          reason: forkedSession.invocation.forkReason
        });
      }
    }

    return forks;
  }

  /**
   * Compare forked sessions
   */
  async compareForks(sessionIds) {
    const sessions = await Promise.all(
      sessionIds.map(id => this.storage.loadSession(id))
    );

    const comparison = {
      sessions: [],
      commonAncestor: this._findCommonAncestor(sessions)
    };

    for (const session of sessions) {
      comparison.sessions.push({
        sessionId: session.sessionId,
        status: session.status,
        duration: session.duration,
        outputs: session.outputs,
        metrics: session.metrics,
        errors: session.errors.length,
        warnings: session.warnings.length
      });
    }

    return comparison;
  }

  /**
   * Get resume state at specific point
   */
  _getResumeState(session, point) {
    const transcriptUpToPoint = session.transcript.slice(0, point);

    // Extract state information
    const state = {
      transcriptLength: point,
      toolCallsSoFar: [],
      deliverablesSoFar: [],
      outputsSoFar: {},
      lastThinking: null
    };

    // Find tool calls up to point
    for (const entry of transcriptUpToPoint) {
      if (entry.role === 'tool_use') {
        state.toolCallsSoFar.push({
          tool: entry.tool,
          parameters: entry.parameters,
          result: entry.result
        });
      }

      if (entry.thinking) {
        state.lastThinking = entry.thinking;
      }
    }

    // Get deliverables created up to point
    for (const file of session.outputs.files) {
      const fileCreated = new Date(file.created);
      const pointTime = new Date(transcriptUpToPoint[transcriptUpToPoint.length - 1].timestamp);

      if (fileCreated <= pointTime) {
        state.deliverablesSoFar.push(file.path);
      }
    }

    return state;
  }

  /**
   * Link forked sessions
   */
  async _linkForkedSessions(originalId, forkedId) {
    const originalSession = await this.storage.loadSession(originalId);

    if (!originalSession.links.relatedSessions.includes(forkedId)) {
      originalSession.links.relatedSessions.push(forkedId);
      await this.storage.saveSession(originalSession);
    }
  }

  /**
   * Find common ancestor of forked sessions
   */
  _findCommonAncestor(sessions) {
    if (sessions.length === 0) return null;

    // Get parent chain for first session
    const firstParent = sessions[0].parentSessionId || sessions[0].forkedFrom;

    if (!firstParent) return null;

    // Check if all sessions share this parent
    const allShareParent = sessions.every(s =>
      s.parentSessionId === firstParent || s.forkedFrom === firstParent
    );

    if (allShareParent) {
      return firstParent;
    }

    return null;
  }

  /**
   * Get resume points for a session
   */
  async getResumePoints(sessionId) {
    const session = await this.storage.loadSession(sessionId);
    return session.resumePoints || [];
  }

  /**
   * Validate resume/fork is possible
   */
  async canResume(sessionId, point = null) {
    try {
      const session = await this.storage.loadSession(sessionId);

      if (!session.resumable) {
        return { canResume: false, reason: 'Session marked as not resumable' };
      }

      if (point && point >= session.transcript.length) {
        return { canResume: false, reason: 'Resume point exceeds transcript length' };
      }

      return { canResume: true };
    } catch (error) {
      return { canResume: false, reason: error.message };
    }
  }

  /**
   * Generate resume prompt with context
   */
  async generateResumePrompt(sessionId, options = {}) {
    const resumeContext = await this.resumeSession(sessionId, options);

    // Build context-aware prompt
    let prompt = `# Resuming Session ${sessionId}\n\n`;
    prompt += `**Original Task:** ${resumeContext.priorTranscript[0].content}\n\n`;
    prompt += `**Progress So Far:** ${resumeContext.resumePoint} steps completed\n\n`;

    if (resumeContext.existingDeliverables.length > 0) {
      prompt += `**Deliverables Created:**\n`;
      for (const deliverable of resumeContext.existingDeliverables) {
        prompt += `- ${deliverable}\n`;
      }
      prompt += `\n`;
    }

    if (options.prompt) {
      prompt += `**New Direction:** ${options.prompt}\n\n`;
    }

    prompt += `Please continue from where the previous session left off.`;

    return prompt;
  }

  /**
   * Generate fork prompt with context
   */
  async generateForkPrompt(sessionId, options = {}) {
    const forkContext = await this.forkSession(sessionId, options);

    // Build context-aware prompt
    let prompt = `# Forked Session from ${sessionId}\n\n`;
    prompt += `**Original Task:** ${forkContext.priorTranscript[0].content}\n\n`;
    prompt += `**Fork Point:** Step ${forkContext.forkPoint}\n`;
    prompt += `**Reason for Fork:** ${forkContext.forkReason}\n\n`;

    if (options.prompt) {
      prompt += `**Alternative Approach:** ${options.prompt}\n\n`;
    }

    prompt += `Please explore this alternative approach starting from the fork point.`;

    return prompt;
  }
}

module.exports = SessionResumption;
