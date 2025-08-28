const EventEmitter = require('events');

class ResponsiveDesignValidator extends EventEmitter {
  constructor(orchestrator, mcpIntegrationManager, crystallineMemory) {
    super();
    this.orchestrator = orchestrator;
    this.mcpManager = mcpIntegrationManager;
    this.crystallineMemory = crystallineMemory;
    this.claudeCodeAgent = 'web-responsive-design-agent';
    
    this.qualityMetrics = {
      responsiveCompliance: { min: 90, target: 100 },
      mobileOptimization: { min: 85, target: 95 },
      crossDeviceConsistency: { min: 80, target: 90 }
    };
    
    this.capabilities = [
      'breakpoint-testing',
      'mobile-optimization-validation',
      'cross-device-consistency',
      'responsive-layout-validation',
      'touch-interface-testing',
      'viewport-adaptation-testing'
    ];
    
    this.standardBreakpoints = {
      mobile: [320, 375, 414],
      tablet: [768, 834, 1024],
      desktop: [1280, 1440, 1920]
    };
  }

  async validateResponsiveDesign(url, validationConfig = {}) {
    try {
      console.log(`📱 Starting responsive design validation for: ${url}`);
      
      const {
        customBreakpoints = [],
        includeTouchTesting = true,
        includeOrientationTesting = true,
        includeContentFlowValidation = true,
        testDeviceTypes = ['mobile', 'tablet', 'desktop']
      } = validationConfig;

      const allBreakpoints = this.consolidateBreakpoints(customBreakpoints);
      
      const responsiveValidationResults = {
        url,
        timestamp: Date.now(),
        overallScore: 0,
        results: {}
      };

      // Multi-breakpoint Responsive Testing via MCP
      console.log('📐 Testing responsive layouts across breakpoints...');
      const responsiveTestResult = await this.mcpManager.executeCapability('responsive-design-testing', {
        url,
        breakpoints: allBreakpoints
      });
      
      responsiveValidationResults.results.breakpointTesting = {
        overallCompliance: responsiveTestResult.summary?.overallCompliance * 100 || 0,
        breakpointResults: responsiveTestResult.breakpoints || [],
        passedBreakpoints: responsiveTestResult.summary?.passedBreakpoints || 0,
        totalBreakpoints: responsiveTestResult.summary?.totalBreakpoints || 0
      };

      // Mobile Optimization Analysis
      if (testDeviceTypes.includes('mobile')) {
        console.log('📱 Analyzing mobile optimization...');
        const mobileOptimization = await this.analyzeMobileOptimization(url);
        responsiveValidationResults.results.mobileOptimization = mobileOptimization;
      }

      // Touch Interface Validation
      if (includeTouchTesting) {
        console.log('👆 Validating touch interface elements...');
        const touchValidation = await this.validateTouchInterface(url);
        responsiveValidationResults.results.touchInterface = touchValidation;
      }

      // Orientation Testing
      if (includeOrientationTesting) {
        console.log('🔄 Testing orientation changes...');
        const orientationResults = await this.testOrientationAdaptation(url);
        responsiveValidationResults.results.orientation = orientationResults;
      }

      // Content Flow Validation via Claude Code
      if (includeContentFlowValidation) {
        console.log('📝 Validating content flow across devices...');
        const contentFlowAnalysis = await this.analyzeContentFlow(url, allBreakpoints);
        responsiveValidationResults.results.contentFlow = contentFlowAnalysis;
      }

      // Cross-Device Consistency Analysis
      const consistencyAnalysis = await this.analyzeCrossDeviceConsistency(responsiveValidationResults.results);
      responsiveValidationResults.results.crossDeviceConsistency = consistencyAnalysis;

      // Calculate overall responsive score
      responsiveValidationResults.overallScore = this.calculateOverallResponsiveScore(responsiveValidationResults.results);
      responsiveValidationResults.qualityGateStatus = this.evaluateQualityGates(responsiveValidationResults);

      // Store results in crystalline memory
      await this.crystallineMemory.store('browser-compatibility-matrix', {
        type: 'responsive-validation',
        agentId: 'web-quality-responsive-validator',
        url,
        result: responsiveValidationResults,
        timestamp: Date.now()
      });

      console.log(`✅ Responsive design validation completed with score: ${responsiveValidationResults.overallScore}%`);
      return responsiveValidationResults;

    } catch (error) {
      console.error('❌ Responsive design validation failed:', error);
      throw error;
    }
  }

  consolidateBreakpoints(customBreakpoints) {
    const allBreakpoints = new Set();
    
    // Add standard breakpoints
    Object.values(this.standardBreakpoints).flat().forEach(bp => allBreakpoints.add(bp));
    
    // Add custom breakpoints
    customBreakpoints.forEach(bp => allBreakpoints.add(bp));
    
    return Array.from(allBreakpoints).sort((a, b) => a - b);
  }

  async analyzeMobileOptimization(url) {
    try {
      // Get mobile screenshots and analysis
      const mobileBreakpoints = this.standardBreakpoints.mobile;
      const mobileResults = [];
      
      for (const breakpoint of mobileBreakpoints) {
        const mobileTest = await this.mcpManager.executeCapability('responsive-design-testing', {
          url,
          breakpoints: [breakpoint]
        });
        
        const mobileAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
          task: 'analyze-mobile-optimization',
          breakpoint,
          testResult: mobileTest,
          analysisPoints: [
            'touch-target-sizes',
            'font-readability',
            'content-prioritization',
            'navigation-usability',
            'load-performance',
            'viewport-optimization'
          ]
        });
        
        mobileResults.push({
          breakpoint,
          device: this.getDeviceNameForBreakpoint(breakpoint),
          optimizationScore: mobileAnalysis.optimizationScore || 0,
          touchTargetCompliance: mobileAnalysis.touchTargets || {},
          fontReadability: mobileAnalysis.fonts || {},
          contentPrioritization: mobileAnalysis.contentPriority || {},
          navigationUsability: mobileAnalysis.navigation || {},
          issues: mobileAnalysis.issues || []
        });
      }
      
      const avgOptimizationScore = mobileResults.reduce((sum, result) => sum + (result.optimizationScore || 0), 0) / mobileResults.length;
      
      return {
        overallOptimization: avgOptimizationScore,
        deviceResults: mobileResults,
        meetsMobileStandards: avgOptimizationScore >= this.qualityMetrics.mobileOptimization.min
      };
    } catch (error) {
      console.error('Mobile optimization analysis failed:', error);
      return { overallOptimization: 0, error: error.message };
    }
  }

  async validateTouchInterface(url) {
    try {
      const touchValidation = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'validate-touch-interface',
        url,
        testCriteria: {
          minTouchTargetSize: 44, // iOS guideline
          touchTargetSpacing: 8,
          gestureSupport: ['tap', 'swipe', 'pinch', 'scroll'],
          hoverStateHandling: true
        },
        captureInteractionScreenshots: true
      });
      
      return {
        touchTargetCompliance: touchValidation.touchTargetCompliance || 0,
        gestureSupport: touchValidation.gestures || {},
        interactionFeedback: touchValidation.feedback || {},
        hoverStateHandling: touchValidation.hoverStates || {},
        recommendations: touchValidation.recommendations || []
      };
    } catch (error) {
      console.error('Touch interface validation failed:', error);
      return { touchTargetCompliance: 0, error: error.message };
    }
  }

  async testOrientationAdaptation(url) {
    try {
      const orientationResults = [];
      const testDevices = [
        { width: 375, height: 667, orientation: 'portrait' },
        { width: 667, height: 375, orientation: 'landscape' },
        { width: 768, height: 1024, orientation: 'portrait' },
        { width: 1024, height: 768, orientation: 'landscape' }
      ];
      
      for (const device of testDevices) {
        const orientationTest = await this.mcpManager.executeCapability('responsive-design-testing', {
          url,
          breakpoints: [device.width],
          options: {
            height: device.height,
            orientation: device.orientation
          }
        });
        
        orientationResults.push({
          ...device,
          adaptationScore: orientationTest.summary?.overallCompliance * 100 || 0,
          layoutIssues: orientationTest.breakpoints?.[0]?.layoutValidation?.issues || []
        });
      }
      
      const avgAdaptationScore = orientationResults.reduce((sum, result) => sum + (result.adaptationScore || 0), 0) / orientationResults.length;
      
      return {
        overallAdaptation: avgAdaptationScore,
        orientationResults,
        adaptationCompliance: avgAdaptationScore >= 80
      };
    } catch (error) {
      console.error('Orientation adaptation testing failed:', error);
      return { overallAdaptation: 0, error: error.message };
    }
  }

  async analyzeContentFlow(url, breakpoints) {
    try {
      const contentFlowAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-responsive-content-flow',
        url,
        breakpoints,
        analysisPoints: [
          'content-hierarchy-consistency',
          'reading-flow-optimization',
          'information-architecture-adaptation',
          'cta-prominence-maintenance',
          'media-content-scaling'
        ]
      });
      
      return {
        hierarchyConsistency: contentFlowAnalysis.hierarchy || 0,
        readingFlowOptimization: contentFlowAnalysis.readingFlow || 0,
        informationArchitecture: contentFlowAnalysis.infoArchitecture || 0,
        ctaProminence: contentFlowAnalysis.ctaProminence || 0,
        mediaScaling: contentFlowAnalysis.mediaScaling || 0,
        overallContentFlowScore: contentFlowAnalysis.overallScore || 0,
        recommendations: contentFlowAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Content flow analysis failed:', error);
      return { overallContentFlowScore: 0, error: error.message };
    }
  }

  async analyzeCrossDeviceConsistency(results) {
    try {
      const consistencyAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-cross-device-consistency',
        breakpointResults: results.breakpointTesting?.breakpointResults || [],
        mobileResults: results.mobileOptimization?.deviceResults || [],
        contentFlowResults: results.contentFlow || {},
        calculateVariance: true
      });
      
      return {
        visualConsistency: consistencyAnalysis.visualConsistency || 0,
        functionalConsistency: consistencyAnalysis.functionalConsistency || 0,
        contentConsistency: consistencyAnalysis.contentConsistency || 0,
        overallConsistency: consistencyAnalysis.overallConsistency || 0,
        consistencyIssues: consistencyAnalysis.issues || [],
        recommendations: consistencyAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Cross-device consistency analysis failed:', error);
      return { overallConsistency: 0, error: error.message };
    }
  }

  calculateOverallResponsiveScore(results) {
    const scores = [];
    
    if (results.breakpointTesting) {
      scores.push(results.breakpointTesting.overallCompliance);
    }
    
    if (results.mobileOptimization) {
      scores.push(results.mobileOptimization.overallOptimization);
    }
    
    if (results.crossDeviceConsistency) {
      scores.push(results.crossDeviceConsistency.overallConsistency);
    }
    
    if (results.contentFlow) {
      scores.push(results.contentFlow.overallContentFlowScore);
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  evaluateQualityGates(responsiveResults) {
    const gateStatus = {
      responsiveComplianceGate: false,
      mobileOptimizationGate: false,
      crossDeviceConsistencyGate: false,
      overallPassed: false
    };

    if (responsiveResults.results.breakpointTesting) {
      gateStatus.responsiveComplianceGate = responsiveResults.results.breakpointTesting.overallCompliance >= this.qualityMetrics.responsiveCompliance.min;
    }

    if (responsiveResults.results.mobileOptimization) {
      gateStatus.mobileOptimizationGate = responsiveResults.results.mobileOptimization.overallOptimization >= this.qualityMetrics.mobileOptimization.min;
    }

    if (responsiveResults.results.crossDeviceConsistency) {
      gateStatus.crossDeviceConsistencyGate = responsiveResults.results.crossDeviceConsistency.overallConsistency >= this.qualityMetrics.crossDeviceConsistency.min;
    }

    gateStatus.overallPassed = Object.values(gateStatus).slice(0, -1).every(gate => gate);
    return gateStatus;
  }

  getDeviceNameForBreakpoint(breakpoint) {
    if (breakpoint <= 414) return 'Mobile';
    if (breakpoint <= 1024) return 'Tablet';
    return 'Desktop';
  }

  async getQualityMetrics() {
    return {
      metrics: this.qualityMetrics,
      capabilities: this.capabilities,
      claudeCodeAgent: this.claudeCodeAgent,
      standardBreakpoints: this.standardBreakpoints
    };
  }

  getStatus() {
    return {
      agentId: 'web-quality-responsive-validator',
      active: true,
      capabilities: this.capabilities,
      qualityMetrics: this.qualityMetrics,
      mcpIntegration: 'browser-mcp',
      standardBreakpoints: this.standardBreakpoints
    };
  }
}

module.exports = ResponsiveDesignValidator;