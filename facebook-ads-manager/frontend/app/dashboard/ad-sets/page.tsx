'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/helpers/api-client';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdSetsPage() {
  const { selectedAccountId } = useAdAccount();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ad-sets', selectedAccountId, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedAccountId && { adAccountId: selectedAccountId }),
        ...(search && { search }),
      });
      return apiClient.get<{ data: any[]; total: number; page: number; limit: number }>(`/api/ad-sets?${params}`);
    },
    enabled: !!selectedAccountId,
    staleTime: 30000,
  });

  const adSets = data?.data || [];
  const total = data?.total || 0;

  if (!selectedAccountId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ad Sets</h2>
          <p className="text-muted-foreground">Manage your ad sets</p>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Select an ad account to view ad sets</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ad Sets</h2>
        <p className="text-muted-foreground">Manage your ad sets</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ad sets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2 text-sm text-muted-foreground">Loading ad sets...</p>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="font-medium text-destructive">Error loading ad sets</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button onClick={() => refetch()} className="mt-4" size="sm">
              Try Again
            </Button>
          </div>
        </Card>
      ) : adSets.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No ad sets found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Get started by creating your first ad set'}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {adSets.map((adSet: any) => (
              <div key={adSet.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{adSet.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {adSet.status} | Budget: ${adSet.budget || 0}
                    </p>
                    {adSet.campaign && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Campaign: {adSet.campaign.name}
                      </p>
                    )}
                  </div>
                  <Link href={`/dashboard/ad-sets/${adSet.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} ad sets
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
