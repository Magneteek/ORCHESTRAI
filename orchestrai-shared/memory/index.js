/**
 * Memory System Exports
 *
 * Complete ORCHESTRAI memory architecture:
 * - Phase 1.1: Original Crystalline Memory (MCP + Redis + In-Memory)
 * - Phase 2.1: Pipeline Sharing & Co-Learning
 * - Phase 2.2: Hexagonal Memory Lattice
 *
 * Integrated Advanced Crystalline Memory combines all systems.
 */

// Phase 1.1 - Original Crystalline Memory
const CrystallineMemoryManager = require('./crystalline-memory-manager');
const MemoryAccessCoordinator = require('./memory-access-coordinator');
const MemoryPoolManager = require('./memory-pool-manager');

// Phase 2.2 - Hexagonal Memory Architecture
const HexagonalMemoryNode = require('./hexagonal-memory-node');
const HexagonalMemoryLattice = require('./hexagonal-memory-lattice');

// Phase 2.1 - Pipeline Sharing & Co-Learning
const CoLearningMemoryPool = require('./co-learning-memory-pool');

// Integrated System
const AdvancedCrystallineMemory = require('./advanced-crystalline-memory');

module.exports = {
  // Phase 1.1 - Original System
  CrystallineMemoryManager,
  MemoryAccessCoordinator,
  MemoryPoolManager,

  // Phase 2.2 - Hexagonal Architecture
  HexagonalMemoryNode,
  HexagonalMemoryLattice,

  // Phase 2.1 - Co-Learning
  CoLearningMemoryPool,

  // Integrated Advanced System
  AdvancedCrystallineMemory,

  // Factory function for easy initialization
  createAdvancedMemory: (config = {}) => {
    const memory = new AdvancedCrystallineMemory(config);
    return memory;
  }
};
