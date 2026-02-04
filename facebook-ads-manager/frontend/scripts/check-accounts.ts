import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    const fbAccounts = await prisma.facebookBusinessAccount.findMany({
      include: {
        adAccounts: true,
      },
    });

    console.log('\n📊 Facebook Business Accounts:');
    console.log('================================\n');

    if (fbAccounts.length === 0) {
      console.log('❌ No Facebook Business Accounts found');
      return;
    }

    for (const fbAccount of fbAccounts) {
      console.log(`Business: ${fbAccount.name}`);
      console.log(`  ID: ${fbAccount.id}`);
      console.log(`  Business ID: ${fbAccount.businessId}`);
      console.log(`  Active: ${fbAccount.isActive}`);
      console.log(`  Last Sync: ${fbAccount.lastSyncAt}`);
      console.log(`  Ad Accounts: ${fbAccount.adAccounts.length}\n`);

      if (fbAccount.adAccounts.length > 0) {
        fbAccount.adAccounts.forEach((ad, index) => {
          console.log(`    ${index + 1}. ${ad.name}`);
          console.log(`       Account ID: ${ad.accountId}`);
          console.log(`       Currency: ${ad.currency}`);
          console.log(`       Status: ${ad.accountStatus}\n`);
        });
      } else {
        console.log('    ⚠️  No ad accounts imported yet\n');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
