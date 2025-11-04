const WebDevelopmentQualityHub = require('./web-quality-domain-hub');
const QualityMetricsManager = require('./utils/quality-metrics-manager');

class WebQualityDomainRegistry {
  constructor(mainOrchestrator, mcpManager, crystallineMemory) {
    this.mainOrchestrator = mainOrchestrator;
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    
    // Initialize domain components
    this.qualityHub = null;
    this.metricsManager = null;
    this.initialized = false;
    
    this.domainConfig = {
      domainId: 'web-development-quality',
      version: '1.0.0',
      priority: 'high',
      capabilities: [
        'phase-validation',
        'visual-regression-testing',
        'accessibility-validation',
        'performance-testing',
        'responsive-design-validation',
        'browser-compatibility-testing',
        'user-flow-testing',
        'quality-metrics-reporting'
      ],
      integrations: [
        'browser-mcp',
        'playwright-mcp',
        'crystalline-memory',
        'claude-code-agents'
      ],
      qualityGates: [
        'ux-to-wireframe',
        'wireframe-to-design',
        'design-to-development',
        'development-to-production'
      ]
    };
    
    this.registration = {
      status: 'pending',
      registeredAt: null,
      lastHealthCheck: null,
      errors: []
    };
  }

  async registerWithOrchestrator() {
    try {
      console.log('🚀 Registering Web Development Quality Domain with main orchestrator...');
      
      // Initialize metrics manager first
      this.metricsManager = new QualityMetricsManager(this.crystallineMemory);
      
      // Initialize quality hub
      this.qualityHub = new WebDevelopmentQualityHub(
        this.mainOrchestrator,
        this.mcpManager,
        this.crystallineMemory
      );
      
      // Set up metrics integration
      this.setupMetricsIntegration();
      
      // Initialize the quality hub
      await this.qualityHub.initializeDomain();
      
      // Register domain with main orchestrator
      const registrationResult = await this.mainOrchestrator.registerDomain({
        domainId: this.domainConfig.domainId,
        domainHub: this.qualityHub,
        capabilities: this.domainConfig.capabilities,
        priority: this.domainConfig.priority,
        healthCheck: () => this.performHealthCheck(),
        metricsProvider: () => this.metricsManager.getStatus(),
        version: this.domainConfig.version
      });
      
      if (registrationResult.success) {
        this.registration.status = 'registered';
        this.registration.registeredAt = Date.now();
        this.initialized = true;
        
        console.log('✅ Web Development Quality Domain registered successfully');
        
        // Store registration in crystalline memory
        await this.crystallineMemory.storeMemory('domain-registration', {
          type: 'web-quality-domain-registration',
          domainId: this.domainConfig.domainId,
          registration: this.registration,
          config: this.domainConfig,
          timestamp: Date.now()
        });
        
        // Start periodic health checks
        this.startHealthChecks();
        
        return {
          success: true,
          domainId: this.domainConfig.domainId,
          registration: this.registration
        };
      } else {
        throw new Error(`Registration failed: ${registrationResult.error}`);
      }
    } catch (error) {
      console.error('❌ Failed to register Web Quality Domain:', error);
      this.registration.status = 'failed';
      this.registration.errors.push({
        timestamp: Date.now(),
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  setupMetricsIntegration() {
    // Set up event listeners for metrics collection
    this.qualityHub.on('phaseValidationComplete', (data) => {
      this.metricsManager.recordPhaseValidationMetrics(
        data.projectId,
        data.phase,
        data.validationResults
      );
    });
    
    this.qualityHub.on('agentTaskComplete', (data) => {
      this.metricsManager.recordAgentPerformanceMetrics(
        data.agentId,
        data.taskData,
        data.performance
      );
    });
    
    this.qualityHub.on('qualityTrendUpdate', (data) => {
      this.metricsManager.recordQualityTrendMetrics(
        data.domain,
        data.category,
        data.trendData
      );
    });
    
    // Set up alert forwarding
    this.metricsManager.on('qualityAlert', (alert) => {
      this.mainOrchestrator.handleAlert({
        domain: this.domainConfig.domainId,
        type: 'quality',
        alert,
        timestamp: Date.now()
      });
    });
    
    this.metricsManager.on('performanceAlert', (alert) => {
      this.mainOrchestrator.handleAlert({
        domain: this.domainConfig.domainId,
        type: 'performance',
        alert,
        timestamp: Date.now()
      });
    });
  }

  async performHealthCheck() {
    try {
      const healthCheck = {
        timestamp: Date.now(),
        domainId: this.domainConfig.domainId,
        status: 'healthy',
        components: {},
        metrics: {},
        issues: []
      };
      
      // Check quality hub health
      if (this.qualityHub && this.qualityHub.getStatus) {
        const hubStatus = this.qualityHub.getStatus();
        healthCheck.components.qualityHub = {
          status: hubStatus.active ? 'healthy' : 'unhealthy',
          activeAgents: hubStatus.activeAgents || 0,
          lastActivity: hubStatus.lastActivity
        };
      }
      
      // Check metrics manager health
      if (this.metricsManager && this.metricsManager.getStatus) {
        const metricsStatus = this.metricsManager.getStatus();
        healthCheck.components.metricsManager = {
          status: metricsStatus.active ? 'healthy' : 'unhealthy',
          metricsCollected: metricsStatus.metricsCollected,
          healthScore: metricsStatus.healthScore
        };
      }
      
      // Check MCP integrations
      if (this.mcpManager) {
        const mcpStatus = await this.mcpManager.getHealthStatus();
        healthCheck.components.mcpIntegrations = mcpStatus;
      }
      
      // Check crystalline memory connection
      try {
        await this.crystallineMemory.storeMemory('health-check', {
          domainId: this.domainConfig.domainId,
          timestamp: Date.now(),
          test: true
        });
        healthCheck.components.crystallineMemory = { status: 'healthy' };
      } catch (error) {
        healthCheck.components.crystallineMemory = { 
          status: 'unhealthy',
          error: error.message 
        };
        healthCheck.issues.push(`Crystalline memory connection issue: ${error.message}`);
      }
      
      // Overall health assessment
      const unhealthyComponents = Object.values(healthCheck.components)
        .filter(component => component.status !== 'healthy');
      
      if (unhealthyComponents.length > 0) {
        healthCheck.status = 'degraded';
        healthCheck.issues.push(`${unhealthyComponents.length} components unhealthy`);
      }
      
      // Update registration
      this.registration.lastHealthCheck = healthCheck.timestamp;
      
      // Store health check in crystalline memory
      await this.crystallineMemory.storeMemory('domain-health-checks', {
        type: 'web-quality-domain-health',
        healthCheck,
        timestamp: healthCheck.timestamp
      });
      
      return healthCheck;
    } catch (error) {
      console.error('Health check failed for Web Quality Domain:', error);
      return {
        timestamp: Date.now(),
        domainId: this.domainConfig.domainId,
        status: 'unhealthy',
        error: error.message,
        issues: [`Health check failed: ${error.message}`]
      };
    }
  }

  startHealthChecks() {
    // Perform health check every 5 minutes
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Periodic health check failed:', error);
      }
    }, 5 * 60 * 1000);
    
    console.log('🔍 Periodic health checks started for Web Quality Domain');
  }

  async generateDomainReport() {
    try {
      if (!this.initialized) {
        throw new Error('Domain not initialized');
      }
      
      const report = {
        domainId: this.domainConfig.domainId,
        timestamp: Date.now(),
        registration: this.registration,
        configuration: this.domainConfig,
        healthStatus: await this.performHealthCheck(),
        qualityMetrics: this.metricsManager ? this.metricsManager.getStatus() : null,
        agentStatus: this.qualityHub ? this.qualityHub.getAllAgentsStatus() : null,
        mcpIntegrations: this.mcpManager ? await this.mcpManager.getIntegrationStatus() : null
      };
      
      // Store report in crystalline memory
      await this.crystallineMemory.storeMemory('domain-reports', {
        type: 'web-quality-domain-report',
        report,
        timestamp: report.timestamp
      });
      
      return report;
    } catch (error) {
      console.error('Failed to generate domain report:', error);
      throw error;
    }
  }

  async unregisterFromOrchestrator() {
    try {
      console.log('🛑 Unregistering Web Development Quality Domain...');
      
      if (this.mainOrchestrator && this.registration.status === 'registered') {
        await this.mainOrchestrator.unregisterDomain(this.domainConfig.domainId);
      }
      
      // Clean up components
      if (this.qualityHub && this.qualityHub.shutdown) {
        await this.qualityHub.shutdown();
      }
      
      // Update registration status
      this.registration.status = 'unregistered';
      this.initialized = false;
      
      // Store unregistration in crystalline memory
      await this.crystallineMemory.storeMemory('domain-registration', {
        type: 'web-quality-domain-unregistration',
        domainId: this.domainConfig.domainId,
        registration: this.registration,
        timestamp: Date.now()
      });
      
      console.log('✅ Web Development Quality Domain unregistered successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to unregister Web Quality Domain:', error);
      throw error;
    }
  }

  // Utility methods for domain management
  getDomainInfo() {
    return {
      domainId: this.domainConfig.domainId,
      version: this.domainConfig.version,
      status: this.registration.status,
      initialized: this.initialized,
      capabilities: this.domainConfig.capabilities,
      integrations: this.domainConfig.integrations,
      qualityGates: this.domainConfig.qualityGates
    };
  }

  isHealthy() {
    return this.registration.status === 'registered' && this.initialized;
  }

  getMetricsManager() {
    return this.metricsManager;
  }

  getQualityHub() {
    return this.qualityHub;
  }
}

module.exports = WebQualityDomainRegistry;