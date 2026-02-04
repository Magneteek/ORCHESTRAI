/**
 * Test Helper Utilities
 * Common test helpers for mocking data, auth, and API requests
 */

import { UserRole, Organization, User, AdTemplate } from '@prisma/client';
import { testPrisma } from './test-db';
import bcrypt from 'bcryptjs';

/**
 * Test Data Factories
 */

export interface TestOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  password?: string;
}

export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  objective: string;
  organizationId: string;
  isGlobal: boolean;
  dynamicFields?: any;
  adCopy: any;
  creativeSpecs: any;
  targetingConfig: any;
  campaignStructure: any;
}

/**
 * Create a test organization
 */
export async function createTestOrganization(
  overrides?: Partial<Organization>
): Promise<Organization> {
  return testPrisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: `test-org-${Date.now()}`,
      plan: 'professional',
      status: 'active',
      ...overrides,
    },
  });
}

/**
 * Create a test user with hashed password
 */
export async function createTestUser(
  organizationId: string,
  role: UserRole = UserRole.USER,
  overrides?: Partial<User>
): Promise<User> {
  const hashedPassword = await bcrypt.hash('testpassword123', 10);

  return testPrisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      password: hashedPassword,
      role,
      organizationId,
      ...overrides,
    },
  });
}

/**
 * Create an admin test user
 */
export async function createTestAdmin(
  organizationId: string,
  overrides?: Partial<User>
): Promise<User> {
  return createTestUser(organizationId, UserRole.ADMIN, overrides);
}

/**
 * Create a test ad template
 */
export async function createTestTemplate(
  organizationId: string,
  overrides?: Partial<AdTemplate>
): Promise<AdTemplate> {
  return testPrisma.adTemplate.create({
    data: {
      name: `Test Template ${Date.now()}`,
      description: 'A test template for integration tests',
      category: 'e-commerce',
      objective: 'OUTCOME_SALES',
      visibility: 'private',
      isGlobal: false,
      organizationId,
      adCopy: {
        headline: 'Test Headline',
        primaryText: 'Test primary text',
        description: 'Test description',
        callToAction: 'SHOP_NOW',
      },
      creativeSpecs: {
        format: 'single_image',
        imageUrl: 'https://example.com/image.jpg',
      },
      targetingConfig: {
        locations: ['US'],
        ageMin: 25,
        ageMax: 45,
      },
      campaignStructure: {
        budget: 50,
        bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      ...overrides,
    },
  });
}

/**
 * Create a test template with dynamic fields
 */
export async function createDynamicTestTemplate(
  organizationId: string,
  fields: any[] = []
): Promise<AdTemplate> {
  const defaultFields = [
    {
      name: 'company_name',
      type: 'text',
      required: true,
      placeholder: 'Enter company name',
    },
    {
      name: 'product_name',
      type: 'text',
      required: true,
      placeholder: 'Enter product name',
    },
    {
      name: 'discount_percentage',
      type: 'number',
      required: false,
      defaultValue: 10,
    },
  ];

  return createTestTemplate(organizationId, {
    dynamicFields: {
      fields: fields.length > 0 ? fields : defaultFields,
    },
  });
}

/**
 * Create a global test template
 */
export async function createGlobalTestTemplate(
  organizationId: string,
  overrides?: Partial<AdTemplate>
): Promise<AdTemplate> {
  return createTestTemplate(organizationId, {
    isGlobal: true,
    visibility: 'public',
    ...overrides,
  });
}

/**
 * Create a test ad account
 */
export async function createTestAdAccount(
  businessAccountId: string,
  accountId?: string
) {
  return testPrisma.adAccount.create({
    data: {
      facebookBusinessAccountId: businessAccountId,
      accountId: accountId || `act_${Date.now()}`,
      name: 'Test Ad Account',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      accountStatus: 'ACTIVE',
    },
  });
}

/**
 * Create a test Facebook business account
 */
export async function createTestFacebookBusinessAccount(
  organizationId: string
) {
  return testPrisma.facebookBusinessAccount.create({
    data: {
      organizationId,
      businessId: `${Date.now()}`,
      name: 'Test Business Account',
      accessTokenEncrypted: 'encrypted_token_value',
      isActive: true,
    },
  });
}

/**
 * Create a test campaign
 */
export async function createTestCampaign(
  adAccountId: string,
  templateId?: string
) {
  return testPrisma.campaign.create({
    data: {
      adAccountId,
      campaignId: `${Date.now()}`,
      name: 'Test Campaign',
      objective: 'OUTCOME_SALES',
      status: 'ACTIVE',
      templateId,
      dailyBudget: 50,
    },
  });
}

/**
 * Create test performance metrics
 */
export async function createTestPerformanceMetrics(
  adId: string,
  date: Date,
  metrics: {
    spend?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
  } = {}
) {
  const impressions = BigInt(metrics.impressions || 1000);
  const clicks = BigInt(metrics.clicks || 50);
  const conversions = BigInt(metrics.conversions || 5);
  const spend = metrics.spend || 25;

  const ctr = Number(clicks) / Number(impressions);
  const cpc = spend / Number(clicks);
  const cpm = (spend / Number(impressions)) * 1000;

  return testPrisma.performanceMetric.create({
    data: {
      adId,
      date,
      spend,
      impressions,
      clicks,
      conversions,
      ctr,
      cpc,
      cpm,
      roas: conversions > 0n ? (Number(conversions) * 50) / spend : null,
    },
  });
}

/**
 * Mock NextAuth Session
 */
export function mockSession(user: {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: 'Test User',
      role: user.role,
      organizationId: user.organizationId,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Mock NextAuth Admin Session
 */
export function mockAdminSession(user: User) {
  return mockSession({
    id: user.id,
    email: user.email,
    role: UserRole.ADMIN,
    organizationId: user.organizationId,
  });
}

/**
 * Mock NextAuth User Session
 */
export function mockUserSession(user: User) {
  return mockSession({
    id: user.id,
    email: user.email,
    role: UserRole.USER,
    organizationId: user.organizationId,
  });
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Assert response structure
 */
export function assertApiResponse(response: any, expectedKeys: string[]) {
  expect(response).toHaveProperty('success');

  if (response.success) {
    expect(response).toHaveProperty('data');
    expectedKeys.forEach((key) => {
      expect(response.data).toHaveProperty(key);
    });
  } else {
    expect(response).toHaveProperty('error');
  }
}
