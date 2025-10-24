/**
 * AI Insights E2E Tests
 * Tests AI-powered performance predictions and recommendations
 */

import { test, expect } from '@playwright/test';
import { mockFacebookAPI } from './fixtures/mock-facebook-api.fixture';

test.describe('AI Insights', () => {
  test.beforeEach(async ({ page }) => {
    await mockFacebookAPI(page);
  });

  test.describe('Performance Predictions', () => {
    test('should display AI performance predictions', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Should show insights page
      await expect(page.locator('h1')).toContainText('AI Insights');
      await expect(page.locator('[data-testid="predictions-section"]')).toBeVisible();
    });

    test('should show predicted performance metrics', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Wait for predictions to load
      await page.waitForSelector('[data-testid="prediction-card"]', { state: 'visible' });

      // Verify predictions are displayed
      await expect(page.locator('[data-testid="predicted-clicks"]')).toBeVisible();
      await expect(page.locator('[data-testid="predicted-conversions"]')).toBeVisible();
      await expect(page.locator('[data-testid="predicted-roas"]')).toBeVisible();
    });

    test('should display confidence scores', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Wait for predictions
      await page.waitForSelector('[data-testid="prediction-card"]');

      // Verify confidence scores
      const confidenceScore = page.locator('[data-testid="confidence-score"]').first();
      await expect(confidenceScore).toBeVisible();

      const scoreText = await confidenceScore.textContent();
      expect(scoreText).toMatch(/\d+%/); // Should show percentage
    });

    test('should show prediction trends', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Should show trend indicators
      await expect(page.locator('[data-testid="trend-up"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="prediction-chart"]')).toBeVisible();
    });
  });

  test.describe('Anomaly Detection', () => {
    test('should display anomaly alerts', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Navigate to anomalies tab
      await page.click('[data-testid="anomalies-tab"]');

      // Should show anomalies section
      await expect(page.locator('[data-testid="anomalies-section"]')).toBeVisible();
    });

    test('should categorize anomalies by severity', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="anomalies-tab"]');

      // Should show severity levels
      await expect(page.locator('[data-testid="severity-critical"]')).toBeVisible();
      await expect(page.locator('[data-testid="severity-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="severity-info"]')).toBeVisible();
    });

    test('should show anomaly details', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="anomalies-tab"]');

      // Click on first anomaly
      const anomalyCard = page.locator('[data-testid="anomaly-card"]').first();
      if (await anomalyCard.isVisible()) {
        await anomalyCard.click();

        // Should show anomaly details
        await expect(page.locator('[data-testid="anomaly-details"]')).toBeVisible();
        await expect(page.locator('[data-testid="anomaly-description"]')).toBeVisible();
        await expect(page.locator('[data-testid="anomaly-recommendation"]')).toBeVisible();
      }
    });

    test('should mark anomaly as resolved', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="anomalies-tab"]');

      // Click on first anomaly
      const anomalyCard = page.locator('[data-testid="anomaly-card"]').first();
      if (await anomalyCard.isVisible()) {
        await anomalyCard.click();

        // Mark as resolved
        await page.click('[data-testid="resolve-anomaly"]');

        // Should show confirmation
        await expect(page.locator('text=Anomaly marked as resolved')).toBeVisible();
      }
    });
  });

  test.describe('Copy Optimization', () => {
    test('should display ad copy recommendations', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Navigate to copy optimization tab
      await page.click('[data-testid="copy-optimization-tab"]');

      // Should show recommendations
      await expect(page.locator('[data-testid="copy-recommendations"]')).toBeVisible();
    });

    test('should generate copy suggestions', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="copy-optimization-tab"]');

      // Select campaign for optimization
      await page.click('[data-testid="select-campaign"]');
      await page.click('[data-testid="campaign-option"]').first();

      // Click generate suggestions
      await page.click('[data-testid="generate-suggestions"]');

      // Should show loading state
      await expect(page.locator('[data-testid="generating-suggestions"]')).toBeVisible();

      // Wait for suggestions to generate
      await page.waitForSelector('[data-testid="copy-suggestion"]', {
        state: 'visible',
        timeout: 15000
      });

      // Verify suggestions are displayed
      const suggestions = page.locator('[data-testid="copy-suggestion"]');
      const count = await suggestions.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should apply copy suggestion', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="copy-optimization-tab"]');

      // Generate suggestions first
      await page.click('[data-testid="select-campaign"]');
      await page.click('[data-testid="campaign-option"]').first();
      await page.click('[data-testid="generate-suggestions"]');

      // Wait for suggestions
      await page.waitForSelector('[data-testid="copy-suggestion"]', { timeout: 15000 });

      // Apply first suggestion
      const applySuggestion = page.locator('[data-testid="apply-suggestion"]').first();
      if (await applySuggestion.isVisible()) {
        await applySuggestion.click();

        // Should show confirmation
        await expect(page.locator('text=Copy applied successfully')).toBeVisible();
      }
    });

    test('should show A/B test recommendations', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="copy-optimization-tab"]');

      // Should show A/B test section
      await expect(page.locator('[data-testid="ab-test-recommendations"]')).toBeVisible();
    });
  });

  test.describe('Audience Insights', () => {
    test('should display audience analytics', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Navigate to audience tab
      await page.click('[data-testid="audience-tab"]');

      // Should show audience insights
      await expect(page.locator('[data-testid="audience-insights"]')).toBeVisible();
    });

    test('should show demographic breakdown', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="audience-tab"]');

      // Should show demographics
      await expect(page.locator('[data-testid="age-breakdown"]')).toBeVisible();
      await expect(page.locator('[data-testid="gender-breakdown"]')).toBeVisible();
      await expect(page.locator('[data-testid="location-breakdown"]')).toBeVisible();
    });

    test('should display interest categories', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="audience-tab"]');

      // Should show interests
      await expect(page.locator('[data-testid="interest-categories"]')).toBeVisible();
    });

    test('should recommend audience expansion', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="audience-tab"]');

      // Should show expansion recommendations
      await expect(page.locator('[data-testid="expansion-recommendations"]')).toBeVisible();
    });

    test('should visualize audience overlap', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="audience-tab"]');

      // Select campaigns to compare
      await page.click('[data-testid="compare-audiences"]');
      await page.click('[data-testid="campaign-1"]');
      await page.click('[data-testid="campaign-2"]');

      // Should show overlap visualization
      await expect(page.locator('[data-testid="audience-overlap-chart"]')).toBeVisible();
    });
  });

  test.describe('Budget Optimization', () => {
    test('should display budget recommendations', async ({ page }) => {
      await page.goto('/dashboard/insights');

      // Navigate to budget tab
      await page.click('[data-testid="budget-tab"]');

      // Should show budget recommendations
      await expect(page.locator('[data-testid="budget-recommendations"]')).toBeVisible();
    });

    test('should show optimal budget allocation', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="budget-tab"]');

      // Should show allocation chart
      await expect(page.locator('[data-testid="budget-allocation-chart"]')).toBeVisible();
    });

    test('should simulate budget changes', async ({ page }) => {
      await page.goto('/dashboard/insights');
      await page.click('[data-testid="budget-tab"]');

      // Adjust budget slider
      const budgetSlider = page.locator('[data-testid="budget-simulator"]');
      await budgetSlider.fill('1000');

      // Should show predicted impact
      await expect(page.locator('[data-testid="predicted-impact"]')).toBeVisible();
    });
  });

  test.describe('Performance Alerts', () => {
    test('should configure performance alerts', async ({ page }) => {
      await page.goto('/dashboard/insights/alerts');

      // Should show alerts configuration
      await expect(page.locator('[data-testid="alerts-config"]')).toBeVisible();
    });

    test('should create new alert', async ({ page }) => {
      await page.goto('/dashboard/insights/alerts');

      // Click create alert
      await page.click('[data-testid="create-alert"]');

      // Fill alert details
      await page.fill('[data-testid="alert-name"]', 'High Spend Alert');
      await page.selectOption('[data-testid="alert-metric"]', 'spend');
      await page.fill('[data-testid="alert-threshold"]', '1000');

      // Save alert
      await page.click('[data-testid="save-alert"]');

      // Should show success message
      await expect(page.locator('text=Alert created successfully')).toBeVisible();
    });

    test('should display active alerts', async ({ page }) => {
      await page.goto('/dashboard/insights/alerts');

      // Should show active alerts list
      await expect(page.locator('[data-testid="active-alerts"]')).toBeVisible();
    });
  });
});
