'use client';

import { TrendingUp, TrendingDown, DollarSign, Target, MousePointer, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import type { FacebookCampaign } from '@/types/facebook';

interface CampaignStatsProps {
  campaigns: FacebookCampaign[];
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  // TODO: Fetch campaign insights separately - FacebookCampaign doesn't include insights
  // Need to query /api/campaigns/[id]/insights for each campaign

  // Calculate aggregate stats
  const stats = campaigns.reduce(
    (acc, campaign) => {
      // Type assertion for now - insights should be queried separately
      const campaignWithInsights = campaign as any;
      if (campaignWithInsights.insights) {
        acc.totalSpend += campaignWithInsights.insights.spend || 0;
        acc.totalClicks += campaignWithInsights.insights.clicks || 0;
        acc.totalImpressions += campaignWithInsights.insights.impressions || 0;
        acc.totalConversions += campaignWithInsights.insights.conversions || 0;

        if (campaignWithInsights.insights.roas) {
          acc.roasSum += campaignWithInsights.insights.roas;
          acc.roasCount++;
        }

        if (campaignWithInsights.insights.ctr) {
          acc.ctrSum += campaignWithInsights.insights.ctr;
          acc.ctrCount++;
        }
      }
      return acc;
    },
    {
      totalSpend: 0,
      totalClicks: 0,
      totalImpressions: 0,
      totalConversions: 0,
      roasSum: 0,
      roasCount: 0,
      ctrSum: 0,
      ctrCount: 0,
    }
  );

  const avgRoas = stats.roasCount > 0 ? stats.roasSum / stats.roasCount : 0;
  const avgCtr = stats.ctrCount > 0 ? stats.ctrSum / stats.ctrCount : 0;

  const statCards = [
    {
      title: 'Total Spend',
      value: formatCurrency(stats.totalSpend),
      change: null, // TODO: Calculate change from previous period
      icon: DollarSign,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Avg. ROAS',
      value: formatNumber(avgRoas, 2),
      change: null,
      icon: TrendingUp,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      title: 'Avg. CTR',
      value: formatPercentage(avgCtr),
      change: null,
      icon: MousePointer,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Total Conversions',
      value: formatNumber(stats.totalConversions),
      change: null,
      icon: ShoppingCart,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.change !== null && (
                  <span
                    className={`flex items-center text-sm ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
            </div>
            <div className={`rounded-full p-3 ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
