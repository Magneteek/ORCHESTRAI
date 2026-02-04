import { PrismaClient } from '@prisma/client';
import { FacebookClient } from '../lib/facebook/client';
import { CampaignsSync } from '../lib/facebook/sync/campaigns';
import { decrypt } from '../lib/utils/encryption';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function syncCampaigns() {
  try {
    // Get first active ad account
    const adAccount = await prisma.adAccount.findFirst({
      where: { accountStatus: 'ACTIVE' },
      include: {
        facebookBusinessAccount: true,
      },
    });

    if (!adAccount) {
      console.error('❌ No active ad account found');
      return;
    }

    console.log('🔄 Syncing campaigns for:', adAccount.name);
    console.log('   Account ID:', adAccount.accountId);
    console.log('   DB ID:', adAccount.id);

    // Decrypt access token
    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    console.log('✅ Access token decrypted');

    // Initialize Facebook client
    const clientConfig = {
      appId: process.env.FACEBOOK_APP_ID || '',
      appSecret: process.env.FACEBOOK_APP_SECRET || '',
      apiVersion: process.env.FACEBOOK_API_VERSION || 'v22.0',
      accessToken,
    };

    const client = new FacebookClient(clientConfig, redis);
    const campaignsSync = new CampaignsSync(client);

    console.log('\n📡 Fetching campaigns from Facebook API...');
    const result = await campaignsSync.syncCampaigns(adAccount.accountId, {
      forceRefresh: true,
      dbAdAccountId: adAccount.id,
    });

    if (!result.success) {
      console.error('❌ Sync failed:', result.error);
      return;
    }

    console.log(`\n✅ Successfully synced ${result.data?.length || 0} campaigns from Facebook`);

    // Verify in database
    const campaigns = await prisma.campaign.findMany({
      where: { adAccountId: adAccount.id },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`\n📊 Database now has ${campaigns.length} campaigns:`);
    campaigns.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.status}) - ${c.objective}`);
    });

    console.log('\n✅ Sync complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await redis.quit();
  }
}

syncCampaigns();
