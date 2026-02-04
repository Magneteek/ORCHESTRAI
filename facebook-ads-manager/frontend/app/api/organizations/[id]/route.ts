import { NextRequest } from 'next/server';
import { successResponse, errorResponse, noContentResponse } from '@/lib/utils/api-response';
import { requireAuth, requireAdmin } from '@/lib/auth/api-protection';
import {
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationWithUsers,
} from '@/lib/db/organizations';
import { updateOrganizationSchema } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';


/**
 * GET /api/organizations/[id] - Get organization by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;

    const organization = await getOrganizationWithUsers(id, session.user.id);

    return successResponse(organization);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * PATCH /api/organizations/[id] - Update organization
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(request);
    const { id } = await params;

    const body = await request.json();
    const data = updateOrganizationSchema.parse(body);

    const organization = await updateOrganization(id, session.user.id, data);

    return successResponse(organization, {
      message: 'Organization updated successfully',
    });
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

/**
 * DELETE /api/organizations/[id] - Delete organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin(request);
    const { id } = await params;

    await deleteOrganization(id, session.user.id);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
