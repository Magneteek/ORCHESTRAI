'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TemplateFiltersProps {
  filters: {
    category: string;
    objective: string;
    visibility: string;
    sortBy: string;
  };
  onChange: (filters: TemplateFiltersProps['filters']) => void;
  onReset: () => void;
}

export function TemplateFilters({ filters, onChange, onReset }: TemplateFiltersProps) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'e-commerce', label: 'E-commerce' },
    { value: 'lead-generation', label: 'Lead Generation' },
    { value: 'brand-awareness', label: 'Brand Awareness' },
    { value: 'app-promotion', label: 'App Promotion' },
    { value: 'event-promotion', label: 'Event Promotion' },
    { value: 'local-business', label: 'Local Business' },
  ];

  const objectives = [
    { value: 'all', label: 'All Objectives' },
    { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
    { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
    { value: 'OUTCOME_LEADS', label: 'Leads' },
    { value: 'OUTCOME_SALES', label: 'Sales' },
    { value: 'APP_INSTALLS', label: 'App Installs' },
  ];

  const visibilityOptions = [
    { value: 'all', label: 'All Templates' },
    { value: 'public', label: 'Public Only' },
    { value: 'private', label: 'My Templates' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'timesUsed', label: 'Most Used' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'roas', label: 'Best ROAS' },
    { value: 'ctr', label: 'Highest CTR' },
  ];

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.objective !== 'all' ||
    filters.visibility !== 'all' ||
    filters.sortBy !== 'createdAt';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              onChange({ ...filters, category: value })
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Objective Filter */}
        <div className="space-y-2">
          <Label htmlFor="objective">Objective</Label>
          <Select
            value={filters.objective}
            onValueChange={(value) =>
              onChange({ ...filters, objective: value })
            }
          >
            <SelectTrigger id="objective">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {objectives.map((obj) => (
                <SelectItem key={obj.value} value={obj.value}>
                  {obj.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Filter */}
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={filters.visibility}
            onValueChange={(value) =>
              onChange({ ...filters, visibility: value })
            }
          >
            <SelectTrigger id="visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((vis) => (
                <SelectItem key={vis.value} value={vis.value}>
                  {vis.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              onChange({ ...filters, sortBy: value })
            }
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
