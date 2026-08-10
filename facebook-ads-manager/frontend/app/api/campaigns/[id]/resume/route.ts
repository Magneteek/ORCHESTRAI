import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails, updateCampaignInDb } from '@/lib/db/campaigns';
import { NotFoundError } from '@/lib/utils/errors';
import { decrypt } from '@/lib/utils/encryption';
import { prisma } from '@/lib/db/prisma';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * POST /api/campaigns/[id]/resume
 * Resume (activate) campaign on Facebook and update DB
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

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
        body: JSON.stringify({ status: 'ACTIVE', access_token: accessToken }),
      }
    );
    const fbJson = await fbRes.json();
    if (fbJson.error) throw new Error(fbJson.error.message || 'Facebook API error');

    const updatedCampaign = await updateCampaignInDb(id, { status: 'ACTIVE' });

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
      { message: 'Campaign resumed successfully' }
    );
  } catch (error) {
    return errorResponse(error as Error);
  }
}
