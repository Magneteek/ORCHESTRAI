import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/utils/encryption';

const prisma = new PrismaClient();

async function testAnalyticsAPI() {
  try {
    // Get an ad account
    const adAccount = await prisma.adAccount.findFirst({
      where: { accountId: 'act_464009406641423' },
      include: { facebookBusinessAccount: true },
    });

    if (!adAccount) {
      console.error('❌ Ad account not found');
      return;
    }

    console.log('✅ Testing analytics for:', adAccount.name);
    console.log('   Account ID:', adAccount.accountId);

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    // Test Facebook Insights API
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    const fromDate = lastMonth.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];

    console.log(`\n📊 Fetching insights from ${fromDate} to ${toDate}...`);

    const insightsUrl = `https://graph.facebook.com/v22.0/${adAccount.accountId}/insights?access_token=${accessToken}&time_range={"since":"${fromDate}","until":"${toDate}"}&fields=impressions,clicks,spend,actions,cpm,cpc,ctr,reach,frequency`;

    const response = await fetch(insightsUrl);
    const data = await response.json();

    console.log('\nResponse Status:', response.status);
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.data && data.data.length > 0) {
      const insights = data.data[0];
      console.log('\n📈 Summary:');
      console.log('   Impressions:', insights.impressions || 0);
      console.log('   Clicks:', insights.clicks || 0);
      console.log('   Spend:', insights.spend || 0);
      console.log('   CPM:', insights.cpm || 0);
      console.log('   CTR:', insights.ctr || 0);
    } else {
      console.log('\n⚠️  No insights data available for this time range');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsAPI();
