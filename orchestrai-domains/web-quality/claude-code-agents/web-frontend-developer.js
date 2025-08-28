const { Task } = require('../../../../orchestrai-shared/utils/task-delegation');

class WebFrontendDeveloper {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.agentId = 'web-frontend-developer';
    this.specialization = 'frontend-code-quality-and-architecture';
    
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

  getCapabilities() {
    return {
      agentId: this.agentId,
      specialization: this.specialization,
      codeQualityStandards: this.codeQualityStandards,
      performanceMetrics: this.performanceMetrics,
      capabilities: [
        'typescript-code-validation',
        'react-best-practices-analysis',
        'security-compliance-assessment',
        'code-architecture-evaluation',
        'performance-code-analysis',
        'custom-rules-validation'
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