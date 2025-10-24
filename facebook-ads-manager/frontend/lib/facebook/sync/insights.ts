/**
 * Insights Sync
 * Fetch Facebook ad performance metrics and insights
 */

import { FacebookClient } from '../client';
import {
  FacebookInsights,
  InsightsParams,
  InsightsLevel,
  InsightsDatePreset,
  SyncOptions,
  SyncResult,
} from '@/types/facebook';
import { FacebookErrorLogger } from '../errors';

export class InsightsSync {
  constructor(private client: FacebookClient) {}

  /**
   * Get insights for ad account
   */
  async getAccountInsights(
    adAccountId: string,
    params: Partial<InsightsParams>
  ): Promise<SyncResult<FacebookInsights>> {
    return this.getInsights(adAccountId, adAccountId, 'account', params);

  }

  /**
   * Get insights for campaign
   */
  async getCampaignInsights(
    campaignId: string,
    adAccountId: string,
    params: Partial<InsightsParams>
  ): Promise<SyncResult<FacebookInsights>> {
    return this.getInsights(campaignId, adAccountId, 'campaign', params);

  }

  /**
   * Get insights for ad set
   */
  async getAdSetInsights(
    adSetId: string,
    adAccountId: string,
    params: Partial<InsightsParams>
  ): Promise<SyncResult<FacebookInsights>> {
    return this.getInsights(adSetId, adAccountId, 'adset', params);

  }

  /**
   * Get insights for ad
   */
  async getAdInsights(
    adId: string,
    adAccountId: string,
    params: Partial<InsightsParams>
  ): Promise<SyncResult<FacebookInsights>> {
    return this.getInsights(adId, adAccountId, 'ad', params);

  }

  /**
   * Generic insights fetcher
   */
  private async getInsights(
    objectId: string,
    adAccountId: string,
    level: InsightsLevel,
    params: Partial<InsightsParams>
  ): Promise<SyncResult<FacebookInsights>> {
    // Generate cache key based on parameters
    const cacheKey = this.generateCacheKey(objectId, level, params);

    const ttl = 900; // 15 minutes for insights

    try {
      FacebookErrorLogger.info('Fetching insights from API', {
        objectId,
        level,
        params,
      });


      const sdk = this.client.getSdk();

      let insightsObject: any;

      // Get the appropriate SDK object based on level
      switch (level) {
        case 'account':
          insightsObject = new sdk.AdAccount(objectId);

          break;
        case 'campaign':
          insightsObject = new sdk.Campaign(objectId);

          break;
        case 'adset':
          insightsObject = new sdk.AdSet(objectId);

          break;
        case 'ad':
          insightsObject = new sdk.Ad(objectId);

          break;
        default:
          throw new Error(`Invalid insights level: ${level}`);

      }

      // Build insights parameters
      const insightsParams = this.buildInsightsParams(params);


      // Fetch insights
      const response = await this.client.makeRequest(adAccountId, () =>
        insightsObject.getInsights([], insightsParams)
      ) as any;


      const insights: FacebookInsights[] = response.map(
        (insight: any) => this.parseInsight(insight)
      );


      // Cache the results
      await this.client
        .getRedis()
        .setex(
          `facebook:cache:${cacheKey}`,
          ttl,
          JSON.stringify(insights)
        );


      FacebookErrorLogger.info('Successfully fetched insights', {
        objectId,
        level,
        count: insights.length,
      });


      return {
        success: true,
        data: insights,
        syncedAt: Date.now(),
        fromCache: false,
      };
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_insights',
        objectId,
        level,
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
   * Get insights with caching
   */
  async getCachedInsights(
    objectId: string,
    adAccountId: string,
    level: InsightsLevel,
    params: Partial<InsightsParams>
  ): Promise<FacebookInsights[]> {
    const cacheKey = this.generateCacheKey(objectId, level, params);

    const ttl = 900; // 15 minutes

    try {
      const result = await this.client.getCached<FacebookInsights[]>(
        cacheKey,
        async () => {
          const insights = await this.getInsights(
            objectId,
            adAccountId,
            level,
            params
          );

          return insights.data || [];
        },
        ttl
      );


      return result.data;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_cached_insights',
        objectId,
        level,
      });


      return [];
    }
  }

  /**
   * Get performance summary
   */
  async getPerformanceSummary(
    objectId: string,
    adAccountId: string,
    level: InsightsLevel,
    datePreset: InsightsDatePreset = 'last_7d'
  ): Promise<{
    impressions: number;
    reach: number;
    clicks: number;
    spend: number;
    cpm: number;
    cpc: number;
    ctr: number;
  } | null> {
    try {
      const result = await this.getInsights(objectId, adAccountId, level, {
        level,
        date_preset: datePreset,
        fields: [
          'impressions',
          'reach',
          'clicks',
          'spend',
          'cpm',
          'cpc',
          'ctr',
        ],
      });


      if (!result.success || !result.data || result.data.length === 0) {
        return null;
      }

      // Aggregate all data points
      const summary = result.data.reduce(
        (acc, insight) => ({
          impressions: acc.impressions + (insight.impressions || 0),
          reach: acc.reach + (insight.reach || 0),
          clicks: acc.clicks + (insight.clicks || 0),
          spend: acc.spend + (insight.spend || 0),
          cpm: 0, // Will calculate after
          cpc: 0, // Will calculate after
          ctr: 0, // Will calculate after
        }),
        { impressions: 0, reach: 0, clicks: 0, spend: 0, cpm: 0, cpc: 0, ctr: 0 }
      );


      // Calculate averages
      if (summary.impressions > 0) {
        summary.cpm = (summary.spend / summary.impressions) * 1000;
        summary.ctr = (summary.clicks / summary.impressions) * 100;
      }

      if (summary.clicks > 0) {
        summary.cpc = summary.spend / summary.clicks;
      }

      return summary;
    } catch (error: any) {
      FacebookErrorLogger.log(error, {
        operation: 'get_performance_summary',
        objectId,
        level,
      });


      return null;
    }
  }

  /**
   * Get time series insights
   */
  async getTimeSeriesInsights(
    objectId: string,
    adAccountId: string,
    level: InsightsLevel,
    timeRange: { since: string; until: string },
    timeIncrement: number | 'all_days' | 'monthly' = 1
  ): Promise<FacebookInsights[]> {
    const result = await this.getInsights(objectId, adAccountId, level, {
      level,
      time_range: timeRange,
      time_increment: timeIncrement,
    });


    return result.data || [];
  }

  /**
   * Get breakdown insights (e.g., by age, gender, device)
   */
  async getBreakdownInsights(
    objectId: string,
    adAccountId: string,
    level: InsightsLevel,
    breakdown: string[],
    datePreset: InsightsDatePreset = 'last_7d'
  ): Promise<FacebookInsights[]> {
    const result = await this.getInsights(objectId, adAccountId, level, {
      level,
      date_preset: datePreset,
      breakdowns: breakdown as any,
    });


    return result.data || [];
  }

  /**
   * Build insights parameters
   */
  private buildInsightsParams(params: Partial<InsightsParams>): any {
    const insightsParams: any = {
      level: params.level || 'account',
    };

    if (params.date_preset) {
      insightsParams.date_preset = params.date_preset;
    }

    if (params.time_range) {
      insightsParams.time_range = params.time_range;
    }

    if (params.time_increment !== undefined) {
      insightsParams.time_increment = params.time_increment;
    }

    if (params.fields && params.fields.length > 0) {
      insightsParams.fields = params.fields.join(',');

    }

    if (params.filtering && params.filtering.length > 0) {
      insightsParams.filtering = params.filtering;
    }

    if (params.breakdowns && params.breakdowns.length > 0) {
      insightsParams.breakdowns = params.breakdowns;
    }

    if (params.action_attribution_windows) {
      insightsParams.action_attribution_windows = params.action_attribution_windows;
    }

    if (params.action_breakdowns) {
      insightsParams.action_breakdowns = params.action_breakdowns;
    }

    if (params.action_report_time) {
      insightsParams.action_report_time = params.action_report_time;
    }

    if (params.limit) {
      insightsParams.limit = params.limit;
    }

    return insightsParams;
  }

  /**
   * Parse insight object
   */
  private parseInsight(insight: any): FacebookInsights {
    return {
      date_start: insight.date_start,
      date_stop: insight.date_stop,
      impressions: insight.impressions ? parseInt(insight.impressions) : undefined,
      reach: insight.reach ? parseInt(insight.reach) : undefined,
      frequency: insight.frequency ? parseFloat(insight.frequency) : undefined,
      clicks: insight.clicks ? parseInt(insight.clicks) : undefined,
      unique_clicks: insight.unique_clicks ? parseInt(insight.unique_clicks) : undefined,
      spend: insight.spend ? parseFloat(insight.spend) : undefined,
      cpm: insight.cpm ? parseFloat(insight.cpm) : undefined,
      cpp: insight.cpp ? parseFloat(insight.cpp) : undefined,
      cpc: insight.cpc ? parseFloat(insight.cpc) : undefined,
      ctr: insight.ctr ? parseFloat(insight.ctr) : undefined,
      unique_ctr: insight.unique_ctr ? parseFloat(insight.unique_ctr) : undefined,
      actions: insight.actions,
      action_values: insight.action_values,
      cost_per_action_type: insight.cost_per_action_type,
      conversions: insight.conversions,
      conversion_values: insight.conversion_values,
      cost_per_conversion: insight.cost_per_conversion,
      video_avg_time_watched_actions: insight.video_avg_time_watched_actions,
      video_p25_watched_actions: insight.video_p25_watched_actions,
      video_p50_watched_actions: insight.video_p50_watched_actions,
      video_p75_watched_actions: insight.video_p75_watched_actions,
      video_p100_watched_actions: insight.video_p100_watched_actions,
      website_ctr: insight.website_ctr,
      website_purchase_roas: insight.website_purchase_roas,
      purchase_roas: insight.purchase_roas,
      mobile_app_purchase_roas: insight.mobile_app_purchase_roas,
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    objectId: string,
    level: InsightsLevel,
    params: Partial<InsightsParams>
  ): string {
    const keyParts = [
      'insights',
      level,
      objectId,
      params.date_preset || '',
      params.time_range ? `${params.time_range.since}_${params.time_range.until}` : '',
      params.time_increment || '',
      params.breakdowns?.join(',') || '',
    ];

    return keyParts.filter(Boolean).join(':');

  }

  /**
   * Invalidate insights cache
   */
  async invalidateCache(objectId?: string, level?: InsightsLevel): Promise<void> {
    if (objectId && level) {
      await this.client.invalidateCachePattern(`insights:${level}:${objectId}*`);

    } else {
      await this.client.invalidateCachePattern('insights:*');

    }
  }
}
