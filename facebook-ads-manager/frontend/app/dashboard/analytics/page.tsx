'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, TrendingUp, Download, RefreshCw, DollarSign, Users, MousePointer, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceChart } from '@/components/analytics/performance-chart';
import { MetricCard } from '@/components/analytics/metric-card';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import { ComparisonMode } from '@/components/analytics/comparison-mode';
import { ExportReport } from '@/components/analytics/export-report';
import { apiClient } from '@/lib/helpers/api-client';
import type { AnalyticsData, DateRange } from '@/types/analytics';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDateRange, setComparisonDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    to: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  });

  // Fetch analytics data
  const { data, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      return apiClient.get<AnalyticsData>(`/api/analytics?${params}`);
    },
  });

  // Fetch comparison data
  const { data: comparisonData } = useQuery<AnalyticsData>({
    queryKey: ['analytics-comparison', comparisonDateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: comparisonDateRange.from.toISOString(),
        to: comparisonDateRange.to.toISOString(),
      });
      return apiClient.get<AnalyticsData>(`/api/analytics?${params}`);
    },
    enabled: comparisonMode,
  });

  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const metrics = data?.metrics || {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    roas: 0,
  };

  const previousMetrics = comparisonData?.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your campaign performance and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <ExportReport data={data} dateRange={dateRange} />
        </div>
      </div>

      {/* Date Range & Comparison Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <DateRangePicker
            dateRange={dateRange}
            onChange={setDateRange}
          />
          <div className="flex items-center gap-2">
            <Button
              variant={comparisonMode ? 'default' : 'outline'}
              onClick={() => setComparisonMode(!comparisonMode)}
              size="sm"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>
        </div>

        {comparisonMode && (
          <div className="mt-4 border-t pt-4">
            <ComparisonMode
              dateRange={comparisonDateRange}
              onChange={setComparisonDateRange}
            />
          </div>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Spend"
          value={`$${metrics.spend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={calculateTrend(metrics.spend, previousMetrics?.spend) || undefined}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <MetricCard
          title="Impressions"
          value={metrics.impressions.toLocaleString()}
          change={calculateTrend(metrics.impressions, previousMetrics?.impressions) || undefined}
          icon={Eye}
          isLoading={isLoading}
        />
        <MetricCard
          title="Clicks"
          value={metrics.clicks.toLocaleString()}
          change={calculateTrend(metrics.clicks, previousMetrics?.clicks) || undefined}
          icon={MousePointer}
          isLoading={isLoading}
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions.toLocaleString()}
          change={calculateTrend(metrics.conversions, previousMetrics?.conversions) || undefined}
          icon={Users}
          isLoading={isLoading}
        />
      </div>

      {/* Performance Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="roi">ROI & Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Performance Over Time</h3>
            <PerformanceChart
              data={data?.timeSeries || []}
              comparisonData={comparisonMode ? comparisonData?.timeSeries : undefined}
              metrics={['impressions', 'clicks', 'spend']}
              height={400}
            />
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">CTR</div>
              <div className="mt-2 text-2xl font-bold">
                {(metrics.ctr * 100).toFixed(2)}%
              </div>
              {previousMetrics && (
                <div className={`mt-1 text-xs ${
                  calculateTrend(metrics.ctr, previousMetrics.ctr)! > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {calculateTrend(metrics.ctr, previousMetrics.ctr)!.toFixed(1)}% vs previous period
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground">CPC</div>
              <div className="mt-2 text-2xl font-bold">
                ${metrics.cpc.toFixed(2)}
              </div>
              {previousMetrics && (
                <div className={`mt-1 text-xs ${
                  calculateTrend(metrics.cpc, previousMetrics.cpc)! < 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {calculateTrend(metrics.cpc, previousMetrics.cpc)!.toFixed(1)}% vs previous period
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground">CPM</div>
              <div className="mt-2 text-2xl font-bold">
                ${metrics.cpm.toFixed(2)}
              </div>
              {previousMetrics && (
                <div className={`mt-1 text-xs ${
                  calculateTrend(metrics.cpm, previousMetrics.cpm)! < 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {calculateTrend(metrics.cpm, previousMetrics.cpm)!.toFixed(1)}% vs previous period
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Engagement Metrics</h3>
            <PerformanceChart
              data={data?.timeSeries || []}
              comparisonData={comparisonMode ? comparisonData?.timeSeries : undefined}
              metrics={['clicks', 'ctr']}
              height={400}
            />
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Top Performing Campaigns</h3>
            <div className="space-y-3">
              {data?.topCampaigns?.slice(0, 5).map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.impressions.toLocaleString()} impressions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{(campaign.ctr * 100).toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Conversion Performance</h3>
            <PerformanceChart
              data={data?.timeSeries || []}
              comparisonData={comparisonMode ? comparisonData?.timeSeries : undefined}
              metrics={['conversions']}
              height={400}
            />
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="mt-2 text-2xl font-bold">
                {((metrics.conversions / metrics.clicks) * 100 || 0).toFixed(2)}%
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Cost Per Conversion</div>
              <div className="mt-2 text-2xl font-bold">
                ${(metrics.spend / metrics.conversions || 0).toFixed(2)}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">ROI & Cost Analysis</h3>
            <PerformanceChart
              data={data?.timeSeries || []}
              comparisonData={comparisonMode ? comparisonData?.timeSeries : undefined}
              metrics={['spend', 'roas']}
              height={400}
            />
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">ROAS</div>
              <div className="mt-2 text-2xl font-bold">
                {metrics.roas.toFixed(2)}x
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Return on ad spend
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Average CPC</div>
              <div className="mt-2 text-2xl font-bold">
                ${metrics.cpc.toFixed(2)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Average CPM</div>
              <div className="mt-2 text-2xl font-bold">
                ${metrics.cpm.toFixed(2)}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Insights Preview */}
      {data?.aiInsights && data.aiInsights.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
            <Button variant="link" size="sm">
              View All Insights →
            </Button>
          </div>
          <div className="space-y-3">
            {data.aiInsights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-blue-600 p-1">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {insight.title}
                    </div>
                    <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      {insight.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
