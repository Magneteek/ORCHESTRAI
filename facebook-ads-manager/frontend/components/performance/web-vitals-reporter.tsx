'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/performance';

/**
 * Web Vitals Reporter Component
 *
 * Initializes Core Web Vitals tracking on mount
 * Should be included in root layout
 */
export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}
