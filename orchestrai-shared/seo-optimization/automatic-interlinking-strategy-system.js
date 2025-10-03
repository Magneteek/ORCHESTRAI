// Automatic Interlinking Strategy System
// Intelligently inserts strategic internal links based on content network analysis and SEO strategy
// Builds topical authority through semantic link relationships

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class AutomaticInterlinkingStrategySystem extends EventEmitter {
  constructor(crystallineMemory, contextPreservation, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.contextPreservation = contextPreservation;
    this.redis = redis;
    
    // Interlinking strategy configuration
    this.interlinkingConfig = {
      maxLinksPerArticle: 8,
      minLinksPerArticle: 3,
      contextualRelevanceThreshold: 0.7,
      authorityFlowOptimization: true,
      semanticDistanceThreshold: 0.8,
      anchorTextVariety: true
    };
    
    // Content network and link strategies by domain
    this.domainStrategies = {
      'dental-content': {
        hubPages: [
          'zobni-implantati-slovenija',
          'estetska-stomatologija',
          'preventivna-zobna-nega'
        ],
        linkingPriorities: [
          'procedure-to-recovery',
          'cost-to-benefits', 
          'location-to-services',
          'technology-to-outcomes'
        ],
        semanticClusters: {
          'implant-procedures': ['implantacija', 'postopek', 'kirurgija', 'vstavitev'],
          'recovery-care': ['okrevanje', 'nega', 'zdravljenje', 'navodila'],
          'costs-pricing': ['cena', 'stroški', 'financiranje', 'zavarovanje'],
          'locations-clinics': ['klinika', 'zobozdravnik', 'ordinacija', 'lokacija']
        }
      },
      'business-content': {
        hubPages: [
          'digital-transformation',
          'business-optimization', 
          'market-analysis'
        ],
        linkingPriorities: [
          'problem-to-solution',
          'strategy-to-implementation',
          'analysis-to-action',
          'case-study-to-services'
        ],
        semanticClusters: {
          'strategy-planning': ['strategija', 'načrtovanje', 'analiza', 'optimizacija'],
          'implementation': ['implementacija', 'izvajanje', 'upravljanje', 'koordinacija'],
          'results-metrics': ['rezultati', 'uspeh', 'meritve', 'učinkovitost']
        }
      },
      'technical-content': {
        hubPages: [
          'software-development',
          'system-architecture',
          'technical-solutions'
        ],
        linkingPriorities: [
          'concept-to-implementation',
          'problem-to-solution',
          'basic-to-advanced',
          'theory-to-practice'
        ],
        semanticClusters: {
          'development': ['razvoj', 'programiranje', 'koda', 'aplikacija'],
          'architecture': ['arhitektura', 'sistem', 'struktura', 'dizajn'],
          'deployment': ['namestitev', 'produkcija', 'hosting', 'vzdrževanje']
        }
      }
    };
    
    // Content network graph
    this.contentNetwork = new Map();
    this.linkingOpportunities = new Map();
    this.appliedLinks = [];
    
    // Interlinking metrics
    this.linkingMetrics = {
      linksInserted: 0,
      articlesProcessed: 0,
      networkConnections: 0,
      authorityFlowOptimized: 0,
      semanticClustersBuilt: 0
    };
    
    console.log('🔗 Automatic Interlinking Strategy System initialized - Building strategic content networks');
  }

  /**
   * Analyze content for interlinking opportunities
   */
  async analyzeInterlinkingOpportunities(contentId, content, contentMeta = {}) {
    const analysisId = uuidv4();
    const timestamp = Date.now();
    
    try {
      console.log(`🔍 Analyzing interlinking opportunities for content: ${contentId}`);
      
      // Extract content characteristics
      const contentAnalysis = await this.analyzeContentCharacteristics(content, contentMeta);
      
      // Find related content in network
      const relatedContent = await this.findRelatedContent(contentAnalysis, contentMeta.domain);
      
      // Generate strategic linking opportunities
      const linkingOpportunities = await this.generateStrategicLinks(
        contentAnalysis,
        relatedContent,
        contentMeta
      );
      
      // Optimize for authority flow
      const optimizedLinks = await this.optimizeAuthorityFlow(linkingOpportunities, contentMeta);
      
      // Store opportunities
      this.linkingOpportunities.set(contentId, {
        analysisId,
        contentId,
        timestamp,
        analysis: contentAnalysis,
        opportunities: optimizedLinks,
        status: 'ready',
        domain: contentMeta.domain
      });
      
      console.log(`✅ Found ${optimizedLinks.length} strategic linking opportunities for ${contentId}`);
      
      this.emit('interlinking-analysis-complete', {
        contentId,
        opportunityCount: optimizedLinks.length,
        analysisId
      });
      
      return {
        analysisId,
        opportunities: optimizedLinks,
        recommendations: this.generateLinkingRecommendations(optimizedLinks)
      };
      
    } catch (error) {
      console.error('❌ Interlinking analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Automatically insert strategic links into content
   */
  async insertStrategicLinks(contentId, content, insertionOptions = {}) {
    try {
      const opportunities = this.linkingOpportunities.get(contentId);
      if (!opportunities) {
        console.warn(`⚠️ No linking opportunities found for ${contentId}`);
        return { content, linksInserted: 0 };
      }
      
      console.log(`🔗 Inserting strategic links for ${contentId}`);
      
      let updatedContent = content;
      let insertedLinks = 0;
      
      // Sort opportunities by priority and relevance
      const sortedOpportunities = opportunities.opportunities
        .sort((a, b) => (b.priority * b.relevanceScore) - (a.priority * a.relevanceScore))
        .slice(0, insertionOptions.maxLinks || this.interlinkingConfig.maxLinksPerArticle);
      
      for (const opportunity of sortedOpportunities) {
        const insertionResult = await this.insertLink(
          updatedContent,
          opportunity,
          insertionOptions
        );
        
        if (insertionResult.success) {
          updatedContent = insertionResult.content;
          insertedLinks++;
          
          // Track applied link
          this.appliedLinks.push({
            contentId,
            targetUrl: opportunity.targetUrl,
            anchorText: opportunity.anchorText,
            insertedAt: Date.now(),
            context: opportunity.context,
            strategy: opportunity.strategy
          });
        }
      }
      
      // Update metrics
      this.linkingMetrics.linksInserted += insertedLinks;
      this.linkingMetrics.articlesProcessed++;
      
      console.log(`✅ Inserted ${insertedLinks} strategic links in ${contentId}`);
      
      this.emit('links-inserted', {
        contentId,
        linksInserted: insertedLinks,
        totalOpportunities: sortedOpportunities.length
      });
      
      return {
        content: updatedContent,
        linksInserted: insertedLinks,
        appliedOpportunities: sortedOpportunities.slice(0, insertedLinks)
      };
      
    } catch (error) {
      console.error('❌ Link insertion failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze content characteristics for linking
   */
  async analyzeContentCharacteristics(content, contentMeta) {
    const analysis = {
      wordCount: content.split(/\s+/).length,
      topics: [],
      semanticKeywords: [],
      contentType: contentMeta.type || 'article',
      domain: contentMeta.domain || 'general',
      language: contentMeta.language || 'sl',
      headings: this.extractHeadings(content),
      keyPhrases: await this.extractKeyPhrases(content),
      semanticContext: await this.buildSemanticContext(content, contentMeta.domain)
    };
    
    // Determine content topics based on domain
    const domainStrategy = this.domainStrategies[analysis.domain];
    if (domainStrategy) {
      analysis.topics = this.identifyTopics(content, domainStrategy.semanticClusters);
    }
    
    return analysis;
  }

  /**
   * Find related content in the network
   */
  async findRelatedContent(contentAnalysis, domain) {
    const related = [];
    
    // Search existing content network
    for (const [existingId, existingContent] of this.contentNetwork.entries()) {
      if (existingContent.domain === domain) {
        const similarity = this.calculateContentSimilarity(
          contentAnalysis,
          existingContent.analysis
        );
        
        if (similarity > this.interlinkingConfig.contextualRelevanceThreshold) {
          related.push({
            contentId: existingId,
            similarity,
            ...existingContent
          });
        }
      }
    }
    
    // Query crystalline memory for additional related content
    if (this.crystallineMemory) {
      try {
        const memoryResults = await this.crystallineMemory.searchMemories(
          'content-network',
          { 
            domain,
            topics: contentAnalysis.topics,
            semanticKeywords: contentAnalysis.semanticKeywords 
          },
          { limit: 20 }
        );
        
        for (const memory of memoryResults || []) {
          if (memory.data.contentId) {
            related.push({
              contentId: memory.data.contentId,
              title: memory.data.title,
              url: memory.data.url,
              similarity: memory.similarity || 0.8,
              source: 'crystalline-memory'
            });
          }
        }
      } catch (error) {
        console.warn('Failed to query crystalline memory for related content:', error.message);
      }
    }
    
    return related.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generate strategic linking opportunities
   */
  async generateStrategicLinks(contentAnalysis, relatedContent, contentMeta) {
    const opportunities = [];
    const domainStrategy = this.domainStrategies[contentAnalysis.domain];
    
    if (!domainStrategy) {
      console.warn(`No domain strategy found for ${contentAnalysis.domain}`);
      return opportunities;
    }
    
    // Generate hub page links
    for (const hubPage of domainStrategy.hubPages) {
      const hubOpportunity = await this.createHubLink(
        contentAnalysis,
        hubPage,
        contentMeta
      );
      if (hubOpportunity) {
        opportunities.push(hubOpportunity);
      }
    }
    
    // Generate contextual links to related content
    for (const related of relatedContent.slice(0, 10)) {
      const contextualOpportunity = await this.createContextualLink(
        contentAnalysis,
        related,
        domainStrategy
      );
      if (contextualOpportunity) {
        opportunities.push(contextualOpportunity);
      }
    }
    
    // Generate semantic cluster links
    const clusterLinks = await this.createSemanticClusterLinks(
      contentAnalysis,
      domainStrategy.semanticClusters,
      relatedContent
    );
    opportunities.push(...clusterLinks);
    
    return opportunities;
  }

  /**
   * Create hub page link opportunity
   */
  async createHubLink(contentAnalysis, hubPage, contentMeta) {
    // Check if hub page is relevant to content
    const relevanceScore = this.calculateHubRelevance(contentAnalysis, hubPage);
    
    if (relevanceScore < 0.6) {
      return null;
    }
    
    return {
      type: 'hub-link',
      targetUrl: `/sl/${hubPage}`,
      anchorText: this.generateHubAnchorText(hubPage, contentMeta.language),
      relevanceScore,
      priority: 0.9, // High priority for hub links
      strategy: 'authority-building',
      context: this.findBestLinkContext(contentAnalysis, hubPage),
      insertionPoint: 'contextual'
    };
  }

  /**
   * Create contextual link opportunity
   */
  async createContextualLink(contentAnalysis, relatedContent, domainStrategy) {
    const anchorTexts = this.generateContextualAnchorTexts(
      relatedContent,
      contentAnalysis.language
    );
    
    return {
      type: 'contextual-link',
      targetUrl: relatedContent.url || `/sl/${relatedContent.slug}`,
      anchorText: anchorTexts[0], // Primary anchor text
      alternativeAnchors: anchorTexts.slice(1),
      relevanceScore: relatedContent.similarity,
      priority: this.calculateLinkPriority(relatedContent, domainStrategy),
      strategy: 'semantic-connection',
      context: this.findSemanticContext(contentAnalysis, relatedContent),
      insertionPoint: 'natural'
    };
  }

  /**
   * Insert link into content
   */
  async insertLink(content, opportunity, options = {}) {
    try {
      const insertionResult = this.findOptimalInsertionPoint(content, opportunity);
      
      if (!insertionResult.found) {
        return { success: false, reason: 'No suitable insertion point found' };
      }
      
      // Create link HTML
      const linkHtml = this.createLinkHtml(opportunity, options);
      
      // Insert link at optimal position
      const updatedContent = this.insertLinkAtPosition(
        content,
        linkHtml,
        insertionResult.position,
        insertionResult.context
      );
      
      return {
        success: true,
        content: updatedContent,
        insertionPoint: insertionResult.position,
        anchorText: opportunity.anchorText
      };
      
    } catch (error) {
      return { success: false, reason: error.message };
    }
  }

  /**
   * Find optimal insertion point for link
   */
  findOptimalInsertionPoint(content, opportunity) {
    const contextKeywords = opportunity.context?.keywords || [];
    const contentSentences = content.split(/[.!?]+/);
    
    let bestPosition = -1;
    let bestScore = 0;
    let bestContext = null;
    
    for (let i = 0; i < contentSentences.length; i++) {
      const sentence = contentSentences[i].trim();
      if (sentence.length < 20) continue; // Skip very short sentences
      
      const score = this.calculateInsertionScore(sentence, opportunity);
      
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestPosition = this.findPositionInContent(content, sentence);
        bestContext = sentence;
      }
    }
    
    return {
      found: bestPosition >= 0,
      position: bestPosition,
      score: bestScore,
      context: bestContext
    };
  }

  /**
   * Calculate insertion score for a sentence
   */
  calculateInsertionScore(sentence, opportunity) {
    let score = 0;
    const sentenceLower = sentence.toLowerCase();
    
    // Check for context keywords
    if (opportunity.context?.keywords) {
      for (const keyword of opportunity.context.keywords) {
        if (sentenceLower.includes(keyword.toLowerCase())) {
          score += 0.3;
        }
      }
    }
    
    // Check for semantic relevance
    const anchorTextWords = opportunity.anchorText.toLowerCase().split(/\s+/);
    for (const word of anchorTextWords) {
      if (sentenceLower.includes(word) && word.length > 3) {
        score += 0.2;
      }
    }
    
    // Prefer sentences in the middle of content
    const sentenceLength = sentence.length;
    if (sentenceLength > 50 && sentenceLength < 200) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Create link HTML
   */
  createLinkHtml(opportunity, options = {}) {
    const attributes = {
      href: opportunity.targetUrl,
      title: options.title || opportunity.anchorText
    };
    
    // Add additional attributes based on link type
    if (opportunity.type === 'hub-link') {
      attributes['data-link-type'] = 'hub';
    }
    
    const attributeString = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    return `<a ${attributeString}>${opportunity.anchorText}</a>`;
  }

  /**
   * Generate hub anchor text
   */
  generateHubAnchorText(hubPage, language = 'sl') {
    const hubTexts = {
      'zobni-implantati-slovenija': {
        sl: ['zobni implantati', 'implantati zob', 'zobna implantacija'],
        en: ['dental implants', 'tooth implants', 'dental implantation']
      },
      'estetska-stomatologija': {
        sl: ['estetska stomatologija', 'estetski posegi', 'lepotna stomatologija'],
        en: ['aesthetic dentistry', 'cosmetic dentistry', 'dental aesthetics']
      }
    };
    
    const options = hubTexts[hubPage]?.[language] || [hubPage];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Build content network
   */
  async buildContentNetwork(contentEntries) {
    console.log('🕸️ Building content network for interlinking optimization...');
    
    for (const entry of contentEntries) {
      const analysis = await this.analyzeContentCharacteristics(entry.content, entry.meta);
      
      this.contentNetwork.set(entry.id, {
        id: entry.id,
        title: entry.title,
        url: entry.url,
        analysis,
        domain: entry.meta.domain,
        createdAt: entry.createdAt || Date.now()
      });
    }
    
    this.linkingMetrics.networkConnections = this.contentNetwork.size;
    console.log(`✅ Content network built with ${this.contentNetwork.size} nodes`);
    
    this.emit('network-built', {
      nodeCount: this.contentNetwork.size,
      domains: [...new Set(Array.from(this.contentNetwork.values()).map(n => n.domain))]
    });
  }

  /**
   * Get interlinking statistics
   */
  getInterlinkingStatistics() {
    return {
      ...this.linkingMetrics,
      contentNetworkSize: this.contentNetwork.size,
      pendingOpportunities: this.linkingOpportunities.size,
      averageLinksPerArticle: this.linkingMetrics.articlesProcessed > 0 ? 
        this.linkingMetrics.linksInserted / this.linkingMetrics.articlesProcessed : 0
    };
  }

  /**
   * Extract headings from content
   */
  extractHeadings(content) {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: match[0].indexOf(' ') - 1,
        text: match[1].trim()
      });
    }
    
    return headings;
  }

  /**
   * Calculate content similarity
   */
  calculateContentSimilarity(analysis1, analysis2) {
    let similarity = 0;
    
    // Topic overlap
    const topicOverlap = this.calculateArrayOverlap(analysis1.topics, analysis2.topics);
    similarity += topicOverlap * 0.4;
    
    // Keyword overlap
    const keywordOverlap = this.calculateArrayOverlap(analysis1.keyPhrases, analysis2.keyPhrases);
    similarity += keywordOverlap * 0.3;
    
    // Domain match
    if (analysis1.domain === analysis2.domain) {
      similarity += 0.3;
    }
    
    return Math.min(similarity, 1.0);
  }

  /**
   * Calculate array overlap ratio
   */
  calculateArrayOverlap(arr1, arr2) {
    if (!arr1?.length || !arr2?.length) return 0;
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}

module.exports = AutomaticInterlinkingStrategySystem;