/**
 * Analytics API Route
 * Fetch aggregated analytics data from Facebook Insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { FacebookClient } from '@/lib/facebook/client';
import { InsightsSync } from '@/lib/facebook/sync/insights';
import Redis from 'ioredis';
import type {
  AnalyticsData,
  AnalyticsMetrics,
  TimeSeriesDataPoint,
  TopCampaign,
  FunnelStage,
} from '@/types/analytics';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const accountIds = searchParams.get('accountIds')?.split(',');
    const campaignIds = searchParams.get('campaignIds')?.split(',');

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: { message: 'Date range required', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid date format', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `analytics:${session.user.id}:${from}:${to}:${accountIds?.join(',') || 'all'}:${campaignIds?.join(',') || 'all'}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return NextResponse.json({ success: true, data });
    }

    // Get user's ad accounts with Facebook credentials
    const adAccounts = await prisma.adAccount.findMany({
      where: {
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        },
        ...(accountIds && { accountId: { in: accountIds } }),
      },
      include: {
        facebookBusinessAccount: true,
      },
    });

    if (adAccounts.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'No ad accounts found', code: 'NO_AD_ACCOUNTS' } },
        { status: 404 }
      );
    }

    // Fetch insights for all accounts
    const allInsights: any[] = [];
    const campaignPerformance: Map<string, any> = new Map();

    for (const account of adAccounts) {
      try {
        if (!account.facebookBusinessAccount?.accessTokenEncrypted) continue;

        const clientConfig = {
          appId: process.env.FACEBOOK_APP_ID || '',
          appSecret: process.env.FACEBOOK_APP_SECRET || '',
          apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0',
          accessToken: account.facebookBusinessAccount.accessTokenEncrypted,
        };

        const client = new FacebookClient(clientConfig, redis);
        const insightsSync = new InsightsSync(client);

        // Get account-level insights
        const accountInsights = await insightsSync.getTimeSeriesInsights(
          account.accountId,
          account.accountId,
          'account',
          {
            since: fromDate.toISOString().split('T')[0],
            until: toDate.toISOString().split('T')[0],
          },
          1 // Daily data
        );

        allInsights.push(...accountInsights);

        // Get campaign-level insights
        const campaigns = await prisma.campaign.findMany({
          where: {
            adAccountId: account.id,
            ...(campaignIds && { campaignId: { in: campaignIds } }),
          },
        });

        for (const campaign of campaigns) {
          const campaignInsights = await insightsSync.getCampaignInsights(
            campaign.campaignId,
            account.accountId,
            {
              date_preset: 'maximum',
              time_range: {
                since: fromDate.toISOString().split('T')[0],
                until: toDate.toISOString().split('T')[0],
              },
            }
          );

          if (campaignInsights.success && campaignInsights.data) {
            const aggregated = aggregateInsights(campaignInsights.data);
            campaignPerformance.set(campaign.campaignId, {
              id: campaign.campaignId,
              name: campaign.name,
              ...aggregated,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching insights for account ${account.accountId}:`, error);
      }
    }

    // Aggregate all insights
    const aggregated = aggregateInsights(allInsights);

    // Process time series data
    const timeSeriesMap = new Map<string, TimeSeriesDataPoint>();
    allInsights.forEach((insight) => {
      const date = insight.date_start;
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, {
          date,
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          ctr: 0,
          roas: 0,
        });
      }

      const point = timeSeriesMap.get(date)!;
      point.impressions += insight.impressions || 0;
      point.clicks += insight.clicks || 0;
      point.spend += insight.spend || 0;
      point.conversions += getConversions(insight);
      point.ctr = point.clicks > 0 ? point.clicks / point.impressions : 0;
      point.roas = point.spend > 0 ? getRevenue(insight) / point.spend : 0;
    });

    const timeSeries = Array.from(timeSeriesMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get top campaigns
    const topCampaigns: TopCampaign[] = Array.from(campaignPerformance.values())
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    // Calculate funnel data
    const funnelData = calculateFunnelData(aggregated);

    // Build response data
    const analyticsData: AnalyticsData = {
      metrics: {
        spend: aggregated.spend,
        impressions: aggregated.impressions,
        clicks: aggregated.clicks,
        conversions: aggregated.conversions,
        ctr: aggregated.clicks > 0 ? aggregated.clicks / aggregated.impressions : 0,
        cpc: aggregated.clicks > 0 ? aggregated.spend / aggregated.clicks : 0,
        cpm: aggregated.impressions > 0 ? (aggregated.spend / aggregated.impressions) * 1000 : 0,
        roas: aggregated.spend > 0 ? aggregated.revenue / aggregated.spend : 0,
      },
      timeSeries,
      topCampaigns,
      funnelData,
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(analyticsData));

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch analytics',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Aggregate insights data
 */
function aggregateInsights(insights: any[]): {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
} {
  return insights.reduce(
    (acc, insight) => ({
      impressions: acc.impressions + (insight.impressions || 0),
      clicks: acc.clicks + (insight.clicks || 0),
      spend: acc.spend + (insight.spend || 0),
      conversions: acc.conversions + getConversions(insight),
      revenue: acc.revenue + getRevenue(insight),
    }),
    { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 }
  );
}

/**
 * Extract conversions from insight actions
 */
function getConversions(insight: any): number {
  if (!insight.actions) return 0;

  const conversionActions = insight.actions.filter((action: any) =>
    ['purchase', 'lead', 'complete_registration', 'add_to_cart'].includes(
      action.action_type
    )
  );

  return conversionActions.reduce(
    (sum: number, action: any) => sum + parseInt(action.value || '0', 10),
    0
  );
}

/**
 * Extract revenue from insight action values
 */
function getRevenue(insight: any): number {
  if (!insight.action_values) return 0;

  const purchaseValue = insight.action_values.find(
    (av: any) => av.action_type === 'purchase'
  );

  return purchaseValue ? parseFloat(purchaseValue.value || '0') : 0;
}

/**
 * Calculate conversion funnel data
 */
function calculateFunnelData(aggregated: {
  impressions: number;
  clicks: number;
  conversions: number;
}): FunnelStage[] {
  const stages: FunnelStage[] = [
    {
      name: 'Impressions',
      value: aggregated.impressions,
      percentage: 100,
    },
    {
      name: 'Clicks',
      value: aggregated.clicks,
      percentage: (aggregated.clicks / aggregated.impressions) * 100,
      dropoffRate:
        ((aggregated.impressions - aggregated.clicks) / aggregated.impressions) * 100,
    },
    {
      name: 'Conversions',
      value: aggregated.conversions,
      percentage: (aggregated.conversions / aggregated.impressions) * 100,
      dropoffRate: ((aggregated.clicks - aggregated.conversions) / aggregated.clicks) * 100,
    },
  ];

  return stages;
}
