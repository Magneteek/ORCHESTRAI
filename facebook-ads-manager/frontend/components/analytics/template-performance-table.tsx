'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Rocket, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExpandableTemplateRow } from './expandable-template-row';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TemplateData {
  id: string;
  name: string;
  category: string;
  accountsUsing: number;
  totalSpend: number;
  avgRoas: number | null;
  avgCtr: number | null;
  avgCpc: number | null;
  timesUsed: number;
}

interface TemplatePerformanceTableProps {
  templates: TemplateData[];
  isLoading?: boolean;
}

type SortKey = 'name' | 'accountsUsing' | 'totalSpend' | 'avgRoas' | 'avgCtr' | 'avgCpc';
type SortOrder = 'asc' | 'desc';

export function TemplatePerformanceTable({
  templates,
  isLoading = false,
}: TemplatePerformanceTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('avgRoas');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const toggleRow = (templateId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedTemplates = React.useMemo(() => {
    return [...templates].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'accountsUsing':
          aValue = a.accountsUsing;
          bValue = b.accountsUsing;
          break;
        case 'totalSpend':
          aValue = a.totalSpend;
          bValue = b.totalSpend;
          break;
        case 'avgRoas':
          aValue = a.avgRoas ?? -1;
          bValue = b.avgRoas ?? -1;
          break;
        case 'avgCtr':
          aValue = a.avgCtr ?? -1;
          bValue = b.avgCtr ?? -1;
          break;
        case 'avgCpc':
          aValue = a.avgCpc ?? -1;
          bValue = b.avgCpc ?? -1;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [templates, sortKey, sortOrder]);

  const getRoasColor = (roas: number | null) => {
    if (roas === null) return 'text-muted-foreground';
    if (roas >= 3) return 'text-green-600';
    if (roas >= 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRoasBadgeVariant = (roas: number | null): 'success' | 'warning' | 'destructive' | 'secondary' => {
    if (roas === null) return 'secondary';
    if (roas >= 3) return 'success';
    if (roas >= 1) return 'warning';
    return 'destructive';
  };

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

  const SortButton = ({ column, children }: { column: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className={cn(
        'h-3 w-3',
        sortKey === column ? 'text-primary' : 'text-muted-foreground'
      )} />
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No template data available</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Templates will appear here once they have been used in campaigns
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>
              <SortButton column="name">Template Name</SortButton>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">
              <SortButton column="accountsUsing">Accounts Using</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="totalSpend">Total Spend</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="avgRoas">Avg ROAS</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="avgCtr">Avg CTR</SortButton>
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="avgCpc">Avg CPC</SortButton>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTemplates.map((template) => (
            <React.Fragment key={template.id}>
              <TableRow className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <button
                    onClick={() => toggleRow(template.id)}
                    className="rounded p-1 hover:bg-muted"
                    aria-label={expandedRows.has(template.id) ? 'Collapse row' : 'Expand row'}
                  >
                    {expandedRows.has(template.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{template.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Used {template.timesUsed} times
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{template.category}</Badge>
                </TableCell>
                <TableCell className="text-right">{template.accountsUsing}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(template.totalSpend)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={getRoasBadgeVariant(template.avgRoas)}>
                    {template.avgRoas !== null ? `${template.avgRoas.toFixed(2)}x` : 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(template.avgCtr)}%
                </TableCell>
                <TableCell className="text-right">
                  {template.avgCpc !== null ? formatCurrency(template.avgCpc) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/templates/${template.id}`}>
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/campaigns/launch?templateId=${template.id}`}>
                        <Rocket className="mr-1 h-3 w-3" />
                        Launch
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.has(template.id) && (
                <TableRow>
                  <TableCell colSpan={9} className="bg-muted/30 p-4">
                    <ExpandableTemplateRow templateId={template.id} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
