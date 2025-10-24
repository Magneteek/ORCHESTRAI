import { NextRequest } from 'next/server';
import { createdResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails, createCampaignInDb } from '@/lib/db/campaigns';
import { NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


/**
 * POST /api/campaigns/[id]/duplicate
 * Clone campaign with optional new name
 *
 * Body (optional):
 * - name?: string (new campaign name)
 * - includeAdSets?: boolean (default: true)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const { name: newName, includeAdSets = true } = body;

    // Get original campaign
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

    // Duplicate campaign via Facebook API
    const duplicatedFacebookCampaign = await facebookAPI.campaignCreator.duplicateCampaign(
      campaign.campaignId,
      adAccount.accountId,
      newName,
      includeAdSets
    );

    if (!duplicatedFacebookCampaign) {
      throw new Error('Failed to duplicate campaign on Facebook');
    }

    // Save duplicated campaign to database
    const duplicatedCampaign = await createCampaignInDb({
      adAccountId: campaign.adAccountId,
      campaignId: duplicatedFacebookCampaign.id,
      name: duplicatedFacebookCampaign.name,
      objective: duplicatedFacebookCampaign.objective,
      status: duplicatedFacebookCampaign.status,
      dailyBudget: duplicatedFacebookCampaign.dailyBudget,
      lifetimeBudget: duplicatedFacebookCampaign.lifetimeBudget,
      templateId: campaign.templateId || undefined,
    });

    // Invalidate cache
    await redis.del(`campaigns:${campaign.adAccountId}`);

    return createdResponse(
      {
        id: duplicatedCampaign.id,
        campaignId: duplicatedCampaign.campaignId,
        name: duplicatedCampaign.name,
        objective: duplicatedCampaign.objective,
        status: duplicatedCampaign.status,
        dailyBudget: duplicatedCampaign.dailyBudget,
        lifetimeBudget: duplicatedCampaign.lifetimeBudget,
        createdAt: duplicatedCampaign.createdAt,
        updatedAt: duplicatedCampaign.updatedAt,
        facebookData: duplicatedFacebookCampaign,
      },
      'Campaign duplicated successfully'
    );
  } catch (error) {
    return errorResponse(error as Error);
  }
}
