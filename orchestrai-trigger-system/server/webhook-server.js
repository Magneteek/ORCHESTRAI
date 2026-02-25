/**
 * Webhook Server - Express server for receiving webhooks
 *
 * Endpoints:
 * - POST /webhooks/github - GitHub webhooks
 * - POST /webhooks/generic - Generic webhooks
 * - GET /health - Health check
 * - GET /api/triggers - List triggers
 * - POST /api/triggers - Create trigger
 * - GET /api/queue/status - Queue status
 */

const express = require('express');
const bodyParser = require('body-parser');

class WebhookServer {
  constructor(options = {}) {
    this.config = {
      port: options.port || process.env.TRIGGER_PORT || 5502,
      host: options.host || '0.0.0.0',
      ...options
    };

    // Dependencies (injected)
    this.triggerEngine = options.triggerEngine || null;
    this.queueManager = options.queueManager || null;
    this.cronScheduler = options.cronScheduler || null;

    // Handlers
    this.githubHandler = options.githubHandler || null;
    this.webhookHandler = options.webhookHandler || null;

    // Create Express app
    this.app = express();
    this.server = null;

    // Setup middleware
    this.setupMiddleware();

    // Setup routes
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // JSON body parser
    this.app.use(bodyParser.json({
      verify: (req, res, buf) => {
        // Store raw body for signature verification
        req.rawBody = buf.toString('utf8');
      }
    }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature-256');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // GitHub webhooks
    this.app.post('/webhooks/github', async (req, res) => {
      try {
        if (!this.githubHandler || !this.triggerEngine) {
          return res.status(503).json({ error: 'GitHub handler not configured' });
        }

        // Process webhook
        const event = await this.githubHandler.handleEvent(req.body, req.headers);

        // Process through trigger engine
        const result = await this.triggerEngine.processEvent(event);

        res.json({
          success: true,
          event: event.event,
          result
        });

      } catch (error) {
        console.error('GitHub webhook error:', error);
        res.status(500).json({
          error: error.message
        });
      }
    });

    // Generic webhooks
    this.app.post('/webhooks/generic', async (req, res) => {
      try {
        if (!this.webhookHandler || !this.triggerEngine) {
          return res.status(503).json({ error: 'Webhook handler not configured' });
        }

        // Process webhook
        const event = await this.webhookHandler.handleEvent(req.body, req.headers, req.query);

        // Process through trigger engine
        const result = await this.triggerEngine.processEvent(event);

        res.json({
          success: true,
          event: event.event,
          result
        });

      } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
          error: error.message
        });
      }
    });

    // API: List triggers
    this.app.get('/api/triggers', (req, res) => {
      try {
        if (!this.triggerEngine) {
          return res.status(503).json({ error: 'Trigger engine not configured' });
        }

        const triggers = this.triggerEngine.getTriggers(req.query);

        res.json({
          success: true,
          triggers,
          count: triggers.length
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Create trigger
    this.app.post('/api/triggers', async (req, res) => {
      try {
        if (!this.triggerEngine) {
          return res.status(503).json({ error: 'Trigger engine not configured' });
        }

        const trigger = this.triggerEngine.registerTrigger(req.body);

        res.json({
          success: true,
          trigger
        });

      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // API: Delete trigger
    this.app.delete('/api/triggers/:id', (req, res) => {
      try {
        if (!this.triggerEngine) {
          return res.status(503).json({ error: 'Trigger engine not configured' });
        }

        const trigger = this.triggerEngine.unregisterTrigger(req.params.id);

        res.json({
          success: true,
          trigger
        });

      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });

    // API: Queue status
    this.app.get('/api/queue/status', (req, res) => {
      try {
        if (!this.queueManager) {
          return res.status(503).json({ error: 'Queue manager not configured' });
        }

        const status = this.queueManager.getQueueStatus();

        res.json({
          success: true,
          ...status
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Cron jobs
    this.app.get('/api/cron/jobs', (req, res) => {
      try {
        if (!this.cronScheduler) {
          return res.status(503).json({ error: 'Cron scheduler not configured' });
        }

        const jobs = this.cronScheduler.getJobs(req.query);

        res.json({
          success: true,
          jobs,
          count: jobs.length
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Schedule cron job
    this.app.post('/api/cron/jobs', (req, res) => {
      try {
        if (!this.cronScheduler) {
          return res.status(503).json({ error: 'Cron scheduler not configured' });
        }

        const job = this.cronScheduler.schedule(req.body);

        res.json({
          success: true,
          job
        });

      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // API: Statistics
    this.app.get('/api/stats', (req, res) => {
      try {
        const stats = {
          triggerEngine: this.triggerEngine?.getStats(),
          queueManager: this.queueManager?.getStats(),
          cronScheduler: this.cronScheduler?.getStats()
        };

        res.json({
          success: true,
          stats
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Start server
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, this.config.host, (error) => {
        if (error) {
          return reject(error);
        }

        console.log(`✅ Webhook server listening on ${this.config.host}:${this.config.port}`);
        console.log(`   GitHub webhooks: http://localhost:${this.config.port}/webhooks/github`);
        console.log(`   Generic webhooks: http://localhost:${this.config.port}/webhooks/generic`);
        console.log(`   API: http://localhost:${this.config.port}/api/triggers`);

        resolve();
      });
    });
  }

  /**
   * Stop server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Webhook server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = WebhookServer;
