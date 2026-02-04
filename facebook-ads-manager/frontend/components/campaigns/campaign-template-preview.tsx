'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { resolveDynamicFields } from '@/lib/templates/dynamic-fields';
import type { AdTemplate } from '@prisma/client';
import type { TargetingConfig, BudgetConfig } from '@/lib/templates/launch';
import { formatCurrency } from '@/lib/utils/format';

interface CampaignTemplatePreviewProps {
  template: AdTemplate;
  fieldValues: Record<string, any>;
  targeting: TargetingConfig;
  budget: BudgetConfig;
  campaignName: string;
}

export function CampaignTemplatePreview({
  template,
  fieldValues,
  targeting,
  budget,
  campaignName,
}: CampaignTemplatePreviewProps) {
  const resolved = resolveDynamicFields(template, fieldValues);
  const adCopy = resolved.adCopy as any;
  const creativeSpecs = resolved.creativeSpecs as any;

  const highlightDynamicFields = (text: string) => {
    const parts: { text: string; isDynamic: boolean }[] = [];
    let lastIndex = 0;
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    let match: RegExpExecArray | null;

    const originalText = (template.adCopy as any)?.[
      Object.keys(adCopy).find((key) => (adCopy as any)[key] === text)!
    ] as string;

    if (!originalText || typeof originalText !== 'string') {
      return [{ text, isDynamic: false }];
    }

    while ((match = regex.exec(originalText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, lastIndex + (match.index - lastIndex)),
          isDynamic: false,
        });
      }

      const fieldName = match[1];
      const resolvedValue = fieldValues[fieldName];
      if (resolvedValue !== undefined && resolvedValue !== null) {
        parts.push({
          text: String(resolvedValue),
          isDynamic: true,
        });
        lastIndex = match.index + match[0].length;
      }
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        isDynamic: false,
      });
    }

    return parts.length > 0 ? parts : [{ text, isDynamic: false }];
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column: Ad Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Ad Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Facebook Ad Mockup */}
          <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
            {/* Ad Header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {campaignName || template.name}
                </p>
                <p className="text-xs text-muted-foreground">Sponsored</p>
              </div>
            </div>

            {/* Primary Text */}
            {adCopy.primaryText && (
              <div className="mb-3">
                <p className="text-sm">
                  {highlightDynamicFields(adCopy.primaryText).map((part, i) => (
                    <span
                      key={i}
                      className={
                        part.isDynamic
                          ? 'rounded bg-blue-100 px-1 font-semibold dark:bg-blue-900'
                          : ''
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* Creative Placeholder */}
            <div className="relative mb-3 aspect-[1.91/1] overflow-hidden rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              {creativeSpecs?.imageUrl ? (
                <img
                  src={creativeSpecs.imageUrl}
                  alt="Ad creative"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    {creativeSpecs?.aspectRatio || '1.91:1'} Creative
                  </p>
                </div>
              )}
            </div>

            {/* Headline */}
            {adCopy.headline && (
              <div className="mb-2">
                <p className="text-sm font-semibold">
                  {highlightDynamicFields(adCopy.headline).map((part, i) => (
                    <span
                      key={i}
                      className={
                        part.isDynamic
                          ? 'rounded bg-blue-100 px-1 dark:bg-blue-900'
                          : ''
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* Description */}
            {adCopy.description && (
              <div className="mb-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {highlightDynamicFields(adCopy.description).map((part, i) => (
                    <span
                      key={i}
                      className={
                        part.isDynamic
                          ? 'rounded bg-blue-100 px-0.5 font-medium dark:bg-blue-900'
                          : ''
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* CTA Button */}
            {adCopy.callToAction && (
              <div className="mt-3">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  {adCopy.callToAction}
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Fields Legend */}
          {Object.keys(fieldValues).length > 0 && (
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Dynamic fields are highlighted in blue
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Column: Configuration Summary */}
      <div className="space-y-6">
        {/* Campaign Details */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Campaign Name
              </p>
              <p className="mt-1 font-medium">{campaignName}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Template
              </p>
              <p className="mt-1 font-medium">{template.name}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Objective
              </p>
              <Badge variant="outline" className="mt-1 capitalize">
                {template.objective.replace('OUTCOME_', '').toLowerCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Fields Summary */}
        {Object.keys(fieldValues).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(fieldValues).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/[_-]/g, ' ')}
                  </p>
                  <p className="mt-1 font-medium">{String(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Targeting Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Targeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Locations
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {targeting.locations.map((loc) => (
                  <Badge key={loc} variant="secondary">
                    {loc}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Age Range
              </p>
              <p className="mt-1 font-medium">
                {targeting.ageMin || 18} - {targeting.ageMax || 65} years
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Budget Type
              </p>
              <p className="mt-1 font-medium capitalize">
                {budget.budgetType}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Budget Amount
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(budget.budget)}
              </p>
              <p className="text-xs text-muted-foreground">
                per {budget.budgetType === 'daily' ? 'day' : 'campaign'}
              </p>
            </div>

            {(budget.startTime || budget.stopTime) && (
              <>
                <Separator />
                <div className="space-y-2">
                  {budget.startTime && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Start Time
                      </p>
                      <p className="mt-1 font-medium">
                        {new Date(budget.startTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {budget.stopTime && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        End Time
                      </p>
                      <p className="mt-1 font-medium">
                        {new Date(budget.stopTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
