/**
 * Campaign Updates
 * Update Facebook ad campaigns
 */

import { FacebookClient } from '../client';
import {
  FacebookCampaign,
  CampaignStatus,
  BidStrategy,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export interface UpdateCampaignParams {
  name?: string;
  status?: CampaignStatus;
  dailyBudget?: number; // in dollars
  lifetimeBudget?: number; // in dollars
  spendCap?: number; // in dollars
  startTime?: string; // ISO 8601
  stopTime?: string; // ISO 8601
  bidStrategy?: BidStrategy;
}

export class CampaignUpdater {
  constructor(private client: FacebookClient) {}

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    adAccountId: string,
    updates: UpdateCampaignParams
  ): Promise<FacebookCampaign | null> {
    try {
      FacebookErrorLogger.info('Updating campaign', {
        campaignId,
        updates,
      });

      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      // Build update data
      const updateData: any = {};

      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }

      if (updates.status !== undefined) {
        updateData.status = updates.status;
      }

      // Budget updates (convert dollars to cents)
      if (updates.dailyBudget !== undefined) {
        updateData.daily_budget = Math.round(updates.dailyBudget * 100);
        // When setting daily budget, remove lifetime budget
        updateData.lifetime_budget = null;
      }

      if (updates.lifetimeBudget !== undefined) {
        updateData.lifetime_budget = Math.round(updates.lifetimeBudget * 100);
        // When setting lifetime budget, remove daily budget
        updateData.daily_budget = null;
      }

      if (updates.spendCap !== undefined) {
        updateData.spend_cap = Math.round(updates.spendCap * 100);
      }

      // Schedule updates
      if (updates.startTime !== undefined) {
        updateData.start_time = updates.startTime;
      }

      if (updates.stopTime !== undefined) {
        updateData.stop_time = updates.stopTime;
      }

      // Bid strategy
      if (updates.bidStrategy !== undefined) {
        updateData.bid_strategy = updates.bidStrategy;
      }

      // Perform update
      await this.client.makeRequest(adAccountId, () =>
        campaign.update([], updateData)
      ) as any;

      FacebookErrorLogger.info('Campaign updated successfully', {
        campaignId,
      });

      // Invalidate cache
      await this.invalidateCache(campaignId, adAccountId);

      // Fetch and return updated campaign
      const updatedData = await this.client.makeRequest(adAccountId, () =>
        campaign.read([
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
        ])
      ) as any;

      return {
        id: updatedData.id,
        accountId: updatedData.account_id,
        name: updatedData.name,
        objective: updatedData.objective,
        status: updatedData.status as CampaignStatus,
        configuredStatus: updatedData.configured_status as CampaignStatus,
        effectiveStatus: updatedData.effective_status,
        specialAdCategories: updatedData.special_ad_categories || [],
        dailyBudget: updatedData.daily_budget
          ? parseFloat(updatedData.daily_budget) / 100
          : undefined,
        lifetimeBudget: updatedData.lifetime_budget
          ? parseFloat(updatedData.lifetime_budget) / 100
          : undefined,
        budgetRemaining: updatedData.budget_remaining
          ? parseFloat(updatedData.budget_remaining) / 100
          : undefined,
        spendCap: updatedData.spend_cap
          ? parseFloat(updatedData.spend_cap) / 100
          : undefined,
        startTime: updatedData.start_time,
        stopTime: updatedData.stop_time,
        createdTime: updatedData.created_time,
        updatedTime: updatedData.updated_time,
        bidStrategy: updatedData.bid_strategy,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'update_campaign',
        campaignId,
        updates,
      });

      return null;
    }
  }

  /**
   * Update campaign name
   */
  async updateName(
    campaignId: string,
    adAccountId: string,
    name: string
  ): Promise<boolean> {
    const result = await this.updateCampaign(campaignId, adAccountId, { name });
    return result !== null;
  }

  /**
   * Update campaign budget
   */
  async updateBudget(
    campaignId: string,
    adAccountId: string,
    budget: {
      daily?: number;
      lifetime?: number;
      spendCap?: number;
    }
  ): Promise<boolean> {
    const updates: UpdateCampaignParams = {
      dailyBudget: budget.daily,
      lifetimeBudget: budget.lifetime,
      spendCap: budget.spendCap,
    };

    const result = await this.updateCampaign(campaignId, adAccountId, updates);
    return result !== null;
  }

  /**
   * Update campaign schedule
   */
  async updateSchedule(
    campaignId: string,
    adAccountId: string,
    schedule: {
      startTime?: string;
      stopTime?: string;
    }
  ): Promise<boolean> {
    const updates: UpdateCampaignParams = {
      startTime: schedule.startTime,
      stopTime: schedule.stopTime,
    };

    const result = await this.updateCampaign(campaignId, adAccountId, updates);
    return result !== null;
  }

  /**
   * Update campaign bid strategy
   */
  async updateBidStrategy(
    campaignId: string,
    adAccountId: string,
    bidStrategy: BidStrategy
  ): Promise<boolean> {
    const result = await this.updateCampaign(campaignId, adAccountId, {
      bidStrategy,
    });

    return result !== null;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(
    campaignId: string,
    adAccountId: string
  ): Promise<boolean> {
    try {
      FacebookErrorLogger.info('Deleting campaign', { campaignId });

      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      await this.client.makeRequest(adAccountId, () =>
        campaign.delete()
      ) as any;

      FacebookErrorLogger.info('Campaign deleted successfully', {
        campaignId,
      });

      // Invalidate cache
      await this.invalidateCache(campaignId, adAccountId);

      return true;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'delete_campaign',
        campaignId,
      });

      return false;
    }
  }

  /**
   * Archive campaign (soft delete)
   */
  async archiveCampaign(
    campaignId: string,
    adAccountId: string
  ): Promise<boolean> {
    const result = await this.updateCampaign(campaignId, adAccountId, {
      status: 'ARCHIVED',
    });

    return result !== null;
  }

  /**
   * Batch update campaigns
   */
  async batchUpdate(
    campaignIds: string[],
    adAccountId: string,
    updates: UpdateCampaignParams
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const results = {
      successful: [] as string[],
      failed: [] as Array<{ id: string; error: string }>,
    };

    // Use rate limiter to batch process
    const rateLimiter = this.client.getRateLimiter();

    await rateLimiter.batchRequests(
      adAccountId,
      campaignIds,
      async (batch) => {
        const batchResults = await Promise.allSettled(
          batch.map((id) => this.updateCampaign(id, adAccountId, updates))
        );

        batchResults.forEach((result, index) => {
          const campaignId = batch[index];

          if (result.status === 'fulfilled' && result.value !== null) {
            results.successful.push(campaignId);
          } else {
            results.failed.push({
              id: campaignId,
              error:
                result.status === 'rejected'
                  ? result.reason.message
                  : 'Update failed',
            });
          }
        });

        return [];
      },
      { batchSize: 10 }
    );

    FacebookErrorLogger.info('Batch update completed', {
      total: campaignIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
    });

    return results;
  }

  /**
   * Invalidate campaign cache
   */
  private async invalidateCache(
    campaignId: string,
    adAccountId: string
  ): Promise<void> {
    await this.client.invalidateCache(`campaign:${campaignId}`);
    await this.client.invalidateCache(`campaigns:${adAccountId}`);
  }
}
