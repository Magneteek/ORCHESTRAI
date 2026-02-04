import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NotFoundError } from '@/lib/utils/errors';

// Mock Prisma client BEFORE importing analytics
const mockPrismaClient = {
  adTemplate: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    groupBy: jest.fn(),
  },
  campaign: {
    findMany: jest.fn(),
  },
  templatePerformanceAggregate: {
    upsert: jest.fn(),
  },
  performanceMetric: {
    groupBy: jest.fn(),
  },
};

jest.mock('@/lib/db/prisma', () => ({
  prisma: mockPrismaClient,
}));

// Import analytics AFTER the mock is set up
import {
  getTemplateAnalytics,
  getTemplateAccountBreakdown,
  updateTemplatePerformance,
  getTemplateCategories,
  getTemplatePerformanceTimeSeries,
} from '@/lib/db/analytics';

describe('Analytics Database Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplateAnalytics', () => {
    it('should return analytics with totals and template data', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Template 1',
          category: 'E-COMMERCE',
          timesUsed: 5,
          performanceAggregate: {
            totalSpend: 100,
            avgRoas: 2.5,
            avgCtr: 1.2,
            avgCpc: 0.5,
            accountsUsing: 3,
          },
          campaigns: [
            { id: 'camp-1', status: 'ACTIVE' },
            { id: 'camp-2', status: 'PAUSED' },
          ],
        },
        {
          id: 'template-2',
          name: 'Template 2',
          category: 'LEAD_GENERATION',
          timesUsed: 3,
          performanceAggregate: {
            totalSpend: 50,
            avgRoas: 1.8,
            avgCtr: 0.9,
            avgCpc: 0.3,
            accountsUsing: 2,
          },
          campaigns: [{ id: 'camp-3', status: 'ACTIVE' }],
        },
      ];

      mockPrismaClient.adTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplateAnalytics('org-1');

      expect(result.totals.totalTemplates).toBe(2);
      expect(result.totals.activeCampaigns).toBe(2);
      expect(result.totals.totalSpend).toBe(150);
      expect(result.totals.avgRoas).toBeCloseTo(2.15, 2);

      expect(result.templates).toHaveLength(2);
      expect(result.templates[0]).toMatchObject({
        id: 'template-1',
        name: 'Template 1',
        category: 'E-COMMERCE',
        accountsUsing: 3,
        totalSpend: 100,
        avgRoas: 2.5,
        timesUsed: 5,
      });
    });

    it('should filter by date range', async () => {
      mockPrismaClient.adTemplate.findMany.mockResolvedValue([]);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      await getTemplateAnalytics('org-1', { startDate, endDate });

      expect(mockPrismaClient.adTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            campaigns: expect.objectContaining({
              where: expect.objectContaining({
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              }),
            }),
          }),
        })
      );
    });

    it('should filter by category', async () => {
      mockPrismaClient.adTemplate.findMany.mockResolvedValue([]);

      await getTemplateAnalytics('org-1', { category: 'E-COMMERCE' });

      expect(mockPrismaClient.adTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'E-COMMERCE',
          }),
        })
      );
    });

    it('should handle templates with null performance aggregate', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Template 1',
          category: 'E-COMMERCE',
          timesUsed: 0,
          performanceAggregate: null,
          campaigns: [],
        },
      ];

      mockPrismaClient.adTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplateAnalytics('org-1');

      expect(result.templates[0]).toMatchObject({
        totalSpend: 0,
        avgRoas: null,
        avgCtr: null,
        avgCpc: null,
        accountsUsing: 0,
      });
    });

    it('should handle empty results', async () => {
      mockPrismaClient.adTemplate.findMany.mockResolvedValue([]);

      const result = await getTemplateAnalytics('org-1');

      expect(result.totals.totalTemplates).toBe(0);
      expect(result.totals.activeCampaigns).toBe(0);
      expect(result.totals.totalSpend).toBe(0);
      expect(result.totals.avgRoas).toBe(0);
      expect(result.templates).toHaveLength(0);
    });

    it('should calculate average ROAS correctly', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Template 1',
          category: 'E-COMMERCE',
          timesUsed: 1,
          performanceAggregate: {
            totalSpend: 100,
            avgRoas: 3.0,
            avgCtr: 1.0,
            avgCpc: 0.5,
            accountsUsing: 1,
          },
          campaigns: [],
        },
        {
          id: 'template-2',
          name: 'Template 2',
          category: 'E-COMMERCE',
          timesUsed: 1,
          performanceAggregate: {
            totalSpend: 100,
            avgRoas: null, // No ROAS data
            avgCtr: 1.0,
            avgCpc: 0.5,
            accountsUsing: 1,
          },
          campaigns: [],
        },
        {
          id: 'template-3',
          name: 'Template 3',
          category: 'E-COMMERCE',
          timesUsed: 1,
          performanceAggregate: {
            totalSpend: 100,
            avgRoas: 5.0,
            avgCtr: 1.0,
            avgCpc: 0.5,
            accountsUsing: 1,
          },
          campaigns: [],
        },
      ];

      mockPrismaClient.adTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplateAnalytics('org-1');

      // Should average only templates with ROAS: (3.0 + 5.0) / 2 = 4.0
      expect(result.totals.avgRoas).toBe(4.0);
    });

    it('should count only active campaigns', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Template 1',
          category: 'E-COMMERCE',
          timesUsed: 1,
          performanceAggregate: null,
          campaigns: [
            { id: 'camp-1', status: 'ACTIVE' },
            { id: 'camp-2', status: 'ACTIVE' },
            { id: 'camp-3', status: 'PAUSED' },
            { id: 'camp-4', status: 'DELETED' },
          ],
        },
      ];

      mockPrismaClient.adTemplate.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplateAnalytics('org-1');

      expect(result.totals.activeCampaigns).toBe(2);
    });
  });

  describe('getTemplateAccountBreakdown', () => {
    it('should return account breakdown for template', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [
        {
          id: 'camp-1',
          adAccount: {
            id: 'account-1',
            name: 'Account 1',
          },
          adSets: [
            {
              id: 'adset-1',
              ads: [
                {
                  id: 'ad-1',
                  performanceMetrics: [
                    {
                      spend: 100,
                      impressions: BigInt(10000),
                      clicks: BigInt(100),
                      conversions: BigInt(10),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await getTemplateAccountBreakdown('template-1', 'org-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        accountId: 'account-1',
        accountName: 'Account 1',
        campaigns: 1,
        spend: 100,
      });

      // CTR = (100 / 10000) * 100 = 1.0
      expect(result[0].ctr).toBeCloseTo(1.0, 2);
      // CPC = 100 / 100 = 1.0
      expect(result[0].cpc).toBeCloseTo(1.0, 2);
      // ROAS = 10 / 100 = 0.1
      expect(result[0].roas).toBeCloseTo(0.1, 2);
    });

    it('should throw NotFoundError when template not found', async () => {
      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(null);

      await expect(
        getTemplateAccountBreakdown('template-1', 'org-1')
      ).rejects.toThrow(NotFoundError);
    });

    it('should aggregate multiple campaigns for same account', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [
        {
          id: 'camp-1',
          adAccount: {
            id: 'account-1',
            name: 'Account 1',
          },
          adSets: [
            {
              id: 'adset-1',
              ads: [
                {
                  id: 'ad-1',
                  performanceMetrics: [
                    {
                      spend: 50,
                      impressions: BigInt(5000),
                      clicks: BigInt(50),
                      conversions: BigInt(5),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'camp-2',
          adAccount: {
            id: 'account-1',
            name: 'Account 1',
          },
          adSets: [
            {
              id: 'adset-2',
              ads: [
                {
                  id: 'ad-2',
                  performanceMetrics: [
                    {
                      spend: 50,
                      impressions: BigInt(5000),
                      clicks: BigInt(50),
                      conversions: BigInt(5),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await getTemplateAccountBreakdown('template-1', 'org-1');

      expect(result).toHaveLength(1);
      expect(result[0].campaigns).toBe(2);
      expect(result[0].spend).toBe(100);
    });

    it('should handle multiple accounts', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [
        {
          id: 'camp-1',
          adAccount: {
            id: 'account-1',
            name: 'Account 1',
          },
          adSets: [
            {
              id: 'adset-1',
              ads: [
                {
                  id: 'ad-1',
                  performanceMetrics: [
                    {
                      spend: 100,
                      impressions: BigInt(10000),
                      clicks: BigInt(100),
                      conversions: BigInt(10),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'camp-2',
          adAccount: {
            id: 'account-2',
            name: 'Account 2',
          },
          adSets: [
            {
              id: 'adset-2',
              ads: [
                {
                  id: 'ad-2',
                  performanceMetrics: [
                    {
                      spend: 200,
                      impressions: BigInt(20000),
                      clicks: BigInt(200),
                      conversions: BigInt(20),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await getTemplateAccountBreakdown('template-1', 'org-1');

      expect(result).toHaveLength(2);
      expect(result[0].accountId).toBe('account-1');
      expect(result[1].accountId).toBe('account-2');
    });

    it('should handle campaigns with no metrics', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [
        {
          id: 'camp-1',
          adAccount: {
            id: 'account-1',
            name: 'Account 1',
          },
          adSets: [],
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await getTemplateAccountBreakdown('template-1', 'org-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        accountId: 'account-1',
        campaigns: 1,
        spend: 0,
        roas: null,
        ctr: null,
        cpc: null,
      });
    });

    it('should calculate metrics correctly with zero impressions', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [
        {
          id: 'camp-1',
          adAccount: {
            id: 'account-1',
            name: 'Account 1',
          },
          adSets: [
            {
              id: 'adset-1',
              ads: [
                {
                  id: 'ad-1',
                  performanceMetrics: [
                    {
                      spend: 100,
                      impressions: BigInt(0),
                      clicks: BigInt(0),
                      conversions: BigInt(0),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await getTemplateAccountBreakdown('template-1', 'org-1');

      expect(result[0].ctr).toBe(0);
      expect(result[0].cpc).toBe(0);
      expect(result[0].roas).toBe(0);
    });
  });

  describe('updateTemplatePerformance', () => {
    it('should upsert template performance with create', async () => {
      mockPrismaClient.templatePerformanceAggregate.upsert.mockResolvedValue({});

      await updateTemplatePerformance('template-1', {
        totalSpend: 100,
        avgRoas: 2.5,
        avgCtr: 1.2,
        avgCpc: 0.5,
        accountsUsing: 3,
      });

      expect(mockPrismaClient.templatePerformanceAggregate.upsert).toHaveBeenCalledWith({
        where: { templateId: 'template-1' },
        create: expect.objectContaining({
          templateId: 'template-1',
          totalSpend: 100,
          avgRoas: 2.5,
          avgCtr: 1.2,
          avgCpc: 0.5,
          accountsUsing: 3,
        }),
        update: expect.any(Object),
      });
    });

    it('should handle BigInt values', async () => {
      mockPrismaClient.templatePerformanceAggregate.upsert.mockResolvedValue({});

      await updateTemplatePerformance('template-1', {
        totalImpressions: BigInt(10000),
        totalClicks: BigInt(100),
        totalConversions: BigInt(10),
      });

      expect(mockPrismaClient.templatePerformanceAggregate.upsert).toHaveBeenCalledWith({
        where: { templateId: 'template-1' },
        create: expect.objectContaining({
          totalImpressions: BigInt(10000),
          totalClicks: BigInt(100),
          totalConversions: BigInt(10),
        }),
        update: expect.any(Object),
      });
    });

    it('should use default values for missing metrics', async () => {
      mockPrismaClient.templatePerformanceAggregate.upsert.mockResolvedValue({});

      await updateTemplatePerformance('template-1', {});

      expect(mockPrismaClient.templatePerformanceAggregate.upsert).toHaveBeenCalledWith({
        where: { templateId: 'template-1' },
        create: expect.objectContaining({
          totalSpend: 0,
          totalImpressions: BigInt(0),
          totalClicks: BigInt(0),
          totalConversions: BigInt(0),
          accountsUsing: 0,
        }),
        update: expect.any(Object),
      });
    });

    it('should update lastUpdated timestamp', async () => {
      mockPrismaClient.templatePerformanceAggregate.upsert.mockResolvedValue({});

      await updateTemplatePerformance('template-1', { totalSpend: 100 });

      expect(mockPrismaClient.templatePerformanceAggregate.upsert).toHaveBeenCalledWith({
        where: { templateId: 'template-1' },
        create: expect.any(Object),
        update: expect.objectContaining({
          lastUpdated: expect.any(Date),
        }),
      });
    });
  });

  describe('getTemplateCategories', () => {
    it('should return categories with counts', async () => {
      const mockCategories = [
        {
          category: 'E-COMMERCE',
          _count: { category: 5 },
        },
        {
          category: 'LEAD_GENERATION',
          _count: { category: 3 },
        },
      ];

      mockPrismaClient.adTemplate.groupBy.mockResolvedValue(mockCategories);

      const result = await getTemplateCategories('org-1');

      expect(result).toEqual([
        { category: 'E-COMMERCE', count: 5 },
        { category: 'LEAD_GENERATION', count: 3 },
      ]);
    });

    it('should filter by organization and timesUsed', async () => {
      mockPrismaClient.adTemplate.groupBy.mockResolvedValue([]);

      await getTemplateCategories('org-1');

      expect(mockPrismaClient.adTemplate.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        where: {
          organizationId: 'org-1',
          timesUsed: {
            gt: 0,
          },
        },
        _count: {
          category: true,
        },
      });
    });

    it('should handle empty results', async () => {
      mockPrismaClient.adTemplate.groupBy.mockResolvedValue([]);

      const result = await getTemplateCategories('org-1');

      expect(result).toEqual([]);
    });
  });

  describe('getTemplatePerformanceTimeSeries', () => {
    it('should return performance data grouped by date', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [
        { id: 'camp-1' },
        { id: 'camp-2' },
      ];

      const mockMetrics = [
        {
          date: new Date('2025-01-15'),
          _sum: {
            spend: 100,
            impressions: BigInt(10000),
            clicks: BigInt(100),
            conversions: BigInt(10),
          },
        },
        {
          date: new Date('2025-01-16'),
          _sum: {
            spend: 150,
            impressions: BigInt(15000),
            clicks: BigInt(150),
            conversions: BigInt(15),
          },
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);
      mockPrismaClient.performanceMetric.groupBy.mockResolvedValue(mockMetrics);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await getTemplatePerformanceTimeSeries(
        'template-1',
        'org-1',
        startDate,
        endDate
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        date: '2025-01-15',
        spend: 100,
        impressions: 10000,
        clicks: 100,
        conversions: 10,
        roas: 0.1,
      });
    });

    it('should throw NotFoundError when template not found', async () => {
      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(null);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      await expect(
        getTemplatePerformanceTimeSeries('template-1', 'org-1', startDate, endDate)
      ).rejects.toThrow(NotFoundError);
    });

    it('should return empty array when no campaigns exist', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue([]);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await getTemplatePerformanceTimeSeries(
        'template-1',
        'org-1',
        startDate,
        endDate
      );

      expect(result).toEqual([]);
    });

    it('should calculate ROAS as null when spend is zero', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [{ id: 'camp-1' }];

      const mockMetrics = [
        {
          date: new Date('2025-01-15'),
          _sum: {
            spend: 0,
            impressions: BigInt(10000),
            clicks: BigInt(100),
            conversions: BigInt(10),
          },
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);
      mockPrismaClient.performanceMetric.groupBy.mockResolvedValue(mockMetrics);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await getTemplatePerformanceTimeSeries(
        'template-1',
        'org-1',
        startDate,
        endDate
      );

      expect(result[0].roas).toBeNull();
    });

    it('should handle null sum values', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [{ id: 'camp-1' }];

      const mockMetrics = [
        {
          date: new Date('2025-01-15'),
          _sum: {
            spend: null,
            impressions: null,
            clicks: null,
            conversions: null,
          },
        },
      ];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);
      mockPrismaClient.performanceMetric.groupBy.mockResolvedValue(mockMetrics);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await getTemplatePerformanceTimeSeries(
        'template-1',
        'org-1',
        startDate,
        endDate
      );

      expect(result[0]).toMatchObject({
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roas: null,
      });
    });

    it('should query with correct date range', async () => {
      const mockTemplate = {
        id: 'template-1',
        organizationId: 'org-1',
      };

      const mockCampaigns = [{ id: 'camp-1' }];

      mockPrismaClient.adTemplate.findFirst.mockResolvedValue(mockTemplate);
      mockPrismaClient.campaign.findMany.mockResolvedValue(mockCampaigns);
      mockPrismaClient.performanceMetric.groupBy.mockResolvedValue([]);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      await getTemplatePerformanceTimeSeries(
        'template-1',
        'org-1',
        startDate,
        endDate
      );

      expect(mockPrismaClient.performanceMetric.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });
  });
});
