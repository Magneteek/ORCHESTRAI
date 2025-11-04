/**
 * Templates Page Object Model
 * Encapsulates template marketplace interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class TemplatesPage {
  readonly page: Page;
  readonly createTemplateButton: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly objectiveFilter: Locator;
  readonly visibilityFilter: Locator;
  readonly sortSelect: Locator;
  readonly templateGrid: Locator;
  readonly viewModeGrid: Locator;
  readonly viewModeList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createTemplateButton = page.locator('[data-testid="create-template"]');
    this.searchInput = page.locator('[data-testid="template-search"]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.objectiveFilter = page.locator('[data-testid="objective-filter"]');
    this.visibilityFilter = page.locator('[data-testid="visibility-filter"]');
    this.sortSelect = page.locator('[data-testid="sort-templates"]');
    this.templateGrid = page.locator('[data-testid="template-grid"]');
    this.viewModeGrid = page.locator('[data-testid="view-mode-grid"]');
    this.viewModeList = page.locator('[data-testid="view-mode-list"]');
  }

  async goto() {
    await this.page.goto('/dashboard/templates');
    await this.page.waitForLoadState('networkidle');
  }

  async createNewTemplate() {
    await this.createTemplateButton.click();
    await this.page.waitForURL('/dashboard/templates/new');
  }

  async searchTemplates(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByObjective(objective: string) {
    await this.objectiveFilter.selectOption(objective);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByVisibility(visibility: string) {
    await this.visibilityFilter.selectOption(visibility);
    await this.page.waitForLoadState('networkidle');
  }

  async sortBy(sortOption: string) {
    await this.sortSelect.selectOption(sortOption);
    await this.page.waitForLoadState('networkidle');
  }

  async switchToGridView() {
    await this.viewModeGrid.click();
    await expect(this.templateGrid).toHaveClass(/grid/);
  }

  async switchToListView() {
    await this.viewModeList.click();
    await expect(this.templateGrid).toHaveClass(/list/);
  }

  async getTemplateCard(templateName: string): Promise<Locator> {
    return this.page.locator(`[data-testid="template-card"]:has-text("${templateName}")`);
  }

  async clickTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await card.click();
  }

  async useTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await card.locator('[data-testid="use-template"]').click();
  }

  async forkTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await card.locator('[data-testid="fork-template"]').click();
  }

  async deleteTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await card.locator('[data-testid="delete-template"]').click();
    await this.page.locator('[data-testid="confirm-delete"]').click();
    await expect(card).not.toBeVisible();
  }

  async verifyTemplateExists(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    await expect(card).toBeVisible();
  }

  async verifyTemplateCount(expectedCount: number) {
    const count = await this.page.locator('[data-testid="template-card"]').count();
    expect(count).toBe(expectedCount);
  }

  async verifyEmptyState() {
    await expect(this.page.locator('text=No templates found')).toBeVisible();
  }

  async verifyPerformanceBadge(templateName: string, badgeType: string) {
    const card = await this.getTemplateCard(templateName);
    await expect(card.locator(`[data-testid="badge-${badgeType}"]`)).toBeVisible();
  }
}

/**
 * Template Details Page Object
 */
export class TemplateDetailsPage {
  readonly page: Page;
  readonly templateName: Locator;
  readonly templateDescription: Locator;
  readonly useTemplateButton: Locator;
  readonly forkTemplateButton: Locator;
  readonly editTemplateButton: Locator;
  readonly deleteTemplateButton: Locator;
  readonly statsSection: Locator;
  readonly adCopySection: Locator;
  readonly targetingSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.templateName = page.locator('[data-testid="template-name"]');
    this.templateDescription = page.locator('[data-testid="template-description"]');
    this.useTemplateButton = page.locator('[data-testid="use-template"]');
    this.forkTemplateButton = page.locator('[data-testid="fork-template"]');
    this.editTemplateButton = page.locator('[data-testid="edit-template"]');
    this.deleteTemplateButton = page.locator('[data-testid="delete-template"]');
    this.statsSection = page.locator('[data-testid="template-stats"]');
    this.adCopySection = page.locator('[data-testid="ad-copy-section"]');
    this.targetingSection = page.locator('[data-testid="targeting-section"]');
  }

  async goto(templateId: string) {
    await this.page.goto(`/dashboard/templates/${templateId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async useTemplate() {
    await this.useTemplateButton.click();
    await this.page.waitForURL(/\/dashboard\/campaigns\/new/);
  }

  async forkTemplate() {
    await this.forkTemplateButton.click();
    await this.page.waitForSelector('[data-testid="fork-dialog"]');
  }

  async editTemplate() {
    await this.editTemplateButton.click();
    await this.page.waitForURL(/\/dashboard\/templates\/.*\/edit/);
  }

  async deleteTemplate() {
    await this.deleteTemplateButton.click();
    await this.page.locator('[data-testid="confirm-delete"]').click();
    await this.page.waitForURL('/dashboard/templates');
  }

  async verifyStats() {
    await expect(this.statsSection).toBeVisible();
    await expect(this.statsSection.locator('[data-testid="times-used"]')).toBeVisible();
    await expect(this.statsSection.locator('[data-testid="avg-roas"]')).toBeVisible();
  }

  async verifyAdCopy() {
    await expect(this.adCopySection).toBeVisible();
    await expect(this.adCopySection.locator('[data-testid="headlines"]')).toBeVisible();
    await expect(this.adCopySection.locator('[data-testid="primary-text"]')).toBeVisible();
  }

  async verifyTargeting() {
    await expect(this.targetingSection).toBeVisible();
  }
}

/**
 * Template Creation Wizard Page Object
 */
export class TemplateWizardPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly objectiveSelect: Locator;
  readonly visibilityPublic: Locator;
  readonly visibilityPrivate: Locator;
  readonly nextButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[data-testid="template-name"]');
    this.descriptionInput = page.locator('[data-testid="template-description"]');
    this.categorySelect = page.locator('[data-testid="template-category"]');
    this.objectiveSelect = page.locator('[data-testid="template-objective"]');
    this.visibilityPublic = page.locator('[data-testid="visibility-public"]');
    this.visibilityPrivate = page.locator('[data-testid="visibility-private"]');
    this.nextButton = page.locator('[data-testid="wizard-next"]');
    this.submitButton = page.locator('[data-testid="wizard-submit"]');
  }

  async goto() {
    await this.page.goto('/dashboard/templates/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fillBasicInfo(data: {
    name: string;
    description?: string;
    category: string;
    objective: string;
    visibility: 'public' | 'private';
  }) {
    await this.nameInput.fill(data.name);
    if (data.description) {
      await this.descriptionInput.fill(data.description);
    }
    await this.categorySelect.selectOption(data.category);
    await this.objectiveSelect.selectOption(data.objective);

    if (data.visibility === 'public') {
      await this.visibilityPublic.click();
    } else {
      await this.visibilityPrivate.click();
    }
  }

  async goToNextStep() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  async submitTemplate() {
    await this.submitButton.click();
    await this.page.waitForURL('/dashboard/templates', { timeout: 10000 });
  }
}

/**
 * Template Leaderboard Page Object
 */
export class TemplateLeaderboardPage {
  readonly page: Page;
  readonly categoryFilter: Locator;
  readonly timeRangeFilter: Locator;
  readonly leaderboardTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryFilter = page.locator('[data-testid="leaderboard-category-filter"]');
    this.timeRangeFilter = page.locator('[data-testid="leaderboard-time-filter"]');
    this.leaderboardTable = page.locator('[data-testid="leaderboard-table"]');
  }

  async goto() {
    await this.page.goto('/dashboard/templates/leaderboard');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByTimeRange(timeRange: string) {
    await this.timeRangeFilter.selectOption(timeRange);
    await this.page.waitForLoadState('networkidle');
  }

  async verifyTopTemplate(templateName: string, rank: number) {
    const row = this.leaderboardTable.locator(`[data-testid="rank-${rank}"]`);
    await expect(row).toContainText(templateName);
  }

  async clickTemplate(rank: number) {
    const row = this.leaderboardTable.locator(`[data-testid="rank-${rank}"]`);
    await row.click();
  }
}
