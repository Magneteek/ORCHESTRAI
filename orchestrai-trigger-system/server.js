#!/usr/bin/env node
/**
 * ORCHESTRAI Trigger System - Server
 *
 * Standalone server for autonomous agent execution
 */

const path = require('path');
const TriggerSystem = require('./index');

// Optional: Load Session Manager for integration
let SessionManager = null;
let sessionManager = null;

try {
  SessionManager = require('../orchestrai-session-manager');
  sessionManager = new SessionManager();
  console.log('✅ Session Manager loaded - sessions will be captured');
} catch (error) {
  console.log('⚠️  Session Manager not available - running without session capture');
}

// Create trigger system
const triggerSystem = new TriggerSystem({
  port: process.env.TRIGGER_PORT || 5502,
  maxConcurrent: process.env.MAX_CONCURRENT || 5,
  sessionManager
});

// Register example triggers
registerExampleTriggers(triggerSystem);

// Schedule example cron jobs
scheduleExampleJobs(triggerSystem);

// Start the system
(async () => {
  try {
    await triggerSystem.start();

    // Display status
    console.log('\n📊 System Status:');
    console.log(JSON.stringify(triggerSystem.getStatus(), null, 2));

    console.log('\n🔗 Endpoints:');
    console.log(`   Webhooks: http://localhost:5502/webhooks/*`);
    console.log(`   API: http://localhost:5502/api/*`);
    console.log(`   Health: http://localhost:5502/health`);

    console.log('\n✨ Ready to process events!\n');

  } catch (error) {
    console.error('Failed to start trigger system:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nReceived SIGINT, shutting down gracefully...');
  await triggerSystem.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\nReceived SIGTERM, shutting down gracefully...');
  await triggerSystem.stop();
  process.exit(0);
});

/**
 * Register example triggers
 */
function registerExampleTriggers(system) {
  // GitHub PR Review
  system.registerTrigger({
    id: 'github-pr-review',
    name: 'Auto Review Pull Requests',
    type: 'github',
    event: 'github.pull_request.opened',
    agent: 'code-review-specialist',
    promptTemplate: `Review PR: {{event.data.pullRequest.title}}`,
    priority: 'high'
  });

  // GitHub Issue Triage
  system.registerTrigger({
    id: 'github-issue-triage',
    name: 'Auto Triage Issues',
    type: 'github',
    event: 'github.issues.opened',
    agent: 'issue-triage-specialist',
    priority: 'normal'
  });

  console.log('✅ Example triggers registered');
}

/**
 * Schedule example cron jobs
 */
function scheduleExampleJobs(system) {
  // Daily SEO audit (commented out - enable as needed)
  /*
  system.schedule({
    id: 'daily-seo-audit',
    name: 'Daily SEO Audit',
    schedule: 'daily at 6:00',
    agent: 'seo-technical-analysis',
    parameters: {
      domain: 'example.com'
    }
  });
  */

  console.log('✅ Cron jobs ready (none scheduled by default)');
}
