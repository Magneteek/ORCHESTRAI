'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { LaunchProgress } from '@/components/campaigns/launch-progress';
import { LaunchNavigation } from '@/components/campaigns/launch-navigation';
import { TemplateSelector } from '@/components/campaigns/template-selector';
import { DynamicFieldsForm } from '@/components/campaigns/dynamic-fields-form';
import { TargetingBudgetForm } from '@/components/campaigns/targeting-budget-form';
import { CampaignTemplatePreview } from '@/components/campaigns/campaign-template-preview';
import { apiClient } from '@/lib/helpers/api-client';
import { parseFieldDefinitions } from '@/lib/templates/dynamic-fields';
import type { AdTemplate } from '@prisma/client';
import type { TargetingConfig, BudgetConfig } from '@/lib/templates/launch';

const STEPS = [
  { id: 1, title: 'Select Template' },
  { id: 2, title: 'Fill Fields' },
  { id: 3, title: 'Configure' },
  { id: 4, title: 'Preview' },
];

interface TemplatesResponse {
  data: (AdTemplate & {
    performanceAggregate?: {
      avgRoas: number | null;
      avgCtr: number | null;
      avgCpc: number | null;
      avgCpm: number | null;
      totalSpend: number;
      accountsUsing: number;
    } | null;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LaunchCampaignPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [fieldValuesValid, setFieldValuesValid] = useState(false);
  const [targeting, setTargeting] = useState<TargetingConfig>({
    locations: ['US'],
    ageMin: 18,
    ageMax: 65,
  });
  const [budget, setBudget] = useState<BudgetConfig>({
    budgetType: 'daily',
    budget: 50,
  });
  const [targetingBudgetValid, setTargetingBudgetValid] = useState(true);

  // Fetch templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery<TemplatesResponse>({
    queryKey: ['templates', 'launch'],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: 'timesUsed',
        sortOrder: 'desc',
      });
      return apiClient.get<TemplatesResponse>(`/api/templates?${params}`);
    },
  });

  // Fetch ad accounts
  const { data: adAccounts } = useQuery({
    queryKey: ['ad-accounts'],
    queryFn: () => apiClient.get('/api/ad-accounts'),
  });

  const defaultAdAccountId = (adAccounts as any)?.[0]?.id;

  // Launch campaign mutation
  const launchMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate || !defaultAdAccountId) {
        throw new Error('Missing required data');
      }

      return apiClient.post('/api/campaigns/launch', {
        templateId: selectedTemplate.id,
        adAccountId: defaultAdAccountId,
        campaignName,
        fieldValues,
        targeting,
        budget,
      });
    },
    onSuccess: (data: any) => {
      router.push(`/dashboard/campaigns?launched=true`);
    },
  });

  const templates = templatesData?.data || [];
  const dynamicFields = selectedTemplate
    ? parseFieldDefinitions(selectedTemplate.dynamicFields)
    : [];

  const handleSelectTemplate = (template: AdTemplate) => {
    setSelectedTemplate(template);
    setCampaignName(`${template.name} - ${new Date().toLocaleDateString()}`);
    setFieldValues({});
    setCurrentStep(2);
  };

  const handleFieldValuesChange = useCallback(
    (values: Record<string, any>, isValid: boolean) => {
      setFieldValues(values);
      setFieldValuesValid(isValid);
    },
    []
  );

  const handleTargetingBudgetChange = useCallback(
    (newTargeting: TargetingConfig, newBudget: BudgetConfig, isValid: boolean) => {
      setTargeting(newTargeting);
      setBudget(newBudget);
      setTargetingBudgetValid(isValid);
    },
    []
  );

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = () => {
    launchMutation.mutate();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplate !== null;
      case 2:
        return dynamicFields.length === 0 || fieldValuesValid;
      case 3:
        return campaignName.trim().length > 0 && targetingBudgetValid;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
        <h1 className="text-3xl font-bold tracking-tight">Launch Campaign from Template</h1>
        <p className="text-muted-foreground">
          Select a template and customize it to launch your campaign
        </p>
      </div>

      {/* Progress Indicator */}
      <LaunchProgress
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Select Template */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Select a Template</h2>
              <p className="text-sm text-muted-foreground">
                Choose a proven template to start your campaign
              </p>
            </div>

            {isLoadingTemplates ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading templates...
                  </p>
                </div>
              </div>
            ) : (
              <TemplateSelector
                templates={templates}
                onSelectTemplate={handleSelectTemplate}
                isLoading={isLoadingTemplates}
              />
            )}
          </div>
        )}

        {/* Step 2: Fill Dynamic Fields */}
        {currentStep === 2 && selectedTemplate && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Customize Your Campaign</h2>
              <p className="text-sm text-muted-foreground">
                Fill in the dynamic fields to personalize your ads
              </p>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Selected Template</p>
              <p className="mt-1 text-lg font-semibold">{selectedTemplate.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
            </div>

            <DynamicFieldsForm
              fields={dynamicFields}
              initialValues={fieldValues}
              onChange={handleFieldValuesChange}
            />
          </div>
        )}

        {/* Step 3: Configure Targeting & Budget */}
        {currentStep === 3 && selectedTemplate && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Configure Campaign</h2>
              <p className="text-sm text-muted-foreground">
                Set targeting, budget, and schedule
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-name">
                Campaign Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Summer Sale 2024"
                aria-required="true"
              />
              <p className="text-xs text-muted-foreground">
                A descriptive name for your campaign
              </p>
            </div>

            <TargetingBudgetForm
              initialTargeting={targeting}
              initialBudget={budget}
              onChange={handleTargetingBudgetChange}
            />
          </div>
        )}

        {/* Step 4: Preview & Launch */}
        {currentStep === 4 && selectedTemplate && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Review & Launch</h2>
              <p className="text-sm text-muted-foreground">
                Review your campaign configuration before launching
              </p>
            </div>

            <CampaignTemplatePreview
              template={selectedTemplate}
              fieldValues={fieldValues}
              targeting={targeting}
              budget={budget}
              campaignName={campaignName}
            />
          </div>
        )}

        {/* Navigation */}
        {currentStep > 1 && (
          <div className="mt-6">
            <LaunchNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onBack={handleBack}
              onNext={handleNext}
              onLaunch={handleLaunch}
              isNextDisabled={!isStepValid()}
              isLoading={launchMutation.isPending}
              error={
                launchMutation.isError
                  ? launchMutation.error instanceof Error
                    ? launchMutation.error.message
                    : 'Failed to launch campaign'
                  : null
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
