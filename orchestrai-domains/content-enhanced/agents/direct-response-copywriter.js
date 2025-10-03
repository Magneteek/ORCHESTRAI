const EventEmitter = require('events');

/**
 * Direct Response Copywriter Agent
 * Coordinates with Claude Code agent for high-converting direct response copy
 * Specializes in AIDA, PAS, PASTOR frameworks and psychological triggers
 */
class DirectResponseCopywriter extends EventEmitter {
  constructor(crystallineMemory) {
    super();
    
    this.agentId = 'direct-response-copywriter';
    this.agentType = 'copywriting-specialist';
    this.claudeCodeAgent = 'direct-response-copywriter';
    this.crystallineMemory = crystallineMemory;
    this.status = 'active';
    
    // Agent capabilities
    this.capabilities = [
      'aida-framework-implementation',
      'pas-methodology-application',
      'pastor-framework-execution',
      'psychological-trigger-integration',
      'urgency-scarcity-positioning',
      'objection-handling-sequences',
      'conversion-rate-optimization',
      'social-proof-integration',
      'risk-reversal-techniques',
      'emotional-trigger-implementation'
    ];
    
    // Framework specializations
    this.frameworks = [
      'AIDA', 'PAS', 'PASTOR', 'Star-Story-Solution', 
      'Hook-Story-Close', 'Problem-Promise-Proof'
    ];
    
    // Performance tracking
    this.performanceMetrics = {
      copyPiecesCreated: 0,
      averageConversionImprovement: 0,
      frameworkUsageStats: new Map(),
      clientSuccessStories: []
    };
    
    // Template and framework data
    this.templateCache = new Map();
    this.psychologicalTriggers = new Map();
    this.conversionPatterns = new Map();
    
    // Initialize framework patterns
    this.initializeFrameworkPatterns();
    this.initializePsychologicalTriggers();
  }

  async initialize() {
    console.log(`🎯 Initializing Direct Response Copywriter Agent...`);
    
    try {
      // Load copywriting templates from global template system
      await this.loadCopywritingTemplates();
      
      // Initialize crystalline memory pools for copywriting data
      await this.initializeMemoryPools();
      
      // Set up performance tracking
      await this.setupPerformanceTracking();
      
      console.log(`✅ Direct Response Copywriter Agent initialized with ${this.frameworks.length} frameworks`);
      
      this.emit('agentInitialized', {
        agentId: this.agentId,
        capabilities: this.capabilities,
        frameworks: this.frameworks,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ Failed to initialize Direct Response Copywriter Agent:`, error);
      throw error;
    }
  }

  async loadCopywritingTemplates() {
    const templatePath = '/orchestrai-system/templates/global/content-templates/copywriting-frameworks/direct-response/';
    
    try {
      // Load AIDA templates
      const aidaTemplates = await this.loadTemplateFile(`${templatePath}aida-templates.json`);
      this.templateCache.set('aida', aidaTemplates);
      
      // Load PAS templates
      const pasTemplates = await this.loadTemplateFile(`${templatePath}pas-templates.json`);
      this.templateCache.set('pas', pasTemplates);
      
      console.log(`📚 Loaded ${this.templateCache.size} copywriting template sets`);
      
    } catch (error) {
      console.warn(`⚠️ Could not load some copywriting templates:`, error.message);
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
        id: 'direct-response-frameworks',
        type: 'copywriting-intelligence',
        data: { frameworks: this.frameworks, patterns: [], performance: [] }
      },
      {
        id: 'psychological-triggers',
        type: 'conversion-psychology',
        data: { triggers: [], effectiveness: [], combinations: [] }
      },
      {
        id: 'conversion-optimization',
        type: 'performance-data',
        data: { improvements: [], case_studies: [], metrics: [] }
      }
    ];

    for (const pool of memoryPools) {
      await this.crystallineMemory.storeMemory(
        pool.id,
        JSON.stringify(pool.data),
        { 
          domain: 'content-enhanced',
          specialization: 'direct-response-copywriting',
          type: pool.type,
          created: new Date().toISOString()
        }
      );
    }

    console.log(`🧠 Initialized ${memoryPools.length} copywriting memory pools`);
  }

  initializeFrameworkPatterns() {
    // AIDA patterns
    this.conversionPatterns.set('aida', {
      attention: ['startling_statistic', 'provocative_question', 'contrarian_statement'],
      interest: ['problem_agitation', 'credibility_establishment', 'unique_insight'],
      desire: ['transformation_story', 'social_proof_stack', 'benefit_amplification'],
      action: ['urgency_scarcity', 'risk_reversal', 'clear_action_step']
    });

    // PAS patterns
    this.conversionPatterns.set('pas', {
      problem: ['universal_pain', 'hidden_problem', 'costly_mistake'],
      agitate: ['consequence_cascade', 'competitive_threat', 'time_urgency'],
      solution: ['simple_solution', 'unique_mechanism', 'transformation_promise']
    });

    // PASTOR patterns
    this.conversionPatterns.set('pastor', {
      problem: ['pain_identification', 'market_gap', 'industry_challenge'],
      amplify: ['emotional_amplification', 'consequence_stacking', 'urgency_building'],
      solution: ['unique_solution', 'mechanism_explanation', 'benefit_stacking'],
      transformation: ['before_after', 'case_study', 'vision_casting'],
      offer: ['value_stacking', 'bonus_integration', 'pricing_strategy'],
      response: ['clear_cta', 'urgency_close', 'risk_reversal']
    });
  }

  initializePsychologicalTriggers() {
    this.psychologicalTriggers.set('urgency', {
      patterns: ['limited_time', 'deadline_approaching', 'opportunity_window'],
      effectiveness: 0.85,
      use_cases: ['sales_pages', 'email_campaigns', 'ad_copy']
    });

    this.psychologicalTriggers.set('scarcity', {
      patterns: ['limited_quantity', 'exclusive_access', 'first_come_basis'],
      effectiveness: 0.78,
      use_cases: ['product_launches', 'service_offerings', 'membership_sites']
    });

    this.psychologicalTriggers.set('social_proof', {
      patterns: ['testimonials', 'case_studies', 'user_counts', 'expert_endorsements'],
      effectiveness: 0.82,
      use_cases: ['landing_pages', 'sales_letters', 'email_sequences']
    });

    this.psychologicalTriggers.set('authority', {
      patterns: ['credentials', 'media_mentions', 'awards', 'experience_years'],
      effectiveness: 0.75,
      use_cases: ['about_pages', 'bio_sections', 'expert_positioning']
    });
  }

  async setupPerformanceTracking() {
    this.performanceTracker = {
      conversionRates: new Map(),
      frameworkEffectiveness: new Map(),
      clientResults: [],
      optimizationRecommendations: []
    };

    // Set up periodic performance analysis
    setInterval(() => {
      this.analyzePerformanceData();
    }, 300000); // Every 5 minutes
  }

  async executeTask(task) {
    console.log(`🎯 Direct Response Copywriter executing: ${task.type}`);
    
    const startTime = Date.now();
    
    try {
      // Validate task requirements
      const validation = this.validateTaskRequirements(task);
      if (!validation.isValid) {
        throw new Error(`Task validation failed: ${validation.errors.join(', ')}`);
      }

      // Select optimal framework based on task context
      const framework = this.selectOptimalFramework(task);
      console.log(`📋 Selected framework: ${framework} for task type: ${task.type}`);

      // Generate task prompt for Claude Code agent
      const taskPrompt = this.generateCopywritingPrompt(task, framework);

      // Create task delegation structure
      const delegationResult = {
        claudeCodeAgent: this.claudeCodeAgent,
        framework: framework,
        taskPrompt: taskPrompt,
        expectedDeliverables: this.getExpectedDeliverables(task),
        performanceMetrics: this.getPerformanceMetrics(task),
        templateRecommendations: await this.getTemplateRecommendations(framework, task)
      };

      // Store task in crystalline memory for coordination
      await this.storeTaskExecution(task, delegationResult);

      // Update performance metrics
      this.updatePerformanceMetrics(task, framework);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Direct Response task delegation completed in ${processingTime}ms`);

      return {
        success: true,
        delegationResult: delegationResult,
        framework: framework,
        processingTime: processingTime,
        agentId: this.agentId
      };

    } catch (error) {
      console.error(`❌ Direct Response Copywriter task failed:`, error);
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
    
    if (!task.conversionGoal) {
      errors.push('Conversion goal not defined');
    }
    
    if (!task.keyMessage || !task.keyMessage.length) {
      errors.push('Key message or value proposition missing');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  selectOptimalFramework(task) {
    // Framework selection logic based on task context
    const { conversionGoal, salesCycleLength, audienceTemperature, complexity } = task;
    
    // AIDA for general direct response
    if (conversionGoal === 'immediate_sale' && audienceTemperature === 'warm') {
      return 'AIDA';
    }
    
    // PAS for problem-focused audiences
    if (audienceTemperature === 'cold' && task.problemFocused) {
      return 'PAS';
    }
    
    // PASTOR for complex, high-value offerings
    if (complexity === 'high' || salesCycleLength === 'long') {
      return 'PASTOR';
    }
    
    // Default to AIDA
    return 'AIDA';
  }

  generateCopywritingPrompt(task, framework) {
    const templates = this.templateCache.get(framework.toLowerCase());
    const triggers = Array.from(this.psychologicalTriggers.keys());
    
    return `You are executing a specialized Direct Response Copywriting task using the ${framework} framework.

## Task Context
- Framework: ${framework}
- Target Audience: ${task.targetAudience}
- Conversion Goal: ${task.conversionGoal}
- Key Message: ${task.keyMessage}
- Sales Cycle: ${task.salesCycleLength || 'medium'}
- Audience Temperature: ${task.audienceTemperature || 'warm'}

## Framework Templates Available
${templates ? JSON.stringify(templates.templates, null, 2) : 'Using built-in framework patterns'}

## Psychological Triggers Available
${triggers.join(', ')}

## Expected Deliverables
1. ${framework} framework implementation with clear sections
2. Psychological trigger integration (minimum 3 triggers)
3. Conversion optimization recommendations
4. A/B testing variant suggestions
5. Performance metrics setup

## Quality Standards
- Grade 8-10 readability level
- Clear value proposition within first 100 words
- Specific, measurable promises
- Natural psychological trigger integration
- Mobile-optimized formatting

Create high-converting direct response copy using your expertise in ${framework} framework and conversion psychology.

## Crystalline Memory Integration
Store insights in the copywriting memory pools for cross-agent coordination and continuous learning.`;
  }

  getExpectedDeliverables(task) {
    return [
      'primary_copy_version',
      'a_b_testing_variants',
      'psychological_trigger_analysis',
      'conversion_optimization_report',
      'performance_metrics_setup',
      'framework_implementation_notes'
    ];
  }

  getPerformanceMetrics(task) {
    return {
      primary: ['conversion_rate', 'click_through_rate', 'cost_per_acquisition'],
      secondary: ['time_on_page', 'bounce_rate', 'social_shares'],
      targets: {
        conversion_improvement: '15%',
        ctr_improvement: '25%',
        cpa_reduction: '30%'
      }
    };
  }

  async getTemplateRecommendations(framework, task) {
    const templates = this.templateCache.get(framework.toLowerCase());
    if (!templates) return null;

    const recommendations = {
      framework: framework,
      templates: templates,
      optimal_structure: this.getOptimalStructure(framework, task),
      psychological_triggers: this.getRecommendedTriggers(task)
    };

    return recommendations;
  }

  getOptimalStructure(framework, task) {
    const patterns = this.conversionPatterns.get(framework.toLowerCase());
    if (!patterns) return null;

    // Return optimal structure based on framework and task context
    return {
      framework: framework,
      sections: Object.keys(patterns),
      word_counts: this.getOptimalWordCounts(framework, task.complexity),
      recommended_patterns: patterns
    };
  }

  getOptimalWordCounts(framework, complexity) {
    const baseCounts = {
      'aida': { attention: 50, interest: 150, desire: 200, action: 100 },
      'pas': { problem: 100, agitate: 150, solution: 200 },
      'pastor': { problem: 125, amplify: 100, solution: 175, transformation: 150, offer: 125, response: 75 }
    };

    const multiplier = complexity === 'high' ? 1.5 : complexity === 'low' ? 0.7 : 1.0;
    const counts = baseCounts[framework.toLowerCase()] || baseCounts['aida'];

    // Apply complexity multiplier
    const adjustedCounts = {};
    Object.keys(counts).forEach(key => {
      adjustedCounts[key] = Math.round(counts[key] * multiplier);
    });

    return adjustedCounts;
  }

  getRecommendedTriggers(task) {
    const triggers = [];
    
    // Select triggers based on task context
    if (task.conversionGoal === 'immediate_sale') {
      triggers.push('urgency', 'scarcity');
    }
    
    if (task.audienceTemperature === 'cold') {
      triggers.push('social_proof', 'authority');
    }
    
    if (task.riskLevel === 'high') {
      triggers.push('risk_reversal', 'social_proof');
    }

    return triggers.length ? triggers : ['social_proof', 'authority', 'urgency'];
  }

  async storeTaskExecution(task, delegationResult) {
    const executionData = {
      taskId: task.id,
      framework: delegationResult.framework,
      timestamp: new Date().toISOString(),
      delegation: delegationResult,
      agentId: this.agentId
    };

    await this.crystallineMemory.storeMemory(
      `direct_response_execution_${task.id}`,
      JSON.stringify(executionData),
      {
        domain: 'content-enhanced',
        specialization: 'direct-response-copywriting',
        type: 'task_execution',
        framework: delegationResult.framework
      }
    );
  }

  updatePerformanceMetrics(task, framework) {
    this.performanceMetrics.copyPiecesCreated++;
    
    // Update framework usage stats
    const currentCount = this.performanceMetrics.frameworkUsageStats.get(framework) || 0;
    this.performanceMetrics.frameworkUsageStats.set(framework, currentCount + 1);

    this.emit('performanceUpdate', {
      agentId: this.agentId,
      framework: framework,
      metrics: this.performanceMetrics,
      timestamp: new Date().toISOString()
    });
  }

  analyzePerformanceData() {
    // Periodic performance analysis and optimization recommendations
    const analysis = {
      totalCopyPieces: this.performanceMetrics.copyPiecesCreated,
      frameworkDistribution: Array.from(this.performanceMetrics.frameworkUsageStats.entries()),
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
      psychologicalTriggers: this.psychologicalTriggers.size,
      lastActivity: new Date().toISOString()
    };
  }
}

module.exports = DirectResponseCopywriter;