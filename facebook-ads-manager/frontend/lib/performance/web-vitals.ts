/**
 * Core Web Vitals Tracking
 *
 * Monitors and reports performance metrics:
 * - LCP (Largest Contentful Paint): <2.5s
 * - INP (Interaction to Next Paint): <200ms
 * - CLS (Cumulative Layout Shift): <0.1
 * - FCP (First Contentful Paint): <1.8s
 * - TTFB (Time to First Byte): <800ms
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
};

type PerformanceData = {
  metric: WebVitalsMetric;
  url: string;
  userAgent: string;
  timestamp: number;
  sessionId: string;
};

// Performance thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

/**
 * Get rating based on metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send metric to analytics endpoint
 */
async function sendToAnalytics(data: PerformanceData): Promise<void> {
  try {
    // Send to internal analytics
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/performance', blob);
    } else {
      // Fallback to fetch
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true,
      });
    }
  } catch (error) {
    // Silently fail - don't impact user experience
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to send performance metric:', error);
    }
  }
}

/**
 * Log metric to console in development
 */
function logMetric(metric: WebVitalsMetric): void {
  if (process.env.NODE_ENV === 'development') {
    const color =
      metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red';

    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

/**
 * Store metric in session storage for RUM dashboard
 */
function storeMetric(metric: WebVitalsMetric): void {
  if (typeof window === 'undefined') return;

  try {
    const sessionKey = 'web-vitals-session';
    const stored = sessionStorage.getItem(sessionKey);
    const metrics = stored ? JSON.parse(stored) : {};

    metrics[metric.name] = {
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(sessionKey, JSON.stringify(metrics));
  } catch (error) {
    // Silently fail if storage is unavailable
  }
}

/**
 * Generate or retrieve session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  try {
    const key = 'perf-session-id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Handle metric callback
 */
function handleMetric(metric: Metric): void {
  const webVitalsMetric: WebVitalsMetric = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType || 'unknown',
  };

  // Log in development
  logMetric(webVitalsMetric);

  // Store for RUM dashboard
  storeMetric(webVitalsMetric);

  // Send to analytics
  const performanceData: PerformanceData = {
    metric: webVitalsMetric,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  sendToAnalytics(performanceData);
}

/**
 * Initialize Core Web Vitals tracking
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  try {
    onCLS(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);

    // Log initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('%c[Web Vitals] Tracking initialized', 'color: blue; font-weight: bold;');
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to initialize Web Vitals:', error);
    }
  }
}

/**
 * Get current session metrics
 */
export function getSessionMetrics(): Record<string, any> | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem('web-vitals-session');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Report custom performance metric
 */
export function reportCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  try {
    const data = {
      metric: {
        name: `custom.${name}`,
        value,
        ...metadata,
      },
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: getSessionId(),
    };

    sendToAnalytics(data as any);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to report custom metric:', error);
    }
  }
}

/**
 * Mark performance measure
 */
export function markPerformance(name: string): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  try {
    performance.mark(name);
  } catch (error) {
    // Silently fail
  }
}

/**
 * Measure performance between marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];

    if (measure) {
      reportCustomMetric(name, measure.duration);
    }
  } catch (error) {
    // Silently fail
  }
}
