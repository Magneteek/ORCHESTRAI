/**
 * Campaign Creation
 * Create Facebook ad campaigns
 */

import { FacebookClient } from '../client';
import {
  FacebookCampaign,
  CampaignObjective,
  CampaignStatus,
  SpecialAdCategory,
  BidStrategy,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export interface CreateCampaignParams {
  name: string;
  objective: CampaignObjective;
  status?: CampaignStatus;
  specialAdCategories?: SpecialAdCategory[];
  dailyBudget?: number; // in dollars
  lifetimeBudget?: number; // in dollars
  spendCap?: number; // in dollars
  startTime?: string; // ISO 8601
  stopTime?: string; // ISO 8601
  bidStrategy?: BidStrategy;
}

export class CampaignCreator {
  constructor(private client: FacebookClient) {}

  /**
   * Create a new campaign
   */
  async createCampaign(
    adAccountId: string,
    params: CreateCampaignParams
  ): Promise<FacebookCampaign | null> {
    try {
      FacebookErrorLogger.info('Creating campaign', {
        adAccountId,
        name: params.name,
        objective: params.objective,
      });

      const sdk = this.client.getSdk();
      const AdAccount = sdk.AdAccount;
      const account = new AdAccount(adAccountId);

      // Build campaign data
      const campaignData: any = {
        name: params.name,
        objective: params.objective,
        status: params.status || 'PAUSED',
        special_ad_categories: params.specialAdCategories || [],
      };

      // Add budget (convert dollars to cents)
      if (params.dailyBudget) {
        campaignData.daily_budget = Math.round(params.dailyBudget * 100);
      }

      if (params.lifetimeBudget) {
        campaignData.lifetime_budget = Math.round(params.lifetimeBudget * 100);
      }

      if (params.spendCap) {
        campaignData.spend_cap = Math.round(params.spendCap * 100);
      }

      // Add schedule
      if (params.startTime) {
        campaignData.start_time = params.startTime;
      }

      if (params.stopTime) {
        campaignData.stop_time = params.stopTime;
      }

      // Add bid strategy
      if (params.bidStrategy) {
        campaignData.bid_strategy = params.bidStrategy;
      }

      // Create campaign
      const response = await this.client.makeRequest(adAccountId, () =>
        account.createCampaign([], campaignData)
      ) as { id: string };

      const campaignId = response.id;

      FacebookErrorLogger.info('Campaign created successfully', {
        adAccountId,
        campaignId,
        name: params.name,
      });

      // Invalidate cache
      await this.invalidateCache(adAccountId);

      // Fetch and return full campaign object
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      const createdCampaign = await this.client.makeRequest(adAccountId, () =>
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
        id: createdCampaign.id,
        accountId: createdCampaign.account_id,
        name: createdCampaign.name,
        objective: createdCampaign.objective,
        status: createdCampaign.status as CampaignStatus,
        configuredStatus: createdCampaign.configured_status as CampaignStatus,
        effectiveStatus: createdCampaign.effective_status,
        specialAdCategories: createdCampaign.special_ad_categories || [],
        dailyBudget: createdCampaign.daily_budget
          ? parseFloat(createdCampaign.daily_budget) / 100
          : undefined,
        lifetimeBudget: createdCampaign.lifetime_budget
          ? parseFloat(createdCampaign.lifetime_budget) / 100
          : undefined,
        budgetRemaining: createdCampaign.budget_remaining
          ? parseFloat(createdCampaign.budget_remaining) / 100
          : undefined,
        spendCap: createdCampaign.spend_cap
          ? parseFloat(createdCampaign.spend_cap) / 100
          : undefined,
        startTime: createdCampaign.start_time,
        stopTime: createdCampaign.stop_time,
        createdTime: createdCampaign.created_time,
        updatedTime: createdCampaign.updated_time,
        bidStrategy: createdCampaign.bid_strategy,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'create_campaign',
        adAccountId,
        params,
      });

      return null;
    }
  }

  /**
   * Create campaign from template
   */
  async createFromTemplate(
    adAccountId: string,
    templateName: string,
    customParams?: Partial<CreateCampaignParams>
  ): Promise<FacebookCampaign | null> {
    const template = this.getTemplate(templateName);

    if (!template) {
      FacebookErrorLogger.warn('Template not found', { templateName });
      return null;
    }

    // Merge template with custom params
    const params: CreateCampaignParams = {
      ...template,
      ...customParams,
    };

    return this.createCampaign(adAccountId, params);
  }

  /**
   * Duplicate existing campaign
   */
  async duplicateCampaign(
    campaignId: string,
    adAccountId: string,
    newName?: string,
    includeAdSets: boolean = true
  ): Promise<FacebookCampaign | null> {
    try {
      const sdk = this.client.getSdk();
      const Campaign = sdk.Campaign;
      const campaign = new Campaign(campaignId);

      // Fetch original campaign data
      const originalData = await this.client.makeRequest(adAccountId, () =>
        campaign.read([
          'name',
          'objective',
          'status',
          'special_ad_categories',
          'daily_budget',
          'lifetime_budget',
          'spend_cap',
          'bid_strategy',
        ])
      ) as any;

      // Create new campaign with duplicated data
      const params: CreateCampaignParams = {
        name: newName || `${originalData.name} (Copy)`,
        objective: originalData.objective,
        status: 'PAUSED', // Always create duplicates as paused
        specialAdCategories: originalData.special_ad_categories,
        dailyBudget: originalData.daily_budget
          ? parseFloat(originalData.daily_budget) / 100
          : undefined,
        lifetimeBudget: originalData.lifetime_budget
          ? parseFloat(originalData.lifetime_budget) / 100
          : undefined,
        spendCap: originalData.spend_cap
          ? parseFloat(originalData.spend_cap) / 100
          : undefined,
        bidStrategy: originalData.bid_strategy,
      };

      const newCampaign = await this.createCampaign(adAccountId, params);

      if (!newCampaign) {
        return null;
      }

      // TODO: If includeAdSets, duplicate ad sets as well
      // This would require the AdSetCreator to be available

      return newCampaign;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'duplicate_campaign',
        campaignId,
      });

      return null;
    }
  }

  /**
   * Get campaign template by name
   */
  private getTemplate(
    templateName: string
  ): CreateCampaignParams | null {
    const templates: Record<string, CreateCampaignParams> = {
      'awareness': {
        name: 'Brand Awareness Campaign',
        objective: 'OUTCOME_AWARENESS',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'traffic': {
        name: 'Traffic Campaign',
        objective: 'OUTCOME_TRAFFIC',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'engagement': {
        name: 'Engagement Campaign',
        objective: 'OUTCOME_ENGAGEMENT',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'leads': {
        name: 'Lead Generation Campaign',
        objective: 'OUTCOME_LEADS',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'conversions': {
        name: 'Conversions Campaign',
        objective: 'OUTCOME_SALES',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'app-installs': {
        name: 'App Installs Campaign',
        objective: 'APP_INSTALLS',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'video-views': {
        name: 'Video Views Campaign',
        objective: 'VIDEO_VIEWS',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      'catalog-sales': {
        name: 'Catalog Sales Campaign',
        objective: 'PRODUCT_CATALOG_SALES',
        status: 'PAUSED',
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
    };

    return templates[templateName] || null;
  }

  /**
   * List available templates
   */
  getAvailableTemplates(): string[] {
    return [
      'awareness',
      'traffic',
      'engagement',
      'leads',
      'conversions',
      'app-installs',
      'video-views',
      'catalog-sales',
    ];
  }

  /**
   * Invalidate campaign cache
   */
  private async invalidateCache(adAccountId: string): Promise<void> {
    await this.client.invalidateCache(`campaigns:${adAccountId}`);
  }
}
