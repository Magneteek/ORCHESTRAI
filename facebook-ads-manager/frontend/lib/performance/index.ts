/**
 * Performance Library Index
 *
 * Central export for all performance monitoring utilities
 */

export {
  initWebVitals,
  getSessionMetrics,
  reportCustomMetric,
  markPerformance,
  measurePerformance,
} from './web-vitals';

export {
  PERFORMANCE_BUDGETS,
  monitorResourceTiming,
  calculateResourceSizes,
  checkPerformanceBudgets,
  monitorLongTasks,
  monitorLayoutShifts,
  getMemoryUsage,
  getNetworkInformation,
  monitorFirstInputDelay,
  getNavigationTiming,
  createPerformanceReport,
  logPerformanceReport,
  exportPerformanceData,
} from './monitoring';
