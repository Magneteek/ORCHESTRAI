/**
 * Test Triggers - Demonstration of trigger system capabilities
 */

const TriggerSystem = require('../index');

async function runTests() {
  console.log('🧪 Testing ORCHESTRAI Trigger System\n');

  // Create trigger system
  const system = new TriggerSystem({
    port: 5503, // Use different port for testing
    maxConcurrent: 3
  });

  // Start system
  await system.start();

  console.log('\n=== Test 1: Register Triggers ===\n');

  // Test 1: Simple trigger
  const trigger1 = system.registerTrigger({
    id: 'test-github-pr',
    type: 'github',
    event: 'github.pull_request.opened',
    agent: 'content-writer-specialist',
    promptTemplate: 'Process PR: {{event.data.pullRequest.title}}',
    priority: 'high'
  });

  console.log('✅ Registered:', trigger1.name);

  // Test 2: Conditional trigger
  const trigger2 = system.registerTrigger({
    id: 'test-main-branch',
    type: 'github',
    event: 'github.pull_request.*',
    condition: 'data.pullRequest.base.ref === "main"',
    agent: 'seo-keyword-research',
    priority: 'normal'
  });

  console.log('✅ Registered:', trigger2.name);

  console.log('\n=== Test 2: Schedule Cron Jobs ===\n');

  // Test 3: Cron with natural language
  const job1 = system.schedule({
    id: 'test-hourly',
    name: 'Hourly Test Job',
    schedule: 'every hour',
    agent: 'content-outline-architect'
  });

  console.log('✅ Scheduled:', job1.name);

  // Test 4: Cron with exact time
  const job2 = system.schedule({
    id: 'test-daily',
    name: 'Daily Test Job',
    schedule: 'daily at 9:00',
    agent: 'seo-competitor-analysis',
    enabled: false // Start disabled
  });

  console.log('✅ Scheduled (disabled):', job2.name);

  console.log('\n=== Test 3: Simulate Events ===\n');

  // Test 5: Simulate GitHub event
  const githubEvent = {
    type: 'github',
    event: 'github.pull_request.opened',
    data: {
      repository: {
        fullName: 'test/repo',
        name: 'repo'
      },
      pullRequest: {
        number: 123,
        title: 'Test PR',
        base: { ref: 'main' },
        author: 'testuser'
      }
    },
    metadata: {
      receivedAt: new Date().toISOString()
    }
  };

  console.log('Simulating GitHub PR event...');
  const result1 = await system.triggerEngine.processEvent(githubEvent);
  console.log('Result:', JSON.stringify(result1, null, 2));

  console.log('\n=== Test 4: Watch Filesystem ===\n');

  // Test 6: Filesystem watcher (disabled for test)
  /*
  const watcher = system.watch({
    id: 'test-watch',
    path: '/tmp/test-orchestrai',
    events: ['add', 'change'],
    ignored: /(^|[\/\\])\../
  });

  console.log('✅ Watching:', watcher);
  */

  console.log('✅ Filesystem watcher test skipped (would require test directory)');

  console.log('\n=== Test 5: System Status ===\n');

  const status = system.getStatus();
  console.log('System Status:', JSON.stringify(status, null, 2));

  console.log('\n=== Test 6: Queue Manager ===\n');

  const queueStatus = system.queueManager.getQueueStatus();
  console.log('Queue Status:', JSON.stringify(queueStatus, null, 2));

  console.log('\n=== Cleanup ===\n');

  // Wait a bit for queue to process
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Show final stats
  console.log('Final Status:', JSON.stringify(system.getStatus(), null, 2));

  // Stop system
  await system.stop();

  console.log('\n✅ All tests completed!\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
