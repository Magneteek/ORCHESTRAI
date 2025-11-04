/**
 * ORCHESTRAI Workflow Enforcement Configuration
 * 
 * Configuration system for enforcing the proven 5-step content creation workflow.
 * Integrates with main orchestrator to prevent quality failures and ensure consistency.
 */

const workflowEnforcementConfig = {
    
    // CRITICAL: Mandatory workflow sequence - NO EXCEPTIONS
    mandatoryWorkflowSteps: [
        {
            step: 1,
            name: 'outline_creation',
            agent: 'content-outline-architect',
            description: 'Create comprehensive article outline with psychographic targeting',
            mandatory: true,
            qualityThreshold: 85,
            timeout: 600000, // 10 minutes
            validation: {
                required: ['wordCount', 'structureCompliance', 'psychographicMapping'],
                minimumQualityScore: 85
            }
        },
        {
            step: 2,
            name: 'outline_validation',
            agent: 'content-quality-validator',
            description: 'Validate outline quality before proceeding to writing',
            mandatory: true,
            qualityThreshold: 85,
            timeout: 300000, // 5 minutes
            validation: {
                required: ['qualityScore', 'validationPassed', 'approvedForWriting'],
                minimumQualityScore: 85,
                blockingGate: true // MUST pass to continue
            }
        },
        {
            step: 3,
            name: 'content_writing',
            agent: 'content-writer-specialist',
            description: 'Write article with language isolation enforcement',
            mandatory: true,
            languageIsolation: true,
            timeout: 900000, // 15 minutes
            validation: {
                required: ['articlePath', 'wordCount', 'languagePurity'],
                minimumLanguagePurity: 95, // Will be cleaned if below 100
                architectureCompliance: 90
            }
        },
        {
            step: 4,
            name: 'quality_assurance',
            agent: 'content-quality-validator',
            description: 'Comprehensive quality validation with language contamination detection',
            mandatory: true,
            criticalValidation: true,
            timeout: 600000, // 10 minutes
            validation: {
                required: ['qualityScore', 'languagePurity', 'validationPassed'],
                minimumQualityScore: 90,
                requiredLanguagePurity: 100, // CRITICAL: Must be 100%
                autoCleanupOnFail: true
            }
        },
        {
            step: 5,
            name: 'internal_linking',
            agent: 'seo-content-optimization',
            description: 'Create comprehensive internal linking strategy',
            mandatory: true,
            timeout: 450000, // 7.5 minutes
            validation: {
                required: ['linkingStrategyPath', 'bidirectionalLinks', 'conversionPathOptimization'],
                minimumLinkCount: 6
            }
        }
    ],

    // Language isolation enforcement rules
    languageIsolationRules: {
        dutch: {
            purityRequirement: 100,
            contaminationPatterns: [
                // English business terms that commonly contaminate Dutch content
                'ROI', 'DIY', 'No Cure No Pay', 'professional', 'business', 
                'management', 'template', 'checklist', 'breakdown', 'analysis',
                'assessment', 'competitor', 'timeline', 'evidence', 'protocol'
            ],
            replacementMappings: {
                'ROI': 'rendement',
                'DIY': 'zelf-doen',
                'No Cure No Pay': 'Geen Resultaat, Geen Betaling',
                'professional': 'professioneel',
                'business': 'bedrijf',
                'management': 'beheer',
                'template': 'sjabloon',
                'checklist': 'controlelijst',
                'breakdown': 'uitsplitsing',
                'analysis': 'analyse',
                'assessment': 'beoordeling',
                'competitor': 'concurrent',
                'timeline': 'tijdlijn',
                'evidence': 'bewijs',
                'protocol': 'procedure'
            },
            cleanupAgent: 'content-ai-phrase-detector',
            validationAgent: 'content-quality-validator'
        },
        
        slovenian: {
            purityRequirement: 100,
            contaminationPatterns: [
                // Common English terms that contaminate Slovenian content
                'business', 'marketing', 'content', 'digital', 'online',
                'professional', 'management', 'strategy', 'optimization'
            ],
            replacementMappings: {
                'business': 'podjetje',
                'marketing': 'trženje',
                'content': 'vsebina',
                'digital': 'digitalno',
                'online': 'spletno',
                'professional': 'profesionalno',
                'management': 'upravljanje',
                'strategy': 'strategija',
                'optimization': 'optimizacija'
            },
            cleanupAgent: 'content-ai-phrase-detector',
            validationAgent: 'content-quality-validator'
        }
    },

    // Content architecture compliance rules (from CLAUDE.md)
    contentArchitectureRules: {
        paragraphDistribution: {
            short: { target: 40, tolerance: 5 },      // 1-2 sentences
            medium: { target: 40, tolerance: 5 },     // 3-4 sentences
            long: { target: 20, tolerance: 5 }        // 5+ sentences
        },
        contentElementLimits: {
            maxBulletedLists: 20,
            maxTables: 8,
            maxEngagementBoxes: 18,
            maxBoldTextUsage: 15
        },
        naturalFlowRequirements: {
            conversationalTransitions: true,
            smoothParagraphConnections: true,
            readerJourneyOptimization: true,
            psychographicTargeting: true
        }
    },

    // Quality thresholds that must be met
    qualityThresholds: {
        outline: {
            minimumScore: 85,
            requiredElements: ['psychographicTargeting', 'keywordStrategy', 'contentArchitecture']
        },
        content: {
            minimumQualityScore: 90,
            requiredLanguagePurity: 100,  // CRITICAL: Must be 100%
            minimumArchitectureCompliance: 90
        },
        validation: {
            overallQuality: 90,
            languagePurity: 100,
            contentArchitecture: 90,
            strategicAlignment: 85
        }
    },

    // Workflow violation handling
    violationHandling: {
        stepFailure: {
            action: 'stop_and_report',
            allowRetry: true,
            maxRetries: 2,
            escalation: 'human_review'
        },
        languageContamination: {
            action: 'automatic_cleanup',
            cleanupAgent: 'content-ai-phrase-detector',
            revalidationRequired: true,
            failureEscalation: 'workflow_abort'
        },
        qualityFailure: {
            action: 'detailed_analysis',
            generateReport: true,
            requireApproval: true
        }
    },

    // Integration with ORCHESTRAI orchestration patterns
    orchestrationIntegration: {
        geometricCoordination: true,
        crystallineMemoryUpdates: true,
        pipelineSharing: true,
        agentCoordination: {
            sequential: true,           // Steps must be completed in order
            validation: 'mandatory',   // Each step must pass validation
            memoryPersistence: true    // Store results in crystalline memory
        }
    },

    // Workflow enforcement prompts for each step
    enforcementPrompts: {
        outline_creation: `
Create a comprehensive article outline following ORCHESTRAI content architecture standards.

MANDATORY REQUIREMENTS:
- Psychographic targeting with percentage distribution
- Primary and secondary keyword strategy
- Content Requirements in paragraph form (NOT lists)
- Engagement Elements (tables, boxes, occasional lists)
- Word count distribution per section
- Internal linking architecture planning
- Conversion path optimization strategy

CONTENT ARCHITECTURE COMPLIANCE:
- 40% short paragraphs (1-2 sentences)
- 40% medium paragraphs (3-4 sentences)  
- 20% long paragraphs (5+ sentences)
- Maximum 16-20 lists total
- 6-8 tables maximum
- 15-18 engagement boxes

TARGET LANGUAGE: {targetLanguage}
MARKET FOCUS: {marketSpecificity}
BUSINESS CONTEXT: {businessContext}
        `,

        outline_validation: `
Perform comprehensive validation of the article outline before writing proceeds.

CRITICAL VALIDATION AREAS:
1. Content Architecture Compliance (paragraph distribution, element limits)
2. Strategic Positioning (psychographic targeting, market specificity)
3. SEO Integration (keyword strategy, search intent alignment)
4. Conversion Path Optimization (reader journey, CTA strategy)
5. Cultural Authenticity (market-specific context and language)

QUALITY THRESHOLDS:
- Overall quality: 85% minimum
- Content architecture: 90% compliance required
- Strategic positioning: 85% alignment required

BLOCKING GATE: Content writing CANNOT proceed without validation approval.
        `,

        content_writing: `
Write the complete article following the approved outline with strict language isolation.

CRITICAL WRITING REQUIREMENTS:
1. 100% {targetLanguage} language purity - ZERO English contamination
2. Content architecture compliance (paragraph distribution)
3. Conversational expert tone throughout
4. Psychographic targeting execution
5. Natural keyword integration
6. Cultural authenticity for {marketContext}

LANGUAGE ISOLATION ENFORCEMENT:
- NO English business terms, jargon, or phrases
- Use authentic {targetLanguage} equivalents for all concepts
- Maintain cultural context and business practices
- Natural transitions between sections

CONTENT STRUCTURE:
Follow outline exactly while maintaining natural, conversational flow.
        `,

        quality_assurance: `
Perform comprehensive quality validation with language contamination detection.

MANDATORY VALIDATION AREAS:
1. Language Purity (CRITICAL): Scan for ANY English contamination
2. Content Architecture: Paragraph distribution and element compliance
3. Strategic Quality: Psychographic targeting and market authenticity
4. SEO Integration: Keyword placement and search intent alignment
5. Conversion Optimization: Reader journey and CTA effectiveness

CRITICAL THRESHOLDS:
- Language Purity: Must be 100% (ANY contamination = FAIL)
- Content Architecture: 90%+ compliance required
- Overall Quality: 90%+ for approval

CONTAMINATION DETECTION: Report specific English words/phrases found.
AUTOMATIC CLEANUP: Deploy language isolation specialist if contamination detected.
        `,

        internal_linking: `
Create comprehensive internal linking strategy for ecosystem integration.

LINKING STRATEGY REQUIREMENTS:
1. Bidirectional linking architecture
2. SEO authority flow optimization
3. Conversion path enhancement
4. Reader journey mapping
5. Keyword synergy strengthening

INTEGRATION TARGETS:
- Existing hub content (crisis, legal, business protection)
- Strategic anchor text optimization
- Natural link placement within content flow
- Conversion point optimization

DELIVERABLE: Complete internal linking strategy with implementation guide.
        `
    }
};

// Export configuration for orchestrator integration
module.exports = {
    workflowEnforcementConfig
};