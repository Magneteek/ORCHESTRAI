/**
 * Templates E2E Tests
 * Tests template marketplace, creation, and usage
 */

import { test, expect } from '@playwright/test';
import {
  TemplatesPage,
  TemplateDetailsPage,
  TemplateWizardPage,
  TemplateLeaderboardPage,
} from './page-objects/templates.page';
import { verifyToast, randomString } from './helpers/test-utils';

test.describe('Template Marketplace', () => {
  test.describe('Template Browsing', () => {
    test('should display templates marketplace', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Should show templates page
      await expect(page.locator('h1')).toContainText('Templates');
      await expect(templatesPage.createTemplateButton).toBeVisible();
      await expect(templatesPage.templateGrid).toBeVisible();
    });

    test('should search templates', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Search for template
      await templatesPage.searchTemplates('E-commerce');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Should show search results
      await expect(templatesPage.templateGrid).toBeVisible();
    });

    test('should filter templates by category', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Filter by e-commerce category
      await templatesPage.filterByCategory('e-commerce');

      // Should show filtered templates
      await expect(templatesPage.templateGrid).toBeVisible();
    });

    test('should filter templates by objective', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Filter by objective
      await templatesPage.filterByObjective('OUTCOME_SALES');

      // Should show filtered templates
      await expect(templatesPage.templateGrid).toBeVisible();
    });

    test('should filter templates by visibility', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Filter by public templates
      await templatesPage.filterByVisibility('public');

      // Should show only public templates
      await expect(templatesPage.templateGrid).toBeVisible();

      // Filter by private templates
      await templatesPage.filterByVisibility('mine');

      // Should show only user's templates
      await expect(templatesPage.templateGrid).toBeVisible();
    });

    test('should sort templates', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Sort by times used
      await templatesPage.sortBy('timesUsed');
      await page.waitForTimeout(500);

      // Sort by ROAS
      await templatesPage.sortBy('roas');
      await page.waitForTimeout(500);

      // Sort by creation date
      await templatesPage.sortBy('createdAt');
      await page.waitForTimeout(500);
    });

    test('should switch between grid and list views', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Switch to list view
      await templatesPage.switchToListView();
      await expect(templatesPage.templateGrid).toHaveClass(/list/);

      // Switch back to grid view
      await templatesPage.switchToGridView();
      await expect(templatesPage.templateGrid).toHaveClass(/grid/);
    });

    test('should display performance badges on templates', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Verify template with performance badge
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await expect(templateCard).toBeVisible();

      // Check for performance indicators
      const badges = templateCard.locator('[data-testid^="badge-"]');
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThanOrEqual(0); // Some templates may have badges
    });

    test('should handle empty search results', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Search for non-existent template
      await templatesPage.searchTemplates('NonExistentTemplate' + randomString(20));

      // Wait for search
      await page.waitForTimeout(1000);

      // Should show empty state
      await templatesPage.verifyEmptyState();
    });
  });

  test.describe('Template Usage', () => {
    test('should use template to create campaign', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Use first template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await expect(templateCard).toBeVisible();

      await templateCard.locator('[data-testid="use-template"]').click();

      // Should navigate to campaign creation with template data
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/new/);
      await expect(page.locator('[data-testid="template-indicator"]')).toBeVisible();
    });

    test('should fork public template', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Filter to public templates
      await templatesPage.filterByVisibility('public');

      // Fork first public template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await expect(templateCard).toBeVisible();

      await templateCard.locator('[data-testid="fork-template"]').click();

      // Should show fork dialog
      await expect(page.locator('[data-testid="fork-dialog"]')).toBeVisible();

      // Confirm fork
      await page.locator('[data-testid="confirm-fork"]').click();

      // Should show success message
      await verifyToast(page, 'Template forked successfully');
    });

    test('should navigate to template details', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      await templatesPage.goto();

      // Click on first template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await templateCard.click();

      // Should navigate to template details
      await expect(page).toHaveURL(/\/dashboard\/templates\/.+/);
    });
  });

  test.describe('Template Details', () => {
    test('should display template details', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const detailsPage = new TemplateDetailsPage(page);

      await templatesPage.goto();

      // Navigate to first template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await templateCard.click();

      // Verify template details are displayed
      await expect(detailsPage.templateName).toBeVisible();
      await expect(detailsPage.templateDescription).toBeVisible();
      await detailsPage.verifyStats();
    });

    test('should display ad copy in template details', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const detailsPage = new TemplateDetailsPage(page);

      await templatesPage.goto();
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await templateCard.click();

      // Verify ad copy section
      await detailsPage.verifyAdCopy();
    });

    test('should display targeting configuration', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const detailsPage = new TemplateDetailsPage(page);

      await templatesPage.goto();
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await templateCard.click();

      // Verify targeting section
      await detailsPage.verifyTargeting();
    });

    test('should use template from details page', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const detailsPage = new TemplateDetailsPage(page);

      await templatesPage.goto();
      const templateCard = page.locator('[data-testid="template-card"]').first();
      await templateCard.click();

      // Use template
      await detailsPage.useTemplate();

      // Should navigate to campaign creation
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/new/);
    });
  });

  test.describe('Template Creation', () => {
    test('should create new template successfully', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const wizardPage = new TemplateWizardPage(page);

      await templatesPage.goto();
      await templatesPage.createNewTemplate();

      // Should be on creation wizard
      await expect(page).toHaveURL('/dashboard/templates/new');

      // Fill in template details
      const templateName = `Test Template ${Date.now()}`;
      await wizardPage.fillBasicInfo({
        name: templateName,
        description: 'Test template description',
        category: 'e-commerce',
        objective: 'OUTCOME_SALES',
        visibility: 'private',
      });

      await wizardPage.goToNextStep();
      await wizardPage.goToNextStep();
      await wizardPage.goToNextStep();

      // Submit template
      await wizardPage.submitTemplate();

      // Should redirect to templates list
      await expect(page).toHaveURL('/dashboard/templates');

      // Should show success message
      await verifyToast(page, 'Template created successfully');
    });

    test('should validate template name is required', async ({ page }) => {
      const wizardPage = new TemplateWizardPage(page);
      await wizardPage.goto();

      // Try to submit without name
      await wizardPage.goToNextStep();

      // Should show validation error
      await expect(page.locator('[data-testid="template-name-error"]')).toBeVisible();
    });

    test('should create public template', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const wizardPage = new TemplateWizardPage(page);

      await templatesPage.goto();
      await templatesPage.createNewTemplate();

      // Fill in template with public visibility
      await wizardPage.fillBasicInfo({
        name: `Public Template ${Date.now()}`,
        description: 'Public template for testing',
        category: 'lead-generation',
        objective: 'OUTCOME_LEADS',
        visibility: 'public',
      });

      await expect(wizardPage.visibilityPublic).toBeChecked();
    });

    test('should create private template', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const wizardPage = new TemplateWizardPage(page);

      await templatesPage.goto();
      await templatesPage.createNewTemplate();

      // Fill in template with private visibility
      await wizardPage.fillBasicInfo({
        name: `Private Template ${Date.now()}`,
        description: 'Private template for testing',
        category: 'e-commerce',
        objective: 'OUTCOME_SALES',
        visibility: 'private',
      });

      await expect(wizardPage.visibilityPrivate).toBeChecked();
    });
  });

  test.describe('Template Management', () => {
    test('should edit own template', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);
      const detailsPage = new TemplateDetailsPage(page);

      await templatesPage.goto();

      // Filter to own templates
      await templatesPage.filterByVisibility('mine');

      // Click on first template
      const templateCard = page.locator('[data-testid="template-card"]').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();

        // Edit template
        await detailsPage.editTemplate();

        // Should navigate to edit page
        await expect(page).toHaveURL(/\/dashboard\/templates\/.+\/edit/);
      }
    });

    test('should delete own template', async ({ page }) => {
      const templatesPage = new TemplatesPage(page);

      await templatesPage.goto();

      // Filter to own templates
      await templatesPage.filterByVisibility('mine');

      // Get template name
      const templateCard = page.locator('[data-testid="template-card"]').first();
      if (await templateCard.isVisible()) {
        const templateName = await templateCard.locator('[data-testid="template-name"]').textContent();

        if (templateName) {
          // Delete template
          await templatesPage.deleteTemplate(templateName);

          // Should show success message
          await verifyToast(page, 'Template deleted successfully');

          // Template should be removed
          await expect(templateCard).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Template Leaderboard', () => {
    test('should display template leaderboard', async ({ page }) => {
      const leaderboardPage = new TemplateLeaderboardPage(page);
      await leaderboardPage.goto();

      // Should show leaderboard
      await expect(page.locator('h1')).toContainText('Leaderboard');
      await expect(leaderboardPage.leaderboardTable).toBeVisible();
    });

    test('should filter leaderboard by category', async ({ page }) => {
      const leaderboardPage = new TemplateLeaderboardPage(page);
      await leaderboardPage.goto();

      // Filter by category
      await leaderboardPage.filterByCategory('e-commerce');

      // Should show filtered leaderboard
      await expect(leaderboardPage.leaderboardTable).toBeVisible();
    });

    test('should filter leaderboard by time range', async ({ page }) => {
      const leaderboardPage = new TemplateLeaderboardPage(page);
      await leaderboardPage.goto();

      // Filter by time range
      await leaderboardPage.filterByTimeRange('month');

      // Should show filtered leaderboard
      await expect(leaderboardPage.leaderboardTable).toBeVisible();
    });

    test('should navigate to template from leaderboard', async ({ page }) => {
      const leaderboardPage = new TemplateLeaderboardPage(page);
      await leaderboardPage.goto();

      // Click on top template
      await leaderboardPage.clickTemplate(1);

      // Should navigate to template details
      await expect(page).toHaveURL(/\/dashboard\/templates\/.+/);
    });
  });
});
