@AGENTS.md

## Claude Code specifics

- Project skills are in `.claude/skills/` and project subagents in `.claude/agents/`. Invoke a skill when its trigger in the table above matches.
- On this machine the shell is Windows Git Bash. Node and Python are not installed, so all checks go through a headless Chromium browser via `.claude/skills/playtest/scripts/browser.sh`.
- Run independent subagents (for example `stage-artist`, `story-writer` and `music-composer`) in the background in parallel, then integrate their files and run the `playtest` skill yourself.
