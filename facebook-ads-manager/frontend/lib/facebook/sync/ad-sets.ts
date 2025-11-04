/**
 * Ad Sets Sync
 * Sync Facebook ad sets
 */

import { FacebookClient } from '../client';
import {
  FacebookAdSet,
  CampaignStatus,
  EffectiveStatus,
  SyncOptions,
  SyncResult,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export class AdSetsSync {
  constructor(private client: FacebookClient) {}

  /**
   * Sync ad sets for campaign
   */
  async syncAdSets(
    campaignId: string,
    adAccountId: string,
    options?: SyncOptions & { status?: CampaignStatus }
  ): Promise<SyncResult<FacebookAdSet>> {
    const cacheKey = `adsets:campaign:${campaignId}`;
    const ttl = 600; // 10 minutes

    try {
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAdSet[]>(
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

      FacebookErrorLogger.info('Fetching ad sets from API', { campaignId });


      const sdk = this.client.getSdk();

      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'campaign_id',
        'name',
        'status',
        'configured_status',
        'effective_status',
        'daily_budget',
        'lifetime_budget',
        'budget_remaining',
        'billing_event',
        'optimization_goal',
        'bid_amount',
        'bid_strategy',
        'targeting',
        'start_time',
        'end_time',
        'created_time',
        'updated_time',
        'attribution_spec',
        'promoted_object',
        'pacing_type',
        'is_dynamic_creative',
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
        campaign.getAdSets(fields, params)
      ) as any;


      const adSets: FacebookAdSet[] = response.map((adSet: any) => ({
        id: adSet.id,
        accountId: adSet.account_id,
        campaignId: adSet.campaign_id,
        name: adSet.name,
        status: adSet.status as CampaignStatus,
        configuredStatus: adSet.configured_status as CampaignStatus,
        effectiveStatus: adSet.effective_status as EffectiveStatus,
        dailyBudget: adSet.daily_budget
          ? parseFloat(adSet.daily_budget) / 100
          : undefined,
        lifetimeBudget: adSet.lifetime_budget
          ? parseFloat(adSet.lifetime_budget) / 100
          : undefined,
        budgetRemaining: adSet.budget_remaining
          ? parseFloat(adSet.budget_remaining) / 100
          : undefined,
        billingEvent: adSet.billing_event,
        optimizationGoal: adSet.optimization_goal,
        bidAmount: adSet.bid_amount
          ? parseFloat(adSet.bid_amount) / 100
          : undefined,
        bidStrategy: adSet.bid_strategy,
        targeting: adSet.targeting,
        startTime: adSet.start_time,
        endTime: adSet.end_time,
        createdTime: adSet.created_time,
        updatedTime: adSet.updated_time,
        attribution_spec: adSet.attribution_spec,
        promotedObject: adSet.promoted_object,
        pacing_type: adSet.pacing_type,
        is_dynamic_creative: adSet.is_dynamic_creative,
      }));


      await this.client
        .getRedis()
        .setex(`facebook:cache:${cacheKey}`, ttl, JSON.stringify(adSets));


      FacebookErrorLogger.info('Successfully synced ad sets', {
        campaignId,
        count: adSets.length,
      });


      return {
        success: true,
        data: adSets,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_ad_sets',
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
   * Sync ad sets for ad account
   */
  async syncAccountAdSets(
    adAccountId: string,
    options?: SyncOptions
  ): Promise<SyncResult<FacebookAdSet>> {
    const cacheKey = `adsets:account:${adAccountId}`;
    const ttl = 600; // 10 minutes

    try {
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookAdSet[]>(
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
        'name',
        'status',
        'configured_status',
        'effective_status',
        'daily_budget',
        'lifetime_budget',
        'billing_event',
        'optimization_goal',
        'bid_amount',
        'targeting',
        'created_time',
        'updated_time',
      ];

      const response = await this.client.makeRequest(adAccountId, () =>
        account.getAdSets(fields, { limit: options?.limit || 100 })
      ) as any;


      const adSets: FacebookAdSet[] = response.map((adSet: any) => ({
        id: adSet.id,
        accountId: adSet.account_id,
        campaignId: adSet.campaign_id,
        name: adSet.name,
        status: adSet.status as CampaignStatus,
        configuredStatus: adSet.configured_status as CampaignStatus,
        effectiveStatus: adSet.effective_status as EffectiveStatus,
        dailyBudget: adSet.daily_budget
          ? parseFloat(adSet.daily_budget) / 100
          : undefined,
        lifetimeBudget: adSet.lifetime_budget
          ? parseFloat(adSet.lifetime_budget) / 100
          : undefined,
        billingEvent: adSet.billing_event,
        optimizationGoal: adSet.optimization_goal,
        bidAmount: adSet.bid_amount
          ? parseFloat(adSet.bid_amount) / 100
          : undefined,
        targeting: adSet.targeting,
        createdTime: adSet.created_time,
        updatedTime: adSet.updated_time,
      }));


      await this.client
        .getRedis()
        .setex(`facebook:cache:${cacheKey}`, ttl, JSON.stringify(adSets));


      return {
        success: true,
        data: adSets,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_account_ad_sets',
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
   * Get ad set by ID
   */
  async getAdSet(
    adSetId: string,
    adAccountId: string,
    options?: SyncOptions
  ): Promise<FacebookAdSet | null> {
    const cacheKey = `adset:${adSetId}`;
    const ttl = 600; // 10 minutes

    try {
      const result = await this.client.getCached<FacebookAdSet>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const AdSet = sdk.AdSet;
          const adSet = new AdSet(adSetId);


          const fields = options?.fields || [
            'id',
            'account_id',
            'campaign_id',
            'name',
            'status',
            'configured_status',
            'effective_status',
            'daily_budget',
            'lifetime_budget',
            'budget_remaining',
            'billing_event',
            'optimization_goal',
            'bid_amount',
            'bid_strategy',
            'targeting',
            'start_time',
            'end_time',
            'created_time',
            'updated_time',
            'attribution_spec',
            'promoted_object',
            'pacing_type',
            'is_dynamic_creative',
          ];

          const data = await this.client.makeRequest(adAccountId, () =>
            adSet.read(fields)
          ) as any;


          return {
            id: data.id,
            accountId: data.account_id,
            campaignId: data.campaign_id,
            name: data.name,
            status: data.status as CampaignStatus,
            configuredStatus: data.configured_status as CampaignStatus,
            effectiveStatus: data.effective_status as EffectiveStatus,
            dailyBudget: data.daily_budget
              ? parseFloat(data.daily_budget) / 100
              : undefined,
            lifetimeBudget: data.lifetime_budget
              ? parseFloat(data.lifetime_budget) / 100
              : undefined,
            budgetRemaining: data.budget_remaining
              ? parseFloat(data.budget_remaining) / 100
              : undefined,
            billingEvent: data.billing_event,
            optimizationGoal: data.optimization_goal,
            bidAmount: data.bid_amount
              ? parseFloat(data.bid_amount) / 100
              : undefined,
            bidStrategy: data.bid_strategy,
            targeting: data.targeting,
            startTime: data.start_time,
            endTime: data.end_time,
            createdTime: data.created_time,
            updatedTime: data.updated_time,
            attribution_spec: data.attribution_spec,
            promotedObject: data.promoted_object,
            pacing_type: data.pacing_type,
            is_dynamic_creative: data.is_dynamic_creative,
          };
        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_ad_set',
        adSetId,
      });


      return null;
    }
  }

  /**
   * Get active ad sets for campaign
   */
  async getActiveAdSets(
    campaignId: string,
    adAccountId: string
  ): Promise<FacebookAdSet[]> {
    const result = await this.syncAdSets(campaignId, adAccountId, {
      status: 'ACTIVE',
    });


    return result.data || [];
  }

  /**
   * Invalidate ad set cache
   */
  async invalidateCache(
    adSetId?: string,
    campaignId?: string,
    adAccountId?: string
  ): Promise<void> {
    if (adSetId) {
      await this.client.invalidateCache(`adset:${adSetId}`);

    }

    if (campaignId) {
      await this.client.invalidateCache(`adsets:campaign:${campaignId}`);

    }

    if (adAccountId) {
      await this.client.invalidateCache(`adsets:account:${adAccountId}`);

    }

    if (!adSetId && !campaignId && !adAccountId) {
      await this.client.invalidateCachePattern('adset*');

    }
  }
}
