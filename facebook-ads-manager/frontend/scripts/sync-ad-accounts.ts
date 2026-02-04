import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/utils/encryption';

const prisma = new PrismaClient();

async function syncAdAccounts() {
  try {
    // Get the Facebook Business Account
    const fbAccount = await prisma.facebookBusinessAccount.findFirst({
      where: { businessId: '1637506043480704' },
    });

    if (!fbAccount) {
      console.error('Facebook Business Account not found');
      return;
    }

    console.log('Found Facebook Business Account:', fbAccount.name);

    // Decrypt access token
    const accessToken = decrypt(fbAccount.accessTokenEncrypted);
    console.log('Access token decrypted');

    // Fetch ad accounts from Facebook
    const url = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/owned_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;

    console.log('Fetching ad accounts from Facebook...');
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook API error:', data);
      return;
    }

    console.log('Found', data.data?.length || 0, 'ad accounts');

    if (!data.data || data.data.length === 0) {
      console.log('No ad accounts found for this business');
      return;
    }

    // Import ad accounts
    for (const account of data.data) {
      console.log('Importing:', account.name, account.id);

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

    console.log('✅ Successfully imported', data.data.length, 'ad accounts');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAdAccounts();
