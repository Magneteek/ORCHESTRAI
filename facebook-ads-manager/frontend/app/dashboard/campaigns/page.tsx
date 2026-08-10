'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CampaignTable } from '@/components/campaigns/campaign-table';
import { CampaignFilters } from '@/components/campaigns/campaign-filters';
import { CampaignStats } from '@/components/campaigns/campaign-stats';
import { SyncButton } from '@/components/dashboard/sync-button';
import { apiClient } from '@/lib/helpers/api-client';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import type { FacebookCampaign } from '@/types/facebook';

interface CampaignsResponse {
  data: FacebookCampaign[];
  total: number;
  page: number;
  limit: number;
}

export default function CampaignsPage() {
  const { selectedAccountId } = useAdAccount();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    objective: 'all',
    adAccountId: '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Sync selected ad account from context into filters
  useEffect(() => {
    if (selectedAccountId) {
      setFilters((prev) => ({ ...prev, adAccountId: selectedAccountId }));
    }
  }, [selectedAccountId]);

  // Fetch campaigns with search and filters
  const { data, isLoading, error, refetch } = useQuery<CampaignsResponse>({
    queryKey: ['campaigns', search, filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.objective !== 'all' && { objective: filters.objective }),
        ...(filters.adAccountId && { adAccountId: filters.adAccountId }),
      });

      const res = await fetch(`/api/campaigns?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to load campaigns');
      return { data: json.data, ...(json.meta || {}) } as CampaignsResponse;
    },
    staleTime: 30000,
    enabled: !!filters.adAccountId,
  });

  const campaigns = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your Facebook ad campaigns
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button size="lg" data-testid="create-campaign-button">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <CampaignStats campaigns={campaigns} />

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="campaign-search"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="toggle-filters"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(filters.status !== 'all' || filters.objective !== 'all') && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {[filters.status !== 'all', filters.objective !== 'all'].filter(Boolean).length}
              </span>
            )}
          </Button>

          {/* Sync */}
          {selectedAccountId && (
            <SyncButton adAccountId={selectedAccountId} onSuccess={() => refetch()} />
          )}

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            data-testid="refresh-campaigns"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 border-t pt-4">
            <CampaignFilters
              filters={filters}
              onChange={setFilters}
              onReset={() =>
                setFilters({ status: 'all', objective: 'all', adAccountId: '' })
              }
            />
          </div>
        )}
      </Card>

      {/* Campaign Table */}
      <Card>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Loading campaigns...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-destructive">
                Error loading campaigns
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No campaigns found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search || filters.status !== 'all' || filters.objective !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Sync your Facebook account to import existing campaigns'}
              </p>
              {!search && filters.status === 'all' && filters.objective === 'all' && selectedAccountId && (
                  <div className="mt-4 flex gap-3 justify-center">
                    <SyncButton adAccountId={selectedAccountId} onSuccess={() => refetch()} />
                    <Link href="/dashboard/campaigns/new">
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New
                      </Button>
                    </Link>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <CampaignTable
            campaigns={campaigns}
            onRefresh={refetch}
            currentPage={page}
            totalPages={Math.ceil(total / 20)}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
