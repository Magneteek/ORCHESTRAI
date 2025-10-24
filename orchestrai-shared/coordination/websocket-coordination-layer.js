/**
 * ORCHESTRAI WebSocket Coordination Layer
 *
 * Real-time coordination infrastructure for simultaneous agent execution
 * Integrates with existing Redis + Crystalline Memory architecture
 *
 * Features:
 * - WebSocket server for real-time agent communication
 * - Redis pub/sub for distributed coordination
 * - Crystalline memory integration for shared context
 * - Session-based channel management
 * - Real-time progress broadcasting
 * - Quality monitoring integration
 *
 * Architecture:
 * - Long-term Intelligence: Crystalline Memory (MCP Memory)
 * - Session State: Redis (distributed access)
 * - Real-time Sync: WebSocket (instant updates)
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class WebSocketCoordinationLayer extends EventEmitter {
  constructor(redis, crystallineMemory, options = {}) {
    super();

    // Core dependencies
    this.redis = redis;
    this.crystallineMemory = crystallineMemory;

    // WebSocket server configuration
    this.wsPort = options.wsPort || 8080;
    this.wsServer = null;

    // Active coordination channels
    this.activeChannels = new Map(); // sessionId → Channel
    this.agentConnections = new Map(); // agentId → WebSocket
    this.channelSubscriptions = new Map(); // sessionId → Redis Subscriber

    // Coordination metrics
    this.metrics = {
      activeSessions: 0,
      connectedAgents: 0,
      messagesSent: 0,
      messagesReceived: 0,
      averageLatency: 0,
      uptime: Date.now()
    };

    // Configuration
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      sessionTimeout: 7200000, // 2 hours
      maxReconnectAttempts: 3,
      messageQueueSize: 100,
      enableCompression: true,
      enableHeartbeat: true
    };

    console.log('🌐 WebSocket Coordination Layer initializing...');
  }

  /**
   * Initialize WebSocket server and Redis pub/sub
   */
  async initialize() {
    try {
      // Create WebSocket server
      this.wsServer = new WebSocket.Server({
        port: this.wsPort,
        perMessageDeflate: this.config.enableCompression
      });

      this.setupWebSocketHandlers();

      // Start heartbeat monitoring if enabled
      if (this.config.enableHeartbeat) {
        this.startHeartbeatMonitoring();
      }

      console.log(`✅ WebSocket server listening on port ${this.wsPort}`);
      console.log(`🔮 Integrated with Crystalline Memory for shared context`);
      console.log(`📡 Redis pub/sub ready for distributed coordination`);

      this.emit('initialized');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket coordination:', error);
      throw error;
    }
  }

  /**
   * Setup WebSocket connection handlers
   */
  setupWebSocketHandlers() {
    this.wsServer.on('connection', (ws, request) => {
      console.log('🔌 New WebSocket connection');

      // Connection metadata
      ws.id = uuidv4();
      ws.agentId = null;
      ws.sessionId = null;
      ws.isAlive = true;

      // Ping/pong for connection monitoring
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Message handler
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleIncomingMessage(ws, message);
          this.metrics.messagesReceived++;
        } catch (error) {
          console.error('Error handling message:', error);
          this.sendError(ws, 'Invalid message format', error.message);
        }
      });

      // Connection close handler
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      // Error handler
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    this.wsServer.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  async handleIncomingMessage(ws, message) {
    const { type, payload } = message;

    switch (type) {
      case 'AGENT_REGISTER':
        await this.handleAgentRegistration(ws, payload);
        break;

      case 'JOIN_SESSION':
        await this.handleSessionJoin(ws, payload);
        break;

      case 'PROGRESS_UPDATE':
        await this.handleProgressUpdate(ws, payload);
        break;

      case 'QUALITY_ALERT':
        await this.handleQualityAlert(ws, payload);
        break;

      case 'CONTEXT_REQUEST':
        await this.handleContextRequest(ws, payload);
        break;

      case 'TASK_COMPLETE':
        await this.handleTaskCompletion(ws, payload);
        break;

      case 'STATE_SYNC':
        await this.handleStateSync(ws, payload);
        break;

      default:
        console.warn('Unknown message type:', type);
        this.sendError(ws, 'Unknown message type', type);
    }
  }

  /**
   * Create coordination channel for simultaneous execution
   */
  async createCoordinationChannel(sessionId, streamConfig) {
    try {
      console.log(`📡 Creating coordination channel: ${sessionId}`);

      // Load shared context from crystalline memory
      const historicalContext = await this.loadHistoricalContext(streamConfig);

      // Create channel with shared state
      const channel = {
        sessionId,
        streamConfig,
        createdAt: Date.now(),

        // Shared state
        sharedContext: historicalContext,
        currentState: {
          phase: 'initialized',
          progress: 0,
          activeAgents: [],
          completedTasks: [],
          qualityScores: {}
        },

        // WebSocket clients connected to this channel
        connections: new Set(),

        // Stream-specific data
        streams: new Map(), // streamId → streamData

        // Quality monitoring
        qualityAlerts: [],
        complianceStatus: {}
      };

      // Store in memory
      this.activeChannels.set(sessionId, channel);

      // Store in Redis for distributed access
      await this.storeChannelInRedis(sessionId, channel);

      // Subscribe to Redis pub/sub for this session
      await this.subscribeToSession(sessionId);

      this.metrics.activeSessions++;

      console.log(`✅ Coordination channel created: ${sessionId}`);
      console.log(`   ├─ Historical context loaded from crystalline memory`);
      console.log(`   ├─ Redis pub/sub subscribed`);
      console.log(`   └─ Streams: ${streamConfig.streams?.length || 0}`);

      this.emit('channel-created', { sessionId, channel });

      return channel;

    } catch (error) {
      console.error(`❌ Failed to create coordination channel: ${sessionId}`, error);
      throw error;
    }
  }

  /**
   * Load historical context from crystalline memory
   */
  async loadHistoricalContext(streamConfig) {
    if (!this.crystallineMemory) {
      return { entities: [], relationships: [], historicalPatterns: [] };
    }

    try {
      console.log('🔮 Loading historical context from crystalline memory...');

      // Search for relevant context
      const context = await this.crystallineMemory.retrieveContext({
        clientName: streamConfig.clientName,
        projectUuid: streamConfig.projectUuid,
        domain: streamConfig.domain,
        deliverableType: streamConfig.deliverableType
      });

      // Extract relevant patterns and insights
      const historicalPatterns = await this.extractHistoricalPatterns(context);

      console.log(`   ✅ Loaded ${context.entities?.length || 0} entities`);
      console.log(`   ✅ Loaded ${context.relationships?.length || 0} relationships`);
      console.log(`   ✅ Extracted ${historicalPatterns.length} patterns`);

      return {
        ...context,
        historicalPatterns,
        loadedAt: Date.now()
      };

    } catch (error) {
      console.warn('Could not load historical context:', error.message);
      return { entities: [], relationships: [], historicalPatterns: [] };
    }
  }

  /**
   * Extract historical patterns for optimization
   */
  async extractHistoricalPatterns(context) {
    const patterns = [];

    // Analyze successful workflows
    if (context.entities) {
      const workflows = context.entities.filter(e => e.type === 'workflow' || e.type === 'pipeline-execution');

      for (const workflow of workflows) {
        if (workflow.observations) {
          const successObservations = workflow.observations.filter(obs =>
            obs.includes('success') || obs.includes('completed')
          );

          if (successObservations.length > 0) {
            patterns.push({
              type: 'successful-workflow',
              context: workflow.name,
              observations: successObservations,
              relevance: 0.8
            });
          }
        }
      }
    }

    return patterns;
  }

  /**
   * Store channel state in Redis for distributed access
   */
  async storeChannelInRedis(sessionId, channel) {
    if (!this.redis) return;

    try {
      const redisKey = `orchestrai:coordination:session:${sessionId}`;

      // Store with 2-hour TTL (session timeout)
      await this.redis.setex(
        redisKey,
        7200,
        JSON.stringify({
          sessionId: channel.sessionId,
          createdAt: channel.createdAt,
          currentState: channel.currentState,
          streamConfig: channel.streamConfig,
          // Don't store connections (they're local to this instance)
          activeStreams: Array.from(channel.streams.keys())
        })
      );

    } catch (error) {
      console.warn('Failed to store channel in Redis:', error.message);
    }
  }

  /**
   * Subscribe to Redis pub/sub for session
   */
  async subscribeToSession(sessionId) {
    if (!this.redis) return;

    try {
      // Create Redis subscriber (duplicate connection for pub/sub)
      const subscriber = this.redis.duplicate();
      await subscriber.connect();

      // Subscribe to session channel
      const channelName = `orchestrai:coordination:${sessionId}`;

      await subscriber.subscribe(channelName, (message) => {
        this.handleRedisMessage(sessionId, message);
      });

      this.channelSubscriptions.set(sessionId, subscriber);

      console.log(`   📡 Subscribed to Redis channel: ${channelName}`);

    } catch (error) {
      console.warn('Failed to subscribe to Redis channel:', error.message);
    }
  }

  /**
   * Handle Redis pub/sub message
   */
  async handleRedisMessage(sessionId, message) {
    try {
      const data = JSON.parse(message);

      // Broadcast to all WebSocket clients in this session
      await this.broadcastToSession(sessionId, {
        type: 'REDIS_UPDATE',
        payload: data,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error handling Redis message:', error);
    }
  }

  /**
   * Broadcast update to all agents in session
   */
  async broadcastToSession(sessionId, message, excludeAgent = null) {
    const channel = this.activeChannels.get(sessionId);
    if (!channel) {
      console.warn(`Channel not found: ${sessionId}`);
      return;
    }

    const broadcastData = JSON.stringify({
      ...message,
      sessionId,
      timestamp: Date.now()
    });

    let sentCount = 0;

    // Broadcast via WebSocket to connected agents
    channel.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN && ws.agentId !== excludeAgent) {
        ws.send(broadcastData);
        sentCount++;
      }
    });

    // Also publish to Redis for distributed coordination
    if (this.redis) {
      await this.redis.publish(
        `orchestrai:coordination:${sessionId}`,
        JSON.stringify(message)
      );
    }

    this.metrics.messagesSent += sentCount;

    return sentCount;
  }

  /**
   * Update shared context in real-time
   */
  async updateSharedContext(sessionId, contextUpdate) {
    const channel = this.activeChannels.get(sessionId);
    if (!channel) return;

    // Merge update into shared context
    channel.sharedContext = {
      ...channel.sharedContext,
      ...contextUpdate,
      lastUpdated: Date.now()
    };

    // Update Redis
    await this.storeChannelInRedis(sessionId, channel);

    // Broadcast to all agents
    await this.broadcastToSession(sessionId, {
      type: 'CONTEXT_UPDATE',
      payload: contextUpdate
    });

    this.emit('context-updated', { sessionId, update: contextUpdate });
  }

  /**
   * Handle agent registration
   */
  async handleAgentRegistration(ws, payload) {
    const { agentId, agentType, capabilities } = payload;

    ws.agentId = agentId;
    this.agentConnections.set(agentId, ws);
    this.metrics.connectedAgents++;

    console.log(`✅ Agent registered: ${agentId} (${agentType})`);

    // Send confirmation
    this.sendMessage(ws, {
      type: 'REGISTRATION_CONFIRMED',
      payload: {
        agentId,
        timestamp: Date.now(),
        serverTime: Date.now()
      }
    });

    this.emit('agent-registered', { agentId, agentType, capabilities });
  }

  /**
   * Handle agent joining session
   */
  async handleSessionJoin(ws, payload) {
    const { sessionId, agentId, streamId } = payload;

    ws.sessionId = sessionId;

    const channel = this.activeChannels.get(sessionId);
    if (!channel) {
      this.sendError(ws, 'Session not found', sessionId);
      return;
    }

    // Add connection to channel
    channel.connections.add(ws);

    // Update stream data
    if (streamId) {
      const streamData = channel.streams.get(streamId) || { agents: [], progress: 0 };
      streamData.agents.push(agentId);
      channel.streams.set(streamId, streamData);
    }

    // Update current state
    channel.currentState.activeAgents.push(agentId);

    console.log(`✅ Agent ${agentId} joined session: ${sessionId}`);

    // Send current context to agent
    this.sendMessage(ws, {
      type: 'SESSION_JOINED',
      payload: {
        sessionId,
        sharedContext: channel.sharedContext,
        currentState: channel.currentState,
        timestamp: Date.now()
      }
    });

    // Notify other agents
    await this.broadcastToSession(sessionId, {
      type: 'AGENT_JOINED',
      payload: { agentId, streamId }
    }, agentId);

    this.emit('agent-joined-session', { sessionId, agentId, streamId });
  }

  /**
   * Handle progress update from agent
   */
  async handleProgressUpdate(ws, payload) {
    const { sessionId, agentId, streamId, progress, taskId, status } = payload;

    const channel = this.activeChannels.get(sessionId);
    if (!channel) return;

    // Update stream progress
    if (streamId) {
      const streamData = channel.streams.get(streamId) || {};
      streamData.progress = progress;
      streamData.lastUpdate = Date.now();
      streamData.status = status;
      channel.streams.set(streamId, streamData);
    }

    // Update overall progress
    const totalProgress = this.calculateOverallProgress(channel);
    channel.currentState.progress = totalProgress;

    // Update Redis state
    await this.storeChannelInRedis(sessionId, channel);

    // Broadcast progress update
    await this.broadcastToSession(sessionId, {
      type: 'PROGRESS_UPDATE',
      payload: {
        agentId,
        streamId,
        progress,
        taskId,
        status,
        overallProgress: totalProgress
      }
    });

    this.emit('progress-updated', { sessionId, agentId, streamId, progress });
  }

  /**
   * Handle quality alert
   */
  async handleQualityAlert(ws, payload) {
    const { sessionId, agentId, alertType, severity, details } = payload;

    const channel = this.activeChannels.get(sessionId);
    if (!channel) return;

    const alert = {
      alertId: uuidv4(),
      agentId,
      alertType,
      severity,
      details,
      timestamp: Date.now()
    };

    channel.qualityAlerts.push(alert);

    console.log(`⚠️ Quality alert [${severity}]: ${alertType} from ${agentId}`);

    // Broadcast quality alert
    await this.broadcastToSession(sessionId, {
      type: 'QUALITY_ALERT',
      payload: alert
    });

    this.emit('quality-alert', { sessionId, alert });
  }

  /**
   * Handle context request from agent
   */
  async handleContextRequest(ws, payload) {
    const { sessionId, contextQuery } = payload;

    const channel = this.activeChannels.get(sessionId);
    if (!channel) {
      this.sendError(ws, 'Session not found', sessionId);
      return;
    }

    // Query crystalline memory for additional context if needed
    let additionalContext = {};
    if (contextQuery && this.crystallineMemory) {
      additionalContext = await this.crystallineMemory.searchMemory(contextQuery);
    }

    // Send context response
    this.sendMessage(ws, {
      type: 'CONTEXT_RESPONSE',
      payload: {
        sharedContext: channel.sharedContext,
        currentState: channel.currentState,
        additionalContext,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Handle task completion
   */
  async handleTaskCompletion(ws, payload) {
    const { sessionId, agentId, taskId, result, duration } = payload;

    const channel = this.activeChannels.get(sessionId);
    if (!channel) return;

    // Record completion
    channel.currentState.completedTasks.push({
      taskId,
      agentId,
      result,
      duration,
      completedAt: Date.now()
    });

    console.log(`✅ Task completed: ${taskId} by ${agentId} (${duration}ms)`);

    // Store learning in crystalline memory
    if (this.crystallineMemory) {
      await this.crystallineMemory.addObservations({
        entityName: `session-${sessionId}`,
        observations: [
          `Task ${taskId} completed by ${agentId} in ${duration}ms`,
          `Result quality: ${result.quality || 'N/A'}`,
          `Success: ${result.success}`
        ]
      });
    }

    // Broadcast completion
    await this.broadcastToSession(sessionId, {
      type: 'TASK_COMPLETED',
      payload: {
        taskId,
        agentId,
        result: result.summary || result,
        duration
      }
    });

    this.emit('task-completed', { sessionId, taskId, agentId, result });
  }

  /**
   * Handle state synchronization request
   */
  async handleStateSync(ws, payload) {
    const { sessionId } = payload;

    const channel = this.activeChannels.get(sessionId);
    if (!channel) {
      this.sendError(ws, 'Session not found', sessionId);
      return;
    }

    // Send full state
    this.sendMessage(ws, {
      type: 'STATE_SYNC_RESPONSE',
      payload: {
        currentState: channel.currentState,
        streams: Array.from(channel.streams.entries()),
        qualityAlerts: channel.qualityAlerts,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Calculate overall progress across all streams
   */
  calculateOverallProgress(channel) {
    if (channel.streams.size === 0) return 0;

    let totalProgress = 0;
    channel.streams.forEach(streamData => {
      totalProgress += (streamData.progress || 0);
    });

    return Math.round(totalProgress / channel.streams.size);
  }

  /**
   * Handle agent disconnection
   */
  handleDisconnection(ws) {
    const { agentId, sessionId } = ws;

    console.log(`🔌 WebSocket disconnected: ${agentId || 'unknown'}`);

    // Remove from agent connections
    if (agentId) {
      this.agentConnections.delete(agentId);
      this.metrics.connectedAgents--;
    }

    // Remove from channel connections
    if (sessionId) {
      const channel = this.activeChannels.get(sessionId);
      if (channel) {
        channel.connections.delete(ws);

        // Remove from active agents
        const agentIndex = channel.currentState.activeAgents.indexOf(agentId);
        if (agentIndex > -1) {
          channel.currentState.activeAgents.splice(agentIndex, 1);
        }

        // Notify other agents
        this.broadcastToSession(sessionId, {
          type: 'AGENT_DISCONNECTED',
          payload: { agentId }
        });
      }
    }

    this.emit('agent-disconnected', { agentId, sessionId });
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeatMonitoring() {
    setInterval(() => {
      this.wsServer.clients.forEach(ws => {
        if (!ws.isAlive) {
          console.log(`💔 Terminating dead connection: ${ws.agentId || 'unknown'}`);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, this.config.heartbeatInterval);

    console.log('💓 Heartbeat monitoring started');
  }

  /**
   * Send message to specific WebSocket client
   */
  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      this.metrics.messagesSent++;
    }
  }

  /**
   * Send error to client
   */
  sendError(ws, errorType, details) {
    this.sendMessage(ws, {
      type: 'ERROR',
      payload: {
        errorType,
        details,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Close coordination channel
   */
  async closeChannel(sessionId) {
    const channel = this.activeChannels.get(sessionId);
    if (!channel) return;

    console.log(`🔒 Closing coordination channel: ${sessionId}`);

    // Notify all connected agents
    await this.broadcastToSession(sessionId, {
      type: 'SESSION_CLOSING',
      payload: { sessionId, timestamp: Date.now() }
    });

    // Close all WebSocket connections
    channel.connections.forEach(ws => {
      ws.close(1000, 'Session closed');
    });

    // Unsubscribe from Redis
    const subscriber = this.channelSubscriptions.get(sessionId);
    if (subscriber) {
      await subscriber.unsubscribe();
      await subscriber.quit();
      this.channelSubscriptions.delete(sessionId);
    }

    // Store final state in crystalline memory for learning
    if (this.crystallineMemory) {
      await this.storeFinalChannelState(sessionId, channel);
    }

    // Remove from active channels
    this.activeChannels.delete(sessionId);
    this.metrics.activeSessions--;

    console.log(`✅ Channel closed: ${sessionId}`);
    this.emit('channel-closed', { sessionId });
  }

  /**
   * Store final channel state for learning
   */
  async storeFinalChannelState(sessionId, channel) {
    try {
      await this.crystallineMemory.storeWorkflowMemory({
        workflowId: sessionId,
        type: 'simultaneous-coordination',
        status: 'completed',
        duration: Date.now() - channel.createdAt,
        result: {
          completedTasks: channel.currentState.completedTasks.length,
          finalProgress: channel.currentState.progress,
          qualityAlerts: channel.qualityAlerts.length,
          streams: channel.streams.size
        },
        metadata: {
          streamConfig: channel.streamConfig,
          patterns: channel.sharedContext.historicalPatterns
        }
      });

      console.log('   💾 Final channel state stored in crystalline memory');
    } catch (error) {
      console.warn('Could not store final channel state:', error.message);
    }
  }

  /**
   * Get coordination metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.uptime,
      averageMessageRate: this.metrics.messagesSent / ((Date.now() - this.metrics.uptime) / 1000)
    };
  }

  /**
   * Get channel status
   */
  getChannelStatus(sessionId) {
    const channel = this.activeChannels.get(sessionId);
    if (!channel) {
      return { found: false };
    }

    return {
      found: true,
      sessionId,
      createdAt: channel.createdAt,
      currentState: channel.currentState,
      connectedAgents: channel.connections.size,
      activeStreams: channel.streams.size,
      qualityAlerts: channel.qualityAlerts.length,
      progress: channel.currentState.progress
    };
  }

  /**
   * Shutdown coordination layer gracefully
   */
  async shutdown() {
    console.log('🛑 Shutting down WebSocket coordination layer...');

    // Close all active channels
    const channelIds = Array.from(this.activeChannels.keys());
    for (const sessionId of channelIds) {
      await this.closeChannel(sessionId);
    }

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }

    console.log('✅ WebSocket coordination layer shut down');
  }
}

module.exports = WebSocketCoordinationLayer;
