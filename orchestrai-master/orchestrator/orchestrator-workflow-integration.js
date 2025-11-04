/**
 * ORCHESTRAI Main Orchestrator - Workflow Enforcement Integration
 * 
 * Integrates the proven 5-step content creation workflow into the main orchestration system.
 * Ensures all content creation follows systematic quality standards and prevents failures.
 */

const { ContentCreationWorkflowEnforcer, WorkflowViolationError } = require('./content-creation-workflow-enforcer');
const { workflowEnforcementConfig } = require('./workflow-enforcement-config');
const { CrystallineMemoryManager } = require('../crystalline-memory/memory-manager');
const { GeometricOrchestrator } = require('./geometric-orchestrator');

class EnhancedOrchestrator extends GeometricOrchestrator {
    constructor(config) {
        super(config);
        
        // Initialize workflow enforcement system
        this.workflowEnforcer = new ContentCreationWorkflowEnforcer(
            this,
            this.memorySystem,
            workflowEnforcementConfig.qualityThresholds
        );
        
        // Track workflow sessions
        this.activeWorkflowSessions = new Map();
        this.workflowHistory = [];
        
        console.log('🚀 ORCHESTRAI Enhanced Orchestrator: Workflow enforcement system initialized');
    }

    /**
     * Content Creation Request Handler
     * CRITICAL: All content creation must go through workflow enforcement
     */
    async handleContentCreationRequest(request) {
        console.log('📋 Content Creation Request Received:', request.title);
        
        // Validate request has required parameters
        this.validateContentRequest(request);
        
        try {
            // MANDATORY: Route through workflow enforcement system
            console.log('🔒 ENFORCING 5-STEP WORKFLOW - NO EXCEPTIONS');
            
            const workflowResult = await this.workflowEnforcer.enforceContentWorkflow({
                title: request.title,
                language: request.language || 'dutch',
                wordCount: request.wordCount || 2500,
                projectPath: request.projectPath,
                psychographics: request.psychographicTargeting,
                keywords: request.keywordStrategy,
                marketContext: request.marketContext,
                businessContext: request.businessContext
            });
            
            // Update crystalline memory with successful workflow completion
            await this.updateWorkflowMemory(workflowResult);
            
            // Store workflow session for future reference
            this.workflowHistory.push({
                sessionId: workflowResult.workflowId,
                request: request,
                result: workflowResult,
                completedAt: new Date(),
                status: 'COMPLETED_SUCCESSFULLY'
            });
            
            console.log('✅ CONTENT CREATION WORKFLOW COMPLETED SUCCESSFULLY');
            console.log(`📊 Quality Score: ${workflowResult.qualitySummary.overallQuality}%`);
            console.log(`🌐 Language Purity: ${workflowResult.qualitySummary.languagePurity}%`);
            
            return workflowResult;
            
        } catch (error) {
            console.error('❌ WORKFLOW ENFORCEMENT FAILURE:', error.message);
            
            // Record failure for analysis
            this.workflowHistory.push({
                sessionId: error.workflowId || 'unknown',
                request: request,
                error: error,
                failedAt: new Date(),
                status: 'FAILED',
                failureStep: error.step,
                issues: error.issues
            });
            
            // Generate failure analysis report
            const failureReport = this.generateWorkflowFailureReport(request, error);
            
            throw new WorkflowOrchestrationError(
                `Content creation workflow failed: ${error.message}`,
                failureReport,
                error.step
            );
        }
    }

    /**
     * Validate content creation request has all required parameters
     */
    validateContentRequest(request) {
        const required = ['title', 'projectPath'];
        const missing = required.filter(field => !request[field]);
        
        if (missing.length > 0) {
            throw new WorkflowOrchestrationError(
                'Invalid content creation request',
                [`Missing required fields: ${missing.join(', ')}`],
                'request_validation'
            );
        }

        // Validate project path exists and follows ORCHESTRAI standards
        if (!this.validateProjectPath(request.projectPath)) {
            throw new WorkflowOrchestrationError(
                'Invalid project path',
                ['Project path must follow ORCHESTRAI structure: /projects/{uuid}/'],
                'project_validation'
            );
        }
    }

    /**
     * Deploy agent through geometric orchestration with workflow tracking
     */
    async deployAgent(agentType, taskConfig) {
        console.log(`🤖 Deploying Agent: ${agentType}`);
        
        // Track agent deployment in workflow context
        const deploymentId = this.generateDeploymentId();
        const startTime = Date.now();
        
        try {
            // Execute agent deployment through geometric orchestration
            const result = await super.deployAgent(agentType, taskConfig);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Log successful deployment
            console.log(`✅ Agent ${agentType} completed in ${duration}ms`);
            
            return {
                ...result,
                deploymentId: deploymentId,
                duration: duration,
                success: true,
                timestamp: new Date()
            };
            
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.error(`❌ Agent ${agentType} failed after ${duration}ms:`, error.message);
            
            throw new AgentDeploymentError(
                `Agent deployment failed: ${error.message}`,
                agentType,
                deploymentId,
                duration
            );
        }
    }

    /**
     * Update crystalline memory with workflow completion
     */
    async updateWorkflowMemory(workflowResult) {
        const memoryUpdate = {
            entityType: 'content_workflow',
            entityName: `workflow_${workflowResult.workflowId}`,
            observations: [
                `Workflow completed successfully for: ${workflowResult.contentTitle}`,
                `Language: ${workflowResult.targetLanguage}`,
                `Quality score: ${workflowResult.qualitySummary.overallQuality}%`,
                `Language purity: ${workflowResult.qualitySummary.languagePurity}%`,
                `All 5 steps completed with mandatory agent enforcement`,
                `Deliverables: outline, article, internal linking strategy`
            ]
        };

        await this.memorySystem.createEntity(memoryUpdate);

        // Create relationships to project and content entities
        await this.memorySystem.createRelations([
            {
                from: `workflow_${workflowResult.workflowId}`,
                to: 'content_creation_system',
                relationType: 'validates_quality_standards'
            },
            {
                from: `workflow_${workflowResult.workflowId}`,
                to: workflowResult.contentTitle,
                relationType: 'produced_content'
            }
        ]);
    }

    /**
     * Generate workflow failure analysis report
     */
    generateWorkflowFailureReport(request, error) {
        return {
            failureAnalysis: {
                workflowStep: error.step || 'unknown',
                failureType: error.name || 'UnknownError',
                specificIssues: error.issues || [],
                requestDetails: {
                    title: request.title,
                    language: request.language,
                    projectPath: request.projectPath
                }
            },
            recommendedActions: this.generateFailureRecommendations(error),
            preventionStrategy: this.generatePreventionStrategy(error),
            qualityImprovements: this.generateQualityImprovements(error)
        };
    }

    /**
     * Generate recommendations based on failure type
     */
    generateFailureRecommendations(error) {
        const recommendations = [];
        
        switch (error.step) {
            case 'outline_creation':
                recommendations.push('Review psychographic targeting specificity');
                recommendations.push('Ensure keyword strategy is comprehensive');
                recommendations.push('Verify content architecture planning compliance');
                break;
                
            case 'outline_validation':
                recommendations.push('Improve outline quality before proceeding');
                recommendations.push('Address validation issues identified');
                recommendations.push('Ensure minimum quality threshold is met');
                break;
                
            case 'content_writing':
                recommendations.push('Review language isolation requirements');
                recommendations.push('Ensure cultural authenticity for target market');
                recommendations.push('Verify content architecture compliance');
                break;
                
            case 'quality_assurance':
                recommendations.push('Deploy language contamination cleanup');
                recommendations.push('Address specific quality issues identified');
                recommendations.push('Ensure 100% language purity requirement met');
                break;
                
            case 'internal_linking':
                recommendations.push('Review ecosystem integration strategy');
                recommendations.push('Ensure bidirectional linking architecture');
                recommendations.push('Verify conversion path optimization');
                break;
                
            default:
                recommendations.push('Review entire workflow for systematic issues');
                recommendations.push('Validate all agent deployments and configurations');
        }
        
        return recommendations;
    }

    /**
     * Generate prevention strategy for future workflow improvements
     */
    generatePreventionStrategy(error) {
        return {
            processImprovements: [
                'Enhanced agent prompt specificity',
                'Stricter validation gate enforcement',
                'Improved language isolation protocols'
            ],
            qualityEnhancements: [
                'Additional validation checkpoints',
                'Real-time contamination detection',
                'Enhanced cultural authenticity validation'
            ],
            systemOptimization: [
                'Workflow automation improvements',
                'Agent coordination enhancement',
                'Memory system integration strengthening'
            ]
        };
    }

    /**
     * Generate unique deployment ID for tracking
     */
    generateDeploymentId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `deploy-${timestamp}-${random}`;
    }

    /**
     * Validate project path follows ORCHESTRAI structure
     */
    validateProjectPath(projectPath) {
        const projectPathPattern = /^\/projects\/[a-f0-9-]{36}\/.*$/;
        return projectPathPattern.test(projectPath);
    }

    /**
     * Get workflow enforcement statistics
     */
    getWorkflowStatistics() {
        const total = this.workflowHistory.length;
        const successful = this.workflowHistory.filter(w => w.status === 'COMPLETED_SUCCESSFULLY').length;
        const failed = this.workflowHistory.filter(w => w.status === 'FAILED').length;
        
        const successRate = total > 0 ? (successful / total) * 100 : 0;
        
        return {
            totalWorkflows: total,
            successfulWorkflows: successful,
            failedWorkflows: failed,
            successRate: `${successRate.toFixed(1)}%`,
            activeWorkflows: this.activeWorkflowSessions.size,
            averageQuality: this.calculateAverageQuality(),
            languagePuritySuccess: this.calculateLanguagePuritySuccess()
        };
    }

    /**
     * Calculate average quality score across successful workflows
     */
    calculateAverageQuality() {
        const successful = this.workflowHistory.filter(w => 
            w.status === 'COMPLETED_SUCCESSFULLY' && w.result?.qualitySummary?.overallQuality
        );
        
        if (successful.length === 0) return 'N/A';
        
        const total = successful.reduce((sum, w) => sum + w.result.qualitySummary.overallQuality, 0);
        return `${(total / successful.length).toFixed(1)}%`;
    }

    /**
     * Calculate language purity success rate
     */
    calculateLanguagePuritySuccess() {
        const successful = this.workflowHistory.filter(w => 
            w.status === 'COMPLETED_SUCCESSFULLY' && w.result?.qualitySummary?.languagePurity === 100
        );
        
        const total = this.workflowHistory.filter(w => w.status === 'COMPLETED_SUCCESSFULLY').length;
        
        if (total === 0) return 'N/A';
        
        return `${((successful.length / total) * 100).toFixed(1)}%`;
    }
}

/**
 * Custom error classes for workflow orchestration
 */
class WorkflowOrchestrationError extends Error {
    constructor(message, report, step) {
        super(message);
        this.name = 'WorkflowOrchestrationError';
        this.report = report;
        this.step = step;
        this.timestamp = new Date();
    }
}

class AgentDeploymentError extends Error {
    constructor(message, agentType, deploymentId, duration) {
        super(message);
        this.name = 'AgentDeploymentError';
        this.agentType = agentType;
        this.deploymentId = deploymentId;
        this.duration = duration;
        this.timestamp = new Date();
    }
}

module.exports = {
    EnhancedOrchestrator,
    WorkflowOrchestrationError,
    AgentDeploymentError
};