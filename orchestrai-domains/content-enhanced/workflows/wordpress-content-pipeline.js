const WordPressGutenbergPublisher = require('../agents/wordpress-gutenberg-publisher');

/**
 * WordPress Content Publishing Pipeline
 * Orchestrates the complete workflow from content creation to WordPress publication
 */
class WordPressContentPipeline {
  constructor(contentDomainHub, crystallineMemory) {
    this.contentDomainHub = contentDomainHub;
    this.crystallineMemory = crystallineMemory;
    this.wordpressPublisher = new WordPressGutenbergPublisher(null, crystallineMemory);
    
    this.pipelineStages = [
      'content_analysis',
      'seo_optimization',
      'gutenberg_conversion',
      'quality_validation',
      'wordpress_publication',
      'post_publish_analysis'
    ];
    
    this.activeWorkflows = new Map();
    this.metrics = {
      totalPipelines: 0,
      successfulPublications: 0,
      averageProcessingTime: 0,
      stageSuccessRates: {}
    };
  }

  /**
   * Execute complete WordPress publishing pipeline
   */
  async executePublishingPipeline(contentRequest, wordpressConfig, options = {}) {
    const workflowId = `wp-pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting WordPress publishing pipeline: ${workflowId}`);
      
      // Initialize workflow tracking
      const workflow = {
        id: workflowId,
        startTime,
        currentStage: 'content_analysis',
        stages: {},
        content: null,
        wordpressConfig,
        options
      };
      
      this.activeWorkflows.set(workflowId, workflow);
      
      // Stage 1: Content Analysis & Enhancement
      workflow.stages.content_analysis = await this.executeContentAnalysis(contentRequest, workflow);
      
      // Stage 2: SEO Optimization
      workflow.stages.seo_optimization = await this.executeSEOOptimization(workflow);
      
      // Stage 3: Gutenberg Conversion
      workflow.stages.gutenberg_conversion = await this.executeGutenbergConversion(workflow);
      
      // Stage 4: Quality Validation
      workflow.stages.quality_validation = await this.executeQualityValidation(workflow);
      
      // Stage 5: WordPress Publication
      workflow.stages.wordpress_publication = await this.executeWordPressPublication(workflow);
      
      // Stage 6: Post-Publish Analysis
      workflow.stages.post_publish_analysis = await this.executePostPublishAnalysis(workflow);
      
      // Complete workflow
      const totalTime = Date.now() - startTime;
      const result = this.completeWorkflow(workflow, totalTime);
      
      console.log(`✅ WordPress publishing pipeline completed: ${workflowId} (${totalTime}ms)`);
      return result;
      
    } catch (error) {
      console.error(`❌ WordPress publishing pipeline failed: ${workflowId}`, error);
      
      const workflow = this.activeWorkflows.get(workflowId);
      if (workflow) {
        workflow.error = error.message;
        workflow.failed = true;
      }
      
      return {
        success: false,
        workflowId,
        error: error.message,
        stages: workflow?.stages || {},
        processingTime: Date.now() - startTime
      };
    } finally {
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * Stage 1: Content Analysis & Enhancement
   */
  async executeContentAnalysis(contentRequest, workflow) {
    const stageStart = Date.now();
    workflow.currentStage = 'content_analysis';
    
    try {
      console.log('📝 Stage 1: Analyzing and enhancing content...');
      
      let enhancedContent;
      
      if (typeof contentRequest === 'string') {
        // Simple text content - enhance it
        enhancedContent = {
          title: this.extractTitleFromContent(contentRequest),
          content: contentRequest,
          sections: this.parseContentSections(contentRequest)
        };
      } else if (contentRequest.contentType === 'outline') {
        // Generate full content from outline
        const outlineAgent = this.contentDomainHub.agents.get('content-outline-architect');
        if (outlineAgent) {
          const outlineResult = await outlineAgent.createContent('full-article', contentRequest);
          enhancedContent = outlineResult.data;
        } else {
          enhancedContent = contentRequest;
        }
      } else {
        // Use provided structured content
        enhancedContent = contentRequest;
      }
      
      // Enhance with AI phrase detection
      const phraseDetector = this.contentDomainHub.agents.get('ai-phrase-detector');
      if (phraseDetector && enhancedContent.content) {
        const phraseAnalysis = await phraseDetector.analyzeContent(enhancedContent.content);
        enhancedContent.aiPhraseAnalysis = phraseAnalysis;
        
        // Apply humanization suggestions
        if (phraseAnalysis.suggestions) {
          enhancedContent.humanizedContent = this.applyHumanizationSuggestions(
            enhancedContent.content, 
            phraseAnalysis.suggestions
          );
        }
      }
      
      // Store enhanced content in workflow
      workflow.content = enhancedContent;
      
      return {
        success: true,
        processingTime: Date.now() - stageStart,
        enhancedContent,
        enhancements: ['ai_phrase_detection', 'content_structuring']
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - stageStart
      };
    }
  }

  /**
   * Stage 2: SEO Optimization
   */
  async executeSEOOptimization(workflow) {
    const stageStart = Date.now();
    workflow.currentStage = 'seo_optimization';
    
    try {
      console.log('🔍 Stage 2: Optimizing content for SEO...');
      
      const content = workflow.content;
      if (!content) throw new Error('No content available for SEO optimization');
      
      // Generate SEO-optimized title variations
      const titleGenerator = this.contentDomainHub.agents.get('content-title-generator');
      let seoTitles = [];
      
      if (titleGenerator) {
        const titleResult = await titleGenerator.createContent('seo-titles', {
          originalTitle: content.title,
          targetKeyword: workflow.options.targetKeyword,
          contentType: workflow.options.contentType || 'article'
        });
        seoTitles = titleResult.data?.titles || [content.title];
      }
      
      // Generate meta description
      const metaDescription = this.generateMetaDescription(content, workflow.options.targetKeyword);
      
      // Add SEO data to content
      content.seoData = {
        optimizedTitle: seoTitles[0] || content.title,
        titleVariations: seoTitles,
        metaDescription,
        focusKeyword: workflow.options.targetKeyword,
        schema: this.generateSchemaMarkup(content, workflow.options)
      };
      
      // Add FAQ section if relevant
      if (workflow.options.includeFAQ && content.sections) {
        const faqs = this.generateFAQFromContent(content);
        if (faqs.length > 0) {
          content.seoData.faqs = faqs;
        }
      }
      
      return {
        success: true,
        processingTime: Date.now() - stageStart,
        seoData: content.seoData,
        optimizations: ['title_optimization', 'meta_description', 'schema_markup', 'faq_generation']
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - stageStart
      };
    }
  }

  /**
   * Stage 3: Gutenberg Conversion
   */
  async executeGutenbergConversion(workflow) {
    const stageStart = Date.now();
    workflow.currentStage = 'gutenberg_conversion';
    
    try {
      console.log('🔤 Stage 3: Converting to Gutenberg blocks...');
      
      const content = workflow.content;
      if (!content) throw new Error('No content available for Gutenberg conversion');
      
      // Convert content to Gutenberg blocks
      const gutenbergBlocks = await this.wordpressPublisher.convertToGutenbergBlocks(
        content, 
        workflow.options
      );
      
      // Store blocks in workflow
      workflow.gutenbergBlocks = gutenbergBlocks;
      
      // Generate WordPress post structure
      const wordpressPost = await this.wordpressPublisher.generateWordPressPost(
        content,
        gutenbergBlocks,
        workflow.options
      );
      
      workflow.wordpressPost = wordpressPost;
      
      return {
        success: true,
        processingTime: Date.now() - stageStart,
        blocksGenerated: gutenbergBlocks.length,
        blockTypes: [...new Set(gutenbergBlocks.map(b => b.blockName))],
        wordpressPost
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - stageStart
      };
    }
  }

  /**
   * Stage 4: Quality Validation
   */
  async executeQualityValidation(workflow) {
    const stageStart = Date.now();
    workflow.currentStage = 'quality_validation';
    
    try {
      console.log('✅ Stage 4: Validating content quality...');
      
      const content = workflow.content;
      const gutenbergBlocks = workflow.gutenbergBlocks;
      
      if (!content || !gutenbergBlocks) {
        throw new Error('Missing content or Gutenberg blocks for validation');
      }
      
      // Content quality validation
      const qualityValidator = this.contentDomainHub.agents.get('content-quality-validator');
      let qualityResults = { passed: true, score: 85, issues: [] };
      
      if (qualityValidator) {
        qualityResults = await qualityValidator.validateContent(content, {
          checkReadability: true,
          checkSEO: true,
          checkStructure: true
        });
      }
      
      // Gutenberg block validation
      const blockValidation = this.validateGutenbergBlocks(gutenbergBlocks);
      
      // WordPress compatibility check
      const wpCompatibility = this.validateWordPressCompatibility(workflow.wordpressPost);
      
      const overallValidation = {
        passed: qualityResults.passed && blockValidation.valid && wpCompatibility.valid,
        contentQuality: qualityResults,
        blockValidation,
        wpCompatibility,
        overallScore: Math.min(qualityResults.score, blockValidation.score, wpCompatibility.score)
      };
      
      // If validation fails and auto-fix is enabled, attempt fixes
      if (!overallValidation.passed && workflow.options.autoFix) {
        const fixResult = await this.attemptQualityFixes(workflow, overallValidation);
        overallValidation.fixesApplied = fixResult;
      }
      
      return {
        success: overallValidation.passed,
        processingTime: Date.now() - stageStart,
        validation: overallValidation,
        recommendations: this.generateQualityRecommendations(overallValidation)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - stageStart
      };
    }
  }

  /**
   * Stage 5: WordPress Publication
   */
  async executeWordPressPublication(workflow) {
    const stageStart = Date.now();
    workflow.currentStage = 'wordpress_publication';
    
    try {
      console.log('🚀 Stage 5: Publishing to WordPress...');
      
      const wordpressPost = workflow.wordpressPost;
      const wordpressConfig = workflow.wordpressConfig;
      
      if (!wordpressPost || !wordpressConfig) {
        throw new Error('Missing WordPress post data or configuration');
      }
      
      // Publish to WordPress
      const publishResult = await this.wordpressPublisher.publishToWordPress(
        wordpressPost,
        wordpressConfig
      );
      
      // Store publication record
      await this.storePublicationRecord(workflow, publishResult);
      
      return {
        success: publishResult.success,
        processingTime: Date.now() - stageStart,
        publication: publishResult
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - stageStart
      };
    }
  }

  /**
   * Stage 6: Post-Publish Analysis
   */
  async executePostPublishAnalysis(workflow) {
    const stageStart = Date.now();
    workflow.currentStage = 'post_publish_analysis';
    
    try {
      console.log('📊 Stage 6: Performing post-publish analysis...');
      
      const publication = workflow.stages.wordpress_publication?.publication;
      if (!publication || !publication.success) {
        return {
          success: false,
          message: 'Skipped - publication failed',
          processingTime: Date.now() - stageStart
        };
      }
      
      // Generate performance predictions
      const performanceAnalysis = this.generatePerformancePredictions(workflow);
      
      // Create monitoring recommendations
      const monitoringPlan = this.createMonitoringPlan(workflow);
      
      // Generate content optimization suggestions for next time
      const optimizationSuggestions = this.generateOptimizationSuggestions(workflow);
      
      return {
        success: true,
        processingTime: Date.now() - stageStart,
        analysis: {
          performancePredictions: performanceAnalysis,
          monitoringPlan,
          optimizationSuggestions
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - stageStart
      };
    }
  }

  /**
   * Helper Methods
   */
  extractTitleFromContent(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0] || 'Untitled Content';
    
    // If first line looks like a title (short and doesn't end with period)
    if (firstLine.length < 100 && !firstLine.endsWith('.')) {
      return firstLine.replace(/^#+\s*/, ''); // Remove markdown heading syntax
    }
    
    // Generate title from first sentence
    const firstSentence = content.split('.')[0];
    return firstSentence.length < 100 ? firstSentence : 'Generated Content';
  }

  parseContentSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        // New section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const level = (line.match(/^#+/) || [''])[0].length;
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          level: Math.min(level, 6),
          content: []
        };
      } else if (currentSection && line.trim()) {
        currentSection.content.push(line);
      } else if (!currentSection && line.trim()) {
        // Content before any heading
        if (sections.length === 0) {
          sections.push({
            title: null,
            level: 0,
            content: [line]
          });
        }
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // Join content arrays back to strings
    return sections.map(section => ({
      ...section,
      content: section.content.join('\n')
    }));
  }

  generateMetaDescription(content, targetKeyword) {
    let description = '';
    
    if (content.excerpt) {
      description = content.excerpt;
    } else if (content.introduction) {
      description = content.introduction;
    } else if (content.content) {
      // Extract first paragraph or sentence
      const firstParagraph = content.content.split('\n')[0];
      description = firstParagraph.length > 160 ? firstParagraph.substring(0, 157) + '...' : firstParagraph;
    }
    
    // Ensure target keyword is included
    if (targetKeyword && !description.toLowerCase().includes(targetKeyword.toLowerCase())) {
      description = `${targetKeyword}: ${description}`;
    }
    
    // Ensure proper length
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
    
    return description;
  }

  generateSchemaMarkup(content, options) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': content.title,
      'description': content.excerpt || this.generateMetaDescription(content, options.targetKeyword),
      'author': {
        '@type': 'Person',
        'name': options.author || 'ORCHESTRAI Content System'
      },
      'publisher': {
        '@type': 'Organization',
        'name': options.publisherName || 'Content Publisher'
      },
      'datePublished': new Date().toISOString(),
      'dateModified': new Date().toISOString()
    };
    
    // Add FAQ schema if FAQs exist
    if (content.seoData?.faqs && content.seoData.faqs.length > 0) {
      schema['@graph'] = [
        schema,
        {
          '@type': 'FAQPage',
          'mainEntity': content.seoData.faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.answer
            }
          }))
        }
      ];
    }
    
    return schema;
  }

  validateGutenbergBlocks(blocks) {
    const issues = [];
    let score = 100;
    
    // Check for required block types
    const blockTypes = blocks.map(b => b.blockName);
    
    if (!blockTypes.includes('core/heading')) {
      issues.push('Missing heading blocks for proper content structure');
      score -= 15;
    }
    
    if (!blockTypes.includes('core/paragraph')) {
      issues.push('Missing paragraph blocks');
      score -= 10;
    }
    
    // Check block structure
    for (const block of blocks) {
      if (!block.blockName || !block.innerHTML) {
        issues.push('Invalid block structure detected');
        score -= 5;
      }
    }
    
    return {
      valid: issues.length === 0,
      score: Math.max(score, 0),
      issues
    };
  }

  validateWordPressCompatibility(wordpressPost) {
    const issues = [];
    let score = 100;
    
    if (!wordpressPost.title) {
      issues.push('Missing post title');
      score -= 20;
    }
    
    if (!wordpressPost.content) {
      issues.push('Missing post content');
      score -= 30;
    }
    
    if (wordpressPost.title && wordpressPost.title.length > 60) {
      issues.push('Title may be too long for SEO');
      score -= 5;
    }
    
    return {
      valid: issues.length === 0,
      score: Math.max(score, 0),
      issues
    };
  }

  completeWorkflow(workflow, totalTime) {
    this.metrics.totalPipelines++;
    
    // Check if all stages succeeded
    const allStagesSuccessful = Object.values(workflow.stages)
      .every(stage => stage.success);
    
    if (allStagesSuccessful) {
      this.metrics.successfulPublications++;
    }
    
    // Update average processing time
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalPipelines - 1) + totalTime) / 
      this.metrics.totalPipelines;
    
    // Update stage success rates
    for (const [stageName, stageResult] of Object.entries(workflow.stages)) {
      if (!this.metrics.stageSuccessRates[stageName]) {
        this.metrics.stageSuccessRates[stageName] = { success: 0, total: 0 };
      }
      
      this.metrics.stageSuccessRates[stageName].total++;
      if (stageResult.success) {
        this.metrics.stageSuccessRates[stageName].success++;
      }
    }
    
    return {
      success: allStagesSuccessful,
      workflowId: workflow.id,
      processingTime: totalTime,
      stages: workflow.stages,
      publication: workflow.stages.wordpress_publication?.publication,
      metrics: this.metrics
    };
  }

  async storePublicationRecord(workflow, publishResult) {
    if (this.crystallineMemory) {
      const record = {
        workflowId: workflow.id,
        contentTitle: workflow.content?.title,
        wordpressSite: workflow.wordpressConfig?.siteUrl,
        publishResult,
        stages: Object.keys(workflow.stages),
        timestamp: new Date().toISOString()
      };

      await this.crystallineMemory.storeMemory(
        'wordpress-publishing',
        `WordPress pipeline: ${workflow.content?.title}`,
        { 
          type: 'pipeline_record',
          ...record,
          importance: 0.9 
        }
      );
    }
  }

  getStatus() {
    return {
      activeWorkflows: this.activeWorkflows.size,
      metrics: this.metrics,
      pipelineStages: this.pipelineStages
    };
  }
}

module.exports = WordPressContentPipeline;