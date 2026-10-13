# Tactic Fight

A turn-based 1v1 arcade fighter. Play as Rook against the CPU-controlled Byte.

## Run

Open `index.html` in a browser. No install or build step is required.

## Combat

- Attack deals 15 damage. If both fighters attack, both take damage.
- Block stops an incoming attack or ultimate and charges a 1.5x boost for your next regular attack.
- Ultimate deals 30 damage and becomes available after three completed rounds. It recharges three rounds after use.
- Reduce the opponent to 0 HP to win. If your HP reaches 0, the match is lost.
- Use the buttons or press `1`, `2`, and `3` for Attack, Block, and Ultimate.

## Graphics

The arena is rendered by `graphics.js` at 320x140 and scaled 3x with hard pixel edges, in the style of early-90s arcade fighters. Fighters are posed from a skeleton, snapped to a fixed palette and outlined, so every move is animated without sprite sheets.

## Sound

All sound effects are synthesized live with the Web Audio API in `sound.js`, so there are no audio files. Press `M` or use the SOUND button to mute. The setting is remembered between visits.
