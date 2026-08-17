import { prisma } from '@/lib/db/prisma';
import { runImmediateAnomalyDetection } from '@/lib/queue/jobs/anomaly-detection';

/**
 * Exercise the three tabs the way their routes do, to find out whether each is
 * broken, data-starved, or simply never triggered.
 */
async function main() {
  const acc = await prisma.adAccount.findFirstOrThrow({
    where: { name: { contains: 'DELETEREVIEWS' } },
    select: { id: true, name: true },
  });
  console.log(`account: ${acc.name}\n`);

  // ---- What is stored for each analysis type ----
  const stored = await prisma.aiAnalysis.groupBy({
    by: ['analysisType'],
    _count: { _all: true },
    _max: { analyzedAt: true },
  });
  console.log('=== ai_analysis rows by type ===');
  if (stored.length === 0) console.log('  (none)');
  for (const s of stored) {
    console.log(`  ${s.analysisType.padEnd(26)} ${s._count._all} row(s), latest ${s._max.analyzedAt?.toISOString() ?? '-'}`);
  }

  // ---- 1. ANOMALY DETECTION ----
  console.log('\n=== 1. ANOMALY DETECTION (runImmediateAnomalyDetection) ===');
  try {
    const res: any = await runImmediateAnomalyDetection(acc.id);
    console.log('  result:', JSON.stringify(res).slice(0, 400));
  } catch (e: any) {
    console.log('  THREW:', e?.message?.slice(0, 300));
  }

  // ---- 2. AUDIENCE INSIGHTS ----
  console.log('\n=== 2. AUDIENCE INSIGHTS (what the route feeds it) ===');
  const { getDailyPerformance } = await import('@/lib/analytics/aggregate');
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const daily = await getDailyPerformance({ adAccountId: acc.id, since });
  console.log(`  historical days available: ${daily.length}`);
  console.log('  NOTE: getAudienceData() returns a zeroed demographic shape by design —');
  console.log('        performance_metrics has no demographic dimension.');

  // ---- 3. COPY OPTIMIZATION ----
  console.log('\n=== 3. COPY OPTIMIZATION (does it have ad copy to work on?) ===');
  const ads = await prisma.ad.findMany({
    where: { adSet: { campaign: { adAccountId: acc.id } } },
    select: { name: true, status: true, creative: true },
  });
  for (const a of ads.slice(0, 4)) {
    const c: any = a.creative ?? {};
    const titles = c.asset_feed_spec?.titles?.length ?? 0;
    const bodies = c.asset_feed_spec?.bodies?.length ?? 0;
    console.log(`  ${a.name.padEnd(24)} [${a.status}] titles=${titles} bodies=${bodies}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
