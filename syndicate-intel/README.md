# syndicate-intel

Community data archive and analytics for [The Syndicate](https://thesyndicate.games).

The game is removing **Total Player Earnings** and **Account PNL** from the
official site for legal reasons, and has invited community members to rebuild
those views against the public data API. This is the data layer for that.

## Why an archive, not just an API client

Every earnings figure the API returns is **lifetime cumulative**, and time
filtering does not work: `/leaderboards?season=11` and `?season=0` return
byte-identical arrays (verified 2026-08-16, the `season` field echoes your input
and is otherwise ignored).

So "this week's top 10 earners" cannot be answered by any single API call. It
can only be answered by snapshotting daily and diffing consecutive snapshots.

That makes the archive the whole product. Nobody can reconstruct last week's
numbers after the fact, including the game itself unless it was already
recording. **Every day the ingest does not run is history that is gone
permanently.** Every design decision below follows from that.

## Architecture

```
API ──> raw gzipped JSON on disk (source of truth) ──> derived tables ──> site
```

The ingest has **no database dependency**. Raw JSON on disk is authoritative and
every derived table is rebuildable from it. If Postgres is down we still never
lose a day; if a schema decision turns out wrong we replay the archive rather
than losing the history it was built from.

Other properties that exist for the same reason:

- **Atomic writes.** Snapshots are written to `.tmp` and renamed, so a crash
  mid-write cannot leave a corrupt file in the archive.
- **Retry with backoff** (5s/15s/45s/90s), for the "Mac is awake but the network
  is not back yet" window after sleep. This already caught a real timeout during
  the initial backfill.
- **Per-endpoint state is saved after every endpoint**, not at the end of a run,
  so a crash halfway through never replays work already safely on disk.
- **One endpoint failing never aborts the rest of the run.**
- **Payload-only hashing.** Every response embeds a fresh `as_of` timestamp, so
  hashing raw bytes would make every snapshot look changed and defeat dedup
  entirely. We hash `data` only; unchanged snapshots are logged, not restored.
- **Gap detection.** Append-only feeds track a high-water mark and page back
  until they reach known data. If a feed pages to its limit without getting
  there, the run is flagged `possible_gap` rather than silently truncated.

## Layout

```
ingest/endpoints.js     endpoint registry, polling tiers, known API quirks
ingest/snapshot.js      the ingest itself
ingest/verify.js        health check; exits non-zero when something needs attention
derive/schema.sql       derived SQLite schema
derive/build.js         raw archive -> SQLite; incremental and idempotent
derive/leaderboards.js  the boards
derive/refresh.sh       build + regenerate every board
launchd/install.sh      installs the schedule as user agents
data/raw/<endpoint>/<date>/<timestamp>.json.gz
data/runs.jsonl         append-only run log
data/state.json         high-water marks and last-payload hashes
data/syndicate.db       derived database (disposable, rebuildable)
data/boards/*.json      generated boards
```

## The derived layer

SQLite via Node 22's built-in `node:sqlite`, so there are no dependencies to
install and no server to keep up.

```bash
node derive/build.js                          # incremental, skips loaded files
node derive/build.js --rebuild                # throw it away and replay raw
node derive/leaderboards.js --period 7d --top 25
bash derive/refresh.sh                        # both, for every period
```

`build.js` is incremental (a `loaded_files` table records what has been
consumed) and every insert is an upsert, so re-running is always safe. Each file
loads in its own transaction: a failure rolls back and the file is simply not
marked loaded, so the next run retries it.

One subtlety worth keeping: stat columns update with
`COALESCE(excluded.stat_x, stat_x)`, never a plain assignment. Since the API is
actively dropping fields, a later stat-less copy of a row must not erase stats
we captured earlier.

### Boards currently produced

Capo-scoped: top earners (lifetime), top earners (gained in window, from our own
snapshot diffs), top fighters by net victories.

Account-scoped: most fights won, best win rate, best defence rate (full 3,665
player population, not a truncated top-N), trainers by jobs completed, trainers
by reliability, largest rosters, rarest rosters, most RACKET invested.

Plus an economy summary (mint/burn, largest sinks, supply totals).

### Two honesty rules the boards enforce

**Period boards report the window we actually have, never the window
requested.** Ask for 7d three hours in and you get a board labelled `0.43h (5
snapshots) - NOT the full 7d`. The alternative, quietly presenting a partial
window as a week, is exactly the kind of thing that would destroy trust in a
community-run replacement for official numbers.

**Boards we cannot honestly build are emitted as explicit `unavailable` entries
with the reason**, rather than being silently omitted. See the list below.

### House accounts

`TheSyndicate` (`321736cb0670...`) is excluded from account boards. Evidence:
it holds 334 of the 729 founder capos (46% of total supply), all 812 of its
capos are status `collectible` with zero active, it has only 174k RACKET
invested across them, and it appears in neither combat records nor the earnings
leaderboard. The exclusion and its evidence are emitted in the board output
rather than applied silently.

## Setup

```bash
echo "SYNDICATE_API_KEY=syn_live_..." > .env    # server-side only, never ship to a client
node ingest/snapshot.js --tier all --backfill   # first run, pulls all reachable history
bash launchd/install.sh                          # install the schedule
node ingest/verify.js                            # confirm health
```

## Schedule

| Tier | Cadence | Endpoints |
|---|---|---|
| fast | 5 min | leaderboards, market_listings, market_sales, royalties |
| hourly | hourly at :05 | combat_players, combat_fights, contracts, contracts_open_jobs, bounties, boosts, territory |
| daily | 04:15 | capos, equipment, equipment_supply, supply, economy, prestige, territory_cities |
| derive | 15 min | rebuild SQLite + regenerate all boards |
| verify | 09:00 | health check |

`fast` uses `StartInterval` because a missed window self-heals via the
high-water mark. `daily` uses `StartCalendarInterval`, which catches up a run
missed while the Mac was asleep; a skipped daily run would permanently lose that
day's capo roster.

Storage: the raw archive runs roughly 20–30 GB/year, dominated by capos (~9 MB/day
compressed) and market listings.

The derived database grows faster than the archive it is built from, because
`capos_daily` adds ~89k rows every day (~32M rows/year). That is fine for SQLite
but the file will reach several GB. It is disposable by design; if it becomes
awkward, narrow `capos_daily` to changed rows only and rebuild from raw. The
archive is what must be preserved, not this.

## The public site

Live at **https://syndicate-intel.vercel.app**, currently `noindex` and not
linked from anywhere, so it is shareable but not discoverable. `/players.html`
is the player directory and profiles.

### owner_ref is the universal key

Verified 2026-08-16: `listings.seller_ref` (460/461), `contracts.trainer_ref`
(102/102) and `combat.player_ref` (3404/3702) all live in the same identifier
space as `capos.owner_ref`, and display names agree across endpoints on
**460 of 460** refs checked. The combat misses are players who currently own
zero capos, which is expected given 50,326 capos have been burned.

`owner_ref` is also **not** derived from the display name (checked against md5
of the raw and lowercased name), so it survives renames. `/economy` shows a paid
`name_change` sink, so renames do happen. Everything is therefore keyed on the
ref, never the name, and name history falls out of the archive for free because
every snapshot stores the name beside the ref.

### Wallets are inferred, not given

The API never links a wallet to a player. But `/market/listings` exposes
`(nft_mint_address, seller_ref)` and `/market/sales` exposes
`(mint_address, seller_wallet)`. If we archived a listing for mint M by player
R, and M later sold with seller wallet W, then W belongs to R.

Neither endpoint reveals this alone; only holding both over time does, which is
another thing the archive buys. Wallets resolving to more than one player are
dropped rather than guessed. The map is recomputed in full each run so new
listings retroactively resolve older sales, and it grows on its own.

```bash
node web/build-site.js            # noindex (default)
SITE_INDEXABLE=1 node web/build-site.js   # opt in to being crawlable
bash web/deploy.sh                # deploy if content changed
```

Two outputs are generated from the same content:

| File | For | Why |
|---|---|---|
| `web/dist/index.html` | Artifact publishing | A fragment. The Artifact publisher supplies its own doctype/html/head/body, so emitting our own would nest documents. |
| `web/dist/site/index.html` | Vercel / any static host | A complete standards-mode document. Without a doctype the browser falls back to quirks mode, where legacy box-model rules can silently alter layout. |

Board data is inlined at build time rather than fetched, so the page works from
a file path, any static host, or a sandboxed viewer with no network access.

**Indexing is opt-in.** `SITE_INDEXABLE` defaults to off and controls both the
`robots` meta tag and `robots.txt` together, so forgetting the flag can never
accidentally expose the page to search engines. Flipping it on is a rebuild and
a redeploy, nothing more.

**Deploys are content-addressed.** The generator stamps a fresh `generated_at`
on every run, so a naive schedule would fire ~96 identical deploys a day.
`deploy.sh` hashes the page with the timestamps stripped and skips when nothing
actually changed. The hash is recorded only on a successful deploy, so a failure
retries on the next cycle rather than being marked done.

Deployment is opt-in via a gitignored `deploy.conf` at the project root:

```
VERCEL_PROJECT=syndicate-intel
VERCEL_SCOPE=krisbal
```

Without that file the pipeline runs normally and simply skips deploying, so a
fresh clone never tries to publish to someone else's account. A deploy failure
is reported but does not fail the refresh, because a broken deploy must not look
like a broken data pipeline.

### The launchd PATH trap

launchd starts jobs with a bare `PATH` of `/usr/bin:/bin:/usr/sbin:/sbin`, on
which **neither `node` nor `vercel` resolves** on this machine. The ingest agents
avoid this by invoking node through an absolute path, but `refresh.sh` shells out
to both by name, so `install.sh` captures the installing shell's `PATH` into the
derive agent's `EnvironmentVariables`.

Both scripts also check for their tools up front and exit with an explicit
message, because the failure mode this replaces was an empty log and a silently
stale site.

## API quirks worth knowing

Discovered empirically on 2026-08-16. The published docs are wrong in several
places, so treat the API as observed rather than as documented.

| Endpoint | Documented | Actual |
|---|---|---|
| `/capos` | "~3–4k rows" | **89,237 rows, 58 MB**, no pagination, no `limit` |
| `/equipment` | "~2.3k" | **37,433 rows** |
| `/territory` | "~2k districts" | **6,428 rows** |
| `/leaderboards` | `?season=` filter | **ignored**; always lifetime, capped at 50 rows |
| `/royalties` | `?limit=`, `?since=` | **no cursor**, hard-capped at 1000 rows/call |
| `/market/sales` | `?limit=`, `?cursor=` | works as documented; full history backfillable |

`/royalties` having no cursor means history before the most recent 1000 receipts
is permanently unreachable. The `rollup` block still gives lifetime totals.

### The 2026-08-16 stat removal (observed live)

Between **13:32 and 14:24 UTC on 2026-08-16**, mid-session, the game deployed a
change that stripped `stat_muscle`, `stat_hustle`, `stat_brains`, `stat_rep`,
`stat_grit` and `power_sum` from `/market/sales`. Field order is otherwise
identical; the stats were simply excised. Verified non-intermittent across
repeated polls, at every `limit` value.

Consequences:

- **`/market/listings` is now the only source of capo combat stats in the
  entire API.** `/capos` carries `trait_greed/finesse/passion` but has never
  carried the five combat stats.
- Once a capo sells and delists, its stats disappear from the API permanently
  unless we snapshotted the listing first. This is why `fast` polls every 5
  minutes rather than 15.
- The appraisal training set is now built by joining archived **listings**
  (features) to subsequent **sales** (labels) on `capo_id`. It can no longer be
  built from sales alone.
- Historical stats-at-time-of-sale are **not recoverable**. The backfill ran at
  14:13, roughly 40 minutes after the change, so all 27,573 historical sales
  came back stat-less. A single 50-row sample captured at 13:32 survives at
  `data/raw/market_sales_prestat_relic/` and is the only stats-bearing sales
  data in the archive.

This is the thesis of the project demonstrating itself within a few hours: the
data is being withdrawn, and only what was already archived survives.

### Junk rows in sale history

29 of 27,573 backfilled sales carry pre-2026 timestamps (one 2022, 28 from
2024-07-28) on a game whose own supply history starts 2026-05-13, with
suspiciously round prices (0.5, 1, 2.5, 10 SOL). Treat as test data and filter
before any modelling; a stray 10 SOL row would badly skew a price model.

## What cannot be built yet

These need changes on the game's side, and are the gap list to send them:

1. **Account-level total earnings.** No endpoint aggregates RACKET earnings per
   account. `/leaderboards` is capo-scoped and capped at 50 rows. With 4,048
   owners averaging 22 capos each, a large holder of mid-tier capos is entirely
   invisible. This is precisely the datapoint being removed from the site, and
   no third party can rebuild it without an API change.
2. **Top hustlers.** 33,635 capos carry `role: "hustler"` but no hustle earnings
   are exposed at capo or account level.
3. **Time-scoped leaderboards.** Make `?season=` filter, or add `?since=`.
   Until then, weekly boards come only from our own snapshot diffs.
4. **Deeper leaderboards.** 50 rows across 4,048 owners is thin.
5. **Full account PNL.** Realized SOL trading PNL is computable from
   `/market/sales`, but the wallet-to-account bridge runs through
   `mint_address` and only **11,157 of 89,237 capos (12.5%)** have ever been
   minted on chain. Primary spend (packs, Stripe) is not exposed at all.

## Legal note

The game removed these figures on legal advice. A raw API feed is a different
risk posture from a public league table on the official domain, but that is
their counsel's call, not ours. Confirm what they are comfortable with before
publishing per-account earnings or PNL, and confirm the API terms permit
redistribution of player display names and wallet addresses.
