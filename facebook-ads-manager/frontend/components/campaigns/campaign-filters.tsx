'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CampaignFiltersProps {
  filters: {
    status: string;
    objective: string;
    adAccountId: string;
  };
  onChange: (filters: any) => void;
  onReset: () => void;
}

export function CampaignFilters({
  filters,
  onChange,
  onReset,
}: CampaignFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'DELETED', label: 'Deleted' },
  ];

  const objectives = [
    { value: 'all', label: 'All Objectives' },
    { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
    { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
    { value: 'OUTCOME_LEADS', label: 'Leads' },
    { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion' },
    { value: 'OUTCOME_SALES', label: 'Sales' },
  ];

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.objective !== 'all' ||
    filters.adAccountId !== '';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({ ...filters, status: value })
            }
          >
            <SelectTrigger id="status-filter" data-testid="filter-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Objective Filter */}
        <div className="space-y-2">
          <Label htmlFor="objective-filter">Objective</Label>
          <Select
            value={filters.objective}
            onValueChange={(value) =>
              onChange({ ...filters, objective: value })
            }
          >
            <SelectTrigger id="objective-filter" data-testid="filter-objective">
              <SelectValue placeholder="Select objective" />
            </SelectTrigger>
            <SelectContent>
              {objectives.map((objective) => (
                <SelectItem key={objective.value} value={objective.value}>
                  {objective.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ad Account Filter */}
        <div className="space-y-2">
          <Label htmlFor="account-filter">Ad Account</Label>
          <Select
            value={filters.adAccountId}
            onValueChange={(value) =>
              onChange({ ...filters, adAccountId: value })
            }
          >
            <SelectTrigger id="account-filter" data-testid="filter-account">
              <SelectValue placeholder="All accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All accounts</SelectItem>
              {/* TODO: Load actual ad accounts from API */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            data-testid="reset-filters"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
