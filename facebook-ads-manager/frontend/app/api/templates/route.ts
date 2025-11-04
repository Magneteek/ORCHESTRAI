import { NextRequest } from 'next/server';
import { successResponse, errorResponse, createdResponse, paginatedResponse } from '@/lib/utils/api-response';
import { requireAuth, requirePermission } from '@/lib/auth/session';
import { getTemplates, createTemplate } from '@/lib/db/templates';
import { createTemplateSchema, templateFilterSchema } from '@/lib/utils/validation';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/templates - Get templates with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const filters = templateFilterSchema.parse(Object.fromEntries(searchParams));

    const result = await getTemplates(user.organizationId, user.id, filters);

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
    const user = await requirePermission('canManageTemplates');

    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    const template = await createTemplate(user.organizationId, user.id, data);

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
