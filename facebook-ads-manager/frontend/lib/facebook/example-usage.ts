/**
 * Facebook API Integration - Example Usage
 * Demonstrates how to use the Facebook API client
 */

import Redis from 'ioredis';
import { createFacebookAPI } from './index';

/**
 * Initialize the Facebook API
 */
async function initializeFacebookAPI() {
  // Create Redis connection
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  // Create Facebook API instance
  const facebookAPI = createFacebookAPI(redis);

  return { facebookAPI, redis };
}

/**
 * Example: OAuth Flow
 */
async function exampleOAuthFlow() {
  const { facebookAPI } = await initializeFacebookAPI();

  // Step 1: Generate authorization URL
  const { url, state } = facebookAPI.oauth.generateAuthUrl({
    scopes: [
      'ads_management',
      'ads_read',
      'business_management',
      'pages_manage_ads',
      'read_insights',
    ],
    usePKCE: true, // Use PKCE for enhanced security
  });

  console.log('Redirect user to:', url);
  console.log('Store state:', state);

  // Step 2: After user authorizes, exchange code for token
  // (This happens in your callback endpoint)
  const mockCode = 'authorization_code_from_facebook';
  const tokens = await facebookAPI.oauth.exchangeCodeForToken(
    mockCode,
    state.codeVerifier
  );

  console.log('Short-lived token:', tokens.accessToken);

  // Step 3: Exchange for long-lived token (60 days)
  const longLivedToken = await facebookAPI.oauth.getLongLivedToken(
    tokens.accessToken
  );

  console.log('Long-lived token (60 days):', longLivedToken.accessToken);

  // Step 4: Validate token
  const tokenInfo = await facebookAPI.oauth.validateToken(
    longLivedToken.accessToken
  );

  console.log('Token info:', tokenInfo);

  return longLivedToken.accessToken;
}

/**
 * Example: Sync Business Data
 */
async function exampleSyncBusinessData(accessToken: string, userId: string) {
  const { facebookAPI } = await initializeFacebookAPI();

  // Set access token
  facebookAPI.setAccessToken(accessToken);

  // Test connection
  const connection = await facebookAPI.testConnection();
  console.log('Connection test:', connection);

  // Sync businesses
  console.log('\n=== Syncing Businesses ===');
  const businesses = await facebookAPI.businesses.syncBusinessAccounts(userId);

  if (businesses.success && businesses.data) {
    console.log(`Found ${businesses.data.length} businesses`);
    businesses.data.forEach((business) => {
      console.log(`- ${business.name} (${business.id})`);
    });

    // Sync ad accounts for first business
    if (businesses.data.length > 0) {
      const businessId = businesses.data[0].id;

      console.log('\n=== Syncing Ad Accounts ===');
      const adAccounts = await facebookAPI.adAccounts.syncAdAccounts(
        businessId
      );

      if (adAccounts.success && adAccounts.data) {
        console.log(`Found ${adAccounts.data.length} ad accounts`);
        adAccounts.data.forEach((account) => {
          console.log(`- ${account.name} (${account.accountId})`);
          console.log(`  Currency: ${account.currency}`);
          console.log(`  Status: ${account.accountStatus}`);
          console.log(`  Balance: $${account.balance.toFixed(2)}`);
          console.log(
            `  Spent: $${account.amountSpent.toFixed(2)}`
          );
        });

        return adAccounts.data[0]; // Return first ad account for further examples
      }
    }
  }

  return null;
}

/**
 * Example: Campaign Management
 */
async function exampleCampaignManagement(
  accessToken: string,
  adAccountId: string
) {
  const { facebookAPI } = await initializeFacebookAPI();
  facebookAPI.setAccessToken(accessToken);

  console.log('\n=== Campaign Management ===');

  // List existing campaigns
  const campaigns = await facebookAPI.campaigns.syncCampaigns(adAccountId);
  console.log(`Existing campaigns: ${campaigns.data?.length || 0}`);

  // Create a new campaign
  console.log('\n--- Creating Campaign ---');
  const campaign = await facebookAPI.campaignCreator.createCampaign(
    adAccountId,
    {
      name: `Test Campaign ${Date.now()}`,
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      dailyBudget: 50, // $50/day
      specialAdCategories: [],
    }
  );

  if (campaign) {
    console.log('Created campaign:', campaign.id);
    console.log('Name:', campaign.name);
    console.log('Status:', campaign.status);
    console.log('Daily Budget:', `$${campaign.dailyBudget}`);

    // Update campaign
    console.log('\n--- Updating Campaign ---');
    const updated = await facebookAPI.campaignUpdater.updateCampaign(
      campaign.id,
      adAccountId,
      {
        dailyBudget: 75, // Increase to $75/day
      }
    );
    console.log('Updated budget to:', `$${updated?.dailyBudget}`);

    // Check if can activate
    const canActivate = await facebookAPI.campaignStatus.canActivate(
      campaign.id,
      adAccountId
    );
    console.log('\nCan activate?', canActivate.canActivate);
    if (!canActivate.canActivate) {
      console.log('Issues:', canActivate.issues);
    }

    return campaign;
  }

  return null;
}

/**
 * Example: Ad Set Creation
 */
async function exampleAdSetCreation(
  accessToken: string,
  adAccountId: string,
  campaignId: string
) {
  const { facebookAPI } = await initializeFacebookAPI();
  facebookAPI.setAccessToken(accessToken);

  console.log('\n=== Ad Set Creation ===');

  const adSet = await facebookAPI.adSetCreator.createAdSet(adAccountId, {
    name: `Test Ad Set ${Date.now()}`,
    campaignId,
    status: 'PAUSED',
    dailyBudget: 25, // $25/day
    billingEvent: 'IMPRESSIONS',
    optimizationGoal: 'LINK_CLICKS',
    targeting: {
      geo_locations: {
        countries: ['US'],
      },
      age_min: 25,
      age_max: 55,
      genders: [1, 2], // All genders
    },
  });

  if (adSet) {
    console.log('Created ad set:', adSet.id);
    console.log('Name:', adSet.name);
    console.log('Daily Budget:', `$${adSet.dailyBudget}`);
    console.log('Optimization Goal:', adSet.optimizationGoal);

    return adSet;
  }

  return null;
}

/**
 * Example: Insights Fetching
 */
async function exampleInsightsFetching(
  accessToken: string,
  adAccountId: string
) {
  const { facebookAPI } = await initializeFacebookAPI();
  facebookAPI.setAccessToken(accessToken);

  console.log('\n=== Fetching Insights ===');

  // Account-level insights
  const insights = await facebookAPI.insights.getAccountInsights(adAccountId, {
    level: 'account',
    date_preset: 'last_7d',
    fields: [
      'impressions',
      'reach',
      'clicks',
      'spend',
      'cpm',
      'cpc',
      'ctr',
    ],
  });

  if (insights.success && insights.data && insights.data.length > 0) {
    const data = insights.data[0];
    console.log('Last 7 days performance:');
    console.log(`- Impressions: ${data.impressions?.toLocaleString()}`);
    console.log(`- Reach: ${data.reach?.toLocaleString()}`);
    console.log(`- Clicks: ${data.clicks?.toLocaleString()}`);
    console.log(`- Spend: $${data.spend?.toFixed(2)}`);
    console.log(`- CPM: $${data.cpm?.toFixed(2)}`);
    console.log(`- CPC: $${data.cpc?.toFixed(2)}`);
    console.log(`- CTR: ${data.ctr?.toFixed(2)}%`);
  }

  // Time series insights
  console.log('\n--- Time Series Insights ---');
  const timeSeries = await facebookAPI.insights.getTimeSeriesInsights(
    adAccountId,
    adAccountId,
    'account',
    {
      since: '2024-01-01',
      until: '2024-01-07',
    },
    1 // Daily
  );

  console.log(`Fetched ${timeSeries.length} days of data`);
  timeSeries.forEach((day) => {
    console.log(
      `${day.date_start}: ${day.impressions} impressions, $${day.spend?.toFixed(2)} spend`
    );
  });
}

/**
 * Example: Background Job Processing
 * Note: Queue manager not yet implemented - placeholder for future functionality
 */
async function exampleBackgroundJobs(_accessToken: string, _userId: string) {
  const { facebookAPI } = await initializeFacebookAPI();

  console.log('\n=== Background Job Processing ===');
  console.log('Queue manager not yet implemented');
  console.log('Use direct API calls for now:');

  // Example: Direct sync calls instead of background jobs
  // await facebookAPI.businesses.syncBusinessAccounts(accessToken);
  // await facebookAPI.adAccounts.syncAdAccounts(accessToken, 'business-id');
}

/**
 * Example: Rate Limiting
 */
async function exampleRateLimiting(accessToken: string, adAccountId: string) {
  const { facebookAPI } = await initializeFacebookAPI();
  facebookAPI.setAccessToken(accessToken);

  console.log('\n=== Rate Limiting ===');

  const rateLimiter = facebookAPI.rateLimiter;

  // Get current usage
  const usage = await rateLimiter.getRateLimitUsage(adAccountId);
  console.log('Current rate limit usage:', usage);
  console.log(`${usage.current}/${usage.limit} calls used`);
  console.log(`${usage.remaining} calls remaining`);
  console.log(`Resets at: ${new Date(usage.resetAt).toISOString()}`);

  // Execute with rate limiting
  console.log('\nExecuting batch requests with rate limiting...');

  const campaignIds = ['campaign1', 'campaign2', 'campaign3'];

  await rateLimiter.batchRequests(
    adAccountId,
    campaignIds,
    async (batch) => {
      console.log(`Processing batch of ${batch.length} campaigns`);
      // Process batch
      return batch.map(() => ({ success: true }));
    },
    { batchSize: 2 }
  );

  console.log('Batch processing complete');

  // Get all rate limits (admin)
  const allLimits = await rateLimiter.getAllRateLimits();
  console.log(`\nMonitoring ${allLimits.length} ad accounts`);
}

/**
 * Example: Error Handling
 */
async function exampleErrorHandling(accessToken: string, adAccountId: string) {
  const { facebookAPI } = await initializeFacebookAPI();
  facebookAPI.setAccessToken(accessToken);

  console.log('\n=== Error Handling ===');

  try {
    // Try to create campaign with invalid data
    await facebookAPI.campaignCreator.createCampaign(adAccountId, {
      name: '',
      objective: 'INVALID_OBJECTIVE' as any,
      status: 'PAUSED',
    });
  } catch (error: any) {
    console.log('Error type:', error.name);
    console.log('Error message:', error.message);

    // Check error type
    const {
      FacebookErrorFactory,
      FacebookRateLimitError,
      FacebookOAuthError,
      FacebookValidationError,
    } = await import('./errors');

    if (error instanceof FacebookRateLimitError) {
      console.log('Rate limit hit!');
      console.log('Retry after:', error.getBackoffDelay(), 'ms');
    } else if (error instanceof FacebookOAuthError) {
      console.log('OAuth error - re-authentication needed');
    } else if (error instanceof FacebookValidationError) {
      console.log('Validation error:', error.field, error.value);
    }

    // Check if retryable
    if (FacebookErrorFactory.isRetryable(error)) {
      console.log('Error is retryable');
      const delay = FacebookErrorFactory.getRetryDelay(error, 1);
      console.log('Retry after:', delay, 'ms');
    }

    // Check if requires re-auth
    if (FacebookErrorFactory.requiresReauth(error)) {
      console.log('Re-authentication required');
    }
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('========================================');
  console.log('Facebook API Integration - Examples');
  console.log('========================================');

  try {
    // Note: In real usage, you would get these from your database
    const mockAccessToken = 'YOUR_ACCESS_TOKEN';
    const mockUserId = 'USER_ID';
    const mockAdAccountId = 'act_123456789';

    // OAuth Flow (commented out as it requires user interaction)
    // const accessToken = await exampleOAuthFlow();

    // Sync business data
    const adAccount = await exampleSyncBusinessData(
      mockAccessToken,
      mockUserId
    );

    if (adAccount) {
      // Campaign management
      const campaign = await exampleCampaignManagement(
        mockAccessToken,
        adAccount.id
      );

      if (campaign) {
        // Ad set creation
        await exampleAdSetCreation(
          mockAccessToken,
          adAccount.id,
          campaign.id
        );
      }

      // Insights
      await exampleInsightsFetching(mockAccessToken, adAccount.id);

      // Rate limiting
      await exampleRateLimiting(mockAccessToken, adAccount.id);
    }

    // Background jobs
    await exampleBackgroundJobs(mockAccessToken, mockUserId);

    // Error handling
    await exampleErrorHandling(mockAccessToken, mockAdAccountId);

    console.log('\n========================================');
    console.log('All examples completed!');
    console.log('========================================');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export examples
export {
  initializeFacebookAPI,
  exampleOAuthFlow,
  exampleSyncBusinessData,
  exampleCampaignManagement,
  exampleAdSetCreation,
  exampleInsightsFetching,
  exampleBackgroundJobs,
  exampleRateLimiting,
  exampleErrorHandling,
  runAllExamples,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
