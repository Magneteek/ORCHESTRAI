#!/bin/bash
# Remove the Syndicate archive launchd agents. Leaves data/ untouched.
set -euo pipefail

PREFIX="com.krisbal.syndicate-intel"
AGENTS_DIR="$HOME/Library/LaunchAgents"

# Must list every agent install.sh creates. 'rewards' was missing here, so an
# uninstall left the on-chain watcher running against a project that had moved.
for name in live fast hourly daily verify derive rewards; do
  label="$PREFIX.$name"
  launchctl bootout "gui/$UID/$label" 2>/dev/null && echo "  unloaded $label" || true
  rm -f "$AGENTS_DIR/$label.plist"
done

echo "done. the archive in data/ was not touched."
