// Language Task Router - Stable multilingual processing with language-specific routing
// Routes to appropriate Claude Code subagents with language isolation

class LanguageTaskRouter {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    
    // Direct mapping of languages to appropriate Claude Code subagents
    this.languageAgentMap = new Map([
      // English - Primary content agent
      ['en', {
        primary: 'content-writer-specialist',
        secondary: 'content-quality-validator',
        specialization: 'native-english-content'
      }],
      
      // Slovenian - Specialized multilingual adapter
      ['sl', {
        primary: 'multi-language-content-adapter',
        secondary: 'content-quality-validator', 
        specialization: 'slovenian-cultural-adaptation'
      }],
      
      // German - Multilingual with cultural focus
      ['de', {
        primary: 'multi-language-content-adapter',
        secondary: 'content-quality-validator',
        specialization: 'german-market-adaptation'
      }],
      
      // Spanish - Multilingual with regional awareness
      ['es', {
        primary: 'multi-language-content-adapter', 
        secondary: 'content-quality-validator',
        specialization: 'spanish-cultural-adaptation'
      }],
      
      // Dutch - Multilingual adaptation
      ['nl', {
        primary: 'multi-language-content-adapter',
        secondary: 'content-quality-validator', 
        specialization: 'dutch-market-adaptation'
      }]
    ]);
    
    // Language-specific validation patterns
    this.languageValidationRules = new Map([
      ['sl', {
        culturalMarkers: ['slovenian', 'slovenia', 'ljubljana', 'euro'],
        forbiddenPatterns: ['deutsch', 'spanish', 'english', 'dutch'],
        requiredTone: 'formal-professional',
        marketContext: 'central-european'
      }],
      ['de', {
        culturalMarkers: ['german', 'germany', 'deutschland', 'euro'],
        forbiddenPatterns: ['slovenian', 'spanish', 'english', 'dutch'],
        requiredTone: 'formal-technical',
        marketContext: 'german-speaking'
      }],
      ['es', {
        culturalMarkers: ['spanish', 'spain', 'español', 'euro'],
        forbiddenPatterns: ['german', 'slovenian', 'english', 'dutch'],
        requiredTone: 'warm-professional',
        marketContext: 'spanish-speaking'
      }],
      ['nl', {
        culturalMarkers: ['dutch', 'netherlands', 'nederland', 'euro'],
        forbiddenPatterns: ['german', 'slovenian', 'spanish', 'english'],
        requiredTone: 'direct-professional',
        marketContext: 'dutch-speaking'
      }],
      ['en', {
        culturalMarkers: ['english', 'american', 'british', 'global'],
        forbiddenPatterns: [], // English is fallback
        requiredTone: 'professional-accessible',
        marketContext: 'international'
      }]
    ]);
    
    // Isolated memory pools per language to prevent cross-contamination
    this.languageMemoryPools = new Map();
    
    console.log('🌐 LanguageTaskRouter initialized with isolated language processing');
  }

  /**
   * Main entry point for language-specific content generation
   */
  async generateLanguageContent(request) {
    const { 
      targetLanguage, 
      content, 
      contentType = 'article',
      marketContext = {},
      qualityThreshold = 0.85,
      culturalAdaptation = true 
    } = request;
    
    console.log(`🗣️  Generating ${targetLanguage.toUpperCase()} content with language isolation`);
    
    try {
      // Step 1: Pre-validate language request
      const validationResult = await this.preValidateLanguageRequest(request);
      if (!validationResult.valid) {
        return this.createErrorResponse(validationResult.errors, targetLanguage);
      }
      
      // Step 2: Get isolated memory context for this language
      const languageMemoryContext = await this.getIsolatedLanguageMemory(targetLanguage);
      
      // Step 3: Route to appropriate Claude Code subagent
      const routingDecision = this.routeToLanguageAgent(targetLanguage, contentType);
      
      // Step 4: Build language-specific prompt with cultural context
      const languagePrompt = this.buildLanguageSpecificPrompt(
        content, 
        targetLanguage, 
        marketContext, 
        languageMemoryContext,
        culturalAdaptation
      );
      
      // Step 5: Execute through appropriate Claude Code subagent
      const generationResult = await this.executeLanguageGeneration(
        routingDecision, 
        languagePrompt, 
        targetLanguage
      );
      
      // Step 6: Post-validate language purity and cultural accuracy
      const postValidationResult = await this.postValidateLanguageContent(
        generationResult, 
        targetLanguage,
        qualityThreshold
      );
      
      // Step 7: Store in isolated language memory pool
      await this.storeInLanguageMemory(
        targetLanguage, 
        postValidationResult, 
        languageMemoryContext
      );
      
      return this.createSuccessResponse(postValidationResult, targetLanguage, routingDecision);
      
    } catch (error) {
      console.error(`❌ Language generation failed for ${targetLanguage}:`, error.message);
      return this.createErrorResponse([error.message], targetLanguage);
    }
  }

  /**
   * Pre-validate language request before processing
   */
  async preValidateLanguageRequest(request) {
    const { targetLanguage, content } = request;
    const errors = [];
    
    // Check if language is supported
    if (!this.languageAgentMap.has(targetLanguage)) {
      errors.push(`Language ${targetLanguage} not supported. Available: ${Array.from(this.languageAgentMap.keys()).join(', ')}`);
    }
    
    // Check content length
    if (!content || content.length < 10) {
      errors.push('Content too short for meaningful language adaptation');
    }
    
    // Check for language mixing indicators in source
    if (content && targetLanguage !== 'en') {
      const validationRules = this.languageValidationRules.get(targetLanguage);
      if (validationRules) {
        const hasForbiddenPatterns = validationRules.forbiddenPatterns.some(pattern => 
          content.toLowerCase().includes(pattern)
        );
        
        if (hasForbiddenPatterns) {
          errors.push(`Source content contains language mixing patterns for ${targetLanguage}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      targetLanguage
    };
  }

  /**
   * Get isolated memory context for specific language
   */
  async getIsolatedLanguageMemory(targetLanguage) {
    const memoryPoolKey = `language_memory_${targetLanguage}`;
    
    try {
      // Check if we already have an isolated pool for this language
      if (!this.languageMemoryPools.has(targetLanguage)) {
        console.log(`🧠 Creating isolated memory pool for ${targetLanguage}`);
        
        // Create isolated memory context
        const isolatedContext = {
          language: targetLanguage,
          culturalContext: this.languageValidationRules.get(targetLanguage)?.marketContext || 'general',
          previousGenerations: [],
          qualityPatterns: [],
          culturalAdaptations: []
        };
        
        this.languageMemoryPools.set(targetLanguage, isolatedContext);
        
        // Store in crystalline memory with language isolation
        await this.crystallineMemory.storeMemory(
          memoryPoolKey,
          JSON.stringify(isolatedContext),
          {
            importance: 0.9,
            semantic_tags: ['multilingual', `language-${targetLanguage}`, 'isolated-pool'],
            domain: 'multilingual'
          }
        );
      }
      
      return this.languageMemoryPools.get(targetLanguage);
      
    } catch (error) {
      console.error(`⚠️ Failed to get isolated memory for ${targetLanguage}, using fallback`);
      return {
        language: targetLanguage,
        culturalContext: 'general',
        previousGenerations: [],
        qualityPatterns: [],
        culturalAdaptations: []
      };
    }
  }

  /**
   * Route to appropriate Claude Code subagent based on language
   */
  routeToLanguageAgent(targetLanguage, contentType) {
    const languageConfig = this.languageAgentMap.get(targetLanguage);
    
    if (!languageConfig) {
      console.warn(`⚠️ No specific agent for ${targetLanguage}, using general multilingual`);
      return {
        primaryAgent: 'multi-language-content-adapter',
        secondaryAgent: 'content-quality-validator',
        specialization: 'general-multilingual',
        confidence: 0.5
      };
    }
    
    return {
      primaryAgent: languageConfig.primary,
      secondaryAgent: languageConfig.secondary,
      specialization: languageConfig.specialization,
      confidence: 0.9,
      targetLanguage
    };
  }

  /**
   * Build language-specific prompt with cultural context
   */
  buildLanguageSpecificPrompt(content, targetLanguage, marketContext, memoryContext, culturalAdaptation) {
    const validationRules = this.languageValidationRules.get(targetLanguage);
    
    let prompt = `Generate content in ${targetLanguage.toUpperCase()} ONLY.\n\n`;
    
    // Add strict language isolation instructions
    prompt += `CRITICAL: Use ONLY ${targetLanguage.toUpperCase()} language throughout.\n`;
    prompt += `Do NOT mix with other languages.\n`;
    prompt += `Ensure native speaker quality and cultural appropriateness.\n\n`;
    
    // Add cultural context
    if (validationRules && culturalAdaptation) {
      prompt += `Cultural Context: ${validationRules.marketContext}\n`;
      prompt += `Required Tone: ${validationRules.requiredTone}\n`;
      
      if (validationRules.culturalMarkers.length > 0) {
        prompt += `Cultural References: Consider ${validationRules.culturalMarkers.join(', ')}\n`;
      }
    }
    
    // Add market context if provided
    if (marketContext && Object.keys(marketContext).length > 0) {
      prompt += `Market Context: ${JSON.stringify(marketContext, null, 2)}\n`;
    }
    
    // Add memory context from previous generations
    if (memoryContext.previousGenerations.length > 0) {
      prompt += `Previous Quality Patterns: Use successful patterns from previous generations\n`;
    }
    
    prompt += `\nContent to adapt:\n${content}\n\n`;
    
    // Add final validation instruction
    prompt += `Ensure final content:\n`;
    prompt += `- Uses ONLY ${targetLanguage.toUpperCase()} language\n`;
    prompt += `- Maintains cultural appropriateness\n`;
    prompt += `- Follows native speaker conventions\n`;
    prompt += `- Avoids literal translations\n`;
    
    return prompt;
  }

  /**
   * Execute language generation through Claude Code subagent
   */
  async executeLanguageGeneration(routingDecision, prompt, targetLanguage) {
    console.log(`🤖 Executing ${targetLanguage} generation via ${routingDecision.primaryAgent}`);
    
    try {
      // Execute primary language generation
      const primaryResult = await this.orchestrator.callTool('Task', {
        prompt: prompt,
        subagent_type: routingDecision.primaryAgent,
        description: `${targetLanguage.toUpperCase()} content generation - ${routingDecision.specialization}`
      });
      
      return {
        success: true,
        content: primaryResult,
        agent: routingDecision.primaryAgent,
        specialization: routingDecision.specialization,
        targetLanguage,
        generationTimestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Primary agent ${routingDecision.primaryAgent} failed for ${targetLanguage}`);
      
      // Fallback to secondary agent
      try {
        console.log(`🔄 Attempting fallback with ${routingDecision.secondaryAgent}`);
        
        const fallbackResult = await this.orchestrator.callTool('Task', {
          prompt: prompt + '\n\nNOTE: This is a fallback generation attempt.',
          subagent_type: routingDecision.secondaryAgent,
          description: `${targetLanguage.toUpperCase()} content generation - fallback`
        });
        
        return {
          success: true,
          content: fallbackResult,
          agent: routingDecision.secondaryAgent,
          specialization: 'fallback-generation',
          targetLanguage,
          generationTimestamp: new Date().toISOString(),
          isFallback: true
        };
        
      } catch (fallbackError) {
        throw new Error(`Both primary and fallback agents failed for ${targetLanguage}: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Post-validate generated content for language purity and quality
   */
  async postValidateLanguageContent(generationResult, targetLanguage, qualityThreshold) {
    if (!generationResult.success) {
      return generationResult;
    }
    
    const content = typeof generationResult.content === 'string' 
      ? generationResult.content 
      : JSON.stringify(generationResult.content);
    
    const validation = {
      languagePurity: 0,
      culturalAccuracy: 0,
      qualityScore: 0,
      issues: [],
      passed: false
    };
    
    // Language purity check
    const validationRules = this.languageValidationRules.get(targetLanguage);
    if (validationRules) {
      // Check for forbidden language patterns
      const hasForbiddenPatterns = validationRules.forbiddenPatterns.some(pattern => 
        content.toLowerCase().includes(pattern)
      );
      
      validation.languagePurity = hasForbiddenPatterns ? 0.3 : 0.9;
      
      if (hasForbiddenPatterns) {
        validation.issues.push('Content contains mixed language patterns');
      }
      
      // Check for cultural markers
      const hasCulturalMarkers = validationRules.culturalMarkers.some(marker =>
        content.toLowerCase().includes(marker.toLowerCase())
      );
      
      validation.culturalAccuracy = hasCulturalMarkers ? 0.9 : 0.6;
    } else {
      validation.languagePurity = 0.7; // Default for unsupported languages
      validation.culturalAccuracy = 0.5;
    }
    
    // Overall quality score
    validation.qualityScore = (validation.languagePurity + validation.culturalAccuracy) / 2;
    validation.passed = validation.qualityScore >= qualityThreshold;
    
    return {
      ...generationResult,
      validation,
      qualityPassed: validation.passed
    };
  }

  /**
   * Store results in isolated language memory
   */
  async storeInLanguageMemory(targetLanguage, validatedResult, memoryContext) {
    try {
      // Update memory context with this generation
      memoryContext.previousGenerations.push({
        timestamp: new Date().toISOString(),
        qualityScore: validatedResult.validation?.qualityScore || 0,
        agent: validatedResult.agent,
        success: validatedResult.qualityPassed
      });
      
      // Keep only last 10 generations to prevent memory bloat
      if (memoryContext.previousGenerations.length > 10) {
        memoryContext.previousGenerations = memoryContext.previousGenerations.slice(-10);
      }
      
      // Update language memory pool
      this.languageMemoryPools.set(targetLanguage, memoryContext);
      
      // Store updated context in crystalline memory
      const memoryPoolKey = `language_memory_${targetLanguage}`;
      await this.crystallineMemory.storeMemory(
        memoryPoolKey,
        JSON.stringify(memoryContext),
        {
          importance: 0.8,
          semantic_tags: ['multilingual', `language-${targetLanguage}`, 'generation-history'],
          domain: 'multilingual'
        }
      );
      
    } catch (error) {
      console.error(`⚠️ Failed to store language memory for ${targetLanguage}:`, error.message);
    }
  }

  /**
   * Create success response
   */
  createSuccessResponse(validatedResult, targetLanguage, routingDecision) {
    return {
      success: true,
      targetLanguage,
      content: validatedResult.content,
      metadata: {
        agent: validatedResult.agent,
        specialization: routingDecision.specialization,
        qualityScore: validatedResult.validation?.qualityScore || 0,
        languagePurity: validatedResult.validation?.languagePurity || 0,
        culturalAccuracy: validatedResult.validation?.culturalAccuracy || 0,
        qualityPassed: validatedResult.qualityPassed,
        isFallback: validatedResult.isFallback || false,
        generationTimestamp: validatedResult.generationTimestamp
      },
      validation: validatedResult.validation,
      isolatedExecution: true
    };
  }

  /**
   * Create error response
   */
  createErrorResponse(errors, targetLanguage) {
    return {
      success: false,
      targetLanguage,
      errors,
      message: `Language generation failed for ${targetLanguage}: ${errors.join('; ')}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get supported languages and their configurations
   */
  getSupportedLanguages() {
    const languages = {};
    
    for (const [language, config] of this.languageAgentMap.entries()) {
      languages[language] = {
        primaryAgent: config.primary,
        specialization: config.specialization,
        validationRules: this.languageValidationRules.has(language),
        isolatedMemory: this.languageMemoryPools.has(language)
      };
    }
    
    return languages;
  }

  /**
   * Health check for language routing system
   */
  getLanguageRouterHealth() {
    return {
      supportedLanguages: this.languageAgentMap.size,
      activeLanguageMemoryPools: this.languageMemoryPools.size,
      validationRules: this.languageValidationRules.size,
      systemStatus: 'operational',
      isolationActive: true
    };
  }
}

module.exports = LanguageTaskRouter;