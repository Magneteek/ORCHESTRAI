import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/utils/encryption';

const prisma = new PrismaClient();

async function importAllAdAccounts() {
  try {
    const fbAccount = await prisma.facebookBusinessAccount.findFirst({
      where: { businessId: '1637506043480704' },
    });

    if (!fbAccount) {
      console.error('❌ Facebook Business Account not found');
      return;
    }

    console.log('✅ Found Facebook Business Account:', fbAccount.name);
    const accessToken = decrypt(fbAccount.accessTokenEncrypted);

    const allAccounts: any[] = [];

    // 1. Business owned ad accounts
    console.log('\n🔍 Fetching business-owned ad accounts...');
    const ownedUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/owned_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const ownedResponse = await fetch(ownedUrl);
    const ownedData = await ownedResponse.json();

    if (ownedResponse.ok && ownedData.data) {
      console.log(`✅ Found ${ownedData.data.length} business-owned ad accounts`);
      allAccounts.push(...ownedData.data);
    }

    // 2. User's personal ad accounts
    console.log('\n🔍 Fetching user\'s personal ad accounts...');
    const userUrl = `https://graph.facebook.com/v22.0/me/adaccounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const userResponse = await fetch(userUrl);
    const userData = await userResponse.json();

    if (userResponse.ok && userData.data) {
      console.log(`✅ Found ${userData.data.length} user personal ad accounts`);
      const existingIds = new Set(allAccounts.map(a => a.id));
      const newAccounts = userData.data.filter((a: any) => !existingIds.has(a.id));
      allAccounts.push(...newAccounts);
      console.log(`➕ Added ${newAccounts.length} additional accounts`);
    }

    // Import all accounts
    console.log(`\n💾 Importing ${allAccounts.length} total ad accounts...`);

    for (const account of allAccounts) {
      console.log(`  → ${account.name} (${account.id})`);
      await prisma.adAccount.upsert({
        where: {
          facebookBusinessAccountId_accountId: {
            facebookBusinessAccountId: fbAccount.id,
            accountId: account.id,
          },
        },
        update: {
          name: account.name,
          currency: account.currency,
          timezone: account.timezone_name,
          accountStatus: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
          lastSyncAt: new Date(),
        },
        create: {
          facebookBusinessAccountId: fbAccount.id,
          accountId: account.id,
          name: account.name,
          currency: account.currency,
          timezone: account.timezone_name,
          accountStatus: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
        },
      });
    }

    console.log(`\n✅ Successfully imported ${allAccounts.length} ad accounts!`);
    console.log('\nRefresh your dashboard to see all accounts in the dropdown.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAllAdAccounts();
