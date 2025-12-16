/**
 * Base Specialized Agent
 *
 * Abstract base class for all specialized domain agents.
 * Provides common functionality for task execution, context management,
 * and integration with the simultaneous execution orchestrator.
 *
 * Specialized agents are the "expert contractors" that perform specific
 * high-value tasks within their domain (SEO, content, development, etc.)
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logging/logger');
const { AgentConfigSchema, TaskSpecSchema, validate } = require('../validation/schemas');
const { AgentError, ValidationError } = require('../errors/typed-errors');

class BaseSpecializedAgent extends EventEmitter {
  constructor(config = {}) {
    super();

    // Validate configuration (allow partial validation for flexibility)
    try {
      // Only validate if name and domain are provided (base config)
      if (config.name && config.domain) {
        config = AgentConfigSchema.parse(config);
      }
    } catch (error) {
      throw new ValidationError(
        'Invalid agent configuration',
        error.errors || [{ message: error.message }],
        { config }
      );
    }

    this.agentType = config.name || config.agentType || 'base-specialized-agent';
    this.agentId = config.agentId || `${this.agentType}-${uuidv4()}`;
    this.domain = config.domain || 'general';

    // Create agent-specific logger
    this.logger = logger.forAgent(this.agentType, this.domain);

    // Agent metadata
    this.metadata = {
      version: config.version || '1.0.0',
      capabilities: config.capabilities || [],
      requiredTools: config.requiredTools || [],
      estimatedDuration: config.estimatedDuration || config.timeout || 30000,
      qualityTarget: config.qualityTarget || 0.95,
      retries: config.retries || 3,
      priority: config.priority || 'normal'
    };

    // Performance tracking
    this.performance = {
      tasksCompleted: 0,
      successRate: 0,
      averageDuration: 0,
      qualityScores: [],
      averageQuality: 0,
      lastExecutionTime: null
    };

    // Current execution context
    this.currentContext = null;
    this.isExecuting = false;

    this.logger.info('Agent initialized', {
      agentId: this.agentId,
      domain: this.domain,
      capabilities: this.metadata.capabilities
    });
  }

  /**
   * Execute task with full context management
   * @param {Object} task - Task to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution results
   */
  async execute(task, context = {}) {
    if (this.isExecuting) {
      throw new AgentError(
        'Agent already executing a task',
        {
          agentName: this.agentType,
          domain: this.domain,
          currentTask: this.currentContext?.task?.type
        }
      );
    }

    const executionId = uuidv4();
    this.isExecuting = true;
    this.currentContext = {
      task,
      context,
      startTime: Date.now(),
      executionId
    };

    const timer = this.logger.time('Task execution', {
      taskType: task.type || 'unknown',
      executionId
    });

    try {
      this.logger.info('Task started', {
        taskType: task.type || 'unknown',
        taskId: task.taskId,
        executionId
      });

      // Validate task
      await this.validateTask(task);

      // Load historical context if available
      const historicalContext = await this.loadHistoricalContext(context);

      // Pre-execution hook
      await this.beforeExecution(task, context, historicalContext);

      // Main execution (implemented by subclass)
      const result = await this.executeTask(task, {
        ...context,
        historical: historicalContext
      });

      // Post-execution hook
      await this.afterExecution(result, task, context);

      // Calculate metrics
      const duration = Date.now() - this.currentContext.startTime;
      const qualityScore = await this.calculateQualityScore(result);

      // Update performance tracking
      this.updatePerformanceMetrics(duration, qualityScore, true);

      // Store learnings
      await this.storeLearnings(task, result, context);

      const finalResult = {
        success: true,
        agentType: this.agentType,
        agentId: this.agentId,
        executionId: this.currentContext.executionId,
        result,
        metrics: {
          duration,
          qualityScore,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ ${this.agentType} completed task in ${duration}ms (quality: ${(qualityScore * 100).toFixed(1)}%)`);

      this.emit('task-completed', finalResult);

      return finalResult;

    } catch (error) {
      console.error(`❌ ${this.agentType} task failed:`, error.message);

      const duration = Date.now() - this.currentContext.startTime;
      this.updatePerformanceMetrics(duration, 0, false);

      this.emit('task-failed', {
        agentType: this.agentType,
        error: error.message,
        task
      });

      return {
        success: false,
        agentType: this.agentType,
        agentId: this.agentId,
        error: error.message,
        metrics: {
          duration,
          timestamp: new Date().toISOString()
        }
      };

    } finally {
      this.isExecuting = false;
      this.currentContext = null;
    }
  }

  /**
   * Validate task before execution
   * @param {Object} task - Task to validate
   */
  async validateTask(task) {
    if (!task) {
      throw new Error('Task is required');
    }

    // Subclasses can override for specific validation
    return true;
  }

  /**
   * Main execution method (implemented by subclasses)
   * @param {Object} task - Task to execute
   * @param {Object} context - Execution context with historical data
   * @returns {Promise<Object>} Execution result
   */
  async executeTask(task, context) {
    throw new Error('executeTask() must be implemented by subclass');
  }

  /**
   * Load historical context for optimization
   * @param {Object} context - Current execution context
   * @returns {Promise<Object>} Historical context data
   */
  async loadHistoricalContext(context) {
    // Placeholder - will integrate with crystalline memory
    return {
      similarTasks: [],
      successPatterns: [],
      optimizationHints: []
    };
  }

  /**
   * Before execution hook
   * @param {Object} task - Task to execute
   * @param {Object} context - Execution context
   * @param {Object} historical - Historical context
   */
  async beforeExecution(task, context, historical) {
    // Subclasses can override for setup logic
  }

  /**
   * After execution hook
   * @param {Object} result - Execution result
   * @param {Object} task - Completed task
   * @param {Object} context - Execution context
   */
  async afterExecution(result, task, context) {
    // Subclasses can override for cleanup/validation
  }

  /**
   * Calculate quality score for result
   * @param {Object} result - Execution result
   * @returns {Promise<number>} Quality score (0-1)
   */
  async calculateQualityScore(result) {
    // Default implementation - subclasses should override
    return result && result.output ? 0.95 : 0;
  }

  /**
   * Update performance metrics
   * @param {number} duration - Execution duration
   * @param {number} qualityScore - Quality score (0-1)
   * @param {boolean} success - Success status
   */
  updatePerformanceMetrics(duration, qualityScore, success) {
    this.performance.tasksCompleted++;

    if (success) {
      // Update success rate
      const successCount = Math.round(this.performance.successRate * (this.performance.tasksCompleted - 1)) + 1;
      this.performance.successRate = successCount / this.performance.tasksCompleted;

      // Update average duration
      this.performance.averageDuration =
        (this.performance.averageDuration * (this.performance.tasksCompleted - 1) + duration) /
        this.performance.tasksCompleted;

      // Update quality scores
      this.performance.qualityScores.push(qualityScore);
      if (this.performance.qualityScores.length > 10) {
        this.performance.qualityScores.shift(); // Keep last 10
      }
      this.performance.averageQuality =
        this.performance.qualityScores.reduce((a, b) => a + b, 0) / this.performance.qualityScores.length;
    } else {
      // Update success rate for failure
      const successCount = Math.round(this.performance.successRate * (this.performance.tasksCompleted - 1));
      this.performance.successRate = successCount / this.performance.tasksCompleted;
    }

    this.performance.lastExecutionTime = Date.now();
  }

  /**
   * Store learnings from execution
   * @param {Object} task - Executed task
   * @param {Object} result - Execution result
   * @param {Object} context - Execution context
   */
  async storeLearnings(task, result, context) {
    // Placeholder - will integrate with crystalline memory
    // Subclasses can override for specific learning storage
  }

  /**
   * Get agent status and performance
   * @returns {Object} Agent status
   */
  getStatus() {
    return {
      agentType: this.agentType,
      agentId: this.agentId,
      domain: this.domain,
      isExecuting: this.isExecuting,
      performance: {
        ...this.performance,
        qualityScores: undefined // Don't expose raw array
      },
      capabilities: this.metadata.capabilities,
      currentTask: this.isExecuting ? this.currentContext.task.type : null
    };
  }

  /**
   * Get agent capabilities
   * @returns {Array<string>} List of capabilities
   */
  getCapabilities() {
    return this.metadata.capabilities;
  }

  /**
   * Check if agent can handle task
   * @param {Object} task - Task to check
   * @returns {boolean} Can handle task
   */
  canHandle(task) {
    if (!task || !task.type) return false;

    // Check if task type matches agent capabilities
    return this.metadata.capabilities.some(cap =>
      task.type.includes(cap) || cap.includes(task.type)
    );
  }

  /**
   * Estimate task duration
   * @param {Object} task - Task to estimate
   * @param {Object} context - Execution context
   * @returns {number} Estimated duration in ms
   */
  estimateDuration(task, context = {}) {
    // Use historical average if available
    if (this.performance.averageDuration > 0) {
      return this.performance.averageDuration;
    }

    // Use configured estimate
    return this.metadata.estimatedDuration;
  }

  /**
   * Get agent priority for task
   * @param {Object} task - Task to evaluate
   * @param {Object} context - Execution context
   * @returns {number} Priority score (0-1, higher is better match)
   */
  getPriority(task, context = {}) {
    let priority = 0.5; // Base priority

    // Increase priority if agent has handled similar tasks
    if (this.performance.tasksCompleted > 0) {
      priority += 0.2 * this.performance.successRate;
    }

    // Increase priority if quality is high
    if (this.performance.averageQuality > 0.9) {
      priority += 0.2;
    }

    // Increase priority if agent is specialized for this task
    if (this.canHandle(task)) {
      priority += 0.3;
    }

    return Math.min(1.0, priority);
  }
}

module.exports = BaseSpecializedAgent;
