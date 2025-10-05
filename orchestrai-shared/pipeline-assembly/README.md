# ORCHESTRAI Intelligent Pipeline Assembly System

## Overview

The Intelligent Pipeline Assembly System automatically transforms project specifications (natural language or structured data) into fully-orchestrated, self-executing pipelines with quality gates, agent coordination, and crystalline memory integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Project Specification                       │
│  (Natural Language, Structured Data, or Hybrid Format)      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│          ProjectSpecificationAnalyzer                        │
│  • Deliverable Type Identification                          │
│  • Required Capabilities Extraction                         │
│  • Complexity Assessment                                     │
│  • Market & Language Detection                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           PipelineTemplateLibrary                            │
│  • 8 Production-Ready Templates                             │
│  • Template Selection & Customization                       │
│  • Supporting Template Integration                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│          WorkflowConfigGenerator                             │
│  • Task Generation from Templates                           │
│  • Dependency Graph Construction                            │
│  • Context Enrichment from Memory                           │
│  • Quality Threshold Configuration                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│        DynamicAgentSelection                                 │
│  • Optimal Agent Selection                                  │
│  • Capability-Based Matching                                │
│  • Performance-Based Optimization                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│      AsyncCoordinationPatterns                               │
│  • Pattern Selection (Sequential, Parallel, Pipeline, etc)  │
│  • Execution Plan Creation                                  │
│  • Coordinated Execution                                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           QualityGateValidator                               │
│  • Real-time Quality Validation                             │
│  • Blocking Gate Enforcement                                │
│  • Automatic Retry on Failure                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            Completed Deliverables                            │
│  • Stored in Project Structure                              │
│  • Integrated with Crystalline Memory                       │
│  • Quality-Assured & Validated                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 🎯 Automatic Pipeline Assembly
- **Single-Command Execution**: Transform project spec → complete deliverable with one command
- **8 Production Templates**: SEO Research, Content Creation, Advertising, Web Dev, Reputation, more
- **Intelligent Adaptation**: Templates customize based on project specifics

### 🧠 Smart Analysis
- **Natural Language Processing**: Understands project descriptions in plain English
- **Deliverable Type Classification**: Automatically identifies what needs to be built
- **Complexity Assessment**: Estimates effort and resource requirements
- **Market & Language Detection**: Identifies target market and language automatically

### 🤖 Dynamic Agent Coordination
- **Performance-Based Selection**: Chooses optimal agents based on historical success
- **5 Coordination Patterns**: Sequential, Parallel, Pipeline, Mesh, Event-Driven
- **Automatic Pattern Selection**: Chooses best pattern for each workflow type

### ✅ Quality Enforcement
- **12 Quality Gate Types**: From language purity to SEO compliance
- **Blocking Gates**: Critical quality thresholds halt execution until met
- **Automatic Validation**: Real-time quality checking during execution

### 🔗 Crystalline Memory Integration
- **Context Enrichment**: Pulls existing research, psychographic data automatically
- **Cross-Project Learning**: Learns from historical performance
- **Knowledge Graph Updates**: Automatically stores results for future use

## Available Pipeline Templates

### 1. SEO Research Pipeline
**ID**: `seo-research`
**Duration**: ~120 minutes
**Stages**: 6 (Keyword Discovery → Memory Integration)

```javascript
await assembler.assemblePipelineFromProject({
  deliverableType: 'seo-research',
  clientName: 'DentalPro',
  targetMarket: 'Netherlands',
  language: 'Dutch'
});
```

### 2. Content Creation Multi-Language Pipeline
**ID**: `content-creation-multi-language`
**Duration**: ~180 minutes
**Quality Gates**: Language Purity 100%, Content Architecture Compliance

```javascript
await assembler.assemblePipelineFromProject({
  deliverableType: 'content-creation-multi-language',
  clientName: 'TechCorp',
  targetMarket: 'Slovenia',
  language: 'Slovenian',
  quality: 'high'
});
```

### 3. Advertising Campaign Pipeline
**ID**: `advertising-campaign`
**Duration**: ~90 minutes
**Specialization**: Hormozi Offer Creation, Platform-Specific Optimization

```javascript
await assembler.assemblePipelineFromProject({
  deliverableType: 'advertising-campaign',
  clientName: 'SaaS Startup',
  targetMarket: 'United States',
  platforms: ['Meta', 'LinkedIn', 'Google Ads']
});
```

### 4. Web Development Pipeline
**ID**: `web-development`
**Duration**: ~240 minutes
**Stages**: Wireframe → Design System → Development → QA → Deployment

```javascript
await assembler.assemblePipelineFromProject({
  deliverableType: 'web-development',
  projectType: 'landing page',
  framework: 'Next.js',
  clientName: 'ProductLaunch'
});
```

### 5. Reputation Intelligence Pipeline
**ID**: `reputation-intelligence`
**Duration**: ~60 minutes
**Coordination**: Event-Driven (Reactive to Reviews)

```javascript
await assembler.assemblePipelineFromProject({
  deliverableType: 'reputation-intelligence',
  clientName: 'RestaurantChain',
  targetMarket: 'Netherlands',
  daysBack: 30
});
```

### 6. Competitive Analysis Pipeline
**ID**: `competitive-analysis`
**Duration**: ~90 minutes

### 7. Psychographic Research Pipeline
**ID**: `psychographic-research`
**Duration**: ~105 minutes

### 8. Content Creation Pipeline (English)
**ID**: `content-creation`
**Duration**: ~75 minutes

## Installation & Setup

### Prerequisites
```bash
# Required systems
- AsyncCoordinationPatterns (orchestrai-shared/coordination/)
- DynamicAgentSelection (orchestrai-shared/orchestration/)
- CrystallineMemory (orchestrai-master/crystalline-memory/)
- Redis (optional, for distributed coordination)
```

### Integration

```javascript
// 1. Import the assembler
const { IntelligentPipelineAssembler } = require('./orchestrai-shared/pipeline-assembly');

// 2. Initialize required systems
const AsyncCoordinationPatterns = require('./orchestrai-shared/coordination/async-coordination-patterns');
const DynamicAgentSelection = require('./orchestrai-shared/orchestration/dynamic-agent-selection');
const CrystallineMemoryManager = require('./orchestrai-master/crystalline-memory/memory-manager');

// 3. Create instances
const coordinationPatterns = new AsyncCoordinationPatterns(
  crystallineMemory,
  contextPreservation,
  taskBatcher,
  redis
);

const dynamicAgentSelection = new DynamicAgentSelection(
  learningFoundation,
  performanceSchema,
  domainAgentManager
);

const crystallineMemory = new CrystallineMemoryManager(redis);

// 4. Initialize assembler
const assembler = new IntelligentPipelineAssembler(
  coordinationPatterns,
  dynamicAgentSelection,
  crystallineMemory,
  redis
);
```

## Usage Examples

### Example 1: Natural Language Specification

```javascript
// Simple natural language description
const result = await assembler.assemblePipelineFromProject({
  description: "Create comprehensive SEO research for Dutch dental 3D printing market focusing on keywords, competitor analysis, and content strategy",
  clientName: "QuartzIQ"
});

// System automatically:
// 1. Identifies deliverable type: seo-research
// 2. Detects language: Dutch
// 3. Detects market: Netherlands
// 4. Selects SEO Research Pipeline template
// 5. Generates 8-10 tasks with dependencies
// 6. Assigns optimal agents
// 7. Creates execution plan
// 8. Executes with quality gates
```

### Example 2: Structured Specification

```javascript
const result = await assembler.assemblePipelineFromProject({
  deliverableType: 'content-creation-multi-language',
  clientName: 'TechCorp',
  projectUuid: 'techcorp-2024-01',

  targetMarket: 'Slovenia',
  language: 'Slovenian',

  requiredCapabilities: [
    'psychographic-targeting',
    'language-isolation',
    'seo-optimization',
    'quality-validation'
  ],

  successCriteria: {
    minimumQuality: 95,
    languagePurity: 100,
    deliveryTimeline: '48 hours'
  },

  qualityLevel: 'high',

  customVariables: {
    targetKeyword: 'dental implants slovenia',
    wordCount: 2500
  }
});
```

### Example 3: Auto-Execution with Options

```javascript
const result = await assembler.assemblePipelineFromProject(
  {
    description: "Build advertising campaign for B2B SaaS product targeting enterprise clients",
    clientName: "SaaS Product"
  },
  {
    autoExecute: true,      // Execute immediately
    autoRetry: true,        // Retry failed tasks
    maxRetries: 3,          // Maximum retry attempts
    failFast: false         // Continue on non-critical errors
  }
);

console.log(result.pipelineId);
console.log(result.success);
console.log(result.duration);
```

### Example 4: Manual Execution Control

```javascript
// Assemble pipeline without auto-execution
const pipeline = await assembler.assemblePipelineFromProject({
  deliverableType: 'web-development',
  projectType: 'e-commerce site',
  clientName: 'OnlineStore'
}, {
  autoExecute: false
});

console.log('Pipeline assembled:', pipeline.pipelineId);
console.log('Estimated duration:', pipeline.metadata.estimatedDuration, 'minutes');
console.log('Tasks:', pipeline.metadata.taskCount);

// Review and approve
console.log('Quality gates:', pipeline.executionPlan.qualityGates);

// Execute when ready
const result = await pipeline.execute();
```

### Example 5: Monitoring Pipeline Execution

```javascript
const assembler = new IntelligentPipelineAssembler(/* ... */);

// Listen to assembly events
assembler.on('analysis-complete', (data) => {
  console.log('Analysis complete:', data.analysis);
});

assembler.on('templates-selected', (data) => {
  console.log('Templates selected:', data.templates);
});

assembler.on('pipeline-assembled', (data) => {
  console.log('Pipeline assembled:', data.pipelineId);
});

assembler.on('quality-gate-passed', (data) => {
  console.log('✅ Quality gate passed:', data.qualityGate);
});

assembler.on('quality-gate-failed', (data) => {
  console.error('❌ Quality gate failed:', data.qualityGate, data.validation);
});

assembler.on('pipeline-completed', (data) => {
  console.log('✅ Pipeline completed:', data.pipelineId);
  console.log('   Duration:', data.duration, 'ms');
  console.log('   Quality Score:', data.qualityScore);
});

// Assemble and execute
const result = await assembler.assemblePipelineFromProject({
  description: "SEO research for Dutch market",
  clientName: "Client"
});
```

## Quality Gates

### Blocking Gates (Halt Execution on Failure)
- **outline_validation_blocking**: Outline must meet quality standards before content writing
- **language_purity_100**: Zero English contamination in non-English content
- **qa_validation**: All tests must pass before deployment
- **security_validation**: Security checks must pass

### Warning Gates (Log Warnings, Continue Execution)
- **overall_quality_90**: Content quality score below 90%
- **content_architecture_compliance**: Paragraph distribution off target
- **keyword_validation**: Insufficient high-volume keywords
- **strategy_coherence**: Strategy lacks logical flow

## API Reference

### IntelligentPipelineAssembler

#### `assemblePipelineFromProject(projectSpec, options)`

Assemble and optionally execute pipeline from project specification.

**Parameters:**
- `projectSpec` (Object|String): Project specification
  - If String: Natural language description
  - If Object: Structured specification with fields:
    - `description` (String): Project description
    - `deliverableType` (String): Explicit deliverable type
    - `clientName` (String): Client name
    - `projectUuid` (String): Existing project UUID
    - `targetMarket` (String): Target market/geography
    - `language` (String): Content language
    - `requiredCapabilities` (Array): Required capabilities
    - `successCriteria` (Object): Success criteria
    - `qualityLevel` (String): 'low', 'medium', 'high'
    - `timeline` (String): Delivery timeline
    - `customVariables` (Object): Template variable overrides

- `options` (Object): Execution options
  - `autoExecute` (Boolean): Execute immediately (default: true)
  - `approved` (Boolean): Pre-approved for execution
  - `autoRetry` (Boolean): Retry failed tasks (default: true)
  - `maxRetries` (Number): Maximum retry attempts (default: 2)
  - `failFast` (Boolean): Stop on first error (default: false)

**Returns:** Promise<Object>
```javascript
{
  pipelineId: String,
  status: 'assembled' | 'executing' | 'completed' | 'failed',
  metadata: {
    templateNames: Array,
    patternName: String,
    estimatedDuration: Number,
    taskCount: Number,
    agentCount: Number
  },
  executionPlan: Object,
  execute: Function // Manual execution function
}
```

#### `executePipeline(pipelineId, options)`

Execute a previously assembled pipeline.

**Parameters:**
- `pipelineId` (String): Pipeline ID from assembly
- `options` (Object): Execution options

**Returns:** Promise<Object>
```javascript
{
  pipelineId: String,
  success: Boolean,
  duration: Number,
  result: Object,
  pipeline: Object
}
```

#### `getPipelineStatus(pipelineId)`

Get current status of a pipeline.

**Returns:** Object
```javascript
{
  found: Boolean,
  pipelineId: String,
  status: String,
  metadata: Object,
  progress: Number // 0-100
}
```

#### `getAssemblyStatistics()`

Get assembly and execution statistics.

**Returns:** Object
```javascript
{
  totalAssemblies: Number,
  successfulExecutions: Number,
  averageAssemblyTime: Number,
  activeAssemblies: Number,
  executingPipelines: Number,
  successRate: Number,
  templateUsage: Object,
  patternDistribution: Object
}
```

## Performance Metrics

### Assembly Performance
- **Average Assembly Time**: 2-5 seconds
- **Template Selection**: < 1 second
- **Workflow Generation**: 1-3 seconds
- **Agent Selection**: 1-2 seconds

### Execution Performance
- **SEO Research Pipeline**: 90-120 minutes
- **Content Creation (Multi-Language)**: 150-180 minutes
- **Advertising Campaign**: 60-90 minutes
- **Web Development**: 180-240 minutes
- **Reputation Intelligence**: 45-60 minutes

### Quality Metrics
- **Quality Gate Pass Rate**: 95%+
- **Language Purity Compliance**: 100% (when enforced)
- **Content Architecture Compliance**: 90%+
- **Overall Success Rate**: 92%+

## Troubleshooting

### Issue: Pipeline assembly fails with "No suitable templates"
**Solution**: Check deliverable type identification. Use explicit `deliverableType` in spec.

### Issue: Language purity validation fails
**Solution**: Review content for English contamination. Check `replacementMappings` in workflow config.

### Issue: Quality gate blocks execution
**Solution**: Review quality gate criteria. Adjust success criteria or fix content quality issues.

### Issue: Agent selection fails
**Solution**: Ensure required agents are registered. Check domain agent manager configuration.

## Contributing

To add new pipeline templates:

1. Create template in `PipelineTemplateLibrary.initializeTemplates()`
2. Define stages, tasks, agents, dependencies
3. Specify quality gates and coordination pattern
4. Add template to templates Map
5. Test with sample project specification

## License

Internal ORCHESTRAI system - proprietary

## Support

For issues or questions:
- Review this README
- Check CLAUDE.md for architecture details
- Review pipeline execution logs
- Contact system maintainer
