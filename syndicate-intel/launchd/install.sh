#!/bin/bash
# Install the Syndicate archive schedule as launchd user agents.
#
# launchd rather than cron: cron silently skips a run if the Mac was asleep at
# the scheduled time, with no error and no log line. For a project whose entire
# value is an unbroken time series, a silent skip is the worst possible failure.
#
# Tier scheduling rationale:
#   fast   - StartInterval. A missed 15m window self-heals, because the feed
#            ingesters track a high-water mark and page back until they reach
#            data they already hold.
#   hourly - StartCalendarInterval on the minute, so runs land predictably.
#   daily  - StartCalendarInterval, which DOES catch up a missed run after wake.
#            This matters: a skipped daily run loses that day's capo roster
#            snapshot permanently.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="$(command -v node)"
AGENTS_DIR="$HOME/Library/LaunchAgents"
LOG_DIR="$PROJECT_DIR/logs"
PREFIX="com.krisbal.syndicate-intel"

mkdir -p "$AGENTS_DIR" "$LOG_DIR"

echo "project: $PROJECT_DIR"
echo "node:    $NODE_BIN"
echo ""

write_plist() {
  local name="$1" schedule_xml="$2" args_xml="$3"
  local label="$PREFIX.$name"
  local plist="$AGENTS_DIR/$label.plist"

  cat > "$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$label</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
$args_xml
  </array>
  <key>WorkingDirectory</key>
  <string>$PROJECT_DIR</string>
$schedule_xml
  <!-- false: true would also fire on every login/reboot, duplicating runs -->
  <key>RunAtLoad</key>
  <false/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/$name.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/$name.error.log</string>
  <key>ProcessType</key>
  <string>Background</string>
</dict>
</plist>
PLIST

  # bootout first so re-running this script cleanly replaces an existing job
  launchctl bootout "gui/$UID/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$UID" "$plist"
  echo "  loaded $label"
}

echo "installing agents:"

# Leaderboards only, every 60 seconds. The API serves cache-control max-age=60,
# so this is the genuine floor; polling faster just re-reads their cache.
write_plist "live" \
"  <key>StartInterval</key>
  <integer>60</integer>" \
"    <string>$PROJECT_DIR/ingest/snapshot.js</string>
    <string>--tier</string>
    <string>live</string>"

# 5 minutes, not 15. On 2026-08-16 the game stripped the five capo stats and
# power_sum from /market/sales, leaving /market/listings as the ONLY source of
# capo stats anywhere in the API. A capo that lists and sells inside one polling
# window is a training row lost permanently, so the window has to be tight.
# Payload-hash dedup means unchanged polls cost a request and no disk.
write_plist "fast" \
"  <key>StartInterval</key>
  <integer>300</integer>" \
"    <string>$PROJECT_DIR/ingest/snapshot.js</string>
    <string>--tier</string>
    <string>fast</string>"

write_plist "hourly" \
"  <key>StartCalendarInterval</key>
  <dict>
    <key>Minute</key>
    <integer>5</integer>
  </dict>" \
"    <string>$PROJECT_DIR/ingest/snapshot.js</string>
    <string>--tier</string>
    <string>hourly</string>"

write_plist "daily" \
"  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>4</integer>
    <key>Minute</key>
    <integer>15</integer>
  </dict>" \
"    <string>$PROJECT_DIR/ingest/snapshot.js</string>
    <string>--tier</string>
    <string>daily</string>"

write_plist "verify" \
"  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>" \
"    <string>$PROJECT_DIR/ingest/verify.js</string>"

# Season-end reward watcher. Scans mapped player wallets for on-chain USDC/SOL
# payouts from the game's prize treasury, which is the only observable trace of
# season leaderboard prizes (the projected side lives behind the authed game
# backend). Hourly, not tighter: a full pass over ~1000 wallets on public RPC
# takes many minutes, and the payout is a permanent on-chain event, so catching
# it within an hour of the draw is enough. Run --baseline once by hand before
# enabling this so the scan has a high-water to work from.
write_plist "rewards" \
"  <key>StartInterval</key>
  <integer>3600</integer>
  <key>RunAtLoad</key>
  <false/>" \
"    <string>$PROJECT_DIR/ingest/rewards-watch.js</string>
    <string>--watch</string>"

# The derive agent runs a shell wrapper rather than node directly, so it needs
# its own plist body. Offset from the ingest tiers so it reads snapshots that
# have finished writing rather than racing them.
DERIVE_LABEL="$PREFIX.derive"
DERIVE_PLIST="$AGENTS_DIR/$DERIVE_LABEL.plist"
cat > "$DERIVE_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$DERIVE_LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$PROJECT_DIR/derive/refresh.sh</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$PROJECT_DIR</string>
  <!-- launchd starts jobs with a bare PATH (/usr/bin:/bin:/usr/sbin:/sbin), on
       which neither node nor vercel resolves. The ingest agents dodge this by
       invoking node via an absolute path, but refresh.sh shells out to both by
       name, so the installing shell's PATH is captured here. -->
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$PATH</string>
  </dict>
  <!-- 20 minutes = 72 deploys/day. Vercel Hobby hard-caps at 100 deployments
       per day (and 60 per five minutes); exceeding it stops the site updating
       entirely. A 60s cadence would be 1440/day and would break within about
       an hour. To go genuinely near-live, serve data/*.json from a host with
       no deploy step and let Vercel keep only the static HTML. -->
  <key>StartInterval</key>
  <integer>1200</integer>
  <key>RunAtLoad</key>
  <false/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/derive.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/derive.error.log</string>
  <key>ProcessType</key>
  <string>Background</string>
</dict>
</plist>
PLIST
launchctl bootout "gui/$UID/$DERIVE_LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID" "$DERIVE_PLIST"
echo "  loaded $DERIVE_LABEL"

echo ""
echo "installed. useful commands:"
echo "  launchctl list | grep syndicate-intel"
echo "  launchctl kickstart -k gui/$UID/$PREFIX.fast    # force a run now"
echo "  tail -f $LOG_DIR/fast.log"
echo "  bash $PROJECT_DIR/launchd/uninstall.sh"
