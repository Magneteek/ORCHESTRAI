import { Prisma } from '@prisma/client';

// ============ EXTENDED TYPES ============

export type UserWithOrganization = Prisma.UserGetPayload<{
  include: { organization: true };
}>;

export type OrganizationWithUsers = Prisma.OrganizationGetPayload<{
  include: { users: true };
}>;

export type FacebookBusinessAccountWithAccounts = Prisma.FacebookBusinessAccountGetPayload<{
  include: { adAccounts: true };
}>;

export type AdAccountWithCampaigns = Prisma.AdAccountGetPayload<{
  include: { campaigns: true };
}>;

export type TemplateWithPerformance = Prisma.AdTemplateGetPayload<{
  include: { performanceAggregate: true };
}>;

export type CampaignWithAdSets = Prisma.CampaignGetPayload<{
  include: { adSets: true };
}>;

export type AdSetWithAds = Prisma.AdSetGetPayload<{
  include: { ads: true };
}>;

export type AdWithMetrics = Prisma.AdGetPayload<{
  include: { performanceMetrics: true };
}>;

// ============ SAFE USER TYPE (NO PASSWORD) ============

export type SafeUser = Omit<Prisma.UserGetPayload<object>, 'password'>;

export type SafeUserWithOrganization = Omit<UserWithOrganization, 'password'>;

// ============ SESSION TYPES ============

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string; // UserRole values: 'ADMIN' | 'USER'
  organizationId: string;
  image: string | null;
}

export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}

// ============ QUERY RESULT TYPES ============

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ TEMPLATE TYPES ============

export interface AdCopy {
  headline: string;
  primaryText: string;
  description?: string;
  callToAction: string;
}

export interface CreativeSpecs {
  imageUrl?: string;
  videoUrl?: string;
  format: 'image' | 'video' | 'carousel' | 'collection';
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface TargetingConfig {
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
}

export interface CampaignStructure {
  budget: number;
  bidStrategy: string;
  placements: string[];
  schedule?: {
    startDate?: string;
    endDate?: string;
  };
}

// ============ PERFORMANCE TYPES ============

export interface PerformanceMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  cpa?: number;
  reach?: number;
  frequency?: number;
  videoViews?: number;
}

export interface AggregatedPerformance {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgRoas?: number;
  avgCtr?: number;
  avgCpc?: number;
  avgCpm?: number;
  accountsUsing: number;
}

// ============ AI ANALYSIS TYPES ============

export interface AiInsights {
  key: string;
  value: string;
  confidence?: number;
  recommendations?: string[];
}

export interface AiRecommendation {
  action: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement?: number;
}

// ============ ANOMALY TYPES ============

export interface AnomalyDetails {
  entityType: 'campaign' | 'adset' | 'ad';
  entityId: string;
  metric: string;
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
}

// ============ ROLE PERMISSIONS ============

// Re-export UserRole from Prisma for backward compatibility
export { UserRole } from '@prisma/client';
import { UserRole } from '@prisma/client';

export interface RolePermissions {
  canManageOrganization: boolean;
  canManageUsers: boolean;
  canManageTemplates: boolean;
  canConnectFacebook: boolean;
  canLaunchCampaigns: boolean;
  canViewAnalytics: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canManageOrganization: true,
    canManageUsers: true,
    canManageTemplates: true,
    canConnectFacebook: true,
    canLaunchCampaigns: true,
    canViewAnalytics: true,
  },
  USER: {
    canManageOrganization: false,
    canManageUsers: false,
    canManageTemplates: false,
    canConnectFacebook: false,
    canLaunchCampaigns: true,
    canViewAnalytics: true,
  },
};
