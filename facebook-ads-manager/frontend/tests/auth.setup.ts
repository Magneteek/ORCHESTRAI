/**
 * Authentication Setup
 * Creates authenticated sessions for tests
 */

import { test as setup, expect } from '@playwright/test';
import { loginUser, saveAuthState } from './fixtures/auth.fixture';
import { TEST_USERS } from './fixtures/database.fixture';
import path from 'path';

const authFile = path.join(__dirname, '.auth', 'user.json');

setup('authenticate as test user', async ({ page }) => {
  console.log('🔐 Setting up authentication...');

  // Login with test user
  await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

  // Verify we're logged in
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });

  console.log('✅ Authentication setup complete');
});
