/**
 * Dutch Language Isolation Specialist
 * 
 * Prevents English contamination in Dutch content using ORCHESTRAI multilingual framework
 * Ensures context preservation while maintaining pure Nederlandse taal throughout
 */

const LanguageIsolationFramework = require('../multilingual/language-isolation-framework');
const EventEmitter = require('events');

class DutchLanguageIsolationSpecialist extends EventEmitter {
  constructor(crystallineMemory) {
    super();
    this.agentId = 'dutch-language-isolation-specialist';
    this.agentName = 'Dutch Language Isolation Specialist';
    this.crystallineMemory = crystallineMemory;
    
    // Dutch language isolation configuration
    this.dutchConfig = {
      language: 'nl',
      formal: 'Nederlands',
      isolation: 'strict',
      temperature: 0.25, // Very low for maximum consistency
      crossContaminationPrevention: true,
      contextPreservation: true
    };
    
    // Dutch-specific contamination patterns
    this.contaminationPatterns = {
      // English words commonly mixed in Dutch business content
      englishWords: [
        'structure', 'approach', 'procedures', 'assessment', 'compliance',
        'standard', 'response', 'pattern', 'includes', 'process', 'available',
        'factors', 'quality', 'understanding', 'allowing', 'committed',
        'significant', 'options', 'demonstrated', 'accommodation', 'while',
        'because', 'including', 'business', 'cost', 'concerns', 'possible'
      ],
      
      // Mixed sentence patterns (English grammar with Dutch words)
      mixedPatterns: [
        /\b(voor|door|met|van)\s+(understanding|allowing|including|while|because)\b/gi,
        /\b(deze|die|het)\s+(approach|structure|process|pattern)\b/gi,
        /\b(tot|naar)\s+(successful|significant|important|available)\b/gi,
        /\bwhile\s+(maintaining|ensuring|providing)\b/gi,
        /\ballowing\s+[a-zA-Z]+\s+tot\b/gi,
        /\bcommitted\s+tot\b/gi
      ],
      
      // Incorrect preposition usage (English prepositions in Dutch context)
      prepositionErrors: [
        /\bfor\s+(Nederlandse|Dutch|bedrijven|businesses)\b/gi,
        /\bwith\s+(deze|die|het|een)\b/gi,
        /\bby\s+(gebruik|using|door)\b/gi,
        /\bto\s+(successful|significant|important)\b/gi
      ]
    };
    
    // Dutch replacement mappings
    this.dutchReplacements = {
      'structure': 'structuur',
      'approach': 'benadering',
      'procedures': 'procedures',
      'assessment': 'beoordeling',
      'compliance': 'naleving',
      'standard': 'standaard',
      'response': 'reactie',
      'pattern': 'patroon',
      'includes': 'omvat',
      'process': 'proces',
      'available': 'beschikbaar',
      'factors': 'factoren',
      'quality': 'kwaliteit',
      'understanding': 'begrip',
      'allowing': 'toestaan',
      'committed': 'toegewijd',
      'significant': 'significant',
      'options': 'opties',
      'demonstrated': 'aangetoond',
      'accommodation': 'accommodatie',
      'while': 'terwijl',
      'because': 'omdat',
      'including': 'inclusief',
      'business': 'bedrijf',
      'cost': 'kosten',
      'concerns': 'zorgen',
      'possible': 'mogelijk',
      
      // Complex phrase replacements
      'structure specifically voor': 'structuur specifiek voor',
      'eliminating financial risk voor': 'financiële risico wegnemend voor',
      'while maintaining': 'terwijl het behoud',
      'approach possible door': 'benadering mogelijk door',
      'Financial barrier removal important': 'Financiële barrièrewegging belangrijk',
      'upfront cost concerns': 'voorafgaande kostenbekommernissen',
      'allowing review damage': 'review schade toestaan',
      'to accumulate tot': 'zich opstapelen tot',
      'eliminates deze barrier while ensuring': 'elimineert deze barrière terwijl het zorgt',
      'committed tot': 'toegewijd aan',
      'predictable patterns': 'voorspelbare patronen',
      'defensive strategies': 'defensieve strategieën',
      'court procedures': 'rechtbankprocedures',
      'Understanding realistic timelines': 'Realistische tijdlijnen begrijpen',
      'proper expectations set': 'juiste verwachtingen stellen',
      'multiple factors': 'meerdere factoren',
      'Emergency procedures available voor': 'Noodprocedures beschikbaar voor'
    };
    
    // Context preservation rules
    this.contextRules = {
      legalTerms: {
        // Keep specialized legal terms in Dutch
        maintain: ['rechtbank', 'gerechtshof', 'advocaat', 'juridisch', 'wetgeving'],
        translate: {
          'legal process': 'juridische procedure',
          'court case': 'rechtszaak',
          'legal action': 'juridische actie',
          'court proceedings': 'rechtbankprocedures'
        }
      },
      businessTerms: {
        maintain: ['bedrijf', 'onderneming', 'klant', 'dienst', 'product'],
        translate: {
          'business operations': 'bedrijfsactiviteiten',
          'customer acquisition': 'klantenacquisitie',
          'business impact': 'bedrijfsimpact',
          'business value': 'bedrijfswaarde'
        }
      }
    };
  }

  /**
   * Detect language contamination in Dutch content
   */
  async detectContamination(content) {
    const contaminations = [];
    
    // Check for English words
    for (const englishWord of this.contaminationPatterns.englishWords) {
      const regex = new RegExp(`\\b${englishWord}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        contaminations.push({
          type: 'english_word',
          word: englishWord,
          occurrences: matches.length,
          replacement: this.dutchReplacements[englishWord.toLowerCase()] || `[NEEDS_TRANSLATION: ${englishWord}]`
        });
      }
    }
    
    // Check for mixed sentence patterns
    for (const pattern of this.contaminationPatterns.mixedPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        contaminations.push({
          type: 'mixed_pattern',
          matches: matches,
          pattern: pattern.toString()
        });
      }
    }
    
    return {
      isContaminated: contaminations.length > 0,
      contaminations: contaminations,
      purityScore: Math.max(0, 100 - (contaminations.length * 2))
    };
  }

  /**
   * Clean Dutch content of English contamination while preserving context
   */
  async cleanDutchContent(content) {
    let cleanedContent = content;
    const cleaningLog = [];
    
    // Replace complex phrases first (to avoid partial replacements)
    for (const [english, dutch] of Object.entries(this.dutchReplacements)) {
      if (english.includes(' ')) { // Multi-word phrases
        const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const beforeCount = (cleanedContent.match(regex) || []).length;
        cleanedContent = cleanedContent.replace(regex, dutch);
        
        if (beforeCount > 0) {
          cleaningLog.push({
            type: 'phrase_replacement',
            from: english,
            to: dutch,
            count: beforeCount
          });
        }
      }
    }
    
    // Replace individual words
    for (const [english, dutch] of Object.entries(this.dutchReplacements)) {
      if (!english.includes(' ')) { // Single words
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        const beforeCount = (cleanedContent.match(regex) || []).length;
        cleanedContent = cleanedContent.replace(regex, dutch);
        
        if (beforeCount > 0) {
          cleaningLog.push({
            type: 'word_replacement',
            from: english,
            to: dutch,
            count: beforeCount
          });
        }
      }
    }
    
    // Fix mixed preposition patterns
    for (const pattern of this.contaminationPatterns.prepositionErrors) {
      cleanedContent = cleanedContent.replace(pattern, (match) => {
        // Context-specific replacements would go here
        return match.replace(/\bfor\b/gi, 'voor')
                   .replace(/\bwith\b/gi, 'met')
                   .replace(/\bby\b/gi, 'door')
                   .replace(/\bto\b/gi, 'naar');
      });
    }
    
    return {
      cleanedContent,
      cleaningLog,
      originalLength: content.length,
      cleanedLength: cleanedContent.length,
      changesCount: cleaningLog.reduce((sum, log) => sum + log.count, 0)
    };
  }

  /**
   * Validate Dutch content purity
   */
  async validateDutchPurity(content) {
    const contamination = await this.detectContamination(content);
    
    // Additional validation checks
    const additionalChecks = {
      hasProperDutchSentenceStructure: this.validateSentenceStructure(content),
      hasCorrectDutchPunctuation: this.validatePunctuation(content),
      hasConsistentFormality: this.validateFormality(content),
      hasNaturalDutchFlow: this.validateNaturalFlow(content)
    };
    
    return {
      isPure: contamination.purityScore >= 95 && Object.values(additionalChecks).every(check => check.passed),
      purityScore: contamination.purityScore,
      contamination: contamination,
      additionalChecks: additionalChecks,
      recommendations: this.generateRecommendations(contamination, additionalChecks)
    };
  }

  /**
   * Generate recommendations for improving Dutch content purity
   */
  generateRecommendations(contamination, additionalChecks) {
    const recommendations = [];
    
    if (contamination.contaminations.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'language_contamination',
        message: `Gevonden ${contamination.contaminations.length} taalverontreinigingen die Nederlands/Engels mengen`,
        action: 'Gebruik de cleanDutchContent functie om automatische correctie toe te passen'
      });
    }
    
    if (!additionalChecks.hasNaturalDutchFlow.passed) {
      recommendations.push({
        priority: 'medium',
        type: 'natural_flow',
        message: 'Content klinkt niet natuurlijk voor Nederlandse lezers',
        action: 'Herformuleer zinnen om meer conversationeel en natuurlijk te klinken'
      });
    }
    
    return recommendations;
  }

  /**
   * Validate Dutch sentence structure
   */
  validateSentenceStructure(content) {
    // Check for proper Dutch sentence patterns
    const dutchPatterns = [
      /\b(omdat|doordat|aangezien)\s+.*\s+(is|zijn|wordt|worden)\b/g, // subordinate clauses
      /\b(de|het)\s+\w+\s+(van|voor|door|met)\s+/g, // proper article usage
    ];
    
    const matches = dutchPatterns.reduce((count, pattern) => {
      return count + (content.match(pattern) || []).length;
    }, 0);
    
    return {
      passed: matches > 0,
      score: Math.min(100, matches * 10),
      details: `Gevonden ${matches} correcte Nederlandse zinsstructuren`
    };
  }

  /**
   * Validate Dutch punctuation
   */
  validatePunctuation(content) {
    // Dutch-specific punctuation rules
    const issues = [];
    
    // Check for proper comma usage in Dutch
    if (content.includes(', omdat') || content.includes(', doordat')) {
      // This is correct Dutch punctuation
    } else if (content.match(/\s(omdat|doordat)\s/g)) {
      issues.push('Missing comma before subordinate clauses');
    }
    
    return {
      passed: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 20))
    };
  }

  /**
   * Validate formality consistency
   */
  validateFormality(content) {
    const formalIndicators = (content.match(/\b(u|uw|uzelf)\b/gi) || []).length;
    const informalIndicators = (content.match(/\b(je|jij|jouw|jezelf)\b/gi) || []).length;
    
    const isConsistent = (formalIndicators === 0) || (informalIndicators === 0) || 
                        (formalIndicators / (formalIndicators + informalIndicators)) > 0.8 ||
                        (informalIndicators / (formalIndicators + informalIndicators)) > 0.8;
    
    return {
      passed: isConsistent,
      formalCount: formalIndicators,
      informalCount: informalIndicators,
      recommendation: formalIndicators > informalIndicators ? 'formal' : 'informal'
    };
  }

  /**
   * Validate natural Dutch flow
   */
  validateNaturalFlow(content) {
    const artificialPhrases = [
      'in het kader van', 'met betrekking tot', 'ten aanzien van',
      'in de context van', 'met het oog op', 'ter zake van'
    ];
    
    const artificialCount = artificialPhrases.reduce((count, phrase) => {
      return count + (content.toLowerCase().split(phrase).length - 1);
    }, 0);
    
    return {
      passed: artificialCount < 3,
      artificialPhraseCount: artificialCount,
      score: Math.max(0, 100 - (artificialCount * 15)),
      suggestion: artificialCount > 0 ? 'Vervang formele uitdrukkingen door natuurlijkere alternatieven' : null
    };
  }
}

module.exports = DutchLanguageIsolationSpecialist;