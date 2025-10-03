/**
 * ORCHESTRAI Chain-of-Translation (CoTR) Prompting System
 * 
 * Implements explicit language context preservation through structured prompting
 * Prevents language mixing and maintains target language consistency
 * 
 * Based on 2024 research on multilingual prompting techniques
 */

class CoTRPromptingSystem {
  constructor(languageFramework) {
    this.languageFramework = languageFramework;
    this.supportedLanguages = languageFramework.getSupportedLanguages();
    
    // Language-specific prompting templates
    this.promptTemplates = {
      'sl': {
        systemPrompt: `Odgovorna si za ustvarjanje kakovostnih vsebin IZKLJUČNO v slovenskem jeziku. 

KRITIČNE NAVODILA:
- Piši SAMO v slovenščini, nikoli ne meša drugih jezikov
- Uporabljaj slovensko terminologijo in kulturnos posebnosti
- Preverjaj vsako poved za jezikovo čistost
- Ohranjaj slovenski stil komunikacije

Če zaznavaš, da bi lahko prešel/-a v drug jezik, USTAVI SE in se vrni k slovenščini.`,
        
        contentInstructions: `Za vsebino velja:
1. JEZIK: Izključno slovenščina (sl)
2. KULTURA: Slovenske vrednote in komunikacijski vzorci
3. TERMINOLOGIJA: Slovenska strokovna terminologija
4. STIL: Jasen, neposreden, zaupanja vreden
5. VALIDACIJA: Preveri vsako poved za jezikovo čistost`,

        qualityCheck: `Preveri svojo vsebino:
- ✅ Je celotna vsebina v slovenščini?
- ✅ So uporabljene slovenske besede in fraze?
- ✅ So upoštevane slovenske kulturne posebnosti?
- ✅ Je terminologija slovensko strokovna?
- ❌ NI prisotnih besed iz drugih jezikov?`
      },

      'en': {
        systemPrompt: `You are responsible for creating high-quality content EXCLUSIVELY in English.

CRITICAL INSTRUCTIONS:
- Write ONLY in English, never mix other languages
- Use English terminology and cultural specifics
- Check every sentence for language purity
- Maintain English communication style

If you detect potential language switching, STOP and return to English.`,
        
        contentInstructions: `For content:
1. LANGUAGE: Exclusively English (en)
2. CULTURE: English-speaking cultural values and patterns
3. TERMINOLOGY: English professional terminology
4. STYLE: Clear, direct, trustworthy
5. VALIDATION: Check every sentence for language purity`,

        qualityCheck: `Verify your content:
- ✅ Is all content in English?
- ✅ Are English words and phrases used?
- ✅ Are English cultural specifics considered?
- ✅ Is terminology professionally English?
- ❌ NO words from other languages present?`
      },

      'de': {
        systemPrompt: `Sie sind verantwortlich für die Erstellung hochwertiger Inhalte AUSSCHLIESSLICH in deutscher Sprache.

KRITISCHE ANWEISUNGEN:
- Schreiben Sie NUR auf Deutsch, mischen Sie niemals andere Sprachen
- Verwenden Sie deutsche Terminologie und kulturelle Besonderheiten
- Überprüfen Sie jeden Satz auf sprachliche Reinheit
- Bewahren Sie deutschen Kommunikationsstil

Falls Sie potenzielle Sprachwechsel erkennen, STOPPEN Sie und kehren Sie zum Deutschen zurück.`,
        
        contentInstructions: `Für Inhalte gilt:
1. SPRACHE: Ausschließlich Deutsch (de)
2. KULTUR: Deutsche Werte und Kommunikationsmuster
3. TERMINOLOGIE: Deutsche Fachterminologie
4. STIL: Klar, direkt, vertrauenswürdig
5. VALIDIERUNG: Prüfen Sie jeden Satz auf sprachliche Reinheit`,

        qualityCheck: `Überprüfen Sie Ihren Inhalt:
- ✅ Ist der gesamte Inhalt auf Deutsch?
- ✅ Werden deutsche Wörter und Phrasen verwendet?
- ✅ Sind deutsche kulturelle Besonderheiten berücksichtigt?
- ✅ Ist die Terminologie professionell deutsch?
- ❌ KEINE Wörter aus anderen Sprachen vorhanden?`
      }
    };

    // Temperature settings for different tasks
    this.temperatureSettings = this.languageFramework.getTemperatureSettings();
  }

  /**
   * Generate language-specific system prompt
   */
  generateSystemPrompt(languageCode, contentType = 'article') {
    const template = this.promptTemplates[languageCode];
    if (!template) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }

    const languageInfo = this.supportedLanguages[languageCode];
    
    return `${template.systemPrompt}

JĘZYK/SPRACHE/LANGUAGE: ${languageInfo.formal} (${languageCode})
CONTENT TYPE: ${contentType}
TEMPERATURE: ${this.temperatureSettings.consistency}

${template.contentInstructions}

CRITICAL: Maintain ${languageInfo.formal} language purity throughout the entire response.`;
  }

  /**
   * Generate content creation prompt with CoTR structure
   */
  generateContentPrompt(languageCode, contentRequest, contextData = null) {
    const template = this.promptTemplates[languageCode];
    const languageInfo = this.supportedLanguages[languageCode];
    
    let contextSection = '';
    if (contextData) {
      contextSection = `
KONTEKST/KONTEXT/CONTEXT (${languageInfo.formal}):
${this.formatContextForLanguage(contextData, languageCode)}
`;
    }

    return `${this.generateSystemPrompt(languageCode, 'article')}

${contextSection}

NALOGA/AUFGABE/TASK:
${contentRequest}

POSTOPEK/VERFAHREN/PROCESS:
1. Preberi/Lesen Sie/Read the requirements in ${languageInfo.formal}
2. Načrtuj/Planen Sie/Plan content structure in ${languageInfo.formal}
3. Generiraj/Generieren Sie/Generate content EXCLUSIVELY in ${languageInfo.formal}
4. Preveri/Überprüfen Sie/Check language purity

${template.qualityCheck}

Begin writing in ${languageInfo.formal} now:`;
  }

  /**
   * Generate enhancement prompt for content improvement
   */
  generateEnhancementPrompt(languageCode, currentContent, improvementAreas) {
    const template = this.promptTemplates[languageCode];
    const languageInfo = this.supportedLanguages[languageCode];
    
    return `${this.generateSystemPrompt(languageCode, 'enhancement')}

OBSTOJEČA VSEBINA/BESTEHENDER INHALT/CURRENT CONTENT:
${currentContent.substring(0, 1000)}...

PODROČJA IZBOLJŠAV/VERBESSERUNGSBEREICHE/IMPROVEMENT AREAS:
${improvementAreas.map(area => `- ${area}`).join('\n')}

ENHANCEMENT INSTRUCTIONS IN ${languageInfo.formal}:
1. Ohranjaj jezikovo čistost - ${languageInfo.formal} ONLY
2. Izboljšaj navedena področja
3. Dodaj vsebino samo v ${languageInfo.formal}
4. Preveri konsistentnost jezika

${template.qualityCheck}

ENHANCED CONTENT IN ${languageInfo.formal}:`;
  }

  /**
   * Generate validation prompt for language purity check
   */
  generateValidationPrompt(languageCode, contentToValidate) {
    const languageInfo = this.supportedLanguages[languageCode];
    
    return `You are a ${languageInfo.formal} language purity validator.

TASK: Analyze the following content for language consistency and purity.

TARGET LANGUAGE: ${languageInfo.formal} (${languageCode})

CONTENT TO VALIDATE:
${contentToValidate}

VALIDATION CHECKLIST:
1. Language Purity: Is content 100% in ${languageInfo.formal}?
2. Mixed Languages: Are there words/phrases from other languages?
3. Cultural Context: Does content reflect ${languageInfo.formal} cultural patterns?
4. Terminology: Is professional terminology correctly in ${languageInfo.formal}?

Provide validation results in JSON format:
{
  "isPure": boolean,
  "mixedLanguageDetected": boolean,
  "problematicSentences": ["sentence1", "sentence2"],
  "score": 0-100,
  "recommendations": ["recommendation1", "recommendation2"]
}`;
  }

  /**
   * Format context data for specific language
   */
  formatContextForLanguage(contextData, languageCode) {
    const languageInfo = this.supportedLanguages[languageCode];
    
    let formatted = '';
    
    if (contextData.psychographicSegments) {
      const segmentLabel = {
        'sl': 'Psihografski segmenti',
        'en': 'Psychographic Segments', 
        'de': 'Psychografische Segmente'
      }[languageCode] || 'Psychographic Segments';
      
      formatted += `\n${segmentLabel}:\n`;
      contextData.psychographicSegments.forEach(segment => {
        formatted += `- ${segment.name}: ${segment.description}\n`;
      });
    }

    if (contextData.keywords) {
      const keywordLabel = {
        'sl': 'Ključne besede',
        'en': 'Keywords',
        'de': 'Schlüsselwörter'
      }[languageCode] || 'Keywords';
      
      formatted += `\n${keywordLabel}: ${contextData.keywords.slice(0, 10).join(', ')}\n`;
    }

    if (contextData.culturalValues) {
      const cultureLabel = {
        'sl': 'Kulturne vrednote',
        'en': 'Cultural Values',
        'de': 'Kulturelle Werte'
      }[languageCode] || 'Cultural Values';
      
      formatted += `\n${cultureLabel}: ${contextData.culturalValues.join(', ')}\n`;
    }

    return formatted;
  }

  /**
   * Apply temperature optimization for language consistency
   */
  getOptimizedTemperature(taskType, languageCode) {
    const baseSettings = this.temperatureSettings;
    
    // Language-specific adjustments
    const languageAdjustments = {
      'sl': { adjustment: -0.05 }, // Slovenian needs slightly lower temperature
      'de': { adjustment: 0.0 },   // German is stable
      'en': { adjustment: 0.05 },  // English can handle slightly higher
      'es': { adjustment: 0.0 },   // Spanish baseline
      'nl': { adjustment: -0.03 }  // Dutch slightly conservative
    };

    const taskTemperatures = {
      'consistency': baseSettings.consistency,
      'creativity': baseSettings.creativity,
      'validation': baseSettings.validation,
      'enhancement': 0.4 // Mid-range for enhancements
    };

    const baseTemp = taskTemperatures[taskType] || baseSettings.consistency;
    const langAdjust = languageAdjustments[languageCode]?.adjustment || 0;
    
    return Math.max(0.1, Math.min(0.9, baseTemp + langAdjust));
  }

  /**
   * Generate language switching prevention instructions
   */
  generateAntiSwitchingInstructions(languageCode) {
    const languageInfo = this.supportedLanguages[languageCode];
    
    return {
      'sl': [
        'Če opazite angleške ali druge tuje besede, jih TAKOJ zamenjajte s slovenskimi.',
        'Preverjajte vsako poved pred pisanjem naslednje.',
        'Če niste prepričani o slovenski besedi, uporabite opisno formulacijo v slovenščini.',
        'NIKOLI ne uporabljajte angleških terminov, tudi če so pogosti.'
      ],
      'en': [
        'If you notice non-English words, IMMEDIATELY replace them with English equivalents.',
        'Check each sentence before writing the next one.',
        'If unsure about English terminology, use descriptive English phrasing.',
        'NEVER use foreign terms even if commonly used.'
      ],
      'de': [
        'Falls Sie nicht-deutsche Wörter bemerken, ersetzen Sie diese SOFORT durch deutsche Äquivalente.',
        'Überprüfen Sie jeden Satz vor dem nächsten.',
        'Bei Unsicherheit über deutsche Terminologie, verwenden Sie beschreibende deutsche Formulierungen.',
        'Verwenden Sie NIEMALS Fremdwörter, auch wenn sie gebräuchlich sind.'
      ]
    }[languageCode] || [];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages);
  }

  /**
   * Validate language code
   */
  isLanguageSupported(languageCode) {
    return this.supportedLanguages.hasOwnProperty(languageCode);
  }
}

module.exports = CoTRPromptingSystem;