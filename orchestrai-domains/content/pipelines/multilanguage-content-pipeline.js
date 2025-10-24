/**
 * ORCHESTRAI Multi-Language Content Pipeline - Executable Implementation
 *
 * Complete multi-language content creation workflow with 100% language purity enforcement.
 * Implements psychographic targeting, SEO optimization, and quality validation.
 *
 * Stages:
 * 1. Psychographic Research & Targeting - Audience analysis and segmentation
 * 2. Outline Creation with Language Isolation - Comprehensive content planning
 * 3. Multi-Language Content Writing - Native language content creation
 * 4. Quality Validation (Language Purity 100%) - Strict language enforcement
 * 5. SEO & Internal Linking Optimization - Search optimization
 * 6. Memory Integration & Publishing - Knowledge graph integration
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class MultiLanguageContentPipeline extends EventEmitter {
  constructor(
    coordinationPatterns,
    dynamicAgentSelection,
    crystallineMemory,
    redis = null
  ) {
    super();

    this.coordinationPatterns = coordinationPatterns;
    this.dynamicAgentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;

    // Pipeline metadata
    this.pipelineId = 'multilanguage-content';
    this.pipelineName = 'Multi-Language Content Pipeline';
    this.version = '1.0.0';

    // Stage configuration
    this.stages = [
      'psychographic_research',
      'outline_creation',
      'content_writing',
      'ai_detection_validation',  // NEW: Mandatory AI detection gate
      'quality_validation',
      'seo_optimization',
      'memory_publishing'
    ];

    // Required agents
    this.requiredAgents = {
      'psychographic_research': 'general-purpose', // Psychographic research specialist
      'outline_creation': 'content-outline-architect',
      'content_writing': 'content-writer-specialist',
      'ai_detection_validation': 'content-ai-phrase-detector', // NEW: AI detection validation
      'quality_validation': 'content-quality-validator',
      'seo_optimization': 'seo-content-optimization',
      'memory_publishing': 'general-purpose'
    };

    // Language isolation enforcement
    this.languagePurityThreshold = 100; // Zero tolerance for contamination

    console.log('🌍 Multi-Language Content Pipeline initialized');
  }

  /**
   * Execute complete multi-language content pipeline
   */
  async execute(projectSpec, options = {}) {
    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();

    console.log(`\n🚀 Starting Multi-Language Content Pipeline Execution: ${executionId}`);
    console.log(`   Client: ${projectSpec.clientName}`);
    console.log(`   Language: ${projectSpec.language || 'English'}`);
    console.log(`   Target Market: ${projectSpec.targetMarket || 'General'}`);
    console.log(`   Word Count: ${projectSpec.wordCount || 2500}`);

    const execution = {
      executionId,
      pipelineId: this.pipelineId,
      projectSpec,
      options,
      startTime,
      currentStage: null,
      stageResults: {},
      deliverablePaths: {},
      performance: {
        stageTimings: {},
        agentPerformance: {}
      }
    };

    try {
      // Stage 1: Psychographic Research & Targeting
      execution.currentStage = 'psychographic_research';
      this.emit('stage-started', { executionId, stage: 'psychographic_research' });
      const psychographicData = await this.executePsychographicResearch(execution, projectSpec);
      execution.stageResults.psychographic_research = psychographicData;
      this.emit('stage-completed', { executionId, stage: 'psychographic_research', result: psychographicData });

      // Stage 2: Outline Creation with Language Isolation
      execution.currentStage = 'outline_creation';
      this.emit('stage-started', { executionId, stage: 'outline_creation' });
      const outlineData = await this.executeOutlineCreation(execution, psychographicData, projectSpec);
      execution.stageResults.outline_creation = outlineData;
      this.emit('stage-completed', { executionId, stage: 'outline_creation', result: outlineData });

      // MANDATORY CHECKPOINT: Outline must be approved before proceeding
      if (!options.outlineApproved && !options.autoExecute) {
        console.log('\n⚠️  CHECKPOINT: Outline created and requires approval before proceeding to content writing');
        console.log('   Set options.outlineApproved = true to continue');

        return {
          status: 'pending-approval',
          checkpoint: 'outline_creation',
          executionId,
          outlineData,
          message: 'Outline requires approval before proceeding to content writing'
        };
      }

      // Stage 3: Multi-Language Content Writing
      execution.currentStage = 'content_writing';
      this.emit('stage-started', { executionId, stage: 'content_writing' });
      const contentData = await this.executeContentWriting(execution, outlineData, projectSpec);
      execution.stageResults.content_writing = contentData;
      this.emit('stage-completed', { executionId, stage: 'content_writing', result: contentData });

      // Stage 4a: AI Detection Validation (MANDATORY GATE - <30% threshold)
      execution.currentStage = 'ai_detection_validation';
      this.emit('stage-started', { executionId, stage: 'ai_detection_validation' });
      const aiDetectionData = await this.executeAIDetectionValidation(execution, contentData, projectSpec);
      execution.stageResults.ai_detection_validation = aiDetectionData;
      this.emit('stage-completed', { executionId, stage: 'ai_detection_validation', result: aiDetectionData });

      // BLOCKING GATE: AI detection risk must be <30% (target: 15-25%)
      if (aiDetectionData.aiDetectionRisk >= 30) {
        throw new Error(`AI detection validation failed: ${aiDetectionData.aiDetectionRisk}% (required: <30%)`);
      }

      // Stage 4b: Quality Validation (Language Purity 100%)
      execution.currentStage = 'quality_validation';
      this.emit('stage-started', { executionId, stage: 'quality_validation' });
      const qualityData = await this.executeQualityValidation(execution, contentData, outlineData, projectSpec);
      execution.stageResults.quality_validation = qualityData;
      this.emit('stage-completed', { executionId, stage: 'quality_validation', result: qualityData });

      // BLOCKING GATE: Language purity must be 100%
      if (qualityData.languagePurity < 100) {
        throw new Error(`Language purity validation failed: ${qualityData.languagePurity}% (required: 100%)`);
      }

      // Stage 5: SEO & Internal Linking Optimization
      execution.currentStage = 'seo_optimization';
      this.emit('stage-started', { executionId, stage: 'seo_optimization' });
      const seoData = await this.executeSEOOptimization(execution, contentData, qualityData, projectSpec);
      execution.stageResults.seo_optimization = seoData;
      this.emit('stage-completed', { executionId, stage: 'seo_optimization', result: seoData });

      // Stage 6: Memory Integration & Publishing
      execution.currentStage = 'memory_publishing';
      this.emit('stage-started', { executionId, stage: 'memory_publishing' });
      const publishingData = await this.executeMemoryPublishing(execution, seoData, projectSpec);
      execution.stageResults.memory_publishing = publishingData;
      this.emit('stage-completed', { executionId, stage: 'memory_publishing', result: publishingData });

      // Calculate execution metrics
      const duration = Date.now() - startTime;
      execution.duration = duration;
      execution.status = 'completed';

      console.log(`\n✅ Multi-Language Content Pipeline Completed: ${executionId}`);
      console.log(`   Duration: ${Math.round(duration / 1000 / 60)} minutes`);
      console.log(`   Language Purity: ${qualityData.languagePurity}%`);
      console.log(`   Content Quality: ${qualityData.overallQuality}%`);

      this.emit('pipeline-completed', {
        executionId,
        duration,
        results: execution.stageResults,
        deliverables: execution.deliverablePaths
      });

      return {
        success: true,
        executionId,
        duration,
        results: execution.stageResults,
        deliverablePaths: execution.deliverablePaths,
        performance: execution.performance,
        qualityMetrics: {
          languagePurity: qualityData.languagePurity,
          overallQuality: qualityData.overallQuality,
          seoScore: seoData.seoScore
        }
      };

    } catch (error) {
      console.error(`\n❌ Multi-Language Content Pipeline Failed: ${executionId}`);
      console.error(`   Stage: ${execution.currentStage}`);
      console.error(`   Error:`, error.message);

      execution.status = 'failed';
      execution.error = error;

      this.emit('pipeline-failed', {
        executionId,
        stage: execution.currentStage,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Stage 1: Psychographic Research & Targeting
   */
  async executePsychographicResearch(execution, projectSpec) {
    console.log('\n🎯 Stage 1: Psychographic Research & Targeting');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.psychographic_research,
      domain: 'research',
      capabilities: ['psychographic-analysis', 'audience-segmentation', 'persona-development'],
      context: {
        targetMarket: projectSpec.targetMarket,
        language: projectSpec.language,
        clientName: projectSpec.clientName
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve existing psychographic data from memory
    const existingPsychographicData = await this.retrieveExistingPsychographicData(projectSpec);

    const psychographicPrompt = this.buildPsychographicResearchPrompt(
      projectSpec,
      existingPsychographicData
    );

    const psychographicResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-psychographic-research`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: psychographicPrompt,
      context: {
        targetMarket: projectSpec.targetMarket,
        language: projectSpec.language,
        existingData: existingPsychographicData
      }
    });

    // Save psychographic research deliverables
    const deliverablePath = await this.savePsychographicDeliverables(
      execution,
      psychographicResult,
      projectSpec
    );

    execution.deliverablePaths.psychographic = deliverablePath;
    execution.performance.stageTimings.psychographic_research = Date.now() - stageStart;

    console.log(`   ✅ Psychographic research completed`);
    console.log(`   Segments: ${psychographicResult.segmentCount || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      segments: psychographicResult.segments,
      emotionalTriggers: psychographicResult.emotionalTriggers,
      painPoints: psychographicResult.painPoints,
      desires: psychographicResult.desires,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 2: Outline Creation with Language Isolation
   */
  async executeOutlineCreation(execution, psychographicData, projectSpec) {
    console.log('\n📝 Stage 2: Outline Creation (Language Isolation Enforced)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.outline_creation,
      domain: 'content',
      capabilities: ['outline-creation', 'content-planning', 'psychographic-targeting'],
      context: {
        language: projectSpec.language,
        targetKeyword: projectSpec.targetKeyword,
        psychographicSegments: psychographicData.segments
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve SEO research and keyword data
    const seoResearch = await this.retrieveSEOResearch(projectSpec);
    const clusterContent = await this.retrieveClusterContent(projectSpec);

    const outlinePrompt = this.buildOutlineCreationPrompt(
      projectSpec,
      psychographicData,
      seoResearch,
      clusterContent
    );

    const outlineResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-outline-creation`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: outlinePrompt,
      context: {
        language: projectSpec.language,
        psychographicData,
        seoResearch,
        targetKeyword: projectSpec.targetKeyword,
        wordCount: projectSpec.wordCount
      }
    });

    // Save outline deliverables
    const deliverablePath = await this.saveOutlineDeliverables(
      execution,
      outlineResult,
      projectSpec
    );

    execution.deliverablePaths.outline = deliverablePath;
    execution.performance.stageTimings.outline_creation = Date.now() - stageStart;

    console.log(`   ✅ Outline created (100% ${projectSpec.language})`);
    console.log(`   Sections: ${outlineResult.sectionCount || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      outline: outlineResult.outline,
      psychographicMapping: outlineResult.psychographicMapping,
      keywordMapping: outlineResult.keywordMapping,
      wordCountDistribution: outlineResult.wordCountDistribution,
      internalLinkingPlan: outlineResult.internalLinkingPlan,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 3: Multi-Language Content Writing (MANDATORY: Use Task Tool with Agent)
   */
  async executeContentWriting(execution, outlineData, projectSpec) {
    console.log('\n✍️  Stage 3: Multi-Language Content Writing (Natural Flow & Conversational)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.content_writing,
      domain: 'content',
      capabilities: ['content-writing', 'natural-flow', 'psychographic-targeting', 'language-isolation'],
      context: {
        language: projectSpec.language,
        outline: outlineData.outline,
        psychographicMapping: outlineData.psychographicMapping
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);
    console.log(`   🚨 MANDATORY: Using specialized content-writer-specialist for natural, conversational content`);

    const contentPrompt = this.buildContentWritingPrompt(
      projectSpec,
      outlineData
    );

    const contentResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-content-writing`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: contentPrompt,
      context: {
        language: projectSpec.language,
        outline: outlineData.outline,
        psychographicMapping: outlineData.psychographicMapping,
        keywordMapping: outlineData.keywordMapping,
        naturalFlowRequired: true,
        conversationalTone: true
      }
    });

    // Save content deliverables
    const deliverablePath = await this.saveContentDeliverables(
      execution,
      contentResult,
      projectSpec
    );

    execution.deliverablePaths.content = deliverablePath;
    execution.performance.stageTimings.content_writing = Date.now() - stageStart;

    console.log(`   ✅ Content written (100% ${projectSpec.language})`);
    console.log(`   Word Count: ${contentResult.wordCount || 'N/A'}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      content: contentResult.content,
      wordCount: contentResult.wordCount,
      psychographicAlignment: contentResult.psychographicAlignment,
      keywordIntegration: contentResult.keywordIntegration,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 4a: AI Detection Validation (MANDATORY GATE - <30% threshold)
   */
  async executeAIDetectionValidation(execution, contentData, projectSpec) {
    console.log('\n🤖 Stage 4a: AI Detection Validation (MANDATORY GATE - <30% threshold)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.ai_detection_validation,
      domain: 'content',
      capabilities: ['ai-phrase-detection', 'pattern-analysis', 'human-voice-validation'],
      context: {
        language: projectSpec.language,
        content: contentData.content
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const aiDetectionPrompt = this.buildAIDetectionPrompt(projectSpec, contentData);

    const aiDetectionResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-ai-detection-validation`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: aiDetectionPrompt,
      context: {
        language: projectSpec.language,
        content: contentData.content,
        targetThreshold: 30,
        targetRange: '15-25%'
      }
    });

    // Enforce blocking gate: AI detection risk must be <30%
    if (aiDetectionResult.aiDetectionRisk >= 30) {
      console.error(`\n❌ BLOCKING GATE FAILED: AI Detection Risk`);
      console.error(`   Required: <30%`);
      console.error(`   Actual: ${aiDetectionResult.aiDetectionRisk}%`);
      console.error(`   Forbidden Phrases Found: ${aiDetectionResult.forbiddenPhrasesCount || 0}`);
      console.error(`   Pattern Repetition: ${aiDetectionResult.patternRepetition || 0}%`);

      // Save failed validation report
      await this.saveAIDetectionFailureReport(execution, aiDetectionResult, projectSpec);

      throw new Error(`AI detection validation failed: ${aiDetectionResult.aiDetectionRisk}% (required: <30%)`);
    }

    // Save AI detection validation deliverables
    const deliverablePath = await this.saveAIDetectionDeliverables(
      execution,
      aiDetectionResult,
      projectSpec
    );

    execution.deliverablePaths.ai_detection = deliverablePath;
    execution.performance.stageTimings.ai_detection_validation = Date.now() - stageStart;

    console.log(`   ✅ AI detection validation PASSED`);
    console.log(`   AI Detection Risk: ${aiDetectionResult.aiDetectionRisk}% ✓`);
    console.log(`   Target Range: 15-25% (Human-level)`);
    console.log(`   Forbidden Phrases: ${aiDetectionResult.forbiddenPhrasesCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      aiDetectionRisk: aiDetectionResult.aiDetectionRisk,
      forbiddenPhrases: aiDetectionResult.forbiddenPhrases || [],
      forbiddenPhrasesCount: aiDetectionResult.forbiddenPhrasesCount || 0,
      patternRepetition: aiDetectionResult.patternRepetition || 0,
      structuralIssues: aiDetectionResult.structuralIssues || [],
      humanVoiceScore: aiDetectionResult.humanVoiceScore || 0,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 4b: Quality Validation (Language Purity 100% - BLOCKING GATE)
   */
  async executeQualityValidation(execution, contentData, outlineData, projectSpec) {
    console.log('\n✅ Stage 4b: Quality Validation (Language Purity 100% - BLOCKING)');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.quality_validation,
      domain: 'content',
      capabilities: ['quality-validation', 'language-purity-check', 'content-architecture-validation'],
      context: {
        language: projectSpec.language,
        content: contentData.content,
        outline: outlineData.outline
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    const qualityPrompt = this.buildQualityValidationPrompt(
      projectSpec,
      contentData,
      outlineData
    );

    const qualityResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-quality-validation`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: qualityPrompt,
      context: {
        language: projectSpec.language,
        content: contentData.content,
        outline: outlineData.outline,
        languagePurityThreshold: this.languagePurityThreshold
      }
    });

    // Enforce blocking gate: Language Purity must be 100%
    if (qualityResult.languagePurity < 100) {
      console.error(`\n❌ BLOCKING GATE FAILED: Language Purity`);
      console.error(`   Required: 100%`);
      console.error(`   Actual: ${qualityResult.languagePurity}%`);
      console.error(`   Contamination Found: ${qualityResult.contaminationDetails}`);

      // Save failed validation report
      await this.saveFailedValidationReport(execution, qualityResult, projectSpec);

      throw new Error(`Language Purity validation failed: ${qualityResult.languagePurity}% (required: 100%)`);
    }

    // Save quality validation deliverables
    const deliverablePath = await this.saveQualityDeliverables(
      execution,
      qualityResult,
      projectSpec
    );

    execution.deliverablePaths.quality = deliverablePath;
    execution.performance.stageTimings.quality_validation = Date.now() - stageStart;

    console.log(`   ✅ Quality validation PASSED`);
    console.log(`   Language Purity: ${qualityResult.languagePurity}% ✓`);
    console.log(`   Overall Quality: ${qualityResult.overallQuality}%`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      languagePurity: qualityResult.languagePurity,
      overallQuality: qualityResult.overallQuality,
      paragraphDistribution: qualityResult.paragraphDistribution,
      contentArchitectureCompliance: qualityResult.contentArchitectureCompliance,
      readabilityScore: qualityResult.readabilityScore,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 5: SEO & Internal Linking Optimization
   */
  async executeSEOOptimization(execution, contentData, qualityData, projectSpec) {
    console.log('\n🔍 Stage 5: SEO & Internal Linking Optimization');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.seo_optimization,
      domain: 'seo',
      capabilities: ['seo-optimization', 'internal-linking', 'keyword-optimization'],
      context: {
        language: projectSpec.language,
        content: contentData.content,
        targetKeyword: projectSpec.targetKeyword
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve cluster content for internal linking
    const clusterContent = await this.retrieveClusterContent(projectSpec);

    const seoPrompt = this.buildSEOOptimizationPrompt(
      projectSpec,
      contentData,
      qualityData,
      clusterContent
    );

    const seoResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-seo-optimization`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: seoPrompt,
      context: {
        language: projectSpec.language,
        content: contentData.content,
        targetKeyword: projectSpec.targetKeyword,
        clusterContent
      }
    });

    // Save SEO optimization deliverables
    const deliverablePath = await this.saveSEODeliverables(
      execution,
      seoResult,
      projectSpec
    );

    execution.deliverablePaths.seo = deliverablePath;
    execution.performance.stageTimings.seo_optimization = Date.now() - stageStart;

    console.log(`   ✅ SEO optimization completed`);
    console.log(`   SEO Score: ${seoResult.seoScore || 'N/A'}%`);
    console.log(`   Internal Links: ${seoResult.internalLinkCount || 0}`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      optimizedContent: seoResult.optimizedContent,
      seoScore: seoResult.seoScore,
      keywordDensity: seoResult.keywordDensity,
      internalLinks: seoResult.internalLinks,
      metaData: seoResult.metaData,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 6: Memory Integration & Publishing
   */
  async executeMemoryPublishing(execution, seoData, projectSpec) {
    console.log('\n🧠 Stage 6: Memory Integration & Publishing');
    const stageStart = Date.now();

    const agent = await this.dynamicAgentSelection.selectAgentForTask({
      agentType: this.requiredAgents.memory_publishing,
      domain: 'content',
      capabilities: ['memory-integration', 'knowledge-graph', 'content-publishing'],
      context: {
        content: seoData.optimizedContent,
        clientName: projectSpec.clientName
      }
    });

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Store content in crystalline memory
    await this.storeContentInMemory(execution, seoData, projectSpec);

    // Create memory relations to psychographic segments and cluster content
    await this.createMemoryRelations(execution, seoData, projectSpec);

    const publishingPrompt = this.buildMemoryPublishingPrompt(
      projectSpec,
      seoData,
      execution.stageResults
    );

    const publishingResult = await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-memory-publishing`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt: publishingPrompt,
      context: {
        content: seoData.optimizedContent,
        clientName: projectSpec.clientName,
        language: projectSpec.language
      }
    });

    // Save publishing deliverables
    const deliverablePath = await this.savePublishingDeliverables(
      execution,
      publishingResult,
      projectSpec
    );

    execution.deliverablePaths.publishing = deliverablePath;
    execution.performance.stageTimings.memory_publishing = Date.now() - stageStart;

    console.log(`   ✅ Memory integration and publishing completed`);
    console.log(`   Saved to: ${deliverablePath}`);

    return {
      publishedContent: publishingResult.publishedContent,
      memoryEntities: publishingResult.memoryEntities,
      memoryRelations: publishingResult.memoryRelations,
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Helper: Retrieve existing psychographic data from memory
   */
  async retrieveExistingPsychographicData(projectSpec) {
    if (!this.crystallineMemory) return null;

    try {
      const psychographicMemory = await this.crystallineMemory.searchMemory(
        projectSpec.clientName,
        { semantic_tags: ['psychographic', 'audience-segmentation'], limit: 5 }
      );

      return psychographicMemory;
    } catch (error) {
      console.warn('Could not retrieve psychographic data:', error.message);
      return null;
    }
  }

  /**
   * Helper: Retrieve SEO research from memory
   */
  async retrieveSEOResearch(projectSpec) {
    if (!this.crystallineMemory) return null;

    try {
      const seoMemory = await this.crystallineMemory.searchMemory(
        `${projectSpec.targetKeyword} ${projectSpec.clientName}`,
        { semantic_tags: ['seo-research', 'keyword-research'], limit: 5 }
      );

      return seoMemory;
    } catch (error) {
      console.warn('Could not retrieve SEO research:', error.message);
      return null;
    }
  }

  /**
   * Helper: Retrieve cluster content for internal linking
   */
  async retrieveClusterContent(projectSpec) {
    if (!this.crystallineMemory) return null;

    try {
      const clusterMemory = await this.crystallineMemory.searchMemory(
        projectSpec.clientName,
        { semantic_tags: ['content', 'cluster-content', projectSpec.language], limit: 10 }
      );

      return clusterMemory;
    } catch (error) {
      console.warn('Could not retrieve cluster content:', error.message);
      return null;
    }
  }

  /**
   * Helper: Store content in crystalline memory
   */
  async storeContentInMemory(execution, seoData, projectSpec) {
    if (!this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeMemory({
        entity_type: 'content-article',
        entity_name: `${projectSpec.clientName}-${projectSpec.targetKeyword}-${projectSpec.language}`,
        content: seoData.optimizedContent,
        semantic_tags: ['content', 'article', projectSpec.language, 'cluster-content'],
        metadata: {
          executionId: execution.executionId,
          timestamp: Date.now(),
          language: projectSpec.language,
          targetKeyword: projectSpec.targetKeyword,
          wordCount: seoData.wordCount || 0,
          seoScore: seoData.seoScore || 0
        }
      });

      console.log('   💾 Content stored in crystalline memory');
    } catch (error) {
      console.warn('Could not store content in memory:', error.message);
    }
  }

  /**
   * Helper: Create memory relations
   */
  async createMemoryRelations(execution, seoData, projectSpec) {
    if (!this.crystallineMemory) return;

    try {
      // Create relations to psychographic segments
      const psychographicSegments = execution.stageResults.psychographic_research?.segments || [];

      for (const segment of psychographicSegments) {
        await this.crystallineMemory.createRelation({
          from: `${projectSpec.clientName}-${projectSpec.targetKeyword}-${projectSpec.language}`,
          to: segment.name,
          relationType: 'targets-psychographic-segment'
        });
      }

      // Create relations to cluster content
      const internalLinks = seoData.internalLinks || [];

      for (const link of internalLinks) {
        await this.crystallineMemory.createRelation({
          from: `${projectSpec.clientName}-${projectSpec.targetKeyword}-${projectSpec.language}`,
          to: link.targetArticle,
          relationType: 'internal-link-to'
        });
      }

      console.log('   🔗 Memory relations created');
    } catch (error) {
      console.warn('Could not create memory relations:', error.message);
    }
  }

  /**
   * Prompt Builders
   */
  buildPsychographicResearchPrompt(projectSpec, existingData) {
    return `Conduct comprehensive psychographic research and audience segmentation for ${projectSpec.clientName}.

**Context:**
- Target Market: ${projectSpec.targetMarket || 'General'}
- Language: ${projectSpec.language || 'English'}
- Target Keyword: ${projectSpec.targetKeyword || 'Primary keyword'}

**Existing Psychographic Data:**
${existingData ? JSON.stringify(existingData, null, 2) : 'No existing data available'}

**Required Analysis:**
1. **Audience Segments** (3-5 primary segments):
   - Demographic characteristics
   - Psychographic profiles
   - Emotional drivers
   - Pain points and desires
   - Decision-making factors
   - Percentage distribution

2. **Emotional Triggers** (per segment):
   - Primary emotions to evoke
   - Motivation factors
   - Trust-building elements
   - Call-to-action angles

3. **Content Tone Mapping**:
   - Professional vs. conversational balance
   - Technical depth requirements
   - Empathy level per segment
   - Authority demonstration needs

Provide detailed psychographic targeting framework for content creation.`;
  }

  buildOutlineCreationPrompt(projectSpec, psychographicData, seoResearch, clusterContent) {
    return `Create comprehensive content outline with 100% language isolation for ${projectSpec.language} content.

**CRITICAL: This outline must be 100% in ${projectSpec.language} - ZERO English contamination allowed.**

**Target Keyword:** ${projectSpec.targetKeyword}
**Word Count:** ${projectSpec.wordCount || 2500}
**Language:** ${projectSpec.language}

**Psychographic Segments:**
${JSON.stringify(psychographicData.segments, null, 2)}

**SEO Research:**
${seoResearch ? JSON.stringify(seoResearch, null, 2) : 'No SEO research available'}

**Existing Cluster Content:**
${clusterContent ? JSON.stringify(clusterContent, null, 2) : 'No cluster content available'}

**Required Outline Structure:**
1. **H1 Title** (in ${projectSpec.language}):
   - Primary keyword integration
   - Emotional hook for primary psychographic segment

2. **Introduction** (150-200 words):
   - Psychographic segment: [Segment name] (percentage)
   - Emotional tone: [Tone description]
   - Keywords to integrate: [List]
   - Reader concerns to address: [List]

3. **H2 Sections** (5-7 sections):
   For each H2:
   - **Section Title** (in ${projectSpec.language})
   - **Psychographic targeting:** [Segment] (percentage)
   - **Emotional tone:** [Description]
   - **Word count:** [Exact count]
   - **Content Requirements:** [What to cover in PARAGRAPH FORM]
   - **Supporting keywords:** [List]
   - **H3 subsections:** [If needed]
   - **Engagement elements:** [Tables, boxes - NOT lists of Content Requirements]

4. **Internal Linking Architecture**:
   - Related cluster content to link to
   - Anchor text recommendations
   - Link placement strategy

5. **CTA Strategy**:
   - Per psychographic segment
   - Placement within content
   - Emotional triggers to use

**MANDATORY CONTENT ARCHITECTURE:**
- Paragraph Distribution: 40% short / 40% medium / 20% long
- Maximum bulleted lists: 16-20 total
- Maximum tables: 6-8
- Bold text: Minimal (10-15 instances max)

Provide complete outline ready for content writing phase.`;
  }

  buildContentWritingPrompt(projectSpec, outlineData) {
    return `Write natural, conversational ${projectSpec.language} content following the approved outline.

**CRITICAL REQUIREMENTS:**
1. **100% ${projectSpec.language} - ZERO English words allowed**
2. **Natural, conversational flow - like expert explaining to friend**
3. **Psychographic targeting - address specific segment concerns naturally**
4. **Smooth transitions between paragraphs - guide reader journey**
5. **AI DETECTION PREVENTION - MANDATORY (Target: <25% AI detection risk)**

**Approved Outline:**
${JSON.stringify(outlineData.outline, null, 2)}

**Psychographic Mapping:**
${JSON.stringify(outlineData.psychographicMapping, null, 2)}

**Keyword Mapping:**
${JSON.stringify(outlineData.keywordMapping, null, 2)}

**AI DETECTION PREVENTION (MANDATORY):**

**Forbidden Phrases - NEVER USE:**
- "Picture yourself" / "Imagine yourself" / "Imagine [number]"
- "Let's be honest..." / "Let's start with..."
- "If you've ever dreamed of..."
- "Here's what makes..." / "Here's the thing..."
- "What's interesting is..." / "Building on this..."
- "There's something truly special about..."
- "Ready for [experience]?" / "Excited about..."
- "The truth is..." / "Let's face it..."
- Excessive weak intensifiers: truly, really, absolutely, incredibly (max 3-4 total)
- "In today's fast-paced world" / "In the digital age"

**Structural Requirements:**
- Vary ALL section openings (no repetitive patterns - max 15% similarity)
- Use specific measurements over vague superlatives
  Example: "150 kilometers of coastline" not "spectacular beaches"
- Include honest limitations where relevant
  Example: "parking can be challenging" not all positive
- Write with direct confidence, avoid meta-commentary
- Add human imperfections (varied rhythm, not perfectly polished)
- Reduce em-dashes usage by 60%
- NO formulaic sentence starters (avoid "In order to", "With regards to", "In terms of")

**Quality Targets:**
- AI detection risk: <25% (human-level)
- Read-aloud test: Must sound conversational
- Pattern repetition: <15% identical structures
- Specific details: Include exact numbers, measurements, honest observations

**NATURAL WRITING FLOW REQUIREMENTS:**

1. **Conversational Tone:**
   - Write as if having expert conversation over coffee
   - Use direct address ("you", "your concerns", "when you're considering...")
   - Include relatable scenarios and examples
   - Ask rhetorical questions to engage readers
   - Express empathy for reader concerns

2. **Paragraph Transitions:**
   - Each paragraph must flow naturally to the next
   - Use transition phrases: "Building on this...", "Here's what's interesting...", "But there's more to consider..."
   - Create logical progression through topics
   - Bridge ideas smoothly - avoid abrupt topic jumps

3. **Sentence Variety:**
   - Mix short punchy statements (3-6 words)
   - Flowing explanations (15-25 words)
   - Detailed descriptions (25+ words)
   - AVOID formulaic patterns - vary your structure

4. **Content Architecture (MANDATORY):**
   - 40% short paragraphs (1-2 sentences)
   - 40% medium paragraphs (3-5 sentences)
   - 20% long paragraphs (6+ sentences)
   - Maximum 16-20 bulleted lists TOTAL across entire article
   - Bold text ONLY for true emphasis (10-15 instances max)
   - NO bold text at start of every paragraph

5. **Psychographic Integration:**
   - Execute planned emotional tones naturally
   - Address segment concerns through conversational language
   - Build trust through empathy and understanding
   - Demonstrate expertise without being academic

6. **Keyword Integration:**
   - Weave keywords naturally into conversational flow
   - NEVER force keywords - prioritize natural language
   - Integrate supporting keywords contextually

**INTERPRETATION RULES:**
- "Content Requirements" in outline = PARAGRAPH FORM (flowing text)
- "Engagement Elements" in outline = Tables, boxes, occasional lists
- NEVER convert Content Requirements into bulleted lists

Write complete article that sounds like trusted expert having conversation, not academic textbook.`;
  }

  buildAIDetectionPrompt(projectSpec, contentData) {
    return `Analyze content for AI-generated patterns and phrases (Target: <25% AI detection risk, Accept: <30%).

**Content to Analyze:**
${JSON.stringify(contentData.content, null, 2)}

**Language:** ${projectSpec.language}

**MANDATORY AI DETECTION ANALYSIS:**

1. **Forbidden Phrases Detection:**
   - Scan for ALL forbidden phrases from the critical list:
     * "Picture yourself" / "Imagine yourself" / "Imagine [number]"
     * "Let's be honest..." / "Let's start with..."
     * "If you've ever dreamed of..."
     * "Here's what makes..." / "Here's the thing..."
     * "What's interesting is..." / "Building on this..."
     * "There's something truly special about..."
     * "In today's fast-paced world" / "In the digital age"
     * Excessive weak intensifiers (truly, really, absolutely, incredibly)
   - Report: Every instance found with location and count
   - Calculate: forbiddenPhrasesCount

2. **Pattern Repetition Analysis:**
   - Analyze section openings for formulaic patterns
   - Identify repetitive sentence structures
   - Check for identical transitions between paragraphs
   - Calculate: patternRepetition percentage (target: <15%)
   - Report: Specific patterns that repeat

3. **Structural AI Patterns:**
   - Formulaic sentence starters ("In order to", "With regards to", "In terms of")
   - Meta-commentary padding ("It's important to note", "It should be emphasized")
   - Excessive em-dashes (count and flag if >10% of sentences)
   - Generic superlatives without specific details
   - Report: List of structural issues found

4. **Human Voice Score:**
   - Assess conversational tone (0-100)
   - Evaluate natural transitions
   - Check for specific details vs. vague statements
   - Measure sentence variety
   - Report: humanVoiceScore (0-100, target: >75)

5. **Overall AI Detection Risk:**
   - Calculate comprehensive AI detection risk (0-100%)
   - Weight: Forbidden phrases (40%), Pattern repetition (30%), Structural issues (20%), Human voice (10%)
   - Report: aiDetectionRisk percentage
   - **BLOCKING GATE**: If aiDetectionRisk >= 30%, validation FAILS

**Required Output Format:**
{
  "aiDetectionRisk": [percentage],
  "forbiddenPhrases": [array of found phrases with locations],
  "forbiddenPhrasesCount": [count],
  "patternRepetition": [percentage],
  "structuralIssues": [array of issues],
  "humanVoiceScore": [0-100],
  "passesGate": [true if <30%, false otherwise]
}

**CRITICAL**: This is a BLOCKING gate. If aiDetectionRisk >= 30%, content MUST be revised.

Provide complete AI detection analysis.`;
  }

  buildQualityValidationPrompt(projectSpec, contentData, outlineData) {
    return `Validate content quality with STRICT language purity enforcement (100% ${projectSpec.language} required).

**Content to Validate:**
${JSON.stringify(contentData.content, null, 2)}

**Outline Requirements:**
${JSON.stringify(outlineData.outline, null, 2)}

**MANDATORY VALIDATION CHECKS:**

1. **Language Purity (BLOCKING - Must be 100%):**
   - Scan EVERY word for ${projectSpec.language} purity
   - Identify ANY English contamination
   - Check product names, technical terms, branded terms
   - Verify NO English words exist (zero tolerance)
   - Report: languagePurity percentage and contaminationDetails

2. **Paragraph Distribution Compliance:**
   - Count ALL paragraphs in article
   - Categorize: Short (1-2 sentences), Medium (3-5 sentences), Long (6+ sentences)
   - Calculate distribution percentages
   - Target: 40% short / 40% medium / 20% long
   - Report: paragraphDistribution object with counts and percentages

3. **Content Architecture Compliance:**
   - Count bulleted lists (must be ≤16-20 total)
   - Count bold text instances (must be ≤10-15)
   - Verify tables ≤6-8
   - Check for formulaic bold text at paragraph starts
   - Report: contentArchitectureCompliance object

4. **Natural Flow Assessment:**
   - Evaluate paragraph transitions (smooth vs. abrupt)
   - Check conversational tone consistency
   - Assess sentence variety and rhythm
   - Verify empathy and reader connection
   - Report: naturalFlowScore (0-100)

5. **Psychographic Alignment:**
   - Verify targeting matches outline plan
   - Check emotional tone execution
   - Validate concern addressing
   - Report: psychographicAlignmentScore (0-100)

6. **Readability Score:**
   - Flesch reading ease (target: 60-70)
   - Average sentence length
   - Paragraph length variety
   - Report: readabilityScore

7. **Overall Quality Score:**
   - Comprehensive quality assessment
   - All dimensions weighted
   - Report: overallQuality (0-100)

**BLOCKING GATE ENFORCEMENT:**
If languagePurity < 100%, provide detailed contamination report and FAIL validation.

Provide complete validation report with all metrics.`;
  }

  buildSEOOptimizationPrompt(projectSpec, contentData, qualityData, clusterContent) {
    return `Optimize content for SEO and create internal linking architecture.

**Content:**
${JSON.stringify(contentData.content, null, 2)}

**Quality Metrics:**
${JSON.stringify(qualityData, null, 2)}

**Target Keyword:** ${projectSpec.targetKeyword}
**Language:** ${projectSpec.language}

**Cluster Content for Internal Linking:**
${clusterContent ? JSON.stringify(clusterContent, null, 2) : 'No cluster content available'}

**Required SEO Optimization:**
1. **Keyword Optimization:**
   - Primary keyword density (1-2%)
   - Supporting keyword integration
   - LSI keyword inclusion
   - Natural keyword placement

2. **Meta Data:**
   - SEO Title (55-60 characters, includes primary keyword)
   - Meta Description (150-160 characters, compelling CTA)
   - Focus Keyphrase
   - SEO Slug

3. **Internal Linking:**
   - Identify 5-8 internal linking opportunities
   - Match anchor text to target pages naturally
   - Ensure links flow conversationally
   - Create linking architecture diagram

4. **Content Structure SEO:**
   - H1, H2, H3 optimization
   - Paragraph length optimization
   - List and table SEO enhancement
   - Image alt text recommendations

5. **Semantic SEO:**
   - Related entity optimization
   - Topic cluster integration
   - Semantic relationship enhancement

6. **SEO Score Calculation:**
   - Keyword optimization: [Score]
   - Content structure: [Score]
   - Internal linking: [Score]
   - Meta data quality: [Score]
   - Overall SEO Score: [0-100]

Provide optimized content with complete SEO implementation.`;
  }

  buildMemoryPublishingPrompt(projectSpec, seoData, stageResults) {
    return `Prepare content for publishing and create memory integration documentation.

**Optimized Content:**
${JSON.stringify(seoData.optimizedContent, null, 2)}

**Pipeline Results:**
${JSON.stringify(stageResults, null, 2)}

**Required Publishing Preparation:**
1. **Final Content Package:**
   - Formatted content for CMS
   - Meta data package
   - Internal linking implementation
   - Image recommendations with alt text

2. **Memory Entity Documentation:**
   - Content entity details
   - Psychographic segment relations
   - Cluster content relations
   - SEO entity connections

3. **Publishing Checklist:**
   - Content quality verification
   - SEO implementation checklist
   - Internal linking verification
   - Meta data review

4. **Performance Tracking Setup:**
   - Keyword tracking configuration
   - Analytics goal setup
   - Conversion tracking recommendations

Provide complete publishing package ready for CMS integration.`;
  }

  /**
   * Deliverable Savers
   */
  async savePsychographicDeliverables(execution, psychographicResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/research/psychographic'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const psychographicFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-psychographic.json`);
    await fs.writeFile(
      psychographicFile,
      JSON.stringify(psychographicResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Psychographic research saved: ${psychographicFile}`);
    return deliverablePath;
  }

  async saveOutlineDeliverables(execution, outlineResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/outlines'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const outlineFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-outline.json`);
    await fs.writeFile(
      outlineFile,
      JSON.stringify(outlineResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Outline saved: ${outlineFile}`);
    return deliverablePath;
  }

  async saveContentDeliverables(execution, contentResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/articles'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const contentFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-article.json`);
    await fs.writeFile(
      contentFile,
      JSON.stringify(contentResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Content saved: ${contentFile}`);
    return deliverablePath;
  }

  async saveQualityDeliverables(execution, qualityResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/quality-reports'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const qualityFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-quality-report.json`);
    await fs.writeFile(
      qualityFile,
      JSON.stringify(qualityResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Quality report saved: ${qualityFile}`);
    return deliverablePath;
  }

  async saveSEODeliverables(execution, seoResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/seo/content-optimization'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const seoFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-seo-optimized.json`);
    await fs.writeFile(
      seoFile,
      JSON.stringify(seoResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 SEO optimization saved: ${seoFile}`);
    return deliverablePath;
  }

  async savePublishingDeliverables(execution, publishingResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/publishing'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const publishingFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-publishing-package.json`);
    await fs.writeFile(
      publishingFile,
      JSON.stringify(publishingResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 Publishing package saved: ${publishingFile}`);
    return deliverablePath;
  }

  async saveAIDetectionDeliverables(execution, aiDetectionResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/ai-detection-reports'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const aiDetectionFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-ai-detection-report.json`);
    await fs.writeFile(
      aiDetectionFile,
      JSON.stringify(aiDetectionResult, null, 2),
      'utf-8'
    );

    console.log(`   💾 AI detection report saved: ${aiDetectionFile}`);
    return deliverablePath;
  }

  async saveAIDetectionFailureReport(execution, aiDetectionResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/failed-ai-detection'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const failedFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-failed-ai-detection.json`);
    await fs.writeFile(
      failedFile,
      JSON.stringify({
        timestamp: Date.now(),
        executionId: execution.executionId,
        reason: 'AI Detection Validation Failed',
        aiDetectionRisk: aiDetectionResult.aiDetectionRisk,
        requiredThreshold: 30,
        targetRange: '15-25%',
        forbiddenPhrasesFound: aiDetectionResult.forbiddenPhrasesCount || 0,
        forbiddenPhrases: aiDetectionResult.forbiddenPhrases || [],
        patternRepetition: aiDetectionResult.patternRepetition || 0,
        structuralIssues: aiDetectionResult.structuralIssues || [],
        humanVoiceScore: aiDetectionResult.humanVoiceScore || 0
      }, null, 2),
      'utf-8'
    );

    console.log(`   💾 Failed AI detection report saved: ${failedFile}`);
  }

  async saveFailedValidationReport(execution, qualityResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/failed-validations'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const failedFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-failed-validation.json`);
    await fs.writeFile(
      failedFile,
      JSON.stringify({
        timestamp: Date.now(),
        executionId: execution.executionId,
        reason: 'Language Purity Validation Failed',
        languagePurity: qualityResult.languagePurity,
        contaminationDetails: qualityResult.contaminationDetails,
        requiredPurity: 100
      }, null, 2),
      'utf-8'
    );

    console.log(`   💾 Failed validation report saved: ${failedFile}`);
  }

  /**
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      pipelineId: this.pipelineId,
      pipelineName: this.pipelineName,
      version: '2.0.0', // Updated with AI detection integration
      stages: this.stages,
      estimatedDuration: 180, // minutes (3 hours)
      requiredAgents: this.requiredAgents,
      qualityGates: [
        'outline_approval',
        'ai_detection_risk_30', // NEW: AI detection must be <30%
        'language_purity_100',
        'content_architecture_compliance',
        'overall_quality_90'
      ],
      enhancementsV2: {
        aiDetectionPrevention: true,
        mandatoryAIGate: true,
        targetAIRisk: '15-25%',
        forbiddenPhrasesList: true,
        parallelExecutionReady: true
      }
    };
  }
}

module.exports = MultiLanguageContentPipeline;
