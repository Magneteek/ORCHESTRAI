'use client';

import { ChevronLeft, ChevronRight, Loader2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LaunchNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onLaunch: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function LaunchNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onLaunch,
  isNextDisabled = false,
  isLoading = false,
  error = null,
}: LaunchNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep || isLoading}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={onLaunch}
            disabled={isNextDisabled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Launching Campaign...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Launch Campaign
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled || isLoading}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
