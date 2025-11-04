'use client';

import { useState } from 'react';
import { Star, TrendingUp, Users, Copy, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/format';
import type { AdTemplate } from '@prisma/client';

interface TemplateCardProps {
  template: AdTemplate & {
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      avgCpm: number | null;
      totalSpend: number;
      accountsUsing: number;
    } | null;
  };
  onUseTemplate: (template: AdTemplate) => void;
  onPreview: (template: AdTemplate) => void;
}

export function TemplateCard({ template, onUseTemplate, onPreview }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const adCopy = template.adCopy as any;
  const performance = template.performanceAggregate;

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Badge */}
      <div className="absolute right-4 top-4 z-10">
        <Badge variant={template.isPublic ? 'default' : 'secondary'}>
          {template.isPublic ? 'Public' : 'Private'}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description || 'No description provided'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category & Objective */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {template.category.replace(/-/g, ' ')}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {template.objective.replace('OUTCOME_', '').toLowerCase()}
          </Badge>
        </div>

        {/* Ad Copy Preview */}
        <div className="space-y-2 rounded-md border bg-muted/50 p-3">
          <p className="text-sm font-medium line-clamp-1">{adCopy?.headline}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {adCopy?.primaryText}
          </p>
        </div>

        {/* Performance Metrics */}
        {performance && (
          <div className="grid grid-cols-2 gap-3">
            {performance.avgRoas !== null && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                  <p className="text-sm font-semibold">
                    {formatNumber(performance.avgRoas, 2)}x
                  </p>
                </div>
              </div>
            )}

            {performance.avgCtr !== null && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">CTR</p>
                  <p className="text-sm font-semibold">
                    {formatPercentage(performance.avgCtr)}
                  </p>
                </div>
              </div>
            )}

            {performance.avgCpc !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm">💰</span>
                <div>
                  <p className="text-xs text-muted-foreground">Avg CPC</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(performance.avgCpc)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Used by</p>
                <p className="text-sm font-semibold">
                  {performance.accountsUsing} {performance.accountsUsing === 1 ? 'account' : 'accounts'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Copy className="h-4 w-4" />
          <span>Used {template.timesUsed} times</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onPreview(template)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button
          className="flex-1"
          onClick={() => onUseTemplate(template)}
        >
          Use Template
        </Button>
      </CardFooter>

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      )}
    </Card>
  );
}
