const EventEmitter = require('events');

/**
 * Content Quality Validator Agent
 * 
 * Specialized quality validation for all content types including:
 * - SEO compliance checking (keyword density, structure)
 * - Readability scoring and engagement optimization
 * - Content structure validation (H1-H6 hierarchy)
 * - Brand consistency and style guide compliance
 * - Internal linking and cross-reference validation
 * 
 * Integrates with crystalline memory for continuous learning
 */
class ContentQualityValidator extends EventEmitter {
  constructor(crystallineMemory, qualityConfig) {
    super();
    
    this.agentId = 'content-quality-validator';
    this.name = 'Content Quality Validator';
    this.specialization = 'content-quality-validation';
    this.crystallineMemory = crystallineMemory;
    this.config = qualityConfig;
    
    // Quality scoring weights
    this.qualityWeights = {
      seoCompliance: 0.25,        // 25% - SEO optimization
      readabilityScore: 0.20,     // 20% - Content readability
      structureCompliance: 0.20,  // 20% - Heading/content structure
      keywordOptimization: 0.15,  // 15% - Keyword usage and density
      brandConsistency: 0.10,     // 10% - Style and brand alignment
      technicalCompliance: 0.10   // 10% - Technical content requirements
    };
    
    // Quality thresholds from config
    this.thresholds = qualityConfig.qualityMetrics || {
      seoCompliance: { min: 85, target: 95 },
      readabilityScore: { min: 70, target: 85 },
      structureCompliance: { min: 90, target: 100 }
    };
    
    // Learning data for quality improvements
    this.learningData = {
      commonIssues: new Map(),
      improvementPatterns: new Map(),
      successFactors: new Map()
    };
    
    // Performance metrics
    this.metrics = {
      totalValidations: 0,
      passedValidations: 0,
      averageScore: 0,
      improvementRate: 0,
      lastActivity: Date.now()
    };
    
    this.initialize();
  }

  async initialize() {
    console.log(`📋 Initializing ${this.name}...`);
    
    // Load quality learning data from crystalline memory
    await this.loadQualityIntelligence();
    
    console.log(`✅ ${this.name} initialized and ready`);
  }

  async loadQualityIntelligence() {
    try {
      // Query crystalline memory for content quality patterns
      const qualityHistory = await this.crystallineMemory.retrieveMemory(
        'content quality patterns',
        'quality-control',
        10
      );
      
      if (qualityHistory.results.length > 0) {
        console.log(`📊 Loaded ${qualityHistory.results.length} quality intelligence patterns`);
        
        // Process historical quality data to improve scoring
        this.processQualityHistory(qualityHistory.results);
      }
      
    } catch (error) {
      console.error('Error loading quality intelligence:', error);
    }
  }

  processQualityHistory(historyResults) {
    // Process historical quality data to identify patterns
    historyResults.forEach(result => {
      if (result.metadata && result.metadata.qualityType === 'content-quality') {
        try {
          const qualityData = JSON.parse(result.content);
          
          // Track common issues
          if (!qualityData.passed && qualityData.breakdown) {
            Object.keys(qualityData.breakdown).forEach(metric => {
              if (qualityData.breakdown[metric] < 75) {
                const count = this.learningData.commonIssues.get(metric) || 0;
                this.learningData.commonIssues.set(metric, count + 1);
              }
            });
          }
          
          // Track success factors
          if (qualityData.passed && qualityData.score > 90) {
            const successKey = `high_quality_${qualityData.validationType}`;
            const count = this.learningData.successFactors.get(successKey) || 0;
            this.learningData.successFactors.set(successKey, count + 1);
          }
          
        } catch (parseError) {
          console.error('Error parsing quality history data:', parseError);
        }
      }
    });
    
    console.log(`🧠 Processed quality intelligence: ${this.learningData.commonIssues.size} issue patterns, ${this.learningData.successFactors.size} success patterns`);
  }

  async validateQuality(task, data) {
    console.log(`🔍 Content quality validation starting for task: ${task.type}`);
    
    const startTime = Date.now();
    
    try {
      // Extract content for analysis
      const content = this.extractContent(data);
      if (!content) {
        throw new Error('No content found for quality validation');
      }
      
      // Perform comprehensive quality analysis
      const qualityBreakdown = await this.performQualityAnalysis(content, task);
      
      // Calculate overall quality score
      const overallScore = this.calculateOverallScore(qualityBreakdown);
      
      // Determine pass/fail based on thresholds
      const passed = this.determinePassFail(qualityBreakdown);
      
      // Generate improvement recommendations
      const recommendations = this.generateRecommendations(qualityBreakdown, passed);
      
      // Create quality result
      const qualityResult = {
        passed,
        score: overallScore,
        breakdown: qualityBreakdown,
        recommendations,
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        validationType: 'content-quality',
        processingTime: Date.now() - startTime,
        contentLength: content.length,
        contentType: this.identifyContentType(content)
      };
      
      // Update metrics and learning data
      this.updateMetrics(qualityResult);
      await this.updateLearningData(qualityResult, content);
      
      // Store quality result in crystalline memory
      await this.storeQualityResult(qualityResult);
      
      console.log(`${passed ? '✅' : '❌'} Content quality validation completed: ${overallScore}% (${passed ? 'PASSED' : 'FAILED'})`);
      
      return qualityResult;
      
    } catch (error) {
      console.error(`❌ Content quality validation failed:`, error);
      
      return {
        passed: false,
        score: 0,
        error: error.message,
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        validationType: 'content-quality',
        processingTime: Date.now() - startTime
      };
    }
  }

  extractContent(data) {
    // Extract content from various data formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data && typeof data === 'object') {
      // Try common content fields
      return data.content || data.text || data.body || data.description || 
             data.summary || JSON.stringify(data);
    }
    
    return null;
  }

  async performQualityAnalysis(content, task) {
    const analysis = {
      seoCompliance: await this.analyzeSEOCompliance(content, task),
      readabilityScore: this.analyzeReadability(content),
      structureCompliance: this.analyzeContentStructure(content),
      keywordOptimization: this.analyzeKeywordOptimization(content, task),
      brandConsistency: this.analyzeBrandConsistency(content),
      technicalCompliance: this.analyzeTechnicalCompliance(content)
    };
    
    // Add detailed analysis data
    analysis.wordCount = this.countWords(content);
    analysis.sentenceCount = this.countSentences(content);
    analysis.paragraphCount = this.countParagraphs(content);
    analysis.headingStructure = this.analyzeHeadingStructure(content);
    
    return analysis;
  }

  async analyzeSEOCompliance(content, task) {
    let score = 100;
    const issues = [];
    
    // Check meta title (if provided in task data)
    if (task.data && task.data.title) {
      const titleLength = task.data.title.length;
      if (titleLength < 30 || titleLength > 60) {
        score -= 15;
        issues.push(`Title length ${titleLength} characters (optimal: 30-60)`);
      }
    }
    
    // Check meta description (if provided)
    if (task.data && task.data.description) {
      const descLength = task.data.description.length;
      if (descLength < 120 || descLength > 160) {
        score -= 10;
        issues.push(`Meta description length ${descLength} characters (optimal: 120-160)`);
      }
    }
    
    // Check heading hierarchy
    const headings = this.extractHeadings(content);
    if (!headings.h1 || headings.h1.length === 0) {
      score -= 20;
      issues.push('Missing H1 heading');
    }
    
    if (!headings.h2 || headings.h2.length < 2) {
      score -= 10;
      issues.push('Insufficient H2 headings for content structure');
    }
    
    // Check internal links (basic implementation)
    const internalLinks = this.countInternalLinks(content);
    if (internalLinks === 0 && content.length > 500) {
      score -= 10;
      issues.push('No internal links found in long-form content');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      headingAnalysis: headings,
      internalLinkCount: internalLinks
    };
  }

  analyzeReadability(content) {
    // Simplified readability analysis
    const words = this.countWords(content);
    const sentences = this.countSentences(content);
    const paragraphs = this.countParagraphs(content);
    
    if (words === 0 || sentences === 0) {
      return { score: 0, issues: ['No readable content found'] };
    }
    
    const avgWordsPerSentence = words / sentences;
    const avgSentencesPerParagraph = sentences / Math.max(paragraphs, 1);
    
    let score = 100;
    const issues = [];
    
    // Check average sentence length
    if (avgWordsPerSentence > 20) {
      score -= 15;
      issues.push(`Long sentences detected (avg: ${avgWordsPerSentence.toFixed(1)} words/sentence)`);
    }
    
    // Check paragraph length
    if (avgSentencesPerParagraph > 5) {
      score -= 10;
      issues.push(`Long paragraphs detected (avg: ${avgSentencesPerParagraph.toFixed(1)} sentences/paragraph)`);
    }
    
    // Check for transition words (simplified)
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 'consequently'];
    const transitionCount = transitionWords.reduce((count, word) => {
      return count + (content.toLowerCase().split(word).length - 1);
    }, 0);
    
    const transitionRatio = transitionCount / sentences;
    if (transitionRatio < 0.1 && sentences > 5) {
      score -= 10;
      issues.push('Insufficient transition words for content flow');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSentencesPerParagraph: avgSentencesPerParagraph.toFixed(1),
      transitionWordRatio: transitionRatio.toFixed(3)
    };
  }

  analyzeContentStructure(content) {
    let score = 100;
    const issues = [];
    
    const headings = this.extractHeadings(content);
    
    // Check heading hierarchy
    if (headings.h1.length > 1) {
      score -= 15;
      issues.push(`Multiple H1 headings found (${headings.h1.length})`);
    }
    
    if (headings.h1.length === 0) {
      score -= 20;
      issues.push('No H1 heading found');
    }
    
    // Check for logical H2/H3 structure
    const totalSubheadings = headings.h2.length + headings.h3.length + headings.h4.length;
    const wordCount = this.countWords(content);
    
    if (wordCount > 800 && totalSubheadings < 3) {
      score -= 15;
      issues.push('Insufficient subheadings for content length');
    }
    
    // Check heading distribution
    if (headings.h3.length > 0 && headings.h2.length === 0) {
      score -= 10;
      issues.push('H3 headings without H2 parent structure');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      headingStructure: headings,
      headingDistribution: {
        h1: headings.h1.length,
        h2: headings.h2.length,
        h3: headings.h3.length,
        h4: headings.h4.length
      }
    };
  }

  analyzeKeywordOptimization(content, task) {
    let score = 100;
    const issues = [];
    
    // Extract target keywords from task data
    const targetKeywords = this.extractTargetKeywords(task);
    
    if (targetKeywords.length === 0) {
      return {
        score: 80,
        issues: ['No target keywords specified for optimization'],
        keywordAnalysis: {}
      };
    }
    
    const contentLower = content.toLowerCase();
    const wordCount = this.countWords(content);
    
    const keywordAnalysis = {};
    
    targetKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const keywordCount = (contentLower.split(keywordLower).length - 1);
      const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
      
      keywordAnalysis[keyword] = {
        count: keywordCount,
        density: density.toFixed(2),
        inTitle: task.data?.title?.toLowerCase().includes(keywordLower) || false,
        inHeadings: this.isKeywordInHeadings(content, keywordLower)
      };
      
      // Check keyword density (optimal: 0.5-2.5%)
      if (density < 0.5) {
        score -= 10;
        issues.push(`Low keyword density for "${keyword}" (${density.toFixed(2)}%)`);
      } else if (density > 3.0) {
        score -= 15;
        issues.push(`Keyword over-optimization for "${keyword}" (${density.toFixed(2)}%)`);
      }
      
      // Check keyword placement
      if (!keywordAnalysis[keyword].inTitle && !keywordAnalysis[keyword].inHeadings) {
        score -= 8;
        issues.push(`Keyword "${keyword}" not found in title or headings`);
      }
    });
    
    return {
      score: Math.max(0, score),
      issues,
      keywordAnalysis,
      targetKeywords
    };
  }

  analyzeBrandConsistency(content) {
    // Simplified brand consistency check
    let score = 100;
    const issues = [];
    
    // Check for consistent terminology (this would be more sophisticated in production)
    const brandTerms = ['brand', 'company', 'organization', 'business'];
    const inconsistentTerms = this.findInconsistentTerminology(content, brandTerms);
    
    if (inconsistentTerms.length > 0) {
      score -= 5 * inconsistentTerms.length;
      issues.push(`Inconsistent terminology: ${inconsistentTerms.join(', ')}`);
    }
    
    // Check tone consistency (simplified)
    const toneMarkers = {
      formal: ['furthermore', 'however', 'therefore', 'consequently'],
      informal: ['awesome', 'cool', 'great', 'super']
    };
    
    const formalCount = this.countTermOccurrences(content, toneMarkers.formal);
    const informalCount = this.countTermOccurrences(content, toneMarkers.informal);
    
    if (formalCount > 0 && informalCount > 0) {
      score -= 10;
      issues.push('Mixed formal and informal tone detected');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      toneAnalysis: {
        formal: formalCount,
        informal: informalCount
      }
    };
  }

  analyzeTechnicalCompliance(content) {
    let score = 100;
    const issues = [];
    
    // Check for image alt text references (simplified)
    const imageReferences = (content.match(/\[image\]|\[img\]|\[photo\]/gi) || []).length;
    const altTextReferences = (content.match(/alt[\s]*[:=]/gi) || []).length;
    
    if (imageReferences > altTextReferences) {
      score -= 15;
      issues.push(`${imageReferences - altTextReferences} images without alt text references`);
    }
    
    // Check for broken link patterns (simplified)
    const linkPatterns = content.match(/\[.*\]\(.*\)/g) || [];
    const brokenLinkPatterns = linkPatterns.filter(link => 
      link.includes('](')  && link.includes(')')
    ).length;
    
    if (brokenLinkPatterns === 0 && linkPatterns.length > 0) {
      // All links appear properly formatted
    } else if (brokenLinkPatterns > 0) {
      score -= 10;
      issues.push(`${brokenLinkPatterns} potentially malformed links detected`);
    }
    
    return {
      score: Math.max(0, score),
      issues,
      imageAnalysis: {
        totalImages: imageReferences,
        withAltText: altTextReferences
      },
      linkAnalysis: {
        totalLinks: linkPatterns.length,
        potentiallyBroken: brokenLinkPatterns
      }
    };
  }

  calculateOverallScore(breakdown) {
    let weightedScore = 0;
    
    Object.keys(this.qualityWeights).forEach(metric => {
      if (breakdown[metric] && typeof breakdown[metric].score === 'number') {
        weightedScore += breakdown[metric].score * this.qualityWeights[metric];
      }
    });
    
    return Math.round(weightedScore);
  }

  determinePassFail(breakdown) {
    // Check critical thresholds
    if (breakdown.seoCompliance.score < this.thresholds.seoCompliance.min) {
      return false;
    }
    
    if (breakdown.readabilityScore.score < this.thresholds.readabilityScore.min) {
      return false;
    }
    
    if (breakdown.structureCompliance.score < this.thresholds.structureCompliance.min) {
      return false;
    }
    
    // Calculate overall pass based on weighted score
    const overallScore = this.calculateOverallScore(breakdown);
    return overallScore >= 75; // Minimum passing score
  }

  generateRecommendations(breakdown, passed) {
    const recommendations = [];
    
    // Generate specific recommendations based on quality issues
    Object.keys(breakdown).forEach(metric => {
      if (breakdown[metric].issues && breakdown[metric].issues.length > 0) {
        breakdown[metric].issues.forEach(issue => {
          recommendations.push({
            category: metric,
            priority: this.getIssuePriority(metric, breakdown[metric].score),
            issue,
            suggestion: this.generateImprovementSuggestion(metric, issue)
          });
        });
      }
    });
    
    // Add general recommendations based on learning data
    if (!passed) {
      recommendations.push({
        category: 'general',
        priority: 'high',
        issue: 'Overall quality below threshold',
        suggestion: 'Review and address high-priority recommendations above'
      });
    }
    
    return recommendations;
  }

  getIssuePriority(metric, score) {
    if (score < 70) return 'high';
    if (score < 85) return 'medium';
    return 'low';
  }

  generateImprovementSuggestion(metric, issue) {
    const suggestions = {
      'seoCompliance': 'Optimize heading structure and keyword placement',
      'readabilityScore': 'Simplify sentence structure and improve flow',
      'structureCompliance': 'Reorganize content with proper heading hierarchy',
      'keywordOptimization': 'Adjust keyword density and strategic placement',
      'brandConsistency': 'Maintain consistent tone and terminology',
      'technicalCompliance': 'Address technical SEO requirements'
    };
    
    return suggestions[metric] || 'Review and improve based on identified issues';
  }

  // Helper methods
  countWords(content) {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  countSentences(content) {
    return content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  countParagraphs(content) {
    return content.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  }

  extractHeadings(content) {
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: []
    };
    
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

  analyzeHeadingStructure(content) {
    return this.extractHeadings(content);
  }

  countInternalLinks(content) {
    // Simplified internal link counting
    const linkMatches = content.match(/\[.*\]\(.*\)/g) || [];
    return linkMatches.filter(link => !link.includes('http')).length;
  }

  extractTargetKeywords(task) {
    if (!task.data) return [];
    
    // Extract keywords from various sources
    const keywords = [];
    
    if (task.data.keywords) {
      if (Array.isArray(task.data.keywords)) {
        keywords.push(...task.data.keywords);
      } else if (typeof task.data.keywords === 'string') {
        keywords.push(...task.data.keywords.split(',').map(k => k.trim()));
      }
    }
    
    if (task.data.targetKeyword) {
      keywords.push(task.data.targetKeyword);
    }
    
    return [...new Set(keywords)]; // Remove duplicates
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

  findInconsistentTerminology(content, terms) {
    // Simplified inconsistency detection
    return terms.filter(term => {
      const variations = [term, term + 's', term + 'es'];
      const foundVariations = variations.filter(variation => 
        content.toLowerCase().includes(variation)
      );
      return foundVariations.length > 1;
    });
  }

  countTermOccurrences(content, terms) {
    return terms.reduce((count, term) => {
      return count + (content.toLowerCase().split(term).length - 1);
    }, 0);
  }

  identifyContentType(content) {
    const wordCount = this.countWords(content);
    
    if (wordCount < 300) return 'short-form';
    if (wordCount < 1000) return 'medium-form';
    if (wordCount < 2500) return 'long-form';
    return 'comprehensive';
  }

  updateMetrics(qualityResult) {
    this.metrics.totalValidations++;
    
    if (qualityResult.passed) {
      this.metrics.passedValidations++;
    }
    
    // Update moving average score
    const alpha = 0.1;
    this.metrics.averageScore = alpha * qualityResult.score + (1 - alpha) * this.metrics.averageScore;
    
    this.metrics.lastActivity = Date.now();
    
    // Calculate improvement rate (simplified)
    this.metrics.improvementRate = this.metrics.passedValidations / Math.max(this.metrics.totalValidations, 1);
  }

  async updateLearningData(qualityResult, content) {
    try {
      // Update learning patterns based on quality result
      if (!qualityResult.passed) {
        // Track failure patterns
        const failureKey = `failure_${qualityResult.score}`;
        const count = this.learningData.commonIssues.get(failureKey) || 0;
        this.learningData.commonIssues.set(failureKey, count + 1);
      }
      
      if (qualityResult.score > 90) {
        // Track success patterns
        const successKey = `success_${this.identifyContentType(content)}`;
        const count = this.learningData.successFactors.get(successKey) || 0;
        this.learningData.successFactors.set(successKey, count + 1);
      }
      
    } catch (error) {
      console.error('Error updating learning data:', error);
    }
  }

  async storeQualityResult(qualityResult) {
    try {
      await this.crystallineMemory.storeMemory(
        'quality-control',
        JSON.stringify(qualityResult),
        {
          importance: qualityResult.score / 100,
          lastAccess: Date.now(),
          accessCount: 1,
          qualityType: 'content-quality',
          passed: qualityResult.passed,
          agentId: this.agentId,
          semantic_tags: ['quality-validation', 'content-analysis', this.agentId]
        }
      );
      
    } catch (error) {
      console.error('Error storing quality result in crystalline memory:', error);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      learningPatterns: {
        commonIssues: this.learningData.commonIssues.size,
        successFactors: this.learningData.successFactors.size,
        improvementPatterns: this.learningData.improvementPatterns.size
      }
    };
  }

  async shutdown() {
    console.log(`🛑 Shutting down ${this.name}...`);
    // Clean up any resources
    this.learningData.commonIssues.clear();
    this.learningData.improvementPatterns.clear();
    this.learningData.successFactors.clear();
  }
}

module.exports = ContentQualityValidator;