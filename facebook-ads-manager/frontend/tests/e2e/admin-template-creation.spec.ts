/**
 * Admin Template Creation E2E Tests
 * Tests admin functionality for creating and managing global templates
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
import { AdminTemplatesPage } from '../page-objects/admin-templates.page';

test.describe('Admin Template Creation', () => {
  let adminTemplatesPage: AdminTemplatesPage;

  test.describe('Access Control', () => {
    test('should allow ADMIN to access template management', async ({ page }) => {
      await loginAdminUser(page);
      await page.goto('/dashboard/admin/templates');

      await expect(page).toHaveURL(/\/dashboard\/admin\/templates/);
      await expect(page.locator('h2')).toContainText('Template Management');
    });

    test('should block USER from accessing template management', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
      await page.goto('/dashboard/admin/templates');

      // Should show unauthorized page
      await expect(page.locator('[data-testid="unauthorized-page"]')).toBeVisible();
      await expect(page.locator('text=You do not have permission')).toBeVisible();
    });
  });

  test.describe('Template List View', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();
    });

    test('should display template statistics', async ({ page }) => {
      await expect(page.locator('[data-testid="stat-total-templates"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-global-templates"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-organization-templates"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-total-usage"]')).toBeVisible();
    });

    test('should display template grid', async ({ page }) => {
      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should filter templates by category', async ({ page }) => {
      await adminTemplatesPage.selectCategoryFilter('e-commerce');
      await waitForLoading(page);

      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();

      // Verify all templates have e-commerce category
      for (let i = 0; i < count; i++) {
        const badge = templates.nth(i).locator('[data-testid="template-category"]');
        await expect(badge).toContainText('e-commerce');
      }
    });

    test('should filter templates by type (global/organization)', async ({ page }) => {
      // Filter by global only
      await adminTemplatesPage.selectViewFilter('global');

      const templates = page.locator('[data-testid="template-card"]');
      const count = await templates.count();

      // Verify all templates have global badge
      for (let i = 0; i < count; i++) {
        const badge = templates.nth(i).locator('[data-testid="global-badge"]');
        await expect(badge).toBeVisible();
      }
    });

    test('should search templates by name', async ({ page }) => {
      await adminTemplatesPage.searchTemplates('Lead Generation');
      await page.waitForTimeout(500);

      const templates = page.locator('[data-testid="template-card"]');
      const firstTemplateName = await templates.first().locator('[data-testid="template-name"]').textContent();

      expect(firstTemplateName?.toLowerCase()).toContain('lead generation'.toLowerCase());
    });

    test('should display template performance metrics', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();

      await expect(firstTemplate.locator('[data-testid="times-used"]')).toBeVisible();
      await expect(firstTemplate.locator('[data-testid="active-campaigns"]')).toBeVisible();
    });
  });

  test.describe('Template Creation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();
    });

    test('should open create template dialog', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      await expect(page.locator('[data-testid="create-template-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('Create Global Template');
    });

    test('should create template with basic information', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      // Fill basic info
      await page.locator('[data-testid="template-name"]').fill('Dental Special Offer');
      await page.locator('[data-testid="template-description"]').fill('High-converting template for dental promotions');
      await page.locator('[data-testid="template-category"]').selectOption('general-dentist');
      await page.locator('[data-testid="template-objective"]').selectOption('LEAD_GENERATION');

      // Mark as global
      await page.locator('[data-testid="is-global-checkbox"]').check();

      // Submit
      await page.locator('[data-testid="submit-template"]').click();

      // Should show success toast
      await verifyToast(page, 'Template created successfully', 'success');

      // Should close dialog and refresh list
      await expect(page.locator('[data-testid="create-template-dialog"]')).not.toBeVisible();

      // New template should appear in list
      await expect(page.locator('text=Dental Special Offer')).toBeVisible();
    });

    test('should add dynamic fields with field builder', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      // Fill basic info
      await page.locator('[data-testid="template-name"]').fill('Dynamic Field Test Template');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      // Add company name field
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('company_name');
      await page.locator('[data-testid="field-label-0"]').fill('Company Name');
      await page.locator('[data-testid="field-type-0"]').selectOption('text');
      await page.locator('[data-testid="field-required-0"]').check();

      // Add offer price field
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-1"]').fill('offer_price');
      await page.locator('[data-testid="field-label-1"]').fill('Offer Price');
      await page.locator('[data-testid="field-type-1"]').selectOption('number');
      await page.locator('[data-testid="field-required-1"]').check();
      await page.locator('[data-testid="field-min-1"]').fill('0');

      // Add booking URL field (optional)
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-2"]').fill('booking_url');
      await page.locator('[data-testid="field-label-2"]').fill('Booking URL');
      await page.locator('[data-testid="field-type-2"]').selectOption('url');

      // Submit
      await page.locator('[data-testid="submit-template"]').click();

      await verifyToast(page, 'Template created successfully', 'success');
    });

    test('should use placeholders in ad copy', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      // Fill basic info
      await page.locator('[data-testid="template-name"]').fill('Placeholder Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      // Add dynamic fields
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('company_name');
      await page.locator('[data-testid="field-type-0"]').selectOption('text');

      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-1"]').fill('offer_price');
      await page.locator('[data-testid="field-type-1"]').selectOption('number');

      // Fill ad copy with placeholders
      await page.locator('[data-testid="ad-headline"]').fill('{{company_name}} - Special Offer');
      await page.locator('[data-testid="ad-primary-text"]').fill('Get ${{offer_price}} off your first purchase!');

      // Verify preview shows placeholders
      const preview = page.locator('[data-testid="ad-copy-preview"]');
      await expect(preview).toContainText('{{company_name}}');
      await expect(preview).toContainText('{{offer_price}}');

      await page.locator('[data-testid="submit-template"]').click();
      await verifyToast(page, 'Template created successfully', 'success');
    });

    test('should show validation error for duplicate field names', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      await page.locator('[data-testid="template-name"]').fill('Validation Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      // Add first field
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('company_name');

      // Add second field with same name
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-1"]').fill('company_name');

      // Try to submit
      await page.locator('[data-testid="submit-template"]').click();

      // Should show error
      await verifyValidationError(page, 'field-name-1', 'Field name must be unique');
    });

    test('should remove dynamic fields', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      await page.locator('[data-testid="template-name"]').fill('Remove Field Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      // Add two fields
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('field_one');

      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-1"]').fill('field_two');

      // Remove first field
      await page.locator('[data-testid="remove-field-0"]').click();

      // First field should be gone
      await expect(page.locator('[data-testid="field-name-0"]')).not.toBeVisible();

      // Second field should still exist
      await expect(page.locator('[data-testid="field-name-0"]')).toHaveValue('field_two');
    });

    test('should show validation errors for required fields', async ({ page }) => {
      await adminTemplatesPage.clickCreateTemplate();

      // Try to submit without filling required fields
      await page.locator('[data-testid="submit-template"]').click();

      // Should show validation errors
      await verifyValidationError(page, 'template-name', 'Name is required');
      await verifyValidationError(page, 'template-category', 'Category is required');
      await verifyValidationError(page, 'template-objective', 'Objective is required');
    });
  });

  test.describe('Template Editing', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();
    });

    test('should open edit dialog for existing template', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      await firstTemplate.locator('[data-testid="edit-button"]').click();

      await expect(page.locator('[data-testid="edit-template-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialog-title"]')).toContainText('Edit Template');
    });

    test('should edit template name and description', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      const originalName = await firstTemplate.locator('[data-testid="template-name"]').textContent();

      await firstTemplate.locator('[data-testid="edit-button"]').click();

      // Update name
      await page.locator('[data-testid="template-name"]').fill('Updated Template Name');
      await page.locator('[data-testid="template-description"]').fill('Updated description');

      await page.locator('[data-testid="submit-template"]').click();

      await verifyToast(page, 'Template updated successfully', 'success');

      // Verify changes
      await expect(page.locator('text=Updated Template Name')).toBeVisible();
    });

    test('should edit dynamic fields', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      await firstTemplate.locator('[data-testid="edit-button"]').click();

      // Add a new field
      await page.locator('[data-testid="add-field-button"]').click();
      const newFieldIndex = await page.locator('[data-testid^="field-name-"]').count() - 1;
      await page.locator(`[data-testid="field-name-${newFieldIndex}"]`).fill('new_field');
      await page.locator(`[data-testid="field-label-${newFieldIndex}"]`).fill('New Field');
      await page.locator(`[data-testid="field-type-${newFieldIndex}"]`).selectOption('text');

      await page.locator('[data-testid="submit-template"]').click();

      await verifyToast(page, 'Template updated successfully', 'success');
    });
  });

  test.describe('Template Deletion', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();
    });

    test('should show confirmation dialog before deleting', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      await firstTemplate.locator('[data-testid="delete-button"]').click();

      // Should show confirmation dialog
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();
      await expect(page.locator('text=Are you sure')).toBeVisible();
    });

    test('should display usage statistics in delete confirmation', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      await firstTemplate.locator('[data-testid="delete-button"]').click();

      const dialog = page.locator('[data-testid="confirm-delete-dialog"]');
      await expect(dialog.locator('[data-testid="times-used"]')).toBeVisible();
      await expect(dialog.locator('[data-testid="active-campaigns"]')).toBeVisible();
    });

    test('should cancel deletion', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      const templateName = await firstTemplate.locator('[data-testid="template-name"]').textContent();

      await firstTemplate.locator('[data-testid="delete-button"]').click();
      await page.locator('[data-testid="cancel-delete"]').click();

      // Dialog should close
      await expect(page.locator('[data-testid="confirm-delete-dialog"]')).not.toBeVisible();

      // Template should still exist
      await expect(page.locator(`text=${templateName}`)).toBeVisible();
    });

    test('should delete template after confirmation', async ({ page }) => {
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      const templateName = await firstTemplate.locator('[data-testid="template-name"]').textContent();

      await firstTemplate.locator('[data-testid="delete-button"]').click();
      await page.locator('[data-testid="confirm-delete"]').click();

      await verifyToast(page, 'Template deleted successfully', 'success');

      // Template should be removed
      await expect(page.locator(`text=${templateName}`)).not.toBeVisible();
    });
  });

  test.describe('Template Availability', () => {
    test('should make global templates available to USER accounts', async ({ page }) => {
      // Create global template as admin
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();

      await adminTemplatesPage.clickCreateTemplate();
      await page.locator('[data-testid="template-name"]').fill('Global Test Template');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');
      await page.locator('[data-testid="is-global-checkbox"]').check();
      await page.locator('[data-testid="submit-template"]').click();

      await verifyToast(page, 'Template created successfully', 'success');

      // Logout and login as user
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="logout-button"]').click();

      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);

      // Navigate to launch workflow
      await page.goto('/dashboard/campaigns/launch');

      // Global template should be available
      await expect(page.locator('text=Global Test Template')).toBeVisible();
    });

    test('should not show organization templates to other organizations', async ({ page }) => {
      // This would require multi-org setup
      // Placeholder for organization isolation test
      test.skip();
    });
  });

  test.describe('Field Type Validation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();
      await adminTemplatesPage.clickCreateTemplate();
    });

    test('should configure number field with min/max constraints', async ({ page }) => {
      await page.locator('[data-testid="template-name"]').fill('Number Field Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('price');
      await page.locator('[data-testid="field-type-0"]').selectOption('number');
      await page.locator('[data-testid="field-min-0"]').fill('0');
      await page.locator('[data-testid="field-max-0"]').fill('10000');

      await page.locator('[data-testid="submit-template"]').click();
      await verifyToast(page, 'Template created successfully', 'success');
    });

    test('should configure text field with pattern validation', async ({ page }) => {
      await page.locator('[data-testid="template-name"]').fill('Text Field Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('phone');
      await page.locator('[data-testid="field-type-0"]').selectOption('text');
      await page.locator('[data-testid="field-pattern-0"]').fill('^[0-9]{10}$');

      await page.locator('[data-testid="submit-template"]').click();
      await verifyToast(page, 'Template created successfully', 'success');
    });

    test('should configure URL field', async ({ page }) => {
      await page.locator('[data-testid="template-name"]').fill('URL Field Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('website');
      await page.locator('[data-testid="field-type-0"]').selectOption('url');

      await page.locator('[data-testid="submit-template"]').click();
      await verifyToast(page, 'Template created successfully', 'success');
    });
  });

  test.describe('Preview Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      adminTemplatesPage = new AdminTemplatesPage(page);
      await adminTemplatesPage.goto();
      await adminTemplatesPage.clickCreateTemplate();
    });

    test('should show live preview of ad copy with placeholders', async ({ page }) => {
      await page.locator('[data-testid="template-name"]').fill('Preview Test');
      await page.locator('[data-testid="template-category"]').selectOption('e-commerce');
      await page.locator('[data-testid="template-objective"]').selectOption('OUTCOME_SALES');

      // Add field
      await page.locator('[data-testid="add-field-button"]').click();
      await page.locator('[data-testid="field-name-0"]').fill('discount');

      // Add ad copy with placeholder
      await page.locator('[data-testid="ad-headline"]').fill('Save {{discount}}% Today!');

      // Preview should show placeholder
      const preview = page.locator('[data-testid="ad-copy-preview"]');
      await expect(preview).toContainText('{{discount}}');
    });
  });
});
