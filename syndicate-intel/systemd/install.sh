#!/bin/bash
# Install the ingest and derive schedule as systemd timers.
#
# The Linux counterpart to launchd/install.sh. Same seven jobs, same cadences,
# so the archive keeps the shape it had on the Mac:
#
#   live     60s     leaderboards. The moat: lifetime-cumulative boards that
#                    only become a time series because we diff our own snapshots
#   fast     5m      listings, sales, royalties
#   hourly   :05     combat, contracts, territory, bounties
#   daily    04:15   the 58MB capos dump, equipment, economy, supply
#   seasonclose 18:50 capo production again, ten minutes before seasons end
#   derive   10m     rebuild the derived layer and the site. Was 20m only
#                    because Vercel's free tier capped deployments per day;
#                    the droplet has no such ceiling, and a rebuild costs 44s
#                    of CPU, so ten minutes is about 7% of the single core.
#   rewards  1h      on-chain prize and bounty watch over public RPC
#   verify   09:00   archive gap check
#   offload  03:30   push cold raw feeds to the Space and reclaim local disk
#
# Timers, not cron, for three reasons that matter here: Persistent=true makes a
# calendar job that was missed while the box was down run once on boot rather
# than silently skipping a day of the archive; systemd will not start a second
# The rewards watch gets two hours rather than fifty minutes: when a bookmark
# ages out of the public node's history the whole wallet list has to be rescanned
# unbounded, which is about an hour of work. It checkpoints every 100 wallets, so
# a clipped run still makes progress, but clipping it every time is how the sweep
# went months without finishing.
# copy of a job that is still running, so a slow daily pull cannot pile up; and
# output lands in the journal with the unit name attached instead of in a log
# file nobody rotates.
#
# Usage: sudo bash systemd/install.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="$(command -v node || echo /usr/bin/node)"
UNIT_DIR=/etc/systemd/system
PREFIX=capowatch

if [ ! -x "$NODE_BIN" ]; then
  echo "FATAL: node not found. node:sqlite needs 22.5 or newer." >&2
  exit 1
fi

NODE_MAJOR="$("$NODE_BIN" -p 'process.versions.node.split(".")[0]')"
NODE_MINOR="$("$NODE_BIN" -p 'process.versions.node.split(".")[1]')"
if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 5 ]; }; then
  echo "FATAL: node $($NODE_BIN -v) is too old; node:sqlite needs 22.5+." >&2
  exit 1
fi

# name | description | ExecStart | timer spec
# A timer spec starting with "every:" becomes an interval, anything else is
# treated as an OnCalendar expression.
JOBS=(
  "live|Leaderboard snapshot|$NODE_BIN --no-warnings ingest/snapshot.js --tier live|every:60"
  "fast|Listings, sales and royalties|$NODE_BIN --no-warnings ingest/snapshot.js --tier fast|every:300"
  "hourly|Combat, contracts and territory|$NODE_BIN --no-warnings ingest/snapshot.js --tier hourly|*-*-* *:05:00"
  "daily|Full capo, equipment and economy pull|$NODE_BIN --no-warnings ingest/snapshot.js --tier daily|*-*-* 04:15:00"
  # Seasons end at 19:00 UTC and the game zeroes racket_current_season the moment
  # they do, keeping no record of the total. The 04:15 pull therefore read season
  # 12 fifteen hours before it closed and never saw it again, so that season's
  # final earnings are gone for good. This runs ten minutes before the boundary,
  # every day, so the last reading of any season is minutes old rather than most
  # of a day. One extra 4.8MB snapshot daily, about 1.7GB a year.
  "seasonclose|Capo production, just before the season boundary|$NODE_BIN --no-warnings ingest/snapshot.js --endpoint capos_production|*-*-* 18:50:00"
  "derive|Rebuild derived layer and site|/bin/bash derive/refresh.sh|every:600"
  "rewards|On-chain prize and bounty watch|$NODE_BIN --no-warnings ingest/rewards-watch.js --watch|every:3600"
  "verify|Archive gap check|$NODE_BIN --no-warnings ingest/verify.js|*-*-* 09:00:00"
  "offload|Move the cold raw archive to object storage|/bin/bash ingest/archive-offload.sh|*-*-* 03:30:00"
)

for job in "${JOBS[@]}"; do
  IFS='|' read -r name desc exec spec <<<"$job"
  unit="$PREFIX-$name"

  cat >"$UNIT_DIR/$unit.service" <<EOF
[Unit]
Description=Capowatch: $desc
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$PROJECT_DIR
ExecStart=$exec
# The API key lives here, mode 600, and never on a command line.
EnvironmentFile=-$PROJECT_DIR/.env
# A stuck socket must not wedge the schedule, but the ceiling has to fit the
# job. rewards walks ~1000 wallets on the public Solana RPC, which rate-limits
# a datacenter IP hard: a first pass spent 10 minutes wall-clock on 5.8s of CPU,
# purely waiting. It checkpoints per wallet and resumes, so a kill costs
# progress rather than data, but it still needs most of its hour. daily pulls a
# 58MB payload and offload can push hundreds of MB on its early runs.
TimeoutStartSec=$(case "$name" in rewards) echo 7200;; daily|seasonclose|offload) echo 1800;; *) echo 600;; esac)
Nice=10
# One CPU shared with nginx: keep a burst of JSON parsing from starving the
# thing actually serving the site.
IOSchedulingClass=idle
EOF

  if [[ "$spec" == every:* ]]; then
    every="${spec#every:}"
    cat >"$UNIT_DIR/$unit.timer" <<EOF
[Unit]
Description=Capowatch: $desc (every ${every}s)

[Timer]
OnBootSec=120
OnUnitActiveSec=${every}s
AccuracySec=5s

[Install]
WantedBy=timers.target
EOF
  else
    cat >"$UNIT_DIR/$unit.timer" <<EOF
[Unit]
Description=Capowatch: $desc ($spec)

[Timer]
OnCalendar=$spec
# Run once on boot if the window was missed while the box was down, rather than
# leaving a hole in the archive that cannot be backfilled later.
Persistent=true
AccuracySec=30s

[Install]
WantedBy=timers.target
EOF
  fi
done

systemctl daemon-reload
for job in "${JOBS[@]}"; do
  IFS='|' read -r name _ _ _ <<<"$job"
  systemctl enable --now "$PREFIX-$name.timer" >/dev/null 2>&1
done

echo "installed ${#JOBS[@]} timers, node $($NODE_BIN -v), project $PROJECT_DIR"
systemctl list-timers "$PREFIX-*" --no-pager
