const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');

// Import Web Quality Agent classes
const UXQualityValidator = require('./agents/ux-quality-validator');
const VisualRegressionTester = require('./agents/visual-regression-tester');
const ResponsiveDesignValidator = require('./agents/responsive-design-validator');
const CodeQualityValidator = require('./agents/code-quality-validator');
const PerformanceQualityTester = require('./agents/performance-quality-tester');
const BrowserCompatibilityValidator = require('./agents/browser-compatibility-validator');
const E2ETestingCoordinator = require('./agents/e2e-testing-coordinator');
const UXFlowValidator = require('./agents/ux-flow-validator');

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
      
      // Initialize Phase Quality Coordinator
      this.phaseQualityCoordinator = new PhaseQualityCoordinator(this, this.config);
      
      // Set up phase-to-phase quality coordination
      await this.setupPhaseQualityCoordination();
      
      // Start web quality intelligence services
      this.startWebQualityIntelligenceServices();
      
      this.status = 'active';
      console.log('✅ Web Development Quality Domain Hub initialized with 8 specialized web quality agents');
      console.log('   → 3 Design Quality + 3 Development Quality + 2 Integration Quality agents');
      console.log('   → MCP integration: Browser automation + Visual testing + E2E validation');
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

  // Core Web Quality Domain functionality
  async requestPhaseTransition(projectId, fromPhase, toPhase, validationData = {}) {
    try {
      if (!this.phaseQualityCoordinator) {
        throw new Error('Phase Quality Coordinator not initialized');
      }
      
      console.log(`🚦 Web Quality Hub: Processing phase transition for ${projectId}`);
      
      const result = await this.phaseQualityCoordinator.requestPhaseTransition(
        projectId, 
        fromPhase, 
        toPhase, 
        validationData
      );
      
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
      
      return result;
      
    } catch (error) {
      console.error(`❌ Phase transition failed for ${projectId}:`, error);
      this.webQualityMetrics.failedChecks++;
      throw error;
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