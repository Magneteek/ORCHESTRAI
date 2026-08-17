import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

/**
 * Extra context for the AI analysis that a daily performance series cannot
 * express: where delivery happened, what the ads actually said, whether anyone
 * changed the account, and how much audience is left.
 *
 * Every fetch degrades to null rather than throwing. These enrich the analysis;
 * none of them should be able to fail a prediction, and a partial context is
 * better than none — the prompt states which sections are missing so the model
 * does not treat absence as evidence.
 */

const FB_API = 'https://graph.facebook.com/v22.0';

async function fbGet(
  path: string,
  token: string,
  params: Record<string, string> = {}
): Promise<any | null> {
  try {
    const url = new URL(`${FB_API}${path}`);
    url.searchParams.set('access_token', token);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url.toString());
    const json = await res.json();
    if (json.error) {
      console.warn(`[ai-context] ${path}: ${json.error.message}`);
      return null;
    }
    return json;
  } catch (error: any) {
    console.warn(`[ai-context] ${path}: ${error?.message || error}`);
    return null;
  }
}

function leadsFromActions(actions: any[] | undefined): number {
  if (!actions) return 0;
  const lead = actions.find((a) => a.action_type === 'lead');
  return lead ? parseInt(lead.value || '0', 10) : 0;
}

export interface PlacementPerformance {
  platform: string;
  position: string;
  spend: number;
  impressions: number;
  linkClicks: number;
  conversions: number;
  cpa: number;
}

/**
 * Spend and conversions split by publisher platform and position.
 *
 * This is where budget leaks without showing up anywhere else: on DRNL, Reels
 * absorbed 24% of spend for 9% of leads at more than triple the account's cost
 * per lead, and no account-level or per-ad view could reveal it.
 */
export async function getPlacementPerformance(
  accountId: string,
  token: string,
  since: string,
  until: string
): Promise<PlacementPerformance[] | null> {
  const res = await fbGet(`/${accountId}/insights`, token, {
    level: 'account',
    time_range: JSON.stringify({ since, until }),
    breakdowns: 'publisher_platform,platform_position',
    fields: 'impressions,inline_link_clicks,spend,actions',
    limit: '200',
  });
  if (!res) return null;

  return (res.data ?? [])
    .map((r: any) => {
      const spend = parseFloat(r.spend || '0');
      const conversions = leadsFromActions(r.actions);
      return {
        platform: r.publisher_platform ?? 'unknown',
        position: r.platform_position ?? 'unknown',
        spend,
        impressions: parseInt(r.impressions || '0', 10),
        linkClicks: parseInt(r.inline_link_clicks || '0', 10),
        conversions,
        cpa: conversions > 0 ? spend / conversions : 0,
      };
    })
    // Placements with negligible spend are noise in the prompt.
    .filter((p: PlacementPerformance) => p.spend >= 1)
    .sort((a: PlacementPerformance, b: PlacementPerformance) => b.spend - a.spend);
}

export interface CreativeCopy {
  adName: string;
  status: string;
  titles: string[];
  bodies: string[];
  descriptions: string[];
  callToAction: string | null;
  landingUrls: string[];
}

/**
 * The words each ad actually ran, read from the creative we already store.
 *
 * Dynamic and Advantage+ creatives keep their copy in `asset_feed_spec` as
 * arrays of variants, not in `object_story_spec.link_data` — reading only the
 * latter returns page ids and nothing legible. Without this the analysis can
 * see that one ad won but never why, and cannot notice that a live asset is
 * truncated or garbled.
 */
export async function getCreativeCopy(adAccountId: string): Promise<CreativeCopy[]> {
  const ads = await prisma.ad.findMany({
    where: { adSet: { campaign: { adAccountId } } },
    select: { name: true, status: true, creative: true },
  });

  const pick = (items: any): string[] => {
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];
    return arr
      .map((i) => (typeof i === 'string' ? i : i?.text ?? i?.name ?? i?.website_url ?? ''))
      .filter((t: string) => t && t.trim().length > 0);
  };

  return ads
    .map((ad) => {
      const creative: any = ad.creative ?? {};
      const afs = creative.asset_feed_spec ?? {};
      const story = creative.object_story_spec?.link_data ?? {};

      return {
        adName: ad.name,
        status: ad.status,
        titles: pick(afs.titles).length ? pick(afs.titles) : pick(creative.title || story.name),
        bodies: pick(afs.bodies).length ? pick(afs.bodies) : pick(creative.body || story.message),
        descriptions: pick(afs.descriptions),
        callToAction:
          (Array.isArray(afs.call_to_action_types) ? afs.call_to_action_types[0] : null) ??
          creative.call_to_action_type ??
          story.call_to_action?.type ??
          null,
        landingUrls: pick(afs.link_urls).length ? pick(afs.link_urls) : pick(story.link),
      };
    })
    .filter((c) => c.titles.length || c.bodies.length);
}

export interface AccountChange {
  date: string;
  eventType: string;
  objectType: string | null;
  objectName: string | null;
}

/**
 * Recent configuration changes on the account.
 *
 * Lets the analysis distinguish "someone edited the schedule" from "the auction
 * moved". An empty list is itself informative — it argues *against* a config
 * explanation for a delivery change — so the caller should say the log was read
 * and was empty rather than omitting the section.
 */
export async function getAccountChanges(
  accountId: string,
  token: string,
  since: string,
  until: string
): Promise<AccountChange[] | null> {
  const res = await fbGet(`/${accountId}/activities`, token, {
    time_range: JSON.stringify({ since, until }),
    fields: 'event_type,event_time,object_name,object_type',
    limit: '50',
  });
  if (!res) return null;

  return (res.data ?? [])
    .map((e: any) => ({
      date: (e.event_time ?? '').slice(0, 10),
      eventType: e.event_type ?? 'unknown',
      objectType: e.object_type ?? null,
      objectName: e.object_name ?? null,
    }))
    // Billing charges are not configuration changes and crowd out the signal.
    .filter((e: AccountChange) => !e.eventType.includes('billing'));
}

export interface AudienceEstimate {
  adSetName: string;
  lowerBound: number | null;
  upperBound: number | null;
  ready: boolean;
}

/**
 * Reachable audience size per active ad set.
 *
 * Frequency is only a proxy for saturation. Knowing the addressable pool tells
 * the analysis whether a budget increase has room to spend into or will simply
 * raise frequency against the same people.
 */
export async function getAudienceEstimates(
  adAccountId: string,
  token: string
): Promise<AudienceEstimate[] | null> {
  const adSets = await prisma.adSet.findMany({
    where: { campaign: { adAccountId }, status: 'ACTIVE' },
    select: { adSetId: true, name: true },
    take: 10,
  });
  if (adSets.length === 0) return [];

  const results = await Promise.all(
    adSets.map(async (s) => {
      const res = await fbGet(`/${s.adSetId}/delivery_estimate`, token, {
        fields: 'estimate_mau_lower_bound,estimate_mau_upper_bound,estimate_ready',
      });
      const d = res?.data?.[0];
      if (!d) return null;
      return {
        adSetName: s.name,
        lowerBound: d.estimate_mau_lower_bound ?? null,
        upperBound: d.estimate_mau_upper_bound ?? null,
        ready: Boolean(d.estimate_ready),
      };
    })
  );

  const found = results.filter((r): r is AudienceEstimate => r !== null);
  return found.length ? found : null;
}

export interface AccountContext {
  placements: PlacementPerformance[] | null;
  creatives: CreativeCopy[];
  changes: AccountChange[] | null;
  audiences: AudienceEstimate[] | null;
}

/**
 * Gather every enrichment for one account. Fetches run concurrently and each
 * degrades independently, so one unavailable endpoint costs one section rather
 * than the whole analysis.
 */
export async function getAccountContext(
  adAccountId: string,
  lookbackDays = 30
): Promise<AccountContext> {
  const account = await prisma.adAccount.findFirst({
    where: { id: adAccountId },
    include: { facebookBusinessAccount: true },
  });

  const creatives = await getCreativeCopy(adAccountId);

  if (!account?.facebookBusinessAccount?.accessTokenEncrypted) {
    return { placements: null, creatives, changes: null, audiences: null };
  }

  let token: string;
  try {
    token = decrypt(account.facebookBusinessAccount.accessTokenEncrypted);
  } catch {
    return { placements: null, creatives, changes: null, audiences: null };
  }

  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);
  const sinceStr = since.toISOString().split('T')[0];
  const untilStr = new Date().toISOString().split('T')[0];

  const [placements, changes, audiences] = await Promise.all([
    getPlacementPerformance(account.accountId, token, sinceStr, untilStr),
    getAccountChanges(account.accountId, token, sinceStr, untilStr),
    getAudienceEstimates(adAccountId, token),
  ]);

  return { placements, creatives, changes, audiences };
}

export interface SegmentStat {
  spend: number;
  linkClicks: number;
  conversions: number;
  cpa: number | null;
}

export interface DemographicPerformance {
  demographics: { age: Record<string, SegmentStat>; gender: Record<string, SegmentStat> };
  geographic: { country: Record<string, SegmentStat> };
  device: Record<string, SegmentStat>;
  placement: Record<string, SegmentStat>;
}

/** Fold Graph rows into { key -> spend/clicks/conversions/cpa }. */
function foldSegments(
  rows: any[],
  key: (row: any) => string | null
): Record<string, SegmentStat> {
  const out: Record<string, SegmentStat> = {};
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    const bucket = out[k] ?? { spend: 0, linkClicks: 0, conversions: 0, cpa: null };
    bucket.spend += parseFloat(r.spend || '0');
    bucket.linkClicks += parseInt(r.inline_link_clicks || '0', 10);
    bucket.conversions += leadsFromActions(r.actions);
    out[k] = bucket;
  }
  for (const bucket of Object.values(out)) {
    bucket.spend = Math.round(bucket.spend * 100) / 100;
    // null rather than 0 — "no conversions" is not "free conversions", and a
    // zero here would rank a dead segment as the best performer.
    bucket.cpa = bucket.conversions > 0 ? Math.round((bucket.spend / bucket.conversions) * 100) / 100 : null;
  }
  return out;
}

/**
 * Age, gender, country, device and placement performance.
 *
 * The audience analysis previously received a hardcoded shape of zeros —
 * `performance_metrics` has no demographic dimension, so there was nothing to
 * read — and produced confident-sounding output from an empty input. Meta
 * exposes all of it through `breakdowns`, one request per dimension because
 * they cannot all be combined.
 */
export async function getDemographicPerformance(
  accountId: string,
  token: string,
  since: string,
  until: string
): Promise<DemographicPerformance | null> {
  const time_range = JSON.stringify({ since, until });
  const fields = 'impressions,inline_link_clicks,spend,actions';

  const [ageGender, country, device, placement] = await Promise.all([
    fbGet(`/${accountId}/insights`, token, { level: 'account', time_range, breakdowns: 'age,gender', fields, limit: '100' }),
    fbGet(`/${accountId}/insights`, token, { level: 'account', time_range, breakdowns: 'country', fields, limit: '100' }),
    fbGet(`/${accountId}/insights`, token, { level: 'account', time_range, breakdowns: 'impression_device', fields, limit: '100' }),
    fbGet(`/${accountId}/insights`, token, { level: 'account', time_range, breakdowns: 'publisher_platform,platform_position', fields, limit: '100' }),
  ]);

  if (!ageGender && !country && !device && !placement) return null;

  return {
    demographics: {
      age: foldSegments(ageGender?.data ?? [], (r) => r.age ?? null),
      gender: foldSegments(ageGender?.data ?? [], (r) => r.gender ?? null),
    },
    geographic: { country: foldSegments(country?.data ?? [], (r) => r.country ?? null) },
    device: foldSegments(device?.data ?? [], (r) => r.impression_device ?? null),
    placement: foldSegments(placement?.data ?? [], (r) =>
      r.publisher_platform ? `${r.publisher_platform}/${r.platform_position ?? 'unknown'}` : null
    ),
  };
}
