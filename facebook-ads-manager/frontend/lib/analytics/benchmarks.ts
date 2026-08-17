/**
 * Meta lead-gen benchmarks, used to give a KPI tile context beyond its own
 * trend line. "Is €16 per lead good?" is unanswerable without one.
 *
 * These are industry averages, not targets. CPL in particular swings by more
 * than an order of magnitude across verticals — roughly $3 for restaurants
 * against $77 for dentists — so a single global number would be actively
 * misleading. Industry is therefore selectable per ad account, defaulting to
 * the all-industry average until someone sets it.
 *
 * Sources (2026 benchmark round-ups; see the note in the Analytics UI):
 *   all-industry leads-objective CPL ~$27.66, CTR ~2.50%, CVR ~7.72%,
 *   CPC ~$1.92.
 *
 * Seasonality is large — roughly a 46% trough-to-peak swing within a year —
 * which is why each figure is presented as a band rather than a point, and why
 * the UI never renders a benchmark as a pass/fail verdict.
 */

export interface Benchmark {
  /** Cost per lead, in USD. */
  cpl: [number, number];
  /** Click-through rate as a ratio, matching the app's unit contract. */
  ctr: [number, number];
  /** Click-to-lead conversion rate as a ratio. */
  cvr: [number, number];
  /** Cost per click, in USD. */
  cpc: [number, number];
}

export interface IndustryBenchmark extends Benchmark {
  id: string;
  label: string;
}

/**
 * Ordered for the picker: the generic default first, then verticals.
 * Bands are drawn around the reported averages rather than invented precision.
 */
export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    id: 'all',
    label: 'All industries (default)',
    cpl: [20, 35],
    ctr: [0.02, 0.03],
    cvr: [0.06, 0.09],
    cpc: [1.4, 2.4],
  },
  {
    id: 'restaurants',
    label: 'Restaurants & food',
    cpl: [3, 8],
    ctr: [0.025, 0.04],
    cvr: [0.07, 0.11],
    cpc: [0.5, 1.1],
  },
  {
    id: 'real-estate',
    label: 'Real estate',
    cpl: [35, 65],
    ctr: [0.015, 0.025],
    cvr: [0.05, 0.08],
    cpc: [1.5, 2.6],
  },
  {
    id: 'b2b-saas',
    label: 'B2B SaaS',
    cpl: [50, 75],
    ctr: [0.012, 0.022],
    cvr: [0.04, 0.07],
    cpc: [2.0, 3.5],
  },
  {
    id: 'legal',
    label: 'Legal & attorneys',
    cpl: [60, 120],
    ctr: [0.012, 0.022],
    cvr: [0.04, 0.07],
    cpc: [3.0, 5.0],
  },
  {
    id: 'dental',
    label: 'Dental',
    cpl: [55, 90],
    ctr: [0.015, 0.025],
    cvr: [0.04, 0.07],
    cpc: [6.0, 11.0],
  },
  {
    id: 'home-services',
    label: 'Home services',
    cpl: [25, 50],
    ctr: [0.018, 0.03],
    cvr: [0.05, 0.09],
    cpc: [1.5, 3.0],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    cpl: [10, 25],
    ctr: [0.02, 0.035],
    cvr: [0.06, 0.1],
    cpc: [0.8, 1.6],
  },
];

export const DEFAULT_INDUSTRY = 'all';

export function getBenchmark(industryId: string): IndustryBenchmark {
  return (
    INDUSTRY_BENCHMARKS.find((b) => b.id === industryId) ??
    INDUSTRY_BENCHMARKS[0]
  );
}

export type BenchmarkVerdict = 'better' | 'within' | 'worse';

/**
 * Where a value sits against a band.
 *
 * `lowerIsBetter` covers cost metrics (CPL, CPC), where falling below the band
 * is good news; for rate metrics (CTR, CVR) it is the reverse. Returning
 * "within" for anything inside the band is deliberate — treating a value 5%
 * off an industry average as a failure reads precision into these numbers that
 * they do not carry.
 */
export function compareToBenchmark(
  value: number,
  band: [number, number],
  lowerIsBetter: boolean
): BenchmarkVerdict {
  const [low, high] = band;
  if (value >= low && value <= high) return 'within';
  if (value < low) return lowerIsBetter ? 'better' : 'worse';
  return lowerIsBetter ? 'worse' : 'better';
}

/** Human-readable band, e.g. "$20–35" or "6.0–9.0%". */
export function formatBand(
  band: [number, number],
  kind: 'currency' | 'percent'
): string {
  const [low, high] = band;
  return kind === 'currency'
    ? `$${low}–${high}`
    : `${(low * 100).toFixed(1)}–${(high * 100).toFixed(1)}%`;
}
