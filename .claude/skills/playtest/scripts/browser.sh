#!/usr/bin/env bash
# Headless Chromium helper for TacticFight checks. Works in Git Bash on Windows
# (Edge or Chrome) and on Linux/macOS (Chrome or Chromium). Every run gets a
# fresh browser profile: reusing one makes headless Edge hang.
#
#   browser.sh shot <page> <out.png> [WIDTHxHEIGHT] [virtual-ms]
#   browser.sh dom  <page> [virtual-ms]
#
# <page> is a file path (optionally with a ?query) or a URL. `shot` writes a
# screenshot; `dom` prints the data-* attributes on <body> after the virtual
# time budget, which is how test pages report results (data-log, data-errors).
# Environment: BROWSER=/path/to/browser to override, TIMEOUT=seconds (default 120).
set -euo pipefail

find_browser() {
  local candidate
  for candidate in "${BROWSER:-}" \
    "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
    "/c/Program Files/Microsoft/Edge/Application/msedge.exe" \
    "/c/Program Files/Google/Chrome/Application/chrome.exe" \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    google-chrome google-chrome-stable chromium chromium-browser microsoft-edge msedge; do
    [ -z "$candidate" ] && continue
    if [ -x "$candidate" ]; then echo "$candidate"; return; fi
    if command -v "$candidate" >/dev/null 2>&1; then command -v "$candidate"; return; fi
  done
  echo "No Chromium-based browser found. Set BROWSER=/path/to/browser." >&2
  exit 1
}

windows() {
  command -v cygpath >/dev/null 2>&1
}

native_path() {
  if windows; then cygpath -w "$1"; else echo "$1"; fi
}

page_url() {
  local page="$1" query=""
  case "$page" in *://*) echo "$page"; return ;; esac
  if [[ "$page" == *\?* ]]; then
    query="?${page#*\?}"
    page="${page%%\?*}"
  fi
  local absolute
  absolute="$(cd "$(dirname "$page")" && pwd)/$(basename "$page")"
  if windows; then echo "file:///$(cygpath -m "$absolute")$query"; else echo "file://$absolute$query"; fi
}

run_browser() {
  local profile
  profile="$(mktemp -d)"
  local args=(--headless=new --disable-gpu --hide-scrollbars --no-first-run --mute-audio
    --user-data-dir="$(native_path "$profile")" --allow-file-access-from-files
    --autoplay-policy=no-user-gesture-required)
  windows || args+=(--no-sandbox)
  local status=0
  timeout "${TIMEOUT:-120}" "$(find_browser)" "${args[@]}" "$@" 2>/dev/null || status=$?
  rm -rf "$profile" 2>/dev/null || true
  return $status
}

command="${1:-}"
case "$command" in
  shot)
    [ $# -ge 3 ] || { echo "usage: browser.sh shot <page> <out.png> [WIDTHxHEIGHT] [virtual-ms]" >&2; exit 2; }
    size="${4:-1280x900}"
    out_dir="$(cd "$(dirname "$3")" && pwd)"
    out="$out_dir/$(basename "$3")"
    rm -f "$out"
    run_browser --window-size="${size/x/,}" --virtual-time-budget="${5:-3000}" --screenshot="$(native_path "$out")" "$(page_url "$2")" >/dev/null || true
    if [ -s "$out" ]; then echo "wrote $3"; else echo "screenshot failed: $3" >&2; exit 1; fi
    ;;
  dom)
    [ $# -ge 2 ] || { echo "usage: browser.sh dom <page> [virtual-ms]" >&2; exit 2; }
    html="$(run_browser --virtual-time-budget="${3:-5000}" --dump-dom "$(page_url "$2")" || true)"
    body="$(printf '%s' "$html" | grep -o '<body[^>]*>' | head -n 1 || true)"
    [ -n "$body" ] || { echo "no DOM returned (page failed to load or the browser timed out)" >&2; exit 1; }
    printf '%s\n' "$body" | grep -o 'data-[a-z0-9-]*="[^"]*"' | sed 's/&quot;/"/g; s/&lt;/</g; s/&gt;/>/g; s/&amp;/\&/g' || true
    ;;
  *)
    sed -n '2,13p' "$0"
    exit 2
    ;;
esac
