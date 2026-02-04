import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSync() {
  try {
    // Get first ad account
    const adAccount = await prisma.adAccount.findFirst({
      where: { accountStatus: 'ACTIVE' },
    });

    if (!adAccount) {
      console.error('❌ No active ad account found');
      return;
    }

    console.log('🔄 Testing sync for account:', adAccount.name);
    console.log('   ID:', adAccount.id);

    // Call sync endpoint
    const response = await fetch('http://localhost:3001/api/sync/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real usage, this would need auth headers
      },
      body: JSON.stringify({
        adAccountId: adAccount.id,
      }),
    });

    const data = await response.json();
    console.log('\n📊 Response:', JSON.stringify(data, null, 2));

    // Check database
    const campaigns = await prisma.campaign.findMany({
      where: { adAccountId: adAccount.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`\n✅ Found ${campaigns.length} campaigns in database:`);
    campaigns.forEach((c) => {
      console.log(`   - ${c.name} (${c.status})`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();
