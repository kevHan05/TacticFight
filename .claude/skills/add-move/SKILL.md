---
name: add-move
description: Add or change a single TacticFight move end to end. Covers its rules in characters.js, its turn-based animation and effects in graphics.js, its pixel icon, its sound cue and description text. Use when adding a move, changing what a move does, or reworking a move's animation.
---

# Add or change a move

A move is data in `characters.js`, and its `anim` key connects it to the animation (`ANIMS` in `graphics.js`), the icon (`ICONS` in `icons.js`) and the sound cue (`playMoveCue` in `game.js`). Reuse an existing `anim` key when the motion fits, for example `punch`, which several fighters share.

## 1. Rules (characters.js)

- Use the existing fields first: `damage`, `hits`, `chance`, `guard` (`block` | `dodge` | `shuffle` | `armor` | `smoke` | `vanish`), `area`, `breaksGuard`, `interrupt`, `risky`, `stagger`, `counter`, `momentum`, `blind`, `fortify`, `track`, `cooldown`, `ultimate`.
- A new mechanic goes into `Rules.strike()` (how one strike resolves against the other fighter's move) or `Rules.resolve()` (statuses, boosts, cooldowns). Statuses last one round: set them in `next[...]`. Document any new field in the comment block at the top of the file. Keep `Rules` pure, with no DOM access.
- Write `detail` (a short label with numbers, upper case) and `info` (one or two plain sentences for the tooltip and detail panel).
- If damage, cooldown or rules changed, run the `balance-check` skill.

## 2. Animation (graphics.js)

Rounds play as phases (see `Arena.timing`). In its own phase a move runs on a local clock `c = { e, H }`, where `H` is the contact time in unslowed milliseconds and the whole phase is slowed by `SLOW`.

- Add an `ANIMS` entry:
  - **melee:** `{ lead, melee: "<pose>", windup?: "<pose>", reach, flurry?, jerky? }`
  - **ranged or special:** `{ lead, projectile: "fire" | "plasma" | "shuriken" | "stampede" | <new> }` or `{ lead, vanish: true }`
  - **set-up or guard:** `{}`
  
  `lead` is the time from wind-up to contact (it sets the phase's `H`). `reach` controls how far melee attackers lunge.
- If you need a new body shape, add a pose to `POSES`. Poses face right, with the feet at (0, 0) and y growing downwards. Keep the 11 keys the same as the others.
- **Motion:**
  - Strikes: handled in `actMotion()`. Add a branch for genuinely new kinds of motion.
  - Guards: `guardMotion()` covers both setting the guard up in its own phase and answering a strike in the opponent's phase.
  - Reactions to being hit: `reactMotion()`.
- **Effects:**
  - Strike wind-up, travel and contact: `drawStrikeEffects()`.
  - Guard visuals: `drawMoveEffects()`, which runs in both "act" and "react" modes.
  - Projectiles: `drawProjectile()`.
  - Floating result text: `resultLabel()`. Multi-hit moves get a spark and flash per landed hit.
- Keep it 16-bit: integer pixels, limited colours, `rect`/`disc`/`puff`/`drawSpark` helpers, no anti-aliased shapes.

## 3. Icon (icons.js)

Add `ICONS[anim] = { colors: { a: "#..", b: "#.." }, rows: [12 strings of 12 chars] }`. Use `.` for transparent; the outline is automatic. Make it readable at 56 px and recognisable at a glance (a fist, shield, star, cloud and so on).

## 4. Sound (game.js, sound.js)

- In `playMoveCue(outcome, start, hit, lead)`, add a `case` for the anim. Time the cue so its contact lands on `hit` (seconds), for example `Sound.play("swing", hit - 0.14)`. `start` is when the wind-up begins.
- Contact sounds (impacts, clangs, the target's voice) are already handled in `playOutcome()` from the result. Only touch it for new result types.
- New effects go in `sound.js`'s `effects` object. Write them in the existing style (`tone`, `noise`, `vibrato`, `echoBus`), with a one-line comment describing the sound. Keep volumes similar to their neighbours.

## 5. Verify

- In `.claude/skills/playtest/pages/round.html?a=<fighter>&ma=<move>&b=<opponent>&mb=<move>&crop=1`, test the move against at least a striker, a blocker and a dodger. Check the timing, sparks, labels and turn order.
- Run the `smoke.js` driver with that fighter, hover the move button for its tooltip, and confirm `data-errors` is empty.
- Update `README.md` if the move appears in the roster table.
