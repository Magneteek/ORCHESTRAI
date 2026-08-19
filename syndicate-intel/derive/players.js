#!/usr/bin/env node
/**
 * Build per-player profiles, keyed on owner_ref.
 *
 * owner_ref is the universal key: verified 2026-08-16 that listings.seller_ref,
 * contracts.trainer_ref and combat.player_ref all live in the same identifier
 * space as capos.owner_ref, and that display names agree across every endpoint
 * (460/460 checked). It is also not derived from the display name, so it
 * survives renames, which the paid `name_change` sink shows do happen.
 *
 * Wallets are given directly by /market/sales as of 2026-08-17, having
 * previously had to be inferred. See resolveWalletLinks.
 *
 * Usage: node derive/players.js
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import {
  buildCompTable, buildFloorTable, valuePortfolios, effectiveRarityPrice,
} from './valuation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DB_PATH = path.join(ROOT, 'data', 'syndicate.db')
const OUT = path.join(ROOT, 'data', 'boards', 'players.json')

// Same treasury exclusion the boards use.
const HOUSE_REFS = ['321736cb06706777a208f2becdd4d959']

/**
 * Where a player stands: their city, its league, and their rank inside it.
 *
 * Territory is read from the raw snapshot rather than SQLite because it has no
 * table yet, and it is the only trustworthy source for this. Fights cannot
 * stand in: raids cross city lines, so 49% of players defend in more than one
 * city, and a fight-derived home disagrees with the territory one more often
 * than it agrees (460 against 301). The territory snapshot is unambiguous by
 * contrast, with no controller holding districts in two cities at once.
 *
 * Only current controllers get a standing, about 788 of 4,768 players. Everyone
 * else holds no ground, and inventing a league for them would be a guess.
 */
function loadTerritory() {
  const dir = path.join(ROOT, 'data', 'raw', 'territory')
  if (!fs.existsSync(dir)) return {}
  const files = []
  ;(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name)
      if (e.isDirectory()) walk(f)
      else files.push(f)
    }
  })(dir)
  if (!files.length) return {}

  let j
  try { j = JSON.parse(zlib.gunzipSync(fs.readFileSync(files.sort().at(-1)))) } catch { return {} }
  while (j.data) j = j.data
  const held = (j.districts || []).filter((d) => d.controller_ref)
  if (!held.length) return {}

  const cities = new Map()
  for (const d of held) {
    if (!cities.has(d.city_id)) {
      cities.set(d.city_id, { name: d.city_name, league: d.city_league, by: new Map() })
    }
    const c = cities.get(d.city_id)
    c.by.set(d.controller_ref, (c.by.get(d.controller_ref) || 0) + 1)
  }

  const out = {}
  for (const c of cities.values()) {
    // Standard competition ranking: equal holdings share a place, and the next
    // player down skips accordingly, so "3rd of 14" never overstates a tie.
    const ranked = [...c.by.entries()].sort((a, b) => b[1] - a[1])
    let place = 0, prev = null
    ranked.forEach(([ref, n], i) => {
      if (n !== prev) { place = i + 1; prev = n }
      out[ref] = {
        city: c.name, league: c.league, districts: n,
        place, of: ranked.length,
      }
    })
  }
  return out
}

const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS wallet_links (
    wallet     TEXT NOT NULL,
    owner_ref  TEXT NOT NULL,
    evidence   INTEGER NOT NULL,
    first_seen TEXT,
    PRIMARY KEY (wallet, owner_ref)
  );
`)

// Pre-existing databases have wallet_links without `source`. Added here rather
// than in build.js because this table is owned by this script.
if (!db.prepare('PRAGMA table_info(wallet_links)').all().some((c) => c.name === 'source')) {
  db.exec(`ALTER TABLE wallet_links ADD COLUMN source TEXT`)
}

/**
 * Map wallet -> player straight from /market/sales.
 *
 * On 2026-08-17 the API added buyer_ref and seller_ref to every sale row and
 * backfilled them across all history, so each row now carries a wallet and an
 * owner_ref together. Measured that day: seller_ref on 99.9% and buyer_ref on
 * 98.6% of 12,000 rows going back to 2026-07-30, with no wallet resolving to
 * more than one player.
 *
 * This replaces the old mint-join inference, which reconstructed the same link
 * by matching a listing's seller_ref to a later sale of the same mint_address.
 * That trick needed a listing snapshot to exist for the mint, so it only ever
 * covered a fraction of sellers and never covered buyers at all. The direct
 * mapping is a strict superset of it, so the inference is retired rather than
 * kept as a fallback.
 *
 * Both sides of the trade are used, which is what makes buyer-side coverage
 * possible for the first time.
 */
function resolveWalletLinks() {
  const links = db.prepare(`
    SELECT wallet, owner_ref, COUNT(*) AS evidence, MIN(sold_at) AS first_seen
    FROM (
      SELECT seller_wallet AS wallet, seller_ref AS owner_ref, sold_at
      FROM sales WHERE seller_wallet IS NOT NULL AND seller_ref IS NOT NULL
      UNION ALL
      SELECT buyer_wallet AS wallet, buyer_ref AS owner_ref, sold_at
      FROM sales WHERE buyer_wallet IS NOT NULL AND buyer_ref IS NOT NULL
    )
    GROUP BY wallet, owner_ref`).all()

  // A wallet pointing at two players should now be impossible, since the API
  // states the pairing rather than us deducing it. Kept as an assertion: if it
  // ever fires, their data changed and we should not publish an identity claim
  // we cannot stand behind.
  const perWallet = {}
  for (const l of links) (perWallet[l.wallet] ||= []).push(l)
  const clean = []
  let conflicts = 0
  for (const rows of Object.values(perWallet)) {
    if (rows.length === 1) clean.push(rows[0])
    else conflicts++
  }

  db.exec('BEGIN')
  db.exec('DELETE FROM wallet_links')
  const ins = db.prepare(
    `INSERT INTO wallet_links (wallet, owner_ref, evidence, first_seen, source)
     VALUES (?,?,?,?,'sales_ref')`)
  for (const l of clean) ins.run(l.wallet, l.owner_ref, l.evidence, l.first_seen)
  db.exec('COMMIT')

  return { resolved: clean.length, conflicts }
}

/**
 * Realized SOL trading, per player.
 *
 * Keyed on the refs in the sale row itself, not on wallet_links. A player whose
 * wallet we somehow failed to link still gets counted, and buys count the same
 * way sells do, which they did not under the wallet-join version.
 */
function tradingByPlayer() {
  const rows = db.prepare(`
    SELECT owner_ref,
           SUM(sol_in) AS sol_in, SUM(sol_out) AS sol_out,
           SUM(sells) AS sells,   SUM(buys) AS buys
    FROM (
      SELECT seller_ref AS owner_ref, price_lamports AS sol_in, 0 AS sol_out,
             1 AS sells, 0 AS buys
      FROM sales WHERE seller_ref IS NOT NULL
      UNION ALL
      SELECT buyer_ref AS owner_ref, 0 AS sol_in, price_lamports AS sol_out,
             0 AS sells, 1 AS buys
      FROM sales WHERE buyer_ref IS NOT NULL
    )
    GROUP BY owner_ref`).all()
  const out = {}
  for (const r of rows) {
    const solIn = r.sol_in ?? 0
    const solOut = r.sol_out ?? 0
    out[r.owner_ref] = {
      sol_received: solIn / 1e9,
      sol_spent: solOut / 1e9,
      // Realized only, and secondary-market only: pack purchases never appear
      // in /market/sales, so money spent entering the game is not counted.
      realized_sol: (solIn - solOut) / 1e9,
      sells: r.sells,
      buys: r.buys,
    }
  }
  return out
}

function main() {
  const day = db.prepare('SELECT MAX(day) d FROM capos_daily').get().d
  const link = resolveWalletLinks()
  console.log(`wallet links: ${link.resolved} resolved, ${link.conflicts} conflicts dropped`)

  const house = HOUSE_REFS.map((r) => `'${r}'`).join(',')

  // Roster, per player.
  const roster = db.prepare(`
    SELECT owner_ref,
           MAX(owner_display_name) AS display_name,
           COUNT(*) AS capos,
           SUM(CASE WHEN rarity='god' THEN 1 ELSE 0 END) AS god,
           SUM(CASE WHEN rarity='legendary' THEN 1 ELSE 0 END) AS legendary,
           SUM(CASE WHEN rarity='founder' THEN 1 ELSE 0 END) AS founder,
           SUM(CASE WHEN rarity='epic' THEN 1 ELSE 0 END) AS epic,
           SUM(CASE WHEN rarity='rare' THEN 1 ELSE 0 END) AS rare,
           SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN mint_address IS NOT NULL THEN 1 ELSE 0 END) AS minted,
           SUM(CASE WHEN tier='boss' THEN 1 ELSE 0 END) AS boss,
           SUM(CASE WHEN tier='underboss' THEN 1 ELSE 0 END) AS underboss,
           SUM(CASE WHEN tier='lieutenant' THEN 1 ELSE 0 END) AS lieutenant,
           SUM(CASE WHEN tier='captain' THEN 1 ELSE 0 END) AS captain,
           SUM(CASE WHEN tier='soldier' THEN 1 ELSE 0 END) AS soldier,
           SUM(CASE WHEN tier='recruit' THEN 1 ELSE 0 END) AS recruit,
           SUM(CASE WHEN julianday('now') - julianday(tier_promoted_at) <= 7 THEN 1 ELSE 0 END) AS promoted_7d,
           SUM(total_racket_invested) AS racket_invested
    FROM capos_daily
    WHERE day = ? AND owner_ref IS NOT NULL AND owner_ref NOT IN (${house})
    GROUP BY owner_ref`).all(day)

  const territory = loadTerritory()

  const combat = {}
  for (const c of db.prepare(
    `SELECT * FROM combat_daily WHERE day = (SELECT MAX(day) FROM combat_daily)`).all()) {
    combat[c.player_ref] = {
      fights: c.fights_total, won: c.fights_won,
      win_rate: c.fights_total ? +(100 * c.fights_won / c.fights_total).toFixed(1) : null,
      attacks: c.attacks_total, attacks_won: c.attacks_won,
      defenses: c.defenses_total, defenses_held: c.defenses_held,
      hold_rate: c.defenses_total ? +(100 * c.defenses_held / c.defenses_total).toFixed(1) : null,
      opponents: c.distinct_opponents, districts: c.districts_contested,
      first_fight_at: c.first_fight_at, last_fight_at: c.last_fight_at,
    }
  }

  const trainers = {}
  for (const t of db.prepare(
    `SELECT * FROM trainers_daily WHERE day = (SELECT MAX(day) FROM trainers_daily)`).all()) {
    trainers[t.trainer_ref] = {
      prestige: t.trainer_prestige_level,
      jobs_completed: t.trainer_jobs_completed,
      jobs_settled: t.trainer_jobs_settled,
      completion_rate: t.trainer_completion_rate,
      on_time_rate: t.trainer_on_time_rate,
      turnaround_hours: t.trainer_avg_turnaround_hours,
      rate_sol: t.rate_lamports ? t.rate_lamports / 1e9 : null,
    }
  }

  const wallets = {}
  for (const w of db.prepare('SELECT wallet, owner_ref FROM wallet_links').all()) {
    ;(wallets[w.owner_ref] ||= []).push(w.wallet)
  }

  const listings = {}
  for (const l of db.prepare(`
    SELECT seller_ref, COUNT(*) n, SUM(price_lamports) lamports
    FROM listings WHERE seller_ref IS NOT NULL GROUP BY seller_ref`).all()) {
    listings[l.seller_ref] = { active: l.n, asking_sol: (l.lamports || 0) / 1e9 }
  }

  // Name history falls out of the archive for free, because every snapshot
  // stores the display name next to the stable ref.
  const names = {}
  for (const n of db.prepare(`
    SELECT owner_ref, owner_display_name AS name, MIN(day) AS first_day, MAX(day) AS last_day
    FROM capos_daily WHERE owner_display_name IS NOT NULL
    GROUP BY owner_ref, owner_display_name`).all()) {
    ;(names[n.owner_ref] ||= []).push({ name: n.name, from: n.first_day, to: n.last_day })
  }

  // Season prize winnings, from the on-chain reward capture. Realized USD income,
  // per player, across every captured season. Keyed on owner_ref like everything
  // else. Absent file (no capture yet) degrades to an empty map, not an error.
  // Read the ledger's per-player all_time rows rather than re-summing the season
  // bursts. Re-summing is what made a profile disagree with the Prizes page: the
  // board counted every treasury payout while a profile counted only season
  // bursts, so daily prizes and bounties went missing on one surface. One source,
  // one number. by_season is still built from the season list for the breakdown.
  const prizeByRef = {}
  try {
    const led = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'rewards', 'season-ledger.json'), 'utf8'))
    for (const w of led.all_time || []) {
      if (!w.owner_ref) continue
      prizeByRef[w.owner_ref] = {
        total_usd: w.usdc,
        season_usd: w.season_usdc,
        daily_usd: w.daily_usdc,
        bounty_usd: w.bounty_usdc,
        other_usd: w.other_usdc,
        // SOL, deliberately not converted: there is no price feed here.
        sol_bounties: w.sol_bounties,
        seasons_won: w.seasons_won,
        by_season: [],
        latest_usd: 0,
      }
    }
    for (const s of led.seasons || []) {
      for (const w of s.ledger || []) {
        if (!w.owner_ref || !prizeByRef[w.owner_ref]) continue
        prizeByRef[w.owner_ref].by_season.push({ season: s.season, usd: w.usdc })
      }
    }
    const latest = (led.seasons || [])[0]?.season
    for (const p of Object.values(prizeByRef)) {
      p.by_season.sort((a, b) => b.season - a.season)
      p.latest_usd = p.by_season.find((x) => x.season === latest)?.usd ?? 0
    }
  } catch { /* no capture yet */ }

  const trading = tradingByPlayer()

  const comps = buildCompTable(db)
  const floors = buildFloorTable(db)
  const holdings = valuePortfolios(db, day, comps, HOUSE_REFS)

  /**
   * SOL net position: cash already realized plus the mark on what is still held.
   *
   * The two halves do not double count. realized_sol is a cash flow (received
   * from sales, less paid on buys) and portfolio_sol is the current value of the
   * inventory those buys produced, so a capo bought for 0.10 and still held
   * shows as -0.10 realized and +0.13 held, netting the unrealized gain.
   *
   * What it deliberately does not include is pack and fiat entry cost, which the
   * API and the chain both withhold. A player who spent nothing and one who
   * spent thousands on packs are indistinguishable here, so this is a SOL
   * position, not lifetime profit. Null when the player has neither side, so the
   * page can say "no position" rather than render a zero that looks like
   * breaking even.
   */
  function netPosition(ref) {
    const t = trading[ref]
    const h = holdings[ref]
    const prize = prizeByRef[ref]
    const hasHoldings = h && h.priced_capos > 0
    if (!t && !hasHoldings && !prize) return null
    const realized = t?.realized_sol ?? 0
    const held = hasHoldings ? h.portfolio_sol : 0
    return {
      realized_sol: +realized.toFixed(4),
      portfolio_sol: +held.toFixed(4),
      net_sol: +(realized + held).toFixed(4),
      // Prize winnings are realized USD income, kept in their own currency rather
      // than blended into the SOL figure (there is no price feed to convert on).
      // With pack spend still missing, this is the one hard-money inflow we can
      // book, so it is the closest thing to real profit on the page.
      prize_usd: prize ? prize.total_usd : 0,
      excludes: 'pack and fiat entry cost, which is not exposed anywhere',
    }
  }

  const players = roster.map((r) => ({
    ref: r.owner_ref,
    name: r.display_name,
    roster: {
      capos: r.capos, active: r.active, minted: r.minted,
      god: r.god, legendary: r.legendary, founder: r.founder,
      epic: r.epic, rare: r.rare,
      racket_invested: r.racket_invested,
    },
    ranks: {
      // The rank ladder, high to low. Rank is earned by promotion (paid in
      // RACKET), so promotion_spend_racket below is the cost of climbing it.
      boss: r.boss, underboss: r.underboss, lieutenant: r.lieutenant,
      captain: r.captain, soldier: r.soldier, recruit: r.recruit,
      promoted_7d: r.promoted_7d,
      // total_racket_invested is the RACKET a player has sunk into promotions,
      // one of the only per-account RACKET figures the API exposes.
      promotion_spend_racket: r.racket_invested,
    },
    combat: combat[r.owner_ref] ?? null,
    territory: territory[r.owner_ref] ?? null,
    trainer: trainers[r.owner_ref] ?? null,
    listings: listings[r.owner_ref] ?? null,
    wallets: wallets[r.owner_ref] ?? [],
    trading: trading[r.owner_ref] ?? null,
    holdings: holdings[r.owner_ref] ?? null,
    position: netPosition(r.owner_ref),
    prizes: prizeByRef[r.owner_ref] ?? null,
    names: (names[r.owner_ref] ?? []).length > 1 ? names[r.owner_ref] : null,
  }))

  players.sort((a, b) => (b.combat?.won ?? 0) - (a.combat?.won ?? 0) || b.roster.capos - a.roster.capos)

  const payload = {
    generated_at: new Date().toISOString(),
    as_of_day: day,
    player_count: players.length,
    wallets_resolved: Object.keys(wallets).length,
    position_players: players.filter((p) => p.position).length,
    position_net_positive: players.filter((p) => p.position?.net_sol > 0).length,
    // Stated on the page: this is what a visitor needs in order to read a
    // missing PnL figure correctly rather than as a zero.
    coverage: {
      racket_earnings:
        'not available: /leaderboards is capped at 50 capos, so per-account RACKET earnings are not exposed',
      sol_trading:
        'realized secondary-market trading only, attributed per player from the buyer_ref and ' +
        'seller_ref on each sale; pack purchases are not in the API so money spent entering the ' +
        'game is not counted',
      holdings:
        'mark-to-market on tradeable capos only, priced at the median comparable sale by rarity ' +
        'and tier. Only minted capos are tradeable (all rare and above, none common or uncommon), ' +
        'so roughly 12% of held capos carry a value here; the rest are counted as untradeable ' +
        'rather than as zero. Equipment is excluded entirely because /equipment exposes no owner ' +
        'field, so items cannot be attributed to a player.',
      net_position:
        'realized SOL plus the mark on capos still held. A genuine SOL position, but not ' +
        'lifetime profit: pack and fiat entry cost is missing on the spend side, so a player ' +
        'who bought in heavily and one who started free look the same.',
      pack_spend:
        'not available at any price. Packs are bought with SOL, USDC, card, Contraband or RACKET ' +
        'and none of it is exposed: /market/sales carries secondary trades only (sources tensor ' +
        'and in_game), /economy is a system-wide RACKET aggregate, and on chain the capos arrive ' +
        'as compressed-NFT mints the game pays for, so no purchase leaves the player wallet. Any ' +
        'PNL here is therefore trading PNL, not lifetime profit.',
    },
    market: {
      comp_window_days: comps.window_days,
      capo_medians_sol: Object.fromEntries(
        [...new Set([
          ...Object.keys(comps.rarity), ...Object.keys(comps.rarityWide),
        ])].map((k) => {
          const p = effectiveRarityPrice(comps, k)
          return [k, {
            median_sol: p.lamports == null ? null : +(p.lamports / 1e9).toFixed(4),
            sales: p.n,
            basis: p.basis,
          }]
        }),
      ),
      listing_floors_sol: Object.fromEntries(
        Object.entries(floors).map(([k, v]) => [
          k, { floor_sol: +(v.floor_lamports / 1e9).toFixed(4), listings: v.listings },
        ]),
      ),
    },
    players,
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(payload))
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0)
  console.log(`players: ${players.length}, wallets resolved: ${Object.keys(wallets).length}`)
  console.log(`with trading data: ${Object.keys(trading).length}`)
  const valued = players.filter((p) => (p.holdings?.portfolio_sol ?? 0) > 0)
  const totalSol = valued.reduce((s, p) => s + p.holdings.portfolio_sol, 0)
  console.log(
    `holdings: ${valued.length} players with a tradeable portfolio, ` +
    `${totalSol.toFixed(1)} SOL total`)
  const pos = players.filter((p) => p.position)
  const up = pos.filter((p) => p.position.net_sol > 0).length
  console.log(
    `position: ${pos.length} players with a SOL position, ${up} net positive, ` +
    `${(pos.reduce((s, p) => s + p.position.net_sol, 0)).toFixed(1)} SOL combined`)
  console.log(`written ${path.relative(ROOT, OUT)} (${kb} KB)`)
  db.close()
}

main()
