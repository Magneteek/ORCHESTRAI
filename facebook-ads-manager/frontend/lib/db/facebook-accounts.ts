import { prisma } from './prisma';
import { encrypt, decrypt } from '../utils/encryption';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { FacebookBusinessAccount, AdAccount, Prisma } from '@prisma/client';

/**
 * Create Facebook Business Account with encrypted token
 */
export async function createFacebookBusinessAccount(
  organizationId: string,
  userId: string,
  data: {
    businessId: string;
    name: string;
    accessToken: string;
    systemUserToken?: string;
    tokenExpiresAt?: Date;
  }
): Promise<FacebookBusinessAccount> {
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

  // Encrypt the access token
  const encryptedToken = encrypt(data.accessToken);

  return prisma.facebookBusinessAccount.create({
    data: {
      organizationId,
      businessId: data.businessId,
      name: data.name,
      accessTokenEncrypted: encryptedToken,
      systemUserToken: data.systemUserToken,
      tokenExpiresAt: data.tokenExpiresAt,
    },
  });
}

/**
 * Get Facebook Business Account by ID with RLS
 */
export async function getFacebookBusinessAccountById(
  accountId: string,
  userId: string
): Promise<FacebookBusinessAccount> {
  const account = await prisma.facebookBusinessAccount.findFirst({
    where: {
      id: accountId,
      organization: {
        users: {
          some: {
            id: userId,
          },
        },
      },
    },
  });

  if (!account) {
    throw new NotFoundError('Facebook Business Account');
  }

  return account;
}

/**
 * Get decrypted access token
 */
export async function getDecryptedAccessToken(
  accountId: string,
  userId: string
): Promise<string> {
  const account = await getFacebookBusinessAccountById(accountId, userId);
  return decrypt(account.accessTokenEncrypted);
}

/**
 * Get all Facebook Business Accounts for organization
 */
export async function getFacebookBusinessAccountsByOrganization(
  organizationId: string,
  userId: string
): Promise<FacebookBusinessAccount[]> {
  // Verify user has access
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
  });

  if (!user) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  return prisma.facebookBusinessAccount.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update Facebook Business Account
 */
export async function updateFacebookBusinessAccount(
  accountId: string,
  userId: string,
  data: {
    name?: string;
    isActive?: boolean;
    accessToken?: string;
    tokenExpiresAt?: Date;
    lastSyncAt?: Date;
  }
): Promise<FacebookBusinessAccount> {
  await getFacebookBusinessAccountById(accountId, userId);

  const updateData: Prisma.FacebookBusinessAccountUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.lastSyncAt !== undefined) updateData.lastSyncAt = data.lastSyncAt;
  if (data.tokenExpiresAt !== undefined) updateData.tokenExpiresAt = data.tokenExpiresAt;

  // Re-encrypt token if provided
  if (data.accessToken) {
    updateData.accessTokenEncrypted = encrypt(data.accessToken);
  }

  return prisma.facebookBusinessAccount.update({
    where: { id: accountId },
    data: updateData,
  });
}

/**
 * Delete Facebook Business Account
 */
export async function deleteFacebookBusinessAccount(
  accountId: string,
  userId: string
): Promise<void> {
  await getFacebookBusinessAccountById(accountId, userId);

  await prisma.facebookBusinessAccount.delete({
    where: { id: accountId },
  });
}

/**
 * Create Ad Account
 */
export async function createAdAccount(
  facebookBusinessAccountId: string,
  userId: string,
  data: {
    accountId: string;
    name: string;
    currency: string;
    timezone: string;
    accountStatus?: string;
  }
): Promise<AdAccount> {
  // Verify access to business account
  await getFacebookBusinessAccountById(facebookBusinessAccountId, userId);

  return prisma.adAccount.create({
    data: {
      facebookBusinessAccountId,
      accountId: data.accountId,
      name: data.name,
      currency: data.currency,
      timezone: data.timezone,
      accountStatus: data.accountStatus || 'ACTIVE',
    },
  });
}

/**
 * Get Ad Account by ID with RLS
 */
export async function getAdAccountById(accountId: string, userId: string): Promise<AdAccount> {
  const account = await prisma.adAccount.findFirst({
    where: {
      id: accountId,
      facebookBusinessAccount: {
        organization: {
          users: {
            some: {
              id: userId,
            },
          },
        },
      },
    },
  });

  if (!account) {
    throw new NotFoundError('Ad Account');
  }

  return account;
}

/**
 * Get all Ad Accounts for a Facebook Business Account
 */
export async function getAdAccountsByFacebookBusinessAccount(
  facebookBusinessAccountId: string,
  userId: string
): Promise<AdAccount[]> {
  await getFacebookBusinessAccountById(facebookBusinessAccountId, userId);

  return prisma.adAccount.findMany({
    where: { facebookBusinessAccountId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all Ad Accounts for organization
 */
export async function getAdAccountsByOrganization(
  organizationId: string,
  userId: string
): Promise<AdAccount[]> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
  });

  if (!user) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  return prisma.adAccount.findMany({
    where: {
      facebookBusinessAccount: {
        organizationId,
      },
    },
    include: {
      facebookBusinessAccount: {
        select: {
          name: true,
          businessId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update Ad Account
 */
export async function updateAdAccount(
  accountId: string,
  userId: string,
  data: {
    name?: string;
    accountStatus?: string;
    lastSyncAt?: Date;
  }
): Promise<AdAccount> {
  await getAdAccountById(accountId, userId);

  return prisma.adAccount.update({
    where: { id: accountId },
    data,
  });
}

/**
 * Delete Ad Account
 */
export async function deleteAdAccount(accountId: string, userId: string): Promise<void> {
  await getAdAccountById(accountId, userId);

  await prisma.adAccount.delete({
    where: { id: accountId },
  });
}
