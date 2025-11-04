# Facebook Marketing API Integration

Comprehensive Facebook Marketing API client for Node.js/Next.js applications with TypeScript support, rate limiting, caching, and queue management.

## Features

- ✅ **Full TypeScript Support** - Comprehensive type definitions for all Facebook API entities
- ✅ **Rate Limiting** - Redis-based rate limiter with automatic backoff and retry
- ✅ **Caching** - Redis caching for frequently accessed data (15-30 min TTL)
- ✅ **Error Handling** - Sophisticated error classification and retry logic
- ✅ **OAuth Flow** - Complete OAuth 2.0 implementation with PKCE support
- ✅ **Batch Requests** - Optimize API calls with batch processing (up to 50 requests)
- ✅ **Queue Management** - Background job processing with BullMQ
- ✅ **Campaign Management** - Create, update, pause/resume campaigns
- ✅ **Ad Set Management** - Create and manage ad sets with targeting
- ✅ **Ad Management** - Create ads with creative, upload images
- ✅ **Insights** - Fetch performance metrics and analytics
- ✅ **Token Encryption** - Secure token storage with AES-256-GCM

## Installation

The required dependencies are already in `package.json`:

```json
{
  "dependencies": {
    "facebook-nodejs-business-sdk": "^21.0.0",
    "ioredis": "^5.4.1",
    "bullmq": "^5.23.1",
    "axios": "^1.7.7"
  }
}
```

## Quick Start

### 1. Environment Configuration

Add to your `.env` file:

```bash
# Facebook / Meta
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_API_VERSION=v22.0

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth (for OAuth redirect)
NEXTAUTH_URL=http://localhost:3000
```

### 2. Initialize the API

```typescript
import Redis from 'ioredis';
import { createFacebookAPI } from '@/lib/facebook';

// Create Redis instance
const redis = new Redis(process.env.REDIS_URL);

// Create Facebook API instance
const facebookAPI = createFacebookAPI(redis);

// Set access token (from user authentication)
facebookAPI.setAccessToken(userAccessToken);
```

### 3. Basic Usage

```typescript
// Sync business accounts
const businesses = await facebookAPI.businesses.syncBusinessAccounts(userId);

// Sync ad accounts
const adAccounts = await facebookAPI.adAccounts.syncAdAccounts(businessId);

// Get campaigns
const campaigns = await facebookAPI.campaigns.syncCampaigns(adAccountId);

// Get insights
const insights = await facebookAPI.insights.getAccountInsights(adAccountId, {
  level: 'account',
  date_preset: 'last_7d',
});
```

## Core Components

### FacebookClient

Main API client with error handling and rate limiting.

```typescript
import { createFacebookClient } from '@/lib/facebook';

const client = createFacebookClient(
  {
    appId: process.env.FACEBOOK_APP_ID!,
    appSecret: process.env.FACEBOOK_APP_SECRET!,
    apiVersion: 'v22.0',
    accessToken: userToken,
  },
  redis
);

// Test connection
const { success, userId } = await client.testConnection();

// Get token info
const tokenInfo = await client.getDebugToken();
```

### FacebookOAuth

Complete OAuth 2.0 implementation.

```typescript
import { FacebookOAuth } from '@/lib/facebook';

const oauth = new FacebookOAuth({
  appId: process.env.FACEBOOK_APP_ID!,
  appSecret: process.env.FACEBOOK_APP_SECRET!,
  redirectUri: 'http://localhost:3000/api/auth/callback/facebook',
  apiVersion: 'v22.0',
});

// Generate authorization URL
const { url, state } = oauth.generateAuthUrl({
  scopes: ['ads_management', 'business_management'],
  usePKCE: true,
});

// Exchange code for token
const tokens = await oauth.exchangeCodeForToken(code, codeVerifier);

// Get long-lived token (60 days)
const longLivedToken = await oauth.getLongLivedToken(tokens.accessToken);

// Create system user token (never expires)
const systemToken = await oauth.createSystemUserToken(
  businessId,
  adminToken
);
```

### Rate Limiter

Redis-based rate limiting with automatic retry.

```typescript
import { FacebookRateLimiter } from '@/lib/facebook';

const rateLimiter = new FacebookRateLimiter(redis, {
  maxCallsPerAccount: 200, // Per hour
  batchSize: 50,
  retryAttempts: 3,
});

// Check rate limit
const allowed = await rateLimiter.checkRateLimit(adAccountId);

// Execute with rate limiting
const result = await rateLimiter.executeWithRateLimit(
  adAccountId,
  async () => {
    // Your API call here
    return await someAPICall();
  }
);

// Batch requests
const results = await rateLimiter.batchRequests(
  adAccountId,
  items,
  async (batch) => {
    // Process batch
    return await processBatch(batch);
  }
);
```

## Data Sync

### Business Accounts

```typescript
// Sync all businesses
const result = await facebookAPI.businesses.syncBusinessAccounts(userId);

// Get specific business
const business = await facebookAPI.businesses.getBusiness(businessId);

// Get business users
const users = await facebookAPI.businesses.getBusinessUsers(businessId);
```

### Ad Accounts

```typescript
// Sync ad accounts for business
const result = await facebookAPI.adAccounts.syncAdAccounts(businessId);

// Get specific ad account
const account = await facebookAPI.adAccounts.getAdAccount(adAccountId);

// Check account health
const health = await facebookAPI.adAccounts.checkAccountHealth(adAccountId);
// {
//   isActive: true,
//   status: 1,
//   canRunAds: true,
//   issues: []
// }
```

### Campaigns

```typescript
// Sync campaigns
const result = await facebookAPI.campaigns.syncCampaigns(adAccountId);

// Get active campaigns
const active = await facebookAPI.campaigns.getActiveCampaigns(adAccountId);

// Search campaigns
const found = await facebookAPI.campaigns.searchCampaigns(
  adAccountId,
  'Black Friday'
);

// Get campaign stats
const stats = await facebookAPI.campaigns.getCampaignStats(adAccountId);
```

### Ad Sets

```typescript
// Sync ad sets for campaign
const result = await facebookAPI.adSets.syncAdSets(campaignId, adAccountId);

// Get specific ad set
const adSet = await facebookAPI.adSets.getAdSet(adSetId, adAccountId);
```

### Ads

```typescript
// Sync ads for ad set
const result = await facebookAPI.ads.syncAds(adSetId, adAccountId);

// Get ad preview
const preview = await facebookAPI.ads.getAdPreview(
  adId,
  adAccountId,
  'DESKTOP_FEED_STANDARD'
);
```

### Insights

```typescript
// Account insights
const insights = await facebookAPI.insights.getAccountInsights(adAccountId, {
  level: 'account',
  date_preset: 'last_7d',
  fields: ['impressions', 'reach', 'clicks', 'spend', 'cpm', 'cpc', 'ctr'],
});

// Campaign insights
const campaignInsights = await facebookAPI.insights.getCampaignInsights(
  campaignId,
  adAccountId,
  {
    level: 'campaign',
    date_preset: 'last_30d',
  }
);

// Performance summary
const summary = await facebookAPI.insights.getPerformanceSummary(
  campaignId,
  adAccountId,
  'campaign',
  'last_7d'
);
// {
//   impressions: 10000,
//   reach: 8000,
//   clicks: 500,
//   spend: 100.50,
//   cpm: 10.05,
//   cpc: 0.20,
//   ctr: 5.0
// }

// Time series insights
const timeSeries = await facebookAPI.insights.getTimeSeriesInsights(
  campaignId,
  adAccountId,
  'campaign',
  { since: '2024-01-01', until: '2024-01-31' },
  1 // Daily
);

// Breakdown insights (by age, gender, device, etc.)
const breakdown = await facebookAPI.insights.getBreakdownInsights(
  campaignId,
  adAccountId,
  'campaign',
  ['age', 'gender'],
  'last_7d'
);
```

## Campaign Management

### Create Campaign

```typescript
// Create campaign
const campaign = await facebookAPI.campaignCreator.createCampaign(
  adAccountId,
  {
    name: 'Black Friday Sale 2024',
    objective: 'OUTCOME_SALES',
    status: 'PAUSED',
    dailyBudget: 100, // $100/day
    startTime: '2024-11-25T00:00:00Z',
    stopTime: '2024-11-30T23:59:59Z',
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
  }
);

// Create from template
const campaignFromTemplate = await facebookAPI.campaignCreator.createFromTemplate(
  adAccountId,
  'conversions',
  {
    name: 'My Conversions Campaign',
    dailyBudget: 50,
  }
);

// Available templates
const templates = facebookAPI.campaignCreator.getAvailableTemplates();
// ['awareness', 'traffic', 'engagement', 'leads', 'conversions', ...]
```

### Update Campaign

```typescript
// Update campaign
const updated = await facebookAPI.campaignUpdater.updateCampaign(
  campaignId,
  adAccountId,
  {
    name: 'Updated Campaign Name',
    dailyBudget: 150,
    stopTime: '2024-12-31T23:59:59Z',
  }
);

// Update budget
await facebookAPI.campaignUpdater.updateBudget(campaignId, adAccountId, {
  daily: 200,
  spendCap: 5000,
});

// Update schedule
await facebookAPI.campaignUpdater.updateSchedule(campaignId, adAccountId, {
  startTime: '2024-11-01T00:00:00Z',
  stopTime: '2024-12-31T23:59:59Z',
});

// Batch update
const result = await facebookAPI.campaignUpdater.batchUpdate(
  [campaignId1, campaignId2, campaignId3],
  adAccountId,
  { dailyBudget: 100 }
);
// { successful: [...], failed: [...] }
```

### Campaign Status

```typescript
// Pause campaign
await facebookAPI.campaignStatus.pauseCampaign(campaignId, adAccountId);

// Resume campaign
await facebookAPI.campaignStatus.resumeCampaign(campaignId, adAccountId);

// Archive campaign
await facebookAPI.campaignStatus.archiveCampaign(campaignId, adAccountId);

// Check if can activate
const check = await facebookAPI.campaignStatus.canActivate(
  campaignId,
  adAccountId
);
// { canActivate: true, issues: [] }

// Schedule activation
await facebookAPI.campaignStatus.scheduleActivation(
  campaignId,
  adAccountId,
  '2024-11-25T00:00:00Z',
  '2024-11-30T23:59:59Z'
);

// Batch operations
await facebookAPI.campaignStatus.batchPause([...campaignIds], adAccountId);
await facebookAPI.campaignStatus.batchResume([...campaignIds], adAccountId);
```

## Ad Set Management

```typescript
// Create ad set
const adSet = await facebookAPI.adSetCreator.createAdSet(adAccountId, {
  name: 'My Ad Set',
  campaignId: campaignId,
  status: 'PAUSED',
  dailyBudget: 50,
  billingEvent: 'IMPRESSIONS',
  optimizationGoal: 'LINK_CLICKS',
  targeting: {
    geo_locations: { countries: ['US'] },
    age_min: 25,
    age_max: 45,
    genders: [1, 2], // All genders
    interests: [
      { id: '6003139266461', name: 'Online shopping' },
    ],
  },
  promotedObject: {
    pixel_id: 'YOUR_PIXEL_ID',
    custom_event_type: 'PURCHASE',
  },
});

// Create from template
const adSetFromTemplate = await facebookAPI.adSetCreator.createFromTemplate(
  adAccountId,
  campaignId,
  'default-conversions',
  {
    name: 'Custom Ad Set',
    dailyBudget: 75,
  }
);
```

## Ad Management

```typescript
// Upload image
const image = await facebookAPI.adCreator.uploadImage(
  adAccountId,
  'https://example.com/image.jpg',
  'my-image.jpg'
);
// { hash: '...', url: '...' }

// Create ad
const ad = await facebookAPI.adCreator.createAd(adAccountId, {
  name: 'My Ad',
  adsetId: adSetId,
  status: 'PAUSED',
  creative: {
    name: 'My Creative',
    body: 'Check out our amazing products!',
    title: 'Shop Now',
    imageHash: image.hash,
    linkUrl: 'https://example.com',
    callToActionType: 'SHOP_NOW',
    pageId: 'YOUR_PAGE_ID',
  },
});

// Duplicate ad
const duplicate = await facebookAPI.adCreator.duplicateAd(
  adId,
  adAccountId,
  'Ad Copy',
  newAdSetId
);
```

## Queue Management

Background job processing with BullMQ:

```typescript
import { createQueueManager } from '@/lib/facebook';

const queueManager = createQueueManager(redis, facebookAPI);

// Start worker
queueManager.startWorker(5); // 5 concurrent jobs

// Add job
const job = await queueManager.addJob({
  type: 'sync-campaigns',
  userId: 'user-123',
  accessToken: userToken,
  adAccountId: 'act_123',
  options: { forceRefresh: true },
});

// Wait for completion
const result = await queueManager.waitForJobCompletion(job.id);

// Get job status
const status = await queueManager.getJobStatus(job.id);
// { state: 'completed', result: {...} }

// Get metrics
const metrics = await queueManager.getMetrics();
// { waiting: 5, active: 3, completed: 100, failed: 2, delayed: 0 }

// Stop worker
await queueManager.stopWorker();
```

## Error Handling

Sophisticated error classification and handling:

```typescript
import {
  FacebookError,
  FacebookOAuthError,
  FacebookRateLimitError,
  FacebookPermissionError,
  FacebookValidationError,
  FacebookErrorFactory,
} from '@/lib/facebook';

try {
  await facebookAPI.campaigns.syncCampaigns(adAccountId);
} catch (error) {
  if (error instanceof FacebookRateLimitError) {
    // Rate limit hit
    const delay = error.getBackoffDelay();
    console.log(`Rate limited, retry after ${delay}ms`);
  } else if (error instanceof FacebookOAuthError) {
    // Token expired or invalid
    console.log('Re-authentication required');
  } else if (error instanceof FacebookPermissionError) {
    // Missing permissions
    console.log('Required permissions:', error.requiredPermissions);
  } else if (error instanceof FacebookValidationError) {
    // Invalid parameters
    console.log('Validation error:', error.field, error.value);
  }

  // Check if retryable
  if (FacebookErrorFactory.isRetryable(error)) {
    const delay = FacebookErrorFactory.getRetryDelay(error, 1);
    // Retry after delay
  }

  // Check if requires re-auth
  if (FacebookErrorFactory.requiresReauth(error)) {
    // Redirect to OAuth flow
  }
}
```

## Best Practices

### 1. Rate Limiting

Always use the rate limiter for batch operations:

```typescript
const rateLimiter = facebookAPI.getRateLimiter();

await rateLimiter.batchRequests(
  adAccountId,
  campaignIds,
  async (batch) => {
    // Process batch of campaigns
    return await Promise.all(
      batch.map((id) => processCampaign(id))
    );
  },
  { batchSize: 10 }
);
```

### 2. Caching

Leverage caching for frequently accessed data:

```typescript
// First call - fetches from API
const campaigns = await facebookAPI.campaigns.syncCampaigns(adAccountId);

// Subsequent calls within 10 minutes - returns from cache
const cachedCampaigns = await facebookAPI.campaigns.syncCampaigns(adAccountId);

// Force refresh
const fresh = await facebookAPI.campaigns.syncCampaigns(adAccountId, {
  forceRefresh: true,
});
```

### 3. Token Security

Always encrypt tokens before storing:

```typescript
import { FacebookOAuth } from '@/lib/facebook';

// Encrypt token
const encrypted = FacebookOAuth.encryptToken(
  accessToken,
  process.env.ENCRYPTION_KEY!
);

// Store encrypted token in database
await db.tokens.create({ userId, encryptedToken: encrypted });

// Decrypt token
const decrypted = FacebookOAuth.decryptToken(
  encrypted,
  process.env.ENCRYPTION_KEY!
);
```

### 4. Background Jobs

Use queue for long-running operations:

```typescript
// Instead of this (blocks request)
const insights = await facebookAPI.insights.getAccountInsights(...);

// Do this (async processing)
const job = await queueManager.addJob({
  type: 'sync-insights',
  userId,
  accessToken,
  adAccountId,
  params: { date_preset: 'last_30d' },
});

// Return job ID to client
return { jobId: job.id };
```

## API Reference

See [types/facebook.ts](/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/types/facebook.ts) for complete type definitions.

## License

MIT
