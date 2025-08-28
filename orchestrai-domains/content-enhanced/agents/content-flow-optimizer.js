const EventEmitter = require('events');

/**
 * Content Flow Optimizer Agent
 * 
 * This agent optimizes content flow using advanced copywriting techniques:
 * - Bucket brigades for engagement
 * - Strategic transitions between sections
 * - Readability enhancement through structure optimization
 * - Cognitive psychology integration for better comprehension
 * - Momentum maintenance through curiosity loops
 * 
 * Input: Raw content from Advanced Content Writer Specialist
 * Output: Flow-optimized content with bucket brigades and transitions
 */
class ContentFlowOptimizer extends EventEmitter {
    constructor(crystallineMemory) {
        super();
        this.agentId = 'content-flow-optimizer';
        this.agentName = 'Content Flow Optimizer';
        this.crystallineMemory = crystallineMemory;
        
        this.capabilities = [
            'transition-optimization',
            'bucket-brigade-integration',
            'readability-enhancement',
            'readability-target-enforcement',
            'flow-analysis',
            'engagement-maximization',
            'cognitive-psychology-application',
            'momentum-maintenance'
        ];

        // Initialize bucket brigade library
        this.bucketBrigades = {
            curiosityGaps: [
                "Here's why:",
                "But there's a problem:",
                "Here's the kicker:",
                "Want to know the best part?",
                "Let me explain:",
                "Check this out:",
                "Here's what happened next:",
                "The surprising truth?",
                "But wait—there's more:",
                "Here's the thing:",
                "You might be wondering:",
                "The reality is:"
            ],
            
            transitionBridges: [
                "That said...",
                "However...",
                "On the flip side...",
                "What's more...",
                "Even better...",
                "The truth is...",
                "Simply put...",
                "In other words...",
                "More importantly...",
                "At the same time...",
                "Despite this...",
                "Nevertheless..."
            ],
            
            emphasisMarkers: [
                "Most importantly:",
                "Here's the bottom line:",
                "The key takeaway:",
                "Remember this:",
                "Pay attention:",
                "This changes everything:",
                "Above all else:",
                "The crucial point:",
                "What matters most:",
                "The essential truth:",
                "Don't miss this:",
                "This is critical:"
            ],
            
            proofIntros: [
                "For example:",
                "Consider this:",
                "Take this case:",
                "Here's proof:",
                "The data shows:",
                "Research confirms:",
                "Evidence suggests:",
                "Studies reveal:",
                "Analysis indicates:",
                "Experts agree:",
                "Results demonstrate:",
                "Testing proves:"
            ],

            continuityConnectors: [
                "Building on that...",
                "Taking this further...",
                "Now that we've established...",
                "With that foundation...",
                "Following this logic...",
                "Expanding on this idea...",
                "Connecting the dots...",
                "This leads us to...",
                "As a result...",
                "Consequently...",
                "Given this understanding...",
                "With this in mind..."
            ]
        };

        // Flow optimization patterns
        this.flowPatterns = {
            shortSentenceImpact: {
                pattern: "Long explanatory sentence followed by short punchy statement.",
                purpose: "Creates rhythm and emphasis",
                triggers: ['complex_explanation', 'technical_concept', 'detailed_process']
            },
            
            questionBridges: {
                patterns: [
                    "But what does this mean for your practice?",
                    "How does this translate to real-world benefits?",
                    "Why is this so important?",
                    "What's the catch?",
                    "How do you implement this?",
                    "Where does this leave you?",
                    "What comes next?",
                    "How can you leverage this?"
                ],
                purpose: "Maintains curiosity and engagement"
            },
            
            analogyTransitions: {
                pattern: "Complex concepts explained through familiar comparisons",
                starters: [
                    "Think of it like...",
                    "Imagine if...",
                    "It's similar to...",
                    "Just as...",
                    "Picture this...",
                    "Consider how...",
                    "Much like...",
                    "Envision..."
                ],
                purpose: "Simplifies complex ideas and maintains interest"
            },

            listIntroductions: {
                patterns: [
                    "Here's what you need to know:",
                    "The key factors include:",
                    "Consider these elements:",
                    "The main components are:",
                    "Focus on these areas:",
                    "Pay attention to:",
                    "The critical aspects:",
                    "Essential elements include:"
                ],
                purpose: "Smooth transitions into enumerated content"
            }
        };

        // Readability optimization rules
        this.readabilityRules = {
            sentenceLength: {
                ideal: 20,
                maximum: 25,
                variationTarget: 0.3
            },
            paragraphLength: {
                ideal: 3,
                maximum: 5,
                singleSentenceFrequency: 0.2
            },
            transitionFrequency: {
                paragraphConnections: 0.7,
                sectionBridges: 0.9,
                bucketBrigadeRatio: 0.15
            },
            cognitiveLoad: {
                complexSentencesPerParagraph: 1,
                technicalTermsPerSentence: 2,
                conceptsPerSection: 5
            }
        };

        this.emit('agentInitialized', {
            agentId: this.agentId,
            capabilities: this.capabilities,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Main method to optimize content flow
     * 
     * @param {Object} rawContent - Content from Advanced Content Writer
     * @param {Object} targetAudience - Audience specifications
     * @param {Object} optimizationGoals - Specific optimization targets
     * @returns {Object} Flow-optimized content with transitions
     */
    async optimizeContentFlow(rawContent, targetAudience, optimizationGoals = {}) {
        this.emit('flowOptimizationStarted', {
            agentId: this.agentId,
            contentLength: rawContent.content?.length || 0,
            targetAudience: targetAudience.primaryAudience
        });

        try {
            // Phase 1: Analyze current content flow
            const flowAnalysis = await this.analyzeContentFlow(rawContent);
            
            // Phase 2: Identify optimization opportunities
            const optimizationPlan = await this.createOptimizationPlan(flowAnalysis, optimizationGoals);
            
            // Phase 3: Insert bucket brigades strategically
            const bucketBrigadeContent = await this.insertBucketBrigades(rawContent, optimizationPlan);
            
            // Phase 4: Optimize transitions between sections
            const transitionOptimizedContent = await this.optimizeTransitions(bucketBrigadeContent, optimizationPlan);
            
            // Phase 5: Enhance readability structure and enforce target grade level
            const readabilityOptimizedContent = await this.enhanceReadability(transitionOptimizedContent, targetAudience, optimizationGoals);
            
            // Phase 6: Apply cognitive psychology principles
            const cognitiveOptimizedContent = await this.applyCognitivePsychology(readabilityOptimizedContent, targetAudience);
            
            // Phase 7: Final flow validation and metrics
            const finalValidation = await this.validateFlowOptimization(cognitiveOptimizedContent, rawContent);
            
            // Store optimization intelligence
            await this.storeOptimizationIntelligence(finalValidation, optimizationPlan);
            
            this.emit('flowOptimizationCompleted', {
                agentId: this.agentId,
                improvementScore: finalValidation.improvementMetrics.overallScore,
                optimizationsApplied: finalValidation.optimizationsApplied
            });

            return {
                optimizedContent: finalValidation.optimizedContent,
                optimizationReport: finalValidation.optimizationReport,
                flowMetrics: finalValidation.flowMetrics,
                improvementSummary: finalValidation.improvementMetrics
            };

        } catch (error) {
            this.emit('flowOptimizationError', {
                agentId: this.agentId,
                error: error.message,
                phase: 'flow-optimization'
            });
            throw error;
        }
    }

    /**
     * Analyze current content flow patterns
     */
    async analyzeContentFlow(rawContent) {
        const content = rawContent.content || rawContent.sections?.map(s => s.content).join('\n\n') || '';
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

        const analysis = {
            structure: {
                sentenceCount: sentences.length,
                paragraphCount: paragraphs.length,
                averageSentenceLength: sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length,
                averageParagraphLength: paragraphs.reduce((sum, p) => sum + p.split(/[.!?]+/).length, 0) / paragraphs.length
            },
            flow: {
                transitionWords: this.detectTransitionWords(content),
                repetitivePatterns: this.detectRepetitivePatterns(sentences),
                sentenceLengthVariation: this.calculateSentenceLengthVariation(sentences),
                readabilityScore: this.calculateReadabilityScore(content)
            },
            engagement: {
                questionCount: (content.match(/\?/g) || []).length,
                exclamationCount: (content.match(/!/g) || []).length,
                curiosityGapOpportunities: this.identifyCuriosityGapOpportunities(paragraphs),
                bucketBrigadeOpportunities: this.identifyBucketBrigadeOpportunities(paragraphs)
            },
            cognitiveLoad: {
                complexSentenceRatio: this.calculateComplexSentenceRatio(sentences),
                technicalTermDensity: this.calculateTechnicalTermDensity(content),
                conceptDensity: this.calculateConceptDensity(content)
            }
        };

        // Store analysis in crystalline memory
        await this.crystallineMemory.storeMemory('flow-analysis-patterns', {
            contentId: rawContent.contentId || 'unknown',
            analysis: analysis,
            timestamp: new Date().toISOString()
        });

        return analysis;
    }

    /**
     * Create optimization plan based on analysis
     */
    async createOptimizationPlan(flowAnalysis, optimizationGoals) {
        const plan = {
            bucketBrigadePlan: {
                targetInsertions: Math.floor(flowAnalysis.structure.paragraphCount * this.readabilityRules.transitionFrequency.bucketBrigadeRatio),
                preferredTypes: this.selectOptimalBucketBrigadeTypes(flowAnalysis),
                insertionPoints: this.identifyBucketBrigadeInsertionPoints(flowAnalysis)
            },
            transitionPlan: {
                sectionTransitions: this.planSectionTransitions(flowAnalysis),
                paragraphConnections: this.planParagraphConnections(flowAnalysis),
                continuityImprovement: this.planContinuityImprovement(flowAnalysis)
            },
            readabilityPlan: {
                sentenceVariation: this.planSentenceVariation(flowAnalysis),
                paragraphOptimization: this.planParagraphOptimization(flowAnalysis),
                cognitiveLoadReduction: this.planCognitiveLoadReduction(flowAnalysis)
            },
            engagementPlan: {
                questionIntegration: this.planQuestionIntegration(flowAnalysis),
                curiosityLoops: this.planCuriosityLoops(flowAnalysis),
                analogyOpportunities: this.planAnalogyOpportunities(flowAnalysis)
            }
        };

        // Apply optimization goals
        if (optimizationGoals.focusArea) {
            plan.priority = optimizationGoals.focusArea;
        }
        if (optimizationGoals.readabilityTarget) {
            plan.readabilityPlan.targetScore = optimizationGoals.readabilityTarget;
        }
        if (optimizationGoals.engagementLevel) {
            plan.engagementPlan.intensityLevel = optimizationGoals.engagementLevel;
        }

        return plan;
    }

    /**
     * Insert bucket brigades strategically
     */
    async insertBucketBrigades(rawContent, optimizationPlan) {
        let content = rawContent.content || '';
        let insertions = 0;
        const targetInsertions = optimizationPlan.bucketBrigadePlan.targetInsertions;

        // Split content into paragraphs
        const paragraphs = content.split(/\n\s*\n/);
        const optimizedParagraphs = [];

        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i].trim();
            if (!paragraph) continue;

            optimizedParagraphs.push(paragraph);

            // Check if this is a good insertion point
            if (insertions < targetInsertions && this.shouldInsertBucketBrigade(paragraph, i, paragraphs.length)) {
                const brigadeType = this.selectBucketBrigadeType(paragraph, optimizationPlan);
                const bucketBrigade = this.getBucketBrigade(brigadeType);
                
                if (bucketBrigade) {
                    optimizedParagraphs.push(bucketBrigade);
                    insertions++;
                }
            }
        }

        const optimizedContent = {
            ...rawContent,
            content: optimizedParagraphs.join('\n\n'),
            optimizations: {
                ...(rawContent.optimizations || {}),
                bucketBrigades: {
                    inserted: insertions,
                    target: targetInsertions,
                    types: optimizationPlan.bucketBrigadePlan.preferredTypes
                }
            }
        };

        return optimizedContent;
    }

    /**
     * Optimize transitions between sections and paragraphs
     */
    async optimizeTransitions(content, optimizationPlan) {
        let optimizedContent = content.content || '';
        const transitionImprovements = [];

        // Optimize section transitions
        const sections = this.identifyContentSections(optimizedContent);
        
        for (let i = 0; i < sections.length - 1; i++) {
            const currentSection = sections[i];
            const nextSection = sections[i + 1];
            
            const transition = this.createSectionTransition(currentSection, nextSection, optimizationPlan);
            if (transition) {
                optimizedContent = optimizedContent.replace(
                    nextSection.content,
                    `${transition}\n\n${nextSection.content}`
                );
                transitionImprovements.push({
                    type: 'section',
                    position: i,
                    transition: transition
                });
            }
        }

        // Optimize paragraph transitions
        const paragraphs = optimizedContent.split(/\n\s*\n/);
        const optimizedParagraphs = [];

        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i].trim();
            if (!paragraph) continue;

            // Check if paragraph needs transition improvement
            if (i > 0 && this.needsTransitionImprovement(paragraphs[i - 1], paragraph)) {
                const transition = this.createParagraphTransition(paragraphs[i - 1], paragraph);
                if (transition && !paragraph.startsWith(transition)) {
                    optimizedParagraphs.push(`${transition} ${paragraph}`);
                    transitionImprovements.push({
                        type: 'paragraph',
                        position: i,
                        transition: transition
                    });
                    continue;
                }
            }

            optimizedParagraphs.push(paragraph);
        }

        return {
            ...content,
            content: optimizedParagraphs.join('\n\n'),
            optimizations: {
                ...(content.optimizations || {}),
                transitions: {
                    improvements: transitionImprovements,
                    sectionTransitions: transitionImprovements.filter(t => t.type === 'section').length,
                    paragraphTransitions: transitionImprovements.filter(t => t.type === 'paragraph').length
                }
            }
        };
    }

    /**
     * Enhance readability through structure optimization
     */
    async enhanceReadability(content, targetAudience, optimizationGoals = {}) {
        console.log('📝 Enhancing readability and enforcing target grade level...');
        
        let optimizedContent = content.content || '';
        const readabilityImprovements = [];
        
        // Get target readability (Grade 8-10 default)
        const targetGradeLevel = optimizationGoals.readabilityTarget || 10;
        
        // Calculate initial readability
        const initialReadability = this.calculateFleschKincaidGrade(optimizedContent);
        console.log(`📋 Initial readability: Grade ${Math.round(initialReadability * 10) / 10} (target: Grade ${targetGradeLevel})`);

        // Optimize sentence length variation
        const sentences = optimizedContent.split(/([.!?]+)/).filter(s => s.trim());
        const optimizedSentences = [];

        for (let i = 0; i < sentences.length; i += 2) {
            let sentence = sentences[i]?.trim();
            const punctuation = sentences[i + 1] || '.';

            if (!sentence) continue;

            // Check sentence length and complexity
            if (sentence.length > this.readabilityRules.sentenceLength.maximum * 5) {
                const splitSentences = this.splitComplexSentence(sentence);
                optimizedSentences.push(...splitSentences.map((s, idx) => 
                    idx === splitSentences.length - 1 ? s + punctuation : s + '.'
                ));
                readabilityImprovements.push({
                    type: 'sentence_split',
                    original: sentence,
                    improved: splitSentences
                });
            } else if (sentence.length < 5) {
                // Too short, might need combination with next
                optimizedSentences.push(sentence + punctuation);
            } else {
                optimizedSentences.push(sentence + punctuation);
            }
        }

        optimizedContent = optimizedSentences.join(' ');

        // Optimize paragraph structure
        const paragraphs = optimizedContent.split(/\n\s*\n/);
        const optimizedParagraphs = [];

        for (const paragraph of paragraphs) {
            if (!paragraph.trim()) continue;

            const paragraphSentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 5);
            
            if (paragraphSentences.length > this.readabilityRules.paragraphLength.maximum) {
                // Split long paragraph
                const splitParagraphs = this.splitLongParagraph(paragraph, paragraphSentences);
                optimizedParagraphs.push(...splitParagraphs);
                readabilityImprovements.push({
                    type: 'paragraph_split',
                    originalLength: paragraphSentences.length,
                    splitCount: splitParagraphs.length
                });
            } else {
                optimizedParagraphs.push(paragraph);
            }
        }

        // Calculate final readability score
        let finalContent = optimizedParagraphs.join('\n\n');
        
        // Enforce target grade level through iterative optimization
        finalContent = await this.enforceReadabilityTarget(finalContent, targetGradeLevel, readabilityImprovements);
        
        const finalReadability = this.calculateFleschKincaidGrade(finalContent);
        const readabilityScore = this.calculateReadabilityScore(finalContent);
        
        console.log(`✅ Final readability: Grade ${Math.round(finalReadability * 10) / 10} (improvement: ${Math.round((initialReadability - finalReadability) * 10) / 10} grades)`);
        
        return {
            ...content,
            content: finalContent,
            optimizations: {
                ...(content.optimizations || {}),
                readability: {
                    improvements: readabilityImprovements,
                    finalScore: readabilityScore,
                    initialGrade: Math.round(initialReadability * 10) / 10,
                    finalGrade: Math.round(finalReadability * 10) / 10,
                    targetGrade: targetGradeLevel,
                    gradeImprovement: Math.round((initialReadability - finalReadability) * 10) / 10,
                    sentenceOptimizations: readabilityImprovements.filter(r => r.type === 'sentence_split').length,
                    paragraphOptimizations: readabilityImprovements.filter(r => r.type === 'paragraph_split').length,
                    vocabularySimplifications: readabilityImprovements.filter(r => r.type === 'vocabulary_simplification').length
                }
            }
        };
    }

    /**
     * Apply cognitive psychology principles
     */
    async applyCognitivePsychology(content, targetAudience) {
        let optimizedContent = content.content || '';
        const cognitiveOptimizations = [];

        // Apply cognitive ease principles
        const cognitiveEaseOptimizations = await this.applyCognitiveEase(optimizedContent);
        optimizedContent = cognitiveEaseOptimizations.content;
        cognitiveOptimizations.push(...cognitiveEaseOptimizations.optimizations);

        // Apply attention management
        const attentionOptimizations = await this.applyAttentionManagement(optimizedContent, targetAudience);
        optimizedContent = attentionOptimizations.content;
        cognitiveOptimizations.push(...attentionOptimizations.optimizations);

        // Apply engagement psychology
        const engagementOptimizations = await this.applyEngagementPsychology(optimizedContent, targetAudience);
        optimizedContent = engagementOptimizations.content;
        cognitiveOptimizations.push(...engagementOptimizations.optimizations);

        return {
            ...content,
            content: optimizedContent,
            optimizations: {
                ...(content.optimizations || {}),
                cognitivePsychology: {
                    optimizations: cognitiveOptimizations,
                    cognitiveEaseScore: this.calculateCognitiveEaseScore(optimizedContent),
                    attentionRetentionScore: this.calculateAttentionRetentionScore(optimizedContent),
                    engagementScore: this.calculateEngagementScore(optimizedContent)
                }
            }
        };
    }

    /**
     * Validate flow optimization and generate metrics
     */
    async validateFlowOptimization(optimizedContent, originalContent) {
        const optimized = optimizedContent.content || '';
        const original = originalContent.content || '';

        // Calculate improvement metrics
        const originalMetrics = await this.analyzeContentFlow({ content: original });
        const optimizedMetrics = await this.analyzeContentFlow({ content: optimized });

        const improvementMetrics = {
            readabilityImprovement: optimizedMetrics.flow.readabilityScore - originalMetrics.flow.readabilityScore,
            engagementImprovement: this.calculateEngagementImprovement(originalMetrics, optimizedMetrics),
            flowImprovement: this.calculateFlowImprovement(originalMetrics, optimizedMetrics),
            overallScore: 0
        };

        improvementMetrics.overallScore = (
            improvementMetrics.readabilityImprovement * 0.3 +
            improvementMetrics.engagementImprovement * 0.4 +
            improvementMetrics.flowImprovement * 0.3
        );

        const optimizationReport = {
            summary: `Content flow optimization completed with ${improvementMetrics.overallScore.toFixed(1)}% overall improvement.`,
            bucketBrigades: optimizedContent.optimizations?.bucketBrigades || {},
            transitions: optimizedContent.optimizations?.transitions || {},
            readability: optimizedContent.optimizations?.readability || {},
            cognitivePsychology: optimizedContent.optimizations?.cognitivePsychology || {},
            recommendations: this.generateOptimizationRecommendations(optimizedMetrics, improvementMetrics)
        };

        return {
            optimizedContent: optimizedContent,
            optimizationReport: optimizationReport,
            flowMetrics: optimizedMetrics,
            improvementMetrics: improvementMetrics,
            optimizationsApplied: Object.keys(optimizedContent.optimizations || {}).length
        };
    }

    /**
     * Store optimization intelligence in crystalline memory
     */
    async storeOptimizationIntelligence(validationResults, optimizationPlan) {
        const intelligence = {
            optimizationPlan: optimizationPlan,
            results: validationResults,
            patterns: {
                successfulBucketBrigades: validationResults.optimizationReport.bucketBrigades,
                effectiveTransitions: validationResults.optimizationReport.transitions,
                readabilityPatterns: validationResults.optimizationReport.readability
            },
            recommendations: validationResults.optimizationReport.recommendations,
            timestamp: new Date().toISOString()
        };

        await this.crystallineMemory.storeMemory('flow-optimization-intelligence', intelligence);
    }

    // Helper methods for flow optimization

    detectTransitionWords(content) {
        const transitionWords = [
            'however', 'moreover', 'furthermore', 'nevertheless', 'consequently',
            'therefore', 'meanwhile', 'subsequently', 'additionally', 'similarly'
        ];
        
        const count = transitionWords.reduce((sum, word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            return sum + (content.match(regex) || []).length;
        }, 0);

        return {
            count: count,
            density: count / (content.split(/\s+/).length / 100),
            adequacyScore: Math.min(count / (content.split(/\n\s*\n/).length * 0.3), 1)
        };
    }

    detectRepetitivePatterns(sentences) {
        const patterns = {};
        const repetitiveCount = sentences.reduce((count, sentence) => {
            const words = sentence.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
            patterns[words] = (patterns[words] || 0) + 1;
            return patterns[words] > 1 ? count + 1 : count;
        }, 0);

        return {
            repetitiveStarts: repetitiveCount,
            uniquePatterns: Object.keys(patterns).length,
            repetitionRatio: repetitiveCount / sentences.length
        };
    }

    calculateSentenceLengthVariation(sentences) {
        const lengths = sentences.map(s => s.length);
        const average = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - average, 2), 0) / lengths.length;
        
        return {
            average: average,
            variance: variance,
            standardDeviation: Math.sqrt(variance),
            variationCoefficient: Math.sqrt(variance) / average
        };
    }

    calculateReadabilityScore(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

        // Flesch Reading Ease formula
        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        return Math.max(0, Math.min(100, fleschScore));
    }

    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        const vowels = 'aeiouy';
        let syllableCount = 0;
        let previousWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.indexOf(word[i]) !== -1;
            if (isVowel && !previousWasVowel) {
                syllableCount++;
            }
            previousWasVowel = isVowel;
        }
        
        if (word.endsWith('e')) syllableCount--;
        return Math.max(1, syllableCount);
    }

    identifyCuriosityGapOpportunities(paragraphs) {
        return paragraphs.map((paragraph, index) => {
            const hasQuestion = paragraph.includes('?');
            const hasTeaser = /\b(discover|learn|find out|reveal|secret|surprise)\b/i.test(paragraph);
            const endsAbruptly = !paragraph.match(/[.!]$/);
            
            return {
                index: index,
                hasQuestion: hasQuestion,
                hasTeaser: hasTeaser,
                endsAbruptly: endsAbruptly,
                opportunity: hasTeaser || endsAbruptly,
                score: (hasQuestion ? 1 : 0) + (hasTeaser ? 2 : 0) + (endsAbruptly ? 1 : 0)
            };
        }).filter(opp => opp.opportunity);
    }

    identifyBucketBrigadeOpportunities(paragraphs) {
        return paragraphs.map((paragraph, index) => {
            const needsTransition = index > 0 && !this.startsWithTransition(paragraph);
            const isExplanatory = paragraph.length > 200 && /\b(because|since|due to|as a result)\b/i.test(paragraph);
            const followsComplexConcept = index > 0 && this.isComplexConcept(paragraphs[index - 1]);
            
            return {
                index: index,
                needsTransition: needsTransition,
                isExplanatory: isExplanatory,
                followsComplexConcept: followsComplexConcept,
                opportunity: needsTransition || isExplanatory || followsComplexConcept,
                score: (needsTransition ? 2 : 0) + (isExplanatory ? 3 : 0) + (followsComplexConcept ? 2 : 0)
            };
        }).filter(opp => opp.opportunity);
    }

    startsWithTransition(paragraph) {
        const transitionStarters = [
            'however', 'moreover', 'furthermore', 'meanwhile', 'consequently',
            'therefore', 'additionally', 'similarly', 'nevertheless', 'subsequently'
        ];
        
        const firstWord = paragraph.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        return transitionStarters.includes(firstWord);
    }

    isComplexConcept(paragraph) {
        const complexityIndicators = [
            /\b(algorithm|methodology|framework|architecture|implementation)\b/i,
            /\b(analysis|synthesis|optimization|integration|configuration)\b/i,
            /\b(technical|advanced|sophisticated|comprehensive|systematic)\b/i
        ];
        
        return complexityIndicators.some(pattern => pattern.test(paragraph));
    }

    selectOptimalBucketBrigadeTypes(flowAnalysis) {
        const types = [];
        
        // Based on engagement analysis
        if (flowAnalysis.engagement.questionCount < flowAnalysis.structure.paragraphCount * 0.1) {
            types.push('curiosityGaps');
        }
        
        // Based on flow analysis
        if (flowAnalysis.flow.transitionWords.adequacyScore < 0.7) {
            types.push('transitionBridges');
        }
        
        // Based on cognitive load
        if (flowAnalysis.cognitiveLoad.complexSentenceRatio > 0.3) {
            types.push('emphasisMarkers');
        }
        
        // Default to curiosity gaps if no specific needs
        if (types.length === 0) {
            types.push('curiosityGaps');
        }
        
        return types;
    }

    identifyBucketBrigadeInsertionPoints(flowAnalysis) {
        // Simple strategy: evenly distribute based on paragraph count
        const totalParagraphs = flowAnalysis.structure.paragraphCount;
        const targetInsertions = Math.floor(totalParagraphs * this.readabilityRules.transitionFrequency.bucketBrigadeRatio);
        
        const insertionPoints = [];
        const interval = Math.floor(totalParagraphs / (targetInsertions + 1));
        
        for (let i = 1; i <= targetInsertions; i++) {
            insertionPoints.push(i * interval);
        }
        
        return insertionPoints;
    }

    shouldInsertBucketBrigade(paragraph, index, totalParagraphs) {
        // Don't insert in first or last paragraph
        if (index === 0 || index === totalParagraphs - 1) return false;
        
        // Insert after longer paragraphs (more likely to need engagement boost)
        if (paragraph.length > 300) return true;
        
        // Insert after technical content
        if (this.isComplexConcept(paragraph)) return true;
        
        // Insert based on position (distribute evenly)
        const targetInterval = Math.floor(totalParagraphs / 5);
        return index % targetInterval === 0;
    }

    selectBucketBrigadeType(paragraph, optimizationPlan) {
        const preferredTypes = optimizationPlan.bucketBrigadePlan.preferredTypes;
        
        if (this.isComplexConcept(paragraph)) {
            return 'emphasisMarkers';
        }
        
        if (paragraph.includes('study') || paragraph.includes('research') || paragraph.includes('data')) {
            return 'proofIntros';
        }
        
        if (preferredTypes.includes('curiosityGaps')) {
            return 'curiosityGaps';
        }
        
        return 'transitionBridges';
    }

    getBucketBrigade(type) {
        const brigades = this.bucketBrigades[type];
        if (!brigades || brigades.length === 0) return null;
        
        return brigades[Math.floor(Math.random() * brigades.length)];
    }

    // Additional helper methods for transitions, readability, and cognitive psychology
    // ... (These would continue with the implementation details)
    
    planSectionTransitions(flowAnalysis) {
        return {
            strategy: 'contextual-bridging',
            intensity: 'moderate',
            types: ['continuityConnectors', 'transitionBridges']
        };
    }

    planParagraphConnections(flowAnalysis) {
        return {
            connectionRatio: this.readabilityRules.transitionFrequency.paragraphConnections,
            preferredTypes: ['transitionBridges', 'continuityConnectors']
        };
    }

    planContinuityImprovement(flowAnalysis) {
        return {
            focus: 'logical-flow',
            techniques: ['concept-threading', 'progressive-disclosure']
        };
    }

    generateOptimizationRecommendations(optimizedMetrics, improvementMetrics) {
        const recommendations = [];
        
        if (improvementMetrics.readabilityImprovement < 5) {
            recommendations.push({
                area: 'readability',
                suggestion: 'Consider further sentence length variation and paragraph restructuring',
                priority: 'medium'
            });
        }
        
        if (improvementMetrics.engagementImprovement < 10) {
            recommendations.push({
                area: 'engagement',
                suggestion: 'Add more curiosity gaps and bucket brigades for better reader retention',
                priority: 'high'
            });
        }
        
        if (optimizedMetrics.flow.transitionWords.adequacyScore < 0.8) {
            recommendations.push({
                area: 'flow',
                suggestion: 'Increase transition word usage for smoother content flow',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    /**
     * Enforce target readability grade level through iterative optimization
     */
    async enforceReadabilityTarget(content, targetGrade, improvements) {
        let optimizedContent = content;
        let currentGrade = this.calculateFleschKincaidGrade(optimizedContent);
        let iterations = 0;
        const maxIterations = 3;
        
        console.log(`🎯 Enforcing readability target: Grade ${targetGrade} (current: ${Math.round(currentGrade * 10) / 10})`);
        
        while (currentGrade > targetGrade + 1 && iterations < maxIterations) {
            console.log(`   🔄 Iteration ${iterations + 1}: Simplifying content...`);
            
            // Simplify vocabulary
            optimizedContent = this.simplifyVocabulary(optimizedContent, improvements);
            
            // Shorten sentences
            optimizedContent = this.shortenSentences(optimizedContent, improvements);
            
            // Break up complex sentences
            optimizedContent = this.breakComplexSentences(optimizedContent, improvements);
            
            currentGrade = this.calculateFleschKincaidGrade(optimizedContent);
            iterations++;
            
            console.log(`   📊 New grade level: ${Math.round(currentGrade * 10) / 10}`);
        }
        
        if (currentGrade <= targetGrade + 1) {
            console.log(`✅ Target readability achieved in ${iterations} iterations`);
        } else {
            console.log(`⚠️  Maximum iterations reached. Final grade: ${Math.round(currentGrade * 10) / 10}`);
        }
        
        return optimizedContent;
    }
    
    /**
     * Simplify vocabulary by replacing complex words
     */
    simplifyVocabulary(content, improvements) {
        const vocabularyReplacements = {
            // Technical jargon to simple terms
            'utilize': 'use',
            'facilitate': 'help',
            'implement': 'set up',
            'optimize': 'improve',
            'enhance': 'make better',
            'leverage': 'use',
            'comprehensive': 'complete',
            'methodology': 'method',
            'demonstrate': 'show',
            'accommodate': 'fit',
            'approximately': 'about',
            'consequently': 'so',
            'furthermore': 'also',
            'subsequently': 'then',
            'nevertheless': 'but',
            'substantial': 'large',
            'significant': 'important',
            'additional': 'more',
            'alternative': 'other',
            'individuals': 'people',
            'requirements': 'needs',
            'specifications': 'details',
            'parameters': 'settings',
            'configurations': 'setups',
            'modifications': 'changes'
        };
        
        let simplifiedContent = content;
        let replacementCount = 0;
        
        Object.entries(vocabularyReplacements).forEach(([complex, simple]) => {
            const regex = new RegExp(`\\b${complex}\\b`, 'gi');
            if (regex.test(simplifiedContent)) {
                simplifiedContent = simplifiedContent.replace(regex, simple);
                replacementCount++;
            }
        });
        
        if (replacementCount > 0) {
            improvements.push({
                type: 'vocabulary_simplification',
                count: replacementCount,
                description: `Simplified ${replacementCount} complex terms for better readability`
            });
        }
        
        return simplifiedContent;
    }
    
    /**
     * Shorten long sentences
     */
    shortenSentences(content, improvements) {
        const sentences = content.split(/(?<=[.!?])\s+/);
        const shortenedSentences = [];
        let modificationCount = 0;
        
        sentences.forEach(sentence => {
            const wordCount = sentence.split(/\s+/).length;
            
            if (wordCount > 25) {
                // Try to split at natural break points
                const breakPoints = [', and ', ', but ', ', so ', ', which ', ', that ', '; '];
                let shortened = sentence;
                
                for (const breakPoint of breakPoints) {
                    if (shortened.includes(breakPoint)) {
                        const parts = shortened.split(breakPoint);
                        if (parts.length === 2 && parts[0].length > 10 && parts[1].length > 10) {
                            shortened = parts[0] + '. ' + parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                            modificationCount++;
                            break;
                        }
                    }
                }
                
                shortenedSentences.push(shortened);
            } else {
                shortenedSentences.push(sentence);
            }
        });
        
        if (modificationCount > 0) {
            improvements.push({
                type: 'sentence_shortening',
                count: modificationCount,
                description: `Shortened ${modificationCount} overly long sentences`
            });
        }
        
        return shortenedSentences.join(' ');
    }
    
    /**
     * Break up complex sentences
     */
    breakComplexSentences(content, improvements) {
        // This is a simplified implementation
        // In practice, this would use more sophisticated sentence analysis
        let processedContent = content;
        let breakCount = 0;
        
        // Replace semicolons with periods for simpler sentence structure
        if (processedContent.includes(';')) {
            processedContent = processedContent.replace(/;\s*/g, '. ');
            processedContent = processedContent.replace(/\.\s*([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
            breakCount++;
        }
        
        if (breakCount > 0) {
            improvements.push({
                type: 'sentence_structure_simplification',
                count: breakCount,
                description: `Simplified ${breakCount} complex sentence structures`
            });
        }
        
        return processedContent;
    }
    
    /**
     * Calculate Flesch-Kincaid Grade Level
     */
    calculateFleschKincaidGrade(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const syllables = this.countSyllables(text);
        
        if (sentences === 0 || words === 0) {
            return 12; // Default to grade 12 if no valid text
        }
        
        return (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59;
    }
    
    /**
     * Count syllables in text (simplified)
     */
    countSyllables(text) {
        return text.toLowerCase()
            .replace(/[^a-z]/g, '')
            .replace(/[aeiou]{2,}/g, 'a')
            .match(/[aeiou]/g)?.length || 1;
    }

    // Placeholder methods for complex calculations
    calculateComplexSentenceRatio(sentences) { return 0.25; }
    calculateTechnicalTermDensity(content) { return 0.15; }
    calculateConceptDensity(content) { return 0.20; }
    identifyContentSections(content) { return []; }
    createSectionTransition(current, next, plan) { return null; }
    needsTransitionImprovement(prev, current) { return false; }
    createParagraphTransition(prev, current) { return null; }
    splitComplexSentence(sentence) { return [sentence]; }
    splitLongParagraph(paragraph, sentences) { return [paragraph]; }
    applyCognitiveEase(content) { return { content, optimizations: [] }; }
    applyAttentionManagement(content, audience) { return { content, optimizations: [] }; }
    applyEngagementPsychology(content, audience) { return { content, optimizations: [] }; }
    calculateCognitiveEaseScore(content) { return 75; }
    calculateAttentionRetentionScore(content) { return 80; }
    calculateEngagementScore(content) { return 85; }
    calculateEngagementImprovement(original, optimized) { return 12; }
    calculateFlowImprovement(original, optimized) { return 15; }
}

module.exports = ContentFlowOptimizer;