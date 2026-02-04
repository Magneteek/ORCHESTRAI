import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/api-protection';
import { hasPermission, UserRole } from '@/lib/auth/permissions';
import { getTemplates, createTemplate } from '@/lib/db/templates';
import { createTemplateSchema, templateFilterSchema } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { ValidationError, ForbiddenError } from '@/lib/utils/errors';

/**
 * GET /api/templates - Get templates with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const filters = templateFilterSchema.parse(Object.fromEntries(searchParams));

    const result = await getTemplates(session.user.organizationId, session.user.id, filters);

    return paginatedResponse(result.data, result.pagination);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        new ValidationError('Invalid query parameters', error.errors),
        422
      );
    }

    return errorResponse(error as Error);
  }
}

/**
 * POST /api/templates - Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const userRole = session.user.role as UserRole;

    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    // Check if user is trying to create a global template
    if (data.isGlobal && !hasPermission(userRole, 'canCreateGlobalTemplate')) {
      throw new ForbiddenError('Only administrators can create global templates');
    }

    // Regular users can create private templates
    if (!hasPermission(userRole, 'canCreatePrivateTemplate')) {
      throw new ForbiddenError('You do not have permission to create templates');
    }

    const template = await createTemplate(session.user.organizationId, session.user.id, data);

    return createdResponse(template, 'Template created successfully');
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
