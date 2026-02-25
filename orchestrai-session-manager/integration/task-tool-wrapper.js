/**
 * Task Tool Wrapper
 * Wraps Claude Code Task tool to capture sessions automatically
 */

const SessionCapture = require('../core/session-capture');
const SessionRetrieval = require('../core/session-retrieval');
const path = require('path');

class TaskToolWrapper {
  constructor(config = {}) {
    this.sessionCapture = new SessionCapture({
      basePath: config.basePath || path.join(__dirname, '../../sessions'),
      ...config
    });

    this.sessionRetrieval = new SessionRetrieval({
      basePath: config.basePath || path.join(__dirname, '../../sessions')
    });
  }

  /**
   * Wrap Task tool invocation with session capture
   *
   * Usage in orchestrai-master-coordinator:
   *
   * const wrapper = new TaskToolWrapper();
   * const result = await wrapper.invokeWithCapture({
   *   subagent_type: 'content-writer-specialist',
   *   description: 'Article creation',
   *   prompt: 'Write article about...',
   *   model: 'sonnet'
   * }, {
   *   projectContext: { clientId: 'client-123', projectId: 'proj-456' }
   * });
   */
  async invokeWithCapture(taskParams, captureOptions = {}) {
    // Start session
    const session = await this.sessionCapture.startSession({
      agentType: taskParams.subagent_type,
      prompt: taskParams.prompt,
      parameters: {
        description: taskParams.description,
        model: taskParams.model,
        run_in_background: taskParams.run_in_background
      },
      projectContext: captureOptions.projectContext || {},
      invokedBy: captureOptions.invokedBy || 'orchestrai-master-coordinator',
      tags: captureOptions.tags || []
    });

    console.log(`\n🔍 Session started: ${session.sessionId}`);
    console.log(`   Agent: ${taskParams.subagent_type}`);
    console.log(`   View: orchestrai session view ${session.sessionId}\n`);

    try {
      // NOTE: Actual Task tool invocation would happen here
      // Since we're in Claude Code context, this would be:
      // const result = await Task(taskParams);
      //
      // For now, we return session ID for the caller to use
      return {
        sessionId: session.sessionId,
        taskParams,
        status: 'session_started',
        message: 'Session capture initialized. Execute Task tool and call completeSession() with results.'
      };
    } catch (error) {
      // Record error
      await this.sessionCapture.recordError(session.sessionId, error);

      // End session with failure
      await this.sessionCapture.endSession(session.sessionId, {
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Complete session after Task tool execution
   *
   * Call this after Task tool returns with results
   */
  async completeSession(sessionId, result) {
    try {
      // Record outputs
      if (result.outputs) {
        for (const output of result.outputs) {
          await this.sessionCapture.recordOutput(sessionId, output);
        }
      }

      // Record deliverables
      if (result.deliverables) {
        for (const deliverable of result.deliverables) {
          await this.sessionCapture.linkDeliverable(sessionId, { path: deliverable });
        }
      }

      // End session
      const finalSession = await this.sessionCapture.endSession(sessionId, {
        status: result.error ? 'failed' : 'completed',
        outputs: result.outputs,
        deliverables: result.deliverables,
        totalTokens: result.totalTokens,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens
      });

      console.log(`\n✅ Session completed: ${sessionId}`);
      console.log(`   Duration: ${(finalSession.duration / 1000).toFixed(1)}s`);
      console.log(`   Cost: $${finalSession.metrics.cost}`);
      console.log(`   Deliverables: ${finalSession.links.deliverables.length}`);
      console.log(`   View: orchestrai session view ${sessionId}\n`);

      return finalSession;
    } catch (error) {
      console.error(`Failed to complete session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced Task invocation with full session lifecycle
   *
   * This is a complete wrapper that handles the entire lifecycle
   */
  async invokeTask(TaskToolFunction, taskParams, captureOptions = {}) {
    // Start session
    const session = await this.sessionCapture.startSession({
      agentType: taskParams.subagent_type,
      prompt: taskParams.prompt,
      parameters: taskParams,
      projectContext: captureOptions.projectContext || {},
      invokedBy: captureOptions.invokedBy || 'user',
      tags: captureOptions.tags || []
    });

    console.log(`\n🔍 Session: ${session.sessionId}`);

    try {
      // Execute actual Task tool
      const result = await TaskToolFunction(taskParams);

      // Complete session
      await this.completeSession(session.sessionId, result);

      // Return result with session ID
      return {
        ...result,
        sessionId: session.sessionId
      };
    } catch (error) {
      await this.sessionCapture.recordError(session.sessionId, error);
      await this.sessionCapture.endSession(session.sessionId, {
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    return await this.sessionRetrieval.getSession(sessionId);
  }

  /**
   * Find session that created a deliverable
   */
  async findSessionByDeliverable(deliverablePath) {
    return await this.sessionRetrieval.findByDeliverable(deliverablePath);
  }

  /**
   * Get recent sessions
   */
  async getRecentSessions(limit = 10) {
    return await this.sessionRetrieval.getRecent(limit);
  }
}

module.exports = TaskToolWrapper;
