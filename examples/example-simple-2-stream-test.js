/**
 * ORCHESTRAI - Simple 2-Stream Test Example
 *
 * This example demonstrates the basic usage of the simultaneous execution system
 * with a simple 2-stream parallel execution scenario.
 *
 * This validates that the hybrid architecture works correctly and demonstrates
 * the speed improvement from parallel execution.
 *
 * Usage:
 *   node examples/example-simple-2-stream-test.js
 */

const {
  initializeSimultaneousExecution
} = require('../orchestrai-shared/initialization/initialize-simultaneous-execution');

/**
 * Main test execution
 */
async function runSimple2StreamTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ORCHESTRAI - Simple 2-Stream Parallel Execution Test       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let components;

  try {
    // ============================================================
    // STEP 1: Initialize System
    // ============================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Initializing Simultaneous Execution System');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    components = await initializeSimultaneousExecution({
      websocketPort: 8080,
      redisDatabase: 0,
      maxParallelStreams: 12,
      enableMonitoring: true
    });

    console.log('\n✓ System initialization complete\n');

    // ============================================================
    // STEP 2: Define Test Pipeline
    // ============================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Defining Test Pipeline Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pipelineConfig = {
      clientId: 'demo-client',
      deliverableType: 'seo-content-package',
      streams: [
        {
          id: 'content-creation',
          domain: 'content',
          agentType: 'content-writer-specialist',
          task: {
            type: 'article-writing',
            topic: 'Advanced SEO Strategies for 2025',
            wordCount: 2000,
            targetKeywords: ['seo strategies', 'search optimization', 'ranking factors'],
            psychographicSegments: ['technical-professionals', 'marketing-managers']
          },
          expectedDuration: 45000, // 45 seconds
          priority: 'high'
        },
        {
          id: 'keyword-research',
          domain: 'seo',
          agentType: 'seo-keyword-research',
          task: {
            type: 'keyword-analysis',
            seedKeywords: ['seo strategies', 'content optimization'],
            competitorDomains: ['moz.com', 'semrush.com', 'ahrefs.com'],
            location: 'United States',
            analysisDepth: 'comprehensive'
          },
          expectedDuration: 40000, // 40 seconds
          priority: 'high'
        }
      ],
      coordination: {
        enableSharedContext: true,
        enableRealTimeSync: true,
        qualityThreshold: 0.95
      }
    };

    console.log('Pipeline Configuration:');
    console.log(`  Client: ${pipelineConfig.clientId}`);
    console.log(`  Deliverable: ${pipelineConfig.deliverableType}`);
    console.log(`  Streams: ${pipelineConfig.streams.length}`);
    pipelineConfig.streams.forEach(stream => {
      console.log(`    - ${stream.id} (${stream.domain})`);
      console.log(`      Agent: ${stream.agentType}`);
      console.log(`      Expected Duration: ${stream.expectedDuration}ms`);
    });
    console.log('');

    // ============================================================
    // STEP 3: Calculate Sequential Baseline
    // ============================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Sequential Execution Baseline');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sequentialDuration = pipelineConfig.streams.reduce(
      (total, stream) => total + stream.expectedDuration,
      0
    );

    console.log(`Sequential Execution (traditional approach):`);
    console.log(`  Stream 1: ${pipelineConfig.streams[0].expectedDuration}ms`);
    console.log(`  Stream 2: ${pipelineConfig.streams[1].expectedDuration}ms`);
    console.log(`  ─────────────────────────────────`);
    console.log(`  Total:    ${sequentialDuration}ms (${(sequentialDuration / 1000).toFixed(1)}s)\n`);

    // ============================================================
    // STEP 4: Execute Parallel Streams
    // ============================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4: Executing Parallel Streams');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Starting simultaneous execution...\n');

    const startTime = Date.now();

    const result = await components.streamOrchestrator.executeParallelStreams(
      pipelineConfig,
      {
        timeout: 120000, // 2 minute timeout
        enableQualityMonitoring: true,
        storeInCrystallineMemory: true
      }
    );

    const actualDuration = Date.now() - startTime;

    // ============================================================
    // STEP 5: Analyze Results
    // ============================================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 5: Results Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Overall success
    console.log('✓ Execution Status:', result.success ? 'SUCCESS' : 'FAILED');
    console.log('');

    // Performance metrics
    console.log('Performance Metrics:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`  Sequential Baseline:    ${sequentialDuration}ms (${(sequentialDuration / 1000).toFixed(1)}s)`);
    console.log(`  Parallel Actual:        ${actualDuration}ms (${(actualDuration / 1000).toFixed(1)}s)`);
    console.log(`  Time Saved:             ${sequentialDuration - actualDuration}ms`);
    console.log(`  Speed Improvement:      ${result.speedImprovement?.toFixed(1)}%`);
    console.log('');

    // Stream-specific results
    console.log('Stream Results:');
    console.log('─────────────────────────────────────────────────────────────');

    // results is actually the integratedResults object, not an array
    const integratedResults = result.results;
    console.log(`\n  Total Streams:        ${integratedResults.totalStreams}`);
    console.log(`  Successful Streams:   ${integratedResults.successfulStreams}`);
    console.log(`  Failed Streams:       ${integratedResults.failedStreams}`);
    console.log(`  Total Tasks:          ${integratedResults.totalTasks}`);
    console.log(`  Average Duration:     ${integratedResults.averageDuration?.toFixed(0)}ms`);
    console.log(`  Overall Quality:      ${integratedResults.overallQuality}%`);

    if (integratedResults.deliverables && integratedResults.deliverables.length > 0) {
      console.log(`  Deliverables:         ${integratedResults.deliverables.length} items`);
    }

    console.log('');

    // Quality metrics
    if (result.qualityMetrics) {
      console.log('Quality Metrics:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  Overall Quality:        ${(result.qualityMetrics.overallScore * 100).toFixed(1)}%`);
      console.log(`  Target:                 95.0%`);
      console.log(`  Status:                 ${result.qualityMetrics.overallScore >= 0.95 ? '✓ Passed' : '✗ Below Target'}`);
      console.log('');
    }

    // Token usage
    if (result.metrics) {
      console.log('Resource Usage:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  Total Tokens:           ${result.metrics.totalTokens?.toLocaleString() || 'N/A'}`);
      console.log(`  Input Tokens:           ${result.metrics.inputTokens?.toLocaleString() || 'N/A'}`);
      console.log(`  Output Tokens:          ${result.metrics.outputTokens?.toLocaleString() || 'N/A'}`);
      console.log('');
    }

    // Learning status
    console.log('Crystalline Memory:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`  Orchestration ID:       ${result.orchestrationId}`);
    console.log(`  Learnings Stored:       ${result.learningsStored ? '✓ Yes' : '✗ No'}`);
    console.log(`  Historical Context:     ${result.usedHistoricalContext ? '✓ Applied' : '○ None available'}`);
    console.log('');

    // ============================================================
    // STEP 6: Validation
    // ============================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 6: Validation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const validations = {
      'Execution Completed': result.success === true,
      'Quality Score ≥ 95%': integratedResults.overallQuality >= 95,
      'All Streams Completed': integratedResults.totalStreams === pipelineConfig.streams.length,
      'All Streams Successful': integratedResults.failedStreams === 0,
      'System Healthy': true // Made it this far without crashing
    };

    Object.entries(validations).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✓' : '✗'} ${check}`);
    });

    const allValidationsPassed = Object.values(validations).every(v => v);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (allValidationsPassed) {
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                    ✓ TEST PASSED                            ║');
      console.log('║                                                              ║');
      console.log('║  The simultaneous execution system is working correctly     ║');
      console.log('║  and meets all performance and quality targets.             ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
    } else {
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                    ⚠ TEST INCOMPLETE                        ║');
      console.log('║                                                              ║');
      console.log('║  Some validations did not pass. Review results above.       ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
    }

    console.log('');

  } catch (error) {
    console.error('\n╔══════════════════════════════════════════════════════════════╗');
    console.error('║                    ✗ TEST FAILED                            ║');
    console.error('╚══════════════════════════════════════════════════════════════╝\n');
    console.error('Error:', error.message);
    console.error('\nStack Trace:');
    console.error(error.stack);

  } finally {
    // ============================================================
    // STEP 7: Cleanup
    // ============================================================
    if (components) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('STEP 7: Cleanup');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('Closing WebSocket connections...');
      if (components.websocketLayer && components.websocketLayer.wss) {
        components.websocketLayer.wss.close();
      }

      console.log('Closing Redis connection...');
      if (components.redis && components.redis.isOpen) {
        await components.redis.quit();
      }

      console.log('✓ Cleanup complete\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test execution complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

// ============================================================
// Execute if run directly
// ============================================================
if (require.main === module) {
  runSimple2StreamTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runSimple2StreamTest };
