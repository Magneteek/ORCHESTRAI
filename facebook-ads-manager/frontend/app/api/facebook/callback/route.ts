import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/utils/api-response';
import { createFacebookBusinessAccount, createAdAccount } from '@/lib/db/facebook-accounts';
import { BadRequestError, InternalServerError } from '@/lib/utils/errors';

/**
 * GET /api/facebook/callback - Handle Facebook OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      throw new BadRequestError(`Facebook OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new BadRequestError('Missing authorization code or state');
    }

    // Decode state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    const { userId, organizationId } = stateData;

    // Exchange code for access token
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/facebook/callback`;

    if (!appId || !appSecret) {
      throw new InternalServerError('Facebook credentials not configured');
    }

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new BadRequestError('Failed to exchange code for access token');
    }

    const accessToken = tokenData.access_token;

    // Get user's Business Accounts
    const businessUrl = new URL('https://graph.facebook.com/v18.0/me/businesses');
    businessUrl.searchParams.set('access_token', accessToken);
    businessUrl.searchParams.set('fields', 'id,name');

    const businessResponse = await fetch(businessUrl.toString());
    const businessData = await businessResponse.json();

    if (!businessResponse.ok || !businessData.data || businessData.data.length === 0) {
      throw new BadRequestError('No Business Accounts found');
    }

    // Create Facebook Business Account in database
    const business = businessData.data[0];
    const facebookAccount = await createFacebookBusinessAccount(organizationId, userId, {
      businessId: business.id,
      name: business.name,
      accessToken,
      tokenExpiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : undefined,
    });

    // Get Ad Accounts for the business
    const adAccountsUrl = new URL(
      `https://graph.facebook.com/v18.0/${business.id}/adaccounts`
    );
    adAccountsUrl.searchParams.set('access_token', accessToken);
    adAccountsUrl.searchParams.set('fields', 'id,name,currency,timezone_name,account_status');

    const adAccountsResponse = await fetch(adAccountsUrl.toString());
    const adAccountsData = await adAccountsResponse.json();

    // Create Ad Accounts in database
    if (adAccountsResponse.ok && adAccountsData.data) {
      await Promise.all(
        adAccountsData.data.map((account: any) =>
          createAdAccount(facebookAccount.id, userId, {
            accountId: account.id,
            name: account.name,
            currency: account.currency,
            timezone: account.timezone_name,
            accountStatus: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
          })
        )
      );
    }

    // Redirect to success page
    const successUrl = new URL('/dashboard/facebook/success', request.url);
    successUrl.searchParams.set('accountId', facebookAccount.id);

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);

    // Redirect to error page
    const errorUrl = new URL('/dashboard/facebook/error', request.url);
    errorUrl.searchParams.set(
      'error',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return NextResponse.redirect(errorUrl);
  }
}
