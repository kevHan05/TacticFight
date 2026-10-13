# Tactic Fight

A turn-based 1v1 arcade fighter. Pick one of six fighters and take on a CPU opponent.

## Run

Open `index.html` in a browser. No install or build step is required.

## Combat

Both fighters pick a move at the same time and the round resolves at once.

- If both fighters strike, both take damage.
- Block stops an incoming strike and charges a 1.5x boost for your next regular strike.
- Each fighter's last move is their ultimate. It becomes available after three completed rounds and recharges three rounds after use.
- Some moves have their own cooldown, shown on the button.
- Reduce the opponent to 0 HP to win. If your HP reaches 0, the match is lost.
- Use the buttons or press `1`-`4` for the moves. On the select screen, press `1`-`6` to pick a fighter.

## Fighters

The roster and every move's rules live in `characters.js`. The new fighters are based on `characterspec.md`.

| Fighter | HP | Moves |
|---|---|---|
| Rook | 100 | Attack (15), Block, Blaze Ball (30) |
| Byte | 100 | Attack (15), Block, Plasma Bolt (30) |
| Bobbie Macalanger | 100 | Macalanger Punch (17), Sneaker Dash (dodge, then power up), Three-Piece Combo (3x6, staggers, risky), Championship Uppercut (34, risky) |
| R.O.C.K.Y | 110 | Bull Rush (12, breaks guard), Steel Fist (14, interrupts), Fortress Mode (armour for 2 rounds), Full Charge Overdrive (26, can't be blocked or dodged) |
| Ninja Main | 80 | Shadow Step (dodge + 8 counter), Rookie Shuriken (3x7, each may miss), Smoke Panic (evade all, blind), Almost Invisible (evade + 28, may be spotted) |
| ZOO-mbie | 115 | Rotten Swing (16, can't be dodged), Undead Shuffle (10 + 50% evade), Safari Senses (reveals the CPU's next move), Zombie Stampede (4x7, can't be dodged) |

Status effects:

- **Exposed:** a risky move missed, so the next hit taken deals 1.5x.
- **Staggered:** hit by a full combo, so your next strike deals half damage.
- **Blinded:** caught in smoke, so your next strike has a 50% chance to miss.
- **Fortified:** Fortress Mode halves the damage taken in the next round too.
- **Tracking:** Safari Senses shows the CPU's next move, and your next strike can't be evaded.

## Graphics

The arena is rendered by `graphics.js` at 320x140 and scaled 3x with hard pixel edges, in the style of early-90s arcade fighters. Fighters are posed from a skeleton, snapped to a fixed palette and outlined, so every move is animated without sprite sheets.

## Sound

All sound effects are synthesized live with the Web Audio API in `sound.js`, so there are no audio files. Press `M` or use the speaker button to toggle sound. The setting is remembered between visits.
