#!/bin/bash
# Publish the built site to the droplet.
#
# Rsync, not a platform deploy: the site is static files, and Vercel's Hobby tier
# caps at 100 deployments a day, which is what forced the derive loop down to a
# 20 minute cadence. rsync has no such ceiling, so the droplet can be refreshed
# as often as there is something new to say.
#
# Only changed files cross the wire, and --delete keeps the remote from
# accumulating pages we have since removed.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

CONF="droplet.conf"
if [ ! -f "$CONF" ]; then
  echo "  droplet: skipped (no droplet.conf)"
  exit 0
fi
# shellcheck disable=SC1090
. "$CONF"

DIST="web/dist/site"
[ -d "$DIST" ] || { echo "  droplet: nothing built at $DIST" >&2; exit 1; }

# A partial upload would serve a page whose data file has not landed yet, so the
# data goes first and the HTML that reads it goes second.
rsync -az --delete \
  -e "ssh -o BatchMode=yes -o ConnectTimeout=20" \
  "$DIST/" "${DROPLET_USER}@${DROPLET_HOST}:${DROPLET_PATH}/" \
  >/dev/null

echo "  droplet: published to ${DROPLET_HOST}:${DROPLET_PATH}"
