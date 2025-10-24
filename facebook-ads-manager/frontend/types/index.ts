export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  timezone: string;
  status: "ACTIVE" | "DISABLED" | "UNSETTLED" | "CLOSED";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  adAccountId: string;
  startTime?: Date;
  stopTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignStatus =
  | "ACTIVE"
  | "PAUSED"
  | "DELETED"
  | "ARCHIVED"
  | "IN_PROCESS"
  | "WITH_ISSUES";

export interface AdSet {
  id: string;
  adSetId: string;
  name: string;
  status: CampaignStatus;
  campaignId: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  bidAmount?: number;
  targeting?: Record<string, any>;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ad {
  id: string;
  adId: string;
  name: string;
  status: CampaignStatus;
  adSetId: string;
  creative?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Insight {
  id: string;
  date: Date;
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  frequency: number;
  cpm: number;
  cpc: number;
  ctr: number;
  conversions?: number;
  conversionValue?: number;
  roas?: number;
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCpc: number;
  avgCpm: number;
  avgCtr: number;
  roas: number;
  activeCampaigns: number;
  activeAdSets: number;
  activeAds: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
}

export interface FilterOptions {
  dateRange?: DateRange;
  campaigns?: string[];
  adSets?: string[];
  ads?: string[];
  status?: CampaignStatus[];
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

export interface AIRecommendation {
  id: string;
  type: "budget" | "targeting" | "creative" | "bidding" | "schedule";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  suggestedAction: string;
  estimatedImprovement?: {
    metric: string;
    value: number;
    unit: string;
  };
  campaignId?: string;
  adSetId?: string;
  createdAt: Date;
}

export interface OptimizationJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}
