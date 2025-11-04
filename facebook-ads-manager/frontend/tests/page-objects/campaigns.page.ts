/**
 * Campaigns Page Object Model
 * Encapsulates campaign page interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class CampaignsPage {
  readonly page: Page;
  readonly createCampaignButton: Locator;
  readonly searchInput: Locator;
  readonly filterToggle: Locator;
  readonly refreshButton: Locator;
  readonly campaignTable: Locator;
  readonly statusFilter: Locator;
  readonly objectiveFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createCampaignButton = page.locator('[data-testid="create-campaign-button"]');
    this.searchInput = page.locator('[data-testid="campaign-search"]');
    this.filterToggle = page.locator('[data-testid="toggle-filters"]');
    this.refreshButton = page.locator('[data-testid="refresh-campaigns"]');
    this.campaignTable = page.locator('[data-testid="campaign-table"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.objectiveFilter = page.locator('[data-testid="objective-filter"]');
  }

  async goto() {
    await this.page.goto('/dashboard/campaigns');
    await this.page.waitForLoadState('networkidle');
  }

  async createNewCampaign() {
    await this.createCampaignButton.click();
    await this.page.waitForURL('/dashboard/campaigns/new');
  }

  async searchCampaigns(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async openFilters() {
    await this.filterToggle.click();
    await expect(this.statusFilter).toBeVisible();
  }

  async filterByStatus(status: string) {
    await this.openFilters();
    await this.statusFilter.selectOption(status);
  }

  async filterByObjective(objective: string) {
    await this.openFilters();
    await this.objectiveFilter.selectOption(objective);
  }

  async refreshCampaigns() {
    await this.refreshButton.click();
  }

  async getCampaignRow(campaignName: string): Promise<Locator> {
    return this.page.locator(`[data-testid="campaign-row"]:has-text("${campaignName}")`);
  }

  async clickCampaign(campaignName: string) {
    const row = await this.getCampaignRow(campaignName);
    await row.click();
  }

  async pauseCampaign(campaignName: string) {
    const row = await this.getCampaignRow(campaignName);
    await row.locator('[data-testid="pause-button"]').click();
    await expect(row.locator('[data-testid="campaign-status"]')).toContainText('Paused');
  }

  async resumeCampaign(campaignName: string) {
    const row = await this.getCampaignRow(campaignName);
    await row.locator('[data-testid="resume-button"]').click();
    await expect(row.locator('[data-testid="campaign-status"]')).toContainText('Active');
  }

  async deleteCampaign(campaignName: string) {
    const row = await this.getCampaignRow(campaignName);
    await row.locator('[data-testid="delete-button"]').click();

    // Confirm deletion
    await this.page.locator('[data-testid="confirm-delete"]').click();

    // Wait for deletion to complete
    await expect(row).not.toBeVisible();
  }

  async verifyCampaignExists(campaignName: string) {
    const row = await this.getCampaignRow(campaignName);
    await expect(row).toBeVisible();
  }

  async verifyCampaignNotExists(campaignName: string) {
    const row = await this.getCampaignRow(campaignName);
    await expect(row).not.toBeVisible();
  }

  async getCampaignCount(): Promise<number> {
    const rows = await this.page.locator('[data-testid="campaign-row"]').count();
    return rows;
  }

  async verifyEmptyState() {
    await expect(this.page.locator('text=No campaigns found')).toBeVisible();
  }

  async waitForCampaignsToLoad() {
    await this.page.waitForSelector('[data-testid="campaign-row"]', {
      state: 'visible',
      timeout: 10000,
    });
  }
}

/**
 * Campaign Creation Wizard Page Object
 */
export class CampaignWizardPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly objectiveSelect: Locator;
  readonly budgetInput: Locator;
  readonly budgetTypeDaily: Locator;
  readonly budgetTypeLifetime: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[data-testid="campaign-name"]');
    this.objectiveSelect = page.locator('[data-testid="campaign-objective"]');
    this.budgetInput = page.locator('[data-testid="campaign-budget"]');
    this.budgetTypeDaily = page.locator('[data-testid="budget-type-daily"]');
    this.budgetTypeLifetime = page.locator('[data-testid="budget-type-lifetime"]');
    this.startDateInput = page.locator('[data-testid="start-date"]');
    this.endDateInput = page.locator('[data-testid="end-date"]');
    this.nextButton = page.locator('[data-testid="wizard-next"]');
    this.backButton = page.locator('[data-testid="wizard-back"]');
    this.submitButton = page.locator('[data-testid="wizard-submit"]');
  }

  async goto() {
    await this.page.goto('/dashboard/campaigns/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fillBasicInfo(name: string, objective: string) {
    await this.nameInput.fill(name);
    await this.objectiveSelect.selectOption(objective);
  }

  async fillBudget(amount: number, type: 'daily' | 'lifetime' = 'daily') {
    if (type === 'daily') {
      await this.budgetTypeDaily.click();
    } else {
      await this.budgetTypeLifetime.click();
    }
    await this.budgetInput.fill(amount.toString());
  }

  async fillSchedule(startDate?: string, endDate?: string) {
    if (startDate) {
      await this.startDateInput.fill(startDate);
    }
    if (endDate) {
      await this.endDateInput.fill(endDate);
    }
  }

  async goToNextStep() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToPreviousStep() {
    await this.backButton.click();
    await this.page.waitForTimeout(500);
  }

  async submitCampaign() {
    await this.submitButton.click();
  }

  async createCampaignComplete(data: {
    name: string;
    objective: string;
    budget: number;
    budgetType?: 'daily' | 'lifetime';
  }) {
    await this.fillBasicInfo(data.name, data.objective);
    await this.goToNextStep();

    await this.fillBudget(data.budget, data.budgetType);
    await this.goToNextStep();

    await this.goToNextStep(); // Skip schedule for now

    await this.submitCampaign();

    // Wait for success
    await this.page.waitForURL('/dashboard/campaigns', { timeout: 10000 });
  }

  async verifyStep(stepName: string) {
    await expect(this.page.locator(`[data-testid="wizard-step-${stepName}"]`)).toHaveClass(/active/);
  }

  async verifyValidationError(fieldName: string) {
    await expect(this.page.locator(`[data-testid="${fieldName}-error"]`)).toBeVisible();
  }
}

/**
 * Campaign Details Page Object
 */
export class CampaignDetailsPage {
  readonly page: Page;
  readonly editButton: Locator;
  readonly pauseButton: Locator;
  readonly resumeButton: Locator;
  readonly deleteButton: Locator;
  readonly campaignName: Locator;
  readonly campaignStatus: Locator;
  readonly statsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editButton = page.locator('[data-testid="edit-campaign"]');
    this.pauseButton = page.locator('[data-testid="pause-campaign"]');
    this.resumeButton = page.locator('[data-testid="resume-campaign"]');
    this.deleteButton = page.locator('[data-testid="delete-campaign"]');
    this.campaignName = page.locator('[data-testid="campaign-name"]');
    this.campaignStatus = page.locator('[data-testid="campaign-status"]');
    this.statsSection = page.locator('[data-testid="campaign-stats"]');
  }

  async goto(campaignId: string) {
    await this.page.goto(`/dashboard/campaigns/${campaignId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async editCampaign() {
    await this.editButton.click();
  }

  async pauseCampaign() {
    await this.pauseButton.click();
    await expect(this.campaignStatus).toContainText('Paused');
  }

  async resumeCampaign() {
    await this.resumeButton.click();
    await expect(this.campaignStatus).toContainText('Active');
  }

  async deleteCampaign() {
    await this.deleteButton.click();
    await this.page.locator('[data-testid="confirm-delete"]').click();
    await this.page.waitForURL('/dashboard/campaigns');
  }

  async verifyStats() {
    await expect(this.statsSection).toBeVisible();
    await expect(this.statsSection.locator('[data-testid="spend"]')).toBeVisible();
    await expect(this.statsSection.locator('[data-testid="impressions"]')).toBeVisible();
    await expect(this.statsSection.locator('[data-testid="clicks"]')).toBeVisible();
  }
}
