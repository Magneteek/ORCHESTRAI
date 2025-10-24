/**
 * Campaign Status Management
 * Pause, resume, and manage campaign status
 */

import { FacebookClient } from '../client';
import { CampaignStatus, EffectiveStatus } from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export class CampaignStatusManager {
  constructor(private client: FacebookClient) {}

  /**
   * Pause campaign
   */
  async pauseCampaign(
    campaignId: string,
    adAccountId: string
  ): Promise<boolean> {
    return this.updateStatus(campaignId, adAccountId, 'PAUSED');
  }

  /**
   * Resume/activate campaign
   */
  async resumeCampaign(
    campaignId: string,
    adAccountId: string
  ): Promise<boolean> {
    return this.updateStatus(campaignId, adAccountId, 'ACTIVE');
  }

  /**
   * Archive campaign
   */
  async archiveCampaign(
    campaignId: string,
    adAccountId: string
  ): Promise<boolean> {
    return this.updateStatus(campaignId, adAccountId, 'ARCHIVED');
  }

  /**
   * Update campaign status
   */
  async updateStatus(
    campaignId: string,
    adAccountId: string,
    status: CampaignStatus
  ): Promise<boolean> {
    try {
      FacebookErrorLogger.info('Updating campaign status', {
        campaignId,
        status,
      });

      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      await this.client.makeRequest(adAccountId, () =>
        campaign.update([], { status })
      ) as any;

      FacebookErrorLogger.info('Campaign status updated successfully', {
        campaignId,
        status,
      });

      // Invalidate cache
      await this.invalidateCache(campaignId, adAccountId);

      return true;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'update_status',
        campaignId,
        status,
      });

      return false;
    }
  }

  /**
   * Get campaign status
   */
  async getStatus(
    campaignId: string,
    adAccountId: string
  ): Promise<{
    status: CampaignStatus;
    configuredStatus: CampaignStatus;
    effectiveStatus: EffectiveStatus;
  } | null> {
    try {
      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      const data = await this.client.makeRequest(adAccountId, () =>
        campaign.read(['status', 'configured_status', 'effective_status'])
      ) as any;

      return {
        status: data.status as CampaignStatus,
        configuredStatus: data.configured_status as CampaignStatus,
        effectiveStatus: data.effective_status as EffectiveStatus,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_status',
        campaignId,
      });

      return null;
    }
  }

  /**
   * Check if campaign is active
   */
  async isActive(campaignId: string, adAccountId: string): Promise<boolean> {
    const status = await this.getStatus(campaignId, adAccountId);
    return status?.effectiveStatus === 'ACTIVE';
  }

  /**
   * Check if campaign can be activated
   */
  async canActivate(
    campaignId: string,
    adAccountId: string
  ): Promise<{
    canActivate: boolean;
    issues: string[];
  }> {
    try {
      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      // Get campaign details
      const data = await this.client.makeRequest(adAccountId, () =>
        campaign.read([
          'effective_status',
          'daily_budget',
          'lifetime_budget',
          'stop_time',
        ])
      ) as any;

      const issues: string[] = [];

      // Check if already active
      if (data.effective_status === 'ACTIVE') {
        issues.push('Campaign is already active');
      }

      // Check for budget
      if (!data.daily_budget && !data.lifetime_budget) {
        issues.push('No budget set');
      }

      // Check if stop time has passed
      if (data.stop_time) {
        const stopTime = new Date(data.stop_time);
        if (stopTime < new Date()) {
          issues.push('Stop time has already passed');
        }
      }

      // Check for ad sets (at least one active ad set required)
      const adSets = await campaign.getAdSets(['effective_status'], {
        limit: 1,
      });

      if (!adSets || adSets.length === 0) {
        issues.push('No ad sets found in campaign');
      }

      return {
        canActivate: issues.length === 0,
        issues,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'can_activate',
        campaignId,
      });

      return {
        canActivate: false,
        issues: ['Failed to check campaign status'],
      };
    }
  }

  /**
   * Batch pause campaigns
   */
  async batchPause(
    campaignIds: string[],
    adAccountId: string
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    return this.batchUpdateStatus(campaignIds, adAccountId, 'PAUSED');
  }

  /**
   * Batch resume campaigns
   */
  async batchResume(
    campaignIds: string[],
    adAccountId: string
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    return this.batchUpdateStatus(campaignIds, adAccountId, 'ACTIVE');
  }

  /**
   * Batch archive campaigns
   */
  async batchArchive(
    campaignIds: string[],
    adAccountId: string
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    return this.batchUpdateStatus(campaignIds, adAccountId, 'ARCHIVED');
  }

  /**
   * Batch update campaign status
   */
  private async batchUpdateStatus(
    campaignIds: string[],
    adAccountId: string,
    status: CampaignStatus
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
          batch.map((id) => this.updateStatus(id, adAccountId, status))
        );

        batchResults.forEach((result, index) => {
          const campaignId = batch[index];

          if (result.status === 'fulfilled' && result.value === true) {
            results.successful.push(campaignId);
          } else {
            results.failed.push({
              id: campaignId,
              error:
                result.status === 'rejected'
                  ? result.reason.message
                  : 'Status update failed',
            });
          }
        });

        return [];
      },
      { batchSize: 10 }
    );

    FacebookErrorLogger.info('Batch status update completed', {
      status,
      total: campaignIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
    });

    return results;
  }

  /**
   * Schedule campaign activation
   */
  async scheduleActivation(
    campaignId: string,
    adAccountId: string,
    startTime: string,
    stopTime?: string
  ): Promise<boolean> {
    try {
      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      const updateData: any = {
        status: 'ACTIVE',
        start_time: startTime,
      };

      if (stopTime) {
        updateData.stop_time = stopTime;
      }

      await this.client.makeRequest(adAccountId, () =>
        campaign.update([], updateData)
      ) as any;

      FacebookErrorLogger.info('Campaign activation scheduled', {
        campaignId,
        startTime,
        stopTime,
      });

      await this.invalidateCache(campaignId, adAccountId);

      return true;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'schedule_activation',
        campaignId,
      });

      return false;
    }
  }

  /**
   * Get campaigns by status
   */
  async getCampaignsByStatus(
    adAccountId: string,
    status: CampaignStatus
  ): Promise<string[]> {
    try {
      const sdk = this.client.getSdk();
      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      const campaigns = await this.client.makeRequest(adAccountId, () =>
        account.getCampaigns(['id'], {
          filtering: [
            {
              field: 'status',
              operator: 'IN',
              value: [status],
            },
          ],
        })
      ) as any;

      return campaigns.map((campaign: any) => campaign.id);
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_campaigns_by_status',
        adAccountId,
        status,
      });

      return [];
    }
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
