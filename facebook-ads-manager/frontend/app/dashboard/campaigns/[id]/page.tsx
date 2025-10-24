'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Copy, Play, Pause, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/helpers/api-client';
import { toast } from 'sonner';
import type { FacebookCampaign } from '@/types/facebook';

interface CampaignFormData {
  name: string;
  objective: string;
  status: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  bidStrategy: string;
  startTime?: string;
  endTime?: string;
  specialAdCategories?: string[];
}

export default function CampaignEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
  });

  const [isDirty, setIsDirty] = useState(false);

  // Fetch campaign data
  const { data: campaign, isLoading } = useQuery<FacebookCampaign>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const data = await apiClient.get<FacebookCampaign>(`/api/campaigns/${campaignId}`);
      // Initialize form with campaign data
      setFormData({
        name: data.name,
        objective: data.objective,
        status: data.status,
        dailyBudget: data.dailyBudget,
        lifetimeBudget: data.lifetimeBudget,
        bidStrategy: data.bidStrategy || 'LOWEST_COST_WITHOUT_CAP',
        startTime: data.startTime,
        endTime: data.stopTime,
        specialAdCategories: data.specialAdCategories || [],
      });
      return data;
    },
    enabled: campaignId !== 'new',
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      return apiClient.put(`/api/campaigns/${campaignId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsDirty(false);
      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update campaign');
    },
  });

  // Duplicate campaign mutation
  const duplicateMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/campaigns/${campaignId}/duplicate`, {});
    },
    onSuccess: (newCampaign: any) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated successfully');
      router.push(`/dashboard/campaigns/${newCampaign.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to duplicate campaign');
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/api/campaigns/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
      router.push('/dashboard/campaigns');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete campaign');
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiClient.patch(`/api/campaigns/${campaignId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleDuplicate = () => {
    if (confirm('Duplicate this campaign?')) {
      duplicateMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleStatusToggle = () => {
    const newStatus = campaign?.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    statusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="icon" aria-label="Back to campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {campaign?.name || 'New Campaign'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={campaign?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {campaign?.status || 'Draft'}
              </Badge>
              {campaign?.id && (
                <span className="text-xs text-muted-foreground">
                  ID: {campaign.id}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {campaign?.status && (
            <Button
              variant="outline"
              onClick={handleStatusToggle}
              disabled={statusMutation.isPending}
            >
              {campaign.status === 'ACTIVE' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isDirty || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Warning for unsaved changes */}
      {isDirty && (
        <Card className="border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">You have unsaved changes</p>
          </div>
        </Card>
      )}

      {/* Campaign Editor Form */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="budget">Budget & Schedule</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="objective">Campaign Objective *</Label>
                  <select
                    id="objective"
                    value={formData.objective}
                    onChange={(e) => handleFieldChange('objective', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="OUTCOME_TRAFFIC">Traffic</option>
                    <option value="OUTCOME_ENGAGEMENT">Engagement</option>
                    <option value="OUTCOME_LEADS">Leads</option>
                    <option value="OUTCOME_SALES">Sales</option>
                    <option value="OUTCOME_AWARENESS">Awareness</option>
                    <option value="OUTCOME_APP_PROMOTION">App Promotion</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose the main goal for this campaign
                  </p>
                </div>

                <div>
                  <Label htmlFor="bidStrategy">Bid Strategy</Label>
                  <select
                    id="bidStrategy"
                    value={formData.bidStrategy}
                    onChange={(e) => handleFieldChange('bidStrategy', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="LOWEST_COST_WITHOUT_CAP">Lowest Cost</option>
                    <option value="COST_CAP">Cost Cap</option>
                    <option value="LOWEST_COST_WITH_BID_CAP">Bid Cap</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Budget & Schedule Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Budget Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dailyBudget">Daily Budget ($)</Label>
                  <Input
                    id="dailyBudget"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.dailyBudget || ''}
                    onChange={(e) =>
                      handleFieldChange('dailyBudget', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="lifetimeBudget">Lifetime Budget ($)</Label>
                  <Input
                    id="lifetimeBudget"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.lifetimeBudget || ''}
                    onChange={(e) =>
                      handleFieldChange('lifetimeBudget', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leave empty for unlimited
                  </p>
                </div>

                <div>
                  <Label htmlFor="startTime">Start Date</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime || ''}
                    onChange={(e) => handleFieldChange('startTime', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Date</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime || ''}
                    onChange={(e) => handleFieldChange('endTime', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leave empty to run continuously
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Advanced Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label>Special Ad Categories</Label>
                  <div className="mt-2 space-y-2">
                    {['HOUSING', 'EMPLOYMENT', 'CREDIT'].map((category) => (
                      <label key={category} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.specialAdCategories?.includes(category)}
                          onChange={(e) => {
                            const current = formData.specialAdCategories || [];
                            handleFieldChange(
                              'specialAdCategories',
                              e.target.checked
                                ? [...current, category]
                                : current.filter((c) => c !== category)
                            );
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Select if your ads relate to these regulated categories
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Campaign Performance</h2>
              <p className="text-sm text-muted-foreground">
                Performance metrics will be available here once insights integration is added.
                Metrics include impressions, clicks, spend, and CTR data from the Facebook Insights API.
              </p>
              {/* TODO: Add insights query to fetch campaign performance metrics
                  - Impressions
                  - Clicks
                  - Spend
                  - CTR (Click-Through Rate)
                  Use the /api/campaigns/[id]/insights endpoint
              */}
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
