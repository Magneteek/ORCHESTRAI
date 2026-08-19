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

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] refreshing derived layer"

node --no-warnings derive/build.js

for period in 24h 7d 30d all; do
  node --no-warnings derive/leaderboards.js --period "$period" --top 25 > /dev/null
  echo "  boards-${period}.json"
done

# Season prize ledger from the on-chain reward capture (feeds player profiles).
node --no-warnings derive/rewards-ledger.js

node --no-warnings derive/players.js
node --no-warnings derive/trainers.js
node --no-warnings derive/sections.js
node --no-warnings derive/combat-odds.js
# after sections.js: rosters reads the season it derives from the season calendar
node --no-warnings derive/rosters.js
node --no-warnings web/build-site.js
node --no-warnings web/build-players.js
node --no-warnings web/build-pages.js

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
