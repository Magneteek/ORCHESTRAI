/**
 * GET /api/cron/sync-facebook-data
 * Declared in vercel.json: "0 * /6 * * *" (every 6 hours).
 *
 * Syncs every ad account in the system. Runs the same code as the user-facing
 * sync button, one account at a time, so a large tenant cannot saturate the
 * Facebook rate limit or the Prisma pool.
 *
 * One account failing (expired token, revoked permissions) must not abort the
 * run, so each is caught individually and reported in the response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkCronAuth } from '@/lib/cron/auth';
import { syncAdAccount } from '@/lib/facebook/sync-account';

// Full syncs are slow; opt out of any static optimization.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const auth = checkCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
  }

  const startedAt = new Date();

  try {
    const adAccounts = await prisma.adAccount.findMany({
      include: { facebookBusinessAccount: true },
      orderBy: { lastSyncAt: 'asc' }, // stalest first, so a timeout starves nobody
    });

    const succeeded: Array<{ account: string; result: unknown }> = [];
    const failed: Array<{ account: string; error: string }> = [];

    for (const adAccount of adAccounts) {
      if (!adAccount.facebookBusinessAccount?.accessTokenEncrypted) {
        failed.push({ account: adAccount.name, error: 'No access token stored' });
        continue;
      }

      try {
        const result = await syncAdAccount(adAccount);
        succeeded.push({ account: adAccount.name, result });
      } catch (error: any) {
        const message = error?.message || 'Unknown sync error';
        console.error(`Cron sync failed for ${adAccount.name}:`, message);
        failed.push({ account: adAccount.name, error: message });
      }
    }

    const durationMs = Date.now() - startedAt.getTime();
    console.log(
      `Cron sync finished in ${durationMs}ms: ${succeeded.length} ok, ${failed.length} failed`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalAccounts: adAccounts.length,
        succeeded: succeeded.length,
        failed: failed.length,
        durationMs,
        results: succeeded,
        errors: failed,
      },
    });
  } catch (error: any) {
    console.error('Cron sync-facebook-data error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Cron sync failed' },
      { status: 500 }
    );
  }
}
