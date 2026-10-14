---
name: add-stage
description: Add or change a TacticFight fighting stage in stages.js. Covers the stage interface, the 16-bit art rules, layout constraints around the fighters and the desktop crop, animation and crowd reactions, and how to verify it. Use for new home stages or stage art changes.
---

# Add or change a stage

Stages live in `stages.js` as `Stages[id] = { name, build(ctx, h), animate(ctx, h, now, excitement) }`. Every fighter id has a home stage, and fights happen on the **opponent's** stage (`state.stage` in `game.js`).

## Interface

- **`build(ctx, h)`** paints the static 320x140 background once; `graphics.js` caches it.
- **`animate(ctx, h, now, excitement)`** runs every frame after the cached background and before the fighters.
  - `now` is in ms.
  - `excitement` is 0..1: 1 right after a hit, decaying, and about 0.7 during a KO. Use it for crowds and reactions.
  - Keep it cheap: a few hundred `rect` calls at most, no full-screen per-pixel loops. Always reset `ctx.globalAlpha` to 1.
- **The helper kit `h`:**
  - `h.rect(ctx, x, y, w, h, color)`
  - `h.disc(ctx, cx, cy, r, color)`
  - `h.text(ctx, string, x, y, rowIndex => color, scale, vertical)` uses the 3x5 pixel font: A–Z, 0–9 and `- . ! ? +`
  - `h.seeded(seed)` gives deterministic randomness
  - `h.WIDTH`, `h.HEIGHT`
- **State:** keep stage state deterministic. Build lists lazily from fixed seeds and never mutate them.

## Art rules (16-bit)

- Use a distinct dominant palette per stage, so each is recognisable at a glance.
- Use hard colour bands with checkerboard dithering at the seams, 1px highlights and shadows, and integer pixels only.
- **Don't use anti-aliased canvas calls** (`arc`, `stroke`, `ellipse`, gradients). Draw with `rect` and `disc`. Integer `ctx.rect()` + `clip()` is fine for masks.
- Make the theme obvious and include a few jokes from the fighter's backstory (for example, R.O.C.K.Y's lab has bull-shaped holes in the walls).

## Layout constraints

- **Floor:** fighters stand with their feet at **y=92 (desktop)** and **y=126 (phone)**. The floor must read clearly as ground across y≈84–140 for the full width, with perspective lines, tiles or planks. The back wall or horizon ends around y≈76–86.
- **Desktop crop:** the canvas is cropped to about **x 60–260, y 20–110**, with HUD panels over the top ~20 px. Put signature details (signs, moon, posters, screens) inside that box.
- **Fighter readability:** fighters stand around x=100 and x=219, 60–75 px tall. Keep x 80–120 and 200–240, y 30–92 calm enough for them to stay readable.

## Steps

1. Add the stage object and include it in the returned object at the bottom of `stages.js`. Keep the file's style: a short comment per stage and per section.
2. If the stage is a new fighter's home, also add a `SONGS[id]` track (see the `add-music-track` skill). The game plays the stage id as the music track.
3. **Verify:**
   - `.claude/skills/playtest/pages/stages.html?only=<id>` at 1600x1050, and at phone width (420x900) for the mobile floor
   - a `pages/round.html` filmstrip with `stage=<id>` to see crowd reactions at `excitement`
   - `data-errors` must be empty. Look at the screenshots and iterate until the theme is obvious and the fighters stand out.
