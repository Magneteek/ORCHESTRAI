/**
 * Analytics API Route
 * Aggregated analytics read from the local performance_metrics table.
 *
 * Previously this live-fetched the Graph API for every ad account on every
 * request. That path returned zero clicks and zero conversions (the
 * time-series call never asked for them), so the Analytics page showed real
 * spend next to a 0% CTR. It now shares one aggregation with
 * /api/analytics/simple, so the two pages cannot disagree.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { buildAnalyticsData, NoAdAccountsError } from '@/lib/analytics/aggregate';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const accountIds = searchParams.get('accountIds')?.split(',');
    const campaignIds = searchParams.get('campaignIds')?.split(',');

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
      userId: session.user.id,
      fromDate,
      toDate,
      accountIds,
      campaignIds,
    });

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error) {
    if (error instanceof NoAdAccountsError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, code: 'NO_AD_ACCOUNTS' } },
        { status: 404 }
      );
    }

    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch analytics',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
