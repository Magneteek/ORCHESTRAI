import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { FacebookClient } from '@/lib/facebook/client';
import { CampaignsSync } from '@/lib/facebook/sync/campaigns';
import { decrypt } from '@/lib/utils/encryption';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * POST /api/sync/campaigns
 * Manually trigger campaign synchronization from Facebook to database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { adAccountId } = await request.json();

    if (!adAccountId) {
      return NextResponse.json(
        { success: false, error: { message: 'adAccountId is required', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    console.log('🔄 Manual sync triggered for account:', adAccountId);

    // Get ad account with Facebook credentials
    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
      },
      include: {
        facebookBusinessAccount: true,
      },
    });

    if (!adAccount) {
      return NextResponse.json(
        { success: false, error: { message: 'Ad account not found or access denied', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    console.log('✅ Ad account found:', adAccount.name);
    console.log('   Facebook Account ID:', adAccount.accountId);

    // Decrypt access token
    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Initialize Facebook client
    const clientConfig = {
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
      apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0',
      accessToken,
    };

    const client = new FacebookClient(clientConfig, redis);
    const campaignsSync = new CampaignsSync(client);

    // Sync campaigns from Facebook and save to database
    console.log('📡 Fetching campaigns from Facebook API...');
    const result = await campaignsSync.syncCampaigns(adAccount.accountId, {
      forceRefresh: true,
      dbAdAccountId: adAccount.id, // Pass database ID for persistence
    });

    if (!result.success) {
      console.error('❌ Sync failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error?.message || 'Failed to sync campaigns',
            code: 'SYNC_FAILED',
          },
        },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully synced ${result.data?.length || 0} campaigns`);

    return NextResponse.json({
      success: true,
      data: {
        synced: result.data?.length || 0,
        campaigns: result.data,
      },
      message: `Successfully synced ${result.data?.length || 0} campaigns`,
    });
  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
