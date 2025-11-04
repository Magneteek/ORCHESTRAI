import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails } from '@/lib/db/campaigns';
import { createAdSetInDb } from '@/lib/db/campaigns';
import { createAdSetSchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/ad-sets
 * List ad sets for a campaign
 *
 * Query params:
 * - campaignId: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      throw new BadRequestError('campaignId query parameter is required');
    }

    // Get campaign with ad sets
    const campaign = await getCampaignWithDetails(campaignId, user.id, user.organizationId);

    // Transform ad sets
    const adSets = campaign.adSets.map(adSet => ({
      id: adSet.id,
      adSetId: adSet.adSetId,
      name: adSet.name,
      status: adSet.status,
      targeting: adSet.targeting,
      budget: adSet.budget,
      bidStrategy: adSet.bidStrategy,
      billingEvent: adSet.billingEvent,
      optimizationGoal: adSet.optimizationGoal,
      startTime: adSet.startTime,
      endTime: adSet.endTime,
      createdAt: adSet.createdAt,
      updatedAt: adSet.updatedAt,
      adCount: adSet.ads?.length || 0,
    }));

    return successResponse({
      campaignId: campaign.id,
      campaignName: campaign.name,
      adSets,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/ad-sets
 * Create a new ad set with targeting
 *
 * Body:
 * - campaignId: string (required) - Database campaign ID
 * - name: string (required)
 * - status: CampaignStatus (default: PAUSED)
 * - dailyBudget?: number
 * - lifetimeBudget?: number
 * - billingEvent?: BillingEvent
 * - optimizationGoal?: OptimizationGoal
 * - bidAmount?: number
 * - bidStrategy?: BidStrategy
 * - targeting?: AdTargeting
 * - startTime?: string (ISO 8601)
 * - endTime?: string (ISO 8601)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const data = createAdSetSchema.parse(body);

    // Get campaign to verify ownership
    const campaign = await getCampaignWithDetails(data.campaignId, user.id, user.organizationId);

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

    // Create ad set via Facebook API
    const facebookAdSet = await facebookAPI.adSetCreator.createAdSet(
      campaign.campaignId, // Facebook campaign ID
      {
        campaignId: campaign.campaignId,
        name: data.name,
        status: data.status as any,
        dailyBudget: data.dailyBudget,
        lifetimeBudget: data.lifetimeBudget,
        billingEvent: data.billingEvent as any,
        optimizationGoal: data.optimizationGoal as any,
        bidAmount: data.bidAmount,
        bidStrategy: data.bidStrategy as any,
        targeting: data.targeting as any,
        startTime: data.startTime,
        endTime: data.endTime,
      }
    );

    if (!facebookAdSet) {
      throw new Error('Failed to create ad set on Facebook');
    }

    // Save ad set to database
    const adSet = await createAdSetInDb({
      campaignId: campaign.id, // Database campaign ID
      adSetId: facebookAdSet.id,
      name: facebookAdSet.name,
      status: facebookAdSet.status,
      targeting: facebookAdSet.targeting || {},
      budget: facebookAdSet.dailyBudget || facebookAdSet.lifetimeBudget,
      bidStrategy: facebookAdSet.bidStrategy,
      billingEvent: facebookAdSet.billingEvent,
      optimizationGoal: facebookAdSet.optimizationGoal,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    });

    // Invalidate cache
    await redis.del(`campaign:${campaign.campaignId}`);

    return createdResponse(
      {
        id: adSet.id,
        adSetId: adSet.adSetId,
        name: adSet.name,
        status: adSet.status,
        targeting: adSet.targeting,
        budget: adSet.budget,
        bidStrategy: adSet.bidStrategy,
        billingEvent: adSet.billingEvent,
        optimizationGoal: adSet.optimizationGoal,
        startTime: adSet.startTime,
        endTime: adSet.endTime,
        createdAt: adSet.createdAt,
        updatedAt: adSet.updatedAt,
        facebookData: facebookAdSet,
      },
      'Ad set created successfully'
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
