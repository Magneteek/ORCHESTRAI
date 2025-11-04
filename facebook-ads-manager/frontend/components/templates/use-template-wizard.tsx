'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/helpers/api-client';
import { useToast } from '@/hooks/use-toast';
import type { AdTemplate } from '@prisma/client';

interface UseTemplateWizardProps {
  template: AdTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type WizardStep = 'account' | 'customize' | 'review';

export function UseTemplateWizard({ template, open, onOpenChange, onSuccess }: UseTemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('account');
  const [adAccountId, setAdAccountId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [budget, setBudget] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep('account');
      setAdAccountId('');
      setCampaignName('');
      setBudget('');
    }
    onOpenChange(open);
  };

  // Create campaign from template
  const createFromTemplate = useMutation({
    mutationFn: async (data: {
      templateId: string;
      adAccountId: string;
      campaignName: string;
      budget: number;
    }) => {
      return apiClient.post('/api/campaigns/from-template', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: 'Campaign created successfully',
        description: 'Your campaign has been launched from the template.',
      });
      handleOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create campaign',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });

  const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'account', title: 'Select Account', description: 'Choose your ad account' },
    { id: 'customize', title: 'Customize', description: 'Customize campaign settings' },
    { id: 'review', title: 'Review', description: 'Review and launch' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'account' && !adAccountId) {
      toast({
        title: 'Ad account required',
        description: 'Please select an ad account to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep === 'customize') {
      if (!campaignName) {
        toast({
          title: 'Campaign name required',
          description: 'Please enter a campaign name.',
          variant: 'destructive',
        });
        return;
      }
      if (!budget || parseFloat(budget) <= 0) {
        toast({
          title: 'Valid budget required',
          description: 'Please enter a valid budget amount.',
          variant: 'destructive',
        });
        return;
      }
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id);
    }
  };

  const handleLaunch = () => {
    if (!template) return;

    createFromTemplate.mutate({
      templateId: template.id,
      adAccountId,
      campaignName,
      budget: parseFloat(budget),
    });
  };

  if (!template) return null;

  const adCopy = template.adCopy as any;
  const campaignStructure = template.campaignStructure as any;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Launch Campaign from Template</DialogTitle>
          <DialogDescription>
            {template.name}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStepIndex
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-background text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 'account' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adAccount">Ad Account</Label>
                <Select value={adAccountId} onValueChange={setAdAccountId}>
                  <SelectTrigger id="adAccount">
                    <SelectValue placeholder="Select an ad account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="act_123456789">Demo Account (act_123456789)</SelectItem>
                    <SelectItem value="act_987654321">Production Account (act_987654321)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the ad account where you want to launch this campaign.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Template Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline" className="capitalize">
                      {template.category.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Objective:</span>
                    <Badge variant="outline" className="capitalize">
                      {template.objective.replace('OUTCOME_', '').toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span>{template.timesUsed} times</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'customize' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  placeholder="Enter campaign name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Choose a descriptive name for your campaign.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Daily Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter daily budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="1"
                  step="1"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: ${campaignStructure?.budget || 50}/day
                </p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Ad Copy Preview</h4>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{adCopy?.headline}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {adCopy?.primaryText}
                  </p>
                  <Badge className="mt-2">{adCopy?.callToAction}</Badge>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ad Account</span>
                  <span className="font-medium">{adAccountId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Campaign Name</span>
                  <span className="font-medium">{campaignName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Daily Budget</span>
                  <span className="font-medium">${budget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Objective</span>
                  <Badge className="capitalize">
                    {template.objective.replace('OUTCOME_', '').toLowerCase()}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Campaign will be created with template settings</li>
                  <li>Ad sets and ads will be configured automatically</li>
                  <li>Campaign will start in "Paused" status for review</li>
                  <li>You can edit settings before activating</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep !== 'account' && (
            <Button variant="outline" onClick={handleBack} disabled={createFromTemplate.isPending}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {currentStep !== 'review' ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleLaunch} disabled={createFromTemplate.isPending}>
              {createFromTemplate.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Launch Campaign
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
