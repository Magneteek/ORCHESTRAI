#!/bin/bash
# Ship the committed code to production and prove the site still works.
#
# Deliberately manual. The droplet could pull on its own every twenty minutes,
# but then a bad commit reaches production unattended and the first sign of it
# is the site being wrong. Releasing is a decision, so it is a command.
#
# Refuses to ship anything not pushed, because the droplet installs from git:
# a local-only commit would leave the box on older code while everything here
# says it shipped.
#
# Usage: bash web/release.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

CONF="production.conf"
[ -f "$CONF" ] || { echo "  no production.conf" >&2; exit 1; }
# shellcheck disable=SC1090
. "$CONF"

if [ -n "$(git status --porcelain -- . 2>/dev/null)" ]; then
  echo "  refusing: uncommitted changes here. Commit them first." >&2
  git status --short -- . >&2
  exit 1
fi

branch=$(git rev-parse --abbrev-ref HEAD)

# Production tracks develop. Without this, releasing from a feature branch
# quietly deploys that branch to the droplet, because the pull below uses
# whatever branch happens to be checked out.
RELEASE_BRANCH="${RELEASE_BRANCH:-develop}"
if [ "$branch" != "$RELEASE_BRANCH" ]; then
  echo "  refusing: on '$branch', and production tracks '$RELEASE_BRANCH'." >&2
  echo "  Merge first, or set RELEASE_BRANCH if you really mean it." >&2
  exit 1
fi

if [ -n "$(git log "origin/$branch..$branch" --oneline 2>/dev/null)" ]; then
  echo "  refusing: commits not pushed. The droplet installs from git." >&2
  git log "origin/$branch..$branch" --oneline >&2
  exit 1
fi

echo "  releasing $(git rev-parse --short HEAD) to ${PROD_HOST}"
ssh -o BatchMode=yes "${PROD_USER}@${PROD_HOST}" "
  set -e
  cd \$(dirname ${PROD_DIR}) && git pull -q origin ${branch}
  cd ${PROD_DIR}
  echo \"  now on \$(git rev-parse --short HEAD)\"
  bash derive/refresh.sh 2>&1 | tail -3
"

echo
echo "  smoke test:"

# Ask the box what it just built rather than keeping a list here. A hardcoded
# list rots the moment a page is added or retired, and this one did: it kept
# testing growth.html after growth.html was deliberately deleted, so a correct
# release reported itself broken.
pages=$(ssh -o BatchMode=yes "${PROD_USER}@${PROD_HOST}" \
  "ls ${PROD_DIR}/web/dist/site/*.html | xargs -n1 basename")

fail=0
n=0
for f in $pages; do
  p="/$f"
  [ "$f" = "index.html" ] && p="/"
  # 404.html is the error document. nginx serves it on any unknown path and it
  # answers with the 404 it is there to produce, so demanding 200 from it made a
  # correct release report itself broken. It is checked below for what actually
  # matters: that a missing page returns our page and not the nginx default.
  [ "$f" = "404.html" ] && continue
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "${PROD_URL}${p}?cb=$(date +%s%N)")
  n=$((n + 1))
  [ "$code" = "200" ] || { fail=1; echo "    FAIL $p -> $code"; }
done

# The error page: right status, and ours rather than nginx's.
miss=$(curl -s --max-time 30 -o /tmp/capowatch-404.$$ -w '%{http_code}' \
  "${PROD_URL}/this-page-does-not-exist-$(date +%s)")
if [ "$miss" != "404" ]; then
  fail=1; echo "    FAIL a missing page returned $miss, expected 404"
elif ! grep -q "Nothing here" /tmp/capowatch-404.$$ 2>/dev/null; then
  fail=1; echo "    FAIL the 404 is not ours; nginx is answering with its default"
else
  echo "    404 page: ours, correct status"
fi
rm -f /tmp/capowatch-404.$$

[ "$n" -gt 0 ] || { echo "  nothing built on the box" >&2; exit 1; }
[ "$fail" = "0" ] && echo "    $n pages, all 200" || { echo "  RELEASE LOOKS BROKEN" >&2; exit 1; }
