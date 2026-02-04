/**
 * Comprehensive data sync script
 * Syncs campaigns → ad sets → ads → insights from Facebook to database
 */

import { PrismaClient } from '@prisma/client';
import { FacebookClient } from '../lib/facebook/client';
import { CampaignsSync } from '../lib/facebook/sync/campaigns';
import { decrypt } from '../lib/utils/encryption';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function syncAll() {
  try {
    console.log('🚀 Starting comprehensive Facebook data sync...\n');

    // Get all active ad accounts
    const adAccounts = await prisma.adAccount.findMany({
      where: { accountStatus: 'ACTIVE' },
      include: {
        facebookBusinessAccount: true,
      },
      take: 3, // Limit to first 3 accounts for now
    });

    console.log(`📊 Found ${adAccounts.length} active ad accounts\n`);

    for (const adAccount of adAccounts) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 Syncing: ${adAccount.name}`);
      console.log(`${'='.repeat(60)}`);

      try {
        // Decrypt access token
        const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);

        // Initialize Facebook client
        const clientConfig = {
          appId: process.env.FACEBOOK_APP_ID || '',
          appSecret: process.env.FACEBOOK_APP_SECRET || '',
          apiVersion: process.env.FACEBOOK_API_VERSION || 'v22.0',
          accessToken,
        };

        const client = new FacebookClient(clientConfig, redis);
        const campaignsSync = new CampaignsSync(client);

        // 1. Sync Campaigns
        console.log('\n1️⃣ Syncing campaigns...');
        const campaignsResult = await campaignsSync.syncCampaigns(adAccount.accountId, {
          forceRefresh: true,
          dbAdAccountId: adAccount.id,
        });

        if (campaignsResult.success) {
          console.log(`   ✅ Synced ${campaignsResult.data?.length || 0} campaigns`);
        } else {
          console.error(`   ❌ Failed: ${campaignsResult.error}`);
          continue;
        }

        // TODO: Add ad-sets and ads sync when ready
        console.log(`\n✅ Completed sync for ${adAccount.name}`);
      } catch (error: any) {
        console.error(`❌ Error syncing ${adAccount.name}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SYNC SUMMARY');
    console.log(`${'='.repeat(60)}\n`);

    // Display summary
    const totalCampaigns = await prisma.campaign.count();
    console.log(`Campaigns in database: ${totalCampaigns}`);

    console.log('\n✅ Sync complete!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
  }
}

syncAll();
