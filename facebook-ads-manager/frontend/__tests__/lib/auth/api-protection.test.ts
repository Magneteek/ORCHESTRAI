import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  requireAuth,
  requireAdmin,
  requirePermission,
  requireOrganizationMember,
  optionalAuth,
  unauthorizedResponse,
  forbiddenResponse,
  requireAllPermissions,
  requireAnyPermission,
} from '@/lib/auth/api-protection';
import { UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';
import { UserRole } from '@prisma/client';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth/config', () => ({
  authConfig: {},
}));

const { getServerSession } = require('next-auth');

describe('API Protection Utilities', () => {
  let mockRequest: Request;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new Request('http://localhost/api/test');
  });

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireAuth(mockRequest);

      expect(session).toEqual(mockSession);
      expect(session.user.id).toBe('user-1');
    });

    it('should throw UnauthorizedError when session is null', async () => {
      getServerSession.mockResolvedValue(null);

      await expect(requireAuth(mockRequest)).rejects.toThrow(UnauthorizedError);
      await expect(requireAuth(mockRequest)).rejects.toThrow(
        'You must be signed in to access this resource'
      );
    });

    it('should throw UnauthorizedError when session.user is null', async () => {
      const mockSession = {
        user: null,
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      await expect(requireAuth(mockRequest)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when session is undefined', async () => {
      getServerSession.mockResolvedValue(undefined);

      await expect(requireAuth(mockRequest)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('requireAdmin', () => {
    it('should return session when user is admin', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireAdmin(mockRequest);

      expect(session).toEqual(mockSession);
      expect(session.user.role).toBe(UserRole.ADMIN);
    });

    it('should throw ForbiddenError when user is not admin', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Regular User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      await expect(requireAdmin(mockRequest)).rejects.toThrow(ForbiddenError);
      await expect(requireAdmin(mockRequest)).rejects.toThrow(
        'This action requires administrator privileges'
      );
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      await expect(requireAdmin(mockRequest)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('requirePermission', () => {
    it('should return session when user has required permission', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requirePermission(
        mockRequest,
        'canCreateGlobalTemplate'
      );

      expect(session).toEqual(mockSession);
    });

    it('should throw ForbiddenError when user lacks permission', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Regular User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      await expect(
        requirePermission(mockRequest, 'canCreateGlobalTemplate')
      ).rejects.toThrow(ForbiddenError);

      try {
        await requirePermission(mockRequest, 'canCreateGlobalTemplate');
      } catch (error) {
        expect((error as ForbiddenError).message).toContain(
          'canCreateGlobalTemplate'
        );
      }
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      await expect(
        requirePermission(mockRequest, 'canViewTemplates')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should pass additional arguments to permission check', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const mockTemplate = {
        id: 'template-1',
        isGlobal: false,
        organizationId: 'org-1',
      };

      const session = await requirePermission(
        mockRequest,
        'canEditTemplate',
        mockTemplate,
        'user-1'
      );

      expect(session).toEqual(mockSession);
    });

    it('should handle user permissions correctly', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Regular User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requirePermission(
        mockRequest,
        'canViewTemplates'
      );

      expect(session).toEqual(mockSession);
    });
  });

  describe('requireOrganizationMember', () => {
    it('should return session when user belongs to organization', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireOrganizationMember(mockRequest, 'org-1');

      expect(session).toEqual(mockSession);
    });

    it('should throw ForbiddenError when user belongs to different organization', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      await expect(
        requireOrganizationMember(mockRequest, 'org-2')
      ).rejects.toThrow(ForbiddenError);

      await expect(
        requireOrganizationMember(mockRequest, 'org-2')
      ).rejects.toThrow('You do not have access to this organization');
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      await expect(
        requireOrganizationMember(mockRequest, 'org-1')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should allow admins from correct organization', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireOrganizationMember(mockRequest, 'org-1');

      expect(session).toEqual(mockSession);
    });
  });

  describe('optionalAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await optionalAuth(mockRequest);

      expect(session).toEqual(mockSession);
    });

    it('should return null when user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const session = await optionalAuth(mockRequest);

      expect(session).toBeNull();
    });

    it('should return null when session retrieval fails', async () => {
      getServerSession.mockRejectedValue(new Error('Session error'));

      const session = await optionalAuth(mockRequest);

      expect(session).toBeNull();
    });

    it('should return null when session is undefined', async () => {
      getServerSession.mockResolvedValue(undefined);

      const session = await optionalAuth(mockRequest);

      expect(session).toBeNull();
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return 401 response with default message', () => {
      const response = unauthorizedResponse();

      expect(response.status).toBe(401);
    });

    it('should return 401 response with custom message', () => {
      const response = unauthorizedResponse('Custom error message');

      expect(response.status).toBe(401);
    });

    it('should include proper error structure in response body', async () => {
      const response = unauthorizedResponse('Test message');
      const body = await response.json();

      expect(body).toMatchObject({
        success: false,
        error: {
          message: 'Test message',
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should use default message when none provided', async () => {
      const response = unauthorizedResponse();
      const body = await response.json();

      expect(body.error.message).toBe(
        'You must be signed in to access this resource'
      );
    });
  });

  describe('forbiddenResponse', () => {
    it('should return 403 response with default message', () => {
      const response = forbiddenResponse();

      expect(response.status).toBe(403);
    });

    it('should return 403 response with custom message', () => {
      const response = forbiddenResponse('Custom forbidden message');

      expect(response.status).toBe(403);
    });

    it('should include proper error structure in response body', async () => {
      const response = forbiddenResponse('Access denied');
      const body = await response.json();

      expect(body).toMatchObject({
        success: false,
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN',
        },
      });
    });

    it('should use default message when none provided', async () => {
      const response = forbiddenResponse();
      const body = await response.json();

      expect(body.error.message).toBe(
        'You do not have permission to perform this action'
      );
    });
  });

  describe('requireAllPermissions', () => {
    it('should return session when user has all permissions', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireAllPermissions(mockRequest, [
        'canCreateGlobalTemplate',
        'canDeleteCampaign',
        'canViewCrossAccountAnalytics',
      ]);

      expect(session).toEqual(mockSession);
    });

    it('should throw ForbiddenError when user lacks any permission', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      await expect(
        requireAllPermissions(mockRequest, [
          'canViewTemplates',
          'canDeleteCampaign', // User doesn't have this
        ])
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw error with missing permission name', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      try {
        await requireAllPermissions(mockRequest, [
          'canViewTemplates',
          'canDeleteCampaign',
        ]);
      } catch (error) {
        expect((error as ForbiddenError).message).toContain('canDeleteCampaign');
      }
    });

    it('should handle empty permissions array', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireAllPermissions(mockRequest, []);

      expect(session).toEqual(mockSession);
    });
  });

  describe('requireAnyPermission', () => {
    it('should return session when user has at least one permission', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireAnyPermission(mockRequest, [
        'canDeleteCampaign', // User doesn't have this
        'canViewTemplates', // User has this
      ]);

      expect(session).toEqual(mockSession);
    });

    it('should throw ForbiddenError when user lacks all permissions', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      await expect(
        requireAnyPermission(mockRequest, [
          'canDeleteCampaign',
          'canCreateGlobalTemplate',
          'canViewCrossAccountAnalytics',
        ])
      ).rejects.toThrow(ForbiddenError);
    });

    it('should include all checked permissions in error message', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role: UserRole.USER,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      try {
        await requireAnyPermission(mockRequest, [
          'canDeleteCampaign',
          'canCreateGlobalTemplate',
        ]);
      } catch (error) {
        const message = (error as ForbiddenError).message;
        expect(message).toContain('canDeleteCampaign');
        expect(message).toContain('canCreateGlobalTemplate');
      }
    });

    it('should work with admin having all permissions', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const session = await requireAnyPermission(mockRequest, [
        'canDeleteCampaign',
        'canCreateGlobalTemplate',
      ]);

      expect(session).toEqual(mockSession);
    });
  });

  describe('Integration Tests', () => {
    it('should properly chain authentication and authorization checks', async () => {
      const mockSession = {
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin',
          role: UserRole.ADMIN,
          organizationId: 'org-1',
        },
        expires: '2025-12-31',
      };

      getServerSession.mockResolvedValue(mockSession);

      const authSession = await requireAuth(mockRequest);
      const adminSession = await requireAdmin(mockRequest);
      const permSession = await requirePermission(
        mockRequest,
        'canCreateGlobalTemplate'
      );

      expect(authSession).toEqual(mockSession);
      expect(adminSession).toEqual(mockSession);
      expect(permSession).toEqual(mockSession);
    });

    it('should handle complete failure scenarios', async () => {
      getServerSession.mockResolvedValue(null);

      await expect(requireAuth(mockRequest)).rejects.toThrow(UnauthorizedError);
      await expect(requireAdmin(mockRequest)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(
        requirePermission(mockRequest, 'canViewTemplates')
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        requireOrganizationMember(mockRequest, 'org-1')
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
