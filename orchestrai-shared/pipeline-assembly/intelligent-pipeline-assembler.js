/**
 * ORCHESTRAI Intelligent Pipeline Assembler
 *
 * Automatically assembles complete execution pipelines from project specifications.
 * Integrates with AsyncCoordinationPatterns, DynamicAgentSelection, and CrystallineMemory
 * to create self-executing, quality-enforced workflows.
 *
 * Features:
 * - Natural language project spec parsing
 * - Template-based pipeline generation
 * - Dynamic agent selection and coordination
 * - Automatic quality gate enforcement
 * - Self-learning optimization
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const ProjectSpecificationAnalyzer = require('./project-specification-analyzer');
const PipelineTemplateLibrary = require('./pipeline-template-library');
const WorkflowConfigGenerator = require('./workflow-config-generator');
const QualityGateValidator = require('./quality-gate-validator');
const PipelineRegistry = require('./pipeline-registry');

class IntelligentPipelineAssembler extends EventEmitter {
  constructor(coordinationPatterns, dynamicAgentSelection, crystallineMemory, redis = null) {
    super();

    this.coordinationPatterns = coordinationPatterns;
    this.dynamicAgentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;

    // Initialize core components
    this.specAnalyzer = new ProjectSpecificationAnalyzer(crystallineMemory);
    this.templateLibrary = new PipelineTemplateLibrary();
    this.workflowGenerator = new WorkflowConfigGenerator(crystallineMemory);
    this.qualityValidator = new QualityGateValidator();
    this.pipelineRegistry = new PipelineRegistry(
      coordinationPatterns,
      dynamicAgentSelection,
      crystallineMemory,
      redis
    );

    // Assembled pipelines registry
    this.assembledPipelines = new Map();
    this.executingPipelines = new Map();

    // Assembly metrics
    this.assemblyMetrics = {
      totalAssemblies: 0,
      successfulExecutions: 0,
      averageAssemblyTime: 0,
      templateUsage: new Map(),
      patternDistribution: new Map(),
      qualityGateSuccessRate: 0
    };

    // Assembly configuration
    this.config = {
      enableAutoExecution: true,
      requireApproval: false,
      defaultQualityLevel: 'high',
      maxAssemblyTime: 10000, // 10 seconds
      enableLearning: true,
      cacheTemplates: true
    };

    console.log('🎯 Intelligent Pipeline Assembler initialized');
  }

  /**
   * MAIN ENTRY POINT: Assemble pipeline from project specification
   */
  async assemblePipelineFromProject(projectSpec, options = {}) {
    const assemblyId = uuidv4();
    const startTime = Date.now();

    try {
      console.log(`🚀 Starting automatic pipeline assembly: ${assemblyId}`);

      // Step 1: Analyze project specification
      console.log('📋 Step 1: Analyzing project specification...');
      const analysis = await this.specAnalyzer.analyzeProjectRequirements(projectSpec);

      this.emit('analysis-complete', {
        assemblyId,
        analysis: {
          deliverableType: analysis.deliverableType,
          complexity: analysis.complexity,
          estimatedTaskCount: analysis.estimatedTaskCount
        }
      });

      // Step 2: Select appropriate pipeline templates
      console.log('📚 Step 2: Selecting pipeline templates...');
      const templates = await this.selectPipelineTemplates(analysis);

      if (templates.length === 0) {
        throw new Error(`No suitable pipeline templates found for deliverable type: ${analysis.deliverableType}`);
      }

      this.emit('templates-selected', {
        assemblyId,
        templates: templates.map(t => t.name)
      });

      // Step 3: Generate workflow configuration
      console.log('⚙️ Step 3: Generating workflow configuration...');
      const workflowConfig = await this.workflowGenerator.generateWorkflowConfig(
        templates,
        analysis,
        projectSpec
      );

      // Step 4: Select optimal agents dynamically
      console.log('🤖 Step 4: Selecting optimal agents...');
      const selectedAgents = await this.dynamicAgentSelection.selectAgentsForWorkflow({
        requiredCapabilities: analysis.requiredCapabilities,
        workflowTasks: workflowConfig.tasks,
        qualityRequirements: analysis.successCriteria,
        domainPreferences: analysis.domainRequirements
      });

      workflowConfig.selectedAgents = selectedAgents;

      // Step 5: Determine coordination pattern automatically
      console.log('🔀 Step 5: Determining optimal coordination pattern...');
      const coordinationPattern = await this.coordinationPatterns.selectOptimalPattern(workflowConfig);

      workflowConfig.coordinationPattern = coordinationPattern;

      // Step 6: Create execution plan with quality gates
      console.log('📊 Step 6: Creating execution plan with quality gates...');
      const executionPlan = await this.createExecutionPlan(
        workflowConfig,
        coordinationPattern,
        templates
      );

      // Step 7: Validate quality gates
      console.log('✅ Step 7: Validating quality gates...');
      const qualityValidation = await this.qualityValidator.validatePipelineQuality(
        workflowConfig,
        executionPlan,
        analysis.successCriteria
      );

      if (!qualityValidation.passed) {
        console.warn('⚠️ Quality validation warnings:', qualityValidation.warnings);
      }

      // Step 8: Assemble complete pipeline
      const assembledPipeline = {
        pipelineId: assemblyId,
        projectUuid: projectSpec.projectUuid || uuidv4(),
        clientName: projectSpec.clientName || analysis.clientName,

        // Core configuration
        workflowConfig,
        coordinationPattern,
        executionPlan,

        // Template and analysis context
        templates,
        analysis,
        originalSpec: projectSpec,

        // Quality enforcement
        qualityGates: executionPlan.qualityGates,
        successCriteria: analysis.successCriteria,

        // Execution state
        status: 'assembled',
        assembledAt: Date.now(),
        assemblyDuration: Date.now() - startTime,

        // Metadata
        metadata: {
          assemblyId,
          templateNames: templates.map(t => t.name),
          patternName: coordinationPattern.name,
          estimatedDuration: executionPlan.estimatedDuration,
          taskCount: workflowConfig.tasks.length,
          agentCount: selectedAgents.length
        }
      };

      // Store assembled pipeline
      this.assembledPipelines.set(assemblyId, assembledPipeline);

      // Store in Redis for distributed access
      if (this.redis) {
        await this.redis.setex(
          `orchestrai:pipeline:assembled:${assemblyId}`,
          86400, // 24 hours
          JSON.stringify(assembledPipeline)
        );
      }

      // Store in crystalline memory for learning
      if (this.crystallineMemory) {
        await this.crystallineMemory.storeMemory(
          'pipeline-assembly',
          {
            assemblyId,
            deliverableType: analysis.deliverableType,
            templates: templates.map(t => t.name),
            coordinationPattern: coordinationPattern.name,
            complexity: analysis.complexity,
            taskCount: workflowConfig.tasks.length
          },
          {
            importance: 0.8,
            semantic_tags: ['pipeline-assembly', 'automatic-generation', analysis.deliverableType],
            retention: 'long-term'
          }
        );
      }

      // Update metrics
      this.updateAssemblyMetrics(assembledPipeline);

      console.log(`✅ Pipeline assembled successfully: ${assemblyId}`);
      console.log(`   ├─ Template: ${templates[0].name}`);
      console.log(`   ├─ Pattern: ${coordinationPattern.name}`);
      console.log(`   ├─ Tasks: ${workflowConfig.tasks.length}`);
      console.log(`   ├─ Agents: ${selectedAgents.length}`);
      console.log(`   ├─ Estimated Duration: ${executionPlan.estimatedDuration} minutes`);
      console.log(`   └─ Assembly Time: ${Date.now() - startTime}ms`);

      this.emit('pipeline-assembled', {
        pipelineId: assemblyId,
        metadata: assembledPipeline.metadata
      });

      // Auto-execute if configured
      if (options.autoExecute || this.config.enableAutoExecution) {
        if (this.config.requireApproval && !options.approved) {
          console.log('⏸️ Pipeline requires approval before execution');
          assembledPipeline.status = 'pending-approval';
        } else {
          console.log('🎬 Auto-executing pipeline...');
          return await this.executePipeline(assemblyId, options);
        }
      }

      return {
        pipelineId: assemblyId,
        status: assembledPipeline.status,
        metadata: assembledPipeline.metadata,
        executionPlan: {
          summary: executionPlan.summary,
          estimatedDuration: executionPlan.estimatedDuration,
          qualityGates: executionPlan.qualityGates.map(g => g.name)
        },
        execute: () => this.executePipeline(assemblyId, options)
      };

    } catch (error) {
      console.error(`❌ Pipeline assembly failed: ${assemblyId}`, error);

      this.emit('assembly-failed', {
        assemblyId,
        error: error.message,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Select appropriate pipeline templates based on analysis
   */
  async selectPipelineTemplates(analysis) {
    const templates = [];

    // Primary template based on deliverable type
    const primaryTemplate = this.templateLibrary.getTemplate(analysis.deliverableType);

    if (primaryTemplate) {
      templates.push(primaryTemplate);

      // Check if we need additional supporting templates
      const supportingTemplates = this.templateLibrary.getSupportingTemplates(
        primaryTemplate,
        analysis
      );

      templates.push(...supportingTemplates);
    } else {
      // Attempt to find similar templates
      const similarTemplates = this.templateLibrary.findSimilarTemplates(analysis);

      if (similarTemplates.length > 0) {
        console.log(`📝 Using similar template: ${similarTemplates[0].name}`);
        templates.push(similarTemplates[0]);
      }
    }

    return templates;
  }

  /**
   * Create comprehensive execution plan
   */
  async createExecutionPlan(workflowConfig, coordinationPattern, templates) {
    const executionPlan = {
      pipelineId: workflowConfig.workflowId,
      pattern: coordinationPattern.name,

      // Execution timeline
      estimatedDuration: this.estimatePipelineDuration(workflowConfig, templates),
      estimatedCompletion: Date.now() + (this.estimatePipelineDuration(workflowConfig, templates) * 60000),

      // Quality gates from templates
      qualityGates: this.extractQualityGates(templates, workflowConfig),

      // Stage breakdown
      stages: this.buildExecutionStages(workflowConfig, templates),

      // Resource allocation
      resourceAllocation: {
        agents: workflowConfig.selectedAgents.map(a => ({
          agentId: a.id,
          assignedTasks: a.assignedTasks || [],
          estimatedLoad: a.estimatedLoad || 0
        })),
        parallelCapacity: this.calculateParallelCapacity(workflowConfig),
        memoryRequirements: this.estimateMemoryRequirements(workflowConfig)
      },

      // Coordination specifics
      coordinationDetails: await this.coordinationPatterns.createExecutionPlan({
        ...workflowConfig,
        pattern: coordinationPattern
      }),

      // Summary
      summary: this.generateExecutionSummary(workflowConfig, coordinationPattern, templates)
    };

    return executionPlan;
  }

  /**
   * Execute assembled pipeline
   */
  async executePipeline(pipelineId, options = {}) {
    try {
      const pipeline = this.assembledPipelines.get(pipelineId) ||
                       await this.loadPipelineFromRedis(pipelineId);

      if (!pipeline) {
        throw new Error(`Pipeline ${pipelineId} not found`);
      }

      if (pipeline.status === 'executing') {
        throw new Error(`Pipeline ${pipelineId} is already executing`);
      }

      console.log(`🎬 Executing pipeline: ${pipelineId}`);

      // Check if executable pipeline exists for this deliverable type
      const deliverableType = pipeline.analysis.deliverableType;
      const hasExecutable = this.pipelineRegistry.hasPipeline(deliverableType);

      if (hasExecutable) {
        console.log(`✨ Using executable pipeline for: ${deliverableType}`);

        // Execute using dedicated pipeline executable
        const projectSpec = {
          ...pipeline.analysis,
          projectUuid: pipeline.analysis.projectUuid || `project-${Date.now()}`,
          clientName: pipeline.analysis.clientName,
          targetMarket: pipeline.analysis.targetMarket,
          language: pipeline.analysis.language
        };

        const executableResult = await this.pipelineRegistry.executePipeline(
          deliverableType,
          projectSpec,
          options
        );

        // Update pipeline with executable results
        pipeline.status = 'completed';
        pipeline.executionEndTime = Date.now();
        pipeline.executionDuration = executableResult.duration;
        pipeline.result = executableResult;

        console.log(`✅ Executable pipeline completed: ${pipelineId}`);
        console.log(`   └─ Duration: ${executableResult.duration}ms`);

        this.emit('pipeline-completed', {
          pipelineId,
          success: executableResult.success,
          duration: executableResult.duration,
          deliverables: executableResult.deliverablePaths
        });

        return {
          pipelineId,
          success: executableResult.success,
          duration: executableResult.duration,
          result: executableResult,
          pipeline
        };
      }

      // Fallback to template-based coordination execution
      console.log(`📋 Using template-based execution for: ${deliverableType}`);

      // Update pipeline status
      pipeline.status = 'executing';
      pipeline.executionStartTime = Date.now();
      this.executingPipelines.set(pipelineId, pipeline);

      // Create coordination workflow
      const workflowId = await this.coordinationPatterns.createCoordinationWorkflow(
        pipeline.workflowConfig,
        {
          pipelineId,
          qualityGates: pipeline.qualityGates,
          executionPlan: pipeline.executionPlan
        }
      );

      pipeline.coordinationWorkflowId = workflowId.workflowId;

      // Start coordinated execution
      const executionResult = await this.coordinationPatterns.startCoordinatedExecution(
        workflowId.workflowId,
        {
          qualityEnforcement: true,
          autoRetry: options.autoRetry !== false,
          maxRetries: options.maxRetries || 2,
          failFast: options.failFast || false
        }
      );

      // Monitor execution with quality gate validation
      const monitoringPromise = this.monitorPipelineExecution(pipeline, executionResult);

      // Wait for completion
      const finalResult = await monitoringPromise;

      // Update pipeline status
      pipeline.status = finalResult.success ? 'completed' : 'failed';
      pipeline.executionEndTime = Date.now();
      pipeline.executionDuration = pipeline.executionEndTime - pipeline.executionStartTime;
      pipeline.result = finalResult;

      // Store results in crystalline memory
      if (this.crystallineMemory) {
        await this.crystallineMemory.storeMemory(
          'pipeline-execution',
          {
            pipelineId,
            deliverableType: pipeline.analysis.deliverableType,
            success: finalResult.success,
            duration: pipeline.executionDuration,
            qualityScore: finalResult.qualityScore,
            pattern: pipeline.coordinationPattern.name
          },
          {
            importance: finalResult.success ? 0.9 : 0.7,
            semantic_tags: ['pipeline-execution', finalResult.success ? 'success' : 'failure'],
            retention: 'long-term'
          }
        );
      }

      // Update metrics
      if (finalResult.success) {
        this.assemblyMetrics.successfulExecutions++;
      }

      this.executingPipelines.delete(pipelineId);

      console.log(`${finalResult.success ? '✅' : '❌'} Pipeline execution ${finalResult.success ? 'completed' : 'failed'}: ${pipelineId}`);
      console.log(`   └─ Duration: ${pipeline.executionDuration}ms`);

      this.emit('pipeline-completed', {
        pipelineId,
        success: finalResult.success,
        duration: pipeline.executionDuration,
        qualityScore: finalResult.qualityScore
      });

      return {
        pipelineId,
        success: finalResult.success,
        duration: pipeline.executionDuration,
        result: finalResult,
        pipeline
      };

    } catch (error) {
      console.error(`❌ Pipeline execution failed: ${pipelineId}`, error);

      this.emit('execution-failed', {
        pipelineId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Monitor pipeline execution with quality gate validation
   */
  async monitorPipelineExecution(pipeline, executionResult) {
    return new Promise((resolve, reject) => {
      // Listen for coordination workflow events
      this.coordinationPatterns.on('task-completed', async (event) => {
        if (event.workflowId === pipeline.coordinationWorkflowId) {
          // Check if this task has a quality gate
          const qualityGate = pipeline.qualityGates.find(g => g.taskId === event.taskId);

          if (qualityGate) {
            console.log(`🔍 Validating quality gate: ${qualityGate.name}`);

            const validation = await this.qualityValidator.validateQualityGate(
              qualityGate,
              event.result
            );

            if (!validation.passed && qualityGate.blocking) {
              console.error(`❌ Quality gate failed: ${qualityGate.name}`);

              this.emit('quality-gate-failed', {
                pipelineId: pipeline.pipelineId,
                qualityGate: qualityGate.name,
                validation
              });

              reject(new Error(`Quality gate failed: ${qualityGate.name} - ${validation.reason}`));
            } else if (validation.passed) {
              console.log(`✅ Quality gate passed: ${qualityGate.name}`);

              this.emit('quality-gate-passed', {
                pipelineId: pipeline.pipelineId,
                qualityGate: qualityGate.name,
                score: validation.score
              });
            }
          }
        }
      });

      // Listen for workflow completion
      this.coordinationPatterns.on('workflow-completed', (event) => {
        if (event.workflowId === pipeline.coordinationWorkflowId) {
          resolve({
            success: true,
            result: event.result,
            qualityScore: event.qualityScore || 85
          });
        }
      });

      // Listen for workflow failure
      this.coordinationPatterns.on('workflow-failed', (event) => {
        if (event.workflowId === pipeline.coordinationWorkflowId) {
          resolve({
            success: false,
            error: event.error,
            qualityScore: 0
          });
        }
      });

      // Timeout after estimated duration + buffer
      const timeout = (pipeline.executionPlan.estimatedDuration * 60000) * 1.5;
      setTimeout(() => {
        reject(new Error(`Pipeline execution timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Helper: Estimate pipeline duration
   */
  estimatePipelineDuration(workflowConfig, templates) {
    if (templates[0]?.estimatedDuration) {
      return templates[0].estimatedDuration;
    }

    // Calculate based on task count and complexity
    const baseTimePerTask = 15; // minutes
    const complexityMultiplier = {
      'low': 0.7,
      'medium': 1.0,
      'high': 1.5,
      'very-high': 2.0
    };

    const complexity = workflowConfig.complexity || 'medium';
    const taskCount = workflowConfig.tasks.length;

    return Math.ceil(taskCount * baseTimePerTask * (complexityMultiplier[complexity] || 1.0));
  }

  /**
   * Helper: Extract quality gates from templates
   */
  extractQualityGates(templates, workflowConfig) {
    const qualityGates = [];

    for (const template of templates) {
      if (template.qualityGates) {
        for (const gateName of template.qualityGates) {
          qualityGates.push({
            name: gateName,
            templateSource: template.name,
            blocking: this.isBlockingGate(gateName),
            criteria: this.getGateCriteria(gateName, workflowConfig)
          });
        }
      }

      // Stage-specific quality gates
      if (template.stages) {
        for (const stage of template.stages) {
          if (stage.qualityGate) {
            qualityGates.push({
              name: stage.qualityGate,
              stage: stage.stage,
              blocking: stage.qualityGate.includes('blocking'),
              criteria: this.getGateCriteria(stage.qualityGate, workflowConfig)
            });
          }
        }
      }
    }

    return qualityGates;
  }

  /**
   * Helper: Build execution stages
   */
  buildExecutionStages(workflowConfig, templates) {
    const stages = [];

    if (templates[0]?.stages) {
      for (const templateStage of templates[0].stages) {
        stages.push({
          stageName: templateStage.stage,
          tasks: workflowConfig.tasks.filter(t => t.stage === templateStage.stage),
          agents: templateStage.agents,
          dependencies: templateStage.dependencies || [],
          parallelizable: templateStage.parallelizable || false,
          qualityGate: templateStage.qualityGate
        });
      }
    }

    return stages;
  }

  /**
   * Helper: Generate execution summary
   */
  generateExecutionSummary(workflowConfig, coordinationPattern, templates) {
    return `${coordinationPattern.name} execution with ${workflowConfig.tasks.length} tasks using ${templates[0].name} template`;
  }

  /**
   * Helper: Calculate parallel capacity
   */
  calculateParallelCapacity(workflowConfig) {
    const parallelTasks = workflowConfig.tasks.filter(t => !t.dependencies || t.dependencies.length === 0);
    return parallelTasks.length;
  }

  /**
   * Helper: Estimate memory requirements
   */
  estimateMemoryRequirements(workflowConfig) {
    return {
      estimatedNodes: workflowConfig.tasks.length * 3,
      estimatedConnections: workflowConfig.tasks.length * 2,
      storageType: 'crystalline'
    };
  }

  /**
   * Helper: Check if quality gate is blocking
   */
  isBlockingGate(gateName) {
    const blockingGates = [
      'outline_validation_blocking',
      'language_purity_100',
      'critical_quality_threshold',
      'security_validation',
      'legal_compliance'
    ];

    return blockingGates.some(bg => gateName.includes(bg));
  }

  /**
   * Helper: Get quality gate criteria
   */
  getGateCriteria(gateName, workflowConfig) {
    const criteriaMap = {
      'outline_approval': { minimumScore: 85, requiredFields: ['psychographicTargeting', 'keywordStrategy'] },
      'language_purity_100': { languagePurity: 100, allowedContamination: 0 },
      'overall_quality_90': { minimumScore: 90, allDimensionsPass: true },
      'design_approval': { minimumScore: 80, userFlowValidation: true },
      'qa_validation': { testCoverage: 90, criticalBugsAllowed: 0 }
    };

    return criteriaMap[gateName] || { minimumScore: 80 };
  }

  /**
   * Load pipeline from Redis
   */
  async loadPipelineFromRedis(pipelineId) {
    if (!this.redis) return null;

    try {
      const data = await this.redis.get(`orchestrai:pipeline:assembled:${pipelineId}`);
      if (data) {
        const pipeline = JSON.parse(data);
        this.assembledPipelines.set(pipelineId, pipeline);
        return pipeline;
      }
    } catch (error) {
      console.warn('Failed to load pipeline from Redis:', error.message);
    }

    return null;
  }

  /**
   * Update assembly metrics
   */
  updateAssemblyMetrics(pipeline) {
    this.assemblyMetrics.totalAssemblies++;

    // Track template usage
    for (const template of pipeline.templates) {
      const count = this.assemblyMetrics.templateUsage.get(template.name) || 0;
      this.assemblyMetrics.templateUsage.set(template.name, count + 1);
    }

    // Track pattern distribution
    const patternName = pipeline.coordinationPattern.name;
    const patternCount = this.assemblyMetrics.patternDistribution.get(patternName) || 0;
    this.assemblyMetrics.patternDistribution.set(patternName, patternCount + 1);

    // Update average assembly time
    this.assemblyMetrics.averageAssemblyTime =
      (this.assemblyMetrics.averageAssemblyTime * (this.assemblyMetrics.totalAssemblies - 1) +
       pipeline.assemblyDuration) / this.assemblyMetrics.totalAssemblies;
  }

  /**
   * Get pipeline status
   */
  getPipelineStatus(pipelineId) {
    const pipeline = this.assembledPipelines.get(pipelineId) ||
                     this.executingPipelines.get(pipelineId);

    if (!pipeline) {
      return { found: false };
    }

    return {
      found: true,
      pipelineId: pipeline.pipelineId,
      status: pipeline.status,
      metadata: pipeline.metadata,
      progress: this.calculateProgress(pipeline)
    };
  }

  /**
   * Calculate pipeline progress
   */
  calculateProgress(pipeline) {
    if (pipeline.status === 'completed') return 100;
    if (pipeline.status === 'assembled' || pipeline.status === 'pending-approval') return 0;

    // For executing pipelines, estimate progress
    if (pipeline.executionStartTime && pipeline.executionPlan) {
      const elapsed = Date.now() - pipeline.executionStartTime;
      const estimated = pipeline.executionPlan.estimatedDuration * 60000;
      return Math.min(Math.round((elapsed / estimated) * 100), 95);
    }

    return 0;
  }

  /**
   * Get assembly statistics
   */
  getAssemblyStatistics() {
    return {
      ...this.assemblyMetrics,
      activeAssemblies: this.assembledPipelines.size,
      executingPipelines: this.executingPipelines.size,
      successRate: this.assemblyMetrics.totalAssemblies > 0
        ? Math.round((this.assemblyMetrics.successfulExecutions / this.assemblyMetrics.totalAssemblies) * 100)
        : 0,
      templateUsage: Object.fromEntries(this.assemblyMetrics.templateUsage),
      patternDistribution: Object.fromEntries(this.assemblyMetrics.patternDistribution)
    };
  }
}

module.exports = IntelligentPipelineAssembler;
