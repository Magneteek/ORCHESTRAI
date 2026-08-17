'use client';

import React from 'react';
import {
  compareToBenchmark,
  formatBand,
  type BenchmarkVerdict,
} from '@/lib/analytics/benchmarks';

/**
 * A headline number with the two things that make it interpretable: how it
 * moved against the previous period of equal length, and where it sits against
 * an industry band.
 *
 * The benchmark is rendered as context, never as a verdict — these are wide
 * industry averages with heavy seasonal swing, so a value just outside the
 * band is not a failure and is not coloured like one.
 */
export interface KpiTileProps {
  label: string;
  value: number;
  format: (n: number) => string;
  /** Same metric over the preceding period of equal length. */
  previous?: number;
  /** True for cost metrics, where down is good. */
  lowerIsBetter?: boolean;
  benchmark?: [number, number];
  benchmarkKind?: 'currency' | 'percent';
  /** Extra line under the value, e.g. a secondary metric. */
  footnote?: string;
}

const VERDICT_LABEL: Record<BenchmarkVerdict, string> = {
  better: 'better than typical',
  within: 'typical',
  worse: 'below typical',
};

export function KpiTile({
  label,
  value,
  format,
  previous,
  lowerIsBetter = false,
  benchmark,
  benchmarkKind = 'currency',
  footnote,
}: KpiTileProps) {
  const hasPrev = previous !== undefined && previous !== 0;
  const pct = hasPrev ? ((value - previous!) / Math.abs(previous!)) * 100 : 0;
  const flat = hasPrev && Math.abs(pct) < 1;
  const improving = lowerIsBetter ? pct < 0 : pct > 0;

  const trendTone = !hasPrev || flat
    ? 'text-muted-foreground'
    : improving
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400';

  const verdict = benchmark
    ? compareToBenchmark(value, benchmark, lowerIsBetter)
    : null;

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-bold tabular-nums">{format(value)}</p>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className={`tabular-nums ${trendTone}`}>
          {!hasPrev
            ? 'no prior period'
            : flat
            ? 'flat vs previous'
            : `${pct > 0 ? '+' : ''}${pct.toFixed(0)}% vs previous`}
        </span>
      </div>

      {footnote && (
        <p className="mt-1 text-xs text-muted-foreground">{footnote}</p>
      )}

      {benchmark && verdict && (
        <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
          {VERDICT_LABEL[verdict]} · benchmark {formatBand(benchmark, benchmarkKind)}
        </p>
      )}
    </div>
  );
}
