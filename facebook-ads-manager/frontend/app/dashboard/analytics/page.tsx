'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KpiTile } from '@/components/analytics/kpi-tile';
import { MetricSparkline } from '@/components/analytics/metric-sparkline';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { DayOfWeekEfficiency } from '@/components/analytics/day-of-week-efficiency';
import { ExportReport } from '@/components/analytics/export-report';
import { apiClient } from '@/lib/helpers/api-client';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import {
  DEFAULT_INDUSTRY,
  INDUSTRY_BENCHMARKS,
  getBenchmark,
} from '@/lib/analytics/benchmarks';
import { isLeadGen, type AnalyticsData } from '@/types/analytics';

type Preset = '7' | '30' | '90';

const PRESET_LABEL: Record<Preset, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
};

const INDUSTRY_STORAGE_PREFIX = 'analyticsIndustry:';

/** YYYY-MM-DD in UTC, matching how performance_metrics dates are keyed. */
function isoDay(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * Current window plus the equal-length window immediately before it, so every
 * KPI can be stated as a change rather than a bare number.
 */
function windows(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - days);

  return {
    from: isoDay(from),
    to: isoDay(to),
    prevFrom: isoDay(prevFrom),
    prevTo: isoDay(prevTo),
  };
}

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<Preset>('30');
  const [industry, setIndustry] = useState<string>(DEFAULT_INDUSTRY);
  const { selectedAccountId, selectedAccount, accounts, isLoading: accountsLoading } =
    useAdAccount();

  const range = useMemo(() => windows(Number(preset)), [preset]);

  // Industry is per ad account — a dental client and an e-commerce client
  // share nothing benchmark-wise. Stored client-side for now; moving it onto
  // the AdAccount record is a schema change, not a redesign.
  useEffect(() => {
    if (!selectedAccountId) return;
    const stored = localStorage.getItem(INDUSTRY_STORAGE_PREFIX + selectedAccountId);
    setIndustry(stored ?? DEFAULT_INDUSTRY);
  }, [selectedAccountId]);

  const onIndustryChange = (value: string) => {
    setIndustry(value);
    if (selectedAccountId) {
      localStorage.setItem(INDUSTRY_STORAGE_PREFIX + selectedAccountId, value);
    }
  };

  const fetchRange = (from: string, to: string) => {
    const params = new URLSearchParams({
      from,
      to,
      ...(selectedAccountId && { accountIds: selectedAccountId }),
    });
    return apiClient.get<AnalyticsData>(`/api/analytics?${params}`);
  };

  const { data, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', selectedAccountId, range.from, range.to],
    queryFn: () => fetchRange(range.from, range.to),
    enabled: !!selectedAccountId,
  });

  const { data: previous } = useQuery<AnalyticsData>({
    queryKey: ['analytics-prev', selectedAccountId, range.prevFrom, range.prevTo],
    queryFn: () => fetchRange(range.prevFrom, range.prevTo),
    enabled: !!selectedAccountId,
  });

  // Format in the account's own currency. The app elsewhere hardcodes USD,
  // which prints EUR spend with a dollar sign.
  const currency = selectedAccount?.currency || 'USD';
  const fmtCurrency = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format,
    [currency]
  );
  const fmtCount = (n: number) => n.toLocaleString('en-US');
  const fmtPercent = (n: number) => `${(n * 100).toFixed(2)}%`;

  const benchmark = getBenchmark(industry);
  const m = data?.metrics;
  const prev = previous?.metrics;
  const leadGen = m ? isLeadGen(m) : true;

  const series = data?.timeSeries ?? [];
  const cvr = m && m.clicks > 0 ? m.conversions / m.clicks : 0;

  if (!accountsLoading && accounts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connect a Facebook ad account to see analytics.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {selectedAccount?.name ?? 'Select an account'} · {PRESET_LABEL[preset]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={industry} onValueChange={onIndustryChange}>
            <SelectTrigger className="w-52" aria-label="Benchmark industry">
              <SelectValue placeholder="Benchmark industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_BENCHMARKS.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={preset} onValueChange={(v) => setPreset(v as Preset)}>
            <TabsList>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <ExportReport
            data={data}
            dateRange={{ from: new Date(range.from), to: new Date(range.to) }}
          />
        </div>
      </div>

      {isLoading || !m ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : (
        <>
          {/* Headline KPIs — spend, volume, efficiency, quality */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiTile
              label="Spend"
              value={m.spend}
              format={fmtCurrency}
              previous={prev?.spend}
            />
            <KpiTile
              label={leadGen ? 'Leads' : 'Conversions'}
              value={m.conversions}
              format={fmtCount}
              previous={prev?.conversions}
            />
            <KpiTile
              label={leadGen ? 'Cost per lead' : 'Cost per conversion'}
              value={m.cpa}
              format={fmtCurrency}
              previous={prev?.cpa}
              lowerIsBetter
              benchmark={benchmark.cpl}
              benchmarkKind="currency"
            />
            <KpiTile
              label="Click-through rate"
              value={m.ctr}
              format={fmtPercent}
              previous={prev?.ctr}
              benchmark={benchmark.ctr}
              benchmarkKind="percent"
              footnote={`${fmtCurrency(m.cpc)} per click`}
            />
          </div>

          {/* Where people are lost, and when they convert cheapest */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Conversion funnel</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Where the drop-off happens
              </p>
              <ConversionFunnel
                formatCount={fmtCount}
                steps={[
                  { label: 'Impressions', value: m.impressions },
                  {
                    label: 'Clicks',
                    value: m.clicks,
                    rate: m.ctr,
                    benchmark: benchmark.ctr,
                  },
                  {
                    label: leadGen ? 'Leads' : 'Conversions',
                    value: m.conversions,
                    rate: cvr,
                    benchmark: benchmark.cvr,
                  },
                ]}
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Efficiency by day of week</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                {leadGen ? 'Cost per lead' : 'Cost per conversion'} by weekday
              </p>
              <DayOfWeekEfficiency
                data={data?.dayOfWeek ?? []}
                formatCurrency={fmtCurrency}
              />
            </Card>
          </div>

          {/* Trends — one metric per panel, each with its own scale */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Trends</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Each panel is scaled to its own range; the arrow compares the second
              half of the period against the first
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricSparkline
                label="Spend"
                format={fmtCurrency}
                points={series.map((p) => ({ date: p.date, value: p.spend }))}
              />
              <MetricSparkline
                label={leadGen ? 'Leads' : 'Conversions'}
                format={fmtCount}
                points={series.map((p) => ({ date: p.date, value: p.conversions }))}
              />
              <MetricSparkline
                label={leadGen ? 'Cost per lead' : 'Cost per conversion'}
                format={fmtCurrency}
                lowerIsBetter
                points={series
                  // Days with no conversions have no defined cost per lead;
                  // plotting them as zero would invent a perfect day.
                  .filter((p) => p.conversions > 0)
                  .map((p) => ({ date: p.date, value: p.spend / p.conversions }))}
              />
              <MetricSparkline
                label="Click-through rate"
                format={fmtPercent}
                points={series.map((p) => ({ date: p.date, value: p.ctr }))}
              />
            </div>
          </Card>

          {/* Campaign comparison, ordered by the decision metric */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Campaigns</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Ranked by {leadGen ? 'cost per lead' : 'cost per conversion'} — cheapest first
            </p>

            {data?.topCampaigns.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Campaign</th>
                      <th className="pb-2 text-right font-medium">Spend</th>
                      <th className="pb-2 text-right font-medium">
                        {leadGen ? 'Leads' : 'Conv.'}
                      </th>
                      <th className="pb-2 text-right font-medium">
                        {leadGen ? 'Cost/lead' : 'Cost/conv.'}
                      </th>
                      <th className="pb-2 text-right font-medium">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.topCampaigns]
                      .sort((a, b) => {
                        // Campaigns that converted rank ahead of those that
                        // did not, cheapest first; a zero cpa means "no leads",
                        // not "free leads".
                        if (!a.cpa && !b.cpa) return b.spend - a.spend;
                        if (!a.cpa) return 1;
                        if (!b.cpa) return -1;
                        return a.cpa - b.cpa;
                      })
                      .map((c) => (
                        <tr key={c.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">{c.name}</td>
                          <td className="py-2 text-right tabular-nums">
                            {fmtCurrency(c.spend)}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {c.conversions || '—'}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {c.cpa ? fmtCurrency(c.cpa) : '—'}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {fmtPercent(c.ctr)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No campaign delivery in this period
              </p>
            )}
          </Card>

          <p className="text-xs text-muted-foreground">
            Benchmarks are 2026 Meta lead-gen industry averages shown for context, not
            targets; they are quoted in USD and swing seasonally by roughly 46%.
            {currency !== 'USD' && ` This account reports in ${currency}.`}
          </p>
        </>
      )}
    </div>
  );
}
