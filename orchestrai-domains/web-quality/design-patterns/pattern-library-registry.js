/**
 * Design Pattern Library Registry
 * 
 * Central registry for managing industry-specific design pattern libraries.
 * Provides unified access to patterns across different industries and use cases.
 */

const BusinessIntelligenceDesignPatterns = require('./industry-specific/business-intelligence-patterns');
const SaasPlatformsDesignPatterns = require('./industry-specific/saas-platforms-patterns');

class PatternLibraryRegistry {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
    this.registryId = 'pattern-library-registry';
    this.version = '1.0.0';
    this.lastUpdated = new Date().toISOString();
    
    // Initialize industry pattern libraries
    this.patternLibraries = new Map();
    this.patternIndex = new Map();
    this.useCaseRecommendations = new Map();
    
    this.initializePatternLibraries();
    this.buildPatternIndex();
    this.initializeUseCaseRecommendations();
  }

  initializePatternLibraries() {
    try {
      console.log('🎨 Initializing industry-specific pattern libraries...');
      
      // Business Intelligence patterns
      this.patternLibraries.set('business_intelligence', 
        new BusinessIntelligenceDesignPatterns()
      );
      
      // SaaS Platforms patterns  
      this.patternLibraries.set('saas_platforms',
        new SaasPlatformsDesignPatterns()
      );
      
      // Add placeholders for future industries
      this.patternLibraries.set('fintech', null); // To be implemented
      this.patternLibraries.set('healthcare', null); // To be implemented
      this.patternLibraries.set('e-commerce', null); // To be implemented
      
      console.log(`✅ ${this.patternLibraries.size} pattern libraries initialized`);
      
    } catch (error) {
      console.error('❌ Error initializing pattern libraries:', error);
      throw error;
    }
  }

  buildPatternIndex() {
    try {
      console.log('🔍 Building searchable pattern index...');
      
      let totalPatterns = 0;
      
      for (const [industryId, patternLibrary] of this.patternLibraries) {
        if (!patternLibrary) continue;
        
        const exportedPatterns = patternLibrary.exportPatterns();
        
        // Index patterns by category and name for fast lookup
        for (const [categoryName, categoryPatterns] of Object.entries(exportedPatterns.patterns)) {
          for (const [patternName, pattern] of Object.entries(categoryPatterns)) {
            const patternKey = `${industryId}.${categoryName}.${patternName}`;
            
            this.patternIndex.set(patternKey, {
              industry: industryId,
              category: categoryName,
              name: patternName,
              pattern: pattern,
              library: patternLibrary,
              searchTerms: this.generateSearchTerms(categoryName, patternName, pattern),
              tags: this.generateTags(pattern),
              complexity: this.assessPatternComplexity(pattern),
              dependencies: this.extractDependencies(pattern)
            });
            
            totalPatterns++;
          }
        }
      }
      
      console.log(`✅ Pattern index built with ${totalPatterns} patterns across ${this.patternLibraries.size} industries`);
      
    } catch (error) {
      console.error('❌ Error building pattern index:', error);
      throw error;
    }
  }

  initializeUseCaseRecommendations() {
    try {
      console.log('🎯 Initializing use case recommendations...');
      
      // Cross-industry use case recommendations
      const useCases = {
        'dashboard-design': {
          description: 'Comprehensive dashboard design for data visualization',
          industries: ['business_intelligence', 'saas_platforms'],
          patterns: [
            { industry: 'business_intelligence', category: 'componentPatterns', pattern: 'metricCard' },
            { industry: 'business_intelligence', category: 'layoutPatterns', pattern: 'executiveSummary' },
            { industry: 'saas_platforms', category: 'componentPatterns', pattern: 'statsCard' }
          ],
          complexity: 'medium',
          estimatedImplementationTime: '2-3 days'
        },
        
        'user-onboarding': {
          description: 'Progressive user onboarding and feature discovery',
          industries: ['saas_platforms'],
          patterns: [
            { industry: 'saas_platforms', category: 'onboardingPatterns', pattern: 'welcomeTour' },
            { industry: 'saas_platforms', category: 'animationPatterns', pattern: 'featureDiscovery' }
          ],
          complexity: 'high',
          estimatedImplementationTime: '3-5 days'
        },
        
        'data-visualization': {
          description: 'Interactive data visualization and exploration',
          industries: ['business_intelligence'],
          patterns: [
            { industry: 'business_intelligence', category: 'visualMetaphors', pattern: 'dataFlow' },
            { industry: 'business_intelligence', category: 'interactionPatterns', pattern: 'dataExploration' }
          ],
          complexity: 'high',
          estimatedImplementationTime: '4-6 days'
        },
        
        'pricing-page': {
          description: 'Conversion-optimized pricing page design',
          industries: ['saas_platforms'],
          patterns: [
            { industry: 'saas_platforms', category: 'pricingPatterns', pattern: 'tieredPricing' },
            { industry: 'saas_platforms', category: 'animationPatterns', pattern: 'userFeedback' }
          ],
          complexity: 'medium',
          estimatedImplementationTime: '1-2 days'
        },
        
        'landing-page-hero': {
          description: 'High-converting hero section for landing pages',
          industries: ['business_intelligence', 'saas_platforms'],
          patterns: [
            { industry: 'business_intelligence', category: 'visualMetaphors', pattern: 'networkConnections' },
            { industry: 'saas_platforms', category: 'visualMetaphors', pattern: 'efficiency' }
          ],
          complexity: 'medium',
          estimatedImplementationTime: '1-3 days'
        }
      };
      
      for (const [useCaseId, useCase] of Object.entries(useCases)) {
        this.useCaseRecommendations.set(useCaseId, useCase);
      }
      
      console.log(`✅ ${this.useCaseRecommendations.size} use case recommendations initialized`);
      
    } catch (error) {
      console.error('❌ Error initializing use case recommendations:', error);
    }
  }

  // Pattern search and retrieval methods
  searchPatterns(query, filters = {}) {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      const results = [];
      
      for (const [patternKey, patternData] of this.patternIndex) {
        // Apply industry filter
        if (filters.industry && patternData.industry !== filters.industry) {
          continue;
        }
        
        // Apply category filter
        if (filters.category && patternData.category !== filters.category) {
          continue;
        }
        
        // Apply complexity filter
        if (filters.complexity && patternData.complexity !== filters.complexity) {
          continue;
        }
        
        // Check if search terms match
        const matchScore = this.calculateMatchScore(searchTerms, patternData.searchTerms);
        
        if (matchScore > 0) {
          results.push({
            ...patternData,
            matchScore,
            patternKey
          });
        }
      }
      
      // Sort by match score (descending)
      results.sort((a, b) => b.matchScore - a.matchScore);
      
      return {
        query,
        totalResults: results.length,
        results: results.slice(0, filters.limit || 20),
        filters: filters
      };
      
    } catch (error) {
      console.error('❌ Error searching patterns:', error);
      return { query, totalResults: 0, results: [], error: error.message };
    }
  }

  getPattern(industry, category, patternName) {
    try {
      const patternKey = `${industry}.${category}.${patternName}`;
      const patternData = this.patternIndex.get(patternKey);
      
      if (!patternData) {
        return null;
      }
      
      // Get implementation guide from the pattern library
      const implementationGuide = patternData.library.generateImplementationGuide 
        ? patternData.library.generateImplementationGuide(category, patternName)
        : null;
      
      return {
        ...patternData,
        implementationGuide
      };
      
    } catch (error) {
      console.error(`❌ Error getting pattern ${industry}.${category}.${patternName}:`, error);
      return null;
    }
  }

  getPatternsByIndustry(industry) {
    try {
      const patternLibrary = this.patternLibraries.get(industry);
      if (!patternLibrary) {
        return null;
      }
      
      return patternLibrary.exportPatterns();
      
    } catch (error) {
      console.error(`❌ Error getting patterns for industry ${industry}:`, error);
      return null;
    }
  }

  getUseCaseRecommendations(useCaseId) {
    try {
      const useCase = this.useCaseRecommendations.get(useCaseId);
      if (!useCase) {
        return null;
      }
      
      // Enrich with actual pattern data
      const enrichedPatterns = useCase.patterns.map(patternRef => {
        const pattern = this.getPattern(patternRef.industry, patternRef.category, patternRef.pattern);
        return {
          ...patternRef,
          patternData: pattern
        };
      });
      
      return {
        ...useCase,
        patterns: enrichedPatterns,
        useCaseId
      };
      
    } catch (error) {
      console.error(`❌ Error getting use case recommendations for ${useCaseId}:`, error);
      return null;
    }
  }

  // Pattern analysis and recommendation methods
  recommendPatternsForProject(projectContext) {
    try {
      const { industry, projectType, requirements, targetAudience } = projectContext;
      
      const recommendations = {
        direct: [],      // Direct industry matches
        crossIndustry: [], // Applicable patterns from other industries
        useCases: []     // Use case based recommendations
      };
      
      // Get direct industry patterns
      if (industry && this.patternLibraries.has(industry)) {
        const patternLibrary = this.patternLibraries.get(industry);
        if (patternLibrary && patternLibrary.getRecommendedPatterns) {
          const directPatterns = patternLibrary.getRecommendedPatterns(projectType);
          recommendations.direct = directPatterns.map(p => ({
            ...p,
            industry,
            source: 'direct'
          }));
        }
      }
      
      // Find applicable use cases
      for (const [useCaseId, useCase] of this.useCaseRecommendations) {
        if (this.isUseCaseApplicable(useCase, projectContext)) {
          recommendations.useCases.push({
            useCaseId,
            ...useCase,
            applicabilityScore: this.calculateUseCaseApplicability(useCase, projectContext)
          });
        }
      }
      
      // Sort use cases by applicability
      recommendations.useCases.sort((a, b) => b.applicabilityScore - a.applicabilityScore);
      
      return {
        projectContext,
        recommendations,
        totalRecommendations: 
          recommendations.direct.length + 
          recommendations.crossIndustry.length + 
          recommendations.useCases.length
      };
      
    } catch (error) {
      console.error('❌ Error recommending patterns for project:', error);
      return { projectContext, recommendations: { direct: [], crossIndustry: [], useCases: [] }, error: error.message };
    }
  }

  // Utility methods
  generateSearchTerms(categoryName, patternName, pattern) {
    const terms = [];
    
    // Add category and pattern name
    terms.push(categoryName, patternName);
    
    // Add pattern description words
    if (pattern.description) {
      terms.push(...pattern.description.toLowerCase().split(' '));
    }
    
    // Add purpose words
    if (pattern.purpose) {
      terms.push(...pattern.purpose.toLowerCase().split(' '));
    }
    
    // Add usage words
    if (pattern.usage) {
      terms.push(...pattern.usage.toLowerCase().split(' '));
    }
    
    return [...new Set(terms)]; // Remove duplicates
  }

  generateTags(pattern) {
    const tags = [];
    
    if (pattern.implementation) {
      tags.push('implementation');
      
      if (pattern.implementation.includes('MagicUI')) tags.push('magicui');
      if (pattern.implementation.includes('Framer Motion')) tags.push('framer-motion');
      if (pattern.implementation.includes('Canvas')) tags.push('canvas');
      if (pattern.implementation.includes('SVG')) tags.push('svg');
    }
    
    if (pattern.parameters) tags.push('configurable');
    if (pattern.animation) tags.push('animated');
    if (pattern.interactive) tags.push('interactive');
    
    return tags;
  }

  assessPatternComplexity(pattern) {
    let complexity = 'low';
    
    // Check implementation complexity
    if (pattern.implementation) {
      if (pattern.implementation.includes('Canvas') || pattern.implementation.includes('Three.js')) {
        complexity = 'high';
      } else if (pattern.implementation.includes('Framer Motion') || pattern.implementation.includes('SVG')) {
        complexity = 'medium';
      }
    }
    
    // Check parameter complexity
    if (pattern.parameters && Object.keys(pattern.parameters).length > 5) {
      complexity = complexity === 'low' ? 'medium' : 'high';
    }
    
    return complexity;
  }

  extractDependencies(pattern) {
    const dependencies = [];
    
    if (pattern.implementation) {
      if (pattern.implementation.includes('MagicUI')) dependencies.push('@magicui/react');
      if (pattern.implementation.includes('Framer Motion')) dependencies.push('framer-motion');
      if (pattern.implementation.includes('Canvas')) dependencies.push('canvas');
      if (pattern.implementation.includes('Three.js')) dependencies.push('three');
    }
    
    return dependencies;
  }

  calculateMatchScore(searchTerms, patternTerms) {
    let score = 0;
    const totalSearchTerms = searchTerms.length;
    
    for (const searchTerm of searchTerms) {
      if (patternTerms.some(term => term.includes(searchTerm))) {
        score += 1;
      }
    }
    
    return totalSearchTerms > 0 ? score / totalSearchTerms : 0;
  }

  isUseCaseApplicable(useCase, projectContext) {
    // Check if project industry is supported by use case
    if (useCase.industries && !useCase.industries.includes(projectContext.industry)) {
      return false;
    }
    
    // Check if project type matches use case
    if (projectContext.projectType && useCase.description) {
      const projectTypeWords = projectContext.projectType.toLowerCase().split(/[_\-\s]/);
      const descriptionWords = useCase.description.toLowerCase().split(' ');
      
      return projectTypeWords.some(word => 
        descriptionWords.some(desc => desc.includes(word) || word.includes(desc))
      );
    }
    
    return true;
  }

  calculateUseCaseApplicability(useCase, projectContext) {
    let score = 0.5; // Base score
    
    // Industry match bonus
    if (useCase.industries && useCase.industries.includes(projectContext.industry)) {
      score += 0.3;
    }
    
    // Project type relevance
    if (projectContext.projectType && useCase.description) {
      const relevanceScore = this.calculateMatchScore(
        projectContext.projectType.toLowerCase().split(/[_\-\s]/),
        useCase.description.toLowerCase().split(' ')
      );
      score += relevanceScore * 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  // Pattern library management
  async registerPatternLibrary(industryId, patternLibrary) {
    try {
      this.patternLibraries.set(industryId, patternLibrary);
      
      // Rebuild index to include new patterns
      this.buildPatternIndex();
      
      // Store in crystalline memory
      if (this.crystallineMemory) {
        await this.crystallineMemory.storeMemory('design-pattern-registry', {
          type: 'pattern-library-registration',
          industryId,
          timestamp: Date.now(),
          patternCount: Object.keys(patternLibrary.exportPatterns().patterns).length
        });
      }
      
      console.log(`✅ Pattern library registered for industry: ${industryId}`);
      return { success: true, industryId };
      
    } catch (error) {
      console.error(`❌ Error registering pattern library for ${industryId}:`, error);
      return { success: false, error: error.message };
    }
  }

  getRegistryStatus() {
    const status = {
      registryId: this.registryId,
      version: this.version,
      lastUpdated: this.lastUpdated,
      totalLibraries: this.patternLibraries.size,
      totalPatterns: this.patternIndex.size,
      totalUseCases: this.useCaseRecommendations.size,
      supportedIndustries: Array.from(this.patternLibraries.keys()),
      availableUseCases: Array.from(this.useCaseRecommendations.keys())
    };
    
    return status;
  }

  // Enhanced crystalline memory integration for pattern learning
  async recordPatternUsage(patternKey, usageContext, outcomeData = null) {
    try {
      if (this.crystallineMemory) {
        await this.crystallineMemory.storeMemory('design-pattern-usage', {
          type: 'pattern-usage-analytics',
          patternKey,
          usageContext,
          outcomeData,
          timestamp: Date.now()
        });

        // Update pattern success metrics if outcome data is provided
        if (outcomeData) {
          await this.updatePatternSuccessMetrics(patternKey, outcomeData);
        }
      }
    } catch (error) {
      console.error('❌ Error recording pattern usage:', error);
    }
  }

  async updatePatternSuccessMetrics(patternKey, outcomeData) {
    try {
      // Retrieve existing metrics
      const existingMetrics = await this.getPatternMetrics(patternKey);
      
      // Calculate updated metrics
      const updatedMetrics = this.calculateUpdatedMetrics(existingMetrics, outcomeData);
      
      // Store updated metrics
      await this.crystallineMemory.storeMemory('design-pattern-metrics', {
        type: 'pattern-success-metrics',
        patternKey,
        metrics: updatedMetrics,
        lastUpdated: Date.now()
      });

      console.log(`📊 Updated success metrics for pattern: ${patternKey}`);
      
    } catch (error) {
      console.error('❌ Error updating pattern success metrics:', error);
    }
  }

  async getPatternMetrics(patternKey) {
    try {
      const metrics = await this.crystallineMemory.retrieveMemory(
        `pattern metrics ${patternKey}`,
        'design-pattern-metrics'
      );
      
      if (metrics.results && metrics.results.length > 0) {
        const latestMetrics = JSON.parse(metrics.results[0].content);
        return latestMetrics.metrics || this.getDefaultMetrics();
      }
      
      return this.getDefaultMetrics();
      
    } catch (error) {
      console.error('❌ Error retrieving pattern metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  getDefaultMetrics() {
    return {
      usageCount: 0,
      successfulImplementations: 0,
      userSatisfactionScore: 0,
      implementationTime: 0,
      complexityRating: 0,
      reusabilityScore: 0,
      lastUsed: null
    };
  }

  calculateUpdatedMetrics(existingMetrics, outcomeData) {
    const metrics = { ...existingMetrics };
    
    // Update usage count
    metrics.usageCount += 1;
    
    // Update success count
    if (outcomeData.successful !== false) {
      metrics.successfulImplementations += 1;
    }
    
    // Update satisfaction score (weighted average)
    if (outcomeData.userSatisfaction) {
      const totalWeight = metrics.usageCount;
      const currentWeight = totalWeight - 1;
      
      metrics.userSatisfactionScore = 
        (metrics.userSatisfactionScore * currentWeight + outcomeData.userSatisfaction) / totalWeight;
    }
    
    // Update implementation time (weighted average)
    if (outcomeData.implementationTime) {
      const totalWeight = metrics.usageCount;
      const currentWeight = totalWeight - 1;
      
      metrics.implementationTime = 
        (metrics.implementationTime * currentWeight + outcomeData.implementationTime) / totalWeight;
    }
    
    // Update other metrics
    if (outcomeData.complexityRating) {
      metrics.complexityRating = outcomeData.complexityRating;
    }
    
    if (outcomeData.reusabilityScore) {
      metrics.reusabilityScore = outcomeData.reusabilityScore;
    }
    
    metrics.lastUsed = Date.now();
    
    return metrics;
  }

  async learnFromPatternOutcomes() {
    try {
      console.log('🧠 Analyzing pattern outcomes for learning...');
      
      // Get all pattern usage data
      const usageData = await this.crystallineMemory.retrieveMemory(
        'pattern usage analytics',
        'design-pattern-usage',
        100
      );
      
      if (!usageData.results || usageData.results.length === 0) {
        console.log('📝 No pattern usage data available for learning');
        return { success: true, learnings: [] };
      }
      
      const learnings = [];
      const patternPerformance = new Map();
      
      // Analyze usage patterns and outcomes
      for (const record of usageData.results) {
        try {
          const data = JSON.parse(record.content);
          
          if (data.type === 'pattern-usage-analytics' && data.outcomeData) {
            const patternKey = data.patternKey;
            
            if (!patternPerformance.has(patternKey)) {
              patternPerformance.set(patternKey, {
                usages: [],
                averageSuccess: 0,
                averageSatisfaction: 0,
                recommendationAdjustment: 0
              });
            }
            
            patternPerformance.get(patternKey).usages.push(data);
          }
        } catch (error) {
          console.warn('Warning: Could not parse usage record:', error);
        }
      }
      
      // Generate learnings from performance data
      for (const [patternKey, performance] of patternPerformance) {
        const learning = await this.generatePatternLearning(patternKey, performance);
        if (learning) {
          learnings.push(learning);
        }
      }
      
      // Store learnings in crystalline memory
      await this.crystallineMemory.storeMemory('design-pattern-learnings', {
        type: 'pattern-learning-analysis',
        learnings,
        analysisDate: Date.now(),
        totalPatternsAnalyzed: patternPerformance.size
      });
      
      console.log(`🎓 Generated ${learnings.length} pattern learnings from ${patternPerformance.size} patterns`);
      
      return { success: true, learnings };
      
    } catch (error) {
      console.error('❌ Error learning from pattern outcomes:', error);
      return { success: false, error: error.message };
    }
  }

  async generatePatternLearning(patternKey, performance) {
    try {
      const usages = performance.usages;
      if (usages.length < 3) {
        return null; // Need at least 3 usages for meaningful learning
      }
      
      // Calculate success rate
      const successfulUsages = usages.filter(u => u.outcomeData?.successful !== false).length;
      const successRate = successfulUsages / usages.length;
      
      // Calculate average satisfaction
      const satisfactionScores = usages
        .filter(u => u.outcomeData?.userSatisfaction)
        .map(u => u.outcomeData.userSatisfaction);
      
      const averageSatisfaction = satisfactionScores.length > 0 
        ? satisfactionScores.reduce((a, b) => a + b) / satisfactionScores.length 
        : 0;
      
      // Analyze context patterns
      const contextAnalysis = this.analyzeUsageContexts(usages);
      
      const learning = {
        patternKey,
        successRate,
        averageSatisfaction,
        totalUsages: usages.length,
        contextAnalysis,
        recommendations: [],
        confidence: this.calculateLearningConfidence(usages.length, successRate, averageSatisfaction)
      };
      
      // Generate recommendations based on performance
      if (successRate > 0.8 && averageSatisfaction > 4.0) {
        learning.recommendations.push({
          type: 'increase_priority',
          reason: 'High success rate and satisfaction',
          adjustment: 0.2
        });
      } else if (successRate < 0.5 || averageSatisfaction < 2.5) {
        learning.recommendations.push({
          type: 'decrease_priority',
          reason: 'Low success rate or satisfaction',
          adjustment: -0.3
        });
      }
      
      // Context-specific recommendations
      if (contextAnalysis.mostSuccessfulIndustry) {
        learning.recommendations.push({
          type: 'industry_preference',
          industry: contextAnalysis.mostSuccessfulIndustry,
          reason: 'Better performance in specific industry'
        });
      }
      
      return learning;
      
    } catch (error) {
      console.error(`❌ Error generating learning for pattern ${patternKey}:`, error);
      return null;
    }
  }

  analyzeUsageContexts(usages) {
    const industries = {};
    const projectTypes = {};
    const successByIndustry = {};
    
    for (const usage of usages) {
      const context = usage.usageContext;
      const successful = usage.outcomeData?.successful !== false;
      
      if (context.industry) {
        industries[context.industry] = (industries[context.industry] || 0) + 1;
        
        if (!successByIndustry[context.industry]) {
          successByIndustry[context.industry] = { total: 0, successful: 0 };
        }
        successByIndustry[context.industry].total += 1;
        if (successful) {
          successByIndustry[context.industry].successful += 1;
        }
      }
      
      if (context.projectType) {
        projectTypes[context.projectType] = (projectTypes[context.projectType] || 0) + 1;
      }
    }
    
    // Find most successful industry
    let mostSuccessfulIndustry = null;
    let bestSuccessRate = 0;
    
    for (const [industry, stats] of Object.entries(successByIndustry)) {
      const successRate = stats.successful / stats.total;
      if (successRate > bestSuccessRate && stats.total >= 2) {
        bestSuccessRate = successRate;
        mostSuccessfulIndustry = industry;
      }
    }
    
    return {
      industries,
      projectTypes,
      mostSuccessfulIndustry,
      bestSuccessRate
    };
  }

  calculateLearningConfidence(usageCount, successRate, satisfaction) {
    let confidence = 0;
    
    // Usage count contribution (0-0.4)
    confidence += Math.min(usageCount / 10, 0.4);
    
    // Success rate contribution (0-0.3)
    if (successRate > 0.7) {
      confidence += 0.3;
    } else if (successRate > 0.5) {
      confidence += 0.2;
    } else {
      confidence += 0.1;
    }
    
    // Satisfaction contribution (0-0.3)
    if (satisfaction > 4.0) {
      confidence += 0.3;
    } else if (satisfaction > 3.0) {
      confidence += 0.2;
    } else if (satisfaction > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  async applyLearningsToRecommendations() {
    try {
      console.log('🎯 Applying learnings to pattern recommendations...');
      
      // Get latest learnings
      const learningsData = await this.crystallineMemory.retrieveMemory(
        'pattern learning analysis',
        'design-pattern-learnings',
        1
      );
      
      if (!learningsData.results || learningsData.results.length === 0) {
        console.log('📝 No learnings available to apply');
        return { success: true, adjustments: [] };
      }
      
      const latestLearnings = JSON.parse(learningsData.results[0].content);
      const adjustments = [];
      
      // Apply learnings to pattern index
      for (const learning of latestLearnings.learnings) {
        const patternData = this.patternIndex.get(learning.patternKey);
        
        if (patternData && learning.confidence > 0.6) {
          for (const recommendation of learning.recommendations) {
            switch (recommendation.type) {
              case 'increase_priority':
                // Increase pattern priority in searches
                patternData.priority = (patternData.priority || 1) + recommendation.adjustment;
                adjustments.push({
                  patternKey: learning.patternKey,
                  adjustment: 'priority_increase',
                  value: recommendation.adjustment
                });
                break;
                
              case 'decrease_priority':
                // Decrease pattern priority in searches
                patternData.priority = Math.max(0.1, (patternData.priority || 1) + recommendation.adjustment);
                adjustments.push({
                  patternKey: learning.patternKey,
                  adjustment: 'priority_decrease',
                  value: recommendation.adjustment
                });
                break;
                
              case 'industry_preference':
                // Add industry preference metadata
                if (!patternData.industryPreferences) {
                  patternData.industryPreferences = [];
                }
                patternData.industryPreferences.push(recommendation.industry);
                adjustments.push({
                  patternKey: learning.patternKey,
                  adjustment: 'industry_preference',
                  industry: recommendation.industry
                });
                break;
            }
          }
        }
      }
      
      console.log(`✅ Applied ${adjustments.length} learning-based adjustments to pattern recommendations`);
      
      return { success: true, adjustments };
      
    } catch (error) {
      console.error('❌ Error applying learnings to recommendations:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = PatternLibraryRegistry;