/**
 * Template Launch Workflow E2E Tests
 * Tests the complete user journey of launching a campaign from a template
 */

import { test, expect } from '@playwright/test';
import { loginUser, loginAdminUser } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../fixtures/database.fixture';
import {
  waitForElement,
  waitForLoading,
  verifyToast,
  verifyValidationError
} from '../helpers/test-utils';
import { LaunchWorkflowPage } from '../page-objects/launch-workflow.page';

test.describe('Template Launch Workflow', () => {
  let launchPage: LaunchWorkflowPage;

  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
    launchPage = new LaunchWorkflowPage(page);
    await launchPage.goto();
  });

  test.describe('Step 1: Template Selection', () => {
    test('should display template grid on initial load', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Launch Campaign from Template');
      await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();

      // Verify templates are loaded
      const templateCards = page.locator('[data-testid="template-card"]');
      const count = await templateCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter templates by category', async ({ page }) => {
      await launchPage.selectCategory('e-commerce');
      await waitForLoading(page);

      // Verify filtered results
      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();

      // Check that all visible templates have e-commerce category
      for (let i = 0; i < count; i++) {
        const category = await templates.nth(i).locator('[data-testid="template-category"]').textContent();
        expect(category).toContain('e-commerce');
      }
    });

    test('should search templates by name', async ({ page }) => {
      await launchPage.searchTemplate('Product Launch');
      await page.waitForTimeout(500); // Debounce

      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();

      if (count > 0) {
        const firstTemplate = await templates.first().locator('[data-testid="template-name"]').textContent();
        expect(firstTemplate?.toLowerCase()).toContain('product launch'.toLowerCase());
      }
    });

    test('should display template performance metrics', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();

      await expect(firstTemplate.locator('[data-testid="template-times-used"]')).toBeVisible();
      await expect(firstTemplate.locator('[data-testid="template-avg-roas"]')).toBeVisible();
    });

    test('should select template and proceed to step 2', async ({ page }) => {
      await launchPage.selectFirstTemplate();

      // Should advance to step 2
      await expect(page.locator('[data-testid="step-indicator-2"]')).toHaveClass(/active/);
      await expect(page.locator('h2')).toContainText('Customize Your Campaign');
    });
  });

  test.describe('Step 2: Fill Dynamic Fields', () => {
    test.beforeEach(async ({ page }) => {
      await launchPage.selectFirstTemplate();
    });

    test('should display selected template information', async ({ page }) => {
      const templateInfo = page.locator('[data-testid="selected-template-info"]');
      await expect(templateInfo).toBeVisible();
      await expect(templateInfo.locator('[data-testid="template-name"]')).toBeVisible();
      await expect(templateInfo.locator('[data-testid="template-description"]')).toBeVisible();
    });

    test('should display dynamic fields form', async ({ page }) => {
      const dynamicFieldsForm = page.locator('[data-testid="dynamic-fields-form"]');
      await expect(dynamicFieldsForm).toBeVisible();

      // Check for common dynamic fields
      const fields = page.locator('[data-testid^="field-"]');
      const fieldCount = await fields.count();
      expect(fieldCount).toBeGreaterThan(0);
    });

    test('should fill all dynamic fields and proceed', async ({ page }) => {
      // Fill company name
      const companyNameField = page.locator('[data-testid="field-company_name"]');
      if (await companyNameField.isVisible()) {
        await companyNameField.fill('Test Company Inc.');
      }

      // Fill offer price
      const offerPriceField = page.locator('[data-testid="field-offer_price"]');
      if (await offerPriceField.isVisible()) {
        await offerPriceField.fill('99.99');
      }

      // Fill business location
      const locationField = page.locator('[data-testid="field-business_location"]');
      if (await locationField.isVisible()) {
        await locationField.fill('San Francisco, CA');
      }

      // Click next
      await launchPage.clickNext();

      // Should advance to step 3
      await expect(page.locator('[data-testid="step-indicator-3"]')).toHaveClass(/active/);
    });

    test('should show validation error for missing required fields', async ({ page }) => {
      // Try to proceed without filling required fields
      await launchPage.clickNext();

      // Should show validation errors
      const errors = page.locator('[data-testid*="error"]');
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThan(0);
    });

    test('should show validation error for invalid field types', async ({ page }) => {
      // Try to enter non-numeric value in price field
      const offerPriceField = page.locator('[data-testid="field-offer_price"]');
      if (await offerPriceField.isVisible()) {
        await offerPriceField.fill('not-a-number');
        await launchPage.clickNext();

        // Should show validation error
        await verifyValidationError(page, 'field-offer_price', 'must be a number');
      }
    });

    test('should navigate back to step 1 and preserve selection', async ({ page }) => {
      const templateName = await page.locator('[data-testid="template-name"]').first().textContent();

      await launchPage.clickBack();

      // Should be on step 1
      await expect(page.locator('[data-testid="step-indicator-1"]')).toHaveClass(/active/);

      // Navigate forward again
      await launchPage.selectFirstTemplate();

      // Template should still be selected
      await expect(page.locator('[data-testid="template-name"]')).toContainText(templateName || '');
    });
  });

  test.describe('Step 3: Configure Targeting and Budget', () => {
    test.beforeEach(async ({ page }) => {
      await launchPage.selectFirstTemplate();

      // Fill dynamic fields
      const companyNameField = page.locator('[data-testid="field-company_name"]');
      if (await companyNameField.isVisible()) {
        await companyNameField.fill('Test Company');
      }

      await launchPage.clickNext();
    });

    test('should display campaign name field', async ({ page }) => {
      const campaignNameInput = page.locator('[id="campaign-name"]');
      await expect(campaignNameInput).toBeVisible();

      // Should have default value
      const defaultName = await campaignNameInput.inputValue();
      expect(defaultName.length).toBeGreaterThan(0);
    });

    test('should display targeting configuration', async ({ page }) => {
      await expect(page.locator('[data-testid="targeting-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="location-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="age-min-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="age-max-input"]')).toBeVisible();
    });

    test('should display budget configuration', async ({ page }) => {
      await expect(page.locator('[data-testid="budget-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="budget-type-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="budget-amount-input"]')).toBeVisible();
    });

    test('should configure targeting and budget', async ({ page }) => {
      // Set campaign name
      await page.locator('[id="campaign-name"]').fill('My Test Campaign');

      // Configure targeting
      await page.locator('[data-testid="location-input"]').fill('United States');
      await page.locator('[data-testid="age-min-input"]').fill('25');
      await page.locator('[data-testid="age-max-input"]').fill('45');

      // Configure budget
      await page.locator('[data-testid="budget-type-select"]').selectOption('daily');
      await page.locator('[data-testid="budget-amount-input"]').fill('100');

      // Proceed to next step
      await launchPage.clickNext();

      // Should advance to step 4
      await expect(page.locator('[data-testid="step-indicator-4"]')).toHaveClass(/active/);
    });

    test('should show validation error for empty campaign name', async ({ page }) => {
      await page.locator('[id="campaign-name"]').fill('');
      await launchPage.clickNext();

      // Should not proceed
      await expect(page.locator('[data-testid="step-indicator-3"]')).toHaveClass(/active/);
    });

    test('should show validation error for invalid age range', async ({ page }) => {
      await page.locator('[data-testid="age-min-input"]').fill('50');
      await page.locator('[data-testid="age-max-input"]').fill('30');
      await launchPage.clickNext();

      // Should show validation error
      const error = page.locator('[data-testid="age-range-error"]');
      if (await error.isVisible()) {
        await expect(error).toContainText('minimum age must be less than maximum');
      }
    });

    test('should show validation error for invalid budget', async ({ page }) => {
      await page.locator('[data-testid="budget-amount-input"]').fill('0');
      await launchPage.clickNext();

      // Should show validation error
      const error = page.locator('[data-testid="budget-error"]');
      if (await error.isVisible()) {
        await expect(error).toContainText('must be greater than');
      }
    });
  });

  test.describe('Step 4: Preview and Launch', () => {
    test.beforeEach(async ({ page }) => {
      await launchPage.selectFirstTemplate();

      // Fill dynamic fields
      await page.locator('[data-testid="field-company_name"]').fill('Test Company');
      await launchPage.clickNext();

      // Configure campaign
      await page.locator('[id="campaign-name"]').fill('E2E Test Campaign');
      await page.locator('[data-testid="budget-amount-input"]').fill('50');
      await launchPage.clickNext();
    });

    test('should display campaign preview', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Review & Launch');
      await expect(page.locator('[data-testid="campaign-preview"]')).toBeVisible();
    });

    test('should display resolved field values in preview', async ({ page }) => {
      const preview = page.locator('[data-testid="campaign-preview"]');

      // Should show campaign name
      await expect(preview.locator('[data-testid="preview-campaign-name"]')).toContainText('E2E Test Campaign');

      // Should show resolved field values
      const adCopy = preview.locator('[data-testid="preview-ad-copy"]');
      if (await adCopy.isVisible()) {
        const text = await adCopy.textContent();
        expect(text).toContain('Test Company'); // Resolved placeholder
      }
    });

    test('should display targeting and budget summary', async ({ page }) => {
      const preview = page.locator('[data-testid="campaign-preview"]');

      await expect(preview.locator('[data-testid="preview-targeting"]')).toBeVisible();
      await expect(preview.locator('[data-testid="preview-budget"]')).toBeVisible();
    });

    test('should successfully launch campaign', async ({ page }) => {
      // Click launch button
      await page.locator('[data-testid="launch-button"]').click();

      // Should show loading state
      await expect(page.locator('[data-testid="launch-button"]')).toBeDisabled();

      // Wait for success and redirect
      await page.waitForURL(/\/dashboard\/campaigns\?launched=true/, { timeout: 15000 });

      // Should show success message
      await expect(page.locator('text=Campaign launched successfully')).toBeVisible();
    });

    test('should handle launch errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/campaigns/launch', route => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: { message: 'Failed to launch campaign' } })
        });
      });

      await page.locator('[data-testid="launch-button"]').click();

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to launch campaign');
    });

    test('should allow editing previous steps from preview', async ({ page }) => {
      // Click back to edit
      await launchPage.clickBack();

      // Should be on step 3
      await expect(page.locator('[data-testid="step-indicator-3"]')).toHaveClass(/active/);

      // Modify campaign name
      await page.locator('[id="campaign-name"]').fill('Modified Campaign Name');

      // Go back to preview
      await launchPage.clickNext();

      // Should show updated name
      await expect(page.locator('[data-testid="preview-campaign-name"]')).toContainText('Modified Campaign Name');
    });
  });

  test.describe('Full Workflow Integration', () => {
    test('should complete entire launch workflow successfully', async ({ page }) => {
      // Step 1: Select template
      await launchPage.selectFirstTemplate();

      // Step 2: Fill dynamic fields
      await page.locator('[data-testid="field-company_name"]').fill('Acme Corporation');
      const priceField = page.locator('[data-testid="field-offer_price"]');
      if (await priceField.isVisible()) {
        await priceField.fill('149.99');
      }
      await launchPage.clickNext();

      // Step 3: Configure campaign
      await page.locator('[id="campaign-name"]').fill('Complete Integration Test Campaign');
      await page.locator('[data-testid="location-input"]').fill('United States');
      await page.locator('[data-testid="age-min-input"]').fill('25');
      await page.locator('[data-testid="age-max-input"]').fill('55');
      await page.locator('[data-testid="budget-type-select"]').selectOption('daily');
      await page.locator('[data-testid="budget-amount-input"]').fill('75');
      await launchPage.clickNext();

      // Step 4: Preview and launch
      await expect(page.locator('[data-testid="preview-campaign-name"]')).toContainText('Complete Integration Test Campaign');

      // Launch campaign
      await page.locator('[data-testid="launch-button"]').click();

      // Verify success
      await page.waitForURL(/\/dashboard\/campaigns/, { timeout: 15000 });
    });

    test('should preserve form state when navigating back and forth', async ({ page }) => {
      // Step 1: Select template
      await launchPage.selectFirstTemplate();

      // Step 2: Fill dynamic fields
      await page.locator('[data-testid="field-company_name"]').fill('Test Company XYZ');
      await launchPage.clickNext();

      // Step 3: Configure campaign
      await page.locator('[id="campaign-name"]').fill('State Preservation Test');
      await launchPage.clickNext();

      // Go back to step 2
      await launchPage.clickBack();
      await launchPage.clickBack();

      // Verify field value is preserved
      const companyName = await page.locator('[data-testid="field-company_name"]').inputValue();
      expect(companyName).toBe('Test Company XYZ');

      // Go forward to step 3
      await launchPage.clickNext();
      await launchPage.clickNext();

      // Verify campaign name is preserved
      const campaignName = await page.locator('[id="campaign-name"]').inputValue();
      expect(campaignName).toBe('State Preservation Test');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle template fetch error', async ({ page }) => {
      // Mock API error for templates
      await page.route('**/api/templates*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: { message: 'Failed to fetch templates' } })
        });
      });

      await launchPage.goto();

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('should handle ad account fetch error', async ({ page }) => {
      // Mock API error for ad accounts
      await page.route('**/api/ad-accounts*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: { message: 'Failed to fetch ad accounts' } })
        });
      });

      await launchPage.selectFirstTemplate();
      await page.locator('[data-testid="field-company_name"]').fill('Test');
      await launchPage.clickNext();
      await launchPage.clickNext();
      await launchPage.clickNext();
      await page.locator('[data-testid="launch-button"]').click();

      // Should show error
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Tab through template cards
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Should advance to step 2
      await expect(page.locator('[data-testid="step-indicator-2"]')).toHaveClass(/active/);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.locator('[aria-label="Step 1: Select Template"]')).toBeVisible();

      await launchPage.selectFirstTemplate();
      await expect(page.locator('[aria-label="Step 2: Fill Fields"]')).toBeVisible();
    });
  });
});
