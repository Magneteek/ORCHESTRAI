-- Derived layer for the Syndicate archive.
--
-- Everything here is rebuildable from data/raw. Nothing in this database is
-- authoritative: if a schema decision turns out wrong, delete the file and
-- replay the archive. That is the whole reason the ingest writes raw JSON.

-- Provenance. Lets the build skip files already loaded, so it is incremental
-- and safe to re-run at any time.
CREATE TABLE IF NOT EXISTS loaded_files (
  path         TEXT PRIMARY KEY,
  endpoint     TEXT NOT NULL,
  captured_at  TEXT NOT NULL,
  loaded_at    TEXT NOT NULL,
  rows_loaded  INTEGER
);

-- ---------------------------------------------------------------- the moat ---
-- Every leaderboard observation we have ever taken. The API only ever returns
-- lifetime-cumulative values and ignores ?season=, so week-over-week rankings
-- exist ONLY as differences between rows in this table.
CREATE TABLE IF NOT EXISTS leaderboard_obs (
  captured_at        TEXT NOT NULL,
  board              TEXT NOT NULL,          -- 'earnings' | 'victories'
  capo_id            TEXT NOT NULL,
  capo_name          TEXT,
  tier               TEXT,
  owner_display_name TEXT,
  value              INTEGER NOT NULL,
  rank               INTEGER,
  PRIMARY KEY (captured_at, board, capo_id)
);
CREATE INDEX IF NOT EXISTS idx_lb_capo  ON leaderboard_obs (capo_id, board, captured_at);
CREATE INDEX IF NOT EXISTS idx_lb_when  ON leaderboard_obs (board, captured_at);
CREATE INDEX IF NOT EXISTS idx_lb_owner ON leaderboard_obs (owner_display_name, board, captured_at);

-- ---------------------------------------------------------------- listings ---
-- One row per listing, not per observation. Since 2026-08-16 this is the ONLY
-- place capo combat stats appear anywhere in the API, so these rows are the
-- feature source for any pricing model. first/last seen bracket the window the
-- listing was live.
CREATE TABLE IF NOT EXISTS listings (
  listing_id            TEXT PRIMARY KEY,
  capo_id               TEXT,
  item_id               TEXT,
  listing_type          TEXT,
  nft_mint_address      TEXT,
  source                TEXT,
  price_lamports        INTEGER,
  price_racket          INTEGER,
  listed_at             TEXT,
  seller_ref            TEXT,
  seller_display_name   TEXT,
  stat_muscle           INTEGER,
  stat_hustle           INTEGER,
  stat_brains           INTEGER,
  stat_rep              INTEGER,
  stat_grit             INTEGER,
  stat_budget_used      INTEGER,
  power_sum             INTEGER,            -- derived: sum of the five stats
  promo_next_tier       TEXT,
  completed_achievements TEXT,              -- JSON array
  name                  TEXT,
  character_name        TEXT,
  age                   INTEGER,
  rarity                TEXT,
  tier                  TEXT,
  trait_greed           INTEGER,
  trait_finesse         INTEGER,
  trait_passion         INTEGER,
  first_seen_at         TEXT NOT NULL,
  last_seen_at          TEXT NOT NULL,
  observations          INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_listings_capo   ON listings (capo_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings (seller_ref);

-- ------------------------------------------------------------------- sales ---
-- Unique by sale_id. Stat columns are populated only for rows captured before
-- the 2026-08-16 removal; they are NULL for everything after.
CREATE TABLE IF NOT EXISTS sales (
  sale_id             TEXT PRIMARY KEY,
  signature           TEXT,
  mint_address        TEXT,
  capo_id             TEXT,
  item_id             TEXT,
  asset_kind          TEXT,
  price_lamports      INTEGER,
  price_racket        INTEGER,
  usd_price_locked    REAL,
  treasury_fee_usd    REAL,
  buyer_wallet        TEXT,
  seller_wallet       TEXT,
  -- Added by the API on 2026-08-17 and backfilled across all history. These put
  -- wallet and owner_ref in the same row, so player identity no longer has to be
  -- inferred by joining listings to sales on mint_address.
  buyer_ref           TEXT,
  seller_ref          TEXT,
  buyer_display_name  TEXT,
  seller_display_name TEXT,
  sold_at             TEXT,
  source              TEXT,
  rarity              TEXT,
  item_type           TEXT,
  tier                TEXT,
  specialty           TEXT,
  personality         TEXT,
  stat_muscle         INTEGER,
  stat_hustle         INTEGER,
  stat_brains         INTEGER,
  stat_rep            INTEGER,
  stat_grit           INTEGER,
  power_sum           INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sales_when   ON sales (sold_at);
CREATE INDEX IF NOT EXISTS idx_sales_capo   ON sales (capo_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer  ON sales (buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales (seller_wallet);
-- Indexes on buyer_ref / seller_ref are created by migrate() in build.js, not
-- here: on a pre-existing database this file runs before the columns are added,
-- so indexing them at this point would fail.

-- ------------------------------------------------------------------- capos ---
-- One row per capo per day, taken from the last snapshot of that day. This is
-- the account-level portfolio source: owner_ref joins everything together.
CREATE TABLE IF NOT EXISTS capos_daily (
  day                  TEXT NOT NULL,
  capo_id              TEXT NOT NULL,
  owner_ref            TEXT,
  owner_display_name   TEXT,
  mint_address         TEXT,
  rarity               TEXT,
  is_founder           INTEGER,
  tier                 TEXT,
  role                 TEXT,
  specialty            TEXT,
  personality          TEXT,
  name                 TEXT,
  character_name       TEXT,
  trait_greed          INTEGER,
  trait_finesse        INTEGER,
  trait_passion        INTEGER,
  leash_level          INTEGER,
  total_racket_invested INTEGER,
  status               TEXT,
  season_created       INTEGER,
  -- When the capo last reached its CURRENT rank. It is the only promotion
  -- timestamp the API gives (not a full history), so it dates the current tier,
  -- not every step taken to get there. Added by migrate() for existing DBs.
  tier_promoted_at     TEXT,
  created_at           TEXT,
  PRIMARY KEY (day, capo_id)
);
CREATE INDEX IF NOT EXISTS idx_capos_owner ON capos_daily (day, owner_ref);

-- ------------------------------------------------------------------ combat ---
-- One row per player per day (last observation of the day). Counters are
-- lifetime-cumulative, so weekly boards come from differencing days.
CREATE TABLE IF NOT EXISTS combat_daily (
  day                     TEXT NOT NULL,
  player_ref              TEXT NOT NULL,
  display_name            TEXT,
  attacks_total           INTEGER,
  attacks_won             INTEGER,
  attacks_lost            INTEGER,
  defenses_total          INTEGER,
  defenses_held           INTEGER,
  defenses_lost           INTEGER,
  fights_total            INTEGER,
  fights_won              INTEGER,
  passion_flips_for       INTEGER,
  passion_flips_against   INTEGER,
  distinct_opponents      INTEGER,
  districts_contested     INTEGER,
  first_fight_at          TEXT,
  last_fight_at           TEXT,
  PRIMARY KEY (day, player_ref)
);

-- ---------------------------------------------------------------- bounties ---
-- One row per bounty, not per observation, keyed on the id so re-fetching an
-- already-known bounty updates it rather than duplicating it.
--
-- The only per-player RACKET income the API attributes outside side hustles:
-- collector_ref with collector_payout_racket on one side, poster_ref with
-- amount_racket on the other, and a season on every row. That is what makes a
-- net figure possible here and nowhere else.
--
-- Mutable fields are refreshed on conflict because a bounty is posted first and
-- collected later; the collector and collected_at only appear on a later fetch.
-- Everything else is fixed at creation and left alone.
--
-- The feed returns 1000 rows whatever limit says and offers no cursor, exactly
-- like /royalties, so anything older than the most recent 1000 is unreachable
-- from the API. This table is the only place that history accumulates.
CREATE TABLE IF NOT EXISTS bounties (
  bounty_id               TEXT PRIMARY KEY,
  kind                    TEXT,
  city_id                 TEXT,
  city_name               TEXT,
  target_district_id      TEXT,
  season                  INTEGER,
  amount_racket           INTEGER,
  collector_payout_racket INTEGER,
  pool_lamports           INTEGER,
  payout_lamports         INTEGER,
  fee_lamports            INTEGER,
  poster_ref              TEXT,
  poster_display_name     TEXT,
  target_ref              TEXT,
  target_display_name     TEXT,
  collector_ref           TEXT,
  collector_display_name  TEXT,
  collected               INTEGER,
  refunded                INTEGER,
  is_system_seeded        INTEGER,
  created_at              TEXT,
  collected_at            TEXT,
  first_seen_at           TEXT,
  last_seen_at            TEXT
);
CREATE INDEX IF NOT EXISTS idx_bounty_collector ON bounties (collector_ref, season);
CREATE INDEX IF NOT EXISTS idx_bounty_poster    ON bounties (poster_ref, season);
CREATE INDEX IF NOT EXISTS idx_bounty_target    ON bounties (target_ref, season);

-- -------------------------------------------------------------- production ---
-- Cumulative RACKET earned per owner, one row per owner per day.
--
-- /capos/production is lifetime-cumulative and carries no daily breakdown, so
-- "what did this player earn on Tuesday" exists only as the difference between
-- two of our own snapshots. That makes this table the same kind of moat the
-- leaderboard archive is: the game does not publish it, and it cannot be
-- reconstructed after the fact.
--
-- Per owner rather than per capo: 4.2k rows a day against 52k, and the question
-- a profile asks is what the account earned. Per-capo dailies are the same
-- derivation at 12x the storage if they are ever wanted.
--
-- Cumulative, not the delta. Storing the running total means a missed day
-- self-heals (the next delta simply spans two days and is labelled as such),
-- whereas storing deltas would bake a gap in permanently. captured_at rides
-- along so the width of each interval is known rather than assumed to be 24h.
CREATE TABLE IF NOT EXISTS production_owner_daily (
  day             TEXT NOT NULL,
  owner_ref       TEXT NOT NULL,
  captured_at     TEXT,
  lifetime_racket INTEGER,
  earning_capos   INTEGER,
  -- The season counter the game resets at every rollover, and which season it
  -- belonged to. Without these a finished season is unrecoverable: the game
  -- zeroes racket_current_season at 19:00 UTC and keeps no record of the total,
  -- so the last reading we took before the boundary IS the season's figure and
  -- there is nowhere else to get it.
  season          INTEGER,
  season_racket   INTEGER,
  season_capos    INTEGER,
  PRIMARY KEY (day, owner_ref)
);
CREATE INDEX IF NOT EXISTS idx_prod_owner ON production_owner_daily (owner_ref, day);

-- ----------------------------------------------------------------- traders ---
-- The game's own per-player SOL trading totals, one row per player per day.
--
-- We derive the same figures from buyer_ref/seller_ref on the sales feed, and
-- that derivation stays the number the site publishes: it is rebuildable from
-- raw and can be cut to any window, while this endpoint is lifetime-cumulative
-- only. This table exists so the two can be compared on every build. A player
-- who drifts apart from their API row means our sales history is incomplete or
-- our attribution is wrong, and both are worth knowing before publishing a
-- figure with somebody's name on it.
CREATE TABLE IF NOT EXISTS traders_daily (
  day                 TEXT NOT NULL,
  player_ref          TEXT NOT NULL,
  display_name        TEXT,
  sales_sold          INTEGER,
  sol_sold_lamports   INTEGER,
  sales_bought        INTEGER,
  sol_bought_lamports INTEGER,
  net_sol_lamports    INTEGER,
  PRIMARY KEY (day, player_ref)
);

-- ---------------------------------------------------------------- trainers ---
CREATE TABLE IF NOT EXISTS trainers_daily (
  day                        TEXT NOT NULL,
  trainer_ref                TEXT NOT NULL,
  trainer_display_name       TEXT,
  trainer_prestige_level     INTEGER,
  trainer_season_pass_tier   TEXT,
  rate_lamports              INTEGER,
  is_available               INTEGER,
  trainer_jobs_settled       INTEGER,
  trainer_jobs_completed     INTEGER,
  trainer_completion_rate    INTEGER,
  trainer_on_time_rate       INTEGER,
  trainer_avg_turnaround_hours REAL,
  PRIMARY KEY (day, trainer_ref)
);

-- ----------------------------------------------------------------- economy ---
CREATE TABLE IF NOT EXISTS economy_daily (
  day     TEXT PRIMARY KEY,
  minted  INTEGER,
  burned  INTEGER,
  net     INTEGER
);

CREATE TABLE IF NOT EXISTS economy_sinks (
  captured_at TEXT NOT NULL,
  type        TEXT NOT NULL,
  total       INTEGER,
  PRIMARY KEY (captured_at, type)
);

CREATE TABLE IF NOT EXISTS economy_totals (
  captured_at            TEXT PRIMARY KEY,
  total_racket_supply    INTEGER,
  lifetime_earned_racket INTEGER,
  lifetime_spent_racket  INTEGER,
  wallet_count           INTEGER
);

-- ------------------------------------------------------------------ supply ---
CREATE TABLE IF NOT EXISTS supply_daily (
  date          TEXT PRIMARY KEY,
  total         INTEGER,
  burned_total  INTEGER,
  per_rarity    TEXT,   -- JSON
  burned_per_rarity TEXT
);

-- --------------------------------------------------------------- territory ---
-- One row per city-season per day. Cities are seasonal, so the same city name
-- recurs across seasons and city_id is the real key.
CREATE TABLE IF NOT EXISTS cities_daily (
  day                  TEXT NOT NULL,
  city_id              TEXT NOT NULL,
  city_name            TEXT,
  league               TEXT,
  season_number        INTEGER,
  season_started_at    TEXT,
  season_ends_at       TEXT,
  max_players          INTEGER,
  current_player_count INTEGER,
  total_districts      INTEGER,
  districts_occupied   INTEGER,
  is_active            INTEGER,
  PRIMARY KEY (day, city_id)
);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities_daily (day, is_active);

-- ------------------------------------------------------------- open jobs ---
-- The demand side of the trainer market: jobs posted by capo owners waiting for
-- a trainer to fill them. Keyed on job_id with first/last seen like listings,
-- so how long a job waits before it disappears (filled or expired) is
-- measurable from our own snapshots. The API exposes no filled/expired flag.
CREATE TABLE IF NOT EXISTS open_jobs (
  job_id                 TEXT PRIMARY KEY,
  owner_ref              TEXT,
  owner_display_name     TEXT,
  capo_id                TEXT,
  capo_name              TEXT,
  capo_rarity            TEXT,
  allowed_stats          TEXT,
  total_actions          INTEGER,
  consideration_lamports INTEGER,
  house_fee_lamports     INTEGER,
  is_barter              INTEGER,
  payment_capo_rarity    TEXT,
  min_completion_rate    INTEGER,
  deadline               TEXT,
  created_at             TEXT,
  first_seen_at          TEXT,
  last_seen_at           TEXT,
  observations           INTEGER DEFAULT 1
);
