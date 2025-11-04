import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails, updateCampaignInDb } from '@/lib/db/campaigns';
import { NotFoundError } from '@/lib/utils/errors';
import { getFacebookAPI } from '@/lib/facebook';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


/**
 * POST /api/campaigns/[id]/resume
 * Resume (activate) campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Get campaign to verify ownership
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

    // Resume campaign on Facebook
    const resumedCampaign = await facebookAPI.campaignStatus.resumeCampaign(
      campaign.campaignId,
      adAccount.accountId
    );

    if (!resumedCampaign) {
      throw new Error('Failed to resume campaign on Facebook');
    }

    // Update status in database
    const updatedCampaign = await updateCampaignInDb(id, {
      status: 'ACTIVE',
    });

    // Invalidate cache
    await redis.del(`campaigns:${campaign.adAccountId}`);
    await redis.del(`campaign:${campaign.campaignId}`);

    return successResponse(
      {
        id: updatedCampaign.id,
        campaignId: updatedCampaign.campaignId,
        name: updatedCampaign.name,
        status: updatedCampaign.status,
        updatedAt: updatedCampaign.updatedAt,
      },
      {
        message: 'Campaign resumed successfully',
      }
    );
  } catch (error) {
    return errorResponse(error as Error);
  }
}
