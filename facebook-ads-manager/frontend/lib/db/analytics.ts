/**
 * Analytics Database Helpers
 * Functions for template analytics and cross-account performance data
 */

import { prisma } from './prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { Prisma } from '@prisma/client';

/**
 * Template Analytics Response Type
 */
export interface TemplateAnalytics {
  totals: {
    totalTemplates: number;
    activeCampaigns: number;
    totalSpend: number;
    avgRoas: number;
  };
  templates: Array<{
    id: string;
    name: string;
    category: string;
    accountsUsing: number;
    totalSpend: number;
    avgRoas: number | null;
    avgCtr: number | null;
    avgCpc: number | null;
    timesUsed: number;
  }>;
}

/**
 * Account Breakdown Response Type
 */
export interface AccountBreakdown {
  accountId: string;
  accountName: string;
  campaigns: number;
  spend: number;
  roas: number | null;
  ctr: number | null;
  cpc: number | null;
}

/**
 * Get template analytics with filters
 */
export async function getTemplateAnalytics(
  organizationId: string,
  filters: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
  } = {}
): Promise<TemplateAnalytics> {
  const { startDate, endDate, category } = filters;

  // Build where clause for templates
  const templateWhere: Prisma.AdTemplateWhereInput = {
    organizationId,
    timesUsed: {
      gt: 0,
    },
  };

  if (category) {
    templateWhere.category = category;
  }

  // Fetch templates with performance data
  const templates = await prisma.adTemplate.findMany({
    where: templateWhere,
    include: {
      performanceAggregate: true,
      campaigns: {
        where: {
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate && { gte: startDate }),
                  ...(endDate && { lte: endDate }),
                },
              }
            : {}),
        },
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  // Calculate totals
  let totalSpend = 0;
  let totalRoas = 0;
  let templatesWithRoas = 0;
  let activeCampaigns = 0;

  const templateData = templates.map((template) => {
    const aggregate = template.performanceAggregate;
    const spend = aggregate?.totalSpend || 0;
    const roas = aggregate?.avgRoas || null;

    totalSpend += spend;

    if (roas !== null) {
      totalRoas += roas;
      templatesWithRoas++;
    }

    activeCampaigns += template.campaigns.filter((c) => c.status === 'ACTIVE').length;

    return {
      id: template.id,
      name: template.name,
      category: template.category,
      accountsUsing: aggregate?.accountsUsing || 0,
      totalSpend: spend,
      avgRoas: roas,
      avgCtr: aggregate?.avgCtr || null,
      avgCpc: aggregate?.avgCpc || null,
      timesUsed: template.timesUsed,
    };
  });

  return {
    totals: {
      totalTemplates: templates.length,
      activeCampaigns,
      totalSpend,
      avgRoas: templatesWithRoas > 0 ? totalRoas / templatesWithRoas : 0,
    },
    templates: templateData,
  };
}

/**
 * Get per-account breakdown for a template
 */
export async function getTemplateAccountBreakdown(
  templateId: string,
  organizationId: string
): Promise<AccountBreakdown[]> {
  // Verify template belongs to organization
  const template = await prisma.adTemplate.findFirst({
    where: {
      id: templateId,
      organizationId,
    },
  });

  if (!template) {
    throw new NotFoundError('Template');
  }

  // Get all campaigns using this template
  const campaigns = await prisma.campaign.findMany({
    where: {
      templateId,
    },
    include: {
      adAccount: {
        select: {
          id: true,
          name: true,
        },
      },
      adSets: {
        include: {
          ads: {
            include: {
              performanceMetrics: {
                orderBy: {
                  date: 'desc',
                },
                take: 30, // Last 30 days
              },
            },
          },
        },
      },
    },
  });

  // Group by account and aggregate metrics
  const accountMap = new Map<string, AccountBreakdown>();

  for (const campaign of campaigns) {
    const accountId = campaign.adAccount.id;

    if (!accountMap.has(accountId)) {
      accountMap.set(accountId, {
        accountId,
        accountName: campaign.adAccount.name,
        campaigns: 0,
        spend: 0,
        roas: null,
        ctr: null,
        cpc: null,
      });
    }

    const breakdown = accountMap.get(accountId)!;
    breakdown.campaigns++;

    // Aggregate metrics from ads
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let metricsCount = 0;

    for (const adSet of campaign.adSets) {
      for (const ad of adSet.ads) {
        for (const metric of ad.performanceMetrics) {
          totalSpend += metric.spend;
          totalImpressions += Number(metric.impressions);
          totalClicks += Number(metric.clicks);
          totalConversions += Number(metric.conversions);
          metricsCount++;
        }
      }
    }

    breakdown.spend += totalSpend;

    // Calculate averages
    if (metricsCount > 0) {
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const roas = totalSpend > 0 ? totalConversions / totalSpend : 0;

      breakdown.ctr = ctr;
      breakdown.cpc = cpc;
      breakdown.roas = roas;
    }
  }

  return Array.from(accountMap.values());
}

/**
 * Update template performance aggregate
 */
export async function updateTemplatePerformance(
  templateId: string,
  metrics: {
    totalSpend?: number;
    totalImpressions?: bigint;
    totalClicks?: bigint;
    totalConversions?: bigint;
    avgRoas?: number;
    avgCtr?: number;
    avgCpc?: number;
    avgCpm?: number;
    accountsUsing?: number;
  }
): Promise<void> {
  await prisma.templatePerformanceAggregate.upsert({
    where: { templateId },
    create: {
      templateId,
      totalSpend: metrics.totalSpend || 0,
      totalImpressions: metrics.totalImpressions || BigInt(0),
      totalClicks: metrics.totalClicks || BigInt(0),
      totalConversions: metrics.totalConversions || BigInt(0),
      avgRoas: metrics.avgRoas,
      avgCtr: metrics.avgCtr,
      avgCpc: metrics.avgCpc,
      avgCpm: metrics.avgCpm,
      accountsUsing: metrics.accountsUsing || 0,
    },
    update: {
      ...metrics,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Get template categories with counts
 */
export async function getTemplateCategories(
  organizationId: string
): Promise<Array<{ category: string; count: number }>> {
  const categories = await prisma.adTemplate.groupBy({
    by: ['category'],
    where: {
      organizationId,
      timesUsed: {
        gt: 0,
      },
    },
    _count: {
      category: true,
    },
  });

  return categories.map((c) => ({
    category: c.category,
    count: c._count.category,
  }));
}

/**
 * Get template performance over time
 */
export async function getTemplatePerformanceTimeSeries(
  templateId: string,
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<
  Array<{
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number | null;
  }>
> {
  // Verify template belongs to organization
  const template = await prisma.adTemplate.findFirst({
    where: {
      id: templateId,
      organizationId,
    },
  });

  if (!template) {
    throw new NotFoundError('Template');
  }

  // Get all campaigns using this template
  const campaigns = await prisma.campaign.findMany({
    where: {
      templateId,
    },
    select: {
      id: true,
    },
  });

  if (campaigns.length === 0) {
    return [];
  }

  // Get performance metrics grouped by date
  const metrics = await prisma.performanceMetric.groupBy({
    by: ['date'],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      ad: {
        adSet: {
          campaignId: {
            in: campaigns.map((c) => c.id),
          },
        },
      },
    },
    _sum: {
      spend: true,
      impressions: true,
      clicks: true,
      conversions: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  return metrics.map((m) => {
    const spend = m._sum.spend || 0;
    const impressions = Number(m._sum.impressions || 0);
    const clicks = Number(m._sum.clicks || 0);
    const conversions = Number(m._sum.conversions || 0);
    const roas = spend > 0 ? conversions / spend : null;

    return {
      date: m.date.toISOString().split('T')[0],
      spend,
      impressions,
      clicks,
      conversions,
      roas,
    };
  });
}
