/**
 * Template Analytics API Endpoint
 * GET /api/analytics/templates
 * Admin-only cross-account template performance analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-protection';
import { getTemplateAnalytics, getTemplateCategories } from '@/lib/db/analytics';
import { ApiResponse } from '@/types/api';
import { handleApiError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request);

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    // Build filters
    const filters: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
    } = {};

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    // Fetch analytics data
    const analytics = await getTemplateAnalytics(
      session.user.organizationId,
      filters
    );

    // Fetch available categories
    const categories = await getTemplateCategories(session.user.organizationId);

    const response: ApiResponse<{
      analytics: typeof analytics;
      categories: typeof categories;
    }> = {
      success: true,
      data: {
        analytics,
        categories,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
