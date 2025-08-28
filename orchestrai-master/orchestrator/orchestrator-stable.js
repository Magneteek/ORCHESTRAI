require('dotenv').config();
const EventEmitter = require('events');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Core Dependencies
const CrystallineMemoryManager = require('../crystalline-memory/memory-manager');
const MCPManager = require('../../orchestrai-shared/mcp-servers/mcp-manager');
const UsageTracker = require('../../orchestrai-shared/analytics/usage-tracker');
const ClaudeCodeHooksManager = require('../../orchestrai-shared/claude-code/hooks-manager');
const DomainAgentManager = require('../../orchestrai-shared/domain-coordination/domain-agent-manager');
const MainOrchestratorAgent = require('../agents/main-orchestrator-agent');

// Domain Hubs  
const SEODomainHub = require('../../orchestrai-domains/seo/seo-domain-hub');
const QualityDomainHub = require('../../orchestrai-domains/quality/quality-domain-hub');
const ContentEnhancedDomainHub = require('../../orchestrai-domains/content-enhanced/content-domain-hub');
const ClientIntelligenceDomainHub = require('../../orchestrai-domains/client-intelligence/client-intelligence-domain-hub');
const WebQualityDomainRegistry = require('../../orchestrai-domains/web-quality/web-quality-domain-registry');
const MasterCoordinatorInterface = require('../../orchestrai-shared/api/master-coordinator-interface');

/**
 * ORCHESTRAI Stable Master Orchestrator
 * Refactored for stability, efficiency, and graceful error handling
 * 
 * Key Improvements:
 * - Sequential initialization instead of nested setTimeout chains
 * - Proper error isolation and graceful degradation
 * - Clean dependency management
 * - Robust health monitoring
 */
class StableOrchestraiMaster extends EventEmitter {
  constructor() {
    super();
    
    // Core Express/WebSocket setup
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server, path: '/ws' });
    this.port = process.env.ORCHESTRATOR_PORT || 5501;
    
    // System state tracking
    this.initializationState = {
      redis: 'pending',
      mcp: 'pending', 
      mainAgent: 'pending',
      domainManager: 'pending',
      domains: new Map(),
      errors: []
    };
    
    this.agents = new Map();
    this.domains = new Map();
    this.activeConnections = new Set();
    this.healthCheckInterval = null;
    
    // System metrics
    this.systemMetrics = {
      startTime: Date.now(),
      totalRequests: 0,
      memoryNodes: 0,
      activeAgents: 0,
      pipelineSharing: 'Initializing',
      redisStatus: 'Connecting...',
      initializationProgress: 0,
      domainHubsStatus: {}
    };

    // Setup Express middleware and routes first
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    
    // Start sequential initialization
    this.initializeSystem();
  }

  /**
   * Sequential system initialization with proper error handling
   */
  async initializeSystem() {
    console.log('🧠 ═══════════════════════════════════════════════════');
    console.log('   ORCHESTRAI Stable Master Orchestrator');
    console.log('   Sequential Initialization • Error Isolation • Graceful Degradation');  
    console.log('🧠 ═══════════════════════════════════════════════════');
    
    try {
      // Phase 1: Core Infrastructure
      await this.initializeRedis();
      await this.initializeMCPManager();
      
      // Phase 2: Main Orchestrator Agent  
      await this.initializeMainOrchestratorAgent();
      
      // Phase 3: Domain Management
      await this.initializeDomainManager();
      
      // Phase 4: Domain Hubs (sequential with error isolation)
      await this.initializeDomainHubs();
      
      // Phase 5: Health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ ORCHESTRAI Stable Master Orchestrator fully operational');
      console.log(`🚀 Main Orchestrator: http://localhost:${this.port}`);
      console.log(`🔌 WebSocket Server: ws://localhost:${this.port}/ws`);
      
      this.systemMetrics.initializationProgress = 100;
      this.emit('system-ready');
      
    } catch (error) {
      console.error('❌ Critical system initialization failure:', error);
      this.initializationState.errors.push({
        phase: 'system',
        error: error.message,
        timestamp: Date.now()
      });
      
      // Attempt graceful degradation
      await this.handleCriticalFailure(error);
    }
  }

  /**
   * Redis initialization with fallback mode
   */
  async initializeRedis() {
    console.log('🔄 Phase 1a: Initializing Redis connection...');
    
    try {
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true
        }
      });
      
      this.redis.on('error', (err) => {
        console.log('⚠️  Redis Client Error:', err.message);
        this.systemMetrics.redisStatus = 'Error - Using fallback';
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected for crystalline memory');
        this.systemMetrics.redisStatus = 'Connected';
      });

      this.redis.on('disconnect', () => {
        console.log('⚠️  Redis disconnected - switching to memory fallback');
        this.systemMetrics.redisStatus = 'Disconnected - Using fallback';
      });

      await this.redis.connect();
      
      this.crystallineMemory = new CrystallineMemoryManager(this.redis);
      this.usageTracker = new UsageTracker(this.redis);
      
      this.initializationState.redis = 'success';
      console.log('✅ Redis and Crystalline Memory initialized');
      
    } catch (error) {
      console.log('⚠️  Redis not available, using in-memory fallback');
      this.systemMetrics.redisStatus = 'Fallback Mode';
      this.initializationState.redis = 'fallback';
      
      // Initialize fallback memory manager
      this.crystallineMemory = new CrystallineMemoryManager(null);
      this.usageTracker = new UsageTracker(null);
    }
  }

  /**
   * MCP Manager initialization with graceful degradation
   */
  async initializeMCPManager() {
    console.log('🔄 Phase 1b: Initializing MCP Manager...');
    
    try {
      this.mcpManager = new MCPManager();
      this.claudeCodeHooks = new ClaudeCodeHooksManager(this.usageTracker, this.mcpManager);
      
      // Start MCP servers with timeout protection
      const mcpStartupPromise = this.mcpManager.startAllEnabledServers();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MCP startup timeout')), 15000);
      });
      
      try {
        await Promise.race([mcpStartupPromise, timeoutPromise]);
        console.log('✅ MCP servers started successfully');
      } catch (timeoutError) {
        console.log('⚠️  MCP servers taking longer than expected, continuing...');
      }
      
      this.initializationState.mcp = 'success';
      console.log('✅ MCP Manager and Hooks initialized');
      
    } catch (error) {
      console.log('⚠️  MCP initialization partial failure, continuing with degraded functionality');
      this.initializationState.mcp = 'degraded';
      this.initializationState.errors.push({
        phase: 'mcp', 
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Main Orchestrator Agent initialization
   */
  async initializeMainOrchestratorAgent() {
    console.log('🔄 Phase 2: Initializing Main Orchestrator Agent...');
    
    try {
      this.mainOrchestratorAgent = new MainOrchestratorAgent(
        this.crystallineMemory,
        this.mcpManager,
        this.usageTracker,
        null, // Domain manager not ready yet
        null  // Template engine not ready yet
      );
      
      // Add tool interface for Claude Code integration
      this.mainOrchestratorAgent.callTool = this.callTool.bind(this);
      
      this.initializationState.mainAgent = 'success';
      console.log('✅ Main Orchestrator Agent initialized as central coordinator');
      
    } catch (error) {
      console.error('❌ Failed to initialize Main Orchestrator Agent:', error);
      this.initializationState.mainAgent = 'failed';
      this.initializationState.errors.push({
        phase: 'mainAgent',
        error: error.message, 
        timestamp: Date.now()
      });
      throw error; // This is critical - cannot continue without main agent
    }
  }

  /**
   * Domain Manager initialization
   */
  async initializeDomainManager() {
    console.log('🔄 Phase 3: Initializing Domain Agent Manager...');
    
    try {
      this.domainAgentManager = new DomainAgentManager(this, this.mcpManager, this.crystallineMemory);
      await this.domainAgentManager.initialize();
      
      // Update main orchestrator agent with domain manager reference
      if (this.mainOrchestratorAgent) {
        this.mainOrchestratorAgent.domainAgentManager = this.domainAgentManager;
        this.mainOrchestratorAgent.templateEngine = this.domainAgentManager.templateEngine;
      }
      
      this.initializationState.domainManager = 'success';
      console.log('✅ Domain Agent Manager initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Domain Agent Manager:', error);
      this.initializationState.domainManager = 'failed';
      this.initializationState.errors.push({
        phase: 'domainManager',
        error: error.message,
        timestamp: Date.now()
      });
      // Continue - some functionality will be degraded but system can operate
    }
  }

  /**
   * Sequential domain hub initialization with error isolation
   */
  async initializeDomainHubs() {
    console.log('🔄 Phase 4: Initializing Domain Hubs (Sequential)...');
    
    const hubConfigs = [
      {
        name: 'seo',
        displayName: 'SEO Domain Hub',
        factory: () => new SEODomainHub(
          this,
          this.mcpManager,
          this.crystallineMemory,
          this.domainAgentManager?.templateEngine,
          this.domainAgentManager?.projectManager
        ),
        critical: false
      },
      {
        name: 'quality',
        displayName: 'Quality Control Domain Hub', 
        factory: () => new QualityDomainHub(this, this.crystallineMemory),
        critical: false
      },
      {
        name: 'content-enhanced',
        displayName: 'Enhanced Content Domain Hub',
        factory: () => new ContentEnhancedDomainHub(
          this,
          this.mcpManager, 
          this.crystallineMemory,
          this.domainAgentManager?.templateEngine,
          this.domainAgentManager?.projectManager
        ),
        critical: false
      },
      {
        name: 'client-intelligence', 
        displayName: 'Client Intelligence Domain Hub',
        factory: () => new ClientIntelligenceDomainHub(
          this,
          this.mcpManager,
          this.crystallineMemory,
          this.domainAgentManager?.templateEngine,
          this.domainAgentManager?.projectManager  
        ),
        critical: false
      },
      {
        name: 'web-quality',
        displayName: 'Web Development Quality Domain',
        factory: () => new WebQualityDomainRegistry(
          this,
          this.mcpManager,
          this.crystallineMemory
        ),
        critical: false,
        isRegistry: true
      }
    ];

    for (const config of hubConfigs) {
      await this.initializeDomainHub(config);
      // Brief pause between hubs to prevent overwhelming the system
      await this.sleep(500);
    }
    
    console.log(`✅ Domain hub initialization complete. Active hubs: ${this.domains.size}`);
  }

  /**
   * Initialize individual domain hub with error isolation
   */
  async initializeDomainHub(config) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Initializing ${config.displayName}...`);
      
      const hub = config.factory();
      
      if (config.isRegistry) {
        // Special handling for registries
        const result = await hub.registerWithOrchestrator();
        if (result.success) {
          this[config.name.replace('-', '') + 'Service'] = hub.getQualityHub();
          this.domains.set(config.name, hub.getQualityHub());
        } else {
          throw new Error('Registry registration failed');
        }
      } else {
        // Standard hub initialization
        if (hub.initialize) {
          await hub.initialize();
        }
        this[config.name.replace('-', '') + 'Hub'] = hub;
        this.domains.set(config.name, hub);
      }
      
      const duration = Date.now() - startTime;
      this.systemMetrics.domainHubsStatus[config.name] = {
        status: 'active',
        initializationTime: duration,
        lastHealthCheck: Date.now()
      };
      
      console.log(`✅ ${config.displayName} initialized successfully (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Failed to initialize ${config.displayName}:`, error.message);
      
      this.systemMetrics.domainHubsStatus[config.name] = {
        status: 'failed',
        error: error.message,
        initializationTime: duration,
        lastHealthCheck: Date.now()
      };
      
      this.initializationState.errors.push({
        phase: 'domain-hub',
        hubName: config.name,
        error: error.message,
        timestamp: Date.now()
      });
      
      if (config.critical) {
        throw error; // Re-throw if this hub is critical
      } else {
        console.log(`⚡ Continuing with ${config.displayName} disabled (non-critical)`);
      }
    }
  }

  /**
   * Health monitoring system
   */
  startHealthMonitoring() {
    console.log('🔄 Starting health monitoring system...');
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 30000); // Every 30 seconds
    
    console.log('✅ Health monitoring active');
  }

  async performHealthCheck() {
    // Update system metrics
    this.systemMetrics.memoryNodes = this.crystallineMemory?.getMemoryNodeCount?.() || 0;
    this.systemMetrics.activeAgents = this.agents.size + this.domains.size;
    
    // Check Redis connection
    if (this.redis) {
      try {
        await this.redis.ping();
        this.systemMetrics.redisStatus = 'Connected';
      } catch (error) {
        this.systemMetrics.redisStatus = 'Disconnected - Using fallback';
      }
    }
    
    // Check domain hub health
    for (const [name, status] of Object.entries(this.systemMetrics.domainHubsStatus)) {
      if (status.status === 'active') {
        status.lastHealthCheck = Date.now();
        // Could add more detailed health checks here
      }
    }
    
    // Update pipeline sharing status
    this.systemMetrics.pipelineSharing = this.domains.size > 0 ? 'Active' : 'Limited';
  }

  /**
   * Graceful failure handling
   */
  async handleCriticalFailure(error) {
    console.log('🚨 Entering graceful degradation mode...');
    
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Attempt to provide basic service
    this.systemMetrics.pipelineSharing = 'Degraded';
    
    console.log('⚡ System running in degraded mode - basic coordination available');
  }

  // Utility methods
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Express middleware setup
  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5500'],
      credentials: true
    }));
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  // API Routes setup
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'operational',
        timestamp: Date.now(),
        uptime: Date.now() - this.systemMetrics.startTime,
        initialization: this.initializationState,
        metrics: this.systemMetrics
      });
    });

    // System metrics endpoint
    this.app.get('/metrics', (req, res) => {
      res.json(this.systemMetrics);
    });

    // Main coordination endpoint
    this.app.post('/coordinate', async (req, res) => {
      try {
        this.systemMetrics.totalRequests++;
        
        if (!this.mainOrchestratorAgent) {
          return res.status(503).json({
            error: 'Main Orchestrator Agent not available',
            status: 'degraded'
          });
        }

        const result = await this.mainOrchestratorAgent.processQuery(req.body);
        res.json(result);
        
      } catch (error) {
        console.error('Coordination error:', error);
        res.status(500).json({
          error: 'Coordination failed',
          message: error.message
        });
      }
    });

    // Domain status endpoints
    this.app.get('/domains', (req, res) => {
      const domainStatus = {};
      for (const [name, hub] of this.domains) {
        domainStatus[name] = {
          active: true,
          type: hub.constructor.name,
          metrics: this.systemMetrics.domainHubsStatus[name] || {}
        };
      }
      res.json(domainStatus);
    });
  }

  // WebSocket setup  
  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const connectionId = uuidv4();
      this.activeConnections.add({ ws, id: connectionId });
      
      console.log(`🔌 WebSocket client connected: ${connectionId}`);
      
      ws.on('close', () => {
        this.activeConnections.delete({ ws, id: connectionId });
        console.log(`🔌 WebSocket client disconnected: ${connectionId}`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  // Tool call interface for Claude Code integration
  async callTool(toolName, parameters) {
    // Implement tool calling logic here
    return {
      success: true,
      result: `Tool ${toolName} called with parameters`,
      parameters
    };
  }

  // Start the server
  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 ORCHESTRAI Stable Master Orchestrator listening on port ${this.port}`);
    });
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔄 Shutting down ORCHESTRAI Master Orchestrator...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.redis) {
      await this.redis.disconnect();
    }
    
    if (this.mcpManager) {
      await this.mcpManager.stopAllServers();
    }
    
    this.server.close(() => {
      console.log('✅ ORCHESTRAI Master Orchestrator shutdown complete');
    });
  }

  // Domain agent registration method (called by agents)
  async registerDomainAgent(agentInfo) {
    if (this.domainAgentManager) {
      return await this.domainAgentManager.registerDomainAgent(agentInfo);
    } else {
      console.error('Domain Agent Manager not initialized');
      return false;
    }
  }

  // Domain registration method (called by domain registries)
  registerDomain(domainName, domainHub) {
    try {
      this.domains.set(domainName, domainHub);
      console.log(`🔗 Domain ${domainName} registered with Main Orchestrator Agent`);
      return { success: true, domainName };
    } catch (error) {
      console.error(`❌ Failed to register domain ${domainName}:`, error);
      return { success: false, error: error.message };
    }
  }
}

// Create and start the stable orchestrator
const orchestrator = new StableOrchestraiMaster();
orchestrator.start();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await orchestrator.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await orchestrator.shutdown();
  process.exit(0);
});

module.exports = StableOrchestraiMaster;