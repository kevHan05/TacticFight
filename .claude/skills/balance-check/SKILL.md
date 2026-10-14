---
name: balance-check
description: Simulate thousands of CPU-vs-CPU TacticFight matches across every pairing to check rules-engine invariants and win rates. Use whenever you change damage, HP, cooldowns, move rule fields, Rules.resolve, the CPU AI (Rules.chooseMove), or add a fighter or move.
---

# Balance check

`sim.html` runs every ordered pairing of `ROSTER` through the real `characters.js` rules engine with the CPU AI picking both sides.

```bash
.claude/skills/playtest/scripts/browser.sh dom ".claude/skills/balance-check/sim.html?games=150" 20000
```

It reports:

- `data-result`: win rate per fighter, the longest match, and games per pair
- `data-pairs`: the most one-sided matchups
- `data-outcomes`: how often each `fighter.move` ends in each result (`hit`, `blocked`, `evaded`, `missed`, `broke`, `chipped`, `armored`, `none`). Use it to spot moves that never land or never get used.
- `data-errors`: **must be empty**. It catches a CPU move chosen while on cooldown, non-integer or negative damage, HP out of range, and matches that never end.

About 150 games per pair (4,500 matches) takes a few seconds and is stable to within ±3%.

## Targets

- **Fighters other than Rook and Byte: about 45–55% win rate.** Tune with the smallest change that works: damage first, then HP, then cooldowns or multipliers in `Rules` (armour 0.4, interrupt 0.7, block chip 0.5, boost 1.5, exposed 1.5). Re-run after each change.
- **Rook and Byte sit around 20% on purpose.** They keep the original spec kit as the "challenge" fighters. **Don't buff them** or report it as a problem.
- Matches should end within roughly 25 rounds. A longer longest-match means defence is too strong.
- No one-sided matchup above about 80% between the non-classic fighters.

## After tuning

- Update the `detail` and `info` text of any changed move in `characters.js` so the UI shows the new numbers.
- Update the roster table in `README.md`.
- Put the before and after win rates in the PR description.
