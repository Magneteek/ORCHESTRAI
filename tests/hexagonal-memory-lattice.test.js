/**
 * Hexagonal Memory Lattice Unit Tests
 *
 * Tests the geometric memory organization system with:
 * - Node creation and management
 * - Hexagonal coordinate system
 * - Neighbor connections
 * - A* pathfinding
 * - Self-organization
 * - Domain clustering
 * - Statistics tracking
 */

const HexagonalMemoryLattice = require('../orchestrai-shared/memory/hexagonal-memory-lattice');
const HexagonalMemoryNode = require('../orchestrai-shared/memory/hexagonal-memory-node');

describe('Hexagonal Memory Lattice', () => {
  let lattice;

  beforeEach(() => {
    lattice = new HexagonalMemoryLattice({
      maxRadius: 5,
      autoOrganize: false // Disable auto-organization for tests
    });
  });

  afterEach(() => {
    if (lattice) {
      lattice.shutdown();
    }
  });

  // ==================== INITIALIZATION ====================

  describe('Initialization', () => {
    test('should initialize with core node at origin', () => {
      expect(lattice.coreNode).toBeDefined();
      expect(lattice.coreNode.coordinates.q).toBe(0);
      expect(lattice.coreNode.coordinates.r).toBe(0);
      expect(lattice.coreNode.layer).toBe('core');
    });

    test('should have core node in core layer', () => {
      expect(lattice.layers.core.length).toBe(1);
      expect(lattice.layers.core[0]).toBe(lattice.coreNode);
    });

    test('should initialize empty domain and task layers', () => {
      expect(lattice.layers.domain).toEqual([]);
      expect(lattice.layers.task).toEqual([]);
    });

    test('should initialize statistics', () => {
      expect(lattice.stats.totalNodes).toBe(1); // Core node
      expect(lattice.stats.totalConnections).toBe(0);
      expect(lattice.stats.averageCoherence).toBe(0);
      expect(lattice.stats.traversalCount).toBe(0);
    });

    test('should initialize with coordinate map', () => {
      const coordKey = '0,0';
      expect(lattice.coordinateMap.has(coordKey)).toBe(true);
      expect(lattice.coordinateMap.get(coordKey)).toBe(lattice.coreNode.nodeId);
    });
  });

  // ==================== NODE CREATION ====================

  describe('Node Creation', () => {
    test('should create node with valid configuration', () => {
      const node = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'knowledge-hub',
        data: { description: 'Content domain hub' }
      });

      expect(node).toBeDefined();
      expect(node.coordinates.q).toBe(1);
      expect(node.coordinates.r).toBe(0);
      expect(node.layer).toBe('domain');
      expect(node.domain).toBe('content');
    });

    test('should add node to lattice map', () => {
      const node = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'knowledge-hub'
      });

      expect(lattice.nodes.has(node.nodeId)).toBe(true);
      expect(lattice.nodes.get(node.nodeId)).toBe(node);
    });

    test('should add node to coordinate map', () => {
      const node = lattice.createNode({
        q: 2,
        r: 1,
        layer: 'task',
        domain: 'seo',
        type: 'task-memory'
      });

      const coordKey = '2,1';
      expect(lattice.coordinateMap.has(coordKey)).toBe(true);
      expect(lattice.coordinateMap.get(coordKey)).toBe(node.nodeId);
    });

    test('should add node to appropriate layer', () => {
      const domainNode = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'knowledge-hub'
      });

      const taskNode = lattice.createNode({
        q: 3,
        r: 0,
        layer: 'task',
        domain: 'seo',
        type: 'task-memory'
      });

      expect(lattice.layers.domain).toContain(domainNode);
      expect(lattice.layers.task).toContain(taskNode);
    });

    test('should add node to domain cluster', () => {
      const node1 = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });

      const node2 = lattice.createNode({
        q: 1,
        r: 1,
        layer: 'task',
        domain: 'content',
        type: 'memory'
      });

      const contentCluster = lattice.domainClusters.get('content');
      expect(contentCluster).toBeDefined();
      expect(contentCluster.has(node1.nodeId)).toBe(true);
      expect(contentCluster.has(node2.nodeId)).toBe(true);
      expect(contentCluster.size).toBe(2);
    });

    test('should update statistics on node creation', () => {
      const initialCount = lattice.stats.totalNodes;

      lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });

      expect(lattice.stats.totalNodes).toBe(initialCount + 1);
    });

    test('should emit node-created event', (done) => {
      lattice.once('node-created', (data) => {
        expect(data.nodeId).toBeDefined();
        expect(data.coordinates.q).toBe(1);
        expect(data.coordinates.r).toBe(0);
        done();
      });

      lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });
    });
  });

  // ==================== NEIGHBOR CONNECTIONS ====================

  describe('Neighbor Connections', () => {
    test('should connect adjacent nodes', () => {
      // Create two adjacent nodes
      const node1 = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });

      const node2 = lattice.createNode({
        q: 2,
        r: 0, // Northeast of node1
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });

      // Check connection
      expect(node1.neighbors.northeast).toBe(node2);
      expect(node2.neighbors.southwest).toBe(node1);
    });

    test('should create hexagonal ring of neighbors', () => {
      const center = lattice.createNode({
        q: 0,
        r: 1,
        layer: 'domain',
        domain: 'test',
        type: 'center'
      });

      // Create all 6 neighbors
      const neighbors = [
        { q: 1, r: 1, dir: 'northeast' },
        { q: 0, r: 2, dir: 'north' },
        { q: -1, r: 2, dir: 'northwest' },
        { q: -1, r: 1, dir: 'southwest' },
        { q: 0, r: 0, dir: 'south' },
        { q: 1, r: 0, dir: 'southeast' }
      ];

      neighbors.forEach(({ q, r, dir }) => {
        lattice.createNode({
          q,
          r,
          layer: 'domain',
          domain: 'test',
          type: 'neighbor'
        });
      });

      // Verify all neighbors connected
      expect(center.neighbors.northeast).toBeDefined();
      expect(center.neighbors.north).toBeDefined();
      expect(center.neighbors.northwest).toBeDefined();
      expect(center.neighbors.southwest).toBeDefined();
      expect(center.neighbors.south).toBeDefined();
      expect(center.neighbors.southeast).toBeDefined();
    });

    test('should update connection statistics', () => {
      const initialConnections = lattice.stats.totalConnections;

      // Create two adjacent nodes (creates 2 connections: bidirectional)
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'test', type: 'hub' });
      lattice.createNode({ q: 2, r: 0, layer: 'domain', domain: 'test', type: 'hub' });

      expect(lattice.stats.totalConnections).toBeGreaterThan(initialConnections);
    });
  });

  // ==================== NODE RETRIEVAL ====================

  describe('Node Retrieval', () => {
    test('should retrieve node by ID', () => {
      const node = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });

      const retrieved = lattice.getNode(node.nodeId);
      expect(retrieved).toBe(node);
    });

    test('should return null for non-existent node ID', () => {
      const retrieved = lattice.getNode('non-existent-id');
      expect(retrieved).toBeNull();
    });

    test('should retrieve node by coordinates', () => {
      lattice.createNode({
        q: 3,
        r: 2,
        layer: 'task',
        domain: 'seo',
        type: 'memory'
      });

      const retrieved = lattice.getNodeAt(3, 2);
      expect(retrieved).toBeDefined();
      expect(retrieved.coordinates.q).toBe(3);
      expect(retrieved.coordinates.r).toBe(2);
    });

    test('should return null for empty coordinates', () => {
      const retrieved = lattice.getNodeAt(10, 10);
      expect(retrieved).toBeNull();
    });

    test('should retrieve all nodes in domain', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 2, r: 0, layer: 'task', domain: 'content', type: 'memory' });
      lattice.createNode({ q: 1, r: 1, layer: 'domain', domain: 'seo', type: 'hub' });

      const contentNodes = lattice.getDomainNodes('content');
      expect(contentNodes.length).toBe(2);

      const seoNodes = lattice.getDomainNodes('seo');
      expect(seoNodes.length).toBe(1);
    });

    test('should return empty array for non-existent domain', () => {
      const nodes = lattice.getDomainNodes('nonexistent');
      expect(nodes).toEqual([]);
    });

    test('should retrieve all nodes in layer', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 1, r: 1, layer: 'domain', domain: 'seo', type: 'hub' });
      lattice.createNode({ q: 3, r: 0, layer: 'task', domain: 'content', type: 'memory' });

      const domainNodes = lattice.getLayerNodes('domain');
      expect(domainNodes.length).toBe(2);

      const taskNodes = lattice.getLayerNodes('task');
      expect(taskNodes.length).toBe(1);
    });
  });

  // ==================== PATHFINDING ====================

  describe('A* Pathfinding', () => {
    beforeEach(() => {
      // Create a small network
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'test', type: 'node' });
      lattice.createNode({ q: 2, r: 0, layer: 'domain', domain: 'test', type: 'node' });
      lattice.createNode({ q: 3, r: 0, layer: 'domain', domain: 'test', type: 'node' });
      lattice.createNode({ q: 2, r: 1, layer: 'domain', domain: 'test', type: 'node' });
    });

    test('should find path between adjacent nodes', () => {
      const node1 = lattice.getNodeAt(1, 0);
      const node2 = lattice.getNodeAt(2, 0);

      const path = lattice.findPath(node1.nodeId, node2.nodeId);

      expect(path).toBeDefined();
      expect(path.length).toBe(2);
      expect(path[0]).toBe(node1);
      expect(path[1]).toBe(node2);
    });

    test('should find path between distant nodes', () => {
      const node1 = lattice.getNodeAt(1, 0);
      const node3 = lattice.getNodeAt(3, 0);

      const path = lattice.findPath(node1.nodeId, node3.nodeId);

      expect(path).toBeDefined();
      expect(path.length).toBe(3);
      expect(path[0]).toBe(node1);
      expect(path[path.length - 1]).toBe(node3);
    });

    test('should return empty array for disconnected nodes', () => {
      // Create isolated node
      lattice.createNode({ q: 10, r: 10, layer: 'task', domain: 'isolated', type: 'node' });

      const node1 = lattice.getNodeAt(1, 0);
      const isolated = lattice.getNodeAt(10, 10);

      const path = lattice.findPath(node1.nodeId, isolated.nodeId);

      expect(path).toEqual([]);
    });

    test('should cache frequently used paths', () => {
      const node1 = lattice.getNodeAt(1, 0);
      const node2 = lattice.getNodeAt(2, 0);

      // First call - not cached
      const path1 = lattice.findPath(node1.nodeId, node2.nodeId);

      // Second call - should use cache
      const path2 = lattice.findPath(node1.nodeId, node2.nodeId);

      expect(path1).toEqual(path2);
      expect(lattice.pathCache.size).toBeGreaterThan(0);
    });

    test('should update traversal statistics', () => {
      const initialCount = lattice.stats.traversalCount;

      const node1 = lattice.getNodeAt(1, 0);
      const node2 = lattice.getNodeAt(2, 0);

      lattice.findPath(node1.nodeId, node2.nodeId);

      expect(lattice.stats.traversalCount).toBe(initialCount + 1);
    });

    test('should calculate cache hit rate', () => {
      const node1 = lattice.getNodeAt(1, 0);
      const node2 = lattice.getNodeAt(2, 0);

      // Uncached call
      lattice.findPath(node1.nodeId, node2.nodeId);

      // Cached call
      lattice.findPath(node1.nodeId, node2.nodeId);

      expect(lattice.stats.cacheHitRate).toBeGreaterThan(0);
    });
  });

  // ==================== RADIUS SEARCH ====================

  describe('Radius Search', () => {
    beforeEach(() => {
      // Create ring of nodes around center
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'test', type: 'ring1' });
      lattice.createNode({ q: 0, r: 1, layer: 'domain', domain: 'test', type: 'ring1' });
      lattice.createNode({ q: -1, r: 1, layer: 'domain', domain: 'test', type: 'ring1' });
      lattice.createNode({ q: 2, r: 0, layer: 'domain', domain: 'test', type: 'ring2' });
    });

    test('should find nodes within radius 1', () => {
      const center = lattice.coreNode;
      const nodes = lattice.getNodesWithinRadius(center, 1);

      expect(nodes.length).toBeGreaterThan(1);
      expect(nodes).toContain(center);
    });

    test('should find nodes within radius 2', () => {
      const center = lattice.coreNode;
      const nodes = lattice.getNodesWithinRadius(center, 2);

      // Should include ring 1 and ring 2 nodes
      expect(nodes.length).toBeGreaterThan(3);
    });

    test('should find only center node with radius 0', () => {
      const center = lattice.coreNode;
      const nodes = lattice.getNodesWithinRadius(center, 0);

      expect(nodes.length).toBe(1);
      expect(nodes[0]).toBe(center);
    });
  });

  // ==================== RING POSITIONS ====================

  describe('Ring Positions', () => {
    test('should get origin for radius 0', () => {
      const positions = lattice.getRingPositions(0);

      expect(positions.length).toBe(1);
      expect(positions[0]).toEqual({ q: 0, r: 0 });
    });

    test('should get 6 positions for radius 1', () => {
      const positions = lattice.getRingPositions(1);

      expect(positions.length).toBe(6);
    });

    test('should get 12 positions for radius 2', () => {
      const positions = lattice.getRingPositions(2);

      expect(positions.length).toBe(12);
    });

    test('should get correct number of positions for radius N', () => {
      // Hexagonal ring has 6 * radius positions
      const radius = 3;
      const positions = lattice.getRingPositions(radius);

      expect(positions.length).toBe(6 * radius);
    });
  });

  // ==================== OPTIMAL POSITIONING ====================

  describe('Optimal Positioning', () => {
    test('should place first domain node in ring 1', () => {
      const pos = lattice.findOptimalPosition('domain', 'new-domain');

      const distance = Math.abs(pos.q) + Math.abs(pos.r);
      expect(distance).toBeLessThanOrEqual(2); // Ring 1 or 2
    });

    test('should place task nodes in ring 3+', () => {
      const pos = lattice.findOptimalPosition('task', 'new-domain');

      const distance = Math.abs(pos.q) + Math.abs(pos.r);
      expect(distance).toBeGreaterThanOrEqual(3);
    });

    test('should cluster nodes in same domain', () => {
      // Create first content node
      const node1 = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'hub'
      });

      // Find position for second content node
      const pos = lattice.findOptimalPosition('domain', 'content');

      // Should be near first node
      const distance = Math.abs(pos.q - node1.coordinates.q) + Math.abs(pos.r - node1.coordinates.r);
      expect(distance).toBeLessThanOrEqual(3);
    });

    test('should find empty position when ring is partial', () => {
      // Fill some positions in ring 1
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'test', type: 'node' });
      lattice.createNode({ q: 0, r: 1, layer: 'domain', domain: 'test', type: 'node' });

      const pos = lattice.findEmptyPositionInRing(1);

      expect(pos).toBeDefined();
      expect(lattice.getNodeAt(pos.q, pos.r)).toBeNull();
    });

    test('should move to next ring when current is full', () => {
      // Fill all positions in ring 1 (6 positions)
      const ring1Positions = lattice.getRingPositions(1);
      ring1Positions.forEach(({ q, r }) => {
        lattice.createNode({ q, r, layer: 'domain', domain: 'test', type: 'node' });
      });

      const pos = lattice.findEmptyPositionInRing(1);

      // Should return position in ring 2
      const distance = Math.abs(pos.q) + Math.abs(pos.r);
      expect(distance).toBe(2);
    });
  });

  // ==================== SELF-ORGANIZATION ====================

  describe('Self-Organization', () => {
    test('should not auto-organize when disabled', (done) => {
      lattice.config.autoOrganize = false;

      setTimeout(() => {
        expect(lattice.reorganizationInterval).toBeUndefined();
        done();
      }, 100);
    });

    test('should reorganize on demand', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 2, r: 0, layer: 'task', domain: 'content', type: 'memory' });

      lattice.reorganize();

      expect(lattice.lastReorganization).toBeDefined();
      expect(lattice.reorganizationHistory.length).toBeGreaterThan(0);
    });

    test('should emit reorganization-complete event', (done) => {
      lattice.once('reorganization-complete', (data) => {
        expect(data.nodesAffected).toBeDefined();
        expect(data.averageCoherence).toBeDefined();
        done();
      });

      lattice.reorganize();
    });

    test('should update average coherence', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 2, r: 0, layer: 'task', domain: 'content', type: 'memory' });

      lattice.reorganize();

      expect(lattice.stats.averageCoherence).toBeGreaterThanOrEqual(0);
    });

    test('should clear path cache after reorganization', () => {
      const node1 = lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'test', type: 'node' });
      const node2 = lattice.createNode({ q: 2, r: 0, layer: 'domain', domain: 'test', type: 'node' });

      // Create cached path
      lattice.findPath(node1.nodeId, node2.nodeId);
      expect(lattice.pathCache.size).toBeGreaterThan(0);

      // Reorganize should clear cache
      lattice.reorganize();
      expect(lattice.pathCache.size).toBe(0);
    });

    test('should maintain reorganization history', () => {
      lattice.reorganize();
      lattice.reorganize();

      expect(lattice.reorganizationHistory.length).toBe(2);
      expect(lattice.reorganizationHistory[0].timestamp).toBeLessThan(lattice.reorganizationHistory[1].timestamp);
    });

    test('should limit reorganization history to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        lattice.reorganize();
      }

      expect(lattice.reorganizationHistory.length).toBeLessThanOrEqual(10);
    });
  });

  // ==================== STATISTICS ====================

  describe('Statistics', () => {
    test('should provide lattice statistics', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 2, r: 0, layer: 'task', domain: 'seo', type: 'memory' });

      const stats = lattice.getStatistics();

      expect(stats.totalNodes).toBe(3); // Including core
      expect(stats.totalConnections).toBeGreaterThan(0);
      expect(stats.layers.core).toBe(1);
      expect(stats.layers.domain).toBe(1);
      expect(stats.layers.task).toBe(1);
      expect(stats.domains).toBeGreaterThan(0);
    });

    test('should provide lattice status', () => {
      const status = lattice.getStatus();

      expect(status.totalNodes).toBeDefined();
      expect(status.totalConnections).toBeDefined();
      expect(status.averageCoherence).toBeDefined();
      expect(status.coreNode).toBe(lattice.coreNode.nodeId);
      expect(status.autoOrganizeEnabled).toBe(false); // Disabled in tests
      expect(status.statistics).toBeDefined();
    });

    test('should track reorganization count', () => {
      const initialStats = lattice.getStatistics();

      lattice.reorganize();

      const updatedStats = lattice.getStatistics();
      expect(updatedStats.reorganizationCount).toBeGreaterThan(initialStats.reorganizationCount);
    });
  });

  // ==================== VISUALIZATION ====================

  describe('Visualization', () => {
    test('should generate ASCII visualization', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 0, r: 1, layer: 'task', domain: 'seo', type: 'memory' });

      const viz = lattice.visualize(3);

      expect(viz).toBeDefined();
      expect(typeof viz).toBe('string');
      expect(viz).toContain('●'); // Core node
      expect(viz).toContain('◆'); // Domain node
      expect(viz).toContain('○'); // Task node
    });
  });

  // ==================== SERIALIZATION ====================

  describe('Serialization', () => {
    test('should export to JSON', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });

      const json = lattice.toJSON();

      expect(json.config).toBeDefined();
      expect(json.stats).toBeDefined();
      expect(json.nodes).toBeDefined();
      expect(json.coreNodeId).toBe(lattice.coreNode.nodeId);
      expect(Array.isArray(json.nodes)).toBe(true);
    });

    test('should include all nodes in JSON export', () => {
      lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'content', type: 'hub' });
      lattice.createNode({ q: 2, r: 0, layer: 'task', domain: 'seo', type: 'memory' });

      const json = lattice.toJSON();

      expect(json.nodes.length).toBe(3); // Core + 2 created
    });

    test('should include reorganization history in JSON', () => {
      lattice.reorganize();

      const json = lattice.toJSON();

      expect(json.reorganizationHistory).toBeDefined();
      expect(Array.isArray(json.reorganizationHistory)).toBe(true);
    });
  });

  // ==================== SHUTDOWN ====================

  describe('Shutdown', () => {
    test('should clear path cache on shutdown', () => {
      const node1 = lattice.createNode({ q: 1, r: 0, layer: 'domain', domain: 'test', type: 'node' });
      const node2 = lattice.createNode({ q: 2, r: 0, layer: 'domain', domain: 'test', type: 'node' });

      lattice.findPath(node1.nodeId, node2.nodeId);
      expect(lattice.pathCache.size).toBeGreaterThan(0);

      lattice.shutdown();
      expect(lattice.pathCache.size).toBe(0);
    });

    test('should stop auto-organization on shutdown', () => {
      lattice.config.autoOrganize = true;
      lattice.startAutoOrganization();

      expect(lattice.reorganizationInterval).toBeDefined();

      lattice.shutdown();
      expect(lattice.reorganizationInterval).toBeNull();
    });
  });
});

/**
 * Run manual unit test
 * Usage: node tests/hexagonal-memory-lattice.test.js
 */
if (require.main === module) {
  (async () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('Hexagonal Memory Lattice - Manual Unit Test');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      const lattice = new HexagonalMemoryLattice({
        maxRadius: 5,
        autoOrganize: false
      });

      console.log('1. Testing node creation...');
      const domainNode = lattice.createNode({
        q: 1,
        r: 0,
        layer: 'domain',
        domain: 'content',
        type: 'knowledge-hub',
        data: { description: 'Content knowledge hub' }
      });
      console.log(`✓ Created domain node: ${domainNode.nodeId}`);

      const taskNode = lattice.createNode({
        q: 2,
        r: 0,
        layer: 'task',
        domain: 'content',
        type: 'task-memory',
        data: { description: 'Task memory' }
      });
      console.log(`✓ Created task node: ${taskNode.nodeId}\n`);

      console.log('2. Testing neighbor connections...');
      console.log(`✓ Domain node neighbors: ${Object.keys(domainNode.neighbors).filter(k => domainNode.neighbors[k]).length}`);
      console.log(`✓ Task node neighbors: ${Object.keys(taskNode.neighbors).filter(k => taskNode.neighbors[k]).length}\n`);

      console.log('3. Testing pathfinding...');
      const path = lattice.findPath(lattice.coreNode.nodeId, taskNode.nodeId);
      console.log(`✓ Path found with ${path.length} nodes`);
      console.log(`  Path: ${path.map(n => `(${n.coordinates.q},${n.coordinates.r})`).join(' → ')}\n`);

      console.log('4. Testing statistics...');
      const stats = lattice.getStatistics();
      console.log(`✓ Total nodes: ${stats.totalNodes}`);
      console.log(`✓ Total connections: ${stats.totalConnections}`);
      console.log(`✓ Domains: ${stats.domains}`);
      console.log(`✓ Layers: Core=${stats.layers.core}, Domain=${stats.layers.domain}, Task=${stats.layers.task}\n`);

      console.log('5. Testing visualization...');
      const viz = lattice.visualize(2);
      console.log(viz);

      console.log('6. Testing reorganization...');
      lattice.reorganize();
      console.log(`✓ Average coherence: ${lattice.stats.averageCoherence.toFixed(2)}`);
      console.log(`✓ Reorganization history: ${lattice.reorganizationHistory.length} entries\n`);

      lattice.shutdown();

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
