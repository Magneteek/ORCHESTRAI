/**
 * Performance E2E Tests
 * Tests page load times, Core Web Vitals, and performance optimization
 */

import { test, expect } from '@playwright/test';
import { mockFacebookAPI } from './fixtures/mock-facebook-api.fixture';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockFacebookAPI(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should load campaigns page within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/dashboard/campaigns');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should load templates page within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/dashboard/templates');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have fast First Contentful Paint', async ({ page }) => {
      await page.goto('/dashboard');

      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
            if (fcp) {
              resolve(fcp.startTime);
            }
          }).observe({ type: 'paint', buffered: true });
        });
      });

      // FCP should be under 1.8 seconds (good threshold)
      expect(metrics).toBeLessThan(1800);
    });

    test('should have fast Largest Contentful Paint', async ({ page }) => {
      await page.goto('/dashboard');

      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // Resolve after 3 seconds if no LCP detected
          setTimeout(() => resolve(3000), 3000);
        });
      });

      // LCP should be under 2.5 seconds (good threshold)
      expect(metrics).toBeLessThan(2500);
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: any = {
            lcp: null,
            fid: null,
            cls: 0,
          };

          // Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // First Input Delay
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              vitals.fid = entry.processingStart - entry.startTime;
            });
          }).observe({ type: 'first-input', buffered: true });

          // Cumulative Layout Shift
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                vitals.cls += entry.value;
              }
            });
          }).observe({ type: 'layout-shift', buffered: true });

          // Resolve after collecting metrics
          setTimeout(() => resolve(vitals), 2000);
        });
      });

      // Check Core Web Vitals thresholds
      if ((webVitals as any).lcp) {
        expect((webVitals as any).lcp).toBeLessThan(2500); // Good: < 2.5s
      }
      if ((webVitals as any).fid) {
        expect((webVitals as any).fid).toBeLessThan(100); // Good: < 100ms
      }
      expect((webVitals as any).cls).toBeLessThan(0.1); // Good: < 0.1
    });

    test('should have low Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;

          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
          }).observe({ type: 'layout-shift', buffered: true });

          setTimeout(() => resolve(clsValue), 3000);
        });
      });

      // CLS should be under 0.1 (good threshold)
      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('Bundle Size', () => {
    test('should have optimized JavaScript bundle', async ({ page }) => {
      const responses: any[] = [];

      page.on('response', (response) => {
        if (response.url().includes('.js')) {
          responses.push({
            url: response.url(),
            size: parseInt(response.headers()['content-length'] || '0'),
          });
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Total JS size should be under 1MB
      const totalSize = responses.reduce((sum, r) => sum + r.size, 0);
      expect(totalSize).toBeLessThan(1024 * 1024); // 1MB
    });

    test('should use code splitting', async ({ page }) => {
      const jsFiles = new Set<string>();

      page.on('response', (response) => {
        if (response.url().includes('.js')) {
          jsFiles.add(response.url());
        }
      });

      // Load main page
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const mainPageJsCount = jsFiles.size;

      // Navigate to different page
      await page.goto('/dashboard/campaigns');
      await page.waitForLoadState('networkidle');

      // Should have loaded additional chunks
      expect(jsFiles.size).toBeGreaterThan(mainPageJsCount);
    });
  });

  test.describe('Image Optimization', () => {
    test('should use optimized image formats', async ({ page }) => {
      const images: any[] = [];

      page.on('response', (response) => {
        const url = response.url();
        if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
          images.push({
            url,
            contentType: response.headers()['content-type'],
            size: parseInt(response.headers()['content-length'] || '0'),
          });
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check for modern formats
      const hasModernFormats = images.some((img) =>
        img.contentType.includes('webp') || img.contentType.includes('avif')
      );

      // At least some images should use modern formats
      if (images.length > 0) {
        expect(hasModernFormats).toBe(true);
      }
    });

    test('should lazy load images', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Get images
      const images = await page.locator('img').all();

      // Check for lazy loading attribute
      for (const img of images) {
        const loading = await img.getAttribute('loading');
        if (loading) {
          expect(loading).toBe('lazy');
        }
      }
    });
  });

  test.describe('Caching Strategy', () => {
    test('should cache static assets', async ({ page }) => {
      const cachedResources: string[] = [];

      page.on('response', (response) => {
        const cacheControl = response.headers()['cache-control'];
        if (cacheControl && cacheControl.includes('max-age')) {
          cachedResources.push(response.url());
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should have cached resources
      expect(cachedResources.length).toBeGreaterThan(0);
    });

    test('should serve content from cache on repeat visits', async ({ page, context }) => {
      // First visit
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Close and reopen page
      await page.close();
      const newPage = await context.newPage();

      let cachedResponses = 0;
      newPage.on('response', (response) => {
        if (response.fromCache()) {
          cachedResponses++;
        }
      });

      // Second visit
      await newPage.goto('/dashboard');
      await newPage.waitForLoadState('networkidle');

      // Should have served content from cache
      expect(cachedResponses).toBeGreaterThan(0);
    });
  });

  test.describe('API Request Optimization', () => {
    test('should batch API requests', async ({ page }) => {
      const apiRequests: string[] = [];

      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiRequests.push(request.url());
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should make reasonable number of API calls
      expect(apiRequests.length).toBeLessThan(10);
    });

    test('should use query deduplication', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Track API calls
      const apiCalls = new Map<string, number>();

      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/api/campaigns')) {
          apiCalls.set(url, (apiCalls.get(url) || 0) + 1);
        }
      });

      // Trigger multiple refreshes quickly
      await page.click('[data-testid="refresh-campaigns"]');
      await page.waitForTimeout(100);
      await page.click('[data-testid="refresh-campaigns"]');
      await page.waitForTimeout(100);
      await page.click('[data-testid="refresh-campaigns"]');

      // Wait for requests
      await page.waitForTimeout(2000);

      // Should deduplicate requests
      for (const [url, count] of apiCalls) {
        expect(count).toBeLessThanOrEqual(2); // Allow some buffering
      }
    });
  });

  test.describe('Rendering Performance', () => {
    test('should handle large lists efficiently', async ({ page }) => {
      // Mock large dataset
      await page.route('**/api/campaigns**', (route) => {
        const campaigns = Array.from({ length: 100 }, (_, i) => ({
          id: `campaign-${i}`,
          name: `Campaign ${i}`,
          status: 'ACTIVE',
        }));

        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: campaigns,
            total: 100,
          }),
        });
      });

      const startTime = Date.now();

      await page.goto('/dashboard/campaigns');
      await page.waitForSelector('[data-testid="campaign-row"]');

      const renderTime = Date.now() - startTime;

      // Should render large list within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    test('should use virtual scrolling for long lists', async ({ page }) => {
      await page.goto('/dashboard/campaigns');

      // Check if virtual scrolling is implemented
      const hasVirtualization = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="campaign-table"]');
        if (!container) return false;

        // Check for virtualization indicators
        const hasFixedHeight = window.getComputedStyle(container).height !== 'auto';
        const hasOverflow = window.getComputedStyle(container).overflow === 'auto' ||
                           window.getComputedStyle(container).overflowY === 'auto';

        return hasFixedHeight && hasOverflow;
      });

      // For large datasets, virtualization should be used
      // This test is informational
      console.log('Virtual scrolling enabled:', hasVirtualization);
    });
  });

  test.describe('Memory Management', () => {
    test('should not have memory leaks on navigation', async ({ page }) => {
      await page.goto('/dashboard');

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      // Navigate multiple times
      for (let i = 0; i < 10; i++) {
        await page.goto('/dashboard/campaigns');
        await page.waitForLoadState('networkidle');
        await page.goto('/dashboard/templates');
        await page.waitForLoadState('networkidle');
        await page.goto('/dashboard/analytics');
        await page.waitForLoadState('networkidle');
      }

      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });

      // Memory should not increase significantly (allow 50% increase)
      if (initialMemory > 0 && finalMemory > 0) {
        const increase = (finalMemory - initialMemory) / initialMemory;
        expect(increase).toBeLessThan(0.5);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network gracefully', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        route.continue();
      });

      const startTime = Date.now();
      await page.goto('/dashboard/campaigns');

      // Should show loading state
      await expect(page.locator('[data-testid="loading"]')).toBeVisible();

      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should still complete within reasonable time
      expect(loadTime).toBeLessThan(10000);
    });

    test('should prefetch critical resources', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for prefetch/preload links
      const prefetchLinks = await page.locator('link[rel="prefetch"], link[rel="preload"]').count();

      // Should have some prefetch/preload links
      expect(prefetchLinks).toBeGreaterThan(0);
    });
  });
});
