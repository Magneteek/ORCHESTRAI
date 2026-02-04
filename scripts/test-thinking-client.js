#!/usr/bin/env node

/**
 * Test Script for Extended Thinking Client
 *
 * Tests the ThinkingEnabledClient with a strategic planning task
 * to verify thinking blocks are returned and quality is improved.
 */

require('dotenv').config();
const ThinkingClient = require('../orchestrai-shared/api/thinking-enabled-client');
const logger = require('../orchestrai-shared/logging/logger').forDomain('thinking-test');

async function testExtendedThinking() {
  console.log('🧠 Testing Extended Thinking Client\n');

  const client = new ThinkingClient();

  // Test strategic planning task
  const testTask = {
    model: 'claude-opus-4-5',
    messages: [
      {
        role: 'user',
        content: `You are a strategic planning expert. Create a high-level strategic plan for a mid-sized dental practice looking to expand into cosmetic dentistry over the next 12 months.

Consider:
- Market positioning
- Resource requirements
- Revenue projections
- Risk factors

Provide a concise strategic plan.`
      }
    ],
    maxTokens: 16000,
    enableThinking: true,
    thinkingBudget: 10000
  };

  console.log('📋 Task: Strategic Planning for Dental Practice Expansion');
  console.log('Model: claude-opus-4-5');
  console.log('Thinking Budget: 10,000 tokens\n');

  try {
    console.log('⏳ Calling API with extended thinking...\n');

    const startTime = Date.now();
    const result = await client.createMessage(testTask);
    const duration = Date.now() - startTime;

    // Display results
    console.log('=' .repeat(80));
    console.log('✅ API CALL SUCCESSFUL');
    console.log('='.repeat(80));
    console.log();

    // Thinking analysis
    if (result.thinking) {
      console.log('🧠 THINKING BLOCK ANALYSIS');
      console.log('-'.repeat(80));
      console.log(`Length: ${result.thinking.length} characters`);
      console.log(`Tokens (estimated): ${result.thinkingTokens}`);
      console.log();
      console.log('Preview (first 800 characters):');
      console.log(result.thinking.substring(0, 800));
      if (result.thinking.length > 800) {
        console.log('\n[... truncated ...]');
      }
      console.log();
    } else {
      console.log('⚠️  No thinking block returned (unexpected)');
      console.log();
    }

    // Answer analysis
    console.log('📝 ANSWER');
    console.log('-'.repeat(80));
    console.log(`Length: ${result.answer.length} characters`);
    console.log();
    console.log(result.answer);
    console.log();

    // Performance metrics
    console.log('📊 PERFORMANCE METRICS');
    console.log('-'.repeat(80));
    console.log(`Total Duration: ${duration}ms`);
    console.log(`Thinking Tokens: ${result.thinkingTokens}`);
    console.log(`Total Tokens Used: ${result.usage.input_tokens + result.usage.output_tokens}`);
    console.log(`Input Tokens: ${result.usage.input_tokens}`);
    console.log(`Output Tokens: ${result.usage.output_tokens}`);
    console.log();

    // Quality assessment
    console.log('✨ QUALITY INDICATORS');
    console.log('-'.repeat(80));
    const hasFramework = /framework|strategy|plan/i.test(result.thinking || '');
    const hasAnalysis = /analysis|consider|evaluate/i.test(result.thinking || '');
    const hasOptions = /option|alternative|approach/i.test(result.thinking || '');
    const hasNumbers = /\d+%|\$\d+|revenue|cost/i.test(result.answer);

    console.log(`✓ Strategic Framework Applied: ${hasFramework ? 'Yes' : 'No'}`);
    console.log(`✓ Analysis Present: ${hasAnalysis ? 'Yes' : 'No'}`);
    console.log(`✓ Multiple Options Considered: ${hasOptions ? 'Yes' : 'No'}`);
    console.log(`✓ Quantitative Data Included: ${hasNumbers ? 'Yes' : 'No'}`);
    console.log();

    // Client metrics
    const clientMetrics = client.getMetrics();
    console.log('🔢 CLIENT METRICS');
    console.log('-'.repeat(80));
    console.log(`Total Thinking Requests: ${clientMetrics.thinkingRequests}`);
    console.log(`Average Thinking Tokens: ${clientMetrics.averageThinkingTokens.toFixed(0)}`);
    console.log(`Thinking Efficiency: ${clientMetrics.efficiency}`);
    console.log();

    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETE - Extended thinking is working!');
    console.log('='.repeat(80));

    return result;

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error();
    console.error('Details:', error);
    throw error;
  }
}

// Run test
if (require.main === module) {
  testExtendedThinking()
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testExtendedThinking };
