/**
 * Audience Insights API
 * GET /api/ai/audience-insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  analyzeAudience,
  detectAudienceFatigue,
  generateLookalikeRecommendations,
  analyzeBudgetAllocation,
} from '@/lib/ai/audience-insights';
import { prisma } from '@/lib/db/prisma';
import { getDailyPerformance } from '@/lib/analytics/aggregate';
import { getDemographicPerformance } from '@/lib/ai/account-context';
import { decrypt } from '@/lib/utils/encryption';
import { RateLimiter } from '@/lib/redis/client';
import { subDays } from 'date-fns';

/**
 * POST /api/ai/audience-insights
 * Generate audience insights
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitKey = `audience-insights:${session.user.id}`;
    const rateLimit = await RateLimiter.checkLimit(rateLimitKey, 5, 300); // 5 per 5 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { adAccountId, campaignId } = body;

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    // Verify account access
    const account = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Ad account not found or access denied' },
        { status: 404 }
      );
    }

    // Get audience data
    const audienceData = await getAudienceData(adAccountId, campaignId);
    const performanceBySegment = await getPerformanceBySegment(adAccountId, campaignId);

    if (!audienceData || Object.keys(performanceBySegment).length === 0) {
      return NextResponse.json(
        { error: 'Insufficient audience data for analysis' },
        { status: 400 }
      );
    }

    // Get campaign objective
    const campaign = await prisma.campaign.findFirst({
      where: campaignId ? { id: campaignId } : { adAccountId },
    });

    // Run audience analysis
    const insights = await analyzeAudience({
      adAccountId,
      audienceData,
      performanceBySegment,
      campaignObjective: campaign?.objective || 'CONVERSIONS',
      currency: account.currency,
    });

    // Generate lookalike recommendations
    const lookalikeRecommendations = await generateLookalikeRecommendations(
      insights.topPerformingSegments,
      campaign?.objective || 'CONVERSIONS'
    );

    // Analyze budget allocation
    const budgetAnalysis = await analyzeBudgetAllocation(performanceBySegment);

    return NextResponse.json(
      {
        success: true,
        insights,
        lookalikeRecommendations,
        budgetAnalysis,
        meta: {
          topSegments: insights.topPerformingSegments.length,
          underperformingSegments: insights.underperformingSegments.length,
          expansionOpportunities: insights.expansionOpportunities.length,
        },
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Audience insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audience insights', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/audience-insights?adAccountId=xxx
 * Get recent audience insights
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');
    const checkFatigue = searchParams.get('checkFatigue') === 'true';

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    // Verify account access
    const account = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Ad account not found or access denied' },
        { status: 404 }
      );
    }

    // Get recent insights
    const insights = await prisma.aiAnalysis.findMany({
      where: {
        adAccountId,
        analysisType: 'audience_insights',
        analyzedAt: {
          gte: subDays(new Date(), 7),
        },
      },
      orderBy: { analyzedAt: 'desc' },
      take: 5,
    });

    let fatigueAnalysis = null;
    if (checkFatigue) {
      // Get historical performance for fatigue detection
      const historicalData = await getHistoricalPerformance(adAccountId, 14);
      if (historicalData.length >= 14) {
        fatigueAnalysis = await detectAudienceFatigue(historicalData);
      }
    }

    return NextResponse.json({
      success: true,
      insights: insights.map(i => ({
        id: i.id,
        analyzedAt: i.analyzedAt,
        confidence: i.confidence,
        insights: i.insights,
        recommendations: i.recommendations,
      })),
      fatigueAnalysis,
    });
  } catch (error: any) {
    console.error('Get audience insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audience insights' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get audience data
 */
async function getAudienceData(adAccountId: string, campaignId?: string): Promise<any> {
  // Real age, gender, country, device and placement performance from Meta's
  // breakdowns. This previously returned a hardcoded shape of zeros, because
  // performance_metrics carries no demographic dimension — so the analysis was
  // producing confident-sounding audience findings from an empty input.
  const empty = {
    demographics: { age: {}, gender: {} },
    geographic: { country: {}, region: {} },
    device: {},
    placement: {},
  };

  const account = await prisma.adAccount.findFirst({
    where: { id: adAccountId },
    include: { facebookBusinessAccount: true },
  });
  if (!account?.facebookBusinessAccount?.accessTokenEncrypted) return empty;

  let token: string;
  try {
    token = decrypt(account.facebookBusinessAccount.accessTokenEncrypted);
  } catch {
    return empty;
  }

  const since = subDays(new Date(), 30);
  const data = await getDemographicPerformance(
    account.accountId,
    token,
    since.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );

  // Falling back to the empty shape keeps the prompt's keys stable; the values
  // being empty is itself the signal that nothing was retrievable.
  return data ?? empty;
}


/**
 * Helper: Get performance by segment
 */
async function getPerformanceBySegment(
  adAccountId: string,
  campaignId?: string
): Promise<Record<string, any>> {
  // Campaign is the only segmentation performance_metrics can express. Real
  // audience segments (age, gender, placement) need Facebook's breakdown
  // parameter, which the sync does not request — see getAudienceData.
  const metrics = await prisma.performanceMetric.groupBy({
    by: ['adId'],
    where: {
      date: { gte: subDays(new Date(), 30) },
      ad: {
        adSet: {
          campaign: { adAccountId, ...(campaignId && { id: campaignId }) },
        },
      },
    },
    _sum: {
      spend: true,
      clicks: true,
      impressions: true,
      conversions: true,
      purchaseValue: true,
    },
  });

  if (metrics.length === 0) return {};

  // Map each ad back to its campaign so the totals can be keyed by campaign.
  const ads = await prisma.ad.findMany({
    where: { id: { in: metrics.map((m) => m.adId) } },
    select: { id: true, adSet: { select: { campaign: { select: { name: true } } } } },
  });
  const campaignByAd = new Map(ads.map((a) => [a.id, a.adSet.campaign.name]));

  const totals = new Map<
    string,
    { spend: number; revenue: number; conversions: number; clicks: number; impressions: number }
  >();

  for (const row of metrics) {
    const key = campaignByAd.get(row.adId) ?? 'unknown-campaign';
    const acc =
      totals.get(key) ??
      { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 };

    acc.spend += row._sum.spend ?? 0;
    acc.revenue += row._sum.purchaseValue ?? 0;
    acc.conversions += Number(row._sum.conversions ?? 0);
    acc.clicks += Number(row._sum.clicks ?? 0);
    acc.impressions += Number(row._sum.impressions ?? 0);
    totals.set(key, acc);
  }

  return Object.fromEntries(
    Array.from(totals.entries()).map(([name, t]) => [
      name,
      {
        spend: t.spend,
        conversions: t.conversions,
        // Ratios from summed totals, never an average of per-ad ratios.
        roas: t.spend > 0 ? t.revenue / t.spend : 0,
        ctr: t.impressions > 0 ? t.clicks / t.impressions : 0,
        cpa: t.conversions > 0 ? t.spend / t.conversions : 0,
      },
    ])
  );
}

/**
 * Helper: Get historical performance for fatigue detection
 */
async function getHistoricalPerformance(
  adAccountId: string,
  days: number
): Promise<Array<{ date: string; ctr: number; cpm: number; frequency: number }>> {
  const daily = await getDailyPerformance({
    adAccountId,
    since: subDays(new Date(), days),
  });

  return daily.map((d) => ({
    date: d.date,
    ctr: d.ctr,
    cpm: d.cpm,
    // Reach is summed across ads, so frequency is an upper bound. Fatigue
    // detection reads its trend, not its absolute level, so the bias is
    // constant and does not distort the signal.
    frequency: d.frequency,
  }));
}
