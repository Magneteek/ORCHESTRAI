import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails } from '@/lib/db/campaigns';
import { createAdSetInDb } from '@/lib/db/campaigns';
import { createAdSetSchema, adSetQuerySchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';
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

    // Decrypt access token
    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    // Build ad set payload for Graph API
    const adSetPayload: Record<string, any> = {
      campaign_id: campaign.campaignId,
      name: data.name,
      status: data.status || 'PAUSED',
    };
    // When the campaign has a campaign-level budget (CBO), Facebook manages the budget
    // centrally and rejects ad-set-level budget fields with "Invalid parameter".
    const campaignHasCBO = !!(campaign.dailyBudget || campaign.lifetimeBudget);
    if (!campaignHasCBO) {
      if (data.dailyBudget) adSetPayload.daily_budget = Math.round(data.dailyBudget * 100);
      if (data.lifetimeBudget) adSetPayload.lifetime_budget = Math.round(data.lifetimeBudget * 100);
    }
    if (data.billingEvent) adSetPayload.billing_event = data.billingEvent;
    if (data.optimizationGoal) adSetPayload.optimization_goal = data.optimizationGoal;
    if (data.bidAmount) adSetPayload.bid_amount = Math.round(data.bidAmount * 100);
    if (data.bidStrategy) adSetPayload.bid_strategy = data.bidStrategy;
    if (data.targeting) {
      // Facebook rejects empty arrays for genders — omit if not specified
      const targeting = { ...data.targeting } as Record<string, any>;
      if (Array.isArray(targeting.genders) && targeting.genders.length === 0) {
        delete targeting.genders;
      }
      // Facebook requires explicitly opting in or out of Advantage audience (0 = manual targeting)
      targeting.targeting_automation = { advantage_audience: 0 };
      adSetPayload.targeting = targeting;
    }
    if (data.dynamicCreative !== undefined) adSetPayload.is_dynamic_creative = data.dynamicCreative;
    if (data.startTime) adSetPayload.start_time = data.startTime;
    if (data.endTime) adSetPayload.end_time = data.endTime;
    // Facebook requires promoted_object for objectives like LEADS, CONVERSIONS, ENGAGEMENT.
    // For LEADS/QUALITY_LEAD the promoted object is the Facebook Page.
    if (data.pageId) adSetPayload.promoted_object = { page_id: data.pageId };

    // Create ad set directly via Graph API
    const fbRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/act_${adAccount.accountId.replace(/^act_/, '')}/adsets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adSetPayload, access_token: accessToken }),
      }
    );
    const fbJson = await fbRes.json();

    if (fbJson.error) {
      const detail = fbJson.error.error_user_msg || '';
      const msg = `${fbJson.error.message || 'Facebook API error'}${detail ? `: ${detail}` : ''}`;
      throw new BadRequestError(msg, { facebookError: fbJson.error });
    }

    // Save ad set to database
    const adSet = await createAdSetInDb({
      campaignId: campaign.id,
      adSetId: fbJson.id,
      name: data.name,
      status: data.status || 'PAUSED',
      targeting: (data.targeting as any) || {},
      budget: data.dailyBudget || data.lifetimeBudget,
      bidStrategy: data.bidStrategy,
      billingEvent: data.billingEvent,
      optimizationGoal: data.optimizationGoal,
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
