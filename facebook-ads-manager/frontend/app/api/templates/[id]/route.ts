import { NextRequest } from 'next/server';
import { successResponse, errorResponse, noContentResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  incrementTemplateUsage,
} from '@/lib/db/templates';
import { updateTemplateSchema } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { ValidationError, ForbiddenError } from '@/lib/utils/errors';


/**
 * GET /api/templates/[id] - Get template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;

    const template = await getTemplateById(id, session.user.id);

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
    const session = await requireAuth(request);
    const userRole = session.user.role as UserRole;
    const { id } = await params;

    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    // Fetch template to check permissions
    const template = await getTemplateById(id, session.user.id);

    // Check if user is trying to edit a global template
    if (template.isGlobal && !hasPermission(userRole, 'canEditGlobalTemplate')) {
      throw new ForbiddenError('Only administrators can edit global templates');
    }

    // Check if user can edit this specific template
    if (!hasPermission(userRole, 'canEditTemplate', template, session.user.id)) {
      throw new ForbiddenError('You do not have permission to edit this template');
    }

    const updatedTemplate = await updateTemplate(id, session.user.id, data);

    return successResponse(updatedTemplate, {
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
    const session = await requireAuth(request);
    const userRole = session.user.role as UserRole;
    const { id } = await params;

    // Fetch template to check permissions
    const template = await getTemplateById(id, session.user.id);

    // Check if user can delete this template
    if (!hasPermission(userRole, 'canDeleteTemplate', template)) {
      throw new ForbiddenError(
        'You do not have permission to delete this template. ' +
        (template.isGlobal ? 'Only administrators can delete global templates.' : '')
      );
    }

    await deleteTemplate(id, session.user.id);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
