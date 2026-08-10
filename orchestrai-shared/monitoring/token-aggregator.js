/**
 * Token Aggregator for Claude Code Monitoring
 * Aggregates and manages token usage data in real-time
 * Maintains session history and calculates statistics
 */

const PricingCalculator = require('./pricing-calculator');

class TokenAggregator {
  constructor(options = {}) {
    this.options = {
      maxWorkflowHistory: options.maxWorkflowHistory || 10,
      maxSessionHistory: options.maxSessionHistory || 50,
      statisticsWindow: options.statisticsWindow || 3600000, // 1 hour default
      ...options
    };

    this.pricingCalculator = new PricingCalculator();

    // Current session data
    this.currentSession = this.initializeSession();

    // Historical data
    this.workflowHistory = [];
    this.sessionHistory = [];

    // Real-time statistics
    this.statistics = this.initializeStatistics();
  }

  /**
   * Initialize a new session
   * @returns {Object} New session object
   */
  initializeSession() {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      endTime: null,
      status: 'active',
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      workflows: [],
      models: {},
      lastUpdate: Date.now(),
      // Enhanced tracking
      dailyUsage: this.initializeDailyUsage(),
      weeklyUsage: this.initializeWeeklyUsage(),
      burnRate: {
        tokensPerSecond: 0,
        tokensPerMinute: 0,
        costPerMinute: 0,
        costPerHour: 0
      },
      projections: {
        tokensExhaustedAt: null,
        timeRemaining: null,
        dailyLimitExhaustedAt: null
      }
    };
  }

  /**
   * Initialize daily usage tracking
   * @returns {Object} Daily usage object
   */
  initializeDailyUsage() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return {
      date: startOfDay.toISOString().split('T')[0],
      startTime: startOfDay.getTime(),
      resetTime: endOfDay.getTime(),
      tokens: 0,
      cost: 0,
      limit: 200000, // Default daily limit
      remaining: 200000
    };
  }

  /**
   * Initialize weekly usage tracking
   * @returns {Object} Weekly usage object
   */
  initializeWeeklyUsage() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      weekStart: startOfWeek.toISOString().split('T')[0],
      startTime: startOfWeek.getTime(),
      resetTime: endOfWeek.getTime(),
      tokens: 0,
      cost: 0,
      limit: 1400000, // Default weekly limit (200k * 7)
      remaining: 1400000
    };
  }

  /**
   * Initialize statistics structure
   * @returns {Object} Statistics object
   */
  initializeStatistics() {
    return {
      session: {
        duration: 0,
        avgTokensPerMinute: 0,
        avgCostPerMinute: 0,
        workflowCount: 0,
        avgTokensPerWorkflow: 0,
        avgCostPerWorkflow: 0
      },
      recent: {
        last5Minutes: { tokens: 0, cost: 0, workflows: 0 },
        last15Minutes: { tokens: 0, cost: 0, workflows: 0 },
        lastHour: { tokens: 0, cost: 0, workflows: 0 }
      },
      efficiency: {
        tokensPerDollar: 0,
        costPerToken: 0,
        outputInputRatio: 0
      },
      trends: {
        tokensIncreasing: false,
        costIncreasing: false,
        efficiencyImproving: false
      }
    };
  }

  /**
   * Process token usage event from hooks manager
   * @param {Object} data - Token usage data
   * @returns {Object} Processing result with updated statistics
   */
  processTokenUsage(data) {
    const { workflow, tokenData } = data;

    // Extract token counts
    const inputTokens = tokenData.inputTokens || 0;
    const outputTokens = tokenData.outputTokens || 0;
    const model = tokenData.model || 'claude-sonnet-4-6';

    // Update session totals
    this.currentSession.totalInputTokens += inputTokens;
    this.currentSession.totalOutputTokens += outputTokens;
    this.currentSession.totalTokens += inputTokens + outputTokens;
    this.currentSession.lastUpdate = Date.now();

    // Update model-specific tracking
    if (!this.currentSession.models[model]) {
      this.currentSession.models[model] = {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        calls: 0
      };
    }

    const modelStats = this.currentSession.models[model];
    modelStats.inputTokens += inputTokens;
    modelStats.outputTokens += outputTokens;
    modelStats.totalTokens += inputTokens + outputTokens;
    modelStats.calls++;

    // Calculate cost
    const costData = this.pricingCalculator.calculateCost(model, inputTokens, outputTokens);
    this.currentSession.totalCost = this.pricingCalculator.roundCost(
      this.currentSession.totalCost + costData.totalCost
    );
    modelStats.cost = this.pricingCalculator.roundCost(
      modelStats.cost + costData.totalCost
    );

    // Update workflow tracking
    if (workflow) {
      const workflowIndex = this.currentSession.workflows.findIndex(
        w => w.id === workflow.id
      );

      if (workflowIndex === -1) {
        // New workflow
        this.currentSession.workflows.push({
          id: workflow.id,
          intent: workflow.intent,
          startTime: workflow.startTime || Date.now(),
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost: costData.totalCost,
          model,
          status: workflow.status || 'active'
        });
      } else {
        // Update existing workflow
        const wf = this.currentSession.workflows[workflowIndex];
        wf.inputTokens += inputTokens;
        wf.outputTokens += outputTokens;
        wf.totalTokens += inputTokens + outputTokens;
        wf.cost = this.pricingCalculator.roundCost(wf.cost + costData.totalCost);
      }
    }

    // Update statistics
    this.updateStatistics();

    return {
      success: true,
      session: this.getSessionSummary(),
      currentCost: this.currentSession.totalCost,
      currentTokens: this.currentSession.totalTokens,
      costData
    };
  }

  /**
   * Process workflow initiated event
   * @param {Object} workflow - Workflow data
   * @returns {Object} Processing result
   */
  processWorkflowInitiated(workflow) {
    const workflowEntry = {
      id: workflow.id,
      intent: workflow.intent,
      startTime: workflow.startTime || Date.now(),
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      model: null,
      status: 'initiated'
    };

    this.currentSession.workflows.push(workflowEntry);

    return {
      success: true,
      workflowId: workflow.id,
      sessionWorkflows: this.currentSession.workflows.length
    };
  }

  /**
   * Process workflow completed event
   * @param {Object} data - Workflow completion data
   * @returns {Object} Processing result with workflow summary
   */
  processWorkflowCompleted(data) {
    const { workflow, summary } = data;

    // Find and update workflow
    const workflowIndex = this.currentSession.workflows.findIndex(
      w => w.id === workflow.id
    );

    if (workflowIndex !== -1) {
      const wf = this.currentSession.workflows[workflowIndex];
      wf.status = 'completed';
      wf.endTime = workflow.endTime || Date.now();
      wf.duration = workflow.duration || (wf.endTime - wf.startTime);
      wf.efficiency = summary?.efficiency || 0;

      // Add to workflow history
      this.addToWorkflowHistory({
        ...wf,
        summary
      });
    }

    // Update statistics
    this.updateStatistics();

    return {
      success: true,
      workflowId: workflow.id,
      workflowCost: workflowIndex !== -1 ? this.currentSession.workflows[workflowIndex].cost : 0,
      sessionSummary: this.getSessionSummary()
    };
  }

  /**
   * Add workflow to history (maintain limited size)
   * @param {Object} workflow - Completed workflow data
   */
  addToWorkflowHistory(workflow) {
    this.workflowHistory.unshift(workflow);

    // Trim to max size
    if (this.workflowHistory.length > this.options.maxWorkflowHistory) {
      this.workflowHistory = this.workflowHistory.slice(0, this.options.maxWorkflowHistory);
    }
  }

  /**
   * Update real-time statistics
   */
  updateStatistics() {
    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime;
    const sessionMinutes = sessionDuration / (1000 * 60);
    const sessionSeconds = sessionDuration / 1000;

    // Session statistics
    this.statistics.session = {
      duration: sessionDuration,
      avgTokensPerMinute: sessionMinutes > 0
        ? this.pricingCalculator.roundNumber(this.currentSession.totalTokens / sessionMinutes, 2)
        : 0,
      avgCostPerMinute: sessionMinutes > 0
        ? this.pricingCalculator.roundCost(this.currentSession.totalCost / sessionMinutes)
        : 0,
      workflowCount: this.currentSession.workflows.length,
      avgTokensPerWorkflow: this.currentSession.workflows.length > 0
        ? Math.round(this.currentSession.totalTokens / this.currentSession.workflows.length)
        : 0,
      avgCostPerWorkflow: this.currentSession.workflows.length > 0
        ? this.pricingCalculator.roundCost(this.currentSession.totalCost / this.currentSession.workflows.length)
        : 0
    };

    // Calculate burn rate
    this.currentSession.burnRate = {
      tokensPerSecond: sessionSeconds > 0
        ? this.pricingCalculator.roundNumber(this.currentSession.totalTokens / sessionSeconds, 2)
        : 0,
      tokensPerMinute: sessionMinutes > 0
        ? this.pricingCalculator.roundNumber(this.currentSession.totalTokens / sessionMinutes, 2)
        : 0,
      costPerMinute: sessionMinutes > 0
        ? this.pricingCalculator.roundCost(this.currentSession.totalCost / sessionMinutes)
        : 0,
      costPerHour: sessionMinutes > 0
        ? this.pricingCalculator.roundCost((this.currentSession.totalCost / sessionMinutes) * 60)
        : 0
    };

    // Update daily usage
    this.updateDailyUsage();

    // Update weekly usage
    this.updateWeeklyUsage();

    // Calculate projections
    this.calculateProjections();

    // Recent activity statistics
    this.statistics.recent = {
      last5Minutes: this.calculateRecentActivity(5),
      last15Minutes: this.calculateRecentActivity(15),
      lastHour: this.calculateRecentActivity(60)
    };

    // Efficiency metrics
    this.statistics.efficiency = this.pricingCalculator.calculateEfficiency({
      model: this.getPrimaryModel(),
      inputTokens: this.currentSession.totalInputTokens,
      outputTokens: this.currentSession.totalOutputTokens
    });

    // Trend analysis
    this.statistics.trends = this.analyzeTrends();
  }

  /**
   * Update daily usage tracking
   */
  updateDailyUsage() {
    const now = Date.now();

    // Check if we need to reset daily usage (new day)
    if (now >= this.currentSession.dailyUsage.resetTime) {
      this.currentSession.dailyUsage = this.initializeDailyUsage();
    }

    // Update daily totals
    this.currentSession.dailyUsage.tokens = this.currentSession.totalTokens;
    this.currentSession.dailyUsage.cost = this.currentSession.totalCost;
    this.currentSession.dailyUsage.remaining = Math.max(
      0,
      this.currentSession.dailyUsage.limit - this.currentSession.dailyUsage.tokens
    );
  }

  /**
   * Update weekly usage tracking
   */
  updateWeeklyUsage() {
    const now = Date.now();

    // Check if we need to reset weekly usage (new week)
    if (now >= this.currentSession.weeklyUsage.resetTime) {
      this.currentSession.weeklyUsage = this.initializeWeeklyUsage();
    }

    // Update weekly totals
    this.currentSession.weeklyUsage.tokens = this.currentSession.totalTokens;
    this.currentSession.weeklyUsage.cost = this.currentSession.totalCost;
    this.currentSession.weeklyUsage.remaining = Math.max(
      0,
      this.currentSession.weeklyUsage.limit - this.currentSession.weeklyUsage.tokens
    );
  }

  /**
   * Calculate projections based on current burn rate
   */
  calculateProjections() {
    const now = Date.now();
    const { tokensPerSecond } = this.currentSession.burnRate;

    if (tokensPerSecond <= 0) {
      this.currentSession.projections = {
        tokensExhaustedAt: null,
        timeRemaining: null,
        dailyLimitExhaustedAt: null
      };
      return;
    }

    // Calculate when daily limit will be exhausted
    const dailyRemaining = this.currentSession.dailyUsage.remaining;
    if (dailyRemaining > 0 && tokensPerSecond > 0) {
      const secondsUntilDailyExhausted = dailyRemaining / tokensPerSecond;
      this.currentSession.projections.dailyLimitExhaustedAt = now + (secondsUntilDailyExhausted * 1000);
      this.currentSession.projections.timeRemaining = secondsUntilDailyExhausted * 1000;
    } else {
      this.currentSession.projections.dailyLimitExhaustedAt = now; // Already exhausted
      this.currentSession.projections.timeRemaining = 0;
    }

    // Calculate when session tokens would be exhausted (if there's a budget)
    const sessionBudget = 200000; // Could be configurable
    const sessionRemaining = sessionBudget - this.currentSession.totalTokens;
    if (sessionRemaining > 0 && tokensPerSecond > 0) {
      const secondsUntilExhausted = sessionRemaining / tokensPerSecond;
      this.currentSession.projections.tokensExhaustedAt = now + (secondsUntilExhausted * 1000);
    } else {
      this.currentSession.projections.tokensExhaustedAt = null;
    }
  }

  /**
   * Calculate recent activity within time window
   * @param {number} minutes - Time window in minutes
   * @returns {Object} Activity statistics
   */
  calculateRecentActivity(minutes) {
    const now = Date.now();
    const windowStart = now - (minutes * 60 * 1000);

    const recentWorkflows = this.currentSession.workflows.filter(
      wf => wf.startTime >= windowStart
    );

    const tokens = recentWorkflows.reduce((sum, wf) => sum + wf.totalTokens, 0);
    const cost = recentWorkflows.reduce((sum, wf) => sum + wf.cost, 0);

    return {
      tokens,
      cost: this.pricingCalculator.roundCost(cost),
      workflows: recentWorkflows.length,
      avgTokensPerWorkflow: recentWorkflows.length > 0
        ? Math.round(tokens / recentWorkflows.length)
        : 0
    };
  }

  /**
   * Analyze trends in usage patterns
   * @returns {Object} Trend indicators
   */
  analyzeTrends() {
    if (this.workflowHistory.length < 3) {
      return {
        tokensIncreasing: false,
        costIncreasing: false,
        efficiencyImproving: false,
        confidence: 'low'
      };
    }

    // Compare recent workflows to older ones
    const recent = this.workflowHistory.slice(0, 3);
    const older = this.workflowHistory.slice(3, 6);

    const recentAvgTokens = recent.reduce((sum, wf) => sum + wf.totalTokens, 0) / recent.length;
    const olderAvgTokens = older.length > 0
      ? older.reduce((sum, wf) => sum + wf.totalTokens, 0) / older.length
      : recentAvgTokens;

    const recentAvgCost = recent.reduce((sum, wf) => sum + wf.cost, 0) / recent.length;
    const olderAvgCost = older.length > 0
      ? older.reduce((sum, wf) => sum + wf.cost, 0) / older.length
      : recentAvgCost;

    const recentAvgEfficiency = recent.reduce((sum, wf) => sum + (wf.efficiency || 0), 0) / recent.length;
    const olderAvgEfficiency = older.length > 0
      ? older.reduce((sum, wf) => sum + (wf.efficiency || 0), 0) / older.length
      : recentAvgEfficiency;

    return {
      tokensIncreasing: recentAvgTokens > olderAvgTokens * 1.1, // 10% threshold
      costIncreasing: recentAvgCost > olderAvgCost * 1.1,
      efficiencyImproving: recentAvgEfficiency > olderAvgEfficiency,
      confidence: older.length >= 3 ? 'high' : 'medium',
      changes: {
        tokensDelta: this.pricingCalculator.roundNumber(
          ((recentAvgTokens - olderAvgTokens) / olderAvgTokens) * 100,
          1
        ),
        costDelta: this.pricingCalculator.roundNumber(
          ((recentAvgCost - olderAvgCost) / olderAvgCost) * 100,
          1
        )
      }
    };
  }

  /**
   * Get primary model being used
   * @returns {string} Model identifier
   */
  getPrimaryModel() {
    const models = Object.entries(this.currentSession.models);
    if (models.length === 0) return 'claude-sonnet-4-6';

    // Find model with most calls
    const primary = models.reduce((max, [model, stats]) =>
      stats.calls > (max[1]?.calls || 0) ? [model, stats] : max,
      [null, null]
    );

    return primary[0] || 'claude-sonnet-4-6';
  }

  /**
   * Get current session summary
   * @returns {Object} Session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.currentSession.sessionId,
      status: this.currentSession.status,
      startTime: this.currentSession.startTime,
      duration: Date.now() - this.currentSession.startTime,
      totalInputTokens: this.currentSession.totalInputTokens,
      totalOutputTokens: this.currentSession.totalOutputTokens,
      totalTokens: this.currentSession.totalTokens,
      totalCost: this.currentSession.totalCost,
      workflowCount: this.currentSession.workflows.length,
      activeWorkflows: this.currentSession.workflows.filter(w => w.status === 'active').length,
      completedWorkflows: this.currentSession.workflows.filter(w => w.status === 'completed').length,
      models: this.currentSession.models,
      lastUpdate: this.currentSession.lastUpdate
    };
  }

  /**
   * Get workflow history
   * @param {number} limit - Maximum number of workflows to return
   * @returns {Array} Workflow history
   */
  getWorkflowHistory(limit = null) {
    if (limit) {
      return this.workflowHistory.slice(0, limit);
    }
    return [...this.workflowHistory];
  }

  /**
   * Get current statistics
   * @returns {Object} Current statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }

  /**
   * Get cost breakdown
   * @returns {Object} Detailed cost breakdown
   */
  getCostBreakdown() {
    const modelBreakdown = Object.entries(this.currentSession.models).map(([model, stats]) => {
      const pricing = this.pricingCalculator.getModelPricing(model);
      return {
        model,
        modelName: pricing.name,
        ...stats,
        percentage: this.currentSession.totalCost > 0
          ? this.pricingCalculator.roundNumber((stats.cost / this.currentSession.totalCost) * 100, 1)
          : 0
      };
    });

    return {
      totalCost: this.currentSession.totalCost,
      totalTokens: this.currentSession.totalTokens,
      byModel: modelBreakdown,
      byWorkflow: this.currentSession.workflows.map(wf => ({
        id: wf.id,
        intent: wf.intent,
        cost: wf.cost,
        tokens: wf.totalTokens,
        percentage: this.currentSession.totalCost > 0
          ? this.pricingCalculator.roundNumber((wf.cost / this.currentSession.totalCost) * 100, 1)
          : 0
      })),
      efficiency: this.statistics.efficiency
    };
  }

  /**
   * Reset current session
   * @returns {Object} Reset confirmation
   */
  resetSession() {
    // Save current session to history
    if (this.currentSession.workflows.length > 0) {
      this.sessionHistory.unshift({
        ...this.currentSession,
        endTime: Date.now()
      });

      // Trim session history
      if (this.sessionHistory.length > this.options.maxSessionHistory) {
        this.sessionHistory = this.sessionHistory.slice(0, this.options.maxSessionHistory);
      }
    }

    // Initialize new session
    const oldSessionId = this.currentSession.sessionId;
    this.currentSession = this.initializeSession();
    this.statistics = this.initializeStatistics();

    return {
      success: true,
      oldSessionId,
      newSessionId: this.currentSession.sessionId,
      message: 'Session reset successfully'
    };
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Get cost analytics with trends and projections
   * @returns {Object} Cost analytics data
   */
  getCostAnalytics() {
    const now = Date.now();
    const sessionDuration = now - this.currentSession.startTime;
    const sessionHours = sessionDuration / (1000 * 60 * 60);

    // Current session metrics
    const costPerHour = sessionHours > 0 ? this.currentSession.totalCost / sessionHours : 0;
    const tokensPerHour = sessionHours > 0 ? this.currentSession.totalTokens / sessionHours : 0;

    // Daily projections
    const hoursInDay = 24;
    const projectedDailyCost = costPerHour * hoursInDay;
    const projectedDailyTokens = tokensPerHour * hoursInDay;

    // Monthly projections
    const daysInMonth = 30;
    const projectedMonthlyCost = projectedDailyCost * daysInMonth;
    const projectedMonthlyTokens = projectedDailyTokens * daysInMonth;

    // Budget tracking
    const dailyBudget = 5.00; // $5/day default
    const monthlyBudget = 150.00; // $150/month default
    const dailyBudgetUsed = (this.currentSession.dailyUsage.cost / dailyBudget) * 100;
    const monthlyProjection = (projectedMonthlyCost / monthlyBudget) * 100;

    // Cost efficiency
    const costPerKToken = this.currentSession.totalTokens > 0
      ? (this.currentSession.totalCost / this.currentSession.totalTokens) * 1000
      : 0;

    // Trends (based on session history)
    const recentSessions = this.sessionHistory.slice(0, 10);
    const avgCostPerSession = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.totalCost, 0) / recentSessions.length
      : 0;

    const trend = avgCostPerSession > 0
      ? ((this.currentSession.totalCost - avgCostPerSession) / avgCostPerSession) * 100
      : 0;

    return {
      currentSession: {
        totalCost: this.pricingCalculator.roundCost(this.currentSession.totalCost),
        costPerHour: this.pricingCalculator.roundCost(costPerHour),
        costPerKToken: this.pricingCalculator.roundCost(costPerKToken),
        duration: sessionDuration
      },
      projections: {
        daily: {
          cost: this.pricingCalculator.roundCost(projectedDailyCost),
          tokens: Math.round(projectedDailyTokens),
          budgetUsed: this.pricingCalculator.roundNumber(dailyBudgetUsed, 1)
        },
        monthly: {
          cost: this.pricingCalculator.roundCost(projectedMonthlyCost),
          tokens: Math.round(projectedMonthlyTokens),
          budgetProjection: this.pricingCalculator.roundNumber(monthlyProjection, 1)
        }
      },
      budgets: {
        daily: {
          limit: dailyBudget,
          used: this.pricingCalculator.roundCost(this.currentSession.dailyUsage.cost),
          remaining: this.pricingCalculator.roundCost(dailyBudget - this.currentSession.dailyUsage.cost),
          percentage: this.pricingCalculator.roundNumber(dailyBudgetUsed, 1)
        },
        monthly: {
          limit: monthlyBudget,
          projectedUsage: this.pricingCalculator.roundCost(projectedMonthlyCost),
          projectedPercentage: this.pricingCalculator.roundNumber(monthlyProjection, 1)
        }
      },
      trends: {
        costTrend: this.pricingCalculator.roundNumber(trend, 1),
        direction: trend > 10 ? 'increasing' : trend < -10 ? 'decreasing' : 'stable',
        avgCostPerSession: this.pricingCalculator.roundCost(avgCostPerSession)
      },
      recommendations: this.generateCostRecommendations(dailyBudgetUsed, monthlyProjection, costPerKToken)
    };
  }

  /**
   * Generate cost optimization recommendations
   * @param {number} dailyBudgetUsed - Daily budget usage percentage
   * @param {number} monthlyProjection - Monthly budget projection percentage
   * @param {number} costPerKToken - Cost per 1000 tokens
   * @returns {Array} List of recommendations
   */
  generateCostRecommendations(dailyBudgetUsed, monthlyProjection, costPerKToken) {
    const recommendations = [];

    if (dailyBudgetUsed > 90) {
      recommendations.push({
        level: 'critical',
        message: 'Daily budget nearly exhausted. Consider reducing token-intensive operations.',
        action: 'Optimize prompts and reduce tool usage frequency'
      });
    } else if (dailyBudgetUsed > 70) {
      recommendations.push({
        level: 'warning',
        message: 'Daily budget usage is high. Monitor usage closely.',
        action: 'Review workflow efficiency'
      });
    }

    if (monthlyProjection > 100) {
      recommendations.push({
        level: 'critical',
        message: `Monthly costs projected to exceed budget by ${(monthlyProjection - 100).toFixed(0)}%`,
        action: 'Reduce usage or increase budget allocation'
      });
    }

    if (costPerKToken > 0.01) {
      recommendations.push({
        level: 'info',
        message: 'Consider using more efficient models for simple tasks',
        action: 'Use Claude Haiku for basic operations'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        level: 'success',
        message: 'Token usage is within optimal ranges',
        action: 'Continue current usage patterns'
      });
    }

    return recommendations;
  }

  /**
   * Get efficiency metrics and optimization suggestions
   * @returns {Object} Efficiency metrics
   */
  getEfficiencyMetrics() {
    const { totalInputTokens, totalOutputTokens, totalTokens, totalCost } = this.currentSession;

    // Input/Output ratio
    const ioRatio = totalInputTokens > 0
      ? this.pricingCalculator.roundNumber(totalOutputTokens / totalInputTokens, 2)
      : 0;

    // Token efficiency score (0-100)
    // Based on: low cost per token, balanced I/O ratio, minimal waste
    const idealIORatio = 0.4; // 40% output is considered efficient
    const ioEfficiency = Math.max(0, 100 - Math.abs(ioRatio - idealIORatio) * 100);

    const costEfficiency = totalTokens > 0
      ? Math.max(0, 100 - ((totalCost / totalTokens) * 10000))
      : 0;

    const overallEfficiency = this.pricingCalculator.roundNumber(
      (ioEfficiency * 0.6 + costEfficiency * 0.4), 1
    );

    // Workflow efficiency
    const completedWorkflows = this.currentSession.workflows.filter(w => w.status === 'completed').length;
    const totalWorkflows = this.currentSession.workflows.length;
    const successRate = totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0;

    const avgTokensPerWorkflow = totalWorkflows > 0
      ? Math.round(totalTokens / totalWorkflows)
      : 0;

    const avgCostPerWorkflow = totalWorkflows > 0
      ? this.pricingCalculator.roundCost(totalCost / totalWorkflows)
      : 0;

    // Model usage distribution
    const modelUsage = {};
    Object.entries(this.currentSession.models).forEach(([model, data]) => {
      modelUsage[model] = {
        tokens: data.totalTokens,
        cost: this.pricingCalculator.roundCost(data.cost),
        percentage: totalTokens > 0 ? this.pricingCalculator.roundNumber((data.totalTokens / totalTokens) * 100, 1) : 0,
        calls: data.calls
      };
    });

    return {
      overall: {
        efficiencyScore: overallEfficiency,
        rating: this.getEfficiencyRating(overallEfficiency),
        ioRatio: ioRatio,
        costPerToken: totalTokens > 0 ? this.pricingCalculator.roundCost(totalCost / totalTokens) : 0
      },
      inputOutput: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        ratio: ioRatio,
        ideal: idealIORatio,
        efficiency: this.pricingCalculator.roundNumber(ioEfficiency, 1),
        analysis: this.analyzeIORatio(ioRatio, idealIORatio)
      },
      workflows: {
        total: totalWorkflows,
        completed: completedWorkflows,
        successRate: this.pricingCalculator.roundNumber(successRate, 1),
        avgTokensPerWorkflow: avgTokensPerWorkflow,
        avgCostPerWorkflow: avgCostPerWorkflow
      },
      modelUsage: modelUsage,
      optimization: this.generateEfficiencyRecommendations(overallEfficiency, ioRatio, avgTokensPerWorkflow)
    };
  }

  /**
   * Get efficiency rating label
   * @param {number} score - Efficiency score (0-100)
   * @returns {string} Rating label
   */
  getEfficiencyRating(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Needs Improvement';
  }

  /**
   * Analyze input/output ratio
   * @param {number} actual - Actual I/O ratio
   * @param {number} ideal - Ideal I/O ratio
   * @returns {string} Analysis message
   */
  analyzeIORatio(actual, ideal) {
    const diff = Math.abs(actual - ideal);

    if (diff < 0.1) {
      return 'Optimal balance between input and output tokens';
    } else if (actual > ideal + 0.2) {
      return 'High output ratio - consider more concise responses';
    } else if (actual < ideal - 0.2) {
      return 'Low output ratio - responses may be too brief';
    }
    return 'I/O ratio within acceptable range';
  }

  /**
   * Generate efficiency optimization recommendations
   * @param {number} efficiency - Overall efficiency score
   * @param {number} ioRatio - Input/output ratio
   * @param {number} avgTokens - Average tokens per workflow
   * @returns {Array} List of recommendations
   */
  generateEfficiencyRecommendations(efficiency, ioRatio, avgTokens) {
    const recommendations = [];

    if (efficiency < 60) {
      recommendations.push({
        priority: 'high',
        category: 'Overall Efficiency',
        message: 'Token usage efficiency is below optimal levels',
        suggestion: 'Review prompt engineering and response requirements',
        impact: 'Could reduce costs by 20-30%'
      });
    }

    if (ioRatio > 0.6) {
      recommendations.push({
        priority: 'medium',
        category: 'Output Optimization',
        message: 'Output tokens are disproportionately high',
        suggestion: 'Request more concise responses or break tasks into smaller chunks',
        impact: 'Could reduce output tokens by 15-25%'
      });
    }

    if (ioRatio < 0.2) {
      recommendations.push({
        priority: 'low',
        category: 'Response Completeness',
        message: 'Responses may be too brief',
        suggestion: 'Consider requesting more detailed outputs when beneficial',
        impact: 'Improves task completion quality'
      });
    }

    if (avgTokens > 50000) {
      recommendations.push({
        priority: 'high',
        category: 'Workflow Size',
        message: 'Average workflow token usage is very high',
        suggestion: 'Break complex tasks into smaller, focused operations',
        impact: 'Improves efficiency and reduces per-task costs'
      });
    }

    if (efficiency >= 75) {
      recommendations.push({
        priority: 'success',
        category: 'Performance',
        message: 'Token usage is well-optimized',
        suggestion: 'Maintain current practices',
        impact: 'Continue efficient operations'
      });
    }

    return recommendations;
  }

  /**
   * Get complete monitoring snapshot
   * @returns {Object} Complete monitoring data
   */
  getSnapshot() {
    return {
      timestamp: Date.now(),
      session: this.getSessionSummary(),
      statistics: this.getStatistics(),
      costBreakdown: this.getCostBreakdown(),
      costAnalytics: this.getCostAnalytics(),
      efficiencyMetrics: this.getEfficiencyMetrics(),
      recentWorkflows: this.getWorkflowHistory(5),
      modelPricing: this.pricingCalculator.getAllPricing()
    };
  }
}

module.exports = TokenAggregator;
