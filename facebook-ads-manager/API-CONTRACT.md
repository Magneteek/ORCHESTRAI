# Facebook Ads Manager API Contract
**Version:** 1.0.0
**Generated:** 2025-10-16
**Purpose:** Shared API contract for all parallel development streams

---

## Base Configuration

```typescript
const API_BASE = '/api';
const API_VERSION = 'v1';

// Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}
```

---

## 1. Campaign Management API

### GET /api/campaigns
**Purpose:** List campaigns with filtering and pagination

**Query Parameters:**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 20, Max: 100
  search?: string;        // Search by name
  status?: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'all';
  objective?: string;     // Campaign objective filter
  adAccountId?: string;   // Filter by ad account
  sortBy?: 'name' | 'created' | 'spend' | 'roas';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
ApiResponse<{
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
}>
```

### POST /api/campaigns
**Purpose:** Create new campaign

**Request Body:**
```typescript
{
  name: string;
  objective: CampaignObjective;
  status: 'ACTIVE' | 'PAUSED';
  adAccountId: string;
  specialAdCategories?: string[];
  budgetType: 'DAILY' | 'LIFETIME';
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  bidStrategy?: string;
}
```

**Response:**
```typescript
ApiResponse<{
  campaign: Campaign;
  facebookId: string;
}>
```

### PATCH /api/campaigns/[id]
**Purpose:** Update campaign

**Request Body:**
```typescript
{
  name?: string;
  status?: 'ACTIVE' | 'PAUSED';
  dailyBudget?: number;
  lifetimeBudget?: number;
  endTime?: string;
}
```

### DELETE /api/campaigns/[id]
**Purpose:** Delete campaign (soft delete)

### POST /api/campaigns/[id]/duplicate
**Purpose:** Duplicate existing campaign

**Response:**
```typescript
ApiResponse<{
  original: Campaign;
  duplicate: Campaign;
}>
```

### POST /api/campaigns/bulk
**Purpose:** Bulk operations on campaigns

**Request Body:**
```typescript
{
  campaignIds: string[];
  operation: 'pause' | 'resume' | 'delete';
}
```

---

## 2. Analytics API

### GET /api/analytics
**Purpose:** Get aggregated analytics across campaigns

**Query Parameters:**
```typescript
{
  adAccountId?: string;
  campaignIds?: string[];  // Comma-separated
  startDate: string;        // ISO 8601
  endDate: string;          // ISO 8601
  metrics?: string[];       // Comma-separated
  groupBy?: 'day' | 'week' | 'month' | 'campaign';
}
```

**Response:**
```typescript
ApiResponse<{
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
    conversions: number;
    revenue: number;
  };
  breakdown: Array<{
    date?: string;
    campaignId?: string;
    metrics: MetricsObject;
  }>;
}>
```

### GET /api/analytics/[campaignId]
**Purpose:** Get analytics for specific campaign

**Query Parameters:**
```typescript
{
  startDate: string;
  endDate: string;
  breakdown?: 'day' | 'week' | 'month';
  includeAdSets?: boolean;
  includeAds?: boolean;
}
```

### GET /api/analytics/comparison
**Purpose:** Compare multiple campaigns

**Query Parameters:**
```typescript
{
  campaignIds: string[];  // Comma-separated
  startDate: string;
  endDate: string;
  metric: 'spend' | 'roas' | 'ctr' | 'conversions';
}
```

### POST /api/analytics/export
**Purpose:** Export analytics data

**Request Body:**
```typescript
{
  format: 'csv' | 'pdf' | 'excel';
  campaignIds?: string[];
  startDate: string;
  endDate: string;
  metrics: string[];
}
```

**Response:**
```typescript
ApiResponse<{
  downloadUrl: string;
  expiresAt: string;
}>
```

---

## 3. Template API

### GET /api/templates
**Purpose:** List templates with filtering

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  objective?: string;
  sortBy?: 'popular' | 'recent' | 'performance';
  organizationId?: string;  // For private templates
}
```

**Response:**
```typescript
ApiResponse<{
  templates: Template[];
  total: number;
  categories: string[];
}>
```

### GET /api/templates/[id]
**Purpose:** Get template details

**Response:**
```typescript
ApiResponse<{
  template: Template;
  metrics: {
    usageCount: number;
    avgRoas: number;
    successRate: number;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}>
```

### POST /api/templates
**Purpose:** Create new template

**Request Body:**
```typescript
{
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  config: {
    objective: string;
    targeting: object;
    budget: object;
    creative: object;
  };
}
```

### POST /api/templates/[id]/fork
**Purpose:** Fork template for customization

**Response:**
```typescript
ApiResponse<{
  template: Template;
  forkedFrom: string;
}>
```

### GET /api/templates/leaderboard
**Purpose:** Get top-performing templates

**Query Parameters:**
```typescript
{
  metric: 'usage' | 'roas' | 'success_rate';
  period: '7d' | '30d' | '90d' | 'all';
  limit?: number;
}
```

---

## 4. AI Insights API

### POST /api/ai-insights
**Purpose:** Request AI analysis

**Request Body:**
```typescript
{
  analysisType: 'performance_prediction' | 'anomaly_detection' | 'copy_optimization' | 'audience_insights';
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  options?: {
    predictionDays?: number;
    confidenceThreshold?: number;
    includeRecommendations?: boolean;
  };
}
```

**Response:**
```typescript
ApiResponse<{
  insightId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  estimatedTime: number;  // seconds
}>
```

### GET /api/ai-insights/[id]
**Purpose:** Get AI insight results

**Response:**
```typescript
ApiResponse<{
  insight: {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    result?: {
      summary: string;
      confidence: number;
      recommendations: Array<{
        action: string;
        impact: 'high' | 'medium' | 'low';
        description: string;
        estimatedImprovement?: number;
      }>;
      data: any;  // Type-specific data
    };
    error?: string;
  };
}>
```

### GET /api/ai-insights
**Purpose:** List AI insights for campaigns

**Query Parameters:**
```typescript
{
  campaignId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}
```

### POST /api/ai-insights/[id]/apply
**Purpose:** Apply AI recommendation

**Request Body:**
```typescript
{
  recommendationId: string;
  confirmationNote?: string;
}
```

---

## 5. Shared Type Definitions

### Campaign
```typescript
interface Campaign {
  id: string;
  facebookId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  objective: CampaignObjective;
  adAccountId: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spend?: number;
  createdAt: string;
  updatedAt: string;
  insights?: CampaignInsights;
}

type CampaignObjective =
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT';

interface CampaignInsights {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  conversions: number;
  revenue: number;
  dateRange: {
    start: string;
    end: string;
  };
}
```

### Template
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  authorId: string;
  organizationId?: string;
  config: TemplateConfig;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateConfig {
  objective: CampaignObjective;
  targeting: {
    locations?: string[];
    ages?: { min: number; max: number };
    genders?: string[];
    interests?: string[];
  };
  budget: {
    type: 'DAILY' | 'LIFETIME';
    amount: number;
  };
  creative: {
    format: string;
    guidelines: string[];
  };
}
```

---

## 6. Error Codes

```typescript
const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'Authentication required',
  AUTH_INVALID: 'Invalid authentication token',
  AUTH_EXPIRED: 'Authentication token expired',

  // Authorization
  FORBIDDEN: 'Insufficient permissions',
  RESOURCE_NOT_FOUND: 'Resource not found',

  // Validation
  VALIDATION_ERROR: 'Request validation failed',
  INVALID_PARAMETER: 'Invalid parameter value',
  MISSING_REQUIRED: 'Missing required field',

  // Business Logic
  CAMPAIGN_LIMIT_REACHED: 'Campaign limit reached for account',
  INSUFFICIENT_BUDGET: 'Insufficient budget',
  FACEBOOK_API_ERROR: 'Facebook API error',

  // System
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;
```

---

## 7. Rate Limiting

**Rate Limits:**
- Authenticated requests: 1000 requests per hour per user
- AI insights requests: 50 per hour per organization
- Bulk operations: 10 per minute per user
- Export requests: 20 per hour per user

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1634567890
```

---

## 8. Pagination Standards

**Query Parameters:**
```typescript
{
  page: number;    // 1-indexed
  limit: number;   // Default: 20, Max: 100
}
```

**Response Meta:**
```typescript
{
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}
```

---

## 9. Date/Time Standards

- All dates in ISO 8601 format: `2025-10-16T12:00:00Z`
- All timestamps in UTC
- Date ranges inclusive of start date, exclusive of end date
- Default timezone: UTC (client handles localization)

---

## 10. WebSocket Events (Real-time Updates)

**Connection:** `ws://localhost:3001/ws`

**Events:**
```typescript
// Campaign status change
{
  event: 'campaign:status',
  data: {
    campaignId: string;
    status: string;
    timestamp: string;
  }
}

// Analytics update
{
  event: 'analytics:update',
  data: {
    campaignId: string;
    metrics: CampaignInsights;
    timestamp: string;
  }
}

// AI insight completed
{
  event: 'ai:insight:completed',
  data: {
    insightId: string;
    campaignId: string;
    type: string;
    status: string;
  }
}
```

---

**Contract Status:** ACTIVE
**Last Updated:** 2025-10-16
**Version:** 1.0.0
**Maintainer:** API Architect Agent (Stream 2B)
