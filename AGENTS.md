# TacticFight: guide for AI coding agents

This file is the shared source of truth for Claude Code (`CLAUDE.md` imports it) and GitHub Copilot (`.github/copilot-instructions.md` points here). Read it before changing anything.

## What this is

TacticFight is a turn-based 1v1 arcade fighter in a 16-bit, Street Fighter II–style look. It is plain HTML/CSS/JavaScript: **no build step, no dependencies, no audio or image files**. Open `index.html` in a browser to play. GitHub Pages serves `main` at https://kevhan05.github.io/TacticFight/ and redeploys about 1–2 minutes after each merge.

- `spec.md`: the original game spec. Rook vs Byte, Attack/Block/Ultimate, 100 HP, 15 attack.
- `characterspec.md`: spec for Bobbie, R.O.C.K.Y, Ninja Main and ZOO-mbie.
- `README.md`: player-facing rules, roster table and modes. Keep it up to date when gameplay changes.

## Architecture

Scripts are classic `<script>` tags. Each file defines one global, and **load order matters** (see `index.html`):

| File | Global | Responsibility |
|---|---|---|
| `sound.js` | `Sound` | Procedural sound effects (Web Audio). `Sound.play(name, delaySeconds, ...args)` |
| `music.js` | `Music` | Procedural 16-bit soundtrack, a lookahead sequencer. `play(track)`, `stop()`, `unlock()`, `setMuted()`, `current()`, `_render()` (test hook) |
| `characters.js` | `ROSTER`, `Rules` | Fighter data and the **pure rules engine** (`Rules.resolve`, `Rules.chooseMove`). No DOM access. |
| `story.js` | `STORY` | Backstories, banter for every ordered pair `"a>b"`, and a campaign for each fighter |
| `icons.js` | `MoveIcons` | 12x12 pixel-art icon for each animation key |
| `stages.js` | `Stages` | One stage per fighter id: `{ name, build(ctx, h), animate(ctx, h, now, excitement) }` |
| `graphics.js` | `Arena` | The 320x140 pixel renderer: skeleton-posed sprites, animations, effects, callouts. `draw()`, `portrait()`, `timing()`, `SLOW` |
| `game.js` | n/a | Screens, modes, UI, dialogue, the round flow, and sound cue timing |
| `style.css` | n/a | All styling. Colours are CSS variables in `:root`, and each fighter's colour arrives as `--fighter`. |

### Core concepts

- **Rounds are simultaneous in rules, sequential in presentation.** Both fighters commit, `Rules.resolve()` computes everything at once, and `Arena.timing(report, ids)` turns the result into **phases**: set-up (non-strike) moves first, then strikes, with the player first on a tie. Animations are slowed by `Arena.SLOW` (1.8). `game.js` schedules health-bar drops at each `phase.hit`, sound cues per phase, the K.O. at `plan.koAt`, and locks input until `plan.end`.
- **Moves are data.** Each move in `ROSTER` has rule fields (`damage`, `hits`, `chance`, `guard`, `area`, `breaksGuard`, `interrupt`, `risky`, `stagger`, `counter`, `momentum`, `blind`, `fortify`, `track`, `cooldown`, `ultimate`) plus `anim` (the key into `ANIMS` in `graphics.js`, the sound cue and the icon), `detail` (short label) and `info` (tooltip text). The comment block at the top of `characters.js` is the reference for these fields.
- **The ultimate is always a fighter's last move.** It unlocks after 3 rounds and recharges for 3.
- **Statuses** (`boost`, `exposed`, `staggered`, `blinded`, `fortified`, `tracking`) last exactly one round, except `boost`, which lasts until the next non-ultimate strike.
- **Stages:** each fight happens on the opponent's stage (`state.stage`, which defaults to `state.bot.id`). Music plays the stage id as its track.
- **Persistence:** `localStorage` keys are `tactic-fight-muted`, `tactic-fight-campaign` and `tactic-fight-endless-best`. Always wrap access in try/catch.

## Conventions

- **Match the surrounding code:**
  - 2-space indent, double quotes, semicolons
  - IIFE modules that return a small public object
  - `function` declarations for named helpers, arrow functions for callbacks
  - short comments that explain *why* or *what a block is for*, with similar comment density to the existing code
- **No new dependencies, frameworks, bundlers or asset files.** Graphics are drawn in code, and sound and music are synthesized.
- **16-bit look** (graphics.js, stages.js):
  - Draw at 320x140 and scale ×3 with nearest-neighbour sampling.
  - Use limited palettes, hard colour bands with checkerboard dithering, and integer pixels.
  - Don't use anti-aliased arc/stroke/ellipse calls in stages. Sprites are snapped to their palette and get a 1px dark outline.
  - Fighters stand with their feet at y=92 on desktop and y=126 on mobile. The desktop view is cropped to roughly x 60–260, y 20–110.
- **The UI must work at phone width.** Check the `@media (max-width: 620px / 420px)` rules, keep keyboard shortcuts working (1–4 moves, 1–6 select, 1–3 modes, M mute, Enter/Space/Escape in dialogue), and respect `prefers-reduced-motion` (no screen shake or flash).
- **Humour and tone:** the content (banter, campaign, move names) is comedic and family friendly. Keep each character's voice from `characterspec.md`. Dialogue lines stay at 90 characters or fewer.

## Design decisions to respect

- **Rook and Byte stay at their original kit** (100 HP, Attack 15, Block, Ultimate 30) even though they win only about 20% in simulations. The owner wants them as the challenging option. Don't buff them or flag their balance.
- **Balance target:** the other fighters should land at roughly a **45–55%** win rate against each other in the CPU-vs-CPU simulation (see the `balance-check` skill).
- When the spec describes real-time abilities (dashes, area attacks, stealth), translate them into **turn-based rules** using the existing move fields, and explain the translation in the PR.

## Workflow

1. **Pull first.** Run `git checkout main && git pull`, then create a branch (`feature/...`, `fix/...`, `chore/...`). Never commit straight to `main`.
2. Make the change, keeping each PR focused on one request.
3. **Verify in a real browser engine.** Use the `playtest` skill: headless Edge or Chrome screenshots, DOM dumps and scripted playthroughs. Look at the screenshots, don't just check they exist. For rules changes, also run `balance-check`.
4. Update `README.md` if gameplay, controls or modes change.
5. **Commit and open a PR** with the `ship-pr` skill. Write a descriptive commit message and a PR body with a summary and a test plan (ticked items you ran, unticked items for manual checks like listening to audio).
6. If the PR falls behind `main`, **merge `main` into the branch** (don't rebase or force-push), resolve the conflicts, re-test and push.
7. After a merge, confirm the GitHub Pages deploy succeeded (`gh run list`), then check the live URL.

Only merge PRs, push to `main`, or delete branches when the owner asks.

## Skills and agents

Skills live in `.claude/skills/<name>/SKILL.md`, and some have scripts next to them. Claude Code loads them automatically. GitHub Copilot's agent mode can also discover skills in `.claude/skills`; if your Copilot doesn't, open the `SKILL.md` named below and follow it. Either way, the files are plain Markdown and work for any agent.

| Skill | Use it when |
|---|---|
| `playtest` | Verifying anything visual or interactive: screenshots, scripted playthroughs, error capture |
| `balance-check` | Changing damage, HP, move rules or the CPU AI |
| `add-fighter` | Adding a new playable character, end to end |
| `add-move` | Adding or changing a single move (rules, animation, icon, sound, docs) |
| `add-stage` | Adding or changing a stage |
| `add-music-track` | Adding or changing a soundtrack track |
| `ship-pr` | Branching, committing, pushing, opening and updating PRs, checking the Pages deploy |

Agents can work in parallel on independent files. The canonical definitions are in `.claude/agents/`, and Copilot mirrors are in `.github/agents/`:

| Agent | Owns |
|---|---|
| `stage-artist` | `stages.js` |
| `story-writer` | `story.js` |
| `music-composer` | `music.js` |
| `playtester` | Read-only verification and bug reports |

When delegating, give each agent **one file it owns** and the exact interface it must keep. Tell it not to touch other files, branches or git, then integrate and test its work yourself.
