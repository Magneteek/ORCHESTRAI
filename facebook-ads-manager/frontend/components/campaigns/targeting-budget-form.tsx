'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TargetingConfig, BudgetConfig } from '@/lib/templates/launch';

interface TargetingBudgetFormProps {
  initialTargeting?: Partial<TargetingConfig>;
  initialBudget?: Partial<BudgetConfig>;
  onChange: (
    targeting: TargetingConfig,
    budget: BudgetConfig,
    isValid: boolean
  ) => void;
}

const schema = z.object({
  location: z.string().min(1, 'Location is required'),
  ageMin: z.number().min(13, 'Minimum age is 13').max(65),
  ageMax: z.number().min(13).max(65, 'Maximum age is 65'),
  budgetType: z.enum(['daily', 'lifetime']),
  budget: z.number().min(1, 'Budget must be at least $1'),
  startTime: z.string().optional(),
  stopTime: z.string().optional(),
}).refine((data) => data.ageMin <= data.ageMax, {
  message: 'Minimum age must be less than or equal to maximum age',
  path: ['ageMin'],
});

type FormData = z.infer<typeof schema>;

const LOCATIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
];

export function TargetingBudgetForm({
  initialTargeting,
  initialBudget,
  onChange,
}: TargetingBudgetFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      location: initialTargeting?.locations?.[0] || 'US',
      ageMin: initialTargeting?.ageMin || 18,
      ageMax: initialTargeting?.ageMax || 65,
      budgetType: initialBudget?.budgetType || 'daily',
      budget: initialBudget?.budget || 50,
      startTime: initialBudget?.startTime || '',
      stopTime: initialBudget?.stopTime || '',
    },
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    const targeting: TargetingConfig = {
      locations: [formValues.location],
      ageMin: formValues.ageMin,
      ageMax: formValues.ageMax,
    };

    const budget: BudgetConfig = {
      budgetType: formValues.budgetType,
      budget: formValues.budget,
      startTime: formValues.startTime || undefined,
      stopTime: formValues.stopTime || undefined,
    };

    onChange(targeting, budget, isValid);
  }, [formValues, isValid, onChange]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  return (
    <div className="space-y-6">
      {/* Targeting Section */}
      <Card>
        <CardHeader>
          <CardTitle>Targeting</CardTitle>
          <CardDescription>
            Define who will see your ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formValues.location}
              onValueChange={(value) => setValue('location', value, { shouldValidate: true })}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-destructive" role="alert">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Age Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ageMin">
                Minimum Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ageMin"
                type="number"
                {...register('ageMin', { valueAsNumber: true })}
                min={13}
                max={65}
                className={errors.ageMin ? 'border-destructive' : ''}
                aria-invalid={!!errors.ageMin}
              />
              {errors.ageMin && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.ageMin.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageMax">
                Maximum Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ageMax"
                type="number"
                {...register('ageMax', { valueAsNumber: true })}
                min={13}
                max={65}
                className={errors.ageMax ? 'border-destructive' : ''}
                aria-invalid={!!errors.ageMax}
              />
              {errors.ageMax && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.ageMax.message}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Age range must be between 13 and 65
          </p>
        </CardContent>
      </Card>

      {/* Budget Section */}
      <Card>
        <CardHeader>
          <CardTitle>Budget & Schedule</CardTitle>
          <CardDescription>
            Set your campaign budget and schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget Type */}
          <div className="space-y-2">
            <Label>Budget Type <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('budgetType', 'daily', { shouldValidate: true })}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  formValues.budgetType === 'daily'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-medium">Daily Budget</div>
                <div className="text-sm text-muted-foreground">
                  Amount spent per day
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue('budgetType', 'lifetime', { shouldValidate: true })}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  formValues.budgetType === 'lifetime'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-medium">Lifetime Budget</div>
                <div className="text-sm text-muted-foreground">
                  Total amount to spend
                </div>
              </button>
            </div>
          </div>

          {/* Budget Amount */}
          <div className="space-y-2">
            <Label htmlFor="budget">
              {formValues.budgetType === 'daily' ? 'Daily' : 'Lifetime'} Budget ($){' '}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="budget"
                type="number"
                {...register('budget', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.budget ? 'border-destructive pl-7' : 'pl-7'}
                min={1}
                step="0.01"
                aria-invalid={!!errors.budget}
              />
            </div>
            {errors.budget && (
              <p className="text-sm text-destructive" role="alert">
                {errors.budget.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum budget is $1.00
            </p>
          </div>

          {/* Schedule */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time (Optional)</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime')}
                aria-label="Campaign start time"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to start immediately
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopTime">End Time (Optional)</Label>
              <Input
                id="stopTime"
                type="datetime-local"
                {...register('stopTime')}
                aria-label="Campaign end time"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to run continuously
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
