#!/bin/bash
# Pull the derived data down from production so local builds show real numbers.
#
# The droplet owns the archive now. The Mac's copy stopped moving when its
# agents were removed, so a local build would otherwise render whatever the
# numbers happened to be on migration day and every "is this right?" check
# would be against a fossil.
#
# Only the derived layer comes down, roughly 12MB. The 262MB database stays
# where it is; nothing in web/ reads it, and derive/ changes are better tested
# on the box that has the real thing.
#
# Usage: bash web/pull-data.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

CONF="production.conf"
[ -f "$CONF" ] || { echo "  no production.conf" >&2; exit 1; }
# shellcheck disable=SC1090
. "$CONF"

rsync -az --delete -e "ssh -o BatchMode=yes" \
  "${PROD_USER}@${PROD_HOST}:${PROD_DIR}/data/site/" data/site/
rsync -az -e "ssh -o BatchMode=yes" \
  "${PROD_USER}@${PROD_HOST}:${PROD_DIR}/data/boards/players.json" data/boards/players.json

echo "  pulled derived data from ${PROD_HOST}"
echo "  as of: $(node -p "JSON.parse(require('fs').readFileSync('data/site/wars.json','utf8')).generated_at" 2>/dev/null)"
