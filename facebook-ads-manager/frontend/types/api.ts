// ============ API REQUEST/RESPONSE TYPES ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ============ AUTHENTICATION ============

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string;
  };
  token: string;
}

// ============ ORGANIZATION ============

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface UpdateOrganizationRequest {
  name?: string;
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended' | 'cancelled';
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ============ USERS ============

export interface InviteUserRequest {
  email: string;
  role: 'admin' | 'manager' | 'member';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'member';
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organizationId: string;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ FACEBOOK INTEGRATION ============

export interface ConnectFacebookRequest {
  code: string;
  redirectUri: string;
}

export interface FacebookAccountResponse {
  id: string;
  organizationId: string;
  businessId: string;
  name: string;
  isActive: boolean;
  tokenExpiresAt: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdAccountResponse {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  timezone: string;
  accountStatus: string;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ TEMPLATES ============

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: string;
  objective: string;
  visibility: 'private' | 'public';
  adCopy: {
    headline: string;
    primaryText: string;
    description?: string;
    callToAction: string;
  };
  creativeSpecs: {
    imageUrl?: string;
    videoUrl?: string;
    format: 'image' | 'video' | 'carousel' | 'collection';
    dimensions?: {
      width: number;
      height: number;
    };
  };
  targetingConfig: {
    interests?: string[];
    demographics?: {
      ageMin?: number;
      ageMax?: number;
      genders?: ('male' | 'female' | 'all')[];
    };
    behaviors?: string[];
    locations?: {
      country?: string;
      region?: string;
      city?: string;
    }[];
  };
  campaignStructure: {
    budget: number;
    bidStrategy: string;
    placements: string[];
    schedule?: {
      startDate?: string;
      endDate?: string;
    };
  };
}

export interface TemplateResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: string;
  objective: string;
  visibility: string;
  version: number;
  adCopy: unknown;
  creativeSpecs: unknown;
  targetingConfig: unknown;
  campaignStructure: unknown;
  timesUsed: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  performanceAggregate?: {
    totalSpend: number;
    totalImpressions: string;
    totalClicks: string;
    totalConversions: string;
    avgRoas: number | null;
    avgCtr: number | null;
    avgCpc: number | null;
    avgCpm: number | null;
  };
}

// ============ CAMPAIGNS ============

export interface LaunchCampaignRequest {
  templateId: string;
  adAccountId: string;
  campaignName: string;
  budget: number;
  schedule?: {
    startDate: string;
    endDate?: string;
  };
}

export interface CampaignResponse {
  id: string;
  campaignId: string;
  name: string;
  objective: string;
  status: string;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  startTime: string | null;
  stopTime: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ PERFORMANCE ============

export interface PerformanceMetricsResponse {
  date: string;
  spend: number;
  impressions: string;
  clicks: string;
  conversions: string;
  roas: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  cpa: number | null;
  reach: string | null;
  frequency: number | null;
  videoViews: string | null;
}

export interface PerformanceQueryParams {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

// ============ AI ANALYSIS ============

export interface AiAnalysisResponse {
  id: string;
  analysisType: string;
  insights: unknown;
  recommendations: unknown;
  confidence: number | null;
  analyzedAt: string;
  validUntil: string | null;
}

export interface RequestAiAnalysisRequest {
  adAccountId: string;
  analysisType: 'performance_prediction' | 'anomaly_detection' | 'copy_optimization' | 'audience_insights';
}

// ============ PAGINATION ============

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ FILTERS ============

export interface TemplateFilters extends PaginationParams {
  category?: string;
  visibility?: 'private' | 'public' | 'all';
  search?: string;
}

export interface AdAccountFilters extends PaginationParams {
  status?: 'ACTIVE' | 'INACTIVE' | 'all';
}

export interface CampaignFilters extends PaginationParams {
  status?: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'all';
  templateId?: string;
}
