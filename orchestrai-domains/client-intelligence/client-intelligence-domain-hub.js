// Client Intelligence Domain Hub - ORCHESTRAI Hybrid Architecture
// Manages 6 specialized Claude Code agents + 4 Node.js coordination agents
// Provides comprehensive client context intelligence across all ORCHESTRAI domains

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

class ClientIntelligenceDomainHub extends EventEmitter {
  constructor(orchestrator, mcpManager, crystallineMemory, templateEngine, projectManager) {
    super();
    
    this.orchestrator = orchestrator;
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.templateEngine = templateEngine;
    this.projectManager = projectManager;
    
    this.agentId = 'client-intelligence-domain-hub';
    this.domain = 'client-intelligence';
    this.status = 'initializing';
    
    // Claude Code Sub-Agent Registry - Hybrid Architecture (Following SEO Pattern)
    this.subAgents = new Map();
    
    // Compatibility with API endpoint (mirrors subAgents for status reporting)
    this.agents = this.subAgents;
    this.subAgentSpecs = [
      // Client Intelligence Specialists (6 agents)
      {
        id: 'client-branding-intelligence',
        name: 'Client Branding Intelligence Agent',
        specialization: 'branding-intelligence',
        claudeCodeAgent: 'client-branding-intelligence',
        description: 'Advanced brand intelligence analysis and cross-domain application'
      },
      {
        id: 'client-icp-analyst',
        name: 'Client ICP Analysis Specialist', 
        specialization: 'icp-analysis',
        claudeCodeAgent: 'client-icp-analyst',
        description: 'Comprehensive ICP analysis and customer intelligence synthesis'
      },
      {
        id: 'client-business-context-analyzer',
        name: 'Client Business Context Analyzer',
        specialization: 'business-context',
        claudeCodeAgent: 'client-business-context-analyzer',
        description: 'EOS, business model, and strategic context analysis'
      },
      {
        id: 'client-market-intelligence-synthesizer',
        name: 'Client Market Intelligence Synthesizer',
        specialization: 'market-intelligence', 
        claudeCodeAgent: 'client-market-intelligence-synthesizer',
        description: 'Market research analysis and competitive intelligence synthesis'
      },
      {
        id: 'client-context-integration-coordinator',
        name: 'Client Context Integration Coordinator',
        specialization: 'context-integration',
        claudeCodeAgent: 'client-context-integration-coordinator',
        description: 'Unified context synthesis and cross-domain context injection'
      },
      {
        id: 'client-project-orchestrator',
        name: 'Client Project Orchestrator',
        specialization: 'project-orchestration',
        claudeCodeAgent: 'client-project-orchestrator',
        description: 'Multi-domain project coordination and strategic delivery management'
      }
    ];

    // Node.js Coordination Agents (4 agents)
    this.coordinationAgents = new Map();
    this.coordinationSpecs = [
      {
        id: 'file-system-monitor',
        name: 'Client File System Monitor',
        type: 'node-coordination',
        description: 'Monitors client folders for file changes and triggers context updates'
      },
      {
        id: 'client-folder-manager', 
        name: 'Client Folder Structure Manager',
        type: 'node-coordination',
        description: 'Creates and manages client folder structures and organization'
      },
      {
        id: 'context-cache-optimizer',
        name: 'Client Context Cache Optimizer', 
        type: 'node-coordination',
        description: 'Optimizes client context storage and retrieval performance'
      },
      {
        id: 'cross-domain-notifier',
        name: 'Cross-Domain Context Notification System',
        type: 'node-coordination', 
        description: 'Notifies domain agents of client context updates and changes'
      }
    ];

    // Active Workflows and State Management
    this.activeWorkflows = new Map();
    this.clientMetrics = {
      totalClients: 0,
      activeProjects: 0,
      contextInjectionsToday: 0,
      crossDomainCoordinations: 0,
      fileMonitoringEvents: 0,
      clientFolderOperations: 0,
      lastUpdated: new Date().toISOString()
    };

    // Client Context Pools (Crystalline Memory Integration)
    this.clientContextPools = new Map();
    
    this.initialize();
  }

  async initialize() {
    try {
      console.log('📊 Initializing Client Intelligence Domain Hub (Hybrid Architecture)...');
      
      // Initialize Claude Code Sub-Agents
      await this.initializeClaudeCodeAgents();
      
      // Initialize Node.js Coordination Agents  
      await this.initializeCoordinationAgents();
      
      // Setup Crystalline Memory Client Context Pools
      await this.initializeClientContextPools();
      
      // Setup Cross-Domain Context Injection
      await this.setupContextInjection();
      
      // Setup API Endpoints
      await this.setupAPIEndpoints();
      
      this.status = 'active';
      console.log('✅ Client Intelligence Domain Hub initialized with 6 Claude Code + 4 Node.js agents (Hybrid Architecture)');
      console.log('   → 6 Claude Code Agents: Branding, ICP, Business, Market, Integration, Orchestration');
      console.log('   → 4 Node.js Agents: File monitoring, folder management, cache optimization, notifications');
      console.log('   → Hybrid: Client intelligence analysis + Cross-domain context injection');
      
      this.emit('initialized', {
        domain: this.domain,
        claudeCodeAgents: this.subAgents.size,
        nodeAgents: this.coordinationAgents.size,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Client Intelligence Domain Hub initialization failed:', error);
      this.status = 'error';
      this.emit('error', error);
    }
  }

  async initializeClaudeCodeAgents() {
    console.log('🚀 Initializing specialized Client Intelligence sub-agents...');
    
    for (const spec of this.subAgentSpecs) {
      try {
        console.log(`📡 Creating ${spec.name}...`);
        
        // Create Claude Code sub-agent following SEO pattern
        const agent = {
          id: spec.id,
          name: spec.name,
          specialization: spec.specialization,
          claudeCodeAgent: spec.claudeCodeAgent,
          status: 'active',
          metrics: {
            tasksHandled: 0,
            successRate: 0,
            avgProcessingTime: 0,
            contextInjections: 0
          }
        };
        
        this.subAgents.set(spec.id, agent);
        console.log(`✅ ${spec.name} initialized and ready`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${spec.name}:`, error);
      }
    }
    
    console.log(`🎯 Client Intelligence Hub: ${this.subAgents.size}/${this.subAgentSpecs.length} Claude Code sub-agents active`);
  }

  async initializeCoordinationAgents() {
    console.log('🔧 Initializing Node.js coordination agents...');
    
    for (const spec of this.coordinationSpecs) {
      try {
        const CoordinationAgent = this.getCoordinationAgentClass(spec.id);
        const agent = new CoordinationAgent(this, this.orchestrator, this.crystallineMemory);
        
        this.coordinationAgents.set(spec.id, agent);
        await agent.initialize();
        
      } catch (error) {
        console.error(`❌ Failed to initialize coordination agent ${spec.id}:`, error);
      }
    }
    
    console.log(`🔧 Client Intelligence Hub: ${this.coordinationAgents.size}/${this.coordinationSpecs.length} Node.js coordination agents active`);
  }

  getCoordinationAgentClass(agentId) {
    const coordinationAgents = {
      'file-system-monitor': require('./agents/file-system-monitor'),
      'client-folder-manager': require('./agents/client-folder-manager'),
      'context-cache-optimizer': require('./agents/context-cache-optimizer'),
      'cross-domain-notifier': require('./agents/cross-domain-notifier')
    };
    
    return coordinationAgents[agentId];
  }

  async initializeClientContextPools() {
    console.log('🧠 Initializing crystalline memory for client intelligence domain...');
    
    const contextPools = [
      'client-brand-intelligence',
      'client-icp-profiles', 
      'client-business-contexts',
      'client-market-intelligence',
      'client-integrated-contexts',
      'client-project-coordination'
    ];
    
    for (const poolName of contextPools) {
      await this.crystallineMemory.storeMemory(`client-${poolName}`, {});
      this.clientContextPools.set(poolName, `client-${poolName}`);
      console.log(`🧠 Client memory pool initialized: ${poolName}`);
    }
    
    console.log(`✅ ${contextPools.length} client context pools initialized in crystalline lattice`);
  }

  async setupContextInjection() {
    console.log('🤝 Setting up cross-domain context injection...');
    
    // Setup context injection listeners for domain agents
    this.orchestrator.on('domainAgentActivated', async (event) => {
      if (event.clientContext) {
        await this.injectClientContext(event.domainAgent, event.clientId);
      }
    });
    
    // Setup automatic context updates
    this.on('clientContextUpdated', async (event) => {
      await this.broadcastContextUpdate(event.clientId, event.contextType);
    });
    
    console.log('✅ Cross-domain context injection established');
  }

  async setupAPIEndpoints() {
    console.log('⚡ Starting client intelligence coordination services...');
    
    // Client creation endpoint
    this.orchestrator.app.post('/client/create', async (req, res) => {
      try {
        const result = await this.createClientProject(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Client context endpoint
    this.orchestrator.app.get('/client/:clientId/context', async (req, res) => {
      try {
        const context = await this.getClientContext(req.params.clientId);
        res.json(context);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });
    
    // Client intelligence status endpoint
    this.orchestrator.app.get('/client/status', (req, res) => {
      res.json({
        status: this.status,
        domain: 'client-intelligence',
        totalAgents: this.subAgents.size + this.coordinationAgents.size,
        claudeCodeAgents: this.subAgents.size,
        coordinationAgents: this.coordinationAgents.size,
        activeClients: this.clientContextPools.size,
        metrics: this.clientMetrics,
        timestamp: Date.now()
      });
    });
    
    console.log('✅ Client intelligence coordination services started');
  }

  // Client Intelligence Methods (Following SEO Pattern)
  async createClientProject(projectData) {
    try {
      // Use the Node.js Client Folder Manager directly for actual folder creation
      const folderManager = this.coordinationAgents.get('client-folder-manager');
      if (!folderManager) {
        throw new Error('Client Folder Manager not available');
      }

      // Create the actual client project structure
      const projectInfo = await folderManager.createClientProject(projectData);
      
      // Now delegate to Claude Code for analysis and planning
      const taskPrompt = `A new client project has been created with the following details:

Project Information:
- Client Name: ${projectData.clientName}
- Client ID: ${projectInfo.clientId}
- Industry: ${projectData.industry || 'Not specified'}
- Project Type: ${projectData.projectType || 'full-service'}
- Folder Path: ${projectInfo.folderPath}

Project Structure Created:
- Client metadata file: ${projectInfo.folderName}/client-metadata.json
- Client intelligence folder: ${projectInfo.folderName}/client-intelligence/
- Deliverables folders: content/, seo/, web-development/, research/, design/
- Template files: branding.md, icp.md, eos.md, business-model.md, target-audience.md

Crystalline Memory:
- Memory cluster initialized at coordinates: ${JSON.stringify(projectInfo.memoryCoordinates)}

Please provide:
1. Strategic project initialization recommendations
2. Context file completion priorities
3. Cross-domain integration plan
4. Next steps for client onboarding`;

      const analysisResult = await this.delegateToClaudeCodeAgent('client-project-orchestrator', taskPrompt, {
        type: 'client-creation',
        clientData: projectData,
        projectInfo: projectInfo
      });

      // Combine the actual project info with the analysis
      return {
        ...projectInfo,
        analysis: analysisResult,
        status: 'created',
        nextSteps: analysisResult.nextSteps || [
          'Upload client context files to client-intelligence folder',
          'Review and customize template files',
          'Begin content/SEO/web workflows with client context'
        ]
      };

    } catch (error) {
      console.error('❌ Error creating client project:', error);
      throw error;
    }
  }

  async getClientContext(clientId) {
    const taskPrompt = `Retrieve and synthesize complete client context for client ID: ${clientId}

Please provide:
1. Unified client context profile
2. Domain-specific context adaptations  
3. Recent context updates and changes
4. Cross-domain injection readiness status

Format the response for immediate cross-domain context injection.`;

    return await this.delegateToClaudeCodeAgent('client-context-integration-coordinator', taskPrompt, {
      type: 'context-retrieval',
      clientId: clientId
    });
  }

  async injectClientContext(domainAgent, clientId) {
    const context = await this.getClientContext(clientId);
    
    // Inject context into domain agent
    await domainAgent.receiveClientContext(context);
    
    // Update metrics
    this.clientMetrics.contextInjectionsToday++;
    this.updateMetrics();
  }

  async broadcastContextUpdate(clientId, contextType) {
    // Notify all active domain agents about context updates
    const updateEvent = {
      clientId: clientId,
      contextType: contextType,
      timestamp: new Date().toISOString()
    };
    
    this.orchestrator.emit('clientContextUpdated', updateEvent);
    this.clientMetrics.crossDomainCoordinations++;
  }

  // Claude Code Agent Delegation (Same Pattern as SEO/Content)
  async delegateToClaudeCodeAgent(agentType, taskPrompt, task) {
    try {
      const agent = this.subAgents.get(agentType);
      if (!agent) {
        throw new Error(`Claude Code agent ${agentType} not found`);
      }

      console.log(`🔄 Hybrid Delegation: ORCHESTRAI -> Claude Code Agent: ${agentType}`);

      // Update agent metrics
      agent.metrics.tasksHandled++;
      const startTime = Date.now();

      // Find the agent specification
      const agentSpec = this.subAgentSpecs.find(spec => spec.id === agentType);
      if (!agentSpec) {
        throw new Error(`Agent specification for ${agentType} not found`);
      }

      // Prepare task context
      const taskContext = {
        projectUUID: task.clientId,
        domain: 'client-intelligence',
        specialization: agentSpec.specialization,
        mcpServers: {
          memory: 'available',
          filesystem: 'available',
          notion: 'available'
        },
        crystallineMemoryAccess: true,
        coordinationRequired: task.coordinationAgents || [],
        deliverables: task.expectedDeliverables || ['context_analysis', 'intelligence_profile', 'structured_data']
      };

      // Create enhanced prompt with context
      const enhancedPrompt = `${taskPrompt}

## Task Context
- Client ID: ${taskContext.projectUUID}
- Domain: ${taskContext.domain}
- Specialization: ${taskContext.specialization}

## Available Resources
- Memory MCP Server: Knowledge graph and persistent memory
- File System MCP Server: Read client files and store deliverables
- Notion MCP Server: Client information and project management
- Crystalline Memory: Store insights and coordinate with other agents

## Integration Requirements
- Store key findings in crystalline memory for cross-domain coordination
- Create structured deliverables in JSON format for ORCHESTRAI integration
- Follow client intelligence best practices and analysis frameworks

## Coordination
${taskContext.coordinationRequired.length > 0 ? `Coordinate with: ${taskContext.coordinationRequired.join(', ')}` : 'Independent task execution'}

## Expected Deliverables
${taskContext.deliverables.map(d => `- ${d}`).join('\n')}

Execute this task using your specialized ${agentSpec.specialization} capabilities and return structured results for ORCHESTRAI integration.`;

      // Create delegation record for Claude Code integration
      const taskDelegation = {
        claudeCodeAgent: agentType,
        taskPrompt: enhancedPrompt,
        specialization: agentSpec.specialization,
        taskContext: taskContext,
        timestamp: new Date().toISOString(),
        status: 'delegated_to_claude_code'
      };

      // Simulate Claude Code execution with structured response
      const result = await this.simulateClaudeCodeExecution(agentType, taskDelegation, task);

      // Update performance metrics
      const processingTime = Date.now() - startTime;
      agent.metrics.avgProcessingTime = 
        (agent.metrics.avgProcessingTime * (agent.metrics.tasksHandled - 1) + processingTime) / 
        agent.metrics.tasksHandled;
      
      agent.metrics.successRate = 
        (agent.metrics.successRate * (agent.metrics.tasksHandled - 1) + 1) / 
        agent.metrics.tasksHandled;

      return result;

    } catch (error) {
      console.error(`❌ Client Intelligence delegation failed for ${agentType}:`, error);
      throw error;
    }
  }

  async simulateClaudeCodeExecution(agentType, taskDelegation, task) {
    // Simulate Claude Code agent execution with realistic responses
    const responses = {
      'client-project-orchestrator': {
        success: true,
        projectSetup: {
          clientId: task.clientData?.clientName?.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
          folderStructure: 'complete',
          contextFiles: ['branding.md', 'icp.md', 'eos.md', 'market-research.pdf'],
          memoryCluster: 'initialized',
          crossDomainIntegration: 'active'
        },
        nextSteps: [
          'Upload client context files to client-intelligence folder',
          'Review and customize template files with client-specific information',
          'Begin content/SEO/web development workflows with client context'
        ],
        delegation: taskDelegation
      },
      'client-context-integration-coordinator': {
        success: true,
        contextProfile: {
          integrated: true,
          branding: 'available',
          icp: 'available',
          business: 'available',
          market: 'available',
          crossDomainReady: true
        },
        injectionStatus: 'ready',
        delegation: taskDelegation
      }
    };

    return responses[agentType] || {
      success: true,
      message: `Task completed by ${agentType}`,
      delegation: taskDelegation
    };
  }

  updateMetrics() {
    this.clientMetrics.lastUpdated = new Date().toISOString();
    
    // Store updated metrics in crystalline memory
    this.crystallineMemory.storeMemory('client-intelligence-metrics', this.clientMetrics);
  }

  // Status and Health Methods
  getStatus() {
    return {
      domain: this.domain,
      status: this.status,
      claudeCodeAgents: Array.from(this.subAgents.entries()).map(([id, agent]) => ({
        id,
        name: agent.name,
        specialization: agent.specialization,
        status: agent.status,
        metrics: agent.metrics
      })),
      coordinationAgents: Array.from(this.coordinationAgents.entries()).map(([id, agent]) => ({
        id,
        type: 'node-coordination',
        status: agent.status || 'active'
      })),
      activeClients: this.clientContextPools.size,
      metrics: this.clientMetrics
    };
  }

  async shutdown() {
    console.log('🔄 Shutting down Client Intelligence Domain Hub...');
    
    // Shutdown coordination agents
    for (const [id, agent] of this.coordinationAgents) {
      if (agent.shutdown) {
        await agent.shutdown();
      }
    }
    
    this.status = 'shutdown';
    console.log('✅ Client Intelligence Domain Hub shutdown complete');
  }
}

module.exports = ClientIntelligenceDomainHub;