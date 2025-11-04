const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const WebDevLearningFoundation = require('./learning/webdev-learning-foundation');

// Import Web Quality Agent classes
const UXQualityValidator = require('./agents/ux-quality-validator');
const VisualRegressionTester = require('./agents/visual-regression-tester');
const ResponsiveDesignValidator = require('./agents/responsive-design-validator');
const CodeQualityValidator = require('./agents/code-quality-validator');
const PerformanceQualityTester = require('./agents/performance-quality-tester');
const BrowserCompatibilityValidator = require('./agents/browser-compatibility-validator');
const E2ETestingCoordinator = require('./agents/e2e-testing-coordinator');
const UXFlowValidator = require('./agents/ux-flow-validator');

// Import Claude Code Enhanced Agents
const WebFrontendDeveloper = require('./claude-code-agents/web-frontend-developer');
const WebVisualDesignAgent = require('./claude-code-agents/web-visual-design-agent');
const VisualDesignStrategist = require('./claude-code-agents/visual-design-strategist');

// Import MCP-Based Specialized Agents
const WireframeCreationSpecialist = require('./mcp-agents/wireframe-creation-specialist');
const VisualDesignSpecialist = require('./mcp-agents/visual-design-specialist');
const FrontendDevelopmentSpecialist = require('./mcp-agents/frontend-development-specialist');

// Import ShadCN Integration
const ShadCnMemoryIntegration = require('../../orchestrai-master/crystalline-memory/shadcn-memory-integration');

// Import MCP Integration Manager
const MCPIntegrationManager = require('./mcp-integrations/mcp-integration-manager');

// Import Task Delegation utilities
const { TaskDelegationManager } = require('../../orchestrai-shared/utils/task-delegation');

// Import Phase Quality Coordinator
const PhaseQualityCoordinator = require('./workflows/phase-quality-coordinator');

// Import Visual QA Automation
const QualityGateAutomation = require('./quality-gate-automation');

/**
 * Web Development Quality Domain Hub
 * 
 * Comprehensive web development quality validation system implementing:
 * - 8 specialized web quality agents across 3 sub-hubs
 * - MCP browser automation integration (Browser MCP + Playwright MCP)
 * - Phase-to-phase quality gates (UX → Wireframe → Design → Development → Production)
 * - Visual regression testing and automated accessibility validation
 * - Self-learning crystalline memory integration
 * 
 * Architecture: Hybrid ORCHESTRAI coordination + Claude Code reasoning + MCP automation
 */
class WebDevelopmentQualityHub extends EventEmitter {
  constructor(orchestrator, mcpManager, crystallineMemory) {
    super();
    
    this.agentId = 'web-quality-domain-hub';
    this.domain = 'web-development-quality';
    this.orchestrator = orchestrator;
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.status = 'initializing';
    
    // Load agent specifications
    this.configPath = path.join(__dirname, 'web-quality-agent-config.json');
    this.config = this.loadConfiguration();
    
    // Web quality agent organization (8 specialized agents)
    this.subHubs = {
      designQuality: new Map(),      // 3 agents: UX, Visual Regression, Responsive
      developmentQuality: new Map(), // 3 agents: Code, Performance, Browser Compatibility
      integrationQuality: new Map()  // 2 agents: E2E Testing, UX Flow Validation
    };
    
    // All agents aggregated for coordination
    this.subAgents = new Map();
    
    // MCP Integration Manager
    this.mcpIntegrationManager = null;
    
    // Task Delegation Manager for Claude Code coordination
    this.taskDelegationManager = null;
    
    // Phase Quality Coordinator for workflow management
    this.phaseQualityCoordinator = null;
    
    // Web quality workflow management
    this.activeQualityChecks = new Map(); // taskId -> quality session
    this.qualityQueue = [];
    this.phaseValidationResults = new Map(); // phase -> validation results
    this.phaseTransitions = new Map(); // current tracking of phase transitions
    
    // Phase Quality Configuration
    this.qualityWorkflow = {
      phases: [
        'ux-research-validation',
        'wireframe-quality-check', 
        'design-implementation-validation',
        'development-quality-assessment',
        'browser-compatibility-testing',
        'e2e-integration-validation',
        'performance-optimization-validation',
        'production-readiness-check'
      ],
      phaseToPhaseGates: {
        'ux-research-validation': {
          nextPhase: 'wireframe-quality-check',
          requiredScore: 75,
          retryLimit: 3,
          validations: ['user-experience-compliance', 'accessibility-baseline']
        },
        'wireframe-quality-check': {
          nextPhase: 'design-implementation-validation',
          requiredScore: 80,
          retryLimit: 2,
          validations: ['layout-structure', 'responsive-breakpoints', 'navigation-flow']
        },
        'design-implementation-validation': {
          nextPhase: 'development-quality-assessment',
          requiredScore: 85,
          retryLimit: 2,
          validations: ['visual-regression-check', 'design-system-compliance']
        },
        'development-quality-assessment': {
          nextPhase: 'browser-compatibility-testing',
          requiredScore: 80,
          retryLimit: 3,
          validations: ['code-quality', 'performance-baseline']
        },
        'browser-compatibility-testing': {
          nextPhase: 'e2e-integration-validation',
          requiredScore: 90,
          retryLimit: 2,
          validations: ['cross-browser-functionality', 'progressive-enhancement']
        },
        'e2e-integration-validation': {
          nextPhase: 'performance-optimization-validation',
          requiredScore: 85,
          retryLimit: 2,
          validations: ['user-flow-completion', 'integration-reliability']
        },
        'performance-optimization-validation': {
          nextPhase: 'production-readiness-check',
          requiredScore: 80,
          retryLimit: 2,
          validations: ['core-web-vitals', 'load-time-optimization']
        },
        'production-readiness-check': {
          nextPhase: 'production-deployment',
          requiredScore: 90,
          retryLimit: 1,
          validations: ['comprehensive-quality-audit', 'deployment-readiness']
        }
      },
      retryLimits: {
        'ux-research-validation': 3,
        'wireframe-quality-check': 2,
        'design-implementation-validation': 2,
        'development-quality-assessment': 3,
        'browser-compatibility-testing': 2,
        'e2e-integration-validation': 2,
        'performance-optimization-validation': 2,
        'production-readiness-check': 1
      }
    };
    
    // Web quality intelligence tracking
    this.webQualityMetrics = {
      totalWebQualityChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      phaseTransitionSuccess: 0,
      avgQualityScore: 0,
      visualRegressionTests: 0,
      accessibilityTests: 0,
      performanceTests: 0,
      e2eTests: 0,
      mcpIntegrationMetrics: {},
      phaseQualityTrends: {},
      agentPerformance: {}
    };
    
    // Phase-to-phase quality gates from configuration
    this.phaseQualityGates = this.config.qualityWorkflow.phaseToPhaseGates;
    this.retryLimits = this.config.qualityWorkflow.retryLimits;
    
    // Crystalline memory pools for web quality intelligence
    this.webQualityMemoryPools = new Map();
    
    // Initialize WebDev Learning Foundation for quality gate optimization
    this.webDevLearning = new WebDevLearningFoundation(crystallineMemory, null);
    
    // Initialize ShadCN Memory Integration
    this.shadcnMemoryIntegration = new ShadCnMemoryIntegration(crystallineMemory, null);
    
    // Enhanced web frontend developer with ShadCN intelligence
    this.webFrontendDeveloper = null;
    
    // Visual Design Strategist and Web Visual Design Agent
    this.visualDesignStrategist = null;
    this.webVisualDesignAgent = null;

    // MCP-Based Specialized Agents
    this.wireframeCreationSpecialist = null;
    this.visualDesignSpecialist = null;
    this.frontendDevelopmentSpecialist = null;
    
    // Quality gate effectiveness tracking
    this.qualityGateEffectiveness = new Map();
    this.gateAdjustmentHistory = [];
    this.lastEffectivenessAnalysis = Date.now();
    
    // Self-adjustment configuration
    this.adjustmentConfig = {
      minDataPoints: 5, // Minimum quality gate decisions before adjustment
      effectivenessThreshold: 0.7, // Below this threshold, gates will be adjusted
      adjustmentInterval: 300000, // 5 minutes between effectiveness checks
      maxAdjustment: 10, // Maximum points to adjust thresholds
      adaptiveLearning: true
    };
    
    this.initialize();
  }

  loadConfiguration() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('❌ Error loading Web Quality Domain configuration:', error);
      throw new Error('Failed to load web quality configuration');
    }
  }

  async initialize() {
    console.log('🌐 Initializing Web Development Quality Domain Hub...');
    
    try {
      // Register as domain coordinator with orchestrator
      await this.registerWithOrchestrator();
      
      // Initialize task delegation manager for Claude Code coordination
      this.taskDelegationManager = new TaskDelegationManager(this.orchestrator);
      
      // Initialize MCP integration manager
      await this.initializeMCPIntegrationManager();
      
      // Initialize crystalline memory web quality pools
      await this.initializeWebQualityMemoryPools();
      
      // Initialize all 8 specialized web quality agents
      await this.initializeWebQualityAgents();
      
      // Initialize ShadCN Memory Integration
      await this.initializeShadCnIntegration();
      
      // Initialize enhanced web frontend developer
      await this.initializeWebFrontendDeveloper();
      
      // Initialize Visual Design Strategist and Web Visual Design Agent
      await this.initializeVisualDesignAgents();

      // Initialize MCP-Based Specialized Agents
      await this.initializeMCPSpecializedAgents();
      
      // Initialize Phase Quality Coordinator
      this.phaseQualityCoordinator = new PhaseQualityCoordinator(this, this.config);
      
      // Set up phase-to-phase quality coordination
      await this.setupPhaseQualityCoordination();
      
      // Start web quality intelligence services
      this.startWebQualityIntelligenceServices();
      
      // Start quality gate effectiveness monitoring
      this.startQualityGateEffectivenessLoop();
      
      this.status = 'active';
      console.log('✅ Web Development Quality Domain Hub initialized with 8 specialized web quality agents + Visual Design System + MCP Specialized Agents');
      console.log('   → 3 Design Quality + 3 Development Quality + 2 Integration Quality agents');
      console.log('   → MCP integration: Browser automation + Visual testing + E2E validation');
      console.log('   → ShadCN UI integration: Component intelligence + Memory-enhanced recommendations');
      console.log('   → Enhanced Web Frontend Developer: TypeScript + React + ShadCN intelligence');
      console.log('   → Visual Design Strategist: Industry-specific design analysis and enhancement planning');
      console.log('   → Web Visual Design Agent: Strategic coordination and implementation execution');
      console.log('   → MCP Specialized Agents: Wireframe Creation + Visual Design + Frontend Development specialists');
      console.log('   → Proactive Visual Enhancement: Automatic design optimization triggers');
      console.log('   → Phase-to-phase quality gates: UX → Wireframe → Design → Development → Production');
      
      this.emit('webQualityHubInitialized', {
        hubId: this.agentId,
        totalAgents: this.subAgents.size,
        webQualityPools: this.webQualityMemoryPools.size,
        mcpIntegrations: this.mcpIntegrationManager ? Object.keys(this.mcpIntegrationManager.getHandlerStatus ? this.mcpIntegrationManager.getHandlerStatus() : {}) : [],
        capabilities: this.getAggregatedCapabilities(),
        architecture: 'hybrid_web_quality_orchestration_mcp',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Web Development Quality Domain Hub:', error);
      this.status = 'error';
      throw error;
    }
  }

  async registerWithOrchestrator() {
    if (this.orchestrator && this.orchestrator.registerDomainAgent) {
      await this.orchestrator.registerDomainAgent({
        agentId: this.agentId,
        domain: this.domain,
        type: 'web-quality-hub',
        capabilities: this.getAggregatedCapabilities(),
        status: this.status,
        instance: this,
        subAgents: this.getAllAgentIds(),
        phaseQualityGates: this.phaseQualityGates,
        mcpIntegrations: this.mcpIntegrationManager ? ['browser-mcp', 'playwright-mcp'] : [],
        memoryPools: Array.from(this.config.crystallineMemoryIntegration.webQualityPools)
      });
      console.log('🌐 Web Development Quality Domain Hub registered with orchestrator');
    }
  }

  async initializeMCPIntegrationManager() {
    console.log('🔌 Initializing MCP Integration Manager...');
    
    try {
      this.mcpIntegrationManager = new MCPIntegrationManager(this.mcpManager, this.crystallineMemory);
      const initialized = await this.mcpIntegrationManager.initialize();
      
      if (initialized) {
        console.log('✅ MCP Integration Manager initialized successfully');
        const status = await this.mcpIntegrationManager.getHandlerStatus();
        console.log('🔌 MCP Handler Status:', JSON.stringify(status, null, 2));
      } else {
        console.warn('⚠️ MCP Integration Manager initialization failed - degrading to Claude Code only');
        this.mcpIntegrationManager = null;
      }
      
    } catch (error) {
      console.error('❌ Error initializing MCP Integration Manager:', error);
      this.mcpIntegrationManager = null;
      // Continue without MCP integration - degrade gracefully
    }
  }

  async initializeWebQualityMemoryPools() {
    console.log('🧠 Initializing crystalline memory web quality pools...');
    
    const memoryConfig = this.config.crystallineMemoryIntegration;
    
    for (const poolName of memoryConfig.webQualityPools) {
      try {
        const coordinate = this.getPoolCoordinate(poolName);
        
        const poolData = {
          domain: 'web-development-quality',
          poolType: poolName,
          content: `Web quality intelligence pool for ${poolName}`,
          metadata: {
            importance: this.getPoolImportance(poolName),
            lastAccess: Date.now(),
            accessCount: 0,
            poolPurpose: this.getPoolPurpose(poolName),
            qualityMetrics: {},
            mcpIntegrationData: {},
            phaseValidationHistory: [],
            learningHistory: []
          }
        };

        const nodeId = await this.crystallineMemory.storeMemory(
          `web-quality-${poolName}`,
          poolData.content,
          poolData.metadata
        );
        
        if (nodeId) {
          this.webQualityMemoryPools.set(poolName, {
            nodeId,
            coordinate,
            purpose: this.getPoolPurpose(poolName),
            metrics: {},
            mcpData: {},
            lastUpdate: Date.now()
          });
          
          console.log(`🧠 Web quality memory pool initialized: ${poolName} at ${JSON.stringify(coordinate)}`);
        }
        
      } catch (error) {
        console.error(`❌ Error initializing web quality memory pool ${poolName}:`, error);
      }
    }
    
    console.log(`✅ ${this.webQualityMemoryPools.size} web quality memory pools initialized in crystalline lattice`);
  }

  getPoolCoordinate(poolName) {
    const coordMap = this.config.crystallineMemoryIntegration.memoryCoordinates;
    const camelCaseName = poolName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    return coordMap[camelCaseName] || { q: 2, r: -2 };
  }

  getPoolImportance(poolName) {
    const importanceMap = {
      'web-quality-scores-central': 1.0,
      'visual-regression-history': 0.95,
      'performance-benchmarks': 0.9,
      'accessibility-compliance-tracking': 0.95,
      'browser-compatibility-matrix': 0.8,
      'user-flow-optimization-insights': 0.85,
      'quality-improvement-patterns': 0.75,
      'mcp-integration-performance': 0.7
    };
    return importanceMap[poolName] || 0.7;
  }

  getPoolPurpose(poolName) {
    const purposeMap = {
      'web-quality-scores-central': 'Central tracking of all web quality metrics and scores',
      'visual-regression-history': 'Historical data and patterns from visual regression testing',
      'performance-benchmarks': 'Performance testing results and optimization benchmarks',
      'accessibility-compliance-tracking': 'WCAG compliance results and accessibility improvements',
      'browser-compatibility-matrix': 'Cross-browser testing results and compatibility data',
      'user-flow-optimization-insights': 'User experience flow analysis and optimization data',
      'quality-improvement-patterns': 'Learning patterns for quality improvement strategies',
      'mcp-integration-performance': 'MCP server performance metrics and optimization data'
    };
    return purposeMap[poolName] || 'Web quality intelligence storage and analysis';
  }

  async initializeDomain() {
    try {
      console.log('🌐 Initializing Web Development Quality Domain Hub...');
      
      // Initialize core components
      await this.initializeCoreComponents();
      
      // Initialize crystalline memory pools
      await this.initializeWebQualityMemoryPools();
      
      // Initialize web quality agents
      await this.initializeWebQualityAgents();
      
      // Start intelligence services
      this.startWebQualityIntelligenceServices();
      
      this.status = 'initialized';
      console.log('✅ Web Development Quality Domain Hub initialized with 8 specialized web quality agents');
      
      return { success: true, agentCount: this.subAgents.size };
    } catch (error) {
      console.error('❌ Failed to initialize Web Development Quality Domain Hub:', error);
      this.status = 'failed';
      throw error;
    }
  }

  async initializeShadCnIntegration() {
    try {
      console.log('🎨 Initializing ShadCN Memory Integration...');
      
      const initResult = await this.shadcnMemoryIntegration.initialize();
      
      if (initResult.success) {
        console.log('✅ ShadCN Memory Integration initialized successfully');
        
        // Store ShadCN integration stats in web quality metrics
        this.webQualityMetrics.shadcnIntegration = {
          status: 'active',
          memoryStats: this.shadcnMemoryIntegration.getMemoryStats(),
          initializationTime: Date.now()
        };
      } else {
        console.warn('⚠️ ShadCN Memory Integration failed, continuing without component intelligence');
        this.webQualityMetrics.shadcnIntegration = {
          status: 'inactive',
          error: initResult.error
        };
      }
      
    } catch (error) {
      console.error('❌ ShadCN Memory Integration error:', error);
      this.webQualityMetrics.shadcnIntegration = {
        status: 'error',
        error: error.message
      };
    }
  }

  async initializeWebFrontendDeveloper() {
    try {
      console.log('🤖 Initializing Enhanced Web Frontend Developer with ShadCN intelligence...');
      
      this.webFrontendDeveloper = new WebFrontendDeveloper(
        this.orchestrator,
        this.crystallineMemory
      );
      
      // Initialize ShadCN integration for the web frontend developer
      const shadcnInitResult = await this.webFrontendDeveloper.initializeShadCnIntegration();
      
      if (shadcnInitResult.success) {
        console.log('✅ Web Frontend Developer with ShadCN intelligence ready');
        
        // Add to subAgents map for coordination
        this.subAgents.set('web-frontend-developer-enhanced', {
          id: 'web-frontend-developer-enhanced',
          name: 'Enhanced Web Frontend Developer',
          specialization: 'frontend-development-with-shadcn-intelligence',
          instance: this.webFrontendDeveloper,
          capabilities: this.webFrontendDeveloper.getCapabilities().capabilities,
          shadcnIntegration: true,
          integrationStats: this.webFrontendDeveloper.getShadCnIntegrationStats()
        });
        
        console.log(`   🎨 ShadCN Integration Stats: ${JSON.stringify(this.webFrontendDeveloper.getShadCnIntegrationStats())}`);
      } else {
        console.warn('⚠️ Web Frontend Developer ShadCN integration failed, using standard capabilities');
      }
      
    } catch (error) {
      console.error('❌ Web Frontend Developer initialization error:', error);
      this.webFrontendDeveloper = null;
    }
  }

  async initializeVisualDesignAgents() {
    try {
      console.log('🎨 Initializing Visual Design Strategist and Web Visual Design Agent...');

      // Initialize Visual Design Strategist
      this.visualDesignStrategist = new VisualDesignStrategist(
        this.orchestrator,
        this.crystallineMemory
      );

      // Initialize Web Visual Design Agent with coordination capabilities
      this.webVisualDesignAgent = new WebVisualDesignAgent(
        this.orchestrator,
        this.crystallineMemory
      );

      console.log('✅ Visual Design agents initialized with strategic coordination');

      // Add to subAgents map for coordination
      this.subAgents.set('visual-design-strategist', {
        id: 'visual-design-strategist',
        name: 'Visual Design Strategist',
        specialization: 'strategic-visual-design-analysis-and-enhancement',
        instance: this.visualDesignStrategist,
        capabilities: this.visualDesignStrategist.getCapabilities().capabilities,
        type: 'claude-code-agent',
        category: 'visual-design-strategic'
      });

      this.subAgents.set('web-visual-design-agent', {
        id: 'web-visual-design-agent',
        name: 'Web Visual Design Agent',
        specialization: 'visual-design-implementation-and-optimization',
        instance: this.webVisualDesignAgent,
        capabilities: this.webVisualDesignAgent.getCapabilities().capabilities,
        strategicCoordination: this.webVisualDesignAgent.getCapabilities().strategicCoordination,
        type: 'claude-code-agent',
        category: 'visual-design-implementation'
      });

      // Set up visual enhancement trigger system
      await this.setupVisualEnhancementTriggers();

      console.log(`   🎯 Visual Design Strategist: Industry-specific analysis and enhancement planning`);
      console.log(`   🛠️ Web Visual Design Agent: Implementation coordination and execution`);
      console.log(`   🚀 Visual enhancement triggers: Proactive design optimization detection`);

    } catch (error) {
      console.error('❌ Visual Design agents initialization error:', error);
      this.visualDesignStrategist = null;
      this.webVisualDesignAgent = null;
    }
  }

  async initializeMCPSpecializedAgents() {
    try {
      console.log('🔧 Initializing MCP-Based Specialized Agents...');

      // Initialize Wireframe Creation Specialist
      this.wireframeCreationSpecialist = new WireframeCreationSpecialist(
        this.mcpManager,
        this.crystallineMemory,
        this.templateEngine
      );

      // Initialize Visual Design Specialist
      this.visualDesignSpecialist = new VisualDesignSpecialist(
        this.mcpManager,
        this.crystallineMemory,
        this.templateEngine
      );

      // Initialize Frontend Development Specialist
      this.frontendDevelopmentSpecialist = new FrontendDevelopmentSpecialist(
        this.mcpManager,
        this.crystallineMemory,
        this.templateEngine
      );

      console.log('✅ MCP-Based Specialized Agents initialized successfully');

      // Add to subAgents map for coordination
      this.subAgents.set('wireframe-creation-specialist', {
        id: 'wireframe-creation-specialist',
        name: 'Wireframe Creation Specialist',
        specialization: 'comprehensive-wireframe-design-with-mcp-tools',
        instance: this.wireframeCreationSpecialist,
        capabilities: this.wireframeCreationSpecialist.config.capabilities,
        type: 'mcp-agent',
        category: 'wireframe-design',
        mcpServers: this.wireframeCreationSpecialist.config.mcpServers,
        wireframeTypes: this.wireframeCreationSpecialist.config.wireframeTypes
      });

      this.subAgents.set('visual-design-specialist', {
        id: 'visual-design-specialist',
        name: 'Visual Design Specialist',
        specialization: 'comprehensive-visual-design-with-mcp-tools',
        instance: this.visualDesignSpecialist,
        capabilities: this.visualDesignSpecialist.config.capabilities,
        type: 'mcp-agent',
        category: 'visual-design',
        mcpServers: this.visualDesignSpecialist.config.mcpServers,
        designFrameworks: this.visualDesignSpecialist.config.designFrameworks
      });

      this.subAgents.set('frontend-development-specialist', {
        id: 'frontend-development-specialist',
        name: 'Frontend Development Specialist',
        specialization: 'comprehensive-frontend-development-with-mcp-tools',
        instance: this.frontendDevelopmentSpecialist,
        capabilities: this.frontendDevelopmentSpecialist.config.capabilities,
        type: 'mcp-agent',
        category: 'frontend-development',
        mcpServers: this.frontendDevelopmentSpecialist.config.mcpServers,
        technologies: this.frontendDevelopmentSpecialist.config.technologies
      });

      console.log(`   🎨 Wireframe Creation Specialist: Information architecture + User flows + Interactive prototypes`);
      console.log(`   🎯 Visual Design Specialist: Brand identity + Color systems + Component design + Accessibility`);
      console.log(`   💻 Frontend Development Specialist: React/Next.js + TypeScript + Performance optimization + Testing`);
      console.log(`   🔧 MCP Integration: FileSystem + Ref.tools + Memory + Sequential Thinking + Notion`);

    } catch (error) {
      console.error('❌ MCP Specialized Agents initialization error:', error);
      this.wireframeCreationSpecialist = null;
      this.visualDesignSpecialist = null;
      this.frontendDevelopmentSpecialist = null;
    }
  }

  async setupVisualEnhancementTriggers() {
    try {
      console.log('🎯 Setting up proactive visual enhancement trigger system...');
      
      // Listen for design-related events that should trigger visual enhancement
      this.on('designEnhancementRequest', async (event) => {
        console.log(`🎨 Visual enhancement trigger activated: ${event.trigger}`);
        await this.handleVisualEnhancementRequest(event);
      });
      
      // Listen for project phase transitions that might benefit from visual enhancement
      this.on('phaseTransitionResult', async (event) => {
        if (this.shouldTriggerVisualEnhancement(event)) {
          this.emit('designEnhancementRequest', {
            trigger: 'phase-transition',
            projectId: event.projectId,
            phase: event.toPhase,
            context: event
          });
        }
      });
      
      console.log('✅ Visual enhancement trigger system active');
      
    } catch (error) {
      console.error('❌ Error setting up visual enhancement triggers:', error);
    }
  }

  shouldTriggerVisualEnhancement(phaseTransitionEvent) {
    // Trigger visual enhancement for design-related phases
    const designPhases = [
      'wireframe-quality-check',
      'design-implementation-validation',
      'development-quality-assessment'
    ];
    
    return designPhases.includes(phaseTransitionEvent.fromPhase) ||
           designPhases.includes(phaseTransitionEvent.toPhase);
  }

  async handleVisualEnhancementRequest(event) {
    try {
      console.log(`🚀 Processing visual enhancement request for ${event.projectId}`);
      
      if (!this.visualDesignStrategist || !this.webVisualDesignAgent) {
        console.warn('⚠️ Visual design agents not available for enhancement request');
        return;
      }
      
      // Generate strategic analysis first
      const strategyResult = await this.visualDesignStrategist.generateVisualEnhancementStrategy(
        event.context.websiteContext || { url: 'unknown', industry: 'generic' },
        event.context.industry || 'business_intelligence',
        event.context.targetAudience || { primary: 'business_users' },
        event.context.businessGoals || ['engagement_optimization', 'professional_aesthetics']
      );
      
      if (strategyResult.success) {
        // Coordinate implementation planning
        const coordinationResult = await this.webVisualDesignAgent.coordinateVisualEnhancementStrategy(
          event.context.websiteContext || { url: 'unknown' },
          event.context.industry || 'business_intelligence',
          event.context.targetAudience || { primary: 'business_users' },
          event.context.businessGoals || ['engagement_optimization']
        );
        
        // Store enhancement recommendation in crystalline memory
        await this.crystallineMemory.storeMemory('visual-enhancement-recommendations', {
          type: 'proactive-visual-enhancement',
          projectId: event.projectId,
          trigger: event.trigger,
          strategy: strategyResult,
          coordination: coordinationResult,
          timestamp: Date.now()
        });
        
        console.log(`✅ Visual enhancement recommendation generated for ${event.projectId}`);
        
        // Emit enhancement ready event
        this.emit('visualEnhancementReady', {
          projectId: event.projectId,
          strategy: strategyResult,
          coordination: coordinationResult,
          trigger: event.trigger
        });
      }
      
    } catch (error) {
      console.error('❌ Error handling visual enhancement request:', error);
    }
  }

  async initializeCoreComponents() {
    try {
      // Initialize MCP Integration Manager
      if (this.mcpManager) {
        this.mcpIntegrationManager = new MCPIntegrationManager(this.mcpManager);
      }
      
      // Initialize Task Delegation Manager for Claude Code coordination
      this.taskDelegationManager = new TaskDelegationManager(this.orchestrator);
      
      // Initialize Phase Quality Coordinator for workflow management
      this.phaseQualityCoordinator = new PhaseQualityCoordinator(
        this, // Pass the WebDevelopmentQualityHub instance
        { qualityWorkflow: this.qualityWorkflow } // Pass the configuration
      );

      // Initialize Visual QA Automation System
      this.visualQAGate = new QualityGateAutomation({
        enabled: true,
        autoFix: true,
        threshold: {
          maxIssues: 3,
          minPassRate: 0.85
        }
      });
      
      await this.visualQAGate.initialize();
      console.log('🎯 Visual QA Automation System integrated');
      
      console.log('✅ Core components initialized for Web Quality Domain');
    } catch (error) {
      console.error('Failed to initialize core components:', error);
      throw error;
    }
  }

  async initializeWebQualityAgents() {
    console.log('🚀 Initializing specialized web quality agents...');
    
    const agentCategories = ['designQuality', 'developmentQuality', 'integrationQuality'];
    
    for (const category of agentCategories) {
      const agents = this.config.webQualityAgents[category];
      
      for (const agentSpec of agents) {
        await this.initializeWebQualityAgent(agentSpec, category);
      }
    }
    
    console.log(`✅ Web Quality Hub: ${this.subAgents.size}/${this.getTotalAgentCount()} web quality agents active`);
  }

  getTotalAgentCount() {
    return Object.values(this.config.webQualityAgents)
      .reduce((total, agentArray) => total + agentArray.length, 0);
  }

  async initializeWebQualityAgent(agentSpec, subHubType) {
    try {
      console.log(`📡 Creating ${agentSpec.name}...`);
      
      // Create specialized web quality agent instance with hybrid Claude Code + MCP integration
      const agent = await this.createWebQualityAgentInstance(agentSpec);
      
      // Add to appropriate sub-hub
      this.subHubs[subHubType].set(agentSpec.id, {
        ...agent,
        subHubType,
        metrics: {
          qualityChecksPerformed: 0,
          qualityScore: 0,
          mcpTestsExecuted: 0,
          phaseValidationsCompleted: 0,
          improvementRate: 0,
          mcpIntegrationSuccess: 0,
          lastActivity: Date.now()
        },
        qualityHistory: [],
        mcpPerformance: {},
        learningData: {}
      });
      
      // Add to main agents map
      this.subAgents.set(agentSpec.id, this.subHubs[subHubType].get(agentSpec.id));
      
      // Initialize web quality metrics tracking for this agent
      this.webQualityMetrics.agentPerformance[agentSpec.id] = {
        totalChecks: 0,
        successfulChecks: 0,
        avgQualityScore: 0,
        mcpTestsExecuted: 0,
        phaseValidationSuccess: 0,
        improvementTrend: 0,
        specialization: agentSpec.specialization,
        mcpIntegration: agentSpec.mcpIntegration
      };
      
      console.log(`✅ ${agentSpec.name} initialized and ready (${subHubType})`);
      
    } catch (error) {
      console.error(`❌ Failed to initialize ${agentSpec.name}:`, error);
      throw error;
    }
  }

  async createWebQualityAgentInstance(agentSpec) {
    // Create specialized web quality agent instance based on agent type
    let agentInstance;
    
    switch (agentSpec.id) {
      case 'web-quality-ux-validator':
        agentInstance = new UXQualityValidator(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-visual-regression-tester':
        agentInstance = new VisualRegressionTester(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-responsive-validator':
        agentInstance = new ResponsiveDesignValidator(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-code-validator':
        agentInstance = new CodeQualityValidator(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-performance-tester':
        agentInstance = new PerformanceQualityTester(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-browser-compatibility-validator':
        agentInstance = new BrowserCompatibilityValidator(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-e2e-coordinator':
        agentInstance = new E2ETestingCoordinator(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      case 'web-quality-ux-flow-validator':
        agentInstance = new UXFlowValidator(this.taskDelegationManager, this.mcpIntegrationManager, this.crystallineMemory);
        break;
      default:
        throw new Error(`Unknown web quality agent: ${agentSpec.id}`);
    }
    
    // Wrap the agent instance with additional metadata and methods
    return {
      id: agentSpec.id,
      name: agentSpec.name,
      specialization: agentSpec.specialization,
      claudeCodeAgent: agentSpec.claudeCodeAgent,
      mcpIntegration: agentSpec.mcpIntegration,
      capabilities: agentSpec.capabilities,
      mcpCapabilities: agentSpec.mcpCapabilities || [],
      qualityMetrics: agentSpec.qualityMetrics,
      instance: agentInstance,
      
      // Delegate methods to the actual agent instance
      async validateWebQuality(url, config) {
        return await this.delegateToWebQualityAgent(agentInstance, 'validateWebQuality', [url, config]);
      },
      
      async executeMCPTest(testType, testData) {
        return await this.delegateToWebQualityAgent(agentInstance, 'executeMCPTest', [testType, testData]);
      },
      
      async validatePhaseTransition(fromPhase, toPhase, data) {
        return await this.delegateToWebQualityAgent(agentInstance, 'validatePhaseTransition', [fromPhase, toPhase, data]);
      },
      
      async getStatus() {
        return agentInstance.getStatus ? agentInstance.getStatus() : { active: true, agentId: agentSpec.id };
      },
      
      async getQualityMetrics() {
        return agentInstance.getQualityMetrics ? await agentInstance.getQualityMetrics() : agentSpec.qualityMetrics;
      }
    };
  }

  async delegateToWebQualityAgent(agentInstance, methodName, args) {
    try {
      if (typeof agentInstance[methodName] === 'function') {
        return await agentInstance[methodName](...args);
      } else {
        console.warn(`⚠️ Method ${methodName} not found on agent instance`);
        return { success: false, error: `Method ${methodName} not implemented` };
      }
    } catch (error) {
      console.error(`❌ Error delegating to web quality agent method ${methodName}:`, error);
      throw error;
    }
  }

  getAggregatedCapabilities() {
    const allCapabilities = new Set();
    
    for (const category of Object.values(this.config.webQualityAgents)) {
      for (const agent of category) {
        agent.capabilities.forEach(cap => allCapabilities.add(cap));
        if (agent.mcpCapabilities) {
          agent.mcpCapabilities.forEach(mcpCap => allCapabilities.add(`mcp:${mcpCap}`));
        }
      }
    }
    
    return Array.from(allCapabilities);
  }

  getAllAgentIds() {
    return Array.from(this.subAgents.keys());
  }

  async setupPhaseQualityCoordination() {
    console.log('🤝 Setting up phase-to-phase quality coordination...');
    
    // Register phase transition listeners
    this.on('phaseTransitionRequest', this.handlePhaseTransition.bind(this));
    this.on('qualityValidationComplete', this.handleQualityValidationComplete.bind(this));
    
    // Initialize phase tracking
    const phases = this.config.qualityWorkflow.phases;
    for (const phase of phases) {
      this.phaseTransitions.set(phase, {
        active: false,
        qualityResults: {},
        timestamp: null
      });
    }
    
    console.log(`🤝 Phase quality coordination established for ${phases.length} phases`);
  }

  // ============ QUALITY GATE EFFECTIVENESS & SELF-ADJUSTMENT ============

  startQualityGateEffectivenessLoop() {
    console.log('🎯 Starting quality gate effectiveness monitoring...');
    
    // Analyze quality gate effectiveness every 5 minutes
    this.gateEffectivenessInterval = setInterval(async () => {
      await this.analyzeQualityGateEffectiveness();
    }, this.adjustmentConfig.adjustmentInterval);
    
    // Initialize effectiveness tracking for all gates
    this.initializeGateEffectivenessTracking();
    
    console.log('✅ Quality gate effectiveness loop started');
  }

  initializeGateEffectivenessTracking() {
    const phases = Object.keys(this.qualityWorkflow.phaseToPhaseGates);
    
    for (const phase of phases) {
      this.qualityGateEffectiveness.set(phase, {
        totalDecisions: 0,
        correctDecisions: 0,
        falsePositives: 0, // Rejected but should have passed
        falseNegatives: 0, // Passed but should have been rejected
        effectiveness: 0.5,
        lastAnalysis: Date.now(),
        adjustmentCount: 0
      });
    }
    
    console.log(`🎯 Effectiveness tracking initialized for ${phases.length} quality gates`);
  }

  async analyzeQualityGateEffectiveness() {
    if (Date.now() - this.lastEffectivenessAnalysis < this.adjustmentConfig.adjustmentInterval) {
      return; // Too soon since last analysis
    }

    console.log('🔍 Analyzing quality gate effectiveness...');

    try {
      // Retrieve recent quality gate decisions from crystalline memory
      const recentGateDecisions = await this.crystallineMemory.retrieveMemory(
        'quality gate decisions effectiveness',
        'web-quality-scores-central',
        100
      );

      const effectivenessAnalysis = await this.processGateEffectivenessData(recentGateDecisions);
      
      // Identify gates that need adjustment
      const adjustmentNeeds = this.identifyAdjustmentNeeds(effectivenessAnalysis);
      
      if (adjustmentNeeds.length > 0) {
        await this.performQualityGateAdjustments(adjustmentNeeds);
        this.webQualityMetrics.qualityGateAdjustments++;
      }

      this.lastEffectivenessAnalysis = Date.now();
      
      console.log(`✅ Quality gate effectiveness analysis complete. Adjustments made: ${adjustmentNeeds.length}`);
      
    } catch (error) {
      console.error('Error analyzing quality gate effectiveness:', error);
    }
  }

  async processGateEffectivenessData(gateDecisions) {
    const effectivenessAnalysis = new Map();

    for (const decision of gateDecisions.results || []) {
      try {
        const decisionData = JSON.parse(decision.content);
        
        if (decisionData.type === 'quality-gate-decision' && decisionData.phase) {
          const phase = decisionData.phase;
          
          if (!effectivenessAnalysis.has(phase)) {
            effectivenessAnalysis.set(phase, {
              phase,
              decisions: [],
              effectiveness: 0,
              needsAdjustment: false,
              adjustmentDirection: null,
              confidence: 0
            });
          }

          const phaseData = effectivenessAnalysis.get(phase);
          phaseData.decisions.push(decisionData);
          
          // Calculate effectiveness based on actual outcomes vs predictions
          if (decisionData.actualOutcome !== undefined) {
            const wasCorrect = (decisionData.gateDecision === 'pass') === (decisionData.actualOutcome === 'success');
            
            if (wasCorrect) {
              phaseData.effectiveness += 1;
            }
          }
        }
      } catch (error) {
        console.warn('Error processing gate decision data:', error);
      }
    }

    // Normalize effectiveness scores
    for (const [phase, data] of effectivenessAnalysis) {
      if (data.decisions.length > 0) {
        data.effectiveness = data.effectiveness / data.decisions.length;
        data.confidence = Math.min(data.decisions.length / this.adjustmentConfig.minDataPoints, 1.0);
      }
    }

    return effectivenessAnalysis;
  }

  identifyAdjustmentNeeds(effectivenessAnalysis) {
    const adjustmentNeeds = [];

    for (const [phase, analysis] of effectivenessAnalysis) {
      if (analysis.decisions.length < this.adjustmentConfig.minDataPoints) {
        continue; // Not enough data yet
      }

      if (analysis.effectiveness < this.adjustmentConfig.effectivenessThreshold) {
        // Gate is not effective enough - needs adjustment
        
        const adjustment = {
          phase,
          currentThreshold: this.qualityWorkflow.phaseToPhaseGates[phase]?.requiredScore || 80,
          effectiveness: analysis.effectiveness,
          adjustmentType: this.determineAdjustmentType(analysis),
          adjustmentAmount: this.calculateAdjustmentAmount(analysis),
          reasoning: this.generateAdjustmentReasoning(analysis)
        };

        adjustmentNeeds.push(adjustment);
      }
    }

    return adjustmentNeeds;
  }

  determineAdjustmentType(analysis) {
    // Analyze the pattern of incorrect decisions
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const decision of analysis.decisions) {
      if (decision.actualOutcome !== undefined) {
        const gateDecision = decision.gateDecision === 'pass';
        const actualSuccess = decision.actualOutcome === 'success';

        if (gateDecision && !actualSuccess) {
          falsePositives++; // Gate passed but project failed
        } else if (!gateDecision && actualSuccess) {
          falseNegatives++; // Gate failed but project succeeded
        }
      }
    }

    if (falsePositives > falseNegatives) {
      return 'increase-threshold'; // Gate is too lenient
    } else if (falseNegatives > falsePositives) {
      return 'decrease-threshold'; // Gate is too strict
    } else {
      return 'recalibrate'; // Mixed signals, need more sophisticated adjustment
    }
  }

  calculateAdjustmentAmount(analysis) {
    const effectivenessGap = this.adjustmentConfig.effectivenessThreshold - analysis.effectiveness;
    const baseAdjustment = Math.ceil(effectivenessGap * 20); // Scale to quality score points
    
    return Math.min(baseAdjustment, this.adjustmentConfig.maxAdjustment);
  }

  generateAdjustmentReasoning(analysis) {
    const effectiveness = (analysis.effectiveness * 100).toFixed(1);
    const threshold = this.adjustmentConfig.effectivenessThreshold * 100;
    
    return `Quality gate effectiveness is ${effectiveness}%, below threshold of ${threshold}%. ` +
           `Based on ${analysis.decisions.length} recent decisions, adjusting to improve accuracy.`;
  }

  async performQualityGateAdjustments(adjustmentNeeds) {
    console.log(`🔧 Performing ${adjustmentNeeds.length} quality gate adjustments...`);

    for (const adjustment of adjustmentNeeds) {
      await this.adjustQualityGateThreshold(adjustment);
    }

    // Store adjustment history in crystalline memory
    await this.crystallineMemory.storeMemory(
      'webdev-quality-gate-effectiveness',
      JSON.stringify({
        type: 'quality-gate-adjustments',
        timestamp: Date.now(),
        adjustments: adjustmentNeeds,
        systemLearning: true
      }),
      {
        importance: 0.9,
        semantic_tags: ['quality-gate', 'adjustment', 'learning', 'effectiveness']
      }
    );
  }

  async adjustQualityGateThreshold(adjustment) {
    const { phase, adjustmentType, adjustmentAmount, reasoning } = adjustment;
    
    const currentGate = this.qualityWorkflow.phaseToPhaseGates[phase];
    if (!currentGate) return;

    const oldThreshold = currentGate.requiredScore;
    let newThreshold = oldThreshold;

    switch (adjustmentType) {
      case 'increase-threshold':
        newThreshold = Math.min(oldThreshold + adjustmentAmount, 95);
        break;
      case 'decrease-threshold':
        newThreshold = Math.max(oldThreshold - adjustmentAmount, 60);
        break;
      case 'recalibrate':
        // More sophisticated adjustment based on detailed analysis
        newThreshold = await this.recalibrateThreshold(phase, adjustment);
        break;
    }

    // Apply the adjustment
    this.qualityWorkflow.phaseToPhaseGates[phase].requiredScore = newThreshold;
    
    // Track the adjustment
    const adjustmentRecord = {
      phase,
      timestamp: Date.now(),
      oldThreshold,
      newThreshold,
      adjustmentType,
      reasoning,
      effectiveness: adjustment.effectiveness
    };
    
    this.gateAdjustmentHistory.push(adjustmentRecord);

    // Update effectiveness tracking
    const gateData = this.qualityGateEffectiveness.get(phase);
    if (gateData) {
      gateData.adjustmentCount++;
      gateData.lastAnalysis = Date.now();
    }

    console.log(`🎯 Quality gate adjusted: ${phase} threshold ${oldThreshold} → ${newThreshold} (${adjustmentType})`);
    console.log(`   Reasoning: ${reasoning}`);

    // Emit adjustment event for other system components
    this.emit('qualityGateAdjusted', adjustmentRecord);
  }

  async recalibrateThreshold(phase, adjustment) {
    // Advanced recalibration using learning data
    const historicalData = await this.crystallineMemory.retrieveMemory(
      `quality gate ${phase} historical performance`,
      'webdev-quality-gate-effectiveness',
      20
    );

    let optimalThreshold = adjustment.currentThreshold;

    // Analyze historical success patterns to find optimal threshold
    if (historicalData.results && historicalData.results.length > 0) {
      const successfulProjects = [];
      const failedProjects = [];

      for (const record of historicalData.results) {
        try {
          const data = JSON.parse(record.content);
          if (data.qualityScore && data.actualOutcome) {
            if (data.actualOutcome === 'success') {
              successfulProjects.push(data.qualityScore);
            } else {
              failedProjects.push(data.qualityScore);
            }
          }
        } catch (error) {
          // Skip malformed records
        }
      }

      if (successfulProjects.length > 0 && failedProjects.length > 0) {
        // Find threshold that maximizes accuracy
        const minSuccess = Math.min(...successfulProjects);
        const maxFailure = Math.max(...failedProjects);
        
        // Optimal threshold is typically between these values
        optimalThreshold = Math.round((minSuccess + maxFailure) / 2);
        
        // Ensure it's within reasonable bounds
        optimalThreshold = Math.max(60, Math.min(95, optimalThreshold));
      }
    }

    return optimalThreshold;
  }

  startWebQualityIntelligenceServices() {
    console.log('🧠 Starting web quality intelligence services...');
    
    // Start periodic quality analytics
    this.qualityAnalyticsInterval = setInterval(() => {
      this.performQualityAnalytics();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Start MCP performance monitoring
    this.mcpMonitoringInterval = setInterval(() => {
      this.monitorMCPPerformance();
    }, 2 * 60 * 1000); // Every 2 minutes
    
    console.log('✅ Web quality intelligence services started');
  }

  // Core Web Quality Domain functionality with learning integration
  async requestPhaseTransition(projectId, fromPhase, toPhase, validationData = {}) {
    try {
      if (!this.phaseQualityCoordinator) {
        throw new Error('Phase Quality Coordinator not initialized');
      }
      
      console.log(`🚦 [Learning Mode] Web Quality Hub: Processing phase transition for ${projectId}`);
      
      // Make learning prediction before quality gate decision
      const predictionId = await this.webDevLearning.makePrediction(
        this.agentId,
        'quality-gate',
        {
          projectId,
          fromPhase,
          toPhase,
          validationData,
          gateName: `${fromPhase}_to_${toPhase}`,
          currentThreshold: this.qualityWorkflow.phaseToPhaseGates[fromPhase]?.requiredScore || 80
        },
        0.8
      );
      
      const result = await this.phaseQualityCoordinator.requestPhaseTransition(
        projectId, 
        fromPhase, 
        toPhase, 
        validationData
      );
      
      // Enhanced result with learning integration
      const enhancedResult = {
        ...result,
        predictionId,
        learningEnhanced: true,
        recordOutcome: (actualOutcome) => this.recordPhaseTransitionOutcome(predictionId, actualOutcome)
      };
      
      // Store quality gate decision for effectiveness analysis
      await this.storeQualityGateDecision(projectId, fromPhase, toPhase, result, predictionId);
      
      // Update web quality metrics
      this.webQualityMetrics.totalWebQualityChecks++;
      if (result.approved) {
        this.webQualityMetrics.passedChecks++;
        this.webQualityMetrics.phaseTransitionSuccess++;
      } else {
        this.webQualityMetrics.failedChecks++;
      }
      
      // Update average quality score
      this.webQualityMetrics.avgQualityScore = 
        (this.webQualityMetrics.avgQualityScore * (this.webQualityMetrics.totalWebQualityChecks - 1) + 
         result.qualityScore) / this.webQualityMetrics.totalWebQualityChecks;
      
      return enhancedResult;
      
    } catch (error) {
      console.error(`❌ Phase transition failed for ${projectId}:`, error);
      this.webQualityMetrics.failedChecks++;
      throw error;
    }
  }

  async storeQualityGateDecision(projectId, fromPhase, toPhase, result, predictionId) {
    try {
      const gateDecision = {
        type: 'quality-gate-decision',
        projectId,
        phase: fromPhase,
        targetPhase: toPhase,
        predictionId,
        gateDecision: result.approved ? 'pass' : 'fail',
        qualityScore: result.qualityScore,
        threshold: this.qualityWorkflow.phaseToPhaseGates[fromPhase]?.requiredScore || 80,
        timestamp: Date.now(),
        reasoning: result.reasoning || 'Standard quality gate evaluation',
        actualOutcome: null // To be filled when actual project outcome is known
      };

      await this.crystallineMemory.storeMemory(
        'web-quality-scores-central',
        JSON.stringify(gateDecision),
        {
          importance: 0.8,
          semantic_tags: ['quality-gate', 'decision', fromPhase, toPhase, 'learning']
        }
      );

      console.log(`📊 Quality gate decision stored: ${fromPhase} → ${toPhase} (${result.approved ? 'PASS' : 'FAIL'})`);
      
    } catch (error) {
      console.error('Error storing quality gate decision:', error);
    }
  }

  async recordPhaseTransitionOutcome(predictionId, actualOutcome) {
    try {
      // Record the actual outcome for learning
      const accuracy = await this.webDevLearning.recordActualOutcome(predictionId, {
        passed: actualOutcome === 'success',
        actualOutcome
      });

      console.log(`📚 Phase transition outcome recorded: ${predictionId} (accuracy: ${(accuracy * 100).toFixed(1)}%)`);
      
      return accuracy;
    } catch (error) {
      console.error('Error recording phase transition outcome:', error);
      return 0;
    }
  }

  async runQualityValidationSuite(url, validationConfig = {}) {
    try {
      if (!this.mcpIntegrationManager) {
        throw new Error('MCP Integration Manager not available - cannot run full validation suite');
      }
      
      console.log(`🧪 Running comprehensive quality validation suite for: ${url}`);
      
      const result = await this.mcpIntegrationManager.runQualityValidationSuite(url, validationConfig);
      
      // Update metrics based on results
      this.webQualityMetrics.totalWebQualityChecks++;
      if (result.summary.overallScore >= 80) {
        this.webQualityMetrics.passedChecks++;
      } else {
        this.webQualityMetrics.failedChecks++;
      }
      
      // Update specific test metrics
      if (result.tests.visualRegression) {
        this.webQualityMetrics.visualRegressionTests++;
      }
      if (result.tests.accessibility) {
        this.webQualityMetrics.accessibilityTests++;
      }
      if (result.tests.performance) {
        this.webQualityMetrics.performanceTests++;
      }
      
      // Store results in crystalline memory
      await this.crystallineMemory.storeMemory('web-quality-scores-central', {
        type: 'quality-validation-suite',
        url,
        result,
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      console.error(`❌ Quality validation suite failed for ${url}:`, error);
      this.webQualityMetrics.failedChecks++;
      throw error;
    }
  }

  async validateSpecificAgent(agentId, url, validationConfig = {}) {
    try {
      const agent = this.subAgents.get(agentId);
      if (!agent) {
        throw new Error(`Web quality agent not found: ${agentId}`);
      }
      
      console.log(`🔍 Running specific agent validation: ${agent.name} for ${url}`);
      
      const result = await agent.validateWebQuality(url, validationConfig);
      
      // Update agent-specific metrics
      const agentMetrics = this.webQualityMetrics.agentPerformance[agentId];
      agentMetrics.totalChecks++;
      if (result.success !== false && (result.overallScore || result.score || 0) >= 80) {
        agentMetrics.successfulChecks++;
      }
      agentMetrics.avgQualityScore = 
        (agentMetrics.avgQualityScore * (agentMetrics.totalChecks - 1) + 
         (result.overallScore || result.score || 0)) / agentMetrics.totalChecks;
      
      return result;
      
    } catch (error) {
      console.error(`❌ Agent validation failed for ${agentId}:`, error);
      throw error;
    }
  }

  async handlePhaseTransition(event) {
    try {
      console.log(`🔄 Handling phase transition: ${event.fromPhase} → ${event.toPhase} for ${event.projectId}`);
      
      const result = await this.requestPhaseTransition(
        event.projectId,
        event.fromPhase,
        event.toPhase,
        event.validationData || {}
      );
      
      this.emit('phaseTransitionResult', {
        ...event,
        result,
        timestamp: Date.now()
      });
      
      return result;
      
    } catch (error) {
      console.error('Phase transition handling failed:', error);
      this.emit('phaseTransitionError', {
        ...event,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  async handleQualityValidationComplete(event) {
    try {
      console.log(`✅ Quality validation completed: ${event.agentId} for session ${event.sessionId}`);
      
      // Update agent metrics
      const agentId = event.agentId;
      if (this.webQualityMetrics.agentPerformance[agentId]) {
        this.webQualityMetrics.agentPerformance[agentId].lastActivity = Date.now();
        
        if (event.result && event.result.success !== false) {
          this.webQualityMetrics.agentPerformance[agentId].successfulChecks++;
        }
      }
      
      // Store validation results
      if (event.result) {
        await this.crystallineMemory.storeMemory('web-quality-scores-central', {
          type: 'agent-validation-complete',
          agentId,
          sessionId: event.sessionId,
          result: event.result,
          timestamp: Date.now()
        });
      }
      
      this.emit('webQualityValidationProcessed', {
        agentId,
        sessionId: event.sessionId,
        processed: true,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Quality validation completion handling failed:', error);
    }
  }

  performQualityAnalytics() {
    // Quality analytics - to be implemented
    console.log('📊 Performing quality analytics...');
  }

  monitorMCPPerformance() {
    // MCP performance monitoring - to be implemented
    console.log('🔌 Monitoring MCP performance...');
  }

  // Public methods for visual enhancement access
  async requestVisualEnhancement(projectId, websiteContext, industry, targetAudience, businessGoals) {
    try {
      console.log(`🎨 External visual enhancement request for project: ${projectId}`);
      
      if (!this.visualDesignStrategist || !this.webVisualDesignAgent) {
        throw new Error('Visual design agents not available');
      }
      
      // Trigger the visual enhancement request
      this.emit('designEnhancementRequest', {
        trigger: 'external-request',
        projectId,
        context: {
          websiteContext,
          industry,
          targetAudience,
          businessGoals
        }
      });
      
      return {
        success: true,
        message: 'Visual enhancement request initiated',
        projectId,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ External visual enhancement request failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getVisualDesignCapabilities() {
    const capabilities = {
      visualDesignStrategist: this.visualDesignStrategist ?
        this.visualDesignStrategist.getCapabilities() : null,
      webVisualDesignAgent: this.webVisualDesignAgent ?
        this.webVisualDesignAgent.getCapabilities() : null,
      proactiveEnhancement: true,
      industrySpecificAnalysis: true,
      strategicCoordination: true,
      implementationPlanning: true
    };

    return capabilities;
  }

  // Public methods for accessing MCP-based specialized agents
  async createWireframe(request) {
    if (!this.wireframeCreationSpecialist) {
      throw new Error('Wireframe Creation Specialist not available');
    }

    console.log(`🎨 Creating wireframe for ${request.projectType} - ${request.pageType}`);
    return await this.wireframeCreationSpecialist.createWireframe(request);
  }

  async createVisualDesign(request) {
    if (!this.visualDesignSpecialist) {
      throw new Error('Visual Design Specialist not available');
    }

    console.log(`🎯 Creating visual design for ${request.projectType} - ${request.designStyle}`);
    return await this.visualDesignSpecialist.createVisualDesign(request);
  }

  async developFrontend(request) {
    if (!this.frontendDevelopmentSpecialist) {
      throw new Error('Frontend Development Specialist not available');
    }

    console.log(`💻 Developing frontend for ${request.projectType} - ${request.framework}`);
    return await this.frontendDevelopmentSpecialist.developFrontend(request);
  }

  getMCPSpecializedAgentsStatus() {
    return {
      wireframeCreationSpecialist: this.wireframeCreationSpecialist ?
        this.wireframeCreationSpecialist.getAgentStatus() : null,
      visualDesignSpecialist: this.visualDesignSpecialist ?
        this.visualDesignSpecialist.getAgentStatus() : null,
      frontendDevelopmentSpecialist: this.frontendDevelopmentSpecialist ?
        this.frontendDevelopmentSpecialist.getAgentStatus() : null,
      totalMCPAgents: [
        this.wireframeCreationSpecialist,
        this.visualDesignSpecialist,
        this.frontendDevelopmentSpecialist
      ].filter(Boolean).length
    };
  }

  async executeComprehensiveDesignDevelopmentWorkflow(request) {
    try {
      console.log(`🚀 Executing comprehensive design & development workflow for project: ${request.projectId}`);

      const workflow = {
        wireframe: null,
        visualDesign: null,
        frontendDevelopment: null,
        errors: []
      };

      // Phase 1: Wireframe Creation
      if (this.wireframeCreationSpecialist) {
        try {
          console.log('📐 Phase 1: Creating wireframes...');
          workflow.wireframe = await this.wireframeCreationSpecialist.createWireframe({
            projectId: request.projectId,
            projectType: request.projectType || 'landing-page',
            pageType: request.pageType || 'homepage',
            targetAudience: request.targetAudience,
            features: request.features,
            branding: request.branding
          });
          console.log('✅ Phase 1 completed: Wireframes created');
        } catch (error) {
          workflow.errors.push({ phase: 'wireframe', error: error.message });
          console.error('❌ Phase 1 failed:', error.message);
        }
      }

      // Phase 2: Visual Design Creation
      if (this.visualDesignSpecialist && workflow.wireframe) {
        try {
          console.log('🎨 Phase 2: Creating visual design...');
          workflow.visualDesign = await this.visualDesignSpecialist.createVisualDesign({
            projectId: request.projectId,
            projectType: request.projectType || 'landing-page',
            designStyle: request.designStyle || 'modern',
            branding: request.branding,
            targetAudience: request.targetAudience,
            industry: request.industry,
            accessibility: request.accessibility
          });
          console.log('✅ Phase 2 completed: Visual design created');
        } catch (error) {
          workflow.errors.push({ phase: 'visual-design', error: error.message });
          console.error('❌ Phase 2 failed:', error.message);
        }
      }

      // Phase 3: Frontend Development
      if (this.frontendDevelopmentSpecialist && workflow.visualDesign) {
        try {
          console.log('💻 Phase 3: Developing frontend...');
          workflow.frontendDevelopment = await this.frontendDevelopmentSpecialist.developFrontend({
            projectId: request.projectId,
            projectType: request.projectType || 'landing-page',
            framework: request.framework || 'react',
            features: request.features,
            performance: request.performance,
            accessibility: request.accessibility,
            devices: request.devices
          });
          console.log('✅ Phase 3 completed: Frontend developed');
        } catch (error) {
          workflow.errors.push({ phase: 'frontend-development', error: error.message });
          console.error('❌ Phase 3 failed:', error.message);
        }
      }

      const workflowResult = {
        projectId: request.projectId,
        success: workflow.errors.length === 0,
        completedPhases: Object.keys(workflow).filter(key => workflow[key] && key !== 'errors').length,
        totalPhases: 3,
        workflow: workflow,
        timestamp: new Date().toISOString()
      };

      // Store comprehensive workflow result in memory
      if (this.crystallineMemory) {
        await this.crystallineMemory.storeMemory(
          'comprehensive-design-development-workflows',
          JSON.stringify(workflowResult),
          {
            importance: 0.9,
            semantic_tags: ['comprehensive-workflow', 'wireframe', 'visual-design', 'frontend-development', request.projectType]
          }
        );
      }

      console.log(`🎉 Comprehensive workflow completed: ${workflowResult.completedPhases}/${workflowResult.totalPhases} phases successful`);

      return workflowResult;

    } catch (error) {
      console.error('❌ Comprehensive design & development workflow failed:', error);
      throw error;
    }
  }

  // Status and health methods
  getStatus() {
    const qualitySuccessRate = this.webQualityMetrics.totalWebQualityChecks > 0 
      ? (this.webQualityMetrics.passedChecks / this.webQualityMetrics.totalWebQualityChecks * 100).toFixed(2)
      : 0;
    
    return {
      agentId: this.agentId,
      status: this.status,
      metrics: {
        ...this.webQualityMetrics,
        qualitySuccessRate: `${qualitySuccessRate}%`,
        totalAgents: this.subAgents.size,
        activePhases: Array.from(this.phaseTransitions.keys()),
        mcpIntegrationsActive: this.mcpIntegrationManager ? 1 : 0,
        taskDelegationActive: this.taskDelegationManager ? true : false
      },
      phaseQualityGates: this.qualityWorkflow.phaseToPhaseGates,
      mcpIntegration: this.mcpIntegrationManager ? 'active' : 'inactive',
      taskDelegationStats: this.taskDelegationManager ? this.taskDelegationManager.getTaskStats() : null
    };
  }

  // Add getter method for phase configuration access
  getPhaseConfiguration() {
    return this.qualityWorkflow;
  }

  async shutdown() {
    try {
      console.log('🔄 Shutting down Web Development Quality Domain Hub...');
      
      if (this.qualityAnalyticsInterval) {
        clearInterval(this.qualityAnalyticsInterval);
      }
      
      if (this.mcpMonitoringInterval) {
        clearInterval(this.mcpMonitoringInterval);
      }
      
      // Clear all quality sessions
      this.activeQualityChecks.clear();
      this.phaseTransitions.clear();
      this.qualityQueue = [];
      
      this.status = 'shutdown';
      console.log('✅ Web Development Quality Domain Hub shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during Web Development Quality Domain Hub shutdown:', error);
    }
  }
}

module.exports = WebDevelopmentQualityHub;