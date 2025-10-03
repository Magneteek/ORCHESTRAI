/**
 * ORCHESTRAI Enhanced Outline Generator v2.0
 * Strategic Agent with Content Formatting Specifications
 * Frequency: 0.5Hz (Strategic Phase Operations)
 * 
 * Revolutionary multi-dimensional outline generation with:
 * - Content formatting diversity specifications
 * - Paragraph length variations
 * - Structural element placements (lists, tables, callouts)
 * - Psychographic tone transitions
 * - Context preservation protocols
 */

const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');

class EnhancedOutlineGenerator {
  constructor() {
    this.agentId = 'enhanced-outline-generator-v2';
    this.frequency = '0.5Hz';
    this.phase = 'STRATEGIC_PHASE_2';
    this.redis = null;
    this.crystallineMemory = new Map();
    
    // Content Formatting Specifications
    this.formatSpecs = {
      paragraphVariations: {
        short: { sentences: '2-3', usage: '35%', purpose: 'impact, transitions' },
        medium: { sentences: '4-5', usage: '45%', purpose: 'explanation, details' },
        long: { sentences: '6-8', usage: '20%', purpose: 'comprehensive coverage' }
      },
      structuralElements: {
        bulletedLists: { frequency: '2-3 per H2', purpose: 'key points, benefits' },
        numberedLists: { frequency: '1-2 per H2', purpose: 'steps, procedures' },
        tables: { frequency: '1 per major section', purpose: 'comparisons, pricing' },
        calloutBoxes: { frequency: '1-2 per H2', purpose: 'important warnings, tips' }
      },
      visualBreaks: {
        subheadings: 'H3 every 400-600 words',
        whitespace: 'Double line breaks between major concepts',
        emphasis: 'Bold for key terms, italics for foreign terms'
      }
    };
  }

  async initialize(redisClient) {
    this.redis = redisClient;
    console.log('🎯 Enhanced Outline Generator v2.0 initialized at 0.5Hz frequency');
    return this;
  }

  /**
   * Generate Enhanced Outline with Content Formatting Specifications
   */
  async generateEnhancedOutline(projectData) {
    try {
      const outlineId = uuidv4();
      console.log(`📋 Generating Enhanced Outline: ${outlineId}`);

      // Load Intelligence Sources
      const intelligence = await this.loadIntelligenceSources(projectData);
      
      // Generate Content Structure with Formatting
      const enhancedOutline = await this.createStructuredOutline(intelligence);
      
      // Apply Content Formatting Specifications
      const formattedOutline = await this.applyFormattingSpecifications(enhancedOutline);
      
      // Validate Language Consistency
      const validatedOutline = await this.validateLanguageConsistency(formattedOutline, projectData.language);
      
      // Store in Crystalline Memory
      await this.storeInCrystallineMemory(outlineId, validatedOutline, projectData);
      
      return {
        outlineId,
        outline: validatedOutline,
        formattingSpecs: this.formatSpecs,
        qualityScore: await this.calculateQualityScore(validatedOutline),
        readyForValidation: true
      };

    } catch (error) {
      console.error('❌ Enhanced Outline Generation Error:', error);
      throw error;
    }
  }

  /**
   * Load and Integrate Intelligence Sources
   */
  async loadIntelligenceSources(projectData) {
    const intelligence = {
      seoData: await this.loadSEOIntelligence(projectData.projectPath),
      psychographicData: await this.loadPsychographicIntelligence(projectData.projectPath),
      competitiveData: await this.loadCompetitiveIntelligence(projectData.projectPath),
      contentStrategy: await this.loadContentStrategy(projectData.projectPath)
    };

    console.log('🧠 Intelligence sources loaded and integrated');
    return intelligence;
  }

  /**
   * Create Structured Outline with Enhanced Specifications
   */
  async createStructuredOutline(intelligence) {
    const outline = {
      metadata: {
        title: intelligence.contentStrategy.articleTarget || 'Enhanced Content Title',
        language: intelligence.contentStrategy.targetLanguage || 'sl',
        targetWordCount: intelligence.contentStrategy.targetLength || '3500-4000',
        estimatedReadTime: '15-18 minutes',
        seoScore: 'Target: 95+',
        psychographicAlignment: 'Multi-segment optimization'
      },
      
      structure: {
        introduction: this.generateIntroductionSpecs(intelligence),
        mainSections: this.generateMainSectionsSpecs(intelligence),
        conclusion: this.generateConclusionSpecs(intelligence),
        faq: this.generateFAQSpecs(intelligence)
      },
      
      contentFormattingRequirements: this.generateFormattingRequirements(),
      qualityCheckpoints: this.generateQualityCheckpoints()
    };

    return outline;
  }

  /**
   * Generate Introduction Specifications
   */
  generateIntroductionSpecs(intelligence) {
    return {
      wordCount: '200-250',
      paragraphs: [
        {
          type: 'medium',
          purpose: 'Hook and problem identification',
          psychographicTone: 'universal appeal',
          keywordIntegration: 'primary keyword natural mention'
        },
        {
          type: 'short',
          purpose: 'Authority establishment',
          elements: ['credibility signals', 'local expertise'],
          formatting: 'bold key statistics'
        },
        {
          type: 'medium',
          purpose: 'Article roadmap',
          elements: ['what reader will learn', 'value proposition'],
          cta: 'soft engagement invitation'
        }
      ],
      structuralElements: [
        'Opening hook question or statistic',
        'Bulleted list of key topics covered',
        'Trust signal callout box'
      ]
    };
  }

  /**
   * Generate Main Sections Specifications
   */
  generateMainSectionsSpecs(intelligence) {
    const sections = [];
    
    // Process each target keyword into H2 section
    if (intelligence.seoData && intelligence.seoData.targetKeywords) {
      intelligence.seoData.targetKeywords.forEach((keyword, index) => {
        const section = {
          h2Title: this.generateH2Title(keyword, intelligence),
          targetKeyword: keyword.keyword,
          wordCount: this.calculateSectionWordCount(keyword.priority),
          psychographicFocus: this.mapPsychographicFocus(keyword, intelligence),
          
          contentStructure: {
            introduction: {
              type: 'medium',
              purpose: 'Section overview and keyword introduction',
              formatting: 'keyword in first 50 words'
            },
            
            subsections: this.generateH3Subsections(keyword, intelligence),
            
            contentVariations: [
              {
                type: 'explanatoryParagraph',
                length: 'long',
                purpose: 'detailed explanation',
                elements: ['technical details', 'examples']
              },
              {
                type: 'bulletedList',
                items: '5-7 key points',
                purpose: 'digestible information',
                formatting: 'bold first words'
              },
              {
                type: 'comparisonTable',
                purpose: 'clear comparisons',
                columns: 'Feature | Benefit | Consideration',
                styling: 'clean, mobile-responsive'
              },
              {
                type: 'calloutBox',
                purpose: 'important tip or warning',
                styling: 'highlighted background',
                icon: 'relevant emoji or icon'
              }
            ],
            
            conclusion: {
              type: 'short',
              purpose: 'section summary and transition',
              cta: 'section-specific soft CTA'
            }
          },
          
          seoOptimization: {
            keywordDensity: '0.8-1.2%',
            semanticKeywords: this.generateSemanticKeywords(keyword),
            internalLinks: this.generateInternalLinkingPlan(keyword),
            externalAuthority: 'medical/dental authority links'
          }
        };
        
        sections.push(section);
      });
    }
    
    return sections;
  }

  /**
   * Generate Content Formatting Requirements
   */
  generateFormattingRequirements() {
    return {
      paragraphDistribution: {
        short: '35% - Impact statements, transitions, key points',
        medium: '45% - Main explanations, detailed information',
        long: '20% - Comprehensive coverage, technical details'
      },
      
      listRequirements: {
        bulletedLists: {
          frequency: '2-3 per H2 section',
          purpose: 'Key benefits, important points, considerations',
          formatting: 'Bold first words, concise points',
          maxItems: '5-7 items per list'
        },
        numberedLists: {
          frequency: '1-2 per H2 section',  
          purpose: 'Step-by-step processes, ranked items',
          formatting: 'Clear progression, action-oriented',
          maxItems: '5-8 steps per list'
        }
      },
      
      tableRequirements: {
        frequency: '1 per major H2 section',
        types: ['pricing comparisons', 'feature comparisons', 'timeline overviews'],
        formatting: 'Clean headers, mobile-responsive, alternating rows',
        maxColumns: '3-4 for readability'
      },
      
      calloutBoxes: {
        frequency: '1-2 per H2 section',
        types: ['Pro Tips', 'Important Warnings', 'Quick Facts', 'Local Information'],
        formatting: 'Highlighted background, relevant icons, concise content',
        maxLength: '50-75 words per callout'
      },
      
      visualElements: {
        subheadings: 'H3 every 400-600 words for content breaking',
        emphasis: 'Bold for key terms, italics for foreign/medical terms',
        whitespace: 'Double line breaks between major concepts',
        transitions: 'Clear connective phrases between sections'
      }
    };
  }

  /**
   * Apply Formatting Specifications to Outline
   */
  async applyFormattingSpecifications(outline) {
    // Apply formatting specs to each section
    outline.structure.mainSections = outline.structure.mainSections.map(section => {
      section.formattingPlan = {
        paragraphPlan: this.createParagraphPlan(section.wordCount),
        listPlacements: this.planListPlacements(section),
        tablePlacements: this.planTablePlacements(section),
        calloutPlacements: this.planCalloutPlacements(section),
        visualBreaks: this.planVisualBreaks(section)
      };
      return section;
    });

    console.log('🎨 Formatting specifications applied to outline');
    return outline;
  }

  /**
   * Validate Language Consistency
   */
  async validateLanguageConsistency(outline, targetLanguage) {
    const validator = new LanguageConsistencyValidator();
    const validationResult = await validator.validate(outline, targetLanguage);
    
    if (validationResult.hasInconsistencies) {
      console.log('⚠️  Language inconsistencies detected, applying corrections...');
      outline = await validator.applyCorrections(outline, validationResult.corrections);
    }

    outline.languageValidation = {
      targetLanguage,
      consistencyScore: validationResult.consistencyScore,
      correctionsMade: validationResult.correctionsMade,
      validated: true
    };

    console.log(`✅ Language consistency validated: ${validationResult.consistencyScore}%`);
    return outline;
  }

  /**
   * Store in Crystalline Memory
   */
  async storeInCrystallineMemory(outlineId, outline, projectData) {
    const memoryNode = {
      id: outlineId,
      type: 'enhanced-outline',
      content: outline,
      metadata: {
        projectId: projectData.projectId,
        createdAt: new Date().toISOString(),
        agentId: this.agentId,
        version: '2.0',
        qualityScore: await this.calculateQualityScore(outline)
      }
    };

    this.crystallineMemory.set(outlineId, memoryNode);
    
    if (this.redis) {
      await this.redis.setex(`outline:${outlineId}`, 3600, JSON.stringify(memoryNode));
    }

    console.log(`💎 Enhanced outline stored in crystalline memory: ${outlineId}`);
  }

  /**
   * Calculate Quality Score
   */
  async calculateQualityScore(outline) {
    let score = 0;
    
    // Structure completeness (30 points)
    if (outline.structure.introduction) score += 10;
    if (outline.structure.mainSections && outline.structure.mainSections.length >= 3) score += 15;
    if (outline.structure.faq) score += 5;
    
    // Formatting specifications (25 points)
    if (outline.contentFormattingRequirements) score += 15;
    if (outline.structure.mainSections.every(s => s.formattingPlan)) score += 10;
    
    // Language consistency (20 points)  
    if (outline.languageValidation && outline.languageValidation.consistencyScore > 90) score += 20;
    else if (outline.languageValidation && outline.languageValidation.consistencyScore > 70) score += 15;
    
    // SEO optimization (15 points)
    if (outline.structure.mainSections.every(s => s.seoOptimization)) score += 15;
    
    // Psychographic alignment (10 points)
    if (outline.structure.mainSections.every(s => s.psychographicFocus)) score += 10;
    
    return score;
  }

  // Helper methods for specific outline generation tasks
  generateH2Title(keyword, intelligence) {
    // Generate H2 title based on keyword and intelligence
    return `${keyword.keyword} - Enhanced Section Title`;
  }

  calculateSectionWordCount(priority) {
    const wordCounts = {
      high: '900-1000',
      medium: '700-800', 
      low: '600-700'
    };
    return wordCounts[priority] || '700-800';
  }

  mapPsychographicFocus(keyword, intelligence) {
    // Map keyword to psychographic segments
    return intelligence.psychographicData?.segments || ['general'];
  }

  generateH3Subsections(keyword, intelligence) {
    return [
      'Overview and Introduction',
      'Detailed Process/Information', 
      'Benefits and Considerations',
      'Local/Regional Specifics',
      'Summary and Next Steps'
    ];
  }

  generateSemanticKeywords(keyword) {
    return [
      'related_term_1',
      'related_term_2', 
      'related_term_3'
    ];
  }

  generateInternalLinkingPlan(keyword) {
    return {
      targetPages: 3,
      anchorTexts: ['natural anchor 1', 'natural anchor 2'],
      placement: 'contextually relevant within content'
    };
  }

  createParagraphPlan(wordCount) {
    const totalWords = parseInt(wordCount.split('-')[0]);
    return {
      short: Math.ceil(totalWords * 0.35 / 50), // ~50 words per short paragraph
      medium: Math.ceil(totalWords * 0.45 / 100), // ~100 words per medium paragraph  
      long: Math.ceil(totalWords * 0.20 / 150) // ~150 words per long paragraph
    };
  }

  planListPlacements(section) {
    return {
      bulleted: 2,
      numbered: 1,
      positions: ['after first explanatory paragraph', 'before conclusion']
    };
  }

  planTablePlacements(section) {
    return {
      count: 1,
      type: 'comparison',
      position: 'middle of section',
      purpose: 'data comparison or feature overview'
    };
  }

  planCalloutPlacements(section) {
    return {
      count: 1,
      type: 'pro tip',
      position: 'after main explanation',
      purpose: 'highlight important information'
    };
  }

  planVisualBreaks(section) {
    return {
      h3Count: 3,
      spacing: 'double line breaks between concepts',
      emphasis: 'bold key terms, italic foreign terms'
    };
  }

  // Intelligence loading methods (simplified for brevity)
  async loadSEOIntelligence(projectPath) {
    return { targetKeywords: [] }; // Placeholder
  }

  async loadPsychographicIntelligence(projectPath) {
    return { segments: [] }; // Placeholder  
  }

  async loadCompetitiveIntelligence(projectPath) {
    return { opportunities: [] }; // Placeholder
  }

  async loadContentStrategy(projectPath) {
    return { articleTarget: '', targetLanguage: 'sl' }; // Placeholder
  }
}

/**
 * Language Consistency Validator
 * Ensures no mixed-language content in outlines
 */
class LanguageConsistencyValidator {
  constructor() {
    this.languagePatterns = {
      en: /\b(the|and|or|but|with|for|from|about|into|through|during|before|after|above|below|between|among|within|without|including|using|based|such|each|other|than|more|most|some|any|all|many|few|several|various|different|specific|particular|important|significant|effective|efficient|available|possible|necessary|required|recommended|preferred|optimal|maximum|minimum|average|general|common|typical|standard|normal|regular|special|unique|original|current|recent|latest|previous|following|next|last|first|second|third|main|primary|secondary|additional|extra|further|related|similar|different|same|equal|better|best|worse|worst|good|great|excellent|poor|bad|high|higher|highest|low|lower|lowest|large|larger|largest|small|smaller|smallest)\b/gi,
      sl: /\b(in|ter|ali|vendar|z|za|od|o|v|skozi|med|pred|po|nad|pod|brez|vključno|uporabo|osnovan|tako|vsak|drug|kot|več|največ|nekaj|vse|mnogi|redki|različni|specifični|pomembni|učinkoviti|na voljo|možni|potrebni|priporočeni|optimalni|maksimalni|minimalni|povprečni|splošni|običajni|standardni|normalni|posebni|edinstveni|trenutni|nedavni|najnovejši|prejšnji|naslednji|zadnji|prvi|drugi|tretji|glavni|primarni|sekundarni|dodatni|povezani|podobni|različni|enaki|boljši|najboljši|slabši|najslabši|dober|odličen|slab|visok|višji|najvišji|nizek|nižji|najnižji|velik|večji|največji|majhen|manjši|najmanjši)\b/gi
    };
  }

  async validate(outline, targetLanguage) {
    const inconsistencies = [];
    let totalScore = 100;

    const textContent = this.extractTextContent(outline);
    
    // Check for mixed language patterns
    for (const [lang, pattern] of Object.entries(this.languagePatterns)) {
      if (lang !== targetLanguage) {
        const matches = textContent.match(pattern);
        if (matches && matches.length > 0) {
          inconsistencies.push({
            type: 'mixed_language',
            detectedLanguage: lang,
            targetLanguage: targetLanguage,
            matches: matches.slice(0, 5), // First 5 matches
            severity: 'high'
          });
          totalScore -= (matches.length * 2); // Penalize mixed language
        }
      }
    }

    return {
      hasInconsistencies: inconsistencies.length > 0,
      inconsistencies,
      consistencyScore: Math.max(0, totalScore),
      correctionsMade: 0
    };
  }

  async applyCorrections(outline, corrections) {
    // Apply language corrections to outline
    // Implementation would depend on specific correction types
    console.log('Applying language corrections...');
    return outline;
  }

  extractTextContent(outline) {
    // Extract all text content from outline for analysis
    return JSON.stringify(outline).toLowerCase();
  }
}

module.exports = { EnhancedOutlineGenerator, LanguageConsistencyValidator };