/**
 * Campaign Management Types
 * Extended types for campaign UI and data management
 */

import type {
  FacebookCampaign,
  CampaignObjective,
  CampaignStatus,
  EffectiveStatus,
  BidStrategy,
  SpecialAdCategory,
  FacebookInsights,
} from './facebook';

// ==================== Campaign List Types ====================

export interface CampaignListItem extends FacebookCampaign {
  insights?: FacebookInsights;
  adSetCount?: number;
  adCount?: number;
}

export interface CampaignFilters {
  status?: CampaignStatus[];
  objective?: CampaignObjective[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface CampaignSort {
  field: keyof CampaignListItem;
  direction: 'asc' | 'desc';
}

export interface CampaignListParams {
  accountId: string;
  filters?: CampaignFilters;
  sort?: CampaignSort;
  page?: number;
  limit?: number;
}

// ==================== Campaign Creation Types ====================

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  objective: CampaignObjective;
  budgetType: 'daily' | 'lifetime';
  defaultBudget: number;
  bidStrategy: BidStrategy;
  category: 'awareness' | 'consideration' | 'conversion';
}

export interface CampaignFormData {
  name: string;
  objective: CampaignObjective;
  specialAdCategories: SpecialAdCategory[];
  budgetType: 'daily' | 'lifetime';
  budget: number;
  bidStrategy: BidStrategy;
  bidAmount?: number;
  spendCap?: number;
  startTime?: Date;
  stopTime?: Date;
  status: CampaignStatus;
}

export interface CreateCampaignRequest {
  accountId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  specialAdCategories?: SpecialAdCategory[];
  dailyBudget?: number;
  lifetimeBudget?: number;
  spendCap?: number;
  bidStrategy?: BidStrategy;
  startTime?: string;
  stopTime?: string;
}

export interface UpdateCampaignRequest {
  campaignId: string;
  name?: string;
  status?: CampaignStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spendCap?: number;
  bidStrategy?: BidStrategy;
  startTime?: string;
  stopTime?: string;
}

// ==================== Campaign Wizard Types ====================

export type WizardStep = 'objective' | 'budget' | 'schedule' | 'review';

export interface WizardState {
  currentStep: WizardStep;
  data: Partial<CampaignFormData>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// ==================== Campaign Performance Types ====================

export interface CampaignPerformance {
  campaignId: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas?: number;
  frequency: number;
  reach: number;
}

export interface PerformanceMetrics {
  current: CampaignPerformance;
  previous?: CampaignPerformance;
  change?: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    roas?: number;
  };
}

// ==================== Campaign Actions Types ====================

export type CampaignAction =
  | 'edit'
  | 'pause'
  | 'resume'
  | 'duplicate'
  | 'delete'
  | 'view';

export interface CampaignActionResult {
  success: boolean;
  message: string;
  data?: FacebookCampaign;
}

// ==================== Campaign Objectives ====================

export const CAMPAIGN_OBJECTIVES: Record<
  CampaignObjective,
  {
    label: string;
    description: string;
    category: 'awareness' | 'consideration' | 'conversion';
  }
> = {
  OUTCOME_AWARENESS: {
    label: 'Awareness',
    description: 'Increase brand awareness and reach',
    category: 'awareness',
  },
  OUTCOME_ENGAGEMENT: {
    label: 'Engagement',
    description: 'Get more messages, video views, and interactions',
    category: 'consideration',
  },
  OUTCOME_LEADS: {
    label: 'Leads',
    description: 'Collect leads for your business',
    category: 'conversion',
  },
  OUTCOME_SALES: {
    label: 'Sales',
    description: 'Drive sales and conversions',
    category: 'conversion',
  },
  OUTCOME_TRAFFIC: {
    label: 'Traffic',
    description: 'Send people to a destination',
    category: 'consideration',
  },
  APP_INSTALLS: {
    label: 'App Installs',
    description: 'Get more app installs',
    category: 'conversion',
  },
  BRAND_AWARENESS: {
    label: 'Brand Awareness',
    description: 'Increase brand awareness',
    category: 'awareness',
  },
  CONVERSIONS: {
    label: 'Conversions',
    description: 'Drive valuable actions',
    category: 'conversion',
  },
  EVENT_RESPONSES: {
    label: 'Event Responses',
    description: 'Get more event responses',
    category: 'consideration',
  },
  LEAD_GENERATION: {
    label: 'Lead Generation',
    description: 'Collect leads with instant forms',
    category: 'conversion',
  },
  LINK_CLICKS: {
    label: 'Link Clicks',
    description: 'Drive traffic to your website',
    category: 'consideration',
  },
  LOCAL_AWARENESS: {
    label: 'Local Awareness',
    description: 'Reach people near your business',
    category: 'awareness',
  },
  MESSAGES: {
    label: 'Messages',
    description: 'Get more messages',
    category: 'consideration',
  },
  OFFER_CLAIMS: {
    label: 'Offer Claims',
    description: 'Get people to claim your offer',
    category: 'conversion',
  },
  PAGE_LIKES: {
    label: 'Page Likes',
    description: 'Get more Page likes',
    category: 'consideration',
  },
  POST_ENGAGEMENT: {
    label: 'Post Engagement',
    description: 'Get more post engagement',
    category: 'consideration',
  },
  PRODUCT_CATALOG_SALES: {
    label: 'Catalog Sales',
    description: 'Sell products from your catalog',
    category: 'conversion',
  },
  REACH: {
    label: 'Reach',
    description: 'Show your ads to the maximum people',
    category: 'awareness',
  },
  STORE_VISITS: {
    label: 'Store Visits',
    description: 'Drive foot traffic to stores',
    category: 'conversion',
  },
  VIDEO_VIEWS: {
    label: 'Video Views',
    description: 'Get more video views',
    category: 'consideration',
  },
};

// ==================== Bid Strategy Options ====================

export const BID_STRATEGY_OPTIONS: Record<
  BidStrategy,
  {
    label: string;
    description: string;
  }
> = {
  LOWEST_COST_WITHOUT_CAP: {
    label: 'Lowest Cost',
    description: 'Get the most results for your budget',
  },
  LOWEST_COST_WITH_BID_CAP: {
    label: 'Bid Cap',
    description: 'Control costs with a maximum bid',
  },
  COST_CAP: {
    label: 'Cost Cap',
    description: 'Control average cost per result',
  },
  LOWEST_COST_WITH_MIN_ROAS: {
    label: 'Minimum ROAS',
    description: 'Optimize for return on ad spend',
  },
};
