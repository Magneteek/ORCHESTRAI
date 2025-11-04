/**
 * Co-Learning Memory Pool
 *
 * Enables agents to share knowledge and learn from each other's executions
 * through the hexagonal memory lattice. Implements pipeline sharing where
 * agents contribute learnings to a shared pool.
 *
 * Phase 2.1 - Pipeline Sharing Architecture
 * Integration with Phase 2.2 - Hexagonal Memory Lattice
 *
 * Key Features:
 * - Cross-agent knowledge sharing
 * - Collaborative learning from parallel executions
 * - Pattern recognition across domains
 * - Dynamic access control with bipartite graphs
 * - Real-time context synchronization
 */

const EventEmitter = require('events');
const HexagonalMemoryLattice = require('./hexagonal-memory-lattice');
const { v4: uuidv4 } = require('uuid');

class CoLearningMemoryPool extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      enableCrossAgentLearning: config.enableCrossAgentLearning !== false,
      enablePatternRecognition: config.enablePatternRecognition !== false,
      learningThreshold: config.learningThreshold || 0.7, // Minimum quality to learn from
      maxSharedMemories: config.maxSharedMemories || 1000,
      ...config
    };

    // Hexagonal memory lattice for storage
    this.lattice = new HexagonalMemoryLattice({
      maxRadius: 15,
      autoOrganize: true,
      organizationInterval: 120000 // 2 minutes
    });

    // Agent registry and access control
    this.agents = new Map(); // agentId → agent metadata
    this.accessGraph = new Map(); // bipartite graph: agentId → Set(nodeIds)

    // Learning contributions by agent
    this.contributions = new Map(); // agentId → contribution statistics

    // Pattern recognition
    this.patterns = {
      successful: new Map(), // pattern hash → success count
      failed: new Map(),     // pattern hash → failure count
      emerging: []           // patterns being discovered
    };

    // Real-time synchronization
    this.syncQueue = [];      // Pending synchronization events
    this.syncSubscribers = new Map(); // agentId → Set(topics)

    // Statistics
    this.stats = {
      totalLearnings: 0,
      crossAgentLearnings: 0,
      patternsRecognized: 0,
      syncEvents: 0,
      activeAgents: 0
    };

    console.log('🧠 CoLearningMemoryPool initialized with HexMemLattice');
  }

  // ============ AGENT REGISTRATION ============

  /**
   * Register an agent in the pool
   * @param {string} agentId - Agent identifier
   * @param {Object} metadata - Agent metadata
   */
  registerAgent(agentId, metadata = {}) {
    this.agents.set(agentId, {
      agentId,
      domain: metadata.domain || 'general',
      capabilities: metadata.capabilities || [],
      registeredAt: Date.now(),
      lastActivity: Date.now(),
      trustScore: 1.0 // Starts at 1.0, adjusted by quality
    });

    // Initialize access graph
    this.accessGraph.set(agentId, new Set());

    // Initialize contributions
    this.contributions.set(agentId, {
      learningsShared: 0,
      learningsConsumed: 0,
      patternsContributed: 0,
      qualityAverage: 0
    });

    this.stats.activeAgents++;

    this.emit('agent-registered', { agentId, domain: metadata.domain });

    console.log(`🤖 Agent registered in pool: ${agentId} (${metadata.domain})`);
  }

  /**
   * Unregister an agent
   * @param {string} agentId - Agent identifier
   */
  unregisterAgent(agentId) {
    this.agents.delete(agentId);
    this.accessGraph.delete(agentId);
    this.contributions.delete(agentId);
    this.stats.activeAgents--;

    this.emit('agent-unregistered', { agentId });
  }

  // ============ LEARNING CONTRIBUTION ============

  /**
   * Agent contributes a learning to the pool
   * @param {string} agentId - Contributing agent
   * @param {Object} learning - Learning data
   * @returns {string} Node ID where learning was stored
   */
  contributeLearning(agentId, learning) {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} not registered in pool`);
    }

    // Validate learning quality
    const qualityScore = learning.qualityScore || 0;
    if (qualityScore < this.config.learningThreshold) {
      console.log(`⚠️  Learning quality too low: ${qualityScore} < ${this.config.learningThreshold}`);
      return null;
    }

    // Determine optimal position in lattice
    const layer = this.determineLayer(learning);
    const domain = learning.domain || this.agents.get(agentId).domain;
    const position = this.lattice.findOptimalPosition(layer, domain);

    // Create memory node
    const node = this.lattice.createNode({
      q: position.q,
      r: position.r,
      layer,
      domain,
      type: 'learning',
      data: {
        ...learning,
        contributedBy: agentId,
        contributedAt: Date.now(),
        qualityScore
      },
      metadata: {
        agentCapabilities: this.agents.get(agentId).capabilities,
        learningType: learning.type || 'execution-result'
      }
    });

    // Set ownership and permissions
    node.access.ownedBy = agentId;
    node.access.permissions = learning.permissions || 'shared';

    // Grant access to this agent
    this.grantAccess(agentId, node.nodeId);

    // Grant access to agents in same domain (if shared)
    if (node.access.permissions === 'shared') {
      this.shareLearningWithDomain(node.nodeId, domain);
    }

    // Update contributions
    const contributions = this.contributions.get(agentId);
    contributions.learningsShared++;
    contributions.qualityAverage =
      (contributions.qualityAverage * (contributions.learningsShared - 1) + qualityScore) /
      contributions.learningsShared;

    // Update agent trust score
    this.updateTrustScore(agentId, qualityScore);

    // Update stats
    this.stats.totalLearnings++;

    // Recognize patterns
    if (this.config.enablePatternRecognition) {
      this.recognizePattern(learning);
    }

    // Broadcast learning event
    this.broadcastSync('learning-contributed', {
      nodeId: node.nodeId,
      agentId,
      domain,
      layer,
      qualityScore
    });

    this.emit('learning-contributed', { agentId, nodeId: node.nodeId, qualityScore });

    console.log(`📚 Learning contributed by ${agentId} → Node ${node.nodeId} (quality: ${qualityScore})`);

    return node.nodeId;
  }

  /**
   * Determine appropriate layer for learning
   * @param {Object} learning - Learning data
   * @returns {string} Layer name
   */
  determineLayer(learning) {
    // Core layer: Highly reusable, cross-domain knowledge
    if (learning.reusability === 'core' || learning.crossDomain === true) {
      return 'core';
    }

    // Domain layer: Domain-specific but reusable
    if (learning.reusability === 'domain' || learning.taskSpecific !== true) {
      return 'domain';
    }

    // Task layer: Task-specific knowledge
    return 'task';
  }

  /**
   * Share learning with all agents in domain
   * @param {string} nodeId - Node to share
   * @param {string} domain - Target domain
   */
  shareLearningWithDomain(nodeId, domain) {
    let sharedCount = 0;

    for (const [agentId, metadata] of this.agents.entries()) {
      if (metadata.domain === domain || metadata.domain === 'general') {
        this.grantAccess(agentId, nodeId);
        sharedCount++;
      }
    }

    if (sharedCount > 1) {
      this.stats.crossAgentLearnings++;
    }

    console.log(`🔗 Learning ${nodeId} shared with ${sharedCount} agents in ${domain} domain`);
  }

  // ============ LEARNING RETRIEVAL ============

  /**
   * Retrieve relevant learnings for agent
   * @param {string} agentId - Requesting agent
   * @param {Object} context - Context for retrieval
   * @returns {Array} Relevant learnings
   */
  retrieveLearnings(agentId, context = {}) {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} not registered in pool`);
    }

    const agentMetadata = this.agents.get(agentId);
    const accessibleNodes = this.accessGraph.get(agentId);

    // Get nodes agent has access to
    const candidateNodes = [];
    for (const nodeId of accessibleNodes) {
      const node = this.lattice.getNode(nodeId);
      if (node && node.hasAccess(agentId)) {
        candidateNodes.push(node);
      }
    }

    // Filter by domain if specified
    let relevantNodes = candidateNodes;
    if (context.domain) {
      relevantNodes = candidateNodes.filter(node =>
        node.domain === context.domain || node.domain === 'core'
      );
    }

    // Score by relevance
    const scoredNodes = relevantNodes.map(node => ({
      node,
      score: this.calculateRelevanceScore(node, agentMetadata, context)
    }));

    // Sort by score descending
    scoredNodes.sort((a, b) => b.score - a.score);

    // Return top N learnings
    const topN = context.limit || 10;
    const results = scoredNodes.slice(0, topN).map(({ node, score }) => ({
      nodeId: node.nodeId,
      learning: node.retrieve(), // Increments access count
      relevanceScore: score,
      contributedBy: node.content.data.contributedBy,
      qualityScore: node.content.data.qualityScore
    }));

    // Update consumption stats
    const contributions = this.contributions.get(agentId);
    contributions.learningsConsumed += results.length;

    console.log(`📖 Retrieved ${results.length} learnings for ${agentId}`);

    return results;
  }

  /**
   * Calculate relevance score for a learning
   * @param {HexagonalMemoryNode} node - Memory node
   * @param {Object} agentMetadata - Agent metadata
   * @param {Object} context - Retrieval context
   * @returns {number} Relevance score (0-1)
   */
  calculateRelevanceScore(node, agentMetadata, context) {
    let score = 0;

    // Domain match
    if (node.domain === agentMetadata.domain) {
      score += 0.3;
    } else if (node.domain === 'core') {
      score += 0.2;
    }

    // Capability overlap
    const nodeCapabilities = node.content.metadata.agentCapabilities || [];
    const overlap = agentMetadata.capabilities.filter(cap =>
      nodeCapabilities.includes(cap)
    ).length;
    score += (overlap / Math.max(agentMetadata.capabilities.length, 1)) * 0.2;

    // Quality score
    score += (node.content.data.qualityScore || 0) * 0.2;

    // Recency (higher score for recent learnings)
    const age = Date.now() - node.content.data.contributedAt;
    const ageScore = Math.max(0, 1 - (age / (7 * 24 * 60 * 60 * 1000))); // 7 days decay
    score += ageScore * 0.1;

    // Context-specific matching
    if (context.type && node.content.metadata.learningType === context.type) {
      score += 0.2;
    }

    return Math.min(1.0, score);
  }

  // ============ ACCESS CONTROL (Bipartite Graph) ============

  /**
   * Grant access to a node for an agent
   * @param {string} agentId - Agent to grant access
   * @param {string} nodeId - Node to access
   */
  grantAccess(agentId, nodeId) {
    const accessSet = this.accessGraph.get(agentId);
    if (accessSet) {
      accessSet.add(nodeId);
    }

    const node = this.lattice.getNode(nodeId);
    if (node) {
      node.grantAccess(agentId);
    }

    this.emit('access-granted', { agentId, nodeId });
  }

  /**
   * Revoke access to a node for an agent
   * @param {string} agentId - Agent to revoke access
   * @param {string} nodeId - Node to revoke
   */
  revokeAccess(agentId, nodeId) {
    const accessSet = this.accessGraph.get(agentId);
    if (accessSet) {
      accessSet.delete(nodeId);
    }

    const node = this.lattice.getNode(nodeId);
    if (node) {
      node.revokeAccess(agentId);
    }

    this.emit('access-revoked', { agentId, nodeId });
  }

  /**
   * Check if agent has access to node
   * @param {string} agentId - Agent to check
   * @param {string} nodeId - Node to check
   * @returns {boolean} True if has access
   */
  hasAccess(agentId, nodeId) {
    const accessSet = this.accessGraph.get(agentId);
    if (!accessSet) return false;

    return accessSet.has(nodeId);
  }

  // ============ PATTERN RECOGNITION ============

  /**
   * Recognize patterns from learning
   * @param {Object} learning - Learning data
   */
  recognizePattern(learning) {
    // Extract pattern signature
    const patternHash = this.extractPatternSignature(learning);

    if (learning.success) {
      const count = this.patterns.successful.get(patternHash) || 0;
      this.patterns.successful.set(patternHash, count + 1);

      // Emerging pattern detection
      if (count + 1 >= 3 && count + 1 <= 5) {
        this.patterns.emerging.push({
          hash: patternHash,
          pattern: this.describePattern(learning),
          successCount: count + 1,
          firstSeen: Date.now()
        });

        this.stats.patternsRecognized++;

        this.emit('pattern-recognized', {
          pattern: this.describePattern(learning),
          successCount: count + 1
        });
      }
    } else {
      const count = this.patterns.failed.get(patternHash) || 0;
      this.patterns.failed.set(patternHash, count + 1);
    }
  }

  /**
   * Extract pattern signature from learning
   * @param {Object} learning - Learning data
   * @returns {string} Pattern hash
   */
  extractPatternSignature(learning) {
    const signature = {
      domain: learning.domain,
      type: learning.type,
      capabilities: (learning.capabilities || []).sort().join(','),
      taskType: learning.taskType
    };

    return JSON.stringify(signature);
  }

  /**
   * Describe pattern in human-readable form
   * @param {Object} learning - Learning data
   * @returns {string} Pattern description
   */
  describePattern(learning) {
    return `${learning.domain || 'general'} domain ${learning.type || 'task'} using ${(learning.capabilities || []).join(', ')}`;
  }

  /**
   * Get recognized patterns
   * @param {number} minSuccessCount - Minimum success count
   * @returns {Array} Recognized patterns
   */
  getRecognizedPatterns(minSuccessCount = 3) {
    const patterns = [];

    for (const [hash, count] of this.patterns.successful.entries()) {
      if (count >= minSuccessCount) {
        const failCount = this.patterns.failed.get(hash) || 0;
        const successRate = count / (count + failCount);

        patterns.push({
          hash,
          successCount: count,
          failCount,
          successRate,
          confidence: this.calculatePatternConfidence(count, failCount)
        });
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate pattern confidence
   * @param {number} successCount - Success count
   * @param {number} failCount - Failure count
   * @returns {number} Confidence score (0-1)
   */
  calculatePatternConfidence(successCount, failCount) {
    const total = successCount + failCount;
    if (total === 0) return 0;

    const successRate = successCount / total;
    const sampleSize = Math.min(1, total / 10); // More samples = higher confidence

    return successRate * sampleSize;
  }

  // ============ REAL-TIME SYNCHRONIZATION ============

  /**
   * Subscribe agent to synchronization topic
   * @param {string} agentId - Agent to subscribe
   * @param {string} topic - Topic to subscribe to
   */
  subscribe(agentId, topic) {
    if (!this.syncSubscribers.has(agentId)) {
      this.syncSubscribers.set(agentId, new Set());
    }

    this.syncSubscribers.get(agentId).add(topic);

    console.log(`🔔 Agent ${agentId} subscribed to ${topic}`);
  }

  /**
   * Unsubscribe agent from topic
   * @param {string} agentId - Agent to unsubscribe
   * @param {string} topic - Topic to unsubscribe from
   */
  unsubscribe(agentId, topic) {
    const topics = this.syncSubscribers.get(agentId);
    if (topics) {
      topics.delete(topic);
    }
  }

  /**
   * Broadcast synchronization event
   * @param {string} topic - Event topic
   * @param {Object} data - Event data
   */
  broadcastSync(topic, data) {
    const event = {
      id: uuidv4(),
      topic,
      data,
      timestamp: Date.now()
    };

    // Add to sync queue
    this.syncQueue.push(event);

    // Emit to subscribers
    for (const [agentId, topics] of this.syncSubscribers.entries()) {
      if (topics.has(topic) || topics.has('*')) {
        this.emit(`sync-${agentId}`, event);
      }
    }

    this.stats.syncEvents++;

    // Keep queue size manageable
    if (this.syncQueue.length > 100) {
      this.syncQueue.shift();
    }
  }

  // ============ AGENT TRUST & QUALITY ============

  /**
   * Update agent trust score based on contribution quality
   * @param {string} agentId - Agent to update
   * @param {number} qualityScore - Quality of contribution
   */
  updateTrustScore(agentId, qualityScore) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Exponential moving average
    const alpha = 0.1; // Weight for new data
    agent.trustScore = alpha * qualityScore + (1 - alpha) * agent.trustScore;

    agent.lastActivity = Date.now();
  }

  /**
   * Get agent trust score
   * @param {string} agentId - Agent to check
   * @returns {number} Trust score (0-1)
   */
  getTrustScore(agentId) {
    const agent = this.agents.get(agentId);
    return agent ? agent.trustScore : 0;
  }

  // ============ STATISTICS & MONITORING ============

  /**
   * Get pool statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      latticeStats: this.lattice.getStatistics(),
      agentCount: this.agents.size,
      averageTrustScore: this.calculateAverageTrust(),
      topContributors: this.getTopContributors(5)
    };
  }

  /**
   * Calculate average trust score
   * @returns {number} Average trust
   */
  calculateAverageTrust() {
    if (this.agents.size === 0) return 0;

    const totalTrust = Array.from(this.agents.values())
      .reduce((sum, agent) => sum + agent.trustScore, 0);

    return totalTrust / this.agents.size;
  }

  /**
   * Get top contributors
   * @param {number} limit - Number of top contributors
   * @returns {Array} Top contributors
   */
  getTopContributors(limit = 5) {
    const contributors = Array.from(this.contributions.entries())
      .map(([agentId, stats]) => ({
        agentId,
        ...stats,
        trustScore: this.getTrustScore(agentId)
      }))
      .sort((a, b) => b.learningsShared - a.learningsShared)
      .slice(0, limit);

    return contributors;
  }

  /**
   * Get pool status
   * @returns {Object} Status
   */
  getStatus() {
    return {
      activeAgents: this.stats.activeAgents,
      totalLearnings: this.stats.totalLearnings,
      crossAgentLearnings: this.stats.crossAgentLearnings,
      patternsRecognized: this.stats.patternsRecognized,
      averageTrustScore: this.calculateAverageTrust(),
      latticeStatus: this.lattice.getStatus()
    };
  }

  /**
   * Visualize access graph
   * @returns {string} ASCII visualization
   */
  visualizeAccessGraph() {
    let output = '\n🔗 Access Graph (Bipartite: Agents ↔ Nodes)\n\n';

    for (const [agentId, nodeIds] of this.accessGraph.entries()) {
      output += `Agent ${agentId}: ${nodeIds.size} accessible nodes\n`;
    }

    return output;
  }

  /**
   * Shutdown pool
   */
  shutdown() {
    this.lattice.shutdown();
    this.syncQueue = [];
    this.syncSubscribers.clear();

    console.log('🧠 CoLearningMemoryPool shutdown complete');
  }
}

module.exports = CoLearningMemoryPool;
