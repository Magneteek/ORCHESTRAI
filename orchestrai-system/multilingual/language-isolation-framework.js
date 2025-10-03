/**
 * ORCHESTRAI Language Isolation Framework
 * 
 * Prevents multilingual hallucination and language mixing by implementing
 * strict language boundaries and context preservation throughout content generation
 * 
 * Based on 2024 research on multilingual content architecture and language consistency
 */

const path = require('path');
const fs = require('fs').promises;

class LanguageIsolationFramework {
  constructor(memoryManager, mcpManager) {
    this.memoryManager = memoryManager;
    this.mcpManager = mcpManager;
    
    // Supported languages with ISO codes
    this.supportedLanguages = {
      'sl': { name: 'Slovenian', code: 'sl', formal: 'slovenščina' },
      'en': { name: 'English', code: 'en', formal: 'English' },
      'de': { name: 'German', code: 'de', formal: 'Deutsch' },
      'es': { name: 'Spanish', code: 'es', formal: 'Español' },
      'nl': { name: 'Dutch', code: 'nl', formal: 'Nederlands' }
    };
    
    // Language-specific memory pools
    this.languageMemoryPools = {
      'sl': 'slovenian-intelligence',
      'en': 'english-intelligence', 
      'de': 'german-intelligence',
      'es': 'spanish-intelligence',
      'nl': 'dutch-intelligence'
    };
    
    // Language validation patterns
    this.languagePatterns = {
      'sl': /[\u010D\u0161\u017E\u010C\u0160\u017D]/g, // Slovenian diacritics
      'de': /[äöüßÄÖÜ]/g, // German umlauts
      'es': /[ñáéíóúüÑÁÉÍÓÚÜ]/g, // Spanish accents
      'nl': /[äëïöüÄËÏÖÜ]/g, // Dutch diacritics
      'en': /^[a-zA-Z\s\.\,\!\?\-\'\"\(\)\[\]\{\}0-9]*$/ // English only
    };
    
    // Temperature settings optimized for language consistency
    this.temperatureSettings = {
      consistency: 0.35, // For language-pure content generation
      creativity: 0.7,   // For creative elements within language bounds  
      validation: 0.2    // For language detection and correction
    };
    
    this.crossContaminationPreventors = new Map();
  }

  /**
   * Initialize language-isolated memory pools
   */
  async initializeLanguageMemoryPools() {
    console.log('🌐 Initializing Language-Isolated Memory Pools...');
    
    const initializationResults = [];
    
    for (const [langCode, poolName] of Object.entries(this.languageMemoryPools)) {
      try {
        console.log(`  📁 Creating ${langCode.toUpperCase()} memory pool: ${poolName}`);
        
        // Create memory pool configuration
        const poolConfig = {
          poolId: poolName,
          language: langCode,
          isolation: 'strict',
          crossContaminationPrevention: true,
          validationLevel: 'high',
          temperature: this.temperatureSettings.consistency
        };
        
        // Initialize pool in memory system
        await this.memoryManager.createMemoryPool(poolConfig);
        
        // Set up cross-contamination preventors
        this.crossContaminationPreventors.set(langCode, {
          patterns: this.languagePatterns[langCode],
          validators: this.createLanguageValidators(langCode),
          contextPreservation: true
        });
        
        initializationResults.push({
          language: langCode,
          pool: poolName,
          status: 'initialized',
          isolationLevel: 'strict'
        });
        
        console.log(`  ✅ ${langCode.toUpperCase()} memory pool initialized`);
        
      } catch (error) {
        console.error(`  ❌ Failed to initialize ${langCode} pool:`, error.message);
        initializationResults.push({
          language: langCode,
          pool: poolName,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log('📊 Memory Pool Initialization Summary:');
    initializationResults.forEach(result => {
      const status = result.status === 'initialized' ? '✅' : '❌';
      console.log(`  ${status} ${result.language.toUpperCase()}: ${result.status}`);
    });
    
    return initializationResults;
  }

  /**
   * Create language-specific validators
   */
  createLanguageValidators(languageCode) {
    return {
      purityCheck: (text) => this.validateLanguagePurity(text, languageCode),
      contextPreservation: (text) => this.validateContextPreservation(text, languageCode),
      diacriticConsistency: (text) => this.validateDiacriticConsistency(text, languageCode),
      mixingDetection: (text) => this.detectLanguageMixing(text, languageCode)
    };
  }

  /**
   * Validate language purity - ensures content contains only target language
   */
  validateLanguagePurity(text, targetLanguage) {
    const languageScores = {};
    
    // Score each supported language
    for (const [langCode, pattern] of Object.entries(this.languagePatterns)) {
      if (langCode === 'en') {
        // English is checked differently (absence of other language patterns)
        languageScores[langCode] = pattern.test(text) ? 1.0 : 0.0;
      } else {
        const matches = (text.match(pattern) || []).length;
        const totalChars = text.length;
        languageScores[langCode] = totalChars > 0 ? matches / totalChars : 0;
      }
    }
    
    const detectedLanguage = Object.keys(languageScores).reduce((a, b) => 
      languageScores[a] > languageScores[b] ? a : b
    );
    
    const purityScore = languageScores[targetLanguage] || 0;
    const mixingScore = Object.keys(languageScores)
      .filter(lang => lang !== targetLanguage)
      .reduce((sum, lang) => sum + languageScores[lang], 0);
    
    return {
      isPure: detectedLanguage === targetLanguage && mixingScore < 0.05,
      purityScore,
      mixingScore,
      detectedLanguage,
      confidence: Math.max(0, 1 - mixingScore)
    };
  }

  /**
   * Detect language mixing within sentences
   */
  detectLanguageMixing(text, targetLanguage) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const mixedSentences = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const validation = this.validateLanguagePurity(sentence, targetLanguage);
      
      if (!validation.isPure && validation.mixingScore > 0.1) {
        mixedSentences.push({
          sentence,
          index: i,
          mixingScore: validation.mixingScore,
          detectedLanguages: Object.keys(this.languagePatterns)
            .filter(lang => this.languagePatterns[lang].test && this.languagePatterns[lang].test(sentence))
        });
      }
    }
    
    return {
      hasMixing: mixedSentences.length > 0,
      mixedSentenceCount: mixedSentences.length,
      totalSentences: sentences.length,
      mixingPercentage: (mixedSentences.length / sentences.length) * 100,
      mixedSentences
    };
  }

  /**
   * Validate context preservation across content
   */
  validateContextPreservation(text, targetLanguage) {
    const sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 0);
    const contextResults = [];
    
    for (const section of sections) {
      const validation = this.validateLanguagePurity(section, targetLanguage);
      contextResults.push({
        section: section.substring(0, 100) + (section.length > 100 ? '...' : ''),
        isPure: validation.isPure,
        confidence: validation.confidence
      });
    }
    
    const averageConfidence = contextResults.reduce((sum, result) => sum + result.confidence, 0) / contextResults.length;
    const purityRate = contextResults.filter(result => result.isPure).length / contextResults.length;
    
    return {
      contextPreserved: purityRate > 0.95,
      averageConfidence,
      purityRate,
      sectionsAnalyzed: contextResults.length,
      problemSections: contextResults.filter(result => !result.isPure)
    };
  }

  /**
   * Validate diacritic consistency for specific languages
   */
  validateDiacriticConsistency(text, languageCode) {
    if (!this.languagePatterns[languageCode] || languageCode === 'en') {
      return { consistent: true, score: 1.0 };
    }
    
    const pattern = this.languagePatterns[languageCode];
    const diacriticMatches = (text.match(pattern) || []).length;
    const totalRelevantWords = text.split(/\s+/).filter(word => 
      /[a-zA-ZčšžćđĆĐŠŽČäöüßÄÖÜñáéíóúüÑÁÉÍÓÚÜäëïöüÄËÏÖÜ]/.test(word)
    ).length;
    
    const expectedDiacriticFrequency = {
      'sl': 0.15, // Slovenian texts typically have ~15% words with diacritics
      'de': 0.08, // German with umlauts
      'es': 0.12, // Spanish with accents
      'nl': 0.03  // Dutch with less frequent diacritics
    };
    
    const actualFrequency = totalRelevantWords > 0 ? diacriticMatches / totalRelevantWords : 0;
    const expectedFrequency = expectedDiacriticFrequency[languageCode] || 0;
    
    const consistencyScore = 1 - Math.abs(actualFrequency - expectedFrequency);
    
    return {
      consistent: consistencyScore > 0.7,
      score: Math.max(0, consistencyScore),
      actualFrequency,
      expectedFrequency,
      diacriticCount: diacriticMatches,
      totalWords: totalRelevantWords
    };
  }

  /**
   * Generate language isolation report
   */
  async generateLanguageIsolationReport(text, targetLanguage) {
    console.log(`🔍 Generating language isolation report for: ${targetLanguage.toUpperCase()}`);
    
    const purityValidation = this.validateLanguagePurity(text, targetLanguage);
    const mixingDetection = this.detectLanguageMixing(text, targetLanguage);
    const contextValidation = this.validateContextPreservation(text, targetLanguage);
    const diacriticValidation = this.validateDiacriticConsistency(text, targetLanguage);
    
    const overallScore = (
      purityValidation.confidence * 0.4 +
      (1 - mixingDetection.mixingPercentage / 100) * 0.3 +
      contextValidation.averageConfidence * 0.2 +
      diacriticValidation.score * 0.1
    );
    
    const report = {
      timestamp: new Date().toISOString(),
      targetLanguage,
      languageName: this.supportedLanguages[targetLanguage]?.name || 'Unknown',
      
      overallScore,
      passesIsolation: overallScore > 0.9,
      
      purity: {
        isPure: purityValidation.isPure,
        score: purityValidation.purityScore,
        mixing: purityValidation.mixingScore,
        confidence: purityValidation.confidence
      },
      
      mixing: {
        detected: mixingDetection.hasMixing,
        affectedSentences: mixingDetection.mixedSentenceCount,
        percentage: mixingDetection.mixingPercentage,
        problems: mixingDetection.mixedSentences.slice(0, 5) // Top 5 problem sentences
      },
      
      context: {
        preserved: contextValidation.contextPreserved,
        confidence: contextValidation.averageConfidence,
        purityRate: contextValidation.purityRate,
        problemSections: contextValidation.problemSections.length
      },
      
      diacritics: {
        consistent: diacriticValidation.consistent,
        score: diacriticValidation.score,
        frequency: diacriticValidation.actualFrequency
      },
      
      recommendations: this.generateRecommendations(purityValidation, mixingDetection, contextValidation, diacriticValidation)
    };
    
    console.log(`📊 Language Isolation Score: ${(overallScore * 100).toFixed(1)}%`);
    console.log(`🎯 Isolation Status: ${report.passesIsolation ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (mixingDetection.hasMixing) {
      console.log(`⚠️  Language mixing detected in ${mixingDetection.mixedSentenceCount} sentences`);
    }
    
    return report;
  }

  /**
   * Generate recommendations for improving language isolation
   */
  generateRecommendations(purity, mixing, context, diacritics) {
    const recommendations = [];
    
    if (!purity.isPure) {
      recommendations.push({
        type: 'purity',
        severity: 'high',
        message: `Language purity score is low (${(purity.confidence * 100).toFixed(1)}%). Consider stronger language context enforcement.`
      });
    }
    
    if (mixing.hasMixing) {
      recommendations.push({
        type: 'mixing',
        severity: 'critical',
        message: `${mixing.mixedSentenceCount} sentences contain language mixing. Implement sentence-level validation.`
      });
    }
    
    if (!context.preserved) {
      recommendations.push({
        type: 'context',
        severity: 'medium',
        message: `Context preservation is below threshold (${(context.purityRate * 100).toFixed(1)}%). Strengthen section-level validation.`
      });
    }
    
    if (!diacritics.consistent) {
      recommendations.push({
        type: 'diacritics',
        severity: 'low',
        message: `Diacritic usage is inconsistent (${(diacritics.score * 100).toFixed(1)}%). Verify proper character encoding.`
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        severity: 'info',
        message: 'Language isolation is excellent. No improvements needed.'
      });
    }
    
    return recommendations;
  }

  /**
   * Get language-specific memory pool
   */
  getLanguageMemoryPool(languageCode) {
    return this.languageMemoryPools[languageCode] || null;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return { ...this.supportedLanguages };
  }

  /**
   * Get temperature settings for language consistency
   */
  getTemperatureSettings() {
    return { ...this.temperatureSettings };
  }
}

module.exports = LanguageIsolationFramework;