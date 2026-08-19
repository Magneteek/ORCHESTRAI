#!/bin/bash
# Serve the built site locally so changes can be checked before they ship.
#
# A browser cannot preview this from file://. Every page fetches its data from
# an absolute path (/data/<section>.json), which resolves to the filesystem root
# under file:// and fails, so the pages render their "could not load" state and
# look broken for a reason that has nothing to do with the change you made.
#
# Cache-Control is off for everything. The whole point of a preview is to see
# the build you just made, and a cached players.html is exactly the kind of
# thing that gets mistaken for a bug that is not there.
#
# Usage: bash web/preview.sh [port]

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PORT="${1:-8080}"
ROOT="web/dist/site"

if [ ! -f "$ROOT/index.html" ]; then
  echo "Nothing built yet. Run:" >&2
  echo "  node --no-warnings web/build-pages.js && node --no-warnings web/build-players.js" >&2
  exit 1
fi

echo "  serving $ROOT on http://localhost:$PORT"
echo "  built:   $(date -r "$ROOT/index.html" -u +%Y-%m-%dT%H:%M:%SZ)"
echo "  data:    $(date -r data/site/wars.json -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo 'missing, run web/pull-data.sh')"
echo "  stop with ctrl-c"
echo

exec python3 - "$PORT" "$ROOT" <<'PY'
import sys, functools, http.server, socketserver

port, root = int(sys.argv[1]), sys.argv[2]

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):
        # Only surface the failures. A page pulls a dozen files and the 200s
        # scroll the one 404 that matters off the screen.
        if args and len(args) > 1 and str(args[1]) != '200':
            sys.stderr.write("  %s %s\n" % (args[1], args[0]))

    def guess_type(self, path):
        if str(path).endswith('.json'):
            return 'application/json'
        return super().guess_type(path)

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', port),
                            functools.partial(Handler, directory=root)) as httpd:
    httpd.serve_forever()
PY
