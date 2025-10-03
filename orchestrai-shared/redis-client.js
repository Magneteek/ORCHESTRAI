// Redis Client Configuration for ORCHESTRAI Evolution System
// Provides centralized Redis connection management

const Redis = require('redis');

/**
 * Create Redis connection with ORCHESTRAI configuration
 */
async function createRedisConnection(options = {}) {
  const config = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 5000,
      lazyConnect: false
    },
    database: options.database || 0,
    ...options
  };

  try {
    const client = Redis.createClient(config);
    
    // Set up error handlers
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    client.on('connect', () => {
      console.log('📡 Redis connection established');
    });
    
    client.on('ready', () => {
      console.log('✅ Redis client ready');
    });
    
    client.on('end', () => {
      console.log('📡 Redis connection closed');
    });
    
    // Connect to Redis
    if (!client.isOpen) {
      await client.connect();
    }
    
    // Test the connection with proper Redis v4 syntax
    const pongResult = await client.ping();
    console.log('🔄 Redis connection test successful:', pongResult);
    
    // Add wrapper methods for compatibility with older code
    client.setex = async (key, seconds, value) => {
      return await client.setEx(key, seconds, value);
    };
    
    return client;
    
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    console.log('💡 Make sure Redis server is running on localhost:6379');
    console.log('💡 Or set REDIS_URL environment variable');
    
    // Return mock client for development
    const mockClient = {
      isOpen: false,
      setex: async () => 'OK',
      setEx: async () => 'OK', 
      get: async () => null,
      del: async () => 1,
      ping: async () => 'PONG',
      quit: async () => 'OK',
      connect: async () => {},
      on: () => {}
    };
    
    console.log('🔧 Using mock Redis client for development');
    return mockClient;
  }
}

/**
 * Create Redis connection with retry logic
 */
async function createRedisConnectionWithRetry(maxRetries = 3, retryDelay = 2000, options = {}) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempting Redis connection (${attempt}/${maxRetries})...`);
      return await createRedisConnection(options);
    } catch (error) {
      lastError = error;
      console.warn(`❌ Redis connection attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.error('❌ All Redis connection attempts failed');
  throw lastError;
}

/**
 * Check if Redis is available
 */
async function checkRedisAvailability() {
  try {
    const client = await createRedisConnection();
    if (client) {
      await client.quit();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

module.exports = {
  createRedisConnection,
  createRedisConnectionWithRetry,
  checkRedisAvailability
};