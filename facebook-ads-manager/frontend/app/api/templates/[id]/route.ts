import { NextRequest } from 'next/server';
import { successResponse, errorResponse, noContentResponse } from '@/lib/utils/api-response';
import { requireAuth, requirePermission } from '@/lib/auth/session';
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
} from '@/lib/db/templates';
import { updateTemplateSchema } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';


/**
 * GET /api/templates/[id] - Get template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const template = await getTemplateById(id, user.id);

    return successResponse(template);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * PATCH /api/templates/[id] - Update template
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('canManageTemplates');
    const { id } = await params;

    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    const template = await updateTemplate(id, user.id, data);

    return successResponse(template, {
      message: 'Template updated successfully',
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
 * DELETE /api/templates/[id] - Delete template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('canManageTemplates');
    const { id } = await params;

    await deleteTemplate(id, user.id);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
