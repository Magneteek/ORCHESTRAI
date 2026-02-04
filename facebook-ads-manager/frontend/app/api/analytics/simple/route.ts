import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { decrypt } from '@/lib/utils/encryption';

/**
 * GET /api/analytics/simple
 * Simplified analytics endpoint - fetches directly from Facebook
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = request.nextUrl;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const accountIds = searchParams.get('accountIds')?.split(',');

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: { message: 'Date range required', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    console.log('📊 Simple Analytics API called');
    console.log('   User:', user.id);
    console.log('   Date:', from, 'to', to);
    console.log('   Account IDs:', accountIds);

    // Get ad accounts
    const adAccounts = await prisma.adAccount.findMany({
      where: {
        facebookBusinessAccount: {
          organization: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
        ...(accountIds && { id: { in: accountIds } }),
      },
      include: {
        facebookBusinessAccount: true,
      },
      take: 1, // Just get first account for now
    });

    if (adAccounts.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'No ad accounts found', code: 'NO_AD_ACCOUNTS' } },
        { status: 404 }
      );
    }

    const account = adAccounts[0];
    console.log('✅ Using account:', account.name, account.accountId);

    // Decrypt token
    const accessToken = decrypt(account.facebookBusinessAccount.accessTokenEncrypted);

    // Fetch insights from Facebook
    const url = `https://graph.facebook.com/v22.0/${account.accountId}/insights?access_token=${accessToken}&time_range={"since":"${from}","until":"${to}"}&fields=impressions,clicks,spend,actions,cpm,cpc,ctr,reach,frequency`;

    console.log('📡 Fetching insights from Facebook...');
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.data || data.data.length === 0) {
      console.warn('⚠️  No insights data');
      return NextResponse.json({
        success: true,
        data: {
          metrics: {
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            cpm: 0,
            roas: 0,
          },
          timeSeries: [],
          topCampaigns: [],
          funnelData: [],
        },
      });
    }

    const insights = data.data[0];
    console.log('✅ Got insights from Facebook');

    // Extract conversions
    let conversions = 0;
    if (insights.actions) {
      conversions = insights.actions
        .filter((a: any) => ['lead', 'purchase', 'complete_registration'].includes(a.action_type))
        .reduce((sum: number, a: any) => sum + parseInt(a.value || '0'), 0);
    }

    const spend = parseFloat(insights.spend || '0');
    const impressions = parseInt(insights.impressions || '0');
    const clicks = parseInt(insights.clicks || '0');
    const ctr = parseFloat(insights.ctr || '0');
    const cpc = parseFloat(insights.cpc || '0');
    const cpm = parseFloat(insights.cpm || '0');

    const analyticsData = {
      metrics: {
        spend,
        impressions,
        clicks,
        conversions,
        ctr,
        cpc,
        cpm,
        roas: 0, // TODO: Calculate from purchase value
      },
      timeSeries: [],
      topCampaigns: [],
      funnelData: [
        { name: 'Impressions', value: impressions, percentage: 100 },
        { name: 'Clicks', value: clicks, percentage: (clicks / impressions) * 100 },
        { name: 'Conversions', value: conversions, percentage: (conversions / impressions) * 100 },
      ],
    };

    console.log('📊 Returning analytics:', analyticsData.metrics);

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error: any) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || 'Failed to fetch analytics',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
