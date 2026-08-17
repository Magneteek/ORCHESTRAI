# Task 1: Insights Persistence + Dashboard Analytics Truth

Branch `fable/fb-ads-insights` off `develop`. Worktree `/Users/krisbal/CLAUDEtools/ORCHESTRAI-fbads`.
Scope agreed 2026-07-24, re-verified against live code 2026-08-06.

> Note: the ~30 other markdown files in this repo are Feb-2026 "COMPLETE" status reports.
> They are unreliable and repeatedly claim things are done that are not. Do not trust them.
> Verify against code and the database.

## The core problem

The dashboard shows wrong numbers because ad performance data is never stored. The
`PerformanceMetric` table has existed since day one and has **0 rows**. Everything downstream
(dashboard stats, Campaign Performance page, the whole AI Insights feature) is starved as a
result, then papers over the gap with hardcoded zeros.

## Verified defects

| # | Defect | Location |
|---|---|---|
| 1 | Insights never persisted. Nothing writes to `PerformanceMetric`; only reads exist | `lib/db/analytics.ts`, `lib/queue/jobs/template-performance-sync.ts` |
| 2 | Dashboard live-fetches Graph API on every page load instead of reading the DB | `app/api/analytics/simple/route.ts:64` |
| 3 | ROAS hardcoded to `0` | `app/api/analytics/simple/route.ts:119` |
| 4 | `topCampaigns` hardcoded to `[]`, causing "No campaign data available" | `app/api/analytics/simple/route.ts:86,122` |
| 5 | CTR double-multiplied. Facebook returns `ctr` already as a percentage; UI multiplies by 100 again (showed 208.64%) | `app/dashboard/page.tsx:257` |
| 6 | Ad-set sync not paginated. Single call, `limit: 200`, no `paging.next` follow | `app/api/sync/all/route.ts:108` |
| 7 | Ad sync not paginated. Same defect | `app/api/sync/all/route.ts:167` |
| 8 | Orphaned BullMQ wiring, imported by nothing | `lib/facebook/queue.ts` (421 lines) |

Campaign sync **is** correctly paginated (`sync/all/route.ts:55-66`). Use it as the pattern.

Correct ROAS calculation logic already exists unused in `app/api/analytics/route.ts`. Reuse it,
do not reinvent it.

## Architecture context: three parallel sync implementations

1. `app/api/sync/all/route.ts` — direct `fetch()`, no SDK. **The only one wired to the UI.**
   Campaign-level sync confirmed working against real data. This is the production path.
2. `lib/facebook/sync/{campaigns,ad-sets,ads,insights}.ts` — SDK-based, more complete, and
   contains a correctly-implemented `InsightsSync` class. Mostly unreachable from `app/`, **but
   `insights.ts` IS imported** by `app/api/analytics/route.ts:10`. Check every file's importers
   before deleting anything here.
3. `lib/facebook/queue.ts` — orphaned BullMQ wiring of path #2. Confirmed zero importers.
   Safe to delete.

Preferred approach: harvest the working `InsightsSync` logic into the production path (#1)
rather than rewriting it from scratch.

## Required work

1. Delete `lib/facebook/queue.ts` after re-confirming it has no importers.
2. Add `purchaseValue Float?` to `PerformanceMetric` via a Prisma migration. This is the one
   approved schema change. Rationale: the model has a `roas` column but no revenue column, and
   aggregate ROAS cannot be computed by averaging per-row ROAS. Store revenue as a first-class
   field so aggregate ROAS is `sum(purchaseValue) / sum(spend)`.
3. Wire real insights persistence into `app/api/sync/all/route.ts`. Fetch ad-level insights with
   `time_increment=1` so each row maps to the existing `@@unique([adId, date])` constraint, and
   upsert into `PerformanceMetric`. Paginate.
4. Fix ad-set and ad pagination in the same route (defects 6, 7).
5. Rewrite `app/api/analytics/simple/route.ts` to read from the database instead of live-fetching
   Facebook.
6. Fix CTR (defect 5), ROAS (3), and `topCampaigns` (4).
7. Populate the Campaign Performance page with real data.

## Explicitly out of scope

AI Insights code (`app/api/ai/*`, `app/dashboard/ai-insights/page.tsx`), the templating system
(`lib/templates/*`), campaign creation and launch, RBAC, and any schema change beyond the
approved `purchaseValue` column. Flag anything else you believe needs changing, do not just do it.

Note on AI Insights: those routes are real, substantial, and already wired. They fail only
because their data-fetching helpers hit an "insufficient historical data" guard. Fixing
persistence should unblock them with no rebuild. That verification is Task 2, not this task.

## Environment

Already provisioned. Do not recreate any of it.

- Docker `facebook-ads-postgres` (5432) and `facebook-ads-redis` (6379), both healthy.
  Shared with the main working tree, same `DATABASE_URL`.
- `frontend/.env.local` copied in, all vars present. `frontend/.env` created (gitignored)
  holding `DATABASE_URL` so the Prisma CLI works without extra flags.
- `npm install` done. `prisma generate` done. `prisma migrate status` reports schema up to date.
- **Port 3001 is occupied by an unrelated service.** Run the dev server on 3002:
  `cd frontend && npx next dev -p 3002`

## Baseline (do not regress)

Database row counts before any work:

```
campaigns=11  ad_sets=6  ads=7  ad_accounts=9  users=1  performance_metrics=0
```

`performance_metrics` going above 0 is the primary success signal.

Typecheck baseline: `npx tsc --noEmit` currently emits 404 error lines, but only **3** are in
production code. Full baseline saved outside the repo; the 3 production ones are:

```
app/dashboard/page.tsx(204,18): error TS2358
app/dashboard/page.tsx(204,49): error TS2339
components/dashboard/sync-button.tsx(27,45): error TS18046
```

Do not introduce new errors in `app/`, `lib/`, or `components/`. The pre-existing test and
script errors are not yours to fix.

## Login for UI verification

The app is behind NextAuth, so verifying rendered dashboard numbers requires a login.

The real account is `kristjan@krisbal.com` (ADMIN, org "QUARTZAD", 1 connected Facebook business
account, 9 ad accounts, 11 synced campaigns). **You do not get its password. Do not reset it, do
not modify that user, do not attempt to brute force or bypass its login.**

Instead, create your own throwaway account in the dev database:

1. Insert a new user with an email you choose, role ADMIN, and a bcrypt hash of a password you
   generate. Use the `bcryptjs` dependency already in the project to produce the hash.
2. **Put it in the same organization as `kristjan@krisbal.com`.** Access to ad accounts flows
   through `Organization -> FacebookBusinessAccount -> AdAccount`, so a user in a fresh org will
   see an empty dashboard and you will verify nothing.
3. Log in as it, verify the UI, and confirm rendered values match the API response and the
   database.
4. **Delete the throwaway user when done** and confirm the `users` table is back to 1 row.
   Report explicitly whether you cleaned it up.

This exists so that UI-layer bugs are actually caught. Defect 5 (CTR double-multiply) lives in a
React component, not in an API route. A DB-and-API-only check would pass while the dashboard
still renders 208.64%.

## Definition of done

- Running a sync writes rows to `performance_metrics`.
- Dashboard reads those rows rather than calling Facebook on page load.
- CTR, ROAS, and topCampaigns show plausible real values, verified against the numbers in
  Facebook Ads Manager for the same account and date range.
- Ad-set and ad sync follow `paging.next` to completion.
- No new production typecheck errors.
- Throwaway verification user deleted, `users` table back to 1 row.
- Report what you changed, what you verified and how, and anything you found but left alone.
