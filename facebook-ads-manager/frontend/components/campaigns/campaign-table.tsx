'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/helpers/api-client';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useCurrency } from '@/lib/hooks/use-currency';
import type { FacebookCampaign } from '@/types/facebook';

interface CampaignTableProps {
  campaigns: FacebookCampaign[];
  onRefresh: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CampaignTable({
  campaigns,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
}: CampaignTableProps) {
  // Money renders in the selected account's currency, not a hardcoded USD.
  const { format: formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<FacebookCampaign | null>(
    null
  );

  // Pause/Resume mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'ACTIVE' | 'PAUSED';
    }) => {
      return apiClient.patch(`/api/campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onRefresh();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
      onRefresh();
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      alert(error.message || 'Failed to delete campaign');
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/api/campaigns/${id}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onRefresh();
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ACTIVE: 'default',
      PAUSED: 'secondary',
      DELETED: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status.toLowerCase()}
      </Badge>
    );
  };

  const handleToggleStatus = (campaign: FacebookCampaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: campaign.id, status: newStatus });
  };

  const handleDelete = (campaign: FacebookCampaign) => {
    setSelectedCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDuplicate = (campaign: FacebookCampaign) => {
    duplicateMutation.mutate(campaign.id);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Objective</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Cost/Lead</TableHead>
              <TableHead className="text-right">ROAS</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id} data-testid={`campaign-row-${campaign.id}`}>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="font-medium hover:underline"
                    >
                      {campaign.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      ID: {campaign.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell>
                  <span className="text-sm capitalize">
                    {campaign.objective.replace('OUTCOME_', '').toLowerCase()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {campaign.dailyBudget
                    ? `${formatCurrency(campaign.dailyBudget)}/day`
                    : campaign.lifetimeBudget
                    ? formatCurrency(campaign.lifetimeBudget)
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {(campaign as any).insights?.spend
                    ? formatCurrency((campaign as any).insights.spend)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {(campaign as any).insights?.conversions
                    ? formatNumber((campaign as any).insights.conversions, 0)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {(campaign as any).insights?.cpa
                    ? formatCurrency((campaign as any).insights.cpa)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {/* Lead-gen campaigns book no revenue, so ROAS stays "-"
                      rather than a misleading 0.00 — read Cost/Lead instead. */}
                  {(campaign as any).insights?.roas
                    ? formatNumber((campaign as any).insights.roas, 2)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {(campaign as any).insights?.ctr
                    ? formatPercentage((campaign as any).insights.ctr)
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {/* Play/Pause Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(campaign)}
                      disabled={toggleStatusMutation.isPending}
                      data-testid={`toggle-status-${campaign.id}`}
                      title={
                        campaign.status === 'ACTIVE' ? 'Pause' : 'Resume'
                      }
                    >
                      {campaign.status === 'ACTIVE' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Edit Button */}
                    <Link href={`/dashboard/campaigns/${campaign.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        data-testid={`edit-${campaign.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Duplicate Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(campaign)}
                      disabled={duplicateMutation.isPending}
                      title="Duplicate"
                      data-testid={`duplicate-${campaign.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(campaign)}
                      disabled={deleteMutation.isPending}
                      title="Delete"
                      data-testid={`delete-${campaign.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCampaign?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedCampaign && deleteMutation.mutate(selectedCampaign.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
