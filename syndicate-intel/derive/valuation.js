/**
 * Mark-to-market valuation of capo holdings.
 *
 * What this can and cannot value, established 2026-08-17:
 *
 *   Capos      yes, but only the tradeable ones. A capo is tradeable only once
 *              it is minted on chain, and minting tracks rarity exactly: 100% of
 *              rare, epic, legendary, god and founder are minted, 0% of common
 *              and uncommon. That is 10,994 of 90,239 held capos, 12.2%. The
 *              other 88% are not withheld from us by the API, they genuinely
 *              have no secondary market: zero sales in 30 days and no listings.
 *              They are reported as unpriced rather than as zero, because
 *              "no market" and "worth nothing" are different claims.
 *
 *   Equipment  no. /equipment returns 38k items with rarity, stats and
 *              mint_address but no owner field of any kind, so an item cannot be
 *              attributed to a player. Equipment sales are therefore usable as
 *              market colour but never as portfolio value.
 *
 * Prices are medians, not means. Thin cells with one whale sale would otherwise
 * drag a whole rarity band upward, and this number is published per player.
 */

/**
 * Which sale rows are denominated in SOL.
 *
 * /market/listings is tagged in-game (RACKET) or Tensor (SOL), and sales inherit
 * the same split through `source`. Every in-game sale row carries a
 * price_lamports as well as a price_racket (169 of 169), so summing
 * price_lamports across the whole feed books RACKET spending as secondary-market
 * SOL: 21.2 SOL of it, concentrated in founder trades worth 1-2 SOL apiece.
 *
 * Found on 2026-08-22 by comparing our per-player totals against the game's own
 * /market/traders. Of the 46 players holding an in-game sale, 22 match our
 * Tensor-only counts exactly and 2 match the combined counts, the rest having
 * traded since our last snapshot. So the game excludes these rows from SOL
 * trading, and so do we.
 *
 * Keyed on the venue rather than on `price_racket IS NULL`, which also separates
 * the two today. Listings are the counter-example that settles it: 10,934 of
 * 10,936 Tensor listings carry a racket price alongside the lamport one, so a
 * populated price_racket does not mean RACKET-denominated, and a price-column
 * test would one day silently drop real SOL sales.
 */
export const SOL_SALES = "source = 'tensor'"

// Three windows, not one. The 30-day median was the only basis until it was
// checked against the market it claims to describe: epic capos traded at a
// 0.1986 SOL median eight weeks ago and 0.1100 in the last seven days, and
// legendary went 1.1000 to 0.7600 over the same stretch. A 30-day median walks
// down a slope like that roughly two weeks late, so every card was being
// marked ~11-21% above what it was actually fetching.
//
// Seven days is short enough to track the slope and, for the rarities that
// carry the value, still deep enough to mean something: rare 855 sales in the
// last week, epic 198, legendary 26. It is NOT deep enough for god or founder,
// which is exactly what the sample gate below is for -- those fall through to
// the 30- and 90-day windows on their own rather than being repriced off a
// handful of trades.
const RECENT_DAYS = 7
const WINDOW_DAYS = 30
const WIDE_WINDOW_DAYS = 90

// A cell needs this many sales before its own median is trusted.
const MIN_SAMPLES = 5
const MIN_SAMPLES_WIDE = 3

function median(sorted) {
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Comparable prices in lamports, resolved with a deliberate fallback ladder.
 *
 * Rarity plus tier is the sharpest signal we have (a legendary underboss and a
 * legendary recruit are genuinely different assets), but the finer the cell the
 * likelier it is empty, so each step widens rather than inventing a number.
 */
export function buildCompTable(db) {
  // asset_kind 'founder' as well as 'capo': founders are a rarity inside
  // capos_daily but a separate asset_kind in sales, and filtering on 'capo'
  // alone silently drops all 145 of their sales, leaving 729 held founders
  // unpriced despite a live listing floor around 3 SOL.
  const rows = db.prepare(`
    SELECT rarity, tier, price_lamports, sold_at
    FROM sales
    WHERE asset_kind IN ('capo', 'founder')
      AND ${SOL_SALES}
      AND price_lamports > 0
      AND rarity IS NOT NULL
      AND sold_at > date('now', '-${WIDE_WINDOW_DAYS} day')`).all()

  const cutoff = new Date(Date.now() - WINDOW_DAYS * 86400_000).toISOString()
  const recentCutoff = new Date(Date.now() - RECENT_DAYS * 86400_000).toISOString()

  const byRarityTierRecent = {}
  const byRarityRecent = {}
  const byRarityTier = {}
  const byRarity = {}
  const byRarityWide = {}
  for (const r of rows) {
    if (r.sold_at > recentCutoff) {
      ;(byRarityTierRecent[`${r.rarity}|${r.tier}`] ||= []).push(r.price_lamports)
      ;(byRarityRecent[r.rarity] ||= []).push(r.price_lamports)
    }
    if (r.sold_at > cutoff) {
      ;(byRarityTier[`${r.rarity}|${r.tier}`] ||= []).push(r.price_lamports)
      ;(byRarity[r.rarity] ||= []).push(r.price_lamports)
    }
    ;(byRarityWide[r.rarity] ||= []).push(r.price_lamports)
  }

  const finish = (m) => {
    const out = {}
    for (const [k, v] of Object.entries(m)) {
      v.sort((a, b) => a - b)
      out[k] = { median: median(v), n: v.length }
    }
    return out
  }

  return {
    rarityTierRecent: finish(byRarityTierRecent),
    rarityRecent: finish(byRarityRecent),
    rarityTier: finish(byRarityTier),
    rarity: finish(byRarity),
    rarityWide: finish(byRarityWide),
    recent_days: RECENT_DAYS,
    window_days: WINDOW_DAYS,
    wide_window_days: WIDE_WINDOW_DAYS,
  }
}

/**
 * Price one capo, returning the basis used so the number is always auditable
 * rather than arriving as a bare figure.
 */
export function priceCapo(comps, rarity, tier) {
  // Sharpness first, then recency within each level of sharpness: a fresh
  // legendary-underboss median beats a stale one, but a stale one still beats
  // a fresh median that has thrown the tier away.
  const tr = comps.rarityTierRecent[`${rarity}|${tier}`]
  if (tr && tr.n >= MIN_SAMPLES) {
    return { lamports: tr.median, basis: `rarity_tier_${RECENT_DAYS}d`, n: tr.n }
  }
  const cell = comps.rarityTier[`${rarity}|${tier}`]
  if (cell && cell.n >= MIN_SAMPLES) {
    return { lamports: cell.median, basis: 'rarity_tier', n: cell.n }
  }
  const rr = comps.rarityRecent[rarity]
  if (rr && rr.n >= MIN_SAMPLES) {
    return { lamports: rr.median, basis: `rarity_${RECENT_DAYS}d`, n: rr.n }
  }
  const r = comps.rarity[rarity]
  if (r && r.n >= MIN_SAMPLES) {
    return { lamports: r.median, basis: 'rarity', n: r.n }
  }
  const w = comps.rarityWide[rarity]
  if (w && w.n >= MIN_SAMPLES_WIDE) {
    return { lamports: w.median, basis: `rarity_${WIDE_WINDOW_DAYS}d`, n: w.n }
  }
  return { lamports: null, basis: 'no_comps', n: w?.n ?? 0 }
}

/**
 * The price a capo of this rarity actually receives when its tier cell is empty,
 * together with the basis that produced it.
 *
 * Published instead of the raw 30-day cell because the two can differ sharply:
 * god has 4 sales in 30 days and 18 in 90, so it is priced off the wide window,
 * and reporting the 30-day count next to a 90-day price would misstate how thin
 * the evidence is.
 */
export function effectiveRarityPrice(comps, rarity) {
  const rr = comps.rarityRecent[rarity]
  if (rr && rr.n >= MIN_SAMPLES) {
    return { lamports: rr.median, basis: `rarity_${RECENT_DAYS}d`, n: rr.n }
  }
  const r = comps.rarity[rarity]
  if (r && r.n >= MIN_SAMPLES) {
    return { lamports: r.median, basis: `rarity_${WINDOW_DAYS}d`, n: r.n }
  }
  const w = comps.rarityWide[rarity]
  if (w && w.n >= MIN_SAMPLES_WIDE) {
    return { lamports: w.median, basis: `rarity_${WIDE_WINDOW_DAYS}d`, n: w.n }
  }
  return { lamports: null, basis: 'no_comps', n: w?.n ?? 0 }
}

/**
 * Live floor per rarity from open listings.
 *
 * Published next to the comp-based value as a sanity check, not blended into
 * it: asks are what sellers want, sales are what buyers paid, and quietly
 * averaging the two would produce a number that is neither.
 */
export function buildFloorTable(db) {
  const out = {}
  for (const r of db.prepare(`
    SELECT rarity, MIN(price_lamports) floor_lamports, COUNT(*) n
    FROM listings
    WHERE price_lamports > 0 AND rarity IS NOT NULL AND capo_id IS NOT NULL
    GROUP BY rarity`).all()) {
    out[r.rarity] = { floor_lamports: r.floor_lamports, listings: r.n }
  }
  return out
}

/**
 * Value every player's holdings for the given day.
 *
 * Only minted capos are counted as portfolio value. An unminted capo cannot be
 * listed or sold, so assigning it a market price would be asserting a trade that
 * is not possible.
 */
export function valuePortfolios(db, day, comps, houseRefs = []) {
  const house = houseRefs.length ? houseRefs.map((r) => `'${r}'`).join(',') : "''"
  const rows = db.prepare(`
    SELECT owner_ref, rarity, tier, mint_address
    FROM capos_daily
    WHERE day = ? AND owner_ref IS NOT NULL AND owner_ref NOT IN (${house})`).all(day)

  const out = {}
  for (const c of rows) {
    const p = (out[c.owner_ref] ||= {
      lamports: 0,
      priced: 0,
      unpriced: 0,
      untradeable: 0,
      by_rarity: {},
    })

    // Not minted means not listable and not sellable. Counted separately so the
    // roster total still reconciles against the portfolio total.
    if (!c.mint_address) {
      p.untradeable++
      continue
    }

    const px = priceCapo(comps, c.rarity, c.tier)
    if (px.lamports == null) {
      p.unpriced++
      continue
    }
    p.priced++
    p.lamports += px.lamports
    const b = (p.by_rarity[c.rarity] ||= { n: 0, lamports: 0 })
    b.n++
    b.lamports += px.lamports
  }

  const final = {}
  for (const [ref, p] of Object.entries(out)) {
    const byRarity = {}
    for (const [rarity, b] of Object.entries(p.by_rarity)) {
      byRarity[rarity] = { n: b.n, sol: +(b.lamports / 1e9).toFixed(4) }
    }
    final[ref] = {
      portfolio_sol: +(p.lamports / 1e9).toFixed(4),
      priced_capos: p.priced,
      unpriced_capos: p.unpriced,
      untradeable_capos: p.untradeable,
      by_rarity: byRarity,
    }
  }
  return final
}
