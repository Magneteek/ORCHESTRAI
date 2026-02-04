/**
 * Campaigns Sync
 * Sync Facebook ad campaigns from API and persist to database
 */

import { FacebookClient } from '../client';
import {
  FacebookCampaign,
  CampaignStatus,
  EffectiveStatus,
  SyncOptions,
  SyncResult,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';
import { prisma } from '@/lib/db/prisma';

export class CampaignsSync {
  constructor(private client: FacebookClient) {}

  /**
   * Sync campaigns for ad account from Facebook API and save to database
   */
  async syncCampaigns(
    adAccountId: string,
    options?: SyncOptions & { status?: CampaignStatus; dbAdAccountId?: string }
  ): Promise<SyncResult<FacebookCampaign>> {
    const cacheKey = `campaigns:${adAccountId}`;
    const ttl = 600; // 10 minutes

    try {
      // Check cache unless force refresh
      if (!options?.forceRefresh) {
        const cached = await this.client.getCached<FacebookCampaign[]>(
          cacheKey,
          async () => [],
          ttl
        );


        if (cached.fromCache && cached.data.length > 0) {
          FacebookErrorLogger.info('Returning cached campaigns', {
            adAccountId,
            count: cached.data.length,
          });


          return {
            success: true,
            data: cached.data,
            syncedAt: Date.now(),
            fromCache: true,
          };
        }
      }

      // Fetch from API
      FacebookErrorLogger.info('Fetching campaigns from API', {
        adAccountId,
      });


      const sdk = this.client.getSdk();

      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);


      const fields = options?.fields || [
        'id',
        'account_id',
        'name',
        'objective',
        'status',
        'configured_status',
        'effective_status',
        'special_ad_categories',
        'daily_budget',
        'lifetime_budget',
        'budget_remaining',
        'spend_cap',
        'start_time',
        'stop_time',
        'created_time',
        'updated_time',
        'bid_strategy',
      ];

      const params: any = {
        limit: options?.limit || 100,
      };

      // Filter by status if provided
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
        account.getCampaigns(fields, params)
      ) as any;


      const campaigns: FacebookCampaign[] = response.map(
        (campaign: any) => ({
          id: campaign.id,
          accountId: campaign.account_id,
          name: campaign.name,
          objective: campaign.objective,
          status: campaign.status as CampaignStatus,
          configuredStatus: campaign.configured_status as CampaignStatus,
          effectiveStatus: campaign.effective_status as EffectiveStatus,
          specialAdCategories: campaign.special_ad_categories || [],
          dailyBudget: campaign.daily_budget
            ? parseFloat(campaign.daily_budget) / 100
            : undefined,
          lifetimeBudget: campaign.lifetime_budget
            ? parseFloat(campaign.lifetime_budget) / 100
            : undefined,
          budgetRemaining: campaign.budget_remaining
            ? parseFloat(campaign.budget_remaining) / 100
            : undefined,
          spendCap: campaign.spend_cap
            ? parseFloat(campaign.spend_cap) / 100
            : undefined,
          startTime: campaign.start_time,
          stopTime: campaign.stop_time,
          createdTime: campaign.created_time,
          updatedTime: campaign.updated_time,
          bidStrategy: campaign.bid_strategy,
        })
      );

      // Persist to database if dbAdAccountId provided
      if (options?.dbAdAccountId) {
        FacebookErrorLogger.info('Persisting campaigns to database', {
          adAccountId,
          dbAdAccountId: options.dbAdAccountId,
          count: campaigns.length,
        });

        try {
          await Promise.all(
            campaigns.map((campaign) =>
              prisma.campaign.upsert({
                where: {
                  adAccountId_campaignId: {
                    adAccountId: options.dbAdAccountId!,
                    campaignId: campaign.id,
                  },
                },
                update: {
                  name: campaign.name,
                  objective: campaign.objective,
                  status: campaign.status,
                  dailyBudget: campaign.dailyBudget,
                  lifetimeBudget: campaign.lifetimeBudget,
                  startTime: campaign.startTime ? new Date(campaign.startTime) : null,
                  stopTime: campaign.stopTime ? new Date(campaign.stopTime) : null,
                },
                create: {
                  adAccountId: options.dbAdAccountId!,
                  campaignId: campaign.id,
                  name: campaign.name,
                  objective: campaign.objective,
                  status: campaign.status,
                  dailyBudget: campaign.dailyBudget,
                  lifetimeBudget: campaign.lifetimeBudget,
                  startTime: campaign.startTime ? new Date(campaign.startTime) : null,
                  stopTime: campaign.stopTime ? new Date(campaign.stopTime) : null,
                },
              })
            )
          );

          FacebookErrorLogger.info('Successfully persisted campaigns to database', {
            adAccountId,
            count: campaigns.length,
          });
        } catch (dbError: any) {
          FacebookErrorLogger.log(dbError, {
            operation: 'persist_campaigns',
            adAccountId,
          });
          // Don't fail the sync if DB write fails - data is still in cache
        }
      }

      // Cache the results
      await this.client
        .getRedis()
        .setex(
          `facebook:cache:${cacheKey}`,
          ttl,
          JSON.stringify(campaigns)
        );


      FacebookErrorLogger.info('Successfully synced campaigns', {
        adAccountId,
        count: campaigns.length,
      });


      return {
        success: true,
        data: campaigns,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'sync_campaigns',
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
   * Get campaign by ID
   */
  async getCampaign(
    campaignId: string,
    adAccountId: string,
    options?: SyncOptions
  ): Promise<FacebookCampaign | null> {
    const cacheKey = `campaign:${campaignId}`;
    const ttl = 600; // 10 minutes

    try {
      const result = await this.client.getCached<FacebookCampaign>(
        cacheKey,
        async () => {
          const sdk = this.client.getSdk();

          const Campaign = sdk.Campaign;
          const campaign = new Campaign(campaignId);


          const fields = options?.fields || [
            'id',
            'account_id',
            'name',
            'objective',
            'status',
            'configured_status',
            'effective_status',
            'special_ad_categories',
            'daily_budget',
            'lifetime_budget',
            'budget_remaining',
            'spend_cap',
            'start_time',
            'stop_time',
            'created_time',
            'updated_time',
            'bid_strategy',
          ];

          const data = await this.client.makeRequest(adAccountId, () =>
            campaign.read(fields)
          ) as any;


          return {
            id: data.id,
            accountId: data.account_id,
            name: data.name,
            objective: data.objective,
            status: data.status as CampaignStatus,
            configuredStatus: data.configured_status as CampaignStatus,
            effectiveStatus: data.effective_status as EffectiveStatus,
            specialAdCategories: data.special_ad_categories || [],
            dailyBudget: data.daily_budget
              ? parseFloat(data.daily_budget) / 100
              : undefined,
            lifetimeBudget: data.lifetime_budget
              ? parseFloat(data.lifetime_budget) / 100
              : undefined,
            budgetRemaining: data.budget_remaining
              ? parseFloat(data.budget_remaining) / 100
              : undefined,
            spendCap: data.spend_cap
              ? parseFloat(data.spend_cap) / 100
              : undefined,
            startTime: data.start_time,
            stopTime: data.stop_time,
            createdTime: data.created_time,
            updatedTime: data.updated_time,
            bidStrategy: data.bid_strategy,
          };
        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_campaign',
        campaignId,
      });


      return null;
    }
  }

  /**
   * Get campaigns by status
   */
  async getCampaignsByStatus(
    adAccountId: string,
    status: CampaignStatus
  ): Promise<FacebookCampaign[]> {
    const result = await this.syncCampaigns(adAccountId, {
      status,
      forceRefresh: false,
    });


    return result.data || [];
  }

  /**
   * Get active campaigns
   */
  async getActiveCampaigns(adAccountId: string): Promise<FacebookCampaign[]> {
    return this.getCampaignsByStatus(adAccountId, 'ACTIVE');

  }

  /**
   * Search campaigns by name
   */
  async searchCampaigns(
    adAccountId: string,
    searchTerm: string
  ): Promise<FacebookCampaign[]> {
    const result = await this.syncCampaigns(adAccountId);


    if (!result.data) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();

    return result.data.filter((campaign) =>
      campaign.name.toLowerCase().includes(searchLower)
    );

  }

  /**
   * Get campaign summary statistics
   */
  async getCampaignStats(adAccountId: string): Promise<{
    total: number;
    active: number;
    paused: number;
    archived: number;
    deleted: number;
    totalSpent: number;
    totalBudget: number;
  }> {
    const result = await this.syncCampaigns(adAccountId);


    if (!result.data) {
      return {
        total: 0,
        active: 0,
        paused: 0,
        archived: 0,
        deleted: 0,
        totalSpent: 0,
        totalBudget: 0,
      };
    }

    const stats = {
      total: result.data.length,
      active: 0,
      paused: 0,
      archived: 0,
      deleted: 0,
      totalSpent: 0,
      totalBudget: 0,
    };

    result.data.forEach((campaign) => {
      // Count by status
      switch (campaign.status) {
        case 'ACTIVE':
          stats.active++;
          break;
        case 'PAUSED':
          stats.paused++;
          break;
        case 'ARCHIVED':
          stats.archived++;
          break;
        case 'DELETED':
          stats.deleted++;
          break;
      }

      // Sum budgets
      if (campaign.dailyBudget) {
        stats.totalBudget += campaign.dailyBudget * 30; // Estimate monthly
      } else if (campaign.lifetimeBudget) {
        stats.totalBudget += campaign.lifetimeBudget;
      }

      // Note: Spent amount would come from insights
    });


    return stats;
  }

  /**
   * Invalidate campaign cache
   */
  async invalidateCache(campaignId?: string, adAccountId?: string): Promise<void> {
    if (campaignId) {
      await this.client.invalidateCache(`campaign:${campaignId}`);

    }

    if (adAccountId) {
      await this.client.invalidateCache(`campaigns:${adAccountId}`);

    }

    if (!campaignId && !adAccountId) {
      await this.client.invalidateCachePattern('campaign*');

    }
  }
}
