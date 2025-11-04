import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse } from '@/lib/utils/api-response';
import { requireAuth, requireAdmin } from '@/lib/auth/session';
import { getOrganizationById, createOrganization } from '@/lib/db/organizations';
import { createOrganizationSchema } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/organizations - Get current user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const organization = await getOrganizationById(user.organizationId, user.id);

    return successResponse(organization);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/organizations - Create a new organization (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const data = createOrganizationSchema.parse(body);

    const organization = await createOrganization(data);

    return createdResponse(organization, 'Organization created successfully');
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Validation failed', error.errors),
        422
      );
    }

    return errorResponse(error as Error);
  }
}
