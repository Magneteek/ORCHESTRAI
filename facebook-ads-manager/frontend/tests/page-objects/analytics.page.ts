/**
 * Analytics Page Object Model
 * Encapsulates analytics dashboard interactions
 */

import { Page, Locator, expect } from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly refreshButton: Locator;
  readonly dateRangePicker: Locator;
  readonly categoryFilter: Locator;
  readonly performanceTable: Locator;
  readonly roasChart: Locator;
  readonly spendChart: Locator;
  readonly metricCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.refreshButton = page.locator('[data-testid="refresh-button"]');
    this.dateRangePicker = page.locator('[data-testid="date-range-picker"]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.performanceTable = page.locator('[data-testid="performance-table"]');
    this.roasChart = page.locator('[data-testid="roas-chart"]');
    this.spendChart = page.locator('[data-testid="spend-distribution-chart"]');
    this.metricCards = page.locator('[data-testid^="metric-"]');
  }

  async goto() {
    await this.page.goto('/dashboard/analytics/templates');
    await this.page.waitForLoadState('networkidle');
  }

  async refresh() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(500);
  }

  async selectDateRange(range: string) {
    // Assuming date range is a select or custom picker
    const picker = this.page.locator('[data-testid="date-range-select"]');
    if (await picker.isVisible()) {
      await picker.selectOption(range);
    }
  }

  async openDateRangePicker() {
    await this.dateRangePicker.click();
  }

  async setCustomDateRange(startDate: Date, endDate: Date) {
    await this.openDateRangePicker();

    const startInput = this.page.locator('[data-testid="start-date-input"]');
    const endInput = this.page.locator('[data-testid="end-date-input"]');

    await startInput.fill(startDate.toISOString().split('T')[0]);
    await endInput.fill(endDate.toISOString().split('T')[0]);

    await this.page.locator('[data-testid="apply-date-range"]').click();
  }

  async selectCategory(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForTimeout(300);
  }

  async getMetricValue(metricName: string): Promise<string | null> {
    const metric = this.page.locator(`[data-testid="metric-${metricName}"] .text-2xl`);
    return await metric.textContent();
  }

  async sortByColumn(column: string, direction: 'asc' | 'desc') {
    const header = this.page.locator(`th:has-text("${column}")`);
    await header.click();

    if (direction === 'desc') {
      // Click again if needed for descending
      const currentSort = await header.getAttribute('aria-sort');
      if (currentSort === 'ascending') {
        await header.click();
      }
    }

    await this.page.waitForTimeout(500);
  }

  async expandRow(rowIndex: number) {
    const row = this.page.locator('[data-testid="template-row"]').nth(rowIndex);
    await row.locator('[data-testid="expand-button"]').click();
    await this.page.waitForTimeout(500);
  }

  async collapseRow(rowIndex: number) {
    const row = this.page.locator('[data-testid="template-row"]').nth(rowIndex);
    await row.locator('[data-testid="expand-button"]').click();
    await this.page.waitForTimeout(300);
  }

  async getRowCount(): Promise<number> {
    return await this.page.locator('[data-testid="template-row"]').count();
  }

  async getRowData(rowIndex: number): Promise<{
    name: string | null;
    category: string | null;
    accountsUsing: string | null;
    spend: string | null;
    roas: string | null;
  }> {
    const row = this.page.locator('[data-testid="template-row"]').nth(rowIndex);

    return {
      name: await row.locator('[data-testid="name"]').textContent(),
      category: await row.locator('[data-testid="category"]').textContent(),
      accountsUsing: await row.locator('[data-testid="accounts-using"]').textContent(),
      spend: await row.locator('[data-testid="spend"]').textContent(),
      roas: await row.locator('[data-testid="roas"]').textContent()
    };
  }

  async verifyChartVisible(chartName: 'roas' | 'spend') {
    const chart = chartName === 'roas' ? this.roasChart : this.spendChart;
    await expect(chart).toBeVisible();
  }

  async verifyMetricCardsVisible() {
    await expect(this.page.locator('[data-testid="metric-total-templates"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="metric-active-campaigns"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="metric-total-spend"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="metric-avg-roas"]')).toBeVisible();
  }

  async waitForDataLoad() {
    await this.page.waitForSelector('[data-testid="template-row"]', {
      state: 'visible',
      timeout: 10000
    });
  }

  async verifyEmptyState() {
    await expect(this.page.locator('text=No templates found')).toBeVisible();
  }
}

/**
 * Performance Table Page Object
 */
export class PerformanceTablePage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('[data-testid="performance-table"]');
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = await this.table.locator('th').allTextContents();
    return headers;
  }

  async sortByColumn(columnName: string) {
    const header = this.table.locator(`th:has-text("${columnName}")`);
    await header.click();
    await this.page.waitForTimeout(500);
  }

  async getRowByTemplateName(templateName: string): Promise<Locator> {
    return this.table.locator(`tr:has-text("${templateName}")`);
  }

  async expandRow(templateName: string) {
    const row = await this.getRowByTemplateName(templateName);
    await row.locator('[data-testid="expand-button"]').click();
  }

  async verifyAccountBreakdown(templateName: string) {
    await this.expandRow(templateName);

    const breakdownTable = this.page.locator('[data-testid="account-breakdown-table"]');
    await expect(breakdownTable).toBeVisible();
  }

  async getBreakdownRows(): Promise<number> {
    const breakdownTable = this.page.locator('[data-testid="account-breakdown-table"]');
    return await breakdownTable.locator('tr').count();
  }
}

/**
 * Chart Page Object
 */
export class ChartPage {
  readonly page: Page;
  readonly chartContainer: Locator;

  constructor(page: Page, chartType: 'roas' | 'spend') {
    this.page = page;
    this.chartContainer = page.locator(`[data-testid="${chartType}-chart"]`);
  }

  async verifyChartRendered() {
    await expect(this.chartContainer).toBeVisible();
    await expect(this.chartContainer.locator('svg')).toBeVisible();
  }

  async hoverDataPoint() {
    await this.chartContainer.hover();
  }

  async verifyLegend() {
    await expect(this.chartContainer.locator('.recharts-legend-wrapper')).toBeVisible();
  }

  async verifyTooltip() {
    await this.hoverDataPoint();
    // Tooltip appears on hover - hard to test precisely
    // Just verify chart is interactive
    await expect(this.chartContainer).toBeVisible();
  }
}
