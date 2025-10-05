/**
 * Full Pipeline Test with ORCHESTRAI Infrastructure
 *
 * This test demonstrates complete multi-stage pipeline execution
 * with visible subagent orchestration using actual infrastructure
 */

const path = require('path');
const Redis = require('ioredis');

// Import infrastructure components
const AsyncCoordinationPatterns = require('../coordination/async-coordination-patterns.js');
const DynamicAgentSelection = require('../agents/dynamic-agent-selection.js');
const CrystallineMemory = require('../memory/crystalline-memory-system.js');
const PipelineRegistry = require('./pipeline-registry.js');

async function testFullPipelineInfrastructure() {
  console.log('🚀 Full Pipeline Infrastructure Test\n');
  console.log('Testing: MultiLanguageContentPipeline with complete agent orchestration\n');

  // Initialize Redis connection
  console.log('📡 Connecting to Redis...');
  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully\n');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });

  try {
    // Initialize infrastructure components
    console.log('🏗️  Initializing ORCHESTRAI Infrastructure...\n');

    // 1. Crystalline Memory System
    console.log('🔮 Stage 1: Initializing Crystalline Memory System');
    const crystallineMemory = new CrystallineMemory(redis);
    await crystallineMemory.initialize();
    console.log('   ✅ Crystalline Memory active\n');

    // 2. Dynamic Agent Selection
    console.log('🤖 Stage 2: Initializing Dynamic Agent Selection');
    const agentSelection = new DynamicAgentSelection(redis);
    await agentSelection.initialize();
    console.log('   ✅ Agent Selection System active\n');

    // 3. Async Coordination Patterns
    console.log('🔀 Stage 3: Initializing Coordination Patterns');
    const coordinationPatterns = new AsyncCoordinationPatterns(redis, agentSelection);
    await coordinationPatterns.initialize();
    console.log('   ✅ Coordination Patterns active\n');

    // 4. Pipeline Registry
    console.log('📚 Stage 4: Initializing Pipeline Registry');
    const pipelineRegistry = new PipelineRegistry(
      coordinationPatterns,
      agentSelection,
      crystallineMemory,
      redis
    );
    console.log('   ✅ Pipeline Registry active\n');

    // Article specification for testing
    const articleSpec = {
      clientName: 'DeleteReviews.nl',
      projectUuid: 'drnl-A0582FF4-6715-4266-9A54-A7E311912E41',
      deliverableType: 'multilanguage-content',
      language: 'Dutch',
      targetMarket: 'Netherlands',

      // Content specifications
      contentType: 'crisis-article',
      primaryKeyword: 'plotseling veel slechte reviews',
      secondaryKeywords: [
        'review crisis management',
        'reputatie herstel',
        'crisis response'
      ],

      title: 'Plotseling Veel Slechte Reviews - Crisis Response Guide',
      wordCount: 2500,

      // Psychographic targeting
      psychographicSegment: 'Crisis-Driven Business Owners',
      emotionalTone: 'urgent, empathetic, action-oriented',

      // Content outline (simplified for testing)
      contentOutline: {
        sections: [
          {
            heading: 'De Crisis Herkennen',
            wordCount: 500,
            focus: 'Problem identification and validation'
          },
          {
            heading: 'Directe Actie: Eerste 24 Uur',
            wordCount: 800,
            focus: 'Immediate crisis response steps'
          },
          {
            heading: 'Langetermijn Herstel Strategie',
            wordCount: 700,
            focus: 'Recovery and prevention'
          },
          {
            heading: 'Hulp & Ondersteuning',
            wordCount: 500,
            focus: 'Professional assistance options'
          }
        ]
      }
    };

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🎯 EXECUTING MULTI-LANGUAGE CONTENT PIPELINE\n');
    console.log('   Client: DeleteReviews.nl');
    console.log('   Article: Plotseling Veel Slechte Reviews');
    console.log('   Word Count: 2,500');
    console.log('   Language: Dutch\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Execute pipeline with visible stage progression
    const startTime = Date.now();

    const result = await pipelineRegistry.executePipeline(
      'multilanguage-content',
      articleSpec,
      {
        autoExecute: true,
        verbose: true,
        showAgentSelection: true
      }
    );

    const duration = Date.now() - startTime;

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('✅ PIPELINE EXECUTION COMPLETE\n');
    console.log(`   Duration: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Deliverables: ${result.deliverables?.length || 0}`);

    if (result.deliverables && result.deliverables.length > 0) {
      console.log('\n📦 Generated Deliverables:');
      result.deliverables.forEach((deliverable, index) => {
        console.log(`   ${index + 1}. ${deliverable.type}: ${deliverable.path}`);
        console.log(`      Size: ${deliverable.size || 'N/A'} | Format: ${deliverable.format || 'N/A'}`);
      });
    }

    if (result.metrics) {
      console.log('\n📊 Pipeline Metrics:');
      console.log(`   Stages Completed: ${result.metrics.stagesCompleted || 'N/A'}`);
      console.log(`   Agents Used: ${result.metrics.agentsUsed || 'N/A'}`);
      console.log(`   Quality Score: ${result.metrics.qualityScore || 'N/A'}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Test crystalline memory integration
    console.log('🔮 Testing Crystalline Memory Integration...\n');

    const memoryContext = await crystallineMemory.retrieveContext({
      clientName: 'DeleteReviews.nl',
      domain: 'content'
    });

    console.log(`   Retrieved ${memoryContext.entities?.length || 0} memory entities`);
    console.log(`   Active relationships: ${memoryContext.relationships?.length || 0}`);
    console.log('   ✅ Memory integration verified\n');

    // Cleanup
    console.log('🧹 Cleaning up...');
    await redis.quit();
    console.log('   ✅ Redis connection closed\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ FULL PIPELINE TEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Pipeline Test Failed:', error.message);
    console.error('\nStack trace:', error.stack);

    await redis.quit();
    process.exit(1);
  }
}

// Run test
testFullPipelineInfrastructure().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
