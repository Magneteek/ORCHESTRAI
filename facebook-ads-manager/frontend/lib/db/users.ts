import { prisma } from './prisma';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';
import type { User, Prisma } from '@prisma/client';
import type { SafeUser } from '@/types/database';
import bcrypt from 'bcryptjs';

/**
 * Remove password from user object
 */
export function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Get safe user by ID
 */
export async function getSafeUserById(userId: string): Promise<SafeUser> {
  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }
  return sanitizeUser(user);
}

/**
 * Get user with organization
 */
export async function getUserWithOrganization(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return {
    ...sanitizeUser(user),
    organization: user.organization,
  };
}

/**
 * Create a new user
 */
export async function createUser(
  data: Prisma.UserCreateInput & { password?: string }
): Promise<SafeUser> {
  // Check if user already exists
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password if provided
  let hashedPassword: string | undefined;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  return sanitizeUser(user);
}

/**
 * Update user with RLS
 */
export async function updateUser(
  userId: string,
  requestingUserId: string,
  data: Prisma.UserUpdateInput
): Promise<SafeUser> {
  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  // Check if requesting user has permission
  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser) {
    throw new NotFoundError('Requesting user');
  }

  // Users can update themselves, or admins can update users in their org
  const canUpdate =
    userId === requestingUserId ||
    (requestingUser.role === 'admin' && requestingUser.organizationId === user.organizationId);

  if (!canUpdate) {
    throw new ForbiddenError('You do not have permission to update this user');
  }

  // If updating email, check for conflicts
  if (data.email && typeof data.email === 'string') {
    const existing = await getUserByEmail(data.email);
    if (existing && existing.id !== userId) {
      throw new ConflictError('User with this email already exists');
    }
  }

  // Hash password if provided
  if (data.password && typeof data.password === 'string') {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return sanitizeUser(updatedUser);
}

/**
 * Delete user with RLS
 */
export async function deleteUser(userId: string, requestingUserId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser) {
    throw new NotFoundError('Requesting user');
  }

  // Only admins can delete users in their org
  const canDelete =
    requestingUser.role === 'admin' && requestingUser.organizationId === user.organizationId;

  if (!canDelete) {
    throw new ForbiddenError('You do not have permission to delete this user');
  }

  await prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * Get all users in an organization
 */
export async function getUsersByOrganization(
  organizationId: string,
  requestingUserId: string
): Promise<SafeUser[]> {
  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser || requestingUser.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  const users = await prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });

  return users.map(sanitizeUser);
}

/**
 * Verify user password
 */
export async function verifyUserPassword(email: string, password: string): Promise<SafeUser> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    throw new NotFoundError('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new NotFoundError('Invalid credentials');
  }

  return sanitizeUser(user);
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(userId);
  if (!user || !user.password) {
    throw new NotFoundError('User');
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new ForbiddenError('Current password is incorrect');
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}
