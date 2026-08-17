/**
 * TypeScript types for AI Analysis system
 */

import { z } from 'zod';

// ============ PERFORMANCE PREDICTION ============

export const PerformancePredictionSchema = z.object({
  predictions: z.array(z.object({
    date: z.string(),
    spend: z.number(),
    roas: z.number(),
    ctr: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    // Lead-gen campaigns forecast leads, not revenue. Without these the
    // forecast table showed "ROAS 0.00x" on every row while the actual
    // prediction ("9-12 leads") survived only as prose in the summary.
    conversions: z.number().optional(),
    cpa: z.number().optional(),
  })),
  confidence: z.number().min(0).max(1),
  /** One line on what drives the confidence figure, so it is not a bare number. */
  confidenceRationale: z.string().optional(),
  /**
   * Where the account lands if every recommendation is executed, stated once
   * and honestly. Per-item values overlap and must not be added up; this is
   * the only place a combined figure belongs.
   */
  combinedOutcome: z.string().optional(),
  factors: z.array(z.string()),
  recommendations: z.array(z.object({
    action: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    /** Quantified expected effect, e.g. "CPL EUR 15.68 -> EUR 9-12". */
    expectedEffect: z.string().optional(),
    /** The measurement that would confirm or kill it, and by when. */
    verifyBy: z.string().optional(),
    /**
     * Execution order, 1 = do first. Ranked by value against effort, not by
     * how interesting the finding is. Without this the list arrived as six
     * peers whose stated impact labels contradicted their own reasoning — a
     * "low impact" item recovering EUR 9/day outranked a "medium" one worth
     * nothing measurable.
     */
    priority: z.number().int().optional(),
    /** Realistic hands-on time, e.g. "10 minutes in Ads Manager". */
    effort: z.string().optional(),
    /** Money at stake per month, or why it cannot be quantified. */
    monthlyValue: z.string().optional(),
    /**
     * What the money figure means — these are not the same kind of number and
     * summing them is meaningless. Without this the list read as additive and
     * claimed more monthly value than the account spends.
     */
    valueBasis: z
      .enum(['recovered_spend', 'redirected_spend', 'avoided_loss', 'opportunity', 'not_quantifiable'])
      .optional(),
    /** How firm the evidence is, separate from how much money is at stake. */
    evidenceStrength: z.enum(['strong', 'moderate', 'speculative']).optional(),
    /** Priority number of the step that must happen first, if any. */
    dependsOn: z.number().int().nullable().optional(),
    /** Exactly where to make the change. */
    where: z.string().optional(),
  })),
  summary: z.string(),
});

export type PerformancePrediction = z.infer<typeof PerformancePredictionSchema>;

// ============ ANOMALY DETECTION ============

export const AnomalyDetectionSchema = z.object({
  anomalies: z.array(z.object({
    metric: z.string(),
    severity: z.enum(['minor', 'moderate', 'critical']),
    currentValue: z.number(),
    expectedValue: z.number(),
    deviation: z.number(),
    description: z.string(),
    likelyCauses: z.array(z.string()),
    recommendations: z.array(z.string()),
  })),
  overallStatus: z.enum(['healthy', 'warning', 'critical']),
  summary: z.string(),
});

export type AnomalyDetectionResult = z.infer<typeof AnomalyDetectionSchema>;

// ============ COPY OPTIMIZATION ============

export const CopyOptimizationSchema = z.object({
  analysis: z.object({
    currentPerformance: z.object({
      ctr: z.number(),
      engagement: z.string(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    }),
  }),
  suggestions: z.array(z.object({
    type: z.enum(['headline', 'primaryText', 'description', 'callToAction']),
    original: z.string(),
    alternatives: z.array(z.object({
      text: z.string(),
      reasoning: z.string(),
      predictedCtrImprovement: z.number(),
    })),
  })),
  abTestRecommendations: z.array(z.object({
    variant: z.string(),
    hypothesis: z.string(),
    expectedLift: z.string(),
  })),
  summary: z.string(),
});

export type CopyOptimization = z.infer<typeof CopyOptimizationSchema>;

// ============ AUDIENCE INSIGHTS ============

export const AudienceInsightsSchema = z.object({
  topPerformingSegments: z.array(z.object({
    segment: z.string(),
    type: z.enum(['age', 'gender', 'location', 'device', 'placement']),
    spend: z.number(),
    roas: z.number(),
    conversions: z.number(),
    insight: z.string(),
  })),
  underperformingSegments: z.array(z.object({
    segment: z.string(),
    type: z.enum(['age', 'gender', 'location', 'device', 'placement']),
    spend: z.number(),
    roas: z.number(),
    issue: z.string(),
    recommendation: z.string(),
  })),
  expansionOpportunities: z.array(z.object({
    opportunity: z.string(),
    segment: z.string(),
    reasoning: z.string(),
    expectedRoas: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high']),
  })),
  targetingRecommendations: z.array(z.object({
    action: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  })),
  summary: z.string(),
});

export type AudienceInsights = z.infer<typeof AudienceInsightsSchema>;

// ============ HISTORICAL DATA TYPES ============

export interface HistoricalPerformanceData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
}

export interface CampaignContext {
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startDate: string;
  status: string;
}

export interface AdCopyData {
  headline: string;
  primaryText: string;
  description?: string;
  callToAction: string;
  performance: {
    ctr: number;
    impressions: number;
    clicks: number;
  };
}

export interface AudienceData {
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
  };
  geographic: {
    country: Record<string, number>;
    region: Record<string, number>;
  };
  device: Record<string, number>;
  placement: Record<string, number>;
}

// ============ AI ANALYSIS REQUEST TYPES ============

export interface PerformancePredictionRequest {
  adAccountId: string;
  historicalData: HistoricalPerformanceData[];
  campaignContext: CampaignContext;
  predictionDays?: number;
  /** ISO code of the ad account's currency; all figures are reported in it. */
  currency?: string;
  /**
   * Per-ad totals. Without these the model only sees account-level daily rows
   * and cannot say which creative is responsible for anything.
   */
  /** Placement, creative copy, change log and audience size; see lib/ai/account-context. */
  accountContext?: import('./account-context').AccountContext;
  adBreakdown?: Array<{
    name: string;
    status: string;
    activeDays: number;
    firstDay: string;
    lastDay: string;
    spend: number;
    impressions: number;
    linkClicks: number;
    conversions: number;
    cpa: number;
    linkCtr: number;
    cvr: number;
  }>;
}

export interface AnomalyDetectionRequest {
  adAccountId: string;
  currentMetrics: HistoricalPerformanceData;
  historicalAverage: Partial<HistoricalPerformanceData>;
  standardDeviation: Partial<HistoricalPerformanceData>;
}

export interface CopyOptimizationRequest {
  adAccountId: string;
  adCopy: AdCopyData;
  campaignObjective: string;
  targetAudience?: string;
}

export interface AudienceInsightsRequest {
  adAccountId: string;
  /** ISO code of the ad account's currency; all figures are reported in it. */
  currency?: string;
  audienceData: AudienceData;
  performanceBySegment: Record<string, HistoricalPerformanceData>;
  campaignObjective: string;
}
