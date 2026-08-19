#!/bin/bash
# Move the cold half of the raw archive to object storage.
#
# The raw snapshots grow by roughly 130-140MB a day, which fills a 50GB disk in
# about a year. Most of that is feeds we never read again: they are parsed once
# into SQLite and then kept only because the archive is the point. Those belong
# in a Space, not on the droplet's disk.
#
# COLD feeds are ingested into SQLite and never re-read by the derive layer, so
# they can live remotely. HOT feeds are opened on every derive run and must stay
# local: combat_fights is read in full by derive/combat-odds.js, and territory
# and equipment have their newest file read by derive/players.js and the same
# odds builder. Offloading those would put a network round trip inside a job
# that runs every twenty minutes.
#
# Deletion only ever happens after the exact object has been confirmed present
# remotely at the same byte size. A failed or partial upload leaves the local
# copy alone, because the archive cannot be re-fetched: the API has no history.
#
# Usage: bash ingest/archive-offload.sh [--dry-run]

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

CONF="spaces.conf"
if [ ! -f "$CONF" ]; then
  echo "  offload: skipped (no spaces.conf)"
  exit 0
fi
# shellcheck disable=SC1090
. "$CONF"

: "${SPACE_BUCKET:?SPACE_BUCKET not set in spaces.conf}"
: "${SPACE_PREFIX:=capowatch}"
: "${RETAIN_DAYS:=3}"

DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

# Never offloaded. Keep this list in step with what the derive layer opens.
HOT="combat_fights equipment territory"
COLD="market_listings market_sales royalties capos combat_players leaderboards"

s3() { s3cmd --config=/root/.s3cfg "$@"; }

total_freed=0

for feed in $COLD; do
  src="data/raw/$feed"
  [ -d "$src" ] || continue

  dest="s3://$SPACE_BUCKET/$SPACE_PREFIX/raw/$feed/"

  if [ "$DRY" = "1" ]; then
    n=$(find "$src" -type f | wc -l | tr -d ' ')
    echo "  $feed: would sync $n files to $dest"
    continue
  fi

  # Upload everything. s3cmd sync skips objects already present at the same
  # size, so this is cheap on the runs after the first.
  s3 sync --quiet --no-progress "$src/" "$dest" 2>/dev/null || {
    echo "  WARNING: $feed upload failed, leaving local files untouched" >&2
    continue
  }

  # Build the remote inventory once, as "size<TAB>key", rather than asking about
  # each file in turn: these feeds run to thousands of objects.
  remote=$(mktemp)
  s3 ls --recursive "$dest" 2>/dev/null | awk '{print $3"\t"$4}' > "$remote"

  freed=0
  while IFS= read -r f; do
    rel="${f#"$src"/}"
    key="s3://$SPACE_BUCKET/$SPACE_PREFIX/raw/$feed/$rel"
    lsize=$(stat -c %s "$f" 2>/dev/null || echo -1)
    # Confirmed present AND the same size, or it stays put.
    if grep -qF "$(printf '%s\t%s' "$lsize" "$key")" "$remote"; then
      rm -f "$f"
      freed=$((freed + lsize))
    fi
  done < <(find "$src" -type f -mtime +"$RETAIN_DAYS")

  rm -f "$remote"
  total_freed=$((total_freed + freed))
  echo "  $feed: $(du -sh "$src" 2>/dev/null | cut -f1) local, freed $((freed / 1024 / 1024))MB"
done

# Empty date directories left behind once their contents are remote.
find data/raw -type d -empty -delete 2>/dev/null || true

echo "  offload: freed $((total_freed / 1024 / 1024))MB, kept HOT feeds local ($HOT)"
echo "  disk: $(df -h / | awk 'NR==2 {print $3" of "$2" ("$5")"}')"
