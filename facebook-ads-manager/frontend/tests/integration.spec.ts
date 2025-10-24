/**
 * Integration E2E Tests
 * Tests end-to-end workflows and multi-step processes
 */

import { test, expect } from '@playwright/test';
import { CampaignsPage, CampaignWizardPage } from './page-objects/campaigns.page';
import { TemplatesPage } from './page-objects/templates.page';
import { mockFacebookAPI } from './fixtures/mock-facebook-api.fixture';
import { verifyToast, randomString } from './helpers/test-utils';

test.describe('End-to-End Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockFacebookAPI(page);
  });

  test.describe('Template to Campaign Flow', () => {
    test('should create campaign from template', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const wizardPage = new CampaignWizardPage(page);

      // Start at templates
      await templatesPage.goto();

      // Use first template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await expect(templateCard).toBeVisible();
      const templateName = await templateCard.locator('[data-testid="template-name"]').textContent();

      await templateCard.locator('[data-testid="use-template"]').click();

      // Should navigate to campaign creation with template data pre-filled
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/new/);

      // Verify template data is loaded
      await expect(wizardPage.nameInput).not.toBeEmpty();
      await expect(wizardPage.objectiveSelect).not.toHaveValue('');

      // Complete campaign creation
      const campaignName = `Campaign from ${templateName} ${Date.now()}`;
      await wizardPage.nameInput.fill(campaignName);
      await wizardPage.goToNextStep();
      await wizardPage.goToNextStep();
      await wizardPage.goToNextStep();
      await wizardPage.submitCampaign();

      // Should redirect to campaigns list
      await expect(page).toHaveURL('/dashboard/campaigns');
      await verifyToast(page, 'Campaign created successfully');
    });

    test('should fork template and use it', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);

      await templatesPage.goto();

      // Filter to public templates
      await templatesPage.filterByVisibility('public');

      // Fork first template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await expect(templateCard).toBeVisible();

      await templateCard.locator('[data-testid="fork-template"]').click();

      // Confirm fork
      await page.locator('[data-testid="confirm-fork"]').click();
      await verifyToast(page, 'Template forked successfully');

      // Now use the forked template
      await templatesPage.filterByVisibility('mine');

      const forkedTemplate = page.locator('[data-testid="template-card"]').first();
      await forkedTemplate.locator('[data-testid="use-template"]').click();

      // Should navigate to campaign creation
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/new/);
    });
  });

  test.describe('Campaign Lifecycle', () => {
    test('should complete full campaign lifecycle', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      const wizardPage = new CampaignWizardPage(page);

      // 1. Create campaign
      await campaignsPage.goto();
      await campaignsPage.createNewCampaign();

      const campaignName = `Lifecycle Test ${Date.now()}`;
      await wizardPage.createCampaignComplete({
        name: campaignName,
        objective: 'OUTCOME_SALES',
        budget: 50,
      });

      await expect(page).toHaveURL('/dashboard/campaigns');

      // 2. Verify campaign exists
      await campaignsPage.verifyCampaignExists(campaignName);

      // 3. Pause campaign
      await campaignsPage.pauseCampaign(campaignName);
      await verifyToast(page, 'Campaign paused successfully');

      // 4. Resume campaign
      await campaignsPage.resumeCampaign(campaignName);
      await verifyToast(page, 'Campaign resumed successfully');

      // 5. Edit campaign
      await campaignsPage.clickCampaign(campaignName);
      await page.locator('[data-testid="edit-campaign"]').click();

      // Modify budget
      await page.fill('[data-testid="campaign-budget"]', '100');
      await page.click('[data-testid="save-campaign"]');
      await verifyToast(page, 'Campaign updated successfully');

      // 6. View analytics
      await page.click('[data-testid="view-analytics"]');
      await expect(page).toHaveURL(/\/dashboard\/analytics/);

      // 7. Return to campaigns and delete
      await page.goto('/dashboard/campaigns');
      await campaignsPage.deleteCampaign(campaignName);
      await verifyToast(page, 'Campaign deleted successfully');

      // 8. Verify campaign is gone
      await campaignsPage.verifyCampaignNotExists(campaignName);
    });
  });

  test.describe('Multi-Account Switching', () => {
    test('should switch between ad accounts', async ({ page }) => {
      await page.goto('/dashboard');

      // Open account selector
      await page.click('[data-testid="account-selector"]');

      // Should show account list
      await expect(page.locator('[data-testid="account-list"]')).toBeVisible();

      // Get current account
      const currentAccount = await page.locator('[data-testid="current-account"]').textContent();

      // Select different account
      const accounts = page.locator('[data-testid="account-option"]');
      const count = await accounts.count();

      if (count > 1) {
        await accounts.nth(1).click();

        // Wait for data to reload
        await page.waitForTimeout(1000);

        // Verify account changed
        const newAccount = await page.locator('[data-testid="current-account"]').textContent();
        expect(newAccount).not.toBe(currentAccount);

        // Verify campaigns loaded for new account
        await page.goto('/dashboard/campaigns');
        await expect(page.locator('[data-testid="campaign-table"]')).toBeVisible();
      }
    });

    test('should maintain context when switching accounts', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);

      await campaignsPage.goto();

      // Apply filters
      await campaignsPage.filterByStatus('ACTIVE');

      // Switch account
      await page.click('[data-testid="account-selector"]');
      const accounts = page.locator('[data-testid="account-option"]');
      if ((await accounts.count()) > 1) {
        await accounts.nth(1).click();

        // Wait for reload
        await page.waitForTimeout(1000);

        // Filters should be cleared for new account
        await expect(campaignsPage.statusFilter).toHaveValue('all');
      }
    });
  });

  test.describe('Real-time Updates', () => {
    test.skip('should receive WebSocket updates', async ({ page }) => {
      // Mock WebSocket connection
      await page.goto('/dashboard/campaigns');

      // Wait for WebSocket connection
      await page.waitForTimeout(2000);

      // Simulate campaign status change via WebSocket
      await page.evaluate(() => {
        // This would normally come from WebSocket
        window.dispatchEvent(new CustomEvent('campaign-updated', {
          detail: {
            campaignId: '123456789',
            status: 'PAUSED'
          }
        }));
      });

      // Verify UI updates
      await page.waitForTimeout(500);
      const statusBadge = page.locator('[data-testid="campaign-status"]').first();
      await expect(statusBadge).toContainText('Paused');
    });

    test.skip('should sync data across tabs', async ({ context }) => {
      // Open two tabs
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      await page1.goto('/dashboard/campaigns');
      await page2.goto('/dashboard/campaigns');

      // Make change in page 1
      await page1.locator('[data-testid="pause-button"]').first().click();

      // Wait for sync
      await page2.waitForTimeout(2000);

      // Verify update reflected in page 2
      const status = page2.locator('[data-testid="campaign-status"]').first();
      await expect(status).toContainText('Paused');
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/campaigns**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await page.goto('/dashboard/campaigns');

      // Should show error state
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Error loading campaigns');

      // Should offer retry
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should recover from network errors', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Simulate offline
      await page.context().setOffline(true);

      // Try to refresh
      await page.locator('[data-testid="refresh-campaigns"]').click();

      // Should show offline message
      await expect(page.locator('text=Network error')).toBeVisible();

      // Go back online
      await page.context().setOffline(false);

      // Retry
      await page.locator('[data-testid="retry-button"]').click();

      // Should recover
      await expect(page.locator('[data-testid="campaign-table"]')).toBeVisible();
    });

    test('should handle concurrent modifications', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      await campaignsPage.waitForCampaignsToLoad();

      // Click on campaign
      await campaignsPage.clickCampaign('Test Campaign 1');

      // Start editing
      await page.locator('[data-testid="edit-campaign"]').click();

      // Simulate concurrent modification
      await page.route('**/api/campaigns/*/update', (route) => {
        route.fulfill({
          status: 409,
          body: JSON.stringify({ error: 'Campaign was modified by another user' }),
        });
      });

      // Try to save
      await page.locator('[data-testid="save-campaign"]').click();

      // Should show conflict warning
      await expect(page.locator('text=modified by another user')).toBeVisible();
    });
  });

  test.describe('Performance Under Load', () => {
    test('should handle large campaign lists', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);

      // Mock large dataset
      await page.route('**/api/campaigns**', (route) => {
        const campaigns = Array.from({ length: 1000 }, (_, i) => ({
          id: `campaign-${i}`,
          name: `Campaign ${i}`,
          status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          budget: 50 + i,
        }));

        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: campaigns.slice(0, 20), // First page
            total: 1000,
            page: 1,
            limit: 20,
          }),
        });
      });

      await campaignsPage.goto();

      // Should handle pagination smoothly
      await campaignsPage.waitForCampaignsToLoad();
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-pages"]')).toContainText('50'); // 1000 / 20
    });

    test('should debounce search input', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      let requestCount = 0;
      await page.route('**/api/campaigns**', (route) => {
        requestCount++;
        route.continue();
      });

      // Type quickly
      await campaignsPage.searchInput.type('Test Campaign', { delay: 50 });

      // Wait for debounce
      await page.waitForTimeout(1000);

      // Should have made fewer requests than characters typed
      expect(requestCount).toBeLessThan(13); // "Test Campaign" is 13 characters
    });
  });
});
