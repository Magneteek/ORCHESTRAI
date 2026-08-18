# AI Insights — test list

For manual testing of the four AI Insights tabs. Written 2026-08-18, covering
everything landed 2026-08-17 and 2026-08-18.

## Before you start

1. Docker containers must be up: `docker start facebook-ads-postgres facebook-ads-redis`.
   Redis is required, not optional — every AI route calls the rate limiter first
   and returns 500 if Redis is down.
2. `cd facebook-ads-manager/frontend && npx next dev -p 3003`
3. Log in at http://localhost:3003 as kristjan@krisbal.com
4. Go to Dashboard > AI Insights, choose **DELETEREVIEWS>NL MAIN AD ACC** in the
   account selector. It is the only account with performance data; the others
   will show empty states, which is correct.

Each generate call costs Anthropic credits and takes 30-90 seconds. Results
cache (24h for predictions, 48h for audience), so a second click inside that
window returns the stored answer rather than a new one.

## 1. Performance Predictions

- [ ] Tab loads with a confidence score and a 7-day forecast table.
- [ ] The forecast columns read **Leads** and **Cost/lead**, not ROAS and CTR.
      This is a lead-gen account with no purchase revenue; a ROAS column here
      would read 0.00x on every row.
- [ ] Daily lead figures are whole numbers. A day cannot produce 1.2 leads.
- [ ] All money is EUR, never "$".
- [ ] Recommendations are numbered by priority, and each carries Worth, Effort
      and Evidence.
- [ ] No recommendation tells you to reactivate a campaign that is already
      running, and none tells you to fix revenue attribution.
- [ ] The stated combined outcome appears once. The individual "Worth" figures
      must not be addable into a number larger than the account spends.
- [ ] Click Refresh. It regenerates (or returns the cached answer if you ran it
      less than 24h ago).

## 2. Anomaly Detection

- [ ] Tab loads. An empty state is a legitimate result — it means nothing
      crossed a threshold, not that the feature is broken.
- [ ] Click Refresh to run detection on demand. Still empty is still fine.

## 3. Copy Optimization

This tab could not generate anything until today. It had one stored result from
2026-06-12 and no control able to replace it.

- [ ] There is an **Analyse Ad Copy** / **Analyse Again** button. (There was
      none before.)
- [ ] Clicking it returns a result within ~60s without you supplying anything.
      It picks the highest-spending ad that has delivery.
- [ ] The analysis is in the ad's own language (Dutch for this account).
- [ ] It names the actual ad copy it analysed — you should recognise the
      headline and body text from the live ad.
- [ ] Strengths and weaknesses reference the real CTR (~0.88% link CTR on
      ~44,000 impressions), not invented figures.
- [ ] Suggestions come with reasoning, and A/B recommendations with a
      hypothesis.
- [ ] On an account with no delivering ad, the button shows a readable reason
      rather than doing nothing.

## 4. Audience Insights

This is where the ROAS fix landed. Everything below except the fatigue banner
was being generated on every run and never displayed.

- [ ] There is a **Generate Insights** / **Regenerate** button. (There was none
      before.)
- [ ] Four new sections render: Top Performing Segments, Underperforming
      Segments, Expansion Opportunities, Targeting Recommendations.
- [ ] **No ROAS appears anywhere on this account.** Segments show Spend,
      Conversions and Cost/lead.
- [ ] Nothing in the prose mentions an "efficiency index", a proxy, or a
      substitute metric. That was the bug: ROAS was a required field, so the
      model invented a number to fill it and explained the substitution.
- [ ] Money is EUR throughout.
- [ ] Segments are real Meta breakdowns — age bands, gender, country, device,
      placement. Expect roughly: women around EUR 8 per lead against a EUR 15.51
      blended figure, Instagram Stories cheapest, Facebook Reels worst at around
      EUR 49.
- [ ] Expansion opportunities show an expected cost per lead, not an expected
      ROAS.
- [ ] The fatigue banner appears only if fatigue was detected; absent is fine.

## Known open items — do not report these as new

- **Lookalike recommendations return nothing on this account.** They are a
  hardcoded heuristic, separate from the AI analysis, requiring a segment with
  more than 50 conversions; the account has 33 leads total. The AI's own
  expansion list does propose a 1% lookalike, so the useful version of this is
  present. The heuristic list is not rendered in the UI at all.
- **Budget allocation analysis is computed and returned by the API but never
  displayed.** Same shape of gap the segments had until today.
- `/api/analytics` (the full route behind Dashboard > Analytics) still
  live-fetches Facebook on every load. Only `/api/analytics/simple` reads the DB.
- Sync upserts but never deletes, so the DB holds more campaigns than are live
  on Facebook.
- `Campaign.bidStrategy` exists in the DB and schema with no backing migration.
- Template launch (`lib/templates/launch.ts`) still returns a mock campaign.
  Templating is deliberately deferred.

## If something looks wrong

Predictions cache in the `ai_analysis` table (singular). To force a genuinely
fresh run rather than re-reading yesterday's answer:

    psql -U fbads -h localhost -d facebook_ads -c \
      "delete from ai_analysis where \"analysisType\"='performance_prediction';"

Analysis types: `performance_prediction`, `audience_insights`,
`copy_optimization`, `anomaly_detection`.

A 400 with "credit balance too low" right after topping up Anthropic credits is
stale — the balance takes a few minutes to propagate. Retry before debugging.
