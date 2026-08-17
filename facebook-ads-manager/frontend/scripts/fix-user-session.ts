import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function fixUserSession() {
  console.log('🔧 Fixing user session...\n');

  // Get the current organization
  const org = await prisma.organization.findFirst();

  if (!org) {
    console.log('❌ No organization found. Creating one...');

    const newOrg = await prisma.organization.create({
      data: {
        name: 'KrisTest',
        // Required and unique in the schema; omitting it failed at runtime as
        // well as in the type checker, which blocked `next build`.
        slug: 'kristest',
      },
    });

    console.log(`✅ Created organization: ${newOrg.id}\n`);
  }

  // Get or create the user
  const userEmail = 'kristjan.balzan@gmail.com';
  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  const currentOrg = org || await prisma.organization.findFirst();

  if (!currentOrg) {
    console.log('❌ Still no organization! Something is very wrong.');
    return;
  }

  if (!user) {
    console.log(`📝 User not found. Creating ${userEmail}...`);

    const hashedPassword = await hash('Test12345', 10);

    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Kristjan Balzan',
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: currentOrg.id,
      },
    });

    console.log(`✅ Created user: ${user.id}\n`);
  } else if (user.organizationId !== currentOrg.id) {
    console.log(`⚠️  User has wrong organization ID`);
    console.log(`   Current: ${user.organizationId}`);
    console.log(`   Expected: ${currentOrg.id}`);
    console.log(`   Updating...\n`);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: currentOrg.id,
      },
    });

    console.log(`✅ Updated user organization\n`);
  } else {
    console.log(`✅ User already has correct organization ID\n`);
  }

  // Delete any sessions to force re-login
  console.log('🗑️  Deleting old sessions...');

  const deletedCount = await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  console.log(`✅ Deleted ${deletedCount.count} old sessions\n`);

  console.log('✨ All fixed! Please log in again.\n');
  console.log('📧 Email: kristjan.balzan@gmail.com');
  console.log('🔑 Password: Test12345');

  await prisma.$disconnect();
}

fixUserSession().catch(console.error);
