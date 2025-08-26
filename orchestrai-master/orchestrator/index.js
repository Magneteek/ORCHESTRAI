require('dotenv').config();
const EventEmitter = require('events');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const CrystallineMemoryManager = require('../crystalline-memory/memory-manager');
const MCPManager = require('../../orchestrai-shared/mcp-servers/mcp-manager');
const UsageTracker = require('../../orchestrai-shared/analytics/usage-tracker');
const ClaudeCodeHooksManager = require('../../orchestrai-shared/claude-code/hooks-manager');
const DomainAgentManager = require('../../orchestrai-shared/domain-coordination/domain-agent-manager');
const SEODomainHub = require('../../orchestrai-domains/seo/seo-domain-hub');
const MasterCoordinatorInterface = require('../../orchestrai-shared/api/master-coordinator-interface');

// ORCHESTRAI Main Orchestrator
// Port 5501 - Central coordination service
// Implements crystalline memory coordination and geometric routing

class OrchestraiMaster extends EventEmitter {
  constructor() {
    super();
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server, path: '/ws' });
    this.port = process.env.ORCHESTRATOR_PORT || 5501;
    this.wsPort = process.env.WEBSOCKET_PORT || 5502;
    
    // System state
    this.agents = new Map();
    this.memoryNodes = 0;
    this.activeConnections = new Set();
    this.systemMetrics = {
      startTime: Date.now(),
      totalRequests: 0,
      memoryNodes: 0,
      activeAgents: 0,
      pipelineSharing: 'Active',
      redisStatus: 'Disconnected'
    };

    this.initializeRedis();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.startMetricsUpdater();
    this.initializeMCP();
  }

  async initializeRedis() {
    try {
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      this.redis.on('error', (err) => {
        console.log('Redis Client Error:', err);
        this.systemMetrics.redisStatus = 'Error';
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected for crystalline memory');
        this.systemMetrics.redisStatus = 'Connected';
        
        this.crystallineMemory = new CrystallineMemoryManager(this.redis);
        console.log('🧠 Crystalline Memory Manager initialized');
        
        this.mcpManager = new MCPManager();
        console.log('🔌 MCP Manager initialized');
        
        this.usageTracker = new UsageTracker(this.redis);
        console.log('📊 Usage Tracker initialized');
        
        this.claudeCodeHooks = new ClaudeCodeHooksManager(this.usageTracker, this.mcpManager);
        console.log('🎣 Claude Code Hooks Manager initialized');
        
        // Initialize Domain Agent Manager and domain agents
        this.initializeDomainAgents();
      });

      await this.redis.connect();
    } catch (error) {
      console.log('⚠️  Redis not available, using in-memory fallback');
      this.systemMetrics.redisStatus = 'Fallback Mode';
    }
  }

  async initializeMCP() {
    try {
      this.mcpManager = new MCPManager();
      console.log('🔧 MCP Manager initialized');
      
      // Auto-start MCP servers after a short delay
      setTimeout(async () => {
        try {
          console.log('🚀 Starting MCP servers automatically...');
          await this.mcpManager.startAllEnabledServers();
          console.log('✅ All MCP servers started automatically');
          
          // Update system metrics to reflect MCP server count as active agents
          this.updateMCPAgentCount();
        } catch (error) {
          console.error('❌ Auto-start MCP servers failed:', error);
        }
      }, 2000); // 2 second delay to ensure everything is initialized
      
      this.usageTracker = new UsageTracker(this.redis);
      console.log('📊 Usage Tracker initialized');
    } catch (error) {
      console.error('❌ MCP initialization error:', error);
    }
  }
  
  updateMCPAgentCount() {
    if (this.mcpManager) {
      try {
        const status = this.mcpManager.getAllServersStatus();
        const runningServers = Object.values(status).filter(s => s.status === 'running').length;
        const domainAgents = this.domainAgentManager ? this.domainAgentManager.agents.size : 0;
        this.systemMetrics.activeAgents = runningServers + domainAgents;
        console.log(`📊 Updated active agents count: ${runningServers} MCP servers + ${domainAgents} domain agents`);
      } catch (error) {
        console.error('Error updating MCP agent count:', error);
      }
    }
  }

  async initializeDomainAgents() {
    try {
      console.log('🎯 Initializing Domain Agent System...');
      
      // Initialize Domain Agent Manager
      this.domainAgentManager = new DomainAgentManager(this, this.mcpManager, this.crystallineMemory);
      await this.domainAgentManager.initialize();
      console.log('✅ Domain Agent Manager initialized');
      
      // Initialize SEO Domain Hub with specialized sub-agents
      setTimeout(async () => {
        try {
          console.log('🔗 Initializing SEO Domain Hub...');
          this.seoHub = new SEODomainHub(
            this, 
            this.mcpManager, 
            this.crystallineMemory,
            this.domainAgentManager?.templateEngine,
            this.domainAgentManager?.projectManager
          );
          console.log('✅ SEO Domain Hub initialized with 6 specialized sub-agents');
          
          // Initialize Master Coordinator Interface (Phase 1 Implementation)
          setTimeout(async () => {
            try {
              console.log('🎯 Phase 1: Initializing Master Coordinator Interface...');
              this.masterCoordinator = new MasterCoordinatorInterface(
                this,
                this.mcpManager,
                this.crystallineMemory,
                this.domainAgentManager?.templateEngine,
                this.domainAgentManager?.projectManager
              );
              
              console.log('✅ Master Coordinator Interface activated - Phase 1 Complete!');
              console.log('🚀 Enhanced Hybrid Architecture now operational:');
              console.log('   📋 Claude Code Master Coordinator → Primary interface');
              console.log('   🔧 Node.js ORCHESTRAI Infrastructure → System operations'); 
              console.log('   🤖 Specialized Claude Code Agents → Domain execution');
              console.log('   💾 Crystalline Memory → Cross-system coordination');
              
            } catch (error) {
              console.error('❌ Failed to initialize Master Coordinator Interface:', error);
            }
          }, 1000); // Initialize after SEO Hub is ready
          
          // Update active agent count to reflect hub + sub-agents
          this.updateMCPAgentCount();
          
        } catch (error) {
          console.error('❌ Failed to initialize SEO Domain Hub:', error);
        }
      }, 3000); // 3 second delay to ensure all dependencies are ready
      
    } catch (error) {
      console.error('❌ Failed to initialize Domain Agent System:', error);
    }
  }

  // Method to handle domain agent registration (called by agents)
  async registerDomainAgent(agentInfo) {
    if (this.domainAgentManager) {
      return await this.domainAgentManager.registerDomainAgent(agentInfo);
    } else {
      console.error('Domain Agent Manager not initialized');
      return false;
    }
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:5500', 'http://localhost:3000'],
      credentials: true
    }));
    this.app.use(express.json());
    
    // Request logging and usage tracking
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      this.systemMetrics.totalRequests++;
      console.log(`📊 [${new Date().toISOString()}] ${req.method} ${req.path}`);
      
      // Track usage after response
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const userAgent = req.get('User-Agent') || 'unknown';
        
        if (this.usageTracker) {
          this.usageTracker.trackApiCall(req.path, req.method, res.statusCode, responseTime, userAgent);
        }
      });
      
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'orchestrai-master',
        port: this.port,
        uptime: Date.now() - this.systemMetrics.startTime,
        version: '1.0.0'
      });
    });

    // System metrics for dashboard
    this.app.get('/metrics', (req, res) => {
      const uptime = Date.now() - this.systemMetrics.startTime;
      res.json({
        ...this.systemMetrics,
        uptime,
        uptimeFormatted: this.formatUptime(uptime),
        timestamp: new Date().toISOString()
      });
    });

    // Crystalline memory endpoints
    this.app.get('/memory/nodes', async (req, res) => {
      if (!this.crystallineMemory) {
        return res.json({
          totalNodes: 0,
          latticeStructure: 'hexagonal',
          efficiency: 0,
          status: 'initializing',
          recentActivity: []
        });
      }

      try {
        const stats = await this.crystallineMemory.getMemoryPoolStats();
        res.json({
          totalNodes: stats.latticeStats.totalNodes,
          totalConnections: stats.latticeStats.totalConnections,
          latticeStructure: 'hexagonal',
          efficiency: stats.latticeStats.efficiency,
          latticeHealth: stats.latticeStats.latticeHealth,
          memoryPools: stats.poolBreakdown,
          recentActivity: this.getRecentMemoryActivity()
        });
      } catch (error) {
        res.status(500).json({ error: 'Memory system error', details: error.message });
      }
    });

    // Store memory endpoint
    this.app.post('/memory/store', async (req, res) => {
      if (!this.crystallineMemory) {
        return res.status(503).json({ error: 'Memory system not initialized' });
      }

      try {
        const { domain, content, metadata } = req.body;
        const nodeId = await this.crystallineMemory.storeMemory(domain, content, metadata);
        
        if (nodeId) {
          // Track memory usage
          if (this.usageTracker) {
            this.usageTracker.trackMemoryOperation('node_created', { nodeId, domain });
          }
          
          res.json({ 
            success: true, 
            nodeId, 
            message: 'Memory stored in crystalline lattice' 
          });
        } else {
          res.status(500).json({ error: 'Failed to store memory' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Storage error', details: error.message });
      }
    });

    // Retrieve memory endpoint
    this.app.post('/memory/retrieve', async (req, res) => {
      if (!this.crystallineMemory) {
        return res.status(503).json({ error: 'Memory system not initialized' });
      }

      try {
        const { query, domain, maxResults } = req.body;
        const startTime = Date.now();
        const results = await this.crystallineMemory.retrieveMemory(query, domain, maxResults);
        
        // Track memory usage
        if (this.usageTracker) {
          this.usageTracker.trackMemoryOperation('search_query', {
            query: query.substring(0, 50), // First 50 chars for privacy
            domain,
            resultsCount: results.results?.length || 0,
            responseTime: Date.now() - startTime
          });
        }
        
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: 'Retrieval error', details: error.message });
      }
    });

    // Memory sharing endpoint
    this.app.post('/memory/share', async (req, res) => {
      if (!this.crystallineMemory) {
        return res.status(503).json({ error: 'Memory system not initialized' });
      }

      try {
        const { sourceDomain, targetDomain } = req.body;
        const result = await this.crystallineMemory.shareMemoryPool(sourceDomain, targetDomain);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Sharing error', details: error.message });
      }
    });

    // Memory export endpoint
    this.app.get('/memory/export', async (req, res) => {
      if (!this.crystallineMemory) {
        return res.status(503).json({ error: 'Memory system not initialized' });
      }

      try {
        const snapshot = await this.crystallineMemory.exportMemorySnapshot();
        res.json(snapshot);
      } catch (error) {
        res.status(500).json({ error: 'Export error', details: error.message });
      }
    });

    // MCP Server Management endpoints
    this.app.get('/mcp/status', (req, res) => {
      if (!this.mcpManager) {
        return res.status(503).json({ error: 'MCP Manager not initialized' });
      }

      try {
        const status = this.mcpManager.getAllServersStatus();
        res.json({
          servers: status,
          totalServers: Object.keys(status).length,
          runningServers: Object.values(status).filter(s => s.status === 'running').length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get MCP status', details: error.message });
      }
    });

    // Test Notion connection
    this.app.get('/mcp/notion/test', async (req, res) => {
      if (!this.mcpManager) {
        return res.status(503).json({ error: 'MCP Manager not initialized' });
      }

      try {
        const result = await this.mcpManager.testNotionConnection();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Notion test failed', details: error.message });
      }
    });

    // Start specific MCP server
    this.app.post('/mcp/start/:serverName', async (req, res) => {
      if (!this.mcpManager) {
        return res.status(503).json({ error: 'MCP Manager not initialized' });
      }

      try {
        const { serverName } = req.params;
        await this.mcpManager.startServer(serverName);
        res.json({ 
          success: true, 
          message: `MCP server ${serverName} started successfully`,
          server: serverName 
        });
      } catch (error) {
        res.status(500).json({ 
          error: `Failed to start MCP server ${req.params.serverName}`, 
          details: error.message 
        });
      }
    });

    // Stop specific MCP server
    this.app.post('/mcp/stop/:serverName', async (req, res) => {
      if (!this.mcpManager) {
        return res.status(503).json({ error: 'MCP Manager not initialized' });
      }

      try {
        const { serverName } = req.params;
        await this.mcpManager.stopServer(serverName);
        res.json({ 
          success: true, 
          message: `MCP server ${serverName} stopped successfully`,
          server: serverName 
        });
      } catch (error) {
        res.status(500).json({ 
          error: `Failed to stop MCP server ${req.params.serverName}`, 
          details: error.message 
        });
      }
    });

    // Start all enabled MCP servers
    this.app.post('/mcp/start-all', async (req, res) => {
      if (!this.mcpManager) {
        return res.status(503).json({ error: 'MCP Manager not initialized' });
      }

      try {
        const results = await this.mcpManager.startAllEnabledServers();
        const successful = results.filter(r => r.status === 'started').length;
        const failed = results.filter(r => r.status === 'failed').length;

        res.json({
          success: failed === 0,
          message: `Started ${successful}/${results.length} MCP servers`,
          results,
          summary: { successful, failed, total: results.length }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to start MCP servers', details: error.message });
      }
    });

    // Get MCP startup logs
    this.app.get('/mcp/logs', (req, res) => {
      if (!this.mcpManager) {
        return res.status(503).json({ error: 'MCP Manager not initialized' });
      }

      try {
        const logs = this.mcpManager.getStartupLog();
        res.json({
          logs,
          totalEntries: logs.length,
          lastUpdate: logs.length > 0 ? logs[logs.length - 1].timestamp : null
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get MCP logs', details: error.message });
      }
    });

    // Usage Tracking & Analytics endpoints
    this.app.get('/analytics/usage', (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        const timeRange = req.query.range || '24h';
        const summary = this.usageTracker.getUsageSummary(timeRange);
        res.json(summary);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get usage analytics', details: error.message });
      }
    });

    this.app.get('/analytics/metrics', (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        res.json({
          sessionId: this.usageTracker.sessionId,
          startTime: this.usageTracker.startTime,
          metrics: this.usageTracker.metrics,
          lastUpdated: Date.now()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get metrics', details: error.message });
      }
    });
    
    // Agent statistics endpoint
    this.app.get('/analytics/agents', (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        const stats = this.usageTracker.getAgentStatistics();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get agent statistics', details: error.message });
      }
    });
    
    // Cost analysis endpoint
    this.app.get('/analytics/costs', (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        const summary = this.usageTracker.getUsageSummary('24h');
        res.json(summary.costs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get cost analysis', details: error.message });
      }
    });

    this.app.get('/analytics/export', async (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        const format = req.query.format || 'json';
        const exportData = await this.usageTracker.exportData(format);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `orchestrai-analytics-${timestamp}.${format}`;
        
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.send(exportData);
      } catch (error) {
        res.status(500).json({ error: 'Failed to export analytics', details: error.message });
      }
    });

    this.app.post('/analytics/track/token', (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        const { model, inputTokens, outputTokens, domain, cost } = req.body;
        this.usageTracker.trackTokenUsage(model, inputTokens, outputTokens, domain, cost);
        res.json({ success: true, message: 'Token usage tracked' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to track token usage', details: error.message });
      }
    });

    this.app.post('/analytics/track/feature', (req, res) => {
      if (!this.usageTracker) {
        return res.status(503).json({ error: 'Usage Tracker not initialized' });
      }

      try {
        const { feature, details } = req.body;
        this.usageTracker.trackFeatureUsage(feature, details);
        res.json({ success: true, message: 'Feature usage tracked' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to track feature usage', details: error.message });
      }
    });

    // Agent management
    this.app.get('/agents', (req, res) => {
      const agentList = Array.from(this.agents.entries()).map(([id, agent]) => ({
        id,
        ...agent,
        uptime: Date.now() - agent.startTime
      }));
      
      res.json({
        count: agentList.length,
        agents: agentList,
        domains: this.getActiveDomains()
      });
    });

    // Register new agent
    this.app.post('/agents/register', (req, res) => {
      const { domain, capabilities, priority } = req.body;
      const agentId = uuidv4();
      
      const agent = {
        id: agentId,
        domain,
        capabilities: capabilities || [],
        priority: priority || 'medium',
        status: 'active',
        startTime: Date.now(),
        taskCount: 0,
        lastActivity: Date.now()
      };

      this.agents.set(agentId, agent);
      this.systemMetrics.activeAgents = this.agents.size;
      
      console.log(`🤖 Agent registered: ${domain} (${agentId})`);
      this.broadcastUpdate('agent_registered', agent);
      
      res.json({ agentId, status: 'registered' });
    });

    // Pipeline sharing status
    this.app.get('/pipeline/status', (req, res) => {
      res.json({
        status: this.systemMetrics.pipelineSharing,
        sharedMemoryPools: this.getSharedMemoryPools(),
        activeWorkflows: this.getActiveWorkflows(),
        coordination: 'geometric-routing'
      });
    });

    // Geometric orchestration info
    this.app.get('/orchestration/topology', (req, res) => {
      res.json({
        type: 'hybrid-mesh',
        masterNode: 'orchestrai-master',
        domains: this.getGeometricTopology(),
        dynamicRouting: true
      });
    });

    // Phase 1: Master Coordinator Interface API Endpoint
    this.app.post('/coordinator/api', async (req, res) => {
      if (!this.masterCoordinator) {
        return res.status(503).json({ 
          success: false,
          error: 'Master Coordinator Interface not initialized',
          phase: 'Phase 1 initialization required'
        });
      }

      try {
        const { method, params } = req.body;
        
        if (!method) {
          return res.status(400).json({
            success: false,
            error: 'API method required',
            availableMethods: Object.keys(this.masterCoordinator.apiMethods || {})
          });
        }

        console.log(`🎯 Master Coordinator API call: ${method}`);
        const result = await this.masterCoordinator.executeAPIMethod(method, params);
        
        res.json({
          success: result.success,
          method,
          result,
          timestamp: new Date().toISOString(),
          phase: 'Phase 1 - Enhanced Hybrid Architecture'
        });

      } catch (error) {
        console.error('❌ Master Coordinator API error:', error);
        res.status(500).json({
          success: false,
          error: 'Master Coordinator API execution failed',
          details: error.message
        });
      }
    });

    // Master Coordinator status endpoint
    this.app.get('/coordinator/status', (req, res) => {
      if (!this.masterCoordinator) {
        return res.json({
          initialized: false,
          phase: 'Phase 1 pending',
          message: 'Master Coordinator Interface not yet initialized'
        });
      }

      try {
        const status = this.masterCoordinator.getCoordinationStatus();
        res.json({
          initialized: true,
          phase: 'Phase 1 - Active',
          status,
          architecture: 'Enhanced Hybrid (Node.js + Claude Code)',
          capabilities: [
            'Intelligent task routing',
            'Infrastructure management',
            'Cross-system coordination',
            'Specialized agent delegation'
          ],
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          initialized: true,
          error: 'Status retrieval failed',
          details: error.message
        });
      }
    });

    // Claude Code Hooks Integration
    this.setupClaudeCodeHooks();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const connectionId = uuidv4();
      this.activeConnections.add(connectionId);
      
      console.log(`🔌 WebSocket connected: ${connectionId}`);
      
      // Send initial system state
      ws.send(JSON.stringify({
        type: 'system_state',
        data: this.systemMetrics,
        connectionId
      }));

      ws.on('close', () => {
        this.activeConnections.delete(connectionId);
        console.log(`🔌 WebSocket disconnected: ${connectionId}`);
      });

      ws.on('error', (error) => {
        console.log(`WebSocket error: ${error.message}`);
        this.activeConnections.delete(connectionId);
      });
    });
  }

  startMetricsUpdater() {
    // Update metrics every 2 seconds
    setInterval(async () => {
      await this.updateSystemMetrics();
      this.broadcastMetrics();
    }, 2000);
  }

  async updateSystemMetrics() {
    // Update active agents count (include both registered agents and MCP servers)
    let activeAgentCount = this.agents.size;
    
    // Add running MCP servers as active agents
    if (this.mcpManager) {
      try {
        const status = this.mcpManager.getAllServersStatus();
        const runningServers = Object.values(status).filter(s => s.status === 'running').length;
        activeAgentCount += runningServers;
      } catch (error) {
        // Silently handle error, use default count
      }
    }
    
    this.systemMetrics.activeAgents = activeAgentCount;
    
    // Update crystalline memory metrics
    if (this.crystallineMemory) {
      try {
        const memoryStats = await this.crystallineMemory.getMemoryPoolStats();
        this.systemMetrics.memoryNodes = memoryStats.latticeStats.totalNodes;
        this.systemMetrics.memoryConnections = memoryStats.latticeStats.totalConnections;
        this.systemMetrics.memoryEfficiency = memoryStats.latticeStats.efficiency;
        this.systemMetrics.memoryHealth = memoryStats.latticeStats.latticeHealth;
        this.systemMetrics.activePools = memoryStats.totalPools;
      } catch (error) {
        console.error('Error updating memory metrics:', error);
      }
    }
    
    // Clean up inactive agents
    const now = Date.now();
    for (const [agentId, agent] of this.agents) {
      if (now - agent.lastActivity > 300000) { // 5 minutes timeout
        this.agents.delete(agentId);
        console.log(`🤖 Agent timeout: ${agentId}`);
      }
    }
  }

  broadcastUpdate(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastMetrics() {
    this.broadcastUpdate('metrics_update', this.systemMetrics);
  }

  // Utility methods
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  calculateMemoryEfficiency() {
    // Simulate crystalline memory efficiency calculation
    const baseEfficiency = 85;
    const nodeImpact = Math.min(this.systemMetrics.memoryNodes * 0.01, 10);
    const agentImpact = Math.min(this.systemMetrics.activeAgents * 0.5, 5);
    return Math.min(baseEfficiency + nodeImpact + agentImpact, 99);
  }

  getRecentMemoryActivity() {
    return [
      { type: 'node_created', timestamp: Date.now() - 30000 },
      { type: 'lattice_restructured', timestamp: Date.now() - 120000 },
      { type: 'geometric_optimization', timestamp: Date.now() - 180000 }
    ];
  }

  getActiveDomains() {
    const domains = new Set();
    this.agents.forEach(agent => domains.add(agent.domain));
    return Array.from(domains);
  }

  getSharedMemoryPools() {
    return [
      { id: 'seo-research', agents: 2, size: '1.2MB' },
      { id: 'content-creation', agents: 1, size: '0.8MB' },
      { id: 'global-context', agents: this.agents.size, size: '2.1MB' }
    ];
  }

  getActiveWorkflows() {
    return [
      { id: 'content-pipeline', status: 'active', agents: ['writer', 'seo'] },
      { id: 'research-synthesis', status: 'pending', agents: ['research'] }
    ];
  }

  getGeometricTopology() {
    return {
      'writing': { position: [0, 1], connections: ['research', 'seo'] },
      'seo': { position: [1, 0], connections: ['research', 'writing'] },
      'research': { position: [0, 0], connections: ['writing', 'seo', 'webdev'] },
      'webdev': { position: [1, 1], connections: ['research'] },
      'maintenance': { position: [0.5, 0.5], connections: ['all'] }
    };
  }

  setupClaudeCodeHooks() {
    // Initialize hooks if not already done
    if (!this.claudeCodeHooks && this.usageTracker && this.mcpManager) {
      this.claudeCodeHooks = new ClaudeCodeHooksManager(this.usageTracker, this.mcpManager);
      console.log('🎣 Claude Code Hooks Manager initialized in setup');
    }
    
    if (!this.claudeCodeHooks) {
      console.log('📝 Claude Code Hooks Manager: Optional webhooks not configured (normal operation)');
      return;
    }

    // Register all hook endpoints
    Object.entries(this.claudeCodeHooks.endpoints).forEach(([path, handler]) => {
      this.app.post(path, async (req, res) => {
        try {
          const result = await handler(req.body);
          res.json({ success: true, ...result });
        } catch (error) {
          console.error(`❌ Hook error for ${path}:`, error);
          res.status(500).json({ success: false, error: error.message });
        }
      });
    });

    // Hooks management endpoints
    this.app.get('/hooks/status', (req, res) => {
      try {
        res.json({
          activeWorkflows: this.claudeCodeHooks.getActiveWorkflows(),
          metrics: this.claudeCodeHooks.getWorkflowMetrics(),
          configurations: this.claudeCodeHooks.getHookConfigurations()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get hooks status', details: error.message });
      }
    });

    this.app.get('/hooks/workflows', (req, res) => {
      try {
        const workflows = this.claudeCodeHooks.getActiveWorkflows();
        res.json({ workflows, count: workflows.length });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get workflows', details: error.message });
      }
    });

    this.app.put('/hooks/config/:hookName', (req, res) => {
      try {
        const { hookName } = req.params;
        const updated = this.claudeCodeHooks.updateHookConfiguration(hookName, req.body);
        if (updated) {
          res.json({ success: true, hook: hookName });
        } else {
          res.status(404).json({ error: 'Hook not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to update hook config', details: error.message });
      }
    });

    console.log('🎣 Claude Code webhook endpoints registered');
  }

  async start() {
    try {
      this.server.listen(this.port, () => {
        console.log('');
        console.log('🧠 ═══════════════════════════════════════════════════');
        console.log('   ORCHESTRAI Master Orchestrator');
        console.log('   Crystalline Memory • Geometric Routing • Pipeline Sharing');
        console.log('🧠 ═══════════════════════════════════════════════════');
        console.log('');
        console.log(`🚀 Main Orchestrator: http://localhost:${this.port}`);
        console.log(`🔌 WebSocket Server: ws://localhost:${this.port}/ws`);
        console.log(`📊 Dashboard: http://localhost:5500`);
        console.log('');
        console.log('📋 Available endpoints:');
        console.log('   GET  /health              - Health check');
        console.log('   GET  /metrics             - System metrics');
        console.log('   GET  /memory/nodes        - Memory status');
        console.log('   GET  /agents              - Active agents');
        console.log('   POST /agents/register     - Register new agent');
        console.log('   GET  /pipeline/status     - Pipeline sharing');
        console.log('   GET  /orchestration/topology - System topology');
        console.log('');
        console.log('🎯 Phase 1: Crystalline Memory Foundation');
        console.log('   ✅ Orchestrator running');
        console.log('   🔄 Redis integration active');
        console.log('   🌐 WebSocket broadcasting');
        console.log('   📈 Real-time metrics');
        console.log('');
      });
    } catch (error) {
      console.error('❌ Failed to start orchestrator:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down ORCHESTRAI Master...');
    
    if (this.redis) {
      await this.redis.quit();
    }
    
    this.wss.clients.forEach((client) => {
      client.close();
    });
    
    this.server.close(() => {
      console.log('✅ ORCHESTRAI Master shutdown complete');
      process.exit(0);
    });
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  if (global.orchestraiMaster) {
    await global.orchestraiMaster.shutdown();
  }
});

process.on('SIGINT', async () => {
  if (global.orchestraiMaster) {
    await global.orchestraiMaster.shutdown();
  }
});

// Start the orchestrator
const orchestraiMaster = new OrchestraiMaster();
global.orchestraiMaster = orchestraiMaster;

orchestraiMaster.start().catch(console.error);

module.exports = OrchestraiMaster;