/**
 * Integration Example: Token Monitor Server with Hooks Manager
 * Demonstrates how to connect the token monitoring system to Claude Code hooks
 */

const ClaudeCodeHooksManager = require('../claude-code/hooks-manager');
const TokenMonitorServer = require('./token-monitor-server');

/**
 * Example 1: Basic Integration
 * Start both hooks manager and token monitor server
 */
async function basicIntegration() {
  console.log('🚀 Starting Token Monitor Integration...\n');

  // Initialize hooks manager (with optional usage tracker and MCP manager)
  const hooksManager = new ClaudeCodeHooksManager(null, null);

  // Initialize token monitor server
  const monitorServer = new TokenMonitorServer({
    port: 5503,
    hooksManagerPort: 5501,
    heartbeatInterval: 30000 // 30 seconds
  });

  try {
    // Start the token monitor server
    await monitorServer.start();

    // Connect to hooks manager for event listening
    monitorServer.connectToHooksManager(hooksManager);

    console.log('✅ Integration complete! Token monitoring is now active.\n');
    console.log('📊 Access monitoring at:');
    console.log('   WebSocket: ws://localhost:5503');
    console.log('   HTTP API:  http://localhost:5503/api/snapshot');
    console.log('   Health:    http://localhost:5503/health\n');

    return { hooksManager, monitorServer };
  } catch (error) {
    console.error('❌ Integration failed:', error);
    throw error;
  }
}

/**
 * Example 2: Simulated Token Usage
 * Demonstrates how token events flow through the system
 */
async function simulateTokenUsage(hooksManager) {
  console.log('\n🧪 Simulating token usage events...\n');

  // Simulate a workflow with token usage
  const workflowData = {
    prompt: 'Create a Node.js backend service',
    userId: 'test-user'
  };

  // 1. User submits prompt (initiates workflow)
  const workflow = await hooksManager.handleUserPromptSubmit(workflowData);
  console.log('✅ Workflow initiated:', workflow.workflowId);

  // 2. Task starts
  await hooksManager.handleTaskStart({
    workflowId: workflow.workflowId,
    task: 'Build backend service with Express and PostgreSQL'
  });
  console.log('✅ Task started');

  // 3. Simulate some token usage
  const tokenEvents = [
    { inputTokens: 1500, outputTokens: 3000, model: 'claude-sonnet-4-6' },
    { inputTokens: 2000, outputTokens: 4500, model: 'claude-sonnet-4-6' },
    { inputTokens: 1200, outputTokens: 2800, model: 'claude-sonnet-4-6' }
  ];

  for (const tokens of tokenEvents) {
    await hooksManager.handleTokenUsage({
      workflowId: workflow.workflowId,
      ...tokens
    });

    console.log(`✅ Token usage: ${tokens.inputTokens} input, ${tokens.outputTokens} output`);
    await sleep(500); // Simulate processing delay
  }

  // 4. Complete the workflow
  await hooksManager.handleTaskComplete({
    workflowId: workflow.workflowId,
    result: { status: 'success' }
  });
  console.log('✅ Workflow completed');

  console.log('\n📊 Total tokens used: 14,000 (4,700 input + 10,300 output)');
}

/**
 * Example 3: WebSocket Client Connection
 * Shows how to connect a client to the monitoring server
 */
function createWebSocketClient() {
  const WebSocket = require('ws');

  const ws = new WebSocket('ws://localhost:5503');

  ws.on('open', () => {
    console.log('🔌 Connected to Token Monitor Server');

    // Subscribe to all events
    ws.send(JSON.stringify({
      type: 'subscribe',
      payload: { events: ['all'] }
    }));

    // Request initial snapshot
    ws.send(JSON.stringify({
      type: 'get_snapshot'
    }));
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case 'token_usage':
        console.log('\n💰 Token Usage Update:');
        console.log(`   Current Cost: $${message.data.currentCost}`);
        console.log(`   Current Tokens: ${message.data.currentTokens}`);
        break;

      case 'workflow_completed':
        console.log('\n✅ Workflow Completed:');
        console.log(`   Workflow ID: ${message.data.workflowId}`);
        console.log(`   Cost: $${message.data.workflowCost}`);
        break;

      case 'snapshot':
        console.log('\n📊 Session Snapshot:');
        console.log(`   Total Cost: $${message.data.session.totalCost}`);
        console.log(`   Total Tokens: ${message.data.session.totalTokens}`);
        console.log(`   Workflows: ${message.data.session.workflowCount}`);
        break;

      case 'heartbeat':
        console.log('\n❤️  Heartbeat:', message.stats);
        break;
    }
  });

  ws.on('close', () => {
    console.log('🔌 Disconnected from Token Monitor Server');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  return ws;
}

/**
 * Example 4: HTTP API Usage
 * Demonstrates REST API endpoints
 */
async function demonstrateHTTPAPI() {
  const axios = require('axios');
  const baseURL = 'http://localhost:5503';

  console.log('\n🌐 Testing HTTP API Endpoints...\n');

  try {
    // Get session stats
    const stats = await axios.get(`${baseURL}/api/session-stats`);
    console.log('📊 Session Stats:', stats.data.data);

    // Get cost breakdown
    const costs = await axios.get(`${baseURL}/api/costs`);
    console.log('\n💰 Cost Breakdown:', costs.data.data);

    // Get workflow history
    const workflows = await axios.get(`${baseURL}/api/workflows?limit=5`);
    console.log('\n📋 Recent Workflows:', workflows.data.data.length);

    // Get statistics
    const statistics = await axios.get(`${baseURL}/api/statistics`);
    console.log('\n📈 Statistics:', statistics.data.data.session);

  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

/**
 * Example 5: Complete Integration Test
 * Full end-to-end test of the monitoring system
 */
async function completeIntegrationTest() {
  console.log('\n🧪 Starting Complete Integration Test...\n');

  // 1. Start the integration
  const { hooksManager, monitorServer } = await basicIntegration();

  // 2. Wait a moment for server to stabilize
  await sleep(1000);

  // 3. Create WebSocket client
  const wsClient = createWebSocketClient();

  // 4. Wait for connection
  await sleep(1000);

  // 5. Simulate token usage
  await simulateTokenUsage(hooksManager);

  // 6. Wait for events to propagate
  await sleep(2000);

  // 7. Test HTTP API
  await demonstrateHTTPAPI();

  // 8. Wait before cleanup
  await sleep(2000);

  // 9. Close WebSocket client
  wsClient.close();

  console.log('\n✅ Integration test complete!\n');

  return { hooksManager, monitorServer };
}

/**
 * Utility: Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions for use in other scripts
module.exports = {
  basicIntegration,
  simulateTokenUsage,
  createWebSocketClient,
  demonstrateHTTPAPI,
  completeIntegrationTest
};

// CLI execution
if (require.main === module) {
  const command = process.argv[2] || 'complete';

  (async () => {
    try {
      switch (command) {
        case 'basic':
          await basicIntegration();
          break;

        case 'simulate':
          const { hooksManager } = await basicIntegration();
          await sleep(1000);
          await simulateTokenUsage(hooksManager);
          break;

        case 'complete':
          const result = await completeIntegrationTest();
          // Keep running for 5 minutes to observe
          console.log('⏰ Test server will run for 5 minutes. Press Ctrl+C to stop.\n');
          await sleep(300000);
          await result.monitorServer.stop();
          break;

        default:
          console.log('Unknown command. Available: basic, simulate, complete');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
      process.exit(1);
    }
  })();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    process.exit(0);
  });
}
