/**
 * ORCHESTRAI Project Specification Analyzer
 *
 * Analyzes project specifications (natural language, structured data, or hybrid)
 * and extracts actionable intelligence for automatic pipeline assembly.
 *
 * Capabilities:
 * - Natural language processing for project descriptions
 * - Deliverable type classification
 * - Required capability extraction
 * - Complexity assessment
 * - Success criteria identification
 * - Domain requirement mapping
 */

const { v4: uuidv4 } = require('uuid');

class ProjectSpecificationAnalyzer {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;

    // Deliverable type patterns
    this.deliverablePatterns = {
      'seo-research': {
        keywords: ['seo', 'keyword', 'search', 'serp', 'ranking', 'optimization', 'google'],
        capabilities: ['keyword-research', 'competitor-analysis', 'search-intent', 'semantic-clustering'],
        domains: ['seo'],
        complexity: 'medium'
      },
      'content-creation': {
        keywords: ['content', 'article', 'blog', 'write', 'copy', 'text', 'editorial'],
        capabilities: ['content-writing', 'content-strategy', 'seo-optimization', 'quality-validation'],
        domains: ['content', 'seo'],
        complexity: 'medium'
      },
      'content-creation-multi-language': {
        keywords: ['multi-language', 'translation', 'dutch', 'slovenian', 'german', 'spanish', 'localization'],
        capabilities: ['multi-language-adaptation', 'cultural-context', 'language-isolation', 'psychographic-targeting'],
        domains: ['content', 'multilingual'],
        complexity: 'high'
      },
      'advertising-campaign': {
        keywords: ['advertising', 'campaign', 'ads', 'meta', 'google ads', 'linkedin', 'marketing'],
        capabilities: ['offer-creation', 'platform-strategy', 'copy-variation', 'creative-frameworks'],
        domains: ['advertising'],
        complexity: 'high'
      },
      'web-development': {
        keywords: ['website', 'web', 'landing page', 'design', 'frontend', 'development', 'ui'],
        capabilities: ['wireframe-design', 'component-development', 'quality-assurance', 'deployment'],
        domains: ['webdev', 'design'],
        complexity: 'very-high'
      },
      'reputation-intelligence': {
        keywords: ['reputation', 'reviews', 'sentiment', 'monitoring', 'brand health', 'negative reviews'],
        capabilities: ['review-monitoring', 'sentiment-analysis', 'response-strategy', 'competitive-reputation'],
        domains: ['reputation'],
        complexity: 'low'
      },
      'competitive-analysis': {
        keywords: ['competitor', 'competitive', 'market analysis', 'benchmark', 'comparison'],
        capabilities: ['competitor-research', 'market-intelligence', 'gap-analysis', 'strategic-positioning'],
        domains: ['research', 'seo'],
        complexity: 'medium'
      },
      'psychographic-research': {
        keywords: ['psychographic', 'audience', 'persona', 'segmentation', 'customer profile', 'icp'],
        capabilities: ['psychographic-analysis', 'audience-research', 'cultural-adaptation', 'segment-targeting'],
        domains: ['research', 'content'],
        complexity: 'medium'
      }
    };

    // Language identification patterns
    this.languagePatterns = {
      'Dutch': ['dutch', 'nederlands', 'nl', 'netherlands', 'holland'],
      'Slovenian': ['slovenian', 'slovene', 'slovenia', 'sl'],
      'German': ['german', 'deutsch', 'de', 'germany'],
      'Spanish': ['spanish', 'español', 'es', 'spain'],
      'English': ['english', 'en', 'uk', 'us', 'usa']
    };

    // Market identification patterns
    this.marketPatterns = {
      'Netherlands': ['netherlands', 'dutch', 'holland', 'nl', 'amsterdam'],
      'Slovenia': ['slovenia', 'slovenian', 'ljubljana', 'sl'],
      'Germany': ['germany', 'german', 'de', 'berlin'],
      'Spain': ['spain', 'spanish', 'es', 'madrid'],
      'United States': ['usa', 'us', 'united states', 'america'],
      'United Kingdom': ['uk', 'britain', 'united kingdom', 'england']
    };

    console.log('📋 Project Specification Analyzer initialized');
  }

  /**
   * Main analysis entry point
   */
  async analyzeProjectRequirements(projectSpec) {
    try {
      console.log('🔍 Analyzing project specification...');

      // Normalize specification format
      const normalizedSpec = this.normalizeSpecification(projectSpec);

      // Extract deliverable type
      const deliverableType = this.identifyDeliverableType(normalizedSpec);

      // Extract required capabilities
      const requiredCapabilities = this.extractRequiredCapabilities(normalizedSpec, deliverableType);

      // Assess complexity
      const complexity = this.assessComplexity(normalizedSpec, deliverableType, requiredCapabilities);

      // Identify target market and language
      const targetMarket = this.identifyTargetMarket(normalizedSpec);
      const language = this.identifyLanguage(normalizedSpec);

      // Extract success criteria
      const successCriteria = this.extractSuccessCriteria(normalizedSpec);

      // Determine domain requirements
      const domainRequirements = this.determineDomainRequirements(deliverableType, requiredCapabilities);

      // Estimate task count
      const estimatedTaskCount = this.estimateTaskCount(deliverableType, complexity, requiredCapabilities);

      // Extract client context
      const clientName = normalizedSpec.clientName || this.extractClientName(normalizedSpec);
      const projectUuid = normalizedSpec.projectUuid || this.generateProjectUuid(clientName);

      // Check for existing project context from crystalline memory
      const existingContext = await this.retrieveExistingContext(clientName, projectUuid);

      const analysis = {
        // Core identification
        deliverableType,
        clientName,
        projectUuid,

        // Requirements
        requiredCapabilities,
        domainRequirements,

        // Context
        targetMarket,
        language,
        complexity,
        estimatedTaskCount,

        // Quality & Success
        successCriteria,

        // Historical context
        existingContext,

        // Metadata
        analyzedAt: Date.now(),
        analysisConfidence: this.calculateConfidence(normalizedSpec, deliverableType),
        originalSpec: normalizedSpec
      };

      console.log('✅ Specification analysis complete:');
      console.log(`   ├─ Deliverable: ${deliverableType}`);
      console.log(`   ├─ Client: ${clientName}`);
      console.log(`   ├─ Language: ${language}`);
      console.log(`   ├─ Market: ${targetMarket}`);
      console.log(`   ├─ Complexity: ${complexity}`);
      console.log(`   ├─ Capabilities: ${requiredCapabilities.length}`);
      console.log(`   ├─ Domains: ${domainRequirements.join(', ')}`);
      console.log(`   └─ Estimated Tasks: ${estimatedTaskCount}`);

      return analysis;

    } catch (error) {
      console.error('❌ Specification analysis failed:', error);
      throw error;
    }
  }

  /**
   * Normalize specification to consistent format
   */
  normalizeSpecification(spec) {
    // Handle string input (natural language)
    if (typeof spec === 'string') {
      return {
        description: spec,
        type: 'natural-language',
        normalized: true
      };
    }

    // Already structured
    if (typeof spec === 'object') {
      return {
        ...spec,
        description: spec.description || spec.task || spec.requirements || '',
        type: spec.type || 'structured',
        normalized: true
      };
    }

    throw new Error('Invalid specification format - must be string or object');
  }

  /**
   * Identify deliverable type from specification
   */
  identifyDeliverableType(spec) {
    const description = (spec.description || '').toLowerCase();

    // Explicit deliverable type
    if (spec.deliverableType) {
      return spec.deliverableType;
    }

    // Pattern matching
    let bestMatch = null;
    let highestScore = 0;

    for (const [type, pattern] of Object.entries(this.deliverablePatterns)) {
      const score = pattern.keywords.filter(keyword =>
        description.includes(keyword.toLowerCase())
      ).length;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = type;
      }
    }

    // Default to content creation if no strong match
    return bestMatch || 'content-creation';
  }

  /**
   * Extract required capabilities
   */
  extractRequiredCapabilities(spec, deliverableType) {
    const capabilities = new Set();

    // Add default capabilities from deliverable type
    const typePattern = this.deliverablePatterns[deliverableType];
    if (typePattern) {
      typePattern.capabilities.forEach(cap => capabilities.add(cap));
    }

    // Add explicitly mentioned capabilities
    if (spec.requiredCapabilities && Array.isArray(spec.requiredCapabilities)) {
      spec.requiredCapabilities.forEach(cap => capabilities.add(cap));
    }

    // Extract from description
    const description = (spec.description || '').toLowerCase();

    const capabilityKeywords = {
      'keyword-research': ['keyword', 'search volume', 'kw research'],
      'competitor-analysis': ['competitor', 'competitive', 'competition'],
      'content-writing': ['write', 'content', 'article', 'blog'],
      'seo-optimization': ['seo', 'optimize', 'optimization'],
      'psychographic-targeting': ['psychographic', 'audience', 'persona'],
      'multi-language': ['multi-language', 'translation', 'localization'],
      'quality-validation': ['quality', 'validation', 'qa', 'review'],
      'design': ['design', 'wireframe', 'ui', 'ux'],
      'development': ['develop', 'code', 'build', 'frontend', 'backend']
    };

    for (const [capability, keywords] of Object.entries(capabilityKeywords)) {
      if (keywords.some(kw => description.includes(kw))) {
        capabilities.add(capability);
      }
    }

    return Array.from(capabilities);
  }

  /**
   * Assess project complexity
   */
  assessComplexity(spec, deliverableType, capabilities) {
    // Explicit complexity
    if (spec.complexity) {
      return spec.complexity;
    }

    // Calculate based on factors
    let complexityScore = 0;

    // Base complexity from deliverable type
    const typePattern = this.deliverablePatterns[deliverableType];
    const baseComplexity = typePattern?.complexity || 'medium';

    const complexityMap = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'very-high': 4
    };

    complexityScore += complexityMap[baseComplexity] || 2;

    // Capability count factor
    if (capabilities.length > 6) complexityScore += 1;
    if (capabilities.length > 10) complexityScore += 1;

    // Multi-language increases complexity
    const description = (spec.description || '').toLowerCase();
    if (description.includes('multi-language') || description.includes('translation')) {
      complexityScore += 1;
    }

    // Quality requirements increase complexity
    if (spec.qualityLevel === 'high' || description.includes('high quality')) {
      complexityScore += 1;
    }

    // Timeline pressure increases complexity
    if (spec.timeline && (spec.timeline.includes('urgent') || spec.timeline.includes('24'))) {
      complexityScore += 1;
    }

    // Map score to complexity level
    if (complexityScore <= 2) return 'low';
    if (complexityScore <= 4) return 'medium';
    if (complexityScore <= 6) return 'high';
    return 'very-high';
  }

  /**
   * Identify target market
   */
  identifyTargetMarket(spec) {
    // Explicit market
    if (spec.targetMarket || spec.market) {
      return spec.targetMarket || spec.market;
    }

    // Pattern matching from description
    const description = (spec.description || '').toLowerCase();

    for (const [market, patterns] of Object.entries(this.marketPatterns)) {
      if (patterns.some(pattern => description.includes(pattern))) {
        return market;
      }
    }

    return 'International'; // Default
  }

  /**
   * Identify language
   */
  identifyLanguage(spec) {
    // Explicit language
    if (spec.language) {
      return spec.language;
    }

    // Pattern matching from description
    const description = (spec.description || '').toLowerCase();

    for (const [language, patterns] of Object.entries(this.languagePatterns)) {
      if (patterns.some(pattern => description.includes(pattern))) {
        return language;
      }
    }

    return 'English'; // Default
  }

  /**
   * Extract success criteria
   */
  extractSuccessCriteria(spec) {
    const criteria = {
      minimumQuality: 85,
      languagePurity: 100,
      deliveryTimeline: '72 hours'
    };

    // Explicit criteria
    if (spec.successCriteria) {
      return { ...criteria, ...spec.successCriteria };
    }

    // Extract from quality level
    if (spec.qualityLevel === 'high' || spec.quality === 'high') {
      criteria.minimumQuality = 90;
    }

    // Extract timeline
    if (spec.timeline) {
      criteria.deliveryTimeline = spec.timeline;
    }

    // Language purity for non-English
    if (spec.language && spec.language !== 'English') {
      criteria.languagePurity = 100; // Strict for non-English
    }

    return criteria;
  }

  /**
   * Determine domain requirements
   */
  determineDomainRequirements(deliverableType, capabilities) {
    const domains = new Set();

    // Add domains from deliverable type
    const typePattern = this.deliverablePatterns[deliverableType];
    if (typePattern) {
      typePattern.domains.forEach(domain => domains.add(domain));
    }

    // Add domains from capabilities
    const capabilityDomainMap = {
      'keyword-research': 'seo',
      'seo-optimization': 'seo',
      'content-writing': 'content',
      'psychographic-targeting': 'content',
      'design': 'webdev',
      'development': 'webdev',
      'quality-validation': 'quality',
      'review-monitoring': 'reputation'
    };

    capabilities.forEach(capability => {
      const domain = capabilityDomainMap[capability];
      if (domain) domains.add(domain);
    });

    return Array.from(domains);
  }

  /**
   * Estimate task count
   */
  estimateTaskCount(deliverableType, complexity, capabilities) {
    // Base task count from deliverable type
    const baseTaskMap = {
      'seo-research': 8,
      'content-creation': 6,
      'content-creation-multi-language': 10,
      'advertising-campaign': 7,
      'web-development': 12,
      'reputation-intelligence': 5,
      'competitive-analysis': 6,
      'psychographic-research': 7
    };

    let taskCount = baseTaskMap[deliverableType] || 6;

    // Complexity multiplier
    const complexityMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3,
      'very-high': 1.6
    };

    taskCount *= (complexityMultiplier[complexity] || 1.0);

    // Capability factor
    taskCount += Math.floor(capabilities.length * 0.5);

    return Math.ceil(taskCount);
  }

  /**
   * Extract client name from description
   */
  extractClientName(spec) {
    const description = spec.description || '';

    // Look for "for [ClientName]" patterns
    const forPattern = /for\s+([A-Z][a-zA-Z]+)/;
    const match = description.match(forPattern);

    if (match) {
      return match[1];
    }

    // Look for company/project names (capitalized words)
    const capitalizedWords = description.match(/\b[A-Z][a-zA-Z]{2,}\b/g);
    if (capitalizedWords && capitalizedWords.length > 0) {
      return capitalizedWords[0];
    }

    return 'Unknown Client';
  }

  /**
   * Generate project UUID
   */
  generateProjectUuid(clientName) {
    const sanitizedName = clientName.toLowerCase().replace(/\s+/g, '-');
    return `${sanitizedName}-${uuidv4().substring(0, 8)}`;
  }

  /**
   * Retrieve existing context from crystalline memory
   */
  async retrieveExistingContext(clientName, projectUuid) {
    if (!this.crystallineMemory) {
      return null;
    }

    try {
      // Search for client-related memory
      const clientMemory = await this.crystallineMemory.searchMemory(clientName, {
        semantic_tags: ['client-intelligence', 'psychographic', 'seo-research'],
        limit: 5
      });

      if (clientMemory && clientMemory.length > 0) {
        return {
          hasExistingContext: true,
          psychographicData: clientMemory.filter(m => m.semantic_tags?.includes('psychographic')),
          seoResearch: clientMemory.filter(m => m.semantic_tags?.includes('seo-research')),
          previousProjects: clientMemory.length
        };
      }
    } catch (error) {
      console.warn('Could not retrieve existing context:', error.message);
    }

    return {
      hasExistingContext: false,
      psychographicData: [],
      seoResearch: [],
      previousProjects: 0
    };
  }

  /**
   * Calculate analysis confidence
   */
  calculateConfidence(spec, deliverableType) {
    let confidence = 0.5; // Base confidence

    // Explicit deliverable type increases confidence
    if (spec.deliverableType) confidence += 0.3;

    // Structured spec increases confidence
    if (spec.type === 'structured') confidence += 0.2;

    // Detailed description increases confidence
    if (spec.description && spec.description.length > 100) confidence += 0.15;

    // Explicit requirements increase confidence
    if (spec.requiredCapabilities) confidence += 0.1;
    if (spec.targetMarket) confidence += 0.1;
    if (spec.language) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}

module.exports = ProjectSpecificationAnalyzer;
