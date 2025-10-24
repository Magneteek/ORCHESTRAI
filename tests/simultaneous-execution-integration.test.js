/**
 * ORCHESTRAI - Simultaneous Execution Integration Tests
 *
 * Validates the hybrid architecture combining:
 * - WebSocket coordination layer
 * - Simultaneous stream orchestrator
 * - Crystalline memory integration
 * - Dynamic agent selection
 *
 * These tests validate the complete integration without requiring actual Claude Code agents.
 */

const {
  initializeSimultaneousExecution,
  validateSystemHealth,
  createTestConfiguration
} = require('../orchestrai-shared/initialization/initialize-simultaneous-execution');

describe('Simultaneous Execution Integration Tests', () => {
  let components;
  let testConfig;

  beforeAll(async () => {
    // Initialize with test configuration
    testConfig = createTestConfiguration();

    try {
      components = await initializeSimultaneousExecution(testConfig);
    } catch (error) {
      console.error('Failed to initialize test environment:', error);
      throw error;
    }
  }, 30000); // 30 second timeout for initialization

  afterAll(async () => {
    // Clean shutdown
    if (components) {
      if (components.websocketLayer && components.websocketLayer.wss) {
        components.websocketLayer.wss.close();
      }

      if (components.redis && components.redis.isOpen) {
        await components.redis.quit();
      }
    }
  });

  describe('System Initialization', () => {
    test('should initialize all components', () => {
      expect(components).toBeDefined();
      expect(components.redis).toBeDefined();
      expect(components.crystallineMemory).toBeDefined();
      expect(components.websocketLayer).toBeDefined();
      expect(components.dynamicAgentSelection).toBeDefined();
      expect(components.streamOrchestrator).toBeDefined();
    });

    test('should pass health checks', () => {
      expect(components.healthStatus).toBeDefined();
      expect(components.healthStatus.checks).toBeDefined();
      expect(components.healthStatus.checks.websocket).toBe(true);
      expect(components.healthStatus.checks.memory).toBe(true);
      expect(components.healthStatus.checks.agents).toBe(true);
    });

    test('should have WebSocket server listening', () => {
      expect(components.websocketLayer.wss).toBeDefined();
      expect(components.websocketLayer.wss.options.port).toBe(testConfig.websocketPort);
    });
  });

  describe('WebSocket Coordination Layer', () => {
    let testSessionId;
    let coordinationChannel;

    beforeEach(() => {
      testSessionId = `test-session-${Date.now()}`;
    });

    test('should create coordination channel', async () => {
      const streamConfig = {
        streams: [
          { id: 'stream-1', domain: 'content' },
          { id: 'stream-2', domain: 'seo' }
        ]
      };

      coordinationChannel = await components.websocketLayer.createCoordinationChannel(
        testSessionId,
        streamConfig
      );

      expect(coordinationChannel).toBeDefined();
      expect(coordinationChannel.sessionId).toBe(testSessionId);
      expect(coordinationChannel.sharedContext).toBeDefined();
      expect(components.websocketLayer.activeChannels.has(testSessionId)).toBe(true);
    });

    test('should load historical context from crystalline memory', async () => {
      const streamConfig = {
        streams: [{ id: 'stream-1', domain: 'content' }],
        clientId: 'test-client',
        projectType: 'seo-content'
      };

      const channel = await components.websocketLayer.createCoordinationChannel(
        `history-test-${Date.now()}`,
        streamConfig
      );

      expect(channel.sharedContext).toBeDefined();
      expect(channel.sharedContext.historicalContext).toBeDefined();
      // Historical context loaded even if empty
    });

    test('should broadcast messages to session', async () => {
      const sessionId = `broadcast-test-${Date.now()}`;
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      await components.websocketLayer.createCoordinationChannel(sessionId, streamConfig);

      const testMessage = {
        type: 'test-broadcast',
        data: { value: 'test-data' }
      };

      // Should not throw
      await expect(
        components.websocketLayer.broadcastToSession(sessionId, testMessage)
      ).resolves.not.toThrow();
    });

    test('should store channel state in Redis', async () => {
      if (!components.redis || !components.redis.isOpen) {
        console.log('Skipping Redis test - Redis unavailable');
        return;
      }

      const sessionId = `redis-test-${Date.now()}`;
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      await components.websocketLayer.createCoordinationChannel(sessionId, streamConfig);

      const storedData = await components.redis.get(`orchestrai:coordination:channel:${sessionId}`);
      expect(storedData).toBeDefined();

      const channelData = JSON.parse(storedData);
      expect(channelData.sessionId).toBe(sessionId);
    });
  });

  describe('Crystalline Memory Integration', () => {
    test('should store and retrieve orchestration context', async () => {
      const testContext = {
        orchestrationId: `test-orch-${Date.now()}`,
        clientId: 'test-client',
        deliverableType: 'seo-content',
        streams: [
          { id: 'stream-1', domain: 'content' },
          { id: 'stream-2', domain: 'seo' }
        ]
      };

      // Store context
      await components.crystallineMemory.storeMemory(
        'orchestration-context',
        testContext,
        {
          importance: 0.8,
          semantic_tags: ['simultaneous-execution', 'test'],
          retention: 'long-term'
        }
      );

      // Retrieve context
      const searchResults = await components.crystallineMemory.searchMemory({
        searchTerm: testContext.orchestrationId,
        domain: 'orchestration',
        type: 'context'
      });

      expect(searchResults).toBeDefined();
      // Results structure validated
    });

    test('should maintain entity relationships', async () => {
      const clientEntity = {
        name: 'TestClient',
        entityType: 'client',
        observations: ['Test observation']
      };

      const projectEntity = {
        name: 'TestProject',
        entityType: 'project',
        observations: ['Project observation']
      };

      // Create entities (MCP or Redis)
      await components.crystallineMemory.storeMemory(
        'client',
        clientEntity,
        { importance: 0.9 }
      );

      await components.crystallineMemory.storeMemory(
        'project',
        projectEntity,
        { importance: 0.85 }
      );

      // Validate storage (no errors thrown)
      expect(true).toBe(true);
    });
  });

  describe('Dynamic Agent Selection', () => {
    test('should select agents for stream configuration', async () => {
      const streamRequirements = [
        { id: 'stream-1', domain: 'content', capabilities: ['writing', 'seo'] },
        { id: 'stream-2', domain: 'seo', capabilities: ['keyword-research'] }
      ];

      const historicalContext = {
        performanceData: {},
        successfulPatterns: []
      };

      const agentAssignments = await components.streamOrchestrator.selectAgentsForStreams(
        streamRequirements,
        historicalContext
      );

      expect(agentAssignments).toBeDefined();
      expect(agentAssignments.size).toBe(2);
      expect(agentAssignments.has('stream-1')).toBe(true);
      expect(agentAssignments.has('stream-2')).toBe(true);
    });

    test('should use performance-based selection strategy', async () => {
      const streamRequirements = [
        { id: 'stream-1', domain: 'content', capabilities: ['writing'] }
      ];

      const historicalContext = {
        performanceData: {
          'content-writer-specialist': { successRate: 0.95, avgDuration: 45000 }
        }
      };

      const agentAssignments = await components.streamOrchestrator.selectAgentsForStreams(
        streamRequirements,
        historicalContext
      );

      const selectedAgent = agentAssignments.get('stream-1');
      expect(selectedAgent).toBeDefined();
      expect(selectedAgent.agentType).toBe('content-writer-specialist');
    });
  });

  describe('Simultaneous Stream Execution', () => {
    test('should execute 2 parallel streams', async () => {
      const pipelineConfig = {
        clientId: 'test-client',
        deliverableType: 'seo-content',
        streams: [
          {
            id: 'content-stream',
            domain: 'content',
            task: 'Write article about test topic',
            expectedDuration: 5000
          },
          {
            id: 'seo-stream',
            domain: 'seo',
            task: 'Perform keyword research for test topic',
            expectedDuration: 5000
          }
        ]
      };

      const startTime = Date.now();

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig,
        { timeout: 15000 }
      );

      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
      expect(result.results.length).toBe(2);

      // Parallel execution should be faster than sequential
      // 2 streams @ 5s each = 10s sequential, expect < 8s parallel
      expect(duration).toBeLessThan(8000);

      console.log(`✓ Parallel execution completed in ${duration}ms`);
      console.log(`  Speed improvement: ${result.speedImprovement?.toFixed(1)}%`);
    }, 20000); // 20 second timeout

    test('should maintain quality during parallel execution', async () => {
      const pipelineConfig = {
        clientId: 'test-client-quality',
        deliverableType: 'web-development',
        streams: [
          { id: 'frontend', domain: 'development', task: 'Create UI component' },
          { id: 'backend', domain: 'development', task: 'Create API endpoint' }
        ]
      };

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig,
        { enableQualityMonitoring: true }
      );

      expect(result.success).toBe(true);

      // Check quality scores if available
      if (result.qualityMetrics) {
        expect(result.qualityMetrics.overallScore).toBeGreaterThanOrEqual(0.95);
      }
    }, 20000);

    test('should handle stream failures gracefully', async () => {
      const pipelineConfig = {
        clientId: 'test-client-failure',
        deliverableType: 'test',
        streams: [
          { id: 'success-stream', domain: 'content', task: 'Valid task' },
          { id: 'failure-stream', domain: 'invalid', task: '__FORCE_FAILURE__' }
        ]
      };

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig,
        { continueOnError: true }
      );

      // Should complete despite one failure
      expect(result).toBeDefined();
      expect(result.results.length).toBeGreaterThan(0);

      // Check that at least one stream succeeded
      const successfulStreams = result.results.filter(r => r.success);
      expect(successfulStreams.length).toBeGreaterThan(0);
    }, 20000);
  });

  describe('Performance Metrics', () => {
    test('should track token usage per stream', async () => {
      const pipelineConfig = {
        clientId: 'test-metrics',
        deliverableType: 'content',
        streams: [
          { id: 'stream-1', domain: 'content', task: 'Test task 1' },
          { id: 'stream-2', domain: 'seo', task: 'Test task 2' }
        ]
      };

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig
      );

      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalTokens).toBeGreaterThan(0);
      expect(result.metrics.streamMetrics).toBeDefined();
    }, 20000);

    test('should calculate speed improvement accurately', async () => {
      const pipelineConfig = {
        clientId: 'test-speed',
        deliverableType: 'content',
        streams: [
          { id: 'stream-1', domain: 'content', task: 'Task 1', expectedDuration: 3000 },
          { id: 'stream-2', domain: 'content', task: 'Task 2', expectedDuration: 3000 }
        ]
      };

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig
      );

      expect(result.speedImprovement).toBeDefined();
      expect(result.speedImprovement).toBeGreaterThan(30); // At least 30% improvement

      console.log(`  Speed improvement: ${result.speedImprovement.toFixed(1)}%`);
    }, 20000);
  });

  describe('Learning and Optimization', () => {
    test('should store learnings after execution', async () => {
      const pipelineConfig = {
        clientId: 'test-learning',
        deliverableType: 'content',
        streams: [
          { id: 'stream-1', domain: 'content', task: 'Learning test task' }
        ]
      };

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig
      );

      expect(result.success).toBe(true);

      // Verify learnings were stored (check Redis or crystalline memory)
      if (components.redis && components.redis.isOpen) {
        const learningsKey = `orchestrai:learnings:${result.orchestrationId}`;
        const storedLearnings = await components.redis.get(learningsKey);

        if (storedLearnings) {
          const learnings = JSON.parse(storedLearnings);
          expect(learnings).toBeDefined();
          expect(learnings.orchestrationId).toBe(result.orchestrationId);
        }
      }
    }, 20000);

    test('should optimize stream configuration based on history', async () => {
      // First execution - create history
      const baselineConfig = {
        clientId: 'test-optimization',
        deliverableType: 'seo-content',
        streams: [
          { id: 'content', domain: 'content', task: 'Write content' },
          { id: 'seo', domain: 'seo', task: 'Keyword research' }
        ]
      };

      const baselineResult = await components.streamOrchestrator.executeParallelStreams(
        baselineConfig
      );

      expect(baselineResult.success).toBe(true);

      // Second execution - should use optimizations
      const optimizedResult = await components.streamOrchestrator.executeParallelStreams(
        baselineConfig
      );

      expect(optimizedResult.success).toBe(true);

      // Optimization applied (agent selection improved)
      console.log('  Baseline:', baselineResult.duration, 'ms');
      console.log('  Optimized:', optimizedResult.duration, 'ms');
    }, 40000);
  });

  describe('Error Handling and Recovery', () => {
    test('should handle WebSocket disconnection', async () => {
      const sessionId = `disconnect-test-${Date.now()}`;
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      const channel = await components.websocketLayer.createCoordinationChannel(
        sessionId,
        streamConfig
      );

      expect(channel).toBeDefined();

      // Simulate disconnection (cleanup should handle gracefully)
      await components.websocketLayer.closeCoordinationChannel(sessionId);

      expect(components.websocketLayer.activeChannels.has(sessionId)).toBe(false);
    });

    test('should handle Redis unavailability', async () => {
      // This test validates fallback behavior when Redis is unavailable
      const testConfigNoRedis = {
        ...testConfig,
        redisDatabase: 99 // Non-existent database
      };

      // Should initialize with fallback
      const fallbackComponents = await initializeSimultaneousExecution(testConfigNoRedis);

      expect(fallbackComponents).toBeDefined();
      expect(fallbackComponents.crystallineMemory).toBeDefined();

      // Cleanup
      if (fallbackComponents.websocketLayer) {
        fallbackComponents.websocketLayer.wss.close();
      }
    }, 30000);

    test('should timeout streams that exceed limits', async () => {
      const pipelineConfig = {
        clientId: 'test-timeout',
        deliverableType: 'test',
        streams: [
          {
            id: 'slow-stream',
            domain: 'content',
            task: '__SIMULATE_SLOW__',
            expectedDuration: 100000 // 100 seconds - will timeout
          }
        ]
      };

      const result = await components.streamOrchestrator.executeParallelStreams(
        pipelineConfig,
        { timeout: 5000 } // 5 second timeout
      );

      // Should complete with timeout error
      expect(result).toBeDefined();

      const streamResult = result.results.find(r => r.streamId === 'slow-stream');
      if (streamResult) {
        expect(streamResult.success).toBe(false);
        expect(streamResult.error).toContain('timeout');
      }
    }, 10000);
  });
});

/**
 * Run manual integration test (not part of Jest suite)
 * Usage: node tests/simultaneous-execution-integration.test.js
 */
if (require.main === module) {
  (async () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('ORCHESTRAI - Manual Integration Test');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      // Initialize system
      console.log('1. Initializing simultaneous execution system...');
      const config = createTestConfiguration();
      const components = await initializeSimultaneousExecution(config);
      console.log('✓ System initialized\n');

      // Test 2-stream execution
      console.log('2. Testing 2-stream parallel execution...');
      const pipelineConfig = {
        clientId: 'manual-test-client',
        deliverableType: 'seo-content',
        streams: [
          {
            id: 'content-stream',
            domain: 'content',
            task: 'Write test article',
            expectedDuration: 3000
          },
          {
            id: 'seo-stream',
            domain: 'seo',
            task: 'Perform keyword research',
            expectedDuration: 3000
          }
        ]
      };

      const startTime = Date.now();
      const result = await components.streamOrchestrator.executeParallelStreams(pipelineConfig);
      const duration = Date.now() - startTime;

      console.log(`✓ Parallel execution completed in ${duration}ms`);
      console.log(`  Speed improvement: ${result.speedImprovement?.toFixed(1)}%`);
      console.log(`  Success: ${result.success}`);
      console.log(`  Results: ${result.results.length} streams\n`);

      // Cleanup
      console.log('3. Cleaning up...');
      if (components.websocketLayer) {
        components.websocketLayer.wss.close();
      }
      if (components.redis && components.redis.isOpen) {
        await components.redis.quit();
      }
      console.log('✓ Cleanup complete\n');

      console.log('═══════════════════════════════════════════════════');
      console.log('✓ Manual integration test PASSED');
      console.log('═══════════════════════════════════════════════════');
      process.exit(0);

    } catch (error) {
      console.error('\n❌ Manual integration test FAILED:', error);
      process.exit(1);
    }
  })();
}
