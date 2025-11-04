#!/usr/bin/env node

/**
 * Claude Code Hooks HTTP Server
 * Receives webhooks from Claude Code and forwards to monitoring systems
 */

const express = require('express');
const http = require('http');
const ClaudeCodeHooksManager = require('./hooks-manager');

class HooksServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 5501,
      tokenMonitorUrl: options.tokenMonitorUrl || 'http://localhost:5505',
      silent: options.silent || false,
      ...options
    };

    // Initialize Express app
    this.app = express();
    this.server = http.createServer(this.app);

    // Initialize hooks manager
    this.hooksManager = new ClaudeCodeHooksManager();

    // Server state
    this.isRunning = false;
    this.startTime = null;

    // Logger respecting silent mode
    this.log = (...args) => {
      if (!this.options.silent) {
        console.log(...args);
      }
    };
    this.logError = (...args) => {
      if (!this.options.silent) {
        console.error(...args);
      }
    };

    // Setup server
    this.setupMiddleware();
    this.setupRoutes();
    this.setupHookForwarding();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(express.json());

    // CORS
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      this.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: this.isRunning ? Date.now() - this.startTime : 0,
        port: this.options.port,
        tokenMonitorUrl: this.options.tokenMonitorUrl
      });
    });

    // Get hook configurations
    this.app.get('/hooks/config', (req, res) => {
      res.json({
        success: true,
        data: this.hooksManager.getHookConfigurations()
      });
    });

    // Get active workflows
    this.app.get('/hooks/workflows', (req, res) => {
      res.json({
        success: true,
        data: this.hooksManager.getActiveWorkflows()
      });
    });

    // Get workflow metrics
    this.app.get('/hooks/metrics', (req, res) => {
      res.json({
        success: true,
        data: this.hooksManager.getWorkflowMetrics()
      });
    });

    // Hook endpoints
    this.app.post('/hooks/user-prompt-submit', async (req, res) => {
      try {
        const result = await this.hooksManager.handleUserPromptSubmit(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling user-prompt-submit:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/task-start', async (req, res) => {
      try {
        const result = await this.hooksManager.handleTaskStart(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling task-start:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/tool-call', async (req, res) => {
      try {
        const result = await this.hooksManager.handleToolCall(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling tool-call:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/mcp-call', async (req, res) => {
      try {
        const result = await this.hooksManager.handleMCPCall(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling mcp-call:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/token-usage', async (req, res) => {
      try {
        const result = await this.hooksManager.handleTokenUsage(req.body);

        // Forward to token monitor
        this.forwardToTokenMonitor(req.body, result);

        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling token-usage:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/task-complete', async (req, res) => {
      try {
        const result = await this.hooksManager.handleTaskComplete(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling task-complete:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/task-error', async (req, res) => {
      try {
        const result = await this.hooksManager.handleTaskError(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling task-error:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/session-start', async (req, res) => {
      try {
        const result = await this.hooksManager.handleSessionStart(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling session-start:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/session-end', async (req, res) => {
      try {
        const result = await this.hooksManager.handleSessionEnd(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling session-end:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/notification', async (req, res) => {
      try {
        const result = await this.hooksManager.handleNotification(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling notification:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/hooks/pre-compact', async (req, res) => {
      try {
        const result = await this.hooksManager.handlePreCompact(req.body);
        res.json({ success: true, data: result });
      } catch (error) {
        this.logError('Error handling pre-compact:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  /**
   * Setup event forwarding from hooks manager to token monitor
   */
  setupHookForwarding() {
    // Forward workflow events to token monitor
    this.hooksManager.on('workflow-initiated', (workflow) => {
      this.log(`📝 Workflow initiated: ${workflow.id}`);
    });

    this.hooksManager.on('token-usage-updated', (data) => {
      this.log(`💰 Token usage: ${data.totalTokens} tokens, $${data.totalCost}`);
    });

    this.hooksManager.on('workflow-completed', (data) => {
      this.log(`✅ Workflow completed: ${data.workflow.id}`);
    });

    this.hooksManager.on('workflow-failed', (data) => {
      this.logError(`❌ Workflow failed: ${data.workflow.id}`);
    });
  }

  /**
   * Forward token usage data to token monitor server
   */
  async forwardToTokenMonitor(hookData, result) {
    try {
      const http = require('http');

      const data = JSON.stringify({
        workflow: {
          id: hookData.workflowId || `hook-${Date.now()}`,
          intent: result.workflow?.intent || 'Hook-triggered event'
        },
        tokenData: {
          model: hookData.model || 'claude-sonnet-4-5-20250929',
          inputTokens: hookData.inputTokens || 0,
          outputTokens: hookData.outputTokens || 0
        }
      });

      const url = new URL(`${this.options.tokenMonitorUrl}/api/token-usage`);

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          this.log(`📡 Forwarded to token monitor: ${hookData.inputTokens || 0} tokens`);
        }
      });

      req.on('error', (error) => {
        this.logError(`⚠️  Failed to forward to token monitor: ${error.message}`);
      });

      req.write(data);
      req.end();
    } catch (error) {
      this.logError('Error forwarding to token monitor:', error);
    }
  }

  /**
   * Start the server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.options.port, () => {
          this.isRunning = true;
          this.startTime = Date.now();

          this.log('');
          this.log('🚀 Claude Code Hooks Server Started');
          this.log('====================================');
          this.log(`📡 HTTP Server: http://localhost:${this.options.port}`);
          this.log(`🔗 Token Monitor: ${this.options.tokenMonitorUrl}`);
          this.log(`❤️  Health Check: http://localhost:${this.options.port}/health`);
          this.log('');
          this.log('Hook Endpoints:');
          this.log('  POST /hooks/user-prompt-submit');
          this.log('  POST /hooks/task-start');
          this.log('  POST /hooks/tool-call');
          this.log('  POST /hooks/mcp-call');
          this.log('  POST /hooks/token-usage');
          this.log('  POST /hooks/task-complete');
          this.log('  POST /hooks/task-error');
          this.log('  POST /hooks/session-start');
          this.log('  POST /hooks/session-end');
          this.log('  POST /hooks/notification');
          this.log('  POST /hooks/pre-compact');
          this.log('');
          this.log('Management Endpoints:');
          this.log('  GET  /hooks/config    - Hook configurations');
          this.log('  GET  /hooks/workflows - Active workflows');
          this.log('  GET  /hooks/metrics   - Workflow metrics');
          this.log('====================================');
          this.log('');

          resolve(true);
        });

        this.server.on('error', (error) => {
          this.logError('❌ Server error:', error);
          reject(error);
        });
      } catch (error) {
        this.logError('❌ Failed to start server:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop the server
   */
  async stop() {
    return new Promise((resolve) => {
      this.log('🛑 Stopping Hooks Server...');

      this.server.close(() => {
        this.isRunning = false;
        this.log('✅ Hooks Server stopped');
        resolve(true);
      });
    });
  }
}

// Export the class
module.exports = HooksServer;

// CLI execution if run directly
if (require.main === module) {
  const server = new HooksServer({
    port: process.env.HOOKS_PORT || 5501,
    tokenMonitorUrl: process.env.TOKEN_MONITOR_URL || 'http://localhost:5505',
    silent: process.env.SILENT_MODE === 'true'
  });

  // Start server
  server.start().catch((error) => {
    console.error('Failed to start hooks server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}
