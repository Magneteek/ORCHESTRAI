import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails } from '@/lib/db/campaigns';
import { createAdSetInDb } from '@/lib/db/campaigns';
import { createAdSetSchema, adSetQuerySchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/ad-sets
 * List ad sets for a campaign or ad account
 *
 * Query params:
 * - adAccountId: string (optional - filter by ad account)
 * - campaignId: string (optional - filter by campaign)
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
    const queryParams = adSetQuerySchema.parse({
      adAccountId: searchParams.get('adAccountId') ?? undefined,
      campaignId: searchParams.get('campaignId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    // Build where clause for Prisma query
    const whereClause: any = {};

    if (queryParams.campaignId) {
      whereClause.campaignId = queryParams.campaignId;
    }

    if (queryParams.adAccountId) {
      whereClause.campaign = {
        adAccountId: queryParams.adAccountId,
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
    whereClause.campaign = {
      ...whereClause.campaign,
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
    };

    // Get total count
    const total = await prisma.adSet.count({ where: whereClause });

    // Get ad sets with pagination
    const adSets = await prisma.adSet.findMany({
      where: whereClause,
      include: {
        ads: {
          select: {
            id: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            campaignId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (queryParams.page - 1) * queryParams.limit,
      take: queryParams.limit,
    });

    // Transform ad sets
    const transformedAdSets = adSets.map(adSet => ({
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
      campaign: adSet.campaign,
    }));

    return paginatedResponse(transformedAdSets, {
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
