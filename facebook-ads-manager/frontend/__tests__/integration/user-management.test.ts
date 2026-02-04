/**
 * Integration Tests: User Management API
 * Tests admin user management endpoints
 */

import { GET as GetUsers } from '@/app/api/admin/users/route';
import { PATCH as UpdateUserRole } from '@/app/api/admin/users/[id]/role/route';
import { POST as InviteUser } from '@/app/api/admin/users/invite/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  testPrisma,
} from '../setup/test-db';
import {
  createTestOrganization,
  createTestUser,
  createTestAdmin,
  mockUserSession,
  mockAdminSession,
  randomEmail,
} from '../setup/test-helpers';
import { UserRole } from '@prisma/client';

// Mock next-auth
jest.mock('next-auth');
const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe('User Management API Integration Tests', () => {
  let testOrg: any;
  let testUser: any;
  let testAdmin: any;
  let secondAdmin: any;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    testOrg = await createTestOrganization();
    testUser = await createTestUser(testOrg.id, UserRole.USER);
    testAdmin = await createTestAdmin(testOrg.id);
    secondAdmin = await createTestAdmin(testOrg.id, {
      email: randomEmail(),
      name: 'Second Admin',
    });
  });

  afterEach(async () => {
    await testPrisma.user.deleteMany();
    await testPrisma.organization.deleteMany();
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return all users in organization for ADMIN', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/users');

      const response = await GetUsers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(3); // testUser, testAdmin, secondAdmin
    });

    it('should include user details in response', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/users');

      const response = await GetUsers(request);
      const data = await response.json();

      const user = data.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('should not include password in response', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/users');

      const response = await GetUsers(request);
      const data = await response.json();

      data.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should return 401 for USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest('http://localhost:3000/api/admin/users');

      const response = await GetUsers(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('should only return users from the same organization', async () => {
      // Create another organization with users
      const otherOrg = await createTestOrganization({
        slug: 'other-org-' + Date.now(),
      });
      await createTestUser(otherOrg.id);

      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/users');

      const response = await GetUsers(request);
      const data = await response.json();

      // Should only return users from testOrg
      expect(data.data.length).toBe(3);
      data.data.forEach((user: any) => {
        const dbUser = testPrisma.user.findUnique({ where: { id: user.id } });
        expect(dbUser).toBeDefined();
      });
    });
  });

  describe('PATCH /api/admin/users/[id]/role', () => {
    it('should allow ADMIN to promote USER to ADMIN', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${testUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.ADMIN,
          }),
        }
      );

      const context = { params: { id: testUser.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.role).toBe(UserRole.ADMIN);

      // Verify in database
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser?.role).toBe(UserRole.ADMIN);
    });

    it('should allow ADMIN to demote ADMIN to USER', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${secondAdmin.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.USER,
          }),
        }
      );

      const context = { params: { id: secondAdmin.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.role).toBe(UserRole.USER);

      // Verify in database
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: secondAdmin.id },
      });

      expect(updatedUser?.role).toBe(UserRole.USER);
    });

    it('should prevent demoting last admin', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      // First demote secondAdmin
      await testPrisma.user.update({
        where: { id: secondAdmin.id },
        data: { role: UserRole.USER },
      });

      // Now try to demote the last admin
      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${testAdmin.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.USER,
          }),
        }
      );

      const context = { params: { id: testAdmin.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('cannot change your own role');
    });

    it('should prevent admin from changing their own role', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${testAdmin.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.USER,
          }),
        }
      );

      const context = { params: { id: testAdmin.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 when user not found', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        'http://localhost:3000/api/admin/users/non-existent-id/role',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.ADMIN,
          }),
        }
      );

      const context = { params: { id: 'non-existent-id' } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('User not found');
    });

    it('should prevent changing role of user from different organization', async () => {
      // Create user in different org
      const otherOrg = await createTestOrganization({
        slug: 'other-org-' + Date.now(),
      });
      const otherUser = await createTestUser(otherOrg.id);

      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${otherUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.ADMIN,
          }),
        }
      );

      const context = { params: { id: otherUser.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('User not in your organization');
    });

    it('should validate role enum', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${testUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'INVALID_ROLE',
          }),
        }
      );

      const context = { params: { id: testUser.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update by USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/users/${testUser.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: UserRole.ADMIN,
          }),
        }
      );

      const context = { params: { id: testUser.id } };

      const response = await UpdateUserRole(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/admin/users/invite', () => {
    it('should allow ADMIN to invite new user', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const newEmail = randomEmail();

      const request = new NextRequest(
        'http://localhost:3000/api/admin/users/invite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: newEmail,
            role: UserRole.USER,
          }),
        }
      );

      const response = await InviteUser(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(newEmail);
      expect(data.data.role).toBe(UserRole.USER);
    });

    it('should reject duplicate email', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        'http://localhost:3000/api/admin/users/invite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUser.email, // Existing email
            role: UserRole.USER,
          }),
        }
      );

      const response = await InviteUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('USER_EXISTS');
    });

    it('should validate email format', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        'http://localhost:3000/api/admin/users/invite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'invalid-email',
            role: UserRole.USER,
          }),
        }
      );

      const response = await InviteUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invite by USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest(
        'http://localhost:3000/api/admin/users/invite',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: randomEmail(),
            role: UserRole.USER,
          }),
        }
      );

      const response = await InviteUser(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
