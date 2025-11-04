const HexagonalLattice = require('./hexagonal-lattice');
const Redis = require('redis');

class CrystallineMemoryManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.lattice = new HexagonalLattice(redisClient);
    this.memoryPools = new Map();
    this.activeQueries = new Map();
    this.lastRestructure = Date.now();
    this.restructureInterval = 300000; // 5 minutes
    
    this.startMaintenanceCycle();
  }

  async storeMemory(domain, content, metadata = {}) {
    try {
      const spiral = this.generateSpiral(this.memoryPools.size || 0);
      const { q, r } = spiral[this.memoryPools.size % spiral.length];
      
      const memoryData = {
        domain,
        content,
        metadata: {
          ...metadata,
          importance: metadata.importance || 1.0,
          lastAccess: Date.now(),
          accessCount: 0,
          semantic_tags: this.extractSemanticTags(content)
        }
      };

      const nodeId = await this.lattice.createNode(q, r, memoryData, 'memory');
      
      if (nodeId) {
        if (!this.memoryPools.has(domain)) {
          this.memoryPools.set(domain, []);
        }
        this.memoryPools.get(domain).push(nodeId);
        
        console.log(`🧠 Crystalline memory stored: ${domain} at (${q}, ${r})`);
        return nodeId;
      }
      
      return null;
    } catch (error) {
      console.error('Error storing crystalline memory:', error);
      return null;
    }
  }

  async retrieveMemory(query, domain = null, maxResults = 5) {
    try {
      const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.activeQueries.set(queryId, {
        query,
        domain,
        startTime: Date.now(),
        results: []
      });

      const searchData = {
        content: query,
        domain,
        semantic_tags: this.extractSemanticTags(query)
      };

      const allPools = domain ? [domain] : Array.from(this.memoryPools.keys());
      const allResults = [];

      for (const poolDomain of allPools) {
        const nodeIds = this.memoryPools.get(poolDomain) || [];
        
        for (const nodeId of nodeIds) {
          const candidates = await this.lattice.findOptimalPath(nodeId, searchData, 6);
          allResults.push(...candidates);
        }
      }

      const uniqueResults = this.deduplicateResults(allResults);
      const topResults = uniqueResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults);

      await this.reinforcePaths(topResults);
      
      const queryResult = {
        query,
        domain,
        results: topResults.map(r => ({
          nodeId: r.node.id,
          content: r.node.data.content,
          domain: r.node.data.domain,
          similarity: r.similarity,
          metadata: r.node.data.metadata,
          coordinate: { q: r.node.q, r: r.node.r }
        })),
        processingTime: Date.now() - this.activeQueries.get(queryId).startTime,
        pathOptimization: true
      };

      this.activeQueries.delete(queryId);
      return queryResult;
    } catch (error) {
      console.error('Error retrieving crystalline memory:', error);
      return {
        query,
        domain,
        results: [],
        processingTime: 0,
        error: error.message
      };
    }
  }

  async shareMemoryPool(domain, targetDomain) {
    try {
      const sourcePool = this.memoryPools.get(domain) || [];
      const targetPool = this.memoryPools.get(targetDomain) || [];
      
      if (sourcePool.length === 0) return false;

      const sharedMemories = [];
      
      for (const nodeId of sourcePool) {
        const node = await this.lattice.getNode(nodeId);
        if (node && node.data.metadata.importance > 0.7) {
          targetPool.push(nodeId);
          sharedMemories.push({
            nodeId,
            content: node.data.content,
            importance: node.data.metadata.importance
          });
        }
      }
      
      this.memoryPools.set(targetDomain, targetPool);
      
      console.log(`🔗 Pipeline sharing: ${domain} → ${targetDomain} (${sharedMemories.length} memories)`);
      return {
        success: true,
        sharedCount: sharedMemories.length,
        sharedMemories
      };
    } catch (error) {
      console.error('Error sharing memory pool:', error);
      return { success: false, error: error.message };
    }
  }

  async getMemoryPoolStats() {
    const stats = {
      totalPools: this.memoryPools.size,
      poolBreakdown: {},
      latticeStats: await this.lattice.getLatticeStats(),
      activeQueries: this.activeQueries.size,
      lastRestructure: this.lastRestructure
    };

    for (const [domain, nodeIds] of this.memoryPools) {
      let totalImportance = 0;
      let activeMemories = 0;
      
      for (const nodeId of nodeIds) {
        const node = await this.lattice.getNode(nodeId);
        if (node) {
          totalImportance += node.data.metadata.importance || 0;
          if (Date.now() - node.lastAccessed < 3600000) { // 1 hour
            activeMemories++;
          }
        }
      }

      stats.poolBreakdown[domain] = {
        nodeCount: nodeIds.length,
        averageImportance: totalImportance / nodeIds.length || 0,
        activeMemories,
        utilizationRate: (activeMemories / nodeIds.length) * 100 || 0
      };
    }

    return stats;
  }

  generateSpiral(n) {
    const coords = [{ q: 0, r: 0 }];
    
    for (let ring = 1; ring <= Math.ceil(Math.sqrt(n / 3)); ring++) {
      let q = ring;
      let r = -ring;
      
      for (let direction = 0; direction < 6; direction++) {
        for (let step = 0; step < ring; step++) {
          if (coords.length <= n) {
            coords.push({ q, r });
          }
          
          switch (direction) {
            case 0: r++; break;
            case 1: q--; r++; break;
            case 2: q--; break;
            case 3: r--; break;
            case 4: q++; r--; break;
            case 5: q++; break;
          }
        }
      }
    }
    
    return coords;
  }

  extractSemanticTags(content) {
    if (!content || typeof content !== 'string') return [];
    
    const tags = [];
    const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
    
    const keywordCategories = {
      technical: ['api', 'database', 'server', 'client', 'code', 'function', 'method', 'class', 'object', 'array', 'string', 'number', 'boolean', 'variable', 'algorithm', 'data', 'structure', 'programming', 'development'],
      business: ['strategy', 'market', 'customer', 'revenue', 'profit', 'growth', 'sales', 'marketing', 'brand', 'competition', 'analysis', 'research', 'planning', 'management', 'business', 'company', 'enterprise'],
      creative: ['design', 'color', 'layout', 'typography', 'visual', 'aesthetic', 'creative', 'art', 'style', 'theme', 'concept', 'idea', 'inspiration', 'innovation', 'content', 'writing', 'copy'],
      performance: ['speed', 'fast', 'slow', 'optimization', 'efficiency', 'performance', 'memory', 'cpu', 'processing', 'time', 'latency', 'throughput', 'scalability', 'load', 'capacity']
    };
    
    for (const [category, keywords] of Object.entries(keywordCategories)) {
      const matches = words.filter(word => keywords.includes(word));
      if (matches.length > 0) {
        tags.push(`category:${category}`);
      }
    }
    
    const highFrequencyWords = this.getWordFrequency(words);
    Object.keys(highFrequencyWords)
      .filter(word => highFrequencyWords[word] > 1)
      .slice(0, 5)
      .forEach(word => tags.push(`keyword:${word}`));
    
    return [...new Set(tags)];
  }

  getWordFrequency(words) {
    return words.reduce((freq, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {});
  }

  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.node.id}_${result.similarity}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async reinforcePaths(results) {
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i];
      const next = results[i + 1];
      
      if (current.path && next.path) {
        const commonNodes = current.path.filter(nodeId => next.path.includes(nodeId));
        
        for (let j = 0; j < commonNodes.length - 1; j++) {
          await this.lattice.strengthenPath(commonNodes[j], commonNodes[j + 1], 0.05);
        }
      }
    }
  }

  startMaintenanceCycle() {
    setInterval(async () => {
      try {
        console.log('🔧 Crystalline memory maintenance cycle starting...');
        
        if (Date.now() - this.lastRestructure > this.restructureInterval) {
          const newStats = await this.lattice.restructureLattice();
          this.lastRestructure = Date.now();
          console.log(`🧠 Lattice restructured: ${newStats.totalNodes} nodes, ${newStats.totalConnections} connections`);
        }
        
        await this.cleanupInactiveMemories();
        console.log('✅ Maintenance cycle complete');
      } catch (error) {
        console.error('Error in maintenance cycle:', error);
      }
    }, 60000); // Every minute
  }

  async cleanupInactiveMemories() {
    const cutoffTime = Date.now() - 3600000; // 1 hour ago
    let cleanedCount = 0;

    for (const [domain, nodeIds] of this.memoryPools) {
      const activeNodes = [];
      
      for (const nodeId of nodeIds) {
        const node = await this.lattice.getNode(nodeId);
        if (node && node.lastAccessed > cutoffTime) {
          activeNodes.push(nodeId);
        } else if (node) {
          cleanedCount++;
        }
      }
      
      this.memoryPools.set(domain, activeNodes);
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} inactive memories`);
    }
  }

  async exportMemorySnapshot() {
    const stats = await this.getMemoryPoolStats();
    const snapshot = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      stats,
      memoryPools: {}
    };

    for (const [domain, nodeIds] of this.memoryPools) {
      snapshot.memoryPools[domain] = [];
      
      for (const nodeId of nodeIds.slice(0, 10)) { // Limit to 10 per domain for export
        const node = await this.lattice.getNode(nodeId);
        if (node) {
          snapshot.memoryPools[domain].push({
            coordinate: { q: node.q, r: node.r },
            content: node.data.content,
            metadata: node.data.metadata,
            connections: node.connections.length
          });
        }
      }
    }

    return snapshot;
  }

  /**
   * Create a memory pool for multilingual system compatibility
   * This method provides compatibility with the multilingual system's expected interface
   */
  async createMemoryPool(poolConfig) {
    try {
      const { poolId, language, isolation, crossContaminationPrevention, validationLevel, temperature } = poolConfig;
      
      // Initialize the memory pool if it doesn't exist
      if (!this.memoryPools.has(poolId)) {
        this.memoryPools.set(poolId, []);
        console.log(`📁 Created memory pool: ${poolId} for language ${language || 'general'}`);
      }
      
      // Store pool configuration in crystalline memory
      const poolMetadata = {
        poolId,
        language,
        isolation,
        crossContaminationPrevention,
        validationLevel,
        temperature,
        createdAt: new Date().toISOString(),
        poolType: 'multilingual'
      };
      
      const poolConfigNodeId = await this.storeMemory(`pool-config-${poolId}`, poolMetadata, {
        importance: 0.9,
        poolConfiguration: true
      });
      
      return {
        success: true,
        poolId,
        language,
        nodeId: poolConfigNodeId,
        isolation: isolation || 'standard'
      };
      
    } catch (error) {
      console.error(`❌ Failed to create memory pool ${poolConfig.poolId}:`, error.message);
      return {
        success: false,
        error: error.message,
        poolId: poolConfig.poolId
      };
    }
  }
}

module.exports = CrystallineMemoryManager;