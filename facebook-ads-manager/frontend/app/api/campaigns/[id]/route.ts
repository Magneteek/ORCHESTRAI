import { NextRequest } from 'next/server';
import { successResponse, errorResponse, noContentResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { getCampaignWithDetails, updateCampaignInDb, deleteCampaignFromDb } from '@/lib/db/campaigns';
import { updateCampaignSchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { decrypt } from '@/lib/utils/encryption';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /api/campaigns/[id]
 * Retrieve single campaign with ad sets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const campaign = await getCampaignWithDetails(id, user.id, user.organizationId);

    return successResponse({
      id: campaign.id,
      campaignId: campaign.campaignId,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status,
      dailyBudget: campaign.dailyBudget,
      lifetimeBudget: campaign.lifetimeBudget,
      bidStrategy: (campaign as any).bidStrategy,
      startTime: campaign.startTime,
      stopTime: campaign.stopTime,
      specialAdCategories: (campaign as any).specialAdCategories,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      adSets: campaign.adSets.map((adSet: any) => ({
        id: adSet.id,
        adSetId: adSet.adSetId,
        name: adSet.name,
        status: adSet.status,
        targeting: adSet.targeting,
        budget: adSet.budget,
        ads: adSet.ads.map((ad: any) => ({
          id: ad.id,
          name: ad.name,
          status: ad.status,
          creative: ad.creative,
        })),
      })),
      template: (campaign as any).template,
      insights: null,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign fields and/or status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const data = updateCampaignSchema.parse(body);

    const campaign = await getCampaignWithDetails(id, user.id, user.organizationId);

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: campaign.adAccountId },
      include: {
        facebookBusinessAccount: {
          select: { accessTokenEncrypted: true },
        },
      },
    });

    if (!adAccount) throw new NotFoundError('Ad account');

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    const fbPayload: Record<string, any> = { access_token: accessToken };
    if (data.name !== undefined) fbPayload.name = data.name;
    if (data.status !== undefined) fbPayload.status = data.status;
    if (data.dailyBudget !== undefined) fbPayload.daily_budget = Math.round(data.dailyBudget * 100);
    if (data.lifetimeBudget !== undefined) fbPayload.lifetime_budget = Math.round(data.lifetimeBudget * 100);
    if (data.spendCap !== undefined) fbPayload.spend_cap = Math.round(data.spendCap * 100);
    if (data.bidStrategy !== undefined) fbPayload.bid_strategy = data.bidStrategy;
    if (data.startTime !== undefined) fbPayload.start_time = data.startTime;
    if (data.stopTime !== undefined) fbPayload.stop_time = data.stopTime;

    const fbRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${campaign.campaignId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbPayload),
      }
    );
    const fbJson = await fbRes.json();
    if (fbJson.error) throw new Error(fbJson.error.message || 'Facebook API error');

    const updatedCampaign = await updateCampaignInDb(id, {
      name: data.name,
      status: data.status,
      dailyBudget: data.dailyBudget,
      lifetimeBudget: data.lifetimeBudget,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      stopTime: data.stopTime ? new Date(data.stopTime) : undefined,
    });

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
      },
      { message: 'Campaign updated successfully' }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(new ValidationError('Validation failed', error.errors), 422);
    }
    return errorResponse(error as Error);
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Archive campaign on Facebook and remove from DB
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const userRole = (user as any).role as UserRole;
    const { id } = await params;

    if (!hasPermission(userRole, 'canDeleteCampaign')) {
      throw new ForbiddenError('Only administrators can delete campaigns');
    }

    const campaign = await getCampaignWithDetails(id, user.id, user.organizationId);

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: campaign.adAccountId },
      include: {
        facebookBusinessAccount: {
          select: { accessTokenEncrypted: true },
        },
      },
    });

    if (!adAccount) throw new NotFoundError('Ad account');

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    const fbRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${campaign.campaignId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELETED', access_token: accessToken }),
      }
    );
    const fbJson = await fbRes.json();
    if (fbJson.error) throw new Error(fbJson.error.message || 'Facebook API error');

    await deleteCampaignFromDb(id);

    await redis.del(`campaigns:${campaign.adAccountId}`);
    await redis.del(`campaign:${campaign.campaignId}`);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
