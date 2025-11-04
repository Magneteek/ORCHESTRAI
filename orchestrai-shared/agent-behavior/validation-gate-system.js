// Validation Gate System
// Pre/post operation validation to prevent CLAUDE.md rule violations
// Acts as automated quality gates for agent actions

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

class ValidationGateSystem extends EventEmitter {
  constructor(ruleInjector, crystallineMemory) {
    super();
    
    this.ruleInjector = ruleInjector;
    this.crystallineMemory = crystallineMemory;
    
    // Validation gate types
    this.gateTypes = {
      'pre-operation': {
        description: 'Validate before operation execution',
        blocking: true,
        timeout: 5000
      },
      'mid-operation': {
        description: 'Validate during operation execution',
        blocking: false,
        timeout: 3000
      },
      'post-operation': {
        description: 'Validate after operation completion',
        blocking: false,
        timeout: 10000
      },
      'continuous': {
        description: 'Ongoing validation monitoring',
        blocking: false,
        timeout: 1000
      }
    };
    
    // Pre-operation validators
    this.preValidators = new Map([
      ['file-path-validation', this.validateFilePath.bind(this)],
      ['project-coherence-validation', this.validateProjectCoherence.bind(this)],
      ['template-access-validation', this.validateTemplateAccess.bind(this)],
      ['permission-validation', this.validatePermissions.bind(this)],
      ['resource-validation', this.validateResourceAccess.bind(this)]
    ]);
    
    // Post-operation validators  
    this.postValidators = new Map([
      ['output-structure-validation', this.validateOutputStructure.bind(this)],
      ['content-quality-validation', this.validateContentQuality.bind(this)],
      ['rule-compliance-validation', this.validateRuleCompliance.bind(this)],
      ['memory-integration-validation', this.validateMemoryIntegration.bind(this)]
    ]);
    
    // Validation history for learning
    this.validationHistory = [];
    this.maxHistorySize = 1000;
    
    // Registered agents tracking
    this.registeredAgents = new Map();
    
    console.log('🛡️ Validation Gate System initialized - Preventing rule violations');
  }

  /**
   * Register an agent with validation gate configuration
   */
  async registerAgent(agentId, config) {
    this.registeredAgents.set(agentId, {
      agentId,
      config,
      registeredAt: Date.now(),
      validationsPerformed: 0
    });
    
    console.log(`🚪 Agent ${agentId} registered for validation gates: ${config.enabledGates?.join(', ') || 'all'}`);
    return true;
  }

  /**
   * Main validation gate entry point
   */
  async validateOperation(operation, gateType, context = {}) {
    const startTime = Date.now();
    const validationId = `${operation.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🔍 ${gateType} validation started for ${operation.type}: ${validationId}`);
      
      // Get applicable validators for this gate type
      const validators = this.getValidatorsForGateType(gateType);
      
      // Run validations
      const results = await this.runValidators(validators, operation, context);
      
      // Aggregate results
      const aggregatedResult = this.aggregateValidationResults(results, gateType);
      
      // Record validation history
      this.recordValidation({
        validationId,
        operation,
        gateType,
        context,
        results,
        aggregatedResult,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
      // Emit validation event
      this.emit('validation-completed', {
        validationId,
        gateType,
        operationType: operation.type,
        passed: aggregatedResult.passed,
        issues: aggregatedResult.issues.length
      });
      
      console.log(`✅ ${gateType} validation completed for ${operation.type}: ${aggregatedResult.passed ? 'PASSED' : 'FAILED'}`);
      
      return aggregatedResult;
      
    } catch (error) {
      console.error(`❌ Validation gate error for ${operation.type}:`, error.message);
      
      return {
        passed: false,
        issues: [{
          severity: 'critical',
          type: 'validation-error',
          message: `Validation system error: ${error.message}`,
          validator: 'system'
        }],
        metadata: {
          validationId,
          error: error.message,
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get validators for specific gate type
   */
  getValidatorsForGateType(gateType) {
    const validators = [];
    
    switch (gateType) {
      case 'pre-operation':
        validators.push(...this.preValidators.entries());
        break;
      case 'post-operation':
        validators.push(...this.postValidators.entries());
        break;
      case 'continuous':
        // Select lightweight validators for continuous monitoring
        validators.push(
          ['file-path-validation', this.validateFilePath.bind(this)],
          ['permission-validation', this.validatePermissions.bind(this)]
        );
        break;
      default:
        // For unknown gate types, use all applicable validators
        validators.push(...this.preValidators.entries());
    }
    
    return validators;
  }

  /**
   * Run multiple validators in parallel
   */
  async runValidators(validators, operation, context) {
    const validationPromises = validators.map(async ([name, validator]) => {
      try {
        const result = await Promise.race([
          validator(operation, context),
          this.createTimeoutPromise(name)
        ]);
        
        return {
          validator: name,
          ...result
        };
      } catch (error) {
        return {
          validator: name,
          passed: false,
          issues: [{
            severity: 'error',
            type: 'validator-error',
            message: error.message
          }]
        };
      }
    });
    
    return await Promise.allSettled(validationPromises);
  }

  /**
   * Create timeout promise for validator
   */
  createTimeoutPromise(validatorName, timeoutMs = 5000) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Validator ${validatorName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Aggregate validation results
   */
  aggregateValidationResults(results, gateType) {
    const aggregated = {
      passed: true,
      issues: [],
      warnings: [],
      metadata: {
        gateType,
        totalValidators: results.length,
        successfulValidators: 0,
        failedValidators: 0,
        timeoutValidators: 0
      }
    };
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const validationResult = result.value;
        aggregated.metadata.successfulValidators++;
        
        if (!validationResult.passed) {
          aggregated.passed = false;
        }
        
        if (validationResult.issues) {
          aggregated.issues.push(...validationResult.issues);
        }
        
        if (validationResult.warnings) {
          aggregated.warnings.push(...validationResult.warnings);
        }
      } else {
        aggregated.metadata.failedValidators++;
        aggregated.passed = false;
        
        aggregated.issues.push({
          severity: 'critical',
          type: 'validator-failure',
          message: result.reason.message,
          validator: 'system'
        });
      }
    });
    
    // Determine overall severity
    const criticalIssues = aggregated.issues.filter(i => i.severity === 'critical').length;
    const majorIssues = aggregated.issues.filter(i => i.severity === 'major').length;
    
    if (criticalIssues > 0) {
      aggregated.severity = 'critical';
    } else if (majorIssues > 0) {
      aggregated.severity = 'major';
    } else if (aggregated.issues.length > 0) {
      aggregated.severity = 'minor';
    } else {
      aggregated.severity = 'none';
    }
    
    return aggregated;
  }

  /**
   * Validate file path operations
   */
  async validateFilePath(operation, context) {
    const issues = [];
    const warnings = [];
    
    // Extract file paths from operation
    const filePaths = this.extractFilePathsFromOperation(operation);
    
    for (const filePath of filePaths) {
      // Check if path follows CLAUDE.md rules
      const pathValidation = await this.validateSingleFilePath(filePath, context);
      
      if (!pathValidation.valid) {
        issues.push({
          severity: 'critical',
          type: 'invalid-file-path',
          message: `File path violation: ${filePath} - ${pathValidation.reason}`,
          filePath,
          suggestion: pathValidation.suggestion
        });
      }
      
      if (pathValidation.warnings) {
        warnings.push(...pathValidation.warnings);
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      warnings,
      metadata: {
        pathsChecked: filePaths.length
      }
    };
  }

  /**
   * Validate single file path
   */
  async validateSingleFilePath(filePath, context) {
    // Template access validation
    if (filePath.includes('/templates/') && !filePath.includes('/orchestrai-system/templates/global/')) {
      return {
        valid: false,
        reason: 'Template access must use global template system',
        suggestion: 'Use /orchestrai-system/templates/global/ for template access'
      };
    }
    
    // Project deliverable validation
    if (this.isDeliverableFile(filePath)) {
      const projectPathPattern = /\/projects\/[a-zA-Z0-9-]+\/deliverables\//;
      
      if (!projectPathPattern.test(filePath)) {
        return {
          valid: false,
          reason: 'Deliverable files must use project structure',
          suggestion: 'Use /projects/[project-uuid]/deliverables/[category]/ structure'
        };
      }
      
      // Check if using correct project UUID
      if (context.projectUuid) {
        const expectedPath = `/projects/${context.projectUuid}/deliverables/`;
        if (!filePath.includes(expectedPath)) {
          return {
            valid: false,
            reason: `File not in correct project directory. Expected: ${expectedPath}`,
            suggestion: `Move file to ${expectedPath}[category]/`
          };
        }
      }
    }
    
    // Temp file validation
    if (filePath.includes('/temp/')) {
      const tempCategories = ['/processing/', '/downloads/', '/cache/'];
      const validTempPath = tempCategories.some(category => filePath.includes(category));
      
      if (!validTempPath) {
        return {
          valid: false,
          reason: 'Temp files must use categorized temp structure',
          suggestion: 'Use /temp/[processing|downloads|cache]/ structure'
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Validate project coherence
   */
  async validateProjectCoherence(operation, context) {
    const issues = [];
    const warnings = [];
    
    // Check if operation maintains client project coherence
    if (context.projectUuid && operation.type === 'create-project') {
      issues.push({
        severity: 'critical',
        type: 'project-coherence-violation',
        message: 'Attempting to create new project when existing project context available',
        projectUuid: context.projectUuid,
        suggestion: 'Use existing project structure for all client deliverables'
      });
    }
    
    // Check if operation references correct project
    if (context.projectUuid && operation.parameters) {
      const referencesProject = JSON.stringify(operation.parameters).includes(context.projectUuid);
      
      if (!referencesProject && this.operationRequiresProject(operation)) {
        warnings.push({
          severity: 'minor',
          type: 'missing-project-reference',
          message: 'Operation may not reference correct project context',
          projectUuid: context.projectUuid
        });
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate template access
   */
  async validateTemplateAccess(operation, context) {
    const issues = [];
    
    // Check if operation accesses templates correctly
    const templateAccess = this.extractTemplateAccessFromOperation(operation);
    
    for (const templatePath of templateAccess) {
      if (!templatePath.startsWith('/orchestrai-system/templates/global/')) {
        issues.push({
          severity: 'major',
          type: 'invalid-template-access',
          message: `Invalid template access: ${templatePath}`,
          templatePath,
          suggestion: 'Use /orchestrai-system/templates/global/ for all template access'
        });
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Validate permissions
   */
  async validatePermissions(operation, context) {
    const issues = [];
    
    // Check if agent has permission for operation
    const hasPermission = await this.checkAgentPermissions(operation, context);
    
    if (!hasPermission.allowed) {
      issues.push({
        severity: 'critical',
        type: 'permission-denied',
        message: hasPermission.reason,
        operation: operation.type,
        agentId: context.agentId
      });
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Validate resource access
   */
  async validateResourceAccess(operation, context) {
    const issues = [];
    const warnings = [];
    
    // Check if operation accesses allowed resources
    const resourceAccess = this.extractResourceAccessFromOperation(operation);
    
    for (const resource of resourceAccess) {
      const accessCheck = await this.checkResourceAccess(resource, context);
      
      if (!accessCheck.allowed) {
        issues.push({
          severity: accessCheck.severity,
          type: 'resource-access-denied',
          message: accessCheck.reason,
          resource: resource.path
        });
      }
      
      if (accessCheck.warnings) {
        warnings.push(...accessCheck.warnings);
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate output structure
   */
  async validateOutputStructure(operation, context) {
    const issues = [];
    
    // Check if output follows expected structure
    if (operation.output) {
      const structureValidation = this.validateStructure(operation.output, operation.type);
      
      if (!structureValidation.valid) {
        issues.push({
          severity: 'major',
          type: 'invalid-output-structure',
          message: structureValidation.reason,
          expectedStructure: structureValidation.expected
        });
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Validate content quality
   */
  async validateContentQuality(operation, context) {
    const issues = [];
    const warnings = [];
    
    if (operation.output && typeof operation.output === 'string') {
      // Basic quality checks
      const qualityChecks = [
        this.checkContentLength(operation.output),
        this.checkContentStructure(operation.output),
        this.checkContentCoherence(operation.output)
      ];
      
      for (const check of qualityChecks) {
        if (!check.passed) {
          if (check.severity === 'critical') {
            issues.push(check);
          } else {
            warnings.push(check);
          }
        }
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate rule compliance
   */
  async validateRuleCompliance(operation, context) {
    if (!context.injectedRules) {
      return { passed: true, issues: [] };
    }
    
    // Use rule injector's validation
    const compliance = await this.ruleInjector.validateAgentCompliance(
      operation.output || JSON.stringify(operation),
      context,
      context.injectedRules
    );
    
    return {
      passed: compliance.isCompliant,
      issues: compliance.violations.map(violation => ({
        severity: this.mapRuleViolationSeverity(violation.severity),
        type: 'rule-compliance-violation',
        message: violation.violation,
        rule: violation.rule,
        recommendation: violation.recommendation
      })),
      metadata: {
        complianceScore: compliance.score
      }
    };
  }

  /**
   * Validate memory integration
   */
  async validateMemoryIntegration(operation, context) {
    const issues = [];
    
    // Check if memory operations are properly integrated
    if (operation.type.includes('memory') || context.memoryOperations) {
      const memoryValidation = await this.validateMemoryOperations(operation, context);
      
      if (!memoryValidation.valid) {
        issues.push({
          severity: 'major',
          type: 'memory-integration-error',
          message: memoryValidation.reason
        });
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  // Helper methods

  extractFilePathsFromOperation(operation) {
    const paths = [];
    const operationStr = JSON.stringify(operation);
    
    // Extract file paths from operation parameters
    const pathRegex = /["\']([\/\w\-\.]+\.(js|ts|md|html|css|json|txt))["\']|["\']([\/\w\-\.]+\/)["\']|file_?[pP]ath["\']?\s*:\s*["\']([^"']+)["\']|path["\']?\s*:\s*["\']([^"']+)["\']/g;
    
    let match;
    while ((match = pathRegex.exec(operationStr)) !== null) {
      const path = match[1] || match[3] || match[4] || match[5];
      if (path && !paths.includes(path)) {
        paths.push(path);
      }
    }
    
    return paths;
  }

  isDeliverableFile(filePath) {
    const deliverableExtensions = ['.md', '.html', '.css', '.js', '.json', '.txt', '.pdf'];
    return deliverableExtensions.some(ext => filePath.endsWith(ext)) &&
           !filePath.includes('/node_modules/') &&
           !filePath.includes('/orchestrai-system/templates/');
  }

  operationRequiresProject(operation) {
    const projectRequiredOperations = [
      'write-file', 'create-file', 'edit-file', 'create-deliverable',
      'content-generation', 'seo-analysis', 'design-creation'
    ];
    
    return projectRequiredOperations.includes(operation.type) ||
           operation.type.includes('deliverable') ||
           operation.type.includes('content');
  }

  extractTemplateAccessFromOperation(operation) {
    const templatePaths = [];
    const operationStr = JSON.stringify(operation);
    
    const templateRegex = /["\']([^"']*templates?[^"']*)["\']|template[^"']*["\']([^"']+)["\']|from[^"']*["\']([^"']*templates?[^"']*)["\']/gi;
    
    let match;
    while ((match = templateRegex.exec(operationStr)) !== null) {
      const path = match[1] || match[2] || match[3];
      if (path && !templatePaths.includes(path)) {
        templatePaths.push(path);
      }
    }
    
    return templatePaths;
  }

  extractResourceAccessFromOperation(operation) {
    const resources = [];
    
    // Extract from operation parameters
    if (operation.parameters) {
      Object.entries(operation.parameters).forEach(([key, value]) => {
        if (typeof value === 'string' && (key.includes('path') || key.includes('file') || key.includes('url'))) {
          resources.push({
            type: key,
            path: value,
            operation: operation.type
          });
        }
      });
    }
    
    return resources;
  }

  async checkAgentPermissions(operation, context) {
    // Basic permission checking - can be extended
    
    // Check if agent type is authorized for operation
    const authorizedOperations = this.getAuthorizedOperationsForAgent(context.agentType);
    
    if (authorizedOperations && !authorizedOperations.includes(operation.type)) {
      return {
        allowed: false,
        reason: `Agent type ${context.agentType} not authorized for operation ${operation.type}`
      };
    }
    
    return { allowed: true };
  }

  getAuthorizedOperationsForAgent(agentType) {
    // Define operation permissions per agent type
    const permissions = {
      'content-writer-specialist': ['write-content', 'edit-content', 'create-article'],
      'seo-specialist': ['seo-analysis', 'keyword-research', 'content-optimization'],
      'web-frontend-developer': ['write-file', 'create-component', 'edit-file'],
      'orchestrai-master-coordinator': ['*'] // All operations allowed
    };
    
    return permissions[agentType];
  }

  async checkResourceAccess(resource, context) {
    // Check if resource path is accessible
    try {
      if (resource.path.startsWith('/')) {
        // Check if absolute path is in allowed directories
        const allowedDirectories = [
          '/projects/',
          '/orchestrai-system/templates/global/',
          '/temp/'
        ];
        
        const isAllowed = allowedDirectories.some(dir => resource.path.startsWith(dir));
        
        if (!isAllowed) {
          return {
            allowed: false,
            severity: 'critical',
            reason: `Access to ${resource.path} not permitted. Must use allowed directories.`
          };
        }
      }
      
      return { allowed: true };
      
    } catch (error) {
      return {
        allowed: false,
        severity: 'major',
        reason: `Resource access check failed: ${error.message}`
      };
    }
  }

  validateStructure(output, operationType) {
    // Basic structure validation based on operation type
    const structureRequirements = {
      'create-article': {
        required: ['title', 'content'],
        format: 'object'
      },
      'seo-analysis': {
        required: ['keywords', 'recommendations'],
        format: 'object'
      }
    };
    
    const requirement = structureRequirements[operationType];
    if (!requirement) {
      return { valid: true };
    }
    
    if (requirement.format === 'object' && typeof output !== 'object') {
      return {
        valid: false,
        reason: `Expected object output for ${operationType}`,
        expected: requirement
      };
    }
    
    if (requirement.required && typeof output === 'object') {
      for (const field of requirement.required) {
        if (!output.hasOwnProperty(field)) {
          return {
            valid: false,
            reason: `Missing required field: ${field}`,
            expected: requirement
          };
        }
      }
    }
    
    return { valid: true };
  }

  checkContentLength(content) {
    if (content.length < 10) {
      return {
        passed: false,
        severity: 'major',
        type: 'content-too-short',
        message: 'Content appears too short to be meaningful'
      };
    }
    
    return { passed: true };
  }

  checkContentStructure(content) {
    // Basic structure checks
    if (content.includes('undefined') || content.includes('[object Object]')) {
      return {
        passed: false,
        severity: 'critical',
        type: 'malformed-content',
        message: 'Content contains malformed elements'
      };
    }
    
    return { passed: true };
  }

  checkContentCoherence(content) {
    // Basic coherence checks
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length > 10) {
      const averageLength = content.length / sentences.length;
      if (averageLength < 20) {
        return {
          passed: false,
          severity: 'minor',
          type: 'content-fragmented',
          message: 'Content may be fragmented or incoherent'
        };
      }
    }
    
    return { passed: true };
  }

  async validateMemoryOperations(operation, context) {
    // Check if memory operations follow crystalline memory patterns
    if (operation.type === 'store-memory' && this.crystallineMemory) {
      // Validate memory storage parameters
      const params = operation.parameters;
      if (!params.domain || !params.content) {
        return {
          valid: false,
          reason: 'Memory storage requires domain and content parameters'
        };
      }
    }
    
    return { valid: true };
  }

  mapRuleViolationSeverity(severity) {
    const mapping = {
      'critical': 'critical',
      'strict': 'major',
      'important': 'minor',
      'guided': 'minor'
    };
    
    return mapping[severity] || 'minor';
  }

  recordValidation(validationRecord) {
    this.validationHistory.push(validationRecord);
    
    // Trim history if it gets too large
    if (this.validationHistory.length > this.maxHistorySize) {
      this.validationHistory = this.validationHistory.slice(-this.maxHistorySize);
    }
  }

  getValidationStatistics() {
    const stats = {
      totalValidations: this.validationHistory.length,
      passedValidations: this.validationHistory.filter(v => v.aggregatedResult.passed).length,
      failedValidations: this.validationHistory.filter(v => !v.aggregatedResult.passed).length,
      byGateType: {},
      byOperationType: {},
      commonIssues: {}
    };
    
    // Aggregate statistics
    this.validationHistory.forEach(record => {
      // By gate type
      stats.byGateType[record.gateType] = (stats.byGateType[record.gateType] || 0) + 1;
      
      // By operation type
      stats.byOperationType[record.operation.type] = (stats.byOperationType[record.operation.type] || 0) + 1;
      
      // Common issues
      record.aggregatedResult.issues.forEach(issue => {
        stats.commonIssues[issue.type] = (stats.commonIssues[issue.type] || 0) + 1;
      });
    });
    
    stats.successRate = stats.totalValidations > 0 ? 
      (stats.passedValidations / stats.totalValidations * 100).toFixed(2) : 0;
    
    return stats;
  }
}

module.exports = ValidationGateSystem;