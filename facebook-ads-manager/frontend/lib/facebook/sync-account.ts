/**
 * Full cascade sync for one ad account, using direct Graph API calls
 * (no SDK, avoids global state issues).
 *
 * Order: campaigns -> ad sets -> ads -> daily ad-level insights.
 *
 * Shared by POST /api/sync/all (user-triggered, one account) and
 * GET /api/cron/sync-facebook-data (scheduled, every account). Callers are
 * responsible for authorization; this function assumes the account has
 * already been resolved and permitted.
 */
import type { AdAccount, FacebookBusinessAccount } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

const FB_API = 'https://graph.facebook.com/v22.0';

// How far back the insights sync reaches. Daily rows upsert on [adId, date],
// so re-syncing refreshes recent days without duplicating older ones.
const INSIGHTS_LOOKBACK_DAYS = 90;

// Bounds concurrent Prisma writes so a large account cannot exhaust the pool.
const WRITE_CHUNK = 25;

// The campaigns/adsets/ads edges exclude archived entities by default, but their
// insights persist forever. Syncing only the default set therefore drops the
// spend of every archived ad: on the DRNL account that was 15 daily rows and
// EUR 330.73, silently missing from reported totals. Ask for every status
// explicitly so historical spend stays attributable.
const ALL_EFFECTIVE_STATUSES = [
  'ACTIVE',
  'PAUSED',
  'DELETED',
  'PENDING_REVIEW',
  'DISAPPROVED',
  'PREAPPROVED',
  'PENDING_BILLING_INFO',
  'CAMPAIGN_PAUSED',
  'ARCHIVED',
  'ADSET_PAUSED',
  'IN_PROCESS',
  'WITH_ISSUES',
];

/** Graph API `filtering` clause selecting every effective_status for one level. */
function allStatusesFilter(level: 'campaign' | 'adset' | 'ad'): string {
  return JSON.stringify([
    { field: `${level}.effective_status`, operator: 'IN', value: ALL_EFFECTIVE_STATUSES },
  ]);
}

export type AdAccountWithBusiness = AdAccount & {
  facebookBusinessAccount: FacebookBusinessAccount;
};

export interface SyncResult {
  campaigns: number;
  adSets: number;
  ads: number;
  metrics: number;
}

async function fbGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${FB_API}${path}`);
  url.searchParams.set('access_token', token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Facebook API error ${res.status}`);
  return data;
}

/** Fetch every page of a Graph API edge, following paging.next to completion. */
async function fbGetAllPages(
  path: string,
  token: string,
  params: Record<string, string>
): Promise<any[]> {
  let all: any[] = [];
  let nextUrl: string | null = null;

  do {
    const res: any = nextUrl
      ? await (await fetch(nextUrl)).json()
      : await fbGet(path, token, params);

    if (res.error) throw new Error(res.error.message);
    all = all.concat(res.data || []);
    nextUrl = res.paging?.next || null;
  } while (nextUrl);

  return all;
}

/**
 * Run `tasks` in bounded batches. Takes thunks rather than promises: an array
 * of already-created promises has begun executing before any chunking happens,
 * which bounds nothing.
 */
async function runChunked<T>(tasks: Array<() => Promise<T>>, size = WRITE_CHUNK): Promise<void> {
  for (let i = 0; i < tasks.length; i += size) {
    await Promise.all(tasks.slice(i, i + size).map((fn) => fn()));
  }
}

/** Sum only canonical conversion action types (sub-breakdowns double-count). */
const CONVERSION_ACTION_TYPES = ['lead', 'purchase', 'complete_registration'];

function getConversions(actions: any[] | undefined): number {
  if (!actions) return 0;
  return actions
    .filter((a) => CONVERSION_ACTION_TYPES.includes(a.action_type))
    .reduce((sum, a) => sum + parseInt(a.value || '0', 10), 0);
}

function getPurchaseValue(actionValues: any[] | undefined): number {
  if (!actionValues) return 0;
  const purchase = actionValues.find((av) => av.action_type === 'purchase');
  return purchase ? parseFloat(purchase.value || '0') : 0;
}

export async function syncAdAccount(adAccount: AdAccountWithBusiness): Promise<SyncResult> {
  const token = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
  const fbAccountId = adAccount.accountId; // e.g. act_464009406641423
  const results: SyncResult = { campaigns: 0, adSets: 0, ads: 0, metrics: 0 };

  // ── 1. Campaigns ────────────────────────────────────────────────────────
  const campaignFields =
    'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time';
  const campaignsData = await fbGetAllPages(`/${fbAccountId}/campaigns`, token, {
    fields: campaignFields,
    limit: '100',
    filtering: allStatusesFilter('campaign'),
  });

  await runChunked(
    campaignsData.map((c) => () => {
      const fields = {
        name: c.name,
        objective: c.objective || 'UNKNOWN',
        status: c.status,
        dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
        lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
        startTime: c.start_time ? new Date(c.start_time) : null,
        stopTime: c.stop_time ? new Date(c.stop_time) : null,
      };
      return prisma.campaign.upsert({
        where: { adAccountId_campaignId: { adAccountId: adAccount.id, campaignId: c.id } },
        update: fields,
        create: { adAccountId: adAccount.id, campaignId: c.id, ...fields },
      });
    })
  );
  results.campaigns = campaignsData.length;

  // ── 2. Ad Sets ──────────────────────────────────────────────────────────
  const dbCampaigns = await prisma.campaign.findMany({
    where: { adAccountId: adAccount.id },
    select: { id: true, campaignId: true },
  });
  const campaignMap = new Map(dbCampaigns.map((c) => [c.campaignId, c.id]));

  const adSetFields =
    'id,name,status,campaign_id,daily_budget,lifetime_budget,bid_strategy,billing_event,optimization_goal,targeting,start_time,end_time';
  const allAdSets = await fbGetAllPages(`/${fbAccountId}/adsets`, token, {
    fields: adSetFields,
    limit: '200',
    filtering: allStatusesFilter('adset'),
  });

  await runChunked(
    allAdSets
      .filter((s) => campaignMap.has(s.campaign_id))
      .map((s) => () => {
        const dbCampaignId = campaignMap.get(s.campaign_id)!;
        const fields = {
          name: s.name,
          status: s.status,
          targeting: s.targeting || {},
          budget: s.daily_budget
            ? parseFloat(s.daily_budget) / 100
            : s.lifetime_budget
            ? parseFloat(s.lifetime_budget) / 100
            : null,
          bidStrategy: s.bid_strategy || null,
          billingEvent: s.billing_event || null,
          optimizationGoal: s.optimization_goal || null,
          startTime: s.start_time ? new Date(s.start_time) : null,
          endTime: s.end_time ? new Date(s.end_time) : null,
        };
        return prisma.adSet.upsert({
          where: { campaignId_adSetId: { campaignId: dbCampaignId, adSetId: s.id } },
          update: fields,
          create: { campaignId: dbCampaignId, adSetId: s.id, ...fields },
        });
      })
  );
  results.adSets = allAdSets.length;

  // ── 3. Ads ──────────────────────────────────────────────────────────────
  const dbAdSets = await prisma.adSet.findMany({
    where: { campaign: { adAccountId: adAccount.id } },
    select: { id: true, adSetId: true },
  });
  const adSetMap = new Map(dbAdSets.map((s) => [s.adSetId, s.id]));

  const adFields = 'id,name,status,adset_id,creative{id,name,thumbnail_url,object_story_spec}';
  const allAds = await fbGetAllPages(`/${fbAccountId}/ads`, token, {
    fields: adFields,
    limit: '200',
    filtering: allStatusesFilter('ad'),
  });

  await runChunked(
    allAds
      .filter((a: any) => adSetMap.has(a.adset_id))
      .map((a: any) => () => {
        const dbAdSetId = adSetMap.get(a.adset_id)!;
        const fields = { name: a.name, status: a.status, creative: a.creative || {} };
        return prisma.ad.upsert({
          where: { adSetId_adId: { adSetId: dbAdSetId, adId: a.id } },
          update: fields,
          create: { adSetId: dbAdSetId, adId: a.id, ...fields },
        });
      })
  );
  results.ads = allAds.length;

  // ── 4. Daily ad-level insights -> performance_metrics ───────────────────
  // One account-level call at level=ad with time_increment=1 gives one row
  // per ad per day, matching the @@unique([adId, date]) constraint.
  const dbAds = await prisma.ad.findMany({
    where: { adSet: { campaign: { adAccountId: adAccount.id } } },
    select: { id: true, adId: true },
  });
  const adMap = new Map(dbAds.map((a) => [a.adId, a.id]));

  const since = new Date();
  since.setDate(since.getDate() - INSIGHTS_LOOKBACK_DAYS);
  const sinceStr = since.toISOString().split('T')[0];
  const untilStr = new Date().toISOString().split('T')[0];

  const insightFields =
    'ad_id,date_start,impressions,clicks,inline_link_clicks,spend,ctr,cpc,cpm,reach,frequency,actions,action_values';
  const insightRows = await fbGetAllPages(`/${fbAccountId}/insights`, token, {
    level: 'ad',
    time_increment: '1',
    time_range: JSON.stringify({ since: sinceStr, until: untilStr }),
    fields: insightFields,
    limit: '500',
  });

  // An insight row for an ad we never stored is dropped spend. That used to
  // happen silently for archived ads; the status filter above should now keep
  // adMap complete, so anything still dropping here is a real gap worth seeing
  // rather than a rounding error in someone's monthly report.
  const orphanRows = insightRows.filter((row: any) => !adMap.has(row.ad_id));
  if (orphanRows.length > 0) {
    const orphanSpend = orphanRows.reduce(
      (sum: number, row: any) => sum + parseFloat(row.spend || '0'),
      0
    );
    const orphanAdIds = [...new Set(orphanRows.map((row: any) => row.ad_id))];
    console.warn(
      `[sync ${adAccount.name}] dropping ${orphanRows.length} insight rows ` +
        `(spend ${orphanSpend.toFixed(2)}) for ${orphanAdIds.length} unknown ad(s): ` +
        orphanAdIds.join(', ')
    );
  }

  const metricTasks = insightRows
    .filter((row: any) => adMap.has(row.ad_id))
    .map((row: any) => () => {
      const dbAdId = adMap.get(row.ad_id)!;
      const date = new Date(row.date_start);
      const spend = parseFloat(row.spend || '0');
      const impressions = parseInt(row.impressions || '0', 10);
      const clicks = parseInt(row.clicks || '0', 10);
      // Clicks that followed the link, as opposed to `clicks`, which also counts
      // reactions, comments, saves and post expands.
      const linkClicks =
        row.inline_link_clicks !== undefined
          ? parseInt(row.inline_link_clicks || '0', 10)
          : null;
      const conversions = getConversions(row.actions);
      const purchaseValue = getPurchaseValue(row.action_values);

      const metricData = {
        spend,
        impressions,
        clicks,
        linkClicks,
        conversions,
        purchaseValue,
        // Facebook reports ctr as a percentage; stored as reported.
        ctr: row.ctr ? parseFloat(row.ctr) : null,
        cpc: row.cpc ? parseFloat(row.cpc) : null,
        cpm: row.cpm ? parseFloat(row.cpm) : null,
        roas: spend > 0 ? purchaseValue / spend : null,
        cpa: conversions > 0 ? spend / conversions : null,
        reach: row.reach ? parseInt(row.reach, 10) : null,
        frequency: row.frequency ? parseFloat(row.frequency) : null,
      };

      return prisma.performanceMetric.upsert({
        where: { adId_date: { adId: dbAdId, date } },
        update: metricData,
        create: { adId: dbAdId, date, ...metricData },
      });
    });

  await runChunked(metricTasks);
  results.metrics = metricTasks.length;

  await prisma.adAccount.update({
    where: { id: adAccount.id },
    data: { lastSyncAt: new Date() },
  });

  return results;
}
