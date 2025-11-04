/**
 * ORCHESTRAI ShadCN UI Crystalline Memory Integration
 * Integrates ShadCN component intelligence with crystalline memory system
 */

const ShadCnUIIntegration = require('../../orchestrai-shared/mcp-servers/shadcn-ui-integration');

class ShadCnMemoryIntegration {
    constructor(memoryManager, redis = null) {
        this.memoryManager = memoryManager;
        this.redis = redis;
        this.shadcnUI = new ShadCnUIIntegration();
        this.componentKnowledge = {
            relationships: new Map(),
            usagePatterns: new Map(),
            projectContexts: new Map(),
            semanticClusters: new Map()
        };
    }

    /**
     * Initialize ShadCN memory integration
     */
    async initialize() {
        try {
            console.log('🧠 Initializing ShadCN-Crystalline Memory Integration...');
            
            // Initialize ShadCN UI integration
            const shadcnResult = await this.shadcnUI.initialize();
            
            if (!shadcnResult.success) {
                console.warn('⚠️  ShadCN UI initialization failed, memory integration limited');
            }

            // Load existing component knowledge from memory
            await this.loadComponentKnowledge();
            
            // Setup semantic component clustering
            await this.initializeSemanticClusters();
            
            console.log('✅ ShadCN-Crystalline Memory Integration ready');
            return { success: true, message: 'ShadCN memory integration initialized' };
        } catch (error) {
            console.error('❌ ShadCN memory integration failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Store component usage with context in crystalline memory
     */
    async storeComponentUsage(projectPath, components, context) {
        try {
            const usageData = {
                projectPath,
                components,
                context,
                timestamp: Date.now(),
                agentId: 'shadcn-memory-integration'
            };

            // Store in crystalline memory with semantic tags
            const memoryKey = `component-usage-${projectPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
            await this.memoryManager.storeMemory(
                memoryKey,
                JSON.stringify(usageData),
                {
                    importance: 0.8,
                    semantic_tags: [
                        'component-usage',
                        'shadcn-ui',
                        ...components,
                        context.purpose || 'general'
                    ].filter(Boolean)
                }
            );

            // Update component relationships
            await this.updateComponentRelationships(components, context);
            
            // Update usage patterns
            await this.updateUsagePatterns(projectPath, components, context);
            
            console.log(`📊 Stored component usage for ${components.length} components`);
            return { success: true, memoryKey };
        } catch (error) {
            console.error('Error storing component usage:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Retrieve component recommendations based on context and history
     */
    async getContextualComponentRecommendations(context) {
        try {
            console.log('🔍 Generating contextual component recommendations...');
            
            // Get base recommendations from ShadCN MCP
            const baseRecommendations = await this.shadcnUI.getComponentRecommendations(context);
            
            // Enhance with crystalline memory insights
            const memoryInsights = await this.getMemoryInsights(context);
            
            // Combine and prioritize recommendations
            const enhancedRecommendations = await this.enhanceRecommendations(
                baseRecommendations,
                memoryInsights,
                context
            );

            // Store recommendation session for learning
            await this.storeRecommendationSession(context, enhancedRecommendations);
            
            return enhancedRecommendations;
        } catch (error) {
            console.error('Error getting contextual recommendations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update component relationships based on co-usage patterns
     */
    async updateComponentRelationships(components, context) {
        try {
            // Create relationships between components used together
            for (let i = 0; i < components.length; i++) {
                for (let j = i + 1; j < components.length; j++) {
                    const comp1 = components[i];
                    const comp2 = components[j];
                    const relationshipKey = `${comp1}-${comp2}`;
                    
                    if (!this.componentKnowledge.relationships.has(relationshipKey)) {
                        this.componentKnowledge.relationships.set(relationshipKey, {
                            strength: 1,
                            contexts: [context.purpose || 'general'],
                            firstSeen: Date.now(),
                            lastSeen: Date.now()
                        });
                    } else {
                        const relationship = this.componentKnowledge.relationships.get(relationshipKey);
                        relationship.strength += 1;
                        relationship.lastSeen = Date.now();
                        if (!relationship.contexts.includes(context.purpose)) {
                            relationship.contexts.push(context.purpose || 'general');
                        }
                    }
                }
            }

            // Store updated relationships in crystalline memory
            await this.memoryManager.storeMemory(
                'component-relationships',
                JSON.stringify(Array.from(this.componentKnowledge.relationships.entries())),
                {
                    importance: 0.9,
                    semantic_tags: ['component-relationships', 'shadcn-ui', 'co-usage-patterns']
                }
            );
        } catch (error) {
            console.error('Error updating component relationships:', error);
        }
    }

    /**
     * Update usage patterns for learning
     */
    async updateUsagePatterns(projectPath, components, context) {
        try {
            const patternKey = context.purpose || 'general';
            
            if (!this.componentKnowledge.usagePatterns.has(patternKey)) {
                this.componentKnowledge.usagePatterns.set(patternKey, {
                    components: new Map(),
                    totalUsages: 0,
                    projects: new Set()
                });
            }
            
            const pattern = this.componentKnowledge.usagePatterns.get(patternKey);
            pattern.totalUsages += 1;
            pattern.projects.add(projectPath);
            
            // Update component frequency in this pattern
            components.forEach(component => {
                const currentCount = pattern.components.get(component) || 0;
                pattern.components.set(component, currentCount + 1);
            });
            
            // Store usage patterns
            await this.memoryManager.storeMemory(
                'component-usage-patterns',
                JSON.stringify(Array.from(this.componentKnowledge.usagePatterns.entries())),
                {
                    importance: 0.85,
                    semantic_tags: ['usage-patterns', 'shadcn-ui', 'component-frequency']
                }
            );
        } catch (error) {
            console.error('Error updating usage patterns:', error);
        }
    }

    /**
     * Get memory insights for recommendation enhancement
     */
    async getMemoryInsights(context) {
        try {
            const insights = {
                similarProjects: [],
                relatedComponents: [],
                usagePatterns: [],
                historicalSuccess: []
            };

            // Search for similar project contexts
            const similarProjectsQuery = `${context.purpose} ${context.content?.substring(0, 100)}`;
            const similarProjects = await this.memoryManager.retrieveMemory(
                similarProjectsQuery,
                'component-usage',
                5
            );
            
            if (similarProjects.results) {
                for (const project of similarProjects.results) {
                    try {
                        const projectData = JSON.parse(project.content);
                        insights.similarProjects.push({
                            components: projectData.components,
                            context: projectData.context,
                            success: projectData.success || 'unknown'
                        });
                    } catch (error) {
                        console.warn('Error parsing similar project data:', error);
                    }
                }
            }

            // Get component relationships
            const patternKey = context.purpose || 'general';
            if (this.componentKnowledge.usagePatterns.has(patternKey)) {
                const pattern = this.componentKnowledge.usagePatterns.get(patternKey);
                insights.usagePatterns = Array.from(pattern.components.entries())
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10);
            }

            return insights;
        } catch (error) {
            console.error('Error getting memory insights:', error);
            return { similarProjects: [], relatedComponents: [], usagePatterns: [] };
        }
    }

    /**
     * Enhance recommendations with memory insights
     */
    async enhanceRecommendations(baseRecommendations, memoryInsights, context) {
        try {
            const enhanced = {
                ...baseRecommendations,
                memoryEnhanced: true,
                historicalInsights: [],
                contextualPriority: [],
                learningBased: []
            };

            // Add historical success patterns
            if (memoryInsights.similarProjects.length > 0) {
                const successfulComponents = new Map();
                memoryInsights.similarProjects
                    .filter(p => p.success === 'high' || p.success === 'medium')
                    .forEach(project => {
                        project.components.forEach(comp => {
                            const count = successfulComponents.get(comp) || 0;
                            successfulComponents.set(comp, count + 1);
                        });
                    });

                enhanced.historicalInsights = Array.from(successfulComponents.entries())
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([component, frequency]) => ({
                        component,
                        reason: `Used in ${frequency} similar successful projects`,
                        confidence: frequency / memoryInsights.similarProjects.length,
                        source: 'historical-success'
                    }));
            }

            // Add usage pattern insights
            if (memoryInsights.usagePatterns.length > 0) {
                enhanced.learningBased = memoryInsights.usagePatterns
                    .slice(0, 5)
                    .map(([component, frequency]) => ({
                        component,
                        reason: `Frequently used in ${context.purpose || 'similar'} projects`,
                        frequency,
                        source: 'usage-patterns'
                    }));
            }

            // Combine and deduplicate recommendations
            const allRecommendations = new Map();
            
            // Add base recommendations
            if (baseRecommendations.recommendations) {
                baseRecommendations.recommendations.forEach(rec => {
                    allRecommendations.set(rec.component, {
                        ...rec,
                        sources: ['mcp-base'],
                        priority: this.calculatePriority(rec, memoryInsights)
                    });
                });
            }

            // Merge historical insights
            enhanced.historicalInsights.forEach(insight => {
                if (allRecommendations.has(insight.component)) {
                    const existing = allRecommendations.get(insight.component);
                    existing.sources.push('historical-success');
                    existing.confidence = Math.max(existing.confidence || 0, insight.confidence);
                    existing.historicalReason = insight.reason;
                } else {
                    allRecommendations.set(insight.component, {
                        component: insight.component,
                        reason: insight.reason,
                        confidence: insight.confidence,
                        sources: ['historical-success'],
                        priority: insight.confidence > 0.7 ? 'high' : 'medium'
                    });
                }
            });

            // Convert back to array and sort by priority
            enhanced.recommendations = Array.from(allRecommendations.values())
                .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
                });

            return enhanced;
        } catch (error) {
            console.error('Error enhancing recommendations:', error);
            return baseRecommendations;
        }
    }

    /**
     * Calculate component priority based on memory insights
     */
    calculatePriority(recommendation, memoryInsights) {
        let score = 0.5; // Base score
        
        // Check if component appears in successful projects
        const successfulProjects = memoryInsights.similarProjects.filter(p => p.success === 'high');
        const appearsInSuccessful = successfulProjects.some(p => 
            p.components.includes(recommendation.component)
        );
        
        if (appearsInSuccessful) score += 0.3;
        
        // Check usage frequency
        const usageFrequency = memoryInsights.usagePatterns.find(([comp]) => 
            comp === recommendation.component
        );
        
        if (usageFrequency && usageFrequency[1] > 5) score += 0.2;
        
        if (score >= 0.8) return 'high';
        if (score >= 0.5) return 'medium';
        return 'low';
    }

    /**
     * Store recommendation session for learning
     */
    async storeRecommendationSession(context, recommendations) {
        try {
            const sessionData = {
                context,
                recommendations: recommendations.recommendations || [],
                timestamp: Date.now(),
                memoryEnhanced: true,
                type: 'recommendation-session'
            };

            await this.memoryManager.storeMemory(
                `recommendation-session-${Date.now()}`,
                JSON.stringify(sessionData),
                {
                    importance: 0.7,
                    semantic_tags: ['recommendation-session', 'shadcn-ui', context.purpose || 'general']
                }
            );
        } catch (error) {
            console.error('Error storing recommendation session:', error);
        }
    }

    /**
     * Load existing component knowledge from memory
     */
    async loadComponentKnowledge() {
        try {
            // Load component relationships
            const relationshipsData = await this.memoryManager.retrieveMemory(
                'component-relationships',
                'component-relationships',
                1
            );
            
            if (relationshipsData.results?.[0]?.content) {
                const relationships = JSON.parse(relationshipsData.results[0].content);
                this.componentKnowledge.relationships = new Map(relationships);
            }

            // Load usage patterns
            const patternsData = await this.memoryManager.retrieveMemory(
                'component-usage-patterns',
                'usage-patterns',
                1
            );
            
            if (patternsData.results?.[0]?.content) {
                const patterns = JSON.parse(patternsData.results[0].content);
                patterns.forEach(([key, value]) => {
                    this.componentKnowledge.usagePatterns.set(key, {
                        ...value,
                        components: new Map(value.components),
                        projects: new Set(value.projects)
                    });
                });
            }

            console.log(`📚 Loaded component knowledge: ${this.componentKnowledge.relationships.size} relationships, ${this.componentKnowledge.usagePatterns.size} patterns`);
        } catch (error) {
            console.error('Error loading component knowledge:', error);
        }
    }

    /**
     * Initialize semantic component clusters
     */
    async initializeSemanticClusters() {
        try {
            // Create semantic clusters for component types
            const clusters = {
                'form-components': ['input', 'button', 'label', 'select', 'textarea', 'checkbox', 'radio'],
                'layout-components': ['card', 'container', 'grid', 'flex', 'stack'],
                'navigation-components': ['navigation-menu', 'dropdown-menu', 'breadcrumb', 'pagination'],
                'feedback-components': ['alert', 'toast', 'progress', 'skeleton', 'loading'],
                'data-display': ['table', 'list', 'badge', 'avatar', 'tooltip']
            };

            this.componentKnowledge.semanticClusters = new Map(Object.entries(clusters));
            
            // Store semantic clusters in memory
            await this.memoryManager.storeMemory(
                'component-semantic-clusters',
                JSON.stringify(Object.entries(clusters)),
                {
                    importance: 0.9,
                    semantic_tags: ['semantic-clusters', 'shadcn-ui', 'component-organization']
                }
            );
        } catch (error) {
            console.error('Error initializing semantic clusters:', error);
        }
    }

    /**
     * Get component statistics from memory
     */
    getMemoryStats() {
        return {
            componentRelationships: this.componentKnowledge.relationships.size,
            usagePatterns: this.componentKnowledge.usagePatterns.size,
            projectContexts: this.componentKnowledge.projectContexts.size,
            semanticClusters: this.componentKnowledge.semanticClusters.size,
            totalStoredSessions: this.componentKnowledge.relationships.size // Approximate
        };
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        if (this.shadcnUI) {
            await this.shadcnUI.cleanup();
        }
        console.log('🧹 ShadCN Memory Integration cleaned up');
    }
}

module.exports = ShadCnMemoryIntegration;