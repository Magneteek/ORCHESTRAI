/**
 * E2E Test Data Creation Helpers
 * Create test data for E2E tests
 */

import { getTestPrismaClient } from '../../fixtures/database.fixture';
import { hash } from 'bcryptjs';

const prisma = getTestPrismaClient();

/**
 * Create a test template
 */
export async function createTestTemplate(data: {
  name: string;
  category: string;
  objective: string;
  organizationId: string;
  isGlobal?: boolean;
  dynamicFields?: any;
}) {
  try {
    const template = await prisma.adTemplate.create({
      data: {
        name: data.name,
        description: `Test template: ${data.name}`,
        category: data.category,
        objective: data.objective,
        visibility: data.isGlobal ? 'public' : 'private',
        organizationId: data.organizationId,
        isGlobal: data.isGlobal || false,
        dynamicFields: data.dynamicFields || {},
        adCopy: {
          headlines: ['Test Headline'],
          primaryText: 'Test primary text',
          description: 'Test description'
        },
        creativeSpecs: {
          format: 'single_image',
          aspectRatio: '1:1'
        },
        targetingConfig: {
          ageMin: 18,
          ageMax: 65,
          locations: ['US']
        },
        campaignStructure: {
          budgetType: 'daily',
          dailyBudget: 50
        },
        timesUsed: 0
      }
    });

    console.log(`✅ Created test template: ${template.name}`);
    return template;
  } catch (error) {
    console.error('❌ Failed to create test template:', error);
    throw error;
  }
}

/**
 * Create a test user
 */
export async function createTestUser(data: {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'USER';
  organizationId: string;
}) {
  try {
    const hashedPassword = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        organizationId: data.organizationId
      }
    });

    console.log(`✅ Created test user: ${user.email}`);
    return user;
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    throw error;
  }
}

/**
 * Create a test campaign
 */
export async function createTestCampaign(data: {
  name: string;
  adAccountId: string;
  templateId?: string;
  status?: string;
}) {
  try {
    const campaign = await prisma.campaign.create({
      data: {
        campaignId: `test_campaign_${Date.now()}`,
        name: data.name,
        adAccountId: data.adAccountId,
        templateId: data.templateId,
        objective: 'OUTCOME_SALES',
        status: data.status || 'ACTIVE',
        dailyBudget: 50
      }
    });

    console.log(`✅ Created test campaign: ${campaign.name}`);
    return campaign;
  } catch (error) {
    console.error('❌ Failed to create test campaign:', error);
    throw error;
  }
}

/**
 * Create test performance data for an ad
 * Note: PerformanceMetric links to Ad, not Campaign.
 * To create performance data for a campaign, first create an AdSet + Ad.
 */
export async function createTestPerformanceData(data: {
  adId: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions?: number;
}) {
  try {
    const performance = await prisma.performanceMetric.create({
      data: {
        adId: data.adId,
        date: new Date(),
        spend: data.spend,
        impressions: BigInt(data.impressions),
        clicks: BigInt(data.clicks),
        conversions: BigInt(data.conversions || 0),
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
        cpm: data.impressions > 0 ? (data.spend / data.impressions) * 1000 : 0,
      }
    });

    console.log(`✅ Created test performance data for ad: ${data.adId}`);
    return performance;
  } catch (error) {
    console.error('❌ Failed to create test performance data:', error);
    throw error;
  }
}

/**
 * Get default test organization
 */
export async function getTestOrganization() {
  const org = await prisma.organization.findFirst({
    where: {
      slug: 'test-org-1'
    }
  });

  if (!org) {
    throw new Error('Test organization not found. Run database seeding first.');
  }

  return org;
}

/**
 * Get default test ad account
 */
export async function getTestAdAccount() {
  const adAccount = await prisma.adAccount.findFirst({
    where: {
      accountId: { contains: 'test_' }
    }
  });

  if (!adAccount) {
    throw new Error('Test ad account not found. Run database seeding first.');
  }

  return adAccount;
}

/**
 * Seed E2E test templates
 */
export async function seedE2ETemplates() {
  const org = await getTestOrganization();

  const templates = [
    {
      name: 'E2E Test Product Launch',
      category: 'e-commerce',
      objective: 'OUTCOME_SALES',
      organizationId: org.id,
      isGlobal: true,
      dynamicFields: {
        fields: [
          {
            name: 'company_name',
            label: 'Company Name',
            type: 'text',
            required: true
          },
          {
            name: 'offer_price',
            label: 'Offer Price',
            type: 'number',
            required: true,
            min: 0
          }
        ]
      }
    },
    {
      name: 'E2E Test Lead Generation',
      category: 'lead-generation',
      objective: 'OUTCOME_LEADS',
      organizationId: org.id,
      isGlobal: true,
      dynamicFields: {
        fields: [
          {
            name: 'business_location',
            label: 'Business Location',
            type: 'text',
            required: true
          }
        ]
      }
    }
  ];

  for (const template of templates) {
    await createTestTemplate(template);
  }

  console.log('✅ E2E test templates seeded');
}
