import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

/**
 * POST /api/sync/campaigns
 * Fetch campaigns from Facebook Graph API and upsert into database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { adAccountId } = await request.json();

    if (!adAccountId) {
      return NextResponse.json(
        { success: false, error: { message: 'adAccountId is required', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    const adAccount = await prisma.adAccount.findFirst({
      where: {
        id: adAccountId,
        facebookBusinessAccount: {
          organization: {
            users: { some: { id: user.id } },
          },
        },
      },
      include: { facebookBusinessAccount: true },
    });

    if (!adAccount) {
      return NextResponse.json(
        { success: false, error: { message: 'Ad account not found or access denied', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const accessToken = decrypt(adAccount.facebookBusinessAccount.accessTokenEncrypted);
    const apiVersion = process.env.FACEBOOK_API_VERSION || 'v22.0';
    const fbAccountId = adAccount.accountId.replace(/^act_/, '');

    const fields = [
      'id', 'name', 'status', 'objective',
      'daily_budget', 'lifetime_budget',
      'start_time', 'stop_time',
      'bid_strategy', 'special_ad_categories',
    ].join(',');

    // Fetch all campaigns with pagination
    const campaigns: any[] = [];
    let url: string | null =
      `https://graph.facebook.com/${apiVersion}/act_${fbAccountId}/campaigns` +
      `?fields=${fields}&limit=100&access_token=${accessToken}`;

    while (url) {
      const res = await fetch(url);
      const json = await res.json();

      if (json.error) {
        return NextResponse.json(
          { success: false, error: { message: json.error.message, code: 'FACEBOOK_API_ERROR' } },
          { status: 502 }
        );
      }

      campaigns.push(...(json.data || []));
      url = json.paging?.next || null;
    }

    // Upsert each campaign into the database
    await Promise.all(
      campaigns.map((c: any) =>
        prisma.campaign.upsert({
          where: {
            adAccountId_campaignId: {
              adAccountId: adAccount.id,
              campaignId: c.id,
            },
          },
          update: {
            name: c.name,
            status: c.status,
            objective: c.objective,
            dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
            bidStrategy: c.bid_strategy || null,
            startTime: c.start_time ? new Date(c.start_time) : null,
            stopTime: c.stop_time ? new Date(c.stop_time) : null,
          },
          create: {
            adAccountId: adAccount.id,
            campaignId: c.id,
            name: c.name,
            status: c.status,
            objective: c.objective,
            dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
            lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
            bidStrategy: c.bid_strategy || null,
            startTime: c.start_time ? new Date(c.start_time) : null,
            stopTime: c.stop_time ? new Date(c.stop_time) : null,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: { synced: campaigns.length, campaigns },
      message: `Successfully synced ${campaigns.length} campaigns`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
