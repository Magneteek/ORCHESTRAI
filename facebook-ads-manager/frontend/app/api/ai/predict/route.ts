/**
 * Performance Prediction API
 * POST /api/ai/predict
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { predictPerformance } from '@/lib/ai/performance-predictor';
import { prisma } from '@/lib/db/prisma';
import { getDailyPerformance } from '@/lib/analytics/aggregate';
import { getCampaignContext } from '@/lib/ai/campaign-context';
import type { HistoricalPerformanceData } from '@/lib/ai/types';
import { subDays } from 'date-fns';
import { RateLimiter } from '@/lib/redis/client';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting (5 predictions per minute per user)
    const rateLimitKey = `predict:${session.user.id}`;
    const rateLimit = await RateLimiter.checkLimit(rateLimitKey, 5, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      adAccountId,
      campaignId,
      predictionDays = 7,
    } = body;

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

    // Get historical data (last 30 days)
    const historicalData = await getHistoricalData(adAccountId, campaignId);

    if (historicalData.length < 7) {
      return NextResponse.json(
        { error: 'Insufficient historical data (minimum 7 days required)' },
        { status: 400 }
      );
    }

    // Get campaign context
    const campaignContext = await getCampaignContext(adAccountId, campaignId);

    // Run prediction
    const prediction = await predictPerformance({
      adAccountId,
      historicalData,
      campaignContext,
      predictionDays,
    });

    return NextResponse.json(
      {
        success: true,
        prediction,
        meta: {
          historicalDataPoints: historicalData.length,
          predictionDays,
          confidence: prediction.confidence,
        },
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Performance prediction API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate prediction',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get historical performance data
 *
 * Reads performance_metrics, populated by the sync in lib/facebook/sync-account.
 * ctr and roas come back as ratios, which is what the predictor's prompt
 * builder expects (it multiplies ctr by 100 for display).
 */
async function getHistoricalData(
  adAccountId: string,
  campaignId?: string
): Promise<HistoricalPerformanceData[]> {
  return getDailyPerformance({
    adAccountId,
    campaignId,
    since: subDays(new Date(), 30),
  });
}

/**
 * GET /api/ai/predict?adAccountId=xxx
 * Get recent predictions for an account
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');

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

    // Get recent predictions
    const predictions = await prisma.aiAnalysis.findMany({
      where: {
        adAccountId,
        analysisType: 'performance_prediction',
        analyzedAt: {
          gte: subDays(new Date(), 7),
        },
      },
      orderBy: { analyzedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      predictions: predictions.map(p => ({
        id: p.id,
        analyzedAt: p.analyzedAt,
        confidence: p.confidence,
        insights: p.insights,
        recommendations: p.recommendations,
      })),
    });
  } catch (error: any) {
    console.error('Get predictions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
