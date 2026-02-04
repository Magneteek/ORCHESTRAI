/**
 * Integration Tests: Performance Sync Background Job
 * Tests template performance aggregation and sync jobs
 */

import {
  setupTestDatabase,
  cleanupTestDatabase,
  testPrisma,
} from '../setup/test-db';
import {
  createTestOrganization,
  createTestTemplate,
  createTestFacebookBusinessAccount,
  createTestAdAccount,
  createTestCampaign,
  createTestPerformanceMetrics,
} from '../setup/test-helpers';

/**
 * Mock performance sync job
 * In production, this would be a BullMQ job
 */
async function syncTemplatePerformance(templateId: string) {
  // Get all campaigns using this template
  const campaigns = await testPrisma.campaign.findMany({
    where: { templateId },
    include: {
      adSets: {
        include: {
          ads: {
            include: {
              performanceMetrics: true,
            },
          },
        },
      },
      adAccount: true,
    },
  });

  if (campaigns.length === 0) {
    return null;
  }

  // Aggregate metrics across all ads
  let totalSpend = 0;
  let totalImpressions = BigInt(0);
  let totalClicks = BigInt(0);
  let totalConversions = BigInt(0);
  const accountsUsing = new Set<string>();

  campaigns.forEach((campaign) => {
    accountsUsing.add(campaign.adAccountId);

    campaign.adSets.forEach((adSet) => {
      adSet.ads.forEach((ad) => {
        ad.performanceMetrics.forEach((metric) => {
          totalSpend += metric.spend;
          totalImpressions += metric.impressions;
          totalClicks += metric.clicks;
          totalConversions += metric.conversions;
        });
      });
    });
  });

  // Calculate averages
  const avgCtr =
    Number(totalImpressions) > 0
      ? (Number(totalClicks) / Number(totalImpressions)) * 100
      : null;

  const avgCpc = Number(totalClicks) > 0 ? totalSpend / Number(totalClicks) : null;

  const avgCpm =
    Number(totalImpressions) > 0
      ? (totalSpend / Number(totalImpressions)) * 1000
      : null;

  const avgRoas =
    totalSpend > 0 ? (Number(totalConversions) * 50) / totalSpend : null;

  // Update or create aggregate record
  const aggregate = await testPrisma.templatePerformanceAggregate.upsert({
    where: { templateId },
    create: {
      templateId,
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgRoas,
      avgCtr,
      avgCpc,
      avgCpm,
      accountsUsing: accountsUsing.size,
    },
    update: {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgRoas,
      avgCtr,
      avgCpc,
      avgCpm,
      accountsUsing: accountsUsing.size,
      lastUpdated: new Date(),
    },
  });

  return aggregate;
}

describe('Performance Sync Job Integration Tests', () => {
  let testOrg: any;
  let testTemplate: any;
  let businessAccount: any;
  let adAccount1: any;
  let adAccount2: any;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    testOrg = await createTestOrganization();
    testTemplate = await createTestTemplate(testOrg.id);
    businessAccount = await createTestFacebookBusinessAccount(testOrg.id);
    adAccount1 = await createTestAdAccount(businessAccount.id, 'act_123');
    adAccount2 = await createTestAdAccount(businessAccount.id, 'act_456');
  });

  afterEach(async () => {
    await testPrisma.performanceMetric.deleteMany();
    await testPrisma.ad.deleteMany();
    await testPrisma.adSet.deleteMany();
    await testPrisma.campaign.deleteMany();
    await testPrisma.templatePerformanceAggregate.deleteMany();
    await testPrisma.adAccount.deleteMany();
    await testPrisma.facebookBusinessAccount.deleteMany();
    await testPrisma.adTemplate.deleteMany();
    await testPrisma.organization.deleteMany();
  });

  describe('Template Performance Aggregation', () => {
    it('should aggregate performance metrics from multiple campaigns', async () => {
      // Create campaigns from template
      const campaign1 = await createTestCampaign(adAccount1.id, testTemplate.id);
      const campaign2 = await createTestCampaign(adAccount2.id, testTemplate.id);

      // Create ad sets and ads
      const adSet1 = await testPrisma.adSet.create({
        data: {
          campaignId: campaign1.id,
          adSetId: `${Date.now()}-1`,
          name: 'Test Ad Set 1',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const adSet2 = await testPrisma.adSet.create({
        data: {
          campaignId: campaign2.id,
          adSetId: `${Date.now()}-2`,
          name: 'Test Ad Set 2',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const ad1 = await testPrisma.ad.create({
        data: {
          adSetId: adSet1.id,
          adId: `${Date.now()}-1`,
          name: 'Test Ad 1',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      const ad2 = await testPrisma.ad.create({
        data: {
          adSetId: adSet2.id,
          adId: `${Date.now()}-2`,
          name: 'Test Ad 2',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      // Create performance metrics
      await createTestPerformanceMetrics(ad1.id, new Date(), {
        spend: 100,
        impressions: 10000,
        clicks: 500,
        conversions: 25,
      });

      await createTestPerformanceMetrics(ad2.id, new Date(), {
        spend: 150,
        impressions: 15000,
        clicks: 750,
        conversions: 30,
      });

      // Run sync job
      const aggregate = await syncTemplatePerformance(testTemplate.id);

      // Assertions
      expect(aggregate).not.toBeNull();
      expect(aggregate!.totalSpend).toBe(250);
      expect(aggregate!.totalImpressions).toBe(BigInt(25000));
      expect(aggregate!.totalClicks).toBe(BigInt(1250));
      expect(aggregate!.totalConversions).toBe(BigInt(55));
      expect(aggregate!.accountsUsing).toBe(2);
    });

    it('should calculate average ROAS correctly', async () => {
      const campaign = await createTestCampaign(adAccount1.id, testTemplate.id);

      const adSet = await testPrisma.adSet.create({
        data: {
          campaignId: campaign.id,
          adSetId: `${Date.now()}`,
          name: 'Test Ad Set',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const ad = await testPrisma.ad.create({
        data: {
          adSetId: adSet.id,
          adId: `${Date.now()}`,
          name: 'Test Ad',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      // Create metrics with known ROAS
      // Spend: $100, Conversions: 10, Conversion value: $50 each
      // Expected ROAS: (10 * 50) / 100 = 5.0
      await createTestPerformanceMetrics(ad.id, new Date(), {
        spend: 100,
        impressions: 10000,
        clicks: 500,
        conversions: 10,
      });

      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate!.avgRoas).toBeCloseTo(5.0, 1);
    });

    it('should calculate average CTR correctly', async () => {
      const campaign = await createTestCampaign(adAccount1.id, testTemplate.id);

      const adSet = await testPrisma.adSet.create({
        data: {
          campaignId: campaign.id,
          adSetId: `${Date.now()}`,
          name: 'Test Ad Set',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const ad = await testPrisma.ad.create({
        data: {
          adSetId: adSet.id,
          adId: `${Date.now()}`,
          name: 'Test Ad',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      // CTR: (500 / 10000) * 100 = 5.0%
      await createTestPerformanceMetrics(ad.id, new Date(), {
        spend: 100,
        impressions: 10000,
        clicks: 500,
        conversions: 10,
      });

      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate!.avgCtr).toBeCloseTo(5.0, 1);
    });

    it('should calculate average CPC correctly', async () => {
      const campaign = await createTestCampaign(adAccount1.id, testTemplate.id);

      const adSet = await testPrisma.adSet.create({
        data: {
          campaignId: campaign.id,
          adSetId: `${Date.now()}`,
          name: 'Test Ad Set',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const ad = await testPrisma.ad.create({
        data: {
          adSetId: adSet.id,
          adId: `${Date.now()}`,
          name: 'Test Ad',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      // CPC: 100 / 500 = 0.2
      await createTestPerformanceMetrics(ad.id, new Date(), {
        spend: 100,
        impressions: 10000,
        clicks: 500,
        conversions: 10,
      });

      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate!.avgCpc).toBeCloseTo(0.2, 2);
    });

    it('should handle template with no campaigns', async () => {
      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate).toBeNull();
    });

    it('should handle template with zero spend', async () => {
      const campaign = await createTestCampaign(adAccount1.id, testTemplate.id);

      const adSet = await testPrisma.adSet.create({
        data: {
          campaignId: campaign.id,
          adSetId: `${Date.now()}`,
          name: 'Test Ad Set',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const ad = await testPrisma.ad.create({
        data: {
          adSetId: adSet.id,
          adId: `${Date.now()}`,
          name: 'Test Ad',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      await createTestPerformanceMetrics(ad.id, new Date(), {
        spend: 0,
        impressions: 10000,
        clicks: 500,
        conversions: 0,
      });

      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate!.totalSpend).toBe(0);
      expect(aggregate!.avgRoas).toBeNull();
    });

    it('should handle missing performance data gracefully', async () => {
      const campaign = await createTestCampaign(adAccount1.id, testTemplate.id);

      const adSet = await testPrisma.adSet.create({
        data: {
          campaignId: campaign.id,
          adSetId: `${Date.now()}`,
          name: 'Test Ad Set',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      await testPrisma.ad.create({
        data: {
          adSetId: adSet.id,
          adId: `${Date.now()}`,
          name: 'Test Ad',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      // No performance metrics created
      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate!.totalSpend).toBe(0);
      expect(aggregate!.totalImpressions).toBe(BigInt(0));
      expect(aggregate!.accountsUsing).toBe(1);
    });

    it('should count unique ad accounts correctly', async () => {
      // Create 3 campaigns: 2 from same account, 1 from different
      const campaign1 = await createTestCampaign(adAccount1.id, testTemplate.id);
      const campaign2 = await createTestCampaign(adAccount1.id, testTemplate.id);
      const campaign3 = await createTestCampaign(adAccount2.id, testTemplate.id);

      const aggregate = await syncTemplatePerformance(testTemplate.id);

      // Should count 2 unique accounts
      expect(aggregate!.accountsUsing).toBe(2);
    });

    it('should update existing aggregate records', async () => {
      const campaign = await createTestCampaign(adAccount1.id, testTemplate.id);

      const adSet = await testPrisma.adSet.create({
        data: {
          campaignId: campaign.id,
          adSetId: `${Date.now()}`,
          name: 'Test Ad Set',
          status: 'ACTIVE',
          targeting: {},
        },
      });

      const ad = await testPrisma.ad.create({
        data: {
          adSetId: adSet.id,
          adId: `${Date.now()}`,
          name: 'Test Ad',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      // First sync
      await createTestPerformanceMetrics(ad.id, new Date('2024-01-01'), {
        spend: 100,
        impressions: 10000,
        clicks: 500,
        conversions: 10,
      });

      const firstAggregate = await syncTemplatePerformance(testTemplate.id);
      expect(firstAggregate!.totalSpend).toBe(100);

      // Add more metrics and sync again
      await createTestPerformanceMetrics(ad.id, new Date('2024-01-02'), {
        spend: 150,
        impressions: 15000,
        clicks: 750,
        conversions: 15,
      });

      const secondAggregate = await syncTemplatePerformance(testTemplate.id);

      // Should update totals
      expect(secondAggregate!.totalSpend).toBe(250);
      expect(secondAggregate!.totalImpressions).toBe(BigInt(25000));
      expect(secondAggregate!.id).toBe(firstAggregate!.id); // Same record
    });

    it('should handle multiple ad accounts with different performance', async () => {
      // Account 1: High spend, low conversions
      const campaign1 = await createTestCampaign(adAccount1.id, testTemplate.id);
      const adSet1 = await testPrisma.adSet.create({
        data: {
          campaignId: campaign1.id,
          adSetId: `${Date.now()}-1`,
          name: 'Ad Set 1',
          status: 'ACTIVE',
          targeting: {},
        },
      });
      const ad1 = await testPrisma.ad.create({
        data: {
          adSetId: adSet1.id,
          adId: `${Date.now()}-1`,
          name: 'Ad 1',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      await createTestPerformanceMetrics(ad1.id, new Date(), {
        spend: 500,
        impressions: 50000,
        clicks: 2000,
        conversions: 10,
      });

      // Account 2: Low spend, high conversions
      const campaign2 = await createTestCampaign(adAccount2.id, testTemplate.id);
      const adSet2 = await testPrisma.adSet.create({
        data: {
          campaignId: campaign2.id,
          adSetId: `${Date.now()}-2`,
          name: 'Ad Set 2',
          status: 'ACTIVE',
          targeting: {},
        },
      });
      const ad2 = await testPrisma.ad.create({
        data: {
          adSetId: adSet2.id,
          adId: `${Date.now()}-2`,
          name: 'Ad 2',
          status: 'ACTIVE',
          templateId: testTemplate.id,
          creative: {},
        },
      });

      await createTestPerformanceMetrics(ad2.id, new Date(), {
        spend: 100,
        impressions: 10000,
        clicks: 500,
        conversions: 20,
      });

      const aggregate = await syncTemplatePerformance(testTemplate.id);

      expect(aggregate!.totalSpend).toBe(600);
      expect(aggregate!.totalConversions).toBe(BigInt(30));
      expect(aggregate!.accountsUsing).toBe(2);
    });
  });
});
