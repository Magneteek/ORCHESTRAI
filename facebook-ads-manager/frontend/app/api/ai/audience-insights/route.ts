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
import { getAudienceData, getPerformanceBySegment } from '@/lib/ai/audience-data';
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
