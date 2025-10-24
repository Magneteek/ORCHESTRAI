import { prisma } from './prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { AdTemplate, Prisma } from '@prisma/client';
import type { PaginatedResult } from '@/types/database';

/**
 * Create Ad Template
 */
export async function createTemplate(
  organizationId: string,
  userId: string,
  data: {
    name: string;
    description?: string;
    category: string;
    objective: string;
    visibility: 'private' | 'public';
    adCopy: unknown;
    creativeSpecs: unknown;
    targetingConfig: unknown;
    campaignStructure: unknown;
    parentTemplateId?: string;
  }
): Promise<AdTemplate> {
  // Verify user has access to organization
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
  });

  if (!user) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  return prisma.adTemplate.create({
    data: {
      organizationId,
      name: data.name,
      description: data.description,
      category: data.category,
      objective: data.objective,
      visibility: data.visibility,
      adCopy: data.adCopy as Prisma.JsonObject,
      creativeSpecs: data.creativeSpecs as Prisma.JsonObject,
      targetingConfig: data.targetingConfig as Prisma.JsonObject,
      campaignStructure: data.campaignStructure as Prisma.JsonObject,
      isPublic: data.visibility === 'public',
      parentTemplateId: data.parentTemplateId,
    },
  });
}

/**
 * Get template by ID with RLS
 */
export async function getTemplateById(
  templateId: string,
  userId: string
): Promise<AdTemplate> {
  const template = await prisma.adTemplate.findFirst({
    where: {
      id: templateId,
      OR: [
        // User's organization templates
        {
          organization: {
            users: {
              some: {
                id: userId,
              },
            },
          },
        },
        // Public templates
        {
          isPublic: true,
        },
      ],
    },
    include: {
      performanceAggregate: true,
    },
  });

  if (!template) {
    throw new NotFoundError('Template');
  }

  return template;
}

/**
 * Get templates with pagination and filters
 */
export async function getTemplates(
  organizationId: string,
  userId: string,
  options: {
    page?: number;
    limit?: number;
    category?: string;
    visibility?: 'private' | 'public' | 'all';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<PaginatedResult<AdTemplate>> {
  const {
    page = 1,
    limit = 20,
    category,
    visibility = 'all',
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.AdTemplateWhereInput = {
    OR: [
      // User's organization templates
      {
        organizationId,
      },
      // Public templates
      {
        isPublic: true,
      },
    ],
  };

  // Apply filters
  if (category) {
    where.category = category;
  }

  if (visibility !== 'all') {
    if (visibility === 'private') {
      where.organizationId = organizationId;
      where.isPublic = false;
    } else {
      where.isPublic = true;
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Execute query with pagination
  const [templates, total] = await Promise.all([
    prisma.adTemplate.findMany({
      where,
      include: {
        performanceAggregate: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),
    prisma.adTemplate.count({ where }),
  ]);

  return {
    data: templates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update template
 */
export async function updateTemplate(
  templateId: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    category: string;
    objective: string;
    visibility: 'private' | 'public';
    adCopy: unknown;
    creativeSpecs: unknown;
    targetingConfig: unknown;
    campaignStructure: unknown;
  }>
): Promise<AdTemplate> {
  const template = await getTemplateById(templateId, userId);

  // Verify user owns this template
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId: template.organizationId,
    },
  });

  if (!user) {
    throw new ForbiddenError('You do not have permission to update this template');
  }

  const updateData: Prisma.AdTemplateUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.objective !== undefined) updateData.objective = data.objective;
  if (data.visibility !== undefined) {
    updateData.visibility = data.visibility;
    updateData.isPublic = data.visibility === 'public';
  }
  if (data.adCopy !== undefined) updateData.adCopy = data.adCopy as Prisma.JsonObject;
  if (data.creativeSpecs !== undefined) updateData.creativeSpecs = data.creativeSpecs as Prisma.JsonObject;
  if (data.targetingConfig !== undefined) updateData.targetingConfig = data.targetingConfig as Prisma.JsonObject;
  if (data.campaignStructure !== undefined) updateData.campaignStructure = data.campaignStructure as Prisma.JsonObject;

  return prisma.adTemplate.update({
    where: { id: templateId },
    data: updateData,
  });
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: string, userId: string): Promise<void> {
  const template = await getTemplateById(templateId, userId);

  // Verify user owns this template
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId: template.organizationId,
    },
  });

  if (!user) {
    throw new ForbiddenError('You do not have permission to delete this template');
  }

  await prisma.adTemplate.delete({
    where: { id: templateId },
  });
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  await prisma.adTemplate.update({
    where: { id: templateId },
    data: {
      timesUsed: {
        increment: 1,
      },
    },
  });
}

/**
 * Fork/clone a template
 */
export async function forkTemplate(
  templateId: string,
  userId: string,
  newName?: string
): Promise<AdTemplate> {
  const originalTemplate = await getTemplateById(templateId, userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return prisma.adTemplate.create({
    data: {
      organizationId: user.organizationId,
      name: newName || `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      category: originalTemplate.category,
      objective: originalTemplate.objective,
      visibility: 'private',
      isPublic: false,
      adCopy: originalTemplate.adCopy as any,
      creativeSpecs: originalTemplate.creativeSpecs as any,
      targetingConfig: originalTemplate.targetingConfig as any,
      campaignStructure: originalTemplate.campaignStructure as any,
      parentTemplateId: templateId,
    },
  });
}

/**
 * Get template performance aggregate
 */
export async function getTemplatePerformance(templateId: string, userId: string) {
  await getTemplateById(templateId, userId);

  return prisma.templatePerformanceAggregate.findUnique({
    where: { templateId },
  });
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
      ...metrics,
    },
    update: {
      ...metrics,
      lastUpdated: new Date(),
    },
  });
}

/**
 * Get top performing templates
 */
export async function getTopTemplates(
  organizationId: string,
  userId: string,
  limit: number = 10
) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
  });

  if (!user) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  return prisma.adTemplate.findMany({
    where: {
      OR: [
        { organizationId },
        { isPublic: true },
      ],
      performanceAggregate: {
        isNot: null,
      },
    },
    include: {
      performanceAggregate: true,
    },
    orderBy: {
      performanceAggregate: {
        avgRoas: 'desc',
      },
    },
    take: limit,
  });
}
