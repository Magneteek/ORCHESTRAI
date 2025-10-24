'use client';

import { TrendingUp, Star, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/format';
import type { AdTemplate } from '@prisma/client';

interface TemplateLeaderboardProps {
  templates: (AdTemplate & {
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      avgCpm: number | null;
      totalSpend: number;
      accountsUsing: number;
    } | null;
  })[];
  metric?: 'roas' | 'ctr' | 'conversions' | 'usage';
  onSelectTemplate: (template: AdTemplate) => void;
}

export function TemplateLeaderboard({
  templates,
  metric = 'roas',
  onSelectTemplate,
}: TemplateLeaderboardProps) {
  const getMetricIcon = () => {
    switch (metric) {
      case 'roas':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'ctr':
        return <Star className="h-5 w-5 text-blue-600" />;
      case 'conversions':
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      case 'usage':
        return <Users className="h-5 w-5 text-orange-600" />;
    }
  };

  const getMetricTitle = () => {
    switch (metric) {
      case 'roas':
        return 'Top ROAS';
      case 'ctr':
        return 'Highest CTR';
      case 'conversions':
        return 'Most Conversions';
      case 'usage':
        return 'Most Used';
    }
  };

  const getMetricValue = (template: typeof templates[0]) => {
    const perf = template.performanceAggregate;
    if (!perf) return null;

    switch (metric) {
      case 'roas':
        return perf.avgRoas !== null ? `${formatNumber(perf.avgRoas, 2)}x` : '-';
      case 'ctr':
        return perf.avgCtr !== null ? formatPercentage(perf.avgCtr) : '-';
      case 'conversions':
        return '-'; // Would need conversion data
      case 'usage':
        return `${template.timesUsed} uses`;
    }
  };

  // Sort templates by metric
  const sortedTemplates = [...templates].sort((a, b) => {
    const perfA = a.performanceAggregate;
    const perfB = b.performanceAggregate;

    switch (metric) {
      case 'roas':
        return (perfB?.avgRoas || 0) - (perfA?.avgRoas || 0);
      case 'ctr':
        return (perfB?.avgCtr || 0) - (perfA?.avgCtr || 0);
      case 'usage':
        return b.timesUsed - a.timesUsed;
      default:
        return 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getMetricIcon()}
          <CardTitle>{getMetricTitle()}</CardTitle>
        </div>
        <CardDescription>
          Top performing templates in the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Performance</TableHead>
                <TableHead className="text-right">Used By</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTemplates.slice(0, 10).map((template, index) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {index < 3 ? (
                        <Badge
                          variant={
                            index === 0
                              ? 'default'
                              : index === 1
                              ? 'secondary'
                              : 'outline'
                          }
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1">
                        {template.name}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {template.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {template.category.replace(/-/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {getMetricValue(template)}
                  </TableCell>
                  <TableCell className="text-right">
                    {template.performanceAggregate?.accountsUsing || 0}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectTemplate(template)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
