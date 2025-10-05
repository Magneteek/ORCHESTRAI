/**
 * ORCHESTRAI Workflow Config Generator
 *
 * Generates complete workflow configurations from pipeline templates and project analysis.
 * Handles task generation, dependency mapping, agent assignment, and context enrichment.
 */

const { v4: uuidv4 } = require('uuid');

class WorkflowConfigGenerator {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
    console.log('⚙️ Workflow Config Generator initialized');
  }

  /**
   * Generate complete workflow configuration
   */
  async generateWorkflowConfig(templates, analysis, projectSpec) {
    try {
      console.log('🔧 Generating workflow configuration...');

      const primaryTemplate = templates[0];
      const workflowId = uuidv4();

      // Generate tasks from templates
      const tasks = await this.generateTasksFromTemplates(templates, analysis, projectSpec);

      // Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(tasks);

      // Retrieve context from crystalline memory
      const enrichedContext = await this.enrichContextFromMemory(analysis, projectSpec);

      // Generate quality thresholds
      const qualityThresholds = this.generateQualityThresholds(primaryTemplate, analysis);

      // Create workflow configuration
      const workflowConfig = {
        workflowId,
        projectUuid: analysis.projectUuid,
        clientName: analysis.clientName,
        deliverableType: analysis.deliverableType,

        // Core task configuration
        tasks,
        dependencies: dependencyGraph,

        // Context and enrichment
        context: {
          targetMarket: analysis.targetMarket,
          language: analysis.language,
          complexity: analysis.complexity,
          psychographicData: enrichedContext.psychographicData,
          existingResearch: enrichedContext.existingResearch,
          historicalPerformance: enrichedContext.historicalPerformance,
          ...enrichedContext.additionalContext
        },

        // Quality and success criteria
        qualityThresholds,
        successCriteria: analysis.successCriteria,

        // Coordination preferences
        preferredPattern: primaryTemplate.coordinationPattern,
        stages: primaryTemplate.stages.map(s => s.stage),

        // Execution constraints
        constraints: {
          maxDuration: this.estimateMaxDuration(templates),
          languageIsolation: analysis.language !== 'English',
          qualityEnforcement: 'strict',
          autoRetry: true,
          maxRetries: 2
        },

        // Metadata
        templateSource: primaryTemplate.name,
        templateVersion: primaryTemplate.version,
        generatedAt: Date.now(),
        estimatedTaskCount: tasks.length
      };

      console.log(`✅ Workflow configuration generated:`);
      console.log(`   ├─ Tasks: ${tasks.length}`);
      console.log(`   ├─ Dependencies: ${Object.keys(dependencyGraph).length}`);
      console.log(`   ├─ Quality Gates: ${qualityThresholds.gates.length}`);
      console.log(`   └─ Estimated Duration: ${this.estimateMaxDuration(templates)} minutes`);

      return workflowConfig;

    } catch (error) {
      console.error('❌ Workflow config generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate tasks from templates
   */
  async generateTasksFromTemplates(templates, analysis, projectSpec) {
    const tasks = [];

    for (const template of templates) {
      for (const stage of template.stages) {
        for (const taskTemplate of stage.tasks) {
          // Generate unique task ID
          const taskId = taskTemplate.taskId || `task-${uuidv4().substring(0, 8)}`;

          // Inject context variables into prompt
          const contextualizedPrompt = this.injectContextVariables(
            taskTemplate.prompt,
            analysis,
            projectSpec
          );

          // Create task configuration
          const task = {
            taskId,
            name: taskTemplate.name,
            stage: stage.stage,
            stageName: stage.stageName,

            // Agent assignment
            agentType: taskTemplate.agentType,
            agentPreferences: {
              domain: this.inferDomain(taskTemplate.agentType),
              capabilities: this.inferCapabilities(taskTemplate.agentType),
              priority: taskTemplate.priority || 'normal'
            },

            // Execution configuration
            prompt: contextualizedPrompt,
            context: {
              deliverableType: analysis.deliverableType,
              targetMarket: analysis.targetMarket,
              language: analysis.language,
              clientName: analysis.clientName,
              projectUuid: analysis.projectUuid,
              ...taskTemplate.context
            },

            // Dependencies
            dependencies: taskTemplate.dependencies || [],

            // Output configuration
            outputFormat: taskTemplate.outputFormat || 'structured-data',
            outputDestination: this.determineOutputDestination(
              analysis.projectUuid,
              stage.stage,
              taskTemplate.outputFormat
            ),

            // Quality requirements
            qualityRequirements: {
              minimumScore: taskTemplate.minimumQuality || 85,
              languageIsolation: taskTemplate.languageIsolation || (analysis.language !== 'English'),
              criticalValidation: taskTemplate.criticalValidation || false
            },

            // Execution metadata
            estimatedDuration: taskTemplate.estimatedDuration || 15,
            parallelizable: stage.parallelizable || false,
            retryable: true,
            maxRetries: 2
          };

          tasks.push(task);
        }
      }
    }

    return tasks;
  }

  /**
   * Build dependency graph for tasks
   */
  buildDependencyGraph(tasks) {
    const graph = {};

    // Create task ID to task mapping
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.taskId, task));

    // Build graph with dependencies and dependents
    for (const task of tasks) {
      graph[task.taskId] = {
        task: task.taskId,
        stage: task.stage,
        dependencies: task.dependencies || [],
        dependents: [],
        level: 0, // Will be calculated
        parallelizable: task.parallelizable
      };
    }

    // Build reverse dependencies (dependents)
    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (graph[depId]) {
            graph[depId].dependents.push(task.taskId);
          }
        }
      }
    }

    // Calculate dependency levels (for parallel execution grouping)
    this.calculateDependencyLevels(graph);

    return graph;
  }

  /**
   * Calculate dependency levels for parallel execution planning
   */
  calculateDependencyLevels(graph) {
    const visited = new Set();
    const levels = new Map();

    const calculateLevel = (taskId) => {
      if (visited.has(taskId)) {
        return levels.get(taskId) || 0;
      }

      visited.add(taskId);
      const node = graph[taskId];

      // Safety check: node might not exist if dependency references invalid task
      if (!node) {
        console.warn(`⚠️  Warning: Task ${taskId} not found in dependency graph`);
        return 0;
      }

      if (!node.dependencies || node.dependencies.length === 0) {
        levels.set(taskId, 0);
        node.level = 0;
        return 0;
      }

      let maxDepLevel = -1;
      for (const depId of node.dependencies) {
        const depLevel = calculateLevel(depId);
        if (depLevel > maxDepLevel) {
          maxDepLevel = depLevel;
        }
      }

      const level = maxDepLevel + 1;
      levels.set(taskId, level);
      node.level = level;
      return level;
    };

    // Calculate levels for all nodes
    for (const taskId of Object.keys(graph)) {
      calculateLevel(taskId);
    }
  }

  /**
   * Inject context variables into prompts
   */
  injectContextVariables(prompt, analysis, projectSpec) {
    let contextualizedPrompt = prompt;

    const variables = {
      targetMarket: analysis.targetMarket,
      language: analysis.language,
      clientName: analysis.clientName,
      projectUuid: analysis.projectUuid,
      deliverableType: analysis.deliverableType,
      complexity: analysis.complexity,
      psychographicSegments: this.formatPsychographicSegments(analysis.existingContext),
      targetKeyword: projectSpec.targetKeyword || 'primary keyword',
      framework: projectSpec.framework || 'Next.js',
      projectType: projectSpec.projectType || 'web application',
      daysBack: projectSpec.daysBack || 30,
      ...projectSpec.customVariables
    };

    // Replace all {variableName} patterns
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      contextualizedPrompt = contextualizedPrompt.replace(pattern, value);
    }

    return contextualizedPrompt;
  }

  /**
   * Enrich context from crystalline memory
   */
  async enrichContextFromMemory(analysis, projectSpec) {
    const enrichedContext = {
      psychographicData: null,
      existingResearch: null,
      historicalPerformance: null,
      additionalContext: {}
    };

    if (!this.crystallineMemory) {
      return enrichedContext;
    }

    try {
      // Retrieve psychographic data
      if (analysis.existingContext?.psychographicData?.length > 0) {
        enrichedContext.psychographicData = analysis.existingContext.psychographicData;
      } else {
        const psychographicMemory = await this.crystallineMemory.searchMemory(
          analysis.clientName,
          { semantic_tags: ['psychographic'], limit: 3 }
        );
        enrichedContext.psychographicData = psychographicMemory;
      }

      // Retrieve existing SEO research
      const seoResearch = await this.crystallineMemory.searchMemory(
        analysis.clientName,
        { semantic_tags: ['seo-research', 'keyword-research'], limit: 5 }
      );
      enrichedContext.existingResearch = seoResearch;

      // Retrieve historical performance data
      const performanceData = await this.crystallineMemory.searchMemory(
        `${analysis.deliverableType} ${analysis.clientName}`,
        { semantic_tags: ['pipeline-execution', 'success'], limit: 3 }
      );
      enrichedContext.historicalPerformance = performanceData;

      // Retrieve competitor insights
      const competitorInsights = await this.crystallineMemory.searchMemory(
        `${analysis.targetMarket} competitors`,
        { semantic_tags: ['competitive-intelligence'], limit: 3 }
      );
      enrichedContext.additionalContext.competitorInsights = competitorInsights;

    } catch (error) {
      console.warn('Could not enrich context from memory:', error.message);
    }

    return enrichedContext;
  }

  /**
   * Generate quality thresholds from template and analysis
   */
  generateQualityThresholds(template, analysis) {
    const thresholds = {
      gates: [],
      overallMinimum: analysis.successCriteria.minimumQuality || 85,
      languagePurity: analysis.successCriteria.languagePurity || 100,
      blockingGates: []
    };

    // Add template quality gates
    if (template.qualityGates) {
      for (const gateName of template.qualityGates) {
        const gate = {
          name: gateName,
          blocking: this.isBlockingGate(gateName),
          criteria: this.getGateCriteria(gateName),
          stage: this.findGateStage(gateName, template)
        };

        thresholds.gates.push(gate);

        if (gate.blocking) {
          thresholds.blockingGates.push(gateName);
        }
      }
    }

    // Add stage-specific gates
    for (const stage of template.stages) {
      if (stage.qualityGate) {
        const gate = {
          name: stage.qualityGate,
          blocking: stage.qualityGate.includes('blocking'),
          criteria: this.getGateCriteria(stage.qualityGate),
          stage: stage.stage
        };

        thresholds.gates.push(gate);

        if (gate.blocking) {
          thresholds.blockingGates.push(stage.qualityGate);
        }
      }
    }

    return thresholds;
  }

  /**
   * Helper: Check if quality gate is blocking
   */
  isBlockingGate(gateName) {
    const blockingPatterns = [
      'blocking',
      'critical',
      'purity_100',
      'validation_blocking',
      'mandatory'
    ];

    return blockingPatterns.some(pattern => gateName.toLowerCase().includes(pattern));
  }

  /**
   * Helper: Get quality gate criteria
   */
  getGateCriteria(gateName) {
    const criteriaMap = {
      'outline_validation_blocking': {
        minimumScore: 85,
        requiredFields: ['psychographicTargeting', 'keywordStrategy', 'contentArchitecture'],
        mustPass: true
      },
      'language_purity_100': {
        languagePurity: 100,
        allowedContamination: 0,
        mustPass: true
      },
      'overall_quality_90': {
        minimumScore: 90,
        allDimensionsPass: true
      },
      'content_architecture_compliance': {
        paragraphDistribution: { short: 40, medium: 40, long: 20 },
        maxLists: 20,
        maxTables: 8
      },
      'keyword_validation': {
        minimumKeywords: 10,
        searchVolumeThreshold: 100
      },
      'strategy_coherence': {
        minimumScore: 85,
        logicalFlow: true
      },
      'semantic_completeness': {
        minimumClusters: 3,
        clusterCoherence: 0.8
      }
    };

    return criteriaMap[gateName] || { minimumScore: 80 };
  }

  /**
   * Helper: Find stage for quality gate
   */
  findGateStage(gateName, template) {
    for (const stage of template.stages) {
      if (stage.qualityGate === gateName) {
        return stage.stage;
      }
    }
    return null;
  }

  /**
   * Helper: Infer domain from agent type
   */
  inferDomain(agentType) {
    const domainMap = {
      'seo-': 'seo',
      'content-': 'content',
      'advertising-': 'advertising',
      'wireframe-': 'webdev',
      'design-': 'webdev',
      'psychographic-': 'research',
      'reviews-': 'reputation',
      'competitor-': 'research'
    };

    for (const [prefix, domain] of Object.entries(domainMap)) {
      if (agentType.startsWith(prefix)) {
        return domain;
      }
    }

    return 'general';
  }

  /**
   * Helper: Infer capabilities from agent type
   */
  inferCapabilities(agentType) {
    const capabilityMap = {
      'seo-keyword-research': ['keyword-research', 'search-volume-analysis'],
      'seo-intent-mapping': ['search-intent', 'user-journey'],
      'seo-semantic-clustering': ['semantic-clustering', 'topic-architecture'],
      'content-writer-specialist': ['content-writing', 'copywriting'],
      'content-quality-validator': ['quality-validation', 'qa'],
      'content-outline-architect': ['outline-creation', 'content-planning'],
      'psychographic-research': ['psychographic-analysis', 'audience-research'],
      'offer-creation-specialist': ['offer-creation', 'value-proposition'],
      'direct-response-copywriter': ['direct-response', 'conversion-copywriting'],
      'wireframe-creation-specialist': ['wireframe-design', 'ux-design']
    };

    return capabilityMap[agentType] || [agentType];
  }

  /**
   * Helper: Determine output destination
   */
  determineOutputDestination(projectUuid, stage, outputFormat) {
    const basePath = `/Users/kris/CLAUDEtools/ORCHESTRAI/projects/${projectUuid}/deliverables`;

    const stagePathMap = {
      'keyword_discovery': `${basePath}/seo/keyword-research`,
      'search_intent_analysis': `${basePath}/seo/search-intent`,
      'competitor_analysis': `${basePath}/seo/competitive-analysis`,
      'semantic_clustering': `${basePath}/seo/semantic-clusters`,
      'strategy_generation': `${basePath}/seo/content-strategy`,
      'psychographic_analysis': `${basePath}/research/psychographic`,
      'outline_creation': `${basePath}/content/outlines`,
      'content_writing': `${basePath}/content/articles`,
      'quality_validation': `${basePath}/content/quality-reports`,
      'internal_linking': `${basePath}/seo/internal-linking`,
      'offer_creation': `${basePath}/advertising/offers`,
      'platform_strategy': `${basePath}/advertising/platform-strategy`,
      'creative_development': `${basePath}/advertising/creatives`,
      'wireframe_design': `${basePath}/design/wireframes`,
      'design_system': `${basePath}/design/design-system`,
      'development': `${basePath}/development`,
      'review_monitoring': `${basePath}/reputation/reviews`
    };

    return stagePathMap[stage] || `${basePath}/${stage}`;
  }

  /**
   * Helper: Format psychographic segments for prompt injection
   */
  formatPsychographicSegments(existingContext) {
    if (!existingContext?.psychographicData?.length) {
      return 'General audience segments to be analyzed';
    }

    return existingContext.psychographicData
      .map(seg => `${seg.name || 'Segment'}: ${seg.description || seg.content}`)
      .join('; ');
  }

  /**
   * Helper: Estimate max duration
   */
  estimateMaxDuration(templates) {
    if (templates[0]?.estimatedDuration) {
      return templates[0].estimatedDuration;
    }
    return 120; // Default 2 hours
  }

  /**
   * Get workflow generation statistics
   */
  getGenerationStatistics() {
    return {
      totalGenerated: 0, // Would track in production
      averageTaskCount: 0,
      averageComplexity: 'medium'
    };
  }
}

module.exports = WorkflowConfigGenerator;
