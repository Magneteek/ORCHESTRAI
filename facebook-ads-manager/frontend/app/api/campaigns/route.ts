import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignsByAdAccount, createCampaignInDb } from '@/lib/db/campaigns';
import { createCampaignSchema, campaignQuerySchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/campaigns
 * List campaigns with pagination, search, and filters
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - search: string (search by campaign name)
 * - status: string (ACTIVE, PAUSED, DELETED, ARCHIVED)
 * - objective: string (campaign objective)
 * - adAccountId: string (required - filter by ad account)
 * - sortBy: string (name, createdAt, updatedAt, status)
 * - sortOrder: asc | desc (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryParams = campaignQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      objective: searchParams.get('objective'),
      adAccountId: searchParams.get('adAccountId'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryParams.adAccountId) {
      throw new BadRequestError('adAccountId query parameter is required');
    }

    // Get campaigns from database with pagination
    const result = await getCampaignsByAdAccount(
      queryParams.adAccountId,
      user.id,
      user.organizationId,
      {
        page: queryParams.page,
        limit: Math.min(queryParams.limit, 100), // Max 100 per page
        search: queryParams.search,
        status: queryParams.status,
        objective: queryParams.objective,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      }
    );

    // Transform campaigns to include ad set and ad counts
    const campaignsWithCounts = result.campaigns.map(campaign => ({
      id: campaign.id,
      campaignId: campaign.campaignId,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status,
      dailyBudget: campaign.dailyBudget,
      lifetimeBudget: campaign.lifetimeBudget,
      startTime: campaign.startTime,
      stopTime: campaign.stopTime,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      adSetCount: campaign.adSets?.length || 0,
      templateId: campaign.templateId,
    }));

    return paginatedResponse(
      campaignsWithCounts,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }
    );
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
 * POST /api/campaigns
 * Create a new campaign
 *
 * Body:
 * - adAccountId: string (required)
 * - name: string (required)
 * - objective: CampaignObjective (required)
 * - status: CampaignStatus (default: PAUSED)
 * - specialAdCategories?: SpecialAdCategory[]
 * - dailyBudget?: number (in dollars)
 * - lifetimeBudget?: number (in dollars)
 * - spendCap?: number (in dollars)
 * - bidStrategy?: BidStrategy
 * - startTime?: string (ISO 8601)
 * - stopTime?: string (ISO 8601)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request body
    const data = createCampaignSchema.parse(body);

    // Verify ad account ownership
    const adAccount = await prisma.adAccount.findUnique({
      where: { id: data.adAccountId },
      include: {
        facebookBusinessAccount: {
          select: {
            organizationId: true,
            accessTokenEncrypted: true,
          },
        },
      },
    });

    if (!adAccount) {
      throw new BadRequestError('Ad account not found');
    }

    if (adAccount.facebookBusinessAccount.organizationId !== user.organizationId) {
      throw new BadRequestError('You do not have access to this ad account');
    }

    // Initialize Facebook API
    const facebookAPI = getFacebookAPI(redis);

    // Decrypt and set access token
    // Note: In production, implement proper token decryption
    const accessToken = adAccount.facebookBusinessAccount.accessTokenEncrypted;
    facebookAPI.setAccessToken(accessToken);

    // Create campaign via Facebook API
    const facebookCampaign = await facebookAPI.campaignCreator.createCampaign(
      adAccount.accountId,
      {
        name: data.name,
        objective: data.objective as any,
        status: data.status as any,
        specialAdCategories: data.specialAdCategories as any,
        dailyBudget: data.dailyBudget,
        lifetimeBudget: data.lifetimeBudget,
        spendCap: data.spendCap,
        bidStrategy: data.bidStrategy as any,
        startTime: data.startTime,
        stopTime: data.stopTime,
      }
    );

    if (!facebookCampaign) {
      throw new Error('Failed to create campaign on Facebook');
    }

    // Save campaign to database
    const campaign = await createCampaignInDb({
      adAccountId: data.adAccountId,
      campaignId: facebookCampaign.id,
      name: facebookCampaign.name,
      objective: facebookCampaign.objective,
      status: facebookCampaign.status,
      dailyBudget: facebookCampaign.dailyBudget,
      lifetimeBudget: facebookCampaign.lifetimeBudget,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      stopTime: data.stopTime ? new Date(data.stopTime) : undefined,
    });

    // Invalidate cache
    await redis.del(`campaigns:${data.adAccountId}`);

    return createdResponse(
      {
        id: campaign.id,
        campaignId: campaign.campaignId,
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status,
        dailyBudget: campaign.dailyBudget,
        lifetimeBudget: campaign.lifetimeBudget,
        startTime: campaign.startTime,
        stopTime: campaign.stopTime,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        facebookData: facebookCampaign,
      },
      'Campaign created successfully'
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
