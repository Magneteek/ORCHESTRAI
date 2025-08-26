// WebSocket Integration Module for ORCHESTRAI
// Seamlessly integrates enhanced WebSocket capabilities into existing orchestrator

const EnhancedWebSocketManager = require('./enhanced-websocket-manager');

class WebSocketIntegration {
  constructor(orchestrator, testingAPI = null) {
    this.orchestrator = orchestrator;
    this.testingAPI = testingAPI;
    this.enhancedWS = null;
    
    this.initialize();
  }

  initialize() {
    console.log('🔄 Initializing Enhanced WebSocket Integration...');
    
    try {
      // Replace the existing WebSocket setup with enhanced version
      this.enhancedWS = new EnhancedWebSocketManager(
        this.orchestrator.server, 
        this.testingAPI
      );
      
      // Connect orchestrator components to enhanced WebSocket
      this.setupIntegrations();
      
      // Replace orchestrator's broadcast methods with enhanced versions
      this.replaceBroadcastMethods();
      
      console.log('✅ Enhanced WebSocket Integration completed');
      
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket Integration:', error);
      throw error;
    }
  }

  setupIntegrations() {
    // Provide system components to enhanced WebSocket manager
    if (this.orchestrator.mcpManager) {
      this.enhancedWS.setMCPManager(this.orchestrator.mcpManager);
    }
    
    if (this.orchestrator.crystallineMemory) {
      this.enhancedWS.setCrystallineMemory(this.orchestrator.crystallineMemory);
    }
    
    if (this.orchestrator.usageTracker) {
      this.enhancedWS.setUsageTracker(this.orchestrator.usageTracker);
    }
    
    // Set up system metrics integration
    this.enhancedWS.setSystemMetrics(this.orchestrator.systemMetrics);
    
    // Listen for orchestrator metric updates
    const originalUpdateMetrics = this.orchestrator.updateSystemMetrics.bind(this.orchestrator);
    this.orchestrator.updateSystemMetrics = async () => {
      await originalUpdateMetrics();
      this.enhancedWS.setSystemMetrics(this.orchestrator.systemMetrics);
    };
    
    console.log('🔗 System components integrated with Enhanced WebSocket');
  }

  replaceBroadcastMethods() {
    // Replace orchestrator's broadcast methods with enhanced versions
    this.orchestrator.broadcastUpdate = (type, data) => {
      this.enhancedWS.broadcast({ type, data, timestamp: new Date().toISOString() });
    };
    
    this.orchestrator.broadcastMetrics = () => {
      this.enhancedWS.broadcast({
        type: 'metrics_update',
        data: this.orchestrator.systemMetrics,
        timestamp: new Date().toISOString()
      }, 'system_metrics');
    };
    
    // Add new broadcasting capabilities
    this.orchestrator.broadcastMCPUpdate = (serverName, status) => {
      this.enhancedWS.broadcastMCPUpdate(serverName, status);
    };
    
    this.orchestrator.broadcastTestUpdate = (testType, results) => {
      this.enhancedWS.broadcastTestUpdate(testType, results);
    };
    
    this.orchestrator.broadcastAlert = (level, message, details) => {
      this.enhancedWS.broadcastAlert(level, message, details);
    };
    
    console.log('📡 Enhanced broadcasting methods integrated');
  }

  // MCP Server Integration
  setupMCPIntegration() {
    if (!this.orchestrator.mcpManager) return;
    
    // Monitor MCP server events
    const originalStartServer = this.orchestrator.mcpManager.startServer.bind(this.orchestrator.mcpManager);
    this.orchestrator.mcpManager.startServer = async (serverName) => {
      try {
        const result = await originalStartServer(serverName);
        
        // Broadcast MCP server start
        this.enhancedWS.broadcastMCPUpdate(serverName, 'starting');
        
        // Wait a bit and check if it's actually running
        setTimeout(() => {
          const status = this.orchestrator.mcpManager.getServerStatus(serverName);
          this.enhancedWS.broadcastMCPUpdate(serverName, status.status);
        }, 2000);
        
        return result;
      } catch (error) {
        this.enhancedWS.broadcastMCPUpdate(serverName, 'failed');
        this.enhancedWS.broadcastAlert('error', `MCP server ${serverName} failed to start`, { error: error.message });
        throw error;
      }
    };
    
    const originalStopServer = this.orchestrator.mcpManager.stopServer.bind(this.orchestrator.mcpManager);
    this.orchestrator.mcpManager.stopServer = async (serverName) => {
      this.enhancedWS.broadcastMCPUpdate(serverName, 'stopping');
      
      try {
        const result = await originalStopServer(serverName);
        this.enhancedWS.broadcastMCPUpdate(serverName, 'stopped');
        return result;
      } catch (error) {
        this.enhancedWS.broadcastAlert('error', `Failed to stop MCP server ${serverName}`, { error: error.message });
        throw error;
      }
    };
    
    console.log('🔌 MCP Server integration completed');
  }

  // Testing System Integration
  setupTestingIntegration() {
    if (!this.testingAPI || !this.testingAPI.tester) return;
    
    // Listen for test events
    this.testingAPI.tester.on('testCompleted', (data) => {
      this.enhancedWS.broadcastTestUpdate(data.testType, data.results);
      
      // Send alert for failed tests
      const failedTests = Object.values(data.results).filter(r => r.status === 'failed');
      if (failedTests.length > 0) {
        this.enhancedWS.broadcastAlert('warning', `${failedTests.length} tests failed in ${data.testType} suite`, {
          testType: data.testType,
          failedCount: failedTests.length
        });
      }
    });
    
    this.testingAPI.tester.on('testError', (data) => {
      this.enhancedWS.broadcastAlert('error', `Test error in ${data.testType}`, {
        testType: data.testType,
        error: data.error
      });
    });
    
    this.testingAPI.tester.on('started', () => {
      this.enhancedWS.broadcastAlert('info', 'Auto-sync testing started', {
        timestamp: new Date().toISOString()
      });
    });
    
    this.testingAPI.tester.on('stopped', () => {
      this.enhancedWS.broadcastAlert('info', 'Auto-sync testing stopped', {
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('🧪 Testing system integration completed');
  }

  // Memory System Integration
  setupMemoryIntegration() {
    if (!this.orchestrator.crystallineMemory) return;
    
    // Monitor memory operations (if events are available)
    try {
      // This would depend on CrystallineMemoryManager having event emission
      // For now, we'll set up periodic monitoring
      setInterval(async () => {
        try {
          const memoryStats = await this.orchestrator.crystallineMemory.getMemoryPoolStats();
          
          // Check for memory health issues
          if (memoryStats.latticeStats.latticeHealth < 0.7) {
            this.enhancedWS.broadcastAlert('warning', 'Crystalline memory health degraded', {
              health: memoryStats.latticeStats.latticeHealth,
              totalNodes: memoryStats.latticeStats.totalNodes,
              efficiency: memoryStats.latticeStats.efficiency
            });
          }
        } catch (error) {
          // Silently handle errors in memory monitoring
        }
      }, 60000); // Check every minute
      
      console.log('🧠 Memory system integration completed');
    } catch (error) {
      console.log('⚠️  Memory system events not available, using polling');
    }
  }

  // Health Monitoring Integration
  setupHealthMonitoring() {
    // Monitor system health and send alerts
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Check memory usage
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      if (memoryUsagePercent > 90) {
        this.enhancedWS.broadcastAlert('critical', 'High memory usage detected', {
          memoryUsage: memoryUsagePercent,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal
        });
      }
      
      // Check connection health
      const stats = this.enhancedWS.getConnectionStats();
      if (stats.totalClients > 100) {
        this.enhancedWS.broadcastAlert('warning', 'High number of WebSocket connections', {
          totalClients: stats.totalClients,
          averageDuration: stats.averageConnectionDuration
        });
      }
      
    }, 120000); // Check every 2 minutes
    
    console.log('❤️  Health monitoring integration completed');
  }

  // Complete integration setup
  setupAllIntegrations() {
    this.setupMCPIntegration();
    this.setupTestingIntegration();
    this.setupMemoryIntegration();
    this.setupHealthMonitoring();
    
    console.log('🌟 All WebSocket integrations completed successfully');
  }

  // Graceful shutdown
  async shutdown() {
    if (this.enhancedWS) {
      await this.enhancedWS.shutdown();
    }
  }

  // Get enhanced WebSocket manager for external use
  getEnhancedWebSocket() {
    return this.enhancedWS;
  }

  // Get connection statistics
  getStats() {
    return this.enhancedWS ? this.enhancedWS.getConnectionStats() : null;
  }
}

module.exports = WebSocketIntegration;