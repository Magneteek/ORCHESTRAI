/**
 * Authentication E2E Tests
 * Tests user registration, login, logout, and session management
 */

import { test, expect } from '@playwright/test';
import {
  loginUser,
  logout,
  registerUser,
  attemptInvalidLogin,
  verifyAuthenticated,
  verifyNotAuthenticated,
} from './fixtures/auth.fixture';
import { TEST_USERS } from './fixtures/database.fixture';
import { generateRandomUser } from './fixtures/test-users.fixture';
import { verifyToast, waitForNavigation } from './helpers/test-utils';

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('should successfully register a new user', async ({ page }) => {
      const newUser = generateRandomUser();

      await registerUser(page, {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.password,
      });

      // Should redirect to signin with success message
      await expect(page).toHaveURL(/\/auth\/signin\?registered=true/);
      await expect(page.locator('text=Account created successfully')).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'invalid-email');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.fill('[name="confirmPassword"]', 'TestPassword123!');
      await page.click('[type="submit"]');

      // Should show email validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    });

    test('should show validation error for weak password', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'test@test.com');
      await page.fill('[name="password"]', 'weak');
      await page.fill('[name="confirmPassword"]', 'weak');
      await page.click('[type="submit"]');

      // Should show password validation error
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toContainText('8 characters');
    });

    test('should show error when passwords do not match', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'test@test.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.fill('[name="confirmPassword"]', 'DifferentPassword123!');
      await page.click('[type="submit"]');

      // Should show password mismatch error
      await expect(page.locator('[data-testid="confirmPassword-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirmPassword-error"]')).toContainText('match');
    });

    test('should show error for duplicate email', async ({ page }) => {
      await page.goto('/auth/register');

      // Try to register with existing user email
      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', TEST_USERS.user1.email);
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.fill('[name="confirmPassword"]', 'TestPassword123!');
      await page.click('[type="submit"]');

      // Should show error
      await expect(page.locator('text=already exists')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

      // Should be on dashboard
      await verifyAuthenticated(page);
    });

    test('should show error for invalid email', async ({ page }) => {
      await attemptInvalidLogin(page, 'nonexistent@test.com', 'TestPassword123!');

      // Should show error message
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should show error for invalid password', async ({ page }) => {
      await attemptInvalidLogin(page, TEST_USERS.user1.email, 'WrongPassword123!');

      // Should show error message
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should show validation error for empty fields', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.click('[type="submit"]');

      // Should show required field errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    test('should disable form during submission', async ({ page }) => {
      await page.goto('/auth/signin');

      await page.fill('[name="email"]', TEST_USERS.user1.email);
      await page.fill('[name="password"]', TEST_USERS.user1.password);

      // Start submission
      await page.click('[type="submit"]');

      // Form should be disabled immediately
      await expect(page.locator('[name="email"]')).toBeDisabled();
      await expect(page.locator('[name="password"]')).toBeDisabled();
      await expect(page.locator('[type="submit"]')).toBeDisabled();
    });
  });

  test.describe('User Logout', () => {
    test('should successfully logout', async ({ page }) => {
      // Login first
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
      await verifyAuthenticated(page);

      // Logout
      await logout(page);

      // Should be on signin page
      await verifyNotAuthenticated(page);
    });

    test('should clear session after logout', async ({ page }) => {
      // Login
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

      // Logout
      await logout(page);

      // Try to access protected route
      await page.goto('/dashboard');

      // Should redirect to signin
      await verifyNotAuthenticated(page);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to signin when accessing protected route unauthenticated', async ({
      page,
    }) => {
      await page.goto('/dashboard');
      await verifyNotAuthenticated(page);
    });

    test('should redirect to signin when accessing campaign page unauthenticated', async ({
      page,
    }) => {
      await page.goto('/dashboard/campaigns');
      await verifyNotAuthenticated(page);
    });

    test('should allow access to protected routes when authenticated', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

      // Should be able to access dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);

      // Should be able to access campaigns
      await page.goto('/dashboard/campaigns');
      await expect(page).toHaveURL(/\/dashboard\/campaigns/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist session across page reloads', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
      await verifyAuthenticated(page);

      // Reload page
      await page.reload();

      // Should still be authenticated
      await verifyAuthenticated(page);
    });

    test('should persist session across navigation', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

      // Navigate to different pages
      await page.goto('/dashboard/campaigns');
      await verifyAuthenticated(page);

      await page.goto('/dashboard/templates');
      await verifyAuthenticated(page);

      await page.goto('/dashboard/analytics');
      await verifyAuthenticated(page);
    });
  });

  test.describe('Password Recovery', () => {
    test.skip('should send password reset email', async ({ page }) => {
      // TODO: Implement when password reset is added
      await page.goto('/auth/forgot-password');

      await page.fill('[name="email"]', TEST_USERS.user1.email);
      await page.click('[type="submit"]');

      await expect(page.locator('text=Check your email')).toBeVisible();
    });
  });
});
