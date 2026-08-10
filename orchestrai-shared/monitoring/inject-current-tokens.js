#!/usr/bin/env node

/**
 * Token Injection Script
 * Sends current conversation token data to the token monitor
 */

const http = require('http');

// Current conversation data (from the system warning in this conversation)
const currentTokenUsage = {
  inputTokens: 114695,  // Approximate - update with actual from system warning
  outputTokens: 0,  // We'll track this separately
  remaining: 85305
};

/**
 * Send token data to monitor
 */
function injectTokenData() {
  const data = JSON.stringify({
    workflow: {
      id: `conversation-${Date.now()}`,
      intent: 'Token Monitor Enhancement Conversation',
      startTime: Date.now() - (10 * 60 * 1000) // Estimate 10 min ago
    },
    tokenData: {
      model: 'claude-sonnet-4-6',
      inputTokens: currentTokenUsage.inputTokens,
      outputTokens: Math.floor(currentTokenUsage.inputTokens * 0.4) // Estimate 40% output
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
      console.log('✅ Token data injected successfully!');
      console.log('Response:', JSON.parse(response));
      console.log('\n📊 Check your token monitor to see the updated values!');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error injecting token data:', error.message);
    console.log('\n💡 Make sure the token monitor is running:');
    console.log('   npm run monitor:tokens');
  });

  req.write(data);
  req.end();
}

// Run the injection
console.log('🔄 Injecting current conversation token data...\n');
injectTokenData();

// Set up periodic injection every 30 seconds to simulate real-time updates
setInterval(() => {
  // Increment tokens slightly to simulate ongoing conversation
  currentTokenUsage.inputTokens += Math.floor(Math.random() * 1000) + 500;
  injectTokenData();
}, 30000);

console.log('\n⏱️  Will continue injecting token updates every 30 seconds...');
console.log('Press Ctrl+C to stop\n');
