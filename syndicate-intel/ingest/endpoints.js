/**
 * Endpoint registry for The Syndicate data API.
 *
 * Tiers control polling frequency. Anything that only ever moves forward
 * (append-only feeds) is polled fast with a generous window; full-state
 * snapshots are polled at the rate the underlying data actually changes.
 *
 * Observed payload sizes (2026-08-16) are recorded so drift is obvious.
 */

export const BASE_URL = 'https://thesyndicate.games/api/v1'

// Documented limit is 240 req/min per key. We stay far under it.
export const RATE_LIMIT_PER_MIN = 240

/**
 * kind:
 *   'snapshot' - full current state, diffed across runs
 *   'feed'     - append-only, newest first, supports ?since / ?cursor
 *
 * cursorPath / itemsPath describe where to find pagination state and rows,
 * relative to the `data` envelope.
 */
export const ENDPOINTS = [
  // ---------------------------------------------------------------- fast ---
  // The moat. Leaderboards are lifetime-cumulative and ?season= is ignored by
  // the API (verified 2026-08-16: season=0 and season=11 return byte-identical
  // arrays), so weekly rankings ONLY exist if we diff our own snapshots.
  // The one endpoint polled every minute. It is 15KB, and it is the moat: the
  // only record of earnings over time that will ever exist. Listings stay on
  // the 5-minute tier because at ~570KB compressed per changed snapshot,
  // minute polling would cost ~300GB/year of archive for little extra fidelity.
  {
    name: 'leaderboards',
    path: '/leaderboards',
    tier: 'live',
    kind: 'snapshot',
    approxBytes: 15_768,
    note: 'top 50 per list, capo-scoped, lifetime totals; ?season= is ignored',
  },
  {
    name: 'market_listings',
    path: '/market/listings',
    tier: 'fast',
    kind: 'snapshot',
    approxBytes: 3_045_410,
    note: 'live listings w/ full capo stats; label source for appraisal model',
  },
  {
    name: 'market_sales',
    path: '/market/sales',
    tier: 'fast',
    kind: 'feed',
    // Unlike /royalties this one honours limit=1000 AND returns a working
    // next_cursor, so the full ~32k sale history is genuinely backfillable.
    query: { limit: 1000 },
    itemsPath: 'sales',
    idField: 'sale_id',
    tsField: 'sold_at',
    maxPagesIncremental: 3,
    note: 'features+labels for pricing model; ~5 rows/15min observed',
  },
  {
    name: 'royalties',
    path: '/royalties',
    tier: 'fast',
    kind: 'feed',
    // No next_cursor is returned, and limit is hard-capped: limit=5000 echoes
    // back limit=2000 and still yields 1000 rows (verified 2026-08-16). So the
    // deepest reachable window is the most recent 1000 receipts and history
    // before that is permanently unreachable. We poll at 1000 to keep the
    // widest safety margin, and the `rollup` block still gives lifetime totals.
    query: { limit: 1000 },
    itemsPath: 'receipts',
    idField: 'signature',
    tsField: 'block_time',
    maxPagesIncremental: 1,
    backfillCeiling: 1000,
    note: '5% of sale price; lets us size true secondary volume',
  },

  // -------------------------------------------------------------- hourly ---
  {
    name: 'combat_players',
    path: '/combat/players',
    tier: 'hourly',
    kind: 'snapshot',
    approxBytes: 2_034_099,
    note: 'ALL 3660 players, not truncated; account-level combat leaderboards',
  },
  {
    name: 'combat_fights',
    path: '/combat/fights',
    tier: 'hourly',
    kind: 'feed',
    query: { limit: 500 },
    itemsPath: 'fights',
    idField: 'fight_id',
    tsField: 'settled_at',
    maxPagesIncremental: 10,
  },
  {
    name: 'contracts',
    path: '/contracts',
    tier: 'hourly',
    kind: 'snapshot',
    approxBytes: 62_234,
    note: 'trainer reputation rollups; top-trainers board comes straight out',
  },
  {
    name: 'contracts_open_jobs',
    path: '/contracts/open-jobs',
    tier: 'hourly',
    kind: 'feed',
    query: { limit: 200 },
    // Verified against the live response 2026-08-16: the array is `open_jobs`,
    // not `jobs`. Empty today, so a wrong path would have looked healthy right
    // up until real jobs appeared and were silently dropped.
    itemsPath: 'open_jobs',
    tsField: 'created_at',
    maxPagesIncremental: 5,
  },
  {
    name: 'bounties',
    path: '/bounties',
    tier: 'hourly',
    kind: 'feed',
    query: { limit: 200 },
    itemsPath: 'bounties',
    tsField: 'created_at',
    maxPagesIncremental: 5,
  },
  {
    name: 'boosts',
    path: '/boosts',
    tier: 'hourly',
    kind: 'feed',
    query: { limit: 200 },
    // Verified live 2026-08-16: the array is `boost_jobs`, not `boosts`.
    itemsPath: 'boost_jobs',
    tsField: 'created_at',
    maxPagesIncremental: 5,
    note: 'docs describe USDC payouts here, but the feed is empty as of 2026-08-16',
  },
  {
    name: 'territory',
    path: '/territory',
    tier: 'hourly',
    kind: 'snapshot',
    note: '~2k districts, ~900 occupied',
  },
  {
    name: 'market_traders',
    path: '/market/traders',
    // Realized SOL per player, attributed by the game rather than by us. We
    // already derive the same figure from buyer_ref/seller_ref on /market/sales
    // and agree with it on 904 of 1057 shared players, so this is not a new
    // number. It is archived as an independent check on the one we publish:
    // ours is rebuildable and can be windowed to any period, theirs cannot be
    // windowed at all, and a drift between the two means one of us is wrong.
    //
    // It already earned its place. The first comparison showed our SOL totals
    // counting in-game RACKET trades as SOL, which the API excludes.
    tier: 'hourly',
    kind: 'snapshot',
    approxBytes: 209_707,
    note: '1062 traders; lifetime cumulative, marketplace only, swaps excluded',
  },

  // --------------------------------------------------------------- daily ---
  // 58MB, no pagination, no limit param. Documented as "~3-4k rows" but
  // actually returns ~89k. Never fetch this on a request path.
  {
    name: 'capos_production',
    path: '/capos/production',
    // Per-capo RACKET earnings, which nothing else in the API carries: the
    // leaderboard board is 50 rows and has named 109 capos in our whole archive,
    // against 51,650 here.
    //
    // The API refreshes it hourly and we take it daily anyway. At 4.8MB
    // compressed a snapshot, hourly is 41GB a year against 44GB free on this
    // box, to watch cumulative lifetime earnings that barely move in an hour.
    // Daily costs 1.7GB a year and pairs with the roster pull it is joined to.
    tier: 'daily',
    kind: 'snapshot',
    approxBytes: 23_058_420,
    note: '51650 earning capos; lifetime, per-day, season, 7d/30d. Filters: owner, capo, min_earned',
  },
  {
    name: 'capos',
    path: '/capos',
    // ~58MB payload; the default 180s abort was killing the daily run, so allow 10 min.
    timeoutMs: 600_000,
    tier: 'daily',
    kind: 'snapshot',
    approxBytes: 58_290_110,
    note: '89147 rows / 58MB; docs claim ~3-4k. Full roster + ownership graph.',
  },
  {
    name: 'equipment',
    path: '/equipment',
    tier: 'daily',
    kind: 'snapshot',
  },
  {
    name: 'equipment_supply',
    path: '/equipment/supply',
    tier: 'daily',
    kind: 'snapshot',
  },
  {
    name: 'supply',
    path: '/supply',
    tier: 'daily',
    kind: 'snapshot',
    approxBytes: 25_793,
  },
  {
    name: 'economy',
    path: '/economy',
    tier: 'daily',
    kind: 'snapshot',
    query: { days: 365 },
    approxBytes: 4_301,
    note: '39 sink/source types + daily mint/burn; pull max window every time',
  },
  {
    name: 'prestige',
    path: '/prestige',
    tier: 'daily',
    kind: 'snapshot',
    approxBytes: 17_961,
  },
  {
    name: 'territory_cities',
    path: '/territory/cities',
    tier: 'daily',
    kind: 'snapshot',
    note: '203 city-seasons incl. historical inactive ones',
  },
]

export const TIERS = ['live', 'fast', 'hourly', 'daily']

export function endpointsForTier(tier) {
  if (tier === 'all') return ENDPOINTS
  return ENDPOINTS.filter((e) => e.tier === tier)
}

export function endpointByName(name) {
  return ENDPOINTS.find((e) => e.name === name)
}
