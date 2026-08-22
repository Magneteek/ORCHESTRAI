/**
 * How old a capo actually is.
 *
 * Age is not calendar age. A capo is born at 25 and gains a year each season,
 * EXCEPT that an elixir rewind takes years back off, and founders do not age
 * with the season calendar at all. Neither of those events is exposed anywhere
 * in the API, so age cannot be computed from a birth date.
 *
 * Measured 2026-08-22 against the API's own `age` field on /market/listings,
 * across 4,625 listed capos:
 *
 *   founders      0% of our derived ages were right. We said 36, the truth is
 *                 25 for 38 of the 42 we can see and 26 for the other 4.
 *                 Founders were all minted in season 1, so deriving from the
 *                 season calendar aged every one of them by eleven years.
 *   everyone else 78-84% right, and never wrong by more than one year, always
 *                 too old. Every birth season holds exactly two real ages and
 *                 the derivation always picks the higher.
 *
 * The rewind is genuinely unpredictable: capos created in the same minute of the
 * same season carry different ages today (season 11's older and younger groups
 * were both created 08-10T19:13 .. 08-17T11:58). So there is no timing rule to
 * exploit, and no amount of cleverness recovers it. Only the API knows.
 *
 * What this does instead is anchor on the most recent MEASURED age wherever the
 * archive holds one, and derive only from there. Deriving from birth accumulates
 * every rewind a capo has ever had; deriving from the last time we actually saw
 * its age accumulates only the ones since. Where nothing was ever measured, a
 * founder is reported at 25 (right for ~90% of the ones we can check, against 0%
 * before) and everyone else falls back to the old derivation.
 *
 * Every answer carries the basis that produced it, the same way valuation.js
 * publishes how a price was reached, so a page can say which ages are measured
 * and which are inferred rather than presenting both as the same fact.
 */

/** Season boundaries, from when capos of each season actually started arriving. */
function seasonCalendar(db, day) {
  const starts = db.prepare(`
    SELECT season_created AS season, MIN(created_at) AS start
    FROM capos_daily
    WHERE day = ? AND season_created BETWEEN 1 AND 99 AND created_at IS NOT NULL
    GROUP BY season_created HAVING COUNT(*) >= 50
    ORDER BY start`).all(day)
  const current = starts.length ? starts.at(-1).season : null
  const seasonAt = (iso) => {
    if (!iso || !starts.length) return current
    let s = starts[0].season
    for (const st of starts) { if (iso >= st.start) s = st.season; else break }
    return s
  }
  return { starts, current, seasonAt }
}

/**
 * Returns resolve(capo) -> { age, basis }.
 *
 * basis is 'measured' when the API told us the age and no season has turned
 * since, 'measured+seasons' when we are carrying a measured age forward,
 * 'founder_base' for an unlisted founder assumed to be 25, and 'derived' for the
 * old birth-season calculation. Null age where even that is impossible.
 */
export function buildAgeResolver(db, day) {
  const cal = seasonCalendar(db, day)

  // The newest observation of each capo's real age. One row per capo, taken from
  // whichever of its listings was seen most recently.
  const measured = new Map()
  for (const r of db.prepare(`
    SELECT capo_id, age, last_seen_at
    FROM listings
    WHERE age IS NOT NULL AND capo_id IS NOT NULL
    ORDER BY last_seen_at ASC`).all()) {
    // ASC so later rows overwrite earlier ones and the newest wins.
    measured.set(r.capo_id, { age: r.age, at: r.last_seen_at })
  }

  const resolve = ({ capo_id, rarity, is_founder, created_at, season_created }) => {
    const founder = is_founder === 1 || rarity === 'founder'
    const m = capo_id ? measured.get(capo_id) : null

    if (m) {
      // Founders do not age with the calendar, so a measured founder age stands
      // as it is. Everyone else gains a year per season since we last looked.
      if (founder) return { age: m.age, basis: 'measured' }
      const seen = cal.seasonAt(m.at)
      const turned = cal.current != null && seen != null
        ? Math.max(0, cal.current - seen) : 0
      return {
        age: m.age + turned,
        basis: turned ? 'measured+seasons' : 'measured',
      }
    }

    // Never seen listed. A founder is 25 unless somebody burned cards to age it,
    // which is rare: 38 of the 42 we can check are 25. That is wrong for a few,
    // by one year. The birth-season derivation was wrong for all of them, by
    // eleven.
    if (founder) return { age: 25, basis: 'founder_base' }

    if (cal.current == null) return { age: null, basis: 'unknown' }
    const born = created_at ? cal.seasonAt(created_at) : season_created
    if (born == null) return { age: null, basis: 'unknown' }
    return { age: 25 + Math.max(0, cal.current - born), basis: 'derived' }
  }

  return { resolve, currentSeason: cal.current, measuredCount: measured.size }
}
