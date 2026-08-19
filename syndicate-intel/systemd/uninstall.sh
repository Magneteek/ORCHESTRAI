#!/bin/bash
# Remove every capowatch timer and unit. The archive and the site are untouched.
set -euo pipefail
for u in /etc/systemd/system/capowatch-*.timer; do
  [ -e "$u" ] || continue
  n=$(basename "$u")
  systemctl disable --now "$n" >/dev/null 2>&1 || true
done
rm -f /etc/systemd/system/capowatch-*.service /etc/systemd/system/capowatch-*.timer
systemctl daemon-reload
echo "removed all capowatch timers and units"
