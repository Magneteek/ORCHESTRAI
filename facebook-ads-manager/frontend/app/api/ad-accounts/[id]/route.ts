import { NextRequest } from 'next/server';
import { successResponse, errorResponse, noContentResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getAdAccountById, updateAdAccount, deleteAdAccount } from '@/lib/db/facebook-accounts';
import { ZodError } from 'zod';
import { ValidationError } from '@/lib/utils/errors';
import { z } from 'zod';

const updateAdAccountSchema = z.object({
  name: z.string().min(1).optional(),
  accountStatus: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

/**
 * GET /api/ad-accounts/[id] - Get ad account by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const adAccount = await getAdAccountById(id, user.id);

    return successResponse(adAccount);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * PATCH /api/ad-accounts/[id] - Update ad account
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const data = updateAdAccountSchema.parse(body);

    const adAccount = await updateAdAccount(id, user.id, data);

    return successResponse(adAccount, {
      message: 'Ad account updated successfully',
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
 * DELETE /api/ad-accounts/[id] - Delete ad account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await deleteAdAccount(id, user.id);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error as Error);
  }
}
