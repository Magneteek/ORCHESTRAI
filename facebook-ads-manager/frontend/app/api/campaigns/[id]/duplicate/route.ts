import { NextRequest } from 'next/server';
import { createdResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getCampaignWithDetails, createCampaignInDb } from '@/lib/db/campaigns';
import { NotFoundError, BadRequestError } from '@/lib/utils/errors';
import { decrypt } from '@/lib/utils/encryption';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const newName: string | undefined = body.name;

    const campaign = await getCampaignWithDetails(id, user.id, user.organizationId);

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: campaign.adAccountId },
      include: { facebookBusinessAccount: { select: { accessTokenEncrypted: true } } },
    });
    if (!adAccount) throw new NotFoundError('Ad account');

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const fbAccountId = adAccount.accountId.replace(/^act_/, '');

    // Build a new campaign payload mirroring the original
    const fbPayload: Record<string, any> = {
      name: newName || `${campaign.name} (Copy)`,
      objective: campaign.objective,
      status: 'PAUSED',
      special_ad_categories: [],
    };
    if (campaign.dailyBudget) fbPayload.daily_budget = Math.round(campaign.dailyBudget * 100);
    if (campaign.lifetimeBudget) fbPayload.lifetime_budget = Math.round(campaign.lifetimeBudget * 100);

    const fbRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/act_${fbAccountId}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fbPayload, access_token: accessToken }),
      }
    );
    const fbJson = await fbRes.json();
    if (fbJson.error) {
      const detail = fbJson.error.error_user_msg || '';
      throw new BadRequestError(`${fbJson.error.message}${detail ? ': ' + detail : ''}`);
    }

    const duplicated = await createCampaignInDb({
      adAccountId: campaign.adAccountId,
      campaignId: fbJson.id,
      name: fbPayload.name,
      objective: campaign.objective,
      status: 'PAUSED',
      dailyBudget: campaign.dailyBudget ?? undefined,
      lifetimeBudget: campaign.lifetimeBudget ?? undefined,
      templateId: campaign.templateId || undefined,
    });

    return createdResponse(
      {
        id: duplicated.id,
        campaignId: duplicated.campaignId,
        name: duplicated.name,
        objective: duplicated.objective,
        status: duplicated.status,
      },
      'Campaign duplicated successfully'
    );
  } catch (error) {
    return errorResponse(error as Error);
  }
}
