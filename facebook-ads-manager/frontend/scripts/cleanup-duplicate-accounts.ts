import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up duplicate ad accounts...\n');

  // Find duplicate accounts (same accountId, different UUID)
  const allAccounts = await prisma.adAccount.findMany({
    include: {
      facebookBusinessAccount: {
        select: {
          organizationId: true,
        },
      },
      _count: {
        select: {
          campaigns: true,
        },
      },
    },
  });

  const accountsByFbId: Record<string, typeof allAccounts> = {};

  allAccounts.forEach(acc => {
    if (!accountsByFbId[acc.accountId]) {
      accountsByFbId[acc.accountId] = [];
    }
    accountsByFbId[acc.accountId].push(acc);
  });

  console.log('📊 Accounts by Facebook ID:\n');

  for (const [fbId, accounts] of Object.entries(accountsByFbId)) {
    if (accounts.length > 1) {
      console.log(`🔄 ${accounts[0].name} (${fbId})`);
      console.log(`   Found ${accounts.length} duplicates:`);

      accounts.forEach(acc => {
        console.log(`   - UUID: ${acc.id}`);
        console.log(`     Org: ${acc.facebookBusinessAccount.organizationId}`);
        console.log(`     Campaigns: ${acc._count.campaigns}`);
      });
      console.log();
    }
  }

  console.log('\n⚠️  To clean up, we would:');
  console.log('1. Keep the account with campaigns');
  console.log('2. Delete empty duplicates');
  console.log('3. Merge campaigns if multiple have data');
  console.log('\n❌ Automatic cleanup not implemented yet to avoid data loss');

  await prisma.$disconnect();
}

cleanupDuplicates().catch(console.error);
