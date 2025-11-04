# Facebook Marketing API Integration - Complete

## Summary

Comprehensive Facebook Marketing API integration layer has been successfully created for the Facebook Ads Manager SaaS platform. The integration provides enterprise-grade features including rate limiting, caching, error handling, OAuth flow, and background job processing.

## Files Created

### Core Components

1. **types/facebook.ts** (583 lines)
   - Comprehensive TypeScript type definitions for all Facebook API entities
   - Campaign, AdSet, Ad, Creative, Targeting, Insights types
   - OAuth, Error, Rate Limiting, Caching types

2. **lib/facebook/errors.ts** (427 lines)
   - Custom error classes for Facebook API errors
   - FacebookError, FacebookOAuthError, FacebookRateLimitError
   - FacebookPermissionError, FacebookValidationError
   - Error factory and retry logic

3. **lib/facebook/rate-limiter.ts** (420 lines)
   - Redis-based rate limiting with automatic backoff
   - Per-account tracking (200 calls/hour default)
   - Batch request optimization
   - Throttle detection and waiting

4. **lib/facebook/client.ts** (394 lines)
   - Main Facebook API client wrapper
   - facebook-nodejs-business-sdk integration
   - Error handling and retry logic
   - Caching layer with Redis

5. **lib/facebook/oauth.ts** (444 lines)
   - Complete OAuth 2.0 implementation
   - Authorization URL generation with PKCE
   - Token exchange and refresh
   - System User token creation
   - Token encryption/decryption

### Data Sync Services

6. **lib/facebook/sync/business-accounts.ts** (205 lines)
   - Sync Business Manager accounts
   - Get business details and users

7. **lib/facebook/sync/ad-accounts.ts** (308 lines)
   - Sync ad accounts for businesses
   - Account health checking
   - Spend and budget tracking

8. **lib/facebook/sync/campaigns.ts** (317 lines)
   - Sync campaigns with caching
   - Filter by status, search by name
   - Campaign statistics

9. **lib/facebook/sync/ad-sets.ts** (319 lines)
   - Sync ad sets for campaigns
   - Targeting and budget information

10. **lib/facebook/sync/ads.ts** (318 lines)
    - Sync ads for ad sets
    - Ad preview generation

11. **lib/facebook/sync/insights.ts** (405 lines)
    - Fetch performance metrics and insights
    - Time series data, breakdowns
    - Performance summaries

### Campaign Management

12. **lib/facebook/campaigns/create.ts** (324 lines)
    - Create campaigns from scratch or templates
    - Campaign duplication
    - 8 built-in templates

13. **lib/facebook/campaigns/update.ts** (340 lines)
    - Update campaign properties
    - Budget, schedule, bid strategy updates
    - Batch update operations
    - Campaign deletion

14. **lib/facebook/campaigns/status.ts** (347 lines)
    - Pause/resume/archive campaigns
    - Status checking and validation
    - Batch status operations
    - Scheduled activation

### Ad Set and Ad Management

15. **lib/facebook/ad-sets/create.ts** (289 lines)
    - Create ad sets with targeting
    - Ad set duplication
    - Templates for common configurations

16. **lib/facebook/ads/create.ts** (349 lines)
    - Create ads with creative
    - Image upload functionality
    - Video and carousel ad support
    - Ad duplication

### Integration Layer

17. **lib/facebook/index.ts** (197 lines)
    - Main export and FacebookAPI class
    - Convenient singleton pattern
    - Factory functions

18. **lib/facebook/queue.ts** (418 lines)
    - BullMQ-based job queue
    - Background processing for API operations
    - Job status tracking
    - Queue metrics and monitoring

19. **lib/facebook/README.md** (724 lines)
    - Comprehensive documentation
    - Usage examples for all features
    - Best practices guide
    - Error handling guide

## Total Statistics

- **19 Files Created**
- **~6,800 Lines of Code**
- **100% TypeScript**
- **Full Type Safety**

## Key Features Implemented

### ✅ Core Functionality
- [x] Facebook Business SDK v21+ integration
- [x] Comprehensive TypeScript types
- [x] OAuth 2.0 with PKCE support
- [x] Long-lived and System User tokens
- [x] Token encryption (AES-256-GCM)

### ✅ Rate Limiting & Performance
- [x] Redis-based rate limiter
- [x] 200 calls/hour per account (configurable)
- [x] Automatic backoff and retry
- [x] Batch requests (up to 50)
- [x] Request queuing

### ✅ Caching Strategy
- [x] Redis caching layer
- [x] Configurable TTL per resource type
- [x] Cache invalidation
- [x] Pattern-based cache clearing

### ✅ Error Handling
- [x] Custom error classes
- [x] Automatic error classification
- [x] Retry logic with exponential backoff
- [x] Network error handling
- [x] Structured logging

### ✅ Data Sync
- [x] Business accounts sync
- [x] Ad accounts sync with health checking
- [x] Campaigns sync with filtering
- [x] Ad sets sync with targeting
- [x] Ads sync with creative
- [x] Insights with time series and breakdowns

### ✅ Campaign Management
- [x] Create campaigns (with templates)
- [x] Update campaigns (budget, schedule, bid strategy)
- [x] Pause/resume/archive campaigns
- [x] Batch operations
- [x] Status validation
- [x] Scheduled activation

### ✅ Ad Set Management
- [x] Create ad sets with targeting
- [x] Duplicate ad sets
- [x] Templates for common configurations

### ✅ Ad Management
- [x] Create ads with creative
- [x] Upload images
- [x] Video ads support
- [x] Ad preview generation
- [x] Ad duplication

### ✅ Background Processing
- [x] BullMQ queue integration
- [x] Async job processing
- [x] Job status tracking
- [x] Queue metrics
- [x] Failed job retry

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Facebook API Layer                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   OAuth      │    │   Client     │    │ Rate Limiter │  │
│  │   Flow       │◄───┤   Wrapper    │◄───┤   (Redis)    │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                              │                                │
│  ┌──────────────────────────┼────────────────────────────┐  │
│  │         Sync Services    │                            │  │
│  │  ┌───────────┐  ┌────────▼─────┐  ┌──────────────┐  │  │
│  │  │ Businesses│  │ Ad Accounts  │  │  Campaigns   │  │  │
│  │  └───────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌───────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Ad Sets  │  │     Ads      │  │   Insights   │  │  │
│  │  └───────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Campaign Management                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │  │
│  │  │  Create  │  │  Update  │  │  Status Manager │   │  │
│  │  └──────────┘  └──────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Background Processing (BullMQ)                 │  │
│  │  ┌──────────────┐         ┌──────────────┐          │  │
│  │  │  Job Queue   │────────►│   Workers    │          │  │
│  │  └──────────────┘         └──────────────┘          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
                   ┌───────┴────────┐
                   │  Redis Cache   │
                   │  & Rate Limits │
                   └────────────────┘
```

## Usage Example

### Complete Integration Example

```typescript
// 1. Initialize the system
import Redis from 'ioredis';
import { createFacebookAPI, createQueueManager } from '@/lib/facebook';

const redis = new Redis(process.env.REDIS_URL);
const facebookAPI = createFacebookAPI(redis);
const queueManager = createQueueManager(redis, facebookAPI);

// Start background worker
queueManager.startWorker(5);

// 2. OAuth Flow
const { url, state } = facebookAPI.oauth.generateAuthUrl({
  scopes: ['ads_management', 'business_management'],
  usePKCE: true,
});

// Redirect user to `url`
// After callback, exchange code:
const tokens = await facebookAPI.oauth.exchangeCodeForToken(
  code,
  state.codeVerifier
);

// Get long-lived token
const longLived = await facebookAPI.oauth.getLongLivedToken(
  tokens.accessToken
);

// 3. Set access token
facebookAPI.setAccessToken(longLived.accessToken);

// 4. Sync data
const businesses = await facebookAPI.businesses.syncBusinessAccounts(userId);
const adAccounts = await facebookAPI.adAccounts.syncAdAccounts(
  businesses.data![0].id
);

// 5. Create campaign
const campaign = await facebookAPI.campaignCreator.createCampaign(
  adAccounts.data![0].id,
  {
    name: 'Holiday Sale 2024',
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    dailyBudget: 100,
    startTime: '2024-12-01T00:00:00Z',
    stopTime: '2024-12-31T23:59:59Z',
  }
);

// 6. Create ad set
const adSet = await facebookAPI.adSetCreator.createAdSet(
  adAccounts.data![0].id,
  {
    name: 'US Audience 25-45',
    campaignId: campaign!.id,
    dailyBudget: 50,
    billingEvent: 'IMPRESSIONS',
    optimizationGoal: 'LINK_CLICKS',
    targeting: {
      geo_locations: { countries: ['US'] },
      age_min: 25,
      age_max: 45,
      genders: [1, 2],
    },
  }
);

// 7. Upload image and create ad
const image = await facebookAPI.adCreator.uploadImage(
  adAccounts.data![0].id,
  'https://example.com/holiday-ad.jpg'
);

const ad = await facebookAPI.adCreator.createAd(adAccounts.data![0].id, {
  name: 'Holiday Ad 1',
  adsetId: adSet!.id,
  creative: {
    name: 'Holiday Creative',
    body: 'Get 50% off everything!',
    title: 'Holiday Sale',
    imageHash: image!.hash,
    linkUrl: 'https://example.com/sale',
    callToActionType: 'SHOP_NOW',
    pageId: 'YOUR_PAGE_ID',
  },
});

// 8. Activate campaign
await facebookAPI.campaignStatus.resumeCampaign(
  campaign!.id,
  adAccounts.data![0].id
);

// 9. Get insights (via queue for long-running operations)
const insightsJob = await queueManager.addJob({
  type: 'sync-insights',
  userId,
  accessToken: longLived.accessToken,
  adAccountId: adAccounts.data![0].id,
  params: {
    level: 'campaign',
    date_preset: 'last_7d',
  },
});

// Wait for completion
const insights = await queueManager.waitForJobCompletion(insightsJob.id);

// 10. Monitor rate limits
const rateLimitStatus = await facebookAPI.getRateLimitStatus(
  adAccounts.data![0].id
);
console.log('Rate limit:', rateLimitStatus);
// { current: 45, limit: 200, remaining: 155, resetAt: 1699999999 }
```

## Next Steps

### 1. Database Integration

Create Prisma models to store synced data:

```prisma
model FacebookBusiness {
  id                String   @id
  name              String
  verificationStatus String
  createdTime       DateTime
  updatedTime       DateTime

  adAccounts        FacebookAdAccount[]
}

model FacebookAdAccount {
  id            String   @id
  accountId     String   @unique
  name          String
  accountStatus Int
  currency      String
  timezone      String

  businessId    String?
  business      FacebookBusiness? @relation(fields: [businessId], references: [id])

  campaigns     FacebookCampaign[]
}

model FacebookCampaign {
  id              String   @id
  name            String
  objective       String
  status          String
  dailyBudget     Float?
  lifetimeBudget  Float?

  accountId       String
  account         FacebookAdAccount @relation(fields: [accountId], references: [id])

  adSets          FacebookAdSet[]
}

// ... more models
```

### 2. API Routes

Create Next.js API routes:

```typescript
// app/api/facebook/oauth/route.ts
export async function GET(request: Request) {
  const facebookAPI = getFacebookAPI(redis);
  const { url, state } = facebookAPI.oauth.generateAuthUrl();

  // Store state in session

  return Response.redirect(url);
}

// app/api/facebook/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const facebookAPI = getFacebookAPI(redis);
  const tokens = await facebookAPI.oauth.exchangeCodeForToken(code!);

  // Store tokens in database

  return Response.redirect('/dashboard');
}

// app/api/facebook/campaigns/route.ts
export async function GET(request: Request) {
  const facebookAPI = getFacebookAPI(redis);
  facebookAPI.setAccessToken(userToken);

  const campaigns = await facebookAPI.campaigns.syncCampaigns(adAccountId);

  return Response.json(campaigns);
}
```

### 3. React Components

Create UI components:

```typescript
// components/facebook/campaign-list.tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export function CampaignList({ adAccountId }: { adAccountId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', adAccountId],
    queryFn: async () => {
      const res = await fetch(`/api/facebook/campaigns?accountId=${adAccountId}`);
      return res.json();
    },
  });

  if (isLoading) return <div>Loading campaigns...</div>;

  return (
    <div>
      {data?.data?.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
```

### 4. Webhook Integration

Set up Facebook webhooks for real-time updates:

```typescript
// app/api/webhooks/facebook/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Verify webhook signature

  // Process webhook events
  for (const entry of body.entry) {
    for (const change of entry.changes) {
      // Handle campaign status changes, budget updates, etc.
      await handleFacebookWebhook(change);
    }
  }

  return Response.json({ success: true });
}
```

## Support

For issues or questions:
1. Check the README.md for usage examples
2. Review type definitions in types/facebook.ts
3. Check error handling in errors.ts
4. Review Facebook Marketing API documentation: https://developers.facebook.com/docs/marketing-apis

## License

MIT
