import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/utils/errors';
import { decrypt } from '@/lib/utils/encryption';

async function getAdSetWithAuth(id: string, organizationId: string) {
  const adSet = await prisma.adSet.findUnique({
    where: { id },
    include: {
      campaign: {
        include: {
          adAccount: {
            include: {
              facebookBusinessAccount: true,
            },
          },
        },
      },
      ads: { select: { id: true, name: true, status: true } },
    },
  });
  if (!adSet) throw new NotFoundError('Ad set');
  if (adSet.campaign.adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this ad set');
  }
  return adSet;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const adSet = await getAdSetWithAuth(id, user.organizationId);

    return successResponse({
      id: adSet.id,
      adSetId: adSet.adSetId,
      name: adSet.name,
      status: adSet.status,
      targeting: adSet.targeting,
      budget: adSet.budget,
      bidStrategy: adSet.bidStrategy,
      billingEvent: adSet.billingEvent,
      optimizationGoal: adSet.optimizationGoal,
      isDynamicCreative: (adSet as any).isDynamicCreative ?? false,
      startTime: adSet.startTime,
      endTime: adSet.endTime,
      createdAt: adSet.createdAt,
      updatedAt: adSet.updatedAt,
      campaign: {
        id: adSet.campaign.id,
        name: adSet.campaign.name,
        objective: adSet.campaign.objective,
      },
      ads: adSet.ads,
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const adSet = await getAdSetWithAuth(id, user.organizationId);

    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const accessToken = decrypt(adSet.campaign.adAccount.facebookBusinessAccount.accessTokenEncrypted);

    const fbPayload: Record<string, any> = {};
    if (body.status) fbPayload.status = body.status;
    if (body.name) fbPayload.name = body.name;

    if (Object.keys(fbPayload).length > 0) {
      const fbRes = await fetch(`https://graph.facebook.com/${apiVersion}/${adSet.adSetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fbPayload, access_token: accessToken }),
      });
      const fbJson = await fbRes.json();
      if (fbJson.error) throw new BadRequestError(fbJson.error.message || 'Facebook API error');
    }

    const updated = await prisma.adSet.update({
      where: { id },
      data: { ...(body.status && { status: body.status }), ...(body.name && { name: body.name }) },
    });

    return successResponse({ id: updated.id, status: updated.status, name: updated.name });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const adSet = await getAdSetWithAuth(id, user.organizationId);

    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const accessToken = decrypt(adSet.campaign.adAccount.facebookBusinessAccount.accessTokenEncrypted);

    const fbRes = await fetch(`https://graph.facebook.com/${apiVersion}/${adSet.adSetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELETED', access_token: accessToken }),
    });
    const fbJson = await fbRes.json();
    if (fbJson.error) throw new BadRequestError(fbJson.error.message || 'Facebook API error');

    await prisma.adSet.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error as Error);
  }
}
