import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/utils/encryption';

const prisma = new PrismaClient();

async function checkAllAdAccounts() {
  try {
    const fbAccount = await prisma.facebookBusinessAccount.findFirst({
      where: { businessId: '1637506043480704' },
    });

    if (!fbAccount) {
      console.error('❌ Facebook Business Account not found');
      return;
    }

    const accessToken = decrypt(fbAccount.accessTokenEncrypted);

    console.log('🔍 Checking all possible ad account endpoints...\n');

    // 1. owned_ad_accounts
    console.log('1️⃣ OWNED AD ACCOUNTS:');
    const ownedUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/owned_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const ownedResponse = await fetch(ownedUrl);
    const ownedData = await ownedResponse.json();
    console.log(`   Status: ${ownedResponse.status}`);
    console.log(`   Count: ${ownedData.data?.length || 0}`);
    if (ownedData.data?.length > 0) {
      ownedData.data.forEach((acc: any) => console.log(`   - ${acc.name} (${acc.id})`));
    }
    console.log();

    // 2. client_ad_accounts
    console.log('2️⃣ CLIENT AD ACCOUNTS:');
    const clientUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/client_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const clientResponse = await fetch(clientUrl);
    const clientData = await clientResponse.json();
    console.log(`   Status: ${clientResponse.status}`);
    console.log(`   Count: ${clientData.data?.length || 0}`);
    if (clientData.data?.length > 0) {
      clientData.data.forEach((acc: any) => console.log(`   - ${acc.name} (${acc.id})`));
    }
    console.log();

    // 3. assigned_ad_accounts
    console.log('3️⃣ ASSIGNED AD ACCOUNTS:');
    const assignedUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/assigned_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const assignedResponse = await fetch(assignedUrl);
    const assignedData = await assignedResponse.json();
    console.log(`   Status: ${assignedResponse.status}`);
    console.log(`   Count: ${assignedData.data?.length || 0}`);
    if (assignedData.data?.length > 0) {
      assignedData.data.forEach((acc: any) => console.log(`   - ${acc.name} (${acc.id})`));
    }
    console.log();

    // 4. Check via /me/adaccounts (user's personal accounts)
    console.log('4️⃣ USER\'S PERSONAL AD ACCOUNTS (/me/adaccounts):');
    const meUrl = `https://graph.facebook.com/v22.0/me/adaccounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();
    console.log(`   Status: ${meResponse.status}`);
    console.log(`   Count: ${meData.data?.length || 0}`);
    if (meData.data?.length > 0) {
      meData.data.forEach((acc: any) => console.log(`   - ${acc.name} (${acc.id})`));
    }
    console.log();

    // Summary
    const totalUnique = new Set([
      ...(ownedData.data || []).map((a: any) => a.id),
      ...(clientData.data || []).map((a: any) => a.id),
      ...(assignedData.data || []).map((a: any) => a.id),
      ...(meData.data || []).map((a: any) => a.id),
    ]).size;

    console.log('📊 SUMMARY:');
    console.log(`   Total unique ad accounts found: ${totalUnique}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllAdAccounts();
