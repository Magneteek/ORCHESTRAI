/**
 * ORCHESTRAI Pipeline Registry
 *
 * Central registry for managing executable pipeline implementations.
 * Maps deliverable types to pipeline executables and provides dynamic loading.
 */

const path = require('path');
const fs = require('fs').promises;

class PipelineRegistry {
  constructor(coordinationPatterns, dynamicAgentSelection, crystallineMemory, redis = null) {
    this.coordinationPatterns = coordinationPatterns;
    this.dynamicAgentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;

    // Registry of executable pipelines
    this.pipelineExecutables = new Map();

    // Deliverable type to pipeline mapping
    this.deliverableTypeToPipeline = {
      'seo-research': {
        pipelineId: 'seo-research',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/seo/pipelines/seo-research-pipeline.js',
        className: 'SEOResearchPipeline',
        domain: 'seo',
        estimatedDuration: 120
      },
      'advertising-campaign': {
        pipelineId: 'advertising-campaign',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/advertising-enhanced/pipelines/advertising-campaign-pipeline.js',
        className: 'AdvertisingCampaignPipeline',
        domain: 'advertising',
        estimatedDuration: 90
      },
      'web-development': {
        pipelineId: 'design-development',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/webdev/pipelines/design-development-pipeline.js',
        className: 'DesignDevelopmentPipeline',
        domain: 'webdev',
        estimatedDuration: 240
      },
      'design-development': {
        pipelineId: 'design-development',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/webdev/pipelines/design-development-pipeline.js',
        className: 'DesignDevelopmentPipeline',
        domain: 'webdev',
        estimatedDuration: 240
      },
      'content-creation-multi-language': {
        pipelineId: 'multilanguage-content',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/content/pipelines/multilanguage-content-pipeline.js',
        className: 'MultiLanguageContentPipeline',
        domain: 'content',
        estimatedDuration: 180
      },
      'multilanguage-content': {
        pipelineId: 'multilanguage-content',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/content/pipelines/multilanguage-content-pipeline.js',
        className: 'MultiLanguageContentPipeline',
        domain: 'content',
        estimatedDuration: 180
      },
      'reputation-intelligence': {
        pipelineId: 'reputation-intelligence',
        pipelinePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/reputation/pipelines/reputation-intelligence-pipeline.js',
        className: 'ReputationIntelligencePipeline',
        domain: 'reputation',
        estimatedDuration: 60
      }
    };

    console.log('📚 Pipeline Registry initialized');
  }

  /**
   * Get executable pipeline for deliverable type
   */
  async getPipelineExecutable(deliverableType) {
    // Check if pipeline is already loaded
    if (this.pipelineExecutables.has(deliverableType)) {
      return this.pipelineExecutables.get(deliverableType);
    }

    // Get pipeline configuration
    const pipelineConfig = this.deliverableTypeToPipeline[deliverableType];

    if (!pipelineConfig) {
      throw new Error(`No executable pipeline found for deliverable type: ${deliverableType}`);
    }

    // Load and instantiate pipeline
    const pipeline = await this.loadPipeline(pipelineConfig);

    // Cache loaded pipeline
    this.pipelineExecutables.set(deliverableType, pipeline);

    return pipeline;
  }

  /**
   * Load pipeline executable
   */
  async loadPipeline(pipelineConfig) {
    try {
      console.log(`📦 Loading pipeline: ${pipelineConfig.pipelineId}`);
      console.log(`   Path: ${pipelineConfig.pipelinePath}`);

      // Verify pipeline file exists
      try {
        await fs.access(pipelineConfig.pipelinePath);
      } catch (error) {
        throw new Error(`Pipeline file not found: ${pipelineConfig.pipelinePath}`);
      }

      // Require pipeline module
      const PipelineClass = require(pipelineConfig.pipelinePath);

      // Instantiate pipeline with dependencies
      const pipeline = new PipelineClass(
        this.coordinationPatterns,
        this.dynamicAgentSelection,
        this.crystallineMemory,
        this.redis
      );

      console.log(`✅ Pipeline loaded: ${pipelineConfig.pipelineId}`);

      return pipeline;
    } catch (error) {
      console.error(`❌ Failed to load pipeline: ${pipelineConfig.pipelineId}`);
      console.error(`   Error:`, error.message);
      throw error;
    }
  }

  /**
   * Execute pipeline by deliverable type
   */
  async executePipeline(deliverableType, projectSpec, options = {}) {
    try {
      console.log(`\n🚀 Executing pipeline for deliverable type: ${deliverableType}`);

      // Get executable pipeline
      const pipeline = await this.getPipelineExecutable(deliverableType);

      // Execute pipeline
      const result = await pipeline.execute(projectSpec, options);

      return result;
    } catch (error) {
      console.error(`❌ Pipeline execution failed for: ${deliverableType}`);
      console.error(`   Error:`, error.message);
      throw error;
    }
  }

  /**
   * Get all registered pipelines
   */
  getRegisteredPipelines() {
    const pipelines = [];

    for (const [deliverableType, config] of Object.entries(this.deliverableTypeToPipeline)) {
      pipelines.push({
        deliverableType,
        pipelineId: config.pipelineId,
        domain: config.domain,
        estimatedDuration: config.estimatedDuration,
        loaded: this.pipelineExecutables.has(deliverableType)
      });
    }

    return pipelines;
  }

  /**
   * Get pipeline metadata
   */
  async getPipelineMetadata(deliverableType) {
    const pipeline = await this.getPipelineExecutable(deliverableType);

    if (pipeline.getMetadata) {
      return pipeline.getMetadata();
    }

    return {
      pipelineId: this.deliverableTypeToPipeline[deliverableType]?.pipelineId,
      estimatedDuration: this.deliverableTypeToPipeline[deliverableType]?.estimatedDuration
    };
  }

  /**
   * Check if pipeline exists for deliverable type
   */
  hasPipeline(deliverableType) {
    return this.deliverableTypeToPipeline.hasOwnProperty(deliverableType);
  }

  /**
   * Register new pipeline executable
   */
  registerPipeline(deliverableType, pipelineConfig) {
    this.deliverableTypeToPipeline[deliverableType] = pipelineConfig;
    console.log(`✅ Pipeline registered: ${deliverableType} → ${pipelineConfig.pipelineId}`);
  }

  /**
   * Unload pipeline from cache
   */
  unloadPipeline(deliverableType) {
    if (this.pipelineExecutables.has(deliverableType)) {
      this.pipelineExecutables.delete(deliverableType);
      console.log(`🗑️  Pipeline unloaded from cache: ${deliverableType}`);
    }
  }

  /**
   * Reload pipeline (unload and load fresh)
   */
  async reloadPipeline(deliverableType) {
    this.unloadPipeline(deliverableType);

    // Clear require cache for pipeline module
    const pipelineConfig = this.deliverableTypeToPipeline[deliverableType];
    if (pipelineConfig) {
      delete require.cache[require.resolve(pipelineConfig.pipelinePath)];
    }

    return await this.getPipelineExecutable(deliverableType);
  }

  /**
   * Get registry statistics
   */
  getStatistics() {
    return {
      totalRegistered: Object.keys(this.deliverableTypeToPipeline).length,
      loadedPipelines: this.pipelineExecutables.size,
      pipelinesByDomain: this.getPipelinesByDomain(),
      averageDuration: this.calculateAverageDuration()
    };
  }

  /**
   * Helper: Get pipelines grouped by domain
   */
  getPipelinesByDomain() {
    const byDomain = {};

    for (const [deliverableType, config] of Object.entries(this.deliverableTypeToPipeline)) {
      if (!byDomain[config.domain]) {
        byDomain[config.domain] = [];
      }
      byDomain[config.domain].push({
        deliverableType,
        pipelineId: config.pipelineId,
        estimatedDuration: config.estimatedDuration
      });
    }

    return byDomain;
  }

  /**
   * Helper: Calculate average pipeline duration
   */
  calculateAverageDuration() {
    const durations = Object.values(this.deliverableTypeToPipeline).map(c => c.estimatedDuration);
    const total = durations.reduce((sum, d) => sum + d, 0);
    return Math.round(total / durations.length);
  }
}

module.exports = PipelineRegistry;
