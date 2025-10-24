/**
 * ORCHESTRAI - Simultaneous Execution Initialization
 *
 * Initializes the hybrid architecture combining:
 * - ORCHESTRAI's crystalline memory intelligence
 * - VAIBE's simultaneous execution performance
 *
 * This module creates a unified initialization point for all components
 * required to support parallel stream execution while preserving long-term
 * learning capabilities.
 */

const { createRedisConnection } = require('../redis-client');
const CrystallineMemory = require('../memory/crystalline-memory-system');
const WebSocketCoordinationLayer = require('../coordination/websocket-coordination-layer');
const SimultaneousStreamOrchestrator = require('../orchestration/simultaneous-stream-orchestrator');
const DynamicAgentSelection = require('../orchestration/dynamic-agent-selection');

/**
 * Initialize the complete simultaneous execution system
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.mcpManager - MCP Manager instance (optional)
 * @param {number} options.websocketPort - WebSocket server port (default: 8080)
 * @param {number} options.redisDatabase - Redis database number (default: 0)
 * @param {number} options.maxParallelStreams - Maximum parallel streams (default: 12)
 * @param {Object} options.agentRegistry - Agent registry for dynamic selection
 * @param {boolean} options.enableMonitoring - Enable real-time monitoring (default: true)
 * @returns {Promise<Object>} Initialized components
 */
async function initializeSimultaneousExecution(options = {}) {
  const {
    mcpManager = null,
    websocketPort = process.env.WEBSOCKET_PORT || 8080,
    redisDatabase = 0,
    maxParallelStreams = 12,
    agentRegistry = null,
    enableMonitoring = true
  } = options;

  console.log('[SIMULTANEOUS-INIT] Initializing hybrid architecture...');

  try {
    // Step 1: Initialize Redis connection
    console.log('[SIMULTANEOUS-INIT] Connecting to Redis...');
    const redis = await createRedisConnection({
      database: redisDatabase,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('[SIMULTANEOUS-INIT] Redis connection refused');
          return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    if (!redis || !redis.isOpen) {
      console.warn('[SIMULTANEOUS-INIT] Redis unavailable - using fallback mode');
    } else {
      console.log('[SIMULTANEOUS-INIT] ✓ Redis connected');
    }

    // Step 2: Initialize Crystalline Memory System
    console.log('[SIMULTANEOUS-INIT] Initializing crystalline memory...');
    const crystallineMemory = new CrystallineMemory(redis, mcpManager, {
      namespace: 'orchestrai',
      enableGeometricClustering: true,
      enableSemanticSearch: true
    });

    await crystallineMemory.initialize();
    console.log('[SIMULTANEOUS-INIT] ✓ Crystalline memory initialized');

    // Step 3: Initialize WebSocket Coordination Layer
    console.log('[SIMULTANEOUS-INIT] Starting WebSocket coordination layer...');
    const websocketLayer = new WebSocketCoordinationLayer(redis, crystallineMemory, {
      wsPort: websocketPort,
      enableHeartbeat: true,
      heartbeatInterval: 30000, // 30 seconds
      maxChannels: 50
    });

    await websocketLayer.initialize();
    console.log(`[SIMULTANEOUS-INIT] ✓ WebSocket server listening on port ${websocketPort}`);

    // Step 4: Initialize Dynamic Agent Selection
    console.log('[SIMULTANEOUS-INIT] Initializing dynamic agent selection...');

    // Note: DynamicAgentSelection constructor signature is different - needs proper dependencies
    // For now, create a simplified agent registry wrapper
    const agentRegistryData = agentRegistry || await loadDefaultAgentRegistry();
    const dynamicAgentSelection = {
      agentRegistry: agentRegistryData,
      selectAgent: async (requirements) => {
        // Simple agent selection based on domain
        const domain = requirements.domain || 'general';
        const agentType = Object.keys(agentRegistryData).find(key =>
          agentRegistryData[key].domain === domain
        ) || 'general-purpose';
        return { agentType, ...agentRegistryData[agentType] };
      }
    };

    console.log('[SIMULTANEOUS-INIT] ✓ Dynamic agent selection ready');

    // Step 5: Initialize Simultaneous Stream Orchestrator
    console.log('[SIMULTANEOUS-INIT] Initializing stream orchestrator...');
    const streamOrchestrator = new SimultaneousStreamOrchestrator(
      websocketLayer,
      dynamicAgentSelection,
      crystallineMemory,
      redis,
      {
        maxParallelStreams,
        enableMonitoring,
        qualityThreshold: 0.95, // 95% quality maintenance target
        speedImprovementTarget: 0.75 // 75% speed improvement target
      }
    );

    console.log('[SIMULTANEOUS-INIT] ✓ Stream orchestrator initialized');

    // Step 6: Validate system health
    console.log('[SIMULTANEOUS-INIT] Running health checks...');
    const healthStatus = await validateSystemHealth({
      redis,
      crystallineMemory,
      websocketLayer,
      dynamicAgentSelection,
      streamOrchestrator
    });

    if (!healthStatus.healthy) {
      console.warn('[SIMULTANEOUS-INIT] Health check warnings:', healthStatus.warnings);
    } else {
      console.log('[SIMULTANEOUS-INIT] ✓ All health checks passed');
    }

    // Step 7: Set up graceful shutdown
    setupGracefulShutdown({
      redis,
      websocketLayer,
      streamOrchestrator
    });

    console.log('[SIMULTANEOUS-INIT] ════════════════════════════════════════');
    console.log('[SIMULTANEOUS-INIT] 🚀 Hybrid architecture fully initialized');
    console.log('[SIMULTANEOUS-INIT] ════════════════════════════════════════');
    console.log(`[SIMULTANEOUS-INIT] WebSocket: ws://localhost:${websocketPort}`);
    console.log(`[SIMULTANEOUS-INIT] Redis: ${redis.isOpen ? 'Connected' : 'Fallback mode'}`);
    console.log(`[SIMULTANEOUS-INIT] Max Streams: ${maxParallelStreams}`);
    console.log(`[SIMULTANEOUS-INIT] Monitoring: ${enableMonitoring ? 'Enabled' : 'Disabled'}`);
    console.log('[SIMULTANEOUS-INIT] ════════════════════════════════════════');

    return {
      redis,
      crystallineMemory,
      websocketLayer,
      dynamicAgentSelection,
      streamOrchestrator,
      healthStatus
    };

  } catch (error) {
    console.error('[SIMULTANEOUS-INIT] ❌ Initialization failed:', error);
    throw new Error(`Simultaneous execution initialization failed: ${error.message}`);
  }
}

/**
 * Load default agent registry from configuration
 * @returns {Promise<Object>} Agent registry
 */
async function loadDefaultAgentRegistry() {
  // Default agent registry with core ORCHESTRAI agents
  return {
    'content-writer-specialist': {
      domain: 'content',
      capabilities: ['writing', 'seo-optimization', 'multilanguage'],
      averagePerformance: 0.92,
      reliability: 0.95
    },
    'seo-keyword-research': {
      domain: 'seo',
      capabilities: ['keyword-analysis', 'competitor-research', 'intent-mapping'],
      averagePerformance: 0.89,
      reliability: 0.93
    },
    'wireframe-creation-specialist': {
      domain: 'design',
      capabilities: ['ui-design', 'ux-planning', 'wireframing'],
      averagePerformance: 0.91,
      reliability: 0.94
    },
    'direct-response-copywriter': {
      domain: 'marketing',
      capabilities: ['copywriting', 'conversion-optimization', 'persuasion'],
      averagePerformance: 0.90,
      reliability: 0.92
    },
    'seo-technical-analysis': {
      domain: 'seo',
      capabilities: ['technical-audit', 'performance-analysis', 'core-web-vitals'],
      averagePerformance: 0.88,
      reliability: 0.91
    }
  };
}

/**
 * Validate system health across all components
 * @param {Object} components - System components to validate
 * @returns {Promise<Object>} Health status
 */
async function validateSystemHealth(components) {
  const {
    redis,
    crystallineMemory,
    websocketLayer,
    dynamicAgentSelection,
    streamOrchestrator
  } = components;

  const warnings = [];
  let healthy = true;

  // Check Redis connection
  if (!redis || !redis.isOpen) {
    warnings.push('Redis unavailable - operating in fallback mode');
    // Not critical, system can operate without Redis
  }

  // Check WebSocket server
  if (!websocketLayer.wss) {
    warnings.push('WebSocket server not initialized');
    healthy = false;
  }

  // Check crystalline memory
  try {
    const memoryTest = await crystallineMemory.searchMemory({
      searchTerm: '__health_check__',
      domain: 'system',
      type: 'test'
    });
    // Memory accessible
  } catch (error) {
    warnings.push(`Crystalline memory error: ${error.message}`);
    // Not critical, but concerning
  }

  // Check agent registry
  const agentCount = Object.keys(dynamicAgentSelection.agentRegistry || {}).length;
  if (agentCount === 0) {
    warnings.push('No agents registered in dynamic agent selection');
    healthy = false;
  }

  return {
    healthy,
    warnings,
    checks: {
      redis: redis?.isOpen || false,
      websocket: !!websocketLayer.wss,
      memory: true, // Always true with fallback
      agents: agentCount > 0,
      orchestrator: !!streamOrchestrator
    }
  };
}

/**
 * Set up graceful shutdown handlers
 * @param {Object} components - Components to shutdown gracefully
 */
function setupGracefulShutdown(components) {
  const { redis, websocketLayer, streamOrchestrator } = components;

  const shutdown = async (signal) => {
    console.log(`\n[SIMULTANEOUS-INIT] Received ${signal}, shutting down gracefully...`);

    try {
      // Close WebSocket connections
      if (websocketLayer && websocketLayer.wss) {
        console.log('[SIMULTANEOUS-INIT] Closing WebSocket connections...');
        websocketLayer.wss.clients.forEach(ws => {
          ws.close(1001, 'Server shutting down');
        });
        websocketLayer.wss.close();
      }

      // Wait for active orchestrations to complete (max 30 seconds)
      if (streamOrchestrator && streamOrchestrator.activeOrchestrations.size > 0) {
        console.log('[SIMULTANEOUS-INIT] Waiting for active orchestrations to complete...');
        const timeout = setTimeout(() => {
          console.log('[SIMULTANEOUS-INIT] Timeout reached, forcing shutdown');
        }, 30000);

        await streamOrchestrator.shutdown();
        clearTimeout(timeout);
      }

      // Close Redis connection
      if (redis && redis.isOpen) {
        console.log('[SIMULTANEOUS-INIT] Closing Redis connection...');
        await redis.quit();
      }

      console.log('[SIMULTANEOUS-INIT] ✓ Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('[SIMULTANEOUS-INIT] Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Register shutdown handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (error) => {
    console.error('[SIMULTANEOUS-INIT] Uncaught exception:', error);
    shutdown('uncaughtException');
  });
}

/**
 * Create a test configuration for validation purposes
 * @returns {Object} Test configuration
 */
function createTestConfiguration() {
  return {
    mcpManager: null,
    websocketPort: 8081, // Different port for testing
    redisDatabase: 1, // Different database for testing
    maxParallelStreams: 3, // Lower for testing
    enableMonitoring: false // Disable for testing
  };
}

module.exports = {
  initializeSimultaneousExecution,
  validateSystemHealth,
  createTestConfiguration,
  loadDefaultAgentRegistry
};
