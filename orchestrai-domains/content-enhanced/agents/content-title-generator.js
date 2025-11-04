const EventEmitter = require('events');

class ContentTitleGenerator extends EventEmitter {
  constructor(crystallineMemory) {
    super();
    this.id = 'content-title-generator';
    this.name = 'Content Title Generation Agent';
    this.specialization = 'title-generation-optimization';
    this.claudeCodeAgent = 'seo-content-optimization';
    this.crystallineMemory = crystallineMemory;
    this.status = 'active';
    
    // Agent capabilities
    this.capabilities = [
      'seo-title-optimization',
      'emotional-trigger-integration',
      'ctr-optimization',
      'title-variant-generation',
      'a-b-testing-suggestions',
      'brand-voice-alignment'
    ];
    
    // Content metrics and thresholds
    this.contentMetrics = {
      seoOptimization: { min: 85, target: 95 },
      clickThroughPotential: { min: 80, target: 90 },
      brandAlignment: { min: 90, target: 100 }
    };
    
    // Title generation data
    this.titlePatterns = new Map();
    this.emotionalTriggers = new Map();
    this.performanceHistory = [];
    
    // Initialize emotional triggers database
    this.initializeEmotionalTriggers();
    
    // Initialize title patterns
    this.initializeTitlePatterns();
  }

  initializeEmotionalTriggers() {
    this.emotionalTriggers.set('urgency', [
      'Now', 'Today', 'Instantly', 'Immediately', 'Fast', 'Quick', 'Rapid'
    ]);
    
    this.emotionalTriggers.set('exclusivity', [
      'Secret', 'Exclusive', 'Hidden', 'Insider', 'Private', 'Confidential', 'Elite'
    ]);
    
    this.emotionalTriggers.set('authority', [
      'Expert', 'Professional', 'Proven', 'Certified', 'Official', 'Authority', 'Master'
    ]);
    
    this.emotionalTriggers.set('curiosity', [
      'Surprising', 'Shocking', 'Unknown', 'Mysterious', 'Strange', 'Weird', 'Bizarre'
    ]);
    
    this.emotionalTriggers.set('benefit', [
      'Ultimate', 'Complete', 'Essential', 'Perfect', 'Best', 'Top', 'Amazing'
    ]);
    
    this.emotionalTriggers.set('fear', [
      'Avoid', 'Mistake', 'Warning', 'Danger', 'Risk', 'Trap', 'Pitfall'
    ]);
    
    this.emotionalTriggers.set('social_proof', [
      'Popular', 'Trending', 'Viral', 'Everyone', 'Most', 'Favorite', 'Loved'
    ]);
  }

  initializeTitlePatterns() {
    this.titlePatterns.set('how_to', [
      'How to {action} {topic}',
      'How to {action} {topic} (Step-by-Step Guide)',
      'How to {action} {topic} Like a Pro',
      'How to {action} {topic} in {timeframe}',
      'How to {action} {topic} Without {pain_point}'
    ]);
    
    this.titlePatterns.set('listicle', [
      '{number} {topic} {benefits}',
      '{number} Ways to {action} {topic}',
      '{number} {topic} Tips That Actually Work',
      '{number} Essential {topic} Strategies',
      'Top {number} {topic} {mistakes/secrets/tips}'
    ]);
    
    this.titlePatterns.set('guide', [
      'The Complete Guide to {topic}',
      'The Ultimate {topic} Guide for {year}',
      '{topic}: Everything You Need to Know',
      'The Definitive {topic} Resource',
      'Your Complete {topic} Handbook'
    ]);
    
    this.titlePatterns.set('comparison', [
      '{option1} vs {option2}: Which is Better?',
      '{topic} Comparison: {option1} vs {option2}',
      'Choosing Between {option1} and {option2}',
      '{option1} or {option2}? The Ultimate Comparison'
    ]);
    
    this.titlePatterns.set('problem_solution', [
      '{problem}? Here\'s How to Fix It',
      'Struggling with {problem}? Try This',
      'The Solution to {problem} Nobody Talks About',
      'Finally! A Real Solution to {problem}'
    ]);
  }

  async generateOptimizedTitles(task, data) {
    try {
      console.log(`🎯 Title Generator: Creating titles for "${data.topic}"`);
      const startTime = Date.now();
      
      // Extract core parameters
      const topic = data.topic || data.mainTopic || 'Content Topic';
      const targetKeywords = data.targetKeywords || [];
      const contentType = data.contentType || 'article';
      const brandName = data.brandName || '';
      const industry = data.industry || 'General';
      const targetAudience = data.targetAudience || 'general';
      
      // Phase 1: Generate base title variations
      console.log('🔍 Phase 1: Generating base title variations...');
      const baseTitles = await this.generateBaseTitles(topic, targetKeywords, contentType);
      
      // Phase 2: Apply emotional triggers
      console.log('🔍 Phase 2: Applying emotional triggers...');
      const emotionallyOptimizedTitles = await this.applyEmotionalTriggers(baseTitles, topic, targetAudience);
      
      // Phase 3: SEO optimization
      console.log('🔍 Phase 3: SEO optimization analysis...');
      const seoOptimizedTitles = await this.optimizeForSEO(emotionallyOptimizedTitles, targetKeywords);
      
      // Phase 4: CTR prediction and scoring
      console.log('🔍 Phase 4: CTR prediction and scoring...');
      const scoredTitles = await this.predictCTRAndScore(seoOptimizedTitles, industry, contentType);
      
      // Phase 5: Brand voice alignment
      console.log('🔍 Phase 5: Brand voice alignment...');
      const brandAlignedTitles = await this.alignWithBrandVoice(scoredTitles, brandName, industry);
      
      // Phase 6: A/B testing recommendations
      console.log('🔍 Phase 6: A/B testing recommendations...');
      const abTestingRecommendations = await this.generateABTestingRecommendations(brandAlignedTitles);
      
      const processingTime = Date.now() - startTime;
      
      // Construct comprehensive title generation result
      const titleResult = {
        success: true,
        analysis: {
          topic,
          targetKeywords,
          contentType,
          industry,
          processingTime
        },
        primaryTitles: brandAlignedTitles.slice(0, 8), // Top 8 titles
        titleVariations: {
          emotional: this.categorizeTitlesByEmotion(brandAlignedTitles),
          length: this.categorizeTitlesByLength(brandAlignedTitles),
          style: this.categorizeTitlesByStyle(brandAlignedTitles)
        },
        abTestingRecommendations,
        seoAnalysis: {
          keywordIntegration: this.analyzeKeywordIntegration(brandAlignedTitles, targetKeywords),
          characterLengthAnalysis: this.analyzeCharacterLengths(brandAlignedTitles),
          competitiveAnalysis: await this.performCompetitiveAnalysis(topic, targetKeywords)
        },
        emotionalAnalysis: {
          triggerDistribution: this.analyzeTriggerDistribution(brandAlignedTitles),
          emotionalScore: this.calculateEmotionalScore(brandAlignedTitles),
          audienceAlignment: this.assessAudienceAlignment(brandAlignedTitles, targetAudience)
        },
        recommendations: {
          topPerformer: brandAlignedTitles[0],
          abTestCandidates: brandAlignedTitles.slice(0, 3),
          optimizationTips: this.generateOptimizationTips(brandAlignedTitles, targetKeywords),
          nextSteps: [
            'Implement A/B testing with top 3 titles',
            'Monitor CTR performance over 2-4 weeks',
            'Adjust based on audience engagement data',
            'Create title variations for different channels'
          ]
        },
        qualityMetrics: {
          seoOptimization: Math.round(brandAlignedTitles.reduce((sum, t) => sum + t.seoScore, 0) / brandAlignedTitles.length),
          clickThroughPotential: Math.round(brandAlignedTitles.reduce((sum, t) => sum + t.ctrPrediction, 0) / brandAlignedTitles.length),
          brandAlignment: Math.round(brandAlignedTitles.reduce((sum, t) => sum + t.brandAlignment, 0) / brandAlignedTitles.length)
        },
        agentId: this.id,
        timestamp: new Date().toISOString()
      };
      
      // Store in crystalline memory for learning
      await this.storeTitleIntelligence(titleResult);
      
      // Update performance metrics
      this.updatePerformanceMetrics(titleResult);
      
      console.log(`✅ Generated ${titleResult.primaryTitles.length} optimized titles`);
      return titleResult;
      
    } catch (error) {
      console.error('❌ Title generation failed:', error);
      throw new Error(`Title generation failed: ${error.message}`);
    }
  }

  async generateBaseTitles(topic, targetKeywords, contentType) {
    const baseTitles = [];
    const primaryKeyword = targetKeywords[0] || topic;
    
    // How-to titles
    const howToTitles = [
      `How to Master ${topic}`,
      `How to ${this.getActionVerb(topic)} ${primaryKeyword}`,
      `How to ${this.getActionVerb(topic)} ${primaryKeyword} (Step-by-Step Guide)`,
      `How to ${this.getActionVerb(topic)} ${primaryKeyword} Like a Pro`
    ];
    
    // Guide titles
    const guideTitles = [
      `The Complete Guide to ${topic}`,
      `${topic}: Everything You Need to Know`,
      `The Ultimate ${topic} Guide for ${new Date().getFullYear()}`,
      `Your Complete ${topic} Handbook`
    ];
    
    // Listicle titles
    const listicleTitles = [
      `${Math.floor(Math.random() * 10) + 5} Essential ${topic} Tips`,
      `Top ${Math.floor(Math.random() * 15) + 10} ${topic} Strategies`,
      `${Math.floor(Math.random() * 7) + 8} Ways to Improve Your ${topic}`,
      `${Math.floor(Math.random() * 12) + 15} ${topic} Secrets Revealed`
    ];
    
    // Problem-solution titles
    const problemSolutionTitles = [
      `${topic} Problems? Here's How to Fix Them`,
      `Struggling with ${topic}? Try These Solutions`,
      `The ${topic} Solution Nobody Talks About`,
      `Finally! A Real Solution to ${topic} Challenges`
    ];
    
    baseTitles.push(...howToTitles, ...guideTitles, ...listicleTitles, ...problemSolutionTitles);
    
    return baseTitles.map(title => ({
      title,
      type: this.classifyTitleType(title),
      baseScore: Math.floor(Math.random() * 20) + 70 // 70-90 base score
    }));
  }

  getActionVerb(topic) {
    const verbs = {
      'marketing': 'optimize',
      'strategy': 'implement',
      'content': 'create',
      'seo': 'improve',
      'social media': 'leverage',
      'email': 'automate',
      'analytics': 'analyze'
    };
    
    const topicLower = topic.toLowerCase();
    for (const [key, verb] of Object.entries(verbs)) {
      if (topicLower.includes(key)) {
        return verb;
      }
    }
    
    return 'master';
  }

  classifyTitleType(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('how to')) return 'how-to';
    if (titleLower.includes('guide') || titleLower.includes('everything')) return 'guide';
    if (/\d+/.test(title)) return 'listicle';
    if (titleLower.includes('vs') || titleLower.includes('comparison')) return 'comparison';
    if (titleLower.includes('solution') || titleLower.includes('fix')) return 'problem-solution';
    
    return 'general';
  }

  async applyEmotionalTriggers(baseTitles, topic, targetAudience) {
    const emotionallyOptimizedTitles = [];
    
    baseTitles.forEach(titleObj => {
      const { title, type, baseScore } = titleObj;
      
      // Apply different emotional triggers based on title type
      const applicableTriggers = this.getApplicableTriggers(type, targetAudience);
      
      applicableTriggers.forEach(triggerType => {
        const triggers = this.emotionalTriggers.get(triggerType) || [];
        const trigger = triggers[Math.floor(Math.random() * triggers.length)];
        
        let emotionalTitle = this.insertEmotionalTrigger(title, trigger, triggerType);
        
        emotionallyOptimizedTitles.push({
          title: emotionalTitle,
          type,
          baseScore,
          emotionalTrigger: trigger,
          triggerType,
          emotionalBoost: Math.floor(Math.random() * 15) + 5 // 5-20 boost
        });
      });
      
      // Also keep original
      emotionallyOptimizedTitles.push({
        title,
        type,
        baseScore,
        emotionalTrigger: null,
        triggerType: null,
        emotionalBoost: 0
      });
    });
    
    return emotionallyOptimizedTitles;
  }

  getApplicableTriggers(titleType, targetAudience) {
    const triggerMapping = {
      'how-to': ['authority', 'benefit', 'urgency'],
      'guide': ['benefit', 'exclusivity', 'authority'],
      'listicle': ['curiosity', 'benefit', 'social_proof'],
      'comparison': ['authority', 'benefit'],
      'problem-solution': ['urgency', 'benefit', 'fear']
    };
    
    const audienceMapping = {
      'beginners': ['authority', 'benefit', 'urgency'],
      'professionals': ['exclusivity', 'authority', 'curiosity'],
      'executives': ['authority', 'exclusivity', 'benefit']
    };
    
    const baseTriggers = triggerMapping[titleType] || ['benefit', 'curiosity'];
    const audienceTriggers = audienceMapping[targetAudience] || [];
    
    return [...new Set([...baseTriggers, ...audienceTriggers])].slice(0, 3);
  }

  insertEmotionalTrigger(title, trigger, triggerType) {
    switch (triggerType) {
      case 'urgency':
        return `${trigger}: ${title}`;
      case 'exclusivity':
        return title.replace(/The/, `The ${trigger}`);
      case 'authority':
        return title.includes('Guide') ? title.replace('Guide', `${trigger} Guide`) : `${trigger} ${title}`;
      case 'curiosity':
        return `${trigger} ${title}`;
      case 'benefit':
        return title.replace(/Complete|Ultimate|Essential/, trigger);
      case 'fear':
        return `${title} (Avoid These ${trigger}s)`;
      case 'social_proof':
        return `${trigger} ${title}`;
      default:
        return `${trigger} ${title}`;
    }
  }

  async optimizeForSEO(emotionalTitles, targetKeywords) {
    return emotionalTitles.map(titleObj => {
      const { title } = titleObj;
      let seoScore = titleObj.baseScore + titleObj.emotionalBoost;
      
      // Keyword integration scoring
      const keywordScore = this.calculateKeywordScore(title, targetKeywords);
      seoScore += keywordScore;
      
      // Character length scoring
      const lengthScore = this.calculateLengthScore(title);
      seoScore += lengthScore;
      
      // Readability scoring
      const readabilityScore = this.calculateReadabilityScore(title);
      seoScore += readabilityScore;
      
      return {
        ...titleObj,
        seoScore: Math.min(100, Math.max(0, seoScore)),
        keywordIntegration: keywordScore > 0,
        characterCount: title.length,
        readabilityScore
      };
    });
  }

  calculateKeywordScore(title, targetKeywords) {
    let score = 0;
    const titleLower = title.toLowerCase();
    
    targetKeywords.forEach(keyword => {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += 10; // 10 points per keyword
        
        // Bonus for keyword in first half of title
        if (titleLower.indexOf(keyword.toLowerCase()) < titleLower.length / 2) {
          score += 5;
        }
      }
    });
    
    return Math.min(25, score); // Max 25 points for keywords
  }

  calculateLengthScore(title) {
    const length = title.length;
    
    // Optimal length is 50-60 characters
    if (length >= 50 && length <= 60) return 15;
    if (length >= 40 && length < 50) return 10;
    if (length >= 60 && length <= 70) return 10;
    if (length >= 30 && length < 40) return 5;
    if (length > 70) return -5;
    if (length < 30) return -10;
    
    return 0;
  }

  calculateReadabilityScore(title) {
    // Simple readability based on word complexity
    const words = title.split(' ');
    let complexWords = 0;
    
    words.forEach(word => {
      if (word.length > 6) complexWords++;
    });
    
    const complexityRatio = complexWords / words.length;
    
    if (complexityRatio < 0.2) return 10; // Very readable
    if (complexityRatio < 0.4) return 5;  // Readable
    if (complexityRatio < 0.6) return 0;  // Average
    return -5; // Complex
  }

  async predictCTRAndScore(seoTitles, industry, contentType) {
    return seoTitles.map(titleObj => {
      const { title, seoScore, emotionalTrigger } = titleObj;
      
      // Base CTR prediction
      let ctrPrediction = Math.floor(Math.random() * 30) + 60; // 60-90% base
      
      // Industry modifiers
      const industryModifiers = {
        'AI and MarTech': 1.1,
        'E-commerce': 1.05,
        'SaaS': 1.15,
        'Finance': 0.95,
        'Healthcare': 0.9
      };
      
      ctrPrediction *= (industryModifiers[industry] || 1.0);
      
      // Content type modifiers
      const typeModifiers = {
        'how-to': 1.2,
        'guide': 1.1,
        'listicle': 1.15,
        'comparison': 1.05,
        'case-study': 1.0
      };
      
      ctrPrediction *= (typeModifiers[contentType] || 1.0);
      
      // Emotional trigger bonus
      if (emotionalTrigger) {
        ctrPrediction *= 1.1;
      }
      
      // SEO score influence
      ctrPrediction += (seoScore - 70) * 0.2;
      
      return {
        ...titleObj,
        ctrPrediction: Math.min(100, Math.max(0, Math.round(ctrPrediction))),
        industryAlignment: industryModifiers[industry] || 1.0,
        contentTypeAlignment: typeModifiers[contentType] || 1.0
      };
    });
  }

  async alignWithBrandVoice(scoredTitles, brandName, industry) {
    return scoredTitles.map(titleObj => {
      let brandAlignment = 85; // Base alignment score
      
      const { title, emotionalTrigger } = titleObj;
      
      // Brand name integration
      if (brandName && title.toLowerCase().includes(brandName.toLowerCase())) {
        brandAlignment += 10;
      }
      
      // Industry-specific voice alignment
      const industryVoices = {
        'AI and MarTech': ['innovative', 'cutting-edge', 'advanced', 'intelligent'],
        'E-commerce': ['profitable', 'conversion', 'sales', 'revenue'],
        'SaaS': ['efficient', 'scalable', 'automated', 'streamlined'],
        'Finance': ['secure', 'trustworthy', 'compliant', 'reliable'],
        'Healthcare': ['safe', 'accurate', 'compliant', 'patient-focused']
      };
      
      const expectedVoice = industryVoices[industry] || [];
      const titleLower = title.toLowerCase();
      
      expectedVoice.forEach(voiceElement => {
        if (titleLower.includes(voiceElement)) {
          brandAlignment += 3;
        }
      });
      
      // Emotional trigger brand alignment
      if (emotionalTrigger) {
        const professionalTriggers = ['expert', 'professional', 'proven', 'authority'];
        if (professionalTriggers.includes(emotionalTrigger.toLowerCase())) {
          brandAlignment += 5;
        }
      }
      
      return {
        ...titleObj,
        brandAlignment: Math.min(100, brandAlignment)
      };
    }).sort((a, b) => {
      // Sort by combined score (SEO + CTR + Brand alignment)
      const scoreA = a.seoScore * 0.4 + a.ctrPrediction * 0.4 + a.brandAlignment * 0.2;
      const scoreB = b.seoScore * 0.4 + b.ctrPrediction * 0.4 + b.brandAlignment * 0.2;
      return scoreB - scoreA;
    });
  }

  async generateABTestingRecommendations(titles) {
    const topTitles = titles.slice(0, 5);
    
    return {
      primaryTest: {
        titleA: topTitles[0],
        titleB: topTitles[1],
        hypothesis: 'Higher emotional trigger impact vs SEO optimization',
        testDuration: '2-4 weeks',
        sampleSizeNeeded: 1000
      },
      secondaryTests: [
        {
          variable: 'Length',
          shortTitle: topTitles.find(t => t.characterCount < 50),
          longTitle: topTitles.find(t => t.characterCount > 60)
        },
        {
          variable: 'Emotional Trigger',
          emotionalTitle: topTitles.find(t => t.emotionalTrigger),
          neutralTitle: topTitles.find(t => !t.emotionalTrigger)
        }
      ],
      testingStrategy: {
        phase1: 'Test top 2 performers for statistical significance',
        phase2: 'Test winner against length variations',
        phase3: 'Test winner against emotional trigger variations',
        successMetrics: ['CTR', 'Time on page', 'Bounce rate', 'Social shares']
      }
    };
  }

  categorizeTitlesByEmotion(titles) {
    const categories = {
      authoritative: [],
      urgent: [],
      curious: [],
      beneficial: [],
      neutral: []
    };
    
    titles.forEach(title => {
      const triggerType = title.triggerType;
      
      switch (triggerType) {
        case 'authority':
          categories.authoritative.push(title);
          break;
        case 'urgency':
          categories.urgent.push(title);
          break;
        case 'curiosity':
          categories.curious.push(title);
          break;
        case 'benefit':
          categories.beneficial.push(title);
          break;
        default:
          categories.neutral.push(title);
      }
    });
    
    return categories;
  }

  categorizeTitlesByLength(titles) {
    return {
      short: titles.filter(t => t.characterCount < 40),
      medium: titles.filter(t => t.characterCount >= 40 && t.characterCount <= 60),
      long: titles.filter(t => t.characterCount > 60)
    };
  }

  categorizeTitlesByStyle(titles) {
    return {
      howTo: titles.filter(t => t.type === 'how-to'),
      guides: titles.filter(t => t.type === 'guide'),
      listicles: titles.filter(t => t.type === 'listicle'),
      comparisons: titles.filter(t => t.type === 'comparison'),
      problemSolution: titles.filter(t => t.type === 'problem-solution')
    };
  }

  analyzeKeywordIntegration(titles, targetKeywords) {
    const analysis = {
      totalTitles: titles.length,
      titlesWithKeywords: 0,
      keywordCoverage: {},
      averageKeywordDensity: 0
    };
    
    targetKeywords.forEach(keyword => {
      analysis.keywordCoverage[keyword] = {
        count: 0,
        percentage: 0,
        positions: []
      };
    });
    
    titles.forEach(title => {
      const titleText = title.title.toLowerCase();
      let hasKeyword = false;
      
      targetKeywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (titleText.includes(keywordLower)) {
          hasKeyword = true;
          analysis.keywordCoverage[keyword].count++;
          analysis.keywordCoverage[keyword].positions.push(titleText.indexOf(keywordLower));
        }
      });
      
      if (hasKeyword) analysis.titlesWithKeywords++;
    });
    
    // Calculate percentages
    Object.keys(analysis.keywordCoverage).forEach(keyword => {
      analysis.keywordCoverage[keyword].percentage = 
        Math.round((analysis.keywordCoverage[keyword].count / titles.length) * 100);
    });
    
    analysis.averageKeywordDensity = Math.round((analysis.titlesWithKeywords / titles.length) * 100);
    
    return analysis;
  }

  analyzeCharacterLengths(titles) {
    const lengths = titles.map(t => t.characterCount);
    
    return {
      average: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      optimal: lengths.filter(l => l >= 50 && l <= 60).length,
      distribution: {
        short: lengths.filter(l => l < 40).length,
        medium: lengths.filter(l => l >= 40 && l <= 60).length,
        long: lengths.filter(l => l > 60).length
      }
    };
  }

  async performCompetitiveAnalysis(topic, targetKeywords) {
    // Simulated competitive analysis
    return {
      competitorTitlePatterns: [
        'Complete Guide pattern (40%)',
        'How-to pattern (30%)',
        'Listicle pattern (20%)',
        'Problem-solution pattern (10%)'
      ],
      averageTitleLength: Math.floor(Math.random() * 20) + 45,
      commonKeywords: targetKeywords.slice(0, 2),
      differentiation: [
        'Use more emotional triggers',
        'Include year/timeframe specificity',
        'Add benefit-focused language',
        'Use action-oriented verbs'
      ],
      opportunityGaps: [
        'Lack of urgency in competitor titles',
        'Limited use of numbers/statistics',
        'Missing audience-specific language',
        'No brand differentiation'
      ]
    };
  }

  analyzeTriggerDistribution(titles) {
    const distribution = {};
    const total = titles.length;
    
    titles.forEach(title => {
      if (title.triggerType) {
        distribution[title.triggerType] = (distribution[title.triggerType] || 0) + 1;
      } else {
        distribution.neutral = (distribution.neutral || 0) + 1;
      }
    });
    
    // Convert to percentages
    Object.keys(distribution).forEach(trigger => {
      distribution[trigger] = Math.round((distribution[trigger] / total) * 100);
    });
    
    return distribution;
  }

  calculateEmotionalScore(titles) {
    const emotionalTitles = titles.filter(t => t.emotionalTrigger);
    const emotionalImpact = emotionalTitles.reduce((sum, t) => sum + t.emotionalBoost, 0);
    
    return {
      averageEmotionalBoost: emotionalTitles.length > 0 ? Math.round(emotionalImpact / emotionalTitles.length) : 0,
      emotionalCoverage: Math.round((emotionalTitles.length / titles.length) * 100),
      strongestTrigger: emotionalTitles.length > 0 ? 
        emotionalTitles.reduce((max, t) => t.emotionalBoost > max.emotionalBoost ? t : max).triggerType : null
    };
  }

  assessAudienceAlignment(titles, targetAudience) {
    // Simulated audience alignment assessment
    const alignmentScores = titles.map(title => {
      let score = 70; // Base alignment
      
      const titleLower = title.title.toLowerCase();
      
      // Audience-specific keywords
      const audienceKeywords = {
        beginners: ['guide', 'how to', 'basics', 'simple', 'easy'],
        professionals: ['advanced', 'expert', 'professional', 'strategic'],
        executives: ['roi', 'strategic', 'business', 'growth', 'results']
      };
      
      const expectedKeywords = audienceKeywords[targetAudience] || [];
      expectedKeywords.forEach(keyword => {
        if (titleLower.includes(keyword)) score += 5;
      });
      
      return score;
    });
    
    return {
      averageAlignment: Math.round(alignmentScores.reduce((a, b) => a + b, 0) / alignmentScores.length),
      highAlignment: alignmentScores.filter(s => s >= 85).length,
      lowAlignment: alignmentScores.filter(s => s < 70).length
    };
  }

  generateOptimizationTips(titles, targetKeywords) {
    const tips = [];
    
    // Keyword integration tips
    const keywordIntegration = this.analyzeKeywordIntegration(titles, targetKeywords);
    if (keywordIntegration.averageKeywordDensity < 70) {
      tips.push('Increase keyword integration in titles - aim for 70%+ coverage');
    }
    
    // Length optimization tips
    const lengthAnalysis = this.analyzeCharacterLengths(titles);
    if (lengthAnalysis.optimal < titles.length * 0.5) {
      tips.push('Optimize title lengths for 50-60 characters for better SEO');
    }
    
    // Emotional trigger tips
    const emotionalAnalysis = this.calculateEmotionalScore(titles);
    if (emotionalAnalysis.emotionalCoverage < 60) {
      tips.push('Add more emotional triggers to improve click-through rates');
    }
    
    // General tips
    tips.push('Test different title formats with your audience');
    tips.push('Monitor performance and iterate based on data');
    tips.push('Consider seasonal and trending topics for relevance');
    
    return tips;
  }

  async storeTitleIntelligence(titleResult) {
    try {
      const intelligenceData = {
        type: 'title-generation',
        topic: titleResult.analysis.topic,
        titlesGenerated: titleResult.primaryTitles.length,
        qualityMetrics: titleResult.qualityMetrics,
        processingTime: titleResult.analysis.processingTime,
        timestamp: titleResult.timestamp,
        success: titleResult.success
      };
      
      await this.crystallineMemory.storeMemory(
        `title-generation-${Date.now()}`,
        JSON.stringify(intelligenceData),
        {
          agentId: this.id,
          type: 'title-intelligence',
          domain: 'content-enhanced'
        }
      );
      
      console.log('🧠 Title intelligence stored in crystalline memory');
    } catch (error) {
      console.error('❌ Failed to store title intelligence:', error);
    }
  }

  updatePerformanceMetrics(titleResult) {
    this.performanceHistory.push({
      timestamp: Date.now(),
      titlesGenerated: titleResult.primaryTitles.length,
      averageQualityScore: (titleResult.qualityMetrics.seoOptimization + 
                           titleResult.qualityMetrics.clickThroughPotential + 
                           titleResult.qualityMetrics.brandAlignment) / 3,
      processingTime: titleResult.analysis.processingTime
    });
    
    // Keep only last 100 results
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  getPerformanceMetrics() {
    if (this.performanceHistory.length === 0) {
      return {
        totalTitles: 0,
        averageQuality: 0,
        averageProcessingTime: 0,
        successRate: 0
      };
    }
    
    const total = this.performanceHistory.length;
    const totalTitles = this.performanceHistory.reduce((sum, h) => sum + h.titlesGenerated, 0);
    const totalQuality = this.performanceHistory.reduce((sum, h) => sum + h.averageQualityScore, 0);
    const totalTime = this.performanceHistory.reduce((sum, h) => sum + h.processingTime, 0);
    
    return {
      totalTitles,
      averageQuality: Math.round(totalQuality / total),
      averageProcessingTime: Math.round(totalTime / total),
      successRate: 100 // All stored results are successful
    };
  }

  async validateQuality(titleResult) {
    const quality = {
      seoOptimization: titleResult.qualityMetrics.seoOptimization,
      clickThroughPotential: titleResult.qualityMetrics.clickThroughPotential,
      brandAlignment: titleResult.qualityMetrics.brandAlignment
    };
    
    const passed = quality.seoOptimization >= this.contentMetrics.seoOptimization.min &&
                   quality.clickThroughPotential >= this.contentMetrics.clickThroughPotential.min &&
                   quality.brandAlignment >= this.contentMetrics.brandAlignment.min;
    
    return {
      passed,
      score: Math.round((quality.seoOptimization + quality.clickThroughPotential + quality.brandAlignment) / 3),
      breakdown: quality,
      agentId: this.id
    };
  }
}

module.exports = ContentTitleGenerator;