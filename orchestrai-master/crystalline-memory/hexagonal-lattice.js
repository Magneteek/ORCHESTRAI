const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');

class HexagonalLattice {
  constructor(redisClient) {
    this.redis = redisClient;
    this.latticeKey = 'orchestrai:crystalline:lattice';
    this.nodePrefix = 'orchestrai:crystalline:node';
    this.pathPrefix = 'orchestrai:crystalline:path';
    
    this.directions = [
      { q: 1, r: 0 },   // Right
      { q: 0, r: 1 },   // Down-right
      { q: -1, r: 1 },  // Down-left
      { q: -1, r: 0 },  // Left
      { q: 0, r: -1 },  // Up-left
      { q: 1, r: -1 }   // Up-right
    ];
  }

  coordinateToKey(q, r) {
    return `${q},${r}`;
  }

  keyToCoordinate(key) {
    const [q, r] = key.split(',').map(Number);
    return { q, r };
  }

  hexDistance(q1, r1, q2, r2) {
    const dq = q2 - q1;
    const dr = r2 - r1;
    return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
  }

  getNeighbors(q, r) {
    return this.directions.map(dir => ({
      q: q + dir.q,
      r: r + dir.r
    }));
  }

  async createNode(q, r, data, type = 'memory') {
    const nodeId = uuidv4();
    const coordinate = this.coordinateToKey(q, r);
    
    const node = {
      id: nodeId,
      coordinate,
      q, r,
      type,
      data,
      connections: [],
      strength: 1.0,
      lastAccessed: Date.now(),
      accessCount: 0,
      createdAt: Date.now()
    };

    try {
      // Serialize the node data for Redis
      const serializedNode = {
        id: nodeId,
        coordinate,
        q: q.toString(),
        r: r.toString(),
        type,
        data: JSON.stringify(data),
        connections: JSON.stringify([]),
        strength: node.strength.toString(),
        lastAccessed: node.lastAccessed.toString(),
        accessCount: node.accessCount.toString(),
        createdAt: node.createdAt.toString()
      };

      await this.redis.hSet(`${this.nodePrefix}:${nodeId}`, serializedNode);
      await this.redis.hSet(this.latticeKey, coordinate, nodeId);
      
      await this.establishConnections(q, r, nodeId);
      return nodeId;
    } catch (error) {
      console.error('Error creating crystalline node:', error);
      return null;
    }
  }

  async establishConnections(q, r, nodeId) {
    const neighbors = this.getNeighbors(q, r);
    
    for (const neighbor of neighbors) {
      const neighborCoord = this.coordinateToKey(neighbor.q, neighbor.r);
      const neighborNodeId = await this.redis.hGet(this.latticeKey, neighborCoord);
      
      if (neighborNodeId) {
        await this.createConnection(nodeId, neighborNodeId);
      }
    }
  }

  async createConnection(nodeId1, nodeId2, weight = 1.0) {
    const connectionId = uuidv4();
    const connection = {
      id: connectionId,
      from: nodeId1,
      to: nodeId2,
      weight: weight.toString(),
      traversalCount: '0',
      lastTraversal: Date.now().toString(),
      createdAt: Date.now().toString()
    };

    try {
      await this.redis.hSet(`${this.pathPrefix}:${connectionId}`, connection);
      
      const node1 = await this.getNode(nodeId1);
      const node2 = await this.getNode(nodeId2);
      
      if (node1 && node2) {
        node1.connections.push(connectionId);
        node2.connections.push(connectionId);
        
        await this.redis.hSet(`${this.nodePrefix}:${nodeId1}`, 'connections', JSON.stringify(node1.connections));
        await this.redis.hSet(`${this.nodePrefix}:${nodeId2}`, 'connections', JSON.stringify(node2.connections));
      }
      
      return connectionId;
    } catch (error) {
      console.error('Error creating connection:', error);
      return null;
    }
  }

  async getNode(nodeId) {
    try {
      const nodeData = await this.redis.hGetAll(`${this.nodePrefix}:${nodeId}`);
      if (Object.keys(nodeData).length === 0) return null;
      
      nodeData.connections = JSON.parse(nodeData.connections || '[]');
      nodeData.data = JSON.parse(nodeData.data || '{}');
      nodeData.q = parseInt(nodeData.q);
      nodeData.r = parseInt(nodeData.r);
      nodeData.strength = parseFloat(nodeData.strength);
      nodeData.accessCount = parseInt(nodeData.accessCount);
      nodeData.lastAccessed = parseInt(nodeData.lastAccessed);
      nodeData.createdAt = parseInt(nodeData.createdAt);
      
      return nodeData;
    } catch (error) {
      console.error('Error getting node:', error);
      return null;
    }
  }

  async findOptimalPath(startNodeId, targetData, maxDistance = 10) {
    const visited = new Set();
    const queue = [{ nodeId: startNodeId, distance: 0, path: [startNodeId] }];
    const candidates = [];

    while (queue.length > 0) {
      const { nodeId, distance, path } = queue.shift();
      
      if (visited.has(nodeId) || distance > maxDistance) continue;
      visited.add(nodeId);

      const node = await this.getNode(nodeId);
      if (!node) continue;

      const similarity = this.calculateSimilarity(node.data, targetData);
      if (similarity > 0.7) {
        candidates.push({ node, similarity, distance, path });
      }

      for (const connectionId of node.connections) {
        const connection = await this.getConnection(connectionId);
        if (connection) {
          const nextNodeId = connection.from === nodeId ? connection.to : connection.from;
          if (!visited.has(nextNodeId)) {
            queue.push({
              nodeId: nextNodeId,
              distance: distance + 1,
              path: [...path, nextNodeId]
            });
          }
        }
      }
    }

    return candidates.sort((a, b) => {
      const scoreA = a.similarity * (1 / (a.distance + 1));
      const scoreB = b.similarity * (1 / (b.distance + 1));
      return scoreB - scoreA;
    });
  }

  async getConnection(connectionId) {
    try {
      const connectionData = await this.redis.hGetAll(`${this.pathPrefix}:${connectionId}`);
      if (Object.keys(connectionData).length === 0) return null;
      
      connectionData.weight = parseFloat(connectionData.weight);
      connectionData.traversalCount = parseInt(connectionData.traversalCount);
      connectionData.lastTraversal = parseInt(connectionData.lastTraversal);
      connectionData.createdAt = parseInt(connectionData.createdAt);
      
      return connectionData;
    } catch (error) {
      console.error('Error getting connection:', error);
      return null;
    }
  }

  calculateSimilarity(data1, data2) {
    if (!data1 || !data2) return 0;
    
    const keys1 = Object.keys(data1);
    const keys2 = Object.keys(data2);
    const allKeys = new Set([...keys1, ...keys2]);
    
    let matches = 0;
    for (const key of allKeys) {
      if (data1[key] && data2[key]) {
        if (typeof data1[key] === 'string' && typeof data2[key] === 'string') {
          const similarity = this.stringSimilarity(data1[key], data2[key]);
          matches += similarity;
        } else if (data1[key] === data2[key]) {
          matches += 1;
        }
      }
    }
    
    return matches / allKeys.size;
  }

  stringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async strengthenPath(nodeId1, nodeId2, strengthFactor = 0.1) {
    const node1 = await this.getNode(nodeId1);
    const node2 = await this.getNode(nodeId2);
    
    if (!node1 || !node2) return false;

    for (const connectionId of node1.connections) {
      const connection = await this.getConnection(connectionId);
      if (connection && (connection.to === nodeId2 || connection.from === nodeId2)) {
        connection.weight = Math.min(connection.weight + strengthFactor, 2.0);
        connection.traversalCount++;
        connection.lastTraversal = Date.now();
        
        await this.redis.hSet(`${this.pathPrefix}:${connectionId}`, connection);
        return true;
      }
    }
    
    return false;
  }

  async getLatticeStats() {
    try {
      const latticeSize = await this.redis.hLen(this.latticeKey);
      const nodeIds = await this.redis.hVals(this.latticeKey);
      
      let totalConnections = 0;
      let totalStrength = 0;
      let totalAccess = 0;
      
      for (const nodeId of nodeIds) {
        const node = await this.getNode(nodeId);
        if (node) {
          totalConnections += node.connections.length;
          totalStrength += node.strength;
          totalAccess += node.accessCount;
        }
      }
      
      return {
        totalNodes: latticeSize,
        totalConnections: Math.floor(totalConnections / 2),
        averageStrength: totalStrength / latticeSize,
        totalAccess,
        efficiency: Math.min((totalStrength / latticeSize) * 100, 100),
        latticeHealth: this.calculateLatticeHealth(latticeSize, totalConnections / 2)
      };
    } catch (error) {
      console.error('Error getting lattice stats:', error);
      return {
        totalNodes: 0,
        totalConnections: 0,
        averageStrength: 0,
        totalAccess: 0,
        efficiency: 0,
        latticeHealth: 'unknown'
      };
    }
  }

  calculateLatticeHealth(nodeCount, connectionCount) {
    const idealRatio = 3;
    const actualRatio = connectionCount / nodeCount;
    const efficiency = Math.min(actualRatio / idealRatio, 1) * 100;
    
    if (efficiency > 90) return 'excellent';
    if (efficiency > 75) return 'good';
    if (efficiency > 50) return 'fair';
    return 'needs_optimization';
  }

  async restructureLattice() {
    console.log('🔄 Initiating crystalline lattice restructuring...');
    const stats = await this.getLatticeStats();
    
    if (stats.latticeHealth === 'needs_optimization') {
      console.log('⚡ Optimizing lattice connections...');
      await this.optimizeConnections();
    }
    
    console.log('✅ Lattice restructuring complete');
    return await this.getLatticeStats();
  }

  async optimizeConnections() {
    const nodeIds = await this.redis.hVals(this.latticeKey);
    
    for (const nodeId of nodeIds) {
      const node = await this.getNode(nodeId);
      if (node && node.connections.length < 3) {
        await this.establishConnections(node.q, node.r, nodeId);
      }
    }
  }
}

module.exports = HexagonalLattice;