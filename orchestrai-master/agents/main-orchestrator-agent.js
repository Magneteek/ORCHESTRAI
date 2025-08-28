// Main Orchestrator Agent - Central Query Coordinator for ORCHESTRAI System
// Receives all user queries and intelligently delegates to domain agents

const EventEmitter = require('events');
const SafeJSON = require('../../orchestrai-shared/utils/safe-json');
const { Task, TaskDelegationManager } = require('../../orchestrai-shared/utils/task-delegation');
const path = require('path');

class MainOrchestratorAgent extends EventEmitter {
  constructor(orchestrator, mcpManager, crystallineMemory, templateEngine) {
    super();
    
    this.orchestrator = orchestrator;
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.templateEngine = templateEngine;
    
    this.agentId = 'main-orchestrator-agent';
    this.taskDelegationManager = new TaskDelegationManager(this);
    
    // Query analysis patterns
    this.queryPatterns = new Map();
    this.domainCapabilities = new Map();
    this.coordinationHistory = new Map();
    
    this.initializeQueryAnalysis();
    this.initializeDomainRouting();
    
    console.log('🎯 Main Orchestrator Agent initialized as central coordinator');
  }

  initializeQueryAnalysis() {
    // Define query analysis patterns for intelligent routing
    this.queryPatterns = new Map([
      // SEO & Content Domain Patterns
      ['seo', {
        keywords: ['seo', 'keyword', 'search', 'ranking', 'optimization', 'serp', 'google', 'content strategy'],
        complexity: ['keyword research', 'competitor analysis', 'content optimization', 'technical seo'],
        indicators: ['organic traffic', 'search volume', 'backlinks', 'meta tags', 'schema markup']
      }],
      
      // Web Development & Quality Domain Patterns
      ['web-development', {
        keywords: ['website', 'webpage', 'design', 'development', 'frontend', 'backend', 'ui', 'ux'],
        complexity: ['wireframe', 'mockup', 'responsive', 'performance', 'accessibility', 'testing'],
        indicators: ['react', 'html', 'css', 'javascript', 'layout', 'component']
      }],
      
      // Web Quality Domain Patterns
      ['web-quality', {
        keywords: ['quality', 'testing', 'validation', 'performance', 'accessibility', 'regression'],
        complexity: ['visual testing', 'e2e testing', 'browser compatibility', 'core web vitals'],
        indicators: ['mcp', 'browser automation', 'playwright', 'lighthouse']
      }],
      
      // Research & Analysis Domain Patterns
      ['research', {
        keywords: ['research', 'analysis', 'market', 'competitor', 'user', 'psychographic'],
        complexity: ['demographic analysis', 'behavior patterns', 'market trends', 'cultural insights'],
        indicators: ['icp', 'persona', 'segmentation', 'survey', 'data collection']
      }],
      
      // Project Management & Coordination Patterns
      ['project-management', {
        keywords: ['project', 'client', 'deliverables', 'timeline', 'coordination', 'workflow'],
        complexity: ['multi-phase', 'cross-domain', 'resource allocation', 'quality gates'],
        indicators: ['uuid', 'metadata', 'crystalline memory', 'template system']
      }]
    ]);

    console.log('🔍 Query analysis patterns initialized for intelligent routing');
  }

  initializeDomainRouting() {
    // Map domain capabilities for intelligent delegation
    this.domainCapabilities = new Map([
      ['seo', {
        primary: ['keyword-research', 'content-optimization', 'technical-seo', 'competitor-analysis'],
        secondary: ['serp-analysis', 'backlink-analysis', 'content-strategy'],
        mcpServers: ['dataforseo'],
        agents: ['seo-keyword-research', 'seo-content-optimization', 'seo-technical-analysis']
      }],
      
      ['web-development', {
        primary: ['wireframe-design', 'ui-design', 'frontend-development', 'backend-development'],
        secondary: ['responsive-design', 'component-architecture', 'api-integration'],
        mcpServers: ['filesystem', 'browser-mcp'],
        agents: ['web-designer', 'frontend-developer', 'backend-developer']
      }],
      
      ['web-quality', {
        primary: ['visual-regression', 'accessibility-testing', 'performance-testing', 'e2e-testing'],
        secondary: ['browser-compatibility', 'responsive-validation', 'user-flow-testing'],
        mcpServers: ['browser-mcp', 'playwright-mcp'],
        agents: ['ux-quality-validator', 'visual-regression-tester', 'performance-quality-tester']
      }],
      
      ['research', {
        primary: ['market-research', 'user-research', 'competitive-analysis', 'psychographic-analysis'],
        secondary: ['demographic-analysis', 'behavior-patterns', 'cultural-insights'],
        mcpServers: ['ref-tools', 'memory'],
        agents: ['research-agent', 'psychographic-analyst', 'market-researcher']
      }]
    ]);

    console.log('🎯 Domain routing capabilities mapped for intelligent delegation');
  }

  async receiveQuery(query, context = {}) {
    console.log(`📨 Main Orchestrator received query: "${query.substring(0, 100)}..."`);
    
    try {
      // Step 1: Analyze query to determine domain requirements
      const queryAnalysis = await this.analyzeQuery(query, context);
      
      // Step 2: Determine coordination strategy (single domain, multi-domain, or hybrid)
      const coordinationStrategy = await this.determineCoordinationStrategy(queryAnalysis);
      
      // Step 3: Create orchestration plan
      const orchestrationPlan = await this.createOrchestrationPlan(queryAnalysis, coordinationStrategy);
      
      // Step 4: Execute coordinated delegation
      const result = await this.executeCoordinatedDelegation(orchestrationPlan, query, context);
      
      // Step 5: Aggregate and optimize response
      const finalResponse = await this.aggregateResponse(result, orchestrationPlan);
      
      console.log(`✅ Main Orchestrator completed coordination for query`);
      return finalResponse;
      
    } catch (error) {
      console.error('❌ Main Orchestrator query processing failed:', error.message);
      return {
        success: false,
        error: error.message,
        coordinator: 'main-orchestrator-agent'
      };
    }
  }

  async analyzeQuery(query, context) {
    const analysis = {
      query,
      context,
      timestamp: new Date().toISOString(),
      domains: [],
      complexity: 'medium',
      coordination_type: 'single',
      priority: context.priority || 'medium',
      estimated_tokens: this.estimateTokenUsage(query),
      required_capabilities: []
    };

    // Pattern matching for domain identification
    for (const [domain, patterns] of this.queryPatterns) {
      const keywordMatches = patterns.keywords.filter(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      
      const complexityMatches = patterns.complexity.filter(complexity =>
        query.toLowerCase().includes(complexity.toLowerCase())
      ).length;
      
      const indicatorMatches = patterns.indicators.filter(indicator =>
        query.toLowerCase().includes(indicator.toLowerCase())
      ).length;
      
      const totalScore = keywordMatches * 3 + complexityMatches * 2 + indicatorMatches * 1;
      
      if (totalScore > 2) {
        analysis.domains.push({
          domain,
          confidence: Math.min(totalScore / 10, 1.0),
          matchedKeywords: patterns.keywords.filter(k => query.toLowerCase().includes(k.toLowerCase())),
          capabilities: this.domainCapabilities.get(domain)?.primary || []
        });
      }
    }

    // Sort domains by confidence
    analysis.domains.sort((a, b) => b.confidence - a.confidence);

    // Determine complexity and coordination type
    if (analysis.domains.length === 0) {
      analysis.domains.push({ domain: 'general-purpose', confidence: 0.5, capabilities: [] });
    } else if (analysis.domains.length > 1 && analysis.domains[1].confidence > 0.3) {
      analysis.coordination_type = 'multi-domain';
      analysis.complexity = 'high';
    }

    console.log(`🔍 Query analysis complete: ${analysis.domains.length} domain(s) identified, ${analysis.coordination_type} coordination`);
    return analysis;
  }

  async determineCoordinationStrategy(queryAnalysis) {
    const strategy = {
      type: queryAnalysis.coordination_type,
      primary_domain: queryAnalysis.domains[0]?.domain || 'general-purpose',
      secondary_domains: queryAnalysis.domains.slice(1).map(d => d.domain),
      execution_pattern: 'sequential',
      resource_allocation: 'standard',
      quality_gates: false
    };

    // Determine execution pattern based on domain combinations
    if (strategy.type === 'multi-domain') {
      const domainCombination = [strategy.primary_domain, ...strategy.secondary_domains].sort().join('-');
      
      switch (domainCombination) {
        case 'research-seo':
        case 'research-web-development':
          strategy.execution_pattern = 'sequential'; // Research first, then implementation
          break;
          
        case 'seo-web-development':
          strategy.execution_pattern = 'parallel-then-merge'; // Both can work in parallel
          break;
          
        case 'web-development-web-quality':
          strategy.execution_pattern = 'pipeline'; // Development → Quality validation
          strategy.quality_gates = true;
          break;
          
        default:
          strategy.execution_pattern = 'hybrid';
      }
    }

    // Resource allocation based on complexity
    if (queryAnalysis.complexity === 'high' || queryAnalysis.estimated_tokens > 10000) {
      strategy.resource_allocation = 'high';
    }

    console.log(`🎯 Coordination strategy: ${strategy.type} (${strategy.execution_pattern})`);
    return strategy;
  }

  async createOrchestrationPlan(queryAnalysis, coordinationStrategy) {
    const plan = {
      planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      queryAnalysis,
      coordinationStrategy,
      phases: [],
      dependencies: new Map(),
      quality_checkpoints: [],
      estimated_duration: 0,
      resource_requirements: {}
    };

    // Create phases based on coordination strategy
    switch (coordinationStrategy.execution_pattern) {
      case 'sequential':
        plan.phases = await this.createSequentialPhases(queryAnalysis, coordinationStrategy);
        break;
        
      case 'parallel-then-merge':
        plan.phases = await this.createParallelPhases(queryAnalysis, coordinationStrategy);
        break;
        
      case 'pipeline':
        plan.phases = await this.createPipelinePhases(queryAnalysis, coordinationStrategy);
        break;
        
      case 'hybrid':
        plan.phases = await this.createHybridPhases(queryAnalysis, coordinationStrategy);
        break;
        
      default:
        plan.phases = await this.createSingleDomainPhase(queryAnalysis, coordinationStrategy);
    }

    // Add quality checkpoints for quality-sensitive workflows
    if (coordinationStrategy.quality_gates) {
      plan.quality_checkpoints = this.createQualityCheckpoints(plan.phases);
    }

    // Calculate estimated duration and resources
    plan.estimated_duration = plan.phases.reduce((total, phase) => total + (phase.estimated_duration || 30), 0);
    plan.resource_requirements = this.calculateResourceRequirements(plan.phases);

    console.log(`📋 Orchestration plan created: ${plan.phases.length} phases, ~${plan.estimated_duration}s duration`);
    return plan;
  }

  async createSequentialPhases(queryAnalysis, coordinationStrategy) {
    const phases = [];
    
    for (let i = 0; i < queryAnalysis.domains.length; i++) {
      const domain = queryAnalysis.domains[i];
      phases.push({
        phaseId: `phase-${i + 1}`,
        domain: domain.domain,
        type: 'domain-delegation',
        priority: i === 0 ? 'high' : 'medium',
        dependencies: i > 0 ? [`phase-${i}`] : [],
        estimated_duration: 30,
        delegation_config: {
          target_agent: this.selectOptimalAgent(domain.domain, queryAnalysis.query),
          context_from_previous: i > 0,
          output_format: 'structured'
        }
      });
    }
    
    return phases;
  }

  async createParallelPhases(queryAnalysis, coordinationStrategy) {
    const phases = [];
    
    // Parallel execution phases
    for (let i = 0; i < queryAnalysis.domains.length; i++) {
      const domain = queryAnalysis.domains[i];
      phases.push({
        phaseId: `parallel-${i + 1}`,
        domain: domain.domain,
        type: 'parallel-delegation',
        priority: 'high',
        dependencies: [],
        estimated_duration: 45,
        delegation_config: {
          target_agent: this.selectOptimalAgent(domain.domain, queryAnalysis.query),
          parallel_execution: true,
          output_format: 'structured'
        }
      });
    }
    
    // Merge phase
    phases.push({
      phaseId: 'merge',
      domain: 'coordination',
      type: 'result-aggregation',
      priority: 'high',
      dependencies: phases.map(p => p.phaseId),
      estimated_duration: 15,
      aggregation_strategy: 'intelligent-merge'
    });
    
    return phases;
  }

  async createPipelinePhases(queryAnalysis, coordinationStrategy) {
    const phases = [];
    
    // Pipeline with quality gates
    const domains = queryAnalysis.domains.map(d => d.domain);
    
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      
      // Main execution phase
      phases.push({
        phaseId: `pipeline-${i + 1}`,
        domain: domain,
        type: 'pipeline-delegation',
        priority: 'high',
        dependencies: i > 0 ? [`quality-gate-${i}`] : [],
        estimated_duration: 40,
        delegation_config: {
          target_agent: this.selectOptimalAgent(domain, queryAnalysis.query),
          pipeline_context: true,
          quality_requirements: coordinationStrategy.quality_gates
        }
      });
      
      // Quality gate phase (except for the last domain)
      if (i < domains.length - 1) {
        phases.push({
          phaseId: `quality-gate-${i + 1}`,
          domain: 'web-quality',
          type: 'quality-validation',
          priority: 'high',
          dependencies: [`pipeline-${i + 1}`],
          estimated_duration: 20,
          validation_criteria: this.getQualityGatesCriteria(domain, domains[i + 1])
        });
      }
    }
    
    return phases;
  }

  async createHybridPhases(queryAnalysis, coordinationStrategy) {
    const phases = [];
    
    // Hybrid approach: mix of sequential and parallel based on dependencies
    const domains = queryAnalysis.domains.map(d => d.domain);
    
    // Research domains typically go first
    const researchDomains = domains.filter(d => d === 'research' || d === 'seo');
    const implementationDomains = domains.filter(d => !researchDomains.includes(d));
    
    // Sequential research phases
    for (let i = 0; i < researchDomains.length; i++) {
      phases.push({
        phaseId: `research-${i + 1}`,
        domain: researchDomains[i],
        type: 'sequential-delegation',
        priority: 'high',
        dependencies: i > 0 ? [`research-${i}`] : [],
        estimated_duration: 35,
        delegation_config: {
          target_agent: this.selectOptimalAgent(researchDomains[i], queryAnalysis.query),
          context_from_previous: i > 0,
          hybrid_mode: true
        }
      });
    }
    
    // Parallel implementation phases
    for (let i = 0; i < implementationDomains.length; i++) {
      phases.push({
        phaseId: `impl-${i + 1}`,
        domain: implementationDomains[i],
        type: 'parallel-delegation',
        priority: 'medium',
        dependencies: researchDomains.length > 0 ? [`research-${researchDomains.length}`] : [],
        estimated_duration: 40,
        delegation_config: {
          target_agent: this.selectOptimalAgent(implementationDomains[i], queryAnalysis.query),
          parallel_execution: true,
          research_context: true
        }
      });
    }
    
    return phases;
  }

  async createSingleDomainPhase(queryAnalysis, coordinationStrategy) {
    const domain = coordinationStrategy.primary_domain;
    
    return [{
      phaseId: 'single-domain',
      domain: domain,
      type: 'single-delegation',
      priority: 'high',
      dependencies: [],
      estimated_duration: 30,
      delegation_config: {
        target_agent: this.selectOptimalAgent(domain, queryAnalysis.query),
        single_domain_mode: true,
        output_format: 'comprehensive'
      }
    }];
  }

  calculateResourceRequirements(phases) {
    const requirements = {
      estimatedTokens: 0,
      mcpServers: new Set(),
      domains: new Set(),
      parallelExecutions: 0
    };
    
    for (const phase of phases) {
      // Estimate token usage based on phase type
      switch (phase.type) {
        case 'single-delegation':
          requirements.estimatedTokens += 2000;
          break;
        case 'sequential-delegation':
          requirements.estimatedTokens += 1500;
          break;
        case 'parallel-delegation':
          requirements.estimatedTokens += 1800;
          requirements.parallelExecutions += 1;
          break;
        default:
          requirements.estimatedTokens += 1000;
      }
      
      // Track domains and MCP servers
      requirements.domains.add(phase.domain);
      
      const domainCapabilities = this.domainCapabilities.get(phase.domain);
      if (domainCapabilities?.mcpServers) {
        domainCapabilities.mcpServers.forEach(server => requirements.mcpServers.add(server));
      }
    }
    
    return {
      estimatedTokens: requirements.estimatedTokens,
      mcpServers: Array.from(requirements.mcpServers),
      domains: Array.from(requirements.domains),
      parallelExecutions: requirements.parallelExecutions,
      resourceIntensity: requirements.estimatedTokens > 5000 ? 'high' : 
                        requirements.estimatedTokens > 2000 ? 'medium' : 'low'
    };
  }

  createQualityCheckpoints(phases) {
    const checkpoints = [];
    
    // Add quality checkpoints for critical transitions
    for (let i = 0; i < phases.length - 1; i++) {
      const currentPhase = phases[i];
      const nextPhase = phases[i + 1];
      
      // Add checkpoint for transitions that require validation
      if (this.requiresQualityGate(currentPhase.domain, nextPhase.domain)) {
        checkpoints.push({
          checkpointId: `quality-gate-${i + 1}`,
          afterPhase: currentPhase.phaseId,
          beforePhase: nextPhase.phaseId,
          validationCriteria: this.getQualityGatesCriteria(currentPhase.domain, nextPhase.domain),
          required: true
        });
      }
    }
    
    return checkpoints;
  }

  requiresQualityGate(fromDomain, toDomain) {
    const qualityTransitions = [
      ['research', 'web-development'],
      ['seo', 'web-development'],
      ['web-development', 'web-quality'],
      ['research', 'seo']
    ];
    
    return qualityTransitions.some(([from, to]) => 
      fromDomain === from && toDomain === to
    );
  }

  getQualityGatesCriteria(fromDomain, toDomain) {
    const criteria = {
      [`${fromDomain}-${toDomain}`]: {
        'research-web-development': ['data-completeness', 'accuracy-validation', 'scope-coverage'],
        'seo-web-development': ['keyword-integration', 'content-optimization', 'technical-seo'],
        'web-development-web-quality': ['functionality', 'performance', 'accessibility'],
        'research-seo': ['market-insights', 'competitive-analysis', 'target-alignment']
      }
    };
    
    return criteria[`${fromDomain}-${toDomain}`] || ['general-quality', 'completeness'];
  }

  async executeCoordinatedDelegation(orchestrationPlan, originalQuery, context) {
    console.log(`🚀 Executing orchestrated delegation: ${orchestrationPlan.phases.length} phases`);
    
    const executionContext = {
      planId: orchestrationPlan.planId,
      originalQuery,
      context,
      phaseResults: new Map(),
      qualityGateResults: new Map(),
      startTime: Date.now()
    };

    try {
      // Execute phases based on dependencies
      for (const phase of orchestrationPlan.phases) {
        console.log(`🔄 Executing phase: ${phase.phaseId} (${phase.domain})`);
        
        // Wait for dependencies
        if (phase.dependencies && phase.dependencies.length > 0) {
          await this.waitForDependencies(phase.dependencies, executionContext);
        }
        
        // Execute phase
        const phaseResult = await this.executePhase(phase, executionContext, orchestrationPlan);
        executionContext.phaseResults.set(phase.phaseId, phaseResult);
        
        // Handle quality gates
        if (phase.type === 'quality-validation') {
          const qualityResult = await this.executeQualityGate(phase, phaseResult, executionContext);
          executionContext.qualityGateResults.set(phase.phaseId, qualityResult);
          
          if (!qualityResult.passed) {
            console.log(`⚠️ Quality gate failed: ${phase.phaseId}`);
            // Implement retry logic or escalation
          }
        }
        
        console.log(`✅ Phase completed: ${phase.phaseId}`);
      }
      
      executionContext.endTime = Date.now();
      executionContext.totalDuration = executionContext.endTime - executionContext.startTime;
      
      return executionContext;
      
    } catch (error) {
      console.error(`❌ Coordinated delegation failed:`, error.message);
      throw error;
    }
  }

  async executePhase(phase, executionContext, orchestrationPlan) {
    const phaseStartTime = Date.now();
    
    try {
      let result;
      
      switch (phase.type) {
        case 'domain-delegation':
        case 'parallel-delegation':
        case 'pipeline-delegation':
          result = await this.executeDomainDelegation(phase, executionContext);
          break;
          
        case 'result-aggregation':
          result = await this.executeResultAggregation(phase, executionContext);
          break;
          
        case 'quality-validation':
          result = await this.executeQualityValidation(phase, executionContext);
          break;
          
        default:
          throw new Error(`Unknown phase type: ${phase.type}`);
      }
      
      const phaseDuration = Date.now() - phaseStartTime;
      
      return {
        phaseId: phase.phaseId,
        domain: phase.domain,
        success: true,
        result,
        duration: phaseDuration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        phaseId: phase.phaseId,
        domain: phase.domain,
        success: false,
        error: error.message,
        duration: Date.now() - phaseStartTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeDomainDelegation(phase, executionContext) {
    const { domain, delegation_config } = phase;
    const { originalQuery, context } = executionContext;
    
    // Prepare delegation context
    const delegationContext = {
      ...context,
      orchestrator_phase: phase.phaseId,
      previous_phase_results: delegation_config.context_from_previous ? 
        Array.from(executionContext.phaseResults.values()) : [],
      coordination_strategy: phase.coordination_strategy
    };

    // Get the appropriate domain agent or hub
    const targetAgent = delegation_config.target_agent;
    
    if (this.orchestrator.domains && this.orchestrator.domains[domain]) {
      // Delegate to domain hub
      console.log(`🎯 Delegating to ${domain} domain hub`);
      return await this.orchestrator.domains[domain].coordinateTask({
        query: originalQuery,
        context: delegationContext,
        phase: phase.phaseId,
        targetAgent
      });
    } else {
      // Delegate to Claude Code agent using Task tool
      console.log(`🎯 Delegating to Claude Code agent: ${targetAgent}`);
      
      const task = new Task({
        prompt: this.buildDelegationPrompt(originalQuery, delegationContext, phase),
        subagent_type: targetAgent,
        description: `${domain} coordination task`,
        metadata: {
          domain,
          phase: phase.phaseId,
          coordinator: 'main-orchestrator-agent'
        }
      });
      
      return await this.taskDelegationManager.delegateTask(task);
    }
  }

  buildDelegationPrompt(originalQuery, context, phase) {
    let prompt = `You are handling a coordinated task as part of the ORCHESTRAI system.\n\n`;
    prompt += `Phase: ${phase.phaseId} (${phase.domain})\n`;
    prompt += `Original Query: ${originalQuery}\n\n`;
    
    if (context.previous_phase_results && context.previous_phase_results.length > 0) {
      prompt += `Previous Phase Results:\n`;
      context.previous_phase_results.forEach((result, index) => {
        prompt += `- Phase ${index + 1}: ${SafeJSON.stringify(SafeJSON.truncate(result.result || result, 3))}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += `Please provide your specialized analysis and recommendations for this query, `;
    prompt += `taking into account the phase context and any previous results. `;
    prompt += `Format your response as a structured JSON object with clear recommendations.`;
    
    return prompt;
  }

  selectOptimalAgent(domain, query) {
    const domainCapabilities = this.domainCapabilities.get(domain);
    if (!domainCapabilities) return 'general-purpose';
    
    // Simple agent selection based on query content
    const agents = domainCapabilities.agents || [];
    
    for (const agent of agents) {
      if (query.toLowerCase().includes(agent.split('-')[1])) {
        return agent;
      }
    }
    
    return agents[0] || 'general-purpose';
  }

  async aggregateResponse(executionResult, orchestrationPlan) {
    console.log('🔄 Aggregating coordinated responses');
    
    const aggregation = {
      success: true,
      coordinator: 'main-orchestrator-agent',
      orchestration_plan: {
        planId: orchestrationPlan.planId,
        phases_executed: orchestrationPlan.phases.length,
        execution_pattern: orchestrationPlan.coordinationStrategy.execution_pattern,
        total_duration: executionResult.totalDuration
      },
      domain_results: {},
      quality_gates: {},
      final_recommendations: [],
      next_steps: [],
      system_insights: []
    };

    // Aggregate results by domain
    for (const [phaseId, phaseResult] of executionResult.phaseResults) {
      const phase = orchestrationPlan.phases.find(p => p.phaseId === phaseId);
      if (phase) {
        aggregation.domain_results[phase.domain] = {
          phaseId,
          success: phaseResult.success,
          result: phaseResult.result,
          duration: phaseResult.duration
        };
      }
    }

    // Aggregate quality gate results
    for (const [gateId, gateResult] of executionResult.qualityGateResults) {
      aggregation.quality_gates[gateId] = gateResult;
    }

    // Generate final recommendations
    aggregation.final_recommendations = this.generateFinalRecommendations(executionResult, orchestrationPlan);
    
    // Generate next steps
    aggregation.next_steps = this.generateNextSteps(executionResult, orchestrationPlan);
    
    // Generate system insights
    aggregation.system_insights = this.generateSystemInsights(executionResult, orchestrationPlan);

    console.log(`✅ Response aggregation complete: ${Object.keys(aggregation.domain_results).length} domains coordinated`);
    return aggregation;
  }

  generateFinalRecommendations(executionResult, orchestrationPlan) {
    const recommendations = [];
    
    // Analyze successful domain results
    for (const [phaseId, phaseResult] of executionResult.phaseResults) {
      if (phaseResult.success && phaseResult.result) {
        const phase = orchestrationPlan.phases.find(p => p.phaseId === phaseId);
        if (phase) {
          recommendations.push({
            domain: phase.domain,
            recommendation: `Based on ${phase.domain} analysis: ${this.extractKeyRecommendation(phaseResult.result)}`,
            confidence: 0.9,
            implementation_priority: phase.priority
          });
        }
      }
    }
    
    return recommendations;
  }

  extractKeyRecommendation(result) {
    if (typeof result === 'string') {
      return result.substring(0, 200) + (result.length > 200 ? '...' : '');
    }
    
    if (result && result.recommendations) {
      return Array.isArray(result.recommendations) ? 
        result.recommendations[0] : 
        result.recommendations;
    }
    
    if (result && result.summary) {
      return result.summary;
    }
    
    return 'See detailed results for specific recommendations';
  }

  generateNextSteps(executionResult, orchestrationPlan) {
    const nextSteps = [
      'Review domain-specific recommendations and prioritize implementation',
      'Consider follow-up analysis in areas with high-confidence findings',
      'Implement coordinated approach across multiple domains if applicable'
    ];

    // Add domain-specific next steps
    const successfulDomains = [];
    for (const [phaseId, phaseResult] of executionResult.phaseResults) {
      if (phaseResult.success) {
        const phase = orchestrationPlan.phases.find(p => p.phaseId === phaseId);
        if (phase) {
          successfulDomains.push(phase.domain);
        }
      }
    }

    if (successfulDomains.includes('seo') && successfulDomains.includes('web-development')) {
      nextSteps.push('Coordinate SEO recommendations with web development implementation');
    }

    if (successfulDomains.includes('web-development') && successfulDomains.includes('web-quality')) {
      nextSteps.push('Implement quality gates for development deliverables');
    }

    return nextSteps;
  }

  generateSystemInsights(executionResult, orchestrationPlan) {
    const insights = [];
    
    // Performance insights
    const avgPhaseDuration = executionResult.totalDuration / orchestrationPlan.phases.length;
    insights.push({
      type: 'performance',
      insight: `Average phase execution: ${Math.round(avgPhaseDuration)}ms`,
      optimization_opportunity: avgPhaseDuration > 30000 ? 'Consider parallel execution for independent phases' : null
    });
    
    // Coordination insights
    const coordinationType = orchestrationPlan.coordinationStrategy.type;
    insights.push({
      type: 'coordination',
      insight: `Used ${coordinationType} coordination pattern`,
      effectiveness: executionResult.phaseResults.size / orchestrationPlan.phases.length > 0.8 ? 'high' : 'medium'
    });
    
    // Domain utilization insights
    const domainsUsed = new Set();
    for (const phase of orchestrationPlan.phases) {
      domainsUsed.add(phase.domain);
    }
    
    insights.push({
      type: 'domain_utilization',
      insight: `Utilized ${domainsUsed.size} specialized domains`,
      domains: Array.from(domainsUsed)
    });
    
    return insights;
  }

  async executeResultAggregation(phase, executionContext) {
    console.log(`🔄 Aggregating results from parallel phases`);
    
    const results = Array.from(executionContext.phaseResults.values())
      .filter(result => result.success)
      .map(result => result.result);
    
    return {
      aggregationType: 'intelligent-merge',
      totalResults: results.length,
      mergedInsights: this.mergeResults(results),
      crossDomainRecommendations: this.generateCrossDomainRecommendations(results)
    };
  }

  async executeQualityValidation(phase, executionContext) {
    console.log(`🔍 Executing quality validation: ${phase.phaseId}`);
    
    const previousResult = executionContext.phaseResults.get(phase.dependencies[0]);
    if (!previousResult) {
      throw new Error(`Cannot validate without previous phase result`);
    }
    
    // Simulate quality validation
    const validationScore = Math.random() * 0.4 + 0.6; // 0.6-1.0 range
    const passed = validationScore > 0.75;
    
    return {
      validationType: phase.validation_criteria?.join(', ') || 'general',
      score: Math.round(validationScore * 100) / 100,
      passed,
      criteria: phase.validation_criteria || ['general-quality'],
      issues: passed ? [] : ['Quality threshold not met'],
      recommendations: passed ? [] : ['Review and improve output quality']
    };
  }

  async executeQualityGate(phase, phaseResult, executionContext) {
    console.log(`🚪 Processing quality gate: ${phase.phaseId}`);
    
    const qualityResult = await this.executeQualityValidation(phase, executionContext);
    
    return {
      gateId: phase.phaseId,
      passed: qualityResult.passed,
      score: qualityResult.score,
      criteria: qualityResult.criteria,
      timestamp: new Date().toISOString(),
      phaseResult: phaseResult
    };
  }

  mergeResults(results) {
    const merged = {
      totalRecommendations: 0,
      domains: [],
      keyInsights: []
    };
    
    results.forEach(result => {
      if (result.recommendations) {
        merged.totalRecommendations += Array.isArray(result.recommendations) ? 
          result.recommendations.length : 1;
      }
      
      if (result.domain) {
        merged.domains.push(result.domain);
      }
      
      // Extract key insights
      if (result.keyInsights || result.insights) {
        merged.keyInsights.push(result.keyInsights || result.insights);
      }
    });
    
    return merged;
  }

  generateCrossDomainRecommendations(results) {
    const crossDomain = [];
    
    // Look for synergies between different domain results
    const seoResult = results.find(r => r.domain === 'seo');
    const webQualityResult = results.find(r => r.domain === 'web-quality');
    
    if (seoResult && webQualityResult) {
      crossDomain.push({
        type: 'seo-quality-integration',
        recommendation: 'Integrate SEO keyword recommendations with quality-assured web development',
        domains: ['seo', 'web-quality'],
        priority: 'high'
      });
    }
    
    return crossDomain;
  }

  estimateTokenUsage(query) {
    // Simple estimation: ~4 characters per token
    return Math.ceil(query.length / 4);
  }

  async waitForDependencies(dependencies, executionContext) {
    // Simple implementation - in production, this would use proper async coordination
    for (const depId of dependencies) {
      while (!executionContext.phaseResults.has(depId)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Tool interface for Claude Code integration
  async callTool(toolName, params) {
    return await this.orchestrator.callTool(toolName, params);
  }

  // Status and monitoring
  getCoordinatorStatus() {
    return {
      agentId: this.agentId,
      queryPatterns: this.queryPatterns.size,
      domainCapabilities: this.domainCapabilities.size,
      activeCoordinations: this.coordinationHistory.size,
      isReady: true,
      lastActivity: new Date().toISOString()
    };
  }

  async shutdown() {
    console.log('🔌 Main Orchestrator Agent shutting down...');
    this.coordinationHistory.clear();
    this.removeAllListeners();
  }
}

module.exports = MainOrchestratorAgent;