'use client';

import React, { useId } from 'react';

/**
 * One metric, one panel, one y-scale.
 *
 * The previous chart plotted several metrics against a single shared axis
 * derived from the largest series, so anything smaller collapsed onto the
 * floor — impressions in the thousands next to spend in the tens meant the
 * spend line was visually zero. Small multiples avoid that without resorting
 * to a dual axis, which readers misinterpret most of the time.
 *
 * The y-scale is padded around the data's own range rather than anchored at
 * zero: these are trend panels, not magnitude comparisons, and the headline
 * number is printed above so the absolute level is never in doubt.
 */
export interface MetricSparklineProps {
  label: string;
  points: Array<{ date: string; value: number }>;
  /** Formats the headline value and tooltip. */
  format: (value: number) => string;
  /** True for cost metrics, where a falling line is good news. */
  lowerIsBetter?: boolean;
  height?: number;
}

export function MetricSparkline({
  label,
  points,
  format,
  lowerIsBetter = false,
  height = 64,
}: MetricSparklineProps) {
  const gradientId = useId();

  if (points.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-6 text-center text-xs text-muted-foreground">No data</p>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Flat series would otherwise divide by zero; render them mid-panel.
  const span = max - min || Math.abs(max) || 1;
  const pad = span * 0.15;
  const lo = min - pad;
  const hi = max + pad;

  const W = 100;
  const H = 100;
  const x = (i: number) =>
    points.length === 1 ? W / 2 : (i / (points.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  const area = `${x(0)},${H} ${line} ${x(points.length - 1)},${H}`;

  const current = values[values.length - 1];

  // Compare the two halves of the window rather than first-vs-last point, which
  // a single spiky day would otherwise dominate.
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  const mean = (xs: number[]) =>
    xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0;
  const delta = firstHalf.length ? mean(secondHalf) - mean(firstHalf) : 0;
  const pct = firstHalf.length && mean(firstHalf) !== 0
    ? (delta / Math.abs(mean(firstHalf))) * 100
    : 0;

  const improving = lowerIsBetter ? delta < 0 : delta > 0;
  const flat = Math.abs(pct) < 1;
  const toneClass = flat
    ? 'text-muted-foreground'
    : improving
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={`text-xs tabular-nums ${toneClass}`}>
          {flat ? '~' : pct > 0 ? '+' : ''}
          {flat ? 'flat' : `${pct.toFixed(0)}%`}
        </span>
      </div>

      <p className="mt-1 text-xl font-semibold tabular-nums">{format(current)}</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-3 w-full"
        style={{ height }}
        role="img"
        aria-label={`${label} trend over ${points.length} days`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradientId})`} className="text-foreground" />
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-foreground"
        />
      </svg>
    </div>
  );
}
