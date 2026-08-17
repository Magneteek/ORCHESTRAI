'use client';

import React from 'react';
import type {
  DayOfWeekPerformance,
  DayOfWeekSignificance,
} from '@/types/analytics';

/**
 * Cost per lead by weekday.
 *
 * A daily time series hides weekday structure completely, so this panel exists
 * to surface it — but it deliberately refuses to dramatise it. Conversion
 * counts per weekday are small, and a 3x cost-per-lead spread arises easily
 * from chance: on the DRNL account the apparent best day moves from Tuesday to
 * Thursday purely by widening the window from 30 days to 90, while the spread
 * narrows from 2.9x to 1.7x. Both are the signature of noise, not a schedule.
 *
 * So best/worst are highlighted only when `significance` says the variation
 * clears a chi-square test; otherwise the panel says plainly that the spread
 * is scatter. See assessDayOfWeek in lib/analytics/aggregate.
 *
 * Bars are scaled against the worst day so the best day is visibly shortest —
 * for a cost metric, shorter is better, which matches the reading direction.
 */
export function DayOfWeekEfficiency({
  data,
  significance,
  formatCurrency,
}: {
  data: DayOfWeekPerformance[];
  significance?: DayOfWeekSignificance;
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

  // Highlight a best and worst day only when the weekday variation is actually
  // distinguishable from chance. Colouring them regardless turns random
  // scatter into an apparent instruction to move budget — and on low-volume
  // accounts the "best" day changes as soon as the window changes.
  const isNoise = significance ? !significance.significant : false;
  const showMarkers = withLeads.length > 1 && worst !== best && !isNoise;

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

      {isNoise && (
        <p className="pt-1 text-xs text-muted-foreground">
          The spread between days ({formatCurrency(best)}–{formatCurrency(worst)}
          {' '}per lead) is not distinguishable from random variation at this
          volume ({significance!.totalConversions} conversions,
          {' '}&chi;&sup2;&nbsp;{significance!.chiSquare.toFixed(1)} on{' '}
          {significance!.degreesOfFreedom} df). Treat it as scatter rather than
          a scheduling opportunity until more conversions accumulate.
        </p>
      )}
    </div>
  );
}
