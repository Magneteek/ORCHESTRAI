'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Plus, MoreVertical, Play, Pause, Copy, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiClient } from '@/lib/helpers/api-client';

export default function AdSetsPage() {
  const { selectedAccountId } = useAdAccount();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ad-sets', selectedAccountId, search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedAccountId && { adAccountId: selectedAccountId }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/ad-sets?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to load ad sets');
      return { data: json.data, ...(json.meta || {}) } as { data: any[]; total: number; page: number; limit: number };
    },
    enabled: !!selectedAccountId,
    staleTime: 30000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/api/ad-sets/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-sets'] });
      toast.success('Ad set status updated');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/ad-sets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-sets'] });
      setConfirmDelete(null);
      toast.success('Ad set deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete ad set'),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (adSet: any) => {
      // Duplicate by creating a new ad set with the same settings
      const res = await fetch('/api/ad-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: adSet.campaign?.id,
          name: `${adSet.name} (Copy)`,
          status: 'PAUSED',
          optimizationGoal: adSet.optimizationGoal,
          billingEvent: adSet.billingEvent,
          targeting: adSet.targeting,
          ...(adSet.budget ? { dailyBudget: adSet.budget } : {}),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to duplicate');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-sets'] });
      toast.success('Ad set duplicated');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to duplicate ad set'),
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ad Sets</h2>
          <p className="text-muted-foreground">Manage your ad sets</p>
        </div>
        <Link href="/dashboard/ad-sets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ad Set
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search ad sets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
          </div>
        </Card>
      ) : error ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="font-medium text-destructive">Error loading ad sets</p>
            <Button onClick={() => refetch()} className="mt-4" size="sm">Try Again</Button>
          </div>
        </Card>
      ) : adSets.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No ad sets found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Get started by creating your first ad set'}
            </p>
            {!search && (
              <Link href="/dashboard/ad-sets/new" className="mt-4 inline-block">
                <Button variant="outline"><Plus className="mr-2 h-4 w-4" />Create Ad Set</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {adSets.map((adSet: any) => (
              <div key={adSet.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{adSet.name}</h3>
                    <Badge variant={adSet.status === 'ACTIVE' ? 'default' : 'secondary'} className="shrink-0">
                      {adSet.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {adSet.campaign?.name && <span className="mr-3">Campaign: {adSet.campaign.name}</span>}
                    {adSet.budget ? <span className="mr-3">${adSet.budget}/day</span> : <span className="mr-3">CBO</span>}
                    {adSet.optimizationGoal && <span>{adSet.optimizationGoal.replace(/_/g, ' ')}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {/* Pause / Resume */}
                  <Button
                    variant="ghost"
                    size="icon"
                    title={adSet.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: adSet.id, status: adSet.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })}
                  >
                    {adSet.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  {/* More actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/ad-sets/${adSet.id}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateMutation.mutate(adSet)} disabled={duplicateMutation.isPending}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setConfirmDelete({ id: adSet.id, name: adSet.name })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {total > 20 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Delete Ad Set</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{confirmDelete.name}</span>? This also deletes all ads inside it and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(confirmDelete.id)}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
