const fs = require('fs');
const path = require('path');
const TokenCostCalculator = require('./token-cost-calculator');

class UsageTracker {
  constructor(redisClient = null) {
    this.redis = redisClient;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.costCalculator = new TokenCostCalculator();
    this.metrics = {
      // API Usage
      totalRequests: 0,
      apiCalls: {},
      
      // Token Usage (for AI models)
      tokenUsage: {
        total: 0,
        byModel: {},
        byDomain: {},
        inputTokens: 0,
        outputTokens: 0
      },
      
      // MCP Server Usage
      mcpUsage: {
        totalCalls: 0,
        byServer: {},
        successRate: {},
        avgResponseTime: {}
      },
      
      // Crystalline Memory Usage
      memoryUsage: {
        nodesCreated: 0,
        nodesAccessed: 0,
        connectionsEstablished: 0,
        searchQueries: 0,
        avgSearchTime: 0
      },
      
      // System Performance
      performance: {
        uptime: 0,
        avgResponseTime: 0,
        errorRate: 0,
        memoryFootprint: 0
      },
      
      // Feature Usage
      features: {
        dashboardViews: 0,
        notionSyncs: 0,
        pipelineSharing: 0,
        webSocketConnections: 0
      },
      
      // User Sessions
      sessions: {
        current: this.sessionId,
        totalSessions: 0,
        avgSessionDuration: 0
      },
      
      // Agent-specific tracking
      agents: {
        registered: {},
        tokenUsage: {},
        performance: {},
        costs: {}
      },
      
      // Comprehensive cost tracking
      costs: {
        session: {
          total: 0,
          byModel: {},
          byAgent: {},
          byDomain: {}
        },
        allTime: {
          total: 0,
          sessions: []
        },
        projections: {
          hourly: 0,
          daily: 0,
          monthly: 0
        }
      }
    };
    
    this.eventLog = [];
    this.setupPeriodicSave();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // API Usage Tracking
  trackApiCall(endpoint, method, statusCode, responseTime, userAgent = null) {
    this.metrics.totalRequests++;
    
    const key = `${method} ${endpoint}`;
    if (!this.metrics.apiCalls[key]) {
      this.metrics.apiCalls[key] = {
        count: 0,
        successCount: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        statusCodes: {}
      };
    }
    
    const callData = this.metrics.apiCalls[key];
    callData.count++;
    callData.totalResponseTime += responseTime;
    callData.avgResponseTime = callData.totalResponseTime / callData.count;
    
    if (statusCode >= 200 && statusCode < 300) {
      callData.successCount++;
    }
    
    if (!callData.statusCodes[statusCode]) {
      callData.statusCodes[statusCode] = 0;
    }
    callData.statusCodes[statusCode]++;
    
    this.logEvent('api_call', {
      endpoint,
      method,
      statusCode,
      responseTime,
      userAgent
    });
  }

  // Enhanced Token Usage Tracking with Cost Calculation
  trackTokenUsage(model, inputTokens, outputTokens, domain = null, agent = null, requestId = null) {
    const totalTokens = inputTokens + outputTokens;
    
    // Calculate actual costs using the cost calculator
    const costData = this.costCalculator.calculateCost(model, inputTokens, outputTokens);
    
    // Update general token usage metrics
    this.metrics.tokenUsage.total += totalTokens;
    this.metrics.tokenUsage.inputTokens += inputTokens;
    this.metrics.tokenUsage.outputTokens += outputTokens;
    
    // Track by model with cost data
    if (!this.metrics.tokenUsage.byModel[model]) {
      this.metrics.tokenUsage.byModel[model] = {
        total: 0,
        input: 0,
        output: 0,
        calls: 0,
        cost: 0
      };
    }
    
    const modelData = this.metrics.tokenUsage.byModel[model];
    modelData.total += totalTokens;
    modelData.input += inputTokens;
    modelData.output += outputTokens;
    modelData.calls++;
    modelData.cost += costData.totalCost;
    
    // Track by domain
    if (domain) {
      if (!this.metrics.tokenUsage.byDomain[domain]) {
        this.metrics.tokenUsage.byDomain[domain] = {
          total: 0,
          input: 0,
          output: 0,
          calls: 0,
          cost: 0
        };
      }
      
      const domainData = this.metrics.tokenUsage.byDomain[domain];
      domainData.total += totalTokens;
      domainData.input += inputTokens;
      domainData.output += outputTokens;
      domainData.calls++;
      domainData.cost += costData.totalCost;
      
      // Update cost tracking by domain
      this.metrics.costs.session.byDomain[domain] = 
        (this.metrics.costs.session.byDomain[domain] || 0) + costData.totalCost;
    }
    
    // Track by agent
    if (agent) {
      this.trackAgentTokenUsage(agent, model, inputTokens, outputTokens, costData);
    }
    
    // Update session costs
    this.metrics.costs.session.total += costData.totalCost;
    this.metrics.costs.session.byModel[model] = 
      (this.metrics.costs.session.byModel[model] || 0) + costData.totalCost;
    
    // Update projections
    this.updateCostProjections();
    
    this.logEvent('token_usage', {
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      domain,
      agent,
      cost: costData.totalCost,
      costBreakdown: costData,
      requestId
    });
  }
  
  // Agent-specific token usage tracking
  trackAgentTokenUsage(agent, model, inputTokens, outputTokens, costData) {
    if (!this.metrics.agents.tokenUsage[agent]) {
      this.metrics.agents.tokenUsage[agent] = {
        total: 0,
        byModel: {},
        totalCost: 0,
        calls: 0,
        avgTokensPerCall: 0,
        efficiency: 0
      };
    }
    
    const agentData = this.metrics.agents.tokenUsage[agent];
    const totalTokens = inputTokens + outputTokens;
    
    // Update agent totals
    agentData.total += totalTokens;
    agentData.totalCost += costData.totalCost;
    agentData.calls++;
    agentData.avgTokensPerCall = agentData.total / agentData.calls;
    
    // Update by model for this agent
    if (!agentData.byModel[model]) {
      agentData.byModel[model] = {
        total: 0,
        input: 0,
        output: 0,
        calls: 0,
        cost: 0
      };
    }
    
    const agentModelData = agentData.byModel[model];
    agentModelData.total += totalTokens;
    agentModelData.input += inputTokens;
    agentModelData.output += outputTokens;
    agentModelData.calls++;
    agentModelData.cost += costData.totalCost;
    
    // Update session cost tracking by agent
    this.metrics.costs.session.byAgent[agent] = 
      (this.metrics.costs.session.byAgent[agent] || 0) + costData.totalCost;
  }
  
  // Register an agent for tracking
  registerAgent(agentId, domain, capabilities = [], metadata = {}) {
    this.metrics.agents.registered[agentId] = {
      domain,
      capabilities,
      registeredAt: Date.now(),
      lastSeen: Date.now(),
      status: 'active',
      metadata
    };
    
    this.logEvent('agent_registered', {
      agentId,
      domain,
      capabilities,
      metadata
    });
  }
  
  // Update agent status
  updateAgentStatus(agentId, status, performance = {}) {
    if (this.metrics.agents.registered[agentId]) {
      this.metrics.agents.registered[agentId].status = status;
      this.metrics.agents.registered[agentId].lastSeen = Date.now();
      
      if (performance && Object.keys(performance).length > 0) {
        this.metrics.agents.performance[agentId] = {
          ...this.metrics.agents.performance[agentId],
          ...performance,
          updatedAt: Date.now()
        };
      }
    }
  }
  
  // Update cost projections based on current usage
  updateCostProjections() {
    const uptime = Date.now() - this.startTime;
    const estimates = this.costCalculator.estimateHourlyCost(this.metrics.tokenUsage, uptime);
    
    this.metrics.costs.projections = estimates;
  }

  // MCP Server Usage Tracking
  trackMcpCall(serverName, operation, success, responseTime, error = null) {
    this.metrics.mcpUsage.totalCalls++;
    
    if (!this.metrics.mcpUsage.byServer[serverName]) {
      this.metrics.mcpUsage.byServer[serverName] = {
        totalCalls: 0,
        successfulCalls: 0,
        totalResponseTime: 0,
        operations: {}
      };
    }
    
    const serverData = this.metrics.mcpUsage.byServer[serverName];
    serverData.totalCalls++;
    serverData.totalResponseTime += responseTime;
    
    if (success) {
      serverData.successfulCalls++;
    }
    
    if (!serverData.operations[operation]) {
      serverData.operations[operation] = { count: 0, successCount: 0 };
    }
    serverData.operations[operation].count++;
    if (success) serverData.operations[operation].successCount++;
    
    // Update success rate
    this.metrics.mcpUsage.successRate[serverName] = 
      (serverData.successfulCalls / serverData.totalCalls) * 100;
    
    // Update average response time
    this.metrics.mcpUsage.avgResponseTime[serverName] = 
      serverData.totalResponseTime / serverData.totalCalls;
    
    this.logEvent('mcp_call', {
      serverName,
      operation,
      success,
      responseTime,
      error
    });
  }

  // Crystalline Memory Usage Tracking
  trackMemoryOperation(operation, details = {}) {
    switch (operation) {
      case 'node_created':
        this.metrics.memoryUsage.nodesCreated++;
        break;
      case 'node_accessed':
        this.metrics.memoryUsage.nodesAccessed++;
        break;
      case 'connection_established':
        this.metrics.memoryUsage.connectionsEstablished++;
        break;
      case 'search_query':
        this.metrics.memoryUsage.searchQueries++;
        if (details.responseTime) {
          // Update average search time
          const total = this.metrics.memoryUsage.avgSearchTime * (this.metrics.memoryUsage.searchQueries - 1);
          this.metrics.memoryUsage.avgSearchTime = (total + details.responseTime) / this.metrics.memoryUsage.searchQueries;
        }
        break;
    }
    
    this.logEvent('memory_operation', { operation, ...details });
  }

  // Feature Usage Tracking
  trackFeatureUsage(feature, details = {}) {
    if (this.metrics.features.hasOwnProperty(feature)) {
      this.metrics.features[feature]++;
    }
    
    this.logEvent('feature_usage', { feature, ...details });
  }

  // Performance Tracking
  updatePerformanceMetrics(memoryUsage, cpuUsage) {
    this.metrics.performance.uptime = Date.now() - this.startTime;
    if (memoryUsage) this.metrics.performance.memoryFootprint = memoryUsage;
    if (cpuUsage) this.metrics.performance.cpuUsage = cpuUsage;
    
    // Calculate error rate
    const totalCalls = this.metrics.totalRequests + this.metrics.mcpUsage.totalCalls;
    const errors = this.eventLog.filter(e => e.type === 'api_call' && e.data.statusCode >= 400).length +
                   this.eventLog.filter(e => e.type === 'mcp_call' && !e.data.success).length;
    
    this.metrics.performance.errorRate = totalCalls > 0 ? (errors / totalCalls) * 100 : 0;
  }

  // Event Logging
  logEvent(type, data) {
    const event = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.eventLog.push(event);
    
    // Keep only last 1000 events in memory
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }
  }

  // Analytics and Insights with Enhanced Cost Tracking
  getUsageSummary(timeRange = '24h') {
    const now = Date.now();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const cutoffTime = now - timeRangeMs;
    
    const recentEvents = this.eventLog.filter(e => e.timestamp > cutoffTime);
    const uptime = now - this.startTime;
    
    // Generate cost report
    const costReport = this.costCalculator.generateCostReport({
      tokenUsage: this.metrics.tokenUsage,
      totalRequests: this.metrics.totalRequests,
      uptime: uptime
    }, timeRange);
    
    return {
      summary: {
        totalRequests: this.metrics.totalRequests,
        totalTokens: this.metrics.tokenUsage.total,
        mcpCalls: this.metrics.mcpUsage.totalCalls,
        memoryOperations: this.metrics.memoryUsage.nodesCreated + this.metrics.memoryUsage.nodesAccessed,
        uptime: this.formatDuration(uptime),
        errorRate: `${this.metrics.performance.errorRate.toFixed(2)}%`,
        activeAgents: Object.keys(this.metrics.agents.registered).filter(
          id => this.metrics.agents.registered[id].status === 'active'
        ).length,
        sessionCost: `$${this.metrics.costs.session.total.toFixed(6)}`,
        projectedDailyCost: `$${this.metrics.costs.projections.daily.toFixed(4)}`
      },
      
      costs: {
        session: {
          total: this.metrics.costs.session.total,
          byModel: this.metrics.costs.session.byModel,
          byAgent: this.metrics.costs.session.byAgent,
          byDomain: this.metrics.costs.session.byDomain
        },
        projections: this.metrics.costs.projections,
        efficiency: costReport.efficiency,
        recommendations: costReport.recommendations
      },
      
      agents: {
        registered: Object.entries(this.metrics.agents.registered).map(([id, data]) => ({
          id,
          domain: data.domain,
          status: data.status,
          uptime: this.formatDuration(now - data.registeredAt),
          tokenUsage: this.metrics.agents.tokenUsage[id] || { total: 0, totalCost: 0, calls: 0 },
          performance: this.metrics.agents.performance[id] || {}
        })),
        tokenUsage: this.metrics.agents.tokenUsage,
        topAgentsByCost: Object.entries(this.metrics.costs.session.byAgent || {})
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([agent, cost]) => ({ agent, cost: parseFloat(cost.toFixed(6)) }))
      },
      
      topEndpoints: Object.entries(this.metrics.apiCalls)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5)
        .map(([endpoint, data]) => ({
          endpoint,
          calls: data.count,
          avgResponseTime: `${data.avgResponseTime.toFixed(0)}ms`,
          successRate: `${((data.successCount / data.count) * 100).toFixed(1)}%`
        })),
      
      mcpServerUsage: Object.entries(this.metrics.mcpUsage.byServer)
        .map(([server, data]) => ({
          server,
          calls: data.totalCalls,
          successRate: `${this.metrics.mcpUsage.successRate[server]?.toFixed(1) || 0}%`,
          avgResponseTime: `${this.metrics.mcpUsage.avgResponseTime[server]?.toFixed(0) || 0}ms`
        })),
      
      tokenUsageByModel: Object.entries(this.metrics.tokenUsage.byModel)
        .sort(([,a], [,b]) => b.cost - a.cost)
        .map(([model, data]) => ({
          model,
          totalTokens: data.total.toLocaleString(),
          calls: data.calls,
          avgTokensPerCall: Math.round(data.total / data.calls),
          cost: `$${data.cost.toFixed(6)}`,
          costPerToken: data.total > 0 ? `$${(data.cost / data.total).toFixed(8)}` : '$0.00000000'
        })),
      
      tokenUsageByDomain: Object.entries(this.metrics.tokenUsage.byDomain || {})
        .sort(([,a], [,b]) => (b.cost || 0) - (a.cost || 0))
        .map(([domain, data]) => ({
          domain,
          totalTokens: data.total.toLocaleString(),
          calls: data.calls,
          cost: `$${(data.cost || 0).toFixed(6)}`
        })),
      
      recentActivity: recentEvents.slice(-10).reverse()
    };
  }
  
  // Get comprehensive agent statistics
  getAgentStatistics() {
    const stats = {
      total: Object.keys(this.metrics.agents.registered).length,
      active: 0,
      byDomain: {},
      byStatus: { active: 0, idle: 0, error: 0 },
      tokenUsage: this.metrics.agents.tokenUsage,
      costs: this.metrics.costs.session.byAgent
    };
    
    Object.entries(this.metrics.agents.registered).forEach(([id, data]) => {
      stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1;
      if (data.status === 'active') stats.active++;
      
      stats.byDomain[data.domain] = (stats.byDomain[data.domain] || 0) + 1;
    });
    
    return stats;
  }

  // Data Export
  async exportData(format = 'json') {
    const exportData = {
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      metrics: this.metrics,
      eventLog: this.eventLog,
      summary: this.getUsageSummary()
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'csv':
        return this.convertToCSV(exportData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Persistence
  async save() {
    const data = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      metrics: this.metrics,
      eventLog: this.eventLog.slice(-500) // Save last 500 events
    };
    
    if (this.redis) {
      // Save to Redis
      await this.redis.setEx(`usage:${this.sessionId}`, 86400, JSON.stringify(data));
      await this.redis.lPush('usage:sessions', this.sessionId);
      await this.redis.lTrim('usage:sessions', 0, 99); // Keep last 100 sessions
    } else {
      // Save to file
      const filePath = path.join(__dirname, '../../orchestrai-shared/logs', `usage-${this.sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  }

  async load(sessionId) {
    try {
      let data;
      if (this.redis) {
        const jsonData = await this.redis.get(`usage:${sessionId}`);
        data = JSON.parse(jsonData);
      } else {
        const filePath = path.join(__dirname, '../../orchestrai-shared/logs', `usage-${sessionId}.json`);
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      
      if (data) {
        this.sessionId = data.sessionId;
        this.startTime = data.startTime;
        this.metrics = data.metrics;
        this.eventLog = data.eventLog || [];
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  }

  // Utility Methods
  parseTimeRange(timeRange) {
    const units = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000
    };
    
    return units[timeRange] || units['24h'];
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  convertToCSV(data) {
    // Convert event log to CSV format
    const csvLines = ['Type,Timestamp,SessionId,Data'];
    
    data.eventLog.forEach(event => {
      const dataStr = JSON.stringify(event.data).replace(/"/g, '""');
      csvLines.push(`"${event.type}","${new Date(event.timestamp).toISOString()}","${event.sessionId}","${dataStr}"`);
    });
    
    return csvLines.join('\n');
  }

  setupPeriodicSave() {
    // Save data every 5 minutes
    setInterval(() => {
      this.save().catch(console.error);
    }, 300000);
    
    // Save on process exit
    process.on('SIGTERM', () => this.save());
    process.on('SIGINT', () => this.save());
  }
}

module.exports = UsageTracker;