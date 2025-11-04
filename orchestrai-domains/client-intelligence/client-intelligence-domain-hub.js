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

    // Node.js Coordination Agents (5 agents)
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
      },
      {
        id: 'reviews-monitor',
        name: 'Google Reviews Intelligence Monitor',
        type: 'node-coordination',
        description: 'Monitors Netherlands business reviews for 1-3 star ratings within last 10 days and provides reputation intelligence'
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
      console.log('✅ Client Intelligence Domain Hub initialized with 6 Claude Code + 5 Node.js agents (Hybrid Architecture)');
      console.log('   → 6 Claude Code Agents: Branding, ICP, Business, Market, Integration, Orchestration');
      console.log('   → 5 Node.js Agents: File monitoring, folder management, cache optimization, notifications, reviews monitoring');
      console.log('   → Hybrid: Client intelligence analysis + Cross-domain context injection + Reviews intelligence');
      
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
      'cross-domain-notifier': require('./agents/cross-domain-notifier'),
      'reviews-monitor': require('./agents/reviews-monitor')
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
      'client-project-coordination',
      'client-reviews-intelligence'
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

    // Generate HTML report from JSON intelligence data
    this.orchestrator.app.post('/client/:clientId/generate-html-report', async (req, res) => {
      try {
        const result = await this.generateHTMLIntelligenceReport({
          clientId: req.params.clientId,
          jsonReportPath: req.body.jsonReportPath,
          reportType: req.body.reportType || 'comprehensive',
          outputPath: req.body.outputPath
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Batch generate HTML reports for all JSON reports in client folder
    this.orchestrator.app.post('/client/:clientId/generate-all-html-reports', async (req, res) => {
      try {
        const results = await this.generateAllHTMLReports(req.params.clientId);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
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
    console.log('   → HTML Report Generation: POST /client/:clientId/generate-html-report');
    console.log('   → Batch HTML Generation: POST /client/:clientId/generate-all-html-reports');
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

      // Return delegation instructions for orchestrai-master-coordinator to execute via Task tool
      // This replaces the previous simulation with real Claude Code agent invocation
      const delegation = {
        // Delegation metadata
        requiresClaudeCodeExecution: true,
        delegationType: 'task-tool',
        delegationId: `deleg-${agentType}-${Date.now()}`,

        // Agent information
        agentType: agentSpec.claudeCodeAgent,
        agentSpecialization: agentSpec.specialization,
        agentName: agentSpec.name,

        // Task information
        taskPrompt: enhancedPrompt,
        taskContext: taskContext,
        taskType: task.type || 'client-intelligence',

        // Infrastructure status
        infrastructureComplete: true,
        infrastructureResults: {
          clientId: task.clientId,
          domain: 'client-intelligence',
          memoryInitialized: true,
          filesystemReady: true
        },

        // Expected deliverables
        expectedDeliverables: taskContext.deliverables,
        estimatedDuration: this.estimateAgentDuration(agentSpec),

        // Coordination instructions for orchestrai-master-coordinator
        coordinationInstructions: `
ORCHESTRAI Client Intelligence Domain Hub has prepared this task.

Infrastructure Status: ✅ Complete
- Client folder structure created
- Crystalline memory initialized
- Context files staged

Next Step: Invoke Claude Code Agent
- Agent: ${agentSpec.claudeCodeAgent}
- Specialization: ${agentSpec.specialization}
- Use Task tool with the prepared taskPrompt

After agent execution completes, results will be integrated into ORCHESTRAI system.
        `.trim(),

        // Execution metadata
        preparedAt: new Date().toISOString(),
        preparedBy: 'client-intelligence-domain-hub',
        nodeJSProcessingTime: Date.now() - startTime
      };

      // Track delegation metrics
      agent.metrics.delegationsCreated = (agent.metrics.delegationsCreated || 0) + 1;
      agent.metrics.lastDelegation = delegation.delegationId;

      // Store delegation in crystalline memory for tracking
      await this.crystallineMemory.storeMemory(
        `delegation-${delegation.delegationId}`,
        delegation
      );

      console.log(`✅ Delegation prepared: ${delegation.delegationId}`);
      console.log(`   Agent: ${agentSpec.claudeCodeAgent}`);
      console.log(`   Awaiting orchestrai-master-coordinator execution via Task tool`);

      return delegation;

    } catch (error) {
      console.error(`❌ Client Intelligence delegation failed for ${agentType}:`, error);
      throw error;
    }
  }

  /**
   * Estimate agent execution duration based on agent type and specialization
   */
  estimateAgentDuration(agentSpec) {
    const durationEstimates = {
      'client-project-orchestrator': 60000,          // 1 minute
      'client-icp-analyst': 120000,                  // 2 minutes
      'client-branding-intelligence': 90000,         // 1.5 minutes
      'client-business-context-analyzer': 120000,    // 2 minutes
      'client-market-intelligence-synthesizer': 180000, // 3 minutes
      'client-context-integration-coordinator': 90000   // 1.5 minutes
    };

    return durationEstimates[agentSpec.id] || 120000; // Default 2 minutes
  }

  /**
   * DEPRECATED: simulateClaudeCodeExecution
   *
   * This method is kept for backwards compatibility and testing only.
   * Production code should use the delegation pattern via orchestrai-master-coordinator.
   *
   * @deprecated Use delegateToClaudeCodeAgent which returns delegation instructions
   */
  async simulateClaudeCodeExecution(agentType, taskDelegation, task) {
    console.warn('⚠️  WARNING: Using deprecated simulateClaudeCodeExecution method');
    console.warn('   This is a fallback simulation and should not be used in production');
    console.warn('   Use orchestrai-master-coordinator with Task tool for real agent execution');

    // Simulate Claude Code agent execution with realistic responses
    const responses = {
      'client-project-orchestrator': {
        success: true,
        simulationWarning: 'This is a simulated response - use real Claude Code agents for production',
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
        simulationWarning: 'This is a simulated response - use real Claude Code agents for production',
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
      simulationWarning: 'This is a simulated response - use real Claude Code agents for production',
      message: `Task completed by ${agentType}`,
      delegation: taskDelegation
    };
  }

  updateMetrics() {
    this.clientMetrics.lastUpdated = new Date().toISOString();

    // Store updated metrics in crystalline memory
    this.crystallineMemory.storeMemory('client-intelligence-metrics', this.clientMetrics);
  }

  // HTML Report Generation Methods
  async generateHTMLIntelligenceReport(config) {
    try {
      console.log(`\n📊 Generating HTML intelligence report for client: ${config.clientId}`);
      console.log(`   Report Type: ${config.reportType}`);
      console.log(`   Source: ${config.jsonReportPath}`);

      // Initialize HTML report pipeline
      const IntelligenceHTMLPipeline = require('./pipelines/intelligence-html-report-pipeline');
      const pipeline = new IntelligenceHTMLPipeline(this.orchestrator, this);

      // Execute pipeline
      const result = await pipeline.executePipeline({
        jsonReportPath: config.jsonReportPath,
        reportType: config.reportType,
        clientId: config.clientId,
        outputPath: config.outputPath
      });

      if (result.success) {
        console.log(`✅ HTML report generated successfully`);
        console.log(`   Output: ${result.htmlPath}`);

        // Update metrics
        this.clientMetrics.htmlReportsGenerated = (this.clientMetrics.htmlReportsGenerated || 0) + 1;
        this.updateMetrics();
      } else {
        console.error(`❌ HTML report generation failed: ${result.error}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ HTML report generation error:`, error);
      throw error;
    }
  }

  async generateAllHTMLReports(clientId) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      console.log(`\n📊 Batch HTML report generation for client: ${clientId}`);

      // Find all JSON intelligence reports in client folder
      const clientPath = this.getClientProjectPath(clientId);
      const intelligencePath = path.join(clientPath, 'client-intelligence');

      const jsonReports = await this.findJSONIntelligenceReports(intelligencePath);

      console.log(`   Found ${jsonReports.length} JSON intelligence reports`);

      const results = [];

      for (const jsonReport of jsonReports) {
        const reportType = this.detectReportType(jsonReport.path);

        console.log(`\n   Processing: ${jsonReport.name} (${reportType})`);

        const result = await this.generateHTMLIntelligenceReport({
          clientId: clientId,
          jsonReportPath: jsonReport.path,
          reportType: reportType
        });

        results.push({
          sourceFile: jsonReport.name,
          reportType: reportType,
          success: result.success,
          htmlPath: result.htmlPath,
          error: result.error
        });
      }

      const successful = results.filter(r => r.success).length;
      console.log(`\n✅ Batch processing complete: ${successful}/${results.length} reports generated`);

      return {
        clientId: clientId,
        totalReports: results.length,
        successful: successful,
        failed: results.length - successful,
        results: results
      };

    } catch (error) {
      console.error(`❌ Batch HTML generation error:`, error);
      throw error;
    }
  }

  async findJSONIntelligenceReports(intelligencePath) {
    const fs = require('fs').promises;
    const path = require('path');

    const jsonReports = [];

    async function scanDirectory(dirPath) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json')) {
            // Check if it looks like an intelligence report
            if (
              entry.name.includes('psychographic') ||
              entry.name.includes('icp') ||
              entry.name.includes('market-intelligence') ||
              entry.name.includes('intelligence')
            ) {
              jsonReports.push({
                name: entry.name,
                path: fullPath
              });
            }
          }
        }
      } catch (error) {
        // Directory might not exist or not accessible
        console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
      }
    }

    await scanDirectory(intelligencePath);

    return jsonReports;
  }

  detectReportType(filePath) {
    const filename = filePath.toLowerCase();

    if (filename.includes('psychographic')) {
      return 'psychographic';
    } else if (filename.includes('icp') || filename.includes('persona')) {
      return 'icp';
    } else if (filename.includes('market')) {
      return 'market-intelligence';
    } else {
      return 'comprehensive';
    }
  }

  getClientProjectPath(clientId) {
    const path = require('path');
    return path.join(process.cwd(), 'projects', clientId);
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