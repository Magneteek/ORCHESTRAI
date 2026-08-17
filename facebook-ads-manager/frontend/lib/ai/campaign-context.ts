import { prisma } from '@/lib/db/prisma';
import { getCampaignTotals } from '@/lib/analytics/aggregate';
import type { CampaignContext } from '@/lib/ai/types';

/**
 * Describe the campaign an AI analysis is reasoning about.
 *
 * When no campaign is specified this must describe the campaign the historical
 * data actually came from. Selecting the newest campaign instead paired a
 * zero-spend test campaign's status and budget with a live campaign's 28 days
 * of delivery, and the model reasoned about the mismatch — telling the user to
 * reactivate a campaign that was already running and to raise a budget that
 * belonged to something else entirely.
 *
 * Lives in lib/ rather than inside the route so the analysis path can be
 * exercised without an HTTP session.
 */
export async function getCampaignContext(
  adAccountId: string,
  campaignId?: string
): Promise<CampaignContext> {
  let campaign = campaignId
    ? await prisma.campaign.findFirst({ where: { id: campaignId } })
    : null;

  if (!campaignId) {
    const candidates = await prisma.campaign.findMany({
      where: { adAccountId },
      select: { id: true },
    });
    const totals = await getCampaignTotals(candidates.map((c) => c.id));
    const ranked = [...totals.entries()].sort((a, b) => b[1].spend - a[1].spend);

    campaign = ranked.length
      ? await prisma.campaign.findFirst({ where: { id: ranked[0][0] } })
      : // Nothing has ever spent — fall back to the newest campaign so the
        // shape stays populated rather than returning invented defaults.
        await prisma.campaign.findFirst({
          where: { adAccountId },
          orderBy: { createdAt: 'desc' },
        });
  }

  if (!campaign) {
    return {
      objective: 'CONVERSIONS',
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
    };
  }

  return {
    objective: campaign.objective,
    dailyBudget: campaign.dailyBudget ?? undefined,
    lifetimeBudget: campaign.lifetimeBudget ?? undefined,
    status: campaign.status,
    startDate: campaign.startTime?.toISOString() || campaign.createdAt.toISOString(),
  };
}
