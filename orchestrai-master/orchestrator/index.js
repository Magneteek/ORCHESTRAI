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
const TTSHooksIntegration = require('../../orchestrai-shared/notifications/tts-hooks-integration');
const DomainAgentManager = require('../../orchestrai-shared/domain-coordination/domain-agent-manager');

// Self-Iterating Evaluation Loop Components
const PerformanceMemorySchema = require('../../orchestrai-shared/memory/performance-memory-schema');
const HookMemoryBridge = require('../../orchestrai-shared/memory/hook-memory-bridge');
const LearningAlgorithmFoundation = require('../../orchestrai-shared/learning/learning-algorithm-foundation');
const DynamicAgentSelection = require('../../orchestrai-shared/orchestration/dynamic-agent-selection');
const MainOrchestratorAgent = require('../agents/main-orchestrator-agent');
const SEODomainHub = require('../../orchestrai-domains/seo/seo-domain-hub');
const QualityDomainHub = require('../../orchestrai-domains/quality/quality-domain-hub');
const ContentEnhancedDomainHub = require('../../orchestrai-domains/content-enhanced/content-domain-hub');
const ClientIntelligenceDomainHub = require('../../orchestrai-domains/client-intelligence/client-intelligence-domain-hub');
const WebQualityDomainRegistry = require('../../orchestrai-domains/web-quality/web-quality-domain-registry');
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
    this.domains = new Map();
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

    // Main Orchestrator Agent - will be initialized after Redis connection
    this.mainOrchestratorAgent = null;
    
    // Self-Iterating Evaluation Loop Components - will be initialized after Redis
    this.performanceMemorySchema = null;
    this.hookMemoryBridge = null;
    this.learningFoundation = null;
    this.dynamicAgentSelection = null;
    this.selfLearningActive = false;

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
        
        // Initialize TTS Notifications
        this.initializeTTSService();
        
        // Initialize Self-Iterating Evaluation Loop System
        this.initializeSelfLearningSystem();

        // Initialize Main Orchestrator Agent as central coordinator
        this.initializeMainOrchestratorAgent();
        
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

  async initializeSelfLearningSystem() {
    try {
      console.log('🧠 Initializing Self-Iterating Evaluation Loop System...');
      
      // Initialize Performance Memory Schema
      this.performanceMemorySchema = new PerformanceMemorySchema(
        this.crystallineMemory,
        this.claudeCodeHooks
      );
      console.log('📊 Performance Memory Schema initialized');
      
      // Initialize Hook-Memory Bridge
      this.hookMemoryBridge = new HookMemoryBridge(
        this.crystallineMemory,
        this.claudeCodeHooks
      );
      console.log('🌉 Hook-Memory Bridge initialized');
      
      // Initialize Learning Algorithm Foundation
      this.learningFoundation = new LearningAlgorithmFoundation(
        this.performanceMemorySchema,
        this.crystallineMemory
      );
      console.log('🎓 Learning Algorithm Foundation initialized');
      
      // Initialize Dynamic Agent Selection (will be connected to domain manager later)
      this.dynamicAgentSelection = new DynamicAgentSelection(
        this.learningFoundation,
        this.performanceMemorySchema,
        null // Will be set after domain manager initialization
      );
      console.log('🎯 Dynamic Agent Selection initialized');
      
      // Mark self-learning as active
      this.selfLearningActive = true;
      
      console.log('✅ Self-Iterating Evaluation Loop System fully initialized');
      console.log('🔄 Adaptive agent selection: ACTIVE');
      console.log('📈 Performance pattern learning: ACTIVE');
      console.log('⚡ Hook-to-memory integration: ACTIVE');
      console.log('🧠 Failure pattern recognition: ACTIVE');
      
    } catch (error) {
      console.error('❌ Failed to initialize Self-Learning System:', error);
      this.selfLearningActive = false;
    }
  }

  async initializeTTSService() {
    try {
      console.log('🔊 Initializing Text-to-Speech Notification Service...');
      
      // Get TTS settings from environment or defaults
      const ttsOptions = {
        enabled: process.env.TTS_ENABLED !== 'false', // Default enabled
        voice: process.env.TTS_VOICE || 'Alex',
        speed: parseFloat(process.env.TTS_SPEED || '1.2'),
        volume: parseFloat(process.env.TTS_VOLUME || '0.7')
      };
      
      // Initialize TTS Integration with hooks
      this.ttsIntegration = new TTSHooksIntegration(
        this.claudeCodeHooks,
        this,
        ttsOptions
      );
      
      console.log('✅ TTS Notification Service initialized');
      console.log(`🔊 Voice: ${ttsOptions.voice}, Speed: ${ttsOptions.speed}, Volume: ${ttsOptions.volume}`);
      console.log('🔊 Agent notifications: ENABLED');
      console.log('🔊 System status announcements: ENABLED');
      console.log('🔊 Error notifications: ENABLED');
      
      // Test TTS if enabled
      if (ttsOptions.enabled) {
        setTimeout(() => {
          this.ttsIntegration.getTTSService().announce(
            'ORCHESTRAI Text-to-Speech notifications are now active',
            { priority: 'high' }
          );
        }, 3000); // 3 second delay to let system stabilize
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize TTS Service:', error);
      console.log('🔇 TTS notifications disabled due to initialization error');
    }
  }

  async initializeMainOrchestratorAgent() {
    try {
      console.log('🎯 Initializing Main Orchestrator Agent as central coordinator...');
      
      this.mainOrchestratorAgent = new MainOrchestratorAgent(
        this,
        this.mcpManager,
        this.crystallineMemory,
        this.domainAgentManager?.templateEngine
      );
      
      // Add Tool interface for Claude Code integration
      this.mainOrchestratorAgent.callTool = this.callTool.bind(this);
      
      console.log('✅ Main Orchestrator Agent initialized - Now serving as central query coordinator');
      console.log('🧠 Intelligent Query Analysis: Pattern matching for domain routing');
      console.log('🎯 Coordination Strategies: Single, multi-domain, and hybrid execution patterns');
      console.log('⚡ Pipeline Management: Sequential, parallel, and quality-gated workflows');
      
    } catch (error) {
      console.error('❌ Failed to initialize Main Orchestrator Agent:', error);
    }
  }

  async initializeDomainAgents() {
    try {
      console.log('🎯 Initializing Domain Agent System...');
      
      // Initialize Domain Agent Manager
      this.domainAgentManager = new DomainAgentManager(this, this.mcpManager, this.crystallineMemory);
      await this.domainAgentManager.initialize();
      console.log('✅ Domain Agent Manager initialized');
      
      // Connect Dynamic Agent Selection to Domain Manager
      if (this.dynamicAgentSelection && this.selfLearningActive) {
        this.dynamicAgentSelection.domainAgentManager = this.domainAgentManager;
        await this.dynamicAgentSelection.discoverAvailableAgents();
        console.log('🔗 Self-Learning System connected to Domain Agent Manager');
      }
      
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
          
          // Register SEO domain with Main Orchestrator Agent
          if (this.mainOrchestratorAgent) {
            this.domains.set('seo', this.seoHub);
            console.log('🔗 SEO Domain registered with Main Orchestrator Agent');
          }
          
          // Initialize Quality Control Domain Hub (Phase 3A Implementation)
          setTimeout(async () => {
            try {
              console.log('🔍 Initializing Quality Control Domain Hub...');
              this.qualityHub = new QualityDomainHub(
                this,
                this.crystallineMemory
              );
              console.log('✅ Quality Control Domain Hub initialized with 12 specialized quality agents');
              
              // Register Quality domain with Main Orchestrator Agent
              if (this.mainOrchestratorAgent) {
                this.domains.set('quality', this.qualityHub);
                console.log('🔗 Quality Domain registered with Main Orchestrator Agent');
              }
              
            } catch (error) {
              console.error('❌ Failed to initialize Quality Control Domain Hub:', error);
            }
          }, 2000);
          
          // Initialize Enhanced Content Domain Hub (Phase 3B Implementation)
          setTimeout(async () => {
            try {
              console.log('📝 Initializing Enhanced Content Domain Hub...');
              this.contentEnhancedHub = new ContentEnhancedDomainHub(
                this, 
                this.mcpManager, 
                this.crystallineMemory,
                this.domainAgentManager?.templateEngine,
                this.domainAgentManager?.projectManager
              );
              await this.contentEnhancedHub.initialize();
              
              // Register Content Enhanced Service
              this.contentEnhancedService = this.contentEnhancedHub;
              console.log('🔗 Content Enhanced Service registered and integrated with Quality Control');
              
            } catch (error) {
              console.error('❌ Failed to initialize Enhanced Content Domain Hub:', error);
            }
          }, 2500);
          
          // Initialize Client Intelligence Domain Hub (Priority 1 Implementation)
          setTimeout(async () => {
            try {
              console.log('🧠 Initializing Client Intelligence Domain Hub...');
              this.clientIntelligenceHub = new ClientIntelligenceDomainHub(
                this,
                this.mcpManager,
                this.crystallineMemory,
                this.domainAgentManager?.templateEngine,
                this.domainAgentManager?.projectManager
              );
              await this.clientIntelligenceHub.initialize();
              
              // Register Client Intelligence Service
              this.clientIntelligenceService = this.clientIntelligenceHub;
              console.log('🔗 Client Intelligence Service registered and integrated');
              
            } catch (error) {
              console.error('❌ Failed to initialize Client Intelligence Domain Hub:', error);
            }
          }, 3000);
          
          // Initialize Web Development Quality Domain (Phase 2 Implementation) 
          setTimeout(async () => {
            try {
              console.log('🌐 Phase 2: Initializing Web Development Quality Domain...');
              this.webQualityDomainRegistry = new WebQualityDomainRegistry(
                this,
                this.mcpManager,
                this.crystallineMemory
              );
              
              const registrationResult = await this.webQualityDomainRegistry.registerWithOrchestrator();
              
              if (registrationResult.success) {
                // Register Web Quality Service for API access
                this.webQualityService = this.webQualityDomainRegistry.getQualityHub();
                this.webQualityMetrics = this.webQualityDomainRegistry.getMetricsManager();
                
                // Register Web Quality domain with Main Orchestrator Agent
                if (this.mainOrchestratorAgent) {
                  this.domains.set('web-quality', this.webQualityService);
                  console.log('🔗 Web Quality Domain registered with Main Orchestrator Agent');
                }
                
                console.log('✅ Web Development Quality Domain registered successfully!');
                console.log('🎯 Phase 2 Complete: Advanced MCP Integration & Cutting-Edge Features');
                console.log('   🌐 Web Quality Hub → 8 specialized agents across 3 sub-hubs');
                console.log('   🔧 Browser MCP Integration → Visual regression & accessibility testing');
                console.log('   📊 Quality Metrics Manager → Comprehensive reporting & analytics');
                console.log('   🚀 Phase-to-Phase Quality Gates → UX → Wireframe → Design → Development');
                console.log('   💎 Crystalline Memory Integration → Cross-domain quality intelligence');
              }
              
            } catch (error) {
              console.error('❌ Failed to initialize Web Development Quality Domain:', error);
            }
          }, 3500);
          
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

  // Tool interface for Claude Code integration
  async callTool(toolName, params) {
    console.log(`🛠️ Tool call: ${toolName}`);
    
    // This would integrate with Claude Code's tool system
    // For now, return a simulated response
    return {
      success: true,
      tool: toolName,
      params,
      result: `Tool ${toolName} executed with params`,
      timestamp: new Date().toISOString()
    };
  }

  // Method to register quality control service with orchestrator
  async registerQualityService(qualityHub) {
    console.log('🔍 Registering Quality Control Service with orchestrator...');
    
    this.qualityService = qualityHub;
    
    // Integrate quality checking with existing domain workflows
    if (this.seoHub) {
      await this.integrateQualityWithSEO();
    }
    
    console.log('✅ Quality Control Service registered and integrated');
  }

  // Integrate quality checking with SEO domain workflows
  async integrateQualityWithSEO() {
    console.log('🔗 Integrating quality control with SEO domain workflows...');
    
    try {
      // Set up quality validation for SEO tasks
      if (this.seoHub && this.qualityService) {
        // Hook into SEO task completion to trigger quality validation
        this.seoHub.on('taskCompleted', async (taskResult) => {
          console.log(`🔍 Triggering quality validation for SEO task: ${taskResult.type}`);
          
          try {
            const qualityResult = await this.qualityService.performQualityCheck(
              taskResult,
              taskResult.data,
              'seo-domain'
            );
            
            if (!qualityResult.passed) {
              console.log(`⚠️  Quality check failed for SEO task: ${taskResult.id} (score: ${qualityResult.score})`);
              
              // Emit quality failure event for retry handling
              this.emit('qualityCheckFailed', {
                originalTask: taskResult,
                qualityResult,
                timestamp: new Date().toISOString()
              });
            } else {
              console.log(`✅ Quality check passed for SEO task: ${taskResult.id} (score: ${qualityResult.score})`);
            }
            
          } catch (qualityError) {
            console.error('Error during quality validation:', qualityError);
          }
        });
        
        console.log('✅ Quality integration with SEO domain established');
      }
      
    } catch (error) {
      console.error('Error integrating quality with SEO domain:', error);
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

    // Quality Control endpoints
    this.app.get('/quality/status', (req, res) => {
      if (!this.qualityService) {
        return res.status(503).json({ error: 'Quality Control Service not available' });
      }
      
      res.json({
        status: 'active',
        metrics: this.qualityService.getQualityMetrics(),
        qualityPools: Array.from(this.qualityService.qualityMemoryPools.keys()),
        totalAgents: this.qualityService.subAgents.size,
        timestamp: Date.now()
      });
    });

    this.app.post('/quality/validate', async (req, res) => {
      if (!this.qualityService) {
        return res.status(503).json({ error: 'Quality Control Service not available' });
      }
      
      try {
        const { task, data, sourceAgent } = req.body;
        
        if (!task || !data) {
          return res.status(400).json({ error: 'Task and data are required' });
        }
        
        const qualityResult = await this.qualityService.performQualityCheck(
          task,
          data,
          sourceAgent || 'api-request'
        );
        
        res.json(qualityResult);
        
      } catch (error) {
        console.error('Quality validation API error:', error);
        res.status(500).json({ error: 'Quality validation failed', message: error.message });
      }
    });

    this.app.get('/quality/metrics', (req, res) => {
      if (!this.qualityService) {
        return res.status(503).json({ error: 'Quality Control Service not available' });
      }
      
      res.json(this.qualityService.getQualityMetrics());
    });

    this.app.get('/quality/agents', (req, res) => {
      if (!this.qualityService) {
        return res.status(503).json({ error: 'Quality Control Service not available' });
      }
      
      const qualityAgents = [];
      this.qualityService.subAgents.forEach((agent, id) => {
        qualityAgents.push({
          id,
          name: agent.name,
          specialization: agent.specialization,
          status: agent.status,
          metrics: agent.metrics,
          subHubType: agent.subHubType
        });
      });
      
      res.json({
        totalAgents: qualityAgents.length,
        agents: qualityAgents,
        subHubBreakdown: {
          qualityAssessment: this.qualityService.subHubs.qualityAssessment.size,
          feedbackImprovement: this.qualityService.subHubs.feedbackImprovement.size,
          qualityMemory: this.qualityService.subHubs.qualityMemory.size
        }
      });
    });

    // Enhanced Content Domain endpoints
    this.app.get('/content/status', (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      res.json({
        status: 'active',
        domain: 'content-enhanced',
        totalAgents: this.contentEnhancedService.agents.size,
        contentPools: Array.from(this.contentEnhancedService.contentPools.keys()),
        activeWorkflows: this.contentEnhancedService.activeWorkflows.size,
        metrics: this.contentEnhancedService.contentMetrics,
        timestamp: Date.now()
      });
    });

    this.app.post('/content/workflow', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const workflowResult = await this.contentEnhancedService.createContentWorkflow(req.body);
        res.json(workflowResult);
      } catch (error) {
        console.error('❌ Content workflow creation error:', error);
        res.status(500).json({ error: 'Failed to create content workflow' });
      }
    });

    this.app.post('/content/cluster', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const clusterAgent = this.contentEnhancedService.agents.get('content-cluster-suggester');
        if (clusterAgent) {
          const result = await clusterAgent.createContent('cluster-analysis', req.body);
          res.json(result);
        } else {
          res.status(404).json({ error: 'Content Cluster Agent not found' });
        }
      } catch (error) {
        console.error('❌ Content cluster generation error:', error);
        res.status(500).json({ error: 'Failed to generate content clusters' });
      }
    });

    this.app.post('/content/title', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const titleAgent = this.contentEnhancedService.agents.get('content-title-generator');
        if (titleAgent) {
          const result = await titleAgent.createContent('title-generation', req.body);
          res.json(result);
        } else {
          res.status(404).json({ error: 'Content Title Generator not found' });
        }
      } catch (error) {
        console.error('❌ Content title generation error:', error);
        res.status(500).json({ error: 'Failed to generate content titles' });
      }
    });

    this.app.post('/content/outline', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const outlineAgent = this.contentEnhancedService.agents.get('content-outline-architect');
        if (outlineAgent) {
          const result = await outlineAgent.createContent('outline-creation', req.body);
          res.json(result);
        } else {
          res.status(404).json({ error: 'Content Outline Architect not found' });
        }
      } catch (error) {
        console.error('❌ Content outline generation error:', error);
        res.status(500).json({ error: 'Failed to generate content outline' });
      }
    });

    this.app.post('/content/backlink-strategy', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const backlinkAgent = this.contentEnhancedService.agents.get('backlink-strategy-architect');
        if (backlinkAgent) {
          const result = await backlinkAgent.createContent('backlink-strategy', req.body);
          res.json(result);
        } else {
          res.status(404).json({ error: 'Backlink Strategy Architect not found' });
        }
      } catch (error) {
        console.error('❌ Backlink strategy generation error:', error);
        res.status(500).json({ error: 'Failed to generate backlink strategy' });
      }
    });

    this.app.get('/content/metrics', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const metrics = await this.contentEnhancedService.getContentMetrics();
        res.json(metrics);
      } catch (error) {
        console.error('❌ Content metrics error:', error);
        res.status(500).json({ error: 'Failed to retrieve content metrics' });
      }
    });

    this.app.get('/content/agents', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const agentStatus = await this.contentEnhancedService.getAgentStatus();
        res.json(agentStatus);
      } catch (error) {
        console.error('❌ Content agents status error:', error);
        res.status(500).json({ error: 'Failed to retrieve content agents status' });
      }
    });

    // ==================== WORDPRESS PUBLISHING API ENDPOINTS ====================
    
    this.app.post('/api/wordpress/publish', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const { contentData, wordpressConfig, options = {} } = req.body;
        
        if (!contentData || !wordpressConfig) {
          return res.status(400).json({ 
            error: 'Content data and WordPress configuration are required',
            example: {
              contentData: {
                title: 'Article Title',
                content: 'Article content...',
                excerpt: 'Brief description'
              },
              wordpressConfig: {
                siteUrl: 'https://yoursite.com',
                username: 'your-username',
                applicationPassword: 'your-app-password'
              },
              options: {
                status: 'draft',
                targetKeyword: 'your keyword',
                contentType: 'article'
              }
            }
          });
        }
        
        // Initialize WordPress pipeline if not exists
        if (!this.wordpressPipeline) {
          const WordPressContentPipeline = require('../../orchestrai-domains/content-enhanced/workflows/wordpress-content-pipeline');
          this.wordpressPipeline = new WordPressContentPipeline(
            this.contentEnhancedService,
            this.crystallineMemory
          );
        }
        
        console.log(`🚀 WordPress publishing request: "${contentData.title?.substring(0, 50)}..."`);
        
        const publishResult = await this.wordpressPipeline.executePublishingPipeline(
          contentData,
          wordpressConfig,
          options
        );
        
        res.json(publishResult);
        
      } catch (error) {
        console.error('❌ WordPress publishing error:', error);
        res.status(500).json({ 
          error: 'WordPress publishing failed', 
          details: error.message 
        });
      }
    });

    this.app.post('/api/wordpress/gutenberg-preview', async (req, res) => {
      if (!this.contentEnhancedService) {
        return res.status(503).json({ error: 'Enhanced Content Domain Service not available' });
      }
      
      try {
        const { contentData, options = {} } = req.body;
        
        if (!contentData) {
          return res.status(400).json({ error: 'Content data is required for preview' });
        }
        
        // Initialize WordPress publisher for preview
        const WordPressGutenbergPublisher = require('../../orchestrai-domains/content-enhanced/agents/wordpress-gutenberg-publisher');
        const publisher = new WordPressGutenbergPublisher(this, this.crystallineMemory);
        
        // Generate Gutenberg blocks preview
        const gutenbergBlocks = await publisher.convertToGutenbergBlocks(contentData, options);
        
        // Generate WordPress post structure
        const wordpressPost = await publisher.generateWordPressPost(
          contentData,
          gutenbergBlocks,
          options
        );
        
        res.json({
          success: true,
          preview: {
            blocksGenerated: gutenbergBlocks.length,
            blockTypes: [...new Set(gutenbergBlocks.map(b => b.blockName))],
            gutenbergBlocks,
            wordpressPost,
            estimatedReadingTime: this.calculateReadingTime(contentData),
            seoScore: this.calculateSEOScore(contentData, options)
          }
        });
        
      } catch (error) {
        console.error('❌ Gutenberg preview error:', error);
        res.status(500).json({ 
          error: 'Gutenberg preview generation failed', 
          details: error.message 
        });
      }
    });

    this.app.get('/api/wordpress/pipeline/status', (req, res) => {
      try {
        if (!this.wordpressPipeline) {
          return res.json({
            initialized: false,
            message: 'WordPress pipeline not yet initialized'
          });
        }
        
        const status = this.wordpressPipeline.getStatus();
        res.json({
          initialized: true,
          ...status,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get WordPress pipeline status', 
          details: error.message 
        });
      }
    });

    this.app.post('/api/wordpress/validate-config', async (req, res) => {
      try {
        const { wordpressConfig } = req.body;
        
        if (!wordpressConfig) {
          return res.status(400).json({ error: 'WordPress configuration is required' });
        }
        
        // Basic validation
        const required = ['siteUrl', 'username', 'applicationPassword'];
        const missing = required.filter(field => !wordpressConfig[field]);
        
        if (missing.length > 0) {
          return res.status(400).json({
            valid: false,
            error: 'Missing required fields',
            missingFields: missing,
            requiredFields: required
          });
        }
        
        // Test WordPress connection
        const axios = require('axios');
        try {
          const response = await axios.get(
            `${wordpressConfig.siteUrl}/wp-json/wp/v2/users/me`,
            {
              auth: {
                username: wordpressConfig.username,
                password: wordpressConfig.applicationPassword
              },
              timeout: 10000
            }
          );
          
          res.json({
            valid: true,
            connection: 'success',
            userInfo: {
              id: response.data.id,
              name: response.data.name,
              roles: response.data.roles
            },
            capabilities: response.data.capabilities || {},
            siteInfo: {
              url: wordpressConfig.siteUrl,
              apiAvailable: true
            }
          });
          
        } catch (apiError) {
          res.json({
            valid: false,
            connection: 'failed',
            error: apiError.response?.data?.message || apiError.message,
            statusCode: apiError.response?.status,
            suggestions: [
              'Verify the site URL is correct',
              'Check username and application password',
              'Ensure REST API is enabled',
              'Confirm user has publishing permissions'
            ]
          });
        }
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Configuration validation failed', 
          details: error.message 
        });
      }
    });

    // ==================== WEB DEVELOPMENT QUALITY DOMAIN API ENDPOINTS ====================
    
    this.app.get('/api/web-quality/status', async (req, res) => {
      if (!this.webQualityService) {
        return res.status(503).json({ error: 'Web Development Quality Domain Service not available' });
      }
      
      try {
        const status = await this.webQualityService.getStatus();
        const registryInfo = this.webQualityDomainRegistry ? this.webQualityDomainRegistry.getDomainInfo() : {};
        
        res.json({
          ...status,
          domain: registryInfo,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ Web quality status error:', error);
        res.status(500).json({ error: 'Failed to retrieve web quality status' });
      }
    });

    this.app.post('/api/web-quality/phase-transition', async (req, res) => {
      if (!this.webQualityService) {
        return res.status(503).json({ error: 'Web Development Quality Domain Service not available' });
      }
      
      try {
        const { projectId, fromPhase, toPhase, validationData } = req.body;
        
        if (!projectId || !fromPhase || !toPhase) {
          return res.status(400).json({ error: 'Project ID, fromPhase, and toPhase are required' });
        }
        
        const transitionResult = await this.webQualityService.requestPhaseTransition(
          projectId, fromPhase, toPhase, validationData
        );
        
        res.json(transitionResult);
        
      } catch (error) {
        console.error('❌ Phase transition error:', error);
        res.status(500).json({ error: 'Failed to execute phase transition' });
      }
    });

    this.app.post('/api/web-quality/validate', async (req, res) => {
      if (!this.webQualityService) {
        return res.status(503).json({ error: 'Web Development Quality Domain Service not available' });
      }
      
      try {
        const { agentType, validationType, url, validationData } = req.body;
        
        if (!agentType || !validationType || !url) {
          return res.status(400).json({ error: 'Agent type, validation type, and URL are required' });
        }
        
        const validationResult = await this.webQualityService.validateSpecificAgent(
          agentType, validationType, url, validationData
        );
        
        res.json(validationResult);
        
      } catch (error) {
        console.error('❌ Web validation error:', error);
        res.status(500).json({ error: 'Failed to execute web validation' });
      }
    });

    this.app.get('/api/web-quality/metrics', async (req, res) => {
      if (!this.webQualityMetrics) {
        return res.status(503).json({ error: 'Web Quality Metrics Manager not available' });
      }
      
      try {
        const metricsStatus = this.webQualityMetrics.getStatus();
        res.json(metricsStatus);
      } catch (error) {
        console.error('❌ Web quality metrics error:', error);
        res.status(500).json({ error: 'Failed to retrieve web quality metrics' });
      }
    });

    this.app.post('/api/web-quality/report', async (req, res) => {
      if (!this.webQualityMetrics) {
        return res.status(503).json({ error: 'Web Quality Metrics Manager not available' });
      }
      
      try {
        const { projectId, reportType = 'comprehensive' } = req.body;
        
        if (!projectId) {
          return res.status(400).json({ error: 'Project ID is required' });
        }
        
        const qualityReport = await this.webQualityMetrics.generateQualityReport(projectId, reportType);
        res.json(qualityReport);
        
      } catch (error) {
        console.error('❌ Web quality report generation error:', error);
        res.status(500).json({ error: 'Failed to generate web quality report' });
      }
    });

    this.app.get('/api/web-quality/agents', async (req, res) => {
      if (!this.webQualityService) {
        return res.status(503).json({ error: 'Web Development Quality Domain Service not available' });
      }
      
      try {
        const agentStatus = await this.webQualityService.getAllAgentsStatus();
        res.json(agentStatus);
      } catch (error) {
        console.error('❌ Web quality agents status error:', error);
        res.status(500).json({ error: 'Failed to retrieve web quality agents status' });
      }
    });

    this.app.get('/api/web-quality/domain-report', async (req, res) => {
      if (!this.webQualityDomainRegistry) {
        return res.status(503).json({ error: 'Web Quality Domain Registry not available' });
      }
      
      try {
        const domainReport = await this.webQualityDomainRegistry.generateDomainReport();
        res.json(domainReport);
      } catch (error) {
        console.error('❌ Web quality domain report error:', error);
        res.status(500).json({ error: 'Failed to generate web quality domain report' });
      }
    });

    this.app.get('/api/web-quality/health', async (req, res) => {
      if (!this.webQualityDomainRegistry) {
        return res.status(503).json({ error: 'Web Quality Domain Registry not available' });
      }
      
      try {
        const healthCheck = await this.webQualityDomainRegistry.performHealthCheck();
        res.json(healthCheck);
      } catch (error) {
        console.error('❌ Web quality health check error:', error);
        res.status(500).json({ error: 'Failed to perform web quality health check' });
      }
    });

    // ==================== CLIENT INTELLIGENCE DOMAIN API ENDPOINTS ====================
    
    this.app.post('/api/client/create', async (req, res) => {
      if (!this.clientIntelligenceService) {
        return res.status(503).json({ error: 'Client Intelligence Domain Service not available' });
      }
      
      try {
        const result = await this.clientIntelligenceService.createClientProject(req.body);
        res.json(result);
      } catch (error) {
        console.error('❌ Client creation error:', error);
        res.status(500).json({ error: 'Failed to create client project' });
      }
    });

    this.app.get('/api/client/status', async (req, res) => {
      if (!this.clientIntelligenceService) {
        return res.status(503).json({ error: 'Client Intelligence Domain Service not available' });
      }
      
      try {
        const status = await this.clientIntelligenceService.getStatus();
        res.json(status);
      } catch (error) {
        console.error('❌ Client status error:', error);
        res.status(500).json({ error: 'Failed to retrieve client intelligence status' });
      }
    });

    this.app.post('/api/client/:clientId/analyze', async (req, res) => {
      if (!this.clientIntelligenceService) {
        return res.status(503).json({ error: 'Client Intelligence Domain Service not available' });
      }
      
      try {
        const result = await this.clientIntelligenceService.analyzeClientContext(req.params.clientId, req.body);
        res.json(result);
      } catch (error) {
        console.error('❌ Client analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze client context' });
      }
    });

    this.app.get('/api/client/:clientId/context', async (req, res) => {
      if (!this.clientIntelligenceService) {
        return res.status(503).json({ error: 'Client Intelligence Domain Service not available' });
      }
      
      try {
        const context = await this.clientIntelligenceService.getClientContext(req.params.clientId, req.query.type);
        res.json(context);
      } catch (error) {
        console.error('❌ Client context retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve client context' });
      }
    });

    this.app.get('/api/client/metrics', async (req, res) => {
      if (!this.clientIntelligenceService) {
        return res.status(503).json({ error: 'Client Intelligence Domain Service not available' });
      }
      
      try {
        const metrics = await this.clientIntelligenceService.getClientMetrics();
        res.json(metrics);
      } catch (error) {
        console.error('❌ Client metrics error:', error);
        res.status(500).json({ error: 'Failed to retrieve client intelligence metrics' });
      }
    });

    // ==================== SELF-ITERATING EVALUATION LOOP API ENDPOINTS ====================
    
    this.app.get('/api/learning/status', async (req, res) => {
      if (!this.selfLearningActive || !this.learningFoundation) {
        return res.status(503).json({ error: 'Self-learning system not available' });
      }
      
      try {
        const learningStatus = await this.learningFoundation.getLearningStatus();
        const selectionStatus = await this.dynamicAgentSelection.getSystemStatus();
        const bridgeStatus = await this.hookMemoryBridge.getBridgeStatus();
        
        res.json({
          active: this.selfLearningActive,
          learning: learningStatus,
          agentSelection: selectionStatus,
          hookBridge: bridgeStatus,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ Learning status error:', error);
        res.status(500).json({ error: 'Failed to retrieve learning system status' });
      }
    });

    this.app.post('/api/learning/select-agent', async (req, res) => {
      if (!this.selfLearningActive || !this.dynamicAgentSelection) {
        return res.status(503).json({ error: 'Dynamic agent selection not available' });
      }
      
      try {
        const { taskContext, options } = req.body;
        
        if (!taskContext) {
          return res.status(400).json({ error: 'Task context is required' });
        }
        
        const selection = await this.dynamicAgentSelection.selectBestAgentForTask(taskContext, options);
        res.json(selection);
        
      } catch (error) {
        console.error('❌ Agent selection error:', error);
        res.status(500).json({ error: 'Failed to select agent', details: error.message });
      }
    });

    this.app.get('/api/learning/agent-recommendations', async (req, res) => {
      if (!this.selfLearningActive || !this.dynamicAgentSelection) {
        return res.status(503).json({ error: 'Dynamic agent selection not available' });
      }
      
      try {
        const taskContext = {
          type: req.query.type,
          domain: req.query.domain,
          complexity: req.query.complexity,
          keywords: req.query.keywords ? req.query.keywords.split(',') : []
        };
        
        const maxRecommendations = parseInt(req.query.max) || 3;
        const recommendations = await this.dynamicAgentSelection.getAgentRecommendations(
          taskContext, 
          maxRecommendations
        );
        
        res.json(recommendations);
        
      } catch (error) {
        console.error('❌ Agent recommendations error:', error);
        res.status(500).json({ error: 'Failed to get agent recommendations' });
      }
    });

    this.app.get('/api/learning/performance-stats', async (req, res) => {
      if (!this.selfLearningActive || !this.performanceMemorySchema) {
        return res.status(503).json({ error: 'Performance memory schema not available' });
      }
      
      try {
        const stats = await this.performanceMemorySchema.getPerformanceStats();
        res.json(stats);
      } catch (error) {
        console.error('❌ Performance stats error:', error);
        res.status(500).json({ error: 'Failed to retrieve performance statistics' });
      }
    });

    this.app.get('/api/learning/report', async (req, res) => {
      if (!this.selfLearningActive || !this.learningFoundation) {
        return res.status(503).json({ error: 'Learning foundation not available' });
      }
      
      try {
        const report = await this.learningFoundation.generateLearningReport();
        res.json(report);
      } catch (error) {
        console.error('❌ Learning report error:', error);
        res.status(500).json({ error: 'Failed to generate learning report' });
      }
    });

    this.app.get('/api/learning/metrics', async (req, res) => {
      if (!this.selfLearningActive || !this.dynamicAgentSelection) {
        return res.status(503).json({ error: 'Dynamic agent selection not available' });
      }
      
      try {
        const selectionMetrics = await this.dynamicAgentSelection.getSelectionMetrics();
        const processingStats = await this.hookMemoryBridge.getProcessingStats();
        
        res.json({
          agentSelection: selectionMetrics,
          hookProcessing: processingStats,
          selfLearningActive: this.selfLearningActive,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ Learning metrics error:', error);
        res.status(500).json({ error: 'Failed to retrieve learning metrics' });
      }
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

    // Main Orchestrator Agent coordination endpoint
    this.app.post('/coordinate', async (req, res) => {
      if (!this.mainOrchestratorAgent) {
        return res.status(503).json({
          success: false,
          error: 'Main Orchestrator Agent not initialized',
          message: 'Central coordination not available'
        });
      }

      try {
        const { query, context } = req.body;
        
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Query is required',
            example: {
              query: 'Create SEO keyword research for dental 3D printing',
              context: { priority: 'high', domain: 'seo' }
            }
          });
        }

        console.log(`🎯 Main Orchestrator received coordination request: "${query.substring(0, 100)}..."`);
        
        const coordinationResult = await this.mainOrchestratorAgent.receiveQuery(query, context);
        
        res.json({
          success: true,
          coordinator: 'main-orchestrator-agent',
          query,
          result: coordinationResult,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('❌ Main Orchestrator coordination error:', error);
        res.status(500).json({
          success: false,
          error: 'Coordination failed',
          details: error.message
        });
      }
    });

    // Main Orchestrator Agent status endpoint
    this.app.get('/coordinate/status', (req, res) => {
      if (!this.mainOrchestratorAgent) {
        return res.json({
          initialized: false,
          status: 'pending',
          message: 'Main Orchestrator Agent not initialized'
        });
      }

      try {
        const status = this.mainOrchestratorAgent.getCoordinatorStatus();
        res.json({
          ...status,
          architecture: 'centralized-coordination',
          availableDomains: Array.from(this.domains.keys()),
          totalDomains: this.domains.size
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get coordinator status',
          details: error.message
        });
      }
    });

    // ==================== TEXT-TO-SPEECH NOTIFICATION API ENDPOINTS ====================
    
    this.app.get('/api/tts/status', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        const status = this.ttsIntegration.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get TTS status', details: error.message });
      }
    });

    this.app.post('/api/tts/configure', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        const { notificationTypes, settings } = req.body;
        
        if (notificationTypes) {
          this.ttsIntegration.configureNotifications(notificationTypes);
        }
        
        if (settings) {
          this.ttsIntegration.getTTSService().updateSettings(settings);
        }
        
        res.json({ 
          success: true, 
          message: 'TTS configuration updated',
          currentStatus: this.ttsIntegration.getStatus()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to configure TTS', details: error.message });
      }
    });

    this.app.post('/api/tts/enable', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        this.ttsIntegration.setEnabled(true);
        res.json({ success: true, message: 'TTS notifications enabled' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to enable TTS', details: error.message });
      }
    });

    this.app.post('/api/tts/disable', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        this.ttsIntegration.setEnabled(false);
        res.json({ success: true, message: 'TTS notifications disabled' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to disable TTS', details: error.message });
      }
    });

    this.app.post('/api/tts/test', async (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        const testResult = await this.ttsIntegration.testTTS();
        res.json(testResult);
      } catch (error) {
        res.status(500).json({ error: 'TTS test failed', details: error.message });
      }
    });

    this.app.post('/api/tts/announce', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        const { message, priority } = req.body;
        
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        this.ttsIntegration.getTTSService().announce(message, { priority: priority || 'normal' });
        
        res.json({ 
          success: true, 
          message: 'Announcement queued',
          announcement: message,
          priority: priority || 'normal'
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to queue announcement', details: error.message });
      }
    });

    this.app.get('/api/tts/voices', async (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        const voices = await this.ttsIntegration.getTTSService().getAvailableVoices();
        res.json({
          voices,
          currentVoice: this.ttsIntegration.getTTSService().voice,
          totalVoices: voices.length
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get available voices', details: error.message });
      }
    });

    this.app.get('/api/tts/queue', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        const ttsService = this.ttsIntegration.getTTSService();
        const status = ttsService.getStatus();
        
        res.json({
          queueLength: status.queueLength,
          isPlaying: status.isPlaying,
          rateLimitMs: status.rateLimitMs,
          stats: status.stats
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get queue status', details: error.message });
      }
    });

    this.app.post('/api/tts/clear-queue', (req, res) => {
      if (!this.ttsIntegration) {
        return res.status(503).json({ error: 'TTS Service not available' });
      }
      
      try {
        this.ttsIntegration.getTTSService().clearQueue();
        res.json({ success: true, message: 'TTS queue cleared' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to clear queue', details: error.message });
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

  // WordPress helper methods
  calculateReadingTime(contentData) {
    let wordCount = 0;
    
    if (contentData.content) {
      wordCount += contentData.content.split(/\s+/).length;
    }
    
    if (contentData.sections && Array.isArray(contentData.sections)) {
      contentData.sections.forEach(section => {
        if (section.content) {
          wordCount += section.content.split(/\s+/).length;
        }
      });
    }
    
    // Average reading speed: 200 words per minute
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    
    return {
      wordCount,
      readingTimeMinutes,
      readingTimeText: readingTimeMinutes === 1 ? '1 minute' : `${readingTimeMinutes} minutes`
    };
  }

  calculateSEOScore(contentData, options) {
    let score = 0;
    const factors = [];
    
    // Title optimization (20 points)
    if (contentData.title) {
      if (contentData.title.length >= 30 && contentData.title.length <= 60) {
        score += 20;
        factors.push({ factor: 'Title length', score: 20, status: 'good' });
      } else {
        score += 10;
        factors.push({ factor: 'Title length', score: 10, status: 'needs improvement' });
      }
    }
    
    // Target keyword in title (15 points)
    if (options.targetKeyword && contentData.title) {
      if (contentData.title.toLowerCase().includes(options.targetKeyword.toLowerCase())) {
        score += 15;
        factors.push({ factor: 'Keyword in title', score: 15, status: 'good' });
      } else {
        factors.push({ factor: 'Keyword in title', score: 0, status: 'missing' });
      }
    }
    
    // Meta description (15 points)
    if (contentData.excerpt || contentData.metaDescription) {
      const desc = contentData.excerpt || contentData.metaDescription;
      if (desc.length >= 120 && desc.length <= 160) {
        score += 15;
        factors.push({ factor: 'Meta description length', score: 15, status: 'good' });
      } else {
        score += 8;
        factors.push({ factor: 'Meta description length', score: 8, status: 'needs improvement' });
      }
    }
    
    // Content length (20 points)
    const readingTime = this.calculateReadingTime(contentData);
    if (readingTime.wordCount >= 300) {
      if (readingTime.wordCount >= 1000) {
        score += 20;
        factors.push({ factor: 'Content length', score: 20, status: 'excellent' });
      } else {
        score += 15;
        factors.push({ factor: 'Content length', score: 15, status: 'good' });
      }
    } else {
      score += 5;
      factors.push({ factor: 'Content length', score: 5, status: 'too short' });
    }
    
    // Structured content (15 points)
    if (contentData.sections && contentData.sections.length > 2) {
      score += 15;
      factors.push({ factor: 'Content structure', score: 15, status: 'good' });
    } else {
      score += 8;
      factors.push({ factor: 'Content structure', score: 8, status: 'needs improvement' });
    }
    
    // Images (15 points)
    if (contentData.featuredImage) {
      score += 10;
      factors.push({ factor: 'Featured image', score: 10, status: 'good' });
    }
    
    if (contentData.sections && contentData.sections.some(s => s.image)) {
      score += 5;
      factors.push({ factor: 'Content images', score: 5, status: 'good' });
    }
    
    return {
      score: Math.min(score, 100),
      maxScore: 100,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      factors,
      recommendations: this.generateSEORecommendations(factors, contentData, options)
    };
  }

  generateSEORecommendations(factors, contentData, options) {
    const recommendations = [];
    
    factors.forEach(factor => {
      if (factor.status === 'missing' || factor.status === 'needs improvement' || factor.status === 'too short') {
        switch (factor.factor) {
          case 'Title length':
            recommendations.push('Optimize title length to 30-60 characters for better SEO');
            break;
          case 'Keyword in title':
            recommendations.push(`Include target keyword "${options.targetKeyword}" in the title`);
            break;
          case 'Meta description length':
            recommendations.push('Write a meta description between 120-160 characters');
            break;
          case 'Content length':
            recommendations.push('Increase content length to at least 300 words, ideally 1000+');
            break;
          case 'Content structure':
            recommendations.push('Add more headings and sections to improve content structure');
            break;
        }
      }
    });
    
    // Additional recommendations
    if (!contentData.featuredImage) {
      recommendations.push('Add a featured image to improve engagement');
    }
    
    if (options.targetKeyword && contentData.content) {
      const keywordDensity = this.calculateKeywordDensity(contentData.content, options.targetKeyword);
      if (keywordDensity < 0.5) {
        recommendations.push('Consider increasing keyword density (aim for 0.5-1.5%)');
      } else if (keywordDensity > 2.5) {
        recommendations.push('Reduce keyword density to avoid over-optimization');
      }
    }
    
    return recommendations;
  }

  calculateKeywordDensity(content, keyword) {
    if (!content || !keyword) return 0;
    
    const words = content.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
    
    return (keywordCount / words.length) * 100;
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
        console.log('   POST /coordinate          - Central query coordination');
        console.log('   GET  /coordinate/status   - Main Orchestrator Agent status');
        console.log('   GET  /memory/nodes        - Memory status');
        console.log('   GET  /agents              - Active agents');
        console.log('   POST /agents/register     - Register new agent');
        console.log('   GET  /pipeline/status     - Pipeline sharing');
        console.log('   GET  /orchestration/topology - System topology');
        console.log('   GET  /quality/status      - Quality Control status');
        console.log('   POST /quality/validate    - Validate content quality');
        console.log('   GET  /quality/metrics     - Quality metrics');
        console.log('   GET  /quality/agents      - Quality agents status');
        console.log('   GET  /content/status      - Enhanced Content Domain status');
        console.log('   POST /content/workflow     - Create content workflow');
        console.log('   POST /content/cluster      - Generate content clusters');
        console.log('   POST /content/title        - Generate optimized titles');
        console.log('   POST /content/outline      - Create detailed outlines');
        console.log('   POST /content/backlink-strategy - Develop backlink strategies');
        console.log('   GET  /content/metrics     - Content creation metrics');
        console.log('   GET  /content/agents      - Content agents status');
        console.log('   GET  /api/web-quality/status - Web Quality Domain status');
        console.log('   POST /api/web-quality/phase-transition - Execute phase transitions');
        console.log('   POST /api/web-quality/validate - Web validation testing');
        console.log('   GET  /api/web-quality/metrics - Web quality metrics');
        console.log('   POST /api/web-quality/report - Generate quality reports');
        console.log('   GET  /api/web-quality/agents - Web quality agents status');
        console.log('   GET  /api/web-quality/health - Web quality health check');
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