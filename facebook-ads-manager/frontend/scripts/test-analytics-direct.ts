import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/utils/encryption';

const prisma = new PrismaClient();

async function testAnalyticsDirect() {
  try {
    const adAccount = await prisma.adAccount.findFirst({
      where: { accountStatus: 'ACTIVE' },
      include: {
        facebookBusinessAccount: true,
      },
    });

    if (!adAccount) {
      console.error('No ad account found');
      return;
    }

    console.log('Testing analytics for:', adAccount.name);
    console.log('Account ID:', adAccount.accountId);

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);

    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    const fromDate = lastMonth.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];

    const url = `https://graph.facebook.com/v22.0/${adAccount.accountId}/insights?access_token=${accessToken}&time_range={"since":"${fromDate}","until":"${toDate}"}&fields=impressions,clicks,spend,actions,cpm,cpc,ctr,reach,frequency`;

    console.log('\nFetching insights...');
    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const insights = data.data[0];
      console.log('\n✅ Got insights:');
      console.log('   Impressions:', insights.impressions);
      console.log('   Clicks:', insights.clicks);
      console.log('   Spend:', insights.spend);
      console.log('   CPM:', insights.cpm);
      console.log('   CTR:', insights.ctr);

      // Find conversions
      if (insights.actions) {
        const conversions = insights.actions.filter((a: any) =>
          ['lead', 'purchase', 'complete_registration'].includes(a.action_type)
        );
        console.log('   Conversions:', conversions.reduce((sum: number, a: any) => sum + parseInt(a.value), 0));
      }
    } else {
      console.log('\n⚠️  No insights data');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalyticsDirect();
