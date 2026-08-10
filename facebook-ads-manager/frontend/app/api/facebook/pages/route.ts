import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { BadRequestError, NotFoundError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

/**
 * GET /api/facebook/pages?adAccountId=...
 * Returns Facebook Pages accessible via the ad account's business token
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');

    if (!adAccountId) {
      throw new BadRequestError('adAccountId query parameter is required');
    }

    const adAccount = await prisma.adAccount.findUnique({
      where: { id: adAccountId },
      include: {
        facebookBusinessAccount: {
          select: {
            businessId: true,
            accessTokenEncrypted: true,
            organizationId: true,
          },
        },
      },
    });

    if (!adAccount) {
      throw new NotFoundError('Ad account');
    }
    if (adAccount.facebookBusinessAccount.organizationId !== user.organizationId) {
      throw new NotFoundError('Ad account');
    }

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const businessId = adAccount.facebookBusinessAccount.businessId;
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';

    // Try business-owned pages first
    const bizRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${businessId}/owned_pages?fields=id,name&limit=50&access_token=${accessToken}`
    );
    const bizJson = await bizRes.json();

    if (!bizJson.error && bizJson.data?.length > 0) {
      return successResponse(bizJson.data);
    }

    // Fallback: pages the user token can access
    const meRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/me/accounts?fields=id,name&limit=50&access_token=${accessToken}`
    );
    const meJson = await meRes.json();

    if (meJson.error) {
      throw new Error(meJson.error.message || 'Failed to fetch Facebook Pages');
    }

    return successResponse(meJson.data || []);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
