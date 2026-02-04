/**
 * API Route Protection Utilities
 * Provides reusable middleware functions for securing API routes with authentication and authorization
 */

import { auth } from './auth';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { permissions, hasPermission, UserRole } from './permissions';
import type { SessionUser } from '@/types/database';

/**
 * Extended session type with user details
 */
interface AuthSession {
  user: SessionUser;
  expires: string;
}

/**
 * Require authentication for API routes
 * Throws UnauthorizedError if user is not authenticated
 *
 * @param request - Next.js request object
 * @returns Promise<AuthSession> - Authenticated session
 * @throws UnauthorizedError if not authenticated
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const session = await requireAuth(request);
 *   // User is authenticated, proceed with logic
 *   return Response.json({ userId: session.user.id });
 * }
 * ```
 */
export async function requireAuth(request: Request): Promise<AuthSession> {
  const session = await auth();

  if (!session || !session.user) {
    throw new UnauthorizedError('You must be signed in to access this resource');
  }

  return session as AuthSession;
}

/**
 * Require admin role for API routes
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if user is not an admin
 *
 * @param request - Next.js request object
 * @returns Promise<AuthSession> - Authenticated admin session
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user is not admin
 *
 * @example
 * ```typescript
 * export async function DELETE(request: Request) {
 *   const session = await requireAdmin(request);
 *   // User is admin, proceed with delete operation
 *   await deleteSensitiveResource();
 *   return Response.json({ success: true });
 * }
 * ```
 */
export async function requireAdmin(request: Request): Promise<AuthSession> {
  const session = await requireAuth(request);

  if (session.user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('This action requires administrator privileges');
  }

  return session;
}

/**
 * Require specific permission for API routes
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if user doesn't have required permission
 *
 * @param request - Next.js request object
 * @param permission - Permission key to check
 * @param args - Additional arguments for permission check (e.g., resource being accessed)
 * @returns Promise<AuthSession> - Authenticated session with required permission
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user lacks permission
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const session = await requirePermission(request, 'canCreateGlobalTemplate');
 *   // User has permission to create global templates
 *   const template = await createTemplate(data);
 *   return Response.json(template);
 * }
 * ```
 */
export async function requirePermission(
  request: Request,
  permission: keyof typeof permissions,
  ...args: any[]
): Promise<AuthSession> {
  const session = await requireAuth(request);

  const userRole = session.user.role as UserRole;
  const hasRequiredPermission = hasPermission(userRole, permission, ...args);

  if (!hasRequiredPermission) {
    throw new ForbiddenError(
      `You do not have permission to perform this action. Required: ${permission}`
    );
  }

  return session;
}

/**
 * Verify user belongs to specified organization
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if user doesn't belong to organization
 *
 * @param request - Next.js request object
 * @param organizationId - Organization ID to verify
 * @returns Promise<AuthSession> - Authenticated session for organization member
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user not in organization
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const searchParams = new URL(request.url).searchParams;
 *   const orgId = searchParams.get('organizationId');
 *   const session = await requireOrganizationMember(request, orgId!);
 *   // User belongs to organization
 *   return Response.json({ data: 'organization data' });
 * }
 * ```
 */
export async function requireOrganizationMember(
  request: Request,
  organizationId: string
): Promise<AuthSession> {
  const session = await requireAuth(request);

  if (session.user.organizationId !== organizationId) {
    throw new ForbiddenError('You do not have access to this organization');
  }

  return session;
}

/**
 * Optional authentication - returns session if available, null otherwise
 * Does not throw errors, useful for public endpoints that change behavior based on auth
 *
 * @param request - Next.js request object
 * @returns Promise<AuthSession | null> - Session if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const session = await optionalAuth(request);
 *   const includePrivate = session ? true : false;
 *   const templates = await getTemplates({ includePrivate });
 *   return Response.json(templates);
 * }
 * ```
 */
export async function optionalAuth(request: Request): Promise<AuthSession | null> {
  try {
    const session = await auth();
    return session ? (session as AuthSession) : null;
  } catch {
    return null;
  }
}

/**
 * Return unauthorized response (401)
 *
 * @param message - Optional custom error message
 * @returns Response with 401 status
 *
 * @example
 * ```typescript
 * if (!isAuthenticated) {
 *   return unauthorizedResponse('Please sign in to continue');
 * }
 * ```
 */
export function unauthorizedResponse(message?: string): Response {
  return Response.json(
    {
      success: false,
      error: {
        message: message || 'You must be signed in to access this resource',
        code: 'UNAUTHORIZED',
      },
    },
    { status: 401 }
  );
}

/**
 * Return forbidden response (403)
 *
 * @param message - Optional custom error message
 * @returns Response with 403 status
 *
 * @example
 * ```typescript
 * if (!hasPermission(user, 'canDeleteCampaign')) {
 *   return forbiddenResponse('Only admins can delete campaigns');
 * }
 * ```
 */
export function forbiddenResponse(message?: string): Response {
  return Response.json(
    {
      success: false,
      error: {
        message: message || 'You do not have permission to perform this action',
        code: 'FORBIDDEN',
      },
    },
    { status: 403 }
  );
}

/**
 * Combine multiple permission checks with AND logic
 * User must have ALL specified permissions
 *
 * @param request - Next.js request object
 * @param permissionsToCheck - Array of permission keys to check
 * @returns Promise<AuthSession> - Authenticated session with all required permissions
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user lacks any permission
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const session = await requireAllPermissions(request, [
 *     'canCreateCampaign',
 *     'canEditCampaignBudget'
 *   ]);
 *   // User has both permissions
 * }
 * ```
 */
export async function requireAllPermissions(
  request: Request,
  permissionsToCheck: Array<keyof typeof permissions>
): Promise<AuthSession> {
  const session = await requireAuth(request);
  const userRole = session.user.role as UserRole;

  for (const permission of permissionsToCheck) {
    if (!hasPermission(userRole, permission)) {
      throw new ForbiddenError(
        `You do not have required permissions. Missing: ${permission}`
      );
    }
  }

  return session;
}

/**
 * Combine multiple permission checks with OR logic
 * User must have AT LEAST ONE of the specified permissions
 *
 * @param request - Next.js request object
 * @param permissionsToCheck - Array of permission keys to check
 * @returns Promise<AuthSession> - Authenticated session with at least one required permission
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user lacks all permissions
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const session = await requireAnyPermission(request, [
 *     'canViewAnalytics',
 *     'canViewCrossAccountAnalytics'
 *   ]);
 *   // User has at least one analytics permission
 * }
 * ```
 */
export async function requireAnyPermission(
  request: Request,
  permissionsToCheck: Array<keyof typeof permissions>
): Promise<AuthSession> {
  const session = await requireAuth(request);
  const userRole = session.user.role as UserRole;

  const hasAnyPermission = permissionsToCheck.some((permission) =>
    hasPermission(userRole, permission)
  );

  if (!hasAnyPermission) {
    throw new ForbiddenError(
      `You do not have any of the required permissions: ${permissionsToCheck.join(', ')}`
    );
  }

  return session;
}
