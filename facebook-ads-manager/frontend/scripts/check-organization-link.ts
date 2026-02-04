import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrgLinks() {
  console.log('🔍 Checking organization links...\n');

  // Get user
  const user = await prisma.user.findFirst({
    where: { email: 'kristjan.balzan@gmail.com' },
    select: {
      id: true,
      email: true,
      organizationId: true,
    },
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log(`👤 User: ${user.email}`);
  console.log(`   Organization ID: ${user.organizationId}\n`);

  // Get ad accounts in user's organization
  const fbAccounts = await prisma.facebookBusinessAccount.findMany({
    where: {
      organizationId: user.organizationId,
    },
    include: {
      adAccounts: {
        include: {
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
      },
    },
  });

  console.log(`📊 Facebook Business Accounts: ${fbAccounts.length}\n`);

  fbAccounts.forEach(fb => {
    console.log(`  FB Account ID: ${fb.id}`);
    console.log(`  Ad Accounts: ${fb.adAccounts.length}`);
    fb.adAccounts.forEach(ad => {
      console.log(`    - ${ad.name} (${ad.id})`);
      console.log(`      Campaigns: ${ad._count.campaigns}`);
    });
    console.log();
  });

  await prisma.$disconnect();
}

checkOrgLinks().catch(console.error);
