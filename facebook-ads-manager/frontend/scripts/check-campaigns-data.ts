import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check ad accounts
    const adAccounts = await prisma.adAccount.findMany({
      select: {
        id: true,
        name: true,
        accountId: true,
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
    });

    console.log('📊 Ad Accounts:');
    adAccounts.forEach(acc => {
      console.log(`  - ${acc.name}`);
      console.log(`    UUID: ${acc.id}`);
      console.log(`    FB ID: ${acc.accountId}`);
      console.log(`    Campaigns: ${acc._count.campaigns}\n`);
    });

    // Check total campaigns
    const totalCampaigns = await prisma.campaign.count();
    console.log(`📈 Total campaigns in DB: ${totalCampaigns}\n`);

    // Show campaigns grouped by account
    const campaignsByAccount = await prisma.campaign.groupBy({
      by: ['adAccountId'],
      _count: true,
    });

    console.log('📋 Campaigns by account ID:');
    for (const group of campaignsByAccount) {
      const account = await prisma.adAccount.findUnique({
        where: { id: group.adAccountId },
        select: { name: true },
      });
      console.log(`  - ${account?.name || 'Unknown'}: ${group._count} campaigns`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
