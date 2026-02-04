/**
 * Template Account Breakdown API Endpoint
 * GET /api/analytics/templates/[id]/breakdown
 * Admin-only per-account breakdown for a template
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-protection';
import { getTemplateAccountBreakdown } from '@/lib/db/analytics';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/utils/errors';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAdmin(request);
    const { id: templateId } = await context.params;

    // Fetch account breakdown
    const breakdown = await getTemplateAccountBreakdown(
      templateId,
      session.user.organizationId
    );

    const response: ApiResponse<typeof breakdown> = {
      success: true,
      data: breakdown,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
