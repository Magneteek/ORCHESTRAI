'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Target,
  DollarSign,
  Calendar,
  Eye,
} from 'lucide-react';
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
import { apiClient } from '@/lib/helpers/api-client';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  objective: z.string().min(1, 'Objective is required'),
  adAccountId: z.string().min(1, 'Ad account is required'),
  budgetType: z.enum(['daily', 'lifetime']),
  budget: z.number().min(1, 'Budget must be at least $1'),
  startTime: z.string().optional(),
  stopTime: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED']),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = [
  { id: 1, name: 'Objective', icon: Target },
  { id: 2, name: 'Budget', icon: DollarSign },
  { id: 3, name: 'Schedule', icon: Calendar },
  { id: 4, name: 'Review', icon: Eye },
];

const OBJECTIVES = [
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic', description: 'Send people to your website or app' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness', description: 'Increase brand awareness' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement', description: 'Get more engagement on your posts' },
  { value: 'OUTCOME_LEADS', label: 'Leads', description: 'Collect leads for your business' },
  { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion', description: 'Get more app installs or engagement' },
  { value: 'OUTCOME_SALES', label: 'Sales', description: 'Drive online or in-store sales' },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      budgetType: 'daily',
      status: 'PAUSED',
    },
  });

  // Fetch ad accounts
  const { data: adAccounts } = useQuery({
    queryKey: ['ad-accounts'],
    queryFn: () => apiClient.get('/api/ad-accounts'),
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: CampaignFormData) => {
      return apiClient.post('/api/campaigns', data);
    },
    onSuccess: (data: any) => {
      router.push(`/dashboard/campaigns/${data.id}`);
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formData = watch();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground">
          Follow the steps to create a new ad campaign
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  currentStep > step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="mt-2 text-sm font-medium">{step.name}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
          {/* Step 1: Objective */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Campaign Objective</h2>
                <p className="text-sm text-muted-foreground">
                  What do you want to achieve with this campaign?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Holiday Sale 2024"
                  data-testid="campaign-name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adAccountId">Ad Account</Label>
                <Select
                  value={formData.adAccountId}
                  onValueChange={(value) => setValue('adAccountId', value)}
                >
                  <SelectTrigger id="adAccountId">
                    <SelectValue placeholder="Select ad account" />
                  </SelectTrigger>
                  <SelectContent>
                    {(adAccounts as any)?.map((account: any) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.adAccountId && (
                  <p className="text-sm text-destructive">{errors.adAccountId.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Objective</Label>
                <div className="grid gap-3">
                  {OBJECTIVES.map((obj) => (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => setValue('objective', obj.value)}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        formData.objective === obj.value
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="font-medium">{obj.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {obj.description}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.objective && (
                  <p className="text-sm text-destructive">{errors.objective.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Budget</h2>
                <p className="text-sm text-muted-foreground">
                  Set your campaign budget
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Budget Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setValue('budgetType', 'daily')}
                      className={`rounded-lg border-2 p-4 ${
                        formData.budgetType === 'daily'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="font-medium">Daily Budget</div>
                      <div className="text-sm text-muted-foreground">
                        Spend per day
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('budgetType', 'lifetime')}
                      className={`rounded-lg border-2 p-4 ${
                        formData.budgetType === 'lifetime'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="font-medium">Lifetime Budget</div>
                      <div className="text-sm text-muted-foreground">
                        Total spend
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">
                    {formData.budgetType === 'daily' ? 'Daily' : 'Lifetime'} Budget
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      id="budget"
                      type="number"
                      {...register('budget', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                  {errors.budget && (
                    <p className="text-sm text-destructive">{errors.budget.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Schedule</h2>
                <p className="text-sm text-muted-foreground">
                  When should your campaign run?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time (Optional)</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...register('startTime')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stopTime">End Time (Optional)</Label>
                  <Input
                    id="stopTime"
                    type="datetime-local"
                    {...register('stopTime')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Initial Status</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setValue('status', 'PAUSED')}
                      className={`rounded-lg border-2 p-4 ${
                        formData.status === 'PAUSED'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="font-medium">Paused</div>
                      <div className="text-sm text-muted-foreground">
                        Create but don't activate
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('status', 'ACTIVE')}
                      className={`rounded-lg border-2 p-4 ${
                        formData.status === 'ACTIVE'
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="font-medium">Active</div>
                      <div className="text-sm text-muted-foreground">
                        Start running immediately
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Review & Create</h2>
                <p className="text-sm text-muted-foreground">
                  Review your campaign settings before creating
                </p>
              </div>

              <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Campaign Name
                  </div>
                  <div className="mt-1 font-medium">{formData.name}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Objective
                  </div>
                  <div className="mt-1 font-medium">
                    {OBJECTIVES.find((o) => o.value === formData.objective)?.label}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Budget
                  </div>
                  <div className="mt-1 font-medium">
                    ${formData.budget} ({formData.budgetType})
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <div className="mt-1 font-medium capitalize">
                    {formData.status.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
