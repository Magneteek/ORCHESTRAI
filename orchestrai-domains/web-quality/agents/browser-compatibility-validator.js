const EventEmitter = require('events');

class BrowserCompatibilityValidator extends EventEmitter {
  constructor(orchestrator, mcpIntegrationManager, crystallineMemory) {
    super();
    this.orchestrator = orchestrator;
    this.mcpManager = mcpIntegrationManager;
    this.crystallineMemory = crystallineMemory;
    this.claudeCodeAgent = 'web-browser-compatibility-agent';
    
    this.qualityMetrics = {
      browserCompatibility: { min: 90, target: 98 },
      featureSupport: { min: 85, target: 95 },
      crossBrowserConsistency: { min: 80, target: 90 }
    };
    
    this.capabilities = [
      'multi-browser-testing',
      'feature-detection-validation',
      'polyfill-validation',
      'browser-specific-bug-detection',
      'compatibility-matrix-generation',
      'progressive-enhancement-testing'
    ];

    this.supportedBrowsers = {
      chrome: { name: 'Chrome', versions: ['latest', '90', '85'] },
      firefox: { name: 'Firefox', versions: ['latest', '88', '85'] },
      safari: { name: 'Safari', versions: ['latest', '14', '13'] },
      edge: { name: 'Edge', versions: ['latest', '90', '85'] }
    };
  }

  async validateBrowserCompatibility(url, compatibilityConfig = {}) {
    try {
      console.log(`🌐 Starting browser compatibility validation for: ${url}`);
      
      const {
        browsers = ['chrome', 'firefox', 'safari', 'edge'],
        includeFeatureDetection = true,
        includePolyfillValidation = true,
        includeBugDetection = true,
        includeProgressiveEnhancement = true,
        testViewports = [
          { width: 1920, height: 1080, device: 'desktop' },
          { width: 768, height: 1024, device: 'tablet' },
          { width: 375, height: 667, device: 'mobile' }
        ]
      } = compatibilityConfig;

      const compatibilityValidationResults = {
        url,
        timestamp: Date.now(),
        overallScore: 0,
        results: {}
      };

      // Cross-Browser Testing via Playwright MCP
      console.log('🧪 Running cross-browser compatibility tests...');
      const crossBrowserResults = await this.runCrossBrowserTests(url, browsers, testViewports);
      compatibilityValidationResults.results.crossBrowser = crossBrowserResults;

      // Feature Detection Validation via Claude Code
      if (includeFeatureDetection) {
        console.log('🔍 Validating feature detection and support...');
        const featureDetectionResults = await this.validateFeatureDetection(url, browsers);
        compatibilityValidationResults.results.featureDetection = featureDetectionResults;
      }

      // Polyfill Validation
      if (includePolyfillValidation) {
        console.log('🔧 Validating polyfill implementation...');
        const polyfillResults = await this.validatePolyfillImplementation(url, browsers);
        compatibilityValidationResults.results.polyfills = polyfillResults;
      }

      // Browser-Specific Bug Detection
      if (includeBugDetection) {
        console.log('🐛 Detecting browser-specific bugs...');
        const bugDetectionResults = await this.detectBrowserSpecificBugs(url, browsers);
        compatibilityValidationResults.results.browserBugs = bugDetectionResults;
      }

      // Progressive Enhancement Testing
      if (includeProgressiveEnhancement) {
        console.log('📈 Testing progressive enhancement...');
        const progressiveResults = await this.testProgressiveEnhancement(url, browsers);
        compatibilityValidationResults.results.progressiveEnhancement = progressiveResults;
      }

      // Generate Compatibility Matrix
      const compatibilityMatrix = await this.generateCompatibilityMatrix(compatibilityValidationResults.results);
      compatibilityValidationResults.results.compatibilityMatrix = compatibilityMatrix;

      // Calculate overall compatibility score
      compatibilityValidationResults.overallScore = this.calculateOverallCompatibilityScore(compatibilityValidationResults.results);
      compatibilityValidationResults.qualityGateStatus = this.evaluateQualityGates(compatibilityValidationResults);

      // Store results in crystalline memory
      await this.crystallineMemory.store('browser-compatibility-matrix', {
        type: 'compatibility-validation',
        agentId: 'web-quality-browser-compatibility-validator',
        url,
        result: compatibilityValidationResults,
        timestamp: Date.now()
      });

      console.log(`✅ Browser compatibility validation completed with score: ${compatibilityValidationResults.overallScore}%`);
      return compatibilityValidationResults;

    } catch (error) {
      console.error('❌ Browser compatibility validation failed:', error);
      throw error;
    }
  }

  async runCrossBrowserTests(url, browsers, testViewports) {
    try {
      const crossBrowserResults = [];
      
      for (const browser of browsers) {
        if (!this.supportedBrowsers[browser]) {
          console.warn(`⚠️ Browser ${browser} not supported, skipping...`);
          continue;
        }
        
        console.log(`🧪 Testing in ${this.supportedBrowsers[browser].name}...`);
        
        const browserResults = [];
        
        for (const viewport of testViewports) {
          const testResult = await this.mcpManager.executeCapability('cross-browser-compatibility', {
            url,
            browsers: [browser],
            testConfig: {
              viewport,
              captureScreenshots: true,
              testInteractions: true,
              checkConsoleErrors: true,
              validateLayout: true
            }
          });
          
          browserResults.push({
            viewport,
            success: testResult.passedBrowsers > 0,
            screenshots: testResult.results?.[0]?.screenshots || [],
            consoleErrors: testResult.results?.[0]?.errors || [],
            layoutIssues: testResult.results?.[0]?.warnings || [],
            performanceMetrics: testResult.results?.[0]?.performance || {}
          });
        }
        
        const browserCompatibilityScore = (browserResults.filter(r => r.success).length / browserResults.length) * 100;
        
        crossBrowserResults.push({
          browser,
          browserName: this.supportedBrowsers[browser].name,
          compatibilityScore: browserCompatibilityScore,
          viewportResults: browserResults,
          overallSuccess: browserCompatibilityScore >= 80
        });
      }
      
      const averageCompatibilityScore = crossBrowserResults.reduce(
        (sum, result) => sum + result.compatibilityScore, 0
      ) / crossBrowserResults.length;
      
      return {
        testedBrowsers: crossBrowserResults,
        averageCompatibilityScore,
        supportedBrowsersCount: crossBrowserResults.filter(r => r.overallSuccess).length,
        totalBrowsersCount: crossBrowserResults.length
      };
    } catch (error) {
      console.error('Cross-browser testing failed:', error);
      return { averageCompatibilityScore: 0, error: error.message };
    }
  }

  async validateFeatureDetection(url, browsers) {
    try {
      const featureValidation = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'validate-feature-detection',
        url,
        browsers,
        featureChecks: [
          'es6-features',
          'css-grid-support',
          'flexbox-support',
          'webp-support',
          'service-worker-support',
          'local-storage-support',
          'geolocation-support',
          'touch-events',
          'intersection-observer'
        ],
        generateCompatibilityReport: true
      });
      
      return {
        supportedFeatures: featureValidation.supportedFeatures || {},
        unsupportedFeatures: featureValidation.unsupportedFeatures || {},
        partiallySupported: featureValidation.partiallySupported || {},
        featureSupportScore: featureValidation.featureSupportScore || 0,
        browserFeatureMatrix: featureValidation.browserMatrix || {},
        recommendations: featureValidation.recommendations || []
      };
    } catch (error) {
      console.error('Feature detection validation failed:', error);
      return { featureSupportScore: 0, error: error.message };
    }
  }

  async validatePolyfillImplementation(url, browsers) {
    try {
      const polyfillValidation = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'validate-polyfill-implementation',
        url,
        browsers,
        polyfillChecks: [
          'babel-polyfill-usage',
          'core-js-implementation',
          'polyfill-io-integration',
          'custom-polyfill-validation',
          'feature-detection-before-polyfill',
          'polyfill-loading-strategy'
        ],
        analyzeBundle: true
      });
      
      return {
        polyfillCoverage: polyfillValidation.coverage || 0,
        polyfillEffectiveness: polyfillValidation.effectiveness || 0,
        loadingStrategy: polyfillValidation.loadingStrategy || {},
        bundleImpact: polyfillValidation.bundleImpact || {},
        missingPolyfills: polyfillValidation.missingPolyfills || [],
        unnecessaryPolyfills: polyfillValidation.unnecessaryPolyfills || [],
        recommendations: polyfillValidation.recommendations || []
      };
    } catch (error) {
      console.error('Polyfill validation failed:', error);
      return { polyfillCoverage: 0, error: error.message };
    }
  }

  async detectBrowserSpecificBugs(url, browsers) {
    try {
      const bugDetection = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'detect-browser-specific-bugs',
        url,
        browsers,
        commonBugPatterns: [
          'ie-flexbox-bugs',
          'safari-date-parsing',
          'firefox-font-rendering',
          'chrome-scroll-behavior',
          'edge-css-grid-issues',
          'mobile-safari-viewport',
          'android-touch-events'
        ],
        includeWorkarounds: true
      });
      
      return {
        detectedBugs: bugDetection.bugs || [],
        bugSeverity: bugDetection.severity || {},
        browserSpecificIssues: bugDetection.browserIssues || {},
        workarounds: bugDetection.workarounds || {},
        prioritizedFixes: bugDetection.prioritizedFixes || [],
        testingRecommendations: bugDetection.testingRecommendations || []
      };
    } catch (error) {
      console.error('Browser-specific bug detection failed:', error);
      return { detectedBugs: [], error: error.message };
    }
  }

  async testProgressiveEnhancement(url, browsers) {
    try {
      const progressiveResults = [];
      
      // Test with different capability levels
      const testScenarios = [
        { name: 'No JavaScript', disableJS: true },
        { name: 'No CSS', disableCSS: true },
        { name: 'Slow Connection', throttling: 'slow3G' },
        { name: 'No Images', disableImages: true }
      ];
      
      for (const scenario of testScenarios) {
        const scenarioResults = await this.mcpManager.executeCapability('cross-browser-compatibility', {
          url,
          browsers,
          testConfig: {
            ...scenario,
            measureBasicFunctionality: true,
            checkContentAccessibility: true
          }
        });
        
        progressiveResults.push({
          scenario: scenario.name,
          functionality: scenarioResults.functionality || 0,
          accessibility: scenarioResults.accessibility || 0,
          contentAvailability: scenarioResults.contentAvailability || 0,
          browserResults: scenarioResults.results || []
        });
      }
      
      const progressiveEnhancementAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-progressive-enhancement',
        progressiveResults,
        generateImprovementPlan: true
      });
      
      return {
        scenarioResults: progressiveResults,
        progressiveScore: progressiveEnhancementAnalysis.progressiveScore || 0,
        gracefulDegradation: progressiveEnhancementAnalysis.gracefulDegradation || {},
        improvementPlan: progressiveEnhancementAnalysis.improvementPlan || [],
        recommendations: progressiveEnhancementAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Progressive enhancement testing failed:', error);
      return { progressiveScore: 0, error: error.message };
    }
  }

  async generateCompatibilityMatrix(results) {
    try {
      const matrixGeneration = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'generate-compatibility-matrix',
        crossBrowserResults: results.crossBrowser || {},
        featureDetectionResults: results.featureDetection || {},
        polyfillResults: results.polyfills || {},
        bugDetectionResults: results.browserBugs || {},
        createVisualMatrix: true
      });
      
      return {
        compatibilityMatrix: matrixGeneration.matrix || {},
        supportLevels: matrixGeneration.supportLevels || {},
        recommendations: matrixGeneration.recommendations || [],
        priorityActions: matrixGeneration.priorityActions || []
      };
    } catch (error) {
      console.error('Compatibility matrix generation failed:', error);
      return { error: error.message };
    }
  }

  calculateOverallCompatibilityScore(results) {
    const scores = [];
    
    if (results.crossBrowser) {
      scores.push(results.crossBrowser.averageCompatibilityScore);
    }
    
    if (results.featureDetection) {
      scores.push(results.featureDetection.featureSupportScore);
    }
    
    if (results.polyfills) {
      scores.push(results.polyfills.polyfillCoverage);
    }
    
    if (results.progressiveEnhancement) {
      scores.push(results.progressiveEnhancement.progressiveScore);
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  evaluateQualityGates(compatibilityResults) {
    const gateStatus = {
      browserCompatibilityGate: false,
      featureSupportGate: false,
      crossBrowserConsistencyGate: false,
      overallPassed: false
    };

    if (compatibilityResults.results.crossBrowser) {
      gateStatus.browserCompatibilityGate = compatibilityResults.results.crossBrowser.averageCompatibilityScore >= this.qualityMetrics.browserCompatibility.min;
    }

    if (compatibilityResults.results.featureDetection) {
      gateStatus.featureSupportGate = compatibilityResults.results.featureDetection.featureSupportScore >= this.qualityMetrics.featureSupport.min;
    }

    // Cross-browser consistency based on variance in scores
    if (compatibilityResults.results.crossBrowser && compatibilityResults.results.crossBrowser.testedBrowsers) {
      const scores = compatibilityResults.results.crossBrowser.testedBrowsers.map(b => b.compatibilityScore);
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
      const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));
      
      gateStatus.crossBrowserConsistencyGate = consistencyScore >= this.qualityMetrics.crossBrowserConsistency.min;
    }

    gateStatus.overallPassed = Object.values(gateStatus).slice(0, -1).every(gate => gate);
    return gateStatus;
  }

  async getQualityMetrics() {
    return {
      metrics: this.qualityMetrics,
      capabilities: this.capabilities,
      claudeCodeAgent: this.claudeCodeAgent,
      supportedBrowsers: this.supportedBrowsers
    };
  }

  getStatus() {
    return {
      agentId: 'web-quality-browser-compatibility-validator',
      active: true,
      capabilities: this.capabilities,
      qualityMetrics: this.qualityMetrics,
      mcpIntegration: 'playwright-mcp',
      supportedBrowsers: Object.keys(this.supportedBrowsers)
    };
  }
}

module.exports = BrowserCompatibilityValidator;