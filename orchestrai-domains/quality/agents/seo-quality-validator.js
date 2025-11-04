const EventEmitter = require('events');

/**
 * SEO Quality Validator Agent
 * 
 * Specialized quality validation for SEO optimization including:
 * - Technical SEO compliance (meta tags, schema, performance)
 * - Keyword optimization analysis (density, placement, semantic relevance)
 * - SERP readiness validation (snippets, rankings factors)
 * - Link building quality assessment (anchor text, link profile)
 * - Content SEO optimization (E-A-T, topical authority)
 * 
 * Integrates with DataForSEO MCP and crystalline memory for advanced analysis
 */
class SEOQualityValidator extends EventEmitter {
  constructor(crystallineMemory, qualityConfig, mcpConnections) {
    super();
    
    this.agentId = 'seo-quality-validator';
    this.name = 'SEO Quality Validator';
    this.specialization = 'seo-quality-validation';
    this.crystallineMemory = crystallineMemory;
    this.config = qualityConfig;
    this.mcpConnections = mcpConnections;
    
    // SEO quality scoring weights
    this.seoWeights = {
      technicalCompliance: 0.30,    // 30% - Technical SEO factors
      keywordOptimization: 0.25,    // 25% - Keyword implementation
      serpReadiness: 0.20,          // 20% - SERP optimization
      contentRelevance: 0.15,       // 15% - Content quality for SEO
      linkOptimization: 0.10        // 10% - Internal/external linking
    };
    
    // SEO quality thresholds
    this.seoThresholds = qualityConfig.qualityMetrics || {
      technicalCompliance: { min: 90, target: 98 },
      keywordOptimization: { min: 80, target: 95 },
      serpReadiness: { min: 85, target: 95 }
    };
    
    // SEO best practice standards
    this.seoStandards = {
      titleLength: { min: 30, max: 60 },
      descriptionLength: { min: 120, max: 160 },
      keywordDensity: { min: 0.5, max: 2.5 },
      h1Count: { min: 1, max: 1 },
      internalLinks: { min: 2, max: 10 },
      imageAltTags: { coverage: 100 },
      urlLength: { max: 100 },
      loadingSpeed: { max: 3000 } // milliseconds
    };
    
    // Learning and intelligence data
    this.seoIntelligence = {
      successPatterns: new Map(),
      failurePatterns: new Map(),
      competitorInsights: new Map(),
      rankingFactors: new Map()
    };
    
    // Performance metrics
    this.metrics = {
      totalSEOValidations: 0,
      passedValidations: 0,
      averageSEOScore: 0,
      technicalIssuesFound: 0,
      keywordIssuesFound: 0,
      lastActivity: Date.now()
    };
    
    this.initialize();
  }

  async initialize() {
    console.log(`📈 Initializing ${this.name}...`);
    
    // Load SEO intelligence from crystalline memory
    await this.loadSEOIntelligence();
    
    // Test DataForSEO MCP connection
    await this.testDataForSEOConnection();
    
    console.log(`✅ ${this.name} initialized and ready`);
  }

  async loadSEOIntelligence() {
    try {
      // Query crystalline memory for SEO quality patterns
      const seoHistory = await this.crystallineMemory.retrieveMemory(
        'seo quality patterns',
        'quality-control',
        15
      );
      
      if (seoHistory.results.length > 0) {
        console.log(`📊 Loaded ${seoHistory.results.length} SEO intelligence patterns`);
        this.processSEOHistory(seoHistory.results);
      }
      
    } catch (error) {
      console.error('Error loading SEO intelligence:', error);
    }
  }

  processSEOHistory(historyResults) {
    historyResults.forEach(result => {
      if (result.metadata && result.metadata.qualityType === 'seo-quality') {
        try {
          const seoData = JSON.parse(result.content);
          
          // Track successful SEO patterns
          if (seoData.passed && seoData.score > 90) {
            const successKey = `high_seo_score_${seoData.validationType}`;
            const count = this.seoIntelligence.successPatterns.get(successKey) || 0;
            this.seoIntelligence.successPatterns.set(successKey, count + 1);
          }
          
          // Track failure patterns
          if (!seoData.passed && seoData.breakdown) {
            Object.keys(seoData.breakdown).forEach(metric => {
              if (seoData.breakdown[metric].score < 80) {
                const failureKey = `low_${metric}`;
                const count = this.seoIntelligence.failurePatterns.get(failureKey) || 0;
                this.seoIntelligence.failurePatterns.set(failureKey, count + 1);
              }
            });
          }
          
        } catch (parseError) {
          console.error('Error parsing SEO history data:', parseError);
        }
      }
    });
    
    console.log(`🧠 Processed SEO intelligence: ${this.seoIntelligence.successPatterns.size} success patterns, ${this.seoIntelligence.failurePatterns.size} failure patterns`);
  }

  async testDataForSEOConnection() {
    try {
      if (this.mcpConnections && this.mcpConnections.dataforseo) {
        console.log('📡 DataForSEO MCP connection available for advanced SEO analysis');
      } else {
        console.log('⚠️  DataForSEO MCP not available - using basic SEO validation');
      }
    } catch (error) {
      console.error('Error testing DataForSEO connection:', error);
    }
  }

  async validateQuality(task, data) {
    console.log(`📈 SEO quality validation starting for task: ${task.type}`);
    
    const startTime = Date.now();
    
    try {
      // Extract SEO-relevant data
      const seoData = this.extractSEOData(data, task);
      if (!seoData.content) {
        throw new Error('No content found for SEO quality validation');
      }
      
      // Perform comprehensive SEO analysis
      const seoBreakdown = await this.performSEOAnalysis(seoData, task);
      
      // Calculate overall SEO quality score
      const overallScore = this.calculateSEOScore(seoBreakdown);
      
      // Determine pass/fail based on SEO thresholds
      const passed = this.determineSEOPassFail(seoBreakdown);
      
      // Generate SEO improvement recommendations
      const recommendations = this.generateSEORecommendations(seoBreakdown, passed);
      
      // Create SEO quality result
      const seoQualityResult = {
        passed,
        score: overallScore,
        breakdown: seoBreakdown,
        recommendations,
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        validationType: 'seo-quality',
        processingTime: Date.now() - startTime,
        seoFactors: this.identifySEOFactors(seoBreakdown),
        competitiveAnalysis: await this.performCompetitiveAnalysis(seoData, task)
      };
      
      // Update metrics and intelligence
      this.updateSEOMetrics(seoQualityResult);
      await this.updateSEOIntelligence(seoQualityResult, seoData);
      
      // Store result in crystalline memory
      await this.storeSEOQualityResult(seoQualityResult);
      
      console.log(`${passed ? '✅' : '❌'} SEO quality validation completed: ${overallScore}% (${passed ? 'PASSED' : 'FAILED'})`);
      
      return seoQualityResult;
      
    } catch (error) {
      console.error(`❌ SEO quality validation failed:`, error);
      
      return {
        passed: false,
        score: 0,
        error: error.message,
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        validationType: 'seo-quality',
        processingTime: Date.now() - startTime
      };
    }
  }

  extractSEOData(data, task) {
    const seoData = {
      content: '',
      title: '',
      description: '',
      keywords: [],
      url: '',
      headings: [],
      images: [],
      links: []
    };
    
    // Extract content
    if (typeof data === 'string') {
      seoData.content = data;
    } else if (data && typeof data === 'object') {
      seoData.content = data.content || data.text || data.body || '';
      seoData.title = data.title || task.data?.title || '';
      seoData.description = data.description || task.data?.description || '';
      seoData.url = data.url || task.data?.url || '';
      
      // Extract keywords
      if (data.keywords) {
        seoData.keywords = Array.isArray(data.keywords) ? data.keywords : [data.keywords];
      } else if (task.data?.keywords) {
        seoData.keywords = Array.isArray(task.data.keywords) ? task.data.keywords : [task.data.keywords];
      }
    }
    
    return seoData;
  }

  async performSEOAnalysis(seoData, task) {
    const analysis = {
      technicalCompliance: await this.analyzeTechnicalSEO(seoData, task),
      keywordOptimization: this.analyzeKeywordOptimization(seoData),
      serpReadiness: this.analyzeSERPReadiness(seoData),
      contentRelevance: this.analyzeContentRelevance(seoData),
      linkOptimization: this.analyzeLinkOptimization(seoData)
    };
    
    // Add detailed SEO metrics
    analysis.seoMetrics = {
      titleLength: seoData.title.length,
      descriptionLength: seoData.description.length,
      contentLength: seoData.content.length,
      headingCount: this.countHeadings(seoData.content),
      keywordCount: seoData.keywords.length,
      internalLinkCount: this.countInternalLinks(seoData.content),
      externalLinkCount: this.countExternalLinks(seoData.content)
    };
    
    return analysis;
  }

  async analyzeTechnicalSEO(seoData, task) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    // Title tag analysis
    if (!seoData.title) {
      score -= 25;
      issues.push('Missing title tag');
      recommendations.push('Add SEO-optimized title tag');
    } else {
      const titleLength = seoData.title.length;
      if (titleLength < this.seoStandards.titleLength.min) {
        score -= 15;
        issues.push(`Title too short: ${titleLength} characters (min: ${this.seoStandards.titleLength.min})`);
        recommendations.push('Expand title to include more descriptive keywords');
      } else if (titleLength > this.seoStandards.titleLength.max) {
        score -= 10;
        issues.push(`Title too long: ${titleLength} characters (max: ${this.seoStandards.titleLength.max})`);
        recommendations.push('Shorten title to prevent truncation in search results');
      }
    }
    
    // Meta description analysis
    if (!seoData.description) {
      score -= 20;
      issues.push('Missing meta description');
      recommendations.push('Add compelling meta description');
    } else {
      const descLength = seoData.description.length;
      if (descLength < this.seoStandards.descriptionLength.min) {
        score -= 12;
        issues.push(`Meta description too short: ${descLength} characters`);
        recommendations.push('Expand meta description to improve SERP click-through rate');
      } else if (descLength > this.seoStandards.descriptionLength.max) {
        score -= 8;
        issues.push(`Meta description too long: ${descLength} characters`);
        recommendations.push('Shorten meta description to prevent truncation');
      }
    }
    
    // Heading structure analysis
    const headings = this.extractHeadings(seoData.content);
    if (headings.h1.length !== 1) {
      score -= 15;
      issues.push(`Incorrect H1 count: ${headings.h1.length} (should be exactly 1)`);
      recommendations.push('Use exactly one H1 heading per page');
    }
    
    if (headings.h2.length < 2 && seoData.content.length > 800) {
      score -= 10;
      issues.push('Insufficient H2 headings for content structure');
      recommendations.push('Add more H2 headings to improve content organization');
    }
    
    // URL analysis (if provided)
    if (seoData.url) {
      if (seoData.url.length > this.seoStandards.urlLength.max) {
        score -= 8;
        issues.push(`URL too long: ${seoData.url.length} characters`);
        recommendations.push('Shorten URL for better user experience and crawling');
      }
      
      // Check for SEO-friendly URL structure
      if (seoData.url.includes('?') || seoData.url.includes('&')) {
        score -= 5;
        issues.push('URL contains parameters - may not be SEO-friendly');
        recommendations.push('Use clean, descriptive URLs without parameters');
      }
    }
    
    // Image optimization analysis
    const imageAnalysis = this.analyzeImageSEO(seoData.content);
    if (imageAnalysis.totalImages > 0 && imageAnalysis.missingAltTags > 0) {
      const altTagCoverage = ((imageAnalysis.totalImages - imageAnalysis.missingAltTags) / imageAnalysis.totalImages) * 100;
      if (altTagCoverage < this.seoStandards.imageAltTags.coverage) {
        score -= 12;
        issues.push(`${imageAnalysis.missingAltTags} images missing alt tags`);
        recommendations.push('Add descriptive alt tags to all images');
      }
    }
    
    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      headingAnalysis: headings,
      imageAnalysis,
      urlAnalysis: seoData.url ? this.analyzeURL(seoData.url) : null
    };
  }

  analyzeKeywordOptimization(seoData) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    if (seoData.keywords.length === 0) {
      return {
        score: 60,
        issues: ['No target keywords specified'],
        recommendations: ['Define target keywords for optimization'],
        keywordAnalysis: {}
      };
    }
    
    const contentLower = seoData.content.toLowerCase();
    const titleLower = seoData.title.toLowerCase();
    const wordCount = this.countWords(seoData.content);
    
    const keywordAnalysis = {};
    
    seoData.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Keyword density analysis
      const keywordCount = (contentLower.split(keywordLower).length - 1);
      const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
      
      // Keyword placement analysis
      const inTitle = titleLower.includes(keywordLower);
      const inDescription = seoData.description.toLowerCase().includes(keywordLower);
      const inHeadings = this.isKeywordInHeadings(seoData.content, keywordLower);
      const firstParagraph = this.isKeywordInFirstParagraph(seoData.content, keywordLower);
      
      keywordAnalysis[keyword] = {
        count: keywordCount,
        density: density.toFixed(2),
        placement: {
          inTitle,
          inDescription,
          inHeadings,
          firstParagraph
        },
        optimization: this.calculateKeywordOptimization(density, inTitle, inHeadings, firstParagraph)
      };
      
      // Density scoring
      if (density < this.seoStandards.keywordDensity.min) {
        score -= 12;
        issues.push(`Low keyword density for "${keyword}": ${density.toFixed(2)}%`);
        recommendations.push(`Increase usage of "${keyword}" naturally throughout content`);
      } else if (density > this.seoStandards.keywordDensity.max) {
        score -= 18;
        issues.push(`Keyword over-optimization for "${keyword}": ${density.toFixed(2)}%`);
        recommendations.push(`Reduce keyword density for "${keyword}" to avoid penalties`);
      }
      
      // Placement scoring
      let placementScore = 100;
      if (!inTitle) {
        placementScore -= 30;
        recommendations.push(`Include "${keyword}" in title tag`);
      }
      if (!inHeadings) {
        placementScore -= 20;
        recommendations.push(`Include "${keyword}" in heading tags`);
      }
      if (!firstParagraph) {
        placementScore -= 15;
        recommendations.push(`Include "${keyword}" in first paragraph`);
      }
      
      if (placementScore < 70) {
        score -= 15;
        issues.push(`Poor keyword placement for "${keyword}"`);
      }
    });
    
    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      keywordAnalysis
    };
  }

  analyzeSERPReadiness(seoData) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    // Title tag SERP optimization
    if (seoData.title) {
      // Check for compelling title elements
      const titleWords = seoData.title.toLowerCase().split(' ');
      const powerWords = ['best', 'ultimate', 'complete', 'guide', 'tips', 'how', 'why', 'what'];
      const hasPowerWords = powerWords.some(word => titleWords.includes(word));
      
      if (!hasPowerWords && seoData.title.length > 40) {
        score -= 8;
        issues.push('Title lacks compelling power words for SERP CTR');
        recommendations.push('Add engaging power words to improve click-through rate');
      }
      
      // Check for year/current information
      const currentYear = new Date().getFullYear();
      const hasCurrentYear = seoData.title.includes(currentYear.toString());
      if (!hasCurrentYear && seoData.content.length > 1000) {
        score -= 5;
        issues.push('Title lacks current year for freshness signals');
        recommendations.push(`Consider adding ${currentYear} to title for freshness`);
      }
    }
    
    // Meta description SERP optimization
    if (seoData.description) {
      // Check for call-to-action
      const ctaWords = ['learn', 'discover', 'find', 'get', 'see', 'explore', 'read'];
      const hasCallToAction = ctaWords.some(word => 
        seoData.description.toLowerCase().includes(word)
      );
      
      if (!hasCallToAction) {
        score -= 10;
        issues.push('Meta description lacks call-to-action');
        recommendations.push('Add compelling call-to-action to meta description');
      }
      
      // Check for keyword inclusion
      if (seoData.keywords.length > 0) {
        const keywordInDesc = seoData.keywords.some(keyword =>
          seoData.description.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (!keywordInDesc) {
          score -= 12;
          issues.push('Target keyword not found in meta description');
          recommendations.push('Include primary keyword in meta description');
        }
      }
    }
    
    // Rich snippet opportunities
    const richSnippetScore = this.analyzeRichSnippetPotential(seoData);
    if (richSnippetScore < 70) {
      score -= 15;
      issues.push('Limited rich snippet optimization');
      recommendations.push('Add structured data markup for rich snippets');
    }
    
    // FAQ/featured snippet potential
    const faqPotential = this.analyzeFAQPotential(seoData.content);
    if (faqPotential.score < 50 && seoData.content.length > 800) {
      score -= 8;
      issues.push('Limited FAQ/featured snippet optimization');
      recommendations.push('Add FAQ section or improve question-answer format');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      richSnippetAnalysis: richSnippetScore,
      faqAnalysis: faqPotential
    };
  }

  analyzeContentRelevance(seoData) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    // Content length analysis
    const wordCount = this.countWords(seoData.content);
    if (wordCount < 300) {
      score -= 20;
      issues.push(`Content too short: ${wordCount} words (min recommended: 300)`);
      recommendations.push('Expand content to provide more value and depth');
    } else if (wordCount < 800 && seoData.keywords.length > 2) {
      score -= 10;
      issues.push('Content length may be insufficient for competitive keywords');
      recommendations.push('Consider expanding content for better topical coverage');
    }
    
    // Semantic relevance (simplified)
    if (seoData.keywords.length > 0) {
      const semanticScore = this.analyzeSemanticRelevance(seoData.content, seoData.keywords);
      if (semanticScore < 70) {
        score -= 15;
        issues.push('Content may lack semantic relevance to target keywords');
        recommendations.push('Improve content relevance with related terms and topics');
      }
    }
    
    // Content freshness indicators
    const freshnessScore = this.analyzeFreshnessIndicators(seoData.content);
    if (freshnessScore < 60) {
      score -= 8;
      issues.push('Content lacks freshness indicators');
      recommendations.push('Add current dates, recent statistics, or updated information');
    }
    
    // Expertise, Authoritativeness, Trustworthiness (E-A-T)
    const eatScore = this.analyzeEAT(seoData);
    if (eatScore < 70) {
      score -= 12;
      issues.push('Content may lack E-A-T signals');
      recommendations.push('Add author bio, credentials, citations, and authoritative sources');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      metrics: {
        wordCount,
        semanticRelevance: this.analyzeSemanticRelevance(seoData.content, seoData.keywords),
        freshnessScore,
        eatScore
      }
    };
  }

  analyzeLinkOptimization(seoData) {
    let score = 100;
    const issues = [];
    const recommendations = [];
    
    const internalLinkCount = this.countInternalLinks(seoData.content);
    const externalLinkCount = this.countExternalLinks(seoData.content);
    const totalLinks = internalLinkCount + externalLinkCount;
    
    // Internal linking analysis
    if (internalLinkCount < this.seoStandards.internalLinks.min && seoData.content.length > 800) {
      score -= 15;
      issues.push(`Insufficient internal links: ${internalLinkCount} (min recommended: ${this.seoStandards.internalLinks.min})`);
      recommendations.push('Add relevant internal links to improve site architecture');
    } else if (internalLinkCount > this.seoStandards.internalLinks.max) {
      score -= 8;
      issues.push(`Too many internal links: ${internalLinkCount} (max recommended: ${this.seoStandards.internalLinks.max})`);
      recommendations.push('Reduce internal links to maintain link equity');
    }
    
    // External linking analysis
    if (externalLinkCount === 0 && seoData.content.length > 1000) {
      score -= 10;
      issues.push('No external links to authoritative sources');
      recommendations.push('Add links to high-authority external sources');
    } else if (externalLinkCount > 5) {
      score -= 5;
      issues.push(`High external link count: ${externalLinkCount}`);
      recommendations.push('Review external links for quality and relevance');
    }
    
    // Link anchor text analysis (simplified)
    const anchorTextAnalysis = this.analyzeAnchorText(seoData.content);
    if (anchorTextAnalysis.keywordRichRatio > 0.3) {
      score -= 12;
      issues.push('High keyword-rich anchor text ratio may appear manipulative');
      recommendations.push('Vary anchor text with natural, descriptive phrases');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      recommendations,
      linkMetrics: {
        internalLinks: internalLinkCount,
        externalLinks: externalLinkCount,
        totalLinks,
        anchorTextAnalysis
      }
    };
  }

  // Helper methods for advanced SEO analysis
  
  calculateKeywordOptimization(density, inTitle, inHeadings, firstParagraph) {
    let score = 0;
    
    // Density scoring
    if (density >= 0.5 && density <= 2.5) score += 30;
    else if (density >= 0.3 && density <= 3.0) score += 20;
    else score += 10;
    
    // Placement scoring
    if (inTitle) score += 25;
    if (inHeadings) score += 20;
    if (firstParagraph) score += 15;
    
    return Math.min(100, score);
  }

  analyzeImageSEO(content) {
    // Simplified image analysis
    const imageMatches = content.match(/!\[.*?\]\(.*?\)/g) || [];
    const altTagMatches = content.match(/!\[(.+?)\]/g) || [];
    
    return {
      totalImages: imageMatches.length,
      withAltTags: altTagMatches.filter(match => match.length > 4).length,
      missingAltTags: Math.max(0, imageMatches.length - altTagMatches.filter(match => match.length > 4).length)
    };
  }

  analyzeURL(url) {
    return {
      length: url.length,
      hasParameters: url.includes('?') || url.includes('&'),
      hasHyphens: url.includes('-'),
      hasUnderscores: url.includes('_'),
      pathDepth: url.split('/').length - 3 // Subtract protocol and domain parts
    };
  }

  analyzeRichSnippetPotential(seoData) {
    let score = 50; // Base score
    
    // Check for structured content patterns
    if (seoData.content.includes('FAQ') || seoData.content.includes('Q:') || seoData.content.includes('A:')) {
      score += 20;
    }
    
    if (seoData.content.includes('Step') || seoData.content.includes('1.') || seoData.content.includes('2.')) {
      score += 15;
    }
    
    if (seoData.content.includes('review') || seoData.content.includes('rating') || seoData.content.includes('stars')) {
      score += 15;
    }
    
    return Math.min(100, score);
  }

  analyzeFAQPotential(content) {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const questionCount = questionWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);
    
    const sentences = this.countSentences(content);
    const questionRatio = sentences > 0 ? (questionCount / sentences) * 100 : 0;
    
    return {
      score: Math.min(100, questionRatio * 5), // Scale up the ratio
      questionCount,
      questionRatio: questionRatio.toFixed(2)
    };
  }

  analyzeSemanticRelevance(content, keywords) {
    if (keywords.length === 0) return 50;
    
    const contentLower = content.toLowerCase();
    let relevanceScore = 0;
    
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const words = keywordLower.split(' ');
      
      // Check for exact keyword matches
      const exactMatches = (contentLower.split(keywordLower).length - 1);
      relevanceScore += exactMatches * 10;
      
      // Check for partial matches
      words.forEach(word => {
        if (word.length > 3) { // Skip short words
          const partialMatches = (contentLower.split(word).length - 1);
          relevanceScore += partialMatches * 2;
        }
      });
    });
    
    return Math.min(100, relevanceScore);
  }

  analyzeFreshnessIndicators(content) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    let score = 50; // Base score
    
    if (content.includes(currentYear.toString())) score += 25;
    if (content.includes(lastYear.toString())) score += 15;
    
    const freshnessWords = ['latest', 'new', 'updated', 'recent', 'current', '2024', '2025'];
    const freshnessCount = freshnessWords.reduce((count, word) => {
      return count + (content.toLowerCase().split(word).length - 1);
    }, 0);
    
    score += Math.min(25, freshnessCount * 5);
    
    return Math.min(100, score);
  }

  analyzeEAT(seoData) {
    let score = 50; // Base score
    
    // Expertise indicators
    const expertiseWords = ['expert', 'professional', 'certified', 'qualified', 'experience', 'specialist'];
    const expertiseCount = expertiseWords.reduce((count, word) => {
      return count + (seoData.content.toLowerCase().split(word).length - 1);
    }, 0);
    
    score += Math.min(20, expertiseCount * 3);
    
    // Authority indicators
    const authorityWords = ['published', 'research', 'study', 'university', 'institute', 'award'];
    const authorityCount = authorityWords.reduce((count, word) => {
      return count + (seoData.content.toLowerCase().split(word).length - 1);
    }, 0);
    
    score += Math.min(15, authorityCount * 3);
    
    // Trust indicators
    const trustWords = ['guarantee', 'secure', 'privacy', 'testimonial', 'review', 'verified'];
    const trustCount = trustWords.reduce((count, word) => {
      return count + (seoData.content.toLowerCase().split(word).length - 1);
    }, 0);
    
    score += Math.min(15, trustCount * 3);
    
    return Math.min(100, score);
  }

  analyzeAnchorText(content) {
    // Simplified anchor text analysis
    const linkMatches = content.match(/\[([^\]]+)\]/g) || [];
    const totalLinks = linkMatches.length;
    
    if (totalLinks === 0) {
      return { keywordRichRatio: 0, totalLinks: 0 };
    }
    
    let keywordRichCount = 0;
    const keywordIndicators = ['click', 'here', 'read', 'more', 'best', 'top', 'guide'];
    
    linkMatches.forEach(link => {
      const anchorText = link.replace(/[\[\]]/g, '').toLowerCase();
      if (keywordIndicators.some(indicator => anchorText.includes(indicator))) {
        keywordRichCount++;
      }
    });
    
    return {
      keywordRichRatio: keywordRichCount / totalLinks,
      totalLinks,
      keywordRichCount
    };
  }

  async performCompetitiveAnalysis(seoData, task) {
    // Placeholder for competitive analysis using DataForSEO
    // This would involve SERP analysis and competitor comparison
    
    return {
      competitiveStrength: 'medium',
      marketPosition: 'developing',
      improvementPotential: 'high',
      note: 'Competitive analysis requires DataForSEO integration'
    };
  }

  identifySEOFactors(breakdown) {
    const factors = [];
    
    Object.keys(breakdown).forEach(category => {
      if (breakdown[category].score) {
        factors.push({
          category,
          score: breakdown[category].score,
          impact: this.calculateSEOImpact(category, breakdown[category].score),
          priority: breakdown[category].score < 80 ? 'high' : 'medium'
        });
      }
    });
    
    return factors.sort((a, b) => a.score - b.score); // Lowest scores first (highest priority)
  }

  calculateSEOImpact(category, score) {
    const impactWeights = {
      technicalCompliance: 0.30,
      keywordOptimization: 0.25,
      serpReadiness: 0.20,
      contentRelevance: 0.15,
      linkOptimization: 0.10
    };
    
    const weight = impactWeights[category] || 0.1;
    const deficit = Math.max(0, 95 - score); // Target score of 95
    
    return Math.round(deficit * weight);
  }

  calculateSEOScore(breakdown) {
    let weightedScore = 0;
    
    Object.keys(this.seoWeights).forEach(metric => {
      if (breakdown[metric] && typeof breakdown[metric].score === 'number') {
        weightedScore += breakdown[metric].score * this.seoWeights[metric];
      }
    });
    
    return Math.round(weightedScore);
  }

  determineSEOPassFail(breakdown) {
    // Check critical SEO thresholds
    if (breakdown.technicalCompliance.score < this.seoThresholds.technicalCompliance.min) {
      return false;
    }
    
    if (breakdown.keywordOptimization.score < this.seoThresholds.keywordOptimization.min) {
      return false;
    }
    
    if (breakdown.serpReadiness.score < this.seoThresholds.serpReadiness.min) {
      return false;
    }
    
    // Calculate overall pass based on weighted score
    const overallScore = this.calculateSEOScore(breakdown);
    return overallScore >= 80; // Minimum SEO passing score
  }

  generateSEORecommendations(breakdown, passed) {
    const recommendations = [];
    
    // Aggregate all recommendations from analysis
    Object.keys(breakdown).forEach(category => {
      if (breakdown[category].recommendations) {
        breakdown[category].recommendations.forEach(rec => {
          recommendations.push({
            category,
            priority: this.getSEORecommendationPriority(category, breakdown[category].score),
            recommendation: rec
          });
        });
      }
    });
    
    // Add strategic SEO recommendations
    if (!passed) {
      recommendations.unshift({
        category: 'strategic',
        priority: 'critical',
        recommendation: 'Focus on technical SEO compliance and keyword optimization first'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  getSEORecommendationPriority(category, score) {
    if (score < 70) return 'critical';
    if (score < 80) return 'high';
    if (score < 90) return 'medium';
    return 'low';
  }

  // Utility methods (reused from content validator with SEO focus)
  countWords(content) {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  countSentences(content) {
    return content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  extractHeadings(content) {
    const headings = { h1: [], h2: [], h3: [], h4: [] };
    
    const h1Matches = content.match(/^#\s+(.+)$/gm) || [];
    const h2Matches = content.match(/^##\s+(.+)$/gm) || [];
    const h3Matches = content.match(/^###\s+(.+)$/gm) || [];
    const h4Matches = content.match(/^####\s+(.+)$/gm) || [];
    
    headings.h1 = h1Matches.map(match => match.replace(/^#\s+/, ''));
    headings.h2 = h2Matches.map(match => match.replace(/^##\s+/, ''));
    headings.h3 = h3Matches.map(match => match.replace(/^###\s+/, ''));
    headings.h4 = h4Matches.map(match => match.replace(/^####\s+/, ''));
    
    return headings;
  }

  countHeadings(content) {
    const headings = this.extractHeadings(content);
    return headings.h1.length + headings.h2.length + headings.h3.length + headings.h4.length;
  }

  countInternalLinks(content) {
    const linkMatches = content.match(/\[.*?\]\(.*?\)/g) || [];
    return linkMatches.filter(link => !link.includes('http')).length;
  }

  countExternalLinks(content) {
    const linkMatches = content.match(/\[.*?\]\(.*?\)/g) || [];
    return linkMatches.filter(link => link.includes('http')).length;
  }

  isKeywordInHeadings(content, keyword) {
    const headings = this.extractHeadings(content);
    const allHeadings = [
      ...headings.h1,
      ...headings.h2,
      ...headings.h3,
      ...headings.h4
    ].join(' ').toLowerCase();
    
    return allHeadings.includes(keyword);
  }

  isKeywordInFirstParagraph(content, keyword) {
    const paragraphs = content.split(/\n\s*\n/);
    if (paragraphs.length > 0) {
      return paragraphs[0].toLowerCase().includes(keyword);
    }
    return false;
  }

  updateSEOMetrics(seoQualityResult) {
    this.metrics.totalSEOValidations++;
    
    if (seoQualityResult.passed) {
      this.metrics.passedValidations++;
    }
    
    // Update moving average
    const alpha = 0.1;
    this.metrics.averageSEOScore = alpha * seoQualityResult.score + (1 - alpha) * this.metrics.averageSEOScore;
    
    // Count issues found
    if (seoQualityResult.breakdown) {
      Object.values(seoQualityResult.breakdown).forEach(analysis => {
        if (analysis.issues) {
          if (analysis.issues.some(issue => issue.includes('technical') || issue.includes('meta') || issue.includes('title'))) {
            this.metrics.technicalIssuesFound++;
          }
          if (analysis.issues.some(issue => issue.includes('keyword') || issue.includes('density'))) {
            this.metrics.keywordIssuesFound++;
          }
        }
      });
    }
    
    this.metrics.lastActivity = Date.now();
  }

  async updateSEOIntelligence(seoQualityResult, seoData) {
    try {
      // Update success patterns
      if (seoQualityResult.passed && seoQualityResult.score > 90) {
        const successKey = `high_seo_${seoData.keywords.length > 0 ? 'optimized' : 'basic'}`;
        const count = this.seoIntelligence.successPatterns.get(successKey) || 0;
        this.seoIntelligence.successPatterns.set(successKey, count + 1);
      }
      
      // Update failure patterns
      if (!seoQualityResult.passed) {
        const mainIssues = this.extractMainIssues(seoQualityResult.breakdown);
        mainIssues.forEach(issue => {
          const count = this.seoIntelligence.failurePatterns.get(issue) || 0;
          this.seoIntelligence.failurePatterns.set(issue, count + 1);
        });
      }
      
    } catch (error) {
      console.error('Error updating SEO intelligence:', error);
    }
  }

  extractMainIssues(breakdown) {
    const issues = [];
    
    Object.keys(breakdown).forEach(category => {
      if (breakdown[category].score < 80) {
        issues.push(`${category}_low_score`);
      }
      
      if (breakdown[category].issues && breakdown[category].issues.length > 0) {
        issues.push(`${category}_has_issues`);
      }
    });
    
    return issues;
  }

  async storeSEOQualityResult(seoQualityResult) {
    try {
      await this.crystallineMemory.storeMemory(
        'quality-control',
        JSON.stringify(seoQualityResult),
        {
          importance: seoQualityResult.score / 100,
          lastAccess: Date.now(),
          accessCount: 1,
          qualityType: 'seo-quality',
          passed: seoQualityResult.passed,
          agentId: this.agentId,
          semantic_tags: ['seo-validation', 'quality-control', 'technical-seo', this.agentId]
        }
      );
      
    } catch (error) {
      console.error('Error storing SEO quality result in crystalline memory:', error);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      seoIntelligence: {
        successPatterns: this.seoIntelligence.successPatterns.size,
        failurePatterns: this.seoIntelligence.failurePatterns.size,
        competitorInsights: this.seoIntelligence.competitorInsights.size,
        rankingFactors: this.seoIntelligence.rankingFactors.size
      }
    };
  }

  async shutdown() {
    console.log(`🛑 Shutting down ${this.name}...`);
    // Clean up resources
    this.seoIntelligence.successPatterns.clear();
    this.seoIntelligence.failurePatterns.clear();
    this.seoIntelligence.competitorInsights.clear();
    this.seoIntelligence.rankingFactors.clear();
  }
}

module.exports = SEOQualityValidator;