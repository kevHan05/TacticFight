# Copilot instructions for TacticFight

Read and follow **`AGENTS.md`** in the repository root. It is the shared guide for all AI agents: architecture, conventions, design decisions and workflow.

Key rules in short:

- Plain HTML/CSS/JS with no build step, no dependencies and no asset files. Graphics are drawn in code, and audio is synthesized with Web Audio.
- Match the existing style: IIFE modules exposing one global, 2-space indent, double quotes, semicolons.
- Don't buff Rook or Byte. Their low win rate is intentional.
- Branch from an up-to-date `main`, keep one focused PR per request, and merge `main` into the branch when it falls behind (never force-push).
- Verify changes in a headless browser before opening a PR (see `.claude/skills/playtest/SKILL.md`). For rules changes, also run `.claude/skills/balance-check/SKILL.md`.

Step-by-step skills live in `.claude/skills/*/SKILL.md`, and agent definitions in `.github/agents/`.
