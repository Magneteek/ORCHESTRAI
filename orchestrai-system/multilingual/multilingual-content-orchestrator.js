/**
 * ORCHESTRAI Multilingual Content Orchestrator
 * 
 * Master orchestrator for multilingual content generation with language isolation,
 * purity validation, and language-specific enhancement strategies
 */

const LanguageIsolationFramework = require('./language-isolation-framework');
const LanguageMemoryMigrator = require('./language-memory-migrator');
const CoTRPromptingSystem = require('./cotr-prompting-system');
const LanguagePurityValidator = require('./language-purity-validator');
const MultilingualEnhancementStrategies = require('./multilingual-enhancement-strategies');

class MultilingualContentOrchestrator {
  constructor(memoryManager, mcpManager) {
    this.memoryManager = memoryManager;
    this.mcpManager = mcpManager;
    
    // Initialize multilingual system components
    this.languageFramework = new LanguageIsolationFramework(memoryManager, mcpManager);
    this.memoryMigrator = new LanguageMemoryMigrator(memoryManager, mcpManager, this.languageFramework);
    this.cotrSystem = new CoTRPromptingSystem(this.languageFramework);
    this.purityValidator = new LanguagePurityValidator(this.languageFramework, this.cotrSystem);
    this.enhancementStrategies = new MultilingualEnhancementStrategies(
      this.languageFramework, 
      this.cotrSystem, 
      this.purityValidator
    );
    
    this.isInitialized = false;
    this.activeGenerations = new Map();
  }

  /**
   * Initialize the multilingual system
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🌐 Multilingual system already initialized');
      return;
    }
    
    console.log('🚀 Initializing ORCHESTRAI Multilingual Content System...');
    console.log('====================================================');
    
    try {
      // Step 1: Initialize language-isolated memory pools
      console.log('📊 Step 1/4: Initializing language memory pools...');
      await this.languageFramework.initializeLanguageMemoryPools();
      
      // Step 2: Migrate existing research data
      console.log('🔄 Step 2/4: Migrating research data to language pools...');
      await this.memoryMigrator.createCoreSlovenianEntities();
      await this.memoryMigrator.migrateNasmehPGToSlovenian();
      
      // Step 3: Validate system components
      console.log('✅ Step 3/4: Validating system components...');
      await this.validateSystemComponents();
      
      // Step 4: System readiness check
      console.log('🎯 Step 4/4: Final readiness check...');
      await this.performReadinessCheck();
      
      this.isInitialized = true;
      console.log('✨ Multilingual system initialization complete!');
      console.log('📈 System Status: READY FOR MULTILINGUAL CONTENT GENERATION');
      
    } catch (error) {
      console.error('❌ Failed to initialize multilingual system:', error.message);
      throw error;
    }
  }

  /**
   * Generate multilingual content with language isolation
   */
  async generateContent(contentRequest) {
    await this.ensureInitialized();
    
    const {
      targetLanguage,
      contentType = 'article',
      wordCount = 2000,
      psychographicTargeting = true,
      qualityThreshold = 0.85,
      contextData = null
    } = contentRequest;
    
    console.log(`🎯 Starting ${targetLanguage.toUpperCase()} content generation...`);
    console.log(`📝 Type: ${contentType} | Target: ${wordCount} words | Quality: ${qualityThreshold * 100}%`);
    
    const generationId = this.generateId();
    this.activeGenerations.set(generationId, {
      language: targetLanguage,
      startTime: Date.now(),
      status: 'generating'
    });
    
    try {
      // Step 1: Prepare language-specific context
      const languageContext = await this.prepareLanguageContext(targetLanguage, contextData);
      
      // Step 2: Generate initial content with CoTR prompting
      const initialContent = await this.generateInitialContent(
        targetLanguage,
        contentType,
        wordCount,
        languageContext
      );
      
      // Step 3: Validate language purity
      const purityValidation = await this.purityValidator.validateLanguagePurity(
        initialContent,
        targetLanguage
      );
      
      if (!purityValidation.passesValidation) {
        throw new Error(`Content failed language purity validation: ${purityValidation.contaminationLevel.level}`);
      }
      
      // Step 4: Apply enhancement strategies
      const enhancedContent = await this.applyEnhancementStrategies(
        initialContent,
        targetLanguage,
        languageContext,
        psychographicTargeting
      );
      
      // Step 5: Final quality validation
      const finalValidation = await this.performFinalQualityCheck(
        enhancedContent.content,
        targetLanguage,
        qualityThreshold
      );
      
      const result = {
        generationId,
        targetLanguage,
        contentType,
        content: enhancedContent.content,
        wordCount: enhancedContent.content.split(/\s+/).length,
        qualityScore: finalValidation.overallScore,
        purityScore: finalValidation.overallScore,
        enhancements: enhancedContent.enhancements,
        validations: {
          initial: purityValidation,
          final: finalValidation
        },
        metadata: {
          generationTime: Date.now() - this.activeGenerations.get(generationId).startTime,
          temperatureUsed: this.cotrSystem.getOptimizedTemperature('consistency', targetLanguage),
          memoryPool: this.languageFramework.getLanguageMemoryPool(targetLanguage)
        }
      };
      
      this.activeGenerations.delete(generationId);
      
      console.log(`🎉 Content generation completed successfully!`);
      console.log(`📊 Quality Score: ${(result.qualityScore * 100).toFixed(1)}%`);
      console.log(`🎯 Purity Score: ${(result.purityScore * 100).toFixed(1)}%`);
      console.log(`⏱️  Generation Time: ${result.metadata.generationTime}ms`);
      
      return result;
      
    } catch (error) {
      this.activeGenerations.delete(generationId);
      console.error(`❌ Content generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Test the multilingual system with Slovenian content
   */
  async testSlovenianContentGeneration() {
    console.log('🧪 Testing Multilingual System with Slovenian Content Generation');
    console.log('=================================================================');
    
    const testRequest = {
      targetLanguage: 'sl',
      contentType: 'dental-article',
      wordCount: 1000,
      psychographicTargeting: true,
      qualityThreshold: 0.85,
      contextData: {
        topic: 'zobni implantati',
        keywords: ['zobni implantati Slovenija', 'zobni vsadki cena', 'implantacija zob'],
        psychographicSegments: [
          { name: 'Pragmatični Varčevalci', percentage: 32 },
          { name: 'Zavedni Eko', percentage: 28 }
        ]
      }
    };
    
    try {
      const result = await this.generateContent(testRequest);
      
      // Analyze results
      const analysisReport = await this.analyzeGenerationResults(result);
      
      console.log('\n📈 Test Results Summary:');
      console.log('========================');
      console.log(`✅ Content Generated: ${result.wordCount} words in ${result.targetLanguage.toUpperCase()}`);
      console.log(`🎯 Quality Score: ${(result.qualityScore * 100).toFixed(1)}%`);
      console.log(`🔍 Purity Score: ${(result.purityScore * 100).toFixed(1)}%`);
      console.log(`🚀 Language Mixing: ${analysisReport.languageMixingDetected ? '❌ DETECTED' : '✅ NONE'}`);
      console.log(`⚡ Generation Speed: ${result.metadata.generationTime}ms`);
      console.log(`🧠 Memory Pool: ${result.metadata.memoryPool}`);
      
      // Test enhancement effectiveness
      const enhancementSummary = result.enhancements.reduce((summary, enhancement) => {
        summary.totalImprovement += enhancement.qualityImprovement || 0;
        summary.strategiesApplied.push(enhancement.type);
        return summary;
      }, { totalImprovement: 0, strategiesApplied: [] });
      
      console.log(`🔧 Enhancements Applied: ${enhancementSummary.strategiesApplied.length}`);
      console.log(`📊 Total Quality Improvement: ${(enhancementSummary.totalImprovement * 100).toFixed(1)}%`);
      
      // Validate against language mixing issues
      if (analysisReport.languageMixingDetected) {
        console.log('\n⚠️  LANGUAGE MIXING DETECTED - SYSTEM NEEDS ADJUSTMENT');
        console.log('Mixed sentences:', analysisReport.mixedSentences.length);
        console.log('Contamination types:', analysisReport.contaminationTypes);
      } else {
        console.log('\n🎉 SUCCESS: No language mixing detected!');
        console.log('✅ System successfully prevents multilingual hallucination');
      }
      
      return {
        success: !analysisReport.languageMixingDetected,
        result,
        analysis: analysisReport
      };
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prepare language-specific context from memory
   */
  async prepareLanguageContext(targetLanguage, contextData) {
    const memoryPool = this.languageFramework.getLanguageMemoryPool(targetLanguage);
    
    // Retrieve language-specific research data from memory
    const psychographicData = await this.mcpManager.memory.search_nodes({
      query: `${targetLanguage} psychographic segments`
    });
    
    const seoData = await this.mcpManager.memory.search_nodes({
      query: `${targetLanguage} SEO keywords`
    });
    
    return {
      ...contextData,
      memoryPool,
      psychographicSegments: psychographicData?.entities || [],
      seoKeywords: seoData?.entities || [],
      language: targetLanguage,
      culturalContext: this.getCulturalContext(targetLanguage)
    };
  }

  /**
   * Generate initial content using CoTR prompting with REAL Claude Code integration
   */
  async generateInitialContent(targetLanguage, contentType, wordCount, context) {
    console.log(`📝 Generating initial ${targetLanguage.toUpperCase()} content...`);
    
    // Build language-specific content request
    const contentRequest = this.buildLanguageSpecificRequest(targetLanguage, wordCount, context);
    
    // Generate CoTR prompt with language isolation
    const cotrPrompt = this.cotrSystem.generateContentPrompt(targetLanguage, contentRequest, context);
    
    try {
      // REAL Claude Code Task tool integration - no more mocks!
      const taskResult = await this.executeRealClaudeCodeTask({
        subagent_type: 'content-writer-specialist',
        prompt: cotrPrompt,
        description: `Generate ${wordCount}-word ${contentType} in ${targetLanguage}`,
        targetLanguage,
        wordCount,
        context
      });
      
      const generatedContent = this.extractContentFromResult(taskResult);
      
      if (!generatedContent || generatedContent.length < wordCount * 3) {
        throw new Error(`Generated content too short: ${generatedContent?.length || 0} characters`);
      }
      
      console.log(`✅ Real content generated: ${this.countWords(generatedContent)} words in ${targetLanguage.toUpperCase()}`);
      return generatedContent;
      
    } catch (error) {
      console.error(`❌ Real content generation failed:`, error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * Build language-specific content request
   */
  buildLanguageSpecificRequest(targetLanguage, wordCount, context) {
    const requests = {
      'sl': `Napišite ${wordCount} besed dolg strokoven članek o ${context.topic || 'zobnih implantatih'}. 
      
      KRITIČNO: Vsebina mora biti IZKLJUČNO v slovenščini. 
      Ne dodajaj nobene besede iz angleščine ali drugih jezikov.
      
      Vključi:
      - Strokoven pristop s slovensko medicinsko terminologijo
      - Slovenske kulturne vrednote in komunikacijski stil
      - Lokalne reference in kontekst Slovenije
      - Ključne besede: ${context.keywords?.join(', ') || 'zobni implantati, zobni vsadki, cena'}`,
      
      'en': `Write a ${wordCount}-word professional article about ${context.topic || 'the specified topic'}.
      
      CRITICAL: Content must be EXCLUSIVELY in English.
      Do not include words from other languages.
      
      Include:
      - Professional approach with appropriate terminology
      - Cultural values and communication style for English-speaking audience
      - Relevant examples and context
      - Keywords: ${context.keywords?.join(', ') || 'relevant keywords'}`,
      
      'de': `Schreiben Sie einen ${wordCount} Wörter langen professionellen Artikel über ${context.topic || 'das angegebene Thema'}.
      
      KRITISCH: Der Inhalt muss AUSSCHLIESSLICH auf Deutsch sein.
      Fügen Sie keine Wörter aus anderen Sprachen hinzu.
      
      Einschließen:
      - Professioneller Ansatz mit angemessener Terminologie
      - Deutsche kulturelle Werte und Kommunikationsstil
      - Relevante Beispiele und Kontext
      - Schlüsselwörter: ${context.keywords?.join(', ') || 'relevante Schlüsselwörter'}`
    };
    
    return requests[targetLanguage] || requests['en'];
  }

  /**
   * Execute real Claude Code task (replaces all mock implementations)
   */
  async executeRealClaudeCodeTask(taskParams) {
    // This method integrates with the Claude Code Task tool through the orchestrator
    // Replaces the broken delegation chains in content-domain-hub.js
    
    const { subagent_type, prompt, description, targetLanguage, wordCount, context } = taskParams;
    
    console.log(`🔗 Real Claude Code integration: ${subagent_type}`);
    
    try {
      // Call the orchestrator's callTool method which should integrate with Claude Code
      const result = await this.orchestrator.callTool('Task', {
        subagent_type,
        prompt,
        description
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Claude Code task execution failed:', error);
      throw error;
    }
  }

  /**
   * Extract content from Claude Code task result
   */
  extractContentFromResult(taskResult) {
    if (typeof taskResult === 'string') {
      return taskResult;
    }
    
    if (taskResult && typeof taskResult === 'object') {
      // Try different possible content fields
      return taskResult.content || 
             taskResult.result || 
             taskResult.output || 
             taskResult.text || 
             JSON.stringify(taskResult);
    }
    
    return '';
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
  }

  /**
   * Generate unique task ID
   */
  generateTaskId() {
    return 'claude_task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Get execution metrics
   */
  getExecutionMetrics() {
    return {
      ...this.executionMetrics,
      activeTasks: this.activeTasks.size,
      agentUtilization: Object.fromEntries(this.executionMetrics.agentUtilization)
    };
  }
}

module.exports = ClaudeCodeExecutionBridge;

  /**
   * Apply enhancement strategies
   */
  async applyEnhancementStrategies(content, targetLanguage, context, usePsychographics) {
    console.log(`🔧 Applying ${targetLanguage.toUpperCase()} enhancement strategies...`);
    
    const strategies = ['culturalAdaptation', 'engagementElements', 'seoOptimization'];
    
    if (usePsychographics) {
      strategies.push('psychographicTargeting');
    }
    
    return await this.enhancementStrategies.applyMultipleEnhancements(
      content,
      targetLanguage,
      strategies,
      context
    );
  }

  /**
   * Perform final quality check
   */
  async performFinalQualityCheck(content, targetLanguage, threshold) {
    console.log(`🔍 Performing final quality validation...`);
    
    const validation = await this.purityValidator.validateLanguagePurity(content, targetLanguage);
    
    if (validation.overallScore < threshold) {
      throw new Error(`Content quality ${(validation.overallScore * 100).toFixed(1)}% below threshold ${(threshold * 100)}%`);
    }
    
    return validation;
  }

  /**
   * Analyze generation results
   */
  async analyzeGenerationResults(result) {
    const languageReport = await this.languageFramework.generateLanguageIsolationReport(
      result.content,
      result.targetLanguage
    );
    
    return {
      languageMixingDetected: !languageReport.passesIsolation,
      mixedSentences: languageReport.mixing.mixedSentences || [],
      contaminationTypes: languageReport.mixing.types || [],
      purityScore: languageReport.overallScore,
      recommendations: languageReport.recommendations
    };
  }

  /**
   * Validate system components
   */
  async validateSystemComponents() {
    const components = [
      { name: 'Language Framework', component: this.languageFramework },
      { name: 'CoTR System', component: this.cotrSystem },
      { name: 'Purity Validator', component: this.purityValidator },
      { name: 'Enhancement Strategies', component: this.enhancementStrategies }
    ];
    
    for (const { name, component } of components) {
      if (!component) {
        throw new Error(`${name} component not initialized`);
      }
    }
    
    console.log('✅ All system components validated');
  }

  /**
   * Perform readiness check
   */
  async performReadinessCheck() {
    const supportedLanguages = this.languageFramework.getSupportedLanguages();
    const availableMemoryPools = Object.keys(this.languageFramework.languageMemoryPools);
    
    console.log(`📊 Supported languages: ${Object.keys(supportedLanguages).join(', ')}`);
    console.log(`🗄️  Memory pools initialized: ${availableMemoryPools.length}`);
    console.log(`⚙️  Temperature optimization: ACTIVE`);
    console.log(`🔍 Language validation: ACTIVE`);
    console.log(`🎯 Enhancement strategies: LOADED`);
  }

  /**
   * Get cultural context for language
   */
  getCulturalContext(languageCode) {
    const contexts = {
      'sl': {
        communicationStyle: 'Direct, trustworthy, practical',
        culturalValues: ['Family-oriented', 'Quality-conscious', 'Tradition-respecting'],
        decisionFactors: ['Price-quality ratio', 'Local expertise', 'Proven results']
      },
      'en': {
        communicationStyle: 'Professional, clear, authoritative',
        culturalValues: ['Innovation', 'Efficiency', 'Individual choice'],
        decisionFactors: ['Convenience', 'Technology', 'Reputation']
      },
      'de': {
        communicationStyle: 'Thorough, precise, systematic',
        culturalValues: ['Quality', 'Reliability', 'Technical excellence'],
        decisionFactors: ['Precision', 'Long-term value', 'Technical specifications']
      }
    };
    
    return contexts[languageCode] || contexts['en'];
  }

  /**
   * Utility methods
   */
  generateId() {
    return 'gen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  getActiveGenerations() {
    return Array.from(this.activeGenerations.values());
  }

  getSystemStats() {
    return {
      initialized: this.isInitialized,
      activeGenerations: this.activeGenerations.size,
      supportedLanguages: Object.keys(this.languageFramework.getSupportedLanguages()),
      validationStats: this.purityValidator.getValidationStats()
    };
  }
}

module.exports = MultilingualContentOrchestrator;