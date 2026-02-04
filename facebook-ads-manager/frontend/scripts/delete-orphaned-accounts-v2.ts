import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOrphanedAccounts() {
  const orphanedOrgId = '4cbab0b0-8a8e-4f2c-bade-214c91f38bb0';

  console.log('🗑️  Deleting orphaned ad accounts and their data...\n');

  // Get orphaned accounts
  const orphanedAccounts = await prisma.adAccount.findMany({
    where: {
      facebookBusinessAccount: {
        organizationId: orphanedOrgId,
      },
    },
    include: {
      _count: {
        select: {
          campaigns: true,
        },
      },
    },
  });

  console.log(`Found ${orphanedAccounts.length} orphaned accounts\n`);

  // Delete campaigns from orphaned accounts
  for (const account of orphanedAccounts) {
    if (account._count.campaigns > 0) {
      console.log(`Deleting ${account._count.campaigns} campaigns from ${account.name}...`);

      await prisma.campaign.deleteMany({
        where: {
          adAccountId: account.id,
        },
      });

      console.log(`✅ Deleted\n`);
    }
  }

  // Delete orphaned ad accounts
  console.log(`Deleting ${orphanedAccounts.length} orphaned ad accounts...`);

  const deletedAccounts = await prisma.adAccount.deleteMany({
    where: {
      facebookBusinessAccount: {
        organizationId: orphanedOrgId,
      },
    },
  });

  console.log(`✅ Deleted ${deletedAccounts.count} ad accounts\n`);

  // Delete orphaned Facebook Business Accounts
  const deletedFbAccounts = await prisma.facebookBusinessAccount.deleteMany({
    where: {
      organizationId: orphanedOrgId,
    },
  });

  console.log(`✅ Deleted ${deletedFbAccounts.count} Facebook Business Accounts\n`);

  // Delete orphaned organization
  await prisma.organization.delete({
    where: { id: orphanedOrgId },
  });

  console.log(`✅ Deleted orphaned organization\n`);
  console.log('✨ Cleanup complete!');

  await prisma.$disconnect();
}

deleteOrphanedAccounts().catch(console.error);
