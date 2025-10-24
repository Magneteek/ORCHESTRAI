/**
 * Facebook API Rate Limiter
 * Redis-based rate limiting for Facebook Marketing API
 */

import Redis from 'ioredis';
import { RateLimiterConfig, RateLimitInfo } from '@/types/facebook';
import { FacebookRateLimitError, FacebookErrorLogger } from './errors';

export class FacebookRateLimiter {
  private redis: Redis;
  private config: RateLimiterConfig;

  constructor(redis: Redis, config?: Partial<RateLimiterConfig>) {
    this.redis = redis;
    this.config = {
      maxCallsPerHour: config?.maxCallsPerHour || 200,
      maxCallsPerAccount: config?.maxCallsPerAccount || 200,
      batchSize: config?.batchSize || 50,
      retryAttempts: config?.retryAttempts || 3,
      retryDelayMs: config?.retryDelayMs || 1000,
      backoffMultiplier: config?.backoffMultiplier || 2,
    };
  }

  /**
   * Check if request is allowed for ad account
   */
  async checkRateLimit(adAccountId: string): Promise<boolean> {
    const key = this.getRateLimitKey(adAccountId);
    const count = await this.redis.get(key);

    if (!count) {
      return true;
    }

    const currentCount = parseInt(count, 10);
    return currentCount < this.config.maxCallsPerAccount;
  }

  /**
   * Increment rate limit counter for ad account
   */
  async incrementRateLimit(adAccountId: string): Promise<number> {
    const key = this.getRateLimitKey(adAccountId);
    const ttl = 3600; // 1 hour in seconds

    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttl);

    const results = await pipeline.exec();

    if (!results || !results[0] || results[0][0]) {
      throw new Error('Failed to increment rate limit counter');
    }

    return results[0][1] as number;
  }

  /**
   * Get current rate limit usage for ad account
   */
  async getRateLimitUsage(adAccountId: string): Promise<{
    current: number;
    limit: number;
    remaining: number;
    resetAt: number;
  }> {
    const key = this.getRateLimitKey(adAccountId);
    const [count, ttl] = await Promise.all([
      this.redis.get(key),
      this.redis.ttl(key),
    ]);

    const current = count ? parseInt(count, 10) : 0;
    const limit = this.config.maxCallsPerAccount;
    const remaining = Math.max(0, limit - current);
    const resetAt = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + 3600000;

    return {
      current,
      limit,
      remaining,
      resetAt,
    };
  }

  /**
   * Wait for rate limit to allow request
   */
  async waitForRateLimit(adAccountId: string, maxWaitMs: number = 60000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const allowed = await this.checkRateLimit(adAccountId);

      if (allowed) {
        return;
      }

      // Wait before checking again
      const usage = await this.getRateLimitUsage(adAccountId);
      const waitTime = Math.min(
        Math.max(1000, usage.resetAt - Date.now()),
        maxWaitMs - (Date.now() - startTime)
      );

      if (waitTime > 0) {
        FacebookErrorLogger.warn('Rate limit reached, waiting...', {
          adAccountId,
          usage,
          waitTimeMs: waitTime,
        });

        await this.sleep(waitTime);
      }
    }

    throw new Error(`Rate limit wait timeout after ${maxWaitMs}ms`);
  }

  /**
   * Store rate limit info from API response headers
   */
  async storeRateLimitInfo(
    adAccountId: string,
    rateLimitInfo: RateLimitInfo
  ): Promise<void> {
    const key = this.getRateLimitInfoKey(adAccountId);
    const ttl = 3600; // 1 hour

    await this.redis.setex(
      key,
      ttl,
      JSON.stringify({
        ...rateLimitInfo,
        timestamp: Date.now(),
      })
    );
  }

  /**
   * Get stored rate limit info
   */
  async getRateLimitInfo(adAccountId: string): Promise<RateLimitInfo | null> {
    const key = this.getRateLimitInfoKey(adAccountId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      FacebookErrorLogger.warn('Failed to parse rate limit info', { error });
      return null;
    }
  }

  /**
   * Check if account is currently throttled
   */
  async isThrottled(adAccountId: string): Promise<boolean> {
    const info = await this.getRateLimitInfo(adAccountId);

    if (!info || !info.estimated_time_to_regain_access) {
      return false;
    }

    const throttledUntil = (info as any).timestamp + (info.estimated_time_to_regain_access * 1000);
    return Date.now() < throttledUntil;
  }

  /**
   * Get time until throttle is lifted
   */
  async getThrottleWaitTime(adAccountId: string): Promise<number> {
    const info = await this.getRateLimitInfo(adAccountId);

    if (!info || !info.estimated_time_to_regain_access) {
      return 0;
    }

    const throttledUntil = (info as any).timestamp + (info.estimated_time_to_regain_access * 1000);
    return Math.max(0, throttledUntil - Date.now());
  }

  /**
   * Reset rate limit for ad account (admin function)
   */
  async resetRateLimit(adAccountId: string): Promise<void> {
    const keys = [
      this.getRateLimitKey(adAccountId),
      this.getRateLimitInfoKey(adAccountId),
    ];

    await this.redis.del(...keys);
    FacebookErrorLogger.info('Rate limit reset', { adAccountId });
  }

  /**
   * Execute function with rate limiting
   */
  async executeWithRateLimit<T>(
    adAccountId: string,
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      maxWaitMs?: number;
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? this.config.retryAttempts;
    const maxWaitMs = options?.maxWaitMs ?? 60000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check if throttled
        const throttled = await this.isThrottled(adAccountId);
        if (throttled) {
          const waitTime = await this.getThrottleWaitTime(adAccountId);

          if (waitTime > maxWaitMs) {
            throw new Error(`Account throttled for ${waitTime}ms, exceeds max wait time`);
          }

          FacebookErrorLogger.warn('Account throttled, waiting...', {
            adAccountId,
            waitTimeMs: waitTime,
          });

          await this.sleep(waitTime);
        }

        // Wait for rate limit if needed
        await this.waitForRateLimit(adAccountId, maxWaitMs);

        // Increment counter before making request
        await this.incrementRateLimit(adAccountId);

        // Execute function
        return await fn();

      } catch (error) {
        if (error instanceof FacebookRateLimitError) {
          // Store rate limit info
          if (error.rateLimitInfo) {
            await this.storeRateLimitInfo(adAccountId, error.rateLimitInfo);
          }

          // Retry if not last attempt
          if (attempt < maxRetries) {
            const delay = error.getBackoffDelay(this.config.retryDelayMs, attempt);

            FacebookErrorLogger.warn('Rate limit error, retrying...', {
              adAccountId,
              attempt,
              maxRetries,
              delayMs: delay,
            });

            await this.sleep(delay);
            continue;
          }
        }

        // Rethrow if not retryable or max retries reached
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Batch requests to optimize rate limit usage
   */
  async batchRequests<T, R>(
    adAccountId: string,
    items: T[],
    processFn: (batch: T[]) => Promise<R[]>,
    options?: {
      batchSize?: number;
      delayBetweenBatches?: number;
    }
  ): Promise<R[]> {
    const batchSize = options?.batchSize ?? this.config.batchSize;
    const delay = options?.delayBetweenBatches ?? 100;
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await this.executeWithRateLimit(
        adAccountId,
        () => processFn(batch)
      );

      results.push(...batchResults);

      // Small delay between batches to be nice to API
      if (i + batchSize < items.length) {
        await this.sleep(delay);
      }
    }

    return results;
  }

  /**
   * Get all rate limit stats (admin function)
   */
  async getAllRateLimits(): Promise<Array<{
    adAccountId: string;
    usage: Awaited<ReturnType<FacebookRateLimiter['getRateLimitUsage']>>;
    info: RateLimitInfo | null;
  }>> {
    const pattern = 'facebook:ratelimit:*';
    const keys = await this.redis.keys(pattern);

    const accountIds = keys
      .map(key => key.replace('facebook:ratelimit:', ''))
      .filter(id => !id.endsWith(':info'));

    const stats = await Promise.all(
      accountIds.map(async (adAccountId) => ({
        adAccountId,
        usage: await this.getRateLimitUsage(adAccountId),
        info: await this.getRateLimitInfo(adAccountId),
      }))
    );

    return stats;
  }

  /**
   * Helper: Get rate limit key for ad account
   */
  private getRateLimitKey(adAccountId: string): string {
    return `facebook:ratelimit:${adAccountId}`;
  }

  /**
   * Helper: Get rate limit info key for ad account
   */
  private getRateLimitInfoKey(adAccountId: string): string {
    return `facebook:ratelimit:${adAccountId}:info`;
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(
  redis: Redis,
  config?: Partial<RateLimiterConfig>
): FacebookRateLimiter {
  return new FacebookRateLimiter(redis, config);
}
