import { prisma } from '@/lib/db/prisma';
import type {
  AnalyticsData,
  TimeSeriesDataPoint,
  TopCampaign,
} from '@/types/analytics';

/**
 * Shared analytics aggregation over the local performance_metrics table
 * (populated by POST /api/sync/all). No live Facebook calls.
 *
 * Both /api/analytics and /api/analytics/simple read through this so the two
 * pages can never disagree about the same numbers again.
 *
 * Unit contract: ctr and roas are ratios, not percentages.
 *   ctr  = clicks / impressions   (the UI multiplies by 100)
 *   roas = revenue / spend
 * funnelData percentages ARE percentages (0-100), matching the original
 * /api/analytics contract the Analytics page renders against.
 */

/**
 * One row per calendar day, aggregated across every ad in scope.
 *
 * Structurally compatible with lib/ai/types' HistoricalPerformanceData, which
 * is what the AI routes consume. Defined here rather than imported so the
 * analytics layer does not depend on the AI layer.
 *
 * Unit contract matches buildAnalyticsData: ctr and roas are ratios.
 */
export interface DailyPerformance {
  /** YYYY-MM-DD */
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpm: number;
  reach: number;
  frequency: number;
}

export interface DailyPerformanceParams {
  /** AdAccount UUID (not the Facebook act_ id) */
  adAccountId: string;
  /** Campaign UUID (not the Facebook campaign id) */
  campaignId?: string;
  since: Date;
  until?: Date;
}

/**
 * Daily performance for one ad account, optionally narrowed to one campaign.
 *
 * Every rate is recomputed from the day's summed totals rather than averaged
 * across the per-ad rows: an average of per-ad CTRs weights a 10-impression ad
 * the same as a 10,000-impression one.
 *
 * `reach` is summed across ads, so it double-counts anyone reached by more than
 * one ad, and the derived `frequency` is an upper bound. Facebook only
 * deduplicates reach at the account level, which this per-ad table cannot
 * reconstruct.
 */
export async function getDailyPerformance({
  adAccountId,
  campaignId,
  since,
  until,
}: DailyPerformanceParams): Promise<DailyPerformance[]> {
  const grouped = await prisma.performanceMetric.groupBy({
    by: ['date'],
    where: {
      date: { gte: since, ...(until && { lte: until }) },
      ad: {
        adSet: {
          campaign: {
            adAccountId,
            ...(campaignId && { id: campaignId }),
          },
        },
      },
    },
    _sum: {
      spend: true,
      impressions: true,
      clicks: true,
      conversions: true,
      purchaseValue: true,
      reach: true,
    },
    orderBy: { date: 'asc' },
  });

  return grouped.map((row) => {
    const spend = row._sum.spend ?? 0;
    const impressions = Number(row._sum.impressions ?? 0);
    const clicks = Number(row._sum.clicks ?? 0);
    const conversions = Number(row._sum.conversions ?? 0);
    const revenue = row._sum.purchaseValue ?? 0;
    const reach = Number(row._sum.reach ?? 0);

    return {
      date: row.date.toISOString().split('T')[0],
      spend,
      impressions,
      clicks,
      conversions,
      revenue,
      roas: spend > 0 ? revenue / spend : 0,
      ctr: impressions > 0 ? clicks / impressions : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      reach,
      frequency: reach > 0 ? impressions / reach : 0,
    };
  });
}

export interface CampaignTotals {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  /** Ratio, not a percentage — the UI's formatPercentage multiplies by 100. */
  ctr: number;
  roas: number;
  cpc: number;
  cpa: number;
}

/**
 * Lifetime-to-date totals per campaign, keyed by Campaign.id (the UUID).
 *
 * Feeds the spend/ROAS/CTR columns of the campaigns list, which read a
 * `campaign.insights` object. Campaigns with no metric rows are absent from
 * the map rather than present with zeros, so the table can render "-" for
 * "never delivered" instead of a misleading 0.00.
 */
export async function getCampaignTotals(
  campaignIds: string[]
): Promise<Map<string, CampaignTotals>> {
  if (campaignIds.length === 0) return new Map();

  const grouped = await prisma.performanceMetric.groupBy({
    by: ['adId'],
    where: { ad: { adSet: { campaign: { id: { in: campaignIds } } } } },
    _sum: {
      spend: true,
      impressions: true,
      clicks: true,
      conversions: true,
      purchaseValue: true,
    },
  });

  // groupBy cannot group by a relation field, so map each ad back to its campaign.
  const ads = await prisma.ad.findMany({
    where: { id: { in: grouped.map((g) => g.adId) } },
    select: { id: true, adSet: { select: { campaignId: true } } },
  });
  const campaignByAd = new Map(ads.map((a) => [a.id, a.adSet.campaignId]));

  const acc = new Map<
    string,
    { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }
  >();

  for (const row of grouped) {
    const campaignId = campaignByAd.get(row.adId);
    if (!campaignId) continue;

    const t =
      acc.get(campaignId) ??
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 };
    t.spend += row._sum.spend ?? 0;
    t.impressions += Number(row._sum.impressions ?? 0);
    t.clicks += Number(row._sum.clicks ?? 0);
    t.conversions += Number(row._sum.conversions ?? 0);
    t.revenue += row._sum.purchaseValue ?? 0;
    acc.set(campaignId, t);
  }

  return new Map(
    Array.from(acc.entries()).map(([id, t]) => [
      id,
      {
        ...t,
        ctr: t.impressions > 0 ? t.clicks / t.impressions : 0,
        roas: t.spend > 0 ? t.revenue / t.spend : 0,
        cpc: t.clicks > 0 ? t.spend / t.clicks : 0,
        cpa: t.conversions > 0 ? t.spend / t.conversions : 0,
      },
    ])
  );
}

export class NoAdAccountsError extends Error {
  constructor() {
    super('No ad accounts found');
    this.name = 'NoAdAccountsError';
  }
}

export interface AggregateParams {
  userId: string;
  fromDate: Date;
  toDate: Date;
  /** AdAccount UUIDs (not Facebook act_ ids) */
  accountIds?: string[];
  /** Facebook campaign ids */
  campaignIds?: string[];
}

export async function buildAnalyticsData({
  userId,
  fromDate,
  toDate,
  accountIds,
  campaignIds,
}: AggregateParams): Promise<AnalyticsData> {
  // Resolve ad accounts the user can reach: Organization -> FBBusinessAccount -> AdAccount
  const adAccounts = await prisma.adAccount.findMany({
    where: {
      facebookBusinessAccount: {
        organization: { users: { some: { id: userId } } },
      },
      ...(accountIds && { id: { in: accountIds } }),
    },
    select: { id: true },
  });

  if (adAccounts.length === 0) {
    throw new NoAdAccountsError();
  }

  const metricRows = await prisma.performanceMetric.findMany({
    where: {
      date: { gte: fromDate, lte: toDate },
      ad: {
        adSet: {
          campaign: {
            adAccountId: { in: adAccounts.map((a) => a.id) },
            ...(campaignIds && { campaignId: { in: campaignIds } }),
          },
        },
      },
    },
    include: {
      ad: {
        select: {
          adSet: {
            select: {
              campaign: { select: { id: true, campaignId: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  let spend = 0;
  let impressions = 0;
  let clicks = 0;
  let conversions = 0;
  let revenue = 0;

  const timeSeriesMap = new Map<string, TimeSeriesDataPoint & { revenue: number }>();
  const campaignMap = new Map<
    string,
    {
      id: string;
      name: string;
      impressions: number;
      clicks: number;
      spend: number;
      conversions: number;
      revenue: number;
    }
  >();

  for (const row of metricRows) {
    const rowImpressions = Number(row.impressions);
    const rowClicks = Number(row.clicks);
    const rowConversions = Number(row.conversions);
    const rowRevenue = row.purchaseValue ?? 0;

    spend += row.spend;
    impressions += rowImpressions;
    clicks += rowClicks;
    conversions += rowConversions;
    revenue += rowRevenue;

    const dateKey = row.date.toISOString().split('T')[0];
    if (!timeSeriesMap.has(dateKey)) {
      timeSeriesMap.set(dateKey, {
        date: dateKey,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        ctr: 0,
        roas: 0,
        revenue: 0,
      });
    }
    const point = timeSeriesMap.get(dateKey)!;
    point.impressions += rowImpressions;
    point.clicks += rowClicks;
    point.spend += row.spend;
    point.conversions += rowConversions;
    point.revenue += rowRevenue;

    const campaign = row.ad.adSet.campaign;
    if (!campaignMap.has(campaign.id)) {
      campaignMap.set(campaign.id, {
        id: campaign.campaignId,
        name: campaign.name,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      });
    }
    const c = campaignMap.get(campaign.id)!;
    c.impressions += rowImpressions;
    c.clicks += rowClicks;
    c.spend += row.spend;
    c.conversions += rowConversions;
    c.revenue += rowRevenue;
  }

  const timeSeries: TimeSeriesDataPoint[] = Array.from(timeSeriesMap.values()).map(
    ({ revenue: dayRevenue, ...point }) => ({
      ...point,
      ctr: point.impressions > 0 ? point.clicks / point.impressions : 0,
      roas: point.spend > 0 ? dayRevenue / point.spend : 0,
    })
  );

  const topCampaigns: TopCampaign[] = Array.from(campaignMap.values())
    .map((c) => ({
      id: c.id,
      name: c.name,
      impressions: c.impressions,
      clicks: c.clicks,
      spend: c.spend,
      conversions: c.conversions,
      revenue: c.revenue,
      ctr: c.impressions > 0 ? c.clicks / c.impressions : 0,
      roas: c.spend > 0 ? c.revenue / c.spend : 0,
      cpa: c.conversions > 0 ? c.spend / c.conversions : 0,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  return {
    metrics: {
      spend,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr: impressions > 0 ? clicks / impressions : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      roas: spend > 0 ? revenue / spend : 0,
      cpa: conversions > 0 ? spend / conversions : 0,
    },
    timeSeries,
    topCampaigns,
    funnelData: [
      { name: 'Impressions', value: impressions, percentage: 100 },
      {
        name: 'Clicks',
        value: clicks,
        percentage: impressions > 0 ? (clicks / impressions) * 100 : 0,
        dropoffRate: impressions > 0 ? ((impressions - clicks) / impressions) * 100 : 0,
      },
      {
        name: 'Conversions',
        value: conversions,
        percentage: impressions > 0 ? (conversions / impressions) * 100 : 0,
        dropoffRate: clicks > 0 ? ((clicks - conversions) / clicks) * 100 : 0,
      },
    ],
  };
}
