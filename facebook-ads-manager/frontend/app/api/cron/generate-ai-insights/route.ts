/**
 * GET /api/cron/generate-ai-insights
 * Declared in vercel.json: "0 2 * * *" (daily, 02:00).
 *
 * Runs anomaly detection per ad account and records the outcome.
 *
 * This works as of 2026-08-17 — the helper it depends on now reads
 * `performance_metrics`, and a run against a live account produces stored
 * anomalies. An earlier note here described it as a no-op blocked on a stubbed
 * getHistoricalData(); that is no longer true.
 *
 * Note this is the only thing that populates the Anomaly Detection tab on a
 * schedule. The tab reads stored results from the last 24 hours, so on an
 * environment where this cron never fires — a local dev machine, or anywhere
 * not deployed — the tab stays empty until someone triggers it from the UI.
 * Empty there means "never run", not "nothing found".
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
