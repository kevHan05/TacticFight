---
name: add-music-track
description: Add or change a track in TacticFight's synthesized 16-bit soundtrack (music.js). Covers the song pattern syntax, instruments, drums, how the game picks tracks, and how to verify output offline without hearing it. Use for new stage themes, menu music or music fixes.
---

# Add or change a music track

`music.js` is a lookahead sequencer that plays songs written as compact pattern strings in `SONGS`. The game calls:

- `Music.play("title")` on the start screen
- `"select"` on the select screen
- `"story"` during dialogue
- `Music.play(state.stage)` (the stage or fighter id) during fights
- `"victory"` and `"defeat"` on result screens

**A new stage or fighter needs a track with the same id.** An unknown id is silently ignored, so the music just stops.

## Song syntax

The comment above `SONGS` in `music.js` is the reference. In short:

```js
id: {
  bpm: 150, crash: 8, fillEvery: 4,
  chords: "Em | D | C | D",                   // one entry per bar; "." holds; several split the bar
  lead: "E5 . . . B4 . E5 . | ...",           // notes, "." hold, "-" rest; token count per bar sets the grid
  lead2: -12,                                  // a second part, or a number to transpose the lead
  bass: "1 . 1 1 8 . 1 1",                     // chord degrees over the current chord; ^ _ shift octave; * whole chord
  arp: "1 5 8 5 1 5 8 5",
  drums: { k: "x.......x.x.....", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },  // 16ths: x hit, X accent, g ghost
  fill: { s: "....X...x.xxXXXX" },             // replaces drum lines in the last bar of every fillEvery bars
  inst: { lead: "pulse25", lead2: "square", bass: "bassSquare", arp: "pluck" },
  mix: { arp: 0.04 }
}
```

The instruments are in the instrument table below `SONGS`. Check the available drum keys in the drum section before using a new one.

## Writing guidelines

- Use 8–16 bars that loop seamlessly, with a recognisable hook in the lead, a real bass line and drums.
- Stay in key, and match the stage's mood and the fighter's personality. Stage themes run at about 100–160 bpm.
- Sit under the sound effects: keep peaks below about 0.2 (the master gain is 0.18).
- Add a one-line comment above the song naming the stage, the feel, and the key and tempo.

## Verify offline (audio can't be heard headless)

`Music._render(track, seconds)` returns a Promise of an `AudioBuffer`. Write a small page in your scratch directory that loads `music.js` through a `file:///` URL, renders 6 s of each changed track, and writes the peak and RMS to `document.body.dataset`.

Under virtual time, keep the main thread busy with a **counted** loop until the promise resolves; a time-based wait hangs. Run it with `.claude/skills/playtest/scripts/browser.sh dom <page> 20000`.

- **Pass:** no errors, RMS above 0.02 (not silent), peak below 1.0 and ideally below 0.2.
- Also run the `playtest` smoke driver into a fight on that stage and check that `Music.current()` equals the stage id.
- In the PR test plan, leave "listen in a real browser" unticked for the owner.
