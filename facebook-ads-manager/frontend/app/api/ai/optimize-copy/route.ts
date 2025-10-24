/**
 * Copy Optimization API
 * POST /api/ai/optimize-copy
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { optimizeAdCopy, generateABTestVariants } from '@/lib/ai/copy-optimizer';
import { prisma } from '@/lib/db/prisma';
import { RateLimiter } from '@/lib/redis/client';
import { subDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (3 optimizations per minute per user)
    const rateLimitKey = `copy-optimize:${session.user.id}`;
    const rateLimit = await RateLimiter.checkLimit(rateLimitKey, 3, 60);

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
      adCopy,
      campaignObjective,
      targetAudience,
      generateVariants = false,
    } = body;

    if (!adAccountId || !adCopy) {
      return NextResponse.json(
        { error: 'adAccountId and adCopy are required' },
        { status: 400 }
      );
    }

    // Validate ad copy structure
    if (!adCopy.headline || !adCopy.primaryText || !adCopy.callToAction) {
      return NextResponse.json(
        { error: 'Ad copy must include headline, primaryText, and callToAction' },
        { status: 400 }
      );
    }

    if (!adCopy.performance || typeof adCopy.performance.ctr !== 'number') {
      return NextResponse.json(
        { error: 'Ad copy must include performance data with CTR' },
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

    // Run optimization
    const optimization = await optimizeAdCopy({
      adAccountId,
      adCopy,
      campaignObjective: campaignObjective || 'CONVERSIONS',
      targetAudience,
    });

    // Generate A/B test variants if requested
    let variants = null;
    if (generateVariants) {
      variants = await generateABTestVariants(
        adCopy.headline,
        optimization,
        3
      );
    }

    return NextResponse.json(
      {
        success: true,
        optimization,
        variants,
        meta: {
          suggestionsCount: optimization.suggestions.length,
          abTestsCount: optimization.abTestRecommendations.length,
        },
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Copy optimization API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to optimize copy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/optimize-copy?adAccountId=xxx
 * Get recent copy optimizations
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

    // Get recent optimizations
    const optimizations = await prisma.aiAnalysis.findMany({
      where: {
        adAccountId,
        analysisType: 'copy_optimization',
        analyzedAt: {
          gte: subDays(new Date(), 30),
        },
      },
      orderBy: { analyzedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      optimizations: optimizations.map(o => ({
        id: o.id,
        analyzedAt: o.analyzedAt,
        confidence: o.confidence,
        insights: o.insights,
        recommendations: o.recommendations,
      })),
    });
  } catch (error: any) {
    console.error('Get copy optimizations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch optimizations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/optimize-copy/batch
 * Batch optimize multiple ad copies
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { adAccountId, adCopies, campaignObjective } = body;

    if (!adAccountId || !adCopies || !Array.isArray(adCopies)) {
      return NextResponse.json(
        { error: 'adAccountId and adCopies array are required' },
        { status: 400 }
      );
    }

    if (adCopies.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 ad copies can be optimized at once' },
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

    // Process each ad copy
    const results = await Promise.all(
      adCopies.map(async (adCopy, index) => {
        try {
          const optimization = await optimizeAdCopy({
            adAccountId,
            adCopy,
            campaignObjective: campaignObjective || 'CONVERSIONS',
          });

          return {
            index,
            success: true,
            optimization,
          };
        } catch (error: any) {
          return {
            index,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      results,
      meta: {
        total: adCopies.length,
        successful: successCount,
        failed: adCopies.length - successCount,
      },
    });
  } catch (error: any) {
    console.error('Batch copy optimization API error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize copies' },
      { status: 500 }
    );
  }
}
