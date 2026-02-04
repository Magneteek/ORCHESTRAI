import { auth } from './auth';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import type { SessionUser, RolePermissions } from '@/types/database';
import { UserRole, ROLE_PERMISSIONS } from '@/types/database';

/**
 * Get the current session
 */
export async function getSession() {
  return auth();
}

/**
 * Get the current user or throw if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();

  if (!session || !session.user) {
    throw new UnauthorizedError('You must be signed in to access this resource');
  }

  return session.user as SessionUser;
}

/**
 * Require specific role
 */
export async function requireRole(role: UserRole | UserRole[]): Promise<SessionUser> {
  const user = await requireAuth();

  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role as UserRole)) {
    throw new ForbiddenError('You do not have permission to access this resource');
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(UserRole.ADMIN);
}

/**
 * Require manager or admin role
 * Note: The old 'manager' role has been consolidated into ADMIN
 */
export async function requireManager(): Promise<SessionUser> {
  return requireRole(UserRole.ADMIN);
}

/**
 * Verify user belongs to organization
 */
export async function requireOrganization(organizationId: string): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  return user;
}

/**
 * Get role permissions
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  permission: keyof RolePermissions
): Promise<boolean> {
  try {
    const user = await requireAuth();
    const permissions = getRolePermissions(user.role as UserRole);
    return permissions[permission];
  } catch {
    return false;
  }
}

/**
 * Require specific permission
 */
export async function requirePermission(
  permission: keyof RolePermissions
): Promise<SessionUser> {
  const user = await requireAuth();
  const permissions = getRolePermissions(user.role as UserRole);

  if (!permissions[permission]) {
    throw new ForbiddenError(`You do not have permission to perform this action`);
  }

  return user;
}
