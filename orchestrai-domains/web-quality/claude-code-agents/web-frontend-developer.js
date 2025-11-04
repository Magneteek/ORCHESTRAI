const { Task } = require('../../../orchestrai-shared/utils/task-delegation');
const WebDevLearningFoundation = require('../learning/webdev-learning-foundation');
const ShadCnUIIntegration = require('../../../orchestrai-shared/mcp-servers/shadcn-ui-integration');

class WebFrontendDeveloper {
  constructor(orchestrator, crystallineMemory, learningFoundation = null) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.agentId = 'web-frontend-developer';
    this.specialization = 'frontend-code-quality-and-architecture';
    
    // Initialize WebDev learning integration
    this.webDevLearning = learningFoundation || new WebDevLearningFoundation(crystallineMemory, null);
    
    // Initialize ShadCN UI integration
    this.shadcnUI = new ShadCnUIIntegration();
    this.componentContext = {
      recentQueries: [],
      installedComponents: new Set(),
      projectComponentMappings: new Map()
    };
    
    // Prediction tracking for learning
    this.activePredictions = new Map();
    this.learningMetrics = {
      totalValidations: 0,
      accuratePredictions: 0,
      learningFromOutcomes: 0,
      lastLearningUpdate: Date.now()
    };
    
    this.codeQualityStandards = {
      typescript: ['strict-mode', 'no-any', 'proper-interfaces', 'generic-usage'],
      react: ['hooks-best-practices', 'component-composition', 'state-management', 'performance-optimization'],
      security: ['xss-prevention', 'csrf-protection', 'input-validation', 'secure-storage'],
      architecture: ['separation-of-concerns', 'modularity', 'testability', 'maintainability']
    };

    this.performanceMetrics = {
      bundleSize: { target: '250KB', max: '500KB' },
      firstContentfulPaint: { target: '1.8s', max: '3.0s' },
      largestContentfulPaint: { target: '2.5s', max: '4.0s' },
      cumulativeLayoutShift: { target: '0.1', max: '0.25' }
    };
  }

  // ============ LEARNING-ENHANCED VALIDATION METHODS ============

  async validateTypeScriptCodeWithLearning(projectPath, files, validationPoints) {
    try {
      console.log(`🔷 [Learning Mode] Validating TypeScript code for project: ${projectPath}`);
      
      // Make prediction before validation
      const predictionId = await this.webDevLearning.makePrediction(
        this.agentId,
        'code-quality',
        {
          projectPath,
          files: files.slice(0, 20),
          validationPoints,
          projectType: this.inferProjectType(projectPath),
          complexity: this.estimateComplexity(files.length)
        },
        0.7
      );
      
      // Store prediction for later outcome validation
      this.activePredictions.set(predictionId, {
        type: 'typescript-validation',
        projectPath,
        timestamp: Date.now()
      });
      
      // Perform actual validation
      const analysis = await this.validateTypeScriptCode(projectPath, files, validationPoints);
      
      // Enhanced analysis with learning insights
      const enhancedAnalysis = await this.enhanceAnalysisWithLearning(analysis, projectPath);
      
      // Store enhanced results
      await this.crystallineMemory.storeMemory(
        'webdev-prediction-tracking',
        JSON.stringify({
          type: 'enhanced-typescript-validation',
          agentId: this.agentId,
          predictionId,
          analysis: enhancedAnalysis,
          projectPath,
          learningEnhanced: true,
          timestamp: Date.now()
        }),
        {
          importance: 0.8,
          semantic_tags: ['typescript', 'validation', 'learning-enhanced', 'webdev']
        }
      );

      this.learningMetrics.totalValidations++;
      
      return {
        ...enhancedAnalysis,
        predictionId,
        learningEnhanced: true,
        recordOutcome: (actualResults) => this.recordValidationOutcome(predictionId, actualResults)
      };
      
    } catch (error) {
      console.error('Learning-enhanced TypeScript validation failed:', error);
      // Fallback to standard validation
      return await this.validateTypeScriptCode(projectPath, files, validationPoints);
    }
  }

  async validateTypeScriptCode(projectPath, files, validationPoints) {
    try {
      console.log(`🔷 Validating TypeScript code for project: ${projectPath}`);
      
      const task = new Task({
        prompt: `As a senior TypeScript developer, validate TypeScript code quality and implementation.

PROJECT PATH: ${projectPath}
FILES TO ANALYZE: ${JSON.stringify(files.slice(0, 20), null, 2)} (showing first 20 files)
VALIDATION POINTS: ${validationPoints.join(', ')}

TYPESCRIPT VALIDATION CRITERIA:
- Type safety and strict mode compliance
- Interface design and generic usage effectiveness
- Any type usage minimization
- Proper error handling with typed exceptions
- Module structure and import/export patterns
- TypeScript-specific best practices

SPECIFIC CHECKS:
- tsconfig.json configuration analysis
- Type annotation completeness and appropriateness
- Interface vs type alias usage optimization
- Generic constraint implementation
- Utility type usage and custom type creation
- Compiler error elimination and warning resolution

CODE QUALITY METRICS:
- Type coverage percentage
- Any type usage frequency
- Interface design quality
- Generic usage effectiveness
- Error handling type safety

Provide detailed TypeScript quality assessment with specific improvement recommendations and code examples.`,
        subagent_type: 'general-purpose'
      });

      const typeScriptAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('web-quality-scores-central', {
        type: 'typescript-validation',
        agentId: this.agentId,
        projectPath,
        analysis: typeScriptAnalysis,
        timestamp: Date.now()
      });

      return {
        overallScore: typeScriptAnalysis.overallScore || 0,
        typeSafety: typeScriptAnalysis.typeSafety || 0,
        strictMode: typeScriptAnalysis.strictMode || false,
        anyTypeCount: typeScriptAnalysis.anyTypeCount || 0,
        interfaceQuality: typeScriptAnalysis.interfaceQuality || 0,
        genericUsage: typeScriptAnalysis.genericUsage || 0,
        issues: typeScriptAnalysis.issues || [],
        recommendations: typeScriptAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('TypeScript validation failed:', error);
      throw error;
    }
  }

  async analyzeReactBestPractices(projectPath, files, analysisPoints) {
    try {
      const task = new Task({
        prompt: `Analyze React best practices implementation for the project.

PROJECT PATH: ${projectPath}
REACT FILES: ${JSON.stringify(files.slice(0, 20), null, 2)} (showing first 20 files)
ANALYSIS POINTS: ${analysisPoints.join(', ')}

REACT BEST PRACTICES EVALUATION:
- Component architecture and composition patterns
- Hooks usage and custom hook implementation
- State management strategy and implementation
- Props validation and TypeScript integration
- Performance optimization techniques
- Testing patterns and coverage

COMPONENT ANALYSIS:
- Single responsibility principle adherence
- Component composition vs inheritance
- Prop drilling prevention and context usage
- Component lifecycle optimization
- Memoization and performance optimization

HOOKS ANALYSIS:
- Built-in hooks usage effectiveness (useState, useEffect, useContext)
- Custom hooks design and reusability
- Dependency array optimization in useEffect
- Performance hooks usage (useMemo, useCallback)
- Hooks rules compliance

STATE MANAGEMENT:
- Local vs global state decisions
- State lifting and sharing strategies
- Redux/Zustand/Context API implementation
- Immutability practices
- Side effect management

PERFORMANCE OPTIMIZATION:
- React.memo usage and effectiveness
- Code splitting and lazy loading implementation
- Bundle size optimization strategies
- Render optimization techniques

Provide comprehensive React quality assessment with specific code improvements.`,
        subagent_type: 'general-purpose'
      });

      const reactAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        overallScore: reactAnalysis.overallScore || 0,
        componentStructure: reactAnalysis.componentStructure || 0,
        hooksUsage: reactAnalysis.hooksUsage || 0,
        stateManagement: reactAnalysis.stateManagement || 0,
        propsValidation: reactAnalysis.propsValidation || 0,
        performanceOptimizations: reactAnalysis.performanceOptimizations || 0,
        accessibility: reactAnalysis.accessibility || 0,
        violations: reactAnalysis.violations || [],
        recommendations: reactAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('React best practices analysis failed:', error);
      throw error;
    }
  }

  async analyzeSecurityCompliance(projectPath, files, securityChecks) {
    try {
      const task = new Task({
        prompt: `Analyze security compliance for frontend code implementation.

PROJECT PATH: ${projectPath}
FILES: ${JSON.stringify(files.slice(0, 30), null, 2)} (showing first 30 files)
SECURITY CHECKS: ${securityChecks.join(', ')}

FRONTEND SECURITY ANALYSIS:
- XSS vulnerability prevention
- CSRF protection implementation
- Input validation and sanitization
- Secure data storage practices
- Authentication and authorization patterns
- Dependency vulnerability assessment

XSS PREVENTION:
- React JSX automatic escaping utilization
- dangerouslySetInnerHTML usage audit
- User input handling and sanitization
- URL parameter validation
- Dynamic content rendering security

AUTHENTICATION & AUTHORIZATION:
- JWT token storage and handling
- Session management security
- Protected route implementation
- Role-based access control
- Logout and session cleanup

DATA PROTECTION:
- Sensitive data exposure prevention
- Local/session storage security
- API key and secret management
- Environment variable usage
- Client-side data encryption

DEPENDENCY SECURITY:
- npm audit results analysis
- Outdated package identification
- Known vulnerability assessment
- Supply chain security evaluation

CSP & SECURITY HEADERS:
- Content Security Policy implementation
- Security header configuration
- Mixed content prevention
- Clickjacking protection

Generate comprehensive security assessment with prioritized remediation plan.`,
        subagent_type: 'general-purpose'
      });

      const securityAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('web-quality-scores-central', {
        type: 'security-compliance-analysis',
        agentId: this.agentId,
        projectPath,
        analysis: securityAnalysis,
        timestamp: Date.now()
      });

      return {
        overallScore: securityAnalysis.overallScore || 0,
        xssVulnerabilities: securityAnalysis.xssVulnerabilities || [],
        authenticationIssues: securityAnalysis.authenticationIssues || [],
        dataExposure: securityAnalysis.dataExposure || [],
        dependencyVulns: securityAnalysis.dependencyVulns || [],
        secretsExposed: securityAnalysis.secretsExposed || [],
        cspCompliance: securityAnalysis.cspCompliance || false,
        criticalIssues: securityAnalysis.criticalIssues || [],
        recommendations: securityAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Security compliance analysis failed:', error);
      throw error;
    }
  }

  async analyzeCodeArchitecture(projectPath, files, analysisPoints) {
    try {
      const task = new Task({
        prompt: `Analyze code architecture and maintainability for the frontend project.

PROJECT PATH: ${projectPath}
FILES: ${JSON.stringify(files.slice(0, 30), null, 2)} (showing first 30 files)
ANALYSIS POINTS: ${analysisPoints.join(', ')}

CODE ARCHITECTURE EVALUATION:
- Folder structure organization and scalability
- Module organization and dependency management
- Separation of concerns implementation
- Design pattern usage and appropriateness
- Code reusability and maintainability
- Testing architecture and coverage

FOLDER STRUCTURE ANALYSIS:
- Feature-based vs layer-based organization
- Component hierarchy and nesting
- Utility and helper function organization
- Asset and resource management
- Configuration file organization

MODULE ORGANIZATION:
- Import/export patterns and barrel exports
- Circular dependency detection
- Module coupling and cohesion
- Dead code identification
- Bundle splitting strategy

DESIGN PATTERNS:
- Component patterns (HOC, render props, compound components)
- State management patterns
- Error handling patterns
- Data fetching patterns
- Testing patterns

MAINTAINABILITY METRICS:
- Cyclomatic complexity analysis
- Code duplication assessment
- Function and component size evaluation
- Naming convention consistency
- Documentation completeness

SCALABILITY CONSIDERATIONS:
- Architecture flexibility for growth
- Performance implications of current structure
- Refactoring difficulty assessment
- New feature integration complexity

Provide detailed architecture assessment with modernization roadmap.`,
        subagent_type: 'general-purpose'
      });

      const architectureAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        folderStructure: architectureAnalysis.folderStructure || 0,
        moduleOrganization: architectureAnalysis.moduleOrganization || 0,
        dependencyManagement: architectureAnalysis.dependencyManagement || 0,
        separationOfConcerns: architectureAnalysis.separationOfConcerns || 0,
        designPatterns: architectureAnalysis.designPatterns || 0,
        codeReusability: architectureAnalysis.codeReusability || 0,
        maintainability: architectureAnalysis.maintainability || 0,
        cyclomaticComplexity: architectureAnalysis.cyclomaticComplexity || 0,
        overallScore: architectureAnalysis.overallScore || 0,
        issues: architectureAnalysis.issues || [],
        recommendations: architectureAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Code architecture analysis failed:', error);
      throw error;
    }
  }

  async analyzePerformanceCode(projectPath, files, performanceChecks) {
    try {
      const task = new Task({
        prompt: `Analyze performance implications in frontend code implementation.

PROJECT PATH: ${projectPath}
FILES: ${JSON.stringify(files.slice(0, 20), null, 2)} (showing first 20 files)
PERFORMANCE CHECKS: ${performanceChecks.join(', ')}

PERFORMANCE METRICS: ${JSON.stringify(this.performanceMetrics, null, 2)}

CODE PERFORMANCE ANALYSIS:
- Bundle size impact and optimization opportunities
- Lazy loading and code splitting implementation
- Memoization usage and effectiveness
- Unnecessary re-rendering prevention
- Heavy computation optimization
- Image and asset optimization strategies

BUNDLE OPTIMIZATION:
- Webpack bundle analysis and splitting
- Tree shaking effectiveness
- Dead code elimination
- Dynamic import usage
- Vendor chunk optimization

REACT PERFORMANCE:
- Component re-rendering analysis
- useMemo and useCallback usage effectiveness
- React.memo implementation
- Context optimization and value stability
- List rendering optimization (keys, virtualization)

LOADING PERFORMANCE:
- Critical resource prioritization
- Preloading and prefetching strategies
- Font loading optimization
- Image lazy loading implementation
- Service worker caching strategies

RUNTIME PERFORMANCE:
- JavaScript execution optimization
- DOM manipulation efficiency
- Event handler optimization
- Memory leak prevention
- Animation performance

API PERFORMANCE:
- Request batching and caching
- Optimistic updates implementation
- Error boundary performance impact
- Data fetching strategy optimization

Generate performance assessment with specific optimization recommendations and expected impact.`,
        subagent_type: 'general-purpose'
      });

      const performanceAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        bundleSize: performanceAnalysis.bundleSize || 0,
        lazyLoading: performanceAnalysis.lazyLoading || 0,
        memorization: performanceAnalysis.memorization || 0,
        rerenderOptimization: performanceAnalysis.rerenderOptimization || 0,
        computationEfficiency: performanceAnalysis.computationEfficiency || 0,
        imageOptimization: performanceAnalysis.imageOptimization || 0,
        apiCallEfficiency: performanceAnalysis.apiCallEfficiency || 0,
        overallScore: performanceAnalysis.overallScore || 0,
        issues: performanceAnalysis.issues || [],
        recommendations: performanceAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Performance code analysis failed:', error);
      throw error;
    }
  }

  async validateCustomCodeRules(projectPath, files, customRules) {
    try {
      const task = new Task({
        prompt: `Validate custom code rules and conventions for the project.

PROJECT PATH: ${projectPath}
FILES: ${JSON.stringify(files.slice(0, 20), null, 2)} (showing first 20 files)
CUSTOM RULES: ${JSON.stringify(customRules, null, 2)}

CUSTOM RULE VALIDATION:
- Apply project-specific coding standards
- Validate naming conventions
- Check architectural constraints
- Verify documentation requirements
- Assess custom linting rules compliance

RULE CATEGORIES:
- Naming conventions (files, functions, components, variables)
- Code organization standards
- Import/export conventions
- Comment and documentation requirements
- Testing requirements
- Performance guidelines

VALIDATION PROCESS:
- Parse custom rules and requirements
- Scan code files for compliance
- Identify violations and non-compliance
- Generate violation reports with file locations
- Provide specific remediation guidance

REPORTING:
- Violation severity classification
- File-by-file compliance analysis
- Rule-by-rule compliance statistics
- Improvement recommendations
- Automation opportunities for rule enforcement

Generate comprehensive custom rule validation report with actionable remediation plan.`,
        subagent_type: 'general-purpose'
      });

      const customRulesAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        totalRules: customRules.length,
        passedRules: customRulesAnalysis.passedRules || 0,
        failedRules: customRulesAnalysis.failedRules || 0,
        violations: customRulesAnalysis.violations || [],
        overallScore: customRulesAnalysis.overallScore || 0,
        recommendations: customRulesAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Custom rules validation failed:', error);
      throw error;
    }
  }

  // ============ LEARNING SUPPORT METHODS ============

  async enhanceAnalysisWithLearning(analysis, projectPath) {
    try {
      // Retrieve similar project patterns from crystalline memory
      const similarProjects = await this.crystallineMemory.retrieveMemory(
        `typescript validation ${this.inferProjectType(projectPath)}`,
        'webdev-prediction-tracking',
        5
      );

      // Extract learning insights
      const learningInsights = await this.extractLearningInsights(similarProjects, analysis);
      
      return {
        ...analysis,
        learningInsights,
        confidenceScore: this.calculateConfidenceScore(analysis, learningInsights),
        improvementSuggestions: await this.generateImprovementSuggestions(analysis, learningInsights),
        historicalComparison: this.compareWithHistoricalData(analysis, similarProjects)
      };
    } catch (error) {
      console.error('Error enhancing analysis with learning:', error);
      return analysis;
    }
  }

  async extractLearningInsights(similarProjects, currentAnalysis) {
    const insights = {
      patternMatches: [],
      riskFactors: [],
      successPredictors: [],
      recommendedFocus: []
    };

    for (const project of similarProjects.results || []) {
      try {
        const projectData = JSON.parse(project.content);
        
        if (projectData.analysis?.overallScore) {
          if (projectData.analysis.overallScore > 80) {
            insights.successPredictors.push({
              pattern: projectData.analysis.issues?.length < 3 ? 'low-issue-count' : 'effective-resolution',
              score: projectData.analysis.overallScore
            });
          }
          
          if (projectData.analysis.overallScore < 60) {
            insights.riskFactors.push({
              pattern: projectData.analysis.issues?.length > 10 ? 'high-issue-count' : 'quality-concerns',
              score: projectData.analysis.overallScore
            });
          }
        }
      } catch (error) {
        console.warn('Error parsing historical project data:', error);
      }
    }

    // Add focus recommendations based on current analysis
    if (currentAnalysis.typeSafety < 70) {
      insights.recommendedFocus.push('type-safety-improvement');
    }
    if (currentAnalysis.anyTypeCount > 10) {
      insights.recommendedFocus.push('any-type-reduction');
    }
    
    return insights;
  }

  calculateConfidenceScore(analysis, learningInsights) {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence if we have historical success patterns
    if (learningInsights.successPredictors.length > 0) {
      confidence += 0.3;
    }
    
    // Lower confidence if we have risk factors
    if (learningInsights.riskFactors.length > 0) {
      confidence -= 0.2;
    }
    
    // Adjust based on analysis completeness
    if (analysis.overallScore && analysis.typeSafety && analysis.interfaceQuality) {
      confidence += 0.2;
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  async generateImprovementSuggestions(analysis, learningInsights) {
    const suggestions = [];
    
    // Learning-based suggestions
    if (learningInsights.riskFactors.length > 0) {
      suggestions.push({
        type: 'risk-mitigation',
        priority: 'high',
        description: 'Historical data suggests high risk of quality issues. Focus on comprehensive testing.',
        basedOn: 'historical-patterns'
      });
    }
    
    if (learningInsights.successPredictors.length > 0) {
      suggestions.push({
        type: 'success-reinforcement',
        priority: 'medium',
        description: 'Project shows patterns similar to successful implementations. Continue current approach.',
        basedOn: 'success-patterns'
      });
    }
    
    // Analysis-based suggestions
    if (analysis.anyTypeCount > 5) {
      suggestions.push({
        type: 'type-safety',
        priority: 'high',
        description: `Reduce any type usage (currently ${analysis.anyTypeCount}). Target: < 3 instances.`,
        basedOn: 'current-analysis'
      });
    }
    
    return suggestions;
  }

  compareWithHistoricalData(analysis, similarProjects) {
    const comparison = {
      betterThanAverage: false,
      historicalAverage: 0,
      trendAnalysis: 'stable'
    };
    
    if (similarProjects.results && similarProjects.results.length > 0) {
      let totalScore = 0;
      let count = 0;
      
      for (const project of similarProjects.results) {
        try {
          const projectData = JSON.parse(project.content);
          if (projectData.analysis?.overallScore) {
            totalScore += projectData.analysis.overallScore;
            count++;
          }
        } catch (error) {
          // Skip malformed data
        }
      }
      
      if (count > 0) {
        comparison.historicalAverage = totalScore / count;
        comparison.betterThanAverage = (analysis.overallScore || 0) > comparison.historicalAverage;
        
        // Simple trend analysis
        if ((analysis.overallScore || 0) > comparison.historicalAverage + 10) {
          comparison.trendAnalysis = 'improving';
        } else if ((analysis.overallScore || 0) < comparison.historicalAverage - 10) {
          comparison.trendAnalysis = 'declining';
        }
      }
    }
    
    return comparison;
  }

  async recordValidationOutcome(predictionId, actualResults) {
    try {
      const accuracy = await this.webDevLearning.recordActualOutcome(predictionId, actualResults);
      
      this.learningMetrics.learningFromOutcomes++;
      if (accuracy > 0.7) {
        this.learningMetrics.accuratePredictions++;
      }
      
      console.log(`📚 Learning outcome recorded: ${predictionId} (accuracy: ${(accuracy * 100).toFixed(1)}%)`);
      
      return accuracy;
    } catch (error) {
      console.error('Error recording validation outcome:', error);
      return 0;
    }
  }

  inferProjectType(projectPath) {
    if (projectPath.includes('react') || projectPath.includes('tsx')) return 'react';
    if (projectPath.includes('next')) return 'nextjs';
    if (projectPath.includes('vue')) return 'vue';
    if (projectPath.includes('angular')) return 'angular';
    return 'typescript';
  }

  estimateComplexity(fileCount) {
    if (fileCount < 10) return 'low';
    if (fileCount < 50) return 'medium';
    if (fileCount < 200) return 'high';
    return 'very-high';
  }

  // ============ SHADCN COMPONENT INTELLIGENCE METHODS ============

  async initializeShadCnIntegration() {
    try {
      console.log('🎨 Initializing ShadCN UI integration for WebFrontendDeveloper...');
      const result = await this.shadcnUI.initialize();
      
      if (result.success) {
        console.log('✅ ShadCN UI integration ready');
        return result;
      } else {
        console.warn('⚠️  ShadCN UI integration failed, continuing without component intelligence');
        return result;
      }
    } catch (error) {
      console.error('❌ ShadCN integration initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeReactComponentsWithShadCN(projectPath, files, analysisPoints) {
    try {
      console.log('🎨 Analyzing React components with ShadCN intelligence...');
      
      // Initialize ShadCN if not already done
      if (!this.shadcnUI.isConnected) {
        await this.initializeShadCnIntegration();
      }

      // Analyze existing components for ShadCN usage
      const componentAnalysis = await this.analyzeExistingComponents(files);
      
      // Get component recommendations based on project context
      const recommendations = await this.shadcnUI.getComponentRecommendations({
        content: files.join(' '),
        purpose: this.inferProjectPurpose(projectPath),
        target: 'frontend-development'
      });

      const task = new Task({
        prompt: `Analyze React components with ShadCN UI component intelligence and best practices.

PROJECT PATH: ${projectPath}
REACT FILES: ${JSON.stringify(files.slice(0, 20), null, 2)} (showing first 20 files)
ANALYSIS POINTS: ${analysisPoints.join(', ')}

EXISTING COMPONENT ANALYSIS: ${JSON.stringify(componentAnalysis, null, 2)}
SHADCN RECOMMENDATIONS: ${JSON.stringify(recommendations, null, 2)}

ENHANCED REACT + SHADCN ANALYSIS:
- Current ShadCN component usage and implementation quality
- Component consistency with ShadCN design system
- Proper usage of ShadCN variants, sizes, and props
- Integration with Tailwind CSS and design tokens
- Accessibility compliance through ShadCN primitives
- Performance implications of current component choices

SHADCN COMPONENT QUALITY ASSESSMENT:
- Correct component imports and usage patterns
- Proper variant and size prop utilization
- Consistency with ShadCN design system principles
- Custom component integration with ShadCN base components
- Theme and styling consistency across components

COMPONENT OPTIMIZATION OPPORTUNITIES:
- Missing ShadCN components that could improve functionality
- Over-engineered custom components that ShadCN could replace
- Inconsistent styling that ShadCN components could standardize
- Accessibility improvements available through ShadCN primitives
- Performance optimizations through ShadCN's optimized implementations

INTEGRATION RECOMMENDATIONS:
- Specific ShadCN components to add for better UX
- Custom components to replace with ShadCN alternatives
- Styling inconsistencies to resolve with ShadCN design tokens
- Architecture improvements for better component composition

Generate comprehensive React + ShadCN analysis with specific component recommendations and implementation examples.`,
        subagent_type: 'general-purpose'
      });

      const enhancedAnalysis = await this.orchestrator.delegateTask(task);
      
      // Store ShadCN-enhanced analysis in crystalline memory
      await this.crystallineMemory.store('shadcn-component-analysis', {
        type: 'react-shadcn-analysis',
        agentId: this.agentId,
        projectPath,
        componentAnalysis,
        recommendations: recommendations.recommendations,
        enhancedAnalysis,
        timestamp: Date.now()
      });

      // Track component queries for learning
      this.componentContext.recentQueries.push({
        type: 'component-analysis',
        projectPath,
        timestamp: Date.now(),
        recommendationCount: recommendations.count
      });

      return {
        ...enhancedAnalysis,
        shadcnIntegration: {
          componentAnalysis,
          recommendations: recommendations.recommendations,
          optimizationOpportunities: enhancedAnalysis.optimizationOpportunities || []
        },
        componentIntelligence: true
      };
    } catch (error) {
      console.error('ShadCN-enhanced component analysis failed:', error);
      // Fallback to standard analysis
      return await this.analyzeReactBestPractices(projectPath, files, analysisPoints);
    }
  }

  async generateComponentRecommendations(context, requirements) {
    try {
      console.log('💡 Generating ShadCN component recommendations...');
      
      if (!this.shadcnUI.isConnected) {
        await this.initializeShadCnIntegration();
      }

      // Get recommendations from ShadCN MCP
      const mcpRecommendations = await this.shadcnUI.getComponentRecommendations(context);
      
      // Enhanced recommendations based on ORCHESTRAI intelligence
      const enhancedRecommendations = await this.enhanceRecommendationsWithContext(
        mcpRecommendations,
        context,
        requirements
      );

      // Store recommendations in crystalline memory
      await this.crystallineMemory.store('component-recommendations', {
        context,
        requirements,
        recommendations: enhancedRecommendations,
        agentId: this.agentId,
        timestamp: Date.now()
      });

      return enhancedRecommendations;
    } catch (error) {
      console.error('Component recommendation generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async installRecommendedComponents(projectPath, components, framework = 'react') {
    try {
      console.log(`📦 Installing recommended ShadCN components to ${projectPath}...`);
      
      const installationResults = [];
      
      for (const component of components) {
        const result = await this.shadcnUI.installComponent(component, projectPath, framework);
        installationResults.push({
          component,
          success: result.success,
          files: result.files || [],
          error: result.error
        });

        if (result.success) {
          this.componentContext.installedComponents.add(component);
          
          // Track in project mapping
          if (!this.componentContext.projectComponentMappings.has(projectPath)) {
            this.componentContext.projectComponentMappings.set(projectPath, new Set());
          }
          this.componentContext.projectComponentMappings.get(projectPath).add(component);
        }
      }

      // Store installation history
      await this.crystallineMemory.store('component-installations', {
        projectPath,
        components,
        framework,
        results: installationResults,
        agentId: this.agentId,
        timestamp: Date.now()
      });

      console.log(`✅ Component installation complete. Success: ${installationResults.filter(r => r.success).length}/${installationResults.length}`);
      
      return {
        success: true,
        installationResults,
        successCount: installationResults.filter(r => r.success).length,
        totalCount: installationResults.length
      };
    } catch (error) {
      console.error('Component installation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async queryComponentsWithNaturalLanguage(query, framework = 'react') {
    try {
      console.log(`🔍 Querying components: "${query}"`);
      
      if (!this.shadcnUI.isConnected) {
        await this.initializeShadCnIntegration();
      }

      const queryResult = await this.shadcnUI.queryComponents(query, framework);
      
      // Track query for learning
      this.componentContext.recentQueries.push({
        query,
        framework,
        timestamp: Date.now(),
        resultCount: queryResult.count || 0
      });

      // Store query and results in memory
      await this.crystallineMemory.store('component-queries', {
        query,
        framework,
        results: queryResult,
        agentId: this.agentId,
        timestamp: Date.now()
      });

      return queryResult;
    } catch (error) {
      console.error('Component query failed:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeExistingComponents(files) {
    const componentUsage = {
      shadcnComponents: [],
      customComponents: [],
      missingOpportunities: [],
      inconsistencies: []
    };

    // Simple analysis of imports and usage patterns
    for (const file of files.slice(0, 10)) { // Analyze first 10 files
      try {
        if (file.includes('from "@/components/ui/')) {
          const componentMatch = file.match(/import\s+.*\s+from\s+"@\/components\/ui\/(.+?)"/g);
          if (componentMatch) {
            componentMatch.forEach(match => {
              const component = match.match(/ui\/(.+?)"/)?.[1];
              if (component) {
                componentUsage.shadcnComponents.push(component);
              }
            });
          }
        }
      } catch (error) {
        console.warn('Error analyzing file for components:', error);
      }
    }

    return componentUsage;
  }

  async enhanceRecommendationsWithContext(mcpRecommendations, context, requirements) {
    const enhanced = {
      ...mcpRecommendations,
      contextualPriority: [],
      implementationGuidance: [],
      integrationConsiderations: []
    };

    // Add contextual priority based on ORCHESTRAI intelligence
    if (mcpRecommendations.recommendations) {
      for (const rec of mcpRecommendations.recommendations) {
        let priority = 'medium';
        let guidance = '';

        // Context-based priority adjustment
        if (context.content?.includes('form') && rec.component === 'input') {
          priority = 'high';
          guidance = 'Forms are central to this project. Input component is essential for user data collection.';
        } else if (context.purpose === 'dashboard' && rec.component === 'card') {
          priority = 'high';  
          guidance = 'Dashboard layouts rely heavily on card components for information organization.';
        }

        enhanced.contextualPriority.push({
          component: rec.component,
          priority,
          reason: rec.reason,
          contextualGuidance: guidance
        });
      }
    }

    return enhanced;
  }

  inferProjectPurpose(projectPath) {
    if (projectPath.includes('dashboard')) return 'analytics';
    if (projectPath.includes('admin')) return 'administration';
    if (projectPath.includes('shop') || projectPath.includes('ecommerce')) return 'e-commerce';
    if (projectPath.includes('blog')) return 'content';
    if (projectPath.includes('landing')) return 'marketing';
    return 'web-application';
  }

  getShadCnIntegrationStats() {
    return {
      isConnected: this.shadcnUI.isConnected,
      recentQueries: this.componentContext.recentQueries.length,
      installedComponents: this.componentContext.installedComponents.size,
      projectMappings: this.componentContext.projectComponentMappings.size,
      mcpStats: this.shadcnUI.getUsageStats()
    };
  }

  // Enhanced capabilities with learning
  getCapabilities() {
    return {
      agentId: this.agentId,
      specialization: this.specialization,
      codeQualityStandards: this.codeQualityStandards,
      performanceMetrics: this.performanceMetrics,
      learningEnabled: true,
      learningMetrics: this.learningMetrics,
      capabilities: [
        'typescript-code-validation',
        'typescript-code-validation-with-learning', // New learning-enhanced method
        'react-best-practices-analysis',
        'react-components-with-shadcn-analysis', // New ShadCN-enhanced method
        'security-compliance-assessment',
        'code-architecture-evaluation',
        'performance-code-analysis',
        'custom-rules-validation',
        'component-recommendations-generation', // New ShadCN capability
        'natural-language-component-queries', // New ShadCN capability
        'automated-component-installation', // New ShadCN capability
        'shadcn-design-system-integration', // New ShadCN capability
        'prediction-accuracy-tracking', // New capability
        'historical-pattern-analysis' // New capability
      ]
    };
  }

  getStatus() {
    return {
      agentId: this.agentId,
      type: 'claude-code-agent',
      specialization: this.specialization,
      active: true,
      lastActivity: Date.now()
    };
  }
}

module.exports = WebFrontendDeveloper;