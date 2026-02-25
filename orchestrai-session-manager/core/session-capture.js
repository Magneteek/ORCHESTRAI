/**
 * Session Capture
 * Middleware for capturing agent execution sessions
 */

const SessionIdGenerator = require('./session-id-generator');
const SessionStorage = require('./session-storage');
const path = require('path');

class SessionCapture {
  constructor(config = {}) {
    this.config = {
      basePath: config.basePath || path.join(__dirname, '../../sessions'),
      captureThinking: config.captureThinking !== false,
      captureToolCalls: config.captureToolCalls !== false,
      captureOutputs: config.captureOutputs !== false,
      transcriptDetail: config.transcriptDetail || 'full',
      ...config
    };

    this.storage = new SessionStorage(this.config);
    this.activeSessions = new Map(); // In-memory session tracking
  }

  /**
   * Start a new session
   */
  async startSession(options = {}) {
    const sessionId = options.sessionId || SessionIdGenerator.generate();

    const session = {
      // Identity
      sessionId,
      parentSessionId: options.parentSessionId || null,
      forkedFrom: options.forkedFrom || null,

      // Metadata
      timestamp: new Date().toISOString(),
      startTime: Date.now(),
      status: 'in_progress',

      // Agent Information
      agent: {
        type: options.agentType || 'unknown',
        model: options.model || 'claude-sonnet-4.5',
        complexity_tier: options.complexity_tier || null,
        tools: options.tools || []
      },

      // Execution Context
      invocation: {
        prompt: options.prompt || '',
        parameters: options.parameters || {},
        invokedBy: options.invokedBy || 'user',
        projectContext: options.projectContext || {}
      },

      // Transcript (will be populated)
      transcript: [
        {
          role: 'user',
          content: options.prompt || '',
          timestamp: new Date().toISOString()
        }
      ],

      // Tool Calls Summary
      toolCalls: [],

      // Outputs & Deliverables
      outputs: {
        files: [],
        data: {}
      },

      // Performance Metrics
      metrics: {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
        thinkingTime: 0,
        executionTime: 0
      },

      // Errors & Warnings
      errors: [],
      warnings: [],

      // Resumption Data
      resumable: true,
      resumePoints: [],

      // Linking
      links: {
        project: options.projectContext?.projectId || null,
        client: options.projectContext?.clientId || null,
        relatedSessions: [],
        deliverables: [],
        prLinks: [],
        issueLinks: []
      },

      // Metadata
      tags: options.tags || [],
      searchable: true,
      archived: false,
      compressed: false
    };

    // Store in memory and on disk
    this.activeSessions.set(sessionId, session);
    await this.storage.saveSession(session);

    return session;
  }

  /**
   * Add transcript entry
   */
  async addTranscript(sessionId, entry) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const transcriptEntry = {
      role: entry.role,
      content: entry.content,
      thinking: this.config.captureThinking ? entry.thinking : undefined,
      tool: entry.tool || undefined,
      parameters: entry.parameters || undefined,
      result: entry.result || undefined,
      timestamp: new Date().toISOString()
    };

    session.transcript.push(transcriptEntry);

    // Update session on disk (debounced)
    await this._debouncedSave(sessionId);
  }

  /**
   * Record tool call
   */
  async recordToolCall(sessionId, toolCall) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    if (!this.config.captureToolCalls) return;

    // Find or create tool call summary
    let summary = session.toolCalls.find(tc => tc.tool === toolCall.tool);
    if (!summary) {
      summary = {
        tool: toolCall.tool,
        count: 0,
        totalDuration: 0,
        files: [],
        parameters: []
      };
      session.toolCalls.push(summary);
    }

    summary.count++;
    summary.totalDuration += toolCall.duration || 0;

    if (toolCall.file) {
      summary.files.push(toolCall.file);
    }

    // Add to transcript
    await this.addTranscript(sessionId, {
      role: 'tool_use',
      tool: toolCall.tool,
      parameters: toolCall.parameters,
      result: toolCall.result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record output/deliverable
   */
  async recordOutput(sessionId, output) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    if (!this.config.captureOutputs) return;

    if (output.type === 'file') {
      session.outputs.files.push({
        path: output.path,
        size: output.size || 0,
        type: output.fileType || 'unknown',
        created: new Date().toISOString()
      });

      // Also add to deliverables
      session.links.deliverables.push(output.path);
    } else {
      session.outputs.data = {
        ...session.outputs.data,
        ...output.data
      };
    }

    await this._debouncedSave(sessionId);
  }

  /**
   * Record error
   */
  async recordError(sessionId, error) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.errors.push({
      message: error.message || error,
      stack: error.stack || null,
      timestamp: new Date().toISOString()
    });

    await this._debouncedSave(sessionId);
  }

  /**
   * Record warning
   */
  async recordWarning(sessionId, warning) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.warnings.push({
      type: warning.type || 'general',
      message: warning.message,
      timestamp: new Date().toISOString()
    });

    await this._debouncedSave(sessionId);
  }

  /**
   * Add resume point
   */
  async addResumePoint(sessionId, resumePoint) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.resumePoints.push({
      step: session.transcript.length,
      description: resumePoint.description,
      canForkFrom: resumePoint.canForkFrom !== false,
      state: resumePoint.state || {}
    });

    await this._debouncedSave(sessionId);
  }

  /**
   * End session
   */
  async endSession(sessionId, result = {}) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update session
    session.status = result.status || 'completed';
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    // Update metrics
    session.metrics.executionTime = session.duration;
    session.metrics.totalTokens = result.totalTokens || session.metrics.totalTokens;
    session.metrics.inputTokens = result.inputTokens || session.metrics.inputTokens;
    session.metrics.outputTokens = result.outputTokens || session.metrics.outputTokens;
    session.metrics.cost = result.cost || this._calculateCost(session.metrics);

    // Add final outputs
    if (result.outputs) {
      session.outputs = {
        ...session.outputs,
        ...result.outputs
      };
    }

    // Add deliverables
    if (result.deliverables) {
      session.links.deliverables.push(...result.deliverables);
    }

    // Save final session
    await this.storage.saveSession(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    return session;
  }

  /**
   * Get active session
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Link deliverable to session
   */
  async linkDeliverable(sessionId, deliverable) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      if (!session.links.deliverables.includes(deliverable.path)) {
        session.links.deliverables.push(deliverable.path);
      }
      await this._debouncedSave(sessionId);
    } else {
      // Load from storage and update
      await this.storage.linkDeliverable(sessionId, deliverable);
    }
  }

  /**
   * Helper: Calculate cost based on tokens
   */
  _calculateCost(metrics) {
    // Claude Sonnet 4.5 pricing (example)
    const inputCostPer1k = 0.003;
    const outputCostPer1k = 0.015;

    const inputCost = (metrics.inputTokens / 1000) * inputCostPer1k;
    const outputCost = (metrics.outputTokens / 1000) * outputCostPer1k;

    return parseFloat((inputCost + outputCost).toFixed(4));
  }

  /**
   * Helper: Debounced save (prevents excessive disk writes)
   */
  _debouncedSave(sessionId) {
    if (this._saveTimeouts && this._saveTimeouts[sessionId]) {
      clearTimeout(this._saveTimeouts[sessionId]);
    }

    if (!this._saveTimeouts) {
      this._saveTimeouts = {};
    }

    this._saveTimeouts[sessionId] = setTimeout(async () => {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        await this.storage.saveSession(session);
      }
      delete this._saveTimeouts[sessionId];
    }, 1000); // 1 second debounce
  }
}

module.exports = SessionCapture;
