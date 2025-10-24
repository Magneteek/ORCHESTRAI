/**
 * Authentication Test Fixture
 * Provides authentication helpers for tests
 */

import { Page, expect } from '@playwright/test';
import { TEST_USERS } from './database.fixture';
import fs from 'fs';
import path from 'path';

/**
 * Login a user and save authentication state
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/auth/signin');

  // Fill login form
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);

  // Submit form
  await page.click('[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Verify login success
  await expect(page.locator('body')).toBeVisible();
}

/**
 * Login with default test user
 */
export async function loginTestUser(page: Page): Promise<void> {
  await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
}

/**
 * Login with admin user
 */
export async function loginAdminUser(page: Page): Promise<void> {
  await loginUser(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to signin page
  await page.waitForURL('/auth/signin', { timeout: 10000 });
}

/**
 * Save authentication state to file
 */
export async function saveAuthState(page: Page, filename: string): Promise<void> {
  const authDir = path.join(__dirname, '..', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const authFile = path.join(authDir, filename);
  await page.context().storageState({ path: authFile });
}

/**
 * Create authenticated context storage state
 */
export async function createAuthFile(
  page: Page,
  email: string,
  password: string,
  filename: string
): Promise<void> {
  await loginUser(page, email, password);
  await saveAuthState(page, filename);
}

/**
 * Verify user is authenticated
 */
export async function verifyAuthenticated(page: Page): Promise<void> {
  // Should be on dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Should see user menu
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
}

/**
 * Verify user is not authenticated
 */
export async function verifyNotAuthenticated(page: Page): Promise<void> {
  // Should redirect to signin
  await expect(page).toHaveURL(/\/auth\/signin/);
}

/**
 * Register a new user
 */
export async function registerUser(
  page: Page,
  data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
): Promise<void> {
  await page.goto('/auth/register');

  // Fill registration form
  await page.fill('[name="name"]', data.name);
  await page.fill('[name="email"]', data.email);
  await page.fill('[name="password"]', data.password);
  await page.fill('[name="confirmPassword"]', data.confirmPassword);

  // Submit form
  await page.click('[type="submit"]');

  // Wait for redirect
  await page.waitForURL('/auth/signin?registered=true', { timeout: 10000 });
}

/**
 * Attempt login with invalid credentials
 */
export async function attemptInvalidLogin(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/auth/signin');

  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('[type="submit"]');

  // Wait for error message
  await page.waitForSelector('text=Invalid email or password', { timeout: 5000 });
}

/**
 * Mock authentication for API testing
 */
export function getMockAuthHeaders(userId: string = 'test-user-id'): Record<string, string> {
  return {
    'x-test-user-id': userId,
    'Authorization': `Bearer test-token-${userId}`,
  };
}
