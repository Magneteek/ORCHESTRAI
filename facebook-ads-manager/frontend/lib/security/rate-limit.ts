/**
 * API Rate Limiting
 *
 * Redis-based rate limiting for API endpoints
 */

import { Redis } from 'ioredis';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp when limit resets
  retryAfter?: number; // Seconds until retry (if rate limited)
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  keyPrefix: 'ratelimit',
};

/**
 * Rate limiter class
 */
export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: Partial<RateLimitConfig> = {}) {
    this.redis = redis;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if request is rate limited
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Use Lua script for atomic operations
      const result = await this.redis.eval(
        `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local max = tonumber(ARGV[3])
        local windowStart = now - window

        -- Remove old entries
        redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

        -- Count current requests
        local current = redis.call('ZCARD', key)

        if current < max then
          -- Add new request
          redis.call('ZADD', key, now, now)
          redis.call('PEXPIRE', key, window)
          return {1, max - current - 1, window}
        else
          -- Rate limited
          local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')[2]
          local resetTime = tonumber(oldest) + window
          return {0, 0, resetTime - now}
        end
        `,
        1,
        key,
        now.toString(),
        this.config.windowMs.toString(),
        this.config.maxRequests.toString()
      ) as [number, number, number];

      const [allowed, remaining, resetOrRetry] = result;

      if (allowed === 1) {
        return {
          success: true,
          limit: this.config.maxRequests,
          remaining,
          reset: Math.floor((now + this.config.windowMs) / 1000),
        };
      } else {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset: Math.floor((now + resetOrRetry) / 1000),
          retryAfter: Math.ceil(resetOrRetry / 1000),
        };
      }
    } catch (error) {
      console.error('[Rate Limiter] Error checking limit:', error);
      // Fail open - allow request if Redis fails
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: Math.floor((now + this.config.windowMs) / 1000),
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    await this.redis.del(key);
  }

  /**
   * Get current usage for identifier
   */
  async getUsage(identifier: string): Promise<{ count: number; limit: number }> {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    await this.redis.zremrangebyscore(key, 0, windowStart);
    const count = await this.redis.zcard(key);

    return {
      count,
      limit: this.config.maxRequests,
    };
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints (stricter limits)
  auth: {
    login: { windowMs: 900000, maxRequests: 5 }, // 5 attempts per 15 minutes
    register: { windowMs: 3600000, maxRequests: 3 }, // 3 attempts per hour
    passwordReset: { windowMs: 3600000, maxRequests: 3 }, // 3 attempts per hour
  },

  // API endpoints (standard limits)
  api: {
    campaigns: { windowMs: 60000, maxRequests: 100 }, // 100 per minute
    templates: { windowMs: 60000, maxRequests: 100 },
    analytics: { windowMs: 60000, maxRequests: 50 }, // Lower for expensive queries
    ai: { windowMs: 60000, maxRequests: 20 }, // Lower for AI endpoints
  },

  // Public endpoints (more permissive)
  public: {
    default: { windowMs: 60000, maxRequests: 200 },
  },
};

/**
 * Get identifier from request
 */
export function getIdentifier(req: Request): string {
  // Try to get user ID from session
  const userId = (req as any).auth?.user?.id;
  if (userId) return `user:${userId}`;

  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult) {
  const headers = new Headers({
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  });

  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers),
      },
    }
  );
}
