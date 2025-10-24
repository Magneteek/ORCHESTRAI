/**
 * Anomaly Detection API
 * GET /api/ai/anomalies
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getRecentAnomalies } from '@/lib/ai/anomaly-detector';
import { runImmediateAnomalyDetection, getAnomalyDetectionStatus } from '@/lib/queue/jobs/anomaly-detection';
import { prisma } from '@/lib/db/prisma';
import { subDays } from 'date-fns';

/**
 * GET /api/ai/anomalies?adAccountId=xxx&hours=24
 * Get recent anomalies for an account
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');
    const hoursBack = parseInt(searchParams.get('hours') || '24');

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    // Verify account access
    const account = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Ad account not found or access denied' },
        { status: 404 }
      );
    }

    // Get recent anomalies
    const anomalies = await getRecentAnomalies(adAccountId, hoursBack);

    // Get detection status
    const status = await getAnomalyDetectionStatus(adAccountId);

    // TODO: Add AI Alert model to schema
    // Get unread alerts
    // const alerts = await prisma.aiAlert.findMany({
    //   where: {
    //     adAccountId,
    //     alertType: 'critical_anomaly',
    //     status: 'unread',
    //     createdAt: {
    //       gte: subDays(new Date(), hoursBack / 24),
    //     },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      anomalies,
      status,
      alerts: [], // Placeholder until AI Alert model is added
    });
  } catch (error: any) {
    console.error('Get anomalies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/anomalies
 * Trigger immediate anomaly detection
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { adAccountId, campaignId } = body;

    if (!adAccountId) {
      return NextResponse.json(
        { error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    // Verify account access
    const account = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Ad account not found or access denied' },
        { status: 404 }
      );
    }

    // Run immediate detection
    const result = await runImmediateAnomalyDetection(adAccountId, campaignId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Anomaly detection API error:', error);
    return NextResponse.json(
      { error: 'Failed to run anomaly detection', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai/anomalies
 * Mark anomaly alert as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'alertId and status are required' },
        { status: 400 }
      );
    }

    // TODO: Add AI Alert model to schema
    // Verify alert access
    // const alert = await prisma.aiAlert.findFirst({
    //   where: {
    //     id: alertId,
    //     adAccount: {
    //       facebookBusinessAccount: {
    //         organization: {
    //           users: {
    //             some: {
    //               id: session.user.id,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // if (!alert) {
    //   return NextResponse.json(
    //     { error: 'Alert not found or access denied' },
    //     { status: 404 }
    //   );
    // }

    // Update alert status
    // await prisma.aiAlert.update({
    //   where: { id: alertId },
    //   data: {
    //     status,
    //     resolvedAt: status === 'resolved' ? new Date() : null,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Alert status update not yet implemented - AI Alert model pending',
    });
  } catch (error: any) {
    console.error('Update alert API error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
