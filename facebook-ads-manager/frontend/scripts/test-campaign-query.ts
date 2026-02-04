import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['query'] });

async function testQuery() {
  const adAccountId = 'd90b261e-a15d-415f-aadc-d8a39bcffa71';

  console.log(`🔍 Testing campaign query for account: ${adAccountId}\n`);

  // Test the exact query the API uses
  const campaigns = await prisma.campaign.findMany({
    where: {
      adAccountId: adAccountId,
    },
    include: {
      adSets: {
        select: {
          id: true,
        },
      },
    },
  });

  console.log(`✅ Found ${campaigns.length} campaigns\n`);

  campaigns.forEach(c => {
    console.log(`- ${c.name}`);
    console.log(`  Status: ${c.status}`);
    console.log(`  ID: ${c.id}`);
    console.log(`  Campaign ID: ${c.campaignId}`);
  });

  await prisma.$disconnect();
}

testQuery().catch(console.error);
