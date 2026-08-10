import { prisma } from './prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { Campaign, AdSet, Ad } from '@prisma/client';

/**
 * Get campaign by ID with authorization check
 */
export async function getCampaignById(
  id: string,
  userId: string,
  organizationId: string
): Promise<Campaign | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      adAccount: {
        include: {
          facebookBusinessAccount: {
            select: {
              organizationId: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    return null;
  }

  // Verify organization ownership
  if (campaign.adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this campaign');
  }

  return campaign;
}

/**
 * Get campaigns by ad account with pagination
 */
export async function getCampaignsByAdAccount(
  adAccountId: string,
  userId: string,
  organizationId: string,
  options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    objective?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const { page, limit, search, status, objective, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  // Verify ad account ownership
  const adAccount = await prisma.adAccount.findUnique({
    where: { id: adAccountId },
    include: {
      facebookBusinessAccount: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!adAccount) {
    throw new NotFoundError('Ad account');
  }

  if (adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this ad account');
  }

  // Build where clause
  const where: any = {
    adAccountId,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (status && status !== 'all') {
    where.status = status;
  } else {
    // Exclude deleted campaigns from the default list
    where.status = { not: 'DELETED' };
  }

  if (objective) {
    where.objective = objective;
  }

  // Get total count
  const total = await prisma.campaign.count({ where });

  // Get campaigns
  const campaigns = await prisma.campaign.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      adSets: {
        select: {
          id: true,
        },
      },
    },
  });

  return {
    campaigns,
    total,
    page,
    limit,
  };
}

/**
 * Create campaign in database
 */
export async function createCampaignInDb(
  data: {
    adAccountId: string;
    campaignId: string; // Facebook campaign ID
    name: string;
    objective: string;
    status: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    bidStrategy?: string;
    startTime?: Date;
    stopTime?: Date;
    templateId?: string;
  }
): Promise<Campaign> {
  return prisma.campaign.create({
    data: {
      adAccountId: data.adAccountId,
      campaignId: data.campaignId,
      name: data.name,
      objective: data.objective,
      status: data.status,
      dailyBudget: data.dailyBudget,
      lifetimeBudget: data.lifetimeBudget,
      bidStrategy: data.bidStrategy,
      startTime: data.startTime,
      stopTime: data.stopTime,
      templateId: data.templateId,
    },
  });
}

/**
 * Update campaign in database
 */
export async function updateCampaignInDb(
  id: string,
  data: {
    name?: string;
    status?: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    startTime?: Date;
    stopTime?: Date;
  }
): Promise<Campaign> {
  return prisma.campaign.update({
    where: { id },
    data,
  });
}

/**
 * Delete campaign from database (soft delete)
 */
export async function deleteCampaignFromDb(id: string): Promise<Campaign> {
  return prisma.campaign.update({
    where: { id },
    data: {
      status: 'DELETED',
    },
  });
}

/**
 * Get campaign with ad sets and ads
 */
export async function getCampaignWithDetails(
  id: string,
  userId: string,
  organizationId: string
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      adAccount: {
        include: {
          facebookBusinessAccount: {
            select: {
              organizationId: true,
            },
          },
        },
      },
      adSets: {
        include: {
          ads: {
            select: {
              id: true,
              name: true,
              status: true,
              creative: true,
            },
          },
        },
      },
      template: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new NotFoundError('Campaign');
  }

  // Verify organization ownership
  if (campaign.adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this campaign');
  }

  return campaign;
}

/**
 * Get ad set by ID with authorization check
 */
export async function getAdSetById(
  id: string,
  userId: string,
  organizationId: string
): Promise<AdSet | null> {
  const adSet = await prisma.adSet.findUnique({
    where: { id },
    include: {
      campaign: {
        include: {
          adAccount: {
            include: {
              facebookBusinessAccount: {
                select: {
                  organizationId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!adSet) {
    return null;
  }

  // Verify organization ownership
  if (adSet.campaign.adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this ad set');
  }

  return adSet;
}

/**
 * Create ad set in database
 */
export async function createAdSetInDb(
  data: {
    campaignId: string;
    adSetId: string; // Facebook ad set ID
    name: string;
    status: string;
    targeting: any;
    budget?: number;
    bidStrategy?: string;
    billingEvent?: string;
    optimizationGoal?: string;
    startTime?: Date;
    endTime?: Date;
  }
): Promise<AdSet> {
  return prisma.adSet.create({
    data: {
      campaignId: data.campaignId,
      adSetId: data.adSetId,
      name: data.name,
      status: data.status,
      targeting: data.targeting,
      budget: data.budget,
      bidStrategy: data.bidStrategy,
      billingEvent: data.billingEvent,
      optimizationGoal: data.optimizationGoal,
      startTime: data.startTime,
      endTime: data.endTime,
    },
  });
}

/**
 * Get ad by ID with authorization check
 */
export async function getAdById(
  id: string,
  userId: string,
  organizationId: string
): Promise<Ad | null> {
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      adSet: {
        include: {
          campaign: {
            include: {
              adAccount: {
                include: {
                  facebookBusinessAccount: {
                    select: {
                      organizationId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ad) {
    return null;
  }

  // Verify organization ownership
  if (ad.adSet.campaign.adAccount.facebookBusinessAccount.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this ad');
  }

  return ad;
}

/**
 * Create ad in database
 */
export async function createAdInDb(
  data: {
    adSetId: string;
    adId: string; // Facebook ad ID
    name: string;
    status: string;
    creative: any;
    templateId?: string;
  }
): Promise<Ad> {
  return prisma.ad.create({
    data: {
      adSetId: data.adSetId,
      adId: data.adId,
      name: data.name,
      status: data.status,
      creative: data.creative,
      templateId: data.templateId,
    },
  });
}
