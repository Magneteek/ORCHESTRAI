/**
 * Playwright Global Teardown
 * Runs once after all tests
 *
 * Purpose:
 * - Clean up test database
 * - Remove temporary files
 * - Close any remaining connections
 */

import { FullConfig } from '@playwright/test';
import { cleanupTestDatabase } from './fixtures/database.fixture';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  try {
    // Clean up test database
    console.log('🗑️  Cleaning test database...');
    await cleanupTestDatabase();

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - we don't want to fail the test run if cleanup fails
  }
}

export default globalTeardown;
