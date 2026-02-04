/**
 * Extended Thinking-Enabled Claude API Client
 *
 * Enables extended thinking for Opus-tier agents requiring sophisticated reasoning.
 * Thinking blocks provide visibility into the agent's reasoning process before
 * generating the final response.
 *
 * Use for: Strategic planning, financial modeling, risk assessment, complex analysis
 */

const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../logging/logger').forDomain('thinking-client');

class ThinkingEnabledClient {
  constructor(config = {}) {
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      maxRetries: config.maxRetries || 2
    });

    // Track thinking usage for monitoring
    this.metrics = {
      thinkingRequests: 0,
      totalThinkingTokens: 0,
      averageThinkingTokens: 0,
      thinkingEnabled: 0,
      thinkingDisabled: 0
    };
  }

  /**
   * Create message with optional extended thinking
   *
   * @param {Object} config - Message configuration
   * @param {string} config.model - Model to use (e.g., 'claude-opus-4-5')
   * @param {Array} config.messages - Conversation messages
   * @param {number} config.maxTokens - Maximum completion tokens
   * @param {boolean} config.enableThinking - Enable extended thinking
   * @param {number} config.thinkingBudget - Token budget for thinking (5000-20000)
   * @param {Array} config.tools - Tool definitions (optional)
   * @param {Object} config.system - System prompt configuration
   * @returns {Object} Response with separated thinking and answer
   */
  async createMessage(config) {
    const {
      model = 'claude-opus-4-5',
      messages,
      maxTokens = 16000,
      enableThinking = false,
      thinkingBudget = 10000,
      tools = [],
      system = null
    } = config;

    // Validate thinking budget
    if (enableThinking && (thinkingBudget < 1000 || thinkingBudget > 20000)) {
      logger.warn(`Thinking budget ${thinkingBudget} outside recommended range (1000-20000)`);
    }

    // Build API request
    const apiRequest = {
      model,
      max_tokens: maxTokens,
      messages
    };

    // Add system prompt if provided
    if (system) {
      apiRequest.system = system;
    }

    // Add tools if provided
    if (tools && tools.length > 0) {
      apiRequest.tools = tools;
    }

    // Add extended thinking if enabled
    if (enableThinking) {
      apiRequest.thinking = {
        type: 'enabled',
        budget_tokens: thinkingBudget
      };

      this.metrics.thinkingEnabled++;
      this.metrics.thinkingRequests++;

      logger.debug(`Extended thinking enabled with budget: ${thinkingBudget} tokens`);
    } else {
      this.metrics.thinkingDisabled++;
    }

    try {
      // Make API call
      const response = await this.client.messages.create(apiRequest);

      // Process response
      const result = this._processResponse(response, enableThinking);

      // Update metrics
      if (enableThinking && result.thinkingTokens) {
        this.metrics.totalThinkingTokens += result.thinkingTokens;
        this.metrics.averageThinkingTokens =
          this.metrics.totalThinkingTokens / this.metrics.thinkingRequests;
      }

      return result;

    } catch (error) {
      logger.error('API call failed:', error);
      throw error;
    }
  }

  /**
   * Process API response and separate thinking from answer
   *
   * @private
   */
  _processResponse(response, thinkingEnabled) {
    if (!thinkingEnabled || !response.content) {
      return {
        thinking: null,
        thinkingTokens: 0,
        answer: this._extractText(response.content),
        raw: response,
        usage: response.usage
      };
    }

    // Find thinking and text blocks
    const thinkingBlock = response.content.find(block => block.type === 'thinking');
    const textBlock = response.content.find(block => block.type === 'text');

    const thinking = thinkingBlock?.thinking || null;
    const answer = textBlock?.text || this._extractText(response.content);

    // Calculate thinking tokens (approximation if not provided)
    const thinkingTokens = thinking
      ? Math.ceil(thinking.length / 4) // Rough estimate: 4 chars per token
      : 0;

    return {
      thinking,
      thinkingTokens,
      answer,
      raw: response,
      usage: response.usage
    };
  }

  /**
   * Extract text from content blocks
   *
   * @private
   */
  _extractText(content) {
    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n');
  }

  /**
   * Log thinking block for debugging
   *
   * @param {string} agentName - Name of the agent
   * @param {string} thinking - Thinking content
   * @param {Object} options - Logging options
   */
  logThinking(agentName, thinking, options = {}) {
    if (!thinking) return;

    const {
      truncate = true,
      maxLength = 500
    } = options;

    const displayThinking = truncate && thinking.length > maxLength
      ? thinking.substring(0, maxLength) + '...'
      : thinking;

    logger.info(`[${agentName}] Extended Thinking:`, {
      length: thinking.length,
      preview: displayThinking
    });
  }

  /**
   * Get thinking usage metrics
   *
   * @returns {Object} Thinking usage statistics
   */
  getMetrics() {
    return {
      ...this.metrics,
      efficiency: this.metrics.thinkingRequests > 0
        ? (this.metrics.thinkingEnabled / this.metrics.thinkingRequests * 100).toFixed(1) + '%'
        : '0%'
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      thinkingRequests: 0,
      totalThinkingTokens: 0,
      averageThinkingTokens: 0,
      thinkingEnabled: 0,
      thinkingDisabled: 0
    };
  }
}

module.exports = ThinkingEnabledClient;
