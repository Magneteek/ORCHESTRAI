#!/usr/bin/env node

/**
 * Inject Real Conversation Token Usage
 * Simulates Claude Code's actual token consumption from the current conversation
 */

const http = require('http');

// Track current conversation state
let conversationTokens = {
  inputTokens: 75500, // Approximate current usage
  outputTokens: 0,
  startTime: Date.now() - (45 * 60 * 1000) // Started 45 minutes ago
};

/**
 * Send token usage to monitor
 */
function injectTokenData() {
  const data = JSON.stringify({
    workflow: {
      id: `conversation-${Date.now()}`,
      intent: 'Token Monitor Development & Testing',
      startTime: conversationTokens.startTime
    },
    tokenData: {
      model: 'claude-sonnet-4-5-20250929',
      inputTokens: conversationTokens.inputTokens,
      outputTokens: conversationTokens.outputTokens
    }
  });

  const options = {
    hostname: 'localhost',
    port: 5505,
    path: '/api/token-usage',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let response = '';

    res.on('data', (chunk) => {
      response += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const result = JSON.parse(response);
        console.log(`✅ Injected: ${conversationTokens.inputTokens.toLocaleString()} tokens | Cost: $${result.data.session.totalCost.toFixed(4)}`);
      } else {
        console.error('❌ Error:', res.statusCode, response);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
    console.log('💡 Make sure monitor is running: npm run monitor:tokens');
  });

  req.write(data);
  req.end();
}

/**
 * Simulate ongoing conversation
 * Adds realistic token increments as if conversation is continuing
 */
function simulateConversation() {
  console.log('🔄 Injecting conversation token data...\n');
  console.log('📊 Starting tokens:', conversationTokens.inputTokens.toLocaleString());
  console.log('⏱️  Will simulate realistic token growth every 10 seconds\n');

  // Initial injection
  injectTokenData();

  // Simulate continued conversation every 10 seconds
  const interval = setInterval(() => {
    // Add realistic token increment (simulating user message + Claude response)
    const increment = Math.floor(Math.random() * 2000) + 800; // 800-2800 tokens per exchange
    conversationTokens.inputTokens += increment;
    conversationTokens.outputTokens = Math.floor(conversationTokens.inputTokens * 0.35); // ~35% output

    injectTokenData();
  }, 10000); // Every 10 seconds

  // Cleanup handler
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping token injection...');
    clearInterval(interval);
    console.log(`\n📊 Final token count: ${conversationTokens.inputTokens.toLocaleString()}`);
    process.exit(0);
  });

  console.log('⏱️  Token injection active. Press Ctrl+C to stop\n');
}

// Run simulation
simulateConversation();
