/**
 * ORCHESTRAI Research-to-Memory Integration for Main Orchestrator
 * 
 * Integrates the automated research pipeline into the main orchestrator
 * to ensure all research data flows seamlessly into memory system
 */

const AutomatedResearchIntegration = require('./automated-research-pipeline');
const integrationConfig = require('./integration-config.json');

class ORCHESTRAIResearchIntegration {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.memoryManager = orchestrator.memoryManager;
    this.mcpManager = orchestrator.mcpManager;
    this.researchPipeline = null;
    this.isInitialized = false;
    this.stats = {
      integratedFiles: 0,
      integratedEntities: 0,
      errors: 0,
      lastIntegration: null
    };
  }

  /**
   * Initialize the research integration system
   */
  async initialize() {
    try {
      console.log('🔬 Initializing Research-to-Memory Integration Pipeline...');
      
      // Create the automated research integration instance
      this.researchPipeline = new AutomatedResearchIntegration(
        this.memoryManager,
        this.mcpManager
      );
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start monitoring existing projects
      await this.researchPipeline.startAutomaticMonitoring();
      
      // Integrate existing research data
      await this.performInitialDataIntegration();
      
      this.isInitialized = true;
      
      console.log('✅ Research-to-Memory Integration Pipeline initialized successfully');
      console.log(`📊 Stats: ${this.stats.integratedFiles} files, ${this.stats.integratedEntities} entities integrated`);
      
      return {
        success: true,
        stats: this.stats,
        config: integrationConfig
      };
      
    } catch (error) {
      console.error('❌ Error initializing research integration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set up event listeners for integration events
   */
  setupEventListeners() {
    // Listen for new research integrations
    this.researchPipeline.on('research-integrated', (data) => {
      this.stats.integratedFiles++;
      this.stats.integratedEntities += data.entityCount || 0;
      this.stats.lastIntegration = Date.now();
      
      // Notify agents about new research data
      this.notifyAgents('research-integrated', data);
    });
    
    // Listen for integration errors
    this.researchPipeline.on('integration-error', (error) => {
      this.stats.errors++;
      console.error('❌ Research integration error:', error);
      
      // Notify orchestrator about errors
      this.orchestrator.emit('research-integration-error', error);
    });
    
    // Listen for memory updates
    this.researchPipeline.on('memory-updated', (data) => {
      // Trigger memory reindexing if needed
      this.memoryManager.scheduleReindex();
    });
  }

  /**
   * Perform initial integration of existing research data
   */
  async performInitialDataIntegration() {
    try {
      console.log('📚 Performing initial research data integration...');
      
      // Get all projects
      const projectsPath = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects';
      const projects = await require('fs').promises.readdir(projectsPath);
      
      for (const project of projects) {
        if (project.startsWith('.')) continue;
        
        await this.integrateProjectResearch(project);
      }
      
      console.log('✅ Initial research data integration complete');
      
    } catch (error) {
      console.error('❌ Error in initial data integration:', error);
    }
  }

  /**
   * Integrate research data for a specific project
   */
  async integrateProjectResearch(projectId) {
    try {
      const projectPath = `/Users/kris/CLAUDEtools/ORCHESTRAI/projects/${projectId}`;
      
      // Check if it's the nasmehPG project and needs immediate integration
      if (projectId.includes('nasmehpg')) {
        console.log(`🎯 Priority integration for nasmehPG project: ${projectId}`);
        await this.integrateNasmehPGResearch(projectId, projectPath);
      }
      
      return {
        success: true,
        projectId,
        integratedFiles: this.stats.integratedFiles
      };
      
    } catch (error) {
      console.error(`❌ Error integrating research for ${projectId}:`, error);
      return {
        success: false,
        projectId,
        error: error.message
      };
    }
  }

  /**
   * Priority integration for nasmehPG project research
   */
  async integrateNasmehPGResearch(projectId, projectPath) {
    try {
      // Integrate psychographic research
      const psychographicPath = `${projectPath}/client-intelligence/psychographic-research/slovenian-psychographic-keyword-analysis.json`;
      await this.integrateResearchFile(projectId, psychographicPath, 'psychographic');
      
      // Integrate semantic clustering
      const semanticPath = `${projectPath}/deliverables/seo/semantic-clustering-memory-integration.json`;
      await this.integrateResearchFile(projectId, semanticPath, 'semantic');
      
      // Integrate other SEO files
      const seoFiles = [
        'semantic-clustering-analysis-zobni-implantati-slovenija.json',
        'slovenian-dental-implant-semantic-cluster-map.md',
        'slovenian-psychographic-research-comprehensive-report.md'
      ];
      
      for (const filename of seoFiles) {
        const filePath = `${projectPath}/deliverables/seo/${filename}`;
        await this.integrateResearchFile(projectId, filePath, 'seo');
      }
      
      console.log(`✅ nasmehPG research integration complete for ${projectId}`);
      
    } catch (error) {
      console.error(`❌ Error integrating nasmehPG research:`, error);
    }
  }

  /**
   * Integrate a specific research file
   */
  async integrateResearchFile(projectId, filePath, researchType) {
    try {
      const fs = require('fs').promises;
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }
      
      // Use the research pipeline to process the file
      await this.researchPipeline.handleFileChange('add', projectId, filePath);
      
      console.log(`✅ Integrated ${researchType} file: ${require('path').basename(filePath)}`);
      
    } catch (error) {
      console.error(`❌ Error integrating file ${filePath}:`, error);
    }
  }

  /**
   * Notify agents about research integration events
   */
  notifyAgents(eventType, data) {
    const config = integrationConfig.agentNotification;
    
    if (!config.enabled) return;
    
    const notification = {
      event: eventType,
      data: config.triggers[eventType]?.includeData ? data : null,
      timestamp: Date.now(),
      priority: config.triggers[eventType]?.priority || 'medium'
    };
    
    // Send WebSocket notifications
    if (config.notificationMethods.includes('websocket')) {
      this.orchestrator.broadcast('research-integration', notification);
    }
    
    // Send Redis pub/sub notifications
    if (config.notificationMethods.includes('redis-pub')) {
      this.orchestrator.publishToRedis('research-integration', notification);
    }
    
    // Trigger specific agents if configured
    const triggerConfig = config.triggers[eventType];
    if (triggerConfig?.notify) {
      for (const agentType of triggerConfig.notify) {
        this.orchestrator.notifyAgent(agentType, notification);
      }
    }
  }

  /**
   * Get integration status and statistics
   */
  getIntegrationStatus() {
    const pipelineStats = this.researchPipeline?.getIntegrationStats() || {};
    
    return {
      initialized: this.isInitialized,
      stats: this.stats,
      pipeline: pipelineStats,
      config: {
        enabled: integrationConfig.automatedIntegration.enabled,
        monitoringMode: integrationConfig.automatedIntegration.monitoringMode,
        supportedTypes: Object.keys(integrationConfig.researchTypes)
      }
    };
  }

  /**
   * Manually trigger integration for a specific project
   */
  async triggerIntegration(projectId) {
    try {
      console.log(`🔄 Manually triggering integration for ${projectId}`);
      
      const result = await this.integrateProjectResearch(projectId);
      
      return {
        success: true,
        message: `Integration triggered for ${projectId}`,
        result
      };
      
    } catch (error) {
      console.error(`❌ Error triggering integration for ${projectId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Health check for the integration system
   */
  async performHealthCheck() {
    const healthChecks = integrationConfig.healthChecks;
    
    if (!healthChecks.enabled) {
      return { healthy: true, message: 'Health checks disabled' };
    }
    
    const checks = {
      integrationPipeline: this.researchPipeline !== null,
      memoryConnection: this.memoryManager !== null,
      mcpConnection: this.mcpManager?.isAvailable() || false,
      errorRate: this.stats.errors / (this.stats.integratedFiles || 1),
      lastIntegration: this.stats.lastIntegration
    };
    
    const issues = [];
    
    if (!checks.integrationPipeline) issues.push('Integration pipeline not initialized');
    if (!checks.memoryConnection) issues.push('Memory manager not available');
    if (checks.errorRate > healthChecks.alerts.highErrorRate) issues.push('High error rate detected');
    
    return {
      healthy: issues.length === 0,
      checks,
      issues,
      timestamp: Date.now()
    };
  }

  /**
   * Shutdown the integration system
   */
  async shutdown() {
    try {
      if (this.researchPipeline) {
        await this.researchPipeline.stopMonitoring();
      }
      
      this.isInitialized = false;
      console.log('🛑 Research-to-Memory Integration Pipeline shut down');
      
    } catch (error) {
      console.error('❌ Error shutting down research integration:', error);
    }
  }
}

module.exports = ORCHESTRAIResearchIntegration;