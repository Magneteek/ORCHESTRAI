'use client';

import React from 'react';
import type { DayOfWeekPerformance } from '@/types/analytics';

/**
 * Cost per lead by weekday.
 *
 * A daily time series hides this completely: a 30-day line chart shows spiky
 * conversion counts, not that Tuesdays convert at a third of Sunday's cost.
 * The spread is directly actionable through scheduling and budget rules, and
 * it was the strongest finding in the AI analysis while being invisible in the
 * UI the analysis sat next to.
 *
 * Bars are scaled against the worst day so the best day is visibly shortest —
 * for a cost metric, shorter is better, which matches the reading direction.
 */
export function DayOfWeekEfficiency({
  data,
  formatCurrency,
}: {
  data: DayOfWeekPerformance[];
  formatCurrency: (n: number) => string;
}) {
  const withLeads = data.filter((d) => d.conversions > 0);

  if (withLeads.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No conversions in this period
      </p>
    );
  }

  const worst = Math.max(...withLeads.map((d) => d.cpa));
  const best = Math.min(...withLeads.map((d) => d.cpa));
  // A single day of data makes "best vs worst" meaningless.
  const showMarkers = withLeads.length > 1 && worst !== best;

  return (
    <div className="space-y-2">
      {data.map((d) => {
        const hasLeads = d.conversions > 0;
        const width = hasLeads && worst > 0 ? Math.max((d.cpa / worst) * 100, 2) : 0;
        const isBest = showMarkers && hasLeads && d.cpa === best;
        const isWorst = showMarkers && hasLeads && d.cpa === worst;

        return (
          <div key={d.day} className="flex items-center gap-3">
            <span className="w-9 shrink-0 text-xs text-muted-foreground">{d.label}</span>

            <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
              {hasLeads && (
                <div
                  className={`h-full ${
                    isBest
                      ? 'bg-emerald-600 dark:bg-emerald-500'
                      : isWorst
                      ? 'bg-red-500/80'
                      : 'bg-foreground/60'
                  }`}
                  style={{ width: `${width}%` }}
                />
              )}
            </div>

            <span className="w-16 shrink-0 text-right text-xs tabular-nums">
              {hasLeads ? formatCurrency(d.cpa) : '—'}
            </span>
            <span className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {d.conversions} {d.conversions === 1 ? 'lead' : 'leads'}
            </span>
          </div>
        );
      })}

      {showMarkers && (
        <p className="pt-1 text-xs text-muted-foreground">
          Best day costs {formatCurrency(best)} per lead against{' '}
          {formatCurrency(worst)} on the worst — a {(worst / best).toFixed(1)}x spread.
        </p>
      )}
    </div>
  );
}
