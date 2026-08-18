/**
 * Copy Optimization API
 * POST /api/ai/optimize-copy
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { optimizeAdCopy, generateABTestVariants } from '@/lib/ai/copy-optimizer';
import { prisma } from '@/lib/db/prisma';
import { getAdPerformance } from '@/lib/analytics/aggregate';
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
      adCopy: suppliedAdCopy,
      adId,
      campaignObjective,
      targetAudience,
      generateVariants = false,
    } = body;

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    // Nothing in the app builds an adCopy payload — the tab only reads stored
    // results — so requiring one in the body meant this route could never be
    // called from the UI at all. Assemble it from what we already hold when
    // the caller does not supply one.
    const adCopy =
      suppliedAdCopy ?? (await buildAdCopyFromStored(adAccountId, adId));

    if (!adCopy) {
      return NextResponse.json(
        {
          error:
            'No ad copy available to analyse. This account has no ad with ' +
            'delivery in the last 30 days whose creative carries a headline ' +
            'and body text.',
        },
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


/**
 * Assemble an ad-copy payload from what is already stored: the creative's own
 * text plus that ad's delivery.
 *
 * Picks the highest-spending ad with delivery, since optimising copy for an ad
 * nobody sees is wasted effort. Dynamic and Advantage+ creatives keep their
 * text in asset_feed_spec as variant arrays; the first variant is the one worth
 * optimising against, and the rest are passed along so the model can see the
 * full rotation, including any broken assets.
 */
async function buildAdCopyFromStored(
  adAccountId: string,
  adId?: string
): Promise<any | null> {
  const since = subDays(new Date(), 30);
  const performance = await getAdPerformance(adAccountId, since);
  if (performance.length === 0) return null;

  const target = adId
    ? performance.find((p) => p.id === adId) ?? performance[0]
    : performance[0];

  const ad = await prisma.ad.findFirst({
    where: { id: target.id },
    select: { name: true, creative: true },
  });
  if (!ad) return null;

  const creative: any = ad.creative ?? {};
  const afs = creative.asset_feed_spec ?? {};
  const story = creative.object_story_spec?.link_data ?? {};

  const text = (items: any): string[] => {
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.map((i) => (typeof i === 'string' ? i : i?.text ?? '')).filter(Boolean);
  };

  const headlines = text(afs.titles);
  const bodies = text(afs.bodies);
  const descriptions = text(afs.descriptions);

  const headline = headlines[0] ?? creative.title ?? story.name ?? '';
  const primaryText = bodies[0] ?? creative.body ?? story.message ?? '';
  if (!headline || !primaryText) return null;

  return {
    headline,
    primaryText,
    description: descriptions[0] ?? '',
    callToAction:
      (Array.isArray(afs.call_to_action_types) ? afs.call_to_action_types[0] : null) ??
      creative.call_to_action_type ??
      story.call_to_action?.type ??
      'LEARN_MORE',
    performance: {
      ctr: target.linkCtr,
      impressions: target.impressions,
      clicks: target.linkClicks,
    },
    // Extra context the schema does not require but the prompt benefits from.
    adName: ad.name,
    allHeadlines: headlines,
    allBodies: bodies,
  };
}
