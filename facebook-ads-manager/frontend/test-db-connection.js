// Test Supabase database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.drrbipxkekdhibxaeubx:GQcamPe3KaQdhKCO@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully!');

    // Count existing organizations
    const orgCount = await prisma.organization.count();
    console.log(`📊 Found ${orgCount} organizations in database`);

    // Count existing users
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);

    console.log('\n🎉 Database is ready to use!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
