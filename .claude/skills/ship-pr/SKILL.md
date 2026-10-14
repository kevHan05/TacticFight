---
name: ship-pr
description: Git and GitHub workflow for TacticFight. Covers pulling and branching, committing with a good message, pushing, opening a PR with a summary and test plan, updating a PR that is behind main, merging only on request, and confirming the GitHub Pages deploy. Use whenever work is ready to commit, or the user asks to pull, commit, push, open, update or merge a PR.
---

# Ship a change

The remote is `origin` on github.com (`kevHan05/TacticFight`). The `gh` CLI is authenticated. `main` deploys to GitHub Pages: https://kevhan05.github.io/TacticFight/

## Start of work

```bash
git checkout main && git pull
git checkout -b feature/<short-name>      # or fix/..., chore/...
```

When the user says "do a pull", pull `main`, then summarise what arrived (`git log`, and skim any new spec files). New spec files usually mean new work is coming.

## Commit and push

- Stage specific files, not unrelated stray files. Check `git status` first.
- **Commit message:** a short imperative summary line, then a body explaining *what* changed and *why*, as bullets for multi-part work. End with your tool's co-author trailer, if your environment provides one.
- Push with `git push -u origin <branch>`. If the push is rejected with a 403, tell the user; don't fork or work around it on your own. They may grant access and ask you to retry.

## Open the PR

```bash
gh pr create --base main --head <branch> --title "<summary>" --body-file - <<'EOF'
## Summary
<what changed, grouped by the user's numbered requests where there were several;
for spec translations, explain the turn-based interpretation>

## Test plan
- [x] <checks you actually ran: playtest drivers, screenshots looked at, balance numbers>
- [ ] <checks only a human can do, such as listening to audio or judging feel>
EOF
```

Add your tool's PR footer if your environment provides one. Report the PR URL to the user, along with any decision you need from them.

## PR behind main

```bash
git fetch origin && git merge origin/main      # never rebase or force-push shared branches
```

Resolve conflicts by keeping **both** intents: the other side's changes and yours. Re-run the relevant `playtest` checks, commit the merge with a body explaining how the conflicts were resolved, push, and check `gh pr view <n> --json mergeable,mergeStateStatus` until it says `MERGEABLE CLEAN`.

## Merge (only when asked)

```bash
gh pr merge <n> --merge                        # merge commit, matching the repo history
git checkout main && git pull
```

## Confirm the deploy

```bash
gh run list -R kevHan05/TacticFight -L 3       # "pages build and deployment" should be completed/success on the merge SHA
curl -s https://kevhan05.github.io/TacticFight/ | grep -c '<script src='
```

A deploy usually takes 1–2 minutes. Tell the user to hard-refresh (Ctrl+F5) if they still see old files.
