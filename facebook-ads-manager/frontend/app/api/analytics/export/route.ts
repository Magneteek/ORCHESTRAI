/**
 * Analytics Export API Route
 * Export analytics data as CSV or PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = searchParams.get('format') || 'csv';
    const accountIds = searchParams.get('accountIds')?.split(',');
    const campaignIds = searchParams.get('campaignIds')?.split(',');

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: { message: 'Date range required', code: 'INVALID_PARAMS' } },
        { status: 400 }
      );
    }

    // Fetch analytics data from main analytics endpoint
    const analyticsUrl = new URL('/api/analytics', request.url);
    analyticsUrl.searchParams.set('from', from);
    analyticsUrl.searchParams.set('to', to);
    if (accountIds) analyticsUrl.searchParams.set('accountIds', accountIds.join(','));
    if (campaignIds) analyticsUrl.searchParams.set('campaignIds', campaignIds.join(','));

    const analyticsResponse = await fetch(analyticsUrl.toString(), {
      headers: request.headers,
    });

    if (!analyticsResponse.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const analyticsResult = await analyticsResponse.json();
    if (!analyticsResult.success) {
      throw new Error(analyticsResult.error?.message || 'Failed to fetch analytics data');
    }

    const data = analyticsResult.data;

    // Generate export based on format
    if (format === 'csv') {
      const csv = generateCSV(data, from, to);
      const filename = `facebook-ads-analytics-${from}-to-${to}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else if (format === 'pdf') {
      // For PDF, we'll return a simple text-based report
      // In production, you'd use a library like pdfkit or puppeteer
      const pdf = generatePDFReport(data, from, to);
      const filename = `facebook-ads-analytics-${from}-to-${to}.pdf`;

      return new NextResponse(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: { message: 'Invalid format', code: 'INVALID_FORMAT' } },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Export failed',
          code: 'EXPORT_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV export
 */
function generateCSV(data: any, from: string, to: string): string {
  const lines: string[] = [];

  // Header
  lines.push('Facebook Ads Analytics Report');
  lines.push(`Period: ${from} to ${to}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  // Summary metrics
  lines.push('SUMMARY METRICS');
  lines.push('Metric,Value');
  lines.push(`Total Spend,$${data.metrics.spend.toFixed(2)}`);
  lines.push(`Total Impressions,${data.metrics.impressions.toLocaleString()}`);
  lines.push(`Total Clicks,${data.metrics.clicks.toLocaleString()}`);
  lines.push(`Total Conversions,${data.metrics.conversions.toLocaleString()}`);
  lines.push(`CTR,${(data.metrics.ctr * 100).toFixed(2)}%`);
  lines.push(`CPC,$${data.metrics.cpc.toFixed(2)}`);
  lines.push(`CPM,$${data.metrics.cpm.toFixed(2)}`);
  lines.push(`ROAS,${data.metrics.roas.toFixed(2)}x`);
  lines.push('');

  // Time series data
  lines.push('DAILY PERFORMANCE');
  lines.push('Date,Impressions,Clicks,Spend,Conversions,CTR,ROAS');
  data.timeSeries.forEach((point: any) => {
    lines.push(
      [
        point.date,
        point.impressions,
        point.clicks,
        point.spend.toFixed(2),
        point.conversions,
        (point.ctr * 100).toFixed(2) + '%',
        point.roas.toFixed(2) + 'x',
      ].join(',')
    );
  });
  lines.push('');

  // Top campaigns
  if (data.topCampaigns && data.topCampaigns.length > 0) {
    lines.push('TOP CAMPAIGNS');
    lines.push('Campaign Name,Impressions,Clicks,Spend,Conversions,CTR,ROAS');
    data.topCampaigns.forEach((campaign: any) => {
      lines.push(
        [
          `"${campaign.name}"`,
          campaign.impressions,
          campaign.clicks,
          campaign.spend.toFixed(2),
          campaign.conversions,
          (campaign.ctr * 100).toFixed(2) + '%',
          campaign.roas.toFixed(2) + 'x',
        ].join(',')
      );
    });
    lines.push('');
  }

  // Conversion funnel
  if (data.funnelData && data.funnelData.length > 0) {
    lines.push('CONVERSION FUNNEL');
    lines.push('Stage,Value,Percentage,Drop-off Rate');
    data.funnelData.forEach((stage: any) => {
      lines.push(
        [
          stage.name,
          stage.value,
          stage.percentage.toFixed(2) + '%',
          stage.dropoffRate ? stage.dropoffRate.toFixed(2) + '%' : 'N/A',
        ].join(',')
      );
    });
  }

  return lines.join('\n');
}

/**
 * Generate PDF report
 * Note: This is a placeholder. In production, use a proper PDF generation library
 */
function generatePDFReport(data: any, from: string, to: string): string {
  // This would generate an actual PDF in production
  // For now, return a simple text version
  return `
Facebook Ads Analytics Report
Period: ${from} to ${to}
Generated: ${new Date().toISOString()}

SUMMARY METRICS
Total Spend: $${data.metrics.spend.toFixed(2)}
Total Impressions: ${data.metrics.impressions.toLocaleString()}
Total Clicks: ${data.metrics.clicks.toLocaleString()}
Total Conversions: ${data.metrics.conversions.toLocaleString()}
CTR: ${(data.metrics.ctr * 100).toFixed(2)}%
CPC: $${data.metrics.cpc.toFixed(2)}
CPM: $${data.metrics.cpm.toFixed(2)}
ROAS: ${data.metrics.roas.toFixed(2)}x

TOP CAMPAIGNS
${data.topCampaigns
  ?.map(
    (c: any, i: number) =>
      `${i + 1}. ${c.name}
   Impressions: ${c.impressions.toLocaleString()}
   Clicks: ${c.clicks.toLocaleString()}
   Spend: $${c.spend.toFixed(2)}
   Conversions: ${c.conversions}
   CTR: ${(c.ctr * 100).toFixed(2)}%
   ROAS: ${c.roas.toFixed(2)}x`
  )
  .join('\n\n')}
`;
}
