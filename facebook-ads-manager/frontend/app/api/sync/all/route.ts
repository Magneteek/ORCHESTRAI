/**
 * POST /api/sync/all
 * Full cascade sync for one ad account, scoped to the caller's organization.
 * The sync itself lives in lib/facebook/sync-account so the scheduled job at
 * /api/cron/sync-facebook-data runs exactly the same code.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { syncAdAccount } from '@/lib/facebook/sync-account';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { adAccountId } = await request.json();

    if (!adAccountId) {
      return NextResponse.json(
        { success: false, error: 'adAccountId is required' },
        { status: 400 }
      );
    }

    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: { users: { some: { id: user.id } } },
        },
      },
      include: { facebookBusinessAccount: true },
    });

    if (!adAccount) {
      return NextResponse.json(
        { success: false, error: 'Ad account not found' },
        { status: 404 }
      );
    }

    const results = await syncAdAccount(adAccount);

    return NextResponse.json({
      success: true,
      data: results,
      message: `Synced ${results.campaigns} campaigns, ${results.adSets} ad sets, ${results.ads} ads, ${results.metrics} daily metric rows`,
    });
  } catch (error: any) {
    console.error('Sync all error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
