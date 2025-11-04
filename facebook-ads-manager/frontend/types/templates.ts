import { AdCopy, CreativeSpecs, TargetingConfig, CampaignStructure, AggregatedPerformance } from './database';

// ============ TEMPLATE TYPES ============

export interface AdTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  objective: string;
  visibility: 'private' | 'public';
  adCopy: AdCopy;
  creativeSpecs: CreativeSpecs;
  targetingConfig: TargetingConfig;
  campaignStructure: CampaignStructure;
  organizationId: string;
  createdById: string;
  forkedFromId?: string;
  timesUsed: number;
  createdAt: Date;
  updatedAt: Date;
  performanceAggregate?: TemplatePerformanceAggregate;
}

export interface TemplatePerformanceAggregate {
  id: string;
  templateId: string;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgRoas?: number;
  avgCtr?: number;
  avgCpc?: number;
  avgCpm?: number;
  accountsUsing: number;
  lastAggregatedAt: Date;
}

// ============ FILTER & SORT TYPES ============

export type TemplateCategory =
  | 'e-commerce'
  | 'lead-generation'
  | 'brand-awareness'
  | 'app-promotion'
  | 'engagement'
  | 'traffic'
  | 'video-views'
  | 'other';

export type TemplateObjective =
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_SALES'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_APP_PROMOTION';

export type TemplateVisibilityFilter = 'private' | 'public' | 'mine' | 'all';

export type TemplateSortBy =
  | 'name'
  | 'createdAt'
  | 'timesUsed'
  | 'roas'
  | 'ctr'
  | 'spend';

export interface TemplateFilters {
  search?: string;
  category?: TemplateCategory;
  objective?: TemplateObjective;
  visibility?: TemplateVisibilityFilter;
  minRoas?: number;
  maxSpend?: number;
  sortBy?: TemplateSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============ VIEW TYPES ============

export type TemplateViewMode = 'grid' | 'list';

// ============ PERFORMANCE BADGE TYPES ============

export type PerformanceBadgeType =
  | 'top-performer'
  | 'high-roi'
  | 'trending'
  | 'proven'
  | 'new';

export interface PerformanceBadge {
  type: PerformanceBadgeType;
  label: string;
  color: string;
  icon?: string;
}

// ============ TEMPLATE ACTIONS ============

export interface UseTemplateParams {
  templateId: string;
  adAccountId: string;
  customizations?: Partial<AdTemplate>;
}

export interface ForkTemplateParams {
  templateId: string;
  name?: string;
  visibility?: 'private' | 'public';
}

// ============ TEMPLATE WIZARD TYPES ============

export interface TemplateWizardStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
}

export interface TemplateFormData {
  // Basic Info
  name: string;
  description?: string;
  category: TemplateCategory;
  objective: TemplateObjective;
  visibility: 'private' | 'public';

  // Ad Copy
  adCopy: AdCopy;

  // Creative Specs
  creativeSpecs: CreativeSpecs;

  // Targeting
  targetingConfig: TargetingConfig;

  // Campaign Structure
  campaignStructure: CampaignStructure;
}

// ============ LEADERBOARD TYPES ============

export interface LeaderboardEntry {
  template: AdTemplate;
  rank: number;
  performanceScore: number;
}

export interface LeaderboardFilters {
  category?: TemplateCategory;
  objective?: TemplateObjective;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

// ============ API RESPONSE TYPES ============

export interface TemplatesResponse {
  data: AdTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TemplateStatsResponse {
  totalTemplates: number;
  publicTemplates: number;
  myTemplates: number;
  totalUsage: number;
  avgRoas: number;
  topCategory: string;
}

// ============ TEMPLATE VERSION TYPES ============

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  changes: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

// ============ USAGE ANALYTICS TYPES ============

export interface TemplateUsageAnalytics {
  templateId: string;
  totalUses: number;
  uniqueAccounts: number;
  successRate: number;
  avgCampaignDuration: number;
  performanceTrend: Array<{
    date: string;
    roas: number;
    spend: number;
  }>;
}
