// Intelligent Model Router for ORCHESTRAI
// Routes tasks to optimal Claude model (Opus 4.5, Sonnet 4.5, or Haiku 4.5) based on complexity

const TokenCostCalculator = require('../analytics/token-cost-calculator');

class IntelligentModelRouter {
  constructor() {
    this.costCalculator = new TokenCostCalculator();

    // Opus-tier agents (high complexity strategic tasks)
    this.opusTierAgents = new Set([
      // Strategic & Planning
      'strategic-plan-synthesizer',
      'financial-modeling-specialist',
      'client-project-orchestrator',

      // System Orchestration
      'orchestrai-master-coordinator',
      'simultaneous-orchestrator',
      'vaibe-builder-orchestrator',

      // Advanced Analysis
      'ai-project-predictor',
      'intelligent-risk-assessor',
      'performance-forecasting-specialist',
      'advanced-performance-analyzer',

      // Specialized Intelligence
      'semantic-analysis-engine',
      'crystalline-memory-optimizer'
    ]);

    // Sonnet-tier agents (standard complexity - 90% of tasks)
    // All agents not in opusTierAgents or haikuTierAgents

    // Haiku-tier agents (simple, fast tasks - future use)
    this.haikuTierAgents = new Set([
      // To be populated with simple validation/extraction agents
    ]);

    // Model configurations
    this.modelConfig = {
      opus: {
        id: 'claude-opus-4.5',
        shortName: 'opus',
        effort: {
          high: { quality: 10, speed: 5, cost: 10 },
          medium: { quality: 8, speed: 7, cost: 7 },
          low: { quality: 6, speed: 9, cost: 5 }
        },
        bestFor: ['strategic-planning', 'financial-modeling', 'multi-domain-orchestration'],
        pricing: { input: 0.005, output: 0.025 }
      },
      sonnet: {
        id: 'claude-sonnet-4.5',
        shortName: 'sonnet',
        bestFor: ['development', 'content-creation', 'seo', 'testing', 'design'],
        pricing: { input: 0.003, output: 0.015 }
      },
      haiku: {
        id: 'claude-haiku-4.5',
        shortName: 'haiku',
        bestFor: ['extraction', 'validation', 'simple-formatting'],
        pricing: { input: 0.0001, output: 0.0005 }
      }
    };

    // Routing statistics
    this.stats = {
      opus: { count: 0, totalCost: 0, avgQuality: 0 },
      sonnet: { count: 0, totalCost: 0, avgQuality: 0 },
      haiku: { count: 0, totalCost: 0, avgQuality: 0 },
      totalRoutings: 0,
      lastReset: Date.now()
    };
  }

  /**
   * Determine optimal model for an agent and task
   * @param {string} agentType - Agent identifier (e.g., 'strategic-plan-synthesizer')
   * @param {Object} taskContext - Task metadata
   * @returns {Object} Model selection with reasoning
   */
  determineOptimalModel(agentType, taskContext = {}) {
    // Check for manual override
    if (taskContext.modelOverride) {
      return this.createModelSelection(
        taskContext.modelOverride,
        taskContext.effortOverride || 'high',
        'Manual override',
        { override: true }
      );
    }

    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(agentType, taskContext);

    // Route based on agent tier and complexity
    if (this.opusTierAgents.has(agentType)) {
      const effort = this.determineEffortLevel(taskContext);
      return this.createModelSelection(
        'opus',
        effort,
        `Opus-tier agent: ${agentType} (complexity: ${complexityScore}/10)`,
        { complexityScore, agentTier: 'opus' }
      );
    }

    if (this.haikuTierAgents.has(agentType)) {
      return this.createModelSelection(
        'haiku',
        null,
        `Haiku-tier agent: ${agentType} (simple task)`,
        { complexityScore, agentTier: 'haiku' }
      );
    }

    // Check if high complexity warrants Opus upgrade
    if (complexityScore >= 9 && taskContext.allowComplexityUpgrade !== false) {
      const effort = this.determineEffortLevel(taskContext);
      return this.createModelSelection(
        'opus',
        effort,
        `High complexity task (${complexityScore}/10) upgraded to Opus`,
        { complexityScore, upgraded: true }
      );
    }

    // Default to Sonnet for standard tasks
    return this.createModelSelection(
      'sonnet',
      null,
      `Standard complexity task (${complexityScore}/10) using Sonnet`,
      { complexityScore, agentTier: 'sonnet' }
    );
  }

  /**
   * Calculate task complexity score (0-10)
   */
  calculateComplexityScore(agentType, taskContext) {
    let score = 5; // Base score

    // Agent tier baseline
    if (this.opusTierAgents.has(agentType)) {
      score = 9; // Opus-tier agents start at 9
    } else if (this.haikuTierAgents.has(agentType)) {
      score = 2; // Haiku-tier agents start at 2
    }

    // Task-specific modifiers
    if (taskContext.domains && taskContext.domains.length > 2) {
      score += 2; // Multi-domain tasks
    }

    if (taskContext.type === 'strategic-planning' || taskContext.type === 'financial-modeling') {
      score += 3; // Strategic tasks
    }

    if (taskContext.workflowSteps && taskContext.workflowSteps > 5) {
      score += 2; // Multi-step workflows
    }

    if (taskContext.requiresAdvancedReasoning) {
      score += 2; // Advanced reasoning
    }

    if (taskContext.estimatedTokens && taskContext.estimatedTokens > 50000) {
      score += 1; // Large context tasks
    }

    if (taskContext.priority === 'critical') {
      score += 1; // Critical priority
    }

    // Ensure score is within bounds
    return Math.min(Math.max(score, 0), 10);
  }

  /**
   * Determine effort level for Opus tasks
   */
  determineEffortLevel(taskContext) {
    // Check for explicit override
    if (taskContext.effortOverride) {
      return taskContext.effortOverride;
    }

    // Time-sensitive tasks use medium effort
    if (taskContext.timeConstraints === 'urgent' || taskContext.deadline) {
      return 'medium';
    }

    // Critical tasks use high effort
    if (taskContext.priority === 'critical') {
      return 'high';
    }

    // Iterative/draft tasks can use medium effort
    if (taskContext.iterative || taskContext.draft) {
      return 'medium';
    }

    // Default to high effort for quality
    return 'high';
  }

  /**
   * Create model selection response
   */
  createModelSelection(model, effort, reasoning, metadata = {}) {
    const modelConfig = this.modelConfig[model];

    const selection = {
      model: modelConfig.id,
      modelShortName: model,
      effort: effort, // null for non-Opus models
      reasoning: reasoning,
      pricing: modelConfig.pricing,
      metadata: metadata,
      selectedAt: Date.now()
    };

    // Update statistics
    this.updateStats(model);

    return selection;
  }

  /**
   * Estimate cost for a task
   */
  estimateCost(modelSelection, estimatedTokens = {}) {
    const inputTokens = estimatedTokens.input || 10000;
    const outputTokens = estimatedTokens.output || 5000;

    return this.costCalculator.calculateCost(
      modelSelection.model,
      inputTokens,
      outputTokens
    );
  }

  /**
   * Compare Opus vs Sonnet for a task
   */
  compareModels(agentType, taskContext) {
    const opusSelection = this.createModelSelection(
      'opus',
      'high',
      'Opus comparison',
      { comparison: true }
    );

    const sonnetSelection = this.createModelSelection(
      'sonnet',
      null,
      'Sonnet comparison',
      { comparison: true }
    );

    const estimatedTokens = {
      input: taskContext.estimatedTokens?.input || 10000,
      output: taskContext.estimatedTokens?.output || 5000
    };

    const opusCost = this.estimateCost(opusSelection, estimatedTokens);
    const sonnetCost = this.estimateCost(sonnetSelection, estimatedTokens);

    return {
      opus: {
        model: opusSelection.model,
        effort: opusSelection.effort,
        estimatedCost: opusCost.totalCost,
        qualityEstimate: 9.5,
        speedEstimate: 'medium',
        recommendation: 'Best for complex strategic tasks'
      },
      sonnet: {
        model: sonnetSelection.model,
        estimatedCost: sonnetCost.totalCost,
        qualityEstimate: 8.5,
        speedEstimate: 'fast',
        recommendation: 'Best for standard development and content tasks'
      },
      costDifference: {
        absolute: opusCost.totalCost - sonnetCost.totalCost,
        percentage: ((opusCost.totalCost - sonnetCost.totalCost) / sonnetCost.totalCost * 100).toFixed(1) + '%'
      },
      recommendation: this.opusTierAgents.has(agentType) ? 'opus' : 'sonnet'
    };
  }

  /**
   * Update routing statistics
   */
  updateStats(model) {
    this.stats[model].count++;
    this.stats.totalRoutings++;
  }

  /**
   * Get routing statistics
   */
  getStats() {
    const totalRoutings = this.stats.totalRoutings || 1; // Avoid division by zero

    return {
      ...this.stats,
      distribution: {
        opus: ((this.stats.opus.count / totalRoutings) * 100).toFixed(1) + '%',
        sonnet: ((this.stats.sonnet.count / totalRoutings) * 100).toFixed(1) + '%',
        haiku: ((this.stats.haiku.count / totalRoutings) * 100).toFixed(1) + '%'
      },
      uptime: Date.now() - this.stats.lastReset
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      opus: { count: 0, totalCost: 0, avgQuality: 0 },
      sonnet: { count: 0, totalCost: 0, avgQuality: 0 },
      haiku: { count: 0, totalCost: 0, avgQuality: 0 },
      totalRoutings: 0,
      lastReset: Date.now()
    };
  }

  /**
   * Get agent tier
   */
  getAgentTier(agentType) {
    if (this.opusTierAgents.has(agentType)) return 'opus';
    if (this.haikuTierAgents.has(agentType)) return 'haiku';
    return 'sonnet';
  }

  /**
   * List agents by tier
   */
  listAgentsByTier() {
    return {
      opus: Array.from(this.opusTierAgents),
      haiku: Array.from(this.haikuTierAgents),
      sonnet: '(All other agents)',
      counts: {
        opus: this.opusTierAgents.size,
        haiku: this.haikuTierAgents.size,
        total: 'Dynamic based on agent registry'
      }
    };
  }

  /**
   * Validate model selection
   */
  validateModelSelection(selection) {
    const requiredFields = ['model', 'modelShortName', 'reasoning', 'pricing'];
    const missingFields = requiredFields.filter(field => !selection[field]);

    if (missingFields.length > 0) {
      throw new Error(`Invalid model selection: missing fields ${missingFields.join(', ')}`);
    }

    // Validate effort parameter for Opus
    if (selection.modelShortName === 'opus' && selection.effort) {
      const validEfforts = ['high', 'medium', 'low'];
      if (!validEfforts.includes(selection.effort)) {
        throw new Error(`Invalid effort level: ${selection.effort}. Must be one of: ${validEfforts.join(', ')}`);
      }
    }

    return true;
  }
}

module.exports = IntelligentModelRouter;
