#!/usr/bin/env node

/**
 * Token Monitor Test Script
 * Sends simulated token usage data to test the terminal UI
 */

const http = require('http');

const SERVER_URL = process.env.WEBSOCKET_URL || 'http://localhost:5503';
const TEST_DURATION = parseInt(process.env.TEST_DURATION || '60', 10); // seconds

console.log('Token Monitor Test Script');
console.log('=========================');
console.log(`Server URL: ${SERVER_URL}`);
console.log(`Test Duration: ${TEST_DURATION} seconds`);
console.log('');
console.log('This script will send simulated token usage data to the monitor.');
console.log('Make sure the token monitor is running before starting this test.');
console.log('');

// Simulated workflows
const workflows = [
  { type: 'content-creation', avgInputTokens: 3000, avgOutputTokens: 2000 },
  { type: 'code-generation', avgInputTokens: 2500, avgOutputTokens: 1500 },
  { type: 'data-analysis', avgInputTokens: 4000, avgOutputTokens: 3000 },
  { type: 'research-task', avgInputTokens: 3500, avgOutputTokens: 2500 },
  { type: 'api-integration', avgInputTokens: 2000, avgOutputTokens: 1000 }
];

let sessionId = `test-session-${Date.now()}`;
let totalSent = 0;
let workflowCounter = 0;

/**
 * Send data to the server
 * @param {Object} data - Data to send
 */
function sendData(data) {
  const postData = JSON.stringify(data);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(SERVER_URL, options, (res) => {
    if (res.statusCode === 200) {
      totalSent++;
    } else {
      console.error(`Error: Server responded with status ${res.statusCode}`);
    }
  });

  req.on('error', (error) => {
    console.error(`Connection error: ${error.message}`);
    console.error('Make sure the token monitor server is running!');
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

/**
 * Generate random token count with variation
 * @param {number} base - Base token count
 * @param {number} variance - Variance percentage (0-1)
 * @returns {number} Random token count
 */
function randomTokens(base, variance = 0.3) {
  const min = base * (1 - variance);
  const max = base * (1 + variance);
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Simulate a workflow execution
 */
function simulateWorkflow() {
  const workflow = workflows[Math.floor(Math.random() * workflows.length)];
  const workflowId = `wf_test_${++workflowCounter}`;

  console.log(`[${new Date().toLocaleTimeString()}] Simulating workflow: ${workflow.type} (${workflowId})`);

  // Task start
  sendData({
    type: 'task-start',
    sessionId: sessionId,
    workflowId: workflowId,
    description: `Starting ${workflow.type}`,
    timestamp: new Date().toISOString()
  });

  // Simulate multiple token usage events during workflow
  const steps = Math.floor(Math.random() * 3) + 2; // 2-4 steps

  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      const inputTokens = randomTokens(workflow.avgInputTokens / steps);
      const outputTokens = randomTokens(workflow.avgOutputTokens / steps);

      sendData({
        type: 'token-usage',
        sessionId: sessionId,
        workflowId: workflowId,
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        timestamp: new Date().toISOString()
      });

      console.log(`  Step ${i + 1}/${steps}: ${inputTokens} input + ${outputTokens} output tokens`);
    }, i * 1000);
  }

  // Workflow complete
  setTimeout(() => {
    const totalTokens = workflow.avgInputTokens + workflow.avgOutputTokens;

    sendData({
      type: 'workflow-complete',
      sessionId: sessionId,
      workflowId: workflowId,
      totalTokens: totalTokens,
      status: 'completed',
      timestamp: new Date().toISOString()
    });

    console.log(`  ✓ Workflow completed: ${totalTokens} total tokens`);
  }, steps * 1000 + 500);
}

/**
 * Simulate continuous token usage
 */
function simulateContinuousUsage() {
  setInterval(() => {
    const inputTokens = randomTokens(500);
    const outputTokens = randomTokens(300);

    sendData({
      type: 'token-usage',
      sessionId: sessionId,
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      timestamp: new Date().toISOString()
    });
  }, 5000); // Every 5 seconds
}

/**
 * Main test function
 */
function runTest() {
  console.log('Starting test...\n');

  // Send initial user prompt
  sendData({
    type: 'user-prompt-submit',
    sessionId: sessionId,
    prompt: 'Test prompt for token monitoring',
    timestamp: new Date().toISOString()
  });

  // Simulate workflows at random intervals
  const workflowInterval = setInterval(() => {
    simulateWorkflow();
  }, Math.random() * 8000 + 5000); // Every 5-13 seconds

  // Simulate continuous background token usage
  simulateContinuousUsage();

  // Stop after test duration
  setTimeout(() => {
    clearInterval(workflowInterval);

    console.log('\n');
    console.log('Test completed!');
    console.log(`Total messages sent: ${totalSent}`);
    console.log(`Workflows simulated: ${workflowCounter}`);
    console.log('');
    console.log('The monitor should now show all the simulated data.');

    process.exit(0);
  }, TEST_DURATION * 1000);
}

// Start the test
runTest();
