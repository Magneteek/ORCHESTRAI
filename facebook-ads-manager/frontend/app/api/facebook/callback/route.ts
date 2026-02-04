import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/utils/api-response';
import { createFacebookBusinessAccount, createAdAccount } from '@/lib/db/facebook-accounts';
import { BadRequestError, InternalServerError } from '@/lib/utils/errors';
import { prisma } from '@/lib/db/prisma';
import { encrypt } from '@/lib/utils/encryption';

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

    // Upsert Facebook Business Account (create or update if already exists)
    const business = businessData.data[0];
    const encryptedToken = encrypt(accessToken);

    const facebookAccount = await prisma.facebookBusinessAccount.upsert({
      where: {
        organizationId_businessId: {
          organizationId,
          businessId: business.id,
        },
      },
      update: {
        name: business.name,
        accessTokenEncrypted: encryptedToken,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        organizationId,
        businessId: business.id,
        name: business.name,
        accessTokenEncrypted: encryptedToken,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
      },
    });

    // Get Ad Accounts for the business
    console.log('🔍 Fetching ad accounts for business:', business.id);
    const adAccountsUrl = new URL(
      `https://graph.facebook.com/v18.0/${business.id}/owned_ad_accounts`
    );
    adAccountsUrl.searchParams.set('access_token', accessToken);
    adAccountsUrl.searchParams.set('fields', 'id,name,currency,timezone_name,account_status');

    console.log('📡 Ad accounts URL:', adAccountsUrl.toString().replace(accessToken, 'REDACTED'));
    const adAccountsResponse = await fetch(adAccountsUrl.toString());
    const adAccountsData = await adAccountsResponse.json();

    console.log('✅ Ad accounts response status:', adAccountsResponse.status);
    console.log('📊 Ad accounts response data:', JSON.stringify(adAccountsData, null, 2));

    // Collect all ad accounts from multiple sources
    const allAccounts: any[] = [];

    // 1. Business owned ad accounts
    if (adAccountsResponse.ok && adAccountsData.data) {
      console.log(`✅ Found ${adAccountsData.data.length} business-owned ad accounts`);
      allAccounts.push(...adAccountsData.data);
    } else {
      console.warn('⚠️ No business ad accounts found');
    }

    // 2. Get user's personal ad accounts
    console.log('🔍 Fetching user\'s personal ad accounts...');
    const userAccountsUrl = new URL('https://graph.facebook.com/v18.0/me/adaccounts');
    userAccountsUrl.searchParams.set('access_token', accessToken);
    userAccountsUrl.searchParams.set('fields', 'id,name,currency,timezone_name,account_status');

    const userAccountsResponse = await fetch(userAccountsUrl.toString());
    const userAccountsData = await userAccountsResponse.json();

    if (userAccountsResponse.ok && userAccountsData.data) {
      console.log(`✅ Found ${userAccountsData.data.length} user personal ad accounts`);
      // Merge with business accounts, avoiding duplicates
      const existingIds = new Set(allAccounts.map(a => a.id));
      const newAccounts = userAccountsData.data.filter((a: any) => !existingIds.has(a.id));
      allAccounts.push(...newAccounts);
      console.log(`➕ Added ${newAccounts.length} additional accounts (${existingIds.size} were duplicates)`);
    }

    console.log(`💾 Importing ${allAccounts.length} total ad accounts...`);

    // Upsert all ad accounts in database
    if (allAccounts.length > 0) {
      await Promise.all(
        allAccounts.map((account: any) => {
          console.log('  → Upserting account:', account.id, account.name);
          return prisma.adAccount.upsert({
            where: {
              facebookBusinessAccountId_accountId: {
                facebookBusinessAccountId: facebookAccount.id,
                accountId: account.id,
              },
            },
            update: {
              name: account.name,
              currency: account.currency,
              timezone: account.timezone_name,
              accountStatus: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
              lastSyncAt: new Date(),
            },
            create: {
              facebookBusinessAccountId: facebookAccount.id,
              accountId: account.id,
              name: account.name,
              currency: account.currency,
              timezone: account.timezone_name,
              accountStatus: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
            },
          });
        })
      );
      console.log(`✅ Successfully imported ${allAccounts.length} ad accounts`);
    } else {
      console.warn('⚠️ No ad accounts found from any source');
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
