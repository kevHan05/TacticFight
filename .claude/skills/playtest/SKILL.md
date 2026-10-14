---
name: playtest
description: Verify TacticFight changes in a real headless browser. Covers screenshots of screens, stages and animation filmstrips, scripted playthroughs of the UI and modes, and JS error capture. Use after any change to graphics, UI, game flow, sound wiring or content, and before opening a PR.
---

# Playtest TacticFight in a headless browser

Node and Python may not be installed, so every check runs the real game in headless Chromium (Edge or Chrome). **Always look at the screenshots** with your image viewer or Read tool; a written file proves nothing.

All paths below are relative to the repo root. Keep test output in your scratch or temp directory, never in the repo.

## Tools

- `.claude/skills/playtest/scripts/browser.sh`
  - `shot <page> <out.png> [WxH] [virtual-ms]` takes a screenshot.
  - `dom <page> [virtual-ms]` prints the `data-*` attributes on `<body>`. Test pages report through `document.body.dataset.log`, `.errors` and `.result`.
  - It finds Edge or Chrome on Windows Git Bash, Linux or macOS (override with `BROWSER=`). It uses a **fresh profile per run**, because reused profiles make headless Edge hang. Raise the default 120 s timeout with `TIMEOUT=`.
- `.claude/skills/playtest/scripts/make-harness.sh <out-dir> <driver.js> [name]` copies the game to `<out-dir>`, injects `window.onerror` capture, and loads a driver after `game.js`. Drivers can call game internals (`screenName`, `state`, `ui`, `busy()`, `advanceDialogue()`, `goToTitle()`, `Rules`, `Arena`).
- Drivers in `.claude/skills/playtest/drivers/`:
  - `smoke.js` walks title → mode → detail → dialogue → fight and plays rounds. It takes `?mode=&fighter=&rounds=&stop=title|select|detail|dialogue|fight|turn&wait=`.
  - `modes.js` plays a full campaign, a campaign loss with retry, and an Endless run, with rendering stubbed for speed. Use `dom` with a budget of about 150000.
- Pages in `.claude/skills/playtest/pages/` (open them in place; they load the repo's scripts):
  - `round.html` is a filmstrip of one round through the real renderer. It takes `?a=&ma=&b=&mb=&stage=&frames=&columns=&finished=1&crop=1`.
  - `stages.html` shows every stage (or `?only=<id>`) with fighters mid-round.

## Recipes

```bash
T="$TMP/tf-play"            # any scratch dir outside the repo
P=.claude/skills/playtest

# Screens and a live fight (desktop, then phone width)
$P/scripts/make-harness.sh "$T" $P/drivers/smoke.js
$P/scripts/browser.sh shot "$T/harness.html?stop=title" "$T/title.png"
$P/scripts/browser.sh shot "$T/harness.html?mode=campaign&fighter=2&stop=detail" "$T/detail.png"
$P/scripts/browser.sh shot "$T/harness.html?mode=quick&fighter=4&stop=turn&wait=1500" "$T/turn.png" 1280x900 4000
$P/scripts/browser.sh shot "$T/harness.html?stop=title" "$T/title-phone.png" 420x900
$P/scripts/browser.sh dom  "$T/harness.html?mode=quick&rounds=6" 30000     # read data-log / data-errors

# Every mode end to end
$P/scripts/make-harness.sh "$T" $P/drivers/modes.js modes
TIMEOUT=300 $P/scripts/browser.sh dom "$T/modes.html" 150000

# Animation of a specific move or matchup, and the stages
$P/scripts/browser.sh shot "$P/pages/round.html?a=bobbie&ma=combo&b=ninja&mb=shuriken&crop=1" "$T/round.png" 1600x900
$P/scripts/browser.sh shot "$P/pages/round.html?a=rocky&ma=overdrive&b=rook&mb=block&finished=1" "$T/ko.png" 1600x900
$P/scripts/browser.sh shot "$P/pages/stages.html" "$T/stages.png" 1600x1050
```

## What to check

- `data-errors` is empty for every run. Treat any error as a failure.
- **Screens:** the title, select grid, detail panel, dialogue (portraits, speaker colour, typewriter), fight HUD, move boxes (icon, name, cooldown text, disabled while a turn plays), tooltip, result panel buttons, and the announcement in and out (gone after 3 s).
- **Turns:** in a filmstrip, set-up moves play before strikes, the player goes first on a tie, health bars drop at each hit, and the name callout, result label and sparks line up with the contact frame.
- **Layout:** the window width sets the floor (≥621 px wide is desktop, floor y=92 with the canvas cropped; narrower is mobile, floor y=126). Check both. Headless windows narrower than about 500 px get cropped on the right, so a clipped right edge at 420 px is a screenshot artefact, not a bug. Compare against `main` before calling it a regression.
- **Readability:** fighters stay readable against the stage, and text doesn't overlap the HUD (the top ~20 low-res px on desktop).
- **Audio** can't be heard headless. Check that no errors fire, that cues are scheduled for the phase hit times, and for music use `Music._render(track, seconds)` (see the `add-music-track` skill). Leave "listen in a real browser" as an unticked test-plan item.

## Gotchas

- In Git Bash, build output paths with `/` (`"$T/out.png"`). `"$W\\$name.png"` silently writes a file literally named `$name.png`.
- `--virtual-time-budget` fast-forwards timers, but rendering every frame of a long run is slow in real time. Stub `Arena.draw` in logic-only drivers, as `modes.js` does.
- With virtual time, `performance.now()`-based busy waits never end. Wait with `setTimeout` loops.
- Edge sometimes leaves a background process behind. If a run hangs, it was almost always a reused `--user-data-dir`; `browser.sh` avoids that.
