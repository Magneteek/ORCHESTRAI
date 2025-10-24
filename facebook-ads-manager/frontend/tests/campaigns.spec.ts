/**
 * Campaigns E2E Tests
 * Tests campaign list, creation, editing, and management
 */

import { test, expect } from '@playwright/test';
import { CampaignsPage, CampaignWizardPage, CampaignDetailsPage } from './page-objects/campaigns.page';
import { mockFacebookAPI } from './fixtures/mock-facebook-api.fixture';
import { waitForNavigation, verifyToast, randomString } from './helpers/test-utils';

test.describe('Campaign Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Facebook API for all campaign tests
    await mockFacebookAPI(page);
  });

  test.describe('Campaign List', () => {
    test('should display campaigns list', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      // Should show campaigns page
      await expect(page.locator('h1')).toContainText('Campaigns');
      await expect(campaignsPage.createCampaignButton).toBeVisible();
    });

    test('should search campaigns', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      // Wait for campaigns to load
      await campaignsPage.waitForCampaignsToLoad();

      // Search for campaign
      await campaignsPage.searchCampaigns('Test Campaign 1');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Should filter campaigns
      const count = await campaignsPage.getCampaignCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter campaigns by status', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      // Filter by ACTIVE status
      await campaignsPage.filterByStatus('ACTIVE');

      // Should show filtered campaigns
      await campaignsPage.waitForCampaignsToLoad();
      const count = await campaignsPage.getCampaignCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter campaigns by objective', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      // Filter by objective
      await campaignsPage.filterByObjective('OUTCOME_SALES');

      // Should show filtered campaigns
      await campaignsPage.waitForCampaignsToLoad();
    });

    test('should refresh campaigns', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      await campaignsPage.waitForCampaignsToLoad();

      // Click refresh button
      await campaignsPage.refreshCampaigns();

      // Should reload campaigns
      await campaignsPage.waitForCampaignsToLoad();
    });

    test('should handle empty state', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      // Search for non-existent campaign
      await campaignsPage.searchCampaigns('NonExistentCampaign' + randomString(20));

      // Wait for search
      await page.waitForTimeout(1000);

      // Should show empty state
      await campaignsPage.verifyEmptyState();
    });

    test('should navigate to campaign details', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      await campaignsPage.waitForCampaignsToLoad();

      // Click on first campaign
      await campaignsPage.clickCampaign('Test Campaign 1');

      // Should navigate to campaign details
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/.+/);
    });
  });

  test.describe('Campaign Creation', () => {
    test('should create new campaign successfully', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      const wizardPage = new CampaignWizardPage(page);

      await campaignsPage.goto();
      await campaignsPage.createNewCampaign();

      // Should be on creation wizard
      await expect(page).toHaveURL('/dashboard/campaigns/new');

      // Fill in campaign details
      const campaignName = `Test Campaign ${Date.now()}`;
      await wizardPage.createCampaignComplete({
        name: campaignName,
        objective: 'OUTCOME_SALES',
        budget: 50,
        budgetType: 'daily',
      });

      // Should redirect to campaigns list
      await expect(page).toHaveURL('/dashboard/campaigns');

      // Should show success message
      await verifyToast(page, 'Campaign created successfully');
    });

    test('should validate campaign name is required', async ({ page }) => {
      const wizardPage = new CampaignWizardPage(page);
      await wizardPage.goto();

      // Try to submit without name
      await wizardPage.goToNextStep();

      // Should show validation error
      await wizardPage.verifyValidationError('campaign-name');
    });

    test('should validate objective is required', async ({ page }) => {
      const wizardPage = new CampaignWizardPage(page);
      await wizardPage.goto();

      // Fill name but not objective
      await wizardPage.nameInput.fill('Test Campaign');
      await wizardPage.goToNextStep();

      // Should show validation error
      await wizardPage.verifyValidationError('campaign-objective');
    });

    test('should validate budget amount', async ({ page }) => {
      const wizardPage = new CampaignWizardPage(page);
      await wizardPage.goto();

      // Fill basic info
      await wizardPage.fillBasicInfo('Test Campaign', 'OUTCOME_SALES');
      await wizardPage.goToNextStep();

      // Try to submit with invalid budget
      await wizardPage.budgetInput.fill('0');
      await wizardPage.goToNextStep();

      // Should show validation error
      await wizardPage.verifyValidationError('campaign-budget');
    });

    test('should navigate between wizard steps', async ({ page }) => {
      const wizardPage = new CampaignWizardPage(page);
      await wizardPage.goto();

      // Step 1: Basic Info
      await wizardPage.verifyStep('objective');
      await wizardPage.fillBasicInfo('Test Campaign', 'OUTCOME_SALES');
      await wizardPage.goToNextStep();

      // Step 2: Budget
      await wizardPage.verifyStep('budget');
      await wizardPage.fillBudget(50);
      await wizardPage.goToNextStep();

      // Step 3: Schedule
      await wizardPage.verifyStep('schedule');

      // Go back to budget
      await wizardPage.goToPreviousStep();
      await wizardPage.verifyStep('budget');

      // Go back to basic info
      await wizardPage.goToPreviousStep();
      await wizardPage.verifyStep('objective');
    });

    test('should support both daily and lifetime budget', async ({ page }) => {
      const wizardPage = new CampaignWizardPage(page);
      await wizardPage.goto();

      await wizardPage.fillBasicInfo('Test Campaign', 'OUTCOME_SALES');
      await wizardPage.goToNextStep();

      // Test daily budget
      await wizardPage.fillBudget(50, 'daily');
      await expect(wizardPage.budgetTypeDaily).toBeChecked();

      // Test lifetime budget
      await wizardPage.fillBudget(500, 'lifetime');
      await expect(wizardPage.budgetTypeLifetime).toBeChecked();
    });
  });

  test.describe('Campaign Actions', () => {
    test('should pause and resume campaign', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();
      await campaignsPage.waitForCampaignsToLoad();

      const campaignName = 'Test Campaign 1';

      // Pause campaign
      await campaignsPage.pauseCampaign(campaignName);

      // Verify status changed
      const row = await campaignsPage.getCampaignRow(campaignName);
      await expect(row.locator('[data-testid="campaign-status"]')).toContainText('Paused');

      // Resume campaign
      await campaignsPage.resumeCampaign(campaignName);

      // Verify status changed
      await expect(row.locator('[data-testid="campaign-status"]')).toContainText('Active');
    });

    test('should delete campaign with confirmation', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();
      await campaignsPage.waitForCampaignsToLoad();

      const campaignName = 'Test Campaign 2';

      // Delete campaign
      await campaignsPage.deleteCampaign(campaignName);

      // Campaign should be removed from list
      await campaignsPage.verifyCampaignNotExists(campaignName);

      // Should show success message
      await verifyToast(page, 'Campaign deleted successfully');
    });

    test('should edit campaign details', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      const detailsPage = new CampaignDetailsPage(page);

      await campaignsPage.goto();
      await campaignsPage.waitForCampaignsToLoad();

      // Click on campaign
      await campaignsPage.clickCampaign('Test Campaign 1');

      // Should be on details page
      await detailsPage.editCampaign();

      // Should navigate to edit page
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/.+\/edit/);
    });
  });

  test.describe('Campaign Details', () => {
    test('should display campaign statistics', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      const detailsPage = new CampaignDetailsPage(page);

      await campaignsPage.goto();
      await campaignsPage.waitForCampaignsToLoad();

      // Navigate to campaign details
      await campaignsPage.clickCampaign('Test Campaign 1');

      // Verify stats are displayed
      await detailsPage.verifyStats();
    });

    test('should show campaign performance metrics', async ({ page }) => {
      const detailsPage = new CampaignDetailsPage(page);
      await detailsPage.goto('123456789'); // Mock campaign ID

      // Verify performance metrics
      await expect(detailsPage.statsSection).toBeVisible();
      await expect(page.locator('[data-testid="impressions"]')).toBeVisible();
      await expect(page.locator('[data-testid="clicks"]')).toBeVisible();
      await expect(page.locator('[data-testid="ctr"]')).toBeVisible();
      await expect(page.locator('[data-testid="spend"]')).toBeVisible();
    });
  });

  test.describe('Campaign Pagination', () => {
    test('should paginate through campaigns', async ({ page }) => {
      const campaignsPage = new CampaignsPage(page);
      await campaignsPage.goto();

      // Wait for campaigns to load
      await campaignsPage.waitForCampaignsToLoad();

      // Check if pagination is visible
      const pagination = page.locator('[data-testid="pagination"]');
      const hasPagination = await pagination.isVisible().catch(() => false);

      if (hasPagination) {
        // Click next page
        await page.locator('[data-testid="next-page"]').click();
        await campaignsPage.waitForCampaignsToLoad();

        // Verify page changed
        await expect(page.locator('[data-testid="current-page"]')).not.toContainText('1');
      }
    });
  });
});
