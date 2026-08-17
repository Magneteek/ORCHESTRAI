import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignsByAdAccount, createCampaignInDb } from '@/lib/db/campaigns';
import { getCampaignTotals } from '@/lib/analytics/aggregate';
import { createCampaignSchema, campaignQuerySchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';
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

    // Validate query parameters (convert null to undefined for Zod)
    const queryParams = campaignQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      objective: searchParams.get('objective') ?? undefined,
      adAccountId: searchParams.get('adAccountId') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
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

    // The campaigns table renders spend/ROAS/CTR from `campaign.insights`;
    // without this the columns rendered "-" for every campaign forever.
    const totals = await getCampaignTotals(result.campaigns.map(c => c.id));

    // Transform campaigns to include ad set and ad counts
    const campaignsWithCounts = result.campaigns.map(campaign => ({
      id: campaign.id,
      campaignId: campaign.campaignId,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status,
      dailyBudget: campaign.dailyBudget,
      lifetimeBudget: campaign.lifetimeBudget,
      bidStrategy: (campaign as any).bidStrategy || null,
      startTime: campaign.startTime,
      stopTime: campaign.stopTime,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      adSetCount: campaign.adSets?.length || 0,
      templateId: campaign.templateId,
      // Absent (undefined) when the campaign never delivered, so the table
      // shows "-" rather than a misleading 0.00.
      insights: totals.get(campaign.id),
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

    // Decrypt access token
    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    // Build campaign payload for Graph API
    const campaignPayload: Record<string, any> = {
      name: data.name,
      objective: data.objective,
      status: data.status || 'PAUSED',
      special_ad_categories: data.specialAdCategories || [],
    };
    if (data.dailyBudget) campaignPayload.daily_budget = Math.round(data.dailyBudget * 100);
    if (data.lifetimeBudget) campaignPayload.lifetime_budget = Math.round(data.lifetimeBudget * 100);
    if (data.spendCap) campaignPayload.spend_cap = Math.round(data.spendCap * 100);
    if (data.bidStrategy) campaignPayload.bid_strategy = data.bidStrategy;
    if (data.startTime) campaignPayload.start_time = data.startTime;
    if (data.stopTime) campaignPayload.stop_time = data.stopTime;

    // Create campaign directly via Graph API
    const fbRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/act_${adAccount.accountId.replace(/^act_/, '')}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...campaignPayload, access_token: accessToken }),
      }
    );
    const fbJson = await fbRes.json();

    if (fbJson.error) {
      throw new Error(fbJson.error.message || 'Facebook API error');
    }

    const fbCampaignId = fbJson.id;

    // Save campaign to database
    const campaign = await createCampaignInDb({
      adAccountId: data.adAccountId,
      campaignId: fbCampaignId,
      name: data.name,
      objective: data.objective,
      status: data.status || 'PAUSED',
      dailyBudget: data.dailyBudget,
      lifetimeBudget: data.lifetimeBudget,
      bidStrategy: data.bidStrategy,
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
