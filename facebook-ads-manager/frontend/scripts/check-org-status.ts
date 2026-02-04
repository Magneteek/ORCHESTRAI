import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrganizations() {
  const orgs = await prisma.organization.findMany({
    include: {
      users: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log(`📊 Organizations: ${orgs.length}\n`);

  orgs.forEach(org => {
    console.log(`- ${org.name} (${org.id})`);
    console.log(`  Users: ${org.users.map(u => u.email).join(', ')}`);
  });

  // Check users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      organizationId: true,
    },
  });

  console.log(`\n👥 Users: ${users.length}\n`);

  users.forEach(u => {
    console.log(`- ${u.email}`);
    console.log(`  Organization ID: ${u.organizationId || 'NULL'}`);
  });

  await prisma.$disconnect();
}

checkOrganizations().catch(console.error);
