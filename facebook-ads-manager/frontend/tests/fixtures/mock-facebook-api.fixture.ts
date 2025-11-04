/**
 * Mock Facebook API Fixture
 * Provides mock responses for Facebook Graph API
 */

import { Page, Route } from '@playwright/test';

/**
 * Mock Facebook API responses
 */
export const mockFacebookResponses = {
  campaigns: {
    success: {
      data: [
        {
          id: '123456789',
          name: 'Test Campaign 1',
          objective: 'OUTCOME_SALES',
          status: 'ACTIVE',
          daily_budget: '5000',
          insights: {
            data: [
              {
                impressions: '10000',
                clicks: '250',
                spend: '125.50',
                ctr: '2.5',
                cpc: '0.50',
                cpm: '12.55',
              },
            ],
          },
        },
        {
          id: '987654321',
          name: 'Test Campaign 2',
          objective: 'OUTCOME_LEADS',
          status: 'PAUSED',
          daily_budget: '10000',
          insights: {
            data: [
              {
                impressions: '25000',
                clicks: '500',
                spend: '250.00',
                ctr: '2.0',
                cpc: '0.50',
                cpm: '10.00',
              },
            ],
          },
        },
      ],
      paging: {
        cursors: {
          before: 'MAZDZD',
          after: 'MQZDZD',
        },
      },
    },
    error: {
      error: {
        message: 'Invalid OAuth access token',
        type: 'OAuthException',
        code: 190,
        fbtrace_id: 'test_trace',
      },
    },
  },

  adAccounts: {
    success: {
      data: [
        {
          id: 'act_123456789',
          name: 'Test Ad Account 1',
          account_status: 1,
          currency: 'USD',
          timezone_name: 'America/New_York',
        },
        {
          id: 'act_987654321',
          name: 'Test Ad Account 2',
          account_status: 1,
          currency: 'EUR',
          timezone_name: 'Europe/London',
        },
      ],
    },
  },

  insights: {
    success: {
      data: [
        {
          date_start: '2024-10-01',
          date_stop: '2024-10-15',
          impressions: '50000',
          clicks: '1000',
          spend: '500.00',
          conversions: '50',
          ctr: '2.0',
          cpc: '0.50',
          cpm: '10.00',
          roas: '4.5',
        },
      ],
    },
  },

  createCampaign: {
    success: {
      id: 'new_campaign_123',
      name: 'New Test Campaign',
      objective: 'OUTCOME_SALES',
      status: 'PAUSED',
    },
    error: {
      error: {
        message: 'Invalid parameter',
        type: 'FacebookApiException',
        code: 100,
      },
    },
  },

  updateCampaign: {
    success: {
      success: true,
    },
    error: {
      error: {
        message: 'Campaign not found',
        type: 'FacebookApiException',
        code: 100,
      },
    },
  },
};

/**
 * Mock Facebook Graph API endpoints
 */
export async function mockFacebookAPI(page: Page) {
  // Mock campaigns endpoint
  await page.route('**/v18.0/act_*/campaigns*', async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFacebookResponses.campaigns.success),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFacebookResponses.createCampaign.success),
      });
    }
  });

  // Mock campaign update/delete
  await page.route('**/v18.0/*/campaigns/*', async (route: Route) => {
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFacebookResponses.updateCampaign.success),
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }
  });

  // Mock ad accounts endpoint
  await page.route('**/v18.0/me/adaccounts*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockFacebookResponses.adAccounts.success),
    });
  });

  // Mock insights endpoint
  await page.route('**/v18.0/*/insights*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockFacebookResponses.insights.success),
    });
  });
}

/**
 * Mock Facebook API errors
 */
export async function mockFacebookAPIErrors(page: Page) {
  await page.route('**/v18.0/**', async (route: Route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify(mockFacebookResponses.campaigns.error),
    });
  });
}

/**
 * Mock slow Facebook API responses
 */
export async function mockSlowFacebookAPI(page: Page, delayMs: number = 3000) {
  await page.route('**/v18.0/**', async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockFacebookResponses.campaigns.success),
    });
  });
}

/**
 * Create mock campaign data
 */
export function createMockCampaign(overrides: Partial<any> = {}) {
  return {
    id: `campaign_${Date.now()}`,
    name: 'Mock Campaign',
    objective: 'OUTCOME_SALES',
    status: 'ACTIVE',
    daily_budget: '5000',
    created_time: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock insights data
 */
export function createMockInsights(overrides: Partial<any> = {}) {
  return {
    impressions: '10000',
    clicks: '200',
    spend: '100.00',
    conversions: '10',
    ctr: '2.0',
    cpc: '0.50',
    cpm: '10.00',
    ...overrides,
  };
}
