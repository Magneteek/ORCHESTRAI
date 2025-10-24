/**
 * AI Module Exports
 * Centralized exports for all AI functionality
 */

// Client and utilities
export {
  callClaude,
  parseClaudeJson,
  healthCheck,
  getTokenUsageStats,
} from './client';

// Performance Prediction
export {
  predictPerformance,
  evaluatePredictionAccuracy,
} from './performance-predictor';

// Anomaly Detection
export {
  detectAnomalies,
  getRecentAnomalies,
  calculateHistoricalStats,
  detectAnomaliesBatch,
} from './anomaly-detector';

// Copy Optimization
export {
  optimizeAdCopy,
  optimizeCopiesBatch,
  generateABTestVariants,
  analyzeABTestResults,
} from './copy-optimizer';

// Audience Insights
export {
  analyzeAudience,
  calculateSegmentScore,
  generateLookalikeRecommendations,
  analyzeBudgetAllocation,
  detectAudienceFatigue,
} from './audience-insights';

// Types
export type {
  PerformancePrediction,
  AnomalyDetectionResult,
  CopyOptimization,
  AudienceInsights,
  HistoricalPerformanceData,
  CampaignContext,
  AdCopyData,
  AudienceData,
  PerformancePredictionRequest,
  AnomalyDetectionRequest,
  CopyOptimizationRequest,
  AudienceInsightsRequest,
} from './types';
