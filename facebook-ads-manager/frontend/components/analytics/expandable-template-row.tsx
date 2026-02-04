'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/helpers/api-client';

interface AccountBreakdown {
  accountId: string;
  accountName: string;
  campaigns: number;
  spend: number;
  roas: number | null;
  ctr: number | null;
  cpc: number | null;
}

interface ExpandableTemplateRowProps {
  templateId: string;
}

export function ExpandableTemplateRow({ templateId }: ExpandableTemplateRowProps) {
  const { data: breakdown, isLoading, error } = useQuery<AccountBreakdown[]>({
    queryKey: ['template-breakdown', templateId],
    queryFn: () => apiClient.get(`/api/analytics/templates/${templateId}/breakdown`),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toFixed(2);
  };

  const getRoasBadgeVariant = (roas: number | null): 'success' | 'warning' | 'destructive' | 'secondary' => {
    if (roas === null) return 'secondary';
    if (roas >= 3) return 'success';
    if (roas >= 1) return 'warning';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading account breakdown...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950">
        <p className="text-sm text-red-800 dark:text-red-200">
          Failed to load account breakdown. Please try again.
        </p>
      </div>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No account data available for this template
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">Per-Account Breakdown</h4>
        <p className="text-xs text-muted-foreground">
          Performance metrics grouped by ad account
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right">Campaigns</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">ROAS</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CPC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell className="font-medium">{account.accountName}</TableCell>
                <TableCell className="text-right">{account.campaigns}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(account.spend)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={getRoasBadgeVariant(account.roas)}>
                    {account.roas !== null ? `${account.roas.toFixed(2)}x` : 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(account.ctr)}%
                </TableCell>
                <TableCell className="text-right">
                  {account.cpc !== null ? formatCurrency(account.cpc) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
        <span className="text-sm font-medium">Total</span>
        <div className="flex items-center gap-6 text-sm">
          <span>
            <span className="text-muted-foreground">Accounts:</span>{' '}
            <span className="font-semibold">{breakdown.length}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Total Spend:</span>{' '}
            <span className="font-semibold">
              {formatCurrency(breakdown.reduce((sum, acc) => sum + acc.spend, 0))}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">Avg ROAS:</span>{' '}
            <span className="font-semibold">
              {(() => {
                const roasValues = breakdown.filter((acc) => acc.roas !== null);
                if (roasValues.length === 0) return 'N/A';
                const avgRoas =
                  roasValues.reduce((sum, acc) => sum + acc.roas!, 0) / roasValues.length;
                return `${avgRoas.toFixed(2)}x`;
              })()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
