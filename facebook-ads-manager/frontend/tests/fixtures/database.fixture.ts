/**
 * Database Test Fixture
 * Manages test database setup, seeding, and cleanup
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Test user data
export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'TestPassword123!',
    name: 'Admin User',
    role: 'ADMIN' as const,
  },
  user1: {
    email: 'user1@test.com',
    password: 'TestPassword123!',
    name: 'Test User 1',
    role: 'USER' as const,
  },
  user2: {
    email: 'user2@test.com',
    password: 'TestPassword123!',
    name: 'Test User 2',
    role: 'USER' as const,
  },
};

// Test organization data
export const TEST_ORGANIZATIONS = {
  org1: {
    name: 'Test Organization 1',
    slug: 'test-org-1',
  },
  org2: {
    name: 'Test Organization 2',
    slug: 'test-org-2',
  },
};

// Test Facebook account data
export const TEST_FB_ACCOUNTS = {
  account1: {
    fbAccountId: 'act_123456789',
    name: 'Test Ad Account 1',
    currency: 'USD',
    timezone: 'America/New_York',
  },
  account2: {
    fbAccountId: 'act_987654321',
    name: 'Test Ad Account 2',
    currency: 'EUR',
    timezone: 'Europe/London',
  },
};

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase() {
  try {
    // Clean existing data first
    await cleanupTestDatabase();

    // Create test organization
    const org1 = await prisma.organization.create({
      data: TEST_ORGANIZATIONS.org1,
    });

    // Create test users
    const hashedPassword = await hash(TEST_USERS.admin.password, 10);

    const adminUser = await prisma.user.create({
      data: {
        email: TEST_USERS.admin.email,
        name: TEST_USERS.admin.name,
        password: hashedPassword,
        role: TEST_USERS.admin.role,
        organization: {
          connect: { id: org1.id },
        },
      },
    });

    const user1 = await prisma.user.create({
      data: {
        email: TEST_USERS.user1.email,
        name: TEST_USERS.user1.name,
        password: hashedPassword,
        role: TEST_USERS.user1.role,
        organization: {
          connect: { id: org1.id },
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: TEST_USERS.user2.email,
        name: TEST_USERS.user2.name,
        password: hashedPassword,
        role: TEST_USERS.user2.role,
        organization: {
          connect: { id: org1.id },
        },
      },
    });

    // Create second test organization
    const org2 = await prisma.organization.create({
      data: {
        name: TEST_ORGANIZATIONS.org2.name,
        slug: TEST_ORGANIZATIONS.org2.slug,
      },
    });

    // Create Facebook Business Account for org1
    const fbBusinessAccount1 = await prisma.facebookBusinessAccount.create({
      data: {
        organizationId: org1.id,
        businessId: 'test_business_123',
        name: 'Test Business Account 1',
        accessTokenEncrypted: 'encrypted_test_token_1',
        isActive: true,
      },
    });

    // Create Facebook Business Account for org2
    const fbBusinessAccount2 = await prisma.facebookBusinessAccount.create({
      data: {
        organizationId: org2.id,
        businessId: 'test_business_456',
        name: 'Test Business Account 2',
        accessTokenEncrypted: 'encrypted_test_token_2',
        isActive: true,
      },
    });

    // Create test ad accounts
    await prisma.adAccount.create({
      data: {
        facebookBusinessAccountId: fbBusinessAccount1.id,
        accountId: TEST_FB_ACCOUNTS.account1.fbAccountId,
        name: TEST_FB_ACCOUNTS.account1.name,
        currency: TEST_FB_ACCOUNTS.account1.currency,
        timezone: TEST_FB_ACCOUNTS.account1.timezone,
        accountStatus: 'ACTIVE',
      },
    });

    await prisma.adAccount.create({
      data: {
        facebookBusinessAccountId: fbBusinessAccount2.id,
        accountId: TEST_FB_ACCOUNTS.account2.fbAccountId,
        name: TEST_FB_ACCOUNTS.account2.name,
        currency: TEST_FB_ACCOUNTS.account2.currency,
        timezone: TEST_FB_ACCOUNTS.account2.timezone,
        accountStatus: 'ACTIVE',
      },
    });

    // Create test templates
    await prisma.adTemplate.create({
      data: {
        name: 'E-commerce Product Launch',
        description: 'High-performing template for product launches',
        category: 'e-commerce',
        objective: 'OUTCOME_SALES',
        visibility: 'public',
        organizationId: org1.id,
        adCopy: {
          headlines: ['Shop Now', 'Limited Time Offer'],
          primaryText: 'Get 20% off your first order',
          description: 'Free shipping on orders over $50',
        },
        creativeSpecs: {
          format: 'single_image',
          aspectRatio: '1:1',
        },
        targetingConfig: {
          ageMin: 18,
          ageMax: 65,
          locations: ['US'],
        },
        campaignStructure: {
          budgetType: 'daily',
          dailyBudget: 50,
        },
        timesUsed: 25,
      },
    });

    await prisma.adTemplate.create({
      data: {
        name: 'Lead Generation Form',
        description: 'Proven template for collecting quality leads',
        category: 'lead-generation',
        objective: 'OUTCOME_LEADS',
        visibility: 'public',
        organizationId: org1.id,
        adCopy: {
          headlines: ['Get Your Free Guide'],
          primaryText: 'Download our comprehensive guide today',
          description: 'Learn the secrets of successful marketing',
        },
        creativeSpecs: {
          format: 'single_image',
          aspectRatio: '1.91:1',
        },
        targetingConfig: {
          ageMin: 25,
          ageMax: 55,
          locations: ['US', 'CA'],
        },
        campaignStructure: {
          budgetType: 'daily',
          dailyBudget: 100,
        },
        timesUsed: 42,
      },
    });

    console.log('✅ Test database seeded successfully');
    console.log(`   - Users: ${Object.keys(TEST_USERS).length}`);
    console.log(`   - Organizations: ${Object.keys(TEST_ORGANIZATIONS).length}`);
    console.log(`   - Ad Accounts: ${Object.keys(TEST_FB_ACCOUNTS).length}`);
  } catch (error) {
    console.error('❌ Failed to seed test database:', error);
    throw error;
  }
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase() {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.adTemplate.deleteMany({});
    await prisma.adAccount.deleteMany({});
    await prisma.facebookBusinessAccount.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Test database cleaned successfully');
  } catch (error) {
    console.error('❌ Failed to clean test database:', error);
    throw error;
  }
}

/**
 * Get Prisma client for tests
 */
export function getTestPrismaClient() {
  return prisma;
}

/**
 * Create a test campaign
 */
export async function createTestCampaign(data: {
  name: string;
  adAccountId: string;
  status?: string;
}) {
  return prisma.campaign.create({
    data: {
      campaignId: `test_campaign_${Date.now()}`,
      name: data.name,
      adAccountId: data.adAccountId,
      objective: 'OUTCOME_SALES',
      status: data.status || 'ACTIVE',
      dailyBudget: 50,
    },
  });
}

/**
 * Delete test campaigns
 */
export async function cleanupTestCampaigns() {
  await prisma.campaign.deleteMany({
    where: {
      campaignId: {
        startsWith: 'test_campaign_',
      },
    },
  });
}
