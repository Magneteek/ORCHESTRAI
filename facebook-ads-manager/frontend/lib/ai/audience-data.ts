/**
 * Audience data assembly for the Audience Insights analysis.
 *
 * These live here rather than inside the route so a test can exercise the code
 * the route actually runs. Rebuilt in a verification script, they would only
 * confirm that the script agrees with itself.
 */

import { prisma } from '@/lib/db/prisma';
import { getDemographicPerformance } from '@/lib/ai/account-context';
import { decrypt } from '@/lib/utils/encryption';
import { subDays } from 'date-fns';

/**
 * Helper: Get audience data
 */
export async function getAudienceData(adAccountId: string, campaignId?: string): Promise<any> {
  // Real age, gender, country, device and placement performance from Meta's
  // breakdowns. This previously returned a hardcoded shape of zeros, because
  // performance_metrics carries no demographic dimension — so the analysis was
  // producing confident-sounding audience findings from an empty input.
  const empty = {
    demographics: { age: {}, gender: {} },
    geographic: { country: {}, region: {} },
    device: {},
    placement: {},
  };

  const account = await prisma.adAccount.findFirst({
    where: { id: adAccountId },
    include: { facebookBusinessAccount: true },
  });
  if (!account?.facebookBusinessAccount?.accessTokenEncrypted) return empty;

  let token: string;
  try {
    token = decrypt(account.facebookBusinessAccount.accessTokenEncrypted);
  } catch {
    return empty;
  }

  const since = subDays(new Date(), 30);
  const data = await getDemographicPerformance(
    account.accountId,
    token,
    since.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  );

  // Falling back to the empty shape keeps the prompt's keys stable; the values
  // being empty is itself the signal that nothing was retrievable.
  return data ?? empty;
}


/**
 * Helper: Get performance by segment
 */
export async function getPerformanceBySegment(
  adAccountId: string,
  campaignId?: string
): Promise<Record<string, any>> {
  // Campaign is the only segmentation performance_metrics can express. Real
  // audience segments (age, gender, placement) need Facebook's breakdown
  // parameter, which the sync does not request — see getAudienceData.
  const metrics = await prisma.performanceMetric.groupBy({
    by: ['adId'],
    where: {
      date: { gte: subDays(new Date(), 30) },
      ad: {
        adSet: {
          campaign: { adAccountId, ...(campaignId && { id: campaignId }) },
        },
      },
    },
    _sum: {
      spend: true,
      clicks: true,
      impressions: true,
      conversions: true,
      purchaseValue: true,
    },
  });

  if (metrics.length === 0) return {};

  // Map each ad back to its campaign so the totals can be keyed by campaign.
  const ads = await prisma.ad.findMany({
    where: { id: { in: metrics.map((m) => m.adId) } },
    select: { id: true, adSet: { select: { campaign: { select: { name: true } } } } },
  });
  const campaignByAd = new Map(ads.map((a) => [a.id, a.adSet.campaign.name]));

  const totals = new Map<
    string,
    { spend: number; revenue: number; conversions: number; clicks: number; impressions: number }
  >();

  for (const row of metrics) {
    const key = campaignByAd.get(row.adId) ?? 'unknown-campaign';
    const acc =
      totals.get(key) ??
      { spend: 0, revenue: 0, conversions: 0, clicks: 0, impressions: 0 };

    acc.spend += row._sum.spend ?? 0;
    acc.revenue += row._sum.purchaseValue ?? 0;
    acc.conversions += Number(row._sum.conversions ?? 0);
    acc.clicks += Number(row._sum.clicks ?? 0);
    acc.impressions += Number(row._sum.impressions ?? 0);
    totals.set(key, acc);
  }

  return Object.fromEntries(
    Array.from(totals.entries()).map(([name, t]) => [
      name,
      {
        spend: t.spend,
        conversions: t.conversions,
        // Ratios from summed totals, never an average of per-ad ratios.
        roas: t.spend > 0 ? t.revenue / t.spend : 0,
        ctr: t.impressions > 0 ? t.clicks / t.impressions : 0,
        cpa: t.conversions > 0 ? t.spend / t.conversions : 0,
      },
    ])
  );
}
