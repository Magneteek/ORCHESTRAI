# Campaign Management API Documentation

Complete API reference for the Facebook Ads Manager Campaign Management endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Campaigns API](#campaigns-api)
- [Ad Sets API](#ad-sets-api)
- [Ads API](#ads-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

All endpoints require authentication via NextAuth.js session. Include the session token in requests.

**Response Format:**
```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## Campaigns API

### List Campaigns

**GET** `/api/campaigns`

List campaigns with pagination, search, and filters.

**Query Parameters:**
- `adAccountId` (required): string - Filter by ad account
- `page`: number - Page number (default: 1)
- `limit`: number - Items per page (default: 20, max: 100)
- `search`: string - Search by campaign name
- `status`: string - Filter by status (ACTIVE, PAUSED, DELETED, ARCHIVED)
- `objective`: string - Filter by objective
- `sortBy`: string - Sort field (name, createdAt, updatedAt, status)
- `sortOrder`: string - Sort direction (asc, desc)

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: "uuid",
      campaignId: "fb_campaign_id",
      name: "Campaign Name",
      objective: "OUTCOME_SALES",
      status: "ACTIVE",
      dailyBudget: 100.00,
      lifetimeBudget: null,
      startTime: "2024-01-01T00:00:00Z",
      stopTime: null,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      adSetCount: 3,
      templateId: "uuid"
    }
  ],
  meta: {
    page: 1,
    limit: 20,
    total: 45,
    totalPages: 3
  }
}
```

---

### Create Campaign

**POST** `/api/campaigns`

Create a new campaign on Facebook and in the database.

**Request Body:**
```typescript
{
  adAccountId: string; // Required
  name: string; // Required
  objective: CampaignObjective; // Required
  status?: CampaignStatus; // Default: PAUSED
  specialAdCategories?: SpecialAdCategory[];
  dailyBudget?: number; // In dollars
  lifetimeBudget?: number; // In dollars
  spendCap?: number; // In dollars
  bidStrategy?: BidStrategy;
  startTime?: string; // ISO 8601
  stopTime?: string; // ISO 8601
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    campaignId: "fb_campaign_id",
    name: "Campaign Name",
    objective: "OUTCOME_SALES",
    status: "PAUSED",
    dailyBudget: 100.00,
    lifetimeBudget: null,
    startTime: "2024-01-01T00:00:00Z",
    stopTime: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    facebookData: { /* Facebook API response */ }
  },
  message: "Campaign created successfully"
}
```

---

### Get Campaign

**GET** `/api/campaigns/[id]`

Retrieve a single campaign with ad sets and insights.

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    campaignId: "fb_campaign_id",
    name: "Campaign Name",
    objective: "OUTCOME_SALES",
    status: "ACTIVE",
    dailyBudget: 100.00,
    lifetimeBudget: null,
    startTime: "2024-01-01T00:00:00Z",
    stopTime: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    adSets: [
      {
        id: "uuid",
        adSetId: "fb_adset_id",
        name: "Ad Set Name",
        status: "ACTIVE",
        targeting: { /* targeting config */ },
        budget: 50.00,
        ads: [
          {
            id: "uuid",
            name: "Ad Name",
            status: "ACTIVE",
            creative: { /* creative data */ }
          }
        ]
      }
    ],
    template: {
      id: "uuid",
      name: "Template Name",
      category: "e-commerce"
    },
    insights: { /* cached insights if available */ }
  }
}
```

---

### Update Campaign

**PATCH** `/api/campaigns/[id]`

Update campaign properties. All fields are optional.

**Request Body:**
```typescript
{
  name?: string;
  status?: CampaignStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spendCap?: number;
  bidStrategy?: BidStrategy;
  startTime?: string; // ISO 8601
  stopTime?: string; // ISO 8601
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    campaignId: "fb_campaign_id",
    name: "Updated Campaign Name",
    objective: "OUTCOME_SALES",
    status: "ACTIVE",
    dailyBudget: 150.00,
    lifetimeBudget: null,
    startTime: "2024-01-01T00:00:00Z",
    stopTime: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    facebookData: { /* Facebook API response */ }
  },
  message: "Campaign updated successfully"
}
```

---

### Delete Campaign

**DELETE** `/api/campaigns/[id]`

Archive/delete a campaign (soft delete in database).

**Response:** `204 No Content`

---

### Duplicate Campaign

**POST** `/api/campaigns/[id]/duplicate`

Clone a campaign with optional new name.

**Request Body:**
```typescript
{
  name?: string; // New campaign name
  includeAdSets?: boolean; // Default: true
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    campaignId: "fb_campaign_id",
    name: "Campaign Name (Copy)",
    objective: "OUTCOME_SALES",
    status: "PAUSED",
    dailyBudget: 100.00,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    facebookData: { /* Facebook API response */ }
  },
  message: "Campaign duplicated successfully"
}
```

---

### Pause Campaign

**POST** `/api/campaigns/[id]/pause`

Pause an active campaign.

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    campaignId: "fb_campaign_id",
    name: "Campaign Name",
    status: "PAUSED",
    updatedAt: "2024-01-02T00:00:00Z"
  },
  message: "Campaign paused successfully"
}
```

---

### Resume Campaign

**POST** `/api/campaigns/[id]/resume`

Resume (activate) a paused campaign.

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    campaignId: "fb_campaign_id",
    name: "Campaign Name",
    status: "ACTIVE",
    updatedAt: "2024-01-02T00:00:00Z"
  },
  message: "Campaign resumed successfully"
}
```

---

### Get Campaign Insights

**GET** `/api/campaigns/[id]/insights`

Get cached insights or fetch fresh data from Facebook.

**Query Parameters:**
- `datePreset`: InsightsDatePreset - Date range preset (default: last_7d)
- `forceRefresh`: boolean - Skip cache and fetch fresh data

**Response:**
```typescript
{
  success: true,
  data: {
    campaignId: "fb_campaign_id",
    campaignName: "Campaign Name",
    datePreset: "last_7d",
    insights: {
      date_start: "2024-01-01",
      date_stop: "2024-01-07",
      impressions: 10000,
      reach: 8000,
      clicks: 500,
      spend: 350.00,
      cpm: 35.00,
      cpc: 0.70,
      ctr: 5.00,
      conversions: 25
    },
    fromCache: true,
    fetchedAt: "2024-01-08T00:00:00Z"
  },
  message: "Insights retrieved from cache"
}
```

---

### Fetch Fresh Insights

**POST** `/api/campaigns/[id]/insights`

Fetch fresh insights from Facebook (bypasses cache).

**Request Body:**
```typescript
{
  datePreset?: InsightsDatePreset; // Default: last_7d
  timeRange?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  fields?: string[]; // Specific metrics to fetch
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    campaignId: "fb_campaign_id",
    campaignName: "Campaign Name",
    datePreset: "last_7d",
    insights: { /* insights data */ },
    fetchedAt: "2024-01-08T00:00:00Z"
  },
  message: "Insights fetched successfully"
}
```

---

## Ad Sets API

### List Ad Sets

**GET** `/api/ad-sets`

List ad sets for a campaign.

**Query Parameters:**
- `campaignId` (required): string - Database campaign ID

**Response:**
```typescript
{
  success: true,
  data: {
    campaignId: "uuid",
    campaignName: "Campaign Name",
    adSets: [
      {
        id: "uuid",
        adSetId: "fb_adset_id",
        name: "Ad Set Name",
        status: "ACTIVE",
        targeting: { /* targeting config */ },
        budget: 50.00,
        bidStrategy: "LOWEST_COST_WITHOUT_CAP",
        billingEvent: "IMPRESSIONS",
        optimizationGoal: "LINK_CLICKS",
        startTime: "2024-01-01T00:00:00Z",
        endTime: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        adCount: 2
      }
    ]
  }
}
```

---

### Create Ad Set

**POST** `/api/ad-sets`

Create a new ad set with targeting.

**Request Body:**
```typescript
{
  campaignId: string; // Required - Database campaign ID
  name: string; // Required
  status?: CampaignStatus; // Default: PAUSED
  dailyBudget?: number;
  lifetimeBudget?: number;
  billingEvent?: BillingEvent;
  optimizationGoal?: OptimizationGoal;
  bidAmount?: number;
  bidStrategy?: BidStrategy;
  targeting?: AdTargeting;
  startTime?: string; // ISO 8601
  endTime?: string; // ISO 8601
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    adSetId: "fb_adset_id",
    name: "Ad Set Name",
    status: "PAUSED",
    targeting: { /* targeting config */ },
    budget: 50.00,
    bidStrategy: "LOWEST_COST_WITHOUT_CAP",
    billingEvent: "IMPRESSIONS",
    optimizationGoal: "LINK_CLICKS",
    startTime: "2024-01-01T00:00:00Z",
    endTime: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    facebookData: { /* Facebook API response */ }
  },
  message: "Ad set created successfully"
}
```

---

## Ads API

### List Ads

**GET** `/api/ads`

List ads for an ad set.

**Query Parameters:**
- `adSetId` (required): string - Database ad set ID

**Response:**
```typescript
{
  success: true,
  data: {
    adSetId: "uuid",
    adSetName: "Ad Set Name",
    campaignId: "uuid",
    ads: [
      {
        id: "uuid",
        adId: "fb_ad_id",
        name: "Ad Name",
        status: "ACTIVE",
        creative: {
          imageUrl: "https://...",
          headline: "Ad Headline",
          primaryText: "Ad copy text",
          description: "Ad description",
          callToActionType: "LEARN_MORE",
          linkUrl: "https://..."
        },
        templateId: "uuid",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Create Ad

**POST** `/api/ads`

Create a new ad with creative.

**Request Body:**
```typescript
{
  adSetId: string; // Required - Database ad set ID
  name: string; // Required
  status?: CampaignStatus; // Default: PAUSED
  creative: {
    imageUrl?: string;
    videoUrl?: string;
    imageHash?: string; // From upload-image endpoint
    videoId?: string;
    headline?: string;
    primaryText?: string;
    description?: string;
    callToActionType?: CallToActionType;
    linkUrl?: string;
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: "uuid",
    adId: "fb_ad_id",
    name: "Ad Name",
    status: "PAUSED",
    creative: {
      imageHash: "abc123",
      headline: "Ad Headline",
      primaryText: "Ad copy text",
      description: "Ad description",
      callToActionType: "LEARN_MORE",
      linkUrl: "https://..."
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    facebookData: { /* Facebook API response */ }
  },
  message: "Ad created successfully"
}
```

---

### Upload Image

**POST** `/api/ads/upload-image`

Upload an image to Facebook Ad Account for use in ad creatives.

**Request Body:**
```typescript
{
  adAccountId: string; // Required - Database ad account ID
  imageUrl?: string; // URL of image to upload
  imageData?: string; // Base64 encoded image data
  fileName?: string; // Original file name
}
```

**Note:** Provide either `imageUrl` OR `imageData`, not both.

**Response:**
```typescript
{
  success: true,
  data: {
    imageHash: "abc123", // Use this in ad creative
    url: "https://...",
    adAccountId: "act_123456",
    uploadedAt: "2024-01-01T00:00:00Z"
  },
  message: "Image uploaded successfully"
}
```

---

### Get Uploaded Images

**GET** `/api/ads/upload-image`

Get list of uploaded images for an ad account.

**Query Parameters:**
- `adAccountId` (required): string - Database ad account ID

**Response:**
```typescript
{
  success: true,
  data: {
    adAccountId: "act_123456",
    images: [
      {
        id: "fb_image_id",
        hash: "abc123",
        url: "https://...",
        name: "image.jpg",
        status: "ACTIVE",
        createdTime: "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable error message",
    details: { /* Additional error details */ }
  }
}
```

**Common Error Codes:**
- `BAD_REQUEST` (400): Invalid request parameters
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict
- `VALIDATION_ERROR` (422): Request validation failed
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_SERVER_ERROR` (500): Server error
- `FACEBOOK_API_ERROR` (500): Facebook API error

---

## Rate Limiting

The API implements rate limiting awareness for Facebook API calls:

- Campaigns are cached for 5 minutes
- Insights are cached for 5 minutes
- Rate limit information is tracked per ad account
- Automatic retry with exponential backoff on rate limit errors

**Rate Limit Headers:**
Facebook API responses include rate limit information which is logged and monitored.

---

## Security

### Authorization

All endpoints implement Row Level Security (RLS):

1. **Session Validation**: Every request validates NextAuth.js session
2. **Organization Ownership**: Verifies user's organization owns the resource
3. **Ad Account Access**: Validates access to ad accounts
4. **Token Encryption**: Access tokens are stored encrypted

### Input Validation

All endpoints use Zod schemas for request validation:

- Type-safe validation
- Detailed error messages
- Sanitized inputs
- SQL injection prevention

### Best Practices

1. **Always** check organization ownership before operations
2. **Always** validate campaign/ad set/ad ownership
3. **Always** sanitize user inputs
4. **Never** expose raw Facebook access tokens
5. **Use** encrypted token storage
6. **Implement** proper error handling
7. **Log** all Facebook API errors for debugging

---

## Example Usage

### Creating a Complete Campaign

```typescript
// 1. Create Campaign
const campaign = await fetch('/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adAccountId: 'uuid',
    name: 'Summer Sale Campaign',
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    dailyBudget: 100.00,
  }),
});

// 2. Create Ad Set
const adSet = await fetch('/api/ad-sets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: campaign.data.id,
    name: 'Target Audience 1',
    status: 'PAUSED',
    dailyBudget: 50.00,
    optimizationGoal: 'LINK_CLICKS',
    targeting: {
      age_min: 25,
      age_max: 45,
      genders: [1, 2],
      geo_locations: {
        countries: ['US'],
      },
    },
  }),
});

// 3. Upload Image
const image = await fetch('/api/ads/upload-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adAccountId: 'uuid',
    imageUrl: 'https://example.com/ad-image.jpg',
  }),
});

// 4. Create Ad
const ad = await fetch('/api/ads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adSetId: adSet.data.id,
    name: 'Summer Sale Ad 1',
    status: 'PAUSED',
    creative: {
      imageHash: image.data.imageHash,
      headline: 'Summer Sale - 50% Off!',
      primaryText: 'Don\'t miss our biggest sale of the year.',
      description: 'Shop now and save big.',
      callToActionType: 'SHOP_NOW',
      linkUrl: 'https://example.com/sale',
    },
  }),
});

// 5. Activate Campaign
await fetch(`/api/campaigns/${campaign.data.id}/resume`, {
  method: 'POST',
});
```

---

## Support

For issues or questions:
- Check error messages and codes
- Review Facebook Marketing API documentation
- Check server logs for detailed error information
- Monitor rate limit usage via dashboard
