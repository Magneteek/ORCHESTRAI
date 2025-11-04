import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth, requirePermission } from '@/lib/auth/session';
import { forkTemplate } from '@/lib/db/templates';
import { z } from 'zod';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';


const forkTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

/**
 * POST /api/templates/[id]/fork - Fork/clone a template
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission('canManageTemplates');
    const { id } = await params;

    let data: { name?: string } = {};
    try {
      const body = await request.json();
      data = forkTemplateSchema.parse(body);
    } catch {
      // Empty body is fine for fork
    }

    const template = await forkTemplate(id, user.id, data.name);

    return successResponse(template, {
      status: 201,
      message: 'Template forked successfully',
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
