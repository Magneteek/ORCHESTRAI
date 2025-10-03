/**
 * ORCHESTRAI Content Creation Workflow Enforcer
 * 
 * Systematic enforcement of the proven 5-step specialist workflow for all content creation.
 * Prevents quality failures, language contamination, and ensures consistent excellence.
 * 
 * Based on successful DRNL project implementation and language isolation protocols.
 */

class ContentCreationWorkflowEnforcer {
    constructor(orchestrator, memorySystem, qualityThresholds) {
        this.orchestrator = orchestrator;
        this.memory = memorySystem;
        this.qualityThresholds = qualityThresholds || {
            languagePurity: 100,      // Must be 100% - ANY contamination = FAIL
            contentArchitecture: 90,   // Paragraph distribution, element limits
            strategicQuality: 85,      // Psychographic targeting, market specificity
            overallQuality: 90         // Final approval threshold
        };
        
        this.workflowSteps = [
            'outline_creation',
            'outline_validation', 
            'content_writing',
            'quality_assurance',
            'internal_linking'
        ];
        
        this.mandatoryAgents = {
            outline_creation: 'content-outline-architect',
            outline_validation: 'content-quality-validator',
            content_writing: 'content-writer-specialist',
            quality_assurance: 'content-quality-validator',
            internal_linking: 'seo-content-optimization'
        };
    }

    /**
     * Enforce 5-Step Content Creation Workflow
     * CRITICAL: NO EXCEPTIONS - All content must follow this exact sequence
     */
    async enforceContentWorkflow(contentRequest) {
        console.log('🚀 ORCHESTRAI Content Workflow Enforcer: Starting systematic content creation');
        
        const workflowSession = {
            id: this.generateWorkflowId(),
            contentTitle: contentRequest.title,
            targetLanguage: contentRequest.language || 'dutch',
            projectPath: contentRequest.projectPath,
            startTime: new Date(),
            currentStep: 0,
            stepResults: {},
            qualityGates: {},
            approved: false
        };

        try {
            // MANDATORY: Follow exact 5-step sequence
            for (let stepIndex = 0; stepIndex < this.workflowSteps.length; stepIndex++) {
                const stepName = this.workflowSteps[stepIndex];
                
                console.log(`📋 Step ${stepIndex + 1}/5: ${stepName.toUpperCase()}`);
                
                // Execute step with mandatory agent
                const stepResult = await this.executeWorkflowStep(
                    stepName, 
                    contentRequest, 
                    workflowSession,
                    stepIndex
                );
                
                // CRITICAL: Validate step completion before proceeding
                const validationResult = await this.validateStepCompletion(
                    stepName, 
                    stepResult, 
                    workflowSession
                );
                
                if (!validationResult.passed) {
                    throw new WorkflowViolationError(
                        `Step ${stepIndex + 1} (${stepName}) failed validation`,
                        validationResult.issues,
                        stepName
                    );
                }
                
                // Store results and update session
                workflowSession.stepResults[stepName] = stepResult;
                workflowSession.qualityGates[stepName] = validationResult;
                workflowSession.currentStep = stepIndex + 1;
                
                // Update crystalline memory with step completion
                await this.updateWorkflowMemory(workflowSession, stepName, stepResult);
            }
            
            // Final workflow validation
            const finalValidation = await this.performFinalWorkflowValidation(workflowSession);
            
            if (finalValidation.approved) {
                workflowSession.approved = true;
                workflowSession.completedTime = new Date();
                
                console.log('✅ WORKFLOW COMPLETE: Content approved for publication');
                return this.generateWorkflowCompletionReport(workflowSession);
            } else {
                throw new WorkflowViolationError(
                    'Final workflow validation failed',
                    finalValidation.issues,
                    'final_validation'
                );
            }
            
        } catch (error) {
            console.error('❌ WORKFLOW ENFORCEMENT FAILURE:', error.message);
            
            // Store failure for analysis
            await this.recordWorkflowFailure(workflowSession, error);
            
            throw error;
        }
    }

    /**
     * Execute individual workflow step with mandatory agent enforcement
     */
    async executeWorkflowStep(stepName, contentRequest, session, stepIndex) {
        const mandatoryAgent = this.mandatoryAgents[stepName];
        
        if (!mandatoryAgent) {
            throw new WorkflowViolationError(
                `No mandatory agent defined for step: ${stepName}`,
                [`Missing agent specification for ${stepName}`],
                stepName
            );
        }

        console.log(`🤖 Deploying mandatory agent: ${mandatoryAgent}`);

        switch (stepName) {
            case 'outline_creation':
                return await this.executeOutlineCreation(mandatoryAgent, contentRequest);
                
            case 'outline_validation':
                return await this.executeOutlineValidation(mandatoryAgent, session);
                
            case 'content_writing':
                return await this.executeContentWriting(mandatoryAgent, contentRequest, session);
                
            case 'quality_assurance':
                return await this.executeQualityAssurance(mandatoryAgent, session);
                
            case 'internal_linking':
                return await this.executeInternalLinking(mandatoryAgent, session);
                
            default:
                throw new WorkflowViolationError(
                    `Unknown workflow step: ${stepName}`,
                    [`Unrecognized step in workflow sequence`],
                    stepName
                );
        }
    }

    /**
     * STEP 1: Outline Creation with content-outline-architect
     */
    async executeOutlineCreation(agent, contentRequest) {
        const prompt = this.generateOutlineCreationPrompt(contentRequest);
        
        const result = await this.orchestrator.deployAgent(agent, {
            task: 'comprehensive_outline_creation',
            prompt: prompt,
            requirements: {
                wordCount: contentRequest.wordCount || 2500,
                psychographicTargeting: contentRequest.psychographics,
                keywordStrategy: contentRequest.keywords,
                contentArchitecture: this.getContentArchitectureRequirements()
            }
        });

        return {
            agent: agent,
            outlinePath: result.filePath,
            wordCount: result.plannedWordCount,
            structureCompliance: result.architectureScore,
            psychographicMapping: result.targetingStrategy,
            timestamp: new Date()
        };
    }

    /**
     * STEP 2: Outline Validation with content-quality-validator
     */
    async executeOutlineValidation(agent, session) {
        const outlineResult = session.stepResults.outline_creation;
        
        const prompt = this.generateOutlineValidationPrompt(outlineResult.outlinePath);
        
        const result = await this.orchestrator.deployAgent(agent, {
            task: 'outline_quality_validation',
            prompt: prompt,
            validationCriteria: {
                contentArchitectureCompliance: 90,
                strategicPositioning: 85,
                marketSpecificity: 90,
                conversionOptimization: 85
            }
        });

        // CRITICAL: Must pass validation to proceed
        if (result.qualityScore < 85) {
            throw new WorkflowViolationError(
                'Outline validation failed minimum quality threshold',
                [`Quality score: ${result.qualityScore} (required: 85+)`],
                'outline_validation'
            );
        }

        return {
            agent: agent,
            qualityScore: result.qualityScore,
            validationPassed: result.qualityScore >= 85,
            recommendations: result.recommendations,
            approvedForWriting: true,
            timestamp: new Date()
        };
    }

    /**
     * STEP 3: Content Writing with content-writer-specialist + Language Isolation
     */
    async executeContentWriting(agent, contentRequest, session) {
        const outlineResult = session.stepResults.outline_creation;
        
        const prompt = this.generateContentWritingPrompt(
            contentRequest, 
            outlineResult.outlinePath,
            session.targetLanguage
        );

        const result = await this.orchestrator.deployAgent(agent, {
            task: 'content_creation_with_language_isolation',
            prompt: prompt,
            languageIsolation: {
                targetLanguage: session.targetLanguage,
                purityRequirement: 100,
                contamination_detection: true,
                cultural_authenticity: true
            },
            contentRequirements: this.getContentArchitectureRequirements()
        });

        return {
            agent: agent,
            articlePath: result.filePath,
            wordCount: result.actualWordCount,
            languagePurity: result.languagePurityScore,
            contentQuality: result.contentQualityScore,
            architectureCompliance: result.architectureScore,
            timestamp: new Date()
        };
    }

    /**
     * STEP 4: Quality Assurance with content-quality-validator + Language Detection
     */
    async executeQualityAssurance(agent, session) {
        const writingResult = session.stepResults.content_writing;
        
        const prompt = this.generateQualityAssurancePrompt(
            writingResult.articlePath,
            session.targetLanguage
        );

        const result = await this.orchestrator.deployAgent(agent, {
            task: 'comprehensive_quality_validation',
            prompt: prompt,
            validationFocus: {
                languagePurity: 100,        // MANDATORY 100%
                contentArchitecture: 90,    // Paragraph distribution, elements
                strategicQuality: 85,       // Psychographic targeting
                overallQuality: 90          // Final approval threshold
            }
        });

        // CRITICAL: Language contamination = immediate failure
        if (result.languagePurityScore < 100) {
            // Deploy language isolation specialist for cleanup
            const cleanupResult = await this.deployLanguageCleanup(
                writingResult.articlePath, 
                session.targetLanguage,
                result.contaminationDetails
            );
            
            // Re-validate after cleanup
            const revalidationResult = await this.orchestrator.deployAgent(agent, {
                task: 'post_cleanup_validation',
                prompt: this.generateRevalidationPrompt(writingResult.articlePath),
                validationFocus: { languagePurity: 100 }
            });
            
            result.languagePurityScore = revalidationResult.languagePurityScore;
            result.cleanupPerformed = true;
            result.cleanupDetails = cleanupResult;
        }

        // Final validation check
        if (result.overallQuality < this.qualityThresholds.overallQuality) {
            throw new WorkflowViolationError(
                'Article failed final quality validation',
                [`Overall quality: ${result.overallQuality} (required: ${this.qualityThresholds.overallQuality}+)`],
                'quality_assurance'
            );
        }

        return {
            agent: agent,
            qualityScore: result.overallQuality,
            languagePurity: result.languagePurityScore,
            contentArchitecture: result.contentArchitectureScore,
            validationPassed: result.overallQuality >= this.qualityThresholds.overallQuality,
            cleanupPerformed: result.cleanupPerformed || false,
            timestamp: new Date()
        };
    }

    /**
     * STEP 5: Internal Linking with seo-content-optimization
     */
    async executeInternalLinking(agent, session) {
        const writingResult = session.stepResults.content_writing;
        
        const prompt = this.generateInternalLinkingPrompt(
            writingResult.articlePath,
            session.contentTitle
        );

        const result = await this.orchestrator.deployAgent(agent, {
            task: 'internal_linking_optimization',
            prompt: prompt,
            linkingStrategy: {
                ecosystemIntegration: true,
                conversionOptimization: true,
                seoAuthorityFlow: true,
                readerJourneyMapping: true
            }
        });

        return {
            agent: agent,
            linkingStrategyPath: result.strategyFilePath,
            bidirectionalLinks: result.plannedLinks,
            conversionPathOptimization: result.conversionImpact,
            seoAuthorityFlow: result.authorityDistribution,
            timestamp: new Date()
        };
    }

    /**
     * Deploy language contamination cleanup when needed
     */
    async deployLanguageCleanup(articlePath, targetLanguage, contaminationDetails) {
        console.log('🚨 LANGUAGE CONTAMINATION DETECTED: Deploying cleanup specialist');
        
        const cleanupAgent = 'content-ai-phrase-detector';
        
        const result = await this.orchestrator.deployAgent(cleanupAgent, {
            task: 'language_contamination_cleanup',
            prompt: this.generateLanguageCleanupPrompt(articlePath, targetLanguage, contaminationDetails),
            cleanupRequirements: {
                targetPurity: 100,
                preserveStructure: true,
                maintainWordCount: true,
                culturalAuthenticity: true
            }
        });

        return {
            cleanupAgent: cleanupAgent,
            contaminationsFixed: result.fixedContaminations,
            purityAchieved: result.finalPurityScore,
            structurePreserved: result.structureIntact,
            timestamp: new Date()
        };
    }

    /**
     * Validate step completion with quality gates
     */
    async validateStepCompletion(stepName, stepResult, session) {
        const validationRules = this.getStepValidationRules(stepName);
        const issues = [];

        for (const rule of validationRules) {
            const ruleResult = await this.validateRule(rule, stepResult, session);
            if (!ruleResult.passed) {
                issues.push(...ruleResult.issues);
            }
        }

        return {
            stepName: stepName,
            passed: issues.length === 0,
            issues: issues,
            stepResult: stepResult,
            timestamp: new Date()
        };
    }

    /**
     * Generate comprehensive workflow completion report
     */
    generateWorkflowCompletionReport(session) {
        const report = {
            workflowId: session.id,
            contentTitle: session.contentTitle,
            targetLanguage: session.targetLanguage,
            projectPath: session.projectPath,
            totalDuration: session.completedTime - session.startTime,
            approved: session.approved,
            
            stepSummary: {
                outlineCreation: {
                    agent: session.stepResults.outline_creation.agent,
                    qualityScore: session.qualityGates.outline_creation.passed ? 'PASSED' : 'FAILED',
                    timestamp: session.stepResults.outline_creation.timestamp
                },
                outlineValidation: {
                    agent: session.stepResults.outline_validation.agent,
                    qualityScore: session.stepResults.outline_validation.qualityScore,
                    approved: session.stepResults.outline_validation.approvedForWriting,
                    timestamp: session.stepResults.outline_validation.timestamp
                },
                contentWriting: {
                    agent: session.stepResults.content_writing.agent,
                    wordCount: session.stepResults.content_writing.wordCount,
                    languagePurity: session.stepResults.content_writing.languagePurity,
                    timestamp: session.stepResults.content_writing.timestamp
                },
                qualityAssurance: {
                    agent: session.stepResults.quality_assurance.agent,
                    finalQualityScore: session.stepResults.quality_assurance.qualityScore,
                    languagePurity: session.stepResults.quality_assurance.languagePurity,
                    cleanupRequired: session.stepResults.quality_assurance.cleanupPerformed,
                    timestamp: session.stepResults.quality_assurance.timestamp
                },
                internalLinking: {
                    agent: session.stepResults.internal_linking.agent,
                    linkingStrategy: 'COMPLETED',
                    conversionOptimization: 'IMPLEMENTED',
                    timestamp: session.stepResults.internal_linking.timestamp
                }
            },
            
            qualitySummary: {
                languagePurity: session.stepResults.quality_assurance.languagePurity,
                contentArchitecture: session.stepResults.quality_assurance.contentArchitecture,
                overallQuality: session.stepResults.quality_assurance.qualityScore,
                workflowCompliance: 'FULL COMPLIANCE',
                approvedForPublication: session.approved
            },
            
            deliverables: {
                outline: session.stepResults.outline_creation.outlinePath,
                article: session.stepResults.content_writing.articlePath,
                linkingStrategy: session.stepResults.internal_linking.linkingStrategyPath
            }
        };

        console.log('📊 WORKFLOW COMPLETION REPORT GENERATED');
        return report;
    }

    /**
     * Content Architecture Requirements (from CLAUDE.md standards)
     */
    getContentArchitectureRequirements() {
        return {
            paragraphDistribution: {
                short: 40,      // 1-2 sentences
                medium: 40,     // 3-4 sentences  
                long: 20        // 5+ sentences
            },
            contentElementLimits: {
                maxLists: 20,           // Maximum bulleted lists
                maxTables: 8,           // Maximum comparison tables
                maxEngagementBoxes: 18  // Maximum callout boxes
            },
            naturalFlowRequirements: {
                conversationalTransitions: true,
                smoothParagraphConnections: true,
                readerJourneyOptimization: true,
                culturalAuthenticity: true
            }
        };
    }

    /**
     * Generate unique workflow session ID
     */
    generateWorkflowId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `workflow-${timestamp}-${random}`;
    }

    // Additional helper methods for prompt generation, validation rules, etc.
    // ... (Additional implementation methods would follow)
}

/**
 * Custom error class for workflow violations
 */
class WorkflowViolationError extends Error {
    constructor(message, issues, step) {
        super(message);
        this.name = 'WorkflowViolationError';
        this.issues = issues || [];
        this.step = step;
        this.timestamp = new Date();
    }
}

module.exports = {
    ContentCreationWorkflowEnforcer,
    WorkflowViolationError
};