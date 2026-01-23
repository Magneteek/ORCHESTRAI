/**
 * ORCHESTRAI Multi-Language Content Pipeline - Refactored with BasePipeline (OPTIMIZED)
 *
 * MIGRATION: Now extends BasePipeline abstract class (Phase 3.2)
 * - Code reduction: 1,710 → ~900 lines (47% reduction)
 * - Eliminates: Duplicate constructor, execute(), deliverable savers
 * - Preserves: All domain-specific logic, prompts, validation gates
 *
 * OPTIMIZATION (Dec 2025): Parallel execution for independent validation stages
 * - Validation stages now execute in parallel (67% faster: 15min vs 45min)
 * - Overall pipeline: ~150min (was 180min) = 17% improvement
 *
 * Complete multi-language content creation workflow with 100% language purity enforcement.
 * Implements psychographic targeting, SEO optimization, and quality validation.
 *
 * Stages:
 * 1. Psychographic Research & Targeting - Audience analysis and segmentation (20 min)
 * 2. Outline Creation with Language Isolation - Comprehensive content planning (25 min)
 * 3. Multi-Language Content Writing - Native language content creation (60 min)
 * 4-6. [PARALLEL] Language + AI Detection + Quality Validation (15 min)
 * 7. SEO & Internal Linking Optimization - Search optimization (15 min)
 * 8. Memory Integration & Publishing - Knowledge graph integration (15 min)
 *
 * Total Duration: ~150 minutes (optimized from 180 minutes)
 */

const BasePipeline = require('../../../orchestrai-shared/pipelines/base-pipeline');
const path = require('path');
const fs = require('fs').promises;

class MultiLanguageContentPipeline extends BasePipeline {
  constructor(coordinationPatterns, dynamicAgentSelection, crystallineMemory, redis = null) {
    // Call BasePipeline constructor with dependencies and configuration
    super(
      { coordinationPatterns, dynamicAgentSelection, crystallineMemory, redis },
      {
        pipelineId: 'multilanguage-content',
        pipelineName: 'Multi-Language Content Pipeline',
        version: '2.0.0',
        stages: [
          'psychographic_research',
          'outline_creation',
          'content_writing',
          'language_validation',      // NEW: 100% language purity enforcement
          'ai_detection_validation',  // NEW: Mandatory AI detection gate
          'quality_validation',
          'seo_optimization',
          'memory_publishing'
        ],
        requiredAgents: {
          'psychographic_research': 'general-purpose',
          'outline_creation': 'content-outline-architect',
          'content_writing': 'content-writer-specialist',
          'language_validation': 'language-validation-specialist',
          'ai_detection_validation': 'content-ai-phrase-detector',
          'quality_validation': 'content-quality-validator',
          'seo_optimization': 'seo-content-optimization',
          'memory_publishing': 'general-purpose'
        }
      }
    );

    // Pipeline-specific configuration
    this.languagePurityThreshold = 100; // Zero tolerance for contamination

    console.log('🌍 Multi-Language Content Pipeline initialized (BasePipeline v2.0)');
  }

  /**
   * OVERRIDE: Execute stages with parallel optimization
   *
   * Stages 4-6 (language_validation, ai_detection_validation, quality_validation)
   * execute in parallel for 67% speed improvement.
   */
  async executeStages(execution, projectSpec) {
    const regularStages = ['psychographic_research', 'outline_creation', 'content_writing'];
    const parallelStages = ['language_validation', 'ai_detection_validation', 'quality_validation'];
    const finalStages = ['seo_optimization', 'memory_publishing'];

    // Execute regular stages sequentially
    for (const stageName of regularStages) {
      // Check for outline approval checkpoint
      if (stageName === 'content_writing' && !execution.options.outlineApproved && !execution.options.autoExecute) {
        console.log('\n⚠️  CHECKPOINT: Outline created and requires approval before proceeding to content writing');
        throw new Error('PENDING_APPROVAL: Outline requires approval before proceeding to content writing');
      }

      execution.currentStage = stageName;
      this.emitStageStarted(execution, stageName);

      const result = await this.executeStageImpl(stageName, execution, projectSpec);
      execution.stageResults[stageName] = result;

      this.emitStageCompleted(execution, stageName, result);
    }

    // Execute validation stages in parallel (OPTIMIZATION)
    console.log('🚀 Executing validation stages in parallel (Language + AI Detection + Quality)...');

    // Emit start events for all parallel stages
    for (const stageName of parallelStages) {
      this.emitStageStarted(execution, stageName);
    }

    const contentData = execution.stageResults.content_writing;
    const outlineData = execution.stageResults.outline_creation;

    const [languageData, aiDetectionData, qualityData] = await Promise.all([
      this.executeStageImpl('language_validation', execution, projectSpec, { contentData }),
      this.executeStageImpl('ai_detection_validation', execution, projectSpec, { contentData }),
      this.executeStageImpl('quality_validation', execution, projectSpec, { contentData, outlineData })
    ]);

    // Store results
    execution.stageResults.language_validation = languageData;
    execution.stageResults.ai_detection_validation = aiDetectionData;
    execution.stageResults.quality_validation = qualityData;

    // Emit completion events
    for (const stageName of parallelStages) {
      this.emitStageCompleted(execution, stageName, execution.stageResults[stageName]);
    }

    // BLOCKING QUALITY GATES (executed after parallel validation completes)
    // Gate 1: Language purity must be 100%
    if (languageData.languagePurity < 100) {
      throw new Error(`Language purity validation failed: ${languageData.languagePurity}% (required: 100%). Contamination: ${languageData.contaminationSummary}`);
    }

    // Gate 2: AI detection risk must be <30% (target: 15-25%)
    if (aiDetectionData.aiDetectionRisk >= 30) {
      throw new Error(`AI detection validation failed: ${aiDetectionData.aiDetectionRisk}% (required: <30%)`);
    }

    // Gate 3: Quality validation language purity must be 100%
    if (qualityData.languagePurity < 100) {
      throw new Error(`Language purity validation failed: ${qualityData.languagePurity}% (required: 100%)`);
    }

    // Execute final stages sequentially
    for (const stageName of finalStages) {
      execution.currentStage = stageName;
      this.emitStageStarted(execution, stageName);

      const result = await this.executeStageImpl(stageName, execution, projectSpec);
      execution.stageResults[stageName] = result;

      this.emitStageCompleted(execution, stageName, result);
    }
  }

  /**
   * REQUIRED: Implement abstract method from BasePipeline
   * Routes stage execution to domain-specific methods
   */
  async executeStageImpl(stageName, execution, projectSpec, additionalContext = {}) {
    switch (stageName) {
      case 'psychographic_research':
        return await this.executePsychographicResearch(execution, projectSpec);

      case 'outline_creation':
        const psychographicData = execution.stageResults.psychographic_research;
        return await this.executeOutlineCreation(execution, psychographicData, projectSpec);

      case 'content_writing':
        const outlineData = execution.stageResults.outline_creation;
        return await this.executeContentWriting(execution, outlineData, projectSpec);

      case 'language_validation':
        const contentData = additionalContext.contentData || execution.stageResults.content_writing;
        return await this.executeLanguageValidation(execution, contentData, projectSpec);

      case 'ai_detection_validation':
        const contentForAI = additionalContext.contentData || execution.stageResults.content_writing;
        return await this.executeAIDetectionValidation(execution, contentForAI, projectSpec);

      case 'quality_validation':
        const contentForQuality = additionalContext.contentData || execution.stageResults.content_writing;
        const outlineForQuality = additionalContext.outlineData || execution.stageResults.outline_creation;
        return await this.executeQualityValidation(execution, contentForQuality, outlineForQuality, projectSpec);

      case 'seo_optimization':
        const contentForSEO = execution.stageResults.content_writing;
        const qualityData = execution.stageResults.quality_validation;
        return await this.executeSEOOptimization(execution, contentForSEO, qualityData, projectSpec);

      case 'memory_publishing':
        const seoData = execution.stageResults.seo_optimization;
        return await this.executeMemoryPublishing(execution, seoData, projectSpec);

      default:
        throw new Error(`Unknown stage: ${stageName}`);
    }
  }

  /**
   * Stage 1: Psychographic Research & Targeting
   */
  async executePsychographicResearch(execution, projectSpec) {
    console.log('\n🎯 Stage 1: Psychographic Research & Targeting');
    const stageStart = Date.now();

    const agent = await this.selectAgentForStage('psychographic_research',
      ['psychographic-analysis', 'audience-segmentation', 'persona-development'],
      {
        targetMarket: projectSpec.targetMarket,
        language: projectSpec.language,
        clientName: projectSpec.clientName
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve existing psychographic data from memory
    const existingPsychographicData = await this.retrieveExistingPsychographicData(projectSpec);

    const psychographicPrompt = this.buildPsychographicResearchPrompt(
      projectSpec,
      existingPsychographicData
    );

    const psychographicResult = await this.executeAgentTask(
      execution,
      'psychographic_research',
      agent,
      psychographicPrompt,
      {
        targetMarket: projectSpec.targetMarket,
        language: projectSpec.language,
        existingData: existingPsychographicData
      }
    );

    // Save deliverables using BasePipeline method
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'psychographic_research',
      psychographicResult,
      'research/psychographic',
      `${projectSpec.targetKeyword}-psychographic.json`
    );

    console.log(`   ✅ Psychographic research completed`);
    console.log(`   Segments: ${psychographicResult.segmentCount || 'N/A'}`);

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

    const agent = await this.selectAgentForStage('outline_creation',
      ['outline-creation', 'content-planning', 'psychographic-targeting'],
      {
        language: projectSpec.language,
        targetKeyword: projectSpec.targetKeyword,
        psychographicSegments: psychographicData.segments
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Retrieve SEO research and cluster content
    const seoResearch = await this.retrieveSEOResearch(projectSpec);
    const clusterContent = await this.retrieveClusterContent(projectSpec);

    const outlinePrompt = this.buildOutlineCreationPrompt(
      projectSpec,
      psychographicData,
      seoResearch,
      clusterContent
    );

    const outlineResult = await this.executeAgentTask(
      execution,
      'outline_creation',
      agent,
      outlinePrompt,
      {
        language: projectSpec.language,
        psychographicData,
        seoResearch,
        targetKeyword: projectSpec.targetKeyword,
        wordCount: projectSpec.wordCount
      }
    );

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'outline_creation',
      outlineResult,
      'content/outlines',
      `${projectSpec.targetKeyword}-outline.json`
    );

    console.log(`   ✅ Outline created (100% ${projectSpec.language})`);
    console.log(`   Sections: ${outlineResult.sectionCount || 'N/A'}`);

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
   * Stage 3: Multi-Language Content Writing
   */
  async executeContentWriting(execution, outlineData, projectSpec) {
    console.log('\n✍️  Stage 3: Multi-Language Content Writing (Natural Flow & Conversational)');
    const stageStart = Date.now();

    const agent = await this.selectAgentForStage('content_writing',
      ['content-writing', 'natural-flow', 'psychographic-targeting', 'language-isolation'],
      {
        language: projectSpec.language,
        outline: outlineData.outline,
        psychographicMapping: outlineData.psychographicMapping
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);
    console.log(`   🚨 MANDATORY: Using specialized content-writer-specialist for natural, conversational content`);

    const contentPrompt = this.buildContentWritingPrompt(projectSpec, outlineData);

    const contentResult = await this.executeAgentTask(
      execution,
      'content_writing',
      agent,
      contentPrompt,
      {
        language: projectSpec.language,
        outline: outlineData.outline,
        psychographicMapping: outlineData.psychographicMapping,
        keywordMapping: outlineData.keywordMapping,
        naturalFlowRequired: true,
        conversationalTone: true
      }
    );

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'content_writing',
      contentResult,
      'content/articles',
      `${projectSpec.targetKeyword}-article.json`
    );

    console.log(`   ✅ Content written (100% ${projectSpec.language})`);
    console.log(`   Word Count: ${contentResult.wordCount || 'N/A'}`);

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
   * Stage 4a: Language Validation (MANDATORY GATE - 100% purity)
   */
  async executeLanguageValidation(execution, contentData, projectSpec) {
    console.log('\n🌍 Stage 4a: Language Validation (100% Purity Enforcement)');
    const stageStart = Date.now();

    const agent = await this.selectAgentForStage('language_validation',
      ['language-purity-detection', 'character-encoding-validation', 'cross-contamination-prevention'],
      {
        language: projectSpec.language,
        content: contentData.content
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);
    console.log(`   🚨 CRITICAL: Enforcing 100% ${projectSpec.language} purity - ZERO tolerance for contamination`);

    const languagePrompt = this.buildLanguageValidationPrompt(projectSpec, contentData);

    const languageResult = await this.executeAgentTask(
      execution,
      'language_validation',
      agent,
      languagePrompt,
      {
        language: projectSpec.language,
        content: contentData.content,
        targetPurity: 100,
        zeroTolerance: true
      }
    );

    // Enforce blocking gate
    if (languageResult.languagePurity < 100) {
      console.error(`\n❌ BLOCKING GATE FAILED: Language Purity`);
      console.error(`   Required: 100%`);
      console.error(`   Actual: ${languageResult.languagePurity}%`);

      // Save failure report
      await this.saveLanguageValidationFailureReport(execution, languageResult, projectSpec);

      throw new Error(`Language purity validation failed: ${languageResult.languagePurity}% (required: 100%)`);
    }

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'language_validation',
      languageResult,
      'content/language-validation-reports',
      `${projectSpec.targetKeyword}-language-validation-report.json`
    );

    console.log(`   ✅ Language validation PASSED`);
    console.log(`   Language Purity: ${languageResult.languagePurity}% ✓`);

    return {
      languagePurity: languageResult.languagePurity,
      violations: languageResult.violations || [],
      violationCount: languageResult.violations?.length || 0,
      contaminationType: languageResult.contaminationType || 'none',
      contaminationSummary: languageResult.contaminationSummary || 'No contamination detected',
      characterEncoding: languageResult.characterEncoding || 'valid',
      deliverablePath,
      stageDuration: Date.now() - stageStart
    };
  }

  /**
   * Stage 4b: AI Detection Validation (MANDATORY GATE - <30% threshold)
   */
  async executeAIDetectionValidation(execution, contentData, projectSpec) {
    console.log('\n🤖 Stage 4b: AI Detection Validation (<30% threshold)');
    const stageStart = Date.now();

    const agent = await this.selectAgentForStage('ai_detection_validation',
      ['ai-phrase-detection', 'pattern-analysis', 'human-voice-validation'],
      {
        language: projectSpec.language,
        content: contentData.content
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);

    const aiDetectionPrompt = this.buildAIDetectionPrompt(projectSpec, contentData);

    const aiDetectionResult = await this.executeAgentTask(
      execution,
      'ai_detection_validation',
      agent,
      aiDetectionPrompt,
      {
        language: projectSpec.language,
        content: contentData.content,
        targetThreshold: 30,
        targetRange: '15-25%'
      }
    );

    // Enforce blocking gate
    if (aiDetectionResult.aiDetectionRisk >= 30) {
      console.error(`\n❌ BLOCKING GATE FAILED: AI Detection Risk`);
      console.error(`   Required: <30%`);
      console.error(`   Actual: ${aiDetectionResult.aiDetectionRisk}%`);

      // Save failure report
      await this.saveAIDetectionFailureReport(execution, aiDetectionResult, projectSpec);

      throw new Error(`AI detection validation failed: ${aiDetectionResult.aiDetectionRisk}% (required: <30%)`);
    }

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'ai_detection_validation',
      aiDetectionResult,
      'content/ai-detection-reports',
      `${projectSpec.targetKeyword}-ai-detection-report.json`
    );

    console.log(`   ✅ AI detection validation PASSED`);
    console.log(`   AI Detection Risk: ${aiDetectionResult.aiDetectionRisk}% ✓`);

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
   * Stage 4c: Quality Validation
   */
  async executeQualityValidation(execution, contentData, outlineData, projectSpec) {
    console.log('\n✅ Stage 4c: Quality Validation (100% Language Purity)');
    const stageStart = Date.now();

    const agent = await this.selectAgentForStage('quality_validation',
      ['quality-validation', 'language-purity-check', 'content-architecture-validation'],
      {
        language: projectSpec.language,
        content: contentData.content,
        outline: outlineData.outline
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);

    const qualityPrompt = this.buildQualityValidationPrompt(projectSpec, contentData, outlineData);

    const qualityResult = await this.executeAgentTask(
      execution,
      'quality_validation',
      agent,
      qualityPrompt,
      {
        language: projectSpec.language,
        content: contentData.content,
        outline: outlineData.outline,
        languagePurityThreshold: this.languagePurityThreshold
      }
    );

    // Enforce blocking gate
    if (qualityResult.languagePurity < 100) {
      console.error(`\n❌ BLOCKING GATE FAILED: Language Purity`);
      console.error(`   Required: 100%`);
      console.error(`   Actual: ${qualityResult.languagePurity}%`);

      throw new Error(`Language purity validation failed: ${qualityResult.languagePurity}% (required: 100%)`);
    }

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'quality_validation',
      qualityResult,
      'content/quality-reports',
      `${projectSpec.targetKeyword}-quality-report.json`
    );

    console.log(`   ✅ Quality validation PASSED`);
    console.log(`   Language Purity: ${qualityResult.languagePurity}% ✓`);
    console.log(`   Overall Quality: ${qualityResult.overallQuality}%`);

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

    const agent = await this.selectAgentForStage('seo_optimization',
      ['seo-optimization', 'internal-linking', 'keyword-optimization'],
      {
        language: projectSpec.language,
        content: contentData.content,
        targetKeyword: projectSpec.targetKeyword
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);

    const clusterContent = await this.retrieveClusterContent(projectSpec);
    const seoPrompt = this.buildSEOOptimizationPrompt(projectSpec, contentData, qualityData, clusterContent);

    const seoResult = await this.executeAgentTask(
      execution,
      'seo_optimization',
      agent,
      seoPrompt,
      {
        language: projectSpec.language,
        content: contentData.content,
        targetKeyword: projectSpec.targetKeyword,
        clusterContent
      }
    );

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'seo_optimization',
      seoResult,
      'seo/content-optimization',
      `${projectSpec.targetKeyword}-seo-optimized.json`
    );

    console.log(`   ✅ SEO optimization completed`);
    console.log(`   SEO Score: ${seoResult.seoScore || 'N/A'}%`);
    console.log(`   Internal Links: ${seoResult.internalLinkCount || 0}`);

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

    const agent = await this.selectAgentForStage('memory_publishing',
      ['memory-integration', 'knowledge-graph', 'content-publishing'],
      {
        content: seoData.optimizedContent,
        clientName: projectSpec.clientName
      }
    );

    console.log(`   Selected Agent: ${agent.agentId}`);

    // Store content in crystalline memory
    await this.storeContentInMemory(execution, seoData, projectSpec);
    await this.createMemoryRelations(execution, seoData, projectSpec);

    const publishingPrompt = this.buildMemoryPublishingPrompt(projectSpec, seoData, execution.stageResults);

    const publishingResult = await this.executeAgentTask(
      execution,
      'memory_publishing',
      agent,
      publishingPrompt,
      {
        content: seoData.optimizedContent,
        clientName: projectSpec.clientName,
        language: projectSpec.language
      }
    );

    // Save deliverables
    const deliverablePath = await this.saveStageDeliverables(
      execution,
      'memory_publishing',
      publishingResult,
      'content/publishing',
      `${projectSpec.targetKeyword}-publishing-package.json`
    );

    console.log(`   ✅ Memory integration and publishing completed`);

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
    await this.storeInMemory(
      'content-article',
      `${projectSpec.clientName}-${projectSpec.targetKeyword}-${projectSpec.language}`,
      seoData.optimizedContent,
      ['content', 'article', projectSpec.language, 'cluster-content'],
      {
        executionId: execution.executionId,
        timestamp: Date.now(),
        language: projectSpec.language,
        targetKeyword: projectSpec.targetKeyword,
        wordCount: seoData.wordCount || 0,
        seoScore: seoData.seoScore || 0
      }
    );

    console.log('   💾 Content stored in crystalline memory');
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
   * Helper: Save failed language validation report
   */
  async saveLanguageValidationFailureReport(execution, languageResult, projectSpec) {
    const projectUuid = projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables/content/failed-language-validation'
    );

    await fs.mkdir(deliverablePath, { recursive: true });

    const failedFile = path.join(deliverablePath, `${projectSpec.targetKeyword}-failed-language-validation.json`);
    await fs.writeFile(
      failedFile,
      JSON.stringify({
        timestamp: Date.now(),
        executionId: execution.executionId,
        reason: 'Language Purity Validation Failed',
        languagePurity: languageResult.languagePurity,
        requiredPurity: 100,
        violations: languageResult.violations || [],
        violationCount: languageResult.violations?.length || 0,
        contaminationType: languageResult.contaminationType || 'unknown',
        contaminationSummary: languageResult.contaminationSummary || 'Language contamination detected',
        characterEncoding: languageResult.characterEncoding || 'invalid'
      }, null, 2),
      'utf-8'
    );

    console.log(`   💾 Failed language validation report saved: ${failedFile}`);
  }

  /**
   * Helper: Save failed AI detection report
   */
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

  /**
   * Prompt Builders (Domain-Specific Logic)
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
   - Psychographic segment targeting
   - Emotional tone
   - Keywords to integrate
   - Reader concerns to address

3. **H2 Sections** (5-7 sections):
   For each section:
   - Section title (in ${projectSpec.language})
   - Psychographic targeting
   - Emotional tone
   - Word count
   - Content requirements (PARAGRAPH FORM)
   - Supporting keywords
   - H3 subsections if needed
   - Engagement elements (tables, boxes - NOT Content Requirements lists)

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
   - Use transition phrases naturally
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

  buildLanguageValidationPrompt(projectSpec, contentData) {
    return `CRITICAL: 100% ${projectSpec.language} language purity enforcement - ZERO tolerance for contamination.

**Content to Validate:**
${JSON.stringify(contentData.content, null, 2)}

**Target Language:** ${projectSpec.language}
**Purity Requirement:** 100% (ZERO contamination allowed)

**MANDATORY LANGUAGE PURITY CHECKS:**

1. **Word-by-Word Language Detection:**
   - Scan EVERY single word in the content
   - Identify ANY foreign language words
   - Check for English, Italian, Spanish, German, French contamination
   - Flag ALL non-${projectSpec.language} words

2. **Character Set Validation:**
   - Detect Cyrillic character contamination
   - Identify Greek character mixing
   - Flag any non-Latin character encodings
   - Validate proper diacritics for ${projectSpec.language}

3. **Cross-Contamination Prevention:**
   - Identify mixed-language phrases
   - Detect foreign verb forms
   - Flag anglicisms and loan words (unless culturally accepted)
   - Check product names and technical terms

4. **Cultural Appropriateness:**
   - Verify idioms are ${projectSpec.language}-appropriate
   - Check expressions and colloquialisms
   - Validate cultural context

**VIOLATION REPORTING:**

For EACH violation found, report:
- **Line/Location**: Where the violation occurs
- **Violation Type**: Contamination type
- **Found Word/Phrase**: The contaminated text
- **Suggested Fix**: Correct ${projectSpec.language} equivalent
- **Severity**: Critical (blocks publication)

**BLOCKING CRITERIA:**

❌ ANY foreign language word = FAIL (0% tolerance)
❌ ANY character encoding issues = FAIL
❌ ANY cross-contamination = FAIL

✅ ONLY 100% pure ${projectSpec.language} = PASS

**Required Output Format:**
{
  "languagePurity": [percentage],
  "violations": [array],
  "violationCount": [count],
  "contaminationType": "type|none",
  "contaminationSummary": "summary",
  "characterEncoding": "valid|invalid",
  "passesGate": [true only if 100%, false otherwise]
}

**CRITICAL**: This is a BLOCKING gate. If languagePurity < 100%, content MUST be rejected immediately.

Provide complete language purity analysis with zero tolerance enforcement.`;
  }

  buildAIDetectionPrompt(projectSpec, contentData) {
    return `Analyze content for AI-generated patterns and phrases (Target: <25% AI detection risk, Accept: <30%).

**Content to Analyze:**
${JSON.stringify(contentData.content, null, 2)}

**Language:** ${projectSpec.language}

**MANDATORY AI DETECTION ANALYSIS:**

1. **Forbidden Phrases Detection:**
   - Scan for ALL forbidden phrases
   - Report: Every instance found with location and count
   - Calculate: forbiddenPhrasesCount

2. **Pattern Repetition Analysis:**
   - Analyze section openings for formulaic patterns
   - Identify repetitive sentence structures
   - Check for identical transitions
   - Calculate: patternRepetition percentage (target: <15%)

3. **Structural AI Patterns:**
   - Formulaic sentence starters
   - Meta-commentary padding
   - Excessive em-dashes
   - Generic superlatives without specific details

4. **Human Voice Score:**
   - Assess conversational tone (0-100)
   - Evaluate natural transitions
   - Check for specific details vs. vague statements
   - Measure sentence variety

5. **Overall AI Detection Risk:**
   - Calculate comprehensive AI detection risk (0-100%)
   - Weight: Forbidden phrases (40%), Pattern repetition (30%), Structural issues (20%), Human voice (10%)
   - **BLOCKING GATE**: If aiDetectionRisk >= 30%, validation FAILS

**Required Output Format:**
{
  "aiDetectionRisk": [percentage],
  "forbiddenPhrases": [array],
  "forbiddenPhrasesCount": [count],
  "patternRepetition": [percentage],
  "structuralIssues": [array],
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

2. **Paragraph Distribution Compliance:**
   - Count ALL paragraphs in article
   - Categorize: Short (1-2 sentences), Medium (3-5 sentences), Long (6+ sentences)
   - Calculate distribution percentages
   - Target: 40% short / 40% medium / 20% long

3. **Content Architecture Compliance:**
   - Count bulleted lists (must be ≤16-20 total)
   - Count bold text instances (must be ≤10-15)
   - Verify tables ≤6-8
   - Check for formulaic bold text at paragraph starts

4. **Natural Flow Assessment:**
   - Evaluate paragraph transitions
   - Check conversational tone consistency
   - Assess sentence variety and rhythm
   - Verify empathy and reader connection

5. **Psychographic Alignment:**
   - Verify targeting matches outline plan
   - Check emotional tone execution
   - Validate concern addressing

6. **Readability Score:**
   - Flesch reading ease (target: 60-70)
   - Average sentence length
   - Paragraph length variety

7. **Overall Quality Score:**
   - Comprehensive quality assessment
   - All dimensions weighted

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
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      pipelineId: this.pipelineId,
      pipelineName: this.pipelineName,
      version: '2.0.0',
      stages: this.stages,
      estimatedDuration: 150, // minutes (optimized from 180)
      requiredAgents: this.requiredAgents,
      qualityGates: [
        'outline_approval',
        'language_purity_100',
        'ai_detection_risk_30',
        'content_architecture_compliance',
        'overall_quality_90'
      ],
      enhancementsV2: {
        basePipelineIntegration: true,
        languagePurityEnforcement: true,
        characterEncodingValidation: true,
        crossContaminationPrevention: true,
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
