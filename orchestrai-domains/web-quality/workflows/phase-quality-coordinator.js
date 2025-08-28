const EventEmitter = require('events');

/**
 * Phase Quality Coordinator
 * 
 * Manages phase-to-phase quality gates and validation workflows
 * Enforces quality thresholds before allowing progression through:
 * UX Research → Wireframe → Design → Development → Production
 */
class PhaseQualityCoordinator extends EventEmitter {
  constructor(webQualityHub, config) {
    super();
    this.webQualityHub = webQualityHub;
    this.config = config;
    this.crystallineMemory = webQualityHub.crystallineMemory;
    
    // Phase progression workflow
    this.phases = this.config.qualityWorkflow.phases;
    this.phaseGates = this.config.qualityWorkflow.phaseToPhaseGates;
    this.retryLimits = this.config.qualityWorkflow.retryLimits;
    
    // Active phase validations
    this.activeValidations = new Map(); // projectId -> validation session
    this.phaseHistory = new Map(); // projectId -> phase progression history
    this.qualityMetrics = new Map(); // projectId -> accumulated quality metrics
    
    // Phase validation agents mapping
    this.phaseAgentMapping = {
      'ux-research-validation': ['web-quality-ux-validator'],
      'wireframe-quality-check': ['web-quality-ux-validator', 'web-quality-responsive-validator'],
      'design-implementation-validation': ['web-quality-visual-regression-tester', 'web-quality-responsive-validator'],
      'development-quality-assessment': ['web-quality-code-validator', 'web-quality-performance-tester'],
      'browser-compatibility-testing': ['web-quality-browser-compatibility-validator'],
      'e2e-integration-validation': ['web-quality-e2e-coordinator', 'web-quality-ux-flow-validator'],
      'performance-optimization-validation': ['web-quality-performance-tester'],
      'production-readiness-check': ['web-quality-ux-flow-validator', 'web-quality-performance-tester']
    };
    
    this.initialize();
  }

  initialize() {
    console.log('🚦 Initializing Phase Quality Coordinator...');
    
    // Set up event listeners for phase transitions
    this.webQualityHub.on('phaseTransitionRequest', this.handlePhaseTransitionRequest.bind(this));
    this.webQualityHub.on('qualityValidationComplete', this.handleQualityValidationComplete.bind(this));
    
    console.log(`✅ Phase Quality Coordinator initialized for ${this.phases.length} phases`);
  }

  async requestPhaseTransition(projectId, fromPhase, toPhase, validationData = {}) {
    try {
      console.log(`🚦 Phase transition request: ${projectId} | ${fromPhase} → ${toPhase}`);
      
      // Validate phase progression sequence
      if (!this.isValidPhaseProgression(fromPhase, toPhase)) {
        throw new Error(`Invalid phase progression: ${fromPhase} → ${toPhase}`);
      }
      
      // Create validation session
      const sessionId = this.createValidationSession(projectId, fromPhase, toPhase, validationData);
      
      // Determine quality gates to evaluate
      const qualityGates = this.getQualityGatesForTransition(fromPhase, toPhase);
      
      // Execute phase validation
      const validationResult = await this.executePhaseValidation(sessionId, qualityGates, validationData);
      
      // Evaluate validation results against quality thresholds
      const transitionApproval = this.evaluateTransitionApproval(validationResult, qualityGates);
      
      // Store results in crystalline memory
      await this.storePhaseValidationResults(projectId, sessionId, validationResult, transitionApproval);
      
      // Handle transition outcome
      if (transitionApproval.approved) {
        await this.approvePhaseTransition(projectId, fromPhase, toPhase, validationResult);
        return {
          success: true,
          approved: true,
          sessionId,
          qualityScore: transitionApproval.overallScore,
          validationResults: validationResult,
          message: `Phase transition approved: ${fromPhase} → ${toPhase}`
        };
      } else {
        return await this.handleTransitionRejection(projectId, sessionId, fromPhase, toPhase, validationResult, transitionApproval);
      }
      
    } catch (error) {
      console.error(`❌ Phase transition failed for ${projectId}:`, error);
      throw error;
    }
  }

  isValidPhaseProgression(fromPhase, toPhase) {
    const fromIndex = this.phases.indexOf(fromPhase);
    const toIndex = this.phases.indexOf(toPhase);
    
    // Allow progression to next phase or skip one phase maximum
    return toIndex > fromIndex && toIndex <= fromIndex + 2;
  }

  createValidationSession(projectId, fromPhase, toPhase, validationData) {
    const sessionId = `validation_${projectId}_${Date.now()}`;
    
    this.activeValidations.set(sessionId, {
      projectId,
      fromPhase,
      toPhase,
      validationData,
      startTime: Date.now(),
      status: 'in_progress',
      attempts: this.getAttemptCount(projectId, fromPhase, toPhase),
      qualityResults: new Map()
    });
    
    return sessionId;
  }

  getAttemptCount(projectId, fromPhase, toPhase) {
    const history = this.phaseHistory.get(projectId) || [];
    return history.filter(h => h.fromPhase === fromPhase && h.toPhase === toPhase).length + 1;
  }

  getQualityGatesForTransition(fromPhase, toPhase) {
    const transitionKey = `${this.getTransitionKey(fromPhase, toPhase)}`;
    return this.phaseGates[transitionKey] || {};
  }

  getTransitionKey(fromPhase, toPhase) {
    const transitions = {
      'ux-research-validation_wireframe-quality-check': 'uxToWireframe',
      'wireframe-quality-check_design-implementation-validation': 'wireframeToDesign',
      'design-implementation-validation_development-quality-assessment': 'designToDevelopment',
      'development-quality-assessment_browser-compatibility-testing': 'developmentToTesting',
      'e2e-integration-validation_production-readiness-check': 'testingToProduction'
    };
    
    return transitions[`${fromPhase}_${toPhase}`] || 'default';
  }

  async executePhaseValidation(sessionId, qualityGates, validationData) {
    const session = this.activeValidations.get(sessionId);
    if (!session) throw new Error(`Validation session not found: ${sessionId}`);
    
    const validationResults = {
      sessionId,
      projectId: session.projectId,
      fromPhase: session.fromPhase,
      toPhase: session.toPhase,
      qualityGates,
      agentResults: new Map(),
      overallScore: 0,
      timestamp: Date.now()
    };

    // Determine which agents need to validate this phase transition
    const requiredAgents = this.getRequiredAgentsForPhase(session.toPhase);
    
    console.log(`🧪 Executing phase validation with ${requiredAgents.length} agents for ${session.fromPhase} → ${session.toPhase}`);
    
    // Execute validation with each required agent
    for (const agentId of requiredAgents) {
      try {
        const agent = this.webQualityHub.subAgents.get(agentId);
        if (!agent) {
          console.warn(`⚠️ Agent not found: ${agentId}`);
          continue;
        }
        
        console.log(`🔍 Running ${agent.name} validation...`);
        
        const agentResult = await this.executeAgentValidation(agent, session, validationData);
        validationResults.agentResults.set(agentId, agentResult);
        
        // Update session with partial results
        session.qualityResults.set(agentId, agentResult);
        
      } catch (error) {
        console.error(`❌ Agent validation failed for ${agentId}:`, error);
        validationResults.agentResults.set(agentId, {
          success: false,
          error: error.message,
          score: 0,
          timestamp: Date.now()
        });
      }
    }
    
    // Calculate overall validation score
    validationResults.overallScore = this.calculateOverallValidationScore(validationResults.agentResults, qualityGates);
    
    console.log(`📊 Phase validation completed with overall score: ${validationResults.overallScore}%`);
    
    return validationResults;
  }

  getRequiredAgentsForPhase(phase) {
    return this.phaseAgentMapping[phase] || [];
  }

  async executeAgentValidation(agent, session, validationData) {
    try {
      // Determine the validation method based on agent type and phase
      const validationMethod = this.getValidationMethodForAgent(agent, session.toPhase);
      
      if (!validationMethod) {
        throw new Error(`No validation method found for agent ${agent.id} in phase ${session.toPhase}`);
      }
      
      // Execute the appropriate validation method
      const result = await agent.instance[validationMethod](validationData.url || validationData, validationData.config || {});
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        method: validationMethod,
        success: true,
        result,
        score: result.overallScore || result.score || 0,
        qualityGateStatus: result.qualityGateStatus || {},
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error(`Agent ${agent.id} validation error:`, error);
      return {
        agentId: agent.id,
        agentName: agent.name,
        success: false,
        error: error.message,
        score: 0,
        timestamp: Date.now()
      };
    }
  }

  getValidationMethodForAgent(agent, phase) {
    const methodMapping = {
      'web-quality-ux-validator': {
        'ux-research-validation': 'validateUserExperience',
        'wireframe-quality-check': 'validateUserExperience'
      },
      'web-quality-visual-regression-tester': {
        'design-implementation-validation': 'validateVisualImplementation'
      },
      'web-quality-responsive-validator': {
        'wireframe-quality-check': 'validateResponsiveDesign',
        'design-implementation-validation': 'validateResponsiveDesign'
      },
      'web-quality-code-validator': {
        'development-quality-assessment': 'validateCodeQuality'
      },
      'web-quality-performance-tester': {
        'development-quality-assessment': 'validatePerformance',
        'performance-optimization-validation': 'validatePerformance',
        'production-readiness-check': 'validatePerformance'
      },
      'web-quality-browser-compatibility-validator': {
        'browser-compatibility-testing': 'validateBrowserCompatibility'
      },
      'web-quality-e2e-coordinator': {
        'e2e-integration-validation': 'coordinateE2ETesting'
      },
      'web-quality-ux-flow-validator': {
        'e2e-integration-validation': 'validateUXFlows',
        'production-readiness-check': 'validateUXFlows'
      }
    };
    
    return methodMapping[agent.id]?.[phase];
  }

  calculateOverallValidationScore(agentResults, qualityGates) {
    if (agentResults.size === 0) return 0;
    
    let totalScore = 0;
    let validResults = 0;
    
    for (const [agentId, result] of agentResults) {
      if (result.success && typeof result.score === 'number') {
        totalScore += result.score;
        validResults++;
      }
    }
    
    return validResults > 0 ? Math.round(totalScore / validResults) : 0;
  }

  evaluateTransitionApproval(validationResult, qualityGates) {
    const approval = {
      approved: false,
      overallScore: validationResult.overallScore,
      gateResults: {},
      failedGates: [],
      recommendations: []
    };
    
    // Evaluate each quality gate
    for (const [gateName, threshold] of Object.entries(qualityGates)) {
      const gateResult = this.evaluateQualityGate(gateName, threshold, validationResult);
      approval.gateResults[gateName] = gateResult;
      
      if (!gateResult.passed) {
        approval.failedGates.push(gateName);
        approval.recommendations.push(...gateResult.recommendations);
      }
    }
    
    // Overall approval requires all gates to pass and minimum overall score
    const minimumOverallScore = 75; // Configurable minimum
    approval.approved = approval.failedGates.length === 0 && approval.overallScore >= minimumOverallScore;
    
    return approval;
  }

  evaluateQualityGate(gateName, threshold, validationResult) {
    // Find relevant agent results for this quality gate
    const relevantResults = this.getRelevantResultsForGate(gateName, validationResult.agentResults);
    
    if (relevantResults.length === 0) {
      return {
        passed: false,
        score: 0,
        threshold,
        message: `No relevant validation results for gate: ${gateName}`,
        recommendations: [`Ensure proper validation for ${gateName}`]
      };
    }
    
    // Calculate gate-specific score
    const gateScore = relevantResults.reduce((sum, result) => sum + (result.score || 0), 0) / relevantResults.length;
    const passed = gateScore >= threshold;
    
    return {
      passed,
      score: gateScore,
      threshold,
      message: passed ? `${gateName} gate passed` : `${gateName} gate failed (${gateScore} < ${threshold})`,
      recommendations: passed ? [] : [`Improve ${gateName} to meet ${threshold}% threshold`]
    };
  }

  getRelevantResultsForGate(gateName, agentResults) {
    const gateAgentMapping = {
      accessibilityScore: ['web-quality-ux-validator'],
      usabilityScore: ['web-quality-ux-validator'],
      userJourneyCompletion: ['web-quality-ux-validator'],
      visualAccuracy: ['web-quality-visual-regression-tester'],
      brandCompliance: ['web-quality-visual-regression-tester'],
      layoutConsistency: ['web-quality-visual-regression-tester'],
      responsiveCompliance: ['web-quality-responsive-validator'],
      mobileOptimization: ['web-quality-responsive-validator'],
      crossDeviceConsistency: ['web-quality-responsive-validator'],
      codeQuality: ['web-quality-code-validator'],
      performanceScore: ['web-quality-performance-tester'],
      securityCompliance: ['web-quality-code-validator'],
      e2eTestCoverage: ['web-quality-e2e-coordinator'],
      browserCompatibility: ['web-quality-browser-compatibility-validator'],
      conversionOptimization: ['web-quality-ux-flow-validator']
    };
    
    const relevantAgents = gateAgentMapping[gateName] || [];
    const relevantResults = [];
    
    for (const agentId of relevantAgents) {
      if (agentResults.has(agentId)) {
        relevantResults.push(agentResults.get(agentId));
      }
    }
    
    return relevantResults;
  }

  async approvePhaseTransition(projectId, fromPhase, toPhase, validationResult) {
    console.log(`✅ Phase transition approved: ${projectId} | ${fromPhase} → ${toPhase}`);
    
    // Update phase history
    const history = this.phaseHistory.get(projectId) || [];
    history.push({
      fromPhase,
      toPhase,
      approved: true,
      validationResult: validationResult.overallScore,
      timestamp: Date.now()
    });
    this.phaseHistory.set(projectId, history);
    
    // Update quality metrics
    this.updateProjectQualityMetrics(projectId, validationResult);
    
    // Emit approval event
    this.emit('phaseTransitionApproved', {
      projectId,
      fromPhase,
      toPhase,
      validationResult,
      timestamp: Date.now()
    });
  }

  async handleTransitionRejection(projectId, sessionId, fromPhase, toPhase, validationResult, transitionApproval) {
    console.log(`❌ Phase transition rejected: ${projectId} | ${fromPhase} → ${toPhase}`);
    
    const session = this.activeValidations.get(sessionId);
    const attempt = session.attempts;
    
    // Check if retry limit exceeded
    if (attempt >= this.retryLimits.maxRetries) {
      return await this.escalatePhaseTransitionFailure(projectId, sessionId, fromPhase, toPhase, validationResult, transitionApproval);
    }
    
    // Generate improvement recommendations
    const improvementPlan = await this.generateImprovementPlan(validationResult, transitionApproval);
    
    // Update phase history with rejection
    const history = this.phaseHistory.get(projectId) || [];
    history.push({
      fromPhase,
      toPhase,
      approved: false,
      attempt,
      validationResult: validationResult.overallScore,
      failedGates: transitionApproval.failedGates,
      improvementPlan,
      timestamp: Date.now()
    });
    this.phaseHistory.set(projectId, history);
    
    // Emit rejection event
    this.emit('phaseTransitionRejected', {
      projectId,
      fromPhase,
      toPhase,
      attempt,
      validationResult,
      transitionApproval,
      improvementPlan,
      timestamp: Date.now()
    });
    
    return {
      success: false,
      approved: false,
      sessionId,
      attempt,
      qualityScore: transitionApproval.overallScore,
      failedGates: transitionApproval.failedGates,
      improvementPlan,
      canRetry: attempt < this.retryLimits.maxRetries,
      message: `Phase transition rejected. ${this.retryLimits.maxRetries - attempt} attempts remaining.`
    };
  }

  async escalatePhaseTransitionFailure(projectId, sessionId, fromPhase, toPhase, validationResult, transitionApproval) {
    console.log(`🚨 Phase transition failure escalated: ${projectId} | ${fromPhase} → ${toPhase} (max retries exceeded)`);
    
    // Generate comprehensive failure analysis
    const failureAnalysis = await this.generateFailureAnalysis(validationResult, transitionApproval);
    
    // Store escalation in crystalline memory
    await this.crystallineMemory.store('quality-improvement-patterns', {
      type: 'phase-transition-escalation',
      projectId,
      fromPhase,
      toPhase,
      validationResult,
      transitionApproval,
      failureAnalysis,
      timestamp: Date.now()
    });
    
    // Emit escalation event
    this.emit('phaseTransitionEscalated', {
      projectId,
      fromPhase,
      toPhase,
      validationResult,
      transitionApproval,
      failureAnalysis,
      timestamp: Date.now()
    });
    
    return {
      success: false,
      approved: false,
      escalated: true,
      sessionId,
      qualityScore: transitionApproval.overallScore,
      failedGates: transitionApproval.failedGates,
      failureAnalysis,
      message: 'Phase transition escalated due to repeated failures. Manual review required.'
    };
  }

  async generateImprovementPlan(validationResult, transitionApproval) {
    const improvementPlan = {
      priority: 'high',
      estimatedEffort: 'medium',
      recommendations: [],
      specificActions: [],
      expectedImpact: {}
    };
    
    // Generate recommendations based on failed gates
    for (const failedGate of transitionApproval.failedGates) {
      const gateRecommendations = this.getGateSpecificRecommendations(failedGate, validationResult);
      improvementPlan.recommendations.push(...gateRecommendations);
    }
    
    // Generate specific actions based on agent results
    for (const [agentId, result] of validationResult.agentResults) {
      if (!result.success || result.score < 80) {
        const agentActions = this.getAgentSpecificActions(agentId, result);
        improvementPlan.specificActions.push(...agentActions);
      }
    }
    
    return improvementPlan;
  }

  getGateSpecificRecommendations(gateName, validationResult) {
    const recommendations = {
      accessibilityScore: ['Improve WCAG compliance', 'Add alt text to images', 'Enhance keyboard navigation'],
      usabilityScore: ['Simplify navigation', 'Improve visual hierarchy', 'Reduce cognitive load'],
      visualAccuracy: ['Fix layout inconsistencies', 'Align with design mockups', 'Improve responsive behavior'],
      performanceScore: ['Optimize images', 'Minimize JavaScript bundle', 'Implement lazy loading'],
      codeQuality: ['Refactor complex components', 'Add TypeScript types', 'Improve error handling']
    };
    
    return recommendations[gateName] || [`Improve ${gateName} quality`];
  }

  getAgentSpecificActions(agentId, result) {
    const actions = {
      'web-quality-ux-validator': ['Review user journey flows', 'Conduct usability testing', 'Improve accessibility features'],
      'web-quality-performance-tester': ['Optimize Core Web Vitals', 'Reduce bundle size', 'Implement caching strategies'],
      'web-quality-code-validator': ['Code review and refactoring', 'Add unit tests', 'Implement security best practices']
    };
    
    return actions[agentId] || ['Review and improve quality metrics'];
  }

  async generateFailureAnalysis(validationResult, transitionApproval) {
    return {
      rootCauses: this.identifyRootCauses(validationResult),
      patternAnalysis: await this.analyzeFailurePatterns(validationResult),
      systemicIssues: this.identifySystemicIssues(transitionApproval),
      recommendedActions: this.generateStrategicRecommendations(validationResult, transitionApproval)
    };
  }

  identifyRootCauses(validationResult) {
    const rootCauses = [];
    
    for (const [agentId, result] of validationResult.agentResults) {
      if (!result.success) {
        rootCauses.push(`${agentId}: ${result.error || 'Validation failure'}`);
      } else if (result.score < 50) {
        rootCauses.push(`${agentId}: Quality score critically low (${result.score}%)`);
      }
    }
    
    return rootCauses;
  }

  async analyzeFailurePatterns(validationResult) {
    // Retrieve similar failures from crystalline memory for pattern analysis
    const historicalFailures = await this.crystallineMemory.retrieve('quality-improvement-patterns', {
      type: 'phase-transition-escalation',
      limit: 10
    });
    
    return {
      commonFailurePoints: ['Performance optimization', 'Accessibility compliance', 'Visual consistency'],
      frequentIssues: ['Bundle size', 'Color contrast', 'Layout responsiveness'],
      improvementOpportunities: ['Automated testing', 'Design system compliance', 'Performance monitoring']
    };
  }

  identifySystemicIssues(transitionApproval) {
    if (transitionApproval.failedGates.length > 3) {
      return ['Multiple quality gates failing indicates systemic quality issues'];
    }
    return [];
  }

  generateStrategicRecommendations(validationResult, transitionApproval) {
    return [
      'Implement automated quality checks in CI/CD pipeline',
      'Establish regular quality reviews and checkpoints',
      'Invest in team training on quality best practices',
      'Review and update quality standards and thresholds'
    ];
  }

  updateProjectQualityMetrics(projectId, validationResult) {
    const currentMetrics = this.qualityMetrics.get(projectId) || {
      totalValidations: 0,
      averageQualityScore: 0,
      phaseCompletions: 0,
      improvementTrend: []
    };
    
    currentMetrics.totalValidations++;
    currentMetrics.averageQualityScore = 
      (currentMetrics.averageQualityScore * (currentMetrics.totalValidations - 1) + validationResult.overallScore) / 
      currentMetrics.totalValidations;
    currentMetrics.phaseCompletions++;
    currentMetrics.improvementTrend.push({
      score: validationResult.overallScore,
      timestamp: Date.now()
    });
    
    // Keep only last 10 trend points
    if (currentMetrics.improvementTrend.length > 10) {
      currentMetrics.improvementTrend = currentMetrics.improvementTrend.slice(-10);
    }
    
    this.qualityMetrics.set(projectId, currentMetrics);
  }

  async storePhaseValidationResults(projectId, sessionId, validationResult, transitionApproval) {
    await this.crystallineMemory.store('web-quality-scores-central', {
      type: 'phase-validation',
      projectId,
      sessionId,
      validationResult,
      transitionApproval,
      timestamp: Date.now()
    });
  }

  // Event handlers for integration with WebQualityHub
  async handlePhaseTransitionRequest(event) {
    return await this.requestPhaseTransition(
      event.projectId, 
      event.fromPhase, 
      event.toPhase, 
      event.validationData
    );
  }

  async handleQualityValidationComplete(event) {
    console.log(`✅ Quality validation completed: ${event.agentId} for session ${event.sessionId}`);
    // Update session status if needed
  }

  // Status and metrics methods
  getCoordinatorStatus() {
    return {
      activeValidations: this.activeValidations.size,
      totalProjectsTracked: this.phaseHistory.size,
      phaseGates: Object.keys(this.phaseGates),
      retryLimits: this.retryLimits
    };
  }

  getProjectStatus(projectId) {
    return {
      history: this.phaseHistory.get(projectId) || [],
      qualityMetrics: this.qualityMetrics.get(projectId) || {},
      currentPhase: this.getCurrentPhase(projectId)
    };
  }

  getCurrentPhase(projectId) {
    const history = this.phaseHistory.get(projectId) || [];
    if (history.length === 0) return this.phases[0];
    
    const lastApprovedTransition = history.filter(h => h.approved).pop();
    return lastApprovedTransition ? lastApprovedTransition.toPhase : this.phases[0];
  }
}

module.exports = PhaseQualityCoordinator;