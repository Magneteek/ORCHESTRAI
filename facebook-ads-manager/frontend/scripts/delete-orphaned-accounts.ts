import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOrphanedAccounts() {
  const userOrgId = '013f6d45-9d56-4626-8d8f-dc42be92d8b9';
  const orphanedOrgId = '4cbab0b0-8a8e-4f2c-bade-214c91f38bb0';

  console.log('🗑️  Deleting orphaned ad accounts from old organization...\n');

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

  console.log(`Found ${orphanedAccounts.length} orphaned accounts:\n`);

  for (const account of orphanedAccounts) {
    console.log(`- ${account.name} (${account.id})`);
    console.log(`  Campaigns: ${account._count.campaigns}`);

    if (account._count.campaigns > 0) {
      // Move campaigns to the user's organization account
      console.log(`  ⚠️  Has campaigns - need to migrate them first!`);
    }
  }

  // Find accounts that need campaign migration
  const accountsNeedingMigration = orphanedAccounts.filter(a => a._count.campaigns > 0);

  if (accountsNeedingMigration.length > 0) {
    console.log(`\n📦 Migrating campaigns from ${accountsNeedingMigration.length} accounts...\n`);

    for (const orphanedAccount of accountsNeedingMigration) {
      // Find the corresponding account in user's org
      const userAccount = await prisma.adAccount.findFirst({
        where: {
          accountId: orphanedAccount.accountId,
          facebookBusinessAccount: {
            organizationId: userOrgId,
          },
        },
      });

      if (userAccount) {
        console.log(`  Migrating ${orphanedAccount._count.campaigns} campaigns from ${orphanedAccount.name}`);
        console.log(`    From: ${orphanedAccount.id}`);
        console.log(`    To:   ${userAccount.id}`);

        // Update campaigns to point to the user's org account
        await prisma.campaign.updateMany({
          where: {
            adAccountId: orphanedAccount.id,
          },
          data: {
            adAccountId: userAccount.id,
          },
        });

        console.log(`  ✅ Migrated\n`);
      } else {
        console.log(`  ⚠️  No matching account found in user org for ${orphanedAccount.name}\n`);
      }
    }
  }

  // Now delete all orphaned accounts
  console.log(`\n🗑️  Deleting orphaned accounts...\n`);

  const deleted = await prisma.adAccount.deleteMany({
    where: {
      facebookBusinessAccount: {
        organizationId: orphanedOrgId,
      },
    },
  });

  console.log(`✅ Deleted ${deleted.count} orphaned ad accounts\n`);

  // Check if the orphaned Facebook Business Account can be deleted
  const orphanedFbAccount = await prisma.facebookBusinessAccount.findFirst({
    where: {
      organizationId: orphanedOrgId,
    },
    include: {
      _count: {
        select: {
          adAccounts: true,
        },
      },
    },
  });

  if (orphanedFbAccount && orphanedFbAccount._count.adAccounts === 0) {
    await prisma.facebookBusinessAccount.delete({
      where: { id: orphanedFbAccount.id },
    });
    console.log(`✅ Deleted orphaned Facebook Business Account\n`);
  }

  // Check if the orphaned organization can be deleted
  const orphanedOrg = await prisma.organization.findUnique({
    where: { id: orphanedOrgId },
    include: {
      _count: {
        select: {
          users: true,
          facebookBusinessAccounts: true,
        },
      },
    },
  });

  if (orphanedOrg && orphanedOrg._count.users === 0 && orphanedOrg._count.facebookBusinessAccounts === 0) {
    await prisma.organization.delete({
      where: { id: orphanedOrgId },
    });
    console.log(`✅ Deleted orphaned organization\n`);
  }

  console.log('✨ Cleanup complete!');

  await prisma.$disconnect();
}

deleteOrphanedAccounts().catch(console.error);
