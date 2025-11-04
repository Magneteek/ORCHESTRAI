/**
 * Redis Client for caching and queue management
 */

import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || process.env.BULLMQ_REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || process.env.BULLMQ_REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
};

// Create Redis client instance
export const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('ready', () => {
  console.log('Redis client ready');
});

redis.on('error', (error) => {
  console.error('Redis client error:', error);
});

redis.on('close', () => {
  console.log('Redis client connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

// Initialize connection
redis.connect().catch((error) => {
  console.error('Failed to connect to Redis:', error);
});

/**
 * Cache utilities with TTL support
 */
export class RedisCache {
  /**
   * Set a value with optional TTL (in seconds)
   */
  static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  }

  /**
   * Get a value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Failed to parse cached value:', error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  static async delete(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on existing key
   */
  static async expire(key: string, ttlSeconds: number): Promise<void> {
    await redis.expire(key, ttlSeconds);
  }

  /**
   * Get TTL for a key
   */
  static async ttl(key: string): Promise<number> {
    return await redis.ttl(key);
  }

  /**
   * Delete keys matching pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    const keys = await redis.keys(pattern);

    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  }

  /**
   * Increment a counter
   */
  static async increment(key: string, by: number = 1): Promise<number> {
    return await redis.incrby(key, by);
  }

  /**
   * Decrement a counter
   */
  static async decrement(key: string, by: number = 1): Promise<number> {
    return await redis.decrby(key, by);
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  /**
   * Check if request is within rate limit
   * @param key - Unique identifier for rate limit (e.g., userId, IP)
   * @param maxRequests - Maximum requests allowed
   * @param windowSeconds - Time window in seconds
   */
  static async checkLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const redisKey = `ratelimit:${key}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    // Remove old entries
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // Count requests in current window
    const count = await redis.zcard(redisKey);

    if (count >= maxRequests) {
      // Get oldest timestamp to calculate reset time
      const oldest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
      const resetAt = oldest.length > 0
        ? parseInt(oldest[1]) + (windowSeconds * 1000)
        : now + (windowSeconds * 1000);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(redisKey, now, `${now}`);
    await redis.expire(redisKey, windowSeconds);

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetAt: now + (windowSeconds * 1000),
    };
  }

  /**
   * Reset rate limit for a key
   */
  static async reset(key: string): Promise<void> {
    await redis.del(`ratelimit:${key}`);
  }
}

/**
 * Session management utilities
 */
export class SessionManager {
  private static readonly PREFIX = 'session:';

  /**
   * Store session data
   */
  static async set(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    const key = `${this.PREFIX}${sessionId}`;
    await RedisCache.set(key, data, ttlSeconds);
  }

  /**
   * Get session data
   */
  static async get<T>(sessionId: string): Promise<T | null> {
    const key = `${this.PREFIX}${sessionId}`;
    return await RedisCache.get<T>(key);
  }

  /**
   * Delete session
   */
  static async delete(sessionId: string): Promise<void> {
    const key = `${this.PREFIX}${sessionId}`;
    await RedisCache.delete(key);
  }

  /**
   * Refresh session TTL
   */
  static async refresh(sessionId: string, ttlSeconds: number = 3600): Promise<void> {
    const key = `${this.PREFIX}${sessionId}`;
    await RedisCache.expire(key, ttlSeconds);
  }
}

/**
 * Graceful shutdown
 */
export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  console.log('Redis client disconnected');
}

process.on('SIGTERM', async () => {
  await disconnectRedis();
});

process.on('SIGINT', async () => {
  await disconnectRedis();
});

export default redis;
