// Async Coordination Patterns System
// Enables sophisticated non-blocking agent coordination within Claude Code constraints
// Implements event-driven workflows, delegation chains, and parallel execution patterns

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class AsyncCoordinationPatterns extends EventEmitter {
  constructor(crystallineMemory, contextPreservation, taskBatcher, redis = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.contextPreservation = contextPreservation;
    this.taskBatcher = taskBatcher;
    this.redis = redis;
    
    // Active coordination workflows
    this.activeWorkflows = new Map();
    
    // Agent coordination state
    this.agentCoordination = new Map();
    
    // Event-driven workflow patterns
    this.workflowPatterns = {
      sequential: {
        name: 'Sequential Chain',
        description: 'Tasks executed in sequence with dependency management',
        suitableFor: ['content-creation', 'seo-research', 'design-implementation']
      },
      parallel: {
        name: 'Parallel Execution',
        description: 'Independent tasks executed simultaneously',
        suitableFor: ['multi-language-content', 'competitor-analysis', 'asset-generation']
      },
      pipeline: {
        name: 'Pipeline Flow',
        description: 'Continuous flow with stage-based processing',
        suitableFor: ['content-optimization', 'quality-assurance', 'iterative-refinement']
      },
      mesh: {
        name: 'Mesh Coordination',
        description: 'Dynamic agent-to-agent coordination based on expertise',
        suitableFor: ['complex-research', 'cross-domain-projects', 'innovation-tasks']
      },
      event_driven: {
        name: 'Event-Driven Workflow',
        description: 'Reactive coordination based on state changes and triggers',
        suitableFor: ['real-time-monitoring', 'adaptive-workflows', 'error-recovery']
      }
    };
    
    // Coordination state tracking
    this.coordinationMetrics = {
      workflowsStarted: 0,
      workflowsCompleted: 0,
      averageCoordinationTime: 0,
      agentUtilization: new Map(),
      patternEffectiveness: new Map()
    };
    
    console.log('🎯 Async Coordination Patterns initialized - Enabling sophisticated agent coordination');
  }

  /**
   * Create a new coordination workflow with specified pattern
   */
  async createCoordinationWorkflow(workflowConfig, options = {}) {
    const workflowId = uuidv4();
    const timestamp = Date.now();
    
    try {
      // Validate workflow configuration
      const validationResult = await this.validateWorkflowConfig(workflowConfig);
      if (!validationResult.valid) {
        throw new Error(`Invalid workflow config: ${validationResult.errors.join(', ')}`);
      }
      
      // Determine optimal coordination pattern
      const optimalPattern = this.selectOptimalPattern(workflowConfig);
      
      // Create workflow instance
      const workflow = {
        workflowId,
        config: workflowConfig,
        pattern: optimalPattern,
        status: 'initialized',
        createdAt: timestamp,
        agents: new Map(),
        tasks: new Map(),
        dependencies: this.buildDependencyGraph(workflowConfig.tasks),
        context: {
          projectUuid: workflowConfig.projectUuid,
          clientName: workflowConfig.clientName,
          deliverableType: workflowConfig.deliverableType
        },
        coordination: {
          activeAgents: new Set(),
          pendingTasks: new Set(),
          completedTasks: new Set(),
          blockedTasks: new Set()
        },
        metrics: {
          startTime: timestamp,
          agentStartTimes: new Map(),
          taskCompletionTimes: new Map(),
          coordinationEvents: []
        }
      };
      
      // Store workflow
      this.activeWorkflows.set(workflowId, workflow);
      
      // Initialize pattern-specific coordination
      await this.initializePatternCoordination(workflow);
      
      // Store in Redis for distributed access
      if (this.redis) {
        await this.redis.setex(
          `orchestrai:coordination:workflow:${workflowId}`,
          86400, // 24 hours
          JSON.stringify(workflow)
        );
      }
      
      console.log(`🚀 Coordination workflow created: ${workflowId} using ${optimalPattern.name} pattern`);
      
      this.coordinationMetrics.workflowsStarted++;
      
      this.emit('workflow-created', {
        workflowId,
        pattern: optimalPattern.name,
        agentCount: workflowConfig.agents.length,
        taskCount: workflowConfig.tasks.length
      });
      
      return { workflowId, pattern: optimalPattern };
      
    } catch (error) {
      console.error('❌ Failed to create coordination workflow:', error.message);
      throw error;
    }
  }

  /**
   * Start coordinated execution of a workflow
   */
  async startCoordinatedExecution(workflowId, executionOptions = {}) {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }
      
      if (workflow.status !== 'initialized' && workflow.status !== 'paused') {
        throw new Error(`Workflow ${workflowId} cannot be started from status: ${workflow.status}`);
      }
      
      // Update workflow status
      workflow.status = 'executing';
      workflow.metrics.executionStartTime = Date.now();
      
      // Capture context for all participating agents
      const workflowContext = await this.captureWorkflowContext(workflow);
      
      // Initialize agents according to pattern
      await this.initializeWorkflowAgents(workflow, workflowContext);
      
      // Start pattern-specific execution
      const executionPlan = await this.createExecutionPlan(workflow);
      await this.executeCoordinationPattern(workflow, executionPlan, executionOptions);
      
      // Update workflow
      this.activeWorkflows.set(workflowId, workflow);
      
      console.log(`🎬 Coordinated execution started for workflow ${workflowId}`);
      
      this.emit('workflow-started', {
        workflowId,
        pattern: workflow.pattern.name,
        executionPlan: executionPlan.summary
      });
      
      return {
        workflowId,
        status: 'executing',
        executionPlan: executionPlan.summary,
        estimatedCompletion: executionPlan.estimatedCompletion
      };
      
    } catch (error) {
      console.error('❌ Failed to start coordinated execution:', error.message);
      throw error;
    }
  }

  /**
   * Execute coordination pattern with Claude Code optimization
   */
  async executeCoordinationPattern(workflow, executionPlan, options) {
    const { pattern } = workflow;
    
    try {
      switch (pattern.name) {
        case 'Sequential Chain':
          return await this.executeSequentialPattern(workflow, executionPlan, options);
          
        case 'Parallel Execution':
          return await this.executeParallelPattern(workflow, executionPlan, options);
          
        case 'Pipeline Flow':
          return await this.executePipelinePattern(workflow, executionPlan, options);
          
        case 'Mesh Coordination':
          return await this.executeMeshPattern(workflow, executionPlan, options);
          
        case 'Event-Driven Workflow':
          return await this.executeEventDrivenPattern(workflow, executionPlan, options);
          
        default:
          throw new Error(`Unknown coordination pattern: ${pattern.name}`);
      }
    } catch (error) {
      console.error(`❌ Pattern execution failed for ${pattern.name}:`, error.message);
      await this.handleCoordinationError(workflow, error);
      throw error;
    }
  }

  /**
   * Execute sequential chain pattern - tasks in dependency order
   */
  async executeSequentialPattern(workflow, executionPlan, options) {
    console.log(`🔗 Executing Sequential Chain pattern for workflow ${workflow.workflowId}`);
    
    const { taskChains } = executionPlan;
    let completedTasks = 0;
    
    for (const chain of taskChains) {
      for (const taskGroup of chain.taskGroups) {
        // Execute tasks that can run in parallel within this step
        const batchTasks = taskGroup.tasks.map(task => ({
          taskId: task.taskId,
          agentType: task.agentType,
          prompt: this.buildTaskPrompt(task, workflow),
          context: task.context,
          dependencies: task.dependencies
        }));
        
        // Use task batcher for optimal Claude Code execution
        const batchId = await this.taskBatcher.queueBatch(batchTasks, {
          priority: 'high',
          coordinationWorkflow: workflow.workflowId,
          patternType: 'sequential'
        });
        
        // Wait for batch completion
        const results = await this.taskBatcher.waitForBatch(batchId);
        
        // Process results and update workflow state
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const task = taskGroup.tasks[i];
          
          await this.processTaskResult(workflow, task, result);
          completedTasks++;
          
          // Update coordination state
          workflow.coordination.completedTasks.add(task.taskId);
          workflow.coordination.pendingTasks.delete(task.taskId);
        }
        
        // Check for errors that should halt the chain
        const criticalErrors = results.filter(r => r.error && r.critical);
        if (criticalErrors.length > 0) {
          throw new Error(`Critical errors in sequential chain: ${criticalErrors.map(e => e.error).join(', ')}`);
        }
        
        console.log(`✅ Completed task group ${taskGroup.groupId}: ${completedTasks}/${workflow.config.tasks.length} total tasks`);
      }
    }
    
    return { completedTasks, totalTasks: workflow.config.tasks.length };
  }

  /**
   * Execute parallel pattern - independent tasks simultaneously
   */
  async executeParallelPattern(workflow, executionPlan, options) {
    console.log(`🔄 Executing Parallel Execution pattern for workflow ${workflow.workflowId}`);
    
    const { parallelGroups } = executionPlan;
    const allResults = [];
    
    // Execute parallel groups sequentially, but tasks within groups in parallel
    for (const group of parallelGroups) {
      const batchTasks = group.tasks.map(task => ({
        taskId: task.taskId,
        agentType: task.agentType,
        prompt: this.buildTaskPrompt(task, workflow),
        context: task.context,
        priority: task.priority || 'normal'
      }));
      
      // Create optimized batch for parallel execution
      const batchId = await this.taskBatcher.queueBatch(batchTasks, {
        priority: 'high',
        coordinationWorkflow: workflow.workflowId,
        patternType: 'parallel',
        allowConcurrency: true
      });
      
      // Execute batch and collect results
      const results = await this.taskBatcher.waitForBatch(batchId);
      
      // Process all results from this parallel group
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const task = group.tasks[i];
        
        await this.processTaskResult(workflow, task, result);
        
        // Update coordination state
        workflow.coordination.completedTasks.add(task.taskId);
        workflow.coordination.pendingTasks.delete(task.taskId);
      }
      
      allResults.push(...results);
      console.log(`✅ Completed parallel group ${group.groupId}: ${group.tasks.length} tasks`);
    }
    
    return { 
      completedTasks: allResults.filter(r => !r.error).length,
      totalTasks: allResults.length,
      errors: allResults.filter(r => r.error)
    };
  }

  /**
   * Execute pipeline pattern - continuous flow with stages
   */
  async executePipelinePattern(workflow, executionPlan, options) {
    console.log(`📊 Executing Pipeline Flow pattern for workflow ${workflow.workflowId}`);
    
    const { pipeline } = executionPlan;
    const stageResults = new Map();
    
    for (const stage of pipeline.stages) {
      console.log(`🔧 Processing pipeline stage: ${stage.stageName}`);
      
      // Prepare tasks for this stage
      const stageTasks = stage.tasks.map(task => ({
        taskId: task.taskId,
        agentType: task.agentType,
        prompt: this.buildTaskPrompt(task, workflow, stageResults),
        context: {
          ...task.context,
          pipelineStage: stage.stageName,
          previousStageResults: this.getRelevantStageResults(stageResults, task.dependencies)
        }
      }));
      
      // Execute stage tasks
      const batchId = await this.taskBatcher.queueBatch(stageTasks, {
        priority: 'high',
        coordinationWorkflow: workflow.workflowId,
        patternType: 'pipeline',
        stage: stage.stageName
      });
      
      const results = await this.taskBatcher.waitForBatch(batchId);
      
      // Process stage results
      const stageOutputs = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const task = stage.tasks[i];
        
        await this.processTaskResult(workflow, task, result);
        stageOutputs.push({
          taskId: task.taskId,
          output: result.output,
          metadata: result.metadata
        });
        
        workflow.coordination.completedTasks.add(task.taskId);
        workflow.coordination.pendingTasks.delete(task.taskId);
      }
      
      // Store stage results for next stage
      stageResults.set(stage.stageName, {
        outputs: stageOutputs,
        completedAt: Date.now(),
        success: results.every(r => !r.error)
      });
      
      console.log(`✅ Pipeline stage ${stage.stageName} completed with ${stageOutputs.length} outputs`);
      
      // Check if stage failed and should halt pipeline
      if (!stageResults.get(stage.stageName).success) {
        const errors = results.filter(r => r.error).map(r => r.error);
        throw new Error(`Pipeline stage ${stage.stageName} failed: ${errors.join(', ')}`);
      }
    }
    
    return {
      pipelineCompleted: true,
      stageCount: pipeline.stages.length,
      totalOutputs: Array.from(stageResults.values()).reduce((sum, stage) => sum + stage.outputs.length, 0)
    };
  }

  /**
   * Execute mesh coordination pattern - dynamic agent-to-agent coordination
   */
  async executeMeshPattern(workflow, executionPlan, options) {
    console.log(`🕸️ Executing Mesh Coordination pattern for workflow ${workflow.workflowId}`);
    
    const { meshTopology } = executionPlan;
    const coordinationEvents = [];
    
    // Initialize mesh coordination state
    const meshState = {
      activeNodes: new Map(),
      connections: new Map(),
      sharedContext: new Map()
    };
    
    // Start with initial tasks (no dependencies)
    let availableTasks = meshTopology.initialTasks;
    
    while (availableTasks.length > 0) {
      // Create coordination batch for available tasks
      const batchTasks = availableTasks.map(task => ({
        taskId: task.taskId,
        agentType: task.agentType,
        prompt: this.buildTaskPrompt(task, workflow, meshState.sharedContext),
        context: {
          ...task.context,
          meshConnections: this.getMeshConnections(task, meshState),
          coordinationEvents: coordinationEvents.slice(-10) // Recent events for context
        }
      }));
      
      // Execute batch with mesh coordination
      const batchId = await this.taskBatcher.queueBatch(batchTasks, {
        priority: 'high',
        coordinationWorkflow: workflow.workflowId,
        patternType: 'mesh',
        allowDynamicCoordination: true
      });
      
      const results = await this.taskBatcher.waitForBatch(batchId);
      
      // Process results and update mesh state
      const completedTaskIds = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const task = availableTasks[i];
        
        await this.processTaskResult(workflow, task, result);
        
        // Update mesh coordination state
        meshState.sharedContext.set(task.taskId, {
          output: result.output,
          insights: result.insights,
          connections: result.suggestedConnections || []
        });
        
        completedTaskIds.push(task.taskId);
        workflow.coordination.completedTasks.add(task.taskId);
        
        // Record coordination event
        coordinationEvents.push({
          type: 'task-completed',
          taskId: task.taskId,
          agentType: task.agentType,
          timestamp: Date.now(),
          connections: result.suggestedConnections || []
        });
      }
      
      // Determine next available tasks based on mesh topology
      availableTasks = this.getNextMeshTasks(meshTopology, completedTaskIds, workflow.coordination);
      
      console.log(`🔗 Mesh coordination step completed: ${completedTaskIds.length} tasks, ${availableTasks.length} remaining`);
    }
    
    return {
      meshCoordinationCompleted: true,
      coordinationEvents: coordinationEvents.length,
      sharedInsights: meshState.sharedContext.size
    };
  }

  /**
   * Execute event-driven pattern - reactive coordination
   */
  async executeEventDrivenPattern(workflow, executionPlan, options) {
    console.log(`⚡ Executing Event-Driven Workflow pattern for workflow ${workflow.workflowId}`);
    
    const { eventHandlers } = executionPlan;
    const eventQueue = [];
    
    // Initialize event-driven state
    workflow.eventState = {
      activeHandlers: new Set(),
      eventHistory: [],
      triggers: new Map()
    };
    
    // Start with initial trigger events
    const initialEvents = workflow.config.triggers || [{ type: 'workflow-start', data: {} }];
    eventQueue.push(...initialEvents.map(event => ({
      ...event,
      timestamp: Date.now(),
      id: uuidv4()
    })));
    
    // Process events until queue is empty
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      console.log(`📨 Processing event: ${event.type}`);
      
      // Find handlers for this event type
      const handlers = eventHandlers.filter(h => h.eventType === event.type);
      
      if (handlers.length === 0) {
        console.log(`⚠️ No handlers found for event type: ${event.type}`);
        continue;
      }
      
      // Execute handlers for this event
      const handlerTasks = handlers.map(handler => ({
        taskId: handler.taskId,
        agentType: handler.agentType,
        prompt: this.buildEventHandlerPrompt(handler, event, workflow),
        context: {
          ...handler.context,
          triggerEvent: event,
          eventHistory: workflow.eventState.eventHistory.slice(-5)
        }
      }));
      
      const batchId = await this.taskBatcher.queueBatch(handlerTasks, {
        priority: event.priority || 'normal',
        coordinationWorkflow: workflow.workflowId,
        patternType: 'event-driven',
        eventType: event.type
      });
      
      const results = await this.taskBatcher.waitForBatch(batchId);
      
      // Process handler results and generate new events
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const handler = handlers[i];
        
        await this.processTaskResult(workflow, handler, result);
        
        // Check for new events generated by handlers
        if (result.generatedEvents) {
          const newEvents = result.generatedEvents.map(genEvent => ({
            ...genEvent,
            timestamp: Date.now(),
            id: uuidv4(),
            source: handler.taskId
          }));
          eventQueue.push(...newEvents);
        }
        
        workflow.coordination.completedTasks.add(handler.taskId);
      }
      
      // Record event in history
      workflow.eventState.eventHistory.push({
        event,
        handlersExecuted: handlers.length,
        results: results.length,
        newEventsGenerated: results.reduce((sum, r) => sum + (r.generatedEvents?.length || 0), 0),
        timestamp: Date.now()
      });
      
      console.log(`✅ Event ${event.type} processed: ${handlers.length} handlers, ${results.length} results`);
    }
    
    return {
      eventDrivenCompleted: true,
      eventsProcessed: workflow.eventState.eventHistory.length,
      handlersExecuted: workflow.eventState.eventHistory.reduce((sum, h) => sum + h.handlersExecuted, 0)
    };
  }

  /**
   * Build task prompt with coordination context
   */
  buildTaskPrompt(task, workflow, additionalContext = {}) {
    const basePrompt = task.prompt;
    
    const coordinationContext = {
      workflowId: workflow.workflowId,
      projectUuid: workflow.context.projectUuid,
      clientName: workflow.context.clientName,
      coordinationPattern: workflow.pattern.name,
      taskPosition: `${Array.from(workflow.coordination.completedTasks).length + 1}/${workflow.config.tasks.length}`,
      ...additionalContext
    };
    
    // Inject coordination context into prompt
    const contextInjection = `
COORDINATION CONTEXT:
- Workflow: ${coordinationContext.workflowId} (${coordinationContext.coordinationPattern})
- Project: ${coordinationContext.clientName} (${coordinationContext.projectUuid})
- Progress: ${coordinationContext.taskPosition}
${Object.entries(additionalContext).length > 0 ? `\nADDITIONAL CONTEXT:\n${JSON.stringify(additionalContext, null, 2)}` : ''}

TASK:
${basePrompt}
`;
    
    return contextInjection;
  }

  /**
   * Process task result and update workflow coordination
   */
  async processTaskResult(workflow, task, result) {
    try {
      // Store result in workflow
      workflow.tasks.set(task.taskId, {
        ...task,
        result,
        completedAt: Date.now(),
        status: result.error ? 'failed' : 'completed'
      });
      
      // Update coordination metrics
      workflow.metrics.taskCompletionTimes.set(task.taskId, Date.now());
      
      // Store in crystalline memory for learning
      if (this.crystallineMemory && !result.error) {
        await this.crystallineMemory.storeMemory(
          'coordination-success',
          {
            workflowId: workflow.workflowId,
            taskId: task.taskId,
            agentType: task.agentType,
            pattern: workflow.pattern.name,
            result: result.output,
            context: task.context
          },
          {
            importance: 0.7,
            semantic_tags: ['coordination', 'task-completion', workflow.pattern.name.toLowerCase()],
            retention: 'medium-term'
          }
        );
      }
      
      // Emit coordination event
      this.emit('task-completed', {
        workflowId: workflow.workflowId,
        taskId: task.taskId,
        agentType: task.agentType,
        success: !result.error,
        duration: Date.now() - (workflow.metrics.agentStartTimes.get(task.taskId) || Date.now())
      });
      
    } catch (error) {
      console.error('❌ Failed to process task result:', error.message);
    }
  }

  /**
   * Select optimal coordination pattern for workflow
   */
  selectOptimalPattern(workflowConfig) {
    const { tasks, deliverableType, agents, constraints = {} } = workflowConfig;
    
    // Analyze task dependencies
    const hasDependencies = tasks.some(task => task.dependencies && task.dependencies.length > 0);
    const canParallelize = tasks.filter(task => !task.dependencies || task.dependencies.length === 0).length > 1;
    const hasStages = deliverableType && ['content-optimization', 'quality-assurance'].includes(deliverableType);
    const isComplex = tasks.length > 5 || agents.length > 3;
    const needsReactive = constraints.realTimeUpdates || constraints.adaptiveWorkflow;
    
    // Pattern selection logic
    if (needsReactive) {
      return this.workflowPatterns.event_driven;
    } else if (isComplex && agents.some(a => a.expertiseLevel === 'advanced')) {
      return this.workflowPatterns.mesh;
    } else if (hasStages) {
      return this.workflowPatterns.pipeline;
    } else if (canParallelize && !hasDependencies) {
      return this.workflowPatterns.parallel;
    } else {
      return this.workflowPatterns.sequential;
    }
  }

  /**
   * Initialize pattern-specific coordination setup
   */
  async initializePatternCoordination(workflow) {
    const { pattern } = workflow;
    
    switch (pattern.name) {
      case 'Sequential Chain':
        workflow.patternState = {
          currentChainIndex: 0,
          chainProgress: new Map()
        };
        break;
        
      case 'Parallel Execution':
        workflow.patternState = {
          parallelGroups: this.groupTasksForParallel(workflow.config.tasks),
          groupProgress: new Map()
        };
        break;
        
      case 'Pipeline Flow':
        workflow.patternState = {
          currentStage: 0,
          stageOutputs: new Map(),
          pipelineBuffer: new Map()
        };
        break;
        
      case 'Mesh Coordination':
        workflow.patternState = {
          meshConnections: new Map(),
          sharedResources: new Map(),
          coordinationHistory: []
        };
        break;
        
      case 'Event-Driven Workflow':
        workflow.patternState = {
          eventQueue: [],
          activeHandlers: new Set(),
          eventHistory: []
        };
        break;
    }
  }

  /**
   * Create execution plan optimized for Claude Code constraints
   */
  async createExecutionPlan(workflow) {
    const { pattern, config } = workflow;
    
    const basePlan = {
      workflowId: workflow.workflowId,
      pattern: pattern.name,
      estimatedDuration: this.estimateWorkflowDuration(workflow),
      estimatedCompletion: Date.now() + this.estimateWorkflowDuration(workflow),
      claudeCodeOptimizations: {
        batchSizes: this.calculateOptimalBatchSizes(config.tasks),
        parallelGroups: this.identifyParallelOpportunities(config.tasks),
        contextHandoffs: this.planContextHandoffs(config.tasks)
      }
    };
    
    // Add pattern-specific execution details
    switch (pattern.name) {
      case 'Sequential Chain':
        basePlan.taskChains = this.buildTaskChains(config.tasks);
        basePlan.summary = `Sequential execution with ${basePlan.taskChains.length} chains`;
        break;
        
      case 'Parallel Execution':
        basePlan.parallelGroups = this.groupTasksForParallel(config.tasks);
        basePlan.summary = `Parallel execution with ${basePlan.parallelGroups.length} groups`;
        break;
        
      case 'Pipeline Flow':
        basePlan.pipeline = this.buildPipelineStages(config.tasks);
        basePlan.summary = `Pipeline with ${basePlan.pipeline.stages.length} stages`;
        break;
        
      case 'Mesh Coordination':
        basePlan.meshTopology = this.buildMeshTopology(config.tasks, config.agents);
        basePlan.summary = `Mesh coordination with ${config.agents.length} agent nodes`;
        break;
        
      case 'Event-Driven Workflow':
        basePlan.eventHandlers = this.buildEventHandlers(config.tasks);
        basePlan.summary = `Event-driven with ${basePlan.eventHandlers.length} handlers`;
        break;
    }
    
    return basePlan;
  }

  /**
   * Build dependency graph for tasks
   */
  buildDependencyGraph(tasks) {
    const graph = new Map();
    
    for (const task of tasks) {
      graph.set(task.taskId, {
        dependencies: task.dependencies || [],
        dependents: []
      });
    }
    
    // Build reverse dependencies
    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (graph.has(depId)) {
            graph.get(depId).dependents.push(task.taskId);
          }
        }
      }
    }
    
    return graph;
  }

  /**
   * Get workflow from local cache or Redis
   */
  async getWorkflow(workflowId) {
    let workflow = this.activeWorkflows.get(workflowId);
    
    if (!workflow && this.redis) {
      try {
        const data = await this.redis.get(`orchestrai:coordination:workflow:${workflowId}`);
        if (data) {
          workflow = JSON.parse(data);
          this.activeWorkflows.set(workflowId, workflow);
        }
      } catch (error) {
        console.warn('Failed to retrieve workflow from Redis:', error.message);
      }
    }
    
    return workflow;
  }

  /**
   * Validate workflow configuration
   */
  async validateWorkflowConfig(config) {
    const errors = [];
    
    if (!config.tasks || !Array.isArray(config.tasks) || config.tasks.length === 0) {
      errors.push('Tasks array is required and must not be empty');
    }
    
    if (!config.agents || !Array.isArray(config.agents) || config.agents.length === 0) {
      errors.push('Agents array is required and must not be empty');
    }
    
    if (!config.projectUuid) {
      errors.push('Project UUID is required');
    }
    
    // Validate task structure
    for (const task of config.tasks || []) {
      if (!task.taskId || !task.agentType || !task.prompt) {
        errors.push(`Task ${task.taskId || 'unknown'} missing required fields: taskId, agentType, prompt`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get coordination statistics and metrics
   */
  getCoordinationStatistics() {
    const stats = {
      ...this.coordinationMetrics,
      activeWorkflows: this.activeWorkflows.size,
      patternDistribution: {}
    };
    
    // Calculate pattern usage distribution
    for (const workflow of this.activeWorkflows.values()) {
      const patternName = workflow.pattern.name;
      stats.patternDistribution[patternName] = (stats.patternDistribution[patternName] || 0) + 1;
    }
    
    // Calculate average coordination time
    const completedWorkflows = Array.from(this.activeWorkflows.values())
      .filter(w => w.status === 'completed');
    
    if (completedWorkflows.length > 0) {
      const totalTime = completedWorkflows.reduce((sum, w) => 
        sum + (w.metrics.completionTime - w.metrics.startTime), 0);
      stats.averageCoordinationTime = totalTime / completedWorkflows.length;
    }
    
    return stats;
  }

  /**
   * Clean up completed workflows
   */
  async cleanupCompletedWorkflows(maxAge = 86400000) { // 24 hours
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [workflowId, workflow] of this.activeWorkflows.entries()) {
      if (workflow.status === 'completed' && (now - workflow.createdAt) > maxAge) {
        this.activeWorkflows.delete(workflowId);
        cleanedCount++;
      }
    }
    
    console.log(`🧹 Cleaned up ${cleanedCount} old coordination workflows`);
    return cleanedCount;
  }
}

module.exports = AsyncCoordinationPatterns;