/**
 * Facebook Marketing API Client
 * Main client wrapper for facebook-nodejs-business-sdk
 */

import * as bizSdk from 'facebook-nodejs-business-sdk';
import Redis from 'ioredis';
import {
  FacebookClientConfig,
  FacebookAPIError,
  RateLimitInfo,
  BatchRequest,
  BatchResponse,
} from '@/types/facebook';
import {
  FacebookError,
  FacebookErrorFactory,
  FacebookErrorLogger,
  FacebookNetworkError,
} from './errors';
import { FacebookRateLimiter } from './rate-limiter';

// SDK exports
const { FacebookAdsApi } = bizSdk;

/**
 * Facebook Marketing API Client
 */
export class FacebookClient {
  private api: typeof FacebookAdsApi;
  private config: FacebookClientConfig;
  private rateLimiter: FacebookRateLimiter;
  private redis: Redis;

  constructor(
    config: FacebookClientConfig,
    redis: Redis,
    rateLimiter?: FacebookRateLimiter
  ) {
    this.config = config;
    this.redis = redis;

    // Initialize Facebook Ads API
    this.api = FacebookAdsApi.init(config.accessToken || '');
    this.api.setDebug(config.debug || false);

    // Set API version
    if (config.apiVersion) {
      (this.api as any).version = config.apiVersion;
    }

    // Initialize rate limiter
    this.rateLimiter = rateLimiter || new FacebookRateLimiter(redis);

    FacebookErrorLogger.info('Facebook client initialized', {
      apiVersion: config.apiVersion,
      hasAccessToken: !!config.accessToken,
    });
  }

  /**
   * Update access token
   */
  setAccessToken(accessToken: string): void {
    this.config.accessToken = accessToken;
    this.api = FacebookAdsApi.init(accessToken);

    if (this.config.apiVersion) {
      (this.api as any).version = this.config.apiVersion;
    }

    FacebookErrorLogger.info('Access token updated');
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | undefined {
    return this.config.accessToken;
  }

  /**
   * Get API version
   */
  getApiVersion(): string {
    return this.config.apiVersion;
  }

  /**
   * Make API request with error handling and rate limiting
   */
  async makeRequest<T>(
    adAccountId: string | null,
    requestFn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      skipRateLimit?: boolean;
    }
  ): Promise<T> {
    const accountId = adAccountId || 'global';

    // If rate limiting is enabled and we have an account ID
    if (!options?.skipRateLimit && adAccountId) {
      return this.rateLimiter.executeWithRateLimit(
        accountId,
        () => this.executeRequest(requestFn),
        { maxRetries: options?.maxRetries }
      );
    }

    // Execute without rate limiting
    return this.executeRequest(requestFn);
  }

  /**
   * Execute request with error handling
   */
  private async executeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Handle network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new FacebookNetworkError(
          'Failed to connect to Facebook API',
          error,
          error.code === 'ETIMEDOUT'
        );
      }

      // Parse Facebook API error
      const fbError = this.parseFacebookError(error);
      if (fbError) {
        throw fbError;
      }

      // Unknown error
      FacebookErrorLogger.log(error, { type: 'unknown_error' });
      throw error;
    }
  }

  /**
   * Parse Facebook API error from SDK error
   */
  private parseFacebookError(error: any): FacebookError | null {
    // Check if it's a Facebook API error response
    if (!error.response?.error) {
      return null;
    }

    const apiError: FacebookAPIError = error.response.error;

    // Extract rate limit info if available
    let rateLimitInfo: RateLimitInfo | undefined;
    if (error.response.headers) {
      rateLimitInfo = this.extractRateLimitInfo(error.response.headers);
    }

    // Create appropriate error type
    const fbError = FacebookErrorFactory.createError(apiError, { rateLimitInfo });

    FacebookErrorLogger.log(fbError, {
      endpoint: error.config?.url,
      method: error.config?.method,
    });

    return fbError;
  }

  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimitInfo(headers: Record<string, string>): RateLimitInfo | undefined {
    const businessUsage = headers['x-business-use-case-usage'];
    const adAccountUsage = headers['x-ad-account-rate-limit-usage'];
    const appUsage = headers['x-app-usage'];

    if (!businessUsage && !adAccountUsage && !appUsage) {
      return undefined;
    }

    try {
      // Parse business usage (most common)
      if (businessUsage) {
        const usage = JSON.parse(businessUsage);
        const accountId = Object.keys(usage)[0];
        if (accountId && usage[accountId]) {
          return usage[accountId][0] as RateLimitInfo;
        }
      }

      // Parse ad account usage
      if (adAccountUsage) {
        return JSON.parse(adAccountUsage) as RateLimitInfo;
      }

      // Parse app usage
      if (appUsage) {
        return JSON.parse(appUsage) as RateLimitInfo;
      }
    } catch (error) {
      FacebookErrorLogger.warn('Failed to parse rate limit headers', { error });
    }

    return undefined;
  }

  /**
   * Make batch API request
   */
  async makeBatchRequest(
    requests: BatchRequest[],
    adAccountId?: string
  ): Promise<BatchResponse[]> {
    if (requests.length === 0) {
      return [];
    }

    if (requests.length > 50) {
      throw new Error('Maximum 50 requests per batch');
    }

    return this.makeRequest(
      adAccountId || null,
      async () => {
        const response = await this.api.call(
          'POST',
          [''],
          {
            batch: requests.map(req => ({
              method: req.method,
              relative_url: req.relative_url,
              body: req.body,
              name: req.name,
              depends_on: req.depends_on,
              omit_response_on_success: req.omit_response_on_success,
            })),
          }
        );

        return response as BatchResponse[];
      }
    );
  }

  /**
   * Get data from cache or fetch from API
   */
  async getCached<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 900 // 15 minutes default
  ): Promise<{ data: T; fromCache: boolean }> {
    const cacheKey = `facebook:cache:${key}`;

    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached) as T;
        FacebookErrorLogger.info('Cache hit', { key });
        return { data, fromCache: true };
      } catch (error) {
        FacebookErrorLogger.warn('Failed to parse cached data', { key, error });
      }
    }

    // Fetch from API
    FacebookErrorLogger.info('Cache miss, fetching from API', { key });
    const data = await fetchFn();

    // Store in cache
    try {
      await this.redis.setex(cacheKey, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      FacebookErrorLogger.warn('Failed to cache data', { key, error });
    }

    return { data, fromCache: false };
  }

  /**
   * Invalidate cache for key
   */
  async invalidateCache(key: string): Promise<void> {
    const cacheKey = `facebook:cache:${key}`;
    await this.redis.del(cacheKey);
    FacebookErrorLogger.info('Cache invalidated', { key });
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateCachePattern(pattern: string): Promise<void> {
    const cachePattern = `facebook:cache:${pattern}`;
    const keys = await this.redis.keys(cachePattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      FacebookErrorLogger.info('Cache pattern invalidated', {
        pattern,
        keysDeleted: keys.length,
      });
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    userId?: string;
    error?: string;
  }> {
    try {
      const response = await this.makeRequest(
        null,
        () => this.api.call('GET', ['/me'], { fields: ['id', 'name'] }),
        { skipRateLimit: true }
      );

      return {
        success: true,
        userId: (response as any).id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get debug token info
   */
  async getDebugToken(token?: string): Promise<{
    isValid: boolean;
    appId: string;
    userId: string;
    scopes: string[];
    expiresAt: number;
    issuedAt: number;
    dataAccessExpiresAt: number;
  }> {
    const tokenToDebug = token || this.config.accessToken;

    if (!tokenToDebug) {
      throw new Error('No access token provided');
    }

    const response = await this.makeRequest(
      null,
      () =>
        this.api.call('GET', ['/debug_token'], {
          input_token: tokenToDebug,
        }),
      { skipRateLimit: true }
    );

    const data = (response as any).data;

    return {
      isValid: data.is_valid,
      appId: data.app_id,
      userId: data.user_id,
      scopes: data.scopes || [],
      expiresAt: data.expires_at,
      issuedAt: data.issued_at,
      dataAccessExpiresAt: data.data_access_expires_at,
    };
  }

  /**
   * Get rate limiter instance
   */
  getRateLimiter(): FacebookRateLimiter {
    return this.rateLimiter;
  }

  /**
   * Get Redis instance
   */
  getRedis(): Redis {
    return this.redis;
  }

  /**
   * Get SDK instance for advanced usage
   */
  getSdk() {
    return bizSdk;
  }
}

/**
 * Create Facebook client instance
 */
export function createFacebookClient(
  config: FacebookClientConfig,
  redis: Redis,
  rateLimiter?: FacebookRateLimiter
): FacebookClient {
  return new FacebookClient(config, redis, rateLimiter);
}

/**
 * Get Facebook client from environment variables
 */
export function createFacebookClientFromEnv(redis: Redis): FacebookClient {
  const config: FacebookClientConfig = {
    appId: process.env.FACEBOOK_APP_ID!,
    appSecret: process.env.FACEBOOK_APP_SECRET!,
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v22.0',
    debug: process.env.NODE_ENV === 'development',
  };

  if (!config.appId || !config.appSecret) {
    throw new Error('Facebook App ID and App Secret are required');
  }

  return createFacebookClient(config, redis);
}
