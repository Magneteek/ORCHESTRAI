/**
 * Campaign React Query Hooks
 * Custom hooks for campaign data fetching and mutations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { FacebookCampaign, PaginatedResponse } from '@/types/facebook';
import type {
  CampaignListItem,
  CampaignListParams,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignPerformance,
} from '@/types/campaign';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  getCampaignPerformance,
} from '@/lib/api/campaigns';

// ==================== Query Keys ====================

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params: CampaignListParams) =>
    [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  performance: (id: string, dateRange?: { from: Date; to: Date }) =>
    [...campaignKeys.detail(id), 'performance', dateRange] as const,
};

// ==================== Campaign List Hook ====================

export function useCampaigns(
  params: CampaignListParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<CampaignListItem>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => getCampaigns(params),
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

// ==================== Single Campaign Hook ====================

export function useCampaign(
  campaignId: string,
  options?: Omit<UseQueryOptions<FacebookCampaign>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: campaignKeys.detail(campaignId),
    queryFn: () => getCampaign(campaignId),
    staleTime: 30000,
    ...options,
  });
}

// ==================== Campaign Performance Hook ====================

export function useCampaignPerformance(
  campaignId: string,
  dateRange?: { from: Date; to: Date },
  options?: Omit<UseQueryOptions<CampaignPerformance>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: campaignKeys.performance(campaignId, dateRange),
    queryFn: () => getCampaignPerformance(campaignId, dateRange),
    staleTime: 60000, // 1 minute
    ...options,
  });
}

// ==================== Create Campaign Mutation ====================

export function useCreateCampaign(
  options?: UseMutationOptions<
    FacebookCampaign,
    Error,
    CreateCampaignRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: (data, variables) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({
        queryKey: campaignKeys.lists(),
      });

      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create campaign');
    },
    ...options,
  });
}

// ==================== Update Campaign Mutation ====================

export function useUpdateCampaign(
  options?: UseMutationOptions<
    FacebookCampaign,
    Error,
    UpdateCampaignRequest
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaign,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update campaign');
    },
    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: campaignKeys.detail(variables.campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.lists(),
      });

      toast.success('Campaign updated successfully');
    },
    ...options,
  });
}

// ==================== Delete Campaign Mutation ====================

export function useDeleteCampaign(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: (data, campaignId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: campaignKeys.detail(campaignId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: campaignKeys.lists(),
      });

      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete campaign');
    },
    ...options,
  });
}

// ==================== Duplicate Campaign Mutation ====================

export function useDuplicateCampaign(
  options?: UseMutationOptions<
    FacebookCampaign,
    Error,
    { campaignId: string; newName: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, newName }) =>
      duplicateCampaign(campaignId, newName),
    onSuccess: () => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({
        queryKey: campaignKeys.lists(),
      });

      toast.success('Campaign duplicated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate campaign');
    },
    ...options,
  });
}

// ==================== Toggle Campaign Status ====================

export function useToggleCampaignStatus() {
  const updateMutation = useUpdateCampaign();

  return async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    await updateMutation.mutateAsync({
      campaignId,
      status: newStatus as any,
    });
  };
}
