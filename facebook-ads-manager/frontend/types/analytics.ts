/**
 * Analytics Types for Dashboard
 */

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  /**
   * Clicks that followed the link. `clicks` also counts reactions, comments,
   * saves and post expands, so it is the wrong denominator for a conversion
   * rate — on this data it understated click-to-lead by more than half.
   */
  linkClicks: number;
  conversions: number;
  /** Purchase conversion value. Zero for lead-gen objectives, which book no revenue. */
  revenue: number;
  /** Fraction (clicks / impressions), NOT a percentage. Multiply by 100 for display. */
  ctr: number;
  cpc: number;
  cpm: number;
  /** Ratio (revenue / spend). Meaningless when revenue is 0 — see isLeadGen(). */
  roas: number;
  /** Link clicks / impressions. The rate Meta reports as "CTR (link)". */
  linkCtr: number;
  /** Conversions / link clicks — the figure CVR benchmarks are quoted against. */
  cvr: number;
  /** Cost per conversion (spend / conversions). The lead-gen equivalent of ROAS. */
  cpa: number;
}

/**
 * A scope books conversions but no revenue — i.e. a lead-gen objective, where
 * ROAS is structurally zero and cost per lead is the metric that matters.
 * Used to decide whether to show ROAS or leads/CPL, so a permanent "0.00x"
 * tile never reads as failure.
 */
export function isLeadGen(m: { revenue: number; conversions: number }): boolean {
  return m.revenue === 0 && m.conversions > 0;
}

export interface TimeSeriesDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  roas: number;
}

export interface TopCampaign {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  /** Zero for lead-gen campaigns — see isLeadGen(). */
  revenue: number;
  ctr: number;
  roas: number;
  /** Cost per conversion (spend / conversions). */
  cpa: number;
}

/**
 * Spend and conversion efficiency for one weekday, aggregated across the range.
 * Surfaces day-of-week effects that a daily time series hides — on the DRNL
 * account cost per lead runs 2.9x higher on Sunday than on Tuesday.
 */
export interface DayOfWeekPerformance {
  /** 0 = Sunday, matching Date.getDay(). */
  day: number;
  label: string;
  spend: number;
  clicks: number;
  conversions: number;
  /** Cost per conversion for this weekday; 0 when it produced none. */
  cpa: number;
}

/**
 * Whether the weekday differences are distinguishable from chance.
 *
 * Conversion counts per weekday are small, so a 3x cost-per-lead spread can
 * appear from nothing. Chi-square against leads expected in proportion to each
 * weekday's share of spend; without this the UI invites budget decisions based
 * on noise, and on this account the "best day" changes from Tuesday to Thursday
 * simply by widening the window from 30 to 90 days.
 */
export interface DayOfWeekSignificance {
  chiSquare: number;
  /** Degrees of freedom: weekdays with spend, minus one. */
  degreesOfFreedom: number;
  /** True when chi-square clears the p<0.05 critical value. */
  significant: boolean;
  totalConversions: number;
}

export interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  dropoffRate?: number;
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'info';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  timeSeries: TimeSeriesDataPoint[];
  topCampaigns: TopCampaign[];
  dayOfWeek: DayOfWeekPerformance[];
  dayOfWeekSignificance: DayOfWeekSignificance;
  funnelData?: FunnelStage[];
  aiInsights?: AIInsight[];
}

export interface AnalyticsExportData {
  dateRange: DateRange;
  metrics: AnalyticsMetrics;
  timeSeries: TimeSeriesDataPoint[];
  topCampaigns: TopCampaign[];
  generatedAt: string;
}
