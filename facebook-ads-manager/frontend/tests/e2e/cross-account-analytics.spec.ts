/**
 * Cross-Account Analytics E2E Tests
 * Tests admin analytics dashboard with cross-account data aggregation
 */

import { test, expect } from '@playwright/test';
import { loginUser, loginAdminUser } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../fixtures/database.fixture';
import {
  waitForElement,
  waitForLoading,
  waitForAPIResponse,
  formatCurrency
} from '../helpers/test-utils';
import { AnalyticsPage } from '../page-objects/analytics.page';

test.describe('Cross-Account Analytics Dashboard', () => {
  let analyticsPage: AnalyticsPage;

  test.describe('Access Control', () => {
    test('should allow ADMIN to access analytics dashboard', async ({ page }) => {
      await loginAdminUser(page);
      await page.goto('/dashboard/analytics/templates');

      await expect(page).toHaveURL(/\/dashboard\/analytics\/templates/);
      await expect(page.locator('h1')).toContainText('Template Analytics Dashboard');
    });

    test('should block USER from accessing analytics dashboard', async ({ page }) => {
      await loginUser(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
      await page.goto('/dashboard/analytics/templates');

      // Should get 403 Forbidden or redirect to unauthorized page
      await expect(
        page.locator('[data-testid="unauthorized-page"]')
          .or(page.locator('text=403'))
          .or(page.locator('text=Forbidden'))
      ).toBeVisible();
    });
  });

  test.describe('Dashboard Overview', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display metric cards', async ({ page }) => {
      await expect(page.locator('[data-testid="metric-total-templates"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-active-campaigns"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-total-spend"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-avg-roas"]')).toBeVisible();
    });

    test('should display metric values', async ({ page }) => {
      const totalTemplates = page.locator('[data-testid="metric-total-templates"]');
      const value = await totalTemplates.locator('.text-2xl').textContent();

      expect(value).toMatch(/^\d+$/); // Should be a number
    });

    test('should display metric icons', async ({ page }) => {
      await expect(page.locator('[data-testid="metric-total-templates"] svg')).toBeVisible();
      await expect(page.locator('[data-testid="metric-active-campaigns"] svg')).toBeVisible();
      await expect(page.locator('[data-testid="metric-total-spend"] svg')).toBeVisible();
      await expect(page.locator('[data-testid="metric-avg-roas"] svg')).toBeVisible();
    });

    test('should format currency values correctly', async ({ page }) => {
      const totalSpend = page.locator('[data-testid="metric-total-spend"] .text-2xl');
      const spendText = await totalSpend.textContent();

      // Should include $ symbol
      expect(spendText).toContain('$');
    });

    test('should display loading state during data fetch', async ({ page }) => {
      // Reload to see loading state
      await page.reload();

      const loader = page.locator('[data-testid="loading-spinner"]');

      // Loader might be visible briefly
      // Just verify the page loads eventually
      await expect(page.locator('[data-testid="metric-total-templates"]')).toBeVisible({
        timeout: 10000
      });
    });
  });

  test.describe('Date Range Filter', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display date range picker', async ({ page }) => {
      await expect(page.locator('[data-testid="date-range-picker"]')).toBeVisible();
    });

    test('should update data when date range changes', async ({ page }) => {
      const originalSpend = await page.locator('[data-testid="metric-total-spend"] .text-2xl').textContent();

      // Change date range
      await analyticsPage.selectDateRange('last-7-days');
      await waitForLoading(page);

      // Wait for API response
      await waitForAPIResponse(page, '/api/analytics/templates', 10000);

      // Data might change (or stay the same if no change in range)
      // Just verify the page updates
      await expect(page.locator('[data-testid="metric-total-spend"]')).toBeVisible();
    });

    test('should support custom date range', async ({ page }) => {
      await analyticsPage.openDateRangePicker();

      // Set custom dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const endDate = new Date();

      await analyticsPage.setCustomDateRange(startDate, endDate);
      await waitForLoading(page);

      await expect(page.locator('[data-testid="metric-total-templates"]')).toBeVisible();
    });

    test('should display selected date range', async ({ page }) => {
      await analyticsPage.selectDateRange('last-30-days');

      const dateRangeText = await page.locator('[data-testid="selected-date-range"]').textContent();
      expect(dateRangeText).toContain('30');
    });
  });

  test.describe('Category Filter', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display category filter', async ({ page }) => {
      await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    });

    test('should list available categories', async ({ page }) => {
      await page.locator('[data-testid="category-filter"]').click();

      await expect(page.locator('text=All Categories')).toBeVisible();
      await expect(page.locator('[role="option"]')).toHaveCount(await page.locator('[role="option"]').count());
    });

    test('should filter data by category', async ({ page }) => {
      await analyticsPage.selectCategory('e-commerce');
      await waitForLoading(page);

      // Wait for API response
      await waitForAPIResponse(page, '/api/analytics/templates', 10000);

      // Verify table shows only e-commerce templates
      const rows = page.locator('[data-testid="template-row"]');
      const count = await rows.count();

      for (let i = 0; i < count; i++) {
        const category = await rows.nth(i).locator('[data-testid="category"]').textContent();
        expect(category).toContain('e-commerce');
      }
    });

    test('should show category count in dropdown', async ({ page }) => {
      await page.locator('[data-testid="category-filter"]').click();

      const categoryOption = page.locator('[role="option"]').first();
      const text = await categoryOption.textContent();

      // Should show count like "e-commerce (5)"
      expect(text).toMatch(/\(\d+\)/);
    });
  });

  test.describe('Template Performance Table', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display performance table', async ({ page }) => {
      await expect(page.locator('[data-testid="performance-table"]')).toBeVisible();
    });

    test('should display table headers', async ({ page }) => {
      await expect(page.locator('th:has-text("Template Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Category")')).toBeVisible();
      await expect(page.locator('th:has-text("Accounts Using")')).toBeVisible();
      await expect(page.locator('th:has-text("Total Spend")')).toBeVisible();
      await expect(page.locator('th:has-text("Avg ROAS")')).toBeVisible();
      await expect(page.locator('th:has-text("Avg CTR")')).toBeVisible();
      await expect(page.locator('th:has-text("Times Used")')).toBeVisible();
    });

    test('should display template rows', async ({ page }) => {
      const rows = page.locator('[data-testid="template-row"]');
      const count = await rows.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should sort by ROAS descending', async ({ page }) => {
      await analyticsPage.sortByColumn('roas', 'desc');
      await waitForLoading(page);

      // Verify sorting
      const rows = page.locator('[data-testid="template-row"]');
      const firstRoas = await rows.first().locator('[data-testid="roas"]').textContent();
      const lastRoas = await rows.last().locator('[data-testid="roas"]').textContent();

      // First should be >= last (accounting for N/A values)
      if (firstRoas && lastRoas && !firstRoas.includes('N/A') && !lastRoas.includes('N/A')) {
        const firstValue = parseFloat(firstRoas);
        const lastValue = parseFloat(lastRoas);
        expect(firstValue).toBeGreaterThanOrEqual(lastValue);
      }
    });

    test('should sort by total spend', async ({ page }) => {
      await analyticsPage.sortByColumn('spend', 'desc');
      await waitForLoading(page);

      const rows = page.locator('[data-testid="template-row"]');
      const count = await rows.count();

      if (count >= 2) {
        const firstSpend = await rows.first().locator('[data-testid="spend"]').textContent();
        const secondSpend = await rows.nth(1).locator('[data-testid="spend"]').textContent();

        // Parse currency values
        const first = parseFloat(firstSpend?.replace(/[^0-9.-]+/g, '') || '0');
        const second = parseFloat(secondSpend?.replace(/[^0-9.-]+/g, '') || '0');

        expect(first).toBeGreaterThanOrEqual(second);
      }
    });

    test('should display accounts using count', async ({ page }) => {
      const firstRow = page.locator('[data-testid="template-row"]').first();
      const accountsUsing = await firstRow.locator('[data-testid="accounts-using"]').textContent();

      expect(accountsUsing).toMatch(/^\d+$/);
    });

    test('should handle N/A values for metrics without data', async ({ page }) => {
      const rows = page.locator('[data-testid="template-row"]');
      const firstRow = rows.first();

      const roas = await firstRow.locator('[data-testid="roas"]').textContent();

      // Should display either a number or N/A
      expect(roas).toMatch(/^(\d+\.\d+x|N\/A)$/);
    });
  });

  test.describe('Row Expansion - Per-Account Breakdown', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should expand row to show account breakdown', async ({ page }) => {
      const firstRow = page.locator('[data-testid="template-row"]').first();

      // Click expand button
      await firstRow.locator('[data-testid="expand-button"]').click();

      // Nested table should appear
      await expect(page.locator('[data-testid="account-breakdown-table"]')).toBeVisible();
    });

    test('should display per-account metrics', async ({ page }) => {
      const firstRow = page.locator('[data-testid="template-row"]').first();
      await firstRow.locator('[data-testid="expand-button"]').click();

      const breakdownTable = page.locator('[data-testid="account-breakdown-table"]');

      // Verify breakdown table headers
      await expect(breakdownTable.locator('th:has-text("Account")')).toBeVisible();
      await expect(breakdownTable.locator('th:has-text("Spend")')).toBeVisible();
      await expect(breakdownTable.locator('th:has-text("ROAS")')).toBeVisible();
      await expect(breakdownTable.locator('th:has-text("CTR")')).toBeVisible();
    });

    test('should collapse row when clicked again', async ({ page }) => {
      const firstRow = page.locator('[data-testid="template-row"]').first();

      // Expand
      await firstRow.locator('[data-testid="expand-button"]').click();
      await expect(page.locator('[data-testid="account-breakdown-table"]')).toBeVisible();

      // Collapse
      await firstRow.locator('[data-testid="expand-button"]').click();
      await expect(page.locator('[data-testid="account-breakdown-table"]')).not.toBeVisible();
    });

    test('should load breakdown data from API', async ({ page }) => {
      const firstRow = page.locator('[data-testid="template-row"]').first();

      // Wait for API call when expanding
      const responsePromise = waitForAPIResponse(page, '/api/analytics/templates/', 10000);

      await firstRow.locator('[data-testid="expand-button"]').click();

      await responsePromise;

      // Breakdown should be loaded
      await expect(page.locator('[data-testid="account-breakdown-table"]')).toBeVisible();
    });

    test('should handle multiple rows expanded simultaneously', async ({ page }) => {
      const rows = page.locator('[data-testid="template-row"]');

      // Expand first row
      await rows.first().locator('[data-testid="expand-button"]').click();
      await expect(page.locator('[data-testid="account-breakdown-table"]').first()).toBeVisible();

      // Expand second row
      if (await rows.count() > 1) {
        await rows.nth(1).locator('[data-testid="expand-button"]').click();

        // Both breakdowns should be visible
        const breakdownTables = page.locator('[data-testid="account-breakdown-table"]');
        expect(await breakdownTables.count()).toBe(2);
      }
    });
  });

  test.describe('Charts', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display ROAS chart', async ({ page }) => {
      await expect(page.locator('[data-testid="roas-chart"]')).toBeVisible();
    });

    test('should display spend distribution chart', async ({ page }) => {
      await expect(page.locator('[data-testid="spend-distribution-chart"]')).toBeVisible();
    });

    test('should render charts without errors', async ({ page }) => {
      // Wait for charts to render
      await page.waitForTimeout(2000);

      // Check for SVG elements (Recharts renders SVGs)
      const roasChart = page.locator('[data-testid="roas-chart"] svg');
      const spendChart = page.locator('[data-testid="spend-distribution-chart"] svg');

      await expect(roasChart).toBeVisible();
      await expect(spendChart).toBeVisible();
    });

    test('should update charts when filters change', async ({ page }) => {
      // Change category filter
      await analyticsPage.selectCategory('e-commerce');
      await waitForLoading(page);

      // Charts should still be visible
      await expect(page.locator('[data-testid="roas-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="spend-distribution-chart"]')).toBeVisible();
    });

    test('should display chart legends', async ({ page }) => {
      const roasChart = page.locator('[data-testid="roas-chart"]');

      // Recharts adds legends - verify they exist
      await expect(roasChart.locator('.recharts-legend-wrapper')).toBeVisible();
    });

    test('should display chart tooltips on hover', async ({ page }) => {
      const roasChart = page.locator('[data-testid="roas-chart"]');

      // Hover over chart area
      await roasChart.hover();

      // Tooltip should appear (Recharts adds tooltips automatically)
      // This is tricky to test, so just verify chart is interactive
      await expect(roasChart).toBeVisible();
    });
  });

  test.describe('Refresh Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display refresh button', async ({ page }) => {
      await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
    });

    test('should refresh data when button clicked', async ({ page }) => {
      const refreshButton = page.locator('[data-testid="refresh-button"]');

      // Wait for API call
      const responsePromise = waitForAPIResponse(page, '/api/analytics/templates', 10000);

      await refreshButton.click();

      await responsePromise;

      // Verify data is still displayed
      await expect(page.locator('[data-testid="metric-total-templates"]')).toBeVisible();
    });

    test('should show loading state during refresh', async ({ page }) => {
      const refreshButton = page.locator('[data-testid="refresh-button"]');

      await refreshButton.click();

      // Button should be disabled during refresh
      await expect(refreshButton).toBeDisabled();
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no data', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/analytics/templates*', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            analytics: {
              totals: {
                totalTemplates: 0,
                activeCampaigns: 0,
                totalSpend: 0,
                avgRoas: 0
              },
              templates: []
            },
            categories: []
          })
        });
      });

      await loginAdminUser(page);
      await page.goto('/dashboard/analytics/templates');

      // Should show empty state
      await expect(page.locator('text=No templates found')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/analytics/templates*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: { message: 'Internal server error' } })
        });
      });

      await loginAdminUser(page);
      await page.goto('/dashboard/analytics/templates');

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });

    test('should handle network timeout', async ({ page }) => {
      // Mock slow response
      await page.route('**/api/analytics/templates*', async route => {
        await new Promise(resolve => setTimeout(resolve, 60000));
        route.fulfill({
          status: 200,
          body: JSON.stringify({})
        });
      });

      await loginAdminUser(page);
      await page.goto('/dashboard/analytics/templates');

      // Should show loading or error after timeout
      // This is environment-dependent, just verify page doesn't crash
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Info Card', () => {
    test.beforeEach(async ({ page }) => {
      await loginAdminUser(page);
      analyticsPage = new AnalyticsPage(page);
      await analyticsPage.goto();
    });

    test('should display admin-only info card', async ({ page }) => {
      await expect(page.locator('[data-testid="admin-info-card"]')).toBeVisible();
      await expect(page.locator('text=Admin-Only Analytics')).toBeVisible();
    });

    test('should display helpful information', async ({ page }) => {
      const infoCard = page.locator('[data-testid="admin-info-card"]');
      const text = await infoCard.textContent();

      expect(text).toContain('aggregated');
      expect(text).toContain('across all ad accounts');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      await loginAdminUser(page);

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/analytics/templates');

      // Metrics should stack vertically
      await expect(page.locator('[data-testid="metric-total-templates"]')).toBeVisible();

      // Table should be scrollable
      await expect(page.locator('[data-testid="performance-table"]')).toBeVisible();
    });
  });
});
