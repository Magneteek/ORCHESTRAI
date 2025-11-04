const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class CodeQualityValidator extends EventEmitter {
  constructor(orchestrator, mcpIntegrationManager, crystallineMemory) {
    super();
    this.orchestrator = orchestrator;
    this.mcpManager = mcpIntegrationManager;
    this.crystallineMemory = crystallineMemory;
    this.claudeCodeAgent = 'web-frontend-developer';
    
    this.qualityMetrics = {
      codeQuality: { min: 85, target: 95 },
      securityCompliance: { min: 90, target: 100 },
      architectureCompliance: { min: 80, target: 90 }
    };
    
    this.capabilities = [
      'typescript-validation',
      'react-best-practices-checking',
      'security-compliance-validation',
      'code-structure-analysis',
      'component-architecture-validation',
      'performance-code-analysis'
    ];
  }

  async validateCodeQuality(projectPath, validationConfig = {}) {
    try {
      console.log(`💻 Starting code quality validation for: ${projectPath}`);
      
      const {
        includeTypeScriptValidation = true,
        includeReactBestPractices = true,
        includeSecurityCompliance = true,
        includeArchitectureAnalysis = true,
        includePerformanceCodeAnalysis = true,
        customRules = [],
        excludePaths = ['node_modules', 'dist', 'build']
      } = validationConfig;

      const codeValidationResults = {
        projectPath,
        timestamp: Date.now(),
        overallScore: 0,
        results: {}
      };

      // TypeScript Validation
      if (includeTypeScriptValidation) {
        console.log('🔷 Running TypeScript validation...');
        const typeScriptValidation = await this.validateTypeScript(projectPath, excludePaths);
        codeValidationResults.results.typeScript = typeScriptValidation;
      }

      // React Best Practices Analysis
      if (includeReactBestPractices) {
        console.log('⚛️ Analyzing React best practices...');
        const reactAnalysis = await this.analyzeReactBestPractices(projectPath, excludePaths);
        codeValidationResults.results.reactBestPractices = reactAnalysis;
      }

      // Security Compliance Check
      if (includeSecurityCompliance) {
        console.log('🔒 Running security compliance check...');
        const securityAnalysis = await this.validateSecurityCompliance(projectPath, excludePaths);
        codeValidationResults.results.securityCompliance = securityAnalysis;
      }

      // Architecture Analysis
      if (includeArchitectureAnalysis) {
        console.log('🏗️ Analyzing code architecture...');
        const architectureAnalysis = await this.analyzeCodeArchitecture(projectPath, excludePaths);
        codeValidationResults.results.architecture = architectureAnalysis;
      }

      // Performance Code Analysis
      if (includePerformanceCodeAnalysis) {
        console.log('⚡ Analyzing performance implications in code...');
        const performanceAnalysis = await this.analyzePerformanceCode(projectPath, excludePaths);
        codeValidationResults.results.performanceCode = performanceAnalysis;
      }

      // Custom Rules Validation
      if (customRules.length > 0) {
        console.log('📋 Running custom code rules validation...');
        const customRulesResults = await this.validateCustomRules(projectPath, customRules, excludePaths);
        codeValidationResults.results.customRules = customRulesResults;
      }

      // Calculate overall code quality score
      codeValidationResults.overallScore = this.calculateOverallCodeScore(codeValidationResults.results);
      codeValidationResults.qualityGateStatus = this.evaluateQualityGates(codeValidationResults);

      // Store results in crystalline memory
      await this.crystallineMemory.store('web-quality-scores-central', {
        type: 'code-quality-validation',
        agentId: 'web-quality-code-validator',
        projectPath,
        result: codeValidationResults,
        timestamp: Date.now()
      });

      console.log(`✅ Code quality validation completed with score: ${codeValidationResults.overallScore}%`);
      return codeValidationResults;

    } catch (error) {
      console.error('❌ Code quality validation failed:', error);
      throw error;
    }
  }

  async validateTypeScript(projectPath, excludePaths) {
    try {
      const tsFiles = await this.findFiles(projectPath, ['.ts', '.tsx'], excludePaths);
      
      const typeScriptAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'validate-typescript-code',
        projectPath,
        files: tsFiles.slice(0, 50), // Limit to prevent context overflow
        validationPoints: [
          'type-safety',
          'interface-design',
          'generic-usage',
          'strict-mode-compliance',
          'any-type-usage',
          'error-handling-types'
        ],
        includeSuggestions: true
      });

      return {
        totalFiles: tsFiles.length,
        analyzedFiles: Math.min(tsFiles.length, 50),
        typeSafetyScore: typeScriptAnalysis.typeSafety || 0,
        strictModeCompliance: typeScriptAnalysis.strictMode || false,
        anyTypeUsage: typeScriptAnalysis.anyTypeCount || 0,
        interfaceQuality: typeScriptAnalysis.interfaceQuality || 0,
        overallTypeScriptScore: typeScriptAnalysis.overallScore || 0,
        issues: typeScriptAnalysis.issues || [],
        recommendations: typeScriptAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('TypeScript validation failed:', error);
      return { overallTypeScriptScore: 0, error: error.message };
    }
  }

  async analyzeReactBestPractices(projectPath, excludePaths) {
    try {
      const reactFiles = await this.findFiles(projectPath, ['.jsx', '.tsx'], excludePaths);
      
      const reactAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-react-best-practices',
        projectPath,
        files: reactFiles.slice(0, 50),
        analysisPoints: [
          'component-structure',
          'hooks-usage',
          'state-management',
          'props-validation',
          'performance-optimizations',
          'accessibility-practices',
          'testing-patterns'
        ],
        includePerformanceAnalysis: true
      });

      return {
        totalComponents: reactFiles.length,
        analyzedComponents: Math.min(reactFiles.length, 50),
        componentStructureScore: reactAnalysis.componentStructure || 0,
        hooksUsageScore: reactAnalysis.hooksUsage || 0,
        stateManagementScore: reactAnalysis.stateManagement || 0,
        propsValidationScore: reactAnalysis.propsValidation || 0,
        performanceOptimizationScore: reactAnalysis.performanceOptimizations || 0,
        accessibilityScore: reactAnalysis.accessibility || 0,
        overallReactScore: reactAnalysis.overallScore || 0,
        bestPracticeViolations: reactAnalysis.violations || [],
        recommendations: reactAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('React best practices analysis failed:', error);
      return { overallReactScore: 0, error: error.message };
    }
  }

  async validateSecurityCompliance(projectPath, excludePaths) {
    try {
      const allFiles = await this.findFiles(projectPath, ['.js', '.jsx', '.ts', '.tsx'], excludePaths);
      
      const securityAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-security-compliance',
        projectPath,
        files: allFiles.slice(0, 100),
        securityChecks: [
          'xss-vulnerabilities',
          'sql-injection-prevention',
          'authentication-patterns',
          'authorization-checks',
          'data-sanitization',
          'secrets-exposure',
          'dependency-vulnerabilities',
          'csp-compliance'
        ],
        includePackageJsonAnalysis: true
      });

      return {
        overallSecurityScore: securityAnalysis.overallScore || 0,
        xssVulnerabilities: securityAnalysis.xssVulnerabilities || [],
        authenticationIssues: securityAnalysis.authenticationIssues || [],
        dataExposureRisks: securityAnalysis.dataExposure || [],
        dependencyVulnerabilities: securityAnalysis.dependencyVulns || [],
        secretsExposed: securityAnalysis.secretsExposed || [],
        cspCompliance: securityAnalysis.cspCompliance || false,
        criticalIssues: securityAnalysis.criticalIssues || [],
        recommendations: securityAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Security compliance validation failed:', error);
      return { overallSecurityScore: 0, error: error.message };
    }
  }

  async analyzeCodeArchitecture(projectPath, excludePaths) {
    try {
      const allFiles = await this.findFiles(projectPath, ['.js', '.jsx', '.ts', '.tsx'], excludePaths);
      
      const architectureAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-code-architecture',
        projectPath,
        files: allFiles.slice(0, 100),
        analysisPoints: [
          'folder-structure',
          'module-organization',
          'dependency-management',
          'separation-of-concerns',
          'design-patterns',
          'code-reusability',
          'maintainability'
        ],
        includeComplexityAnalysis: true
      });

      return {
        folderStructureScore: architectureAnalysis.folderStructure || 0,
        moduleOrganizationScore: architectureAnalysis.moduleOrganization || 0,
        dependencyManagementScore: architectureAnalysis.dependencyManagement || 0,
        separationOfConcernsScore: architectureAnalysis.separationOfConcerns || 0,
        designPatternsScore: architectureAnalysis.designPatterns || 0,
        codeReusabilityScore: architectureAnalysis.codeReusability || 0,
        maintainabilityScore: architectureAnalysis.maintainability || 0,
        cyclomaticComplexity: architectureAnalysis.cyclomaticComplexity || 0,
        overallArchitectureScore: architectureAnalysis.overallScore || 0,
        architecturalIssues: architectureAnalysis.issues || [],
        recommendations: architectureAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Code architecture analysis failed:', error);
      return { overallArchitectureScore: 0, error: error.message };
    }
  }

  async analyzePerformanceCode(projectPath, excludePaths) {
    try {
      const performanceFiles = await this.findFiles(projectPath, ['.js', '.jsx', '.ts', '.tsx'], excludePaths);
      
      const performanceAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'analyze-performance-code',
        projectPath,
        files: performanceFiles.slice(0, 50),
        performanceChecks: [
          'bundle-size-impact',
          'lazy-loading-implementation',
          'memorization-usage',
          'unnecessary-rerenders',
          'heavy-computation-optimization',
          'image-optimization',
          'api-call-efficiency'
        ],
        includeBundleAnalysis: true
      });

      return {
        bundleSizeImpact: performanceAnalysis.bundleSize || 0,
        lazyLoadingScore: performanceAnalysis.lazyLoading || 0,
        memorizationUsage: performanceAnalysis.memorization || 0,
        rerenderOptimization: performanceAnalysis.rerenderOptimization || 0,
        computationEfficiency: performanceAnalysis.computationEfficiency || 0,
        imageOptimization: performanceAnalysis.imageOptimization || 0,
        apiCallEfficiency: performanceAnalysis.apiCallEfficiency || 0,
        overallPerformanceCodeScore: performanceAnalysis.overallScore || 0,
        performanceIssues: performanceAnalysis.issues || [],
        recommendations: performanceAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Performance code analysis failed:', error);
      return { overallPerformanceCodeScore: 0, error: error.message };
    }
  }

  async validateCustomRules(projectPath, customRules, excludePaths) {
    try {
      const allFiles = await this.findFiles(projectPath, ['.js', '.jsx', '.ts', '.tsx'], excludePaths);
      
      const customRulesAnalysis = await this.orchestrator.delegateToClaudeCode(this.claudeCodeAgent, {
        task: 'validate-custom-code-rules',
        projectPath,
        files: allFiles.slice(0, 50),
        customRules,
        generateViolationReport: true
      });

      return {
        totalRules: customRules.length,
        passedRules: customRulesAnalysis.passedRules || 0,
        failedRules: customRulesAnalysis.failedRules || 0,
        ruleViolations: customRulesAnalysis.violations || [],
        overallCustomRulesScore: customRulesAnalysis.overallScore || 0,
        recommendations: customRulesAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Custom rules validation failed:', error);
      return { overallCustomRulesScore: 0, error: error.message };
    }
  }

  async findFiles(directory, extensions, excludePaths) {
    const foundFiles = [];
    
    try {
      const items = await fs.readdir(directory, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(directory, item.name);
        
        if (excludePaths.some(excludePath => itemPath.includes(excludePath))) {
          continue;
        }
        
        if (item.isDirectory()) {
          const subFiles = await this.findFiles(itemPath, extensions, excludePaths);
          foundFiles.push(...subFiles);
        } else if (extensions.some(ext => item.name.endsWith(ext))) {
          foundFiles.push(itemPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${directory}:`, error.message);
    }
    
    return foundFiles;
  }

  calculateOverallCodeScore(results) {
    const scores = [];
    
    if (results.typeScript) {
      scores.push(results.typeScript.overallTypeScriptScore);
    }
    
    if (results.reactBestPractices) {
      scores.push(results.reactBestPractices.overallReactScore);
    }
    
    if (results.securityCompliance) {
      scores.push(results.securityCompliance.overallSecurityScore);
    }
    
    if (results.architecture) {
      scores.push(results.architecture.overallArchitectureScore);
    }
    
    if (results.performanceCode) {
      scores.push(results.performanceCode.overallPerformanceCodeScore);
    }
    
    if (results.customRules) {
      scores.push(results.customRules.overallCustomRulesScore);
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }

  evaluateQualityGates(codeResults) {
    const gateStatus = {
      codeQualityGate: false,
      securityComplianceGate: false,
      architectureComplianceGate: false,
      overallPassed: false
    };

    const overallScore = codeResults.overallScore;
    
    if (codeResults.results.securityCompliance) {
      gateStatus.securityComplianceGate = codeResults.results.securityCompliance.overallSecurityScore >= this.qualityMetrics.securityCompliance.min;
    }

    if (codeResults.results.architecture) {
      gateStatus.architectureComplianceGate = codeResults.results.architecture.overallArchitectureScore >= this.qualityMetrics.architectureCompliance.min;
    }

    gateStatus.codeQualityGate = overallScore >= this.qualityMetrics.codeQuality.min;
    gateStatus.overallPassed = Object.values(gateStatus).slice(0, -1).every(gate => gate);
    
    return gateStatus;
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
      agentId: 'web-quality-code-validator',
      active: true,
      capabilities: this.capabilities,
      qualityMetrics: this.qualityMetrics,
      mcpIntegration: 'none'
    };
  }
}

module.exports = CodeQualityValidator;