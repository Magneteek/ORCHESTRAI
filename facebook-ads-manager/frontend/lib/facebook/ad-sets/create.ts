/**
 * Ad Set Creation
 * Create Facebook ad sets
 */

import { FacebookClient } from '../client';
import {
  FacebookAdSet,
  CampaignStatus,
  BillingEvent,
  OptimizationGoal,
  BidStrategy,
  AdTargeting,
  PromotedObject,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export interface CreateAdSetParams {
  name: string;
  campaignId: string;
  status?: CampaignStatus;
  dailyBudget?: number; // in dollars
  lifetimeBudget?: number; // in dollars
  billingEvent: BillingEvent;
  optimizationGoal: OptimizationGoal;
  bidAmount?: number; // in dollars
  bidStrategy?: BidStrategy;
  targeting: AdTargeting;
  startTime?: string; // ISO 8601
  endTime?: string; // ISO 8601
  promotedObject?: PromotedObject;
  isDynamicCreative?: boolean;
}

export class AdSetCreator {
  constructor(private client: FacebookClient) {}

  /**
   * Create a new ad set
   */
  async createAdSet(
    adAccountId: string,
    params: CreateAdSetParams
  ): Promise<FacebookAdSet | null> {
    try {
      FacebookErrorLogger.info('Creating ad set', {
        adAccountId,
        name: params.name,
        campaignId: params.campaignId,
      });

      const sdk = this.client.getSdk();
      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      // Build ad set data
      const adSetData: any = {
        name: params.name,
        campaign_id: params.campaignId,
        status: params.status || 'PAUSED',
        billing_event: params.billingEvent,
        optimization_goal: params.optimizationGoal,
        targeting: params.targeting,
      };

      // Add budget (convert dollars to cents)
      if (params.dailyBudget) {
        adSetData.daily_budget = Math.round(params.dailyBudget * 100);
      }

      if (params.lifetimeBudget) {
        adSetData.lifetime_budget = Math.round(params.lifetimeBudget * 100);
      }

      // Add bid amount
      if (params.bidAmount) {
        adSetData.bid_amount = Math.round(params.bidAmount * 100);
      }

      // Add bid strategy
      if (params.bidStrategy) {
        adSetData.bid_strategy = params.bidStrategy;
      }

      // Add schedule
      if (params.startTime) {
        adSetData.start_time = params.startTime;
      }

      if (params.endTime) {
        adSetData.end_time = params.endTime;
      }

      // Add promoted object
      if (params.promotedObject) {
        adSetData.promoted_object = params.promotedObject;
      }

      // Dynamic creative
      if (params.isDynamicCreative !== undefined) {
        adSetData.is_dynamic_creative = params.isDynamicCreative;
      }

      // Create ad set
      const response = await this.client.makeRequest(adAccountId, () =>
        account.createAdSet([], adSetData)
      ) as { id: string };

      const adSetId = response.id;

      FacebookErrorLogger.info('Ad set created successfully', {
        adAccountId,
        adSetId,
        name: params.name,
      });

      // Invalidate cache
      await this.invalidateCache(params.campaignId, adAccountId);

      // Fetch and return full ad set object
      const AdSet = sdk.AdSet;
      const adSet = new AdSet(adSetId);

      const adSetDataResponse = await this.client.makeRequest(adAccountId, () =>
        adSet.read([
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
          'promoted_object',
          'is_dynamic_creative',
        ])
      ) as any;

      return {
        id: adSetDataResponse.id,
        accountId: adSetDataResponse.account_id,
        campaignId: adSetDataResponse.campaign_id,
        name: adSetDataResponse.name,
        status: adSetDataResponse.status as CampaignStatus,
        configuredStatus: adSetDataResponse.configured_status as CampaignStatus,
        effectiveStatus: adSetDataResponse.effective_status,
        dailyBudget: adSetDataResponse.daily_budget
          ? parseFloat(adSetDataResponse.daily_budget) / 100
          : undefined,
        lifetimeBudget: adSetDataResponse.lifetime_budget
          ? parseFloat(adSetDataResponse.lifetime_budget) / 100
          : undefined,
        budgetRemaining: adSetDataResponse.budget_remaining
          ? parseFloat(adSetDataResponse.budget_remaining) / 100
          : undefined,
        billingEvent: adSetDataResponse.billing_event,
        optimizationGoal: adSetDataResponse.optimization_goal,
        bidAmount: adSetDataResponse.bid_amount
          ? parseFloat(adSetDataResponse.bid_amount) / 100
          : undefined,
        bidStrategy: adSetDataResponse.bid_strategy,
        targeting: adSetDataResponse.targeting,
        startTime: adSetDataResponse.start_time,
        endTime: adSetDataResponse.end_time,
        createdTime: adSetDataResponse.created_time,
        updatedTime: adSetDataResponse.updated_time,
        promotedObject: adSetDataResponse.promoted_object,
        is_dynamic_creative: adSetDataResponse.is_dynamic_creative,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'create_ad_set',
        adAccountId,
        params,
      });

      return null;
    }
  }

  /**
   * Duplicate existing ad set
   */
  async duplicateAdSet(
    adSetId: string,
    adAccountId: string,
    newName?: string,
    newCampaignId?: string
  ): Promise<FacebookAdSet | null> {
    try {
      const sdk = this.client.getSdk();
      const AdSet = sdk.AdSet;
      const adSet = new AdSet(adSetId);

      // Fetch original ad set data
      const originalData = await this.client.makeRequest(adAccountId, () =>
        adSet.read([
          'campaign_id',
          'name',
          'status',
          'daily_budget',
          'lifetime_budget',
          'billing_event',
          'optimization_goal',
          'bid_amount',
          'bid_strategy',
          'targeting',
          'promoted_object',
          'is_dynamic_creative',
        ])
      ) as any;

      // Create new ad set with duplicated data
      const params: CreateAdSetParams = {
        name: newName || `${originalData.name} (Copy)`,
        campaignId: newCampaignId || originalData.campaign_id,
        status: 'PAUSED', // Always create duplicates as paused
        dailyBudget: originalData.daily_budget
          ? parseFloat(originalData.daily_budget) / 100
          : undefined,
        lifetimeBudget: originalData.lifetime_budget
          ? parseFloat(originalData.lifetime_budget) / 100
          : undefined,
        billingEvent: originalData.billing_event,
        optimizationGoal: originalData.optimization_goal,
        bidAmount: originalData.bid_amount
          ? parseFloat(originalData.bid_amount) / 100
          : undefined,
        bidStrategy: originalData.bid_strategy,
        targeting: originalData.targeting,
        promotedObject: originalData.promoted_object,
        isDynamicCreative: originalData.is_dynamic_creative,
      };

      return this.createAdSet(adAccountId, params);
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'duplicate_ad_set',
        adSetId,
      });

      return null;
    }
  }

  /**
   * Create ad set from template
   */
  async createFromTemplate(
    adAccountId: string,
    campaignId: string,
    templateName: string,
    customParams?: Partial<CreateAdSetParams>
  ): Promise<FacebookAdSet | null> {
    const template = this.getTemplate(templateName);

    if (!template) {
      FacebookErrorLogger.warn('Template not found', { templateName });
      return null;
    }

    // Merge template with custom params
    const params: CreateAdSetParams = {
      ...template,
      campaignId,
      ...customParams,
    };

    return this.createAdSet(adAccountId, params);
  }

  /**
   * Get ad set template by name
   */
  private getTemplate(
    templateName: string
  ): Omit<CreateAdSetParams, 'campaignId'> | null {
    const templates: Record<string, Omit<CreateAdSetParams, 'campaignId'>> = {
      'default-traffic': {
        name: 'Traffic Ad Set',
        status: 'PAUSED',
        billingEvent: 'LINK_CLICKS',
        optimizationGoal: 'LINK_CLICKS',
        targeting: {
          geo_locations: { countries: ['US'] },
          age_min: 18,
          age_max: 65,
        },
      },
      'default-conversions': {
        name: 'Conversions Ad Set',
        status: 'PAUSED',
        billingEvent: 'IMPRESSIONS',
        optimizationGoal: 'OFFSITE_CONVERSIONS',
        targeting: {
          geo_locations: { countries: ['US'] },
          age_min: 18,
          age_max: 65,
        },
      },
      'default-engagement': {
        name: 'Engagement Ad Set',
        status: 'PAUSED',
        billingEvent: 'POST_ENGAGEMENT',
        optimizationGoal: 'POST_ENGAGEMENT',
        targeting: {
          geo_locations: { countries: ['US'] },
          age_min: 18,
          age_max: 65,
        },
      },
    };

    return templates[templateName] || null;
  }

  /**
   * Invalidate ad set cache
   */
  private async invalidateCache(
    campaignId: string,
    adAccountId: string
  ): Promise<void> {
    await this.client.invalidateCache(`adsets:campaign:${campaignId}`);
    await this.client.invalidateCache(`adsets:account:${adAccountId}`);
  }
}
