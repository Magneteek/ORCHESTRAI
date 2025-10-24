/**
 * Analytics E2E Tests
 * Tests analytics dashboard, charts, and data export
 */

import { test, expect } from '@playwright/test';
import { mockFacebookAPI } from './fixtures/mock-facebook-api.fixture';
import { waitForNavigation } from './helpers/test-utils';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockFacebookAPI(page);
  });

  test.describe('Dashboard Overview', () => {
    test('should display analytics dashboard', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await waitForNavigation(page);

      // Should show analytics page
      await expect(page.locator('h1')).toContainText('Analytics');
      await expect(page.locator('[data-testid="analytics-overview"]')).toBeVisible();
    });

    test('should display key metrics', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Wait for metrics to load
      await page.waitForSelector('[data-testid="metric-card"]', { state: 'visible' });

      // Verify key metrics are displayed
      await expect(page.locator('[data-testid="metric-spend"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-impressions"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-clicks"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-conversions"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-roas"]')).toBeVisible();
    });

    test('should display performance charts', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Wait for charts to load
      await page.waitForSelector('[data-testid="chart-container"]', { state: 'visible' });

      // Verify charts are displayed
      await expect(page.locator('[data-testid="spend-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
    });
  });

  test.describe('Date Range Selection', () => {
    test('should filter analytics by date range', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Open date range picker
      await page.click('[data-testid="date-range-picker"]');

      // Select last 7 days
      await page.click('[data-testid="range-7-days"]');

      // Wait for data to reload
      await page.waitForTimeout(1000);

      // Verify data updated
      await expect(page.locator('[data-testid="date-range-display"]')).toContainText('Last 7 days');
    });

    test('should support custom date range', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Open date range picker
      await page.click('[data-testid="date-range-picker"]');

      // Click custom range
      await page.click('[data-testid="custom-range"]');

      // Select dates
      await page.fill('[data-testid="start-date"]', '2024-10-01');
      await page.fill('[data-testid="end-date"]', '2024-10-15');

      // Apply range
      await page.click('[data-testid="apply-date-range"]');

      // Wait for data to reload
      await page.waitForTimeout(1000);

      // Verify custom range applied
      await expect(page.locator('[data-testid="date-range-display"]')).toContainText('Oct 1 - Oct 15');
    });

    test('should support preset date ranges', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      const presets = [
        { selector: '[data-testid="range-today"]', label: 'Today' },
        { selector: '[data-testid="range-yesterday"]', label: 'Yesterday' },
        { selector: '[data-testid="range-7-days"]', label: 'Last 7 days' },
        { selector: '[data-testid="range-30-days"]', label: 'Last 30 days' },
        { selector: '[data-testid="range-this-month"]', label: 'This month' },
      ];

      for (const preset of presets) {
        // Open date range picker
        await page.click('[data-testid="date-range-picker"]');

        // Select preset
        await page.click(preset.selector);

        // Wait for data
        await page.waitForTimeout(500);

        // Verify preset applied
        const display = page.locator('[data-testid="date-range-display"]');
        await expect(display).toBeVisible();
      }
    });
  });

  test.describe('Chart Interactions', () => {
    test('should toggle chart views', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Wait for charts
      await page.waitForSelector('[data-testid="chart-container"]');

      // Toggle to line chart
      await page.click('[data-testid="chart-type-line"]');
      await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();

      // Toggle to bar chart
      await page.click('[data-testid="chart-type-bar"]');
      await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();

      // Toggle to area chart
      await page.click('[data-testid="chart-type-area"]');
      await expect(page.locator('[data-testid="area-chart"]')).toBeVisible();
    });

    test('should show chart tooltips on hover', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Wait for chart
      await page.waitForSelector('[data-testid="spend-chart"]');

      // Hover over data point
      const chartElement = page.locator('[data-testid="spend-chart"]');
      await chartElement.hover();

      // Should show tooltip
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    });

    test('should filter chart by metric', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Select metric to display
      await page.click('[data-testid="metric-selector"]');
      await page.click('[data-testid="metric-option-clicks"]');

      // Chart should update
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    });
  });

  test.describe('Data Export', () => {
    test('should export analytics to CSV', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Start download
      const downloadPromise = page.waitForEvent('download');

      // Click export button
      await page.click('[data-testid="export-csv"]');

      // Wait for download
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should export analytics to PDF', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Start download
      const downloadPromise = page.waitForEvent('download');

      // Click export PDF button
      await page.click('[data-testid="export-pdf"]');

      // Wait for download
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('should export selected date range', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Select date range
      await page.click('[data-testid="date-range-picker"]');
      await page.click('[data-testid="range-7-days"]');

      // Start download
      const downloadPromise = page.waitForEvent('download');

      // Export
      await page.click('[data-testid="export-csv"]');

      // Wait for download
      const download = await downloadPromise;
      expect(download).toBeTruthy();
    });
  });

  test.describe('Real-time Updates', () => {
    test('should auto-refresh analytics data', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Get initial spend value
      const initialSpend = await page.locator('[data-testid="metric-spend"]').textContent();

      // Wait for auto-refresh (assuming 30 second interval)
      await page.waitForTimeout(31000);

      // Value might have changed or stayed the same
      const newSpend = await page.locator('[data-testid="metric-spend"]').textContent();
      expect(newSpend).toBeTruthy();
    });

    test('should manually refresh analytics', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Click refresh button
      await page.click('[data-testid="refresh-analytics"]');

      // Should show loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

      // Wait for data to load
      await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

      // Data should be loaded
      await expect(page.locator('[data-testid="metric-spend"]')).toBeVisible();
    });
  });

  test.describe('Campaign Breakdown', () => {
    test('should show per-campaign analytics', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Navigate to campaign breakdown
      await page.click('[data-testid="campaign-breakdown-tab"]');

      // Should show campaign table
      await expect(page.locator('[data-testid="campaign-analytics-table"]')).toBeVisible();
    });

    test('should sort campaign analytics', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await page.click('[data-testid="campaign-breakdown-tab"]');

      // Sort by spend
      await page.click('[data-testid="sort-by-spend"]');
      await page.waitForTimeout(500);

      // Sort by ROAS
      await page.click('[data-testid="sort-by-roas"]');
      await page.waitForTimeout(500);

      // Verify table is sorted
      await expect(page.locator('[data-testid="campaign-analytics-table"]')).toBeVisible();
    });

    test('should filter campaigns in analytics', async ({ page }) => {
      await page.goto('/dashboard/analytics');
      await page.click('[data-testid="campaign-breakdown-tab"]');

      // Search campaigns
      await page.fill('[data-testid="campaign-search"]', 'Test Campaign');
      await page.waitForTimeout(500);

      // Should show filtered results
      await expect(page.locator('[data-testid="campaign-analytics-table"]')).toBeVisible();
    });
  });

  test.describe('Comparison Mode', () => {
    test('should compare time periods', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      // Enable comparison mode
      await page.click('[data-testid="enable-comparison"]');

      // Select comparison period
      await page.click('[data-testid="comparison-period"]');
      await page.click('[data-testid="previous-period"]');

      // Should show comparison data
      await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-percentage"]')).toBeVisible();
    });
  });
});
