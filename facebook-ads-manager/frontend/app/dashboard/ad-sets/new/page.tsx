'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAdAccount } from '@/lib/hooks/use-ad-account';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Check, Loader2, Target, Users, Calendar, Eye, Info, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const adSetSchema = z.object({
  campaignId: z.string().min(1, 'Campaign is required'),
  name: z.string().min(1, 'Ad set name is required'),
  pageId: z.string().optional(),
  budgetType: z.enum(['daily', 'lifetime']),
  budget: z.number().min(1, 'Budget must be at least $1').optional(),
  bidAmount: z.number().positive('Bid cap must be a positive number').optional(),
  optimizationGoal: z.string().min(1, 'Optimization goal is required'),
  billingEvent: z.string().min(1, 'Billing event is required'),
  status: z.enum(['ACTIVE', 'PAUSED']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  // Audience controls (hard limits — always enforced)
  countries: z.string().optional(),
  ageMin: z.number().min(13).max(65).optional(),
  languages: z.string().optional(),
  // Audience suggestions (respected when Advantage+ off; hints when on)
  ageMax: z.number().min(13).max(65).optional(),
  genders: z.array(z.number()).optional(),
  // Advantage+ Audience
  advantageAudience: z.boolean().optional(),
  // Dynamic Creative — Facebook auto-combines media + text variants
  dynamicCreative: z.boolean().optional(),
});

type AdSetFormData = z.infer<typeof adSetSchema>;

const STEPS = [
  { id: 1, name: 'Campaign', icon: Target },
  { id: 2, name: 'Audience', icon: Users },
  { id: 3, name: 'Budget', icon: Calendar },
  { id: 4, name: 'Review', icon: Eye },
];

const OBJECTIVE_GOALS: Record<string, { value: string; label: string }[]> = {
  OUTCOME_TRAFFIC: [
    { value: 'LINK_CLICKS', label: 'Link Clicks' },
    { value: 'LANDING_PAGE_VIEWS', label: 'Landing Page Views' },
    { value: 'REACH', label: 'Reach' },
    { value: 'IMPRESSIONS', label: 'Impressions' },
  ],
  OUTCOME_ENGAGEMENT: [
    { value: 'POST_ENGAGEMENT', label: 'Post Engagement' },
    { value: 'REACH', label: 'Reach' },
    { value: 'IMPRESSIONS', label: 'Impressions' },
    { value: 'PAGE_LIKES', label: 'Page Likes' },
  ],
  OUTCOME_LEADS: [
    { value: 'LEAD_GENERATION', label: 'Lead Generation' },
    { value: 'QUALITY_LEAD', label: 'Quality Lead' },
    { value: 'LINK_CLICKS', label: 'Link Clicks' },
    { value: 'OFFSITE_CONVERSIONS', label: 'Conversions' },
  ],
  OUTCOME_SALES: [
    { value: 'OFFSITE_CONVERSIONS', label: 'Conversions' },
    { value: 'VALUE', label: 'Value (ROAS)' },
    { value: 'LINK_CLICKS', label: 'Link Clicks' },
  ],
  OUTCOME_AWARENESS: [
    { value: 'REACH', label: 'Reach' },
    { value: 'IMPRESSIONS', label: 'Impressions' },
    { value: 'THRUPLAY', label: 'ThruPlay (Video)' },
    { value: 'AD_RECALL_LIFT', label: 'Ad Recall Lift' },
  ],
  OUTCOME_APP_PROMOTION: [
    { value: 'APP_INSTALLS', label: 'App Installs' },
    { value: 'LINK_CLICKS', label: 'Link Clicks' },
  ],
};

const GOAL_BILLING_EVENT: Record<string, string> = {
  LINK_CLICKS: 'IMPRESSIONS',
  LANDING_PAGE_VIEWS: 'IMPRESSIONS',
  REACH: 'IMPRESSIONS',
  IMPRESSIONS: 'IMPRESSIONS',
  LEAD_GENERATION: 'IMPRESSIONS',
  QUALITY_LEAD: 'IMPRESSIONS',
  OFFSITE_CONVERSIONS: 'IMPRESSIONS',
  VALUE: 'IMPRESSIONS',
  POST_ENGAGEMENT: 'IMPRESSIONS',
  PAGE_LIKES: 'IMPRESSIONS',
  THRUPLAY: 'THRUPLAY',
  AD_RECALL_LIFT: 'IMPRESSIONS',
  APP_INSTALLS: 'IMPRESSIONS',
};

const BILLING_EVENT_LABELS: Record<string, string> = {
  IMPRESSIONS: 'Per 1,000 Impressions (CPM)',
  THRUPLAY: 'ThruPlay',
};

const OBJECTIVE_LABELS: Record<string, string> = {
  OUTCOME_TRAFFIC: 'Traffic',
  OUTCOME_ENGAGEMENT: 'Engagement',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_SALES: 'Sales',
  OUTCOME_AWARENESS: 'Awareness',
  OUTCOME_APP_PROMOTION: 'App Promotion',
};

// Facebook locale IDs — verified from Facebook's adlocale search API
// GET /{version}/search?type=adlocale&q=<language>
const LANGUAGES = [
  { code: 'ALL', label: 'All languages' },
  { code: '6',  label: 'English (US)' },
  { code: '24', label: 'English (UK)' },
  { code: '25', label: 'Spanish (Spain)' },
  { code: '26', label: 'Spanish (Latin America)' },
  { code: '7',  label: 'French' },
  { code: '5',  label: 'German' },
  { code: '8',  label: 'Italian' },
  { code: '10', label: 'Dutch' },
  { code: '9',  label: 'Portuguese (Brazil)' },
  { code: '14', label: 'Portuguese (Portugal)' },
  { code: '15', label: 'Russian' },
  { code: '28', label: 'Arabic' },
  { code: '16', label: 'Swedish' },
  { code: '17', label: 'Polish' },
  { code: '37', label: 'Norwegian' },
  { code: '43', label: 'Finnish' },
  { code: '57', label: 'Danish' },
  { code: '45', label: 'Chinese (Simplified)' },
  { code: '46', label: 'Chinese (Traditional)' },
  { code: '13', label: 'Japanese' },
  { code: '12', label: 'Korean' },
  { code: '44', label: 'Hindi' },
  { code: '1',  label: 'Indonesian' },
  { code: '18', label: 'Turkish' },
  { code: '34', label: 'Slovenian' },
];

export default function NewAdSetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedAccountId } = useAdAccount();
  const preselectedCampaignId = searchParams.get('campaignId') || '';
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AdSetFormData>({
    resolver: zodResolver(adSetSchema),
    defaultValues: {
      campaignId: preselectedCampaignId,
      budgetType: 'daily',
      status: 'PAUSED',
      ageMin: 18,
      ageMax: 65,
      genders: [],
      countries: 'US',
      languages: 'ALL',
      advantageAudience: false,
      dynamicCreative: false,
    },
  });

  const formData = watch();

  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns-for-adset', selectedAccountId],
    queryFn: async () => {
      if (!selectedAccountId) return [];
      const res = await fetch(`/api/campaigns?adAccountId=${selectedAccountId}&limit=100`);
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!selectedAccountId,
  });

  const activeCampaigns = (campaignsData || []).filter((c: any) => c.status !== 'DELETED');
  const selectedCampaign = activeCampaigns.find((c: any) => c.id === formData.campaignId) || null;
  const campaignObjective: string = selectedCampaign?.objective || '';
  const campaignHasCBO = !!(selectedCampaign?.dailyBudget || selectedCampaign?.lifetimeBudget);
  const campaignBidStrategy: string = selectedCampaign?.bidStrategy || '';
  const bidCapRequired = campaignBidStrategy === 'LOWEST_COST_WITH_BID_CAP' || campaignBidStrategy === 'COST_CAP';
  const rawGoals = OBJECTIVE_GOALS[campaignObjective] || Object.values(OBJECTIVE_GOALS).flat();
  const availableGoals = rawGoals.filter((g, i, arr) => arr.findIndex(x => x.value === g.value) === i);

  // Objectives that require a Facebook Page as the promoted object
  const PAGE_REQUIRED_OBJECTIVES = new Set(['LEADS', 'OUTCOME_LEADS', 'ENGAGEMENT', 'OUTCOME_ENGAGEMENT', 'AWARENESS', 'OUTCOME_AWARENESS']);
  const needsPageId = PAGE_REQUIRED_OBJECTIVES.has(campaignObjective);

  // Fetch available pages for the selected ad account
  const { data: pagesData } = useQuery({
    queryKey: ['pages-for-adset', selectedAccountId],
    queryFn: async () => {
      if (!selectedAccountId) return [];
      const res = await fetch(`/api/facebook/pages?adAccountId=${selectedAccountId}`);
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!selectedAccountId && needsPageId,
  });

  // Fetch existing ad sets for the selected campaign so we can detect the locked optimization goal
  const { data: existingAdSets } = useQuery({
    queryKey: ['existing-adsets-for-campaign', formData.campaignId],
    queryFn: async () => {
      if (!formData.campaignId) return [];
      const res = await fetch(`/api/ad-sets?campaignId=${formData.campaignId}&limit=10`);
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!formData.campaignId,
  });

  // When campaign uses Lowest Cost, all ad sets must share the same optimization goal
  const lockedGoal: string | null = (() => {
    if (!existingAdSets?.length) return null;
    const firstGoal = existingAdSets[0]?.optimizationGoal;
    return firstGoal || null;
  })();

  useEffect(() => {
    if (!campaignObjective) return;
    // If the campaign locks us to a specific goal, use that
    if (lockedGoal) {
      setValue('optimizationGoal', lockedGoal);
      return;
    }
    const goals = OBJECTIVE_GOALS[campaignObjective];
    if (goals && !goals.find(g => g.value === formData.optimizationGoal)) {
      setValue('optimizationGoal', goals[0]?.value || '');
    }
  }, [campaignObjective, lockedGoal]);

  useEffect(() => {
    if (formData.optimizationGoal) {
      setValue('billingEvent', GOAL_BILLING_EVENT[formData.optimizationGoal] || 'IMPRESSIONS');
    }
  }, [formData.optimizationGoal]);

  const createAdSetMutation = useMutation({
    mutationFn: async (data: AdSetFormData) => {
      const targeting: Record<string, any> = {
        geo_locations: {
          countries: data.countries?.split(',').map(c => c.trim()).filter(Boolean) || ['US'],
        },
        age_min: data.ageMin ?? 18,
        targeting_automation: { advantage_audience: data.advantageAudience ? 1 : 0 },
      };
      // Age max and gender are suggestions when Advantage+ is on, hard controls when off
      if (data.ageMax) targeting.age_max = data.ageMax;
      if (data.genders && data.genders.length > 0) targeting.genders = data.genders;
      if (data.languages && data.languages !== 'ALL') targeting.locales = [parseInt(data.languages, 10)];

      const body: any = {
        campaignId: data.campaignId,
        name: data.name,
        status: data.status,
        pageId: data.pageId || undefined,
        optimizationGoal: data.optimizationGoal,
        billingEvent: data.billingEvent,
        targeting,
        dynamicCreative: data.dynamicCreative ?? false,
        startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
        endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
      };
      if (!campaignHasCBO && data.budget && !isNaN(data.budget)) {
        if (data.budgetType === 'daily') body.dailyBudget = data.budget;
        else body.lifetimeBudget = data.budget;
      }
      if (data.bidAmount && !isNaN(data.bidAmount)) {
        body.bidAmount = data.bidAmount;
      } else if (bidCapRequired) {
        throw new Error('Bid cap is required for this campaign\'s bid strategy. Go back to Step 3 and enter a bid cap amount.');
      }
      const res = await fetch('/api/ad-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to create ad set');
      return json.data;
    },
    onSuccess: () => router.push('/dashboard/ad-sets'),
  });

  const onSubmit = (data: AdSetFormData) => createAdSetMutation.mutate(data);

  const STEP_FIELDS: Record<number, (keyof AdSetFormData)[]> = {
    1: ['name', 'campaignId', 'optimizationGoal', 'billingEvent'],
    2: ['countries', 'ageMin'],
    3: campaignHasCBO ? (bidCapRequired ? ['bidAmount'] : []) : (bidCapRequired ? ['budget', 'bidAmount'] : ['budget']),
  };

  const nextStep = async () => {
    if (currentStep >= STEPS.length) return;
    const fields = STEP_FIELDS[currentStep];
    const valid = fields && fields.length > 0 ? await trigger(fields) : true;
    if (valid) setCurrentStep(s => s + 1);
  };
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const advantageOn = formData.advantageAudience;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Ad Set</h1>
        <p className="text-muted-foreground">Set up targeting and budget for your ads</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep > step.id ? 'border-primary bg-primary text-primary-foreground'
                : currentStep === step.id ? 'border-primary text-primary'
                : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className="mt-2 text-sm font-medium">{step.name}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`mx-4 h-0.5 flex-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <div>
        <Card className="p-6">

          {/* Step 1: Campaign & Goals */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Campaign & Objectives</h2>
                <p className="text-sm text-muted-foreground">Link to a campaign — available goals are filtered by its objective</p>
              </div>
              <div className="space-y-2">
                <Label>Ad Set Name</Label>
                <Input {...register('name')} placeholder="e.g., ES Women 20-30" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Campaign</Label>
                <Select value={formData.campaignId} onValueChange={v => setValue('campaignId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select a campaign" /></SelectTrigger>
                  <SelectContent>
                    {activeCampaigns.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.campaignId && <p className="text-sm text-destructive">{errors.campaignId.message}</p>}
              </div>

              {selectedCampaign && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <div className="space-y-0.5 text-blue-800 dark:text-blue-200">
                      <p><span className="font-medium">Objective:</span> {OBJECTIVE_LABELS[selectedCampaign.objective] || selectedCampaign.objective}</p>
                      {campaignHasCBO
                        ? <p><span className="font-medium">Budget:</span> Campaign-level (${selectedCampaign.dailyBudget ?? selectedCampaign.lifetimeBudget}/day) — no ad set budget needed</p>
                        : <p><span className="font-medium">Budget:</span> Set per ad set</p>
                      }
                    </div>
                  </div>
                </div>
              )}

              {needsPageId && (
                <div className="space-y-2">
                  <Label>Facebook Page <span className="text-destructive">*</span></Label>
                  <Select value={formData.pageId || ''} onValueChange={v => setValue('pageId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a Facebook Page" /></SelectTrigger>
                    <SelectContent>
                      {(pagesData || []).map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Required so Facebook can connect this ad set to your Page as the promoted object.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Optimization Goal
                  {lockedGoal && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </Label>
                {lockedGoal ? (
                  <div className="flex items-center gap-2 h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {availableGoals.find(g => g.value === lockedGoal)?.label || lockedGoal}
                  </div>
                ) : (
                  <Select value={formData.optimizationGoal} onValueChange={v => setValue('optimizationGoal', v)}>
                    <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                    <SelectContent>
                      {availableGoals.map(g => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {lockedGoal && (
                  <p className="text-xs text-amber-600 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    This campaign uses the Lowest Cost bid strategy. All ad sets must share the same optimization goal as existing ad sets.
                  </p>
                )}
                {errors.optimizationGoal && <p className="text-sm text-destructive">{errors.optimizationGoal.message}</p>}
              </div>

              {formData.optimizationGoal && (
                <div className="space-y-2">
                  <Label>Billing Event</Label>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {BILLING_EVENT_LABELS[formData.billingEvent] || formData.billingEvent || '—'}
                    </span>
                    <span className="text-xs text-muted-foreground">Auto-set by optimization goal</span>
                  </div>
                </div>
              )}

              {/* Dynamic Creative */}
              <div className={`rounded-lg border-2 p-4 transition-colors ${formData.dynamicCreative ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">Dynamic Creative</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formData.dynamicCreative
                        ? 'Facebook will automatically create combinations of your media and text to find the best-performing variants.'
                        : 'Off — you control the exact creative. Enable to let Facebook auto-test combinations of images, headlines and CTAs.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.dynamicCreative}
                    onClick={() => setValue('dynamicCreative', !formData.dynamicCreative)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${formData.dynamicCreative ? 'bg-primary' : 'bg-input'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${formData.dynamicCreative ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Audience</h2>
                <p className="text-sm text-muted-foreground">Define who sees your ads</p>
              </div>

              {/* Advantage+ toggle */}
              <div className={`rounded-lg border-2 p-4 transition-colors ${advantageOn ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Zap className={`mt-0.5 h-5 w-5 shrink-0 ${advantageOn ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">Advantage+ Audience</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {advantageOn
                          ? 'Facebook will expand beyond your age, gender and detailed targeting to find more people likely to convert. Location and minimum age remain as hard limits.'
                          : 'Facebook uses exactly your targeting settings. Enable to let Facebook auto-expand for better performance.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={advantageOn}
                    onClick={() => setValue('advantageAudience', !advantageOn)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${advantageOn ? 'bg-primary' : 'bg-input'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${advantageOn ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Controls — always hard limits */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Controls</h3>
                  {advantageOn && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hard limits — always enforced</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Locations</Label>
                  <Input {...register('countries')} placeholder="US, ES, GB, DE" />
                  <p className="text-xs text-muted-foreground">Comma-separated ISO country codes (e.g. US, ES, GB)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Age</Label>
                    <Input type="number" min={13} max={65} {...register('ageMin', { valueAsNumber: true })} />
                    <p className="text-xs text-muted-foreground">Facebook minimum is 13</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={formData.languages ?? 'ALL'} onValueChange={v => setValue('languages', v)}>
                      <SelectTrigger><SelectValue placeholder="All languages" /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => (
                          <SelectItem key={l.code || 'all'} value={l.code}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Suggestions — respected as-is when Advantage+ off, hints when on */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {advantageOn ? 'Suggestions' : 'Targeting'}
                  </h3>
                  {advantageOn && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Facebook may reach beyond these</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Maximum Age{advantageOn ? ' (suggestion)' : ''}</Label>
                  <Input type="number" min={13} max={65} {...register('ageMax', { valueAsNumber: true })} />
                </div>

                <div className="space-y-2">
                  <Label>Gender{advantageOn ? ' (suggestion)' : ''}</Label>
                  <div className="flex gap-3">
                    {[{ label: 'All', value: [] }, { label: 'Men', value: [1] }, { label: 'Women', value: [2] }].map(g => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => setValue('genders', g.value)}
                        className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
                          JSON.stringify(formData.genders) === JSON.stringify(g.value)
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {advantageOn && (
                    <p className="text-xs text-muted-foreground">Facebook may show ads outside this gender selection if it improves performance.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Schedule */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Budget & Schedule</h2>
              </div>

              {campaignHasCBO ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">Budget managed at campaign level</p>
                      <p className="mt-1">This campaign uses Campaign Budget Optimization — Facebook distributes the ${selectedCampaign?.dailyBudget ?? selectedCampaign?.lifetimeBudget}/day budget across ad sets automatically.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Budget Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {(['daily', 'lifetime'] as const).map(type => (
                        <button key={type} type="button" onClick={() => setValue('budgetType', type)}
                          className={`rounded-lg border-2 p-4 ${formData.budgetType === type ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                          <div className="font-medium capitalize">{type} Budget</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget Amount ($)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" min="1" step="0.01" placeholder="0.00" className="pl-7"
                        {...register('budget', { valueAsNumber: true })} />
                    </div>
                    {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>
                  Bid Cap
                  {bidCapRequired ? <span className="ml-1 text-destructive">*</span> : <span className="ml-1 text-muted-foreground text-xs">(optional)</span>}
                </Label>
                {bidCapRequired && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    Required — your campaign uses <strong>{campaignBidStrategy === 'COST_CAP' ? 'Cost Cap' : 'Bid Cap'}</strong> strategy. Every ad set must have a bid cap.
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input type="number" min="0.01" step="0.01" placeholder="0.00" className="pl-7"
                    {...register('bidAmount', { setValueAs: (v) => v === '' || v == null ? undefined : parseFloat(v) })} />
                </div>
                {!bidCapRequired && (
                  <p className="text-xs text-muted-foreground">
                    Leave blank for Lowest Cost (no cap).
                  </p>
                )}
                {errors.bidAmount && <p className="text-sm text-destructive">{errors.bidAmount.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date (Optional)</Label>
                  <Input type="datetime-local" {...register('startTime')} />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input type="datetime-local" {...register('endTime')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Initial Status</Label>
                <div className="grid grid-cols-2 gap-4">
                  {(['PAUSED', 'ACTIVE'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setValue('status', s)}
                      className={`rounded-lg border-2 p-4 ${formData.status === s ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                      <div className="font-medium capitalize">{s.toLowerCase()}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Review & Create</h2>
              </div>
              {createAdSetMutation.isError && (() => {
                const msg = createAdSetMutation.error instanceof Error ? createAdSetMutation.error.message : 'Failed to create ad set';
                const isNarrowAudience = msg.toLowerCase().includes('broaden') || msg.toLowerCase().includes('audience');
                const isSameOptimizationRequired = msg.toLowerCase().includes('same optimization') || msg.toLowerCase().includes('optimization for ad delivery');
                const lockedGoalLabel = availableGoals.find(g => g.value === lockedGoal)?.label || lockedGoal;
                return (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive space-y-3">
                    <p className="font-medium">{msg}</p>
                    {isSameOptimizationRequired && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">This campaign&apos;s existing ad sets use a different optimization goal.</p>
                        <p className="text-xs text-destructive/80">
                          {lockedGoalLabel
                            ? <>Change your optimization goal to <strong>{lockedGoalLabel}</strong> to match the existing ad sets, or duplicate the campaign to use a different goal.</>
                            : <>All ad sets in a Lowest Cost campaign must use the same optimization goal. Go back to Step 1 and select the same goal as your existing ad sets.</>
                          }
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="mt-1 rounded-md border border-destructive/40 bg-white px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 dark:bg-transparent"
                        >
                          ← Fix Optimization Goal (Step 1)
                        </button>
                      </div>
                    )}
                    {isNarrowAudience && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium">To fix this, broaden your audience in Step 2:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside text-destructive/80">
                          <li>Change Gender to <strong>All</strong></li>
                          <li>Widen the age range (e.g. 35–65)</li>
                          <li>Set Language to <strong>All languages</strong></li>
                          <li>Add more countries (e.g. SI, HR, AT)</li>
                        </ul>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="mt-1 rounded-md border border-destructive/40 bg-white px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 dark:bg-transparent"
                        >
                          ← Fix Audience (Step 2)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
              {Object.keys(errors).length > 0 && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive space-y-1">
                  <p className="font-medium">Please fix the following:</p>
                  {Object.entries(errors).map(([field, err]) => (
                    <p key={field}>• {(err as any)?.message || field}</p>
                  ))}
                </div>
              )}
              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                {[
                  { label: 'Campaign', value: selectedCampaign?.name },
                  { label: 'Objective', value: OBJECTIVE_LABELS[campaignObjective] || campaignObjective },
                  { label: 'Name', value: formData.name },
                  needsPageId ? { label: 'Facebook Page', value: (pagesData || []).find((p: any) => p.id === formData.pageId)?.name || formData.pageId || '(none)' } : null,
                  { label: 'Advantage+ Audience', value: advantageOn ? 'Enabled' : 'Disabled' },
                  { label: 'Dynamic Creative', value: formData.dynamicCreative ? 'On' : 'Off' },
                  { label: 'Optimization Goal', value: availableGoals.find(g => g.value === formData.optimizationGoal)?.label },
                  { label: 'Billing Event', value: BILLING_EVENT_LABELS[formData.billingEvent] || formData.billingEvent },
                  campaignHasCBO
                    ? { label: 'Budget', value: `Campaign-level CBO ($${selectedCampaign?.dailyBudget ?? selectedCampaign?.lifetimeBudget}/day)` }
                    : { label: 'Budget', value: formData.budget && !isNaN(formData.budget) ? `$${formData.budget} (${formData.budgetType})` : undefined },
                  { label: 'Locations', value: formData.countries },
                  { label: 'Age Range', value: `${formData.ageMin} – ${formData.ageMax}` },
                  { label: 'Gender', value: !formData.genders?.length ? 'All' : formData.genders.includes(1) && formData.genders.includes(2) ? 'All' : formData.genders.includes(1) ? 'Men' : 'Women' },
                  { label: 'Language', value: LANGUAGES.find(l => l.code === (formData.languages || 'ALL'))?.label || 'All languages' },
                  { label: 'Bid Cap', value: formData.bidAmount && !isNaN(formData.bidAmount) ? `$${formData.bidAmount}` : undefined },
                  { label: 'Status', value: formData.status?.toLowerCase() },
                ].filter((item): item is { label: string; value: any } => item !== null).map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className={`text-sm font-medium ${!value ? 'text-destructive' : ''}`}>{value || 'Not set'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={() => handleSubmit(onSubmit)()} disabled={createAdSetMutation.isPending}>
                {createAdSetMutation.isPending
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                  : <><Check className="mr-2 h-4 w-4" />Create Ad Set</>
                }
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
