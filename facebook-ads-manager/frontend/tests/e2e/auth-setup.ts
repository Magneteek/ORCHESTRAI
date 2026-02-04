/**
 * E2E Test Authentication Setup
 * Creates authenticated sessions for both USER and ADMIN roles
 */

import { test as setup, expect } from '@playwright/test';
import { loginUser, loginAdminUser, saveAuthState } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../fixtures/database.fixture';
import path from 'path';

const userAuthFile = path.join(__dirname, '..', '.auth', 'user.json');
const adminAuthFile = path.join(__dirname, '..', '.auth', 'admin.json');

setup('authenticate as USER', async ({ page }) => {
  console.log('🔐 Setting up USER authentication...');

  // Login with test user
  await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

  // Verify we're logged in
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: userAuthFile });

  console.log('✅ USER authentication setup complete');
});

setup('authenticate as ADMIN', async ({ page }) => {
  console.log('🔐 Setting up ADMIN authentication...');

  // Login with admin user
  await loginAdminUser(page);

  // Verify we're logged in
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: adminAuthFile });

  console.log('✅ ADMIN authentication setup complete');
});
