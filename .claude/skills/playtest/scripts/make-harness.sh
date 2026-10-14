#!/usr/bin/env bash
# Builds a test copy of the game with error capture and a driver script.
#
#   make-harness.sh <out-dir> <driver.js> [page-name]
#
# Copies the game's top-level .html/.js/.css files into <out-dir> (never test
# inside the repo), then writes <out-dir>/<page-name>.html (default
# "harness"): index.html with window.onerror capture injected before the
# first script and the driver loaded after game.js. Drivers report through
# document.body.dataset (read with `browser.sh dom`).
set -euo pipefail
[ $# -ge 2 ] || { echo "usage: make-harness.sh <out-dir> <driver.js> [page-name]" >&2; exit 2; }

here="$(cd "$(dirname "$0")" && pwd)"
root="$(git -C "$here" rev-parse --show-toplevel)"
out="$1"
driver="$2"
name="${3:-harness}"

mkdir -p "$out"
cp "$root"/*.html "$root"/*.js "$root"/*.css "$out/"
cp "$driver" "$out/driver.js"

awk '
  !captured && /<script src=/ {
    print "  <script>window.errors = []; window.onerror = (message, source, line) => { window.errors.push(message + \" @\" + source + \":\" + line); };</script>"
    captured = 1
  }
  { print }
  /<script src="game.js"><\/script>/ { print "  <script src=\"driver.js\"></script>" }
' "$out/index.html" > "$out/$name.html"
echo "$out/$name.html"
