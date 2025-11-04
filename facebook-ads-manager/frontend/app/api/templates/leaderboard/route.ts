import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getTopTemplates } from '@/lib/db/templates';

/**
 * GET /api/templates/leaderboard - Get top performing templates
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;

    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const templates = await getTopTemplates(user.organizationId, user.id, limit);

    return successResponse(templates);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
