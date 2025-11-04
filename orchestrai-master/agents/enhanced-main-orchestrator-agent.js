// Enhanced Main Orchestrator Agent - Single gateway with parallel execution
// Replaces complex multi-phase system with direct Claude Code subagent coordination

const EventEmitter = require('events');
const DirectTaskOrchestrator = require('../../orchestrai-shared/execution/direct-task-orchestrator');
const LanguageTaskRouter = require('../../orchestrai-shared/multilingual/language-task-router');

class EnhancedMainOrchestratorAgent extends EventEmitter {
  constructor(orchestrator, mcpManager, crystallineMemory, domainManager, templateEngine) {
    super();
    
    this.orchestrator = orchestrator;
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.domainManager = domainManager;
    this.templateEngine = templateEngine;
    
    this.agentId = 'enhanced-main-orchestrator-agent';
    
    // Initialize new execution systems
    this.directOrchestrator = new DirectTaskOrchestrator(orchestrator, crystallineMemory);
    this.languageRouter = new LanguageTaskRouter(orchestrator, crystallineMemory);
    
    // Simplified orchestration metrics
    this.metrics = {
      totalQueries: 0,
      parallelExecutions: 0,
      averageResponseTime: 0,
      languageRequests: 0,
      successRate: 0,
      lastActivity: null
    };
    
    // Query handling patterns for quick routing decisions
    this.quickRoutes = new Map([
      ['multilingual', (query, context) => this.handleMultilingualQuery(query, context)],
      ['language-specific', (query, context) => this.handleLanguageSpecificQuery(query, context)],
      ['general', (query, context) => this.handleGeneralQuery(query, context)]
    ]);
    
    console.log('🎯 Enhanced Main Orchestrator Agent initialized - Single user gateway with parallel execution');
  }

  /**
   * Main query processing method - ONLY user communication point
   */
  async processQuery(queryRequest) {
    const startTime = Date.now();
    this.metrics.totalQueries++;
    this.metrics.lastActivity = new Date().toISOString();
    
    console.log('🎯 Enhanced Main Orchestrator: Processing query as SINGLE user gateway');
    
    try {
      // Extract query details
      const { query, context = {}, metadata = {} } = queryRequest;
      
      if (!query) {
        throw new Error('Query is required');
      }
      
      // Step 1: Quick route determination (no complex analysis)
      const routeType = this.determineQuickRoute(query, context);
      
      // Step 2: Execute through appropriate handler
      const handler = this.quickRoutes.get(routeType) || this.quickRoutes.get('general');
      const result = await handler(query, context);
      
      // Step 3: Update metrics and return response
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, result.success);
      
      console.log(`✅ Query processed in ${responseTime}ms via ${routeType} route`);
      
      return {
        success: result.success,
        response: result.response || result.content,
        metadata: {
          ...result.metadata,
          processingTime: responseTime,
          routeType,
          orchestratorAgent: this.agentId,
          timestamp: new Date().toISOString()
        },
        executionDetails: result.executionDetails
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false);
      
      console.error('❌ Enhanced Main Orchestrator query failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          processingTime: responseTime,
          orchestratorAgent: this.agentId,
          timestamp: new Date().toISOString()
        },
        fallbackMessage: 'I encountered an error. Please try rephrasing your request or breaking it into smaller parts.'
      };
    }
  }

  /**
   * Quick route determination without complex analysis
   */
  determineQuickRoute(query, context) {
    const queryLower = query.toLowerCase();
    
    // Language-specific indicators
    const languageIndicators = ['slovenian', 'german', 'spanish', 'dutch', 'translate', 'language'];
    const hasLanguageIndicators = languageIndicators.some(indicator => queryLower.includes(indicator));
    
    // Multiple language indicators
    const multilingualIndicators = ['multiple languages', 'all languages', 'translate to', 'in different languages'];
    const hasMultilingualIndicators = multilingualIndicators.some(indicator => queryLower.includes(indicator));
    
    // Context-based routing
    if (context.targetLanguage && context.targetLanguage !== 'en') {
      return 'language-specific';
    }
    
    if (context.languages && Array.isArray(context.languages) && context.languages.length > 1) {
      return 'multilingual';
    }
    
    // Query content-based routing
    if (hasMultilingualIndicators) {
      return 'multilingual';
    }
    
    if (hasLanguageIndicators) {
      return 'language-specific';
    }
    
    return 'general';
  }

  /**
   * Handle general queries through direct orchestration
   */
  async handleGeneralQuery(query, context) {
    console.log('🎯 Routing to DirectTaskOrchestrator for general query processing');
    
    try {
      const result = await this.directOrchestrator.processUserQuery(query, context);
      
      return {
        success: result.success,
        response: result,
        metadata: {
          executionMode: 'direct-orchestration',
          parallelExecution: result.executionSummary?.executionMode === 'parallel',
          tasksExecuted: result.executionSummary?.totalTasks || 0
        },
        executionDetails: result.executionSummary
      };
      
    } catch (error) {
      throw new Error(`Direct orchestration failed: ${error.message}`);
    }
  }

  /**
   * Handle language-specific queries
   */
  async handleLanguageSpecificQuery(query, context) {
    const targetLanguage = context.targetLanguage || this.extractLanguageFromQuery(query);
    
    console.log(`🌐 Routing to LanguageTaskRouter for ${targetLanguage} processing`);
    
    try {
      // Prepare language-specific request
      const languageRequest = {
        targetLanguage,
        content: query,
        contentType: context.contentType || 'article',
        marketContext: context.marketContext || {},
        qualityThreshold: context.qualityThreshold || 0.85,
        culturalAdaptation: context.culturalAdaptation !== false
      };
      
      const result = await this.languageRouter.generateLanguageContent(languageRequest);
      
      if (result.success) {
        this.metrics.languageRequests++;
      }
      
      return {
        success: result.success,
        response: result.content,
        content: result.content,
        metadata: {
          executionMode: 'language-specific',
          targetLanguage,
          agent: result.metadata?.agent,
          qualityScore: result.metadata?.qualityScore,
          languagePurity: result.metadata?.languagePurity,
          culturalAccuracy: result.metadata?.culturalAccuracy
        },
        validation: result.validation
      };
      
    } catch (error) {
      throw new Error(`Language-specific processing failed: ${error.message}`);
    }
  }

  /**
   * Handle multilingual queries (multiple languages simultaneously)
   */
  async handleMultilingualQuery(query, context) {
    const languages = context.languages || this.extractLanguagesFromQuery(query);
    
    console.log(`🌍 Processing multilingual query for languages: ${languages.join(', ')}`);
    
    try {
      const result = await this.directOrchestrator.processMultilingualQuery(query, languages, context);
      
      if (result.success) {
        this.metrics.languageRequests += languages.length;
        this.metrics.parallelExecutions++;
      }
      
      return {
        success: result.success,
        response: result.multilingualResults,
        metadata: {
          executionMode: 'multilingual-parallel',
          languagesProcessed: result.languagesProcessed,
          parallelExecution: result.parallelExecution
        },
        executionDetails: result.multilingualResults
      };
      
    } catch (error) {
      throw new Error(`Multilingual processing failed: ${error.message}`);
    }
  }

  /**
   * Extract target language from query text
   */
  extractLanguageFromQuery(query) {
    const languagePatterns = {
      'sl': ['slovenian', 'slovenia', 'slovene'],
      'de': ['german', 'germany', 'deutsch'],
      'es': ['spanish', 'spain', 'español'],
      'nl': ['dutch', 'netherlands', 'nederland']
    };
    
    const queryLower = query.toLowerCase();
    
    for (const [language, patterns] of Object.entries(languagePatterns)) {
      if (patterns.some(pattern => queryLower.includes(pattern))) {
        return language;
      }
    }
    
    return 'en'; // Default to English
  }

  /**
   * Extract multiple languages from query
   */
  extractLanguagesFromQuery(query) {
    const allLanguages = this.extractLanguageFromQuery(query);
    const queryLower = query.toLowerCase();
    
    // Check for multiple language indicators
    if (queryLower.includes('all languages') || queryLower.includes('multiple languages')) {
      return ['en', 'sl', 'de', 'es', 'nl'];
    }
    
    if (queryLower.includes('european languages')) {
      return ['en', 'sl', 'de', 'nl'];
    }
    
    // Default to target language + English
    return allLanguages !== 'en' ? [allLanguages, 'en'] : ['en'];
  }

  /**
   * Update orchestration metrics
   */
  updateMetrics(responseTime, success) {
    // Update success rate
    const currentSuccessCount = Math.round(this.metrics.successRate * (this.metrics.totalQueries - 1) / 100);
    const newSuccessCount = success ? currentSuccessCount + 1 : currentSuccessCount;
    this.metrics.successRate = Math.round((newSuccessCount / this.metrics.totalQueries) * 100);
    
    // Update average response time
    const currentAvg = this.metrics.averageResponseTime;
    this.metrics.averageResponseTime = currentAvg === 0 
      ? responseTime 
      : Math.round((currentAvg + responseTime) / 2);
  }

  /**
   * Create unified article - streamlined endpoint
   */
  async createUnifiedArticle(articleRequest) {
    console.log('📝 Creating unified article through enhanced orchestration');
    
    const { 
      title, 
      targetLanguage = 'en',
      keywords = [],
      wordCount = 2000,
      outline = null,
      psychographicTargeting = false,
      qualityThreshold = 0.85 
    } = articleRequest;
    
    try {
      // Build comprehensive prompt for article creation
      const articlePrompt = this.buildArticlePrompt(
        title, 
        targetLanguage, 
        keywords, 
        wordCount, 
        outline, 
        psychographicTargeting
      );
      
      // Route to appropriate system based on language
      if (targetLanguage !== 'en') {
        return await this.handleLanguageSpecificQuery(articlePrompt, {
          targetLanguage,
          contentType: 'article',
          qualityThreshold
        });
      } else {
        return await this.handleGeneralQuery(articlePrompt, {
          contentType: 'article',
          keywords,
          wordCount
        });
      }
      
    } catch (error) {
      throw new Error(`Unified article creation failed: ${error.message}`);
    }
  }

  /**
   * Build comprehensive article creation prompt
   */
  buildArticlePrompt(title, language, keywords, wordCount, outline, psychographicTargeting) {
    let prompt = `Create a comprehensive article with the following specifications:\n\n`;
    prompt += `Title: ${title}\n`;
    prompt += `Target Language: ${language.toUpperCase()}\n`;
    prompt += `Word Count: ${wordCount} words\n`;
    
    if (keywords.length > 0) {
      prompt += `Keywords to include: ${keywords.join(', ')}\n`;
    }
    
    if (outline) {
      prompt += `Article Outline: ${outline}\n`;
    }
    
    if (psychographicTargeting) {
      prompt += `Include psychographic targeting and audience-specific messaging\n`;
    }
    
    prompt += `\nRequirements:\n`;
    prompt += `- Native ${language.toUpperCase()} language quality\n`;
    prompt += `- SEO-optimized structure\n`;
    prompt += `- Engaging and informative content\n`;
    prompt += `- Professional tone appropriate for target market\n`;
    
    return prompt;
  }

  /**
   * Get orchestrator status and health
   */
  getOrchestratorStatus() {
    return {
      agentId: this.agentId,
      isMainGateway: true,
      metrics: this.metrics,
      systemComponents: {
        directOrchestrator: this.directOrchestrator.getOrchestrationHealth(),
        languageRouter: this.languageRouter.getLanguageRouterHealth(),
        parallelEngine: this.directOrchestrator.parallelEngine.getExecutionStatus()
      },
      supportedLanguages: this.languageRouter.getSupportedLanguages(),
      capabilities: Array.from(this.directOrchestrator.capabilityAgentMap.keys()),
      isOperational: true
    };
  }

  /**
   * Process batch queries in parallel
   */
  async processBatchQueries(queries) {
    console.log(`📋 Processing ${queries.length} queries in batch mode`);
    
    const batchPromises = queries.map((query, index) => 
      this.processQuery({
        query: query.query || query,
        context: query.context || {},
        metadata: { batchIndex: index, ...query.metadata }
      })
    );
    
    const results = await Promise.allSettled(batchPromises);
    
    return {
      success: true,
      totalQueries: queries.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || !r.value.success).length,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message }),
      batchProcessing: true
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Enhanced Main Orchestrator Agent shutting down...');
    
    // Shutdown execution systems
    await this.directOrchestrator.shutdown();
    
    // Clear metrics and listeners
    this.removeAllListeners();
    
    console.log('✅ Enhanced Main Orchestrator Agent shutdown complete');
  }
}

module.exports = EnhancedMainOrchestratorAgent;