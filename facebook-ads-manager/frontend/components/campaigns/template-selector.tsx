'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hasDynamicFields } from '@/lib/templates/dynamic-fields';
import type { AdTemplate } from '@prisma/client';

interface TemplateSelectorProps {
  templates: (AdTemplate & {
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      accountsUsing: number;
    } | null;
  })[];
  onSelectTemplate: (template: AdTemplate) => void;
  onPreview?: (template: AdTemplate) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'general-dentist', label: 'General Dentist' },
  { value: 'orthodontist', label: 'Orthodontist' },
  { value: 'dental-supply-b2b', label: 'Dental Supply B2B' },
  { value: 'other', label: 'Other' },
];

export function TemplateSelector({
  templates,
  onSelectTemplate,
  onPreview,
  isLoading = false,
}: TemplateSelectorProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      search.trim() === '' ||
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'all' || template.category === category;

    return matchesSearch && matchesCategory;
  });

  const adCopyPreview = (template: AdTemplate) => {
    const adCopy = template.adCopy as any;
    return {
      headline: adCopy?.headline || 'No headline',
      primaryText: adCopy?.primaryText || 'No description',
    };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search-templates">Search Templates</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-templates"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search templates"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-category">Filter by Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="filter-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {isLoading
          ? 'Loading templates...'
          : `${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''} found`}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No templates found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const preview = adCopyPreview(template);
            const isDynamic = hasDynamicFields(template);
            const performance = template.performanceAggregate;

            return (
              <Card
                key={template.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description || 'No description'}
                      </CardDescription>
                    </div>
                    {isDynamic && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <Sparkles className="h-3 w-3" />
                        Dynamic
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Category Badge */}
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
                    <p className="text-sm font-medium line-clamp-1">
                      {preview.headline}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {preview.primaryText}
                    </p>
                  </div>

                  {/* Performance Metrics */}
                  {performance && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {performance.avgRoas !== null && (
                        <div>
                          <span className="text-muted-foreground">ROAS:</span>{' '}
                          <span className="font-semibold">
                            {performance.avgRoas.toFixed(2)}x
                          </span>
                        </div>
                      )}
                      {performance.avgCtr !== null && (
                        <div>
                          <span className="text-muted-foreground">CTR:</span>{' '}
                          <span className="font-semibold">
                            {(performance.avgCtr * 100).toFixed(2)}%
                          </span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Used by:</span>{' '}
                        <span className="font-semibold">
                          {performance.accountsUsing} account
                          {performance.accountsUsing !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {onPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onPreview(template)}
                    >
                      Preview
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardFooter>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
