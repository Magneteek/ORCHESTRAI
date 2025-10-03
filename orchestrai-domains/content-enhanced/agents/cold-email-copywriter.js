const EventEmitter = require('events');

/**
 * Cold Email Copywriter Agent
 * Coordinates with Claude Code agent for personalized cold outreach campaigns
 * Specializes in subject line optimization, personalization at scale, and reply generation
 */
class ColdEmailCopywriter extends EventEmitter {
  constructor(crystallineMemory) {
    super();
    
    this.agentId = 'cold-email-copywriter';
    this.agentType = 'copywriting-specialist';
    this.claudeCodeAgent = 'cold-email-copywriter';
    this.crystallineMemory = crystallineMemory;
    this.status = 'active';
    
    // Agent capabilities
    this.capabilities = [
      'subject-line-optimization',
      'personalization-at-scale',
      'reply-rate-optimization',
      'sequence-architecture',
      'research-methodology',
      'engagement-psychology',
      'follow-up-sequencing',
      'ice-breaker-creation',
      'value-proposition-clarity',
      'conversation-starter-design'
    ];
    
    // Cold email frameworks
    this.frameworks = [
      'PREP', 'BAB', 'Hook-Story-Close', 
      'Problem-Insight-Solution', 'Social-Proof-Value'
    ];
    
    // Performance tracking
    this.performanceMetrics = {
      emailSequencesCreated: 0,
      averageOpenRate: 0,
      averageReplyRate: 0,
      meetingBookingRate: 0,
      subjectLineVariants: 0,
      personalizationSuccess: 0
    };
    
    // Template and research data
    this.templateCache = new Map();
    this.personalizationDataPoints = new Map();
    this.subjectLinePatterns = new Map();
    this.researchSignals = new Map();
    
    // Initialize patterns and data structures
    this.initializeSubjectLinePatterns();
    this.initializePersonalizationPoints();
    this.initializeResearchSignals();
  }

  async initialize() {
    console.log(`📧 Initializing Cold Email Copywriter Agent...`);
    
    try {
      // Load cold email templates from global template system
      await this.loadColdEmailTemplates();
      
      // Initialize crystalline memory pools for email data
      await this.initializeMemoryPools();
      
      // Set up performance tracking and optimization
      await this.setupPerformanceTracking();
      
      console.log(`✅ Cold Email Copywriter Agent initialized with ${this.frameworks.length} frameworks`);
      
      this.emit('agentInitialized', {
        agentId: this.agentId,
        capabilities: this.capabilities,
        frameworks: this.frameworks,
        templateSets: this.templateCache.size,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Failed to initialize Cold Email Copywriter Agent:`, error);
      throw error;
    }
  }

  async loadColdEmailTemplates() {
    const templatePath = '/orchestrai-system/templates/global/content-templates/copywriting-frameworks/cold-email/';
    
    try {
      // Load subject line templates
      const subjectLines = await this.loadTemplateFile(`${templatePath}subject-lines.json`);
      this.templateCache.set('subject-lines', subjectLines);
      
      // Load opening sequence templates
      const openingSequences = await this.loadTemplateFile(`${templatePath}opening-sequences.json`);
      this.templateCache.set('opening-sequences', openingSequences);
      
      console.log(`📚 Loaded ${this.templateCache.size} cold email template sets`);
      
    } catch (error) {
      console.warn(`⚠️ Could not load some cold email templates:`, error.message);
    }
  }

  async loadTemplateFile(filePath) {
    const fs = require('fs').promises;
    try {
      const templateData = await fs.readFile(filePath, 'utf8');
      return JSON.parse(templateData);
    } catch (error) {
      console.warn(`Template file not found: ${filePath}`);
      return null;
    }
  }

  async initializeMemoryPools() {
    const memoryPools = [
      {
        id: 'cold-email-sequences',
        type: 'email-intelligence',
        data: { sequences: [], performance: [], subject_lines: [] }
      },
      {
        id: 'personalization-data',
        type: 'research-intelligence',
        data: { data_points: [], research_methods: [], success_patterns: [] }
      },
      {
        id: 'reply-generation',
        type: 'engagement-optimization',
        data: { reply_patterns: [], conversation_starters: [], engagement_rates: [] }
      }
    ];

    for (const pool of memoryPools) {
      await this.crystallineMemory.storeMemory(
        pool.id,
        JSON.stringify(pool.data),
        { 
          domain: 'content-enhanced',
          specialization: 'cold-email-copywriting',
          type: pool.type,
          created: new Date().toISOString()
        }
      );
    }

    console.log(`🧠 Initialized ${memoryPools.length} cold email memory pools`);
  }

  initializeSubjectLinePatterns() {
    this.subjectLinePatterns.set('curiosity_driven', {
      patterns: [
        'Quick question about {company_name}',
        '{Name}, this reminded me of you',
        'Saw your post about {topic} - quick thought'
      ],
      openRate: 0.31,
      useCase: 'General B2B outreach'
    });

    this.subjectLinePatterns.set('value_proposition', {
      patterns: [
        'How {company} can save ${amount} this quarter',
        '{Number}% increase for {company_type} companies',
        'Free {valuable_resource} for {job_title}s'
      ],
      openRate: 0.25,
      useCase: 'Value-focused outreach'
    });

    this.subjectLinePatterns.set('social_proof', {
      patterns: [
        'How {similar_company} increased {metric} by {%}',
        '{Mutual_connection} suggested I reach out'
      ],
      openRate: 0.35,
      useCase: 'Credibility-based outreach'
    });
  }

  initializePersonalizationPoints() {
    this.personalizationDataPoints.set('company_signals', [
      'recent_funding', 'new_hires', 'expansion', 'product_launches',
      'awards', 'news_mentions', 'technology_stack', 'company_size'
    ]);

    this.personalizationDataPoints.set('individual_signals', [
      'recent_posts', 'speaking_engagements', 'job_changes',
      'publications', 'interviews', 'thought_leadership', 'shared_connections'
    ]);

    this.personalizationDataPoints.set('industry_signals', [
      'market_trends', 'regulatory_changes', 'technology_shifts',
      'competitive_landscape', 'economic_factors', 'industry_events'
    ]);
  }

  initializeResearchSignals() {
    this.researchSignals.set('high_priority', {
      signals: ['recent_funding', 'executive_changes', 'product_launch', 'mutual_connections'],
      personalization_value: 0.9,
      research_time: '15-20 minutes'
    });

    this.researchSignals.set('medium_priority', {
      signals: ['company_growth', 'news_mentions', 'recent_content', 'industry_activity'],
      personalization_value: 0.7,
      research_time: '5-10 minutes'
    });

    this.researchSignals.set('low_priority', {
      signals: ['company_basics', 'job_title', 'industry', 'location'],
      personalization_value: 0.4,
      research_time: '2-3 minutes'
    });
  }

  async setupPerformanceTracking() {
    this.performanceTracker = {
      openRates: new Map(),
      replyRates: new Map(),
      sequencePerformance: new Map(),
      subjectLineEffectiveness: new Map(),
      personalizationImpact: new Map()
    };

    // Set up periodic performance analysis
    setInterval(() => {
      this.analyzeEmailPerformance();
    }, 600000); // Every 10 minutes
  }

  async executeTask(task) {
    console.log(`📧 Cold Email Copywriter executing: ${task.type}`);
    
    const startTime = Date.now();
    
    try {
      // Validate task requirements
      const validation = this.validateTaskRequirements(task);
      if (!validation.isValid) {
        throw new Error(`Task validation failed: ${validation.errors.join(', ')}`);
      }

      // Analyze target audience and select optimal approach
      const approach = this.selectOptimalApproach(task);
      console.log(`📋 Selected approach: ${approach} for audience: ${task.targetAudience}`);

      // Generate personalization strategy
      const personalizationStrategy = this.generatePersonalizationStrategy(task);

      // Generate task prompt for Claude Code agent
      const taskPrompt = this.generateColdEmailPrompt(task, approach, personalizationStrategy);

      // Create task delegation structure
      const delegationResult = {
        claudeCodeAgent: this.claudeCodeAgent,
        approach: approach,
        personalizationStrategy: personalizationStrategy,
        taskPrompt: taskPrompt,
        expectedDeliverables: this.getExpectedDeliverables(task),
        performanceMetrics: this.getPerformanceMetrics(task),
        templateRecommendations: await this.getTemplateRecommendations(approach, task)
      };

      // Store task in crystalline memory for coordination
      await this.storeTaskExecution(task, delegationResult);

      // Update performance metrics
      this.updatePerformanceMetrics(task, approach);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Cold Email task delegation completed in ${processingTime}ms`);

      return {
        success: true,
        delegationResult: delegationResult,
        approach: approach,
        personalizationStrategy: personalizationStrategy,
        processingTime: processingTime,
        agentId: this.agentId
      };

    } catch (error) {
      console.error(`❌ Cold Email Copywriter task failed:`, error);
      return {
        success: false,
        error: error.message,
        agentId: this.agentId,
        taskId: task.id
      };
    }
  }

  validateTaskRequirements(task) {
    const errors = [];
    
    if (!task.targetAudience) {
      errors.push('Target audience not specified');
    }
    
    if (!task.campaignGoal) {
      errors.push('Campaign goal not defined');
    }
    
    if (!task.valueProposition) {
      errors.push('Value proposition not provided');
    }

    if (!task.outreachVolume) {
      errors.push('Outreach volume not specified');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  selectOptimalApproach(task) {
    const { campaignGoal, audienceTemperature, outreachVolume, industry } = task;
    
    // PREP for professional, relationship-focused outreach
    if (audienceTemperature === 'cold' && campaignGoal === 'relationship_building') {
      return 'PREP';
    }
    
    // BAB for problem-focused audiences with clear pain points
    if (task.problemFocused && campaignGoal === 'meeting_booking') {
      return 'BAB';
    }
    
    // Hook-Story-Close for high-volume outreach with scalable personalization
    if (outreachVolume === 'high' && industry === 'technology') {
      return 'Hook-Story-Close';
    }
    
    // Default to PREP for professional outreach
    return 'PREP';
  }

  generatePersonalizationStrategy(task) {
    const { outreachVolume, researchTime, personalizationLevel } = task;
    
    let strategy = {};
    
    if (personalizationLevel === 'hyper-personalized' || outreachVolume === 'low') {
      strategy = {
        level: 'high',
        dataPoints: this.personalizationDataPoints.get('company_signals')
          .concat(this.personalizationDataPoints.get('individual_signals')),
        researchTime: '15-20 minutes per prospect',
        expectedReplyRate: '12-18%'
      };
    } else if (personalizationLevel === 'advanced' || outreachVolume === 'medium') {
      strategy = {
        level: 'medium',
        dataPoints: this.personalizationDataPoints.get('company_signals')
          .concat(this.personalizationDataPoints.get('individual_signals').slice(0, 3)),
        researchTime: '5-10 minutes per prospect',
        expectedReplyRate: '8-12%'
      };
    } else {
      strategy = {
        level: 'basic',
        dataPoints: ['company_name', 'job_title', 'industry', 'recent_activity'],
        researchTime: '2-3 minutes per prospect',
        expectedReplyRate: '3-6%'
      };
    }

    return strategy;
  }

  generateColdEmailPrompt(task, approach, personalizationStrategy) {
    const templates = this.templateCache.get('opening-sequences');
    const subjectLines = this.templateCache.get('subject-lines');
    
    return `You are executing a specialized Cold Email Copywriting task using the ${approach} framework.

## Task Context
- Framework: ${approach}
- Target Audience: ${task.targetAudience}
- Campaign Goal: ${task.campaignGoal}
- Value Proposition: ${task.valueProposition}
- Outreach Volume: ${task.outreachVolume}
- Industry: ${task.industry}

## Personalization Strategy
${JSON.stringify(personalizationStrategy, null, 2)}

## Template Libraries Available
Subject Lines: ${subjectLines ? Object.keys(subjectLines.categories).join(', ') : 'Built-in patterns'}
Opening Sequences: ${templates ? Object.keys(templates.opening_types).join(', ') : 'Built-in frameworks'}

## Expected Deliverables
1. Complete email sequence (5 emails) using ${approach} framework
2. Subject line variations for A/B testing (minimum 3 per email)
3. Personalization scripts for scalable implementation
4. Research methodology for prospect qualification
5. Follow-up timing and cadence recommendations
6. Reply handling and conversation progression templates

## Quality Standards
- Personalization based on ${personalizationStrategy.level} research level
- Professional but conversational tone
- Clear value proposition within first 2 sentences
- Single, specific call-to-action per email
- Mobile-optimized formatting (short paragraphs)
- Compliance with anti-spam regulations
- Reply encouragement techniques integrated naturally

## Performance Targets
- Open Rate: 30%+ (based on personalization level)
- Reply Rate: ${personalizationStrategy.expectedReplyRate}
- Meeting Booking: 3%+ of emails sent
- Unsubscribe Rate: <1%

## Framework Implementation
Use ${approach} framework with these specific elements:
${this.getFrameworkElements(approach)}

## Research Integration
Include research methodology for gathering these data points:
${personalizationStrategy.dataPoints.join(', ')}

## Crystalline Memory Integration
Store successful patterns, reply rates, and personalization insights in cold email memory pools for continuous learning and cross-campaign optimization.`;
  }

  getFrameworkElements(approach) {
    const elements = {
      'PREP': `
- **Personalize**: Specific research-based opening
- **Relate**: Connect through shared experiences/challenges  
- **Explain**: Clear value proposition with specific benefits
- **Propose**: Low-commitment next step (meeting, call, resource)`,
      
      'BAB': `
- **Before**: Current problematic state they're experiencing
- **After**: Desired future state with specific outcomes
- **Bridge**: Your solution as the path to transformation`,
      
      'Hook-Story-Close': `
- **Hook**: Attention-grabbing opening with personalization
- **Story**: Relevant case study demonstrating value
- **Close**: Soft ask for conversation or next step`
    };
    
    return elements[approach] || elements['PREP'];
  }

  getExpectedDeliverables(task) {
    return [
      'complete_email_sequence',
      'subject_line_variants',
      'personalization_scripts',
      'research_methodology',
      'follow_up_cadence',
      'reply_handling_templates',
      'performance_tracking_setup'
    ];
  }

  getPerformanceMetrics(task) {
    return {
      primary: ['open_rate', 'reply_rate', 'meeting_booking_rate'],
      secondary: ['click_through_rate', 'forward_rate', 'unsubscribe_rate'],
      targets: {
        open_rate: '30%',
        reply_rate: '8%',
        meeting_rate: '3%',
        unsubscribe: '<1%'
      }
    };
  }

  async getTemplateRecommendations(approach, task) {
    const openingTemplates = this.templateCache.get('opening-sequences');
    const subjectLineTemplates = this.templateCache.get('subject-lines');
    
    if (!openingTemplates || !subjectLineTemplates) return null;

    return {
      approach: approach,
      opening_templates: openingTemplates,
      subject_line_templates: subjectLineTemplates,
      recommended_patterns: this.getRecommendedPatterns(approach, task),
      personalization_examples: this.getPersonalizationExamples(task)
    };
  }

  getRecommendedPatterns(approach, task) {
    // Return patterns based on approach and task context
    const patterns = {
      'PREP': ['personalized_compliment', 'mutual_connection', 'industry_insight'],
      'BAB': ['problem_agitation', 'transformation_story'],
      'Hook-Story-Close': ['social_proof', 'industry_insight', 'direct_value']
    };

    return patterns[approach] || patterns['PREP'];
  }

  getPersonalizationExamples(task) {
    const examples = [];
    
    if (task.industry === 'technology') {
      examples.push({
        data_point: 'recent_funding',
        template: 'Saw that {company} just raised ${amount} in Series {round}...',
        use_case: 'Funding announcement follow-up'
      });
    }

    examples.push({
      data_point: 'linkedin_activity',
      template: 'Your recent post about {topic} really resonated with me...',
      use_case: 'Social media engagement'
    });

    return examples;
  }

  async storeTaskExecution(task, delegationResult) {
    const executionData = {
      taskId: task.id,
      approach: delegationResult.approach,
      personalizationStrategy: delegationResult.personalizationStrategy,
      timestamp: new Date().toISOString(),
      delegation: delegationResult,
      agentId: this.agentId
    };

    await this.crystallineMemory.storeMemory(
      `cold_email_execution_${task.id}`,
      JSON.stringify(executionData),
      {
        domain: 'content-enhanced',
        specialization: 'cold-email-copywriting',
        type: 'task_execution',
        approach: delegationResult.approach
      }
    );
  }

  updatePerformanceMetrics(task, approach) {
    this.performanceMetrics.emailSequencesCreated++;
    
    // Update approach usage tracking
    const currentCount = this.performanceTracker.sequencePerformance.get(approach) || 0;
    this.performanceTracker.sequencePerformance.set(approach, currentCount + 1);

    this.emit('performanceUpdate', {
      agentId: this.agentId,
      approach: approach,
      metrics: this.performanceMetrics,
      timestamp: new Date().toISOString()
    });
  }

  analyzeEmailPerformance() {
    // Periodic performance analysis and optimization
    const analysis = {
      totalSequences: this.performanceMetrics.emailSequencesCreated,
      approachDistribution: Array.from(this.performanceTracker.sequencePerformance.entries()),
      averageOpenRate: this.performanceMetrics.averageOpenRate,
      averageReplyRate: this.performanceMetrics.averageReplyRate,
      timestamp: new Date().toISOString()
    };

    this.emit('performanceAnalysis', analysis);
  }

  getAgentStatus() {
    return {
      agentId: this.agentId,
      status: this.status,
      capabilities: this.capabilities,
      frameworks: this.frameworks,
      performanceMetrics: this.performanceMetrics,
      templatesLoaded: this.templateCache.size,
      personalizationDataPoints: Array.from(this.personalizationDataPoints.keys()).length,
      subjectLinePatterns: this.subjectLinePatterns.size,
      lastActivity: new Date().toISOString()
    };
  }
}

module.exports = ColdEmailCopywriter;