import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getAdSetById, createAdInDb } from '@/lib/db/campaigns';
import { createAdSchema, adQuerySchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/ads
 * List ads for an ad set, campaign, or ad account
 *
 * Query params:
 * - adAccountId: string (optional - filter by ad account)
 * - campaignId: string (optional - filter by campaign)
 * - adSetId: string (optional - filter by ad set)
 * - search: string (optional - search by name)
 * - status: string (optional - filter by status)
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Validate query parameters (convert null to undefined for Zod)
    const queryParams = adQuerySchema.parse({
      adAccountId: searchParams.get('adAccountId') ?? undefined,
      campaignId: searchParams.get('campaignId') ?? undefined,
      adSetId: searchParams.get('adSetId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    // Build where clause for Prisma query
    const whereClause: any = {};

    if (queryParams.adSetId) {
      whereClause.adSetId = queryParams.adSetId;
    }

    if (queryParams.campaignId) {
      whereClause.adSet = {
        campaignId: queryParams.campaignId,
      };
    }

    if (queryParams.adAccountId) {
      whereClause.adSet = {
        ...whereClause.adSet,
        campaign: {
          adAccountId: queryParams.adAccountId,
        },
      };
    }

    if (queryParams.search) {
      whereClause.name = {
        contains: queryParams.search,
        mode: 'insensitive',
      };
    }

    if (queryParams.status) {
      whereClause.status = queryParams.status;
    }

    // Add organization check
    whereClause.adSet = {
      ...whereClause.adSet,
      campaign: {
        ...whereClause.adSet?.campaign,
        adAccount: {
          facebookBusinessAccount: {
            organization: {
              users: {
                some: {
                  id: user.id,
                },
              },
            },
          },
        },
      },
    };

    // Get total count
    const total = await prisma.ad.count({ where: whereClause });

    // Get ads with pagination
    const ads = await prisma.ad.findMany({
      where: whereClause,
      include: {
        adSet: {
          select: {
            id: true,
            name: true,
            adSetId: true,
            campaign: {
              select: {
                id: true,
                name: true,
                campaignId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (queryParams.page - 1) * queryParams.limit,
      take: queryParams.limit,
    });

    // Transform ads
    const transformedAds = ads.map(ad => ({
      id: ad.id,
      adId: ad.adId,
      name: ad.name,
      status: ad.status,
      creative: ad.creative,
      templateId: ad.templateId,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
      adSet: ad.adSet,
    }));

    return paginatedResponse(transformedAds, {
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Invalid query parameters', error.errors),
        422
      );
    }
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/ads
 * Create a new ad with creative
 *
 * Body:
 * - adSetId: string (required) - Database ad set ID
 * - name: string (required)
 * - status: CampaignStatus (default: PAUSED)
 * - creative: {
 *     imageUrl?: string
 *     videoUrl?: string
 *     imageHash?: string
 *     videoId?: string
 *     headline?: string
 *     primaryText?: string
 *     description?: string
 *     callToActionType?: string
 *     linkUrl?: string
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const data = createAdSchema.parse(body);

    // Get ad set to verify ownership
    const adSet = await getAdSetById(data.adSetId, user.id, user.organizationId);

    if (!adSet) {
      throw new NotFoundError('Ad set');
    }

    // Get campaign and ad account info
    const campaign = await prisma.campaign.findUnique({
      where: { id: adSet.campaignId },
      include: {
        adAccount: {
          include: {
            facebookBusinessAccount: {
              select: {
                accessTokenEncrypted: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign');
    }

    // Initialize Facebook API
    const facebookAPI = getFacebookAPI(redis);
    facebookAPI.setAccessToken(campaign.adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Create ad via Facebook API
    const facebookAd = await facebookAPI.adCreator.createAd(
      campaign.adAccount.accountId,
      {
        name: data.name,
        adsetId: adSet.adSetId,
        status: data.status as any,
        creative: {
          name: `${data.name} Creative`,
          pageId: '', // Will be set by Facebook SDK if needed
          title: data.creative.headline,
          body: data.creative.primaryText || '',
          callToActionType: data.creative.callToActionType as any,
          imageHash: data.creative.imageHash,
          imageUrl: data.creative.imageUrl,
          videoId: data.creative.videoId,
          linkUrl: data.creative.linkUrl,
        },
      }
    );

    if (!facebookAd) {
      throw new Error('Failed to create ad on Facebook');
    }

    // Save ad to database
    const ad = await createAdInDb({
      adSetId: adSet.id, // Database ad set ID
      adId: facebookAd.id,
      name: facebookAd.name,
      status: facebookAd.status,
      creative: data.creative,
    });

    // Invalidate cache
    await redis.del(`campaign:${campaign.campaignId}`);

    return createdResponse(
      {
        id: ad.id,
        adId: ad.adId,
        name: ad.name,
        status: ad.status,
        creative: ad.creative,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
        facebookData: facebookAd,
      },
      'Ad created successfully'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Validation failed', error.errors),
        422
      );
    }

    return errorResponse(error as Error);
  }
}
