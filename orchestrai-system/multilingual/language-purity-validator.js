/**
 * ORCHESTRAI Language Purity Validator
 * 
 * Real-time language mixing detection and correction system
 * Prevents multilingual hallucination through continuous validation
 */

const fs = require('fs').promises;

class LanguagePurityValidator {
  constructor(languageFramework, cotrSystem) {
    this.languageFramework = languageFramework;
    this.cotrSystem = cotrSystem;
    this.validationHistory = new Map();
    
    // Enhanced language detection patterns
    this.languageSignatures = {
      'sl': {
        diacritics: /[čšžĆŽČŠ]/g,
        commonWords: /\b(in|je|da|se|na|za|z|v|s|o|do|od|pri|po|zaradi|zato|torej|tudi|še|že|samo|lahko|mora|hoče|ima|nima|bo|bil|bila|bilo|bili|bile)\b/gi,
        endings: /\b\w+(ost|ost|nja|nje|nja|cev|ov|ih|em|imi|ah)\b/g,
        negativeIndicators: /\b(the|and|or|but|with|from|to|of|in|on|at|by|for|as|is|was|were|are|have|has|had|will|would|could|should)\b/gi
      },
      
      'en': {
        articles: /\b(the|a|an)\b/gi,
        commonWords: /\b(and|or|but|with|from|to|of|in|on|at|by|for|as|is|was|were|are|have|has|had|will|would|could|should|can|may|might|must)\b/gi,
        endings: /\b\w+(ing|ed|er|est|ly|tion|sion|ness|ment|able|ible)\b/g,
        negativeIndicators: /[čšžĆŽČŠüäöß]/g
      },
      
      'de': {
        articles: /\b(der|die|das|ein|eine|einen|einer|einem|eines)\b/gi,
        umlauts: /[äöüßÄÖÜ]/g,
        commonWords: /\b(und|oder|aber|mit|von|zu|in|auf|an|bei|für|als|ist|war|waren|sind|haben|hat|hatte|wird|würde|könnte|sollte|kann|mag|muss)\b/gi,
        endings: /\b\w+(ung|tion|heit|keit|schaft|chen|lein|lich|ig|isch)\b/g,
        negativeIndicators: /[čšžĆŽČŠ]/g
      },
      
      'es': {
        accents: /[áéíóúüñÁÉÍÓÚÜÑ]/g,
        articles: /\b(el|la|los|las|un|una|unos|unas)\b/gi,
        commonWords: /\b(y|o|pero|con|de|a|en|por|para|como|es|era|fueron|son|tienen|tiene|tenía|será|sería|podría|debería|puede|debe)\b/gi,
        endings: /\b\w+(ción|sión|dad|tad|eza|ura|mente|ado|ido)\b/g,
        negativeIndicators: /[čšžĆŽČŠüäöß]/g
      },
      
      'nl': {
        articles: /\b(de|het|een)\b/gi,
        commonWords: /\b(en|of|maar|met|van|naar|in|op|aan|bij|voor|als|is|was|waren|zijn|hebben|heeft|had|zal|zou|kon|moest|kan|mag|moet)\b/gi,
        diacritics: /[äëïöüÄËÏÖÜ]/g,
        endings: /\b\w+(ing|heid|schap|lijk|ig|isch|tie|sie)\b/g,
        negativeIndicators: /[čšžĆŽČŠáéíóúüñÁÉÍÓÚÜÑß]/g
      }
    };

    // Contamination severity levels
    this.contaminationLevels = {
      PURE: { score: 0, threshold: 0.05, action: 'pass' },
      MINOR: { score: 1, threshold: 0.15, action: 'warn' },
      MODERATE: { score: 2, threshold: 0.30, action: 'correct' },
      SEVERE: { score: 3, threshold: 0.50, action: 'reject' },
      CRITICAL: { score: 4, threshold: 1.0, action: 'halt' }
    };

    this.validationCache = new Map();
  }

  /**
   * Perform real-time language purity validation
   */
  async validateLanguagePurity(text, targetLanguage, options = {}) {
    const startTime = Date.now();
    
    // Check cache first for performance
    const cacheKey = `${targetLanguage}:${this.hashText(text)}`;
    if (this.validationCache.has(cacheKey) && !options.forceValidation) {
      return this.validationCache.get(cacheKey);
    }

    console.log(`🔍 Validating language purity for: ${targetLanguage.toUpperCase()}`);
    console.log(`📊 Text length: ${text.length} characters`);

    const validation = {
      targetLanguage,
      textLength: text.length,
      timestamp: new Date().toISOString(),
      
      // Core validation metrics
      languageScores: await this.calculateLanguageScores(text),
      sentenceAnalysis: await this.analyzeSentences(text, targetLanguage),
      contamination: await this.detectContamination(text, targetLanguage),
      consistency: await this.checkConsistency(text, targetLanguage),
      
      // Real-time corrections
      corrections: [],
      recommendations: []
    };

    // Calculate overall purity score
    validation.overallScore = this.calculateOverallPurityScore(validation);
    validation.contaminationLevel = this.determineContaminationLevel(validation.overallScore);
    validation.passesValidation = validation.contaminationLevel.action === 'pass' || validation.contaminationLevel.action === 'warn';

    // Generate corrections if needed
    if (validation.contaminationLevel.action === 'correct' || validation.contaminationLevel.action === 'reject') {
      validation.corrections = await this.generateCorrections(text, targetLanguage, validation);
    }

    // Generate recommendations
    validation.recommendations = this.generateRecommendations(validation);

    // Performance metrics
    validation.validationTime = Date.now() - startTime;

    // Cache result
    this.validationCache.set(cacheKey, validation);
    
    // Log results
    console.log(`📈 Purity Score: ${(validation.overallScore * 100).toFixed(1)}%`);
    console.log(`🎯 Status: ${validation.passesValidation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`⚡ Validation time: ${validation.validationTime}ms`);

    // Store validation history
    this.storeValidationHistory(validation);

    return validation;
  }

  /**
   * Calculate language probability scores
   */
  async calculateLanguageScores(text) {
    const scores = {};
    
    for (const [langCode, signatures] of Object.entries(this.languageSignatures)) {
      let score = 0;
      let factors = 0;
      
      // Check diacritics/special characters
      if (signatures.diacritics) {
        const matches = (text.match(signatures.diacritics) || []).length;
        score += matches / Math.max(text.length / 100, 1);
        factors++;
      }
      
      if (signatures.umlauts) {
        const matches = (text.match(signatures.umlauts) || []).length;
        score += matches / Math.max(text.length / 100, 1);
        factors++;
      }
      
      if (signatures.accents) {
        const matches = (text.match(signatures.accents) || []).length;
        score += matches / Math.max(text.length / 100, 1);
        factors++;
      }
      
      // Check common words
      if (signatures.commonWords) {
        const matches = (text.match(signatures.commonWords) || []).length;
        score += matches / Math.max(text.split(/\s+/).length / 10, 1);
        factors++;
      }
      
      // Check articles
      if (signatures.articles) {
        const matches = (text.match(signatures.articles) || []).length;
        score += matches / Math.max(text.split(/\s+/).length / 20, 1);
        factors++;
      }
      
      // Check word endings
      if (signatures.endings) {
        const matches = (text.match(signatures.endings) || []).length;
        score += matches / Math.max(text.split(/\s+/).length / 15, 1);
        factors++;
      }
      
      // Check negative indicators
      if (signatures.negativeIndicators) {
        const negativeMatches = (text.match(signatures.negativeIndicators) || []).length;
        score -= negativeMatches / Math.max(text.length / 100, 1);
      }
      
      scores[langCode] = Math.max(0, factors > 0 ? score / factors : 0);
    }
    
    return scores;
  }

  /**
   * Analyze individual sentences for language mixing
   */
  async analyzeSentences(text, targetLanguage) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const analysis = {
      totalSentences: sentences.length,
      pureSentences: 0,
      mixedSentences: [],
      averagePurityScore: 0
    };

    let totalPurityScore = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const sentenceScores = await this.calculateLanguageScores(sentence);
      
      const targetScore = sentenceScores[targetLanguage] || 0;
      const otherLanguagesScore = Object.keys(sentenceScores)
        .filter(lang => lang !== targetLanguage)
        .reduce((sum, lang) => sum + sentenceScores[lang], 0);
      
      const purityScore = targetScore / (targetScore + otherLanguagesScore + 0.001);
      totalPurityScore += purityScore;
      
      if (purityScore > 0.8) {
        analysis.pureSentences++;
      } else {
        analysis.mixedSentences.push({
          index: i,
          sentence: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
          purityScore,
          detectedLanguages: Object.keys(sentenceScores)
            .filter(lang => sentenceScores[lang] > 0.1)
            .sort((a, b) => sentenceScores[b] - sentenceScores[a])
        });
      }
    }

    analysis.averagePurityScore = sentences.length > 0 ? totalPurityScore / sentences.length : 0;
    analysis.purityPercentage = (analysis.pureSentences / analysis.totalSentences) * 100;

    return analysis;
  }

  /**
   * Detect specific contamination patterns
   */
  async detectContamination(text, targetLanguage) {
    const contamination = {
      detected: false,
      types: [],
      severity: 'PURE',
      examples: []
    };

    // Check for direct word-level contamination
    for (const [langCode, signatures] of Object.entries(this.languageSignatures)) {
      if (langCode === targetLanguage) continue;
      
      // Check for negative indicators (foreign characters in wrong language context)
      if (signatures.negativeIndicators) {
        const foreignMatches = text.match(signatures.negativeIndicators) || [];
        if (foreignMatches.length > 0) {
          contamination.detected = true;
          contamination.types.push(`${langCode}_characters`);
          contamination.examples.push(...foreignMatches.slice(0, 5));
        }
      }
      
      // Check for foreign common words in significant quantity
      if (signatures.commonWords) {
        const foreignWords = text.match(signatures.commonWords) || [];
        const wordDensity = foreignWords.length / Math.max(text.split(/\s+/).length, 1);
        
        if (wordDensity > 0.05) { // More than 5% foreign common words
          contamination.detected = true;
          contamination.types.push(`${langCode}_words`);
          contamination.examples.push(...foreignWords.slice(0, 5));
        }
      }
    }

    // Determine contamination severity
    if (contamination.detected) {
      const contaminationScore = contamination.types.length * 0.2 + contamination.examples.length * 0.1;
      
      if (contaminationScore > 0.5) contamination.severity = 'CRITICAL';
      else if (contaminationScore > 0.3) contamination.severity = 'SEVERE';
      else if (contaminationScore > 0.15) contamination.severity = 'MODERATE';
      else contamination.severity = 'MINOR';
    }

    return contamination;
  }

  /**
   * Check language consistency across document sections
   */
  async checkConsistency(text, targetLanguage) {
    const sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 0);
    const consistency = {
      totalSections: sections.length,
      consistentSections: 0,
      inconsistentSections: [],
      overallConsistency: 0
    };

    let totalConsistencyScore = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionScores = await this.calculateLanguageScores(section);
      
      const targetScore = sectionScores[targetLanguage] || 0;
      const dominantLanguage = Object.keys(sectionScores).reduce((a, b) => 
        sectionScores[a] > sectionScores[b] ? a : b
      );
      
      const sectionConsistency = dominantLanguage === targetLanguage ? 1 : targetScore;
      totalConsistencyScore += sectionConsistency;
      
      if (sectionConsistency > 0.8) {
        consistency.consistentSections++;
      } else {
        consistency.inconsistentSections.push({
          index: i,
          preview: section.substring(0, 100) + '...',
          consistency: sectionConsistency,
          dominantLanguage
        });
      }
    }

    consistency.overallConsistency = sections.length > 0 ? totalConsistencyScore / sections.length : 1;
    consistency.consistencyPercentage = (consistency.consistentSections / consistency.totalSections) * 100;

    return consistency;
  }

  /**
   * Calculate overall purity score
   */
  calculateOverallPurityScore(validation) {
    const weights = {
      languageScore: 0.3,
      sentencePurity: 0.25,
      contamination: 0.25,
      consistency: 0.2
    };

    const languageScore = validation.languageScores[validation.targetLanguage] || 0;
    const sentencePurity = validation.sentenceAnalysis.averagePurityScore;
    const contaminationScore = validation.contamination.detected ? 
      (1 - (validation.contamination.types.length * 0.2)) : 1;
    const consistencyScore = validation.consistency.overallConsistency;

    return (
      languageScore * weights.languageScore +
      sentencePurity * weights.sentencePurity +
      contaminationScore * weights.contamination +
      consistencyScore * weights.consistency
    );
  }

  /**
   * Determine contamination level based on score
   */
  determineContaminationLevel(score) {
    for (const [level, config] of Object.entries(this.contaminationLevels)) {
      if (score >= (1 - config.threshold)) {
        return { level, ...config };
      }
    }
    return this.contaminationLevels.CRITICAL;
  }

  /**
   * Generate automatic corrections
   */
  async generateCorrections(text, targetLanguage, validation) {
    const corrections = [];
    
    // Correct mixed sentences
    for (const mixedSentence of validation.sentenceAnalysis.mixedSentences) {
      if (mixedSentence.purityScore < 0.5) {
        corrections.push({
          type: 'sentence_replacement',
          original: mixedSentence.sentence,
          suggestion: `[CORRECT TO ${targetLanguage.toUpperCase()}]: ${mixedSentence.sentence}`,
          confidence: 0.7
        });
      }
    }
    
    // Remove contaminated words
    for (const example of validation.contamination.examples) {
      corrections.push({
        type: 'word_removal',
        original: example,
        suggestion: `[REPLACE WITH ${targetLanguage.toUpperCase()} EQUIVALENT]`,
        confidence: 0.8
      });
    }
    
    return corrections;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(validation) {
    const recommendations = [];
    
    if (validation.overallScore < 0.8) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        message: `Language purity is below acceptable threshold (${(validation.overallScore * 100).toFixed(1)}%). Review and correct mixed-language content.`
      });
    }
    
    if (validation.contamination.detected) {
      recommendations.push({
        type: 'contamination',
        priority: 'critical',
        message: `Detected ${validation.contamination.types.join(', ')} contamination. Remove foreign language elements.`
      });
    }
    
    if (validation.sentenceAnalysis.mixedSentences.length > 0) {
      recommendations.push({
        type: 'sentences',
        priority: 'high',
        message: `${validation.sentenceAnalysis.mixedSentences.length} sentences contain language mixing. Rewrite in pure ${validation.targetLanguage.toUpperCase()}.`
      });
    }
    
    if (validation.consistency.overallConsistency < 0.9) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        message: `Language consistency across sections is ${(validation.consistency.consistencyPercentage).toFixed(1)}%. Improve section-level language purity.`
      });
    }
    
    return recommendations;
  }

  /**
   * Store validation history for analysis
   */
  storeValidationHistory(validation) {
    const key = `${validation.targetLanguage}_${Date.now()}`;
    this.validationHistory.set(key, {
      timestamp: validation.timestamp,
      language: validation.targetLanguage,
      score: validation.overallScore,
      contamination: validation.contamination.detected,
      textLength: validation.textLength
    });
    
    // Keep only last 100 validations
    if (this.validationHistory.size > 100) {
      const oldest = Array.from(this.validationHistory.keys())[0];
      this.validationHistory.delete(oldest);
    }
  }

  /**
   * Generate simple text hash for caching
   */
  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Get validation statistics
   */
  getValidationStats() {
    const stats = {
      totalValidations: this.validationHistory.size,
      averageScore: 0,
      contaminationRate: 0,
      languageBreakdown: {}
    };
    
    if (this.validationHistory.size > 0) {
      const validations = Array.from(this.validationHistory.values());
      
      stats.averageScore = validations.reduce((sum, v) => sum + v.score, 0) / validations.length;
      stats.contaminationRate = validations.filter(v => v.contamination).length / validations.length;
      
      for (const validation of validations) {
        if (!stats.languageBreakdown[validation.language]) {
          stats.languageBreakdown[validation.language] = { count: 0, avgScore: 0 };
        }
        stats.languageBreakdown[validation.language].count++;
      }
    }
    
    return stats;
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
    console.log('✅ Validation cache cleared');
  }
}

module.exports = LanguagePurityValidator;