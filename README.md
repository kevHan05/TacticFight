# Tactic Fight

A turn-based 1v1 arcade fighter. Pick one of seven fighters (plus a secret eighth) and take on a CPU opponent.

## Modes

- **Campaign:** each fighter has a story. Beat the other fighters, in order, on their home stages, then face PROPHET, the hooded traveling fortune teller who has been lurking at every fight, with dialogue before and after every fight. Lose and you can retry the fight. Progress is saved in the browser.
- **Endless:** fight until you are defeated. Every fight is against a new opponent and both fighters start at full health. Your best streak is saved.
- **Quick Fight:** pick a fighter and take on a random opponent.

- **Secret fighter:** clear every fighter's campaign to unlock PROPHET, or type the code `PROPHET` in the code box on the title screen. Until then his select box shows `???`. Quick Fight and Endless only send PROPHET at you once he is unlocked.

Every fight starts with some pre-fight trash talk. Each fighter has a home stage, and you always fight on your opponent's turf.

## Run

Open `index.html` in a browser. No install or build step is required.

### Playing on a phone

- **Turn the phone sideways** for a full-screen, handheld-style layout: the arena fills the screen, the life bars sit in a thin strip at the top and the moves run along the bottom.
- **Android (Chrome, Samsung Internet):** the game goes full screen and hides the browser bars on your first tap after turning sideways, and leaves full screen when you turn the phone upright again. The `FULL` button (or `F` on a keyboard) toggles it by hand.
- **iPhone:** Safari doesn't let websites go full screen. Tap Share, then **Add to Home Screen**, and the game opens like an app without browser bars.

## Combat

Both fighters pick a move at the same time. The round then plays out one fighter at a time: set-up moves such as guards go first, then strikes, and the player goes first on a tie. Hover over a move to read what it does.

- If both fighters strike, both take damage.
- Block stops an incoming strike and charges a 1.5x boost for your next regular strike.
- Each fighter's last move is their ultimate. It becomes available after three completed rounds and recharges three rounds after use.
- Some moves have their own cooldown, shown on the button.
- Reduce the opponent to 0 HP to win. If your HP reaches 0, the match is lost.
- Use the buttons or press `1`-`4` for the moves. On the select screen, press `1`-`8` to pick a fighter.

## Fighters

The roster and every move's rules live in `characters.js`. The new fighters are based on `characterspec.md`. Backstories, banter and campaign scripts live in `story.js`, the stages in `stages.js`, and the move icons in `icons.js`.

| Fighter | HP | Moves |
|---|---|---|
| Rook | 100 | Attack (15), Block, Blaze Ball (30) |
| Byte | 100 | Attack (15), Block, Plasma Bolt (30) |
| Bobbie Macalanger | 100 | Macalanger Punch (17), Sneaker Dash (dodge, then power up), Three-Piece Combo (3x6, staggers, risky), Championship Uppercut (34, risky) |
| R.O.C.K.Y | 110 | Bull Rush (12, breaks guard), Steel Fist (14, interrupts), Fortress Mode (armour for 2 rounds), Full Charge Overdrive (26, can't be blocked or dodged) |
| Ninja Main | 80 | Shadow Step (dodge + 8 counter), Rookie Shuriken (3x7, each may miss), Smoke Panic (evade all, blind), Almost Invisible (evade + 28, may be spotted) |
| ZOO-mbie | 115 | Rotten Swing (16, can't be dodged), Undead Shuffle (10 + 50% evade), Safari Senses (reveals the CPU's next move), Zombie Stampede (4x7, can't be dodged) |
| BANANAS | 95 | Citrus Kick (13, interrupts), Orange Bounce (dodge + power up), Peel Out (12 + 50% evade, risky), FRUIT NUCLEAR! (4x7, can't be dodged) |
| PROPHET (secret) | 100 | Nova Palm (14, interrupts), Wormhole Warp (dodge + 6 counter), Prophecy (8 + reveals the CPU's next move), BIG BANG (28, can't be blocked or dodged) |

Status effects:

- **Exposed:** a risky move missed, so the next hit taken deals 1.5x.
- **Staggered:** hit by a full combo, so your next strike deals half damage.
- **Blinded:** caught in smoke, so your next strike has a 50% chance to miss.
- **Fortified:** Fortress Mode halves the damage taken in the next round too.
- **Tracking:** Safari Senses or Prophecy shows the CPU's next move, and your next strike can't be evaded.

## Graphics

The arena is rendered by `graphics.js` at 320x140 and scaled 3x with hard pixel edges, in the style of early-90s arcade fighters. Fighters are posed from a skeleton, snapped to a fixed palette and outlined, so every move is animated without sprite sheets. The fight HUD across the top shows arcade-style life bars with a red damage trail, pixel-font name plates and the round counter.

## Sound

All sound effects (`sound.js`) and the 16-bit soundtrack (`music.js`) are synthesized live with the Web Audio API, so there are no audio files. Press `M` or use the speaker button to toggle sound. The setting is remembered between visits.
