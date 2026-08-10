import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/lib/utils/errors';
import { decrypt } from '@/lib/utils/encryption';

async function getAdWithAuth(id: string, organizationId: string) {
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      adSet: {
        include: {
          campaign: {
            include: {
              adAccount: {
                include: { facebookBusinessAccount: true },
              },
            },
          },
        },
      },
    },
  });
  if (!ad) throw new NotFoundError('Ad');
  if (ad.adSet.campaign.adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this ad');
  }
  return ad;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const ad = await getAdWithAuth(id, user.organizationId);

    return successResponse({
      id: ad.id,
      adId: ad.adId,
      name: ad.name,
      status: ad.status,
      creative: ad.creative,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
      adSet: { id: ad.adSet.id, name: ad.adSet.name },
      campaign: {
        id: ad.adSet.campaign.id,
        name: ad.adSet.campaign.name,
      },
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
    const ad = await getAdWithAuth(id, user.organizationId);

    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const accessToken = decrypt(ad.adSet.campaign.adAccount.facebookBusinessAccount.accessTokenEncrypted);

    const fbPayload: Record<string, any> = {};
    if (body.status) fbPayload.status = body.status;
    if (body.name) fbPayload.name = body.name;

    if (Object.keys(fbPayload).length > 0) {
      const fbRes = await fetch(`https://graph.facebook.com/${apiVersion}/${ad.adId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fbPayload, access_token: accessToken }),
      });
      const fbJson = await fbRes.json();
      if (fbJson.error) throw new BadRequestError(fbJson.error.message || 'Facebook API error');
    }

    const updated = await prisma.ad.update({
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
    const ad = await getAdWithAuth(id, user.organizationId);

    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const accessToken = decrypt(ad.adSet.campaign.adAccount.facebookBusinessAccount.accessTokenEncrypted);

    const fbRes = await fetch(`https://graph.facebook.com/${apiVersion}/${ad.adId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELETED', access_token: accessToken }),
    });
    const fbJson = await fbRes.json();
    if (fbJson.error) throw new BadRequestError(fbJson.error.message || 'Facebook API error');

    await prisma.ad.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error as Error);
  }
}
