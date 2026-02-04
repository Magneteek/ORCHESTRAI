import { PrismaClient } from '@prisma/client';
import { decrypt } from '../lib/utils/encryption';

const prisma = new PrismaClient();

async function testFacebookAPI() {
  try {
    const fbAccount = await prisma.facebookBusinessAccount.findFirst({
      where: { businessId: '1637506043480704' },
    });

    if (!fbAccount) {
      console.error('❌ Facebook Business Account not found');
      return;
    }

    console.log('✅ Found Facebook Business Account:', fbAccount.name);
    console.log('   Business ID:', fbAccount.businessId);

    // Decrypt access token
    const accessToken = decrypt(fbAccount.accessTokenEncrypted);
    console.log('✅ Access token decrypted (length:', accessToken.length, ')');

    // Test 1: Get business info
    console.log('\n📡 Test 1: Fetching business info...');
    const businessUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}?access_token=${accessToken}&fields=id,name`;
    const businessResponse = await fetch(businessUrl);
    const businessData = await businessResponse.json();
    console.log('Response:', businessResponse.status);
    console.log('Data:', JSON.stringify(businessData, null, 2));

    // Test 2: Get ad accounts
    console.log('\n📡 Test 2: Fetching ad accounts...');
    const adAccountsUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/adaccounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const adAccountsResponse = await fetch(adAccountsUrl);
    const adAccountsData = await adAccountsResponse.json();
    console.log('Response:', adAccountsResponse.status);
    console.log('Data:', JSON.stringify(adAccountsData, null, 2));

    // Test 3: Try owned_ad_accounts
    console.log('\n📡 Test 3: Fetching owned_ad_accounts...');
    const ownedUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/owned_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const ownedResponse = await fetch(ownedUrl);
    const ownedData = await ownedResponse.json();
    console.log('Response:', ownedResponse.status);
    console.log('Data:', JSON.stringify(ownedData, null, 2));

    // Test 4: Try client_ad_accounts
    console.log('\n📡 Test 4: Fetching client_ad_accounts...');
    const clientUrl = `https://graph.facebook.com/v22.0/${fbAccount.businessId}/client_ad_accounts?access_token=${accessToken}&fields=id,name,currency,timezone_name,account_status`;
    const clientResponse = await fetch(clientUrl);
    const clientData = await clientResponse.json();
    console.log('Response:', clientResponse.status);
    console.log('Data:', JSON.stringify(clientData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFacebookAPI();
