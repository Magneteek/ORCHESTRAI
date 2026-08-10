/**
 * Pricing Calculator for Claude Code Token Monitoring
 * Calculates costs based on Anthropic Claude API pricing
 * Supports multiple models with dynamic pricing updates
 */

class PricingCalculator {
  constructor() {
    // Pricing in dollars per million tokens (as of June 2026)
    this.modelPricing = {
      'claude-fable-5': {
        name: 'Claude Fable 5',
        inputPricePerMTok: 10.00,
        outputPricePerMTok: 50.00,
        contextWindow: 1000000
      },
      'claude-opus-4-8': {
        name: 'Claude Opus 4.8',
        inputPricePerMTok: 5.00,
        outputPricePerMTok: 25.00,
        contextWindow: 1000000
      },
      'claude-opus-4-7': {
        name: 'Claude Opus 4.7',
        inputPricePerMTok: 5.00,
        outputPricePerMTok: 25.00,
        contextWindow: 1000000
      },
      'claude-sonnet-4-6': {
        name: 'Claude Sonnet 4.6',
        inputPricePerMTok: 3.00,
        outputPricePerMTok: 15.00,
        contextWindow: 1000000
      },
      'claude-haiku-4-5': {
        name: 'Claude Haiku 4.5',
        inputPricePerMTok: 1.00,
        outputPricePerMTok: 5.00,
        contextWindow: 200000
      },
      // Legacy models kept for historical cost reporting only
      'claude-sonnet-4-5-20250929': {
        name: 'Claude Sonnet 4.5 (legacy)',
        inputPricePerMTok: 3.00,
        outputPricePerMTok: 15.00,
        contextWindow: 200000
      },
      'claude-3-5-sonnet-20241022': {
        name: 'Claude 3.5 Sonnet (legacy)',
        inputPricePerMTok: 3.00,
        outputPricePerMTok: 15.00,
        contextWindow: 200000
      },
      'claude-3-haiku-20240307': {
        name: 'Claude 3 Haiku (legacy)',
        inputPricePerMTok: 0.25,
        outputPricePerMTok: 1.25,
        contextWindow: 200000
      }
    };

    // Default model for unknown model strings
    this.defaultModel = 'claude-sonnet-4-6';
  }

  /**
   * Calculate cost for token usage
   * @param {string} model - Model identifier
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @returns {Object} Cost breakdown
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = this.getModelPricing(model);

    // Convert tokens to millions
    const inputMTok = inputTokens / 1_000_000;
    const outputMTok = outputTokens / 1_000_000;

    // Calculate costs
    const inputCost = inputMTok * pricing.inputPricePerMTok;
    const outputCost = outputMTok * pricing.outputPricePerMTok;
    const totalCost = inputCost + outputCost;

    return {
      model: pricing.name,
      modelId: model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: this.roundCost(inputCost),
      outputCost: this.roundCost(outputCost),
      totalCost: this.roundCost(totalCost),
      pricing: {
        inputPricePerMTok: pricing.inputPricePerMTok,
        outputPricePerMTok: pricing.outputPricePerMTok
      },
      timestamp: Date.now()
    };
  }

  /**
   * Calculate aggregate costs for multiple token usage entries
   * @param {Array} usageEntries - Array of usage objects with model, inputTokens, outputTokens
   * @returns {Object} Aggregated cost breakdown
   */
  calculateAggregateCost(usageEntries) {
    const aggregated = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalInputCost: 0,
      totalOutputCost: 0,
      totalCost: 0,
      byModel: {},
      entries: usageEntries.length
    };

    usageEntries.forEach(entry => {
      const cost = this.calculateCost(
        entry.model || this.defaultModel,
        entry.inputTokens || 0,
        entry.outputTokens || 0
      );

      // Update totals
      aggregated.totalInputTokens += cost.inputTokens;
      aggregated.totalOutputTokens += cost.outputTokens;
      aggregated.totalTokens += cost.totalTokens;
      aggregated.totalInputCost += cost.inputCost;
      aggregated.totalOutputCost += cost.outputCost;
      aggregated.totalCost += cost.totalCost;

      // Update per-model breakdown
      const modelKey = cost.modelId;
      if (!aggregated.byModel[modelKey]) {
        aggregated.byModel[modelKey] = {
          name: cost.model,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          inputCost: 0,
          outputCost: 0,
          totalCost: 0,
          count: 0
        };
      }

      aggregated.byModel[modelKey].inputTokens += cost.inputTokens;
      aggregated.byModel[modelKey].outputTokens += cost.outputTokens;
      aggregated.byModel[modelKey].totalTokens += cost.totalTokens;
      aggregated.byModel[modelKey].inputCost += cost.inputCost;
      aggregated.byModel[modelKey].outputCost += cost.outputCost;
      aggregated.byModel[modelKey].totalCost += cost.totalCost;
      aggregated.byModel[modelKey].count++;
    });

    // Round final totals
    aggregated.totalInputCost = this.roundCost(aggregated.totalInputCost);
    aggregated.totalOutputCost = this.roundCost(aggregated.totalOutputCost);
    aggregated.totalCost = this.roundCost(aggregated.totalCost);

    // Round per-model totals
    Object.keys(aggregated.byModel).forEach(modelKey => {
      const model = aggregated.byModel[modelKey];
      model.inputCost = this.roundCost(model.inputCost);
      model.outputCost = this.roundCost(model.outputCost);
      model.totalCost = this.roundCost(model.totalCost);
    });

    return aggregated;
  }

  /**
   * Estimate cost for projected token usage
   * @param {string} model - Model identifier
   * @param {number} estimatedInputTokens - Estimated input tokens
   * @param {number} estimatedOutputTokens - Estimated output tokens
   * @returns {Object} Cost estimate with ranges
   */
  estimateCost(model, estimatedInputTokens, estimatedOutputTokens) {
    const baseCost = this.calculateCost(model, estimatedInputTokens, estimatedOutputTokens);

    // Add estimate ranges (±20%)
    const variance = 0.2;
    const minCost = this.roundCost(baseCost.totalCost * (1 - variance));
    const maxCost = this.roundCost(baseCost.totalCost * (1 + variance));

    return {
      ...baseCost,
      estimate: true,
      minCost,
      maxCost,
      confidenceLevel: 'medium'
    };
  }

  /**
   * Calculate cost per workflow or session
   * @param {number} totalCost - Total cost
   * @param {number} count - Number of workflows/sessions
   * @returns {number} Average cost
   */
  calculateAverageCost(totalCost, count) {
    if (count === 0) return 0;
    return this.roundCost(totalCost / count);
  }

  /**
   * Calculate cost efficiency metrics
   * @param {Object} usage - Usage statistics
   * @returns {Object} Efficiency metrics
   */
  calculateEfficiency(usage) {
    const totalTokens = usage.inputTokens + usage.outputTokens;
    const cost = this.calculateCost(
      usage.model || this.defaultModel,
      usage.inputTokens,
      usage.outputTokens
    );

    const tokensPerDollar = cost.totalCost > 0 ? totalTokens / cost.totalCost : 0;
    const costPerToken = totalTokens > 0 ? cost.totalCost / totalTokens : 0;

    // Output/Input ratio (higher = more generation vs processing)
    const outputInputRatio = usage.inputTokens > 0
      ? usage.outputTokens / usage.inputTokens
      : 0;

    return {
      tokensPerDollar: this.roundNumber(tokensPerDollar, 2),
      costPerToken: this.roundNumber(costPerToken, 8),
      costPer1000Tokens: this.roundCost(costPerToken * 1000),
      outputInputRatio: this.roundNumber(outputInputRatio, 2),
      inputPercentage: this.roundNumber((usage.inputTokens / totalTokens) * 100, 1),
      outputPercentage: this.roundNumber((usage.outputTokens / totalTokens) * 100, 1)
    };
  }

  /**
   * Get model pricing information
   * @param {string} model - Model identifier
   * @returns {Object} Pricing information
   */
  getModelPricing(model) {
    // Try exact match
    if (this.modelPricing[model]) {
      return this.modelPricing[model];
    }

    // Try partial match (for model names with versions)
    const modelKey = Object.keys(this.modelPricing).find(key =>
      model.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(model.toLowerCase())
    );

    if (modelKey) {
      return this.modelPricing[modelKey];
    }

    // Return default pricing
    console.warn(`Unknown model: ${model}, using default pricing`);
    return this.modelPricing[this.defaultModel];
  }

  /**
   * Update pricing for a specific model
   * @param {string} modelId - Model identifier
   * @param {Object} pricing - New pricing information
   * @returns {boolean} Success status
   */
  updatePricing(modelId, pricing) {
    try {
      this.modelPricing[modelId] = {
        ...this.modelPricing[modelId],
        ...pricing
      };
      return true;
    } catch (error) {
      console.error('Error updating pricing:', error);
      return false;
    }
  }

  /**
   * Get all available models with pricing
   * @returns {Object} All model pricing
   */
  getAllPricing() {
    return { ...this.modelPricing };
  }

  /**
   * Calculate session cost projections
   * @param {Object} currentUsage - Current session usage
   * @param {number} estimatedRemainingMinutes - Estimated remaining time
   * @returns {Object} Cost projections
   */
  projectSessionCost(currentUsage, estimatedRemainingMinutes) {
    const currentMinutes = (Date.now() - currentUsage.sessionStart) / (1000 * 60);

    if (currentMinutes === 0) {
      return {
        currentCost: 0,
        projectedFinalCost: 0,
        projectedAdditionalCost: 0,
        projectionConfidence: 'low'
      };
    }

    // Calculate rate per minute
    const tokensPerMinute = {
      input: currentUsage.totalInputTokens / currentMinutes,
      output: currentUsage.totalOutputTokens / currentMinutes
    };

    // Project remaining usage
    const projectedAdditionalTokens = {
      input: Math.round(tokensPerMinute.input * estimatedRemainingMinutes),
      output: Math.round(tokensPerMinute.output * estimatedRemainingMinutes)
    };

    const currentCost = this.calculateCost(
      currentUsage.model || this.defaultModel,
      currentUsage.totalInputTokens,
      currentUsage.totalOutputTokens
    );

    const additionalCost = this.calculateCost(
      currentUsage.model || this.defaultModel,
      projectedAdditionalTokens.input,
      projectedAdditionalTokens.output
    );

    return {
      currentCost: currentCost.totalCost,
      projectedAdditionalCost: additionalCost.totalCost,
      projectedFinalCost: this.roundCost(currentCost.totalCost + additionalCost.totalCost),
      projectedTokens: {
        input: currentUsage.totalInputTokens + projectedAdditionalTokens.input,
        output: currentUsage.totalOutputTokens + projectedAdditionalTokens.output
      },
      projectionConfidence: currentMinutes > 5 ? 'high' : 'medium',
      baselineMinutes: this.roundNumber(currentMinutes, 1),
      projectedMinutes: estimatedRemainingMinutes
    };
  }

  /**
   * Round cost to 4 decimal places (tenth of a cent)
   * @param {number} cost - Cost value
   * @returns {number} Rounded cost
   */
  roundCost(cost) {
    return Math.round(cost * 10000) / 10000;
  }

  /**
   * Round number to specified decimal places
   * @param {number} value - Number to round
   * @param {number} decimals - Decimal places
   * @returns {number} Rounded number
   */
  roundNumber(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Format cost for display
   * @param {number} cost - Cost value
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted cost
   */
  formatCost(cost, currency = '$') {
    if (cost === 0) return `${currency}0.00`;
    if (cost < 0.01) return `${currency}${cost.toFixed(4)}`;
    return `${currency}${cost.toFixed(2)}`;
  }

  /**
   * Format tokens with K/M suffixes
   * @param {number} tokens - Token count
   * @returns {string} Formatted token count
   */
  formatTokens(tokens) {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1_000_000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
}

module.exports = PricingCalculator;
