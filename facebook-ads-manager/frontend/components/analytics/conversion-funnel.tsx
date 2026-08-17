'use client';

import React from 'react';

/**
 * Impressions -> clicks -> leads, with the step-to-step rate.
 *
 * The API has always computed this and nothing ever rendered it. It is the one
 * view that localises where a lead-gen account is losing people: cheap clicks
 * with a weak click-to-lead rate is a landing page or form problem, not a
 * targeting or bidding one, and no per-metric time series shows that.
 *
 * Bar widths are proportional to the top of the funnel, so the drop-off is
 * legible at a glance rather than requiring the reader to divide two numbers.
 */
export interface FunnelStep {
  label: string;
  value: number;
  /** Ratio against the previous step; undefined on the first step. */
  rate?: number;
  /** Optional benchmark band for the step rate, as a ratio. */
  benchmark?: [number, number];
}

export function ConversionFunnel({
  steps,
  formatCount,
}: {
  steps: FunnelStep[];
  formatCount: (n: number) => string;
}) {
  const top = steps[0]?.value ?? 0;

  if (!top) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No delivery in this period
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step) => {
        // Floor the width so a step that converted at a fraction of a percent
        // is still a visible bar rather than a hairline.
        const width = Math.max((step.value / top) * 100, 1.5);

        let rateTone = 'text-muted-foreground';
        let rateNote: string | null = null;
        if (step.rate !== undefined && step.benchmark) {
          const [low, high] = step.benchmark;
          if (step.rate < low) {
            rateTone = 'text-red-600 dark:text-red-400';
            rateNote = `below the ${(low * 100).toFixed(1)}–${(high * 100).toFixed(1)}% benchmark`;
          } else if (step.rate > high) {
            rateTone = 'text-emerald-600 dark:text-emerald-400';
            rateNote = `above the ${(low * 100).toFixed(1)}–${(high * 100).toFixed(1)}% benchmark`;
          } else {
            rateNote = 'within benchmark';
          }
        }

        return (
          <div key={step.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{step.label}</span>
              <span className="tabular-nums">{formatCount(step.value)}</span>
            </div>

            <div className="mt-1 h-6 w-full overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-foreground/80"
                style={{ width: `${width}%` }}
              />
            </div>

            {step.rate !== undefined && (
              <p className={`mt-1 text-xs tabular-nums ${rateTone}`}>
                {(step.rate * 100).toFixed(2)}% of previous step
                {rateNote && <span className="ml-1 opacity-80">· {rateNote}</span>}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
