/**
 * Facebook Marketing API - Main Export
 * Central access point for all Facebook API functionality
 */

import Redis from 'ioredis';
import { FacebookClient, createFacebookClient, createFacebookClientFromEnv } from './client';
import { FacebookOAuth, createOAuthFromEnv } from './oauth';
import { FacebookRateLimiter, createRateLimiter } from './rate-limiter';

// Sync services
import { BusinessAccountsSync } from './sync/business-accounts';
import { AdAccountsSync } from './sync/ad-accounts';
import { CampaignsSync } from './sync/campaigns';
import { AdSetsSync } from './sync/ad-sets';
import { AdsSync } from './sync/ads';
import { InsightsSync } from './sync/insights';

// Campaign management
import { CampaignCreator } from './campaigns/create';
import { CampaignUpdater } from './campaigns/update';
import { CampaignStatusManager } from './campaigns/status';

// Ad set management
import { AdSetCreator } from './ad-sets/create';

// Ad management
import { AdCreator } from './ads/create';

// Error handling
export * from './errors';

// Types
export * from '@/types/facebook';

/**
 * Facebook API Service
 * Main service class that provides access to all Facebook API functionality
 */
export class FacebookAPI {
  public client: FacebookClient;
  public oauth: FacebookOAuth;
  public rateLimiter: FacebookRateLimiter;

  // Sync services
  public businesses: BusinessAccountsSync;
  public adAccounts: AdAccountsSync;
  public campaigns: CampaignsSync;
  public adSets: AdSetsSync;
  public ads: AdsSync;
  public insights: InsightsSync;

  // Campaign management
  public campaignCreator: CampaignCreator;
  public campaignUpdater: CampaignUpdater;
  public campaignStatus: CampaignStatusManager;

  // Ad set management
  public adSetCreator: AdSetCreator;

  // Ad management
  public adCreator: AdCreator;

  constructor(client: FacebookClient, oauth: FacebookOAuth) {
    this.client = client;
    this.oauth = oauth;
    this.rateLimiter = client.getRateLimiter();

    // Initialize sync services
    this.businesses = new BusinessAccountsSync(client);
    this.adAccounts = new AdAccountsSync(client);
    this.campaigns = new CampaignsSync(client);
    this.adSets = new AdSetsSync(client);
    this.ads = new AdsSync(client);
    this.insights = new InsightsSync(client);

    // Initialize campaign management
    this.campaignCreator = new CampaignCreator(client);
    this.campaignUpdater = new CampaignUpdater(client);
    this.campaignStatus = new CampaignStatusManager(client);

    // Initialize ad set management
    this.adSetCreator = new AdSetCreator(client);

    // Initialize ad management
    this.adCreator = new AdCreator(client);
  }

  /**
   * Set access token for API calls
   */
  setAccessToken(accessToken: string): void {
    this.client.setAccessToken(accessToken);
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; userId?: string; error?: string }> {
    return this.client.testConnection();
  }

  /**
   * Get debug token information
   */
  async getTokenInfo(token?: string) {
    return this.client.getDebugToken(token);
  }

  /**
   * Get rate limit status for ad account
   */
  async getRateLimitStatus(adAccountId: string) {
    return this.rateLimiter.getRateLimitUsage(adAccountId);
  }

  /**
   * Get all rate limits (admin)
   */
  async getAllRateLimits() {
    return this.rateLimiter.getAllRateLimits();
  }
}

/**
 * Create Facebook API instance from environment variables
 */
export function createFacebookAPI(redis: Redis): FacebookAPI {
  const client = createFacebookClientFromEnv(redis);
  const oauth = createOAuthFromEnv();

  return new FacebookAPI(client, oauth);
}

/**
 * Create Facebook API instance with custom configuration
 */
export function createFacebookAPIWithConfig(
  config: {
    appId: string;
    appSecret: string;
    apiVersion: string;
    accessToken?: string;
    redirectUri?: string;
  },
  redis: Redis
): FacebookAPI {
  const client = createFacebookClient(
    {
      appId: config.appId,
      appSecret: config.appSecret,
      apiVersion: config.apiVersion,
      accessToken: config.accessToken,
    },
    redis
  );

  const oauth = new FacebookOAuth({
    appId: config.appId,
    appSecret: config.appSecret,
    apiVersion: config.apiVersion,
    redirectUri: config.redirectUri || `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook`,
  });

  return new FacebookAPI(client, oauth);
}

// Export individual components for advanced usage
export {
  FacebookClient,
  FacebookOAuth,
  FacebookRateLimiter,
  createFacebookClient,
  createFacebookClientFromEnv,
  createOAuthFromEnv,
  createRateLimiter,
  BusinessAccountsSync,
  AdAccountsSync,
  CampaignsSync,
  AdSetsSync,
  AdsSync,
  InsightsSync,
  CampaignCreator,
  CampaignUpdater,
  CampaignStatusManager,
  AdSetCreator,
  AdCreator,
};

/**
 * Singleton instance for convenience
 * Usage: import { facebookAPI } from '@/lib/facebook'
 */
let _facebookAPIInstance: FacebookAPI | null = null;

export function getFacebookAPI(redis?: Redis): FacebookAPI {
  if (!_facebookAPIInstance) {
    if (!redis) {
      throw new Error('Redis instance required to initialize Facebook API');
    }
    _facebookAPIInstance = createFacebookAPI(redis);
  }

  return _facebookAPIInstance;
}

export function resetFacebookAPI(): void {
  _facebookAPIInstance = null;
}

// Default export
export default FacebookAPI;
