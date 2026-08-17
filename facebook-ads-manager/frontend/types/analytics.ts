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
  conversions: number;
  /** Fraction (clicks / impressions), NOT a percentage. Multiply by 100 for display. */
  ctr: number;
  cpc: number;
  cpm: number;
  /** Ratio (revenue / spend). */
  roas: number;
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
  ctr: number;
  roas: number;
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
