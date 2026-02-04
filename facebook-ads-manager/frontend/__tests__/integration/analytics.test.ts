/**
 * Integration Tests: Analytics API
 * Tests template analytics endpoints with real database interactions
 */

import { GET as GetTemplateAnalytics } from '@/app/api/analytics/templates/route';
import { GET as GetTemplateBreakdown } from '@/app/api/analytics/templates/[id]/breakdown/route';
import { NextRequest } from 'next/server';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  testPrisma,
} from '../setup/test-db';
import {
  createTestOrganization,
  createTestUser,
  createTestAdmin,
  createTestTemplate,
  createTestFacebookBusinessAccount,
  createTestAdAccount,
  createTestCampaign,
  mockUserSession,
  mockAdminSession,
} from '../setup/test-helpers';
import { UserRole } from '@prisma/client';

// Mock next-auth
jest.mock('next-auth');

// Mock auth protection
jest.mock('@/lib/auth/api-protection', () => ({
  requireAdmin: jest.fn().mockImplementation(async (request) => {
    const session = (global as any).__mockSession__;
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    return session;
  }),
}));

// Mock analytics functions
jest.mock('@/lib/db/analytics', () => ({
  getTemplateAnalytics: jest.fn().mockResolvedValue([
    {
      templateId: 'template-1',
      templateName: 'Test Template',
      category: 'e-commerce',
      totalSpend: 1000,
      totalImpressions: 50000,
      totalClicks: 2500,
      totalConversions: 125,
      avgRoas: 3.5,
      avgCtr: 5.0,
      avgCpc: 0.4,
      avgCpm: 20,
      accountsUsing: 3,
    },
  ]),
  getTemplateCategories: jest.fn().mockResolvedValue([
    { category: 'e-commerce', count: 5 },
    { category: 'lead-generation', count: 3 },
  ]),
  getTemplateAccountBreakdown: jest.fn().mockResolvedValue([
    {
      adAccountId: 'act_123',
      adAccountName: 'Test Account 1',
      spend: 500,
      impressions: 25000,
      clicks: 1250,
      conversions: 62,
      roas: 3.6,
      ctr: 5.0,
      cpc: 0.4,
    },
    {
      adAccountId: 'act_456',
      adAccountName: 'Test Account 2',
      spend: 500,
      impressions: 25000,
      clicks: 1250,
      conversions: 63,
      roas: 3.4,
      ctr: 5.0,
      cpc: 0.4,
    },
  ]),
}));

// Mock error handler
jest.mock('@/lib/utils/errors', () => ({
  handleApiError: jest.fn().mockImplementation((error) => {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
      }),
      { status: 500 }
    );
  }),
}));

describe('Analytics API Integration Tests', () => {
  let testOrg: any;
  let testUser: any;
  let testAdmin: any;
  let testTemplate: any;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Create test data
    testOrg = await createTestOrganization();
    testUser = await createTestUser(testOrg.id, UserRole.USER);
    testAdmin = await createTestAdmin(testOrg.id);
    testTemplate = await createTestTemplate(testOrg.id);
  });

  afterEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.adTemplate.deleteMany();
    await testPrisma.organization.deleteMany();
    delete (global as any).__mockSession__;
    jest.clearAllMocks();
  });

  describe('GET /api/analytics/templates', () => {
    it('should return template analytics for ADMIN users', async () => {
      // Set mock session
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates'
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('analytics');
      expect(data.data).toHaveProperty('categories');
      expect(Array.isArray(data.data.analytics)).toBe(true);
      expect(Array.isArray(data.data.categories)).toBe(true);
    });

    it('should filter analytics by date range', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates?startDate=${startDate}&endDate=${endDate}`
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.analytics).toBeDefined();
    });

    it('should filter analytics by category', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates?category=e-commerce'
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.analytics).toBeDefined();
    });

    it('should return 403 for USER role', async () => {
      // Set user session (not admin)
      (global as any).__mockSession__ = mockUserSession(testUser);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates'
      );

      try {
        await GetTemplateAnalytics(request);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Unauthorized');
      }
    });

    it('should include correct metrics in analytics response', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates'
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.analytics[0]).toHaveProperty('totalSpend');
      expect(data.data.analytics[0]).toHaveProperty('totalImpressions');
      expect(data.data.analytics[0]).toHaveProperty('totalClicks');
      expect(data.data.analytics[0]).toHaveProperty('totalConversions');
      expect(data.data.analytics[0]).toHaveProperty('avgRoas');
      expect(data.data.analytics[0]).toHaveProperty('avgCtr');
      expect(data.data.analytics[0]).toHaveProperty('avgCpc');
      expect(data.data.analytics[0]).toHaveProperty('avgCpm');
      expect(data.data.analytics[0]).toHaveProperty('accountsUsing');
    });

    it('should calculate ROAS correctly', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates'
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      const analytics = data.data.analytics[0];
      expect(analytics.avgRoas).toBe(3.5);
      expect(typeof analytics.avgRoas).toBe('number');
    });

    it('should calculate CTR correctly', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates'
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      const analytics = data.data.analytics[0];
      expect(analytics.avgCtr).toBe(5.0);
      expect(typeof analytics.avgCtr).toBe('number');
    });

    it('should include account count using template', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        'http://localhost:3000/api/analytics/templates'
      );

      const response = await GetTemplateAnalytics(request);
      const data = await response.json();

      const analytics = data.data.analytics[0];
      expect(analytics.accountsUsing).toBe(3);
      expect(typeof analytics.accountsUsing).toBe('number');
    });
  });

  describe('GET /api/analytics/templates/[id]/breakdown', () => {
    it('should return per-account breakdown for a template', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates/${testTemplate.id}/breakdown`
      );

      const context = { params: { id: testTemplate.id } };

      const response = await GetTemplateBreakdown(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should include all required metrics in breakdown', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates/${testTemplate.id}/breakdown`
      );

      const context = { params: { id: testTemplate.id } };

      const response = await GetTemplateBreakdown(request, context);
      const data = await response.json();

      const breakdown = data.data[0];
      expect(breakdown).toHaveProperty('adAccountId');
      expect(breakdown).toHaveProperty('adAccountName');
      expect(breakdown).toHaveProperty('spend');
      expect(breakdown).toHaveProperty('impressions');
      expect(breakdown).toHaveProperty('clicks');
      expect(breakdown).toHaveProperty('conversions');
      expect(breakdown).toHaveProperty('roas');
      expect(breakdown).toHaveProperty('ctr');
      expect(breakdown).toHaveProperty('cpc');
    });

    it('should return metrics grouped by ad account', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates/${testTemplate.id}/breakdown`
      );

      const context = { params: { id: testTemplate.id } };

      const response = await GetTemplateBreakdown(request, context);
      const data = await response.json();

      expect(data.data.length).toBe(2);
      expect(data.data[0].adAccountId).toBe('act_123');
      expect(data.data[1].adAccountId).toBe('act_456');
    });

    it('should return 403 for USER role', async () => {
      (global as any).__mockSession__ = mockUserSession(testUser);

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates/${testTemplate.id}/breakdown`
      );

      const context = { params: { id: testTemplate.id } };

      try {
        await GetTemplateBreakdown(request, context);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Unauthorized');
      }
    });

    it('should calculate account-level ROAS correctly', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates/${testTemplate.id}/breakdown`
      );

      const context = { params: { id: testTemplate.id } };

      const response = await GetTemplateBreakdown(request, context);
      const data = await response.json();

      data.data.forEach((account: any) => {
        expect(typeof account.roas).toBe('number');
        expect(account.roas).toBeGreaterThan(0);
      });
    });

    it('should show different performance across accounts', async () => {
      (global as any).__mockSession__ = mockAdminSession(testAdmin);

      const request = new NextRequest(
        `http://localhost:3000/api/analytics/templates/${testTemplate.id}/breakdown`
      );

      const context = { params: { id: testTemplate.id } };

      const response = await GetTemplateBreakdown(request, context);
      const data = await response.json();

      const account1 = data.data[0];
      const account2 = data.data[1];

      // Each account should have its own metrics
      expect(account1.adAccountId).not.toBe(account2.adAccountId);
      expect(account1.spend).toBeDefined();
      expect(account2.spend).toBeDefined();
    });
  });
});
