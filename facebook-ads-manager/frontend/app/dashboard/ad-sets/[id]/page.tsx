'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Target, Calendar, Zap, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/hooks/use-currency';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/helpers/api-client';

const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_TRAFFIC: 'Traffic',
  OUTCOME_ENGAGEMENT: 'Engagement',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_SALES: 'Sales',
  OUTCOME_AWARENESS: 'Awareness',
  OUTCOME_APP_PROMOTION: 'App Promotion',
};

const OPTIMIZATION_GOAL_LABELS: Record<string, string> = {
  LINK_CLICKS: 'Link Clicks',
  LANDING_PAGE_VIEWS: 'Landing Page Views',
  REACH: 'Reach',
  IMPRESSIONS: 'Impressions',
  LEAD_GENERATION: 'Lead Generation',
  CONVERSIONS: 'Conversions',
  VALUE: 'Value (ROAS)',
  POST_ENGAGEMENT: 'Post Engagement',
  PAGE_LIKES: 'Page Likes',
  VIDEO_VIEWS: 'Video Views',
  THRUPLAY: 'ThruPlay',
  APP_INSTALLS: 'App Installs',
};

export default function AdSetDetailPage() {
  const { format: formatCurrency } = useCurrency();
  const params = useParams();
  const router = useRouter();
  const adSetId = params.id as string;

  const { data: adSet, isLoading, error } = useQuery<any>({
    queryKey: ['ad-set', adSetId],
    queryFn: () => apiClient.get<any>(`/api/ad-sets/${adSetId}`),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading ad set...</p>
        </div>
      </div>
    );
  }

  if (error || !adSet) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Ad set not found.</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/ad-sets')}>
            Back to Ad Sets
          </Button>
        </div>
      </div>
    );
  }

  const targeting = adSet.targeting as Record<string, any> || {};
  const geoLocations = targeting.geo_locations || {};
  const countries = geoLocations.countries?.join(', ') || '—';
  const ageMin = targeting.age_min ?? '—';
  const ageMax = targeting.age_max ?? '—';
  const genders = targeting.genders;
  const genderLabel = !genders || genders.length === 0 ? 'All' : genders.includes(1) && genders.includes(2) ? 'All' : genders.includes(1) ? 'Men' : 'Women';
  const advantageAudience = targeting.targeting_automation?.advantage_audience;
  const isDynamicCreative = adSet.isDynamicCreative;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/ad-sets">
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{adSet.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={adSet.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {adSet.status}
              </Badge>
              {adSet.campaign && (
                <span className="text-sm text-muted-foreground">
                  Campaign: <Link href={`/dashboard/campaigns/${adSet.campaign?.id}`} className="underline underline-offset-2">{adSet.campaign?.name}</Link>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/ads/new?adSetId=${adSetId}`}>
            <Button>Create Ad</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Delivery */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Delivery</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Optimization Goal</dt>
              <dd className="font-medium">{OPTIMIZATION_GOAL_LABELS[adSet.optimizationGoal] || adSet.optimizationGoal || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Billing Event</dt>
              <dd className="font-medium">{adSet.billingEvent === 'IMPRESSIONS' ? 'Per 1,000 Impressions (CPM)' : adSet.billingEvent || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Dynamic Creative</dt>
              <dd className="font-medium">{isDynamicCreative ? 'On' : 'Off'}</dd>
            </div>
          </dl>
        </Card>

        {/* Budget */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Budget & Schedule</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Budget</dt>
              <dd className="font-medium">
                {adSet.budget ? formatCurrency(adSet.budget) : 'Campaign-level (CBO)'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Start</dt>
              <dd className="font-medium">{adSet.startTime ? new Date(adSet.startTime).toLocaleDateString() : 'Immediately'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">End</dt>
              <dd className="font-medium">{adSet.endTime ? new Date(adSet.endTime).toLocaleDateString() : 'No end date'}</dd>
            </div>
          </dl>
        </Card>

        {/* Audience */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Audience</h2>
            {advantageAudience === 1 && (
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                <Zap className="h-3 w-3" />
                Advantage+ On
              </div>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Locations</dt>
              <dd className="mt-1 font-medium">{countries}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Age Range</dt>
              <dd className="mt-1 font-medium">{ageMin} – {ageMax}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="mt-1 font-medium">{genderLabel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Advantage+ Audience</dt>
              <dd className="mt-1 font-medium">{advantageAudience === 1 ? 'Enabled' : 'Disabled'}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Ads in this ad set */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Ads</h2>
          <Link href={`/dashboard/ads/new?adSetId=${adSetId}`}>
            <Button size="sm">+ New Ad</Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">No ads yet. Create your first ad for this ad set.</p>
      </Card>
    </div>
  );
}
