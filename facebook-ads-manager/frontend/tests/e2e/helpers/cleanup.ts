/**
 * E2E Test Cleanup Helpers
 * Cleanup test data after E2E tests
 */

import { getTestPrismaClient } from '../../fixtures/database.fixture';

const prisma = getTestPrismaClient();

/**
 * Clean up test campaigns created during E2E tests
 */
export async function cleanupTestCampaigns() {
  try {
    await prisma.campaign.deleteMany({
      where: {
        OR: [
          { name: { contains: 'E2E Test' } },
          { name: { contains: 'Complete Integration Test' } },
          { name: { contains: 'State Preservation Test' } }
        ]
      }
    });
    console.log('✅ Test campaigns cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test campaigns:', error);
  }
}

/**
 * Clean up test templates created during E2E tests
 */
export async function cleanupTestTemplates() {
  try {
    await prisma.adTemplate.deleteMany({
      where: {
        OR: [
          { name: { contains: 'Test Template' } },
          { name: { contains: 'Dental Special Offer' } },
          { name: { contains: 'Global Test Template' } },
          { name: { contains: 'Dynamic Field Test' } }
        ]
      }
    });
    console.log('✅ Test templates cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test templates:', error);
  }
}

/**
 * Clean up test users created during E2E tests
 */
export async function cleanupTestUsers() {
  try {
    // Only delete users with test email patterns
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-'
        }
      }
    });
    console.log('✅ Test users cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test users:', error);
  }
}

/**
 * Clean up all E2E test data
 */
export async function cleanupAllTestData() {
  await cleanupTestCampaigns();
  await cleanupTestTemplates();
  await cleanupTestUsers();
}

/**
 * Reset test database to initial state
 */
export async function resetTestDatabase() {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.campaign.deleteMany({
      where: {
        name: { contains: 'Test' }
      }
    });

    await prisma.adTemplate.deleteMany({
      where: {
        name: { contains: 'Test' }
      }
    });

    console.log('✅ Test database reset');
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
  }
}
