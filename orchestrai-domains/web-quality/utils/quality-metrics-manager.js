const EventEmitter = require('events');

class QualityMetricsManager extends EventEmitter {
  constructor(crystallineMemory) {
    super();
    this.crystallineMemory = crystallineMemory;
    this.metrics = {
      phaseValidation: new Map(),
      agentPerformance: new Map(),
      qualityTrends: new Map(),
      systemHealth: new Map()
    };
    
    this.thresholds = {
      qualityScore: {
        excellent: 90,
        good: 75,
        acceptable: 60,
        poor: 0
      },
      performanceScore: {
        excellent: 95,
        good: 85,
        acceptable: 70,
        poor: 0
      },
      reliability: {
        excellent: 99,
        good: 95,
        acceptable: 90,
        poor: 0
      }
    };
    
    this.reportingConfig = {
      aggregationInterval: 300000, // 5 minutes
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      alertThresholds: {
        qualityDrop: 15, // Alert if quality drops by 15%
        performanceDrop: 20, // Alert if performance drops by 20%
        errorRate: 5 // Alert if error rate exceeds 5%
      }
    };
    
    this.initializeMetricsCollection();
  }

  initializeMetricsCollection() {
    // Start periodic metrics aggregation
    setInterval(() => {
      this.aggregateMetrics();
    }, this.reportingConfig.aggregationInterval);
    
    // Start periodic cleanup
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  async recordPhaseValidationMetrics(projectId, phase, validationResults) {
    try {
      const timestamp = Date.now();
      const metricsKey = `${projectId}_${phase}`;
      
      const phaseMetrics = {
        timestamp,
        projectId,
        phase,
        qualityScore: validationResults.overallScore || 0,
        validationTime: validationResults.validationTime || 0,
        testsRun: validationResults.testsRun || 0,
        testsPassed: validationResults.testsPassed || 0,
        testsFailed: validationResults.testsFailed || 0,
        criticalIssues: validationResults.criticalIssues || 0,
        warningIssues: validationResults.warningIssues || 0,
        performanceMetrics: validationResults.performanceMetrics || {},
        accessibilityScore: validationResults.accessibilityScore || 0,
        responsiveScore: validationResults.responsiveScore || 0,
        browserCompatibilityScore: validationResults.browserCompatibilityScore || 0
      };
      
      // Store in local metrics
      if (!this.metrics.phaseValidation.has(metricsKey)) {
        this.metrics.phaseValidation.set(metricsKey, []);
      }
      this.metrics.phaseValidation.get(metricsKey).push(phaseMetrics);
      
      // Store in crystalline memory for cross-domain intelligence
      await this.crystallineMemory.store('web-quality-phase-metrics', {
        type: 'phase-validation-metrics',
        projectId,
        phase,
        metrics: phaseMetrics,
        timestamp
      });
      
      // Check for alerts
      await this.checkQualityAlerts(phaseMetrics);
      
      console.log(`📊 Phase validation metrics recorded: ${phase} (Score: ${phaseMetrics.qualityScore})`);
      
      return phaseMetrics;
    } catch (error) {
      console.error('Failed to record phase validation metrics:', error);
      throw error;
    }
  }

  async recordAgentPerformanceMetrics(agentId, taskData, performance) {
    try {
      const timestamp = Date.now();
      
      const agentMetrics = {
        timestamp,
        agentId,
        taskType: taskData.taskType,
        executionTime: performance.executionTime || 0,
        successRate: performance.successRate || 0,
        accuracy: performance.accuracy || 0,
        efficiency: performance.efficiency || 0,
        errorCount: performance.errorCount || 0,
        retryCount: performance.retryCount || 0,
        memoryUsage: performance.memoryUsage || 0,
        cpuUsage: performance.cpuUsage || 0,
        qualityContribution: performance.qualityContribution || 0
      };
      
      // Store in local metrics
      if (!this.metrics.agentPerformance.has(agentId)) {
        this.metrics.agentPerformance.set(agentId, []);
      }
      this.metrics.agentPerformance.get(agentId).push(agentMetrics);
      
      // Store in crystalline memory
      await this.crystallineMemory.store('web-quality-agent-performance', {
        type: 'agent-performance-metrics',
        agentId,
        metrics: agentMetrics,
        timestamp
      });
      
      return agentMetrics;
    } catch (error) {
      console.error('Failed to record agent performance metrics:', error);
      throw error;
    }
  }

  async recordQualityTrendMetrics(domain, category, trendData) {
    try {
      const timestamp = Date.now();
      const trendKey = `${domain}_${category}`;
      
      const trendMetrics = {
        timestamp,
        domain,
        category,
        currentValue: trendData.currentValue,
        previousValue: trendData.previousValue,
        changePercent: this.calculateChangePercent(trendData.currentValue, trendData.previousValue),
        trend: this.determineTrend(trendData.currentValue, trendData.previousValue),
        period: trendData.period || '1h',
        dataPoints: trendData.dataPoints || 1
      };
      
      // Store in local metrics
      if (!this.metrics.qualityTrends.has(trendKey)) {
        this.metrics.qualityTrends.set(trendKey, []);
      }
      this.metrics.qualityTrends.get(trendKey).push(trendMetrics);
      
      // Store in crystalline memory
      await this.crystallineMemory.store('web-quality-trends', {
        type: 'quality-trend-metrics',
        domain,
        category,
        metrics: trendMetrics,
        timestamp
      });
      
      return trendMetrics;
    } catch (error) {
      console.error('Failed to record quality trend metrics:', error);
      throw error;
    }
  }

  async generateQualityReport(projectId, reportType = 'comprehensive') {
    try {
      console.log(`📈 Generating ${reportType} quality report for project: ${projectId}`);
      
      const report = {
        projectId,
        reportType,
        timestamp: Date.now(),
        reportPeriod: this.getReportPeriod(reportType),
        sections: {}
      };
      
      // Phase Validation Summary
      if (reportType === 'comprehensive' || reportType === 'phase-validation') {
        report.sections.phaseValidation = await this.generatePhaseValidationSummary(projectId);
      }
      
      // Agent Performance Summary
      if (reportType === 'comprehensive' || reportType === 'agent-performance') {
        report.sections.agentPerformance = await this.generateAgentPerformanceSummary(projectId);
      }
      
      // Quality Trends Analysis
      if (reportType === 'comprehensive' || reportType === 'trends') {
        report.sections.qualityTrends = await this.generateQualityTrendsAnalysis(projectId);
      }
      
      // System Health Overview
      if (reportType === 'comprehensive' || reportType === 'system-health') {
        report.sections.systemHealth = await this.generateSystemHealthOverview();
      }
      
      // ROI and Business Impact
      if (reportType === 'comprehensive' || reportType === 'business-impact') {
        report.sections.businessImpact = await this.generateBusinessImpactAnalysis(projectId);
      }
      
      // Recommendations and Action Items
      report.sections.recommendations = await this.generateQualityRecommendations(projectId, report);
      
      // Store report in crystalline memory
      await this.crystallineMemory.store('web-quality-reports', {
        type: 'quality-report',
        projectId,
        reportType,
        report,
        timestamp: report.timestamp
      });
      
      console.log(`✅ Quality report generated: ${reportType} for project ${projectId}`);
      
      return report;
    } catch (error) {
      console.error('Failed to generate quality report:', error);
      throw error;
    }
  }

  async generatePhaseValidationSummary(projectId) {
    const phaseMetrics = [];
    
    // Collect all phase validation metrics for project
    for (const [key, metrics] of this.metrics.phaseValidation.entries()) {
      if (key.startsWith(projectId)) {
        phaseMetrics.push(...metrics);
      }
    }
    
    if (phaseMetrics.length === 0) {
      return { message: 'No phase validation metrics available' };
    }
    
    const summary = {
      totalValidations: phaseMetrics.length,
      averageQualityScore: this.calculateAverage(phaseMetrics, 'qualityScore'),
      averageValidationTime: this.calculateAverage(phaseMetrics, 'validationTime'),
      totalTestsRun: phaseMetrics.reduce((sum, m) => sum + m.testsRun, 0),
      totalTestsPassed: phaseMetrics.reduce((sum, m) => sum + m.testsPassed, 0),
      totalCriticalIssues: phaseMetrics.reduce((sum, m) => sum + m.criticalIssues, 0),
      phaseBreakdown: this.generatePhaseBreakdown(phaseMetrics),
      qualityTrend: this.calculateQualityTrend(phaseMetrics)
    };
    
    return summary;
  }

  async generateAgentPerformanceSummary(projectId) {
    const agentMetrics = [];
    
    // Collect relevant agent performance metrics
    for (const [agentId, metrics] of this.metrics.agentPerformance.entries()) {
      const relevantMetrics = metrics.filter(m => 
        // Filter by time period or other project-relevant criteria
        m.timestamp > Date.now() - this.reportingConfig.retentionPeriod
      );
      agentMetrics.push(...relevantMetrics);
    }
    
    if (agentMetrics.length === 0) {
      return { message: 'No agent performance metrics available' };
    }
    
    const summary = {
      totalTasks: agentMetrics.length,
      averageExecutionTime: this.calculateAverage(agentMetrics, 'executionTime'),
      averageSuccessRate: this.calculateAverage(agentMetrics, 'successRate'),
      averageAccuracy: this.calculateAverage(agentMetrics, 'accuracy'),
      topPerformingAgents: this.getTopPerformingAgents(agentMetrics),
      performanceTrends: this.calculatePerformanceTrends(agentMetrics),
      resourceUtilization: this.calculateResourceUtilization(agentMetrics)
    };
    
    return summary;
  }

  async generateQualityTrendsAnalysis(projectId) {
    const trendMetrics = [];
    
    for (const [key, metrics] of this.metrics.qualityTrends.entries()) {
      trendMetrics.push(...metrics);
    }
    
    const analysis = {
      overallTrend: this.calculateOverallTrend(trendMetrics),
      categoryTrends: this.analyzeCategoryTrends(trendMetrics),
      improvementAreas: this.identifyImprovementAreas(trendMetrics),
      regressionAlerts: this.identifyRegressions(trendMetrics),
      forecastProjections: this.generateForecastProjections(trendMetrics)
    };
    
    return analysis;
  }

  async generateSystemHealthOverview() {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuLoad: process.cpuUsage(),
      activeConnections: this.getActiveConnections(),
      errorRates: this.calculateSystemErrorRates(),
      performanceIndicators: this.getSystemPerformanceIndicators(),
      healthScore: this.calculateSystemHealthScore()
    };
  }

  async generateBusinessImpactAnalysis(projectId) {
    return {
      qualityImprovements: this.calculateQualityImprovements(projectId),
      timeToMarket: this.calculateTimeToMarketImpact(projectId),
      costSavings: this.calculateCostSavings(projectId),
      riskMitigation: this.calculateRiskMitigation(projectId),
      customerSatisfaction: this.predictCustomerSatisfactionImpact(projectId),
      roi: this.calculateROI(projectId)
    };
  }

  async generateQualityRecommendations(projectId, report) {
    const recommendations = [];
    
    // Analyze report sections for improvement opportunities
    if (report.sections.phaseValidation?.averageQualityScore < this.thresholds.qualityScore.good) {
      recommendations.push({
        priority: 'high',
        category: 'quality-improvement',
        title: 'Enhance Phase Validation Processes',
        description: 'Quality scores below acceptable threshold. Implement stricter validation criteria.',
        impact: 'high',
        effort: 'medium',
        timeline: '2-3 weeks'
      });
    }
    
    if (report.sections.agentPerformance?.averageExecutionTime > 30000) {
      recommendations.push({
        priority: 'medium',
        category: 'performance-optimization',
        title: 'Optimize Agent Execution Times',
        description: 'Agent response times exceed optimal thresholds. Review and optimize slow processes.',
        impact: 'medium',
        effort: 'low',
        timeline: '1-2 weeks'
      });
    }
    
    return recommendations;
  }

  // Utility Methods
  calculateAverage(metrics, field) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((total, metric) => total + (metric[field] || 0), 0);
    return sum / metrics.length;
  }

  calculateChangePercent(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  determineTrend(current, previous) {
    const change = this.calculateChangePercent(current, previous);
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  async checkQualityAlerts(metrics) {
    // Check for quality degradation alerts
    if (metrics.qualityScore < this.thresholds.qualityScore.acceptable) {
      this.emit('qualityAlert', {
        type: 'low-quality-score',
        severity: 'high',
        metrics,
        timestamp: Date.now()
      });
    }
    
    // Check for performance alerts
    if (metrics.validationTime > 60000) { // 1 minute threshold
      this.emit('performanceAlert', {
        type: 'slow-validation',
        severity: 'medium',
        metrics,
        timestamp: Date.now()
      });
    }
  }

  aggregateMetrics() {
    try {
      console.log('🔄 Aggregating quality metrics...');
      
      // Aggregate phase validation metrics
      this.aggregatePhaseMetrics();
      
      // Aggregate agent performance metrics
      this.aggregateAgentMetrics();
      
      // Aggregate system health metrics
      this.aggregateSystemMetrics();
      
      console.log('✅ Quality metrics aggregation complete');
    } catch (error) {
      console.error('Failed to aggregate metrics:', error);
    }
  }

  aggregatePhaseMetrics() {
    // Implementation for phase metrics aggregation
    // This would calculate hourly, daily, weekly summaries
  }

  aggregateAgentMetrics() {
    // Implementation for agent metrics aggregation
    // This would calculate performance trends and benchmarks
  }

  aggregateSystemMetrics() {
    // Implementation for system health metrics aggregation
    // This would track overall system performance
  }

  cleanupOldMetrics() {
    const cutoffTime = Date.now() - this.reportingConfig.retentionPeriod;
    
    // Clean up old phase validation metrics
    for (const [key, metrics] of this.metrics.phaseValidation.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.phaseValidation.set(key, filteredMetrics);
    }
    
    // Clean up old agent performance metrics
    for (const [key, metrics] of this.metrics.agentPerformance.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.agentPerformance.set(key, filteredMetrics);
    }
    
    console.log('🧹 Old quality metrics cleaned up');
  }

  getReportPeriod(reportType) {
    switch (reportType) {
      case 'daily': return { hours: 24 };
      case 'weekly': return { days: 7 };
      case 'monthly': return { days: 30 };
      default: return { days: 7 };
    }
  }

  // Placeholder methods for complex calculations
  generatePhaseBreakdown(metrics) { return {}; }
  calculateQualityTrend(metrics) { return 'stable'; }
  getTopPerformingAgents(metrics) { return []; }
  calculatePerformanceTrends(metrics) { return {}; }
  calculateResourceUtilization(metrics) { return {}; }
  calculateOverallTrend(metrics) { return 'stable'; }
  analyzeCategoryTrends(metrics) { return {}; }
  identifyImprovementAreas(metrics) { return []; }
  identifyRegressions(metrics) { return []; }
  generateForecastProjections(metrics) { return {}; }
  getActiveConnections() { return 0; }
  calculateSystemErrorRates() { return {}; }
  getSystemPerformanceIndicators() { return {}; }
  calculateSystemHealthScore() { return 95; }
  calculateQualityImprovements() { return {}; }
  calculateTimeToMarketImpact() { return {}; }
  calculateCostSavings() { return {}; }
  calculateRiskMitigation() { return {}; }
  predictCustomerSatisfactionImpact() { return {}; }
  calculateROI() { return {}; }

  getCapabilities() {
    return {
      metricsCollection: [
        'phase-validation-metrics',
        'agent-performance-metrics', 
        'quality-trend-metrics',
        'system-health-metrics'
      ],
      reportTypes: [
        'comprehensive',
        'phase-validation',
        'agent-performance',
        'trends',
        'system-health',
        'business-impact'
      ],
      alertTypes: [
        'quality-degradation',
        'performance-issues',
        'system-health',
        'trend-regression'
      ]
    };
  }

  getStatus() {
    return {
      active: true,
      metricsCollected: {
        phaseValidation: Array.from(this.metrics.phaseValidation.values()).reduce((sum, arr) => sum + arr.length, 0),
        agentPerformance: Array.from(this.metrics.agentPerformance.values()).reduce((sum, arr) => sum + arr.length, 0),
        qualityTrends: Array.from(this.metrics.qualityTrends.values()).reduce((sum, arr) => sum + arr.length, 0)
      },
      lastAggregation: Date.now(),
      healthScore: this.calculateSystemHealthScore()
    };
  }
}

module.exports = QualityMetricsManager;