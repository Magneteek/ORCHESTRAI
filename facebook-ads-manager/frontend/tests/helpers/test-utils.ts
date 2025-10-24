/**
 * Test Utilities
 * Common helpers for Playwright tests
 */

import { Page, expect, Locator } from '@playwright/test';

/**
 * Wait for element to be visible and stable
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number }
): Promise<Locator> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: options?.timeout || 10000 });
  return element;
}

/**
 * Fill form field with proper waits
 */
export async function fillField(page: Page, selector: string, value: string) {
  const field = await waitForElement(page, selector);
  await field.clear();
  await field.fill(value);
  await page.waitForTimeout(100);
}

/**
 * Click element with retry logic
 */
export async function clickElement(page: Page, selector: string, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const element = await waitForElement(page, selector);
      await element.click();
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Wait for multiple API responses
 */
export async function waitForMultipleAPIs(
  page: Page,
  patterns: (string | RegExp)[],
  timeout: number = 10000
) {
  const promises = patterns.map((pattern) => waitForAPIResponse(page, pattern, timeout));
  return await Promise.all(promises);
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Verify toast notification
 */
export async function verifyToast(page: Page, message: string, type?: 'success' | 'error' | 'info') {
  const toast = page.locator('[data-testid="toast"]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(message);

  if (type) {
    await expect(toast).toHaveAttribute('data-type', type);
  }
}

/**
 * Wait for loading to complete
 */
export async function waitForLoading(page: Page) {
  const loader = page.locator('[data-testid="loading"]');
  await loader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // Loader might not exist, that's okay
  });
}

/**
 * Verify table row count
 */
export async function verifyTableRowCount(
  page: Page,
  selector: string,
  expectedCount: number
) {
  const rows = await page.locator(selector).count();
  expect(rows).toBe(expectedCount);
}

/**
 * Get table cell value
 */
export async function getTableCellValue(
  page: Page,
  rowIndex: number,
  columnIndex: number
): Promise<string> {
  const cell = page.locator(`table tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`);
  return await cell.textContent() || '';
}

/**
 * Verify pagination
 */
export async function verifyPagination(
  page: Page,
  currentPage: number,
  totalPages: number
) {
  const pagination = page.locator('[data-testid="pagination"]');
  await expect(pagination).toBeVisible();
  await expect(pagination.locator('[data-testid="current-page"]')).toContainText(
    currentPage.toString()
  );
  await expect(pagination.locator('[data-testid="total-pages"]')).toContainText(
    totalPages.toString()
  );
}

/**
 * Navigate to page number
 */
export async function goToPage(page: Page, pageNumber: number) {
  const pageButton = page.locator(`[data-testid="page-${pageNumber}"]`);
  await pageButton.click();
  await waitForLoading(page);
}

/**
 * Verify form validation error
 */
export async function verifyValidationError(
  page: Page,
  fieldName: string,
  expectedError: string
) {
  const error = page.locator(`[data-testid="${fieldName}-error"]`);
  await expect(error).toBeVisible();
  await expect(error).toContainText(expectedError);
}

/**
 * Clear form validation errors
 */
export async function clearValidationErrors(page: Page) {
  const errors = page.locator('[data-testid*="-error"]');
  const count = await errors.count();
  for (let i = 0; i < count; i++) {
    const error = errors.nth(i);
    if (await error.isVisible()) {
      const fieldName = (await error.getAttribute('data-testid'))?.replace('-error', '');
      if (fieldName) {
        await fillField(page, `[name="${fieldName}"]`, '');
      }
    }
  }
}

/**
 * Verify URL contains path
 */
export async function verifyURL(page: Page, expectedPath: string | RegExp) {
  if (typeof expectedPath === 'string') {
    await expect(page).toHaveURL(new RegExp(expectedPath));
  } else {
    await expect(page).toHaveURL(expectedPath);
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, timeout: number = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Mock console errors
 */
export function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Verify no console errors
 */
export function verifyNoConsoleErrors(errors: string[]) {
  expect(errors).toHaveLength(0);
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${randomString(10)}@test.com`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}

/**
 * Wait for condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Condition not met within timeout');
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
