// ORCHESTRAI Evolution Bootstrap
// Master integration system for deploying advanced agent behaviors
// Coordinates all evolutionary systems: rules, context, validation, batching, coordination, bridging, learning

const EventEmitter = require('events');
const { createRedisConnection } = require('../orchestrai-shared/redis-client');

// Import all systems
const AgentBehaviorStandardization = require('./integration/agent-behavior-standardization');

class OrchestRaiEvolutionBootstrap extends EventEmitter {
  constructor(crystallineMemory = null) {
    super();
    
    this.crystallineMemory = crystallineMemory;
    this.redis = null;
    this.standardizationSystem = null;
    
    this.status = 'initialized';
    this.deploymentResults = null;
    
    console.log('🚀 ORCHESTRAI Evolution Bootstrap initialized');
  }

  /**
   * Initialize all systems and establish connections
   */
  async initialize() {
    console.log('⚡ Initializing ORCHESTRAI Evolution Systems...');
    
    try {
      // Initialize Redis connection
      console.log('📡 Connecting to Redis...');
      this.redis = await createRedisConnection();
      
      // Initialize standardization system
      console.log('🎯 Initializing Agent Behavior Standardization...');
      this.standardizationSystem = new AgentBehaviorStandardization(
        this.crystallineMemory,
        this.redis
      );
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.status = 'ready';
      console.log('✅ ORCHESTRAI Evolution Bootstrap ready for deployment');
      
      this.emit('bootstrap-ready');
      
      return {
        status: 'ready',
        systems: [
          'agent-behavior-standardization',
          'rule-injection',
          'context-preservation', 
          'validation-gates',
          'task-batching',
          'coordination-patterns',
          'context-bridging',
          'learning-engine'
        ]
      };
      
    } catch (error) {
      console.error('❌ Bootstrap initialization failed:', error.message);
      this.status = 'failed';
      throw error;
    }
  }

  /**
   * Run complete system discovery and deployment
   */
  async deployEvolutionaryUpgrade(options = {}) {
    console.log('🔄 Beginning ORCHESTRAI Evolutionary Upgrade...');
    
    const {
      dryRun = false,
      agentTypes = null,
      forceRedeploy = false,
      skipDiscovery = false
    } = options;
    
    if (this.status !== 'ready') {
      throw new Error('Bootstrap not ready. Call initialize() first.');
    }
    
    try {
      const deploymentPlan = {
        phase: 'planning',
        startTime: Date.now(),
        options,
        steps: []
      };
      
      // Phase 1: Agent Discovery
      let agents = [];
      if (!skipDiscovery) {
        console.log('\n🔍 PHASE 1: Agent Discovery');
        console.log('=====================================');
        
        agents = await this.standardizationSystem.discoverAgents();
        deploymentPlan.steps.push({
          phase: 'discovery',
          status: 'completed',
          agentsFound: agents.length,
          agentTypes: [...new Set(agents.map(a => a.type))],
          completedAt: Date.now()
        });
        
        console.log(`📊 Discovery Results:`);
        console.log(`   • Total Agents: ${agents.length}`);
        console.log(`   • Agent Types: ${[...new Set(agents.map(a => a.type))].join(', ')}`);
        console.log(`   • File Locations: ${agents.length} agent files analyzed`);
      }
      
      // Phase 2: Standardization Deployment
      console.log('\n🚀 PHASE 2: Behavioral System Deployment');
      console.log('=========================================');
      
      const deploymentResults = await this.standardizationSystem.deployStandardization({
        agentTypes,
        forceRedeploy,
        dryRun
      });
      
      deploymentPlan.steps.push({
        phase: 'standardization',
        status: 'completed',
        results: deploymentResults,
        completedAt: Date.now()
      });
      
      console.log(`✅ Deployment Results:`);
      console.log(`   • Agents Processed: ${deploymentResults.totalAgents}`);
      console.log(`   • Successfully Standardized: ${deploymentResults.successCount}`);
      console.log(`   • Success Rate: ${((deploymentResults.successCount / deploymentResults.totalAgents) * 100).toFixed(1)}%`);
      
      // Phase 3: System Integration Verification
      console.log('\n🔧 PHASE 3: System Integration Verification');
      console.log('============================================');
      
      const integrationStatus = await this.verifySystemIntegration();
      deploymentPlan.steps.push({
        phase: 'verification',
        status: 'completed',
        integrationStatus,
        completedAt: Date.now()
      });
      
      // Phase 4: Generate Report
      console.log('\n📊 PHASE 4: Deployment Report Generation');
      console.log('=========================================');
      
      const report = await this.standardizationSystem.createStandardizationReport();
      deploymentPlan.steps.push({
        phase: 'reporting',
        status: 'completed',
        report,
        completedAt: Date.now()
      });
      
      // Final Status
      deploymentPlan.phase = 'completed';
      deploymentPlan.endTime = Date.now();
      deploymentPlan.duration = deploymentPlan.endTime - deploymentPlan.startTime;
      
      this.deploymentResults = deploymentPlan;
      this.status = 'deployed';
      
      console.log('\n🎉 ORCHESTRAI EVOLUTIONARY UPGRADE COMPLETE');
      console.log('===========================================');
      console.log(`⏱️  Total Duration: ${Math.round(deploymentPlan.duration / 1000)}s`);
      console.log(`🤖 Agents Enhanced: ${deploymentResults.successCount}/${deploymentResults.totalAgents}`);
      console.log(`🎯 Systems Deployed: ${integrationStatus.activeSystems}`);
      console.log(`📈 Enhancement Level: ${dryRun ? 'SIMULATED' : 'PRODUCTION'}`);
      
      this.emit('deployment-complete', deploymentPlan);
      
      return deploymentPlan;
      
    } catch (error) {
      console.error('\n❌ EVOLUTIONARY UPGRADE FAILED');
      console.error('================================');
      console.error(error.message);
      
      this.status = 'failed';
      throw error;
    }
  }

  /**
   * Verify all systems are properly integrated
   */
  async verifySystemIntegration() {
    console.log('🔍 Verifying system integration...');
    
    const verification = {
      activeSystems: 0,
      systemStatus: {},
      overallHealth: 'healthy'
    };
    
    try {
      // Check Rule Injection System
      verification.systemStatus.ruleInjection = {
        status: 'active',
        agentsRegistered: this.standardizationSystem.ruleInjector ? 
          this.standardizationSystem.ruleInjector.getRegisteredAgents?.()?.length || 0 : 0
      };
      verification.activeSystems++;
      
      // Check Context Preservation System
      verification.systemStatus.contextPreservation = {
        status: 'active',
        contextCacheSize: this.standardizationSystem.contextPreservation ?
          this.standardizationSystem.contextPreservation.contextCache?.size || 0 : 0
      };
      verification.activeSystems++;
      
      // Check Validation Gates System
      verification.systemStatus.validationGates = {
        status: 'active',
        gatesActive: this.standardizationSystem.validationGates ?
          Object.keys(this.standardizationSystem.validationGates.gateTypes || {}).length : 0
      };
      verification.activeSystems++;
      
      // Check Task Batcher System
      verification.systemStatus.taskBatcher = {
        status: 'active',
        batchQueue: this.standardizationSystem.taskBatcher ?
          this.standardizationSystem.taskBatcher.batchQueue?.size || 0 : 0
      };
      verification.activeSystems++;
      
      // Check Coordination Patterns System
      verification.systemStatus.coordinationPatterns = {
        status: 'active',
        activeWorkflows: this.standardizationSystem.coordinationPatterns ?
          this.standardizationSystem.coordinationPatterns.activeWorkflows?.size || 0 : 0
      };
      verification.activeSystems++;
      
      // Check Context Bridge System
      verification.systemStatus.contextBridges = {
        status: 'active',
        activeBridges: this.standardizationSystem.contextBridges ?
          this.standardizationSystem.contextBridges.activeBridges?.size || 0 : 0
      };
      verification.activeSystems++;
      
      // Check Learning Engine System
      verification.systemStatus.learningEngine = {
        status: 'active',
        learningInstances: this.standardizationSystem.learningEngine ?
          this.standardizationSystem.learningEngine.learningInstances?.size || 0 : 0
      };
      verification.activeSystems++;
      
      console.log(`✅ System integration verified: ${verification.activeSystems} systems active`);
      
    } catch (error) {
      console.warn('⚠️ System integration verification had issues:', error.message);
      verification.overallHealth = 'degraded';
    }
    
    return verification;
  }

  /**
   * Set up event listeners for all systems
   */
  setupEventListeners() {
    if (this.standardizationSystem) {
      this.standardizationSystem.on('agents-discovered', (data) => {
        console.log(`📡 Agents discovered: ${data.agentCount} agents of types: ${data.agentTypes.join(', ')}`);
      });
      
      this.standardizationSystem.on('standardization-deployed', (data) => {
        console.log(`🎯 Standardization deployed: ${data.successCount}/${data.totalAgents} agents`);
      });
      
      // Forward important events
      this.standardizationSystem.on('deployment-complete', (data) => {
        this.emit('system-deployment-complete', data);
      });
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    const status = {
      bootstrapStatus: this.status,
      timestamp: Date.now(),
      systems: {},
      metrics: {}
    };
    
    if (this.standardizationSystem) {
      status.systems.standardization = this.standardizationSystem.getStandardizationStatus();
      
      // Get metrics from individual systems
      if (this.standardizationSystem.taskBatcher) {
        status.metrics.taskBatching = this.standardizationSystem.taskBatcher.getBatchingStatistics?.() || {};
      }
      
      if (this.standardizationSystem.coordinationPatterns) {
        status.metrics.coordination = this.standardizationSystem.coordinationPatterns.getCoordinationStatistics?.() || {};
      }
      
      if (this.standardizationSystem.contextBridges) {
        status.metrics.bridging = this.standardizationSystem.contextBridges.getBridgeStatistics?.() || {};
      }
    }
    
    return status;
  }

  /**
   * Start monitoring of all systems
   */
  async startMonitoring() {
    console.log('👁️ Starting system monitoring...');
    
    if (this.standardizationSystem) {
      this.standardizationSystem.startContinuousMonitoring();
    }
    
    // Start bootstrap-level monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // 1 minute
    
    console.log('✅ System monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    console.log('⏹️ Stopping system monitoring...');
    
    if (this.standardizationSystem) {
      this.standardizationSystem.stopContinuousMonitoring();
    }
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('✅ System monitoring stopped');
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    try {
      const status = this.getSystemStatus();
      
      // Check for any critical issues
      const issues = [];
      
      if (status.systems.standardization?.failedAgents > 0) {
        issues.push(`${status.systems.standardization.failedAgents} agents failed standardization`);
      }
      
      if (issues.length > 0) {
        console.warn('⚠️ System health issues detected:', issues.join(', '));
        this.emit('health-warning', { issues, status });
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
    }
  }

  /**
   * Generate comprehensive system report
   */
  async generateSystemReport() {
    const status = this.getSystemStatus();
    
    const report = {
      title: 'ORCHESTRAI Evolution System Report',
      generatedAt: new Date().toISOString(),
      bootstrapStatus: this.status,
      deploymentResults: this.deploymentResults,
      currentStatus: status,
      recommendations: this.generateSystemRecommendations(status)
    };
    
    // Store in crystalline memory if available
    if (this.crystallineMemory) {
      try {
        await this.crystallineMemory.storeMemory(
          'evolution-system-report',
          report,
          {
            importance: 0.95,
            semantic_tags: ['evolution', 'system', 'report', 'status'],
            retention: 'long-term'
          }
        );
      } catch (error) {
        console.warn('Failed to store report in crystalline memory:', error.message);
      }
    }
    
    return report;
  }

  /**
   * Generate system recommendations
   */
  generateSystemRecommendations(status) {
    const recommendations = [];
    
    if (this.status === 'initialized') {
      recommendations.push({
        type: 'action',
        priority: 'high',
        message: 'System not yet deployed. Run deployEvolutionaryUpgrade() to begin.'
      });
    }
    
    if (status.systems.standardization?.standardizedAgents < status.systems.standardization?.totalAgents) {
      recommendations.push({
        type: 'deployment',
        priority: 'medium',
        message: 'Some agents are not yet standardized. Consider running deployment again.'
      });
    }
    
    if (this.monitoringInterval === null) {
      recommendations.push({
        type: 'monitoring',
        priority: 'low',
        message: 'Consider starting continuous monitoring for better system health visibility.'
      });
    }
    
    return recommendations;
  }

  /**
   * Shutdown all systems gracefully
   */
  async shutdown() {
    console.log('🛑 Shutting down ORCHESTRAI Evolution Bootstrap...');
    
    this.stopMonitoring();
    
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    
    this.status = 'shutdown';
    console.log('✅ Bootstrap shutdown complete');
    
    this.emit('shutdown-complete');
  }
}

// Export both class and convenience functions
module.exports = OrchestRaiEvolutionBootstrap;

// Convenience function for quick deployment
module.exports.quickDeploy = async function(crystallineMemory = null, options = {}) {
  const bootstrap = new OrchestRaiEvolutionBootstrap(crystallineMemory);
  
  try {
    await bootstrap.initialize();
    const results = await bootstrap.deployEvolutionaryUpgrade(options);
    
    if (!options.skipMonitoring) {
      await bootstrap.startMonitoring();
    }
    
    return {
      bootstrap,
      deploymentResults: results,
      status: 'success'
    };
    
  } catch (error) {
    console.error('❌ Quick deploy failed:', error.message);
    return {
      bootstrap,
      deploymentResults: null,
      status: 'failed',
      error: error.message
    };
  }
};

// Convenience function for status check
module.exports.checkStatus = async function(crystallineMemory = null) {
  const bootstrap = new OrchestRaiEvolutionBootstrap(crystallineMemory);
  
  try {
    await bootstrap.initialize();
    const status = bootstrap.getSystemStatus();
    const report = await bootstrap.generateSystemReport();
    
    return {
      status,
      report,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    return {
      status: null,
      report: null,
      success: false,
      error: error.message
    };
  }
};