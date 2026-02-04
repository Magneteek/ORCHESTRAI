/**
 * Launch Workflow Page Object Model
 * Encapsulates template launch workflow interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class LaunchWorkflowPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly nextButton: Locator;
  readonly launchButton: Locator;
  readonly templateGrid: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly stepIndicator: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.locator('[data-testid="back-button"]');
    this.nextButton = page.locator('[data-testid="next-button"]');
    this.launchButton = page.locator('[data-testid="launch-button"]');
    this.templateGrid = page.locator('[data-testid="template-grid"]');
    this.searchInput = page.locator('[data-testid="template-search"]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.stepIndicator = page.locator('[data-testid^="step-indicator-"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/dashboard/campaigns/launch');
    await this.page.waitForLoadState('networkidle');
  }

  async selectTemplate(templateName: string) {
    const template = this.page.locator(`[data-testid="template-card"]:has-text("${templateName}")`);
    await template.click();
    await this.page.waitForTimeout(500);
  }

  async selectFirstTemplate() {
    const firstTemplate = this.page.locator('[data-testid="template-card"]').first();
    await firstTemplate.click();
    await this.page.waitForTimeout(500);
  }

  async searchTemplate(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // Debounce
  }

  async selectCategory(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForTimeout(300);
  }

  async clickNext() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickBack() {
    await this.backButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickLaunch() {
    await this.launchButton.click();
  }

  async fillDynamicField(fieldName: string, value: string) {
    const field = this.page.locator(`[data-testid="field-${fieldName}"]`);
    await field.fill(value);
  }

  async fillCampaignName(name: string) {
    const input = this.page.locator('[id="campaign-name"]');
    await input.fill(name);
  }

  async configureBudget(amount: number, type: 'daily' | 'lifetime' = 'daily') {
    await this.page.locator('[data-testid="budget-type-select"]').selectOption(type);
    await this.page.locator('[data-testid="budget-amount-input"]').fill(amount.toString());
  }

  async configureTargeting(options: {
    locations?: string;
    ageMin?: number;
    ageMax?: number;
  }) {
    if (options.locations) {
      await this.page.locator('[data-testid="location-input"]').fill(options.locations);
    }
    if (options.ageMin) {
      await this.page.locator('[data-testid="age-min-input"]').fill(options.ageMin.toString());
    }
    if (options.ageMax) {
      await this.page.locator('[data-testid="age-max-input"]').fill(options.ageMax.toString());
    }
  }

  async verifyStep(stepNumber: number) {
    const step = this.page.locator(`[data-testid="step-indicator-${stepNumber}"]`);
    await expect(step).toHaveClass(/active/);
  }

  async verifyTemplateSelected(templateName: string) {
    await expect(this.page.locator('[data-testid="selected-template-name"]')).toContainText(templateName);
  }

  async getTemplateCount(): Promise<number> {
    return await this.page.locator('[data-testid="template-card"]').count();
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  async waitForTemplatesLoad() {
    await this.page.waitForSelector('[data-testid="template-card"]', {
      state: 'visible',
      timeout: 10000,
    });
  }

  async isNextButtonEnabled(): Promise<boolean> {
    return await this.nextButton.isEnabled();
  }

  async isLaunchButtonEnabled(): Promise<boolean> {
    return await this.launchButton.isEnabled();
  }
}

/**
 * Dynamic Fields Form Page Object
 */
export class DynamicFieldsFormPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillField(fieldName: string, value: string) {
    const field = this.page.locator(`[data-testid="field-${fieldName}"]`);
    await field.fill(value);
  }

  async getFieldValue(fieldName: string): Promise<string> {
    const field = this.page.locator(`[data-testid="field-${fieldName}"]`);
    return await field.inputValue();
  }

  async getFieldError(fieldName: string): Promise<string | null> {
    const error = this.page.locator(`[data-testid="field-${fieldName}-error"]`);
    if (await error.isVisible()) {
      return await error.textContent();
    }
    return null;
  }

  async verifyFieldRequired(fieldName: string) {
    const field = this.page.locator(`[data-testid="field-${fieldName}"]`);
    await expect(field).toHaveAttribute('required', '');
  }

  async verifyFieldType(fieldName: string, type: string) {
    const field = this.page.locator(`[data-testid="field-${fieldName}"]`);
    await expect(field).toHaveAttribute('type', type);
  }
}

/**
 * Campaign Preview Page Object
 */
export class CampaignPreviewPage {
  readonly page: Page;
  readonly previewContainer: Locator;
  readonly campaignName: Locator;
  readonly adCopy: Locator;
  readonly targeting: Locator;
  readonly budget: Locator;

  constructor(page: Page) {
    this.page = page;
    this.previewContainer = page.locator('[data-testid="campaign-preview"]');
    this.campaignName = page.locator('[data-testid="preview-campaign-name"]');
    this.adCopy = page.locator('[data-testid="preview-ad-copy"]');
    this.targeting = page.locator('[data-testid="preview-targeting"]');
    this.budget = page.locator('[data-testid="preview-budget"]');
  }

  async verifyPreviewVisible() {
    await expect(this.previewContainer).toBeVisible();
  }

  async verifyCampaignName(expectedName: string) {
    await expect(this.campaignName).toContainText(expectedName);
  }

  async verifyFieldResolution(placeholder: string, value: string) {
    const text = await this.adCopy.textContent();
    expect(text).not.toContain(`{{${placeholder}}}`);
    expect(text).toContain(value);
  }

  async verifyBudget(amount: number, type: 'daily' | 'lifetime') {
    const budgetText = await this.budget.textContent();
    expect(budgetText).toContain(amount.toString());
    expect(budgetText?.toLowerCase()).toContain(type);
  }

  async verifyTargeting(options: {
    locations?: string;
    ageMin?: number;
    ageMax?: number;
  }) {
    const targetingText = await this.targeting.textContent();

    if (options.locations) {
      expect(targetingText).toContain(options.locations);
    }
    if (options.ageMin && options.ageMax) {
      expect(targetingText).toContain(`${options.ageMin}-${options.ageMax}`);
    }
  }
}
