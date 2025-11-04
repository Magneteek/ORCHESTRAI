import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/auth/session';
import { getAdAccountsByOrganization } from '@/lib/db/facebook-accounts';

/**
 * GET /api/ad-accounts - Get all ad accounts for organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const adAccounts = await getAdAccountsByOrganization(user.organizationId, user.id);

    return successResponse(adAccounts);
  } catch (error) {
    return errorResponse(error as Error);
  }
}
