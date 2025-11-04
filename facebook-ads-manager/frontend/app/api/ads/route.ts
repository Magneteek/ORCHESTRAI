import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getAdSetById, createAdInDb } from '@/lib/db/campaigns';
import { createAdSchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/ads
 * List ads for an ad set
 *
 * Query params:
 * - adSetId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adSetId = searchParams.get('adSetId');

    if (!adSetId) {
      throw new BadRequestError('adSetId query parameter is required');
    }

    // Get ad set with ads
    const adSet = await prisma.adSet.findUnique({
      where: { id: adSetId },
      include: {
        ads: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        campaign: {
          include: {
            adAccount: {
              include: {
                facebookBusinessAccount: {
                  select: {
                    organizationId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!adSet) {
      throw new NotFoundError('Ad set');
    }

    // Verify organization ownership
    if (adSet.campaign.adAccount.facebookBusinessAccount.organizationId !== user.organizationId) {
      throw new BadRequestError('You do not have access to this ad set');
    }

    // Transform ads
    const ads = adSet.ads.map(ad => ({
      id: ad.id,
      adId: ad.adId,
      name: ad.name,
      status: ad.status,
      creative: ad.creative,
      templateId: ad.templateId,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
    }));

    return successResponse({
      adSetId: adSet.id,
      adSetName: adSet.name,
      campaignId: adSet.campaignId,
      ads,
    });
  } catch (error) {
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
