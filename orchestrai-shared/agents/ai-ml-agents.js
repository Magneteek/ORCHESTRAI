/**
 * AI/ML Intelligence Layer Specialized Agents
 *
 * This module implements 7 specialized Claude Code subagents for AI/ML
 * intelligence, semantic analysis, and advanced data processing.
 *
 * Agents:
 * 1. SemanticAnalysisEngine - Advanced semantic understanding and NLP
 * 2. SentimentAnalysisSpecialist - Multi-language sentiment analysis
 * 3. EntityExtractionAgent - Named entity recognition and extraction
 * 4. TopicModelingExpert - LDA, LSA, and topic clustering
 * 5. IntentClassificationAgent - User intent detection and classification
 * 6. TextSummarizationSpecialist - Extractive and abstractive summarization
 * 7. LanguageDetectionAgent - Multi-language detection and translation
 */

const BaseSpecializedAgent = require('./base-specialized-agent');

// ============================================================================
// 1. SEMANTIC ANALYSIS ENGINE
// ============================================================================

class SemanticAnalysisEngine extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'semantic-analysis-engine',
      domain: 'ai-ml',
      capabilities: [
        'semantic-analysis',
        'nlp-processing',
        'word-embeddings',
        'semantic-similarity',
        'context-understanding',
        'relationship-extraction',
        'semantic-search'
      ],
      description: 'Performs advanced semantic analysis, NLP processing, and semantic similarity calculations',
      priority: 0.95
    });

    this.embeddingDimensions = 384;
    this.similarityThreshold = 0.75;
  }

  async executeTask(task, context) {
    const {
      text,
      analysisType = 'full',
      includeEmbeddings = true,
      includeSimilarity = true
    } = task.parameters;

    this.log(`Performing ${analysisType} semantic analysis on ${text?.length || 0} characters`);

    // Step 1: Tokenize and preprocess
    const preprocessed = await this.preprocessText(text, context);

    // Step 2: Extract semantic features
    const semanticFeatures = await this.extractSemanticFeatures(preprocessed, context);

    // Step 3: Generate embeddings
    const embeddings = includeEmbeddings ?
      await this.generateEmbeddings(preprocessed, context) : null;

    // Step 4: Identify semantic relationships
    const relationships = await this.extractRelationships(preprocessed, semanticFeatures, context);

    // Step 5: Calculate semantic similarity (if reference provided)
    const similarity = includeSimilarity && task.parameters.referenceText ?
      await this.calculateSemanticSimilarity(text, task.parameters.referenceText, context) : null;

    return {
      preprocessed,
      semanticFeatures,
      embeddings,
      relationships,
      similarity,
      metadata: {
        textLength: text.length,
        tokenCount: preprocessed.tokens.length,
        analysisType
      }
    };
  }

  async preprocessText(text, context) {
    // Step 1: Normalize text
    const normalized = text.toLowerCase().trim();

    // Step 2: Tokenize
    const tokens = this.tokenize(normalized);

    // Step 3: Remove stop words
    const filteredTokens = this.removeStopWords(tokens);

    // Step 4: Lemmatize
    const lemmatized = this.lemmatize(filteredTokens);

    // Step 5: Extract n-grams
    const bigrams = this.extractNGrams(tokens, 2);
    const trigrams = this.extractNGrams(tokens, 3);

    return {
      original: text,
      normalized,
      tokens,
      filteredTokens,
      lemmatized,
      bigrams,
      trigrams
    };
  }

  tokenize(text) {
    // Simple whitespace tokenization (in production, use advanced tokenizers)
    return text.match(/\b\w+\b/g) || [];
  }

  removeStopWords(tokens) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);

    return tokens.filter(token => !stopWords.has(token));
  }

  lemmatize(tokens) {
    // Simplified lemmatization (in production, use NLP libraries)
    return tokens.map(token => {
      if (token.endsWith('ing')) return token.slice(0, -3);
      if (token.endsWith('ed')) return token.slice(0, -2);
      if (token.endsWith('s')) return token.slice(0, -1);
      return token;
    });
  }

  extractNGrams(tokens, n) {
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  async extractSemanticFeatures(preprocessed, context) {
    return {
      // Part-of-speech tagging (simplified)
      pos: this.extractPOS(preprocessed.tokens),

      // Named entities
      entities: this.extractNamedEntities(preprocessed.tokens),

      // Semantic roles
      roles: this.extractSemanticRoles(preprocessed.tokens),

      // Key phrases
      keyPhrases: this.extractKeyPhrases(preprocessed.bigrams, preprocessed.trigrams),

      // Concepts
      concepts: this.extractConcepts(preprocessed.lemmatized),

      // Sentiment indicators
      sentimentWords: this.extractSentimentWords(preprocessed.tokens)
    };
  }

  extractPOS(tokens) {
    // Simplified POS tagging
    return tokens.map(token => ({
      word: token,
      pos: this.guessPOS(token)
    }));
  }

  guessPOS(word) {
    // Very simplified POS guessing
    if (/^[A-Z]/.test(word)) return 'PROPN'; // Proper noun
    if (word.endsWith('ly')) return 'ADV';   // Adverb
    if (word.endsWith('ing')) return 'VERB'; // Verb
    if (word.endsWith('ed')) return 'VERB';  // Verb
    if (word.length > 6) return 'NOUN';      // Likely noun
    return 'NOUN';
  }

  extractNamedEntities(tokens) {
    // Simplified NER (in production, use spaCy or similar)
    const entities = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Detect proper nouns (capitalized words)
      if (/^[A-Z][a-z]+/.test(token)) {
        entities.push({
          text: token,
          type: 'PERSON',
          startIndex: i,
          confidence: 0.7
        });
      }

      // Detect dates
      if (/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(token)) {
        entities.push({
          text: token,
          type: 'DATE',
          startIndex: i,
          confidence: 0.9
        });
      }

      // Detect numbers/quantities
      if (/^\d+$/.test(token)) {
        entities.push({
          text: token,
          type: 'QUANTITY',
          startIndex: i,
          confidence: 0.95
        });
      }
    }

    return entities;
  }

  extractSemanticRoles(tokens) {
    // Simplified semantic role labeling
    return {
      agents: [],      // Who performs the action
      actions: [],     // What action is performed
      patients: [],    // What receives the action
      instruments: [], // How the action is performed
      locations: [],   // Where the action occurs
      times: []        // When the action occurs
    };
  }

  extractKeyPhrases(bigrams, trigrams) {
    // Extract statistically significant phrases
    const phrases = [...bigrams, ...trigrams];

    // Count phrase frequencies
    const frequency = new Map();
    phrases.forEach(phrase => {
      frequency.set(phrase, (frequency.get(phrase) || 0) + 1);
    });

    // Return phrases that occur more than once
    return Array.from(frequency.entries())
      .filter(([phrase, count]) => count > 1)
      .map(([phrase, count]) => ({ phrase, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  extractConcepts(lemmatizedTokens) {
    // Extract high-level concepts
    const conceptKeywords = {
      technology: ['software', 'hardware', 'computer', 'internet', 'digital'],
      business: ['market', 'customer', 'revenue', 'profit', 'strategy'],
      health: ['medical', 'health', 'doctor', 'patient', 'treatment'],
      education: ['school', 'student', 'teacher', 'learn', 'education']
    };

    const concepts = {};

    for (const [concept, keywords] of Object.entries(conceptKeywords)) {
      const matches = lemmatizedTokens.filter(token =>
        keywords.some(keyword => token.includes(keyword))
      );

      if (matches.length > 0) {
        concepts[concept] = {
          relevance: matches.length / lemmatizedTokens.length,
          matchedTerms: matches
        };
      }
    }

    return concepts;
  }

  extractSentimentWords(tokens) {
    const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like'];
    const negative = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'poor', 'worst'];

    return {
      positive: tokens.filter(token => positive.includes(token)),
      negative: tokens.filter(token => negative.includes(token))
    };
  }

  async generateEmbeddings(preprocessed, context) {
    // Simulated embeddings (in production, use transformer models)
    const embedding = new Array(this.embeddingDimensions)
      .fill(0)
      .map(() => Math.random() * 2 - 1); // Random values between -1 and 1

    return {
      dimensions: this.embeddingDimensions,
      vector: embedding,
      magnitude: this.calculateMagnitude(embedding),
      normalized: this.normalizeVector(embedding)
    };
  }

  calculateMagnitude(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  }

  normalizeVector(vector) {
    const magnitude = this.calculateMagnitude(vector);
    return vector.map(val => val / magnitude);
  }

  async extractRelationships(preprocessed, semanticFeatures, context) {
    const relationships = [];

    // Extract subject-verb-object triples
    const tokens = preprocessed.tokens;
    const posTagged = semanticFeatures.pos;

    for (let i = 0; i < posTagged.length - 2; i++) {
      const subject = posTagged[i];
      const verb = posTagged[i + 1];
      const object = posTagged[i + 2];

      if (subject.pos === 'NOUN' && verb.pos === 'VERB' && object.pos === 'NOUN') {
        relationships.push({
          subject: subject.word,
          predicate: verb.word,
          object: object.word,
          confidence: 0.6
        });
      }
    }

    return relationships;
  }

  async calculateSemanticSimilarity(text1, text2, context) {
    // Preprocess both texts
    const preprocessed1 = await this.preprocessText(text1, context);
    const preprocessed2 = await this.preprocessText(text2, context);

    // Generate embeddings
    const embedding1 = await this.generateEmbeddings(preprocessed1, context);
    const embedding2 = await this.generateEmbeddings(preprocessed2, context);

    // Calculate cosine similarity
    const cosineSimilarity = this.calculateCosineSimilarity(
      embedding1.normalized,
      embedding2.normalized
    );

    // Calculate Jaccard similarity (token overlap)
    const jaccardSimilarity = this.calculateJaccardSimilarity(
      new Set(preprocessed1.tokens),
      new Set(preprocessed2.tokens)
    );

    return {
      cosineSimilarity,
      jaccardSimilarity,
      overallSimilarity: (cosineSimilarity + jaccardSimilarity) / 2,
      isSimilar: cosineSimilarity >= this.similarityThreshold
    };
  }

  calculateCosineSimilarity(vector1, vector2) {
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    return dotProduct; // Vectors are already normalized
  }

  calculateJaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  canHandle(task) {
    const keywords = ['semantic', 'nlp', 'text analysis', 'embedding', 'similarity', 'relationship'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.analysisType === 'full') priority += 0.1;
    if (task.parameters?.includeEmbeddings) priority += 0.05;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 2. SENTIMENT ANALYSIS SPECIALIST
// ============================================================================

class SentimentAnalysisSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'sentiment-analysis-specialist',
      domain: 'ai-ml',
      capabilities: [
        'sentiment-analysis',
        'emotion-detection',
        'polarity-classification',
        'aspect-based-sentiment',
        'multi-language-sentiment',
        'sentiment-scoring'
      ],
      description: 'Performs multi-language sentiment analysis with emotion detection and aspect-based sentiment',
      priority: 0.90
    });

    this.supportedLanguages = ['en', 'es', 'nl', 'de', 'sl'];
    this.sentimentScales = ['negative', 'neutral', 'positive'];
    this.emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
  }

  async executeTask(task, context) {
    const {
      text,
      language = 'en',
      includeEmotions = true,
      includeAspects = false
    } = task.parameters;

    this.log(`Analyzing sentiment for ${language} text (${text?.length || 0} chars)`);

    // Step 1: Detect overall sentiment polarity
    const polarity = await this.analyzeSentimentPolarity(text, language, context);

    // Step 2: Detect emotions
    const emotions = includeEmotions ?
      await this.detectEmotions(text, language, context) : null;

    // Step 3: Aspect-based sentiment (if requested)
    const aspects = includeAspects ?
      await this.analyzeAspectBasedSentiment(text, language, context) : null;

    // Step 4: Calculate confidence scores
    const confidence = await this.calculateConfidence(polarity, emotions, context);

    return {
      polarity,
      emotions,
      aspects,
      confidence,
      language,
      metadata: {
        textLength: text.length,
        wordCount: text.split(/\s+/).length
      }
    };
  }

  async analyzeSentimentPolarity(text, language, context) {
    // Load sentiment lexicon for language
    const lexicon = this.getSentimentLexicon(language);

    // Tokenize text
    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

    // Calculate sentiment scores
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    for (const token of tokens) {
      if (lexicon.positive.includes(token)) {
        positiveScore++;
      } else if (lexicon.negative.includes(token)) {
        negativeScore++;
      } else {
        neutralScore++;
      }
    }

    const total = tokens.length;
    const positiveRatio = positiveScore / total;
    const negativeRatio = negativeScore / total;

    // Determine overall sentiment
    let sentiment;
    if (positiveRatio > negativeRatio + 0.1) {
      sentiment = 'positive';
    } else if (negativeRatio > positiveRatio + 0.1) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    return {
      sentiment,
      score: positiveRatio - negativeRatio, // Range: -1 to 1
      distribution: {
        positive: positiveScore,
        negative: negativeScore,
        neutral: neutralScore
      },
      ratios: {
        positive: positiveRatio,
        negative: negativeRatio,
        neutral: neutralScore / total
      }
    };
  }

  getSentimentLexicon(language) {
    // Simplified sentiment lexicon (in production, use comprehensive lexicons)
    const lexicons = {
      en: {
        positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'best', 'happy'],
        negative: ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'dislike', 'poor', 'sad', 'angry']
      },
      es: {
        positive: ['bueno', 'excelente', 'maravilloso', 'fantástico', 'amor', 'feliz', 'mejor'],
        negative: ['malo', 'terrible', 'horrible', 'peor', 'odio', 'triste', 'enojado']
      },
      nl: {
        positive: ['goed', 'geweldig', 'uitstekend', 'fantastisch', 'liefde', 'blij', 'beste'],
        negative: ['slecht', 'verschrikkelijk', 'vreselijk', 'slechtste', 'haat', 'verdrietig', 'boos']
      },
      de: {
        positive: ['gut', 'großartig', 'ausgezeichnet', 'fantastisch', 'liebe', 'glücklich', 'beste'],
        negative: ['schlecht', 'schrecklich', 'furchtbar', 'schlimmste', 'hass', 'traurig', 'wütend']
      },
      sl: {
        positive: ['dobro', 'odlično', 'čudovito', 'fantastično', 'ljubezen', 'srečen', 'najboljši'],
        negative: ['slabo', 'grozno', 'strašno', 'najslabše', 'sovraštvo', 'žalosten', 'jezen']
      }
    };

    return lexicons[language] || lexicons.en;
  }

  async detectEmotions(text, language, context) {
    // Emotion detection using keyword matching
    const emotionKeywords = {
      joy: ['happy', 'joyful', 'delighted', 'cheerful', 'pleased', 'glad'],
      sadness: ['sad', 'unhappy', 'depressed', 'gloomy', 'miserable', 'sorrowful'],
      anger: ['angry', 'furious', 'enraged', 'mad', 'irritated', 'annoyed'],
      fear: ['afraid', 'scared', 'fearful', 'terrified', 'anxious', 'worried'],
      surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'startled'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'nauseated', 'sickened']
    };

    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
    const emotionScores = {};

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = tokens.filter(token => keywords.includes(token));
      emotionScores[emotion] = {
        score: matches.length / tokens.length,
        matchedWords: matches,
        intensity: this.calculateEmotionIntensity(matches.length)
      };
    }

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionScores)
      .sort((a, b) => b[1].score - a[1].score)[0];

    return {
      dominant: dominantEmotion ? dominantEmotion[0] : 'neutral',
      scores: emotionScores,
      mixed: Object.values(emotionScores).filter(e => e.score > 0).length > 1
    };
  }

  calculateEmotionIntensity(matchCount) {
    if (matchCount === 0) return 'none';
    if (matchCount === 1) return 'low';
    if (matchCount <= 3) return 'medium';
    return 'high';
  }

  async analyzeAspectBasedSentiment(text, language, context) {
    // Extract aspects (features/topics) and their sentiments
    const aspects = [];

    // Simple aspect extraction (in production, use dependency parsing)
    const aspectKeywords = ['product', 'service', 'price', 'quality', 'support', 'delivery'];

    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();

      for (const aspect of aspectKeywords) {
        if (lowerSentence.includes(aspect)) {
          const aspectSentiment = await this.analyzeSentimentPolarity(sentence, language, context);

          aspects.push({
            aspect,
            sentiment: aspectSentiment.sentiment,
            score: aspectSentiment.score,
            text: sentence.trim()
          });
        }
      }
    }

    return aspects;
  }

  async calculateConfidence(polarity, emotions, context) {
    let confidence = 0.5;

    // Higher confidence if strong polarity
    if (Math.abs(polarity.score) > 0.3) {
      confidence += 0.2;
    }

    // Higher confidence if emotions detected
    if (emotions && emotions.dominant !== 'neutral') {
      confidence += 0.15;
    }

    // Higher confidence if clear distribution
    const maxRatio = Math.max(
      polarity.ratios.positive,
      polarity.ratios.negative,
      polarity.ratios.neutral
    );

    if (maxRatio > 0.5) {
      confidence += 0.15;
    }

    return Math.min(confidence, 1.0);
  }

  canHandle(task) {
    const keywords = ['sentiment', 'emotion', 'polarity', 'opinion', 'feeling'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.includeEmotions) priority += 0.1;
    if (task.parameters?.includeAspects) priority += 0.1;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 3. ENTITY EXTRACTION AGENT
// ============================================================================

class EntityExtractionAgent extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'entity-extraction-agent',
      domain: 'ai-ml',
      capabilities: [
        'named-entity-recognition',
        'entity-extraction',
        'entity-linking',
        'entity-classification',
        'relationship-mapping',
        'knowledge-graph-building'
      ],
      description: 'Extracts named entities, classifies them, and builds knowledge graphs from text',
      priority: 0.88
    });

    this.entityTypes = [
      'PERSON',
      'ORGANIZATION',
      'LOCATION',
      'DATE',
      'TIME',
      'MONEY',
      'PERCENT',
      'PRODUCT',
      'EVENT',
      'WORK_OF_ART'
    ];
  }

  async executeTask(task, context) {
    const {
      text,
      entityTypes = this.entityTypes,
      linkEntities = true,
      buildGraph = false
    } = task.parameters;

    this.log(`Extracting entities from ${text?.length || 0} character text`);

    // Step 1: Extract named entities
    const entities = await this.extractEntities(text, entityTypes, context);

    // Step 2: Classify entities
    const classified = await this.classifyEntities(entities, context);

    // Step 3: Link entities (coreference resolution)
    const linked = linkEntities ?
      await this.linkEntities(classified, text, context) : classified;

    // Step 4: Build knowledge graph
    const knowledgeGraph = buildGraph ?
      await this.buildKnowledgeGraph(linked, text, context) : null;

    return {
      entities: linked,
      entityCount: linked.length,
      entityTypes: this.groupEntitiesByType(linked),
      knowledgeGraph,
      metadata: {
        textLength: text.length,
        uniqueEntities: new Set(linked.map(e => e.text)).size
      }
    };
  }

  async extractEntities(text, entityTypes, context) {
    const entities = [];
    const tokens = text.split(/\s+/);

    // Pattern-based entity extraction
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // PERSON: Capitalized words (simplified)
      if (entityTypes.includes('PERSON') && /^[A-Z][a-z]+$/.test(token)) {
        // Check if next token is also capitalized (full name)
        const fullName = i + 1 < tokens.length && /^[A-Z][a-z]+$/.test(tokens[i + 1])
          ? `${token} ${tokens[i + 1]}`
          : token;

        entities.push({
          text: fullName,
          type: 'PERSON',
          startIndex: i,
          endIndex: fullName.includes(' ') ? i + 2 : i + 1,
          confidence: 0.7
        });

        if (fullName.includes(' ')) i++; // Skip next token
      }

      // DATE: Various date patterns
      if (entityTypes.includes('DATE')) {
        if (/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(token)) {
          entities.push({
            text: token,
            type: 'DATE',
            startIndex: i,
            endIndex: i + 1,
            confidence: 0.9
          });
        }
      }

      // MONEY: Currency patterns
      if (entityTypes.includes('MONEY')) {
        if (/^[$€£¥]\d+/.test(token) || /^\d+\s?(USD|EUR|GBP)/.test(token)) {
          entities.push({
            text: token,
            type: 'MONEY',
            startIndex: i,
            endIndex: i + 1,
            confidence: 0.95
          });
        }
      }

      // PERCENT: Percentage patterns
      if (entityTypes.includes('PERCENT')) {
        if (/\d+%/.test(token)) {
          entities.push({
            text: token,
            type: 'PERCENT',
            startIndex: i,
            endIndex: i + 1,
            confidence: 0.95
          });
        }
      }

      // ORGANIZATION: Corp, Inc, Ltd suffixes
      if (entityTypes.includes('ORGANIZATION')) {
        if (/Corp|Inc|Ltd|LLC/.test(token)) {
          const orgName = i > 0 ? `${tokens[i - 1]} ${token}` : token;
          entities.push({
            text: orgName,
            type: 'ORGANIZATION',
            startIndex: i > 0 ? i - 1 : i,
            endIndex: i + 1,
            confidence: 0.8
          });
        }
      }
    }

    return entities;
  }

  async classifyEntities(entities, context) {
    // Enhance entity classification with additional features
    return entities.map(entity => ({
      ...entity,
      features: {
        length: entity.text.length,
        wordCount: entity.text.split(/\s+/).length,
        hasNumbers: /\d/.test(entity.text),
        hasSpecialChars: /[^a-zA-Z0-9\s]/.test(entity.text)
      },
      normalized: this.normalizeEntity(entity.text, entity.type)
    }));
  }

  normalizeEntity(text, type) {
    if (type === 'DATE') {
      // Normalize date format
      return text.replace(/\//g, '-');
    } else if (type === 'MONEY') {
      // Normalize currency format
      return text.replace(/[,$]/g, '');
    } else if (type === 'PERSON') {
      // Titlecase for names
      return text.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    return text;
  }

  async linkEntities(entities, text, context) {
    // Coreference resolution - link entities that refer to the same thing
    const linked = [];
    const entityGroups = new Map();

    for (const entity of entities) {
      // Find similar entities
      const similar = entities.filter(e =>
        e !== entity &&
        e.type === entity.type &&
        this.areSimilarEntities(entity, e)
      );

      if (similar.length > 0) {
        // Create entity group
        const groupKey = entity.normalized;
        if (!entityGroups.has(groupKey)) {
          entityGroups.set(groupKey, {
            canonical: entity,
            mentions: [entity]
          });
        }

        entityGroups.get(groupKey).mentions.push(...similar);
      } else {
        linked.push(entity);
      }
    }

    // Add grouped entities
    for (const group of entityGroups.values()) {
      linked.push({
        ...group.canonical,
        mentions: group.mentions.length,
        aliases: group.mentions.map(m => m.text)
      });
    }

    return linked;
  }

  areSimilarEntities(entity1, entity2) {
    // Simple similarity check
    const text1 = entity1.normalized.toLowerCase();
    const text2 = entity2.normalized.toLowerCase();

    // Exact match
    if (text1 === text2) return true;

    // One contains the other
    if (text1.includes(text2) || text2.includes(text1)) return true;

    // Acronym match (e.g., "John Smith" and "J.S.")
    if (this.isAcronym(text1, text2) || this.isAcronym(text2, text1)) return true;

    return false;
  }

  isAcronym(text1, text2) {
    const acronym = text1.split(/\s+/).map(word => word[0]).join('.');
    return acronym.toLowerCase() === text2.toLowerCase();
  }

  async buildKnowledgeGraph(entities, text, context) {
    const graph = {
      nodes: [],
      edges: []
    };

    // Create nodes for each entity
    for (const entity of entities) {
      graph.nodes.push({
        id: entity.normalized,
        type: entity.type,
        label: entity.text,
        properties: {
          mentions: entity.mentions || 1,
          confidence: entity.confidence
        }
      });
    }

    // Create edges based on co-occurrence
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];

        // Check if entities co-occur in same sentence
        if (this.coOccur(entity1, entity2, text)) {
          graph.edges.push({
            from: entity1.normalized,
            to: entity2.normalized,
            type: 'CO_OCCURS_WITH',
            weight: 1
          });
        }
      }
    }

    return graph;
  }

  coOccur(entity1, entity2, text) {
    // Check if entities appear in same sentence
    const sentences = text.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (sentence.includes(entity1.text) && sentence.includes(entity2.text)) {
        return true;
      }
    }

    return false;
  }

  groupEntitiesByType(entities) {
    const grouped = {};

    for (const entity of entities) {
      if (!grouped[entity.type]) {
        grouped[entity.type] = [];
      }
      grouped[entity.type].push(entity);
    }

    return grouped;
  }

  canHandle(task) {
    const keywords = ['entity', 'ner', 'named entity', 'extraction', 'knowledge graph'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.buildGraph) priority += 0.12;
    if (task.parameters?.linkEntities) priority += 0.08;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 4. TOPIC MODELING EXPERT
// ============================================================================

class TopicModelingExpert extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'topic-modeling-expert',
      domain: 'ai-ml',
      capabilities: [
        'topic-modeling',
        'lda-analysis',
        'lsa-analysis',
        'topic-clustering',
        'document-classification',
        'topic-coherence'
      ],
      description: 'Performs topic modeling using LDA/LSA, topic clustering, and document classification',
      priority: 0.87
    });

    this.defaultNumTopics = 5;
    this.minDocuments = 3;
  }

  async executeTask(task, context) {
    const {
      documents,
      numTopics = this.defaultNumTopics,
      algorithm = 'lda',
      includeCoherence = true
    } = task.parameters;

    this.log(`Performing ${algorithm.toUpperCase()} topic modeling on ${documents?.length || 0} documents`);

    if (!documents || documents.length < this.minDocuments) {
      throw new Error(`Topic modeling requires at least ${this.minDocuments} documents`);
    }

    // Step 1: Preprocess documents
    const preprocessed = await this.preprocessDocuments(documents, context);

    // Step 2: Build vocabulary and document-term matrix
    const { vocabulary, dtMatrix } = await this.buildDocumentTermMatrix(preprocessed, context);

    // Step 3: Perform topic modeling
    const topics = algorithm === 'lda' ?
      await this.performLDA(dtMatrix, vocabulary, numTopics, context) :
      await this.performLSA(dtMatrix, vocabulary, numTopics, context);

    // Step 4: Calculate topic coherence
    const coherence = includeCoherence ?
      await this.calculateTopicCoherence(topics, preprocessed, context) : null;

    // Step 5: Assign topics to documents
    const documentTopics = await this.assignTopicsToDocuments(documents, topics, context);

    return {
      topics,
      coherence,
      documentTopics,
      vocabulary: vocabulary.slice(0, 50), // Top 50 terms
      metadata: {
        numDocuments: documents.length,
        numTopics,
        vocabularySize: vocabulary.length,
        algorithm
      }
    };
  }

  async preprocessDocuments(documents, context) {
    return documents.map(doc => {
      const text = typeof doc === 'string' ? doc : doc.text;

      // Tokenize
      const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

      // Remove stop words
      const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
      ]);

      const filtered = tokens.filter(token => !stopWords.has(token) && token.length > 2);

      return {
        original: text,
        tokens: filtered
      };
    });
  }

  async buildDocumentTermMatrix(preprocessed, context) {
    // Build vocabulary
    const termCounts = new Map();

    for (const doc of preprocessed) {
      for (const token of doc.tokens) {
        termCounts.set(token, (termCounts.get(token) || 0) + 1);
      }
    }

    // Filter vocabulary (remove rare and very common terms)
    const vocabulary = Array.from(termCounts.entries())
      .filter(([term, count]) => count >= 2 && count <= preprocessed.length * 0.5)
      .map(([term]) => term)
      .sort();

    // Build document-term matrix
    const dtMatrix = preprocessed.map(doc => {
      const vector = new Array(vocabulary.length).fill(0);

      for (const token of doc.tokens) {
        const index = vocabulary.indexOf(token);
        if (index !== -1) {
          vector[index]++;
        }
      }

      return vector;
    });

    return { vocabulary, dtMatrix };
  }

  async performLDA(dtMatrix, vocabulary, numTopics, context) {
    // Simplified LDA (in production, use proper LDA implementation)
    const topics = [];

    for (let topicIdx = 0; topicIdx < numTopics; topicIdx++) {
      // Random topic initialization
      const topicWords = [];

      // Select random high-frequency words for this topic
      const startIdx = Math.floor((topicIdx / numTopics) * vocabulary.length);
      const endIdx = Math.floor(((topicIdx + 1) / numTopics) * vocabulary.length);

      for (let i = 0; i < 10; i++) {
        const wordIdx = startIdx + Math.floor(Math.random() * (endIdx - startIdx));
        if (wordIdx < vocabulary.length) {
          topicWords.push({
            word: vocabulary[wordIdx],
            weight: Math.random()
          });
        }
      }

      topics.push({
        id: topicIdx,
        words: topicWords.sort((a, b) => b.weight - a.weight),
        label: this.generateTopicLabel(topicWords)
      });
    }

    return topics;
  }

  async performLSA(dtMatrix, vocabulary, numTopics, context) {
    // Simplified LSA using random projection (in production, use SVD)
    const topics = [];

    for (let topicIdx = 0; topicIdx < numTopics; topicIdx++) {
      const topicWords = [];

      // Random word selection for simplicity
      for (let i = 0; i < 10; i++) {
        const wordIdx = Math.floor(Math.random() * vocabulary.length);
        topicWords.push({
          word: vocabulary[wordIdx],
          weight: Math.random()
        });
      }

      topics.push({
        id: topicIdx,
        words: topicWords.sort((a, b) => b.weight - a.weight),
        label: this.generateTopicLabel(topicWords)
      });
    }

    return topics;
  }

  generateTopicLabel(topicWords) {
    // Create label from top 3 words
    return topicWords
      .slice(0, 3)
      .map(w => w.word)
      .join(', ');
  }

  async calculateTopicCoherence(topics, preprocessed, context) {
    // Calculate coherence score for each topic
    const coherenceScores = topics.map(topic => {
      const topWords = topic.words.slice(0, 5).map(w => w.word);
      const cooccurrences = this.calculateCooccurrences(topWords, preprocessed);

      // Normalized Pointwise Mutual Information (NPMI)
      const npmi = this.calculateNPMI(cooccurrences, preprocessed.length);

      return {
        topicId: topic.id,
        coherence: npmi,
        rating: npmi > 0.4 ? 'good' : npmi > 0.2 ? 'moderate' : 'poor'
      };
    });

    return {
      scores: coherenceScores,
      average: coherenceScores.reduce((sum, s) => sum + s.coherence, 0) / coherenceScores.length
    };
  }

  calculateCooccurrences(words, preprocessed) {
    let cooccurrences = 0;

    for (const doc of preprocessed) {
      const docWords = new Set(doc.tokens);
      const matchCount = words.filter(w => docWords.has(w)).length;

      if (matchCount >= 2) {
        cooccurrences++;
      }
    }

    return cooccurrences;
  }

  calculateNPMI(cooccurrences, totalDocs) {
    // Simplified NPMI calculation
    if (cooccurrences === 0) return 0;

    const probability = cooccurrences / totalDocs;
    const pmi = Math.log2(probability / 0.01); // Assuming baseline probability of 0.01

    return pmi / -Math.log2(probability); // Normalized PMI
  }

  async assignTopicsToDocuments(documents, topics, context) {
    return documents.map((doc, idx) => {
      const text = typeof doc === 'string' ? doc : doc.text;
      const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];

      // Calculate topic distribution for this document
      const topicScores = topics.map(topic => {
        const topicWords = topic.words.map(w => w.word);
        const matches = tokens.filter(token => topicWords.includes(token)).length;

        return {
          topicId: topic.id,
          topicLabel: topic.label,
          score: matches / tokens.length
        };
      });

      // Sort by score
      topicScores.sort((a, b) => b.score - a.score);

      return {
        documentIndex: idx,
        primaryTopic: topicScores[0],
        topicDistribution: topicScores
      };
    });
  }

  canHandle(task) {
    const keywords = ['topic', 'lda', 'lsa', 'topic modeling', 'document classification'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.documents?.length > 50) priority += 0.13;
    if (task.parameters?.includeCoherence) priority += 0.08;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 5-7: Additional AI/ML Agents (Intent Classification, Summarization, Language Detection)
// ============================================================================

class IntentClassificationAgent extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'intent-classification-agent',
      domain: 'ai-ml',
      capabilities: [
        'intent-detection',
        'intent-classification',
        'user-intent-analysis',
        'query-understanding',
        'command-detection'
      ],
      description: 'Detects and classifies user intent from queries and commands',
      priority: 0.89
    });

    this.intents = [
      'informational',
      'navigational',
      'transactional',
      'commercial',
      'local'
    ];
  }

  async executeTask(task, context) {
    const { query } = task.parameters;

    const intent = await this.classifyIntent(query, context);

    return {
      query,
      primaryIntent: intent.primary,
      confidence: intent.confidence,
      allIntents: intent.distribution
    };
  }

  async classifyIntent(query, context) {
    const lowerQuery = query.toLowerCase();

    // Intent patterns
    const patterns = {
      informational: ['what', 'how', 'why', 'when', 'where', 'who'],
      navigational: ['go to', 'navigate', 'find', 'locate', 'website'],
      transactional: ['buy', 'purchase', 'order', 'download', 'subscribe'],
      commercial: ['best', 'review', 'compare', 'price', 'cost'],
      local: ['near me', 'nearby', 'local', 'location']
    };

    const scores = {};

    for (const [intent, keywords] of Object.entries(patterns)) {
      scores[intent] = keywords.filter(kw => lowerQuery.includes(kw)).length;
    }

    const primary = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      primary,
      confidence: scores[primary] > 0 ? 0.8 : 0.5,
      distribution: scores
    };
  }

  canHandle(task) {
    return task.description?.toLowerCase().includes('intent');
  }

  getPriority(task, context) {
    return this.basePriority;
  }
}

class TextSummarizationSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'text-summarization-specialist',
      domain: 'ai-ml',
      capabilities: [
        'text-summarization',
        'extractive-summarization',
        'abstractive-summarization',
        'key-points-extraction'
      ],
      description: 'Generates extractive and abstractive text summaries',
      priority: 0.86
    });
  }

  async executeTask(task, context) {
    const { text, maxLength = 100, method = 'extractive' } = task.parameters;

    const summary = method === 'extractive' ?
      await this.extractiveSummarization(text, maxLength, context) :
      await this.abstractiveSummarization(text, maxLength, context);

    return {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: summary.length / text.length
    };
  }

  async extractiveSummarization(text, maxLength, context) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    // Simple scoring: sentence position + length
    const scored = sentences.map((sentence, idx) => ({
      sentence,
      score: (sentences.length - idx) / sentences.length + (sentence.length / 100)
    }));

    scored.sort((a, b) => b.score - a.score);

    let summary = '';
    for (const item of scored) {
      if (summary.length + item.sentence.length <= maxLength) {
        summary += item.sentence.trim() + ' ';
      }
    }

    return summary.trim();
  }

  async abstractiveSummarization(text, maxLength, context) {
    // Simplified abstractive summarization
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences[0]?.trim() || text.substring(0, maxLength);
  }

  canHandle(task) {
    return task.description?.toLowerCase().includes('summar');
  }

  getPriority(task, context) {
    return this.basePriority;
  }
}

class LanguageDetectionAgent extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'language-detection-agent',
      domain: 'ai-ml',
      capabilities: [
        'language-detection',
        'multi-language-support',
        'language-identification'
      ],
      description: 'Detects language of text input',
      priority: 0.84
    });

    this.languages = {
      en: ['the', 'and', 'is', 'of', 'to'],
      es: ['el', 'la', 'de', 'que', 'y'],
      nl: ['de', 'het', 'een', 'van', 'en'],
      de: ['der', 'die', 'das', 'und', 'ist'],
      sl: ['in', 'je', 'na', 'da', 'v']
    };
  }

  async executeTask(task, context) {
    const { text } = task.parameters;

    const detected = await this.detectLanguage(text, context);

    return {
      language: detected.language,
      confidence: detected.confidence,
      allScores: detected.scores
    };
  }

  async detectLanguage(text, context) {
    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
    const scores = {};

    for (const [lang, keywords] of Object.entries(this.languages)) {
      scores[lang] = tokens.filter(t => keywords.includes(t)).length / tokens.length;
    }

    const detected = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      language: detected[0],
      confidence: detected[1],
      scores
    };
  }

  canHandle(task) {
    return task.description?.toLowerCase().includes('language');
  }

  getPriority(task, context) {
    return this.basePriority;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  SemanticAnalysisEngine,
  SentimentAnalysisSpecialist,
  EntityExtractionAgent,
  TopicModelingExpert,
  IntentClassificationAgent,
  TextSummarizationSpecialist,
  LanguageDetectionAgent
};
