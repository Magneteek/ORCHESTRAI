/**
 * Hexagonal Memory Node
 *
 * Implements geometric memory storage using hexagonal lattice structure
 * for optimal spatial organization and efficient traversal.
 *
 * Phase 2.2 - Advanced Crystalline Memory Architecture
 *
 * Key Concepts:
 * - Hexagonal lattice provides 6 neighbors per node (optimal packing)
 * - Axial coordinate system for efficient navigation
 * - Self-organizing based on access patterns
 * - Hierarchical layers (Core → Domain → Task)
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

/**
 * Hexagonal Memory Node
 *
 * Each node represents a memory unit in the hexagonal lattice
 * with 6 potential neighbors and self-organizing capabilities.
 */
class HexagonalMemoryNode extends EventEmitter {
  constructor(config = {}) {
    super();

    this.nodeId = config.nodeId || uuidv4();
    this.layer = config.layer || 'task'; // 'core', 'domain', or 'task'
    this.domain = config.domain || 'general';

    // Axial coordinates for hexagonal lattice
    this.coordinates = {
      q: config.q || 0, // Column (diagonal)
      r: config.r || 0, // Row
      s: -(config.q || 0) - (config.r || 0) // Constraint: q + r + s = 0
    };

    // Memory content
    this.content = {
      type: config.type || 'knowledge',
      data: config.data || {},
      metadata: config.metadata || {},
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: null
    };

    // Hexagonal neighbors (6 directions)
    this.neighbors = {
      north: null,      // +r
      northeast: null,  // +q, -s
      southeast: null,  // +q, -r
      south: null,      // -r
      southwest: null,  // -q, +s
      northwest: null   // -q, +r
    };

    // Hierarchical connections
    this.hierarchical = {
      parent: null,     // Link to higher layer (domain → core)
      children: [],     // Links to lower layer (core → domain → task)
      siblings: []      // Same-layer related nodes
    };

    // Self-organization metrics
    this.metrics = {
      temperature: 1.0,       // Node "heat" from access frequency
      coherence: 1.0,         // Semantic coherence with neighbors
      centrality: 0.0,        // Importance in network
      lastReorganization: null
    };

    // Access control (Phase 2.1 integration)
    this.access = {
      sharedWith: [],         // Agents with read access
      ownedBy: null,          // Primary owner agent
      permissions: 'private'  // 'private', 'shared', 'public'
    };

    console.log(`🔷 HexMemNode created: ${this.nodeId} at (${this.coordinates.q}, ${this.coordinates.r})`);
  }

  // ============ COORDINATE OPERATIONS ============

  /**
   * Calculate distance to another node (hexagonal distance)
   * @param {HexagonalMemoryNode} otherNode - Target node
   * @returns {number} Distance in hex steps
   */
  distanceTo(otherNode) {
    return (
      Math.abs(this.coordinates.q - otherNode.coordinates.q) +
      Math.abs(this.coordinates.r - otherNode.coordinates.r) +
      Math.abs(this.coordinates.s - otherNode.coordinates.s)
    ) / 2;
  }

  /**
   * Get direction to another node
   * @param {HexagonalMemoryNode} otherNode - Target node
   * @returns {string} Direction name or null
   */
  getDirectionTo(otherNode) {
    const dq = otherNode.coordinates.q - this.coordinates.q;
    const dr = otherNode.coordinates.r - this.coordinates.r;

    // Direct neighbor detection
    if (dq === 0 && dr === 1) return 'north';
    if (dq === 1 && dr === 0) return 'northeast';
    if (dq === 1 && dr === -1) return 'southeast';
    if (dq === 0 && dr === -1) return 'south';
    if (dq === -1 && dr === 0) return 'southwest';
    if (dq === -1 && dr === 1) return 'northwest';

    return null; // Not a direct neighbor
  }

  /**
   * Get all neighbor coordinates
   * @returns {Array} Array of coordinate objects
   */
  getNeighborCoordinates() {
    return [
      { q: this.coordinates.q, r: this.coordinates.r + 1, direction: 'north' },
      { q: this.coordinates.q + 1, r: this.coordinates.r, direction: 'northeast' },
      { q: this.coordinates.q + 1, r: this.coordinates.r - 1, direction: 'southeast' },
      { q: this.coordinates.q, r: this.coordinates.r - 1, direction: 'south' },
      { q: this.coordinates.q - 1, r: this.coordinates.r, direction: 'southwest' },
      { q: this.coordinates.q - 1, r: this.coordinates.r + 1, direction: 'northwest' }
    ];
  }

  // ============ NEIGHBOR MANAGEMENT ============

  /**
   * Connect to a neighbor node
   * @param {HexagonalMemoryNode} node - Neighbor node
   * @param {string} direction - Direction name
   */
  connectNeighbor(node, direction = null) {
    const dir = direction || this.getDirectionTo(node);

    if (!dir) {
      console.warn(`⚠️  Node ${node.nodeId} is not adjacent to ${this.nodeId}`);
      return false;
    }

    this.neighbors[dir] = node;

    // Reciprocal connection
    const oppositeDir = this.getOppositeDirection(dir);
    if (oppositeDir && !node.neighbors[oppositeDir]) {
      node.neighbors[oppositeDir] = this;
    }

    this.emit('neighbor-connected', { nodeId: node.nodeId, direction: dir });
    return true;
  }

  /**
   * Get opposite direction
   * @param {string} direction - Direction name
   * @returns {string} Opposite direction
   */
  getOppositeDirection(direction) {
    const opposites = {
      north: 'south',
      northeast: 'southwest',
      southeast: 'northwest',
      south: 'north',
      southwest: 'northeast',
      northwest: 'southeast'
    };
    return opposites[direction];
  }

  /**
   * Get all connected neighbors
   * @returns {Array} Array of neighbor nodes
   */
  getConnectedNeighbors() {
    return Object.values(this.neighbors).filter(n => n !== null);
  }

  /**
   * Get neighbor in specific direction
   * @param {string} direction - Direction name
   * @returns {HexagonalMemoryNode|null} Neighbor node
   */
  getNeighbor(direction) {
    return this.neighbors[direction];
  }

  // ============ CONTENT OPERATIONS ============

  /**
   * Store data in this node
   * @param {*} data - Data to store
   * @param {Object} metadata - Optional metadata
   */
  store(data, metadata = {}) {
    this.content.data = data;
    this.content.metadata = { ...this.content.metadata, ...metadata };
    this.content.timestamp = Date.now();

    this.emit('content-stored', { nodeId: this.nodeId, dataSize: JSON.stringify(data).length });
  }

  /**
   * Retrieve data from this node
   * @returns {*} Stored data
   */
  retrieve() {
    this.content.accessCount++;
    this.content.lastAccessed = Date.now();

    // Update temperature (access frequency)
    this.updateTemperature();

    this.emit('content-accessed', { nodeId: this.nodeId, accessCount: this.content.accessCount });

    return this.content.data;
  }

  /**
   * Update node metadata
   * @param {Object} metadata - Metadata to merge
   */
  updateMetadata(metadata) {
    this.content.metadata = { ...this.content.metadata, ...metadata };
  }

  // ============ SELF-ORGANIZATION ============

  /**
   * Update temperature based on access patterns
   */
  updateTemperature() {
    const now = Date.now();
    const timeSinceLastAccess = this.content.lastAccessed
      ? now - this.content.lastAccessed
      : Infinity;

    // Temperature increases with access, decreases over time
    const accessBoost = 0.1;
    const cooldownRate = 0.001; // Per millisecond

    this.metrics.temperature += accessBoost;
    this.metrics.temperature -= cooldownRate * timeSinceLastAccess;

    // Clamp temperature between 0 and 2
    this.metrics.temperature = Math.max(0, Math.min(2, this.metrics.temperature));

    // High-temperature nodes should reorganize
    if (this.metrics.temperature > 1.5) {
      this.emit('reorganization-needed', { nodeId: this.nodeId, temperature: this.metrics.temperature });
    }
  }

  /**
   * Calculate semantic coherence with neighbors
   * @returns {number} Coherence score (0-1)
   */
  calculateCoherence() {
    const neighbors = this.getConnectedNeighbors();

    if (neighbors.length === 0) {
      this.metrics.coherence = 1.0; // Isolated nodes are coherent
      return 1.0;
    }

    // Calculate semantic similarity with neighbors
    let totalSimilarity = 0;
    let count = 0;

    neighbors.forEach(neighbor => {
      const similarity = this.calculateSimilarity(neighbor);
      totalSimilarity += similarity;
      count++;
    });

    this.metrics.coherence = count > 0 ? totalSimilarity / count : 1.0;
    return this.metrics.coherence;
  }

  /**
   * Calculate similarity with another node
   * @param {HexagonalMemoryNode} otherNode - Node to compare
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(otherNode) {
    // Domain similarity
    const domainMatch = this.domain === otherNode.domain ? 0.5 : 0;

    // Layer similarity
    const layerMatch = this.layer === otherNode.layer ? 0.3 : 0;

    // Type similarity
    const typeMatch = this.content.type === otherNode.content.type ? 0.2 : 0;

    return domainMatch + layerMatch + typeMatch;
  }

  /**
   * Calculate centrality in network
   * @param {Array<HexagonalMemoryNode>} allNodes - All nodes in network
   * @returns {number} Centrality score
   */
  calculateCentrality(allNodes) {
    // Simple degree centrality: number of connections / max possible
    const connectedCount = this.getConnectedNeighbors().length;
    const maxPossible = 6; // Hexagonal lattice has 6 neighbors

    // Add hierarchical connections
    const hierarchicalCount = this.hierarchical.children.length +
      (this.hierarchical.parent ? 1 : 0) +
      this.hierarchical.siblings.length;

    this.metrics.centrality = (connectedCount / maxPossible) * 0.7 +
      (hierarchicalCount / 10) * 0.3;

    return this.metrics.centrality;
  }

  /**
   * Should this node reorganize?
   * @returns {boolean} True if reorganization needed
   */
  shouldReorganize() {
    const highTemperature = this.metrics.temperature > 1.5;
    const lowCoherence = this.metrics.coherence < 0.5;
    const timeSinceLastReorg = this.metrics.lastReorganization
      ? Date.now() - this.metrics.lastReorganization
      : Infinity;

    const enoughTimePassed = timeSinceLastReorg > 60000; // 1 minute

    return (highTemperature || lowCoherence) && enoughTimePassed;
  }

  // ============ HIERARCHICAL OPERATIONS ============

  /**
   * Set parent node (higher layer)
   * @param {HexagonalMemoryNode} parentNode - Parent node
   */
  setParent(parentNode) {
    this.hierarchical.parent = parentNode;

    if (!parentNode.hierarchical.children.includes(this)) {
      parentNode.hierarchical.children.push(this);
    }

    this.emit('parent-linked', { parentId: parentNode.nodeId });
  }

  /**
   * Add child node (lower layer)
   * @param {HexagonalMemoryNode} childNode - Child node
   */
  addChild(childNode) {
    if (!this.hierarchical.children.includes(childNode)) {
      this.hierarchical.children.push(childNode);
    }

    childNode.hierarchical.parent = this;

    this.emit('child-linked', { childId: childNode.nodeId });
  }

  /**
   * Link sibling node (same layer)
   * @param {HexagonalMemoryNode} siblingNode - Sibling node
   */
  linkSibling(siblingNode) {
    if (!this.hierarchical.siblings.includes(siblingNode)) {
      this.hierarchical.siblings.push(siblingNode);
    }

    if (!siblingNode.hierarchical.siblings.includes(this)) {
      siblingNode.hierarchical.siblings.push(this);
    }

    this.emit('sibling-linked', { siblingId: siblingNode.nodeId });
  }

  // ============ ACCESS CONTROL (Phase 2.1 Integration) ============

  /**
   * Grant access to an agent
   * @param {string} agentId - Agent identifier
   */
  grantAccess(agentId) {
    if (!this.access.sharedWith.includes(agentId)) {
      this.access.sharedWith.push(agentId);
      this.emit('access-granted', { agentId, nodeId: this.nodeId });
    }
  }

  /**
   * Revoke access from an agent
   * @param {string} agentId - Agent identifier
   */
  revokeAccess(agentId) {
    this.access.sharedWith = this.access.sharedWith.filter(id => id !== agentId);
    this.emit('access-revoked', { agentId, nodeId: this.nodeId });
  }

  /**
   * Check if agent has access
   * @param {string} agentId - Agent identifier
   * @returns {boolean} True if agent has access
   */
  hasAccess(agentId) {
    if (this.access.permissions === 'public') return true;
    if (this.access.ownedBy === agentId) return true;
    return this.access.sharedWith.includes(agentId);
  }

  /**
   * Set permissions level
   * @param {string} level - 'private', 'shared', or 'public'
   */
  setPermissions(level) {
    this.access.permissions = level;
    this.emit('permissions-updated', { nodeId: this.nodeId, level });
  }

  // ============ STATUS & INSPECTION ============

  /**
   * Get node status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      layer: this.layer,
      domain: this.domain,
      coordinates: { ...this.coordinates },
      metrics: { ...this.metrics },
      neighborCount: this.getConnectedNeighbors().length,
      accessCount: this.content.accessCount,
      lastAccessed: this.content.lastAccessed,
      hierarchical: {
        hasParent: !!this.hierarchical.parent,
        childrenCount: this.hierarchical.children.length,
        siblingsCount: this.hierarchical.siblings.length
      },
      access: {
        permissions: this.access.permissions,
        sharedWithCount: this.access.sharedWith.length
      }
    };
  }

  /**
   * Get detailed node information
   * @returns {Object} Detailed info
   */
  getDetailedInfo() {
    return {
      ...this.getStatus(),
      content: {
        type: this.content.type,
        dataSize: JSON.stringify(this.content.data).length,
        metadata: this.content.metadata,
        timestamp: this.content.timestamp
      },
      neighbors: Object.fromEntries(
        Object.entries(this.neighbors).map(([dir, node]) => [
          dir,
          node ? node.nodeId : null
        ])
      )
    };
  }

  /**
   * Export node for serialization
   * @returns {Object} Serializable object
   */
  toJSON() {
    return {
      nodeId: this.nodeId,
      layer: this.layer,
      domain: this.domain,
      coordinates: this.coordinates,
      content: this.content,
      metrics: this.metrics,
      access: this.access,
      neighborIds: Object.fromEntries(
        Object.entries(this.neighbors).map(([dir, node]) => [
          dir,
          node ? node.nodeId : null
        ])
      ),
      hierarchicalIds: {
        parent: this.hierarchical.parent?.nodeId || null,
        children: this.hierarchical.children.map(c => c.nodeId),
        siblings: this.hierarchical.siblings.map(s => s.nodeId)
      }
    };
  }
}

module.exports = HexagonalMemoryNode;
