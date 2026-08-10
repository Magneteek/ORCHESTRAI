import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { uploadImageSchema } from '@/lib/utils/campaign-validation';
import { ZodError } from 'zod';
import { ValidationError, BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

const API_VERSION = process.env.FACEBOOK_API_VERSION || 'v22.0';

async function resolveAdAccount(adAccountId: string, userId: string, orgId: string) {
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
    include: {
      facebookBusinessAccount: {
        select: { organizationId: true, accessTokenEncrypted: true },
      },
    },
  });
  if (!adAccount) throw new NotFoundError('Ad account');
  if (adAccount.facebookBusinessAccount.organizationId !== orgId) {
    throw new BadRequestError('You do not have access to this ad account');
  }
  return {
    accessToken: decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted),
    accountId: adAccount.accountId.replace(/^act_/, ''),
  };
}

/**
 * POST /api/ads/upload-image
 * Upload image to Facebook Ad Account using the Graph API directly.
 *
 * Body:
 * - adAccountId: string (required) - Database ad account ID
 * - imageUrl?: string - URL of image to upload
 * - imageData?: string - Base64 encoded image data (data URI or raw base64)
 * - fileName?: string - Original file name
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const data = uploadImageSchema.parse(body);

    if (!data.imageUrl && !data.imageData) {
      throw new BadRequestError('Either imageUrl or imageData is required');
    }

    const { accessToken, accountId } = await resolveAdAccount(data.adAccountId, user.id, user.organizationId);

    const endpoint = `https://graph.facebook.com/${API_VERSION}/act_${accountId}/adimages`;

    let imageHash: string;
    let imageUrl: string;

    if (data.imageUrl) {
      // Upload by URL — send as form-urlencoded
      const params = new URLSearchParams({
        url: data.imageUrl,
        access_token: accessToken,
      });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || 'Facebook image upload failed');
      const key = Object.keys(json.images || {})[0];
      if (!key) throw new Error('No image hash returned from Facebook');
      imageHash = json.images[key].hash;
      imageUrl = json.images[key].url || data.imageUrl;
    } else {
      // Upload raw bytes (base64) — send as multipart form data
      const base64 = (data.imageData as string).replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const fileName = data.fileName || 'image.jpg';

      const formData = new FormData();
      formData.append('access_token', accessToken);
      formData.append('filename', new Blob([buffer], { type: 'image/jpeg' }), fileName);

      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || 'Facebook image upload failed');
      const key = Object.keys(json.images || {})[0];
      if (!key) throw new Error('No image hash returned from Facebook');
      imageHash = json.images[key].hash;
      imageUrl = json.images[key].url || '';
    }

    return successResponse(
      { imageHash, url: imageUrl, adAccountId: data.adAccountId },
      { message: 'Image uploaded successfully' }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(new ValidationError('Validation failed', error.errors), 422);
    }
    return errorResponse(error as Error);
  }
}

/**
 * GET /api/ads/upload-image?adAccountId=...
 * List previously uploaded images for an ad account.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');

    if (!adAccountId) throw new BadRequestError('adAccountId query parameter is required');

    const { accessToken, accountId } = await resolveAdAccount(adAccountId, user.id, user.organizationId);

    const params = new URLSearchParams({
      fields: 'id,hash,url,created_time,name,status',
      limit: '100',
      access_token: accessToken,
    });
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/act_${accountId}/adimages?${params}`
    );
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || 'Failed to fetch images');

    const images = (json.data || []).map((img: any) => ({
      id: img.id,
      hash: img.hash,
      url: img.url,
      name: img.name,
      status: img.status,
      createdTime: img.created_time,
    }));

    return successResponse({ adAccountId, images });
  } catch (error) {
    return errorResponse(error as Error);
  }
}
