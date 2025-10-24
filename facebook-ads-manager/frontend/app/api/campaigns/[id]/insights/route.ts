import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails } from '@/lib/db/campaigns';
import { NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';
import type { InsightsDatePreset } from '@/types/facebook';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


/**
 * POST /api/campaigns/[id]/insights
 * Fetch fresh insights from Facebook for this campaign
 *
 * Body (optional):
 * - datePreset?: InsightsDatePreset (default: last_7d)
 * - timeRange?: { since: string, until: string } (YYYY-MM-DD format)
 * - fields?: string[] (specific metrics to fetch)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const {
      datePreset = 'last_7d',
      timeRange,
      fields = [
        'impressions',
        'reach',
        'frequency',
        'clicks',
        'unique_clicks',
        'spend',
        'cpm',
        'cpp',
        'cpc',
        'ctr',
        'unique_ctr',
        'actions',
        'conversions',
        'cost_per_action_type',
      ],
    } = body;

    // Get campaign to verify ownership
    const campaign = await getCampaignWithDetails(id, user.id, user.organizationId);

    // Get Facebook access token
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: campaign.adAccountId },
      include: {
        facebookBusinessAccount: {
          select: {
            accessTokenEncrypted: true,
          },
        },
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account');
    }

    // Initialize Facebook API
    const facebookAPI = getFacebookAPI(redis);
    facebookAPI.setAccessToken(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Fetch insights from Facebook
    const insights = await facebookAPI.insights.getCampaignInsights(
      campaign.campaignId,
      adAccount.accountId,
      {
        level: 'campaign',
        date_preset: datePreset as InsightsDatePreset,
        ...(timeRange && { time_range: timeRange }),
        fields,
      }
    );

    // Cache insights for 5 minutes
    const cacheKey = `campaign:insights:${campaign.campaignId}`;
    await redis.setex(cacheKey, 300, JSON.stringify(insights));

    return successResponse(
      {
        campaignId: campaign.campaignId,
        campaignName: campaign.name,
        datePreset,
        timeRange,
        insights,
        fetchedAt: new Date().toISOString(),
      },
      {
        message: 'Insights fetched successfully',
      }
    );
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * GET /api/campaigns/[id]/insights
 * Get cached insights or fetch if not available
 *
 * Query params:
 * - datePreset?: InsightsDatePreset (default: last_7d)
 * - forceRefresh?: boolean (skip cache and fetch fresh data)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const datePreset = searchParams.get('datePreset') || 'last_7d';
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // Get campaign to verify ownership
    const campaign = await getCampaignWithDetails(id, user.id, user.organizationId);

    // Check cache first (unless force refresh)
    const cacheKey = `campaign:insights:${campaign.campaignId}`;

    if (!forceRefresh) {
      const cachedInsights = await redis.get(cacheKey);

      if (cachedInsights) {
        return successResponse(
          {
            campaignId: campaign.campaignId,
            campaignName: campaign.name,
            datePreset,
            insights: JSON.parse(cachedInsights),
            fromCache: true,
          },
          {
            message: 'Insights retrieved from cache',
          }
        );
      }
    }

    // Fetch fresh insights
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: campaign.adAccountId },
      include: {
        facebookBusinessAccount: {
          select: {
            accessTokenEncrypted: true,
          },
        },
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account');
    }

    const facebookAPI = getFacebookAPI(redis);
    facebookAPI.setAccessToken(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    const insights = await facebookAPI.insights.getCampaignInsights(
      campaign.campaignId,
      adAccount.accountId,
      {
        level: 'campaign',
        date_preset: datePreset as InsightsDatePreset,
        fields: [
          'impressions',
          'reach',
          'frequency',
          'clicks',
          'unique_clicks',
          'spend',
          'cpm',
          'cpp',
          'cpc',
          'ctr',
          'unique_ctr',
          'actions',
          'conversions',
          'cost_per_action_type',
        ],
      }
    );

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(insights));

    return successResponse(
      {
        campaignId: campaign.campaignId,
        campaignName: campaign.name,
        datePreset,
        insights,
        fromCache: false,
        fetchedAt: new Date().toISOString(),
      },
      {
        message: 'Insights fetched successfully',
      }
    );
  } catch (error) {
    return errorResponse(error as Error);
  }
}
