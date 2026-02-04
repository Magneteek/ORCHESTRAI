'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LaunchProgressProps {
  currentStep: number;
  steps: {
    id: number;
    title: string;
  }[];
  onStepClick?: (step: number) => void;
}

export function LaunchProgress({
  currentStep,
  steps,
  onStepClick,
}: LaunchProgressProps) {
  const canNavigate = (stepId: number) => {
    return stepId < currentStep;
  };

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => canNavigate(step.id) && onStepClick?.(step.id)}
              disabled={!canNavigate(step.id)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                currentStep > step.id &&
                  'border-primary bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90',
                currentStep === step.id &&
                  'border-primary text-primary bg-background',
                currentStep < step.id &&
                  'border-muted-foreground text-muted-foreground bg-background',
                !canNavigate(step.id) && 'cursor-not-allowed'
              )}
              aria-label={`Step ${step.id}: ${step.title}`}
              aria-current={currentStep === step.id ? 'step' : undefined}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </button>
            <span
              className={cn(
                'mt-2 text-sm font-medium',
                currentStep >= step.id
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-4 h-0.5 flex-1 transition-colors',
                currentStep > step.id ? 'bg-primary' : 'bg-muted'
              )}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}
