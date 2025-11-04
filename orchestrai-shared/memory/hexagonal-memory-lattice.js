/**
 * Hexagonal Memory Lattice
 *
 * Manages the entire hexagonal memory structure with self-organization,
 * efficient traversal, and hierarchical layers.
 *
 * Phase 2.2 - Advanced Crystalline Memory Architecture
 *
 * Structure:
 * - Core Layer: Central, frequently accessed knowledge (1 node)
 * - Domain Layer: Domain-specific knowledge hubs (N nodes in ring)
 * - Task Layer: Task-specific memories (N*M nodes in outer rings)
 */

const EventEmitter = require('events');
const HexagonalMemoryNode = require('./hexagonal-memory-node');

class HexagonalMemoryLattice extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      maxRadius: config.maxRadius || 10,  // Maximum lattice radius
      autoOrganize: config.autoOrganize !== false,
      organizationInterval: config.organizationInterval || 60000, // 1 minute
      ...config
    };

    // Lattice structure
    this.nodes = new Map(); // nodeId → HexagonalMemoryNode
    this.coordinateMap = new Map(); // "q,r" → nodeId
    this.coreNode = null;

    // Layer organization
    this.layers = {
      core: [],      // Single core node
      domain: [],    // Domain nodes (ring 1-2)
      task: []       // Task nodes (ring 3+)
    };

    // Domain clusters
    this.domainClusters = new Map(); // domain → Set(nodeIds)

    // Traversal cache for performance
    this.pathCache = new Map(); // "from-to" → path array

    // Self-organization tracking
    this.reorganizationHistory = [];
    this.lastReorganization = null;

    // Statistics
    this.stats = {
      totalNodes: 0,
      totalConnections: 0,
      averageCoherence: 0,
      traversalCount: 0,
      cacheHitRate: 0
    };

    this.initialize();
  }

  // ============ INITIALIZATION ============

  initialize() {
    // Create core node at origin (0, 0)
    this.coreNode = this.createNode({
      q: 0,
      r: 0,
      layer: 'core',
      domain: 'core',
      type: 'core-knowledge',
      data: {
        description: 'Central core node - most frequently accessed knowledge',
        createdAt: Date.now()
      }
    });

    this.layers.core.push(this.coreNode);

    // Start auto-organization if enabled
    if (this.config.autoOrganize) {
      this.startAutoOrganization();
    }

    console.log('🔷 HexMemLattice initialized with core node at (0,0)');
  }

  // ============ NODE CREATION & MANAGEMENT ============

  /**
   * Create a new node in the lattice
   * @param {Object} config - Node configuration
   * @returns {HexagonalMemoryNode} Created node
   */
  createNode(config) {
    const node = new HexagonalMemoryNode(config);

    // Add to lattice
    this.nodes.set(node.nodeId, node);

    // Add to coordinate map
    const coordKey = `${config.q},${config.r}`;
    this.coordinateMap.set(coordKey, node.nodeId);

    // Add to appropriate layer
    this.layers[config.layer].push(node);

    // Add to domain cluster
    if (!this.domainClusters.has(config.domain)) {
      this.domainClusters.set(config.domain, new Set());
    }
    this.domainClusters.get(config.domain).add(node.nodeId);

    // Connect to neighbors
    this.connectToNeighbors(node);

    // Update stats
    this.stats.totalNodes++;

    this.emit('node-created', { nodeId: node.nodeId, coordinates: config });

    return node;
  }

  /**
   * Connect node to adjacent neighbors
   * @param {HexagonalMemoryNode} node - Node to connect
   */
  connectToNeighbors(node) {
    const neighborCoords = node.getNeighborCoordinates();

    neighborCoords.forEach(({ q, r, direction }) => {
      const coordKey = `${q},${r}`;
      const neighborId = this.coordinateMap.get(coordKey);

      if (neighborId) {
        const neighbor = this.nodes.get(neighborId);
        if (neighbor && !node.neighbors[direction]) {
          node.connectNeighbor(neighbor, direction);
          this.stats.totalConnections++;
        }
      }
    });
  }

  /**
   * Find optimal position for new node
   * @param {string} layer - Layer type
   * @param {string} domain - Domain name
   * @returns {Object} Optimal coordinates {q, r}
   */
  findOptimalPosition(layer, domain) {
    if (layer === 'core') {
      return { q: 0, r: 0 }; // Core is always at origin
    }

    // Get nodes in same domain
    const domainNodes = this.getDomainNodes(domain);

    if (domainNodes.length === 0) {
      // First node in domain - place in ring 1 or 2
      const radius = layer === 'domain' ? 1 : 3;
      return this.findEmptyPositionInRing(radius);
    }

    // Find position near existing domain nodes
    const centerOfMass = this.calculateCenterOfMass(domainNodes);
    return this.findNearestEmptyPosition(centerOfMass);
  }

  /**
   * Find empty position in specific ring
   * @param {number} radius - Ring radius
   * @returns {Object} Coordinates {q, r}
   */
  findEmptyPositionInRing(radius) {
    const positions = this.getRingPositions(radius);

    for (const pos of positions) {
      const coordKey = `${pos.q},${pos.r}`;
      if (!this.coordinateMap.has(coordKey)) {
        return pos;
      }
    }

    // Ring is full, try next ring
    return this.findEmptyPositionInRing(radius + 1);
  }

  /**
   * Get all positions in a ring
   * @param {number} radius - Ring radius
   * @returns {Array} Array of coordinate objects
   */
  getRingPositions(radius) {
    if (radius === 0) return [{ q: 0, r: 0 }];

    const positions = [];

    // Hexagonal ring algorithm
    let q = 0;
    let r = -radius;

    const directions = [
      { dq: 1, dr: 0 },   // Northeast
      { dq: 0, dr: 1 },   // North
      { dq: -1, dr: 1 },  // Northwest
      { dq: -1, dr: 0 },  // Southwest
      { dq: 0, dr: -1 },  // South
      { dq: 1, dr: -1 }   // Southeast
    ];

    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < radius; step++) {
        positions.push({ q, r });
        q += directions[side].dq;
        r += directions[side].dr;
      }
    }

    return positions;
  }

  /**
   * Calculate center of mass for nodes
   * @param {Array<HexagonalMemoryNode>} nodes - Nodes to calculate
   * @returns {Object} Center coordinates {q, r}
   */
  calculateCenterOfMass(nodes) {
    const sum = nodes.reduce((acc, node) => ({
      q: acc.q + node.coordinates.q,
      r: acc.r + node.coordinates.r
    }), { q: 0, r: 0 });

    return {
      q: Math.round(sum.q / nodes.length),
      r: Math.round(sum.r / nodes.length)
    };
  }

  /**
   * Find nearest empty position to target
   * @param {Object} target - Target coordinates {q, r}
   * @returns {Object} Nearest empty coordinates
   */
  findNearestEmptyPosition(target) {
    let radius = 0;

    while (radius < this.config.maxRadius) {
      const positions = this.getRingPositions(radius);

      // Sort by distance to target
      positions.sort((a, b) => {
        const distA = Math.abs(a.q - target.q) + Math.abs(a.r - target.r);
        const distB = Math.abs(b.q - target.q) + Math.abs(b.r - target.r);
        return distA - distB;
      });

      for (const pos of positions) {
        const coordKey = `${pos.q},${pos.r}`;
        if (!this.coordinateMap.has(coordKey)) {
          return pos;
        }
      }

      radius++;
    }

    // Fallback: use any empty position
    return this.findEmptyPositionInRing(this.config.maxRadius);
  }

  // ============ NODE RETRIEVAL ============

  /**
   * Get node by ID
   * @param {string} nodeId - Node identifier
   * @returns {HexagonalMemoryNode|null} Node or null
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * Get node by coordinates
   * @param {number} q - Q coordinate
   * @param {number} r - R coordinate
   * @returns {HexagonalMemoryNode|null} Node or null
   */
  getNodeAt(q, r) {
    const coordKey = `${q},${r}`;
    const nodeId = this.coordinateMap.get(coordKey);
    return nodeId ? this.nodes.get(nodeId) : null;
  }

  /**
   * Get all nodes in a domain
   * @param {string} domain - Domain name
   * @returns {Array<HexagonalMemoryNode>} Domain nodes
   */
  getDomainNodes(domain) {
    const nodeIds = this.domainClusters.get(domain);
    if (!nodeIds) return [];

    return Array.from(nodeIds)
      .map(id => this.nodes.get(id))
      .filter(node => node !== undefined);
  }

  /**
   * Get all nodes in a layer
   * @param {string} layer - Layer name
   * @returns {Array<HexagonalMemoryNode>} Layer nodes
   */
  getLayerNodes(layer) {
    return this.layers[layer] || [];
  }

  // ============ TRAVERSAL ============

  /**
   * Find path between two nodes (A* algorithm)
   * @param {string} fromNodeId - Start node ID
   * @param {string} toNodeId - End node ID
   * @returns {Array<HexagonalMemoryNode>} Path or empty array
   */
  findPath(fromNodeId, toNodeId) {
    this.stats.traversalCount++;

    // Check cache
    const cacheKey = `${fromNodeId}-${toNodeId}`;
    if (this.pathCache.has(cacheKey)) {
      this.stats.cacheHitRate = (this.stats.cacheHitRate * (this.stats.traversalCount - 1) + 1) / this.stats.traversalCount;
      return this.pathCache.get(cacheKey);
    }

    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);

    if (!fromNode || !toNode) return [];

    // A* pathfinding
    const openSet = new Set([fromNode]);
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(fromNode.nodeId, 0);

    const fScore = new Map();
    fScore.set(fromNode.nodeId, fromNode.distanceTo(toNode));

    while (openSet.size > 0) {
      // Get node with lowest fScore
      let current = null;
      let lowestFScore = Infinity;

      for (const node of openSet) {
        const score = fScore.get(node.nodeId) || Infinity;
        if (score < lowestFScore) {
          lowestFScore = score;
          current = node;
        }
      }

      if (current.nodeId === toNode.nodeId) {
        // Reconstruct path
        const path = this.reconstructPath(cameFrom, current);
        this.pathCache.set(cacheKey, path);
        return path;
      }

      openSet.delete(current);

      const neighbors = current.getConnectedNeighbors();
      for (const neighbor of neighbors) {
        const tentativeGScore = (gScore.get(current.nodeId) || Infinity) + 1;

        if (tentativeGScore < (gScore.get(neighbor.nodeId) || Infinity)) {
          cameFrom.set(neighbor.nodeId, current);
          gScore.set(neighbor.nodeId, tentativeGScore);
          fScore.set(neighbor.nodeId, tentativeGScore + neighbor.distanceTo(toNode));

          openSet.add(neighbor);
        }
      }
    }

    return []; // No path found
  }

  /**
   * Reconstruct path from A* result
   * @param {Map} cameFrom - Parent map
   * @param {HexagonalMemoryNode} current - End node
   * @returns {Array<HexagonalMemoryNode>} Path
   */
  reconstructPath(cameFrom, current) {
    const path = [current];

    while (cameFrom.has(current.nodeId)) {
      current = cameFrom.get(current.nodeId);
      path.unshift(current);
    }

    return path;
  }

  /**
   * Get nodes within radius
   * @param {HexagonalMemoryNode} centerNode - Center node
   * @param {number} radius - Search radius
   * @returns {Array<HexagonalMemoryNode>} Nodes within radius
   */
  getNodesWithinRadius(centerNode, radius) {
    const result = [];

    for (const node of this.nodes.values()) {
      if (centerNode.distanceTo(node) <= radius) {
        result.push(node);
      }
    }

    return result;
  }

  // ============ SELF-ORGANIZATION ============

  /**
   * Start automatic reorganization
   */
  startAutoOrganization() {
    this.reorganizationInterval = setInterval(() => {
      this.reorganize();
    }, this.config.organizationInterval);

    console.log(`🔄 Auto-organization started (interval: ${this.config.organizationInterval}ms)`);
  }

  /**
   * Stop automatic reorganization
   */
  stopAutoOrganization() {
    if (this.reorganizationInterval) {
      clearInterval(this.reorganizationInterval);
      this.reorganizationInterval = null;
    }
  }

  /**
   * Reorganize lattice based on access patterns
   */
  reorganize() {
    console.log('🔄 Starting lattice reorganization...');

    const nodesToReorganize = [];

    // Find nodes that need reorganization
    for (const node of this.nodes.values()) {
      if (node.shouldReorganize()) {
        nodesToReorganize.push(node);
      }
    }

    if (nodesToReorganize.length === 0) {
      console.log('✅ No reorganization needed');
      return;
    }

    console.log(`📊 Reorganizing ${nodesToReorganize.length} nodes...`);

    // Update coherence for all nodes
    for (const node of this.nodes.values()) {
      node.calculateCoherence();
    }

    // Calculate centrality
    const allNodesArray = Array.from(this.nodes.values());
    for (const node of allNodesArray) {
      node.calculateCentrality(allNodesArray);
    }

    // Update average coherence stat
    const totalCoherence = allNodesArray.reduce((sum, n) => sum + n.metrics.coherence, 0);
    this.stats.averageCoherence = totalCoherence / allNodesArray.length;

    // Record reorganization
    this.reorganizationHistory.push({
      timestamp: Date.now(),
      nodesAffected: nodesToReorganize.length,
      averageCoherence: this.stats.averageCoherence
    });

    // Keep last 10 reorganizations
    if (this.reorganizationHistory.length > 10) {
      this.reorganizationHistory.shift();
    }

    this.lastReorganization = Date.now();

    // Clear path cache after reorganization
    this.pathCache.clear();

    console.log(`✅ Reorganization complete. Avg coherence: ${this.stats.averageCoherence.toFixed(2)}`);

    this.emit('reorganization-complete', {
      nodesAffected: nodesToReorganize.length,
      averageCoherence: this.stats.averageCoherence
    });
  }

  // ============ STATISTICS & MONITORING ============

  /**
   * Get lattice statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      layers: {
        core: this.layers.core.length,
        domain: this.layers.domain.length,
        task: this.layers.task.length
      },
      domains: this.domainClusters.size,
      reorganizationCount: this.reorganizationHistory.length,
      lastReorganization: this.lastReorganization,
      pathCacheSize: this.pathCache.size
    };
  }

  /**
   * Get lattice status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      totalNodes: this.stats.totalNodes,
      totalConnections: this.stats.totalConnections,
      averageCoherence: this.stats.averageCoherence,
      coreNode: this.coreNode?.nodeId,
      autoOrganizeEnabled: !!this.reorganizationInterval,
      statistics: this.getStatistics()
    };
  }

  /**
   * Visualize lattice (simple text representation)
   * @param {number} maxRadius - Maximum radius to show
   * @returns {string} ASCII visualization
   */
  visualize(maxRadius = 3) {
    let output = '\n🔷 Hexagonal Memory Lattice Visualization\n\n';

    for (let r = -maxRadius; r <= maxRadius; r++) {
      const indent = ' '.repeat(Math.abs(r) * 2);
      let row = indent;

      for (let q = -maxRadius; q <= maxRadius; q++) {
        const s = -q - r;
        if (Math.abs(s) <= maxRadius) {
          const node = this.getNodeAt(q, r);
          if (node) {
            const symbol = node.layer === 'core' ? '●' :
                          node.layer === 'domain' ? '◆' : '○';
            row += symbol + '  ';
          } else {
            row += '·  ';
          }
        }
      }

      output += row + '\n';
    }

    output += '\n● Core  ◆ Domain  ○ Task  · Empty\n';
    return output;
  }

  /**
   * Export lattice state
   * @returns {Object} Serializable state
   */
  toJSON() {
    return {
      config: this.config,
      stats: this.stats,
      nodes: Array.from(this.nodes.values()).map(node => node.toJSON()),
      coreNodeId: this.coreNode?.nodeId,
      reorganizationHistory: this.reorganizationHistory
    };
  }

  /**
   * Shutdown lattice
   */
  shutdown() {
    this.stopAutoOrganization();
    this.pathCache.clear();
    console.log('🔷 HexMemLattice shutdown complete');
  }
}

module.exports = HexagonalMemoryLattice;
