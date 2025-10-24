import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth, requirePermission } from '@/lib/auth/session';

/**
 * GET /api/facebook/connect - Initiate Facebook OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('canConnectFacebook');

    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/facebook/callback`;

    if (!appId) {
      throw new Error('Facebook App ID not configured');
    }

    // Facebook OAuth URL
    const scope = [
      'ads_management',
      'ads_read',
      'business_management',
      'pages_read_engagement',
      'pages_manage_ads',
    ].join(',');

    const state = Buffer.from(
      JSON.stringify({
        userId: user.id,
        organizationId: user.organizationId,
        timestamp: Date.now(),
      })
    ).toString('base64');

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');

    return successResponse({
      authUrl: authUrl.toString(),
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}
