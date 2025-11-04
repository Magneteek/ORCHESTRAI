// Direct Task Orchestrator - Simplified orchestration that directly maps to Claude Code subagents
// Replaces complex multi-phase delegation with direct capability matching

const ParallelTaskEngine = require('./parallel-task-engine');

class DirectTaskOrchestrator {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.parallelEngine = new ParallelTaskEngine(orchestrator);
    
    // Direct capability mapping to Claude Code subagents
    this.capabilityAgentMap = new Map([
      // SEO Domain
      ['keyword-research', 'seo-keyword-research'],
      ['competitor-analysis', 'seo-competitor-analysis'], 
      ['content-optimization', 'seo-content-optimization'],
      ['technical-seo', 'seo-technical-analysis'],
      ['serp-analysis', 'seo-serp-analysis'],
      
      // Content Domain
      ['article-writing', 'content-writer-specialist'],
      ['content-strategy', 'content-outline-architect'],
      ['content-quality', 'content-quality-validator'],
      ['title-optimization', 'content-title-generator'],
      
      // Web Development Domain
      ['frontend-development', 'general-purpose'], // Uses general-purpose with specific prompts
      ['ui-design', 'general-purpose'],
      ['performance-optimization', 'general-purpose'],
      ['responsive-design', 'general-purpose'],
      
      // Multilingual Domain
      ['language-adaptation', 'multi-language-content-adapter'],
      ['cultural-adaptation', 'multi-language-content-adapter'],
      
      // Research Domain
      ['market-research', 'general-purpose'],
      ['user-research', 'general-purpose'],
      ['psychographic-analysis', 'general-purpose']
    ]);
    
    // Common task patterns for quick matching
    this.taskPatterns = {
      seo: ['keyword', 'search', 'ranking', 'optimization', 'serp', 'competitor'],
      content: ['article', 'blog', 'copy', 'writing', 'content', 'title'],
      webdev: ['website', 'page', 'design', 'frontend', 'ui', 'layout'],
      multilingual: ['translate', 'language', 'cultural', 'slovenian', 'german', 'spanish'],
      research: ['research', 'analyze', 'market', 'user', 'psychographic', 'demographic']
    };
    
    this.isMainUserCommunicator = true; // This orchestrator is the ONLY user interface
    
    console.log('🎯 DirectTaskOrchestrator initialized - Single user communication point');
  }

  /**
   * Main entry point - ONLY method that communicates with user
   */
  async processUserQuery(query, context = {}) {
    console.log('👤 DirectTaskOrchestrator: Processing user query as MAIN communicator');
    
    const startTime = Date.now();
    
    try {
      // Step 1: Quick capability matching (no complex analysis)
      const capabilities = this.identifyCapabilities(query);
      
      // Step 2: Determine if parallel execution is possible
      const executionMode = this.determineExecutionMode(capabilities, query);
      
      // Step 3: Create tasks for Claude Code subagents
      const tasks = this.createClaudeCodeTasks(query, capabilities, context);
      
      // Step 4: Execute tasks (parallel where possible)
      const results = await this.executeTasksDirectly(tasks, executionMode);
      
      // Step 5: Return formatted response directly to user
      const userResponse = this.formatUserResponse(results, query, capabilities);
      
      console.log(`✅ User query processed in ${Date.now() - startTime}ms via ${tasks.length} Claude Code subagents`);
      
      return userResponse;
      
    } catch (error) {
      console.error('❌ DirectTaskOrchestrator failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        message: 'I encountered an error processing your request. Let me try a simpler approach.',
        fallbackSuggestion: 'Try breaking your request into smaller, specific tasks.',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fast capability identification without complex analysis
   */
  identifyCapabilities(query) {
    const queryLower = query.toLowerCase();
    const identifiedCapabilities = [];
    
    // Fast pattern matching
    for (const [domain, patterns] of Object.entries(this.taskPatterns)) {
      const matches = patterns.filter(pattern => queryLower.includes(pattern));
      
      if (matches.length > 0) {
        identifiedCapabilities.push({
          domain,
          confidence: matches.length / patterns.length,
          matchedPatterns: matches,
          suggestedCapabilities: this.getDomainCapabilities(domain, queryLower)
        });
      }
    }
    
    // Sort by confidence and limit to top 3 to prevent overwhelming
    identifiedCapabilities.sort((a, b) => b.confidence - a.confidence);
    const topCapabilities = identifiedCapabilities.slice(0, 3);
    
    // If no capabilities identified, default to general content
    if (topCapabilities.length === 0) {
      topCapabilities.push({
        domain: 'content',
        confidence: 0.5,
        matchedPatterns: ['general'],
        suggestedCapabilities: ['article-writing']
      });
    }
    
    console.log(`🎯 Identified ${topCapabilities.length} capabilities: ${topCapabilities.map(c => c.domain).join(', ')}`);
    
    return topCapabilities;
  }

  /**
   * Get specific capabilities for each domain
   */
  getDomainCapabilities(domain, queryText) {
    const domainCapabilities = {
      seo: {
        'keyword': ['keyword-research'],
        'competitor': ['competitor-analysis'],
        'content': ['content-optimization'],
        'technical': ['technical-seo'],
        'search': ['serp-analysis']
      },
      content: {
        'article': ['article-writing'],
        'title': ['title-optimization'],
        'strategy': ['content-strategy'],
        'quality': ['content-quality']
      },
      webdev: {
        'website': ['frontend-development'],
        'design': ['ui-design'],
        'performance': ['performance-optimization'],
        'responsive': ['responsive-design']
      },
      multilingual: {
        'language': ['language-adaptation'],
        'cultural': ['cultural-adaptation'],
        'translate': ['language-adaptation']
      },
      research: {
        'market': ['market-research'],
        'user': ['user-research'],
        'psychographic': ['psychographic-analysis']
      }
    };
    
    const capabilities = [];
    const domainMap = domainCapabilities[domain] || {};
    
    for (const [keyword, caps] of Object.entries(domainMap)) {
      if (queryText.includes(keyword)) {
        capabilities.push(...caps);
      }
    }
    
    // Return primary capability if specific match found, otherwise all for domain
    return capabilities.length > 0 ? capabilities : Object.values(domainMap).flat().slice(0, 2);
  }

  /**
   * Simple execution mode determination
   */
  determineExecutionMode(capabilities, query) {
    // Check for dependency keywords
    const dependencyKeywords = ['after', 'then', 'following', 'based on', 'using results'];
    const hasDependencies = dependencyKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    // If multiple capabilities and no dependencies, run in parallel
    if (capabilities.length > 1 && !hasDependencies) {
      return 'parallel';
    }
    
    // If research + implementation, run sequentially 
    const domains = capabilities.map(c => c.domain);
    if (domains.includes('research') && (domains.includes('content') || domains.includes('webdev'))) {
      return 'sequential';
    }
    
    return capabilities.length > 1 ? 'parallel' : 'single';
  }

  /**
   * Create Claude Code subagent tasks directly
   */
  createClaudeCodeTasks(query, capabilities, context) {
    const tasks = [];
    
    capabilities.forEach((capability, index) => {
      capability.suggestedCapabilities.forEach(specificCapability => {
        const agentType = this.capabilityAgentMap.get(specificCapability) || 'general-purpose';
        
        tasks.push({
          id: `direct_task_${Date.now()}_${index}`,
          agent: agentType,
          subagent_type: agentType,
          prompt: this.buildDirectPrompt(query, specificCapability, capability.domain, context),
          description: `${capability.domain}: ${specificCapability}`,
          domain: capability.domain,
          capability: specificCapability,
          priority: index === 0 ? 'high' : 'medium'
        });
      });
    });
    
    console.log(`📋 Created ${tasks.length} direct Claude Code tasks`);
    return tasks;
  }

  /**
   * Build focused prompts for Claude Code subagents
   */
  buildDirectPrompt(query, capability, domain, context) {
    let prompt = `${query}\n\n`;
    
    // Add capability-specific instructions
    const capabilityInstructions = {
      'keyword-research': 'Focus on identifying high-value keywords and search opportunities.',
      'article-writing': 'Create comprehensive, engaging content that addresses user intent.',
      'content-optimization': 'Optimize content for search engines while maintaining readability.',
      'ui-design': 'Focus on user experience and modern design principles.',
      'language-adaptation': 'Ensure cultural and linguistic accuracy for the target market.'
    };
    
    if (capabilityInstructions[capability]) {
      prompt += `Specialization: ${capabilityInstructions[capability]}\n`;
    }
    
    // Add context if available
    if (context.projectUUID) {
      prompt += `Project Context: ${context.projectUUID}\n`;
    }
    
    if (context.targetLanguage) {
      prompt += `Target Language: ${context.targetLanguage}\n`;
    }
    
    prompt += `\nProvide actionable results focused on ${capability} for ${domain} domain.`;
    
    return prompt;
  }

  /**
   * Execute tasks based on determined mode
   */
  async executeTasksDirectly(tasks, executionMode) {
    console.log(`🚀 Executing ${tasks.length} tasks in ${executionMode} mode`);
    
    switch (executionMode) {
      case 'parallel':
        return await this.parallelEngine.executeParallelTasks(tasks);
        
      case 'sequential':
        return await this.executeSequentialTasks(tasks);
        
      case 'single':
        return await this.parallelEngine.executeParallelTasks([tasks[0]]);
        
      default:
        throw new Error(`Unknown execution mode: ${executionMode}`);
    }
  }

  /**
   * Execute tasks sequentially when dependencies exist
   */
  async executeSequentialTasks(tasks) {
    const results = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      // Add context from previous tasks if available
      if (i > 0 && results.length > 0) {
        const previousResults = results.filter(r => r.success).map(r => r.result);
        task.prompt += `\n\nPrevious task results for context:\n${JSON.stringify(previousResults, null, 2)}`;
      }
      
      console.log(`⏭️  Sequential execution: Task ${i + 1}/${tasks.length}`);
      
      const taskResult = await this.parallelEngine.executeTaskNonBlocking(task);
      results.push(taskResult);
      
      // If task fails and it's critical, stop sequence
      if (!taskResult.success && task.priority === 'high') {
        console.warn(`⚠️ Critical task failed, stopping sequential execution`);
        break;
      }
    }
    
    return {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      tasks: results,
      executionMode: 'sequential'
    };
  }

  /**
   * Format response for user (main communication point)
   */
  formatUserResponse(results, originalQuery, capabilities) {
    const response = {
      success: results.successful > 0,
      query: originalQuery,
      executionSummary: {
        totalTasks: results.tasks?.length || 0,
        successful: results.successful,
        failed: results.failed,
        executionMode: results.executionMode || 'parallel',
        totalDuration: results.totalDuration,
        parallelEfficiency: results.summary?.parallelEfficiencyGain || 0
      },
      results: {},
      recommendations: [],
      nextSteps: []
    };

    // Organize results by domain
    if (results.tasks) {
      results.tasks.forEach(task => {
        if (task.success && task.result) {
          const domain = task.config?.domain || task.description?.split(':')[0] || 'general';
          
          if (!response.results[domain]) {
            response.results[domain] = [];
          }
          
          response.results[domain].push({
            capability: task.config?.capability || 'general',
            agent: task.agent,
            result: task.result,
            duration: task.duration
          });
        }
      });
    }

    // Generate practical recommendations
    response.recommendations = this.generatePracticalRecommendations(results, capabilities);
    
    // Generate actionable next steps
    response.nextSteps = this.generateActionableNextSteps(results, originalQuery);
    
    return response;
  }

  /**
   * Generate practical recommendations based on actual results
   */
  generatePracticalRecommendations(results, capabilities) {
    const recommendations = [];
    
    // Analyze successful results for actionable insights
    if (results.tasks) {
      const successfulTasks = results.tasks.filter(t => t.success);
      
      successfulTasks.forEach(task => {
        if (task.result && typeof task.result === 'string') {
          // Extract actionable insights from task results
          const insight = task.result.substring(0, 200) + (task.result.length > 200 ? '...' : '');
          
          recommendations.push({
            domain: task.config?.domain || 'general',
            agent: task.agent,
            recommendation: insight,
            actionable: true
          });
        }
      });
    }
    
    // Add efficiency recommendations
    if (results.summary?.parallelEfficiencyGain > 20) {
      recommendations.push({
        domain: 'system',
        recommendation: `Parallel execution saved ${results.summary.parallelEfficiencyGain}% time - consider similar parallel approaches for future tasks`,
        actionable: true
      });
    }
    
    return recommendations.slice(0, 5); // Limit to top 5 most relevant
  }

  /**
   * Generate clear next steps for user
   */
  generateActionableNextSteps(results, originalQuery) {
    const nextSteps = [];
    
    // Based on successful task domains, suggest logical next steps
    const successfulDomains = new Set();
    if (results.tasks) {
      results.tasks.forEach(task => {
        if (task.success && task.config?.domain) {
          successfulDomains.add(task.config.domain);
        }
      });
    }
    
    // Domain-specific next steps
    if (successfulDomains.has('seo')) {
      nextSteps.push('Review SEO recommendations and integrate into content strategy');
    }
    
    if (successfulDomains.has('content')) {
      nextSteps.push('Implement content recommendations and optimize for target audience');
    }
    
    if (successfulDomains.has('webdev')) {
      nextSteps.push('Develop and test web implementation following provided guidelines');
    }
    
    if (successfulDomains.has('research')) {
      nextSteps.push('Apply research insights to content and marketing strategy');
    }
    
    // Always include a coordination step if multiple domains succeeded
    if (successfulDomains.size > 1) {
      nextSteps.push('Coordinate implementation across multiple domains for maximum impact');
    }
    
    return nextSteps.slice(0, 4); // Keep focused
  }

  /**
   * Create tasks for multiple language processing
   */
  async processMultilingualQuery(query, languages, context = {}) {
    console.log(`🌐 Processing multilingual query for languages: ${languages.join(', ')}`);
    
    const tasks = languages.map((language, index) => ({
      id: `ml_task_${Date.now()}_${index}`,
      agent: 'multi-language-content-adapter',
      subagent_type: 'multi-language-content-adapter',
      prompt: `${query}\n\nTarget Language: ${language.toUpperCase()}\nEnsure cultural adaptation for ${language} market.`,
      description: `${language.toUpperCase()} content generation`,
      domain: 'multilingual',
      capability: 'language-adaptation',
      language: language,
      priority: 'high'
    }));
    
    // Execute all language tasks in parallel
    const results = await this.parallelEngine.executeParallelTasks(tasks);
    
    return {
      success: true,
      multilingualResults: results,
      languagesProcessed: languages,
      parallelExecution: true
    };
  }

  /**
   * Health check and metrics
   */
  getOrchestrationHealth() {
    return {
      isMainCommunicator: this.isMainUserCommunicator,
      parallelEngineStatus: this.parallelEngine.getExecutionStatus(),
      capabilityMappings: this.capabilityAgentMap.size,
      taskPatterns: Object.keys(this.taskPatterns).length,
      systemHealth: 'operational'
    };
  }

  /**
   * Shutdown gracefully
   */
  async shutdown() {
    console.log('🛑 DirectTaskOrchestrator shutting down...');
    await this.parallelEngine.shutdown();
    console.log('✅ DirectTaskOrchestrator shutdown complete');
  }
}

module.exports = DirectTaskOrchestrator;