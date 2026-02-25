/**
 * ORCHESTRAI Trigger System - Main Entry Point
 *
 * Autonomous agent scheduling and event-driven execution
 */

const TriggerEngine = require('./core/trigger-engine');
const QueueManager = require('./core/queue-manager');
const CronScheduler = require('./core/cron-scheduler');
const GitHubHandler = require('./handlers/github-handler');
const WebhookHandler = require('./handlers/webhook-handler');
const FilesystemHandler = require('./handlers/filesystem-handler');
const SessionBridge = require('./integration/session-bridge');
const WebhookServer = require('./server/webhook-server');

class TriggerSystem {
  constructor(options = {}) {
    this.config = {
      port: options.port || 5502,
      maxConcurrent: options.maxConcurrent || 5,
      ...options
    };

    // Session Manager (optional, injected)
    this.sessionManager = options.sessionManager || null;

    // Initialize components
    this.initialize();
  }

  /**
   * Initialize all components
   */
  initialize() {
    // Session Bridge
    this.sessionBridge = new SessionBridge({
      sessionManager: this.sessionManager
    });

    // Queue Manager
    this.queueManager = new QueueManager({
      maxConcurrent: this.config.maxConcurrent,
      executor: async (job) => {
        return await this.sessionBridge.executeAgentInvocation(job);
      }
    });

    // Trigger Engine
    this.triggerEngine = new TriggerEngine({
      queueManager: this.queueManager,
      sessionManager: this.sessionManager
    });

    // Cron Scheduler
    this.cronScheduler = new CronScheduler({
      triggerEngine: this.triggerEngine
    });

    // Event Handlers
    this.githubHandler = new GitHubHandler();
    this.webhookHandler = new WebhookHandler();
    this.filesystemHandler = new FilesystemHandler({
      triggerEngine: this.triggerEngine
    });

    // Register handlers with trigger engine
    this.triggerEngine.registerHandler('github', this.githubHandler);
    this.triggerEngine.registerHandler('webhook', this.webhookHandler);
    this.triggerEngine.registerHandler('filesystem', this.filesystemHandler);

    // Webhook Server
    this.webhookServer = new WebhookServer({
      port: this.config.port,
      triggerEngine: this.triggerEngine,
      queueManager: this.queueManager,
      cronScheduler: this.cronScheduler,
      githubHandler: this.githubHandler,
      webhookHandler: this.webhookHandler
    });

    // Event forwarding
    this.setupEventForwarding();
  }

  /**
   * Setup event forwarding
   */
  setupEventForwarding() {
    // Forward trigger engine events
    this.triggerEngine.on('trigger:activated', (data) => {
      console.log(`🔔 Trigger activated: ${data.trigger.name}`);
    });

    this.triggerEngine.on('trigger:error', (data) => {
      console.error(`❌ Trigger error: ${data.trigger.name}`, data.error.message);
    });

    // Forward queue manager events
    this.queueManager.on('job:enqueued', (job) => {
      console.log(`📥 Job enqueued: ${job.agent} (${job.priority})`);
    });

    this.queueManager.on('job:started', (job) => {
      console.log(`▶️  Job started: ${job.agent}`);
    });

    this.queueManager.on('job:completed', (job) => {
      console.log(`✅ Job completed: ${job.agent} (${job.duration}ms)`);
    });

    this.queueManager.on('job:failed', (job) => {
      console.error(`❌ Job failed: ${job.agent}`, job.error);
    });

    // Forward cron scheduler events
    this.cronScheduler.on('job:scheduled', (job) => {
      console.log(`⏰ Cron job scheduled: ${job.name} (${job.scheduleNatural})`);
    });

    this.cronScheduler.on('job:executing', (job) => {
      console.log(`⏰ Cron job executing: ${job.name}`);
    });
  }

  /**
   * Start the trigger system
   */
  async start() {
    console.log('🚀 Starting ORCHESTRAI Trigger System...');

    // Start queue processing
    this.queueManager.start();
    console.log('✅ Queue manager started');

    // Start webhook server
    await this.webhookServer.start();
    console.log('✅ Webhook server started');

    console.log('🎉 Trigger system ready!\n');

    return this;
  }

  /**
   * Stop the trigger system
   */
  async stop() {
    console.log('🛑 Stopping trigger system...');

    // Stop queue processing
    this.queueManager.stop();

    // Stop webhook server
    await this.webhookServer.stop();

    // Close filesystem watchers
    await this.filesystemHandler.closeAll();

    console.log('✅ Trigger system stopped');
  }

  /**
   * Register a trigger
   */
  registerTrigger(trigger) {
    return this.triggerEngine.registerTrigger(trigger);
  }

  /**
   * Schedule a cron job
   */
  schedule(jobConfig) {
    return this.cronScheduler.schedule(jobConfig);
  }

  /**
   * Watch a filesystem path
   */
  watch(watchConfig) {
    return this.filesystemHandler.watch(watchConfig);
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      triggerEngine: this.triggerEngine.getStats(),
      queueManager: this.queueManager.getStats(),
      cronScheduler: this.cronScheduler.getStats(),
      triggers: this.triggerEngine.getTriggers().length,
      cronJobs: this.cronScheduler.getJobs().length,
      watchers: this.filesystemHandler.getWatchers().length
    };
  }
}

module.exports = TriggerSystem;
