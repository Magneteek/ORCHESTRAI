/**
 * Admin Templates Page Object Model
 * Encapsulates admin template management interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class AdminTemplatesPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly viewFilterTabs: Locator;
  readonly templateGrid: Locator;
  readonly statsCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.locator('button:has-text("Create Global Template")');
    this.searchInput = page.locator('[placeholder="Search templates..."]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.viewFilterTabs = page.locator('[role="tablist"]');
    this.templateGrid = page.locator('[data-testid="template-grid"]');
    this.statsCards = page.locator('[data-testid^="stat-"]');
  }

  async goto() {
    await this.page.goto('/dashboard/admin/templates');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateTemplate() {
    await this.createButton.click();
    await this.page.waitForSelector('[data-testid="create-template-dialog"]', {
      state: 'visible',
      timeout: 5000
    });
  }

  async searchTemplates(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async selectCategoryFilter(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForTimeout(300);
  }

  async selectViewFilter(view: 'all' | 'global' | 'organization') {
    const tab = this.page.locator(`[role="tab"]:has-text("${view}")`);
    await tab.click();
    await this.page.waitForTimeout(300);
  }

  async getTemplateCard(templateName: string): Promise<Locator> {
    return this.page.locator(`[data-testid="template-card"]:has-text("${templateName}")`);
  }

  async editTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await card.locator('[data-testid="edit-button"]').click();
  }

  async deleteTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await card.locator('[data-testid="delete-button"]').click();
  }

  async confirmDelete() {
    await this.page.locator('[data-testid="confirm-delete"]').click();
  }

  async cancelDelete() {
    await this.page.locator('[data-testid="cancel-delete"]').click();
  }

  async getTemplateCount(): Promise<number> {
    return await this.page.locator('[data-testid="template-card"]').count();
  }

  async verifyTemplateExists(templateName: string) {
    await expect(this.page.locator(`text=${templateName}`)).toBeVisible();
  }

  async verifyTemplateNotExists(templateName: string) {
    await expect(this.page.locator(`text=${templateName}`)).not.toBeVisible();
  }

  async getStatValue(statName: string): Promise<string | null> {
    const stat = this.page.locator(`[data-testid="stat-${statName}"]`);
    return await stat.textContent();
  }
}

/**
 * Template Form Page Object (Create/Edit)
 */
export class TemplateFormPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly objectiveSelect: Locator;
  readonly isGlobalCheckbox: Locator;
  readonly addFieldButton: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[data-testid="template-name"]');
    this.descriptionInput = page.locator('[data-testid="template-description"]');
    this.categorySelect = page.locator('[data-testid="template-category"]');
    this.objectiveSelect = page.locator('[data-testid="template-objective"]');
    this.isGlobalCheckbox = page.locator('[data-testid="is-global-checkbox"]');
    this.addFieldButton = page.locator('[data-testid="add-field-button"]');
    this.submitButton = page.locator('[data-testid="submit-template"]');
    this.cancelButton = page.locator('[data-testid="cancel-template"]');
  }

  async fillBasicInfo(data: {
    name: string;
    description?: string;
    category: string;
    objective: string;
    isGlobal?: boolean;
  }) {
    await this.nameInput.fill(data.name);

    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }

    await this.categorySelect.selectOption(data.category);
    await this.objectiveSelect.selectOption(data.objective);

    if (data.isGlobal) {
      await this.isGlobalCheckbox.check();
    }
  }

  async addDynamicField(index: number, field: {
    name: string;
    label?: string;
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  }) {
    await this.addFieldButton.click();

    await this.page.locator(`[data-testid="field-name-${index}"]`).fill(field.name);

    if (field.label) {
      await this.page.locator(`[data-testid="field-label-${index}"]`).fill(field.label);
    }

    await this.page.locator(`[data-testid="field-type-${index}"]`).selectOption(field.type);

    if (field.required) {
      await this.page.locator(`[data-testid="field-required-${index}"]`).check();
    }

    if (field.min !== undefined) {
      await this.page.locator(`[data-testid="field-min-${index}"]`).fill(field.min.toString());
    }

    if (field.max !== undefined) {
      await this.page.locator(`[data-testid="field-max-${index}"]`).fill(field.max.toString());
    }

    if (field.pattern) {
      await this.page.locator(`[data-testid="field-pattern-${index}"]`).fill(field.pattern);
    }
  }

  async removeDynamicField(index: number) {
    await this.page.locator(`[data-testid="remove-field-${index}"]`).click();
  }

  async fillAdCopy(data: {
    headline?: string;
    primaryText?: string;
    description?: string;
  }) {
    if (data.headline) {
      await this.page.locator('[data-testid="ad-headline"]').fill(data.headline);
    }

    if (data.primaryText) {
      await this.page.locator('[data-testid="ad-primary-text"]').fill(data.primaryText);
    }

    if (data.description) {
      await this.page.locator('[data-testid="ad-description"]').fill(data.description);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getFieldCount(): Promise<number> {
    return await this.page.locator('[data-testid^="field-name-"]').count();
  }

  async verifyFieldError(fieldName: string, errorMessage: string) {
    const error = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(error).toBeVisible();
    await expect(error).toContainText(errorMessage);
  }

  async verifyPreview(expectedText: string) {
    const preview = this.page.locator('[data-testid="ad-copy-preview"]');
    await expect(preview).toContainText(expectedText);
  }
}

/**
 * Delete Confirmation Dialog Page Object
 */
export class DeleteTemplateDialogPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly templateName: Locator;
  readonly timesUsed: Locator;
  readonly activeCampaigns: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('[data-testid="confirm-delete-dialog"]');
    this.templateName = page.locator('[data-testid="delete-template-name"]');
    this.timesUsed = page.locator('[data-testid="times-used"]');
    this.activeCampaigns = page.locator('[data-testid="active-campaigns"]');
    this.confirmButton = page.locator('[data-testid="confirm-delete"]');
    this.cancelButton = page.locator('[data-testid="cancel-delete"]');
  }

  async verifyDialogVisible() {
    await expect(this.dialog).toBeVisible();
  }

  async verifyTemplateName(name: string) {
    await expect(this.templateName).toContainText(name);
  }

  async verifyUsageStats() {
    await expect(this.timesUsed).toBeVisible();
    await expect(this.activeCampaigns).toBeVisible();
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getTimesUsed(): Promise<string | null> {
    return await this.timesUsed.textContent();
  }

  async getActiveCampaigns(): Promise<string | null> {
    return await this.activeCampaigns.textContent();
  }
}
