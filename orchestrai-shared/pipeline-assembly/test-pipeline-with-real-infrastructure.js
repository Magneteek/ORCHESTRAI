/**
 * Pipeline Test with Real ORCHESTRAI Infrastructure
 *
 * Tests MultiLanguageContentPipeline using actual coordination patterns
 * and shows visible multi-stage agent orchestration
 */

const path = require('path');
const Redis = require('ioredis');

// Import actual ORCHESTRAI components
const AsyncCoordinationPatterns = require('../coordination/async-coordination-patterns.js');
const DynamicAgentRegistry = require('../coordination/dynamic-agent-registry.js');

async function testPipelineWithRealInfrastructure() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 ORCHESTRAI Pipeline Test - Full Infrastructure');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Connect to Redis
  console.log('📡 Connecting to Redis (127.0.0.1:6379)...');
  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error('   ❌ Redis connection failed after 3 retries');
        return null;
      }
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('connect', () => {
    console.log('   ✅ Redis connected\n');
  });

  redis.on('error', (err) => {
    console.error('   ❌ Redis error:', err.message);
  });

  try {
    // Wait for Redis connection
    await new Promise(resolve => setTimeout(resolve, 500));

    // Initialize Agent Registry
    console.log('🤖 Initializing Dynamic Agent Registry...');
    const agentRegistry = new DynamicAgentRegistry(redis);
    console.log('   ✅ Agent Registry initialized\n');

    // Initialize Coordination Patterns
    console.log('🔀 Initializing Async Coordination Patterns...');
    const coordinationPatterns = new AsyncCoordinationPatterns(redis, agentRegistry);
    console.log('   ✅ Coordination Patterns initialized\n');

    // Load MultiLanguageContentPipeline
    console.log('📦 Loading MultiLanguageContentPipeline...');
    const MultiLanguageContentPipeline = require('../../orchestrai-domains/content/pipelines/multilanguage-content-pipeline.js');
    console.log('   ✅ Pipeline loaded\n');

    // Create pipeline instance
    const pipeline = new MultiLanguageContentPipeline(
      coordinationPatterns,
      agentRegistry,
      null, // MCP manager (we'll handle without it)
      redis
    );

    // Article specification
    const projectSpec = {
      clientName: 'DeleteReviews.nl',
      projectUuid: 'drnl-A0582FF4-6715-4266-9A54-A7E311912E41',
      language: 'Dutch',
      targetMarket: 'Netherlands',

      // Content details
      contentType: 'crisis-article',
      primaryKeyword: 'plotseling veel slechte reviews',
      title: 'Plotseling Veel Slechte Reviews - Crisis Response',
      wordCount: 2500,

      psychographicSegment: 'Crisis-Driven Business Owners',
      emotionalTone: 'urgent, empathetic',

      contentOutline: {
        sections: [
          { heading: 'Crisis Herkennen', wordCount: 600 },
          { heading: 'Eerste 24 Uur Actie', wordCount: 900 },
          { heading: 'Herstel Strategie', wordCount: 700 },
          { heading: 'Professional Hulp', wordCount: 300 }
        ]
      }
    };

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 EXECUTING PIPELINE\n');
    console.log('   Pipeline: MultiLanguageContentPipeline');
    console.log('   Client: DeleteReviews.nl');
    console.log('   Article: Plotseling Veel Slechte Reviews');
    console.log('   Language: Dutch');
    console.log('   Word Count: 2,500\n');
    console.log('   This will show each stage and subagent in action...\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();

    // Execute pipeline
    const result = await pipeline.execute(projectSpec, {
      autoExecute: true,
      verbose: true
    });

    const duration = Date.now() - startTime;

    // Display results
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ PIPELINE EXECUTION COMPLETE\n');
    console.log(`   Duration: ${(duration/1000).toFixed(2)} seconds`);
    console.log(`   Success: ${result.success ? '✅ YES' : '❌ NO'}`);
    console.log(`   Deliverables Generated: ${result.deliverables?.length || 0}`);

    if (result.deliverables && result.deliverables.length > 0) {
      console.log('\n📦 Deliverables:');
      result.deliverables.forEach((deliverable, i) => {
        console.log(`   ${i + 1}. ${deliverable.type || 'Content'}`);
        console.log(`      Path: ${deliverable.path}`);
        if (deliverable.wordCount) {
          console.log(`      Words: ${deliverable.wordCount}`);
        }
      });
    }

    if (result.stages) {
      console.log('\n📊 Stages Completed:');
      result.stages.forEach((stage, i) => {
        const status = stage.success ? '✅' : '❌';
        console.log(`   ${status} Stage ${i + 1}: ${stage.name}`);
        console.log(`      Duration: ${stage.duration}ms`);
        if (stage.agent) {
          console.log(`      Agent: ${stage.agent}`);
        }
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Cleanup
    await redis.quit();
    console.log('✅ Test completed successfully\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Pipeline Execution Failed\n');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);

    await redis.quit();
    process.exit(1);
  }
}

// Run test
console.log('Starting pipeline test...\n');
testPipelineWithRealInfrastructure();
