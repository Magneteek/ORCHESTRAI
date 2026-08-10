/**
 * POST /api/sync/all
 * Full cascade sync using direct Graph API calls (no SDK, avoids global state issues)
 * Order: campaigns → ad sets → ads
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

const FB_API = 'https://graph.facebook.com/v22.0';

async function fbGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${FB_API}${path}`);
  url.searchParams.set('access_token', token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Facebook API error ${res.status}`);
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { adAccountId } = await request.json();

    if (!adAccountId) {
      return NextResponse.json({ success: false, error: 'adAccountId is required' }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Ad account not found' }, { status: 404 });
    }

    const token = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const fbAccountId = adAccount.accountId; // e.g. act_464009406641423
    const results = { campaigns: 0, adSets: 0, ads: 0 };

    // ── 1. Sync Campaigns ──────────────────────────────────────────────────
    const campaignFields = 'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time';
    let campaignsData: any[] = [];
    let nextUrl: string | null = null;

    do {
      const res: any = nextUrl
        ? await (await fetch(nextUrl)).json()
        : await fbGet(`/${fbAccountId}/campaigns`, token, {
            fields: campaignFields,
            limit: '100',
          });

      if (res.error) throw new Error(res.error.message);
      campaignsData = campaignsData.concat(res.data || []);
      nextUrl = res.paging?.next || null;
    } while (nextUrl);

    await Promise.all(
      campaignsData.map((c) =>
        prisma.campaign.upsert({
          where: { adAccountId_campaignId: { adAccountId: adAccount.id, campaignId: c.id } },
          update: {
            name: c.name,
            objective: c.objective || 'UNKNOWN',
            status: c.status,
            dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
            startTime: c.start_time ? new Date(c.start_time) : null,
            stopTime: c.stop_time ? new Date(c.stop_time) : null,
          },
          create: {
            adAccountId: adAccount.id,
            campaignId: c.id,
            name: c.name,
            objective: c.objective || 'UNKNOWN',
            status: c.status,
            dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
            startTime: c.start_time ? new Date(c.start_time) : null,
            stopTime: c.stop_time ? new Date(c.stop_time) : null,
          },
        })
      )
    );
    results.campaigns = campaignsData.length;
    console.log(`✅ Synced ${results.campaigns} campaigns`);

    // ── 2. Sync Ad Sets ────────────────────────────────────────────────────
    const dbCampaigns = await prisma.campaign.findMany({
      where: { adAccountId: adAccount.id },
      select: { id: true, campaignId: true },
    });
    const campaignMap = new Map(dbCampaigns.map((c) => [c.campaignId, c.id]));

    const adSetFields = 'id,name,status,campaign_id,daily_budget,lifetime_budget,bid_strategy,billing_event,optimization_goal,targeting,start_time,end_time';
    let allAdSets: any[] = [];

    const adSetsRes = await fbGet(`/${fbAccountId}/adsets`, token, {
      fields: adSetFields,
      limit: '200',
    });
    allAdSets = adSetsRes.data || [];

    await Promise.all(
      allAdSets
        .filter((s) => campaignMap.has(s.campaign_id))
        .map((s) => {
          const dbCampaignId = campaignMap.get(s.campaign_id)!;
          return prisma.adSet.upsert({
            where: { campaignId_adSetId: { campaignId: dbCampaignId, adSetId: s.id } },
            update: {
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
            },
            create: {
              campaignId: dbCampaignId,
              adSetId: s.id,
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
            },
          });
        })
    );
    results.adSets = allAdSets.length;
    console.log(`✅ Synced ${results.adSets} ad sets`);

    // ── 3. Sync Ads ────────────────────────────────────────────────────────
    const dbAdSets = await prisma.adSet.findMany({
      where: { campaign: { adAccountId: adAccount.id } },
      select: { id: true, adSetId: true },
    });
    const adSetMap = new Map(dbAdSets.map((s) => [s.adSetId, s.id]));

    const adFields = 'id,name,status,adset_id,creative{id,name,thumbnail_url,object_story_spec}';
    const adsRes = await fbGet(`/${fbAccountId}/ads`, token, {
      fields: adFields,
      limit: '200',
    });
    const allAds = adsRes.data || [];

    await Promise.all(
      allAds
        .filter((a: any) => adSetMap.has(a.adset_id))
        .map((a: any) => {
          const dbAdSetId = adSetMap.get(a.adset_id)!;
          return prisma.ad.upsert({
            where: { adSetId_adId: { adSetId: dbAdSetId, adId: a.id } },
            update: {
              name: a.name,
              status: a.status,
              creative: a.creative || {},
            },
            create: {
              adSetId: dbAdSetId,
              adId: a.id,
              name: a.name,
              status: a.status,
              creative: a.creative || {},
            },
          });
        })
    );
    results.ads = allAds.length;
    console.log(`✅ Synced ${results.ads} ads`);

    // Update last sync timestamp
    await prisma.adAccount.update({
      where: { id: adAccount.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: results,
      message: `Synced ${results.campaigns} campaigns, ${results.adSets} ad sets, ${results.ads} ads`,
    });
  } catch (error: any) {
    console.error('Sync all error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
