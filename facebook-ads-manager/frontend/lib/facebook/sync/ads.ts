/**
 * Ads Sync
 * Sync Facebook ads
 */

import { FacebookClient } from '../client';
import {
  FacebookAd,
  CampaignStatus,
  EffectiveStatus,
  SyncOptions,
  SyncResult,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export class AdsSync {
  constructor(private client: FacebookClient) {}

  /**
   * Sync ads for ad set
   */
  async syncAds(
    adSetId: string,
    adAccountId: string,
    options?: SyncOptions & { status?: CampaignStatus }
  ): Promise<SyncResult<FacebookAd>> {
    const cacheKey = `ads:adset:${adSetId}`;
    const ttl = 600; // 10 minutes

    try {
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAd[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          return {
            success: true,
            data: cached.data,
            syncedAt: Date.now(),
            fromCache: true,
          };
        }
      }

      FacebookErrorLogger.info('Fetching ads from API', { adSetId });


      const sdk = this.client.getSdk();

      const AdSet = sdk.AdSet;
      const adSet = new AdSet(adSetId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'campaign_id',
        'adset_id',
        'name',
        'status',
        'configured_status',
        'effective_status',
        'created_time',
        'updated_time',
        'creative',
        'tracking_specs',
        'conversion_specs',
        'adlabels',
        'preview_shareable_link',
      ];

      const params: any = {
        limit: options?.limit || 100,
      };

      if (options?.status) {
        params.filtering = [
          {
            field: 'status',
            operator: 'IN',
            value: [options.status],
          },
        ];
      }

      const response = await this.client.makeRequest(adAccountId, () =>
        adSet.getAds(fields, params)
      ) as any;


      const ads: FacebookAd[] = response.map((ad: any) => ({
        id: ad.id,
        accountId: ad.account_id,
        campaignId: ad.campaign_id,
        adsetId: ad.adset_id,
        name: ad.name,
        status: ad.status as CampaignStatus,
        configuredStatus: ad.configured_status as CampaignStatus,
        effectiveStatus: ad.effective_status as EffectiveStatus,
        createdTime: ad.created_time,
        updatedTime: ad.updated_time,
        creative: ad.creative,
        tracking_specs: ad.tracking_specs,
        conversion_specs: ad.conversion_specs,
        adlabels: ad.adlabels,
        preview_shareable_link: ad.preview_shareable_link,
      }));


      await this.client
        .getRedis()
        .setex(`facebook:cache:${cacheKey}`, ttl, JSON.stringify(ads));


      FacebookErrorLogger.info('Successfully synced ads', {
        adSetId,
        count: ads.length,
      });


      return {
        success: true,
        data: ads,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_ads',
        adSetId,
      });


      return {
        success: false,
        error: error,
        syncedAt: Date.now(),
        fromCache: false,
      };
    }
  }

  /**
   * Sync ads for campaign
   */
  async syncCampaignAds(
    campaignId: string,
    adAccountId: string,
    options?: SyncOptions
  ): Promise<SyncResult<FacebookAd>> {
    const cacheKey = `ads:campaign:${campaignId}`;
    const ttl = 600; // 10 minutes

    try {
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAd[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          return {
            success: true,
            data: cached.data,
            syncedAt: Date.now(),
            fromCache: true,
          };
        }
      }

      const sdk = this.client.getSdk();

      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'campaign_id',
        'adset_id',
        'name',
        'status',
        'configured_status',
        'effective_status',
        'created_time',
        'updated_time',
        'creative',
      ];

      const response = await this.client.makeRequest(adAccountId, () =>
        campaign.getAds(fields, { limit: options?.limit || 100 })
      ) as any;


      const ads: FacebookAd[] = response.map((ad: any) => ({
        id: ad.id,
        accountId: ad.account_id,
        campaignId: ad.campaign_id,
        adsetId: ad.adset_id,
        name: ad.name,
        status: ad.status as CampaignStatus,
        configuredStatus: ad.configured_status as CampaignStatus,
        effectiveStatus: ad.effective_status as EffectiveStatus,
        createdTime: ad.created_time,
        updatedTime: ad.updated_time,
        creative: ad.creative,
      }));


      await this.client
        .getRedis()
        .setex(`facebook:cache:${cacheKey}`, ttl, JSON.stringify(ads));


      return {
        success: true,
        data: ads,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_campaign_ads',
        campaignId,
      });


      return {
        success: false,
        error: error,
        syncedAt: Date.now(),
        fromCache: false,
      };
    }
  }

  /**
   * Sync ads for ad account
   */
  async syncAccountAds(
    adAccountId: string,
    options?: SyncOptions
  ): Promise<SyncResult<FacebookAd>> {
    const cacheKey = `ads:account:${adAccountId}`;
    const ttl = 600; // 10 minutes

    try {
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAd[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          return {
            success: true,
            data: cached.data,
            syncedAt: Date.now(),
            fromCache: true,
          };
        }
      }

      const sdk = this.client.getSdk();

      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'campaign_id',
        'adset_id',
        'name',
        'status',
        'configured_status',
        'effective_status',
        'created_time',
        'updated_time',
      ];

      const response = await this.client.makeRequest(adAccountId, () =>
        account.getAds(fields, { limit: options?.limit || 100 })
      ) as any;


      const ads: FacebookAd[] = response.map((ad: any) => ({
        id: ad.id,
        accountId: ad.account_id,
        campaignId: ad.campaign_id,
        adsetId: ad.adset_id,
        name: ad.name,
        status: ad.status as CampaignStatus,
        configuredStatus: ad.configured_status as CampaignStatus,
        effectiveStatus: ad.effective_status as EffectiveStatus,
        createdTime: ad.created_time,
        updatedTime: ad.updated_time,
      }));


      await this.client
        .getRedis()
        .setex(`facebook:cache:${cacheKey}`, ttl, JSON.stringify(ads));


      return {
        success: true,
        data: ads,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_account_ads',
        adAccountId,
      });


      return {
        success: false,
        error: error,
        syncedAt: Date.now(),
        fromCache: false,
      };
    }
  }

  /**
   * Get ad by ID
   */
  async getAd(
    adId: string,
    adAccountId: string,
    options?: SyncOptions
  ): Promise<FacebookAd | null> {
    const cacheKey = `ad:${adId}`;
    const ttl = 600; // 10 minutes

    try {
      const result = await this.client.getCached<FacebookAd>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const Ad = sdk.Ad;
          const ad = new Ad(adId);


          const fields = options?.fields || [
            'id',
            'account_id',
            'campaign_id',
            'adset_id',
            'name',
            'status',
            'configured_status',
            'effective_status',
            'created_time',
            'updated_time',
            'creative',
            'tracking_specs',
            'conversion_specs',
            'adlabels',
            'preview_shareable_link',
          ];

          const data = await this.client.makeRequest(adAccountId, () =>
            ad.read(fields)
          ) as any;


          return {
            id: data.id,
            accountId: data.account_id,
            campaignId: data.campaign_id,
            adsetId: data.adset_id,
            name: data.name,
            status: data.status as CampaignStatus,
            configuredStatus: data.configured_status as CampaignStatus,
            effectiveStatus: data.effective_status as EffectiveStatus,
            createdTime: data.created_time,
            updatedTime: data.updated_time,
            creative: data.creative,
            tracking_specs: data.tracking_specs,
            conversion_specs: data.conversion_specs,
            adlabels: data.adlabels,
            preview_shareable_link: data.preview_shareable_link,
          };
        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_ad',
        adId,
      });


      return null;
    }
  }

  /**
   * Get ad preview URL
   */
  async getAdPreview(
    adId: string,
    adAccountId: string,
    adFormat: 'DESKTOP_FEED_STANDARD' | 'MOBILE_FEED_STANDARD' | 'INSTAGRAM_STANDARD' = 'DESKTOP_FEED_STANDARD'
  ): Promise<string | null> {
    try {
      const sdk = this.client.getSdk();

      const Ad = sdk.Ad;
      const ad = new Ad(adId);


      const response = await this.client.makeRequest(adAccountId, () =>
        ad.getPreviews([], { ad_format: adFormat })
      ) as any;


      if (response && response.length > 0) {
        return response[0].body;
      }

      return null;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_ad_preview',
        adId,
      });


      return null;
    }
  }

  /**
   * Get active ads for ad set
   */
  async getActiveAds(adSetId: string, adAccountId: string): Promise<FacebookAd[]> {
    const result = await this.syncAds(adSetId, adAccountId, {
      status: 'ACTIVE',
    });


    return result.data || [];
  }

  /**
   * Invalidate ad cache
   */
  async invalidateCache(
    adId?: string,
    adSetId?: string,
    campaignId?: string,
    adAccountId?: string
  ): Promise<void> {
    if (adId) {
      await this.client.invalidateCache(`ad:${adId}`);

    }

    if (adSetId) {
      await this.client.invalidateCache(`ads:adset:${adSetId}`);

    }

    if (campaignId) {
      await this.client.invalidateCache(`ads:campaign:${campaignId}`);

    }

    if (adAccountId) {
      await this.client.invalidateCache(`ads:account:${adAccountId}`);

    }

    if (!adId && !adSetId && !campaignId && !adAccountId) {
      await this.client.invalidateCachePattern('ad:*');

      await this.client.invalidateCachePattern('ads:*');

    }
  }
}
