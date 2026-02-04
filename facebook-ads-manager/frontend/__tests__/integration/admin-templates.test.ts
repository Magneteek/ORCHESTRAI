/**
 * Integration Tests: Admin Templates API
 * Tests admin template management endpoints
 */

import { GET as GetTemplates, POST as CreateTemplate } from '@/app/api/admin/templates/route';
import { PATCH as UpdateTemplate, DELETE as DeleteTemplate } from '@/app/api/admin/templates/[id]/route';
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
  createTestTemplate,
  createGlobalTestTemplate,
  mockUserSession,
  mockAdminSession,
} from '../setup/test-helpers';
import { UserRole } from '@prisma/client';

// Mock next-auth
jest.mock('next-auth');
const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe('Admin Templates API Integration Tests', () => {
  let testOrg: any;
  let testUser: any;
  let testAdmin: any;
  let testTemplate: any;
  let globalTemplate: any;

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
    testTemplate = await createTestTemplate(testOrg.id);
    globalTemplate = await createGlobalTestTemplate(testOrg.id);
  });

  afterEach(async () => {
    await testPrisma.templateLaunch.deleteMany();
    await testPrisma.campaign.deleteMany();
    await testPrisma.adTemplate.deleteMany();
    await testPrisma.user.deleteMany();
    await testPrisma.organization.deleteMany();
    jest.clearAllMocks();
  });

  describe('POST /api/admin/templates', () => {
    it('should allow ADMIN to create global template', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Global Template',
          description: 'A global template for all organizations',
          category: 'e-commerce',
          objective: 'OUTCOME_SALES',
          visibility: 'public',
          isGlobal: true,
          adCopy: {
            headline: 'Test Headline',
            primaryText: 'Test primary text',
            description: 'Test description',
            callToAction: 'SHOP_NOW',
          },
          creativeSpecs: {
            format: 'single_image',
            imageUrl: 'https://example.com/image.jpg',
          },
          targetingConfig: {
            locations: ['US'],
            ageMin: 25,
            ageMax: 45,
          },
          campaignStructure: {
            budget: 50,
            bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
          },
        }),
      });

      const response = await CreateTemplate(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.isGlobal).toBe(true);
      expect(data.data.visibility).toBe('public');
      expect(data.data.name).toBe('New Global Template');
    });

    it('should persist template to database', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Persisted Template',
          description: 'Should be saved to DB',
          category: 'lead-generation',
          objective: 'OUTCOME_LEADS',
          visibility: 'private',
          isGlobal: false,
          adCopy: {
            headline: 'Test',
            primaryText: 'Test',
            callToAction: 'LEARN_MORE',
          },
          creativeSpecs: {},
          targetingConfig: {},
          campaignStructure: {},
        }),
      });

      const response = await CreateTemplate(request);
      const data = await response.json();

      // Verify it's in the database
      const dbTemplate = await testPrisma.adTemplate.findUnique({
        where: { id: data.data.id },
      });

      expect(dbTemplate).toBeDefined();
      expect(dbTemplate?.name).toBe('Persisted Template');
      expect(dbTemplate?.category).toBe('lead-generation');
    });

    it('should save dynamic fields correctly', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const dynamicFields = {
        fields: [
          {
            name: 'business_name',
            type: 'text',
            required: true,
            placeholder: 'Enter business name',
          },
          {
            name: 'discount',
            type: 'number',
            required: false,
            defaultValue: 10,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Template with Dynamic Fields',
          category: 'e-commerce',
          objective: 'OUTCOME_SALES',
          visibility: 'public',
          isGlobal: true,
          dynamicFields,
          adCopy: {
            headline: 'Test',
            primaryText: 'Test',
            callToAction: 'SHOP_NOW',
          },
          creativeSpecs: {},
          targetingConfig: {},
          campaignStructure: {},
        }),
      });

      const response = await CreateTemplate(request);
      const data = await response.json();

      expect(data.data.dynamicFields).toEqual(dynamicFields);

      // Verify in database
      const dbTemplate = await testPrisma.adTemplate.findUnique({
        where: { id: data.data.id },
      });

      expect(dbTemplate?.dynamicFields).toEqual(dynamicFields);
    });

    it('should reject creation by USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest('http://localhost:3000/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Unauthorized Template',
          category: 'e-commerce',
          objective: 'OUTCOME_SALES',
          visibility: 'public',
          isGlobal: true,
          adCopy: {},
          creativeSpecs: {},
          targetingConfig: {},
          campaignStructure: {},
        }),
      });

      const response = await CreateTemplate(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });

    it('should validate required fields', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required fields
          name: '',
          category: 'e-commerce',
        }),
      });

      const response = await CreateTemplate(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/admin/templates', () => {
    it('should return all templates for organization', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest('http://localhost:3000/api/admin/templates');

      const response = await GetTemplates(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should filter by isGlobal flag', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        'http://localhost:3000/api/admin/templates?isGlobal=true'
      );

      const response = await GetTemplates(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((t: any) => t.isGlobal === true)).toBe(true);
    });

    it('should filter by category', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        'http://localhost:3000/api/admin/templates?category=e-commerce'
      );

      const response = await GetTemplates(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest('http://localhost:3000/api/admin/templates');

      const response = await GetTemplates(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/admin/templates/[id]', () => {
    it('should allow ADMIN to update global template', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/templates/${globalTemplate.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Updated Global Template',
            description: 'Updated description',
          }),
        }
      );

      const context = { params: { id: globalTemplate.id } };

      const response = await UpdateTemplate(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Global Template');

      // Verify in database
      const dbTemplate = await testPrisma.adTemplate.findUnique({
        where: { id: globalTemplate.id },
      });

      expect(dbTemplate?.name).toBe('Updated Global Template');
    });

    it('should allow updating dynamic fields', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const newFields = {
        fields: [
          {
            name: 'new_field',
            type: 'text',
            required: true,
          },
        ],
      };

      const request = new NextRequest(
        `http://localhost:3000/api/admin/templates/${testTemplate.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dynamicFields: newFields,
          }),
        }
      );

      const context = { params: { id: testTemplate.id } };

      const response = await UpdateTemplate(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.dynamicFields).toEqual(newFields);
    });

    it('should reject update by USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/templates/${globalTemplate.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Unauthorized Update',
          }),
        }
      );

      const context = { params: { id: globalTemplate.id } };

      const response = await UpdateTemplate(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/templates/[id]', () => {
    it('should allow ADMIN to delete template', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const templateToDelete = await createTestTemplate(testOrg.id);

      const request = new NextRequest(
        `http://localhost:3000/api/admin/templates/${templateToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      const context = { params: { id: templateToDelete.id } };

      const response = await DeleteTemplate(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify deleted from database
      const dbTemplate = await testPrisma.adTemplate.findUnique({
        where: { id: templateToDelete.id },
      });

      expect(dbTemplate).toBeNull();
    });

    it('should cascade delete TemplateLaunch records', async () => {
      mockGetServerSession.mockResolvedValue(mockAdminSession(testAdmin));

      const templateWithLaunches = await createTestTemplate(testOrg.id);

      // Create a campaign and template launch
      const businessAccount = await testPrisma.facebookBusinessAccount.create({
        data: {
          organizationId: testOrg.id,
          businessId: `${Date.now()}`,
          name: 'Test Business',
          accessTokenEncrypted: 'token',
          isActive: true,
        },
      });

      const adAccount = await testPrisma.adAccount.create({
        data: {
          facebookBusinessAccountId: businessAccount.id,
          accountId: `act_${Date.now()}`,
          name: 'Test Account',
          currency: 'USD',
          timezone: 'UTC',
        },
      });

      const campaign = await testPrisma.campaign.create({
        data: {
          adAccountId: adAccount.id,
          campaignId: `${Date.now()}`,
          name: 'Test Campaign',
          objective: 'OUTCOME_SALES',
          status: 'ACTIVE',
          templateId: templateWithLaunches.id,
        },
      });

      await testPrisma.templateLaunch.create({
        data: {
          templateId: templateWithLaunches.id,
          campaignId: campaign.id,
          adAccountId: adAccount.id,
          userId: testAdmin.id,
          fieldValues: {},
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/admin/templates/${templateWithLaunches.id}`,
        {
          method: 'DELETE',
        }
      );

      const context = { params: { id: templateWithLaunches.id } };

      await DeleteTemplate(request, context);

      // Verify template launches are deleted
      const launches = await testPrisma.templateLaunch.findMany({
        where: { templateId: templateWithLaunches.id },
      });

      expect(launches.length).toBe(0);
    });

    it('should reject delete by USER role', async () => {
      mockGetServerSession.mockResolvedValue(mockUserSession(testUser));

      const request = new NextRequest(
        `http://localhost:3000/api/admin/templates/${testTemplate.id}`,
        {
          method: 'DELETE',
        }
      );

      const context = { params: { id: testTemplate.id } };

      const response = await DeleteTemplate(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
