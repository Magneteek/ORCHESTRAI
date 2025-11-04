const EventEmitter = require('events');

class PerformanceQualityTester extends EventEmitter {
  constructor(orchestrator, mcpIntegrationManager, crystallineMemory) {
    super();
    this.orchestrator = orchestrator;
    this.mcpManager = mcpIntegrationManager;
    this.crystallineMemory = crystallineMemory;
    this.claudeCodeAgent = 'web-performance-optimizer';
    
    this.qualityMetrics = {
      performanceScore: { min: 80, target: 95 },
      coreWebVitals: { min: 85, target: 95 },
      loadTime: { max: 3000, target: 1500 }
    };
    
    this.capabilities = [
      'core-web-vitals-measurement',
      'load-time-validation',
      'bundle-size-optimization',
      'performance-scoring',
      'lighthouse-integration',
      'performance-regression-detection'
    ];

    this.coreWebVitalThresholds = {
      lcp: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
      fid: { good: 100, needsImprovement: 300 },   // First Input Delay
      cls: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
      fcp: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
      ttfb: { good: 800, needsImprovement: 1800 }  // Time to First Byte
    };
  }

  async validatePerformance(url, performanceConfig = {}) {
    try {
      console.log(`⚡ Starting performance quality validation for: ${url}`);
      
      const {
        includeLighthouseAudit = true,
        includeCoreWebVitals = true,
        includeLoadTimeValidation = true,
        includeRegressionDetection = true,
        testConditions = ['desktop', 'mobile'],
        networkThrottling = ['fast3G', 'slow3G', 'offline']
      } = performanceConfig;

      const performanceValidationResults = {
        url,
        timestamp: Date.now(),
        overallScore: 0,
        results: {}
      };

      // Core Web Vitals Measurement via MCP
      if (includeCoreWebVitals) {
        console.log('📊 Measuring Core Web Vitals...');
        const coreWebVitalsResults = await this.measureCoreWebVitals(url, testConditions);
        performanceValidationResults.results.coreWebVitals = coreWebVitalsResults;
      }

      // Lighthouse Performance Audit via MCP
      if (includeLighthouseAudit) {
        console.log('💡 Running Lighthouse performance audit...');
        const lighthouseResults = await this.runLighthouseAudit(url, testConditions);
        performanceValidationResults.results.lighthouse = lighthouseResults;
      }

      // Load Time Validation
      if (includeLoadTimeValidation) {
        console.log('⏱️ Validating load time performance...');
        const loadTimeResults = await this.validateLoadTimes(url, networkThrottling);
        performanceValidationResults.results.loadTime = loadTimeResults;
      }

      // Performance Analysis via Claude Code
      const performanceAnalysis = await this.analyzePerformanceOptimizations(url, performanceValidationResults.results);
      performanceValidationResults.results.analysis = performanceAnalysis;

      // Performance Regression Detection
      if (includeRegressionDetection) {
        console.log('📈 Detecting performance regressions...');
        const regressionResults = await this.detectPerformanceRegression(url, performanceValidationResults);
        performanceValidationResults.results.regression = regressionResults;
      }

      // Calculate overall performance score
      performanceValidationResults.overallScore = this.calculateOverallPerformanceScore(performanceValidationResults.results);
      performanceValidationResults.qualityGateStatus = this.evaluateQualityGates(performanceValidationResults);

      // Store results in crystalline memory
      await this.crystallineMemory.store('performance-benchmarks', {
        type: 'performance-validation',
        agentId: 'web-quality-performance-tester',
        url,
        result: performanceValidationResults,
        timestamp: Date.now()
      });

      console.log(`✅ Performance validation completed with score: ${performanceValidationResults.overallScore}%`);
      return performanceValidationResults;

    } catch (error) {
      console.error('❌ Performance quality validation failed:', error);
      throw error;
    }
  }

  async measureCoreWebVitals(url, testConditions) {
    try {
      const coreWebVitalsResults = [];
      
      for (const condition of testConditions) {
        const performanceResult = await this.mcpManager.executeCapability('performance-measurement', {
          url,
          options: {
            throttling: condition === 'mobile' ? 'mobile3G' : 'desktopFast',
            device: condition
          }
        });
        
        const webVitals = {
          condition,
          lcp: performanceResult.coreWebVitals?.lcp || 0,
          fid: performanceResult.coreWebVitals?.fid || 0,
          cls: performanceResult.coreWebVitals?.cls || 0,
          fcp: performanceResult.coreWebVitals?.fcp || 0,
          ttfb: performanceResult.coreWebVitals?.ttfb || 0,
          timestamp: Date.now()
        };
        
        webVitals.scores = this.scoreWebVitals(webVitals);
        coreWebVitalsResults.push(webVitals);
      }
      
      const averageScores = this.calculateAverageCoreWebVitals(coreWebVitalsResults);
      
      return {
        testConditions: coreWebVitalsResults,
        averageScores,
        overallCoreWebVitalsScore: averageScores.overallScore,
        meetsWebVitalStandards: averageScores.overallScore >= this.qualityMetrics.coreWebVitals.min
      };
    } catch (error) {
      console.error('Core Web Vitals measurement failed:', error);
      return { overallCoreWebVitalsScore: 0, error: error.message };
    }
  }

  async runLighthouseAudit(url, testConditions) {
    try {
      const lighthouseResults = [];
      
      for (const condition of testConditions) {
        const lighthouseResult = await this.mcpManager.executeCapability('performance-measurement', {
          url,
          options: {
            device: condition,
            categories: ['performance', 'accessibility', 'best-practices', 'seo'],
            includeScreenshot: true
          }
        });
        
        lighthouseResults.push({
          condition,
          performanceScore: lighthouseResult.overallScore || 0,
          categoryScores: lighthouseResult.categories || {},
          opportunities: lighthouseResult.opportunities || [],
          diagnostics: lighthouseResult.diagnostics || {},
          timestamp: Date.now()
        });
      }
      
      const averagePerformanceScore = lighthouseResults.reduce(
        (sum, result) => sum + (result.performanceScore || 0), 0
      ) / lighthouseResults.length;
      
      return {
        testConditions: lighthouseResults,
        averagePerformanceScore,
        meetsLighthouseStandards: averagePerformanceScore >= this.qualityMetrics.performanceScore.min
      };
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
      return { averagePerformanceScore: 0, error: error.message };
    }
  }

  async validateLoadTimes(url, networkThrottling) {
    try {
      const loadTimeResults = [];
      
      for (const throttling of networkThrottling) {
        const startTime = Date.now();
        
        try {
          const performanceResult = await this.mcpManager.executeCapability('performance-measurement', {
            url,
            options: {
              throttling,
              measureRealLoadTime: true
            }
          });
          
          const loadTime = performanceResult.loadTime || (Date.now() - startTime);
          
          loadTimeResults.push({
            networkCondition: throttling,
            loadTime,
            meetsLoadTimeTarget: loadTime <= this.qualityMetrics.loadTime.max,
            timestamp: Date.now()
          });
        } catch (testError) {
          loadTimeResults.push({
            networkCondition: throttling,
            loadTime: 0,
            meetsLoadTimeTarget: false,
            error: testError.message
          });
        }
      }
      
      const averageLoadTime = loadTimeResults
        .filter(result => result.loadTime > 0)
        .reduce((sum, result) => sum + result.loadTime, 0) / 
        loadTimeResults.filter(result => result.loadTime > 0).length;
      
      return {
        networkConditions: loadTimeResults,
        averageLoadTime: averageLoadTime || 0,
        meetsLoadTimeStandards: averageLoadTime <= this.qualityMetrics.loadTime.max
      };
    } catch (error) {
      console.error('Load time validation failed:', error);
      return { averageLoadTime: 0, error: error.message };
    }
  }

  async analyzePerformanceOptimizations(url, performanceResults) {
    try {
      const performanceAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-performance-optimizations',
        url,
        performanceData: performanceResults,
        analysisPoints: [
          'bundle-size-optimization',
          'image-optimization-opportunities',
          'caching-strategy-analysis',
          'critical-render-path-optimization',
          'javascript-execution-optimization',
          'css-delivery-optimization'
        ],
        generateActionableRecommendations: true
      });
      
      return {
        bundleSizeRecommendations: performanceAnalysis.bundleSize || [],
        imageOptimizationRecommendations: performanceAnalysis.imageOptimization || [],
        cachingRecommendations: performanceAnalysis.caching || [],
        renderPathRecommendations: performanceAnalysis.criticalRenderPath || [],
        jsOptimizationRecommendations: performanceAnalysis.jsOptimization || [],
        cssOptimizationRecommendations: performanceAnalysis.cssOptimization || [],
        prioritizedRecommendations: performanceAnalysis.prioritizedRecommendations || [],
        estimatedImpact: performanceAnalysis.estimatedImpact || {}
      };
    } catch (error) {
      console.error('Performance optimization analysis failed:', error);
      return { error: error.message };
    }
  }

  async detectPerformanceRegression(url, currentResults) {
    try {
      // Retrieve historical performance data
      const historicalData = await this.crystallineMemory.retrieve('performance-benchmarks', {
        type: 'performance-validation',
        url,
        limit: 5,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
      
      if (!historicalData || historicalData.length < 2) {
        return {
          hasHistoricalData: false,
          message: 'Insufficient historical data for regression analysis'
        };
      }
      
      const regressionAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'detect-performance-regression',
        currentResults,
        historicalData: historicalData.slice(0, 5),
        regressionThresholds: {
          performanceScoreRegression: 5,
          loadTimeRegression: 500,
          coreWebVitalRegression: 10
        }
      });
      
      return {
        hasHistoricalData: true,
        regressionDetected: regressionAnalysis.regressionDetected || false,
        regressionDetails: regressionAnalysis.regressionDetails || {},
        performanceTrend: regressionAnalysis.trend || 'stable',
        recommendations: regressionAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Performance regression detection failed:', error);
      return { error: error.message };
    }
  }

  scoreWebVitals(webVitals) {
    const scores = {};
    
    for (const [metric, value] of Object.entries(webVitals)) {
      if (this.coreWebVitalThresholds[metric]) {
        const threshold = this.coreWebVitalThresholds[metric];
        
        if (value <= threshold.good) {
          scores[metric] = 100;
        } else if (value <= threshold.needsImprovement) {
          scores[metric] = 75;
        } else {
          scores[metric] = 50;
        }
      }
    }
    
    const metricScores = Object.values(scores);
    scores.overallScore = metricScores.length > 0 ? 
      metricScores.reduce((sum, score) => sum + score, 0) / metricScores.length : 0;
    
    return scores;
  }

  calculateAverageCoreWebVitals(results) {
    if (results.length === 0) return { overallScore: 0 };
    
    const averages = {};
    const metrics = ['lcp', 'fid', 'cls', 'fcp', 'ttfb'];
    
    for (const metric of metrics) {
      const values = results.map(r => r[metric]).filter(v => v > 0);
      averages[metric] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }
    
    const avgScores = this.scoreWebVitals(averages);
    return avgScores;
  }

  calculateOverallPerformanceScore(results) {
    const scores = [];
    
    if (results.coreWebVitals) {
      scores.push(results.coreWebVitals.overallCoreWebVitalsScore);
    }
    
    if (results.lighthouse) {
      scores.push(results.lighthouse.averagePerformanceScore);
    }
    
    if (results.loadTime && results.loadTime.averageLoadTime > 0) {
      const loadTimeScore = Math.max(0, 100 - ((results.loadTime.averageLoadTime - this.qualityMetrics.loadTime.target) / 50));
      scores.push(Math.min(100, loadTimeScore));
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  evaluateQualityGates(performanceResults) {
    const gateStatus = {
      performanceScoreGate: false,
      coreWebVitalsGate: false,
      loadTimeGate: false,
      overallPassed: false
    };

    if (performanceResults.results.lighthouse) {
      gateStatus.performanceScoreGate = performanceResults.results.lighthouse.averagePerformanceScore >= this.qualityMetrics.performanceScore.min;
    }

    if (performanceResults.results.coreWebVitals) {
      gateStatus.coreWebVitalsGate = performanceResults.results.coreWebVitals.overallCoreWebVitalsScore >= this.qualityMetrics.coreWebVitals.min;
    }

    if (performanceResults.results.loadTime) {
      gateStatus.loadTimeGate = performanceResults.results.loadTime.averageLoadTime <= this.qualityMetrics.loadTime.max;
    }

    gateStatus.overallPassed = Object.values(gateStatus).slice(0, -1).every(gate => gate);
    return gateStatus;
  }

  async getQualityMetrics() {
    return {
      metrics: this.qualityMetrics,
      capabilities: this.capabilities,
      claudeCodeAgent: this.claudeCodeAgent,
      coreWebVitalThresholds: this.coreWebVitalThresholds
    };
  }

  getStatus() {
    return {
      agentId: 'web-quality-performance-tester',
      active: true,
      capabilities: this.capabilities,
      qualityMetrics: this.qualityMetrics,
      mcpIntegration: 'browser-mcp',
      coreWebVitalThresholds: this.coreWebVitalThresholds
    };
  }
}

module.exports = PerformanceQualityTester;