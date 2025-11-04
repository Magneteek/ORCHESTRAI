/**
 * Playwright Global Setup
 * Runs once before all tests
 *
 * Purpose:
 * - Initialize test database
 * - Seed test data
 * - Set up test environment
 */

import { chromium, FullConfig } from '@playwright/test';
import { seedTestDatabase } from './fixtures/database.fixture';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Starting global setup...');

  // Set test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  try {
    // Initialize test database with seed data
    console.log('📦 Seeding test database...');
    await seedTestDatabase();

    // Verify application is accessible
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto(config.projects[0].use.baseURL || 'http://localhost:3001', {
        timeout: 30000,
      });
      console.log('✅ Application is accessible');
    } catch (error) {
      console.error('❌ Failed to connect to application:', error);
      throw error;
    } finally {
      await browser.close();
    }

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
