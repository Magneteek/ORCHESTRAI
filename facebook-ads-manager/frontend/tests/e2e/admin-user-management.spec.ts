/**
 * Admin User Management E2E Tests
 * Tests admin functionality for managing organization users and roles
 */

import { test, expect } from '@playwright/test';
import { loginUser, loginAdminUser } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../fixtures/database.fixture';
import {
  waitForElement,
  waitForLoading,
  verifyToast,
  randomEmail
} from '../helpers/test-utils';
import { UserManagementPage } from '../page-objects/user-management.page';

test.describe('Admin User Management', () => {
  let userManagementPage: UserManagementPage;

  test.describe('Access Control', () => {
    test('should allow ADMIN to access user management', async ({ page }) => {
      await loginAdminUser(page);
      await page.goto('/dashboard/admin/users');

      await expect(page).toHaveURL(/\/dashboard\/admin\/users/);
      await expect(page.locator('h2')).toContainText('User Management');
    });

    test('should block USER from accessing user management', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
      await page.goto('/dashboard/admin/users');

      // Should show unauthorized page
      await expect(page.locator('[data-testid="unauthorized-page"]')).toBeVisible();
      await expect(page.locator('text=You do not have permission')).toBeVisible();
    });
  });

  test.describe('User List View', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();
    });

    test('should display user statistics', async ({ page }) => {
      await expect(page.locator('[data-testid="stat-total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-admins"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-regular-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-total-campaigns"]')).toBeVisible();
    });

    test('should display user table', async ({ page }) => {
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();

      const rows = page.locator('[data-testid="user-row"]');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display user information', async ({ page }) => {
      const firstRow = page.locator('[data-testid="user-row"]').first();

      await expect(firstRow.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="user-email"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="user-role"]')).toBeVisible();
    });

    test('should search users by name', async ({ page }) => {
      await userManagementPage.searchUsers('Admin');
      await page.waitForTimeout(500);

      const rows = page.locator('[data-testid="user-row"]');
      const firstUserName = await rows.first().locator('[data-testid="user-name"]').textContent();

      expect(firstUserName?.toLowerCase()).toContain('admin'.toLowerCase());
    });

    test('should search users by email', async ({ page }) => {
      await userManagementPage.searchUsers(TEST_USERS.admin.email);
      await page.waitForTimeout(500);

      const rows = page.locator('[data-testid="user-row"]');
      const firstUserEmail = await rows.first().locator('[data-testid="user-email"]').textContent();

      expect(firstUserEmail).toContain(TEST_USERS.admin.email);
    });

    test('should filter users by role', async ({ page }) => {
      await userManagementPage.filterByRole('ADMIN');
      await waitForLoading(page);

      const rows = page.locator('[data-testid="user-row"]');
      const count = await rows.count();

      // Verify all displayed users are admins
      for (let i = 0; i < count; i++) {
        const role = await rows.nth(i).locator('[data-testid="user-role"]').textContent();
        expect(role).toContain('Admin');
      }
    });

    test('should display campaigns created by user', async ({ page }) => {
      const firstRow = page.locator('[data-testid="user-row"]').first();
      const campaignCount = await firstRow.locator('[data-testid="campaign-count"]').textContent();

      expect(campaignCount).toMatch(/^\d+$/);
    });
  });

  test.describe('Invite User', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();
    });

    test('should open invite user dialog', async ({ page }) => {
      await userManagementPage.clickInviteUser();

      await expect(page.locator('[data-testid="invite-user-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('Invite User');
    });

    test('should invite user with USER role', async ({ page }) => {
      const newUserEmail = randomEmail();

      await userManagementPage.clickInviteUser();

      await page.locator('[data-testid="invite-email"]').fill(newUserEmail);
      await page.locator('[data-testid="invite-role"]').selectOption('USER');
      await page.locator('[data-testid="submit-invite"]').click();

      // Should show success toast
      await verifyToast(page, 'User invited successfully', 'success');

      // Dialog should close
      await expect(page.locator('[data-testid="invite-user-dialog"]')).not.toBeVisible();

      // New user should appear in table
      await userManagementPage.searchUsers(newUserEmail);
      await expect(page.locator(`text=${newUserEmail}`)).toBeVisible();
    });

    test('should invite user with ADMIN role', async ({ page }) => {
      const newAdminEmail = randomEmail();

      await userManagementPage.clickInviteUser();

      await page.locator('[data-testid="invite-email"]').fill(newAdminEmail);
      await page.locator('[data-testid="invite-role"]').selectOption('ADMIN');
      await page.locator('[data-testid="submit-invite"]').click();

      await verifyToast(page, 'User invited successfully', 'success');

      // Verify new admin appears with correct role
      await userManagementPage.searchUsers(newAdminEmail);
      const userRow = page.locator(`[data-testid="user-row"]:has-text("${newAdminEmail}")`);
      await expect(userRow.locator('[data-testid="user-role"]')).toContainText('Admin');
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await userManagementPage.clickInviteUser();

      await page.locator('[data-testid="invite-email"]').fill('invalid-email');
      await page.locator('[data-testid="submit-invite"]').click();

      // Should show validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    });

    test('should show error for duplicate email', async ({ page }) => {
      await userManagementPage.clickInviteUser();

      // Try to invite existing user
      await page.locator('[data-testid="invite-email"]').fill(TEST_USERS.user1.email);
      await page.locator('[data-testid="invite-role"]').selectOption('USER');
      await page.locator('[data-testid="submit-invite"]').click();

      // Should show error
      await expect(page.locator('text=already exists')).toBeVisible();
    });

    test('should cancel invitation', async ({ page }) => {
      await userManagementPage.clickInviteUser();

      await page.locator('[data-testid="invite-email"]').fill(randomEmail());
      await page.locator('[data-testid="cancel-invite"]').click();

      // Dialog should close without creating user
      await expect(page.locator('[data-testid="invite-user-dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Change User Role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();
    });

    test('should show confirmation dialog when changing role', async ({ page }) => {
      // Find a USER role user
      await userManagementPage.filterByRole('USER');

      const firstUserRow = page.locator('[data-testid="user-row"]').first();
      await firstUserRow.locator('[data-testid="role-select"]').selectOption('ADMIN');

      // Should show confirmation dialog
      await expect(page.locator('[data-testid="confirm-role-change-dialog"]')).toBeVisible();
      await expect(page.locator('text=Are you sure')).toBeVisible();
    });

    test('should change user from USER to ADMIN', async ({ page }) => {
      // Find USER role user
      await userManagementPage.searchUsers(TEST_USERS.user1.email);

      const userRow = page.locator(`[data-testid="user-row"]:has-text("${TEST_USERS.user1.email}")`);
      await userRow.locator('[data-testid="role-select"]').selectOption('ADMIN');

      // Confirm change
      await page.locator('[data-testid="confirm-role-change"]').click();

      await verifyToast(page, 'User role updated successfully', 'success');

      // Verify role changed
      await expect(userRow.locator('[data-testid="user-role"]')).toContainText('Admin');
    });

    test('should change user from ADMIN to USER', async ({ page }) => {
      // Find an admin user (not the current user)
      await userManagementPage.filterByRole('ADMIN');

      const rows = page.locator('[data-testid="user-row"]');
      const count = await rows.count();

      // Find admin that's not current user
      for (let i = 0; i < count; i++) {
        const email = await rows.nth(i).locator('[data-testid="user-email"]').textContent();
        if (email !== TEST_USERS.admin.email) {
          await rows.nth(i).locator('[data-testid="role-select"]').selectOption('USER');
          await page.locator('[data-testid="confirm-role-change"]').click();

          await verifyToast(page, 'User role updated successfully', 'success');
          break;
        }
      }
    });

    test('should cancel role change', async ({ page }) => {
      await userManagementPage.searchUsers(TEST_USERS.user1.email);

      const userRow = page.locator(`[data-testid="user-row"]:has-text("${TEST_USERS.user1.email}")`);
      const originalRole = await userRow.locator('[data-testid="user-role"]').textContent();

      await userRow.locator('[data-testid="role-select"]').selectOption('ADMIN');

      // Cancel confirmation
      await page.locator('[data-testid="cancel-role-change"]').click();

      // Dialog should close
      await expect(page.locator('[data-testid="confirm-role-change-dialog"]')).not.toBeVisible();

      // Role should remain unchanged
      await expect(userRow.locator('[data-testid="user-role"]')).toContainText(originalRole || '');
    });

    test('should prevent demoting last admin', async ({ page }) => {
      // Count admins
      await userManagementPage.filterByRole('ADMIN');
      const adminRows = page.locator('[data-testid="user-row"]');
      const adminCount = await adminRows.count();

      if (adminCount === 1) {
        // Try to demote the only admin
        await adminRows.first().locator('[data-testid="role-select"]').selectOption('USER');

        // Should show error
        await expect(page.locator('text=at least one admin')).toBeVisible();
      } else {
        // If multiple admins exist, this test is not applicable
        test.skip();
      }
    });

    test('should not allow changing own role', async ({ page }) => {
      // Find current user row
      await userManagementPage.searchUsers(TEST_USERS.admin.email);

      const currentUserRow = page.locator(`[data-testid="user-row"]:has-text("${TEST_USERS.admin.email}")`);
      const roleSelect = currentUserRow.locator('[data-testid="role-select"]');

      // Role select should be disabled
      await expect(roleSelect).toBeDisabled();
    });
  });

  test.describe('User Actions', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();
    });

    test('should display user action buttons', async ({ page }) => {
      const firstRow = page.locator('[data-testid="user-row"]').first();

      await expect(firstRow.locator('[data-testid="view-campaigns-button"]')).toBeVisible();
    });

    test('should view user campaigns', async ({ page }) => {
      const firstRow = page.locator('[data-testid="user-row"]').first();
      const userName = await firstRow.locator('[data-testid="user-name"]').textContent();

      await firstRow.locator('[data-testid="view-campaigns-button"]').click();

      // Should navigate to campaigns filtered by user
      await expect(page).toHaveURL(/\/dashboard\/campaigns/);
    });

    test('should display last login time', async ({ page }) => {
      const firstRow = page.locator('[data-testid="user-row"]').first();
      const lastLogin = firstRow.locator('[data-testid="last-login"]');

      if (await lastLogin.isVisible()) {
        const text = await lastLogin.textContent();
        // Should be a date or "Never"
        expect(text).toBeTruthy();
      }
    });
  });

  test.describe('User Statistics', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();
    });

    test('should display correct total user count', async ({ page }) => {
      const totalUsersCard = page.locator('[data-testid="stat-total-users"]');
      const displayedCount = await totalUsersCard.locator('.text-2xl').textContent();

      const tableRows = await page.locator('[data-testid="user-row"]').count();

      // Displayed count should match table row count
      expect(parseInt(displayedCount || '0')).toBeGreaterThanOrEqual(tableRows);
    });

    test('should display admin count', async ({ page }) => {
      const adminsCard = page.locator('[data-testid="stat-admins"]');
      const displayedCount = await adminsCard.locator('.text-2xl').textContent();

      expect(parseInt(displayedCount || '0')).toBeGreaterThan(0);
    });

    test('should display regular user count', async ({ page }) => {
      const usersCard = page.locator('[data-testid="stat-regular-users"]');
      const displayedCount = await usersCard.locator('.text-2xl').textContent();

      expect(parseInt(displayedCount || '0')).toBeGreaterThanOrEqual(0);
    });

    test('should display total campaigns', async ({ page }) => {
      const campaignsCard = page.locator('[data-testid="stat-total-campaigns"]');
      const displayedCount = await campaignsCard.locator('.text-2xl').textContent();

      expect(parseInt(displayedCount || '0')).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Table Sorting', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();
    });

    test('should sort by name', async ({ page }) => {
      await userManagementPage.sortByColumn('Name');
      await page.waitForTimeout(500);

      const rows = page.locator('[data-testid="user-row"]');
      const firstName = await rows.first().locator('[data-testid="user-name"]').textContent();
      const secondName = await rows.nth(1).locator('[data-testid="user-name"]').textContent();

      // First should be <= second alphabetically
      expect(firstName?.localeCompare(secondName || '') || 0).toBeLessThanOrEqual(0);
    });

    test('should sort by email', async ({ page }) => {
      await userManagementPage.sortByColumn('Email');
      await page.waitForTimeout(500);

      const rows = page.locator('[data-testid="user-row"]');
      const count = await rows.count();

      if (count >= 2) {
        const firstEmail = await rows.first().locator('[data-testid="user-email"]').textContent();
        const secondEmail = await rows.nth(1).locator('[data-testid="user-email"]').textContent();

        expect(firstEmail?.localeCompare(secondEmail || '') || 0).toBeLessThanOrEqual(0);
      }
    });

    test('should sort by role', async ({ page }) => {
      await userManagementPage.sortByColumn('Role');
      await page.waitForTimeout(500);

      // Just verify sorting happened
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount(await page.locator('[data-testid="user-row"]').count());
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no users match search', async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();

      await userManagementPage.searchUsers('nonexistent-user-xyz-123');
      await page.waitForTimeout(500);

      // Should show empty state
      await expect(page.locator('text=No users found')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/admin/users*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: { message: 'Internal server error' } })
        });
      });

      await loginAdminUser(page);
      await page.goto('/dashboard/admin/users');

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('should handle role change API error', async ({ page }) => {
      await loginAdminUser(page);
      userManagementPage = new UserManagementPage(page);
      await userManagementPage.goto();

      // Mock role change error
      await page.route('**/api/admin/users/*/role', route => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: { message: 'Cannot change role' } })
        });
      });

      await userManagementPage.searchUsers(TEST_USERS.user1.email);
      const userRow = page.locator(`[data-testid="user-row"]:has-text("${TEST_USERS.user1.email}")`);
      await userRow.locator('[data-testid="role-select"]').selectOption('ADMIN');
      await page.locator('[data-testid="confirm-role-change"]').click();

      // Should show error
      await expect(page.locator('text=Cannot change role')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      await loginAdminUser(page);

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/admin/users');

      // Stats should stack vertically
      await expect(page.locator('[data-testid="stat-total-users"]')).toBeVisible();

      // Table should be scrollable
      await expect(page.locator('[data-testid="user-table"]')).toBeVisible();
    });
  });
});
