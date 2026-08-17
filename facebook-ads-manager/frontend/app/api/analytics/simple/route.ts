import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { buildAnalyticsData, NoAdAccountsError } from '@/lib/analytics/aggregate';

/**
 * GET /api/analytics/simple
 * Dashboard analytics read from the local performance_metrics table
 * (populated by POST /api/sync/all). No live Facebook calls.
 *
 * Shares its aggregation with /api/analytics via lib/analytics/aggregate.
 * Unit contract: ctr and roas are ratios, not percentages.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const accountIds = searchParams.get('accountIds')?.split(',');

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: { message: 'Date range required', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid date format', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    const analyticsData = await buildAnalyticsData({
      userId: user.id,
      fromDate,
      toDate,
      accountIds,
    });

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error: any) {
    if (error instanceof NoAdAccountsError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, code: 'NO_AD_ACCOUNTS' } },
        { status: 404 }
      );
    }

    console.error('Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || 'Failed to fetch analytics',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
