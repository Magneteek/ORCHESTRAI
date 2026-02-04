/**
 * Test Database Setup Utilities
 * Provides utilities for setting up and tearing down test database
 */

import { PrismaClient } from '@prisma/client';

// Create a separate Prisma client for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

/**
 * Clean up all test data from the database
 * Order matters due to foreign key constraints
 */
export async function cleanupDatabase() {
  await testPrisma.$transaction([
    // Clean up in reverse order of dependencies
    testPrisma.performanceMetric.deleteMany(),
    testPrisma.aiAnalysis.deleteMany(),
    testPrisma.anomalyDetection.deleteMany(),
    testPrisma.ad.deleteMany(),
    testPrisma.adSet.deleteMany(),
    testPrisma.templateLaunch.deleteMany(),
    testPrisma.campaign.deleteMany(),
    testPrisma.templatePerformanceAggregate.deleteMany(),
    testPrisma.adTemplate.deleteMany(),
    testPrisma.adAccount.deleteMany(),
    testPrisma.facebookBusinessAccount.deleteMany(),
    testPrisma.session.deleteMany(),
    testPrisma.account.deleteMany(),
    testPrisma.user.deleteMany(),
    testPrisma.organization.deleteMany(),
  ]);
}

/**
 * Disconnect from test database
 */
export async function disconnectDatabase() {
  await testPrisma.$disconnect();
}

/**
 * Reset database to clean state
 */
export async function resetDatabase() {
  await cleanupDatabase();
}

/**
 * Setup test database before running tests
 */
export async function setupTestDatabase() {
  try {
    await testPrisma.$connect();
    await cleanupDatabase();
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Cleanup test database after running tests
 */
export async function cleanupTestDatabase() {
  try {
    await cleanupDatabase();
    await disconnectDatabase();
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
    throw error;
  }
}

/**
 * Execute function within a database transaction
 * Useful for test isolation
 */
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return testPrisma.$transaction(async (tx) => {
    return fn(tx as PrismaClient);
  });
}
