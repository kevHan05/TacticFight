---
name: add-fighter
description: End-to-end checklist for adding a new playable TacticFight character. Covers roster data and moves, pixel sprite and poses, animations, icons, sound voice and cues, story (backstory, banter, campaigns), a home stage, a music track, docs and verification. Use when the user asks for a new character or hands over a character spec.
---

# Add a fighter

A fighter touches almost every file. Work through this list in order. Steps 5–7 are independent of the rest, so delegate them in parallel to the `story-writer`, `stage-artist` and `music-composer` agents. Pick the new fighter's `id` first (lowercase, one word): it keys the roster, sprite, stage, music track, story and campaign progress.

## 1. Design the kit (characters.js)

- Read the spec. Translate real-time abilities into **turn-based rules** using the existing move fields (see the comment block at the top of `characters.js` and the `add-move` skill). Prefer existing mechanics. Add a new rule field to `Rules.resolve` only when nothing fits, and document it in that comment block.
- Add the fighter to `ROSTER` with `id`, `name` (upper case, as shown in the HUD), `title`, `role`, `color` (a hex colour distinct from the others, used for UI boxes and callouts), `hp`, `voice` (a `Sound` effect name), and `moves`. The moves are usually 4, with the **ultimate last**. Every move needs `detail` (a short label with numbers) and `info` (a full tooltip sentence).
- Run the `balance-check` skill and tune until the new fighter is at about 45–55%, without pushing the others out of range. Leave Rook and Byte alone.

## 2. Sprite (graphics.js)

- **Palette object:** `const NAME = { part: ["#shadow", "#base", "#highlight"], ... }`, 2–3 tones per material, 1px dark outline added automatically.
- **Parts object:** `nameParts = { behind?(j, time), arm(shoulder, elbow, hand, back), leg(hip, knee, foot, back), torso(j, time), head(j, time) }`, built from the helpers `shaded`, `capsule`, `line`, `px`, `polygon`, `along`, `at`, `mix` and `dim` (back limbs). Study an existing fighter with a similar build. Give the fighter a **recognisable silhouette** (hair, horns, hat, hood).
- Register the fighter in `FIGHTERS` (`{ parts, palette: paletteOf(NAME) }`). Optionally add a guard stance to `STANCES` and a body size to `SCALES` (0.9–1.1).
- Give it a personality-specific idle in `idlePose()` and a victory pose in `victoryPose()`. Add ambient flavour such as steam or a fly in `drawAmbient()` if it suits the character.

## 3. Moves' animations, icons and sound

For each move whose `anim` key is new, follow the `add-move` skill: an `ANIMS` entry and motion, effects, an icon in `icons.js`, a cue in `playMoveCue()` in `game.js`, and new `Sound` effects if needed. Add a `voice` hurt sound to `sound.js` if none of the existing ones (`rookHurt`, `byteHurt`, `ninjaHurt`, `zombieHurt`) fit.

## 4. Roster-size assumptions in game.js and index.html

- The campaign assumes 5 rivals: the strings `"/5"` and `run.index >= 5` in `game.js`. With a 7th fighter, each campaign has 6 opponents. Replace the hard-coded 5 with `campaignOrder(id).length` everywhere.
- The select hint says "Press 1-6" in `index.html`; update it.

## 5. Story (delegate to `story-writer`)

In `story.js`:

- `backstories[id]`
- banter for every ordered pair involving the newcomer, in both directions: `"new>x"` and `"x>new"`
- a full `campaign[id]` (title, intro, order, fights, ending)
- insert the newcomer into **every other fighter's** campaign `order` and `fights`

## 6. Home stage (delegate to `stage-artist`)

Add `Stages[id]` in `stages.js`. Follow the `add-stage` skill.

## 7. Music (delegate to `music-composer`)

Add a `SONGS[id]` battle theme in `music.js`. Follow the `add-music-track` skill. The game plays the stage id as the track name.

## 8. Docs and verification

- Update `README.md` (the roster table and anything else affected).
- Run the `balance-check` skill again, and the `playtest` skill:
  - `pages/round.html` for every new move against a blocker, a dodger and a striker, plus `finished=1` for the KO and victory poses
  - `pages/stages.html?only=<id>`
  - the `smoke.js` driver with the new fighter's card index at desktop and phone widths
  - the `modes.js` driver with `fighter=<index>`, so the newcomer's campaign plays end to end
- Ship with the `ship-pr` skill. In the PR, explain how each spec ability was translated into turn-based rules.
