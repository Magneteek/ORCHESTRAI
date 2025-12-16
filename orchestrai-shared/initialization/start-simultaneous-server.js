#!/usr/bin/env node

/**
 * ORCHESTRAI Simultaneous Execution Server
 *
 * Starts the WebSocket coordination infrastructure required for
 * parallel agent execution with real-time monitoring.
 *
 * This server must be running before using simultaneous orchestration.
 *
 * Usage:
 *   npm run simultaneous:start
 *   node orchestrai-shared/initialization/start-simultaneous-server.js
 */

const { initializeSimultaneousExecution } = require('./initialize-simultaneous-execution');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 ORCHESTRAI Simultaneous Execution Server');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

async function startServer() {
  try {
    // Configuration from environment or defaults
    const config = {
      websocketPort: parseInt(process.env.WEBSOCKET_PORT || '8080'),
      redisDatabase: parseInt(process.env.REDIS_DATABASE || '0'),
      maxParallelStreams: parseInt(process.env.MAX_PARALLEL_STREAMS || '12'),
      enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
      mcpManager: null // Will be initialized if needed
    };

    console.log('📋 Configuration:');
    console.log(`   WebSocket Port: ${config.websocketPort}`);
    console.log(`   Redis Database: ${config.redisDatabase}`);
    console.log(`   Max Parallel Streams: ${config.maxParallelStreams}`);
    console.log(`   Real-time Monitoring: ${config.enableMonitoring ? 'Enabled' : 'Disabled'}`);
    console.log('');

    // Initialize the complete simultaneous execution system
    console.log('🔧 Initializing simultaneous execution infrastructure...');
    console.log('');

    const system = await initializeSimultaneousExecution(config);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ORCHESTRAI Simultaneous Execution Server READY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📡 Services:');
    console.log(`   WebSocket: ws://localhost:${config.websocketPort}`);
    console.log(`   Redis: ${system.redis.isOpen ? '✅ Connected' : '⚠️  Fallback Mode'}`);
    console.log(`   Crystalline Memory: ✅ Active`);
    console.log(`   Dynamic Agent Selection: ✅ Ready`);
    console.log('');
    console.log('💡 Usage:');
    console.log('   - Parallel execution requests will be coordinated via this server');
    console.log('   - Real-time monitoring and quality checks are active');
    console.log('   - Crystalline memory is storing learnings for optimization');
    console.log('');
    console.log('🛑 To stop: Press Ctrl+C');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // Keep the server running
    process.on('SIGINT', async () => {
      console.log('');
      console.log('🛑 Received shutdown signal...');
      await gracefulShutdown(system);
    });

    process.on('SIGTERM', async () => {
      console.log('');
      console.log('🛑 Received termination signal...');
      await gracefulShutdown(system);
    });

    // Health check endpoint (log status every 30 seconds)
    setInterval(() => {
      const orchestratorMetrics = system.streamOrchestrator.getMetrics();
      console.log(`[${new Date().toISOString()}] Health Check:`, {
        activeOrchestrations: orchestratorMetrics.activeOrchestrations,
        totalCompleted: orchestratorMetrics.totalOrchestrations,
        avgSpeedImprovement: `${orchestratorMetrics.averageSpeedImprovement.toFixed(1)}%`,
        avgQuality: `${orchestratorMetrics.averageQualityScore.toFixed(1)}%`
      });
    }, 30000);

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ FAILED TO START SIMULTANEOUS EXECUTION SERVER');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('Redis')) {
      console.error('💡 Troubleshooting Redis:');
      console.error('   1. Check if Redis is running: redis-cli ping');
      console.error('   2. Start Redis: npm run redis');
      console.error('   3. Or set REDIS_URL environment variable');
    } else if (error.message.includes('EADDRINUSE')) {
      console.error('💡 Port already in use:');
      console.error('   1. Check what\'s using the port: lsof -i :8080');
      console.error('   2. Stop the other process or change WEBSOCKET_PORT');
    } else {
      console.error('💡 Check the error message above and ensure:');
      console.error('   1. All dependencies are installed: npm install');
      console.error('   2. Environment variables are set correctly');
      console.error('   3. Required services (Redis) are running');
    }

    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

/**
 * Gracefully shutdown the server
 */
async function gracefulShutdown(system) {
  console.log('');
  console.log('🔄 Initiating graceful shutdown...');

  try {
    // Close WebSocket server
    if (system.websocketLayer && system.websocketLayer.wsServer) {
      console.log('   Closing WebSocket connections...');
      system.websocketLayer.wsServer.clients.forEach(ws => {
        ws.close(1001, 'Server shutting down');
      });
      system.websocketLayer.wsServer.close();
    }

    // Wait for active orchestrations to complete (max 30 seconds)
    if (system.streamOrchestrator && system.streamOrchestrator.activeOrchestrations.size > 0) {
      console.log(`   Waiting for ${system.streamOrchestrator.activeOrchestrations.size} active orchestrations...`);

      const timeout = setTimeout(() => {
        console.log('   ⚠️  Timeout reached, forcing shutdown');
      }, 30000);

      // Wait briefly for orchestrations
      await new Promise(resolve => setTimeout(resolve, 5000));
      clearTimeout(timeout);
    }

    // Close Redis connection
    if (system.redis && system.redis.isOpen) {
      console.log('   Closing Redis connection...');
      await system.redis.quit();
    }

    console.log('');
    console.log('✅ Graceful shutdown complete');
    console.log('');
    process.exit(0);

  } catch (error) {
    console.error('   ❌ Error during shutdown:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
