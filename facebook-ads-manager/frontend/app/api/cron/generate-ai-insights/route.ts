/**
 * GET /api/cron/generate-ai-insights
 * Declared in vercel.json: "0 2 * * *" (daily, 02:00).
 *
 * Runs anomaly detection per ad account and records the outcome.
 *
 * KNOWN LIMITATION (as of 2026-08-10): this is plumbing-complete but produces
 * nothing yet. `getHistoricalData()` in lib/queue/jobs/anomaly-detection.ts is
 * a hardcoded `return []` sitting under a "TODO: Add CampaignInsights model"
 * comment, so every account short-circuits on the "Insufficient historical
 * data" guard. The data it wants now exists in `performance_metrics`; the fix
 * is to repoint that helper, not to add a model.
 *
 * Until then this route is a safe no-op: with no historical rows it never
 * reaches the Anthropic client, so scheduling it costs nothing. It reports
 * `insufficientData` per account so the blocker is visible in the cron log
 * rather than looking like a silent success.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkCronAuth } from '@/lib/cron/auth';
import { runImmediateAnomalyDetection } from '@/lib/queue/jobs/anomaly-detection';

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

  const startedAt = Date.now();

  try {
    const adAccounts = await prisma.adAccount.findMany({
      select: { id: true, name: true },
    });

    const analyzed: Array<{ account: string; result: unknown }> = [];
    const insufficientData: string[] = [];
    const failed: Array<{ account: string; error: string }> = [];

    for (const adAccount of adAccounts) {
      try {
        const result = await runImmediateAnomalyDetection(adAccount.id);

        // The job returns { error } rather than throwing when it lacks history.
        if (result && typeof result === 'object' && 'error' in result) {
          insufficientData.push(adAccount.name);
          continue;
        }

        analyzed.push({ account: adAccount.name, result });
      } catch (error: any) {
        const message = error?.message || 'Unknown analysis error';
        console.error(`AI insights failed for ${adAccount.name}:`, message);
        failed.push({ account: adAccount.name, error: message });
      }
    }

    const durationMs = Date.now() - startedAt;

    if (insufficientData.length === adAccounts.length && adAccounts.length > 0) {
      console.warn(
        'AI insights cron produced nothing for every account. Expected while ' +
          'getHistoricalData() in lib/queue/jobs/anomaly-detection.ts is stubbed.'
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalAccounts: adAccounts.length,
        analyzed: analyzed.length,
        insufficientData: insufficientData.length,
        failed: failed.length,
        durationMs,
        results: analyzed,
        skippedForInsufficientData: insufficientData,
        errors: failed,
      },
    });
  } catch (error: any) {
    console.error('Cron generate-ai-insights error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'AI insights cron failed' },
      { status: 500 }
    );
  }
}
