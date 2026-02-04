'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, DollarSign, FileText, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MetricCard } from '@/components/analytics/metric-card';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import { TemplatePerformanceTable } from '@/components/analytics/template-performance-table';
import { TemplateRoasChart } from '@/components/analytics/template-roas-chart';
import { SpendDistributionChart } from '@/components/analytics/spend-distribution-chart';
import { apiClient } from '@/lib/helpers/api-client';
import type { DateRange } from '@/types/analytics';

interface TemplateAnalyticsData {
  analytics: {
    totals: {
      totalTemplates: number;
      activeCampaigns: number;
      totalSpend: number;
      avgRoas: number;
    };
    templates: Array<{
      id: string;
      name: string;
      category: string;
      accountsUsing: number;
      totalSpend: number;
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      timesUsed: number;
    }>;
  };
  categories: Array<{
    category: string;
    count: number;
  }>;
}

export default function TemplateAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data, isLoading, refetch } = useQuery<TemplateAnalyticsData>({
    queryKey: ['template-analytics', dateRange, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      return apiClient.get<TemplateAnalyticsData>(`/api/analytics/templates?${params}`);
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  const totals = data?.analytics.totals || {
    totalTemplates: 0,
    activeCampaigns: 0,
    totalSpend: 0,
    avgRoas: 0,
  };

  const templates = data?.analytics.templates || [];
  const categories = data?.categories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Template Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Cross-account performance insights for all templates
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="Refresh analytics"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Category:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Templates"
          value={totals.totalTemplates}
          icon={FileText}
          iconColor="text-blue-600"
          format="number"
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Campaigns"
          value={totals.activeCampaigns}
          icon={Target}
          iconColor="text-green-600"
          format="number"
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Spend"
          value={totals.totalSpend}
          icon={DollarSign}
          iconColor="text-purple-600"
          format="currency"
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg ROAS"
          value={totals.avgRoas}
          icon={TrendingUp}
          iconColor="text-orange-600"
          format="number"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TemplateRoasChart templates={templates} limit={10} />
        <SpendDistributionChart templates={templates} topN={5} />
      </div>

      {/* Performance Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Template Performance</h3>
          <p className="text-sm text-muted-foreground">
            Detailed performance metrics for all templates
          </p>
        </div>
        <TemplatePerformanceTable templates={templates} isLoading={isLoading} />
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-blue-600 p-1">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-blue-900 dark:text-blue-100">
              Admin-Only Analytics
            </div>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              This dashboard shows aggregated performance data across all ad accounts in
              your organization. Use the filters above to refine your view by date range
              or template category. Click on any template row to see per-account breakdown.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
