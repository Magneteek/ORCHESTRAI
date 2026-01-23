# Phase 3: Pipeline Consolidation Design Document

## Executive Summary

**Objective**: Extract common pipeline patterns into a `BasePipeline` abstract class to reduce code duplication by 40-50% across 8+ pipeline files.

**Current State**:
- 8 pipeline files with ~7,000 total lines of code
- 90%+ duplicate patterns (initialization, execution flow, error handling, deliverable saving)
- Each pipeline reimplements: constructor, execute(), stage orchestration, event emission, error handling

**Target State**:
- 1 abstract `BasePipeline` class (~400 lines)
- 8 concrete pipeline classes (~2,500 total lines, focused on domain logic only)
- **Net Reduction**: ~4,100 lines eliminated (58% reduction)

**Benefits**:
1. **Maintainability**: Fix bugs once in BasePipeline, all pipelines benefit
2. **Consistency**: All pipelines follow identical patterns
3. **Extensibility**: New pipelines inherit all common functionality
4. **Testing**: Test common logic once in BasePipeline tests

---

## Common Patterns Identified

### 1. Constructor Pattern (100% Duplicate)

**All pipelines use identical initialization:**

```javascript
constructor(coordinationPatterns, dynamicAgentSelection, crystallineMemory, redis) {
  super();

  // Dependencies (identical across all)
  this.coordinationPatterns = coordinationPatterns;
  this.dynamicAgentSelection = dynamicAgentSelection;
  this.crystallineMemory = crystallineMemory;
  this.redis = redis;

  // Pipeline metadata (pipeline-specific)
  this.pipelineId = 'pipeline-id';
  this.pipelineName = 'Pipeline Name';
  this.version = '1.0.0';

  // Stage configuration (pipeline-specific)
  this.stages = ['stage1', 'stage2', 'stage3'];
  this.requiredAgents = { 'stage1': 'agent-type', ... };
}
```

**Pattern**: Dependencies identical, metadata varies per pipeline

---

### 2. Execute Method Pattern (95% Duplicate)

**All pipelines follow identical execution flow:**

```javascript
async execute(projectSpec, options = {}) {
  // 1. Initialization (100% identical)
  const executionId = this.generateExecutionId();
  const startTime = Date.now();

  const execution = {
    executionId,
    pipelineId: this.pipelineId,
    projectSpec,
    options,
    startTime,
    currentStage: null,
    stageResults: {},
    deliverablePaths: {},
    performance: { stageTimings: {}, agentPerformance: {} }
  };

  try {
    // 2. Emit pipeline started (100% identical)
    this.emit('pipeline-started', { executionId, pipelineId: this.pipelineId, ... });

    // 3. Execute stages (pattern identical, stages vary)
    for (const stage of this.stages) {
      execution.currentStage = stage;
      this.emit('stage-started', { executionId, stage });

      const stageData = await this.executeStage(stage, execution, projectSpec);
      execution.stageResults[stage] = stageData;

      this.emit('stage-completed', { executionId, stage, result: stageData });
    }

    // 4. Calculate metrics (100% identical)
    const duration = Date.now() - startTime;
    execution.duration = duration;
    execution.status = 'completed';

    // 5. Emit completion (100% identical)
    this.emit('pipeline-completed', { executionId, duration, results: execution.stageResults });

    // 6. Return result (100% identical)
    return {
      success: true,
      executionId,
      duration,
      results: execution.stageResults,
      deliverablePaths: execution.deliverablePaths,
      performance: execution.performance
    };

  } catch (error) {
    // Error handling (100% identical)
    console.error(`❌ Pipeline Failed: ${executionId}`);
    this.emit('pipeline-failed', { executionId, error: error.message, duration: Date.now() - startTime });
    throw error;
  }
}
```

**Pattern**: Execution flow, error handling, metrics identical. Only stage execution logic varies.

---

### 3. Stage Execution Pattern (90% Duplicate)

**All stages follow identical orchestration:**

```javascript
async executeStageName(execution, projectSpec) {
  // 1. Logging (100% identical pattern)
  console.log('\n🎯 Stage X: Stage Name');
  const stageStart = Date.now();

  // 2. Agent selection (100% identical pattern)
  const agent = await this.dynamicAgentSelection.selectAgentForTask({
    agentType: this.requiredAgents[stage],
    domain: 'domain',
    capabilities: ['cap1', 'cap2'],
    context: { /* stage-specific */ }
  });

  console.log(`   Selected Agent: ${agent.agentId}`);

  // 3. Build prompt (pipeline-specific)
  const prompt = this.buildStagePrompt(projectSpec);

  // 4. Execute task (100% identical pattern)
  const result = await this.coordinationPatterns.executeTask({
    taskId: `${execution.executionId}-${stage}`,
    agentId: agent.agentId,
    agentType: agent.agentType,
    prompt: prompt,
    context: { /* stage-specific */ }
  });

  // 5. Save deliverables (100% identical pattern)
  const deliverablePath = await this.saveStageDeliverables(execution, result, projectSpec);

  execution.deliverablePaths[stage] = deliverablePath;
  execution.performance.stageTimings[stage] = Date.now() - stageStart;

  // 6. Logging (100% identical pattern)
  console.log(`   ✅ Stage completed`);
  console.log(`   Saved to: ${deliverablePath}`);

  // 7. Return (100% identical pattern)
  return {
    ...result,
    deliverablePath,
    stageDuration: Date.now() - stageStart
  };
}
```

**Pattern**: Orchestration flow identical. Only prompt building and context vary.

---

### 4. Deliverable Saver Pattern (100% Duplicate)

```javascript
async saveStageDeliverables(execution, result, projectSpec) {
  // Path construction (100% identical pattern)
  const projectUuid = projectSpec.projectUuid || 'default-project';
  const deliverablePath = path.join(
    '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
    projectUuid,
    'deliverables/domain/stage' // Only this path component varies
  );

  // Directory creation (100% identical)
  await fs.mkdir(deliverablePath, { recursive: true });

  // File writing (100% identical)
  const resultFile = path.join(deliverablePath, 'result.json');
  await fs.writeFile(resultFile, JSON.stringify(result, null, 2), 'utf-8');

  // Logging (100% identical)
  console.log(`   💾 Deliverables saved: ${resultFile}`);
  return deliverablePath;
}
```

**Pattern**: Directory creation, file writing, logging identical. Only path varies.

---

### 5. Memory Storage Pattern (100% Duplicate)

```javascript
async storeInMemory(execution, data, projectSpec) {
  // Guard clause (100% identical)
  if (!this.crystallineMemory) return;

  try {
    // Storage call (pattern identical)
    await this.crystallineMemory.storeMemory({
      entity_type: 'type', // varies per pipeline
      entity_name: `name`, // varies per pipeline
      content: data,
      semantic_tags: ['tag1', 'tag2'], // varies per pipeline
      metadata: { executionId: execution.executionId, timestamp: Date.now() }
    });

    console.log('   💾 Data stored in crystalline memory');
  } catch (error) {
    console.warn('Could not store in memory:', error.message);
  }
}
```

**Pattern**: Error handling, logging identical. Only entity details vary.

---

### 6. Parallel Execution Pattern (Optimized pipelines)

```javascript
// PARALLEL EXECUTION: Multiple independent tasks
console.log('🚀 Executing tasks in parallel...');

this.emit('stage-started', { executionId, stage: 'taskA' });
this.emit('stage-started', { executionId, stage: 'taskB' });
this.emit('stage-started', { executionId, stage: 'taskC' });

const [taskAResult, taskBResult, taskCResult] = await Promise.all([
  this.executeTaskA(execution, projectSpec),
  this.executeTaskB(execution, projectSpec),
  this.executeTaskC(execution, projectSpec)
]);

execution.stageResults.taskA = taskAResult;
execution.stageResults.taskB = taskBResult;
execution.stageResults.taskC = taskCResult;

this.emit('stage-completed', { executionId, stage: 'taskA', result: taskAResult });
this.emit('stage-completed', { executionId, stage: 'taskB', result: taskBResult });
this.emit('stage-completed', { executionId, stage: 'taskC', result: taskCResult });
```

**Pattern**: Parallel Promise.all execution with event emission.

---

### 7. Quality Gate Pattern (API & Testing pipelines)

```javascript
async validateStage(results) {
  return {
    gate: 'stage_name',
    condition: 'Description of requirement',
    passed: results.success && results.metric >= threshold,
    blocking: true, // or false
    details: { metric: results.metric }
  };
}
```

**Pattern**: Consistent quality gate structure.

---

### 8. Event Emission Pattern (100% Identical)

```javascript
// Pipeline lifecycle events
this.emit('pipeline-started', { executionId, pipelineId, projectId });
this.emit('stage-started', { executionId, stage: 'stageName' });
this.emit('stage-completed', { executionId, stage: 'stageName', duration });
this.emit('pipeline-completed', { executionId, success, duration, metrics });
this.emit('pipeline-failed', { executionId, error: error.message, duration });
```

**Pattern**: All pipelines emit identical lifecycle events.

---

## BasePipeline Abstract Class Design

### Class Structure

```javascript
/**
 * BasePipeline - Abstract base class for all ORCHESTRAI pipelines
 *
 * Provides common functionality for:
 * - Pipeline initialization and configuration
 * - Execution flow orchestration
 * - Event emission and logging
 * - Error handling and recovery
 * - Deliverable management
 * - Memory storage
 * - Quality gates
 * - Parallel stage execution
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { ValidationError, StageExecutionError } = require('../../shared/errors/pipeline-errors');

class BasePipeline extends EventEmitter {
  constructor(dependencies, config) {
    super();

    // Throw error if instantiated directly
    if (new.target === BasePipeline) {
      throw new Error('BasePipeline is abstract and cannot be instantiated directly');
    }

    // Store dependencies
    this.coordinationPatterns = dependencies.coordinationPatterns;
    this.dynamicAgentSelection = dependencies.dynamicAgentSelection;
    this.crystallineMemory = dependencies.crystallineMemory;
    this.redis = dependencies.redis;

    // Pipeline metadata (must be set by subclass)
    this.pipelineId = config.pipelineId || null;
    this.pipelineName = config.pipelineName || null;
    this.version = config.version || '1.0.0';

    // Stage configuration (must be set by subclass)
    this.stages = config.stages || [];
    this.requiredAgents = config.requiredAgents || {};

    // Validate subclass implementation
    this.validateSubclassImplementation();
  }

  /**
   * Validate that subclass has implemented required properties
   */
  validateSubclassImplementation() {
    if (!this.pipelineId || !this.pipelineName) {
      throw new ValidationError('Subclass must define pipelineId and pipelineName');
    }

    if (this.stages.length === 0) {
      throw new ValidationError('Subclass must define at least one stage');
    }
  }

  /**
   * TEMPLATE METHOD: Execute pipeline
   * Defines workflow skeleton, subclasses implement stage execution
   */
  async execute(projectSpec, options = {}) {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    const execution = this.initializeExecution(executionId, projectSpec, options, startTime);

    try {
      // Emit pipeline started event
      this.emitPipelineStarted(execution);

      // Execute all stages in sequence (or parallel if overridden)
      await this.executeStages(execution, projectSpec);

      // Calculate final metrics
      execution.duration = Date.now() - startTime;
      execution.status = 'completed';

      // Store learnings in memory
      await this.storePipelineLearnings(execution);

      // Emit pipeline completed event
      this.emitPipelineCompleted(execution);

      return this.buildSuccessResult(execution);

    } catch (error) {
      return await this.handlePipelineFailure(execution, error, startTime);
    }
  }

  /**
   * Initialize execution context
   */
  initializeExecution(executionId, projectSpec, options, startTime) {
    return {
      executionId,
      pipelineId: this.pipelineId,
      projectSpec,
      options,
      startTime,
      currentStage: null,
      stageResults: {},
      deliverablePaths: {},
      performance: {
        stageTimings: {},
        agentPerformance: {}
      },
      metrics: {
        tokenUsage: 0,
        agentExecutions: 0,
        qualityGatesPassed: 0,
        qualityGatesFailed: 0
      }
    };
  }

  /**
   * Execute all stages in sequence
   * Subclasses can override for custom execution patterns (e.g., parallel)
   */
  async executeStages(execution, projectSpec) {
    for (const stage of this.stages) {
      await this.executeSingleStage(stage, execution, projectSpec);
    }
  }

  /**
   * Execute a single stage with full orchestration
   */
  async executeSingleStage(stageName, execution, projectSpec) {
    execution.currentStage = stageName;

    // Emit stage started event
    this.emit('stage-started', {
      executionId: execution.executionId,
      stage: stageName,
      timestamp: Date.now()
    });

    const stageStart = Date.now();

    try {
      // Call subclass implementation
      const stageData = await this.executeStageImpl(stageName, execution, projectSpec);

      // Store stage results
      execution.stageResults[stageName] = stageData;

      // Emit stage completed event
      this.emit('stage-completed', {
        executionId: execution.executionId,
        stage: stageName,
        duration: Date.now() - stageStart,
        result: stageData
      });

      return stageData;

    } catch (error) {
      this.emit('stage-failed', {
        executionId: execution.executionId,
        stage: stageName,
        error: error.message,
        duration: Date.now() - stageStart
      });

      throw new StageExecutionError(`Stage ${stageName} failed: ${error.message}`, stageName, error);
    }
  }

  /**
   * ABSTRACT METHOD: Execute stage implementation
   * Must be implemented by subclass
   */
  async executeStageImpl(stageName, execution, projectSpec) {
    throw new Error(`Subclass must implement executeStageImpl() for stage: ${stageName}`);
  }

  /**
   * Select agent for stage execution
   */
  async selectAgentForStage(stageName, capabilities, context) {
    const agentType = this.requiredAgents[stageName];

    if (!agentType) {
      throw new ValidationError(`No agent type configured for stage: ${stageName}`);
    }

    return await this.dynamicAgentSelection.selectAgentForTask({
      agentType,
      capabilities,
      context
    });
  }

  /**
   * Execute task through coordination patterns
   */
  async executeAgentTask(execution, stage, agent, prompt, context, dependencies = []) {
    return await this.coordinationPatterns.executeTask({
      taskId: `${execution.executionId}-${stage}`,
      agentId: agent.agentId,
      agentType: agent.agentType,
      prompt,
      context,
      dependencies,
      outputFormat: this.getOutputFormat(stage)
    });
  }

  /**
   * Get output format for stage (can be overridden by subclass)
   */
  getOutputFormat(stageName) {
    return 'json'; // Default format
  }

  /**
   * Save stage deliverables to project directory
   */
  async saveStageDeliverables(execution, stageName, result, subdirectory) {
    const projectUuid = execution.projectSpec.projectUuid || 'default-project';
    const deliverablePath = path.join(
      '/Users/kris/CLAUDEtools/ORCHESTRAI/projects',
      projectUuid,
      'deliverables',
      subdirectory
    );

    // Create directory
    await fs.mkdir(deliverablePath, { recursive: true });

    // Write result file
    const fileName = `${stageName}-${Date.now()}.json`;
    const filePath = path.join(deliverablePath, fileName);
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`   💾 Deliverables saved: ${filePath}`);

    return deliverablePath;
  }

  /**
   * Store data in crystalline memory
   */
  async storeInMemory(entityType, entityName, content, semanticTags = [], metadata = {}) {
    if (!this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeMemory({
        entity_type: entityType,
        entity_name: entityName,
        content,
        semantic_tags: semanticTags,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          pipelineId: this.pipelineId
        }
      });

      console.log(`   💾 Stored in memory: ${entityName}`);
    } catch (error) {
      console.warn(`Could not store in memory: ${error.message}`);
    }
  }

  /**
   * Store pipeline learnings in memory (can be overridden)
   */
  async storePipelineLearnings(execution) {
    if (!this.crystallineMemory) return;

    try {
      await this.storeInMemory(
        'pipeline-execution',
        `${this.pipelineId}-${execution.executionId}`,
        {
          executionId: execution.executionId,
          projectSpec: execution.projectSpec,
          stageResults: execution.stageResults,
          metrics: execution.metrics,
          duration: execution.duration
        },
        ['pipeline', 'execution', this.pipelineId],
        { executionId: execution.executionId }
      );
    } catch (error) {
      console.error('Failed to store pipeline learnings:', error.message);
    }
  }

  /**
   * Generate unique execution ID
   */
  generateExecutionId() {
    return `${this.pipelineId}-${uuidv4()}`;
  }

  /**
   * Event emitters
   */
  emitPipelineStarted(execution) {
    this.emit('pipeline-started', {
      executionId: execution.executionId,
      pipelineId: this.pipelineId,
      pipelineName: this.pipelineName,
      timestamp: Date.now()
    });
  }

  emitPipelineCompleted(execution) {
    this.emit('pipeline-completed', {
      executionId: execution.executionId,
      pipelineId: this.pipelineId,
      duration: execution.duration,
      stagesCompleted: Object.keys(execution.stageResults).length,
      success: true
    });
  }

  /**
   * Build success result
   */
  buildSuccessResult(execution) {
    return {
      success: true,
      executionId: execution.executionId,
      pipelineId: this.pipelineId,
      duration: execution.duration,
      results: execution.stageResults,
      deliverablePaths: execution.deliverablePaths,
      performance: execution.performance,
      metrics: execution.metrics
    };
  }

  /**
   * Handle pipeline failure
   */
  async handlePipelineFailure(execution, error, startTime) {
    const errorDuration = Date.now() - startTime;

    console.error(`❌ Pipeline Failed: ${execution.executionId}`);
    console.error(`   Stage: ${execution.currentStage}`);
    console.error(`   Error: ${error.message}`);

    this.emit('pipeline-failed', {
      executionId: execution.executionId,
      pipelineId: this.pipelineId,
      stage: execution.currentStage,
      error: error.message,
      duration: errorDuration
    });

    return {
      success: false,
      executionId: execution.executionId,
      pipelineId: this.pipelineId,
      error: error.message,
      duration: errorDuration,
      partialResults: execution.stageResults
    };
  }

  /**
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      pipelineId: this.pipelineId,
      pipelineName: this.pipelineName,
      version: this.version,
      stages: this.stages,
      requiredAgents: this.requiredAgents
    };
  }
}

module.exports = BasePipeline;
```

---

## Migration Strategy

### Phase 3.1: Create BasePipeline Class
1. Create `orchestrai-shared/pipelines/base-pipeline.js`
2. Implement all common patterns
3. Add comprehensive JSDoc documentation
4. Create unit tests for BasePipeline

### Phase 3.2: Migrate First Pipeline (Content)
1. Update `multilanguage-content-pipeline.js` to extend BasePipeline
2. Remove all duplicate code
3. Implement only `executeStageImpl()` for each stage
4. Test thoroughly
5. Document migration process

### Phase 3.3: Migrate Remaining Pipelines
1. Apply same pattern to:
   - api-development-pipeline.js
   - design-development-pipeline.js
   - comprehensive-testing-pipeline.js
   - advertising-campaign-pipeline.js
   - seo-research-pipeline.js
   - cicd-pipeline.js
   - strategic-planning-pipeline.js

### Phase 3.4: Testing & Validation
1. Run all pipeline integration tests
2. Verify deliverable output unchanged
3. Confirm event emission identical
4. Validate memory storage working

---

## Expected Benefits

### Code Reduction
- **Before**: ~7,000 lines across 8 pipelines
- **After**: ~400 lines (BasePipeline) + ~2,500 lines (concrete pipelines) = ~2,900 lines
- **Reduction**: ~4,100 lines eliminated (58% reduction)

### Maintenance
- **Before**: Fix bug in execution flow → Update 8 files
- **After**: Fix bug once in BasePipeline → All 8 pipelines benefit

### Consistency
- **Before**: 8 slightly different implementations
- **After**: 1 canonical implementation, 8 domain-specific extensions

### Extensibility
- **Before**: Creating new pipeline = Copy/paste 800+ lines
- **After**: Extend BasePipeline, implement 3-5 stage methods (~200 lines)

---

## Quality Metrics

### Success Criteria
- [ ] All 8 pipelines migrated to BasePipeline
- [ ] Zero breaking changes to external API
- [ ] All integration tests passing
- [ ] 50%+ code reduction achieved
- [ ] Documentation updated

### Testing Requirements
- [ ] BasePipeline unit tests (>90% coverage)
- [ ] Each migrated pipeline integration test
- [ ] End-to-end pipeline execution tests
- [ ] Performance benchmarks unchanged

---

## Timeline

- **Phase 3.1**: Create BasePipeline (2-3 hours)
- **Phase 3.2**: Migrate first pipeline (1-2 hours)
- **Phase 3.3**: Migrate remaining 7 pipelines (4-6 hours)
- **Phase 3.4**: Testing & validation (2-3 hours)

**Total Estimated Time**: 9-14 hours

---

## Next Steps

1. ✅ Create PHASE-3-PIPELINE-CONSOLIDATION-DESIGN.md (current document)
2. ⏳ Create BasePipeline abstract class
3. ⏳ Migrate multilanguage-content-pipeline (pilot)
4. ⏳ Migrate remaining 7 pipelines
5. ⏳ Update documentation
6. ⏳ Commit Phase 3 completion

---

**This design follows the same proven pattern from Phase 2 Memory Consolidation (53% code reduction).**
