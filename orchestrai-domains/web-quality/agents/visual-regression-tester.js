const EventEmitter = require('events');

class VisualRegressionTester extends EventEmitter {
  constructor(orchestrator, mcpIntegrationManager, crystallineMemory) {
    super();
    this.orchestrator = orchestrator;
    this.mcpManager = mcpIntegrationManager;
    this.crystallineMemory = crystallineMemory;
    this.claudeCodeAgent = 'web-visual-design-agent';
    
    this.qualityMetrics = {
      visualAccuracy: { min: 95, target: 99 },
      brandCompliance: { min: 90, target: 100 },
      layoutConsistency: { min: 85, target: 95 }
    };
    
    this.capabilities = [
      'design-implementation-comparison',
      'layout-validation',
      'brand-compliance-checking',
      'visual-consistency-validation',
      'pixel-perfect-testing',
      'design-system-compliance'
    ];
  }

  async validateVisualImplementation(url, validationConfig = {}) {
    try {
      console.log(`🎨 Starting visual regression testing for: ${url}`);
      
      const {
        designMockups = [],
        tolerance = 0.05,
        includeBrandCompliance = true,
        includeLayoutValidation = true,
        designSystemRules = [],
        breakpoints = [320, 768, 1024, 1440, 1920]
      } = validationConfig;

      const visualValidationResults = {
        url,
        timestamp: Date.now(),
        overallScore: 0,
        results: {}
      };

      // Screenshot-based Visual Regression Testing
      if (designMockups.length > 0) {
        console.log('📸 Running visual regression comparisons...');
        const regressionResults = [];
        
        for (const mockup of designMockups) {
          const screenshot = await this.mcpManager.executeCapability('visual-regression-testing', {
            url,
            baseline: mockup.baselineImage,
            tolerance: tolerance
          });
          
          const comparison = await this.mcpManager.executeCapability('visual-regression-testing', {
            url,
            baseline: mockup.baselineImage,
            tolerance: tolerance
          });
          
          regressionResults.push({
            mockupName: mockup.name,
            breakpoint: mockup.breakpoint || 'desktop',
            pixelDifference: comparison.pixelDifference || 0,
            percentageDifference: comparison.percentageDifference || 0,
            passed: comparison.passed || false,
            diffImage: comparison.diffImage
          });
        }
        
        const avgVisualAccuracy = regressionResults.length > 0 ? 
          (regressionResults.filter(r => r.passed).length / regressionResults.length) * 100 : 0;
        
        visualValidationResults.results.visualRegression = {
          overallAccuracy: avgVisualAccuracy,
          comparisons: regressionResults,
          meetsTargetAccuracy: avgVisualAccuracy >= this.qualityMetrics.visualAccuracy.min
        };
      }

      // Brand Compliance Analysis via Claude Code
      if (includeBrandCompliance) {
        console.log('🏷️ Analyzing brand compliance...');
        const brandAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
          task: 'analyze-brand-compliance',
          url,
          brandGuidelines: validationConfig.brandGuidelines || {},
          checkElements: ['colors', 'typography', 'spacing', 'imagery', 'iconography'],
          captureScreenshot: true
        });
        
        visualValidationResults.results.brandCompliance = {
          overallScore: brandAnalysis.complianceScore || 0,
          colorCompliance: brandAnalysis.colors || {},
          typographyCompliance: brandAnalysis.typography || {},
          spacingCompliance: brandAnalysis.spacing || {},
          violations: brandAnalysis.violations || [],
          meetsBrandStandards: (brandAnalysis.complianceScore || 0) >= this.qualityMetrics.brandCompliance.min
        };
      }

      // Layout Consistency Validation
      if (includeLayoutValidation) {
        console.log('📐 Validating layout consistency...');
        const layoutResults = [];
        
        for (const breakpoint of breakpoints) {
          const layoutValidation = await this.analyzeLayoutConsistency(url, breakpoint);
          layoutResults.push(layoutValidation);
        }
        
        const avgLayoutConsistency = layoutResults.reduce((sum, result) => sum + (result.consistencyScore || 0), 0) / layoutResults.length;
        
        visualValidationResults.results.layoutConsistency = {
          overallConsistency: avgLayoutConsistency,
          breakpointResults: layoutResults,
          meetsConsistencyStandards: avgLayoutConsistency >= this.qualityMetrics.layoutConsistency.min
        };
      }

      // Design System Compliance
      if (designSystemRules.length > 0) {
        console.log('🎯 Checking design system compliance...');
        const designSystemCompliance = await this.validateDesignSystemCompliance(url, designSystemRules);
        visualValidationResults.results.designSystem = designSystemCompliance;
      }

      // Calculate overall visual quality score
      visualValidationResults.overallScore = this.calculateOverallVisualScore(visualValidationResults.results);
      visualValidationResults.qualityGateStatus = this.evaluateQualityGates(visualValidationResults);

      // Store results in crystalline memory
      await this.crystallineMemory.store('visual-regression-history', {
        type: 'visual-validation',
        agentId: 'web-quality-visual-regression-tester',
        url,
        result: visualValidationResults,
        timestamp: Date.now()
      });

      console.log(`✅ Visual regression testing completed with score: ${visualValidationResults.overallScore}%`);
      return visualValidationResults;

    } catch (error) {
      console.error('❌ Visual regression testing failed:', error);
      throw error;
    }
  }

  async analyzeLayoutConsistency(url, breakpoint) {
    try {
      // Take screenshot at specific breakpoint
      const screenshot = await this.mcpManager.executeCapability('visual-regression-testing', {
        url,
        options: {
          width: breakpoint,
          height: breakpoint < 768 ? 1200 : 1080,
          deviceType: breakpoint < 768 ? 'mobile' : breakpoint < 1024 ? 'tablet' : 'desktop'
        }
      });

      // Analyze layout via Claude Code
      const layoutAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-layout-consistency',
        screenshot: screenshot.data,
        breakpoint,
        analysisPoints: [
          'grid-alignment',
          'spacing-consistency',
          'element-proportions',
          'content-hierarchy',
          'visual-balance'
        ]
      });

      return {
        breakpoint,
        deviceType: breakpoint < 768 ? 'mobile' : breakpoint < 1024 ? 'tablet' : 'desktop',
        consistencyScore: layoutAnalysis.consistencyScore || 0,
        gridAlignment: layoutAnalysis.gridAlignment || {},
        spacingConsistency: layoutAnalysis.spacing || {},
        visualBalance: layoutAnalysis.balance || {},
        issues: layoutAnalysis.issues || []
      };
    } catch (error) {
      console.error(`Layout consistency analysis failed for breakpoint ${breakpoint}:`, error);
      return {
        breakpoint,
        consistencyScore: 0,
        error: error.message
      };
    }
  }

  async validateDesignSystemCompliance(url, designSystemRules) {
    try {
      const complianceResults = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'validate-design-system-compliance',
        url,
        designSystemRules,
        checkComponents: true,
        checkTokens: true,
        generateReport: true
      });

      return {
        overallCompliance: complianceResults.complianceScore || 0,
        componentCompliance: complianceResults.components || {},
        tokenCompliance: complianceResults.tokens || {},
        violations: complianceResults.violations || [],
        recommendations: complianceResults.recommendations || []
      };
    } catch (error) {
      console.error('Design system compliance validation failed:', error);
      return {
        overallCompliance: 0,
        error: error.message
      };
    }
  }

  calculateOverallVisualScore(results) {
    const scores = [];
    
    if (results.visualRegression) {
      scores.push(results.visualRegression.overallAccuracy);
    }
    
    if (results.brandCompliance) {
      scores.push(results.brandCompliance.overallScore);
    }
    
    if (results.layoutConsistency) {
      scores.push(results.layoutConsistency.overallConsistency);
    }
    
    if (results.designSystem) {
      scores.push(results.designSystem.overallCompliance);
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  evaluateQualityGates(visualResults) {
    const gateStatus = {
      visualAccuracyGate: false,
      brandComplianceGate: false,
      layoutConsistencyGate: false,
      overallPassed: false
    };

    if (visualResults.results.visualRegression) {
      gateStatus.visualAccuracyGate = visualResults.results.visualRegression.overallAccuracy >= this.qualityMetrics.visualAccuracy.min;
    }

    if (visualResults.results.brandCompliance) {
      gateStatus.brandComplianceGate = visualResults.results.brandCompliance.overallScore >= this.qualityMetrics.brandCompliance.min;
    }

    if (visualResults.results.layoutConsistency) {
      gateStatus.layoutConsistencyGate = visualResults.results.layoutConsistency.overallConsistency >= this.qualityMetrics.layoutConsistency.min;
    }

    gateStatus.overallPassed = Object.values(gateStatus).slice(0, -1).every(gate => gate);
    return gateStatus;
  }

  async generateVisualQualityReport(url, validationResults) {
    try {
      const report = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'generate-visual-quality-report',
        url,
        validationResults,
        includeScreenshots: true,
        includeRecommendations: true,
        reportFormat: 'comprehensive'
      });

      await this.crystallineMemory.store('visual-regression-history', {
        type: 'visual-quality-report',
        url,
        report,
        timestamp: Date.now()
      });

      return report;
    } catch (error) {
      console.error('Visual quality report generation failed:', error);
      throw error;
    }
  }

  async getQualityMetrics() {
    return {
      metrics: this.qualityMetrics,
      capabilities: this.capabilities,
      claudeCodeAgent: this.claudeCodeAgent
    };
  }

  getStatus() {
    return {
      agentId: 'web-quality-visual-regression-tester',
      active: true,
      capabilities: this.capabilities,
      qualityMetrics: this.qualityMetrics,
      mcpIntegration: 'browser-mcp'
    };
  }
}

module.exports = VisualRegressionTester;