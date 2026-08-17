'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Target,
  RefreshCw,
  Facebook,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { useCurrency } from '@/lib/hooks/use-currency';
import { apiClient } from '@/lib/helpers/api-client';
import { isLeadGen, type AnalyticsData, type TopCampaign } from '@/types/analytics';

type DatePreset = 'today' | '7days' | '30days';

function getDateRange(preset: DatePreset): { from: string; to: string } {
  const to = new Date();
  const from = new Date();

  switch (preset) {
    case 'today':
      break;
    case '7days':
      from.setDate(from.getDate() - 7);
      break;
    case '30days':
      from.setDate(from.getDate() - 30);
      break;
  }

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}


export default function DashboardPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('7days');
  const { selectedAccountId, accounts, isLoading: accountsLoading } = useAdAccount();
  const { format: formatCurrency } = useCurrency();

  const dateRange = useMemo(() => getDateRange(datePreset), [datePreset]);

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics', selectedAccountId, dateRange.from, dateRange.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
        ...(selectedAccountId && { accountIds: selectedAccountId }),
      });
      return apiClient.get<AnalyticsData>(`/api/analytics/simple?${params}`);
    },
    enabled: !!selectedAccountId,
    staleTime: 60 * 1000,
  });

  const metrics = data?.metrics;
  const topCampaigns = data?.topCampaigns ?? [];

  // No accounts connected
  if (!accountsLoading && accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome!</h2>
          <p className="text-muted-foreground">
            Connect your Facebook account to get started
          </p>
        </div>
        <Card className="flex flex-col items-center p-12 text-center">
          <Facebook className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Facebook account connected</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Connect your Facebook Business account to start managing campaigns
            and viewing analytics data.
          </p>
          <Link href="/dashboard/settings">
            <Button className="mt-6 gap-2">
              <Facebook className="h-4 w-4" />
              Connect Facebook Account
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-20 animate-pulse bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Failed to load analytics</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here is an overview of your advertising performance
        </p>
      </div>

      {/* Date Range Tabs */}
      <Tabs
        value={datePreset}
        onValueChange={(v) => setDatePreset(v as DatePreset)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={datePreset} className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Spend"
              value={metrics ? formatCurrency(metrics.spend) : '--'}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              isLoading={isLoading || accountsLoading}
            />
            <MetricCard
              title="Impressions"
              value={metrics ? formatNumber(metrics.impressions) : '--'}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
              isLoading={isLoading || accountsLoading}
            />
            <MetricCard
              title="Clicks"
              value={metrics ? formatNumber(metrics.clicks) : '--'}
              icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
              isLoading={isLoading || accountsLoading}
            />
            {/* Lead-gen books no revenue, so a ROAS tile is a permanent 0.00x
                that reads as failure. Show leads and cost per lead instead. */}
            {metrics && isLeadGen(metrics) ? (
              <MetricCard
                title="Leads"
                value={formatNumber(metrics.conversions)}
                subtitle={`${formatCurrency(metrics.cpa)} per lead`}
                icon={<Target className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading || accountsLoading}
              />
            ) : (
              <MetricCard
                title="ROAS"
                value={metrics ? `${metrics.roas.toFixed(2)}x` : '--'}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading || accountsLoading}
              />
            )}
          </div>

          {/* Performance Overview */}
          <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  Your top performing campaigns this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || accountsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted" />
                    ))}
                  </div>
                ) : topCampaigns.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No campaign data available for this period
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topCampaigns.slice(0, 4).map((campaign) => (
                      <CampaignRow
                        key={campaign.id}
                        campaign={campaign}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || accountsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 animate-pulse rounded-lg border bg-muted" />
                    ))}
                  </div>
                ) : metrics ? (
                  <div className="space-y-4">
                    <StatRow
                      label="Click-Through Rate"
                      // API returns ctr as a fraction (clicks / impressions)
                      value={`${(metrics.ctr * 100).toFixed(2)}%`}
                    />
                    <StatRow
                      label="Cost Per Click"
                      value={formatCurrency(metrics.cpc)}
                    />
                    <StatRow
                      label="CPM"
                      value={formatCurrency(metrics.cpm)}
                    />
                    <StatRow
                      label={isLeadGen(metrics) ? 'Leads' : 'Conversions'}
                      value={formatNumber(metrics.conversions)}
                    />
                    {metrics.conversions > 0 && (
                      <StatRow
                        label={isLeadGen(metrics) ? 'Cost Per Lead' : 'Cost Per Conversion'}
                        value={formatCurrency(metrics.cpa)}
                      />
                    )}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  isLoading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CampaignRow({
  campaign,
  formatCurrency,
}: {
  campaign: TopCampaign;
  formatCurrency: (n: number) => string;
}) {
  // Same reasoning as the headline tile: a lead-gen campaign's ROAS is always
  // 0.0x, so lead count and cost per lead are what's worth showing.
  const leadGen = isLeadGen(campaign);

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">{campaign.name}</p>
        <span className="text-xs text-muted-foreground">
          Spend: {formatCurrency(campaign.spend)}
        </span>
      </div>
      <div className="text-right">
        {leadGen ? (
          <>
            <p className="text-lg font-bold">{formatNumber(campaign.conversions)}</p>
            <p className="text-xs text-muted-foreground">
              leads &middot; {formatCurrency(campaign.cpa)} each
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">{campaign.roas.toFixed(1)}x</p>
            <p className="text-xs text-muted-foreground">ROAS</p>
          </>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
