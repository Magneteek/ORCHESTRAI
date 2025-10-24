/**
 * Content Quality Compliance Agent
 *
 * Real-time monitoring of content quality during content creation streams.
 * Catches issues like:
 * - AI-generated phrases and patterns
 * - Language purity violations (mixed languages)
 * - Unnatural writing flow
 * - Readability issues
 * - SEO guideline violations
 * - Brand voice inconsistencies
 *
 * Integrates with ORCHESTRAI's language isolation framework and content standards.
 */

const BaseComplianceAgent = require('./base-compliance-agent');

class ContentQualityAgent extends BaseComplianceAgent {
  constructor(config = {}) {
    super({
      agentType: 'content-quality-monitor',
      ...config
    });

    // Content-specific configuration
    this.contentConfig = {
      targetLanguage: config.targetLanguage || 'en',
      enableAIDetection: config.enableAIDetection !== false,
      enableLanguagePurity: config.enableLanguagePurity !== false,
      enableReadabilityChecks: config.enableReadabilityChecks !== false,
      enableSEOValidation: config.enableSEOValidation !== false,
      enableBrandVoice: config.enableBrandVoice || false,
      minReadabilityScore: config.minReadabilityScore || 60,
      maxAIPhraseScore: config.maxAIPhraseScore || 30,
      brandVoiceGuidelines: config.brandVoiceGuidelines || {},
      ...config.contentConfig
    };

    // AI detection patterns (from ORCHESTRAI content standards)
    this.aiPatterns = this.initializeAIPatterns();

    // Language-specific patterns
    this.languagePatterns = this.initializeLanguagePatterns();

    console.log(`📝 Content Quality Agent configured for: ${this.contentConfig.targetLanguage}`);
  }

  /**
   * Initialize AI detection patterns
   */
  initializeAIPatterns() {
    return {
      // Common AI phrases that should be avoided
      commonPhrases: [
        { pattern: /\bIn conclusion\b/gi, weight: 3, severity: 'medium' },
        { pattern: /\bIt's important to note that\b/gi, weight: 4, severity: 'medium' },
        { pattern: /\bIt is worth noting\b/gi, weight: 4, severity: 'medium' },
        { pattern: /\bIn today's (?:digital age|world|society)\b/gi, weight: 5, severity: 'high' },
        { pattern: /\bAt the end of the day\b/gi, weight: 3, severity: 'medium' },
        { pattern: /\bDelve into\b/gi, weight: 5, severity: 'high' },
        { pattern: /\bNavigating (?:the|this)\b/gi, weight: 4, severity: 'medium' },
        { pattern: /\bIn the realm of\b/gi, weight: 5, severity: 'high' },
        { pattern: /\bIt's essential to\b/gi, weight: 3, severity: 'low' },
        { pattern: /\bMoreover,\b/gi, weight: 2, severity: 'low' },
        { pattern: /\bFurthermore,\b/gi, weight: 2, severity: 'low' },
        { pattern: /\bAdditionally,\b/gi, weight: 2, severity: 'low' }
      ],

      // Structural patterns
      structuralIssues: [
        { pattern: /^(?:Every|Each) paragraph starts with bold text/m, weight: 5, severity: 'high' },
        { pattern: /(?:\*\*[^*]+\*\*\s*\n){3,}/g, weight: 4, severity: 'medium', message: 'Excessive bold text usage' },
        { pattern: /(?:- [^\n]+\n){8,}/g, weight: 3, severity: 'low', message: 'Overly long bulleted list' }
      ],

      // Repetitive patterns
      repetitivePatterns: [
        { pattern: /\b(\w+)\s+\1\b/gi, weight: 2, severity: 'low', message: 'Repeated word' },
        { pattern: /^(.+)$\n^(.+)$\n^\1$/gm, weight: 4, severity: 'medium', message: 'Repetitive sentence structure' }
      ]
    };
  }

  /**
   * Initialize language-specific patterns
   */
  initializeLanguagePatterns() {
    return {
      // Language mixing patterns (for language purity enforcement)
      languageMixing: {
        'sl': [ // Slovenian
          { pattern: /\b(?:the|and|or|but|in|on|at|to|for|of|with|by)\b/gi, lang: 'en' },
          { pattern: /\b(?:der|die|das|und|oder|aber|in|auf|zu|für|von|mit)\b/gi, lang: 'de' }
        ],
        'nl': [ // Dutch
          { pattern: /\b(?:the|and|or|but|in|on|at|to|for|of|with)\b/gi, lang: 'en' },
          { pattern: /\b(?:der|die|das|und|oder)\b/gi, lang: 'de' }
        ],
        'de': [ // German
          { pattern: /\b(?:the|and|or|but|in|on|at)\b/gi, lang: 'en' },
          { pattern: /\b(?:het|de|en|of|maar)\b/gi, lang: 'nl' }
        ],
        'es': [ // Spanish
          { pattern: /\b(?:the|and|or|but|in|on|at)\b/gi, lang: 'en' },
          { pattern: /\b(?:der|die|das)\b/gi, lang: 'de' }
        ]
      }
    };
  }

  /**
   * Perform validation on stream output
   */
  async performValidation(stream) {
    if (!stream || !stream.output) {
      return {
        passed: true,
        score: 100,
        message: 'No content output to validate'
      };
    }

    return await this.validateContent(stream.output, {
      streamId: stream.id,
      targetLanguage: stream.language || this.contentConfig.targetLanguage,
      contentType: stream.contentType || 'article'
    });
  }

  /**
   * Run validation checks on content
   */
  async runValidationChecks(content, context) {
    const issues = [];

    // 1. AI phrase detection
    if (this.contentConfig.enableAIDetection) {
      const aiIssues = await this.detectAIPhrases(content);
      issues.push(...aiIssues);
    }

    // 2. Language purity check
    if (this.contentConfig.enableLanguagePurity) {
      const languageIssues = await this.checkLanguagePurity(content, context.targetLanguage);
      issues.push(...languageIssues);
    }

    // 3. Readability analysis
    if (this.contentConfig.enableReadabilityChecks) {
      const readabilityIssues = await this.analyzeReadability(content);
      issues.push(...readabilityIssues);
    }

    // 4. SEO validation
    if (this.contentConfig.enableSEOValidation) {
      const seoIssues = await this.validateSEO(content, context);
      issues.push(...seoIssues);
    }

    // 5. Brand voice consistency
    if (this.contentConfig.enableBrandVoice) {
      const brandIssues = await this.checkBrandVoice(content);
      issues.push(...brandIssues);
    }

    // 6. Content structure
    const structureIssues = await this.analyzeStructure(content);
    issues.push(...structureIssues);

    return issues;
  }

  /**
   * Detect AI-generated phrases
   */
  async detectAIPhrases(content) {
    const issues = [];
    let totalAIScore = 0;

    // Check common AI phrases
    for (const phrasePattern of this.aiPatterns.commonPhrases) {
      const matches = [...content.matchAll(phrasePattern.pattern)];

      if (matches.length > 0) {
        totalAIScore += matches.length * phrasePattern.weight;

        matches.forEach(match => {
          issues.push({
            passed: false,
            severity: phrasePattern.severity,
            category: 'ai-detection',
            message: `AI phrase detected: "${match[0]}"`,
            location: this.findLocation(content, match.index),
            suggestion: 'Replace with more natural language',
            autoFixable: false
          });
        });
      }
    }

    // Check structural AI patterns
    for (const pattern of this.aiPatterns.structuralIssues) {
      const matches = [...content.matchAll(pattern.pattern)];

      if (matches.length > 0) {
        totalAIScore += matches.length * pattern.weight;

        issues.push({
          passed: false,
          severity: pattern.severity,
          category: 'ai-detection',
          message: pattern.message || 'AI structural pattern detected',
          suggestion: 'Vary content structure for natural flow',
          autoFixable: false
        });
      }
    }

    // Check repetitive patterns
    for (const pattern of this.aiPatterns.repetitivePatterns) {
      const matches = [...content.matchAll(pattern.pattern)];

      if (matches.length > 2) { // Allow some repetition
        totalAIScore += matches.length * pattern.weight;

        issues.push({
          passed: false,
          severity: pattern.severity,
          category: 'ai-detection',
          message: pattern.message,
          suggestion: 'Vary language and sentence structure',
          autoFixable: false
        });
      }
    }

    // Overall AI score check
    if (totalAIScore > this.contentConfig.maxAIPhraseScore) {
      issues.push({
        passed: false,
        severity: 'high',
        category: 'ai-detection',
        message: `High AI score detected (${totalAIScore}/${this.contentConfig.maxAIPhraseScore})`,
        suggestion: 'Rewrite content with more natural, conversational language',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Check language purity (no language mixing)
   */
  async checkLanguagePurity(content, targetLanguage) {
    const issues = [];

    if (!targetLanguage || targetLanguage === 'en') {
      return issues; // English content can contain English words
    }

    const languagePatterns = this.languagePatterns.languageMixing[targetLanguage];

    if (!languagePatterns) {
      return issues; // No patterns defined for this language
    }

    for (const pattern of languagePatterns) {
      const matches = [...content.matchAll(pattern.pattern)];

      // Filter out matches that might be valid technical terms or proper nouns
      const validViolations = matches.filter(match => {
        const context = this.getContext(content, match.index, 50);
        // Allow if surrounded by quotes or is a brand name
        return !(/["'`]/.test(context)) && !(/[A-Z][a-zA-Z]+/.test(match[0]));
      });

      if (validViolations.length > 0) {
        validViolations.forEach(match => {
          issues.push({
            passed: false,
            severity: 'critical',
            category: 'language-purity',
            message: `${pattern.lang.toUpperCase()} word detected in ${targetLanguage.toUpperCase()} content: "${match[0]}"`,
            location: this.findLocation(content, match.index),
            suggestion: `Translate to ${targetLanguage.toUpperCase()}`,
            autoFixable: false
          });
        });
      }
    }

    return issues;
  }

  /**
   * Analyze readability
   */
  async analyzeReadability(content) {
    const issues = [];

    // Calculate Flesch Reading Ease (simplified)
    const readabilityScore = this.calculateReadabilityScore(content);

    if (readabilityScore < this.contentConfig.minReadabilityScore) {
      issues.push({
        passed: false,
        severity: readabilityScore < 40 ? 'high' : 'medium',
        category: 'readability',
        message: `Low readability score: ${readabilityScore} (target: ${this.contentConfig.minReadabilityScore})`,
        suggestion: 'Simplify sentences, use shorter words, reduce complexity',
        autoFixable: false
      });
    }

    // Check paragraph length distribution
    const paragraphs = content.split('\n\n');
    const longParagraphs = paragraphs.filter(p => p.split(' ').length > 100);

    if (longParagraphs.length > paragraphs.length * 0.3) {
      issues.push({
        passed: false,
        severity: 'low',
        category: 'readability',
        message: 'Too many long paragraphs detected',
        suggestion: 'Break long paragraphs into shorter segments (40% short, 40% medium, 20% long)',
        autoFixable: false
      });
    }

    // Check sentence variety
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    if (avgSentenceLength > 25) {
      issues.push({
        passed: false,
        severity: 'low',
        category: 'readability',
        message: `Average sentence length too long: ${avgSentenceLength.toFixed(1)} words`,
        suggestion: 'Mix short and long sentences for better flow',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Calculate readability score (simplified Flesch)
   */
  calculateReadabilityScore(content) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const words = content.match(/\b\w+\b/g) || [];
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 100;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Count syllables in word (simplified)
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = word.match(/[aeiouy]+/g) || [];
    let count = vowels.length;

    // Adjust for silent e
    if (word.endsWith('e')) count--;

    return Math.max(1, count);
  }

  /**
   * Validate SEO guidelines
   */
  async validateSEO(content, context) {
    const issues = [];

    // Check keyword usage (if provided in context)
    if (context.targetKeyword) {
      const keywordCount = (content.match(new RegExp(context.targetKeyword, 'gi')) || []).length;
      const wordCount = content.split(/\s+/).length;
      const keywordDensity = (keywordCount / wordCount) * 100;

      if (keywordDensity < 0.5) {
        issues.push({
          passed: false,
          severity: 'medium',
          category: 'seo',
          message: `Low keyword density: ${keywordDensity.toFixed(2)}% (target: 0.5-2%)`,
          suggestion: 'Integrate target keyword more naturally',
          autoFixable: false
        });
      }

      if (keywordDensity > 3) {
        issues.push({
          passed: false,
          severity: 'high',
          category: 'seo',
          message: `Keyword stuffing detected: ${keywordDensity.toFixed(2)}%`,
          suggestion: 'Reduce keyword usage, focus on natural language',
          autoFixable: false
        });
      }
    }

    // Check content length
    const wordCount = content.split(/\s+/).length;

    if (context.contentType === 'article' && wordCount < 300) {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'seo',
        message: `Content too short: ${wordCount} words (minimum: 300)`,
        suggestion: 'Expand content with more valuable information',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Check brand voice consistency
   */
  async checkBrandVoice(content) {
    const issues = [];

    // This would integrate with brand voice guidelines
    // For now, check basic tone consistency

    const formalIndicators = /\b(?:furthermore|moreover|nonetheless|consequently)\b/gi;
    const casualIndicators = /\b(?:gonna|wanna|yeah|ok|basically)\b/gi;

    const formalCount = (content.match(formalIndicators) || []).length;
    const casualCount = (content.match(casualIndicators) || []).length;

    if (formalCount > 0 && casualCount > 0) {
      issues.push({
        passed: false,
        severity: 'low',
        category: 'brand-voice',
        message: 'Inconsistent tone detected (mixing formal and casual language)',
        suggestion: 'Maintain consistent tone throughout',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Analyze content structure
   */
  async analyzeStructure(content) {
    const issues = [];

    // Check for proper heading structure
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];

    if (headings.length === 0 && content.length > 500) {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'structure',
        message: 'No headings found in long content',
        suggestion: 'Add headings to improve content structure',
        autoFixable: false
      });
    }

    // Check paragraph distribution
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    if (paragraphs.length > 0) {
      const wordCounts = paragraphs.map(p => p.split(/\s+/).length);
      const shortParas = wordCounts.filter(c => c <= 30).length;
      const mediumParas = wordCounts.filter(c => c > 30 && c <= 70).length;
      const longParas = wordCounts.filter(c => c > 70).length;

      const shortPercent = (shortParas / paragraphs.length) * 100;
      const mediumPercent = (mediumParas / paragraphs.length) * 100;
      const longPercent = (longParas / paragraphs.length) * 100;

      // Target: 40% short, 40% medium, 20% long
      if (Math.abs(shortPercent - 40) > 15 || Math.abs(mediumPercent - 40) > 15) {
        issues.push({
          passed: false,
          severity: 'low',
          category: 'structure',
          message: `Paragraph distribution off-target: ${shortPercent.toFixed(0)}% short, ${mediumPercent.toFixed(0)}% medium, ${longPercent.toFixed(0)}% long`,
          suggestion: 'Aim for 40% short, 40% medium, 20% long paragraphs',
          autoFixable: false
        });
      }
    }

    return issues;
  }

  /**
   * Find location of match in content
   */
  findLocation(content, index) {
    const lines = content.substring(0, index).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length,
      position: index
    };
  }

  /**
   * Get context around position
   */
  getContext(content, index, length) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end);
  }
}

module.exports = ContentQualityAgent;
