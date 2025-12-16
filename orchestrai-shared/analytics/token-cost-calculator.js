// Token Cost Calculator for Various AI Models
// Provides real-time cost calculations for token usage

class TokenCostCalculator {
  constructor() {
    // Model pricing per 1K tokens (input/output) - Updated 2025 rates
    this.modelPricing = {
      // OpenAI Models
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
      'text-davinci-003': { input: 0.02, output: 0.02 },
      
      // Claude Models (Anthropic) - Updated December 2025
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'claude-3.5-sonnet': { input: 0.003, output: 0.015 },

      // Claude 4.5 Series (Latest - November/December 2025)
      'claude-opus-4.5': { input: 0.005, output: 0.025 },
      'claude-sonnet-4.5': { input: 0.003, output: 0.015 },
      'claude-haiku-4.5': { input: 0.0001, output: 0.0005 },

      // Legacy naming (will be normalized)
      'claude-sonnet-4': { input: 0.003, output: 0.015 },
      'claude-opus-4': { input: 0.005, output: 0.025 },
      
      // Groq Models (Fast inference)
      'llama3-8b-8192': { input: 0.0001, output: 0.0001 },
      'llama3-70b-8192': { input: 0.0006, output: 0.0006 },
      'mixtral-8x7b-32768': { input: 0.0002, output: 0.0002 },
      'gemma-7b-it': { input: 0.0001, output: 0.0001 },
      
      // DeepSeek Models
      'deepseek-chat': { input: 0.00014, output: 0.00028 },
      'deepseek-coder': { input: 0.00014, output: 0.00028 },
      
      // Google Models
      'gemini-pro': { input: 0.0005, output: 0.0015 },
      'gemini-1.5-pro': { input: 0.00125, output: 0.00375 },
      'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
      
      // Default for unknown models
      'default': { input: 0.001, output: 0.002 }
    };
    
    // Exchange rates for cost display
    this.exchangeRates = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.0
    };
  }

  calculateCost(model, inputTokens, outputTokens) {
    const modelKey = this.normalizeModelName(model);
    const pricing = this.modelPricing[modelKey] || this.modelPricing.default;
    
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    const totalCost = inputCost + outputCost;
    
    return {
      model: model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat(totalCost.toFixed(6)),
      costPerToken: parseFloat((totalCost / (inputTokens + outputTokens)).toFixed(8)),
      pricing: pricing,
      currency: 'USD'
    };
  }
  
  calculateSessionCost(tokenUsageData) {
    let totalCost = 0;
    const modelBreakdown = {};
    
    Object.entries(tokenUsageData.byModel || {}).forEach(([model, data]) => {
      const cost = this.calculateCost(model, data.input || 0, data.output || 0);
      totalCost += cost.totalCost;
      modelBreakdown[model] = cost;
    });
    
    return {
      sessionTotal: parseFloat(totalCost.toFixed(6)),
      modelBreakdown,
      currency: 'USD',
      calculatedAt: new Date().toISOString()
    };
  }
  
  calculateAgentCost(agentTokenData) {
    const costs = {};
    
    Object.entries(agentTokenData).forEach(([agent, tokenData]) => {
      if (tokenData.models) {
        let agentTotal = 0;
        const modelCosts = {};
        
        Object.entries(tokenData.models).forEach(([model, data]) => {
          const cost = this.calculateCost(model, data.input || 0, data.output || 0);
          agentTotal += cost.totalCost;
          modelCosts[model] = cost;
        });
        
        costs[agent] = {
          totalCost: parseFloat(agentTotal.toFixed(6)),
          modelCosts,
          totalTokens: tokenData.totalTokens || 0,
          avgCostPerToken: tokenData.totalTokens > 0 ? 
            parseFloat((agentTotal / tokenData.totalTokens).toFixed(8)) : 0
        };
      }
    });
    
    return costs;
  }
  
  estimateHourlyCost(currentUsage, durationMs) {
    const hoursElapsed = durationMs / (1000 * 60 * 60);
    if (hoursElapsed === 0) return { hourly: 0, daily: 0, monthly: 0 };
    
    const sessionCosts = this.calculateSessionCost(currentUsage);
    const costPerHour = sessionCosts.sessionTotal / hoursElapsed;
    
    return {
      hourly: parseFloat(costPerHour.toFixed(6)),
      daily: parseFloat((costPerHour * 24).toFixed(6)),
      monthly: parseFloat((costPerHour * 24 * 30).toFixed(2)),
      projectedWeekly: parseFloat((costPerHour * 24 * 7).toFixed(4))
    };
  }
  
  convertCurrency(usdAmount, targetCurrency = 'USD') {
    const rate = this.exchangeRates[targetCurrency] || 1.0;
    return {
      amount: parseFloat((usdAmount * rate).toFixed(6)),
      currency: targetCurrency,
      exchangeRate: rate,
      originalUSD: usdAmount
    };
  }
  
  normalizeModelName(model) {
    const normalized = model.toLowerCase();
    
    // Handle common model name variations
    const mappings = {
      'gpt-4-1106-preview': 'gpt-4-turbo',
      'gpt-4-0125-preview': 'gpt-4-turbo',
      'gpt-35-turbo': 'gpt-3.5-turbo',
      'claude-3-opus-20240229': 'claude-3-opus',
      'claude-3-sonnet-20240229': 'claude-3-sonnet',
      'claude-3-haiku-20240307': 'claude-3-haiku',
      'claude-3-5-sonnet-20240620': 'claude-3.5-sonnet',

      // Claude 4.5 Series model IDs
      'claude-opus-4-5-20251101': 'claude-opus-4.5',
      'claude-sonnet-4-5-20250929': 'claude-sonnet-4.5',
      'claude-haiku-4-5-20251024': 'claude-haiku-4.5',

      // Short-hand variations
      'opus': 'claude-opus-4.5',
      'sonnet': 'claude-sonnet-4.5',
      'haiku': 'claude-haiku-4.5',
      'opus-4.5': 'claude-opus-4.5',
      'sonnet-4.5': 'claude-sonnet-4.5',
      'haiku-4.5': 'claude-haiku-4.5'
    };
    
    return mappings[normalized] || normalized;
  }
  
  generateCostReport(usageData, timeRange = '24h') {
    const sessionCosts = this.calculateSessionCost(usageData.tokenUsage || {});
    const estimates = this.estimateHourlyCost(usageData.tokenUsage || {}, 
      usageData.uptime || 0);
    
    return {
      summary: {
        totalCost: sessionCosts.sessionTotal,
        totalTokens: usageData.tokenUsage?.total || 0,
        avgCostPerToken: usageData.tokenUsage?.total > 0 ? 
          sessionCosts.sessionTotal / usageData.tokenUsage.total : 0,
        timeRange,
        generatedAt: new Date().toISOString()
      },
      modelBreakdown: sessionCosts.modelBreakdown,
      projections: estimates,
      efficiency: this.calculateEfficiency(usageData),
      recommendations: this.generateCostRecommendations(sessionCosts.modelBreakdown)
    };
  }
  
  calculateEfficiency(usageData) {
    const tokenUsage = usageData.tokenUsage || {};
    const totalTokens = tokenUsage.total || 0;
    const totalRequests = usageData.totalRequests || 0;
    const uptime = usageData.uptime || 0;
    
    if (totalRequests === 0 || uptime === 0) {
      return { score: 0, metrics: {} };
    }
    
    const tokensPerRequest = totalTokens / totalRequests;
    const requestsPerHour = (totalRequests / (uptime / 1000 / 60 / 60));
    const tokensPerHour = totalTokens / (uptime / 1000 / 60 / 60);
    
    return {
      score: Math.min(100, Math.max(0, 100 - (tokensPerRequest / 100))), // Simple efficiency score
      metrics: {
        tokensPerRequest: parseFloat(tokensPerRequest.toFixed(2)),
        requestsPerHour: parseFloat(requestsPerHour.toFixed(2)),
        tokensPerHour: parseFloat(tokensPerHour.toFixed(0)),
        averageRequestSize: tokensPerRequest > 1000 ? 'Large' : 
                          tokensPerRequest > 500 ? 'Medium' : 'Small'
      }
    };
  }
  
  generateCostRecommendations(modelBreakdown) {
    const recommendations = [];
    
    Object.entries(modelBreakdown).forEach(([model, cost]) => {
      // Recommend cheaper alternatives for expensive models
      if (cost.totalCost > 0.10) {
        if (model.includes('gpt-4') && !model.includes('turbo')) {
          recommendations.push({
            type: 'cost_optimization',
            model,
            suggestion: 'Consider using GPT-4 Turbo for similar quality at 3x lower cost',
            potentialSaving: cost.totalCost * 0.67
          });
        }
        
        if (model.includes('claude-3-opus')) {
          recommendations.push({
            type: 'cost_optimization',
            model,
            suggestion: 'Claude Opus 4.5 is 3x cheaper than Claude 3 Opus with better performance',
            potentialSaving: cost.totalCost * 0.67
          });
        }

        // Recommend Opus 4.5 for complex strategic tasks
        if (model.includes('sonnet') && cost.totalTokens > 50000) {
          recommendations.push({
            type: 'quality_optimization',
            model,
            suggestion: 'For complex strategic tasks >50K tokens, consider Opus 4.5 for 15-25% quality improvement',
            benefit: 'Better reasoning and autonomous task completion'
          });
        }
      }
      
      // Recommend faster models for simple tasks
      if (cost.inputTokens < 100 && cost.outputTokens < 100) {
        recommendations.push({
          type: 'performance_optimization',
          model,
          suggestion: 'For simple tasks, consider Groq models for 10x faster inference',
          benefit: 'Faster response times'
        });
      }
    });
    
    return recommendations;
  }
}

module.exports = TokenCostCalculator;