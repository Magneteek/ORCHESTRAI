/**
 * Analytics Types for Facebook Ads Manager
 * Comprehensive type definitions for analytics data structures
 */

export interface TimeSeriesDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface MultiSeriesDataPoint {
  date: Date;
  [key: string]: number | Date | string;
}

export interface PerformanceMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  revenue: number;
}

export interface MetricChange {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change: MetricChange;
  icon?: string;
  sparklineData?: TimeSeriesDataPoint[];
}

export interface CampaignPerformance {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  metrics: PerformanceMetrics;
  change: Partial<Record<keyof PerformanceMetrics, MetricChange>>;
}

export interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  dropoff?: number;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
  metric?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  accountIds?: string[];
  campaignIds?: string[];
  adSetIds?: string[];
  metric?: keyof PerformanceMetrics;
  groupBy?: 'day' | 'week' | 'month' | 'hour';
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TooltipData {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'xlsx';
  includeCharts?: boolean;
  dateRange: DateRange;
  filters: AnalyticsFilters;
}

export interface AnalyticsSummary {
  period: DateRange;
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  averageROAS: number;
  topCampaign: CampaignPerformance;
  worstCampaign: CampaignPerformance;
  performanceScore: number;
}

// Chart-specific types
export interface LineChartConfig {
  xKey: string;
  yKeys: string[];
  colors: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  enableZoom?: boolean;
  enableTooltip?: boolean;
}

export interface BarChartConfig {
  xKey: string;
  yKey: string;
  color: string | ((value: number) => string);
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
}

export interface HeatmapConfig {
  xKey: string;
  yKey: string;
  valueKey: string;
  colorScale: string[];
  showValues?: boolean;
}

// API Response types
export interface InsightsResponse {
  data: Array<{
    date_start: string;
    date_stop: string;
    spend: string;
    impressions: string;
    clicks: string;
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
    cost_per_action_type?: Array<{
      action_type: string;
      value: string;
    }>;
    action_values?: Array<{
      action_type: string;
      value: string;
    }>;
  }>;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export interface AnalyticsQueryParams {
  level: 'account' | 'campaign' | 'adset' | 'ad';
  time_range?: {
    since: string;
    until: string;
  };
  time_increment?: 'all_days' | number;
  fields: string[];
  filtering?: Array<{
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';
    value: string | number | string[];
  }>;
  breakdowns?: string[];
}

// Color schemes for charts
export const CHART_COLORS = {
  primary: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  gradient: ['#6366f1', '#8b5cf6', '#d946ef', '#f97316', '#eab308'],
  performance: {
    excellent: '#10b981',
    good: '#22c55e',
    average: '#f59e0b',
    poor: '#ef4444',
    critical: '#dc2626',
  },
  heatmap: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
};

// Thresholds for performance indicators
export const PERFORMANCE_THRESHOLDS = {
  roas: {
    excellent: 5,
    good: 3,
    average: 2,
    poor: 1,
  },
  ctr: {
    excellent: 0.05,
    good: 0.03,
    average: 0.02,
    poor: 0.01,
  },
  conversionRate: {
    excellent: 0.1,
    good: 0.05,
    average: 0.02,
    poor: 0.01,
  },
};
