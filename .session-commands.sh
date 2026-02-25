#!/bin/bash
# Session Manager Quick Commands
# Usage: source .session-commands.sh

# List recent sessions
alias sessions-list='node orchestrai-session-manager/cli/session-viewer.js list'

# View specific session (requires session ID)
sessions-view() {
    node orchestrai-session-manager/cli/session-viewer.js view "$1"
}

# View session transcript
sessions-transcript() {
    node orchestrai-session-manager/cli/session-viewer.js transcript "$1"
}

# Find session by file
sessions-find-file() {
    node orchestrai-session-manager/cli/session-viewer.js find-by-file "$1"
}

# View statistics
alias sessions-stats='node orchestrai-session-manager/cli/session-viewer.js stats'

# View related sessions
sessions-related() {
    node orchestrai-session-manager/cli/session-viewer.js related "$1"
}

echo "✅ Session Manager commands loaded:"
echo "   sessions-list              - List recent sessions"
echo "   sessions-view <id>         - View session details"
echo "   sessions-transcript <id>   - View full transcript"
echo "   sessions-find-file <path>  - Find session by file"
echo "   sessions-stats             - View statistics"
echo "   sessions-related <id>      - View related sessions"
