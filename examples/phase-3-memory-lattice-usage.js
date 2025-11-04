/**
 * Phase 3 Example: Hexagonal Memory Lattice Usage
 *
 * Demonstrates using the hexagonal memory lattice for geometric
 * knowledge organization with self-organizing structure and
 * efficient pathfinding.
 *
 * Scenario:
 * - Organize client knowledge across multiple domains
 * - Create hierarchical memory structure
 * - Demonstrate efficient memory traversal
 * - Show self-organization based on access patterns
 */

const HexagonalMemoryLattice = require('../orchestrai-shared/memory/hexagonal-memory-lattice');

async function demonstrateMemoryLattice() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  Phase 3 Example: Hexagonal Memory Lattice      ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // Step 1: Initialize lattice
  console.log('📋 Step 1: Initializing hexagonal memory lattice...\n');

  const lattice = new HexagonalMemoryLattice({
    maxRadius: 10,
    autoOrganize: true,
    organizationInterval: 60000 // 1 minute auto-reorganization
  });

  console.log('✅ Lattice initialized');
  console.log(`   Core node: (0,0) - ${lattice.coreNode.nodeId}`);
  console.log(`   Max radius: 10`);
  console.log(`   Auto-organization: enabled\n`);

  // Step 2: Create domain hubs
  console.log('📋 Step 2: Creating domain knowledge hubs...\n');

  const contentHub = lattice.createNode({
    q: 1,
    r: 0,
    layer: 'domain',
    domain: 'content',
    type: 'knowledge-hub',
    data: {
      description: 'Content creation and optimization hub',
      expertise: ['writing', 'seo', 'multilanguage']
    }
  });

  const seoHub = lattice.createNode({
    q: 0,
    r: 1,
    layer: 'domain',
    domain: 'seo',
    type: 'knowledge-hub',
    data: {
      description: 'SEO research and analysis hub',
      expertise: ['keyword-research', 'competitor-analysis', 'technical-seo']
    }
  });

  const designHub = lattice.createNode({
    q: -1,
    r: 1,
    layer: 'domain',
    domain: 'design',
    type: 'knowledge-hub',
    data: {
      description: 'Design and UX hub',
      expertise: ['wireframing', 'ui-design', 'ux-planning']
    }
  });

  console.log('✅ Domain hubs created');
  console.log(`   Content hub: (${contentHub.coordinates.q},${contentHub.coordinates.r})`);
  console.log(`   SEO hub: (${seoHub.coordinates.q},${seoHub.coordinates.r})`);
  console.log(`   Design hub: (${designHub.coordinates.q},${designHub.coordinates.r})\n`);

  // Step 3: Create task-specific memories
  console.log('📋 Step 3: Creating task-specific memories...\n');

  // Content domain memories
  const contentMemories = [
    {
      q: 2,
      r: 0,
      layer: 'task',
      domain: 'content',
      type: 'task-memory',
      data: { task: 'Pillar article writing', success: true, quality: 95 }
    },
    {
      q: 2,
      r: -1,
      layer: 'task',
      domain: 'content',
      type: 'task-memory',
      data: { task: 'Multi-language content', success: true, quality: 92 }
    },
    {
      q: 1,
      r: 1,
      layer: 'task',
      domain: 'content',
      type: 'task-memory',
      data: { task: 'Brand voice optimization', success: true, quality: 97 }
    }
  ];

  // SEO domain memories
  const seoMemories = [
    {
      q: 0,
      r: 2,
      layer: 'task',
      domain: 'seo',
      type: 'task-memory',
      data: { task: 'Keyword research', success: true, keywords: 150 }
    },
    {
      q: -1,
      r: 2,
      layer: 'task',
      domain: 'seo',
      type: 'task-memory',
      data: { task: 'Competitor analysis', success: true, competitors: 10 }
    },
    {
      q: 1,
      r: 2,
      layer: 'task',
      domain: 'seo',
      type: 'task-memory',
      data: { task: 'Technical SEO audit', success: true, score: 89 }
    }
  ];

  // Design domain memories
  const designMemories = [
    {
      q: -2,
      r: 2,
      layer: 'task',
      domain: 'design',
      type: 'task-memory',
      data: { task: 'Wireframe creation', success: true, screens: 12 }
    },
    {
      q: -2,
      r: 1,
      layer: 'task',
      domain: 'design',
      type: 'task-memory',
      data: { task: 'UI component library', success: true, components: 45 }
    }
  ];

  // Create all task memories
  contentMemories.forEach(config => lattice.createNode(config));
  seoMemories.forEach(config => lattice.createNode(config));
  designMemories.forEach(config => lattice.createNode(config));

  console.log('✅ Task memories created');
  console.log(`   Content memories: ${contentMemories.length}`);
  console.log(`   SEO memories: ${seoMemories.length}`);
  console.log(`   Design memories: ${designMemories.length}`);
  console.log(`   Total nodes: ${lattice.stats.totalNodes}\n`);

  // Step 4: Demonstrate pathfinding
  console.log('📋 Step 4: Demonstrating efficient pathfinding...\n');

  const contentMemoryNode = lattice.getNodeAt(2, 0);
  const seoMemoryNode = lattice.getNodeAt(0, 2);

  console.log(`Finding path from Content Memory (2,0) to SEO Memory (0,2)...`);

  const path = lattice.findPath(contentMemoryNode.nodeId, seoMemoryNode.nodeId);

  console.log(`✅ Path found with ${path.length} nodes:`);
  path.forEach((node, index) => {
    console.log(`   ${index + 1}. (${node.coordinates.q},${node.coordinates.r}) - ${node.layer} [${node.domain}]`);
  });

  console.log(`\n   Path traversal stats:`);
  console.log(`   Total traversals: ${lattice.stats.traversalCount}`);
  console.log(`   Cache hit rate: ${(lattice.stats.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`   Path cache size: ${lattice.pathCache.size}\n`);

  // Step 5: Demonstrate domain clustering
  console.log('📋 Step 5: Demonstrating domain clustering...\n');

  const contentNodes = lattice.getDomainNodes('content');
  const seoNodes = lattice.getDomainNodes('seo');
  const designNodes = lattice.getDomainNodes('design');

  console.log('✅ Domain clusters organized:');
  console.log(`   Content domain: ${contentNodes.length} nodes`);
  console.log(`   SEO domain: ${seoNodes.length} nodes`);
  console.log(`   Design domain: ${designNodes.length} nodes\n`);

  // Calculate cluster centroids
  console.log('   Cluster centroids (center of mass):');
  const contentCentroid = lattice.calculateCenterOfMass(contentNodes);
  const seoCentroid = lattice.calculateCenterOfMass(seoNodes);
  const designCentroid = lattice.calculateCenterOfMass(designNodes);

  console.log(`   Content: (${contentCentroid.q},${contentCentroid.r})`);
  console.log(`   SEO: (${seoCentroid.q},${seoCentroid.r})`);
  console.log(`   Design: (${designCentroid.q},${designCentroid.r})\n`);

  // Step 6: Demonstrate radius search
  console.log('📋 Step 6: Demonstrating radius-based search...\n');

  const nearbyNodes = lattice.getNodesWithinRadius(contentHub, 2);

  console.log(`✅ Nodes within radius 2 of Content hub:`);
  console.log(`   Found ${nearbyNodes.length} nodes:`);
  nearbyNodes.forEach(node => {
    const distance = contentHub.distanceTo(node);
    console.log(`   • (${node.coordinates.q},${node.coordinates.r}) - ${node.layer} [${node.domain}] - distance: ${distance}`);
  });
  console.log();

  // Step 7: Demonstrate self-organization
  console.log('📋 Step 7: Demonstrating self-organization...\n');

  console.log('Triggering lattice reorganization...');

  lattice.reorganize();

  console.log('✅ Reorganization complete');
  console.log(`   Average coherence: ${lattice.stats.averageCoherence.toFixed(2)}`);
  console.log(`   Reorganization history: ${lattice.reorganizationHistory.length} events`);
  console.log(`   Last reorganization: ${new Date(lattice.lastReorganization).toISOString()}\n`);

  // Step 8: Display lattice statistics
  console.log('📋 Step 8: Lattice statistics and health...\n');

  const stats = lattice.getStatistics();

  console.log('✅ Lattice Statistics:');
  console.log(`   Total nodes: ${stats.totalNodes}`);
  console.log(`   Total connections: ${stats.totalConnections}`);
  console.log(`   Average coherence: ${stats.averageCoherence.toFixed(2)}`);
  console.log(`   Domains: ${stats.domains}`);
  console.log(`   Traversal count: ${stats.traversalCount}`);
  console.log(`   Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`   Path cache size: ${stats.pathCacheSize}\n`);

  console.log('   Layer distribution:');
  console.log(`   Core: ${stats.layers.core} nodes`);
  console.log(`   Domain: ${stats.layers.domain} nodes`);
  console.log(`   Task: ${stats.layers.task} nodes\n`);

  // Step 9: Visualize lattice
  console.log('📋 Step 9: Lattice visualization...\n');

  const visualization = lattice.visualize(3);
  console.log(visualization);

  // Step 10: Export lattice state
  console.log('📋 Step 10: Exporting lattice state...\n');

  const exportedState = lattice.toJSON();

  console.log('✅ Lattice state exported');
  console.log(`   Nodes exported: ${exportedState.nodes.length}`);
  console.log(`   Configuration: ${JSON.stringify(exportedState.config, null, 2)}`);
  console.log(`   Core node ID: ${exportedState.coreNodeId}\n`);

  // Summary
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  MEMORY LATTICE DEMONSTRATION COMPLETE           ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  console.log('📈 Key Features Demonstrated:');
  console.log('   ✓ Geometric memory organization (hexagonal coordinates)');
  console.log('   ✓ Hierarchical layers (core → domain → task)');
  console.log('   ✓ Domain clustering (related memories grouped)');
  console.log('   ✓ A* pathfinding (efficient traversal with caching)');
  console.log('   ✓ Radius-based search (spatial queries)');
  console.log('   ✓ Self-organization (automatic restructuring)');
  console.log('   ✓ Statistics tracking (performance metrics)');
  console.log('   ✓ ASCII visualization (structure overview)');
  console.log('   ✓ JSON export/import (state persistence)\n');

  console.log('💡 Benefits:');
  console.log('   • Efficient memory access patterns');
  console.log('   • Automatic optimization based on usage');
  console.log('   • Geometric relationships reveal insights');
  console.log('   • Scalable to thousands of memory nodes');
  console.log('   • Path caching improves performance\n');

  // Cleanup
  console.log('📋 Cleanup: Shutting down lattice...\n');

  lattice.shutdown();

  console.log('✅ Lattice shut down successfully\n');

  return {
    totalNodes: stats.totalNodes,
    totalConnections: stats.totalConnections,
    domains: stats.domains,
    traversalCount: stats.traversalCount,
    cacheHitRate: stats.cacheHitRate,
    exportedState
  };
}

// Run example if executed directly
if (require.main === module) {
  demonstrateMemoryLattice()
    .then((result) => {
      console.log('✅ Example completed successfully\n');
      console.log(`Final stats: ${result.totalNodes} nodes, ${result.totalConnections} connections`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Example failed:', error.message);
      process.exit(1);
    });
}

module.exports = { demonstrateMemoryLattice };
