import { NextRequest } from 'next/server';
import { successResponse, errorResponse, noContentResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { getCampaignWithDetails, updateCampaignInDb, deleteCampaignFromDb } from '@/lib/db/campaigns';
import { updateCampaignSchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, NotFoundError, BadRequestError, ForbiddenError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/campaigns/[id]
 * Retrieve single campaign with ad sets and insights
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;

    // Get campaign with full details
    const campaign = await getCampaignWithDetails(id, session.user.id, session.user.organizationId);

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

    // Initialize Facebook API to fetch fresh insights (optional)
    const facebookAPI = getFacebookAPI(redis);
    facebookAPI.setAccessToken(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Check cache for insights
    const cacheKey = `campaign:insights:${campaign.campaignId}`;
    let insights = null;

    const cachedInsights = await redis.get(cacheKey);
    if (cachedInsights) {
      insights = JSON.parse(cachedInsights);
    } else {
      // Fetch fresh insights from Facebook (implementation depends on your needs)
      // For now, we'll skip this to avoid rate limits on every GET request
      // You can implement this in the insights action endpoint instead
    }

    return successResponse({
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
      adSets: campaign.adSets.map(adSet => ({
        id: adSet.id,
        adSetId: adSet.adSetId,
        name: adSet.name,
        status: adSet.status,
        targeting: adSet.targeting,
        budget: adSet.budget,
        ads: adSet.ads.map(ad => ({
          id: ad.id,
          name: ad.name,
          status: ad.status,
          creative: ad.creative,
        })),
      })),
      template: campaign.template,
      insights,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign (name, budget, schedule, status)
 *
 * Body (all fields optional):
 * - name?: string
 * - status?: CampaignStatus
 * - dailyBudget?: number
 * - lifetimeBudget?: number
 * - spendCap?: number
 * - bidStrategy?: BidStrategy
 * - startTime?: string (ISO 8601)
 * - stopTime?: string (ISO 8601)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const data = updateCampaignSchema.parse(body);

    // Get campaign to verify ownership
    const campaign = await getCampaignWithDetails(id, session.user.id, session.user.organizationId);

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

    // Update campaign on Facebook
    const updateParams: any = {};

    if (data.name !== undefined) updateParams.name = data.name;
    if (data.status !== undefined) updateParams.status = data.status;
    if (data.dailyBudget !== undefined) updateParams.dailyBudget = data.dailyBudget;
    if (data.lifetimeBudget !== undefined) updateParams.lifetimeBudget = data.lifetimeBudget;
    if (data.spendCap !== undefined) updateParams.spendCap = data.spendCap;
    if (data.bidStrategy !== undefined) updateParams.bidStrategy = data.bidStrategy;
    if (data.startTime !== undefined) updateParams.startTime = data.startTime;
    if (data.stopTime !== undefined) updateParams.stopTime = data.stopTime;

    const updatedFacebookCampaign = await facebookAPI.campaignUpdater.updateCampaign(
      campaign.campaignId,
      adAccount.accountId,
      updateParams
    );

    if (!updatedFacebookCampaign) {
      throw new Error('Failed to update campaign on Facebook');
    }

    // Update campaign in database
    const updatedCampaign = await updateCampaignInDb(id, {
      name: data.name,
      status: data.status,
      dailyBudget: data.dailyBudget,
      lifetimeBudget: data.lifetimeBudget,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      stopTime: data.stopTime ? new Date(data.stopTime) : undefined,
    });

    // Invalidate cache
    await redis.del(`campaigns:${campaign.adAccountId}`);
    await redis.del(`campaign:${campaign.campaignId}`);

    return successResponse(
      {
        id: updatedCampaign.id,
        campaignId: updatedCampaign.campaignId,
        name: updatedCampaign.name,
        objective: updatedCampaign.objective,
        status: updatedCampaign.status,
        dailyBudget: updatedCampaign.dailyBudget,
        lifetimeBudget: updatedCampaign.lifetimeBudget,
        startTime: updatedCampaign.startTime,
        stopTime: updatedCampaign.stopTime,
        createdAt: updatedCampaign.createdAt,
        updatedAt: updatedCampaign.updatedAt,
        facebookData: updatedFacebookCampaign,
      },
      {
        message: 'Campaign updated successfully',
      }
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

/**
 * DELETE /api/campaigns/[id]
 * Archive/delete campaign
 * Only admins can delete campaigns
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const userRole = session.user.role as UserRole;
    const { id } = await params;

    // Check if user has permission to delete campaigns
    if (!hasPermission(userRole, 'canDeleteCampaign')) {
      throw new ForbiddenError('Only administrators can delete campaigns');
    }

    // Get campaign to verify ownership
    const campaign = await getCampaignWithDetails(id, session.user.id, session.user.organizationId);

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

    // Archive campaign on Facebook
    await facebookAPI.campaignStatus.archiveCampaign(
      campaign.campaignId,
      adAccount.accountId
    );

    // Soft delete in database
    await deleteCampaignFromDb(id);

    // Invalidate cache
    await redis.del(`campaigns:${campaign.adAccountId}`);
    await redis.del(`campaign:${campaign.campaignId}`);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
