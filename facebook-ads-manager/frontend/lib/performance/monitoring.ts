/**
 * Performance Monitoring and Budgets
 *
 * Monitors bundle sizes, load times, and enforces performance budgets
 */

type PerformanceBudget = {
  metric: string;
  budget: number;
  current?: number;
  status?: 'pass' | 'warn' | 'fail';
};

type ResourceTiming = {
  name: string;
  duration: number;
  size: number;
  type: string;
};

/**
 * Performance budgets for the application
 */
export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { metric: 'Total JavaScript', budget: 300 * 1024 }, // 300KB gzipped
  { metric: 'Total CSS', budget: 50 * 1024 }, // 50KB gzipped
  { metric: 'Total Images', budget: 500 * 1024 }, // 500KB
  { metric: 'First Load JS', budget: 200 * 1024 }, // 200KB
  { metric: 'LCP', budget: 2500 }, // 2.5s
  { metric: 'FID', budget: 100 }, // 100ms
  { metric: 'CLS', budget: 0.1 }, // 0.1
  { metric: 'TTI', budget: 3800 }, // 3.8s
];

/**
 * Monitor resource loading performance
 */
export function monitorResourceTiming(): ResourceTiming[] {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return [];
  }

  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return resources.map((resource) => {
      const type = getResourceType(resource.name);
      return {
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type,
      };
    });
  } catch (error) {
    console.error('Failed to monitor resource timing:', error);
    return [];
  }
}

/**
 * Get resource type from URL
 */
function getResourceType(url: string): string {
  if (url.endsWith('.js')) return 'script';
  if (url.endsWith('.css')) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
  return 'other';
}

/**
 * Calculate total size by resource type
 */
export function calculateResourceSizes(): Record<string, number> {
  const resources = monitorResourceTiming();

  const sizes: Record<string, number> = {
    script: 0,
    stylesheet: 0,
    image: 0,
    font: 0,
    other: 0,
    total: 0,
  };

  resources.forEach((resource) => {
    sizes[resource.type] = (sizes[resource.type] || 0) + resource.size;
    sizes.total += resource.size;
  });

  return sizes;
}

/**
 * Check performance budget compliance
 */
export function checkPerformanceBudgets(
  metrics: Record<string, number>
): PerformanceBudget[] {
  return PERFORMANCE_BUDGETS.map((budget) => {
    const current = metrics[budget.metric] || 0;
    const percentage = (current / budget.budget) * 100;

    let status: 'pass' | 'warn' | 'fail';
    if (percentage <= 90) status = 'pass';
    else if (percentage <= 110) status = 'warn';
    else status = 'fail';

    return {
      ...budget,
      current,
      status,
    };
  });
}

/**
 * Monitor long tasks (blocking the main thread)
 */
export function monitorLongTasks(callback: (duration: number) => void): void {
  if (typeof window === 'undefined') return;

  try {
    // @ts-ignore - PerformanceObserver for longtask
    if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          callback(entry.duration);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  } catch (error) {
    console.error('Failed to monitor long tasks:', error);
  }
}

/**
 * Monitor layout shifts
 */
export function monitorLayoutShifts(callback: (shift: number) => void): void {
  if (typeof window === 'undefined') return;

  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ('value' in entry) {
            callback((entry as any).value);
          }
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    }
  } catch (error) {
    console.error('Failed to monitor layout shifts:', error);
  }
}

/**
 * Monitor memory usage
 */
export function getMemoryUsage(): Record<string, number> | null {
  if (typeof window === 'undefined') return null;

  try {
    // @ts-ignore - Memory API
    if ('memory' in performance) {
      // @ts-ignore
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
  } catch (error) {
    console.error('Failed to get memory usage:', error);
  }

  return null;
}

/**
 * Monitor network information
 */
export function getNetworkInformation(): Record<string, any> | null {
  if (typeof navigator === 'undefined') return null;

  try {
    // @ts-ignore - Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
  } catch (error) {
    console.error('Failed to get network information:', error);
  }

  return null;
}

/**
 * Monitor First Input Delay
 */
export function monitorFirstInputDelay(callback: (delay: number) => void): void {
  if (typeof window === 'undefined') return;

  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore
          if (entry.processingStart && entry.startTime) {
            // @ts-ignore
            const delay = entry.processingStart - entry.startTime;
            callback(delay);
          }
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    }
  } catch (error) {
    console.error('Failed to monitor first input delay:', error);
  }
}

/**
 * Get navigation timing
 */
export function getNavigationTiming(): Record<string, number> | null {
  if (typeof window === 'undefined' || !('performance' in window)) return null;

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart,
    };
  } catch (error) {
    console.error('Failed to get navigation timing:', error);
    return null;
  }
}

/**
 * Create performance report
 */
export function createPerformanceReport(): Record<string, any> {
  return {
    resources: calculateResourceSizes(),
    navigation: getNavigationTiming(),
    memory: getMemoryUsage(),
    network: getNetworkInformation(),
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
  };
}

/**
 * Log performance report to console
 */
export function logPerformanceReport(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const report = createPerformanceReport();

  console.group('📊 Performance Report');
  console.log('Resources:', report.resources);
  console.log('Navigation:', report.navigation);
  console.log('Memory:', report.memory);
  console.log('Network:', report.network);
  console.groupEnd();
}

/**
 * Export performance data for analysis
 */
export function exportPerformanceData(): string {
  const report = createPerformanceReport();
  return JSON.stringify(report, null, 2);
}
