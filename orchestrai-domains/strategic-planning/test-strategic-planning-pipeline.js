/**
 * TEST: Strategic Planning Pipeline
 *
 * Tests the complete strategic planning workflow with Rapid Cold Plunge project data
 */

const StrategicPlanningPipeline = require('./pipelines/strategic-planning-pipeline');
const path = require('path');
const fs = require('fs').promises;

// Mock coordination patterns for testing
class MockCoordinationPatterns {
  async executeSequential(tasks) {
    console.log(`\n🤖 MOCK AGENT EXECUTION:`);
    console.log(`   Agent: ${tasks[0].agentType}`);
    console.log(`   Timeout: ${tasks[0].timeout}ms`);
    console.log(`   Prompt length: ${tasks[0].prompt.length} chars`);

    // In real execution, this would call Claude Code agents
    // For testing, we simulate success
    return {
      success: true,
      agentType: tasks[0].agentType,
      tokenUsage: 5000,
      result: `Mock result from ${tasks[0].agentType}`
    };
  }
}

// Mock crystalline memory
class MockCrystallineMemory {
  async storeMemory(key, data, options) {
    console.log(`\n💾 MOCK MEMORY STORAGE:`);
    console.log(`   Key: ${key}`);
    console.log(`   Importance: ${options.importance}`);
    console.log(`   Tags: ${options.semantic_tags.join(', ')}`);
    return { success: true };
  }
}

// Mock MCP manager
class MockMCPManager {
  async callMCPTool(service, method, params) {
    console.log(`\n🔌 MOCK MCP CALL:`);
    console.log(`   Service: ${service}`);
    console.log(`   Method: ${method}`);
    console.log(`   Entity: ${params.entities ? params.entities[0].name : 'N/A'}`);
    return { success: true };
  }
}

async function testPipeline() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  STRATEGIC PLANNING PIPELINE - TEST EXECUTION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Initialize pipeline with mocks
  const coordinationPatterns = new MockCoordinationPatterns();
  const crystallineMemory = new MockCrystallineMemory();
  const mcpManager = new MockMCPManager();

  const pipeline = new StrategicPlanningPipeline(
    coordinationPatterns,
    crystallineMemory,
    mcpManager
  );

  // Setup event listeners for monitoring
  pipeline.on('pipeline-started', (data) => {
    console.log(`\n🚀 PIPELINE STARTED`);
    console.log(`   Execution ID: ${data.executionId}`);
    console.log(`   Client: ${data.clientName}`);
  });

  pipeline.on('stage-started', (data) => {
    console.log(`\n▶️  STAGE STARTED: ${data.stage.toUpperCase()}`);
  });

  pipeline.on('stage-completed', (data) => {
    console.log(`\n✅ STAGE COMPLETED: ${data.stage.toUpperCase()}`);
    console.log(`   Duration: ${(data.duration / 1000).toFixed(2)}s`);
    if (data.completeness) {
      console.log(`   Completeness: ${data.completeness}%`);
    }
    if (data.coherenceScore) {
      console.log(`   Coherence Score: ${data.coherenceScore}%`);
    }
  });

  pipeline.on('task-completed', (data) => {
    console.log(`   ✓ Agent task completed: ${data.agentType}`);
  });

  pipeline.on('quality-warning', (data) => {
    console.log(`\n⚠️  QUALITY WARNING: ${data.warning}`);
    if (data.gaps) {
      console.log(`   Gaps: ${data.gaps.join(', ')}`);
    }
  });

  pipeline.on('pipeline-completed', (data) => {
    console.log(`\n✅ PIPELINE COMPLETED`);
    console.log(`   Total Duration: ${(data.duration / 1000).toFixed(2)}s`);
    console.log(`   Token Usage: ${data.metrics.tokenUsage.toLocaleString()}`);
    console.log(`   Agent Executions: ${data.metrics.agentExecutions}`);
    console.log(`   Quality Gates Passed: ${data.metrics.qualityGatesPassed}`);
    console.log(`   Quality Gates Failed: ${data.metrics.qualityGatesFailed}`);
  });

  pipeline.on('pipeline-failed', (data) => {
    console.log(`\n❌ PIPELINE FAILED`);
    console.log(`   Error: ${data.error}`);
  });

  // Project specification
  const projectSpec = {
    projectId: 'rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9',
    projectPath: '/Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9',
    clientName: 'Rapid Cold Plunge'
  };

  // Create deliverables directory
  const strategicPlanningPath = path.join(projectSpec.projectPath, 'deliverables', 'strategic-planning');
  try {
    await fs.mkdir(strategicPlanningPath, { recursive: true });
    console.log(`📁 Created deliverables directory: ${strategicPlanningPath}`);
  } catch (e) {
    console.log(`📁 Deliverables directory already exists`);
  }

  // Execute pipeline
  try {
    const result = await pipeline.execute(projectSpec);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  PIPELINE EXECUTION RESULTS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`Success: ${result.success}`);
    console.log(`Execution ID: ${result.executionId}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Strategic Coherence Score: ${result.strategicCoherenceScore}%`);

    console.log('\n📄 DELIVERABLE PATHS:');
    for (const [key, path] of Object.entries(result.deliverablePaths)) {
      console.log(`   ${key}: ${path}`);
    }

    console.log('\n📊 STAGE RESULTS:');
    for (const [stage, data] of Object.entries(result.results)) {
      console.log(`   ${stage}:`);
      if (data.completeness) {
        console.log(`     - Completeness: ${data.completeness}%`);
      }
      if (data.sources) {
        console.log(`     - Sources: ${data.sources.join(', ')}`);
      }
      if (data.coherenceScore !== undefined) {
        console.log(`     - Coherence: ${data.coherenceScore}%`);
      }
      if (data.gaps) {
        console.log(`     - Gaps: ${data.gaps.length} found`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Verify intelligence aggregation results
    if (result.results.intelligence_aggregation) {
      const intel = result.results.intelligence_aggregation;
      console.log('\n🔍 INTELLIGENCE AGGREGATION VERIFICATION:');
      console.log(`   Sources Found: ${intel.sources.length}/6`);
      console.log(`   Completeness: ${intel.completeness}%`);
      console.log(`   Available Data:`);
      console.log(`     - ICP: ${intel.data.icp ? '✓' : '✗'}`);
      console.log(`     - SEO: ${intel.data.seo ? '✓' : '✗'}`);
      console.log(`     - Competitive: ${intel.data.competitive ? '✓' : '✗'}`);
      console.log(`     - Branding: ${intel.data.branding ? '✓' : '✗'}`);
      console.log(`     - EOS: ${intel.data.eos ? '✓' : '✗'}`);
      console.log(`     - Psychographic: ${intel.data.psychographic ? '✓' : '✗'}`);
    }

    return result;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testPipeline()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
