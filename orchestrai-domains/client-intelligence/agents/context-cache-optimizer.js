// Context Cache Optimizer Agent - Node.js Coordination Agent
// Optimizes client context storage and retrieval performance

const EventEmitter = require('events');

class ContextCacheOptimizer extends EventEmitter {
  constructor(clientIntelligenceHub, orchestrator, crystallineMemory) {
    super();
    
    this.clientIntelligenceHub = clientIntelligenceHub;
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    
    this.agentId = 'context-cache-optimizer';
    this.status = 'initializing';
    
    // Cache management
    this.contextCache = new Map();
    this.cacheHitCounts = new Map();
    this.cacheAccessTimes = new Map();
    
    // Performance metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalRequests: 0,
      averageRetrievalTime: 0,
      cacheOptimizations: 0,
      memoryUsage: 0,
      lastOptimization: null
    };
    
    // Cache configuration
    this.cacheConfig = {
      maxCacheSize: 100, // Maximum number of cached context profiles
      ttl: 30 * 60 * 1000, // 30 minutes TTL
      optimizationInterval: 5 * 60 * 1000, // 5 minutes
      preloadPopularContexts: true,
      compressionEnabled: true
    };
  }

  async initialize() {
    try {
      console.log('⚡ Initializing Context Cache Optimizer...');
      
      // Setup cache optimization interval
      this.optimizationTimer = setInterval(() => {
        this.performCacheOptimization();
      }, this.cacheConfig.optimizationInterval);
      
      // Setup event listeners for cache management
      this.setupEventListeners();
      
      // Preload popular client contexts if enabled
      if (this.cacheConfig.preloadPopularContexts) {
        await this.preloadPopularContexts();
      }
      
      this.status = 'active';
      console.log('✅ Context Cache Optimizer initialized and ready');
      
    } catch (error) {
      console.error('❌ Context Cache Optimizer initialization failed:', error);
      this.status = 'error';
    }
  }

  setupEventListeners() {
    // Listen for client context requests
    this.clientIntelligenceHub.on('contextRequested', async (event) => {
      await this.handleContextRequest(event.clientId, event.requestType);
    });
    
    // Listen for context updates
    this.clientIntelligenceHub.on('clientContextUpdated', async (event) => {
      await this.invalidateCache(event.clientId, event.contextType);
    });
    
    // Listen for new client creation
    this.clientIntelligenceHub.on('clientCreated', async (event) => {
      await this.preloadClientContext(event.clientId);
    });
  }

  async handleContextRequest(clientId, requestType = 'full') {
    try {
      const startTime = Date.now();
      this.metrics.totalRequests++;
      
      // Check cache first
      const cacheKey = `${clientId}-${requestType}`;
      const cachedContext = this.getFromCache(cacheKey);
      
      if (cachedContext) {
        this.metrics.cacheHits++;
        this.recordCacheAccess(cacheKey);
        
        const retrievalTime = Date.now() - startTime;
        this.updateAverageRetrievalTime(retrievalTime);
        
        return cachedContext;
      }
      
      // Cache miss - retrieve from crystalline memory
      this.metrics.cacheMisses++;
      const context = await this.retrieveContextFromMemory(clientId, requestType);
      
      // Store in cache
      if (context) {
        this.storeInCache(cacheKey, context);
      }
      
      const retrievalTime = Date.now() - startTime;
      this.updateAverageRetrievalTime(retrievalTime);
      
      return context;
      
    } catch (error) {
      console.error(`❌ Error handling context request for ${clientId}:`, error);
      throw error;
    }
  }

  getFromCache(cacheKey) {
    const cacheEntry = this.contextCache.get(cacheKey);
    
    if (!cacheEntry) {
      return null;
    }
    
    // Check TTL
    if (Date.now() - cacheEntry.timestamp > this.cacheConfig.ttl) {
      this.contextCache.delete(cacheKey);
      this.cacheHitCounts.delete(cacheKey);
      this.cacheAccessTimes.delete(cacheKey);
      return null;
    }
    
    return this.decompressContext(cacheEntry.data);
  }

  storeInCache(cacheKey, context) {
    try {
      // Implement cache size limit
      if (this.contextCache.size >= this.cacheConfig.maxCacheSize) {
        this.evictLeastRecentlyUsed();
      }
      
      const compressedContext = this.compressContext(context);
      
      this.contextCache.set(cacheKey, {
        data: compressedContext,
        timestamp: Date.now(),
        size: JSON.stringify(compressedContext).length
      });
      
      this.cacheHitCounts.set(cacheKey, 0);
      this.cacheAccessTimes.set(cacheKey, Date.now());
      
      this.updateMemoryUsage();
      
    } catch (error) {
      console.error(`❌ Error storing in cache:`, error);
    }
  }

  recordCacheAccess(cacheKey) {
    const currentCount = this.cacheHitCounts.get(cacheKey) || 0;
    this.cacheHitCounts.set(cacheKey, currentCount + 1);
    this.cacheAccessTimes.set(cacheKey, Date.now());
  }

  evictLeastRecentlyUsed() {
    let lruKey = null;
    let oldestTime = Date.now();
    
    for (const [key, accessTime] of this.cacheAccessTimes) {
      if (accessTime < oldestTime) {
        oldestTime = accessTime;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.contextCache.delete(lruKey);
      this.cacheHitCounts.delete(lruKey);
      this.cacheAccessTimes.delete(lruKey);
    }
  }

  compressContext(context) {
    if (!this.cacheConfig.compressionEnabled) {
      return context;
    }
    
    try {
      // Simple compression strategy - remove unnecessary whitespace and optimize structure
      const optimizedContext = {
        ...context,
        _compressed: true,
        _timestamp: Date.now()
      };
      
      return optimizedContext;
      
    } catch (error) {
      console.error('❌ Context compression failed:', error);
      return context;
    }
  }

  decompressContext(compressedContext) {
    if (!compressedContext._compressed) {
      return compressedContext;
    }
    
    try {
      const { _compressed, _timestamp, ...context } = compressedContext;
      return context;
      
    } catch (error) {
      console.error('❌ Context decompression failed:', error);
      return compressedContext;
    }
  }

  async retrieveContextFromMemory(clientId, requestType) {
    try {
      // Retrieve from crystalline memory based on request type
      const contextKeys = {
        'full': [`client-${clientId}-integrated`],
        'branding': [`client-${clientId}-branding`],
        'icp': [`client-${clientId}-icp`],
        'business': [`client-${clientId}-business`],
        'market': [`client-${clientId}-market`]
      };
      
      const keys = contextKeys[requestType] || contextKeys['full'];
      const contexts = {};
      
      for (const key of keys) {
        try {
          const context = await this.crystallineMemory.retrieveMemory(key);
          if (context) {
            contexts[key] = context;
          }
        } catch (error) {
          console.warn(`⚠️ Could not retrieve context ${key}:`, error.message);
        }
      }
      
      return Object.keys(contexts).length > 0 ? contexts : null;
      
    } catch (error) {
      console.error(`❌ Error retrieving context from memory:`, error);
      throw error;
    }
  }

  async invalidateCache(clientId, contextType = null) {
    try {
      const keysToInvalidate = [];
      
      if (contextType) {
        // Invalidate specific context type
        keysToInvalidate.push(`${clientId}-${contextType}`);
      } else {
        // Invalidate all contexts for this client
        for (const key of this.contextCache.keys()) {
          if (key.startsWith(`${clientId}-`)) {
            keysToInvalidate.push(key);
          }
        }
      }
      
      for (const key of keysToInvalidate) {
        this.contextCache.delete(key);
        this.cacheHitCounts.delete(key);
        this.cacheAccessTimes.delete(key);
      }
      
      console.log(`🔄 Invalidated ${keysToInvalidate.length} cache entries for client ${clientId}`);
      this.updateMemoryUsage();
      
    } catch (error) {
      console.error(`❌ Error invalidating cache:`, error);
    }
  }

  async preloadPopularContexts() {
    try {
      console.log('🔄 Preloading popular client contexts...');
      
      // This would normally query usage analytics to identify popular contexts
      // For now, we'll implement a basic preloading strategy
      
      const popularClients = await this.identifyPopularClients();
      
      for (const clientId of popularClients) {
        await this.preloadClientContext(clientId);
      }
      
      console.log(`✅ Preloaded contexts for ${popularClients.length} popular clients`);
      
    } catch (error) {
      console.error('❌ Error preloading popular contexts:', error);
    }
  }

  async preloadClientContext(clientId) {
    try {
      // Preload the most commonly requested context types
      const contextTypes = ['full', 'branding', 'icp'];
      
      for (const contextType of contextTypes) {
        await this.handleContextRequest(clientId, contextType);
      }
      
    } catch (error) {
      console.error(`❌ Error preloading context for client ${clientId}:`, error);
    }
  }

  async identifyPopularClients() {
    try {
      // This would normally analyze usage patterns
      // For now, return active clients from crystalline memory
      
      const clients = [];
      // Implementation would query actual client usage data
      
      return clients.slice(0, 10); // Top 10 most active clients
      
    } catch (error) {
      console.error('❌ Error identifying popular clients:', error);
      return [];
    }
  }

  performCacheOptimization() {
    try {
      console.log('🔧 Performing cache optimization...');
      
      // Remove expired entries
      this.cleanupExpiredEntries();
      
      // Optimize memory usage
      this.optimizeMemoryUsage();
      
      // Update metrics
      this.metrics.cacheOptimizations++;
      this.metrics.lastOptimization = new Date().toISOString();
      
      const cacheHitRate = this.metrics.totalRequests > 0 
        ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2)
        : 0;
      
      console.log(`✅ Cache optimization complete - Hit rate: ${cacheHitRate}%`);
      
    } catch (error) {
      console.error('❌ Cache optimization failed:', error);
    }
  }

  cleanupExpiredEntries() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, entry] of this.contextCache) {
      if (now - entry.timestamp > this.cacheConfig.ttl) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.contextCache.delete(key);
      this.cacheHitCounts.delete(key);
      this.cacheAccessTimes.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      console.log(`🗑️ Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  optimizeMemoryUsage() {
    // Implement memory-based eviction if cache is using too much memory
    const maxMemoryMB = 100; // 100MB limit
    const currentMemoryMB = this.metrics.memoryUsage / (1024 * 1024);
    
    if (currentMemoryMB > maxMemoryMB) {
      const entriesToEvict = Math.ceil(this.contextCache.size * 0.2); // Evict 20%
      
      for (let i = 0; i < entriesToEvict; i++) {
        this.evictLeastRecentlyUsed();
      }
      
      console.log(`📉 Evicted ${entriesToEvict} entries to optimize memory usage`);
    }
  }

  updateAverageRetrievalTime(retrievalTime) {
    const currentAvg = this.metrics.averageRetrievalTime;
    const totalRequests = this.metrics.totalRequests;
    
    this.metrics.averageRetrievalTime = 
      ((currentAvg * (totalRequests - 1)) + retrievalTime) / totalRequests;
  }

  updateMemoryUsage() {
    let totalSize = 0;
    
    for (const entry of this.contextCache.values()) {
      totalSize += entry.size || 0;
    }
    
    this.metrics.memoryUsage = totalSize;
  }

  // Status and health methods
  getStatus() {
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2)
      : 0;
    
    return {
      agentId: this.agentId,
      status: this.status,
      metrics: {
        ...this.metrics,
        cacheHitRate: `${cacheHitRate}%`,
        cacheSize: this.contextCache.size,
        memoryUsageMB: (this.metrics.memoryUsage / (1024 * 1024)).toFixed(2)
      },
      cacheConfig: this.cacheConfig
    };
  }

  async shutdown() {
    try {
      console.log('🔄 Shutting down Context Cache Optimizer...');
      
      if (this.optimizationTimer) {
        clearInterval(this.optimizationTimer);
      }
      
      // Clear all caches
      this.contextCache.clear();
      this.cacheHitCounts.clear();
      this.cacheAccessTimes.clear();
      
      this.status = 'shutdown';
      console.log('✅ Context Cache Optimizer shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during Context Cache Optimizer shutdown:', error);
    }
  }
}

module.exports = ContextCacheOptimizer;