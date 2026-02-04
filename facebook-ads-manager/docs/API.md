# Facebook Ads Manager - API Documentation

**Version:** 1.0.0
**Last Updated:** January 2026
**Base URL:** `/api`
**Authentication:** NextAuth session-based

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints Reference](#api-endpoints-reference)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Code Examples](#code-examples)

---

## Authentication

### Session Management

The API uses **NextAuth.js** session-based authentication. All API endpoints require a valid authenticated session.

**Session Structure:**
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole; // ADMIN | USER
    organizationId: string;
    image?: string | null;
  };
  expires: string; // ISO 8601 timestamp
}
```

### API Authentication Pattern

All authenticated endpoints follow this pattern:

```typescript
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  // 1. Check authentication
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Check permissions
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // 3. Process request
  // ...
}
```

### Permission Requirements

| Permission Level | Description | Can Access |
|-----------------|-------------|------------|
| **ADMIN** | Full access | All endpoints |
| **USER** | Standard user | Template browsing, campaign launch, own analytics |
| **Unauthenticated** | No access | Login/register only |

---

## API Endpoints Reference

### Template Management

#### GET /api/templates

**Purpose:** List templates with pagination and filtering

**Authentication:** Required
**Permission:** USER, ADMIN
**Method:** GET

**Query Parameters:**

```typescript
interface TemplateFilterParams {
  page?: number;           // Page number (1-indexed), default: 1
  limit?: number;          // Results per page, default: 20, max: 100
  search?: string;         // Search by name/description
  category?: string;       // Filter by category
  objective?: string;      // Filter by campaign objective
  visibility?: 'all' | 'public' | 'private'; // Filter by visibility
  sortBy?: 'createdAt' | 'timesUsed' | 'name'; // Sort field
  sortOrder?: 'asc' | 'desc'; // Sort direction
  isGlobal?: boolean;     // Filter global templates only
  featured?: boolean;      // Filter featured templates only
}
```

**Example Request:**
```bash
GET /api/templates?page=1&limit=20&category=general-dentist&sortBy=timesUsed&sortOrder=desc
```

**Response (200 OK):**

```typescript
interface TemplatesResponse {
  success: true;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    objective: string;
    visibility: string;
    version: number;
    isGlobal: boolean;
    timesUsed: number;
    createdAt: string;
    updatedAt: string;

    // Ad content (JSON fields)
    adCopy: {
      headline: string;
      primaryText: string;
      description: string;
      callToAction: string;
    };

    creativeSpecs: {
      format: string;
      imageUrl: string;
      dimensions: { width: number; height: number };
      guidelines: string[];
    };

    targetingConfig: {
      locations: string[];
      ageMin: number;
      ageMax: number;
      interests: string[];
    };

    campaignStructure: {
      budgetType: string;
      defaultBudget: number;
      bidStrategy: string;
      placements: string[];
    };

    // Dynamic fields schema
    dynamicFields: {
      fields: Array<{
        name: string;
        type: 'text' | 'number' | 'url';
        label: string;
        placeholder?: string;
        required: boolean;
        default?: string;
        maxLength?: number;
        min?: number;
        max?: number;
      }>;
    } | null;

    // Performance metrics (if available)
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      avgCpm: number | null;
      totalSpend: number;
      accountsUsing: number;
    } | null;
  }>;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Error Responses:**

```typescript
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Authentication required"
}

// 422 Unprocessable Entity
{
  "error": "Validation error",
  "details": [
    {
      "field": "page",
      "message": "Page must be a positive number"
    }
  ]
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "Failed to fetch templates"
}
```

---

#### POST /api/templates

**Purpose:** Create a new template

**Authentication:** Required
**Permission:** USER (private templates), ADMIN (global templates)
**Method:** POST

**Request Body:**

```typescript
interface CreateTemplateRequest {
  name: string;                    // Required, max 100 chars
  description?: string;            // Optional, max 500 chars
  category: string;                // Required: general-dentist, orthodontist, dental-supply-b2b
  objective: string;               // Required: OUTCOME_LEADS, OUTCOME_TRAFFIC, etc.
  visibility: 'private' | 'public'; // Required
  isGlobal?: boolean;              // Optional, default: false (admin only)

  // Ad content
  adCopy: {
    headline: string;              // Required, max 40 chars, can include {{placeholders}}
    primaryText: string;           // Required, max 500 chars, can include {{placeholders}}
    description: string;           // Required, max 150 chars
    callToAction: string;          // Required: BOOK_NOW, LEARN_MORE, CALL_NOW, etc.
  };

  // Creative specifications
  creativeSpecs: {
    format: string;                // Required: single_image, carousel, video, etc.
    imageUrl?: string;             // Optional, URL to image
    dimensions?: {
      width: number;
      height: number;
    };
    guidelines?: string[];         // Optional, creative guidelines
  };

  // Targeting configuration
  targetingConfig: {
    locations?: string[];          // Default: ["US"]
    ageMin?: number;               // Default: 18
    ageMax?: number;               // Default: 65
    genders?: string[];            // Default: ["all"]
    interests?: string[];          // Optional, interest targeting
    behaviors?: string[];          // Optional, behavior targeting
  };

  // Campaign structure
  campaignStructure: {
    budgetType: 'daily' | 'lifetime'; // Required
    defaultBudget: number;         // Required, minimum 1
    bidStrategy?: string;          // Optional: LOWEST_COST, COST_CAP, etc.
    placements?: string[];         // Optional: facebook_feed, instagram_feed, etc.
    schedule?: {
      startHour?: number;
      endHour?: number;
      days?: string[];
    };
  };

  // Dynamic fields definition
  dynamicFields?: {
    fields: Array<{
      name: string;                // Required, unique within template
      type: 'text' | 'number' | 'url'; // Required
      label: string;               // Required, display label
      placeholder?: string;        // Optional
      required: boolean;           // Required
      default?: string | number;   // Optional
      helpText?: string;           // Optional
      maxLength?: number;          // For text fields
      min?: number;                // For number fields
      max?: number;                // For number fields
      pattern?: string;            // For text validation (regex)
    }>;
  };
}
```

**Example Request:**

```json
POST /api/templates
Content-Type: application/json

{
  "name": "New Patient Special - $99",
  "description": "Attract new patients with proven first-visit offer",
  "category": "general-dentist",
  "objective": "OUTCOME_LEADS",
  "visibility": "public",
  "isGlobal": true,
  "adCopy": {
    "headline": "{{offer_price}} New Patient Special",
    "primaryText": "{{company_name}} welcomes new patients! Get {{offer_includes}} for just {{offer_price}}. Call {{phone_number}} or visit {{website_url}} to book.",
    "description": "Professional dental care in {{business_location}}",
    "callToAction": "BOOK_NOW"
  },
  "creativeSpecs": {
    "format": "single_image",
    "imageUrl": "https://cdn.example.com/dental-office.jpg",
    "dimensions": {
      "width": 1200,
      "height": 628
    },
    "guidelines": [
      "Use bright, professional dental office images",
      "Include smiling patients or dentist"
    ]
  },
  "targetingConfig": {
    "locations": ["US"],
    "ageMin": 25,
    "ageMax": 65,
    "interests": ["Health and wellness", "Dental care"]
  },
  "campaignStructure": {
    "budgetType": "daily",
    "defaultBudget": 50,
    "bidStrategy": "LOWEST_COST_WITH_BID_CAP",
    "placements": ["facebook_feed", "instagram_feed"]
  },
  "dynamicFields": {
    "fields": [
      {
        "name": "company_name",
        "type": "text",
        "label": "Practice Name",
        "placeholder": "e.g., Bright Smile Dental",
        "required": true,
        "maxLength": 50
      },
      {
        "name": "offer_price",
        "type": "text",
        "label": "Offer Price",
        "placeholder": "e.g., $99 or FREE",
        "required": true
      },
      {
        "name": "phone_number",
        "type": "text",
        "label": "Phone Number",
        "placeholder": "(555) 123-4567",
        "required": true,
        "pattern": "^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$"
      },
      {
        "name": "website_url",
        "type": "url",
        "label": "Website URL",
        "placeholder": "https://www.yourpractice.com",
        "required": true
      }
    ]
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Patient Special - $99",
    "description": "Attract new patients with proven first-visit offer",
    "category": "general-dentist",
    "isGlobal": true,
    "timesUsed": 0,
    "createdAt": "2026-01-27T12:00:00Z"
  }
}
```

**Error Responses:**

```typescript
// 400 Bad Request
{
  "error": "Validation error",
  "details": [
    {
      "field": "adCopy.headline",
      "message": "Headline must be 40 characters or less"
    }
  ]
}

// 403 Forbidden
{
  "error": "Forbidden",
  "message": "Only administrators can create global templates"
}

// 422 Unprocessable Entity
{
  "error": "Invalid field values",
  "details": {
    "dynamicFields": "Field name 'company_name' is duplicated"
  }
}
```

---

#### GET /api/templates/[id]

**Purpose:** Get single template details

**Authentication:** Required
**Permission:** USER, ADMIN
**Method:** GET

**Path Parameters:**
- `id` (string): Template UUID

**Example Request:**
```bash
GET /api/templates/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Patient Special - $99",
    "description": "Attract new patients with proven first-visit offer",
    "category": "general-dentist",
    "objective": "OUTCOME_LEADS",
    "visibility": "public",
    "isGlobal": true,
    "timesUsed": 45,
    "createdAt": "2026-01-15T12:00:00Z",
    "updatedAt": "2026-01-27T08:30:00Z",
    "adCopy": { /* ... */ },
    "creativeSpecs": { /* ... */ },
    "targetingConfig": { /* ... */ },
    "campaignStructure": { /* ... */ },
    "dynamicFields": { /* ... */ },
    "performanceAggregate": {
      "avgRoas": 3.8,
      "avgCtr": 1.9,
      "avgCpc": 1.85,
      "totalSpend": 12450.00,
      "accountsUsing": 12
    }
  }
}
```

---

#### PATCH /api/templates/[id]

**Purpose:** Update existing template

**Authentication:** Required
**Permission:** ADMIN (global templates), USER (own organization templates)
**Method:** PATCH

**Request Body:** Same as POST /api/templates, but all fields optional

**Example Request:**
```json
PATCH /api/templates/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "name": "New Patient Special - $99 (Updated)",
  "description": "Refreshed offer with better performance",
  "campaignStructure": {
    "defaultBudget": 60
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template updated successfully",
  "data": { /* updated template */ }
}
```

---

#### DELETE /api/templates/[id]

**Purpose:** Delete template

**Authentication:** Required
**Permission:** ADMIN
**Method:** DELETE

**Example Request:**
```bash
DELETE /api/templates/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Cannot delete template",
  "message": "Template has 15 active campaigns. Pause campaigns first or contact affected users."
}
```

---

### Campaign Launch

#### POST /api/campaigns/launch

**Purpose:** Launch campaign from template

**Authentication:** Required
**Permission:** USER, ADMIN
**Method:** POST

**Request Body:**

```typescript
interface LaunchCampaignRequest {
  templateId: string;              // Required, template UUID
  adAccountId: string;             // Required, Facebook ad account ID
  campaignName: string;            // Required, descriptive campaign name

  // Dynamic field values
  fieldValues: Record<string, string | number>; // Required, values for all required fields

  // Targeting configuration
  targeting: {
    locations: string[];           // Required, at least 1 location
    ageMin?: number;               // Optional, 13-65
    ageMax?: number;               // Optional, 13-65
    genders?: Array<'male' | 'female' | 'all'>; // Optional
    interests?: string[];          // Optional
    behaviors?: string[];          // Optional
  };

  // Budget configuration
  budget: {
    budgetType: 'daily' | 'lifetime'; // Required
    budget: number;                // Required, minimum $1
    startTime?: string;            // Optional, ISO 8601
    stopTime?: string;             // Optional, ISO 8601
    bidStrategy?: string;          // Optional
  };
}
```

**Example Request:**

```json
POST /api/campaigns/launch
Content-Type: application/json

{
  "templateId": "550e8400-e29b-41d4-a716-446655440000",
  "adAccountId": "act_123456789",
  "campaignName": "New Patient Special - March 2026",
  "fieldValues": {
    "company_name": "Bright Smile Dental",
    "offer_price": "$99",
    "offer_includes": "exam, x-rays, and cleaning",
    "business_location": "Downtown Denver",
    "phone_number": "(303) 555-1234",
    "website_url": "https://www.brightsmile.com"
  },
  "targeting": {
    "locations": ["Denver, CO"],
    "ageMin": 25,
    "ageMax": 65
  },
  "budget": {
    "budgetType": "daily",
    "budget": 50
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Campaign launched successfully",
  "campaign": {
    "id": "750e8400-e29b-41d4-a716-446655440001",
    "name": "New Patient Special - March 2026",
    "status": "PENDING_REVIEW",
    "objective": "OUTCOME_LEADS",
    "templateId": "550e8400-e29b-41d4-a716-446655440000",
    "adAccountId": "act_123456789",
    "createdAt": "2026-01-27T12:00:00Z",
    "facebookCampaignId": null,
    "estimatedApprovalTime": "15-30 minutes"
  }
}
```

**Error Responses:**

```typescript
// 400 Bad Request - Field validation error
{
  "error": "Invalid field values",
  "details": [
    {
      "field": "website_url",
      "message": "URL must start with https://"
    },
    {
      "field": "phone_number",
      "message": "Invalid phone number format"
    }
  ]
}

// 400 Bad Request - Launch validation error
{
  "error": "Invalid launch configuration",
  "details": {
    "targeting": "Audience size is too small (15,000). Minimum 50,000 recommended.",
    "budget": "Daily budget must be at least $5"
  }
}

// 403 Forbidden
{
  "error": "Forbidden",
  "message": "Ad account not found or access denied"
}

// 404 Not Found
{
  "error": "Template not found",
  "message": "Template with ID 550e8400-... does not exist"
}
```

---

### Analytics

#### GET /api/analytics/templates

**Purpose:** Get cross-account template performance analytics (ADMIN only)

**Authentication:** Required
**Permission:** ADMIN
**Method:** GET

**Query Parameters:**

```typescript
interface AnalyticsParams {
  startDate: string;    // Required, ISO 8601 date
  endDate: string;      // Required, ISO 8601 date
  category?: string;    // Optional, filter by category
  templateIds?: string; // Optional, comma-separated template IDs
}
```

**Example Request:**
```bash
GET /api/analytics/templates?startDate=2026-01-01&endDate=2026-01-31&category=general-dentist
```

**Response (200 OK):**

```json
{
  "success": true,
  "analytics": {
    "totals": {
      "totalTemplates": 15,
      "activeCampaigns": 87,
      "totalSpend": 45230.50,
      "avgRoas": 3.45
    },
    "templates": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "New Patient Special - $99",
        "category": "general-dentist",
        "accountsUsing": 12,
        "totalSpend": 12450.00,
        "avgRoas": 3.8,
        "avgCtr": 1.9,
        "avgCpc": 1.85,
        "avgCpm": 15.20,
        "timesUsed": 45,
        "conversions": 378,
        "revenue": 47310.00
      }
      // ... more templates
    ]
  },
  "categories": [
    {
      "category": "general-dentist",
      "count": 10
    },
    {
      "category": "orthodontist",
      "count": 3
    },
    {
      "category": "dental-supply-b2b",
      "count": 2
    }
  ]
}
```

---

#### GET /api/analytics/templates/[id]/breakdown

**Purpose:** Get per-account breakdown for specific template

**Authentication:** Required
**Permission:** ADMIN
**Method:** GET

**Path Parameters:**
- `id` (string): Template UUID

**Query Parameters:**
- `startDate` (string): ISO 8601 date
- `endDate` (string): ISO 8601 date

**Example Request:**
```bash
GET /api/analytics/templates/550e8400-e29b-41d4-a716-446655440000/breakdown?startDate=2026-01-01&endDate=2026-01-31
```

**Response (200 OK):**

```json
{
  "success": true,
  "template": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "New Patient Special - $99"
  },
  "breakdown": [
    {
      "adAccountId": "act_123456789",
      "accountName": "Bright Smile Dental",
      "spend": 1250.00,
      "roas": 4.2,
      "ctr": 2.1,
      "cpc": 1.50,
      "campaigns": 3,
      "launchedAt": "2025-12-15T10:00:00Z"
    },
    {
      "adAccountId": "act_987654321",
      "accountName": "Family Dental Care",
      "spend": 890.00,
      "roas": 3.8,
      "ctr": 1.8,
      "cpc": 1.95,
      "campaigns": 2,
      "launchedAt": "2026-01-05T14:30:00Z"
    }
    // ... more accounts
  ]
}
```

---

### Admin Operations

#### GET /api/admin/templates

**Purpose:** Get all templates (global + organization-specific) with admin metadata

**Authentication:** Required
**Permission:** ADMIN
**Method:** GET

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "New Patient Special - $99",
      "category": "general-dentist",
      "isGlobal": true,
      "timesUsed": 45,
      "createdAt": "2026-01-15T12:00:00Z",
      "performanceAggregate": {
        "avgRoas": 3.8,
        "totalSpend": 12450.00,
        "accountsUsing": 12
      },
      "_count": {
        "campaigns": 45
      }
    }
    // ... more templates
  ]
}
```

---

#### GET /api/admin/users

**Purpose:** List organization users

**Authentication:** Required
**Permission:** ADMIN
**Method:** GET

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-1",
      "email": "john@example.com",
      "name": "John Smith",
      "role": "USER",
      "createdAt": "2025-12-01T10:00:00Z",
      "lastLoginAt": "2026-01-27T08:30:00Z",
      "campaignsLaunched": 12,
      "status": "active"
    },
    {
      "id": "user-uuid-2",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN",
      "createdAt": "2025-11-15T09:00:00Z",
      "lastLoginAt": "2026-01-27T11:45:00Z",
      "campaignsLaunched": 3,
      "status": "active"
    }
  ]
}
```

---

#### POST /api/admin/users/invite

**Purpose:** Invite new user to organization

**Authentication:** Required
**Permission:** ADMIN
**Method:** POST

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "role": "USER",
  "sendWelcomeEmail": true
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "email": "newuser@example.com",
    "invitationSent": true,
    "expiresAt": "2026-02-03T12:00:00Z"
  }
}
```

---

#### PATCH /api/admin/users/[id]/role

**Purpose:** Change user role

**Authentication:** Required
**Permission:** ADMIN
**Method:** PATCH

**Path Parameters:**
- `id` (string): User UUID

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "user-uuid-1",
    "email": "john@example.com",
    "role": "ADMIN",
    "updatedAt": "2026-01-27T12:00:00Z"
  }
}
```

---

## Rate Limiting

### Rate Limit Configuration

The API implements rate limiting to ensure fair usage and system stability.

**Limits:**

| Endpoint Type | Limit | Window | Scope |
|--------------|-------|--------|-------|
| Template Read (GET /api/templates) | 100 req | 1 minute | Per user |
| Template Write (POST/PATCH/DELETE) | 20 req | 1 minute | Per user |
| Campaign Launch | 20 req | 1 minute | Per user |
| Analytics | 50 req | 1 minute | Per organization |
| Admin Operations | 100 req | 1 minute | Per admin |

### Rate Limit Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1738000800
```

**Header Definitions:**

- `X-RateLimit-Limit`: Maximum requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when window resets

### Rate Limit Exceeded Response

**Status Code:** 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit for this endpoint",
  "retryAfter": 45,
  "limit": 100,
  "window": "1 minute"
}
```

**Handling Rate Limits:**

```typescript
async function makeAPIRequest(url: string) {
  const response = await fetch(url);

  if (response.status === 429) {
    const data = await response.json();
    const retryAfter = data.retryAfter || 60;

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeAPIRequest(url);
  }

  return response.json();
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow a consistent structure:

```typescript
interface ErrorResponse {
  error: string;           // Error type/code
  message: string;         // Human-readable description
  details?: any;           // Additional error context
  timestamp?: string;      // ISO 8601 timestamp
  path?: string;          // API endpoint path
  requestId?: string;     // Unique request identifier
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| **200** | OK | Successful GET, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Invalid request body, validation errors |
| **401** | Unauthorized | Authentication required/failed |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **422** | Unprocessable Entity | Request valid but can't be processed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server-side error |
| **503** | Service Unavailable | Temporary outage (maintenance, overload) |

### Common Error Codes

```typescript
const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'Authentication required',
  AUTH_INVALID: 'Invalid authentication token',
  AUTH_EXPIRED: 'Authentication session expired',

  // Authorization
  FORBIDDEN: 'Insufficient permissions',
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ACCESS_DENIED: 'Access to resource denied',

  // Validation
  VALIDATION_ERROR: 'Request validation failed',
  INVALID_PARAMETER: 'Invalid parameter value',
  MISSING_REQUIRED: 'Missing required field',
  INVALID_FORMAT: 'Invalid format',

  // Business Logic
  TEMPLATE_NOT_FOUND: 'Template not found',
  CAMPAIGN_LIMIT_REACHED: 'Campaign limit reached',
  INSUFFICIENT_BUDGET: 'Insufficient budget',
  FACEBOOK_API_ERROR: 'Facebook API error',
  DUPLICATE_RESOURCE: 'Resource already exists',

  // System
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;
```

### Error Examples

#### Validation Error (400)

```json
{
  "error": "Validation error",
  "message": "Request validation failed",
  "details": [
    {
      "field": "budget.budget",
      "message": "Budget must be at least $1"
    },
    {
      "field": "targeting.locations",
      "message": "At least one location is required"
    }
  ],
  "timestamp": "2026-01-27T12:00:00Z"
}
```

#### Authentication Error (401)

```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "details": "Please log in to access this resource",
  "timestamp": "2026-01-27T12:00:00Z"
}
```

#### Permission Error (403)

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "details": "Only administrators can create global templates",
  "timestamp": "2026-01-27T12:00:00Z"
}
```

#### Resource Not Found (404)

```json
{
  "error": "Resource not found",
  "message": "Template not found",
  "details": "Template with ID 550e8400-... does not exist",
  "timestamp": "2026-01-27T12:00:00Z"
}
```

#### Internal Server Error (500)

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "requestId": "req_abc123xyz",
  "timestamp": "2026-01-27T12:00:00Z"
}
```

---

## Code Examples

### TypeScript/JavaScript (Frontend)

#### Fetch Templates

```typescript
import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  category: string;
  avgRoas: number | null;
}

function useTemplates(category?: string) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '20',
          sortBy: 'timesUsed',
          sortOrder: 'desc',
        });

        if (category) {
          params.append('category', category);
        }

        const response = await fetch(`/api/templates?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setTemplates(data.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [category]);

  return { templates, loading, error };
}

// Usage
function TemplateList() {
  const { templates, loading, error } = useTemplates('general-dentist');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {templates.map(template => (
        <li key={template.id}>
          {template.name} - ROAS: {template.avgRoas?.toFixed(2) || 'N/A'}
        </li>
      ))}
    </ul>
  );
}
```

#### Launch Campaign

```typescript
import { useState } from 'react';

interface LaunchCampaignParams {
  templateId: string;
  adAccountId: string;
  campaignName: string;
  fieldValues: Record<string, string | number>;
  targeting: {
    locations: string[];
    ageMin?: number;
    ageMax?: number;
  };
  budget: {
    budgetType: 'daily' | 'lifetime';
    budget: number;
  };
}

function useLaunchCampaign() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function launchCampaign(params: LaunchCampaignParams) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/campaigns/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to launch campaign');
      }

      const data = await response.json();
      return data.campaign;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { launchCampaign, loading, error };
}

// Usage
function LaunchButton() {
  const { launchCampaign, loading } = useLaunchCampaign();

  async function handleLaunch() {
    try {
      const campaign = await launchCampaign({
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        adAccountId: 'act_123456789',
        campaignName: 'New Patient Special - March 2026',
        fieldValues: {
          company_name: 'Bright Smile Dental',
          offer_price: '$99',
          phone_number: '(303) 555-1234',
          website_url: 'https://www.brightsmile.com',
        },
        targeting: {
          locations: ['Denver, CO'],
          ageMin: 25,
          ageMax: 65,
        },
        budget: {
          budgetType: 'daily',
          budget: 50,
        },
      });

      alert(`Campaign launched! ID: ${campaign.id}`);
    } catch (error) {
      alert(`Failed to launch: ${error.message}`);
    }
  }

  return (
    <button onClick={handleLaunch} disabled={loading}>
      {loading ? 'Launching...' : 'Launch Campaign'}
    </button>
  );
}
```

#### Fetch Analytics (Admin)

```typescript
async function fetchTemplateAnalytics(
  startDate: Date,
  endDate: Date,
  category?: string
) {
  const params = new URLSearchParams({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });

  if (category) {
    params.append('category', category);
  }

  const response = await fetch(`/api/analytics/templates?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
}

// Usage
async function displayAnalytics() {
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-01-31');

  const data = await fetchTemplateAnalytics(startDate, endDate, 'general-dentist');

  console.log('Total Spend:', data.analytics.totals.totalSpend);
  console.log('Avg ROAS:', data.analytics.totals.avgRoas);

  data.analytics.templates.forEach(template => {
    console.log(`${template.name}: ROAS ${template.avgRoas}`);
  });
}
```

---

### Error Handling Best Practices

```typescript
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = data.retryAfter || 60;

      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return apiRequest<T>(url, options);
    }

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();

      // Custom error class
      throw new APIError(
        errorData.message || 'Request failed',
        response.status,
        errorData.details
      );
    }

    return response.json();
  } catch (error) {
    // Network errors
    if (error instanceof TypeError) {
      throw new APIError('Network error - please check your connection', 0);
    }

    throw error;
  }
}

class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage with error handling
try {
  const templates = await apiRequest<TemplatesResponse>('/api/templates');
  console.log(templates.data);
} catch (error) {
  if (error instanceof APIError) {
    if (error.statusCode === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.statusCode === 403) {
      // Show permission denied
      alert('You do not have permission to access this resource');
    } else {
      // Generic error handling
      alert(`Error: ${error.message}`);
    }
  }
}
```

---

## Debugging Tips

### Enable Detailed Logging

```typescript
// In your API client
const DEBUG = process.env.NODE_ENV === 'development';

async function apiRequest(url: string, options: RequestInit = {}) {
  if (DEBUG) {
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
    });
  }

  const response = await fetch(url, options);

  if (DEBUG) {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
  }

  return response;
}
```

### Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click on failed request
5. View:
   - Request headers
   - Request payload
   - Response headers
   - Response body
   - Timing information

### Test API Endpoints

Use cURL or Postman for quick API testing:

```bash
# Test GET endpoint
curl -X GET 'http://localhost:3000/api/templates?page=1&limit=10' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN'

# Test POST endpoint
curl -X POST 'http://localhost:3000/api/campaigns/launch' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -d '{
    "templateId": "550e8400-e29b-41d4-a716-446655440000",
    "adAccountId": "act_123456789",
    "campaignName": "Test Campaign",
    "fieldValues": {...},
    "targeting": {...},
    "budget": {...}
  }'
```

---

## Support

For API-related questions or issues:

**Email:** api-support@yourcompany.com
**Documentation:** https://docs.yourcompany.com/api
**Status Page:** https://status.yourcompany.com

---

**Document Version:** 1.0.0
**Last Updated:** January 2026
**API Version:** v1
**Maintained by:** ORCHESTRAI Backend Team
**Feedback:** api-feedback@yourcompany.com
