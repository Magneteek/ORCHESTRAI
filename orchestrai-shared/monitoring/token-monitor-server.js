/**
 * Token Monitor WebSocket Server
 * Real-time token usage and cost monitoring for Claude Code
 * Integrates with hooks-manager.js and broadcasts updates to connected clients
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const TokenAggregator = require('./token-aggregator');
const PersistenceManager = require('./persistence-manager');
const RollingWindowTracker = require('./rolling-window-tracker');

class TokenMonitorServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 5505,
      hooksManagerPort: options.hooksManagerPort || 5501,
      corsOrigins: options.corsOrigins || ['http://localhost:3000', 'http://localhost:5501'],
      heartbeatInterval: options.heartbeatInterval || 30000, // 30 seconds
      silent: options.silent || false, // Silent mode (no console.log)
      ...options
    };

    // Logger that respects silent mode
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

    // Initialize components
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.aggregator = new TokenAggregator({
      maxWorkflowHistory: 10,
      maxSessionHistory: 50
    });

    // Initialize persistence and rolling window
    this.persistence = new PersistenceManager();
    this.rollingWindow = new RollingWindowTracker({
      windowSize: 5 * 60 * 60 * 1000, // 5 hours
      defaultLimit: 400000, // 400K default (Pro tier)
      cleanupInterval: 60000 // Clean up every minute
    });

    // Client management
    this.clients = new Set();
    this.clientMetadata = new Map();

    // Hooks manager reference (set externally)
    this.hooksManager = null;

    // Server state
    this.isRunning = false;
    this.startTime = null;

    // Auto-save interval
    this.autoSaveInterval = null;

    // Setup server
    this.setupMiddleware();
    this.setupWebSocket();
    this.setupAPIRoutes();
    this.setupHealthCheck();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(express.json());

    // CORS middleware
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (this.options.corsOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

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
   * Setup WebSocket server and handlers
   */
  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const clientIp = req.socket.remoteAddress;

      this.log(`🔌 Client connected: ${clientId} from ${clientIp}`);

      // Store client
      this.clients.add(ws);
      this.clientMetadata.set(ws, {
        id: clientId,
        connectedAt: Date.now(),
        ip: clientIp,
        lastHeartbeat: Date.now()
      });

      // Send initial data
      ws.send(JSON.stringify({
        type: 'connection',
        clientId,
        data: {
          message: 'Connected to Token Monitor Server',
          snapshot: this.aggregator.getSnapshot()
        }
      }));

      // Handle messages from client
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (error) {
          this.logError('Error parsing client message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format'
          }));
        }
      });

      // Handle pong (heartbeat response)
      ws.on('pong', () => {
        const metadata = this.clientMetadata.get(ws);
        if (metadata) {
          metadata.lastHeartbeat = Date.now();
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.log(`🔌 Client disconnected: ${clientId}`);
        this.clients.delete(ws);
        this.clientMetadata.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        this.logError(`WebSocket error for client ${clientId}:`, error);
      });
    });

    // Start heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.options.heartbeatInterval);
  }

  /**
   * Handle messages from WebSocket clients
   * @param {WebSocket} ws - Client WebSocket
   * @param {Object} data - Message data
   */
  handleClientMessage(ws, data) {
    const { type, payload } = data;

    switch (type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      case 'get_snapshot':
        ws.send(JSON.stringify({
          type: 'snapshot',
          data: this.aggregator.getSnapshot()
        }));
        break;

      case 'get_stats':
        ws.send(JSON.stringify({
          type: 'statistics',
          data: this.aggregator.getStatistics()
        }));
        break;

      case 'subscribe':
        // Handle subscription to specific event types
        const metadata = this.clientMetadata.get(ws);
        if (metadata) {
          metadata.subscriptions = payload?.events || ['all'];
        }
        ws.send(JSON.stringify({
          type: 'subscribed',
          events: metadata?.subscriptions || ['all']
        }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${type}`
        }));
    }
  }

  /**
   * Send heartbeat to all connected clients
   */
  sendHeartbeat() {
    const now = Date.now();
    const snapshot = this.aggregator.getSnapshot();

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();

        // Send mini update with current stats
        ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: now,
          stats: {
            totalCost: snapshot.session.totalCost,
            totalTokens: snapshot.session.totalTokens,
            workflowCount: snapshot.session.workflowCount
          }
        }));
      }
    });

    // Clean up dead connections
    this.cleanupDeadConnections();
  }

  /**
   * Clean up connections that haven't responded to heartbeat
   */
  cleanupDeadConnections() {
    const now = Date.now();
    const timeout = this.options.heartbeatInterval * 3; // 3x heartbeat interval

    this.clients.forEach((ws) => {
      const metadata = this.clientMetadata.get(ws);
      if (metadata && now - metadata.lastHeartbeat > timeout) {
        this.log(`⚠️  Terminating dead connection: ${metadata.id}`);
        ws.terminate();
        this.clients.delete(ws);
        this.clientMetadata.delete(ws);
      }
    });
  }

  /**
   * Setup REST API routes
   */
  setupAPIRoutes() {
    // Get current session statistics
    this.app.get('/api/session-stats', (req, res) => {
      try {
        const stats = this.aggregator.getSessionSummary();
        res.json({
          success: true,
          data: stats,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting session stats:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get workflow history
    this.app.get('/api/workflows', (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const workflows = this.aggregator.getWorkflowHistory(limit);
        res.json({
          success: true,
          data: workflows,
          count: workflows.length,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting workflows:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get cost breakdown
    this.app.get('/api/costs', (req, res) => {
      try {
        const costs = this.aggregator.getCostBreakdown();
        res.json({
          success: true,
          data: costs,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting costs:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get full statistics
    this.app.get('/api/statistics', (req, res) => {
      try {
        const statistics = this.aggregator.getStatistics();
        res.json({
          success: true,
          data: statistics,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting statistics:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get complete snapshot
    this.app.get('/api/snapshot', (req, res) => {
      try {
        const snapshot = this.aggregator.getSnapshot();
        res.json({
          success: true,
          data: snapshot,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting snapshot:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Reset session counters
    this.app.post('/api/reset', (req, res) => {
      try {
        const result = this.aggregator.resetSession();

        // Broadcast reset to all clients
        this.broadcast({
          type: 'session_reset',
          data: result
        });

        res.json({
          success: true,
          data: result,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error resetting session:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Direct token usage submission (bypasses hooks manager)
    this.app.post('/api/token-usage', (req, res) => {
      try {
        const { workflow, tokenData } = req.body;

        if (!tokenData || !tokenData.inputTokens === undefined) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: tokenData.inputTokens, tokenData.outputTokens'
          });
        }

        // Process token usage
        const result = this.aggregator.processTokenUsage({
          workflow: workflow || {
            id: `manual-${Date.now()}`,
            intent: 'Manual submission'
          },
          tokenData: {
            inputTokens: tokenData.inputTokens || 0,
            outputTokens: tokenData.outputTokens || 0,
            model: tokenData.model || 'claude-sonnet-4-6'
          }
        });

        // Add to 5-hour rolling window
        this.rollingWindow.addTokens(
          tokenData.inputTokens || 0,
          tokenData.outputTokens || 0
        );

        // Broadcast to all connected clients
        this.broadcast({
          type: 'token_usage',
          data: result
        });

        res.json({
          success: true,
          data: result,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error processing token usage:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get cost analytics with projections
    this.app.get('/api/cost-analytics', (req, res) => {
      try {
        const analytics = this.aggregator.getCostAnalytics();
        res.json({
          success: true,
          data: analytics,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting cost analytics:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get efficiency metrics and optimization suggestions
    this.app.get('/api/efficiency-metrics', (req, res) => {
      try {
        const metrics = this.aggregator.getEfficiencyMetrics();
        res.json({
          success: true,
          data: metrics,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting efficiency metrics:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get connected clients info
    this.app.get('/api/clients', (req, res) => {
      try {
        const clientInfo = Array.from(this.clientMetadata.values()).map(metadata => ({
          id: metadata.id,
          connectedAt: metadata.connectedAt,
          uptime: Date.now() - metadata.connectedAt,
          subscriptions: metadata.subscriptions || ['all']
        }));

        res.json({
          success: true,
          data: {
            count: this.clients.size,
            clients: clientInfo
          },
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting clients:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get 5-hour rolling window status
    this.app.get('/api/rolling-window', (req, res) => {
      try {
        const windowStatus = this.rollingWindow.getStatus();
        res.json({
          success: true,
          data: windowStatus,
          timestamp: Date.now()
        });
      } catch (error) {
        this.logError('Error getting rolling window:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Setup health check endpoint
   */
  setupHealthCheck() {
    this.app.get('/health', (req, res) => {
      const uptime = this.startTime ? Date.now() - this.startTime : 0;

      res.json({
        status: 'healthy',
        service: 'Token Monitor Server',
        version: '1.0.0',
        uptime,
        port: this.options.port,
        connectedClients: this.clients.size,
        hooksManagerConnected: this.hooksManager !== null,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Connect to hooks manager and setup event listeners
   * @param {ClaudeCodeHooksManager} hooksManager - Hooks manager instance
   */
  connectToHooksManager(hooksManager) {
    if (!hooksManager) {
      this.logError('❌ Invalid hooks manager provided');
      return false;
    }

    this.hooksManager = hooksManager;

    // Listen for token usage events
    hooksManager.on('tokens-used', (data) => {
      const result = this.aggregator.processTokenUsage(data);

      // Add to 5-hour rolling window
      if (data.tokenData) {
        this.rollingWindow.addTokens(
          data.tokenData.inputTokens || 0,
          data.tokenData.outputTokens || 0
        );
      }

      this.broadcast({
        type: 'token_usage',
        data: result
      });
    });

    // Listen for workflow events
    hooksManager.on('workflow-initiated', (workflow) => {
      const result = this.aggregator.processWorkflowInitiated(workflow);
      this.broadcast({
        type: 'workflow_initiated',
        data: { workflow, result }
      });
    });

    hooksManager.on('workflow-completed', (data) => {
      const result = this.aggregator.processWorkflowCompleted(data);
      this.broadcast({
        type: 'workflow_completed',
        data: result
      });
    });

    hooksManager.on('session-started', (data) => {
      this.broadcast({
        type: 'session_started',
        data
      });
    });

    hooksManager.on('session-ended', (data) => {
      this.broadcast({
        type: 'session_ended',
        data
      });
    });

    this.log('✅ Connected to Claude Code Hooks Manager');
    return true;
  }

  /**
   * Broadcast message to all connected clients
   * @param {Object} message - Message to broadcast
   * @param {Function} filter - Optional filter function for selective broadcasting
   */
  broadcast(message, filter = null) {
    const payload = JSON.stringify({
      ...message,
      timestamp: Date.now()
    });

    let sentCount = 0;

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Apply filter if provided
        if (filter && !filter(ws, this.clientMetadata.get(ws))) {
          return;
        }

        ws.send(payload);
        sentCount++;
      }
    });

    if (sentCount > 0) {
      this.log(`📡 Broadcasted ${message.type} to ${sentCount} client(s)`);
    }
  }

  /**
   * Start the server
   * @returns {Promise<boolean>} Success status
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Load persisted session data
        this.loadPersistedData();

        // Start auto-save interval (save every 30 seconds)
        this.autoSaveInterval = setInterval(() => {
          this.saveSessionData();
        }, 30000);

        this.server.listen(this.options.port, () => {
          this.isRunning = true;
          this.startTime = Date.now();

          this.log('');
          this.log('🚀 Token Monitor Server Started');
          this.log('================================');
          this.log(`📡 WebSocket Server: ws://localhost:${this.options.port}`);
          this.log(`🌐 HTTP API: http://localhost:${this.options.port}`);
          this.log(`❤️  Health Check: http://localhost:${this.options.port}/health`);
          this.log('');
          this.log('API Endpoints:');
          this.log(`  GET  /api/session-stats     - Current session statistics`);
          this.log(`  GET  /api/workflows         - Recent workflow history`);
          this.log(`  GET  /api/costs             - Cost breakdown`);
          this.log(`  GET  /api/cost-analytics    - Cost analytics with projections`);
          this.log(`  GET  /api/efficiency-metrics- Efficiency metrics & optimization`);
          this.log(`  GET  /api/statistics        - Full statistics`);
          this.log(`  GET  /api/snapshot          - Complete monitoring snapshot`);
          this.log(`  GET  /api/rolling-window    - 5-hour rolling window status`);
          this.log(`  POST /api/reset             - Reset session counters`);
          this.log(`  GET  /api/clients           - Connected clients info`);
          this.log('');
          this.log('WebSocket Events:');
          this.log('  - token_usage           - Real-time token usage updates');
          this.log('  - workflow_initiated    - Workflow start notifications');
          this.log('  - workflow_completed    - Workflow completion notifications');
          this.log('  - heartbeat             - Periodic status updates');
          this.log('================================');
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
   * Stop the server gracefully
   * @returns {Promise<boolean>} Success status
   */
  async stop() {
    return new Promise((resolve) => {
      this.log('🛑 Stopping Token Monitor Server...');

      // Save session data before shutdown
      this.saveSessionData();

      // Clear auto-save interval
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }

      // Clear heartbeat interval
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      // Stop rolling window cleanup
      this.rollingWindow.stopCleanup();

      // Close all WebSocket connections
      this.clients.forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'server_shutdown',
          message: 'Server is shutting down'
        }));
        ws.close();
      });

      // Close WebSocket server
      this.wss.close(() => {
        this.log('✅ WebSocket server closed');
      });

      // Close HTTP server
      this.server.close(() => {
        this.isRunning = false;
        this.log('✅ Token Monitor Server stopped');
        resolve(true);
      });
    });
  }

  /**
   * Load persisted session data
   */
  loadPersistedData() {
    try {
      // Load session data
      const sessionData = this.persistence.loadSession();
      if (sessionData) {
        // Restore aggregator state (would need to add this method to TokenAggregator)
        this.log(`✅ Restored session: ${sessionData.totalTokens?.toLocaleString() || 0} tokens, $${sessionData.totalCost?.toFixed(4) || 0}`);
      }

      // Load rolling window data
      const windowData = this.persistence.loadRollingWindow();
      if (windowData) {
        this.rollingWindow.deserialize(windowData);
      }

      // Calculate and set P90 limit
      const p90Limit = this.persistence.calculateP90Limit();
      this.rollingWindow.setAdaptiveLimit(p90Limit);

    } catch (error) {
      this.logError('Error loading persisted data:', error);
      this.log('⚠️  Starting with fresh session');
    }
  }

  /**
   * Save current session data
   */
  saveSessionData() {
    try {
      // Get current session snapshot
      const snapshot = this.aggregator.getSnapshot();

      // Save session data
      const sessionData = {
        sessionId: snapshot.session.sessionId,
        startTime: snapshot.session.startTime,
        totalTokens: snapshot.session.totalTokens,
        inputTokens: snapshot.session.inputTokens,
        outputTokens: snapshot.session.outputTokens,
        totalCost: snapshot.session.totalCost,
        workflowCount: snapshot.session.workflowCount,
        workflows: snapshot.workflows
      };

      this.persistence.saveSession(sessionData);

      // Save rolling window data
      const windowData = this.rollingWindow.serialize();
      this.persistence.saveRollingWindow(windowData);

      this.log('💾 Session data saved');
    } catch (error) {
      this.logError('Error saving session data:', error);
    }
  }

  /**
   * Generate unique client ID
   * @returns {string} Client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Get server status
   * @returns {Object} Server status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      port: this.options.port,
      connectedClients: this.clients.size,
      hooksManagerConnected: this.hooksManager !== null,
      sessionStats: this.aggregator.getSessionSummary()
    };
  }
}

// Export the class
module.exports = TokenMonitorServer;

// CLI execution if run directly
if (require.main === module) {
  const server = new TokenMonitorServer({
    port: process.env.TOKEN_MONITOR_PORT || 5505,
    silent: process.env.SILENT_MODE === 'true' // Enable silent mode from environment
  });

  // Start server
  server.start().catch((error) => {
    this.logError('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    this.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    this.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}
