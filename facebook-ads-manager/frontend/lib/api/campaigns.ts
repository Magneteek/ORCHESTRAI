/**
 * Campaign API Client
 * TanStack Query integration for campaign operations
 */

import type {
  FacebookCampaign,
  FacebookInsights,
  PaginatedResponse,
} from '@/types/facebook';
import type {
  CampaignListItem,
  CampaignListParams,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignPerformance,
} from '@/types/campaign';

const API_BASE = '/api/facebook';

// ==================== Campaign List ====================

export async function getCampaigns(
  params: CampaignListParams
): Promise<PaginatedResponse<CampaignListItem>> {
  const { accountId, filters, sort, page = 1, limit = 25 } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status?.length) {
    searchParams.append('status', filters.status.join(','));
  }

  if (filters?.objective?.length) {
    searchParams.append('objective', filters.objective.join(','));
  }

  if (filters?.search) {
    searchParams.append('search', filters.search);
  }

  if (filters?.dateRange) {
    searchParams.append('date_from', filters.dateRange.from.toISOString());
    searchParams.append('date_to', filters.dateRange.to.toISOString());
  }

  if (sort) {
    searchParams.append('sort_field', sort.field);
    searchParams.append('sort_direction', sort.direction);
  }

  const response = await fetch(
    `${API_BASE}/accounts/${accountId}/campaigns?${searchParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch campaigns');
  }

  return response.json();
}

// ==================== Single Campaign ====================

export async function getCampaign(
  campaignId: string
): Promise<FacebookCampaign> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch campaign');
  }

  return response.json();
}

// ==================== Create Campaign ====================

export async function createCampaign(
  data: CreateCampaignRequest
): Promise<FacebookCampaign> {
  const response = await fetch(
    `${API_BASE}/accounts/${data.accountId}/campaigns`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create campaign');
  }

  return response.json();
}

// ==================== Update Campaign ====================

export async function updateCampaign(
  data: UpdateCampaignRequest
): Promise<FacebookCampaign> {
  const { campaignId, ...updates } = data;

  const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update campaign');
  }

  return response.json();
}

// ==================== Delete Campaign ====================

export async function deleteCampaign(campaignId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete campaign');
  }
}

// ==================== Duplicate Campaign ====================

export async function duplicateCampaign(
  campaignId: string,
  newName: string
): Promise<FacebookCampaign> {
  const response = await fetch(
    `${API_BASE}/campaigns/${campaignId}/duplicate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to duplicate campaign');
  }

  return response.json();
}

// ==================== Campaign Performance ====================

export async function getCampaignPerformance(
  campaignId: string,
  dateRange?: { from: Date; to: Date }
): Promise<CampaignPerformance> {
  const searchParams = new URLSearchParams();

  if (dateRange) {
    searchParams.append('date_from', dateRange.from.toISOString());
    searchParams.append('date_to', dateRange.to.toISOString());
  }

  const response = await fetch(
    `${API_BASE}/campaigns/${campaignId}/insights?${searchParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch campaign performance');
  }

  return response.json();
}

// ==================== Bulk Operations ====================

export async function bulkUpdateCampaigns(
  updates: Array<{ campaignId: string; status: string }>
): Promise<FacebookCampaign[]> {
  const response = await fetch(`${API_BASE}/campaigns/bulk-update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to bulk update campaigns');
  }

  return response.json();
}
