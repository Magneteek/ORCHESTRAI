/**
 * GET /api/cron/cleanup-old-data
 * Declared in vercel.json: "0 3 * * 0" (weekly, Sunday 03:00).
 *
 * Deletes data, so it is deliberately conservative:
 *
 *  - performance_metrics are NEVER pruned unless CLEANUP_METRICS_RETENTION_DAYS
 *    is explicitly set. They are the foundation every dashboard, report and
 *    future AI insight reads from, and the whole point of the sync cron is to
 *    accumulate them. Silently expiring them by default would undo that.
 *  - Only clearly disposable rows go by default: expired auth sessions and
 *    verification tokens, already-resolved anomalies, and AI analyses whose
 *    own validUntil has passed.
 *  - `?dryRun=1` reports what would be deleted without deleting it.
 *
 * Retention windows (days), all overridable by env:
 *   CLEANUP_ANOMALY_RETENTION_DAYS      default 90   (resolved anomalies only)
 *   CLEANUP_AI_ANALYSIS_RETENTION_DAYS  default 90   (expired analyses only)
 *   CLEANUP_METRICS_RETENTION_DAYS      default off  (performance metrics)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkCronAuth } from '@/lib/cron/auth';

export const dynamic = 'force-dynamic';

function retentionDays(envVar: string, fallback: number | null): number | null {
  const raw = process.env[envVar];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(`${envVar}="${raw}" is not a positive number; ignoring`);
    return fallback;
  }
  return parsed;
}

function cutoff(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function GET(request: NextRequest) {
  const auth = checkCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
  const now = new Date();

  const anomalyDays = retentionDays('CLEANUP_ANOMALY_RETENTION_DAYS', 90);
  const aiAnalysisDays = retentionDays('CLEANUP_AI_ANALYSIS_RETENTION_DAYS', 90);
  const metricsDays = retentionDays('CLEANUP_METRICS_RETENTION_DAYS', null);

  try {
    const targets = [
      {
        name: 'expiredSessions',
        count: () => prisma.session.count({ where: { expires: { lt: now } } }),
        remove: () => prisma.session.deleteMany({ where: { expires: { lt: now } } }),
      },
      {
        name: 'expiredVerificationTokens',
        count: () => prisma.verificationToken.count({ where: { expires: { lt: now } } }),
        remove: () =>
          prisma.verificationToken.deleteMany({ where: { expires: { lt: now } } }),
      },
      ...(anomalyDays
        ? [
            {
              name: 'resolvedAnomalies',
              count: () =>
                prisma.anomalyDetection.count({
                  where: { isResolved: true, detectedAt: { lt: cutoff(anomalyDays) } },
                }),
              remove: () =>
                prisma.anomalyDetection.deleteMany({
                  where: { isResolved: true, detectedAt: { lt: cutoff(anomalyDays) } },
                }),
            },
          ]
        : []),
      ...(aiAnalysisDays
        ? [
            {
              name: 'expiredAiAnalyses',
              count: () =>
                prisma.aiAnalysis.count({
                  where: {
                    validUntil: { not: null, lt: now },
                    analyzedAt: { lt: cutoff(aiAnalysisDays) },
                  },
                }),
              remove: () =>
                prisma.aiAnalysis.deleteMany({
                  where: {
                    validUntil: { not: null, lt: now },
                    analyzedAt: { lt: cutoff(aiAnalysisDays) },
                  },
                }),
            },
          ]
        : []),
      ...(metricsDays
        ? [
            {
              name: 'oldPerformanceMetrics',
              count: () =>
                prisma.performanceMetric.count({
                  where: { date: { lt: cutoff(metricsDays) } },
                }),
              remove: () =>
                prisma.performanceMetric.deleteMany({
                  where: { date: { lt: cutoff(metricsDays) } },
                }),
            },
          ]
        : []),
    ];

    const deleted: Record<string, number> = {};

    for (const target of targets) {
      if (dryRun) {
        deleted[target.name] = await target.count();
      } else {
        const result = await target.remove();
        deleted[target.name] = result.count;
      }
    }

    const total = Object.values(deleted).reduce((sum, n) => sum + n, 0);
    console.log(
      `Cleanup ${dryRun ? '(dry run) would remove' : 'removed'} ${total} rows:`,
      deleted
    );

    return NextResponse.json({
      success: true,
      data: {
        dryRun,
        totalRows: total,
        deleted,
        retention: {
          anomalyDays,
          aiAnalysisDays,
          metricsDays: metricsDays ?? 'disabled (performance metrics are never pruned)',
        },
      },
    });
  } catch (error: any) {
    console.error('Cron cleanup-old-data error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Cleanup cron failed' },
      { status: 500 }
    );
  }
}
