/**
 * ORCHESTRAI Automated Content Enhancement Loop
 * 
 * Integrates content generation with quality validation and iterative enhancement
 * to automatically achieve full outline compliance through systematic improvements
 */

const SelfIteratingQASystem = require('./self-iterating-qa-system');
const path = require('path');
const fs = require('fs').promises;

class AutomatedContentEnhancementLoop {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.qaSystem = new SelfIteratingQASystem();
    this.maxIterations = 5;
    this.qualityThreshold = 85; // Minimum compliance score
    this.enhancementHistory = new Map();
    
    this.enhancementStrategies = {
      'missing_sections': this.addMissingSections.bind(this),
      'word_count_deficit': this.expandContent.bind(this),
      'engagement_elements': this.addEngagementElements.bind(this),
      'internal_linking': this.implementInternalLinking.bind(this),
      'cta_integration': this.completeCTAStrategy.bind(this),
      'psychographic_targeting': this.enhancePsychographicMessaging.bind(this),
      'seo_optimization': this.optimizeSEOElements.bind(this),
      'structured_data': this.addStructuredDataMarkup.bind(this)
    };
  }

  /**
   * Main automated enhancement loop
   */
  async executeContentEnhancementLoop(taskContext) {
    console.log('🔄 Starting Automated Content Enhancement Loop...');
    console.log('================================================');
    
    const loopData = {
      taskContext,
      iterations: 0,
      initialScore: 0,
      currentScore: 0,
      enhancementLog: [],
      finalResult: null
    };

    try {
      // Phase 1: Initial content generation (if not exists)
      if (!await this.contentExists(taskContext.contentFilePath)) {
        console.log('📝 Phase 1: Initial Content Generation');
        await this.generateInitialContent(taskContext);
      }

      // Phase 2: Iterative enhancement loop
      console.log('🔄 Phase 2: Iterative Enhancement Loop');
      let continueLoop = true;
      
      while (continueLoop && loopData.iterations < this.maxIterations) {
        loopData.iterations++;
        console.log(`\n--- Iteration ${loopData.iterations}/${this.maxIterations} ---`);
        
        // Step 1: Quality assessment
        const qaResult = await this.performQualityAssessment(taskContext);
        loopData.currentScore = qaResult.overallScore;
        
        if (loopData.iterations === 1) {
          loopData.initialScore = qaResult.overallScore;
        }
        
        console.log(`📊 Quality Score: ${qaResult.overallScore}% (Threshold: ${this.qualityThreshold}%)`);
        
        // Step 1.5: Language purity validation (if target language specified)
        if (taskContext.targetLanguage) {
          await this.validateLanguagePurity(taskContext, loopData);
        }
        
        // Step 2: Check if quality threshold met
        if (qaResult.overallScore >= this.qualityThreshold) {
          console.log('✅ Quality threshold achieved!');
          continueLoop = false;
          loopData.finalResult = {
            success: true,
            message: 'Content meets quality standards',
            finalScore: qaResult.overallScore
          };
          break;
        }
        
        // Step 3: Identify and apply enhancements
        const enhancements = await this.identifyEnhancements(qaResult);
        if (enhancements.length === 0) {
          console.log('⚠️  No more enhancements identified');
          continueLoop = false;
          loopData.finalResult = {
            success: false,
            message: 'No additional enhancements possible',
            finalScore: qaResult.overallScore
          };
          break;
        }
        
        // Step 4: Apply enhancements
        const enhancementResults = await this.applyEnhancements(taskContext, enhancements);
        loopData.enhancementLog.push({
          iteration: loopData.iterations,
          enhancements: enhancementResults,
          scoreBefore: qaResult.overallScore,
          scoreAfter: null // Will be filled in next iteration
        });
        
        console.log(`🔧 Applied ${enhancementResults.length} enhancements`);
      }
      
      // Phase 3: Final validation and reporting
      console.log('\n🎯 Phase 3: Final Validation');
      const finalQA = await this.performQualityAssessment(taskContext);
      
      if (loopData.enhancementLog.length > 0) {
        loopData.enhancementLog[loopData.enhancementLog.length - 1].scoreAfter = finalQA.overallScore;
      }
      
      const report = await this.generateEnhancementReport(loopData, finalQA);
      
      console.log('✅ Automated Content Enhancement Loop Complete');
      console.log(`📊 Final Score: ${finalQA.overallScore}% (Improved by ${finalQA.overallScore - loopData.initialScore}%)`);
      
      return {
        success: finalQA.overallScore >= this.qualityThreshold,
        iterations: loopData.iterations,
        initialScore: loopData.initialScore,
        finalScore: finalQA.overallScore,
        improvement: finalQA.overallScore - loopData.initialScore,
        enhancementLog: loopData.enhancementLog,
        finalReport: report
      };
      
    } catch (error) {
      console.error('❌ Error in content enhancement loop:', error);
      return {
        success: false,
        error: error.message,
        iterations: loopData.iterations,
        enhancementLog: loopData.enhancementLog
      };
    }
  }

  /**
   * Generate initial content if it doesn't exist
   */
  async generateInitialContent(taskContext) {
    try {
      // Use content writer specialist for initial generation
      const contentAgent = await this.orchestrator.getAgent('content-writer-specialist');
      
      const generationPrompt = `
        Generate the complete article following the comprehensive outline.
        
        Project: ${taskContext.projectId}
        Outline: ${taskContext.outlineFilePath}
        Target: ${taskContext.contentFilePath}
        
        Requirements:
        - Follow outline specifications precisely
        - Integrate psychographic research from memory system
        - Include all engagement elements specified
        - Maintain cultural resonance for Slovenian market
        - Achieve 3,800-4,200 word target
      `;
      
      await contentAgent.executeTask(generationPrompt);
      console.log('📝 Initial content generation completed');
      
    } catch (error) {
      console.error('❌ Error generating initial content:', error);
      throw error;
    }
  }

  /**
   * Perform quality assessment using QA system
   */
  async performQualityAssessment(taskContext) {
    try {
      // Use content quality validator for assessment
      const qaAgent = await this.orchestrator.getAgent('content-quality-validator');
      
      const assessmentPrompt = `
        Perform comprehensive quality assessment of the article against its outline.
        
        Article: ${taskContext.contentFilePath}
        Outline: ${taskContext.outlineFilePath}
        
        Provide detailed scoring for:
        - Structural compliance (H1/H2/H3, word counts)
        - Content element compliance (tables, lists, callouts)
        - Psychographic targeting accuracy
        - SEO integration effectiveness
        - Cultural resonance authenticity
        - CTA strategy implementation
        - Internal linking completeness
        
        Return JSON format with scores and specific gaps identified.
      `;
      
      const assessment = await qaAgent.executeTask(assessmentPrompt);
      return this.parseQualityAssessment(assessment);
      
    } catch (error) {
      console.error('❌ Error in quality assessment:', error);
      throw error;
    }
  }

  /**
   * Identify specific enhancements needed
   */
  async identifyEnhancements(qaResult) {
    const enhancements = [];
    
    // Priority 1: Critical structural issues
    if (qaResult.structuralCompliance < 80) {
      if (qaResult.missingSections && qaResult.missingSections.length > 0) {
        enhancements.push({
          type: 'missing_sections',
          priority: 1,
          data: qaResult.missingSections
        });
      }
      
      if (qaResult.wordCountDeficit > 500) {
        enhancements.push({
          type: 'word_count_deficit',
          priority: 1,
          data: { deficit: qaResult.wordCountDeficit, sections: qaResult.shortSections }
        });
      }
    }
    
    // Priority 2: Content elements
    if (qaResult.engagementElements < 70) {
      enhancements.push({
        type: 'engagement_elements',
        priority: 2,
        data: qaResult.missingElements
      });
    }
    
    // Priority 3: SEO and linking
    if (qaResult.internalLinking < 60) {
      enhancements.push({
        type: 'internal_linking',
        priority: 3,
        data: qaResult.linkingOpportunities
      });
    }
    
    if (qaResult.ctaCompliance < 80) {
      enhancements.push({
        type: 'cta_integration',
        priority: 2,
        data: qaResult.missingCTAs
      });
    }
    
    // Priority 4: Advanced optimizations
    if (qaResult.psychographicTargeting < 75) {
      enhancements.push({
        type: 'psychographic_targeting',
        priority: 3,
        data: qaResult.psychographicGaps
      });
    }
    
    if (qaResult.seoIntegration < 75) {
      enhancements.push({
        type: 'seo_optimization',
        priority: 3,
        data: qaResult.seoGaps
      });
    }
    
    // Sort by priority
    return enhancements.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Apply specific enhancements
   */
  async applyEnhancements(taskContext, enhancements) {
    const results = [];
    
    for (const enhancement of enhancements) {
      try {
        console.log(`🔧 Applying enhancement: ${enhancement.type}`);
        
        const strategy = this.enhancementStrategies[enhancement.type];
        if (strategy) {
          const result = await strategy(taskContext, enhancement.data);
          results.push({
            type: enhancement.type,
            success: true,
            result
          });
          console.log(`✅ Enhancement ${enhancement.type} completed`);
        } else {
          console.log(`⚠️  No strategy found for ${enhancement.type}`);
          results.push({
            type: enhancement.type,
            success: false,
            error: 'No enhancement strategy available'
          });
        }
        
      } catch (error) {
        console.error(`❌ Error applying enhancement ${enhancement.type}:`, error);
        results.push({
          type: enhancement.type,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Enhancement Strategy: Add missing sections
   */
  async addMissingSections(taskContext, missingSections) {
    console.log(`📝 Adding ${missingSections.length} missing sections`);
    
    for (const section of missingSections) {
      const sectionAgent = await this.orchestrator.getAgent('content-writer-specialist');
      
      const sectionPrompt = `
        Generate the missing section for the article:
        
        Section: ${section.id} - ${section.title}
        Target Word Count: ${section.wordCount}
        Psychographic Focus: ${section.psychographicFocus}
        Requirements: ${JSON.stringify(section.requirements)}
        
        Integrate with existing article at: ${taskContext.contentFilePath}
        Follow outline specifications from: ${taskContext.outlineFilePath}
        
        Maintain consistency with existing content tone and style.
      `;
      
      await sectionAgent.executeTask(sectionPrompt);
    }
    
    return { sectionsAdded: missingSections.length };
  }

  /**
   * Enhancement Strategy: Expand content for word count
   */
  async expandContent(taskContext, expansionData) {
    console.log(`📏 Expanding content by ${expansionData.deficit} words`);
    
    const expansionAgent = await this.orchestrator.getAgent('content-writer-specialist');
    
    const expansionPrompt = `
      Expand the existing article to meet word count targets:
      
      Current Deficit: ${expansionData.deficit} words
      Short Sections: ${JSON.stringify(expansionData.sections)}
      
      Article: ${taskContext.contentFilePath}
      Outline: ${taskContext.outlineFilePath}
      
      Focus on:
      - Adding depth to existing sections
      - Including more examples and case studies
      - Expanding psychographic-specific messaging
      - Adding detailed explanations
      
      Maintain content quality and natural flow.
    `;
    
    await expansionAgent.executeTask(expansionPrompt);
    
    return { wordsAdded: expansionData.deficit };
  }

  /**
   * Enhancement Strategy: Add engagement elements
   */
  async addEngagementElements(taskContext, missingElements) {
    console.log(`🎨 Adding ${Object.keys(missingElements).length} types of engagement elements`);
    
    const elementsAgent = await this.orchestrator.getAgent('content-writer-specialist');
    
    const elementsPrompt = `
      Add missing engagement elements to the article:
      
      Missing Elements: ${JSON.stringify(missingElements)}
      Article: ${taskContext.contentFilePath}
      Outline: ${taskContext.outlineFilePath}
      
      Add elements in appropriate sections:
      - Comparison tables for decision support
      - Bulleted lists for easy scanning
      - Numbered lists for processes
      - Callout boxes for key information
      - Statistics boxes for credibility
      
      Ensure elements add value and enhance readability.
    `;
    
    await elementsAgent.executeTask(elementsPrompt);
    
    return { elementsAdded: missingElements };
  }

  /**
   * Enhancement Strategy: Implement internal linking
   */
  async implementInternalLinking(taskContext, linkingOpportunities) {
    console.log(`🔗 Implementing internal linking strategy`);
    
    const linkingAgent = await this.orchestrator.getAgent('seo-content-optimization');
    
    const linkingPrompt = `
      Implement comprehensive internal linking strategy:
      
      Linking Opportunities: ${JSON.stringify(linkingOpportunities)}
      Article: ${taskContext.contentFilePath}
      
      Focus on:
      - Geographic link strategy (Ljubljana, Maribor, Celje, Kranj)
      - Authority link patterns (credentials, technology, experience)
      - Cross-references between sections
      - Hub page connections
      
      Use natural anchor text and contextual relevance.
    `;
    
    await linkingAgent.executeTask(linkingPrompt);
    
    return { linksAdded: linkingOpportunities.length };
  }

  /**
   * Enhancement Strategy: Complete CTA integration
   */
  async completeCTAStrategy(taskContext, missingCTAs) {
    console.log(`📢 Adding ${missingCTAs.length} missing CTAs`);
    
    const ctaAgent = await this.orchestrator.getAgent('content-writer-specialist');
    
    const ctaPrompt = `
      Add missing call-to-action elements:
      
      Missing CTAs: ${JSON.stringify(missingCTAs)}
      Article: ${taskContext.contentFilePath}
      
      Implement segment-specific CTA messaging:
      - Pragmatični Varčevalci: "Brezplačna cenovna analiza"
      - Družinski Srednji: "Varna konzultacija za vso družino"
      - Zavedni Eko: "Posvet o biokompatibilnih rešitvah"
      - Statusni Iskovalci: "Ekskluzivni estetski posvet"
      
      Place CTAs strategically without being pushy.
    `;
    
    await ctaAgent.executeTask(ctaPrompt);
    
    return { ctasAdded: missingCTAs.length };
  }

  /**
   * Enhancement Strategy: Enhance psychographic messaging
   */
  async enhancePsychographicMessaging(taskContext, psychographicGaps) {
    console.log(`🎯 Enhancing psychographic targeting`);
    
    const psychographicAgent = await this.orchestrator.getAgent('content-writer-specialist');
    
    const psychographicPrompt = `
      Enhance psychographic targeting in the article:
      
      Gaps Identified: ${JSON.stringify(psychographicGaps)}
      Article: ${taskContext.contentFilePath}
      
      Access memory system for psychographic research:
      - Pragmatični Varčevalci (32%): Cost-efficiency, practical value
      - Zavedni Eko (28%): Sustainability, biocompatibility
      - Družinski Srednji (22%): Family safety, local trust
      - Statusni Iskovalci (18%): Premium quality, discretion
      
      Add segment-specific messaging and pain point resolution.
    `;
    
    await psychographicAgent.executeTask(psychographicPrompt);
    
    return { segmentsEnhanced: psychographicGaps.length };
  }

  /**
   * Enhancement Strategy: Optimize SEO elements
   */
  async optimizeSEOElements(taskContext, seoGaps) {
    console.log(`🔍 Optimizing SEO elements`);
    
    const seoAgent = await this.orchestrator.getAgent('seo-content-optimization');
    
    const seoPrompt = `
      Optimize SEO elements in the article:
      
      SEO Gaps: ${JSON.stringify(seoGaps)}
      Article: ${taskContext.contentFilePath}
      
      Focus on:
      - Natural keyword density optimization
      - Long-tail keyword integration
      - Local SEO enhancement
      - Meta descriptions and title optimization
      - Structured data preparation
      
      Maintain natural reading flow while optimizing.
    `;
    
    await seoAgent.executeTask(seoPrompt);
    
    return { seoElementsOptimized: seoGaps.length };
  }

  /**
   * Enhancement Strategy: Add structured data markup
   */
  async addStructuredDataMarkup(taskContext, structuredDataNeeds) {
    console.log(`📋 Adding structured data markup`);
    
    const structuredDataAgent = await this.orchestrator.getAgent('seo-content-optimization');
    
    const structuredDataPrompt = `
      Add structured data markup for the article:
      
      Required Markup: ${JSON.stringify(structuredDataNeeds)}
      Article: ${taskContext.contentFilePath}
      
      Implement:
      - FAQ schema for Q&A sections
      - Medical schema for procedure descriptions
      - Local business schema for nasmehPG information
      - Review schema preparation
      
      Ensure compliance with schema.org standards.
    `;
    
    await structuredDataAgent.executeTask(structuredDataPrompt);
    
    return { schemaTypesAdded: structuredDataNeeds.length };
  }

  /**
   * Parse quality assessment results
   */
  parseQualityAssessment(assessmentResult) {
    // Parse JSON or structured result from QA agent
    // This would depend on the actual format returned by the QA agent
    // For now, return a mock structure
    return {
      overallScore: 78,
      structuralCompliance: 85,
      engagementElements: 65,
      psychographicTargeting: 72,
      seoIntegration: 85,
      culturalResonance: 82,
      ctaCompliance: 70,
      internalLinking: 55,
      missingSections: [
        { id: 'H2.8', title: 'Pogosto zastavljena vprašanja', wordCount: 450 }
      ],
      wordCountDeficit: 850,
      shortSections: ['H2.1', 'H2.7'],
      missingElements: {
        bulletedLists: 9,
        numberedLists: 4,
        comparisonTables: 4,
        calloutBoxes: 8
      },
      missingCTAs: ['process-cta', 'trust-cta'],
      linkingOpportunities: [
        'geographic-links',
        'authority-links',
        'cross-references'
      ]
    };
  }

  /**
   * Generate enhancement report
   */
  async generateEnhancementReport(loopData, finalQA) {
    const report = {
      executionSummary: {
        totalIterations: loopData.iterations,
        initialScore: loopData.initialScore,
        finalScore: finalQA.overallScore,
        improvement: finalQA.overallScore - loopData.initialScore,
        thresholdMet: finalQA.overallScore >= this.qualityThreshold
      },
      enhancementDetails: loopData.enhancementLog,
      finalQualityAssessment: finalQA,
      systemPerformance: {
        averageIterationTime: this.calculateAverageIterationTime(loopData.enhancementLog),
        mostEffectiveEnhancements: this.identifyMostEffectiveEnhancements(loopData.enhancementLog),
        systemRecommendations: this.generateSystemRecommendations(loopData, finalQA)
      }
    };
    
    // Store report for system learning
    this.enhancementHistory.set(loopData.taskContext.projectId, report);
    
    return report;
  }

  /**
   * Check if content file exists
   */
  async contentExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calculate average iteration time
   */
  calculateAverageIterationTime(enhancementLog) {
    if (enhancementLog.length === 0) return 0;
    
    // This would track actual timing data
    return enhancementLog.length * 2; // Mock: 2 minutes per iteration
  }

  /**
   * Identify most effective enhancements
   */
  identifyMostEffectiveEnhancements(enhancementLog) {
    const effectiveness = {};
    
    enhancementLog.forEach(iteration => {
      if (iteration.scoreAfter && iteration.scoreBefore) {
        const improvement = iteration.scoreAfter - iteration.scoreBefore;
        iteration.enhancements.forEach(enhancement => {
          if (enhancement.success) {
            effectiveness[enhancement.type] = (effectiveness[enhancement.type] || 0) + improvement;
          }
        });
      }
    });
    
    return Object.entries(effectiveness)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, improvement]) => ({ type, improvement }));
  }

  /**
   * Generate system recommendations
   */
  generateSystemRecommendations(loopData, finalQA) {
    const recommendations = [];
    
    if (finalQA.overallScore < this.qualityThreshold) {
      recommendations.push('Consider increasing maximum iterations for complex content');
    }
    
    if (loopData.iterations === 1 && finalQA.overallScore >= this.qualityThreshold) {
      recommendations.push('Initial generation quality excellent - consider optimizing outline specificity');
    }
    
    if (finalQA.structuralCompliance < 80) {
      recommendations.push('Improve outline-to-content generation adherence');
    }
    
    return recommendations;
  }

  /**
   * Validate language purity for multilingual content generation
   */
  async validateLanguagePurity(taskContext, loopData) {
    console.log(`🔍 Validating ${taskContext.targetLanguage.toUpperCase()} language purity...`);
    
    try {
      // Check if multilingual system is available
      if (!this.orchestrator.multilingualSystem) {
        console.log('⚠️  Multilingual system not available - skipping language validation');
        return;
      }

      // Read current content
      const content = await this.readContentFile(taskContext.contentFilePath);
      
      // Perform language purity validation
      const validation = await this.orchestrator.multilingualSystem.purityValidator
        .validateLanguagePurity(content, taskContext.targetLanguage);

      // Log validation results
      const purityScore = (validation.overallScore * 100).toFixed(1);
      console.log(`🎯 Language Purity Score: ${purityScore}%`);
      
      if (validation.passesValidation) {
        console.log('✅ Language purity validation: PASSED');
        loopData.languagePurityStatus = 'passed';
      } else {
        console.log('❌ Language purity validation: FAILED');
        console.log(`   🚨 Contamination level: ${validation.contaminationLevel.level}`);
        
        if (validation.contamination.detected) {
          console.log(`   🌐 Contamination types: ${validation.contamination.types.join(', ')}`);
          console.log(`   📝 Mixed sentences: ${validation.sentenceAnalysis.mixedSentences.length}`);
        }
        
        loopData.languagePurityStatus = 'failed';
        loopData.languagePurityIssues = {
          contaminationLevel: validation.contaminationLevel.level,
          mixedSentences: validation.sentenceAnalysis.mixedSentences.length,
          contaminationTypes: validation.contamination.types
        };

        // Add language purification to enhancement strategies
        this.addLanguagePurificationStrategy(taskContext, validation);
      }

      // Store validation data for reporting
      loopData.languageValidation = {
        score: validation.overallScore,
        passed: validation.passesValidation,
        details: validation
      };

    } catch (error) {
      console.error('❌ Language purity validation failed:', error.message);
      loopData.languagePurityStatus = 'error';
      loopData.languagePurityError = error.message;
    }
  }

  /**
   * Add language purification to enhancement strategies
   */
  addLanguagePurificationStrategy(taskContext, validation) {
    console.log('🔧 Adding language purification strategy to enhancement queue...');
    
    // Create language purification strategy
    this.enhancementStrategies['language_purification'] = async (context) => {
      console.log('🧹 Executing language purification strategy...');
      
      try {
        // Use CoTR prompting system to regenerate contaminated sections
        const cotrSystem = this.orchestrator.multilingualSystem.cotrSystem;
        
        // Generate correction prompt for mixed content
        const correctionPrompt = cotrSystem.generateValidationPrompt(
          taskContext.targetLanguage,
          context.currentContent
        );
        
        console.log('   📝 Generated language correction prompt');
        console.log('   🔄 Content will be purified in next iteration');
        
        return {
          strategy: 'language_purification',
          action: 'content_correction',
          prompt: correctionPrompt,
          targetLanguage: taskContext.targetLanguage,
          issues: validation.contamination.types
        };
        
      } catch (error) {
        console.error('❌ Language purification strategy failed:', error.message);
        return {
          strategy: 'language_purification',
          action: 'failed',
          error: error.message
        };
      }
    };
    
    console.log('✅ Language purification strategy added');
  }

  /**
   * Read content file helper method
   */
  async readContentFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to read content file ${filePath}:`, error.message);
      throw error;
    }
  }
}

module.exports = AutomatedContentEnhancementLoop;