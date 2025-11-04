// Enhanced Workflow Controller
// Integrates quality audit and interlinking systems into agent workflows
// Provides continuous quality control and strategic content optimization

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

// Import quality control systems
const AutomaticQualityAuditSystem = require('../quality-control/automatic-quality-audit-system');
const AutomaticInterlinkingStrategySystem = require('../seo-optimization/automatic-interlinking-strategy-system');

class EnhancedWorkflowController extends EventEmitter {
  constructor(crystallineMemory, contextPreservation, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.contextPreservation = contextPreservation;
    this.redis = redis;
    
    // Initialize quality control systems
    this.qualityAuditSystem = new AutomaticQualityAuditSystem(
      crystallineMemory,
      contextPreservation,
      redis
    );
    
    this.interlinkingSystem = new AutomaticInterlinkingStrategySystem(
      crystallineMemory,
      contextPreservation,
      redis
    );
    
    // Workflow enhancement configuration
    this.workflowConfig = {
      qualityControlEnabled: true,
      interlinkingEnabled: true,
      continuousMonitoring: true,
      autoCorrection: true,
      feedbackDelivery: 'immediate',
      qualityThresholds: {
        minQualityScore: 0.8,
        maxRevisionCycles: 3,
        requiresHumanReview: 0.6
      }
    };
    
    // Active workflows
    this.activeWorkflows = new Map();
    this.workflowHistory = [];
    
    // Enhanced workflow patterns
    this.workflowPatterns = {
      'content-creation-with-quality-control': {
        name: 'Quality-Controlled Content Creation',
        description: 'Content creation with continuous quality audit and automatic interlinking',
        steps: [
          'outline-validation',
          'step-by-step-writing-with-scrutinization',
          'quality-validation',
          'interlinking-insertion',
          'final-quality-check'
        ],
        qualityGates: ['outline-adherence', 'content-quality', 'seo-optimization']
      },
      'content-optimization-workflow': {
        name: 'Comprehensive Content Optimization',
        description: 'Full content optimization with quality control and strategic linking',
        steps: [
          'content-analysis',
          'quality-assessment',
          'optimization-planning',
          'content-enhancement',
          'interlinking-strategy',
          'final-validation'
        ],
        qualityGates: ['technical-quality', 'seo-compliance', 'strategic-alignment']
      },
      'revision-feedback-loop': {
        name: 'Automated Revision and Feedback',
        description: 'Continuous revision based on quality feedback until standards met',
        steps: [
          'quality-evaluation',
          'feedback-generation',
          'revision-planning',
          'content-revision',
          'quality-recheck'
        ],
        qualityGates: ['improvement-validation', 'convergence-check']
      }
    };
    
    // Workflow metrics
    this.workflowMetrics = {
      workflowsStarted: 0,
      workflowsCompleted: 0,
      qualityIssuesResolved: 0,
      linksInserted: 0,
      averageQualityImprovement: 0,
      autoCorrectionsApplied: 0
    };
    
    // Set up event handlers
    this.setupEventHandlers();
    
    console.log('🎛️ Enhanced Workflow Controller initialized - Quality control and interlinking integrated');
  }

  /**
   * Start enhanced content creation workflow
   */
  async startEnhancedContentWorkflow(workflowConfig) {
    const workflowId = uuidv4();
    const timestamp = Date.now();
    
    try {
      console.log(`🚀 Starting enhanced content workflow: ${workflowId}`);
      
      // Validate workflow configuration
      const validation = this.validateWorkflowConfig(workflowConfig);
      if (!validation.valid) {
        throw new Error(`Invalid workflow config: ${validation.errors.join(', ')}`);
      }
      
      // Create workflow instance
      const workflow = {
        workflowId,
        config: workflowConfig,
        status: 'active',
        startedAt: timestamp,
        pattern: workflowConfig.pattern || 'content-creation-with-quality-control',
        currentStep: 0,
        steps: this.workflowPatterns[workflowConfig.pattern || 'content-creation-with-quality-control'].steps,
        qualityAuditId: null,
        interlinkingAnalysisId: null,
        revisionCycle: 0,
        qualityScores: {
          initial: 0,
          current: 0,
          target: workflowConfig.targetQualityScore || 0.85
        },
        feedback: [],
        corrections: [],
        linksInserted: []
      };
      
      // Store workflow
      this.activeWorkflows.set(workflowId, workflow);
      
      // Start quality audit system
      if (workflowConfig.outline) {
        workflow.qualityAuditId = await this.qualityAuditSystem.startContinuousAudit(
          workflowConfig.contentId || workflowId,
          {
            outline: workflowConfig.outline,
            contentType: workflowConfig.contentType || 'general',
            qualityThresholds: this.workflowConfig.qualityThresholds
          }
        );
      }
      
      // Initialize interlinking analysis
      if (workflowConfig.enableInterlinking !== false) {
        // This will be triggered when content is available
        workflow.interlinkingEnabled = true;
      }
      
      // Update metrics
      this.workflowMetrics.workflowsStarted++;
      
      console.log(`✅ Enhanced workflow started: ${workflowId} with pattern: ${workflow.pattern}`);
      
      this.emit('workflow-started', {
        workflowId,
        pattern: workflow.pattern,
        qualityAuditId: workflow.qualityAuditId
      });
      
      return {
        workflowId,
        pattern: workflow.pattern,
        qualityAuditId: workflow.qualityAuditId,
        steps: workflow.steps
      };
      
    } catch (error) {
      console.error('❌ Failed to start enhanced workflow:', error.message);
      throw error;
    }
  }

  /**
   * Process workflow step with quality control
   */
  async processWorkflowStep(workflowId, stepContent, stepIndex) {
    try {
      const workflow = this.activeWorkflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      console.log(`🔄 Processing workflow step ${stepIndex + 1}/${workflow.steps.length} for ${workflowId}`);
      
      // Update workflow status
      workflow.currentStep = stepIndex;
      workflow.lastUpdated = Date.now();
      
      // Perform quality scrutinization
      let qualityResult = { passed: true, issues: [] };
      if (workflow.qualityAuditId) {
        qualityResult = await this.qualityAuditSystem.scrutinizeStep(
          workflow.qualityAuditId,
          stepContent,
          stepIndex
        );
        
        // Update workflow quality scores
        workflow.qualityScores.current = qualityResult.qualityScore || 0;
      }
      
      // Handle quality issues
      if (!qualityResult.passed && qualityResult.issues.length > 0) {
        workflow.feedback.push({
          stepIndex,
          timestamp: Date.now(),
          issues: qualityResult.issues,
          feedback: qualityResult.feedback,
          requiresRevision: true
        });
        
        // Check if auto-correction is possible
        if (this.workflowConfig.autoCorrection) {
          const correctionResult = await this.attemptAutoCorrection(
            workflow,
            qualityResult.issues,
            stepContent
          );
          
          if (correctionResult.applied) {
            workflow.corrections.push({
              stepIndex,
              timestamp: Date.now(),
              corrections: correctionResult.corrections,
              improvedContent: correctionResult.content
            });
            
            this.workflowMetrics.autoCorrectionsApplied++;
          }
        }
        
        // Trigger revision cycle if needed
        if (qualityResult.qualityScore < this.workflowConfig.qualityThresholds.minQualityScore) {
          return await this.triggerRevisionCycle(workflow, stepIndex, qualityResult);
        }
      }
      
      // Update workflow
      this.activeWorkflows.set(workflowId, workflow);
      
      return {
        success: true,
        qualityPassed: qualityResult.passed,
        qualityScore: qualityResult.qualityScore,
        issues: qualityResult.issues,
        feedback: qualityResult.feedback,
        nextStep: stepIndex + 1 < workflow.steps.length ? workflow.steps[stepIndex + 1] : null
      };
      
    } catch (error) {
      console.error('❌ Workflow step processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Complete workflow with interlinking
   */
  async completeWorkflowWithInterlinking(workflowId, finalContent, contentMeta = {}) {
    try {
      const workflow = this.activeWorkflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      console.log(`🏁 Completing workflow with interlinking: ${workflowId}`);
      
      let enhancedContent = finalContent;
      
      // Perform interlinking analysis and insertion
      if (workflow.interlinkingEnabled) {
        const interlinkingResult = await this.interlinkingSystem.analyzeInterlinkingOpportunities(
          workflow.config.contentId || workflowId,
          finalContent,
          {
            ...contentMeta,
            domain: workflow.config.domain || 'general',
            type: workflow.config.contentType || 'article'
          }
        );
        
        workflow.interlinkingAnalysisId = interlinkingResult.analysisId;
        
        // Insert strategic links
        const linkInsertionResult = await this.interlinkingSystem.insertStrategicLinks(
          workflow.config.contentId || workflowId,
          finalContent,
          {
            maxLinks: workflow.config.maxLinks || 8,
            preferNaturalAnchors: true
          }
        );
        
        enhancedContent = linkInsertionResult.content;
        workflow.linksInserted = linkInsertionResult.appliedOpportunities || [];
        
        this.workflowMetrics.linksInserted += linkInsertionResult.linksInserted || 0;
      }
      
      // Final quality validation
      const finalQualityScore = await this.performFinalQualityValidation(
        workflow,
        enhancedContent
      );
      
      // Update workflow completion
      workflow.status = 'completed';
      workflow.completedAt = Date.now();
      workflow.duration = workflow.completedAt - workflow.startedAt;
      workflow.finalContent = enhancedContent;
      workflow.qualityScores.final = finalQualityScore;
      
      // Calculate quality improvement
      const qualityImprovement = workflow.qualityScores.final - workflow.qualityScores.initial;
      workflow.qualityImprovement = qualityImprovement;
      
      // Update metrics
      this.workflowMetrics.workflowsCompleted++;
      this.workflowMetrics.averageQualityImprovement = 
        (this.workflowMetrics.averageQualityImprovement + qualityImprovement) / 2;
      
      // Store in workflow history
      this.workflowHistory.push({
        ...workflow,
        archivedAt: Date.now()
      });
      
      // Remove from active workflows
      this.activeWorkflows.delete(workflowId);
      
      console.log(`✅ Workflow completed: ${workflowId} with final quality score: ${finalQualityScore}`);
      
      this.emit('workflow-completed', {
        workflowId,
        qualityImprovement,
        linksInserted: workflow.linksInserted.length,
        duration: workflow.duration
      });
      
      return {
        workflowId,
        finalContent: enhancedContent,
        qualityScore: finalQualityScore,
        qualityImprovement,
        linksInserted: workflow.linksInserted.length,
        revisionCycles: workflow.revisionCycle,
        duration: workflow.duration
      };
      
    } catch (error) {
      console.error('❌ Workflow completion failed:', error.message);
      throw error;
    }
  }

  /**
   * Trigger revision cycle for quality improvement
   */
  async triggerRevisionCycle(workflow, stepIndex, qualityResult) {
    workflow.revisionCycle++;
    
    if (workflow.revisionCycle > this.workflowConfig.qualityThresholds.maxRevisionCycles) {
      console.warn(`⚠️ Maximum revision cycles reached for workflow ${workflow.workflowId}`);
      return {
        success: false,
        reason: 'max-revisions-reached',
        requiresHumanReview: true,
        feedback: qualityResult.feedback
      };
    }
    
    console.log(`🔄 Triggering revision cycle ${workflow.revisionCycle} for step ${stepIndex + 1}`);
    
    // Generate detailed revision guidance
    const revisionGuidance = await this.generateRevisionGuidance(
      qualityResult.issues,
      qualityResult.feedback,
      workflow.config.outline?.sections?.[stepIndex]
    );
    
    this.emit('revision-triggered', {
      workflowId: workflow.workflowId,
      stepIndex,
      revisionCycle: workflow.revisionCycle,
      guidance: revisionGuidance
    });
    
    return {
      success: true,
      requiresRevision: true,
      revisionCycle: workflow.revisionCycle,
      guidance: revisionGuidance,
      issues: qualityResult.issues
    };
  }

  /**
   * Generate revision guidance
   */
  async generateRevisionGuidance(issues, feedback, outlineSection) {
    const guidance = {
      summary: `Revision required to address ${issues.length} quality issues`,
      priority: 'high',
      specificActions: [],
      outlineReminder: null
    };
    
    // Convert issues into actionable guidance
    for (const issue of issues) {
      let action = '';
      
      switch (issue.type) {
        case 'outline-deviation':
          action = `Realign content with outline: ${issue.expected}`;
          break;
        case 'missing-element':
          action = `Add missing element: ${issue.description}`;
          break;
        case 'quality-criteria':
          action = `Improve quality: ${issue.suggestions?.join(', ') || issue.description}`;
          break;
        default:
          action = issue.description;
      }
      
      guidance.specificActions.push({
        type: issue.type,
        action,
        priority: issue.severity,
        suggestions: issue.suggestions || []
      });
    }
    
    // Add outline reminder
    if (outlineSection) {
      guidance.outlineReminder = {
        title: outlineSection.title,
        expectedContent: outlineSection.content || outlineSection.description,
        keywords: outlineSection.keywords || [],
        requirements: outlineSection.requirements || []
      };
    }
    
    return guidance;
  }

  /**
   * Setup event handlers for quality control systems
   */
  setupEventHandlers() {
    // Quality audit system events
    this.qualityAuditSystem.on('quality-issues-found', (data) => {
      console.log(`⚠️ Quality issues found in workflow: ${data.auditId}`);
      this.emit('quality-issues', data);
    });
    
    // Interlinking system events
    this.interlinkingSystem.on('links-inserted', (data) => {
      console.log(`🔗 Links inserted in content: ${data.contentId}`);
      this.emit('interlinking-complete', data);
    });
    
    // Forward important events
    this.qualityAuditSystem.on('audit-started', (data) => {
      this.emit('quality-audit-started', data);
    });
    
    this.interlinkingSystem.on('interlinking-analysis-complete', (data) => {
      this.emit('interlinking-analysis-complete', data);
    });
  }

  /**
   * Get workflow status and feedback
   */
  async getWorkflowStatus(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return null;
    }
    
    // Get pending feedback from quality audit system
    const pendingFeedback = await this.qualityAuditSystem.getPendingFeedback(workflowId);
    
    return {
      workflowId: workflow.workflowId,
      status: workflow.status,
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      qualityScore: workflow.qualityScores.current,
      targetQualityScore: workflow.qualityScores.target,
      revisionCycle: workflow.revisionCycle,
      pendingFeedback,
      recentFeedback: workflow.feedback.slice(-3),
      linksInserted: workflow.linksInserted.length,
      duration: Date.now() - workflow.startedAt
    };
  }

  /**
   * Get enhanced workflow statistics
   */
  getEnhancedWorkflowStatistics() {
    const qualityStats = this.qualityAuditSystem.getQualityStatistics();
    const interlinkingStats = this.interlinkingSystem.getInterlinkingStatistics();
    
    return {
      workflows: this.workflowMetrics,
      qualityControl: qualityStats,
      interlinking: interlinkingStats,
      activeWorkflows: this.activeWorkflows.size,
      completedWorkflows: this.workflowHistory.length
    };
  }

  /**
   * Validate workflow configuration
   */
  validateWorkflowConfig(config) {
    const errors = [];
    
    if (!config.contentId && !config.title) {
      errors.push('Content ID or title is required');
    }
    
    if (config.enableQualityControl !== false && !config.outline) {
      errors.push('Outline is required when quality control is enabled');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = EnhancedWorkflowController;