import { prisma } from './prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import type { Organization, Prisma } from '@prisma/client';

/**
 * Get organization by ID with Row Level Security
 */
export async function getOrganizationById(
  organizationId: string,
  userId: string
): Promise<Organization> {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  if (!organization) {
    throw new NotFoundError('Organization');
  }

  return organization;
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { slug },
  });
}

/**
 * Create a new organization
 */
export async function createOrganization(
  data: Prisma.OrganizationCreateInput
): Promise<Organization> {
  // Check if slug already exists
  const existing = await getOrganizationBySlug(data.slug);
  if (existing) {
    throw new ConflictError('Organization slug already exists');
  }

  return prisma.organization.create({
    data,
  });
}

/**
 * Update organization with RLS
 */
export async function updateOrganization(
  organizationId: string,
  userId: string,
  data: Prisma.OrganizationUpdateInput
): Promise<Organization> {
  // Verify user has access
  await getOrganizationById(organizationId, userId);

  // If updating slug, check for conflicts
  if (data.slug && typeof data.slug === 'string') {
    const existing = await getOrganizationBySlug(data.slug);
    if (existing && existing.id !== organizationId) {
      throw new ConflictError('Organization slug already exists');
    }
  }

  return prisma.organization.update({
    where: { id: organizationId },
    data,
  });
}

/**
 * Delete organization with RLS
 */
export async function deleteOrganization(
  organizationId: string,
  userId: string
): Promise<void> {
  // Verify user has access
  await getOrganizationById(organizationId, userId);

  await prisma.organization.delete({
    where: { id: organizationId },
  });
}

/**
 * Get organization with all users
 */
export async function getOrganizationWithUsers(
  organizationId: string,
  userId: string
) {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!organization) {
    throw new NotFoundError('Organization');
  }

  return organization;
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string, userId: string) {
  await getOrganizationById(organizationId, userId);

  const [usersCount, templatesCount, facebookAccountsCount] = await Promise.all([
    prisma.user.count({
      where: { organizationId },
    }),
    prisma.adTemplate.count({
      where: { organizationId },
    }),
    prisma.facebookBusinessAccount.count({
      where: { organizationId },
    }),
  ]);

  return {
    users: usersCount,
    templates: templatesCount,
    facebookAccounts: facebookAccountsCount,
  };
}
