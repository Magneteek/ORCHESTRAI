/**
 * ORCHESTRAI Session Manager
 * Main entry point for session management system
 */

const SessionCapture = require('./core/session-capture');
const SessionStorage = require('./core/session-storage');
const SessionRetrieval = require('./core/session-retrieval');
const SessionResumption = require('./core/session-resumption');
const SessionIdGenerator = require('./core/session-id-generator');
const TaskToolWrapper = require('./integration/task-tool-wrapper');
const config = require('./config/default');

class SessionManager {
  constructor(customConfig = {}) {
    this.config = { ...config, ...customConfig };

    // Initialize components
    this.capture = new SessionCapture(this.config.capture);
    this.storage = new SessionStorage(this.config.storage);
    this.retrieval = new SessionRetrieval(this.config.storage);
    this.resumption = new SessionResumption(this.config.storage);
    this.wrapper = new TaskToolWrapper(this.config.storage);
  }

  /**
   * Start a new session
   */
  async startSession(options) {
    return await this.capture.startSession(options);
  }

  /**
   * End a session
   */
  async endSession(sessionId, result) {
    return await this.capture.endSession(sessionId, result);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    return await this.retrieval.getSession(sessionId);
  }

  /**
   * Get session transcript
   */
  async getTranscript(sessionId) {
    return await this.retrieval.getTranscript(sessionId);
  }

  /**
   * Search sessions
   */
  async search(filters) {
    return await this.retrieval.search(filters);
  }

  /**
   * Find session by deliverable
   */
  async findByDeliverable(path) {
    return await this.retrieval.findByDeliverable(path);
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId, options) {
    return await this.resumption.resumeSession(sessionId, options);
  }

  /**
   * Fork session
   */
  async forkSession(sessionId, options) {
    return await this.resumption.forkSession(sessionId, options);
  }

  /**
   * Get storage stats
   */
  async getStats() {
    return await this.retrieval.getStats();
  }

  /**
   * Link deliverable to session
   */
  async linkDeliverable(sessionId, deliverable) {
    return await this.capture.linkDeliverable(sessionId, deliverable);
  }

  /**
   * Record tool call
   */
  async recordToolCall(sessionId, toolCall) {
    return await this.capture.recordToolCall(sessionId, toolCall);
  }

  /**
   * Record output
   */
  async recordOutput(sessionId, output) {
    return await this.capture.recordOutput(sessionId, output);
  }

  /**
   * Wrap Task tool invocation
   */
  async invokeWithCapture(taskParams, captureOptions) {
    return await this.wrapper.invokeWithCapture(taskParams, captureOptions);
  }

  /**
   * Complete session after Task execution
   */
  async completeSession(sessionId, result) {
    return await this.wrapper.completeSession(sessionId, result);
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return SessionIdGenerator.generate();
  }
}

// Export main class and components
module.exports = SessionManager;
module.exports.SessionManager = SessionManager;
module.exports.SessionCapture = SessionCapture;
module.exports.SessionStorage = SessionStorage;
module.exports.SessionRetrieval = SessionRetrieval;
module.exports.SessionResumption = SessionResumption;
module.exports.SessionIdGenerator = SessionIdGenerator;
module.exports.TaskToolWrapper = TaskToolWrapper;

// Export default instance
module.exports.default = new SessionManager();
