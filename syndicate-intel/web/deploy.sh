#!/bin/bash
# Deploy the generated site.
#
# Reads deploy.conf from the project root. That file is gitignored, so the
# deploy target never lands in the repo and the pipeline stays inert on any
# machine that has not opted in.
#
#   deploy.conf:
#     VERCEL_PROJECT=syndicate-books
#     VERCEL_SCOPE=krisbal
#
# Content-addressed: the built page is hashed and compared against the last
# deployed hash. The generator embeds a fresh `generated_at` on every run, so
# without this the 15-minute schedule would fire ~96 identical deploys a day.
# We hash the page with that timestamp stripped, so only real data changes ship.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Deploy the standards-mode document, not the artifact fragment.
DIST="web/dist/site"
PAGE="$DIST/index.html"
STATE="data/.last-deploy-hash"

[ -f "$PAGE" ] || { echo "  deploy: no built page at $PAGE"; exit 1; }
[ -f deploy.conf ] || { echo "  deploy: no deploy.conf"; exit 1; }

# shellcheck disable=SC1091
source deploy.conf

: "${VERCEL_PROJECT:?deploy.conf must set VERCEL_PROJECT}"

if ! command -v vercel >/dev/null 2>&1; then
  echo "  deploy: vercel not on PATH (PATH=$PATH)"
  echo "  deploy: re-run launchd/install.sh so the agent captures a working PATH"
  exit 1
fi

# Hash every page in the bundle, not just index.html: the players page changes
# independently, and hashing only one would skip deploys when the other moved.
# Generation timestamps are stripped first so an unchanged dataset does not look
# like a change.
# No -maxdepth: the section JSON lives in data/, and the whole point of the
# split is that those files change while the HTML does not. Scanning only the
# top level would mean data updates never deployed.
HASH=$(find "$DIST" -type f \( -name '*.html' -o -name '*.json' -o -name 'robots.txt' \) \
  -not -path '*/.vercel/*' -print0 \
  | sort -z \
  | xargs -0 sed -E 's/"generated_at":"[^"]*"//g; s/(Last posted|Updated)[^<]*//g' \
  | shasum -a 256 | cut -d' ' -f1)
PREV=$(cat "$STATE" 2>/dev/null || echo "none")

if [ "$HASH" = "$PREV" ]; then
  echo "  deploy: skipped, page content unchanged"
  exit 0
fi

echo "  deploy: content changed, publishing to $VERCEL_PROJECT"

ARGS=(deploy "$DIST" --prod --yes)
# An `if` rather than `[ ... ] && ...`: under `set -e` the && form exits the
# script whenever VERCEL_SCOPE is unset, because the failed test becomes the
# statement's exit status.
if [ -n "${VERCEL_SCOPE:-}" ]; then
  ARGS+=(--scope "$VERCEL_SCOPE")
fi

# `vercel deploy` has been observed hanging indefinitely rather than failing.
# On a 15-minute unattended schedule that would stack up hung processes
# invisibly, so every deploy is bounded. macOS ships no timeout(1) and coreutils
# is not installed here, hence the hand-rolled watchdog.
DEPLOY_TIMEOUT="${DEPLOY_TIMEOUT:-180}"
TMP_OUT=$(mktemp)
trap 'rm -f "$TMP_OUT"' EXIT

vercel "${ARGS[@]}" > "$TMP_OUT" 2>&1 < /dev/null &
DEPLOY_PID=$!

WAITED=0
while kill -0 "$DEPLOY_PID" 2>/dev/null; do
  if [ "$WAITED" -ge "$DEPLOY_TIMEOUT" ]; then
    kill -TERM "$DEPLOY_PID" 2>/dev/null || true
    sleep 3
    kill -KILL "$DEPLOY_PID" 2>/dev/null || true
    echo "  deploy: TIMED OUT after ${DEPLOY_TIMEOUT}s, killed"
    tail -3 "$TMP_OUT"
    # Hash deliberately not recorded, so the next cycle retries.
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
done

if wait "$DEPLOY_PID"; then
  OUT=$(cat "$TMP_OUT")
  # Vercel prints hints after the URL, so take the last line that actually
  # looks like a bare deployment URL rather than simply the last line.
  URL=$(printf '%s\n' "$OUT" | grep -oE 'https://[a-z0-9.-]+\.vercel\.app' | tail -1)
  echo "  deploy: ok ${URL:-(url not parsed)}"
  # Only record the hash on success, so a failed deploy retries next cycle.
  mkdir -p "$(dirname "$STATE")"
  printf '%s' "$HASH" > "$STATE"
else
  echo "  deploy: FAILED"
  tail -5 "$TMP_OUT"
  exit 1
fi
