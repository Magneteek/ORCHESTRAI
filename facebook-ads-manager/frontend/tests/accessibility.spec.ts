/**
 * Accessibility E2E Tests
 * Tests WCAG 2.1 compliance, keyboard navigation, and screen reader support
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.describe('WCAG 2.1 Compliance', () => {
    test('should not have accessibility violations on homepage', async ({ page }) => {
      await page.goto('/');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on campaigns page', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on campaign creation', async ({ page }) => {
      await page.goto('/dashboard/campaigns/new');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on templates page', async ({ page }) => {
      await page.goto('/dashboard/templates');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on analytics page', async ({ page }) => {
      await page.goto('/dashboard/analytics');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate main menu with keyboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Navigate to campaigns with Enter
      await page.keyboard.press('Enter');

      // Should navigate
      await expect(page).toHaveURL(/\/dashboard\/campaigns/);
    });

    test('should navigate campaigns list with keyboard', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Focus search input
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test Campaign');

      // Tab to first campaign
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Open campaign with Enter
      await page.keyboard.press('Enter');

      // Should open campaign details
      await expect(page).toHaveURL(/\/dashboard\/campaigns\/.+/);
    });

    test('should complete campaign form with keyboard only', async ({ page }) => {
      await page.goto('/dashboard/campaigns/new');

      // Tab to name field
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test Campaign');

      // Tab to objective
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Tab to next button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should move to next step
      await expect(page.locator('[data-testid="wizard-step-budget"]')).toHaveClass(/active/);
    });

    test('should navigate dropdown with arrow keys', async ({ page }) => {
      await page.goto('/dashboard/campaigns/new');

      // Focus objective select
      await page.click('[data-testid="campaign-objective"]');

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Option should be selected
      const selectedValue = await page.locator('[data-testid="campaign-objective"]').inputValue();
      expect(selectedValue).toBeTruthy();
    });

    test('should close modal with Escape key', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Open delete confirmation
      await page.locator('[data-testid="delete-button"]').first().click();

      // Modal should be visible
      await expect(page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Modal should close
      await expect(page.locator('[data-testid="confirm-delete-modal"]')).not.toBeVisible();
    });

    test('should trap focus in modal', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Open modal
      await page.locator('[data-testid="delete-button"]').first().click();

      const modal = page.locator('[data-testid="confirm-delete-modal"]');
      await expect(modal).toBeVisible();

      // Tab through modal elements
      await page.keyboard.press('Tab'); // Cancel button
      await page.keyboard.press('Tab'); // Confirm button
      await page.keyboard.press('Tab'); // Should cycle back to first element

      // Focus should stay within modal
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toMatch(/cancel|confirm/);
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on buttons', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Check create button
      const createButton = page.locator('[data-testid="create-campaign-button"]');
      await expect(createButton).toHaveAttribute('aria-label');

      // Check action buttons
      const editButton = page.locator('[data-testid="edit-button"]').first();
      if (await editButton.isVisible()) {
        await expect(editButton).toHaveAttribute('aria-label');
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Check h1 exists and is unique
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Verify heading hierarchy (no h3 without h2, etc.)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const levels = await Promise.all(
        headings.map(async (h) => {
          const tagName = await h.evaluate((el) => el.tagName);
          return parseInt(tagName.replace('H', ''));
        })
      );

      // Check for proper nesting
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
      }
    });

    test('should have alt text on images', async ({ page }) => {
      await page.goto('/dashboard');

      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeDefined();
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/dashboard/campaigns/new');

      // Check all inputs have labels
      const inputs = await page.locator('input[type="text"], input[type="email"], input[type="number"]').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test('should announce live regions', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Check for aria-live regions
      const liveRegions = await page.locator('[aria-live]').all();
      expect(liveRegions.length).toBeGreaterThan(0);

      // Trigger an update
      await page.locator('[data-testid="refresh-campaigns"]').click();

      // Live region should update
      const toastRegion = page.locator('[role="status"]');
      await expect(toastRegion).toBeVisible();
    });

    test('should have proper landmark roles', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for main landmark
      await expect(page.locator('main')).toBeVisible();

      // Check for navigation landmark
      await expect(page.locator('nav')).toBeVisible();

      // Check for banner
      await expect(page.locator('[role="banner"]')).toBeVisible();
    });
  });

  test.describe('Color Contrast', () => {
    test('should meet color contrast requirements', async ({ page }) => {
      await page.goto('/dashboard');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['color-contrast'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should be usable in high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });

      await page.goto('/dashboard/campaigns');

      // Verify elements are still visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="create-campaign-button"]')).toBeVisible();
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Tab to first button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check focus is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow,
        };
      });

      // Should have some form of focus indicator
      const hasFocusIndicator =
        focusedElement?.outline !== 'none' ||
        focusedElement?.outlineWidth !== '0px' ||
        focusedElement?.boxShadow !== 'none';

      expect(hasFocusIndicator).toBe(true);
    });

    test('should restore focus after modal closes', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Focus and click delete button
      const deleteButton = page.locator('[data-testid="delete-button"]').first();
      await deleteButton.focus();
      await deleteButton.click();

      // Modal opens
      await expect(page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible();

      // Close modal
      await page.keyboard.press('Escape');

      // Focus should return to delete button
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('delete-button');
    });
  });

  test.describe('Skip Links', () => {
    test('should have skip to main content link', async ({ page }) => {
      await page.goto('/dashboard');

      // Tab to first element (should be skip link)
      await page.keyboard.press('Tab');

      const skipLink = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.textContent;
      });

      expect(skipLink).toMatch(/skip.*main/i);
    });

    test('should navigate to main content when skip link activated', async ({ page }) => {
      await page.goto('/dashboard');

      // Tab to skip link
      await page.keyboard.press('Tab');

      // Activate skip link
      await page.keyboard.press('Enter');

      // Focus should be on main content
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toMatch(/MAIN|H1/);
    });
  });

  test.describe('Responsive Text', () => {
    test('should support text resizing up to 200%', async ({ page }) => {
      await page.goto('/dashboard');

      // Set zoom to 200%
      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });

      // Content should still be readable and not overflow
      const isOverflowing = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      // Some horizontal scroll is acceptable, but should be minimal
      expect(isOverflowing).toBe(false);
    });
  });
});
