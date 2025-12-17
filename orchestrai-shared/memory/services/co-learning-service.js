/**
 * Co-Learning Service - Agent Collaboration Layer
 *
 * Enables cross-agent knowledge sharing and collaborative learning through
 * shared memory pools. Implements agent registry, access control, and
 * real-time context synchronization.
 *
 * Consolidates from:
 * - co-learning-memory-pool.js (agent registry, access control, sync)
 *
 * Design Pattern: Service Layer
 * - Business logic for agent collaboration
 * - Independent of storage implementation
 * - Event-driven architecture for real-time updates
 *
 * Features:
 * - Agent registry and trust scoring
 * - Bipartite graph access control
 * - Cross-agent knowledge sharing
 * - Real-time context synchronization
 * - Contribution tracking and quality assessment
 * - Pattern discovery across agents
 */

const EventEmitter = require('events');
const logger = require('../../logging/logger').forAgent('co-learning-service', 'memory');
const { ValidationError } = require('../../errors/typed-errors');
const { z } = require('../../validation/schemas');

/**
 * Agent Metadata Schema
 */
const AgentMetadataSchema = z.object({
  agentId: z.string().min(1),
  domain: z.string().optional().default('general'),
  capabilities: z.array(z.string()).optional().default([]),
  trustScore: z.number().min(0).max(1).optional().default(1.0)
});

/**
 * Learning Schema
 */
const LearningSchema = z.object({
  content: z.any(),
  quality: z.number().min(0).max(1).optional().default(0.5),
  context: z.record(z.any()).optional().default({}),
  tags: z.array(z.string()).optional().default([])
});

class CoLearningService extends EventEmitter {
  constructor(repository, config = {}) {
    super();

    if (!repository) {
      throw new ValidationError(
        'Memory repository is required',
        [{ field: 'repository', message: 'Repository cannot be null or undefined' }]
      );
    }

    this.repository = repository;
    this.config = {
      enableCrossAgentLearning: config.enableCrossAgentLearning !== false,
      learningThreshold: config.learningThreshold || 0.7, // Minimum quality to learn from
      maxSharedMemories: config.maxSharedMemories || 1000,
      ...config
    };

    // Agent registry
    this.agents = new Map(); // agentId → agent metadata

    // Access control (bipartite graph)
    this.accessGraph = new Map(); // agentId → Set(resourceIds)

    // Contribution tracking
    this.contributions = new Map(); // agentId → contribution statistics

    // Real-time synchronization
    this.syncSubscribers = new Map(); // agentId → Set(topics)

    // Statistics
    this.stats = {
      totalLearnings: 0,
      crossAgentLearnings: 0,
      activeAgents: 0,
      syncEvents: 0
    };

    this.logger = logger;

    this.logger.info('Co-Learning Service initialized', {
      crossAgentLearningEnabled: this.config.enableCrossAgentLearning,
      learningThreshold: this.config.learningThreshold
    });
  }

  // ============ AGENT MANAGEMENT ============

  /**
   * Register agent in co-learning pool
   *
   * @param {string} agentId - Agent identifier
   * @param {Object} metadata - Agent metadata
   * @returns {Object} Registration result
   */
  registerAgent(agentId, metadata = {}) {
    try {
      const validated = AgentMetadataSchema.parse({
        agentId,
        ...metadata
      });

      this.agents.set(agentId, {
        ...validated,
        registeredAt: Date.now(),
        lastActivity: Date.now()
      });

      // Initialize access graph
      this.accessGraph.set(agentId, new Set());

      // Initialize contributions
      this.contributions.set(agentId, {
        learningsShared: 0,
        learningsConsumed: 0,
        qualityAverage: 0,
        trustScore: validated.trustScore
      });

      this.stats.activeAgents++;

      this.emit('agent-registered', { agentId });

      this.logger.info('Agent registered', {
        agentId,
        domain: validated.domain,
        capabilities: validated.capabilities
      });

      return {
        success: true,
        agentId,
        domain: validated.domain
      };

    } catch (error) {
      this.logger.error('Failed to register agent', {
        error: error.message,
        agentId
      });
      throw error;
    }
  }

  /**
   * Unregister agent from co-learning pool
   *
   * @param {string} agentId - Agent identifier
   * @returns {boolean} Success status
   */
  unregisterAgent(agentId) {
    if (!this.agents.has(agentId)) {
      this.logger.warn('Attempted to unregister unknown agent', { agentId });
      return false;
    }

    this.agents.delete(agentId);
    this.accessGraph.delete(agentId);
    this.contributions.delete(agentId);
    this.syncSubscribers.delete(agentId);

    this.stats.activeAgents--;

    this.emit('agent-unregistered', { agentId });

    this.logger.info('Agent unregistered', { agentId });

    return true;
  }

  /**
   * Update agent trust score
   *
   * @param {string} agentId - Agent identifier
   * @param {number} qualityScore - Quality score from recent execution (0-1)
   */
  updateAgentTrust(agentId, qualityScore) {
    const agent = this.agents.get(agentId);
    const contributions = this.contributions.get(agentId);

    if (!agent || !contributions) {
      this.logger.warn('Attempted to update trust for unknown agent', { agentId });
      return;
    }

    // Exponential moving average for trust score
    const alpha = 0.3; // Weight for new score
    agent.trustScore = alpha * qualityScore + (1 - alpha) * agent.trustScore;

    // Update contributions
    contributions.trustScore = agent.trustScore;
    contributions.qualityAverage =
      (contributions.qualityAverage * contributions.learningsShared + qualityScore) /
      (contributions.learningsShared + 1);

    agent.lastActivity = Date.now();

    this.logger.debug('Agent trust updated', {
      agentId,
      newTrustScore: agent.trustScore.toFixed(3),
      qualityScore
    });
  }

  // ============ KNOWLEDGE SHARING ============

  /**
   * Share learning with other agents
   *
   * @param {string} agentId - Agent sharing the learning
   * @param {Object} learning - Learning content
   * @param {Object} metadata - Learning metadata
   * @returns {Promise<Object>} Sharing result
   */
  async shareLearning(agentId, learning, metadata = {}) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new ValidationError(
          'Agent not registered',
          [{ field: 'agentId', message: `Agent ${agentId} not found in registry` }]
        );
      }

      const validated = LearningSchema.parse(learning);

      // Check quality threshold
      if (validated.quality < this.config.learningThreshold) {
        this.logger.debug('Learning rejected (below quality threshold)', {
          agentId,
          quality: validated.quality,
          threshold: this.config.learningThreshold
        });

        return {
          success: false,
          reason: 'quality_below_threshold'
        };
      }

      // Create learning entity in repository
      const learningEntity = {
        name: `learning-${agentId}-${Date.now()}`,
        type: 'shared-learning',
        domain: agent.domain,
        observations: [
          `Shared by: ${agentId}`,
          `Quality: ${validated.quality}`,
          `Trust Score: ${agent.trustScore}`,
          `Content: ${JSON.stringify(validated.content)}`,
          ...validated.tags.map(tag => `Tag: ${tag}`)
        ],
        metadata: {
          sourceAgent: agentId,
          quality: validated.quality,
          trustScore: agent.trustScore,
          context: validated.context,
          tags: validated.tags,
          sharedAt: Date.now()
        }
      };

      const entityId = await this.repository.store(learningEntity);

      // Update contributions
      const contributions = this.contributions.get(agentId);
      contributions.learningsShared++;

      // Update stats
      this.stats.totalLearnings++;

      // Grant access to agents in same domain
      this.grantDomainAccess(agent.domain, entityId);

      // Emit event for real-time subscribers
      this.publish(`learning:${agent.domain}`, {
        entityId,
        agentId,
        quality: validated.quality,
        tags: validated.tags
      });

      this.logger.info('Learning shared', {
        entityId,
        agentId,
        domain: agent.domain,
        quality: validated.quality
      });

      return {
        success: true,
        entityId,
        quality: validated.quality
      };

    } catch (error) {
      this.logger.error('Failed to share learning', {
        error: error.message,
        agentId
      });
      throw error;
    }
  }

  /**
   * Retrieve relevant learnings for agent
   *
   * @param {string} agentId - Agent requesting learnings
   * @param {Object} context - Context for relevance matching
   * @param {number} maxResults - Maximum results to return
   * @returns {Promise<Array>} Relevant learnings
   */
  async retrieveRelevantLearnings(agentId, context, maxResults = 10) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new ValidationError(
          'Agent not registered',
          [{ field: 'agentId', message: `Agent ${agentId} not found in registry` }]
        );
      }

      // Search for learnings in agent's domain
      const results = await this.repository.retrieve({
        domain: agent.domain,
        type: 'shared-learning',
        maxResults,
        ...context
      });

      // Filter by access permissions
      const accessible = (results.entities || []).filter(entity => {
        const permissions = this.accessGraph.get(agentId);
        return permissions && permissions.has(entity.nodeId || entity.name);
      });

      // Update consumption tracking
      const contributions = this.contributions.get(agentId);
      contributions.learningsConsumed += accessible.length;

      this.stats.crossAgentLearnings += accessible.length;

      this.logger.debug('Retrieved relevant learnings', {
        agentId,
        resultCount: accessible.length,
        domain: agent.domain
      });

      return accessible;

    } catch (error) {
      this.logger.error('Failed to retrieve learnings', {
        error: error.message,
        agentId
      });
      return [];
    }
  }

  // ============ ACCESS CONTROL ============

  /**
   * Grant access to resource
   *
   * @param {string} agentId - Agent to grant access
   * @param {string} resourceId - Resource identifier
   * @returns {boolean} Success status
   */
  grantAccess(agentId, resourceId) {
    if (!this.accessGraph.has(agentId)) {
      this.accessGraph.set(agentId, new Set());
    }

    this.accessGraph.get(agentId).add(resourceId);

    this.logger.debug('Access granted', {
      agentId,
      resourceId
    });

    return true;
  }

  /**
   * Revoke access to resource
   *
   * @param {string} agentId - Agent to revoke access
   * @param {string} resourceId - Resource identifier
   * @returns {boolean} Success status
   */
  revokeAccess(agentId, resourceId) {
    const permissions = this.accessGraph.get(agentId);
    if (!permissions) return false;

    return permissions.delete(resourceId);
  }

  /**
   * Check if agent has access to resource
   *
   * @param {string} agentId - Agent to check
   * @param {string} resourceId - Resource identifier
   * @returns {boolean} Has access
   */
  checkAccess(agentId, resourceId) {
    const permissions = this.accessGraph.get(agentId);
    return permissions ? permissions.has(resourceId) : false;
  }

  /**
   * Grant access to all agents in domain
   *
   * @param {string} domain - Domain
   * @param {string} resourceId - Resource identifier
   */
  grantDomainAccess(domain, resourceId) {
    let grantCount = 0;

    for (const [agentId, agent] of this.agents.entries()) {
      if (agent.domain === domain) {
        this.grantAccess(agentId, resourceId);
        grantCount++;
      }
    }

    this.logger.debug('Domain access granted', {
      domain,
      resourceId,
      agentCount: grantCount
    });
  }

  // ============ REAL-TIME SYNCHRONIZATION ============

  /**
   * Subscribe to topic
   *
   * @param {string} agentId - Agent subscribing
   * @param {string} topic - Topic to subscribe to
   */
  subscribe(agentId, topic) {
    if (!this.syncSubscribers.has(agentId)) {
      this.syncSubscribers.set(agentId, new Set());
    }

    this.syncSubscribers.get(agentId).add(topic);

    this.logger.debug('Agent subscribed to topic', {
      agentId,
      topic
    });
  }

  /**
   * Publish to topic
   *
   * @param {string} topic - Topic to publish to
   * @param {Object} data - Data to publish
   */
  publish(topic, data) {
    let subscriberCount = 0;

    for (const [agentId, topics] of this.syncSubscribers.entries()) {
      if (topics.has(topic)) {
        this.emit(`sync:${agentId}`, { topic, data });
        subscriberCount++;
      }
    }

    this.stats.syncEvents++;

    this.logger.debug('Published to topic', {
      topic,
      subscriberCount
    });
  }

  /**
   * Synchronize context across agents
   *
   * @param {string} agentId - Agent requesting sync
   * @param {Object} context - Context to synchronize
   */
  synchronizeContext(agentId, context) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Publish context to domain
    this.publish(`context:${agent.domain}`, {
      agentId,
      context,
      timestamp: Date.now()
    });

    this.logger.debug('Context synchronized', {
      agentId,
      domain: agent.domain
    });
  }

  // ============ STATISTICS ============

  /**
   * Get service statistics
   *
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      agents: {
        total: this.agents.size,
        byDomain: this.getAgentsByDomain()
      },
      contributions: this.getTopContributors(5)
    };
  }

  /**
   * Get agents grouped by domain
   *
   * @returns {Object} Agents by domain
   */
  getAgentsByDomain() {
    const byDomain = {};

    for (const [agentId, agent] of this.agents.entries()) {
      if (!byDomain[agent.domain]) {
        byDomain[agent.domain] = 0;
      }
      byDomain[agent.domain]++;
    }

    return byDomain;
  }

  /**
   * Get top contributors
   *
   * @param {number} limit - Number of top contributors
   * @returns {Array} Top contributors
   */
  getTopContributors(limit = 5) {
    return Array.from(this.contributions.entries())
      .map(([agentId, stats]) => ({
        agentId,
        learningsShared: stats.learningsShared,
        qualityAverage: stats.qualityAverage,
        trustScore: stats.trustScore
      }))
      .sort((a, b) => b.learningsShared - a.learningsShared)
      .slice(0, limit);
  }
}

module.exports = CoLearningService;
