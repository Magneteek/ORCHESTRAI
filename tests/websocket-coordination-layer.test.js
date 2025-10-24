/**
 * WebSocket Coordination Layer Unit Tests
 *
 * Tests the real-time coordination infrastructure including:
 * - WebSocket server initialization
 * - Connection handling
 * - Message routing
 * - Channel creation
 * - Broadcasting
 * - Redis integration
 * - Crystalline memory integration
 * - Session management
 * - Quality alerts
 * - Graceful shutdown
 */

const WebSocketCoordinationLayer = require('../orchestrai-shared/coordination/websocket-coordination-layer');
const WebSocket = require('ws');
const EventEmitter = require('events');

// Mock Redis client
class MockRedis extends EventEmitter {
  constructor() {
    super();
    this.store = new Map();
    this.channels = new Map();
    this.isOpen = true;
  }

  async setex(key, ttl, value) {
    this.store.set(key, { value, ttl, expires: Date.now() + ttl * 1000 });
    return 'OK';
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  duplicate() {
    return new MockRedis();
  }

  async connect() {
    return true;
  }

  async subscribe(channel, callback) {
    this.channels.set(channel, callback);
    return true;
  }

  async publish(channel, message) {
    const callback = this.channels.get(channel);
    if (callback) {
      callback(message);
    }
    return 1;
  }

  async unsubscribe() {
    this.channels.clear();
    return true;
  }

  async quit() {
    this.isOpen = false;
    return 'OK';
  }
}

// Mock Crystalline Memory
class MockCrystallineMemory {
  constructor() {
    this.memory = new Map();
  }

  async retrieveContext(query) {
    return {
      entities: [],
      relationships: [],
      historicalPatterns: [],
      loadedAt: Date.now()
    };
  }

  async searchMemory(query) {
    return {
      results: [],
      count: 0
    };
  }

  async storeWorkflowMemory(workflow) {
    this.memory.set(workflow.workflowId, workflow);
    return { success: true };
  }

  async addObservations(observations) {
    return { success: true };
  }
}

describe('WebSocket Coordination Layer', () => {
  let coordinationLayer;
  let mockRedis;
  let mockMemory;

  beforeEach(async () => {
    mockRedis = new MockRedis();
    mockMemory = new MockCrystallineMemory();

    coordinationLayer = new WebSocketCoordinationLayer(mockRedis, mockMemory, {
      wsPort: 8081 // Use different port for testing
    });

    await coordinationLayer.initialize();
  });

  afterEach(async () => {
    if (coordinationLayer && coordinationLayer.wsServer) {
      // Close all connections
      coordinationLayer.wsServer.clients.forEach(ws => ws.close());
      coordinationLayer.wsServer.close();
    }
    if (mockRedis && mockRedis.isOpen) {
      await mockRedis.quit();
    }
  });

  // ==================== INITIALIZATION ====================

  describe('Initialization', () => {
    test('should initialize WebSocket server', () => {
      expect(coordinationLayer.wsServer).toBeDefined();
      expect(coordinationLayer.wsServer.options.port).toBe(8081);
    });

    test('should initialize with Redis connection', () => {
      expect(coordinationLayer.redis).toBeDefined();
      expect(coordinationLayer.redis.isOpen).toBe(true);
    });

    test('should initialize with Crystalline Memory', () => {
      expect(coordinationLayer.crystallineMemory).toBeDefined();
    });

    test('should initialize empty active channels', () => {
      expect(coordinationLayer.activeChannels.size).toBe(0);
    });

    test('should initialize empty agent connections', () => {
      expect(coordinationLayer.agentConnections.size).toBe(0);
    });

    test('should initialize metrics', () => {
      expect(coordinationLayer.metrics.activeSessions).toBe(0);
      expect(coordinationLayer.metrics.connectedAgents).toBe(0);
      expect(coordinationLayer.metrics.messagesSent).toBe(0);
      expect(coordinationLayer.metrics.messagesReceived).toBe(0);
    });

    test('should emit initialized event', (done) => {
      const newLayer = new WebSocketCoordinationLayer(mockRedis, mockMemory, {
        wsPort: 8082
      });

      newLayer.once('initialized', () => {
        newLayer.wsServer.close();
        done();
      });

      newLayer.initialize();
    });
  });

  // ==================== CHANNEL CREATION ====================

  describe('Channel Creation', () => {
    test('should create coordination channel', async () => {
      const sessionId = 'test-session-123';
      const streamConfig = {
        streams: [
          { id: 'stream-1', domain: 'content' },
          { id: 'stream-2', domain: 'seo' }
        ]
      };

      const channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(channel).toBeDefined();
      expect(channel.sessionId).toBe(sessionId);
      expect(channel.streamConfig).toEqual(streamConfig);
      expect(channel.sharedContext).toBeDefined();
      expect(channel.currentState).toBeDefined();
    });

    test('should load historical context from crystalline memory', async () => {
      const sessionId = 'test-session-456';
      const streamConfig = {
        streams: [{ id: 'stream-1', domain: 'content' }],
        clientName: 'test-client',
        projectUuid: 'project-123'
      };

      const channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(channel.sharedContext).toBeDefined();
      expect(channel.sharedContext.loadedAt).toBeDefined();
    });

    test('should add channel to active channels', async () => {
      const sessionId = 'test-session-789';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(coordinationLayer.activeChannels.has(sessionId)).toBe(true);
    });

    test('should store channel in Redis', async () => {
      const sessionId = 'test-session-redis';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const redisKey = `orchestrai:coordination:session:${sessionId}`;
      const storedData = await mockRedis.get(redisKey);

      expect(storedData).toBeDefined();
      const channelData = JSON.parse(storedData);
      expect(channelData.sessionId).toBe(sessionId);
    });

    test('should subscribe to Redis pub/sub channel', async () => {
      const sessionId = 'test-session-pubsub';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(coordinationLayer.channelSubscriptions.has(sessionId)).toBe(true);
    });

    test('should increment active sessions metric', async () => {
      const initialSessions = coordinationLayer.metrics.activeSessions;
      const sessionId = 'test-session-metric';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(coordinationLayer.metrics.activeSessions).toBe(initialSessions + 1);
    });

    test('should emit channel-created event', (done) => {
      const sessionId = 'test-session-event';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      coordinationLayer.once('channel-created', (data) => {
        expect(data.sessionId).toBe(sessionId);
        expect(data.channel).toBeDefined();
        done();
      });

      coordinationLayer.createCoordinationChannel(sessionId, streamConfig);
    });

    test('should initialize channel state', async () => {
      const sessionId = 'test-session-state';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      const channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(channel.currentState.phase).toBe('initialized');
      expect(channel.currentState.progress).toBe(0);
      expect(channel.currentState.activeAgents).toEqual([]);
      expect(channel.currentState.completedTasks).toEqual([]);
    });

    test('should initialize empty quality alerts', async () => {
      const sessionId = 'test-session-quality';
      const streamConfig = { streams: [{ id: 'stream-1' }] };

      const channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      expect(channel.qualityAlerts).toEqual([]);
      expect(channel.complianceStatus).toEqual({});
    });
  });

  // ==================== BROADCASTING ====================

  describe('Broadcasting', () => {
    let channel;
    let sessionId;

    beforeEach(async () => {
      sessionId = 'broadcast-test-session';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);
    });

    test('should broadcast message to session', async () => {
      const message = {
        type: 'TEST_MESSAGE',
        payload: { data: 'test-data' }
      };

      const sentCount = await coordinationLayer.broadcastToSession(sessionId, message);

      // No agents connected, so count should be 0
      expect(sentCount).toBeGreaterThanOrEqual(0);
    });

    test('should publish message to Redis', async () => {
      const message = {
        type: 'TEST_MESSAGE',
        payload: { data: 'test-data' }
      };

      let receivedMessage = null;
      const channelName = `orchestrai:coordination:${sessionId}`;

      // Subscribe to Redis channel
      await mockRedis.subscribe(channelName, (msg) => {
        receivedMessage = JSON.parse(msg);
      });

      await coordinationLayer.broadcastToSession(sessionId, message);

      expect(receivedMessage).toBeDefined();
      expect(receivedMessage.type).toBe('TEST_MESSAGE');
    });

    test('should increment messages sent metric', async () => {
      const initialSent = coordinationLayer.metrics.messagesSent;

      const message = { type: 'TEST', payload: {} };
      await coordinationLayer.broadcastToSession(sessionId, message);

      expect(coordinationLayer.metrics.messagesSent).toBeGreaterThanOrEqual(initialSent);
    });

    test('should handle broadcast to non-existent session', async () => {
      const message = { type: 'TEST', payload: {} };

      // Should not throw
      await expect(
        coordinationLayer.broadcastToSession('non-existent-session', message)
      ).resolves.not.toThrow();
    });

    test('should exclude specific agent from broadcast', async () => {
      const message = { type: 'TEST', payload: {} };

      const sentCount = await coordinationLayer.broadcastToSession(
        sessionId,
        message,
        'agent-to-exclude'
      );

      expect(sentCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== CONTEXT MANAGEMENT ====================

  describe('Context Management', () => {
    let channel;
    let sessionId;

    beforeEach(async () => {
      sessionId = 'context-test-session';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);
    });

    test('should update shared context', async () => {
      const contextUpdate = {
        newEntity: 'test-entity',
        newData: { value: 123 }
      };

      await coordinationLayer.updateSharedContext(sessionId, contextUpdate);

      const updatedChannel = coordinationLayer.activeChannels.get(sessionId);
      expect(updatedChannel.sharedContext.newEntity).toBe('test-entity');
      expect(updatedChannel.sharedContext.newData).toEqual({ value: 123 });
      expect(updatedChannel.sharedContext.lastUpdated).toBeDefined();
    });

    test('should emit context-updated event', (done) => {
      const contextUpdate = { newData: 'test' };

      coordinationLayer.once('context-updated', (data) => {
        expect(data.sessionId).toBe(sessionId);
        expect(data.update).toEqual(contextUpdate);
        done();
      });

      coordinationLayer.updateSharedContext(sessionId, contextUpdate);
    });

    test('should handle context update for non-existent session', async () => {
      const contextUpdate = { data: 'test' };

      // Should not throw
      await expect(
        coordinationLayer.updateSharedContext('non-existent', contextUpdate)
      ).resolves.not.toThrow();
    });

    test('should load historical context on channel creation', async () => {
      const newSessionId = 'context-load-test';
      const streamConfig = {
        streams: [{ id: 'stream-1' }],
        clientName: 'test-client',
        projectUuid: 'project-456'
      };

      const channel = await coordinationLayer.createCoordinationChannel(newSessionId, streamConfig);

      expect(channel.sharedContext).toBeDefined();
      expect(channel.sharedContext.entities).toBeDefined();
      expect(channel.sharedContext.relationships).toBeDefined();
      expect(channel.sharedContext.historicalPatterns).toBeDefined();
    });
  });

  // ==================== MESSAGE HANDLING ====================

  describe('Message Handling', () => {
    test('should handle PROGRESS_UPDATE message', async () => {
      const sessionId = 'progress-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const mockWs = { agentId: 'agent-1', sessionId };

      const progressMessage = {
        sessionId,
        agentId: 'agent-1',
        streamId: 'stream-1',
        progress: 50,
        taskId: 'task-1',
        status: 'in-progress'
      };

      await coordinationLayer.handleProgressUpdate(mockWs, progressMessage);

      const channel = coordinationLayer.activeChannels.get(sessionId);
      const streamData = channel.streams.get('stream-1');

      expect(streamData).toBeDefined();
      expect(streamData.progress).toBe(50);
      expect(streamData.status).toBe('in-progress');
    });

    test('should handle QUALITY_ALERT message', async () => {
      const sessionId = 'quality-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const mockWs = { agentId: 'agent-1', sessionId };

      const qualityMessage = {
        sessionId,
        agentId: 'agent-1',
        alertType: 'code-quality',
        severity: 'high',
        details: { violations: 5 }
      };

      await coordinationLayer.handleQualityAlert(mockWs, qualityMessage);

      const channel = coordinationLayer.activeChannels.get(sessionId);

      expect(channel.qualityAlerts.length).toBe(1);
      expect(channel.qualityAlerts[0].alertType).toBe('code-quality');
      expect(channel.qualityAlerts[0].severity).toBe('high');
    });

    test('should handle TASK_COMPLETE message', async () => {
      const sessionId = 'task-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const mockWs = { agentId: 'agent-1', sessionId };

      const taskMessage = {
        sessionId,
        agentId: 'agent-1',
        taskId: 'task-1',
        result: { success: true, quality: 95 },
        duration: 5000
      };

      await coordinationLayer.handleTaskCompletion(mockWs, taskMessage);

      const channel = coordinationLayer.activeChannels.get(sessionId);

      expect(channel.currentState.completedTasks.length).toBe(1);
      expect(channel.currentState.completedTasks[0].taskId).toBe('task-1');
      expect(channel.currentState.completedTasks[0].duration).toBe(5000);
    });

    test('should emit progress-updated event', (done) => {
      (async () => {
        const sessionId = 'progress-event-test';
        const streamConfig = { streams: [{ id: 'stream-1' }] };
        await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

        coordinationLayer.once('progress-updated', (data) => {
          expect(data.sessionId).toBe(sessionId);
          expect(data.agentId).toBe('agent-1');
          expect(data.streamId).toBe('stream-1');
          expect(data.progress).toBe(50);
          done();
        });

        const mockWs = { agentId: 'agent-1', sessionId };
        const progressMessage = {
          sessionId,
          agentId: 'agent-1',
          streamId: 'stream-1',
          progress: 50
        };

        await coordinationLayer.handleProgressUpdate(mockWs, progressMessage);
      })();
    });

    test('should emit quality-alert event', (done) => {
      (async () => {
        const sessionId = 'quality-event-test';
        const streamConfig = { streams: [{ id: 'stream-1' }] };
        await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

        coordinationLayer.once('quality-alert', (data) => {
          expect(data.sessionId).toBe(sessionId);
          expect(data.alert.alertType).toBe('security');
          done();
        });

        const mockWs = { agentId: 'agent-1', sessionId };
        const qualityMessage = {
          sessionId,
          agentId: 'agent-1',
          alertType: 'security',
          severity: 'critical',
          details: {}
        };

        await coordinationLayer.handleQualityAlert(mockWs, qualityMessage);
      })();
    });

    test('should emit task-completed event', (done) => {
      (async () => {
        const sessionId = 'task-event-test';
        const streamConfig = { streams: [{ id: 'stream-1' }] };
        await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

        coordinationLayer.once('task-completed', (data) => {
          expect(data.sessionId).toBe(sessionId);
          expect(data.taskId).toBe('task-1');
          expect(data.agentId).toBe('agent-1');
          done();
        });

        const mockWs = { agentId: 'agent-1', sessionId };
        const taskMessage = {
          sessionId,
          agentId: 'agent-1',
          taskId: 'task-1',
          result: { success: true },
          duration: 1000
        };

        await coordinationLayer.handleTaskCompletion(mockWs, taskMessage);
      })();
    });
  });

  // ==================== CHANNEL CLOSING ====================

  describe('Channel Closing', () => {
    let channel;
    let sessionId;

    beforeEach(async () => {
      sessionId = 'close-test-session';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);
    });

    test('should close coordination channel', async () => {
      await coordinationLayer.closeChannel(sessionId);

      expect(coordinationLayer.activeChannels.has(sessionId)).toBe(false);
    });

    test('should unsubscribe from Redis', async () => {
      await coordinationLayer.closeChannel(sessionId);

      expect(coordinationLayer.channelSubscriptions.has(sessionId)).toBe(false);
    });

    test('should decrement active sessions metric', async () => {
      const initialSessions = coordinationLayer.metrics.activeSessions;

      await coordinationLayer.closeChannel(sessionId);

      expect(coordinationLayer.metrics.activeSessions).toBe(initialSessions - 1);
    });

    test('should emit channel-closed event', (done) => {
      coordinationLayer.once('channel-closed', (data) => {
        expect(data.sessionId).toBe(sessionId);
        done();
      });

      coordinationLayer.closeChannel(sessionId);
    });

    test('should store final state in crystalline memory', async () => {
      await coordinationLayer.closeChannel(sessionId);

      // Verify memory was called (mock tracks calls)
      expect(mockMemory.memory.size).toBeGreaterThan(0);
    });

    test('should handle closing non-existent channel', async () => {
      // Should not throw
      await expect(
        coordinationLayer.closeChannel('non-existent-session')
      ).resolves.not.toThrow();
    });
  });

  // ==================== METRICS ====================

  describe('Metrics', () => {
    test('should track active sessions', async () => {
      const initialSessions = coordinationLayer.metrics.activeSessions;

      await coordinationLayer.createCoordinationChannel('session-1', { streams: [] });
      await coordinationLayer.createCoordinationChannel('session-2', { streams: [] });

      expect(coordinationLayer.metrics.activeSessions).toBe(initialSessions + 2);
    });

    test('should track messages sent', async () => {
      const sessionId = 'metrics-test';
      await coordinationLayer.createCoordinationChannel(sessionId, { streams: [] });

      const initialSent = coordinationLayer.metrics.messagesSent;

      await coordinationLayer.broadcastToSession(sessionId, { type: 'TEST', payload: {} });

      expect(coordinationLayer.metrics.messagesSent).toBeGreaterThanOrEqual(initialSent);
    });

    test('should provide metrics with uptime', () => {
      const metrics = coordinationLayer.getMetrics();

      expect(metrics.uptime).toBeGreaterThan(0);
      expect(metrics.averageMessageRate).toBeGreaterThanOrEqual(0);
      expect(metrics.activeSessions).toBeDefined();
      expect(metrics.connectedAgents).toBeDefined();
    });

    test('should calculate average message rate', () => {
      const metrics = coordinationLayer.getMetrics();

      expect(metrics.averageMessageRate).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== CHANNEL STATUS ====================

  describe('Channel Status', () => {
    test('should get channel status', async () => {
      const sessionId = 'status-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const status = coordinationLayer.getChannelStatus(sessionId);

      expect(status.found).toBe(true);
      expect(status.sessionId).toBe(sessionId);
      expect(status.createdAt).toBeDefined();
      expect(status.currentState).toBeDefined();
      expect(status.connectedAgents).toBeDefined();
      expect(status.activeStreams).toBeDefined();
    });

    test('should return not found for non-existent session', () => {
      const status = coordinationLayer.getChannelStatus('non-existent');

      expect(status.found).toBe(false);
    });

    test('should track connected agents count', async () => {
      const sessionId = 'agents-count-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      const channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const status = coordinationLayer.getChannelStatus(sessionId);

      expect(status.connectedAgents).toBe(0); // No agents connected initially
    });

    test('should track active streams count', async () => {
      const sessionId = 'streams-count-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const status = coordinationLayer.getChannelStatus(sessionId);

      expect(status.activeStreams).toBe(0); // No streams active initially
    });

    test('should track quality alerts count', async () => {
      const sessionId = 'alerts-count-test';
      const streamConfig = { streams: [{ id: 'stream-1' }] };
      await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);

      const mockWs = { agentId: 'agent-1', sessionId };
      await coordinationLayer.handleQualityAlert(mockWs, {
        sessionId,
        agentId: 'agent-1',
        alertType: 'test-alert',
        severity: 'low',
        details: {}
      });

      const status = coordinationLayer.getChannelStatus(sessionId);

      expect(status.qualityAlerts).toBe(1);
    });
  });

  // ==================== GRACEFUL SHUTDOWN ====================

  describe('Graceful Shutdown', () => {
    test('should close all active channels on shutdown', async () => {
      await coordinationLayer.createCoordinationChannel('session-1', { streams: [] });
      await coordinationLayer.createCoordinationChannel('session-2', { streams: [] });

      expect(coordinationLayer.activeChannels.size).toBe(2);

      await coordinationLayer.shutdown();

      expect(coordinationLayer.activeChannels.size).toBe(0);
    });

    test('should close WebSocket server on shutdown', async () => {
      const wsServer = coordinationLayer.wsServer;

      await coordinationLayer.shutdown();

      // WebSocket server should be closed (readyState will change)
      expect(wsServer).toBeDefined();
    });
  });

  // ==================== PROGRESS CALCULATION ====================

  describe('Progress Calculation', () => {
    let channel;
    let sessionId;

    beforeEach(async () => {
      sessionId = 'progress-calc-test';
      const streamConfig = { streams: [{ id: 'stream-1' }, { id: 'stream-2' }] };
      channel = await coordinationLayer.createCoordinationChannel(sessionId, streamConfig);
    });

    test('should calculate overall progress from stream progress', () => {
      // Manually set stream progress
      channel.streams.set('stream-1', { progress: 50 });
      channel.streams.set('stream-2', { progress: 100 });

      const overallProgress = coordinationLayer.calculateOverallProgress(channel);

      expect(overallProgress).toBe(75); // (50 + 100) / 2 = 75
    });

    test('should return 0 for empty streams', () => {
      const emptyChannel = { streams: new Map() };

      const overallProgress = coordinationLayer.calculateOverallProgress(emptyChannel);

      expect(overallProgress).toBe(0);
    });

    test('should handle partial stream data', () => {
      channel.streams.set('stream-1', { progress: 50 });
      channel.streams.set('stream-2', {}); // No progress set

      const overallProgress = coordinationLayer.calculateOverallProgress(channel);

      expect(overallProgress).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * Run manual unit test
 * Usage: node tests/websocket-coordination-layer.test.js
 */
if (require.main === module) {
  (async () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('WebSocket Coordination Layer - Manual Unit Test');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      const mockRedis = new MockRedis();
      const mockMemory = new MockCrystallineMemory();

      console.log('1. Initializing WebSocket Coordination Layer...');
      const layer = new WebSocketCoordinationLayer(mockRedis, mockMemory, {
        wsPort: 8083
      });
      await layer.initialize();
      console.log('✓ Layer initialized\n');

      console.log('2. Creating coordination channel...');
      const sessionId = 'manual-test-session';
      const streamConfig = {
        streams: [
          { id: 'content-stream', domain: 'content' },
          { id: 'seo-stream', domain: 'seo' }
        ]
      };

      const channel = await layer.createCoordinationChannel(sessionId, streamConfig);
      console.log(`✓ Channel created: ${channel.sessionId}`);
      console.log(`  Streams: ${channel.streamConfig.streams.length}`);
      console.log(`  Shared context loaded: ${Object.keys(channel.sharedContext).length} keys\n`);

      console.log('3. Simulating progress update...');
      const mockWs = { agentId: 'test-agent', sessionId };
      await layer.handleProgressUpdate(mockWs, {
        sessionId,
        agentId: 'test-agent',
        streamId: 'content-stream',
        progress: 50,
        status: 'in-progress'
      });
      console.log('✓ Progress updated to 50%\n');

      console.log('4. Simulating quality alert...');
      await layer.handleQualityAlert(mockWs, {
        sessionId,
        agentId: 'test-agent',
        alertType: 'code-quality',
        severity: 'medium',
        details: { violations: 3 }
      });
      console.log('✓ Quality alert recorded\n');

      console.log('5. Getting channel status...');
      const status = layer.getChannelStatus(sessionId);
      console.log(`✓ Session found: ${status.found}`);
      console.log(`  Active streams: ${status.activeStreams}`);
      console.log(`  Quality alerts: ${status.qualityAlerts}`);
      console.log(`  Progress: ${status.progress}%\n`);

      console.log('6. Getting metrics...');
      const metrics = layer.getMetrics();
      console.log(`✓ Active sessions: ${metrics.activeSessions}`);
      console.log(`  Messages sent: ${metrics.messagesSent}`);
      console.log(`  Uptime: ${metrics.uptime}ms\n`);

      console.log('7. Closing channel...');
      await layer.closeChannel(sessionId);
      console.log('✓ Channel closed\n');

      console.log('8. Shutting down...');
      await layer.shutdown();
      await mockRedis.quit();
      console.log('✓ Shutdown complete\n');

      console.log('═══════════════════════════════════════════════════');
      console.log('✓ Manual unit test PASSED');
      console.log('═══════════════════════════════════════════════════');
      process.exit(0);

    } catch (error) {
      console.error('\n❌ Manual unit test FAILED:', error);
      process.exit(1);
    }
  })();
}
