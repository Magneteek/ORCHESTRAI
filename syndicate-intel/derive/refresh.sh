#!/bin/bash
# Rebuild the derived database from the archive, regenerate every board, and
# rebuild the public site.
#
# Safe to run at any time and as often as you like: build.js skips snapshot
# files it has already loaded, and every insert is an upsert.
#
# --no-warnings suppresses Node's experimental notice for the built-in
# node:sqlite module, which would otherwise spam the log on every run.
#
# Deployment is deliberately opt-in and last. It runs only when deploy.conf
# exists, and a failure there must never look like a data pipeline failure, so
# it is reported but does not fail this script.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Fail loudly rather than mysteriously. Under launchd the PATH is minimal, and
# a missing node here would otherwise surface as an empty log and a silently
# stale site.
if ! command -v node >/dev/null 2>&1; then
  echo "FATAL: node not on PATH (PATH=$PATH)" >&2
  echo "Re-run launchd/install.sh so the agent captures a working PATH." >&2
  exit 1
fi

# Node's default old-space limit on the droplet is 1,008 MB, and the archive has
# outgrown it. sections.js pulls whole result sets through .all(), and from
# 2026-09-06 it aborted with "Reached heap limit" on every run. Because it sits
# in the middle of the chain, nothing after it ran either, so the site went on
# serving the last good build for two days while every page still answered 200.
#
# The flag is a ceiling, not a reservation, so the steps that never approach it
# pay nothing. It is applied to all of them rather than to sections.js alone
# because the database grows every day and the next step to cross 1 GB would
# fail exactly as silently.
#
# This is a floor under the problem, not a cure. The cure is for sections.js to
# stream its rows instead of materialising every one of them at once.
NODE="node --no-warnings --max-old-space-size=3072"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] refreshing derived layer"

# The SOL spot price, the one number here that does not come from the game. It
# self-throttles to one reading every half hour, so calling it on every refresh
# costs nothing, and a failure is ignored on purpose: no price means the site
# shows SOL without a dollar figure beside it, which is not worth failing over.
$NODE ingest/solprice.js || echo "  WARNING: sol price unavailable; USD figures will be omitted"

$NODE derive/build.js

for period in 24h 7d 30d all; do
  $NODE derive/leaderboards.js --period "$period" --top 25 > /dev/null
  echo "  boards-${period}.json"
done

# Season prize ledger from the on-chain reward capture (feeds player profiles).
$NODE derive/rewards-ledger.js

$NODE derive/players.js
$NODE derive/trainers.js
$NODE derive/sections.js
$NODE derive/combat-odds.js
# after sections.js: rosters reads the season it derives from the season calendar
$NODE derive/rosters.js
$NODE web/build-site.js
$NODE web/build-players.js
$NODE web/build-pages.js

# The droplet is the always-on home: rsync has no deployment ceiling, so this
# runs on every refresh regardless of what Vercel is doing.
if bash web/push-droplet.sh; then
  :
else
  echo "  WARNING: droplet push failed; data pipeline is unaffected"
fi

if [ -f deploy.conf ]; then
  if bash web/deploy.sh; then
    :
  else
    echo "  WARNING: deploy failed; data pipeline is unaffected"
  fi
else
  echo "  deploy: skipped (no deploy.conf)"
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] done"
