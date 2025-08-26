// Enhanced WebSocket Manager for ORCHESTRAI
// Advanced real-time monitoring and streaming capabilities
// Supports testing updates, health monitoring, and multi-channel data streaming

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class EnhancedWebSocketManager extends EventEmitter {
  constructor(server, testingAPI = null) {
    super();
    
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.testingAPI = testingAPI;
    this.clients = new Map();
    this.channels = new Map();
    this.subscriptions = new Map(); // client -> Set of channel subscriptions
    
    // Data streams
    this.dataStreams = {
      system_metrics: { interval: 2000, active: true },
      mcp_status: { interval: 5000, active: true },
      test_results: { interval: 3000, active: true },
      memory_stats: { interval: 10000, active: true },
      usage_analytics: { interval: 30000, active: true },
      real_time_logs: { interval: 1000, active: false }, // On-demand
      health_monitoring: { interval: 15000, active: true },
      cost_tracking: { interval: 60000, active: true }
    };
    
    this.setupWebSocket();
    this.startDataStreams();
    
    console.log('🔄 Enhanced WebSocket Manager initialized with advanced streaming');
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const connectionId = uuidv4();
      const clientInfo = {
        id: connectionId,
        ws,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
        subscriptions: new Set(['system_metrics']), // Default subscription
        metadata: {
          userAgent: req.headers['user-agent'],
          origin: req.headers.origin,
          ip: req.connection.remoteAddress
        }
      };
      
      this.clients.set(connectionId, clientInfo);
      this.subscriptions.set(connectionId, clientInfo.subscriptions);
      
      console.log(`🔌 Enhanced WebSocket connected: ${connectionId} from ${clientInfo.metadata.origin || 'unknown'}`);
      
      // Send welcome message with available channels
      this.sendToClient(connectionId, {
        type: 'connection_established',
        connectionId,
        availableChannels: Object.keys(this.dataStreams),
        defaultSubscriptions: Array.from(clientInfo.subscriptions),
        timestamp: new Date().toISOString()
      });

      // Handle incoming messages
      ws.on('message', (message) => {
        this.handleClientMessage(connectionId, message);
      });

      ws.on('close', () => {
        this.handleClientDisconnection(connectionId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${connectionId}:`, error.message);
        this.handleClientDisconnection(connectionId);
      });

      // Send initial data
      this.sendInitialData(connectionId);
    });
  }

  handleClientMessage(connectionId, message) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(connectionId);
      
      if (!client) return;
      
      client.lastActivity = Date.now();
      
      switch (data.type) {
        case 'subscribe':
          this.handleSubscription(connectionId, data.channels);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(connectionId, data.channels);
          break;
          
        case 'request_data':
          this.handleDataRequest(connectionId, data.dataType);
          break;
          
        case 'ping':
          this.sendToClient(connectionId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
          
        case 'client_info':
          client.metadata = { ...client.metadata, ...data.info };
          break;
          
        default:
          console.log(`Unknown message type from ${connectionId}:`, data.type);
      }
    } catch (error) {
      console.error(`Error handling message from ${connectionId}:`, error);
    }
  }

  handleSubscription(connectionId, channels) {
    const client = this.clients.get(connectionId);
    if (!client) return;
    
    const validChannels = channels.filter(channel => this.dataStreams.hasOwnProperty(channel));
    
    validChannels.forEach(channel => {
      client.subscriptions.add(channel);
      console.log(`📡 Client ${connectionId} subscribed to ${channel}`);
    });
    
    this.sendToClient(connectionId, {
      type: 'subscription_confirmed',
      channels: validChannels,
      subscriptions: Array.from(client.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  handleUnsubscription(connectionId, channels) {
    const client = this.clients.get(connectionId);
    if (!client) return;
    
    channels.forEach(channel => {
      client.subscriptions.delete(channel);
      console.log(`📡 Client ${connectionId} unsubscribed from ${channel}`);
    });
    
    this.sendToClient(connectionId, {
      type: 'unsubscription_confirmed',
      channels,
      subscriptions: Array.from(client.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  handleDataRequest(connectionId, dataType) {
    // Handle one-time data requests
    switch (dataType) {
      case 'full_system_status':
        this.sendSystemStatus(connectionId);
        break;
      case 'test_history':
        this.sendTestHistory(connectionId);
        break;
      case 'mcp_logs':
        this.sendMCPLogs(connectionId);
        break;
      default:
        this.sendToClient(connectionId, {
          type: 'data_request_error',
          error: `Unknown data type: ${dataType}`,
          timestamp: new Date().toISOString()
        });
    }
  }

  handleClientDisconnection(connectionId) {
    const client = this.clients.get(connectionId);
    if (client) {
      console.log(`🔌 Enhanced WebSocket disconnected: ${connectionId} (connected for ${this.formatDuration(Date.now() - client.connectedAt)})`);
      this.clients.delete(connectionId);
      this.subscriptions.delete(connectionId);
    }
  }

  sendToClient(connectionId, data) {
    const client = this.clients.get(connectionId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }

  broadcast(data, channelFilter = null) {
    const message = JSON.stringify(data);
    
    this.clients.forEach((client, connectionId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        // If channel filter is specified, only send to subscribed clients
        if (channelFilter && !client.subscriptions.has(channelFilter)) {
          return;
        }
        
        client.ws.send(message);
      }
    });
  }

  async sendInitialData(connectionId) {
    // Send current system state
    if (this.systemMetrics) {
      this.sendToClient(connectionId, {
        type: 'system_metrics',
        data: this.systemMetrics,
        timestamp: new Date().toISOString()
      });
    }

    // Send MCP status if available
    if (this.mcpManager) {
      try {
        const mcpStatus = this.mcpManager.getAllServersStatus();
        this.sendToClient(connectionId, {
          type: 'mcp_status',
          data: { servers: mcpStatus },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error sending initial MCP status:', error);
      }
    }

    // Send testing status if available
    if (this.testingAPI && this.testingAPI.tester) {
      try {
        const testingStatus = {
          initialized: true,
          running: this.testingAPI.tester.testSchedules.size > 0,
          activeTests: Array.from(this.testingAPI.tester.activeTests),
          metrics: this.testingAPI.tester.testMetrics
        };
        
        this.sendToClient(connectionId, {
          type: 'testing_status',
          data: testingStatus,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error sending initial testing status:', error);
      }
    }
  }

  startDataStreams() {
    // System metrics stream
    this.streams = {};
    
    Object.entries(this.dataStreams).forEach(([streamName, config]) => {
      if (config.active) {
        this.streams[streamName] = setInterval(async () => {
          await this.updateStream(streamName);
        }, config.interval);
        
        console.log(`📊 Started ${streamName} stream (${config.interval}ms interval)`);
      }
    });

    // Cleanup inactive clients every 30 seconds
    setInterval(() => {
      this.cleanupInactiveClients();
    }, 30000);
  }

  async updateStream(streamName) {
    try {
      let data = null;
      
      switch (streamName) {
        case 'system_metrics':
          data = await this.getSystemMetrics();
          break;
        case 'mcp_status':
          data = await this.getMCPStatus();
          break;
        case 'test_results':
          data = await this.getTestResults();
          break;
        case 'memory_stats':
          data = await this.getMemoryStats();
          break;
        case 'usage_analytics':
          data = await this.getUsageAnalytics();
          break;
        case 'health_monitoring':
          data = await this.getHealthMonitoring();
          break;
        case 'cost_tracking':
          data = await this.getCostTracking();
          break;
      }
      
      if (data) {
        this.broadcast({
          type: streamName,
          data,
          timestamp: new Date().toISOString()
        }, streamName);
      }
    } catch (error) {
      console.error(`Error updating ${streamName} stream:`, error);
    }
  }

  async getSystemMetrics() {
    return this.systemMetrics || null;
  }

  async getMCPStatus() {
    if (!this.mcpManager) return null;
    
    try {
      const status = this.mcpManager.getAllServersStatus();
      return {
        servers: status,
        totalServers: Object.keys(status).length,
        runningServers: Object.values(status).filter(s => s.status === 'running').length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting MCP status:', error);
      return null;
    }
  }

  async getTestResults() {
    if (!this.testingAPI || !this.testingAPI.tester) return null;
    
    try {
      const results = this.testingAPI.tester.getTestResults();
      return {
        ...results,
        status: {
          initialized: true,
          running: this.testingAPI.tester.testSchedules.size > 0,
          activeTests: Array.from(this.testingAPI.tester.activeTests)
        }
      };
    } catch (error) {
      console.error('Error getting test results:', error);
      return null;
    }
  }

  async getMemoryStats() {
    if (!this.crystallineMemory) return null;
    
    try {
      return await this.crystallineMemory.getMemoryPoolStats();
    } catch (error) {
      console.error('Error getting memory stats:', error);
      return null;
    }
  }

  async getUsageAnalytics() {
    if (!this.usageTracker) return null;
    
    try {
      const tokenUsage = await this.usageTracker.getTokenUsage();
      const memoryUsage = await this.usageTracker.getMemoryUsage();
      const systemHealth = await this.usageTracker.getSystemHealth();
      
      return {
        tokenUsage,
        memoryUsage,
        systemHealth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      return null;
    }
  }

  async getHealthMonitoring() {
    const health = {
      websocket: {
        totalConnections: this.clients.size,
        activeStreams: Object.keys(this.streams).length,
        dataStreamStatus: this.dataStreams
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      timestamp: new Date().toISOString()
    };
    
    // Add component health checks
    health.components = {
      redis: this.systemMetrics?.redisStatus || 'Unknown',
      mcp: this.mcpManager ? 'Active' : 'Not Available',
      testing: this.testingAPI ? 'Active' : 'Not Available',
      crystallineMemory: this.crystallineMemory ? 'Active' : 'Not Available',
      usageTracker: this.usageTracker ? 'Active' : 'Not Available'
    };
    
    return health;
  }

  async getCostTracking() {
    if (!this.usageTracker) return null;
    
    try {
      const tokenUsage = await this.usageTracker.getTokenUsage();
      const costData = await this.usageTracker.calculateCurrentCosts();
      
      return {
        tokenUsage,
        costs: costData,
        projections: await this.usageTracker.getUsageProjections(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting cost tracking:', error);
      return null;
    }
  }

  cleanupInactiveClients() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes
    
    this.clients.forEach((client, connectionId) => {
      if (now - client.lastActivity > timeout) {
        console.log(`🧹 Cleaning up inactive client: ${connectionId}`);
        client.ws.terminate();
        this.clients.delete(connectionId);
        this.subscriptions.delete(connectionId);
      }
    });
  }

  // External integration methods
  setSystemMetrics(metrics) {
    this.systemMetrics = metrics;
  }

  setMCPManager(mcpManager) {
    this.mcpManager = mcpManager;
  }

  setCrystallineMemory(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
  }

  setUsageTracker(usageTracker) {
    this.usageTracker = usageTracker;
  }

  // Broadcasting methods for external use
  broadcastTestUpdate(testType, results) {
    this.broadcast({
      type: 'test_update',
      testType,
      results,
      timestamp: new Date().toISOString()
    }, 'test_results');
  }

  broadcastMCPUpdate(serverName, status) {
    this.broadcast({
      type: 'mcp_update',
      serverName,
      status,
      timestamp: new Date().toISOString()
    }, 'mcp_status');
  }

  broadcastAlert(level, message, details = {}) {
    this.broadcast({
      type: 'system_alert',
      level, // info, warning, error, critical
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Utility methods
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  getConnectionStats() {
    const subscriptionCounts = {};
    Object.keys(this.dataStreams).forEach(stream => {
      subscriptionCounts[stream] = 0;
    });
    
    this.clients.forEach(client => {
      client.subscriptions.forEach(subscription => {
        if (subscriptionCounts.hasOwnProperty(subscription)) {
          subscriptionCounts[subscription]++;
        }
      });
    });
    
    return {
      totalClients: this.clients.size,
      activeStreams: Object.keys(this.streams).length,
      subscriptionCounts,
      averageConnectionDuration: this.getAverageConnectionDuration(),
      timestamp: new Date().toISOString()
    };
  }

  getAverageConnectionDuration() {
    if (this.clients.size === 0) return 0;
    
    const now = Date.now();
    const totalDuration = Array.from(this.clients.values())
      .reduce((sum, client) => sum + (now - client.connectedAt), 0);
    
    return totalDuration / this.clients.size;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔌 Shutting down Enhanced WebSocket Manager...');
    
    // Stop all streams
    Object.entries(this.streams).forEach(([streamName, interval]) => {
      clearInterval(interval);
      console.log(`📊 Stopped ${streamName} stream`);
    });
    
    // Close all client connections gracefully
    this.clients.forEach((client, connectionId) => {
      client.ws.close(1000, 'Server shutting down');
    });
    
    // Close WebSocket server
    return new Promise((resolve) => {
      this.wss.close(() => {
        console.log('✅ Enhanced WebSocket Manager shut down gracefully');
        resolve();
      });
    });
  }
}

module.exports = EnhancedWebSocketManager;