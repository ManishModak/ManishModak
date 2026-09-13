---
name: file-pr
description: Guidelines for writing pull request titles and descriptions. Use when drafting a PR title, PR description, or opening a pull request. PR titles become commit messages, so follow repo conventions. Open descriptions with the problem from the user's prompt, then briefly explain the solution — never lead with an implementation inventory.
---

# PR Writing Guidelines

PR titles usually become commit messages, so follow the repository's title conventions. Look at recently merged PRs and Git history for examples. Prefer a concise, human-readable title that explains why the change matters:

BAD:

```
❌ perf(server): negotiate permessage-deflate on the websocket
```

GOOD:

```
✅ perf(server): cut websocket frame size by 70%+ with gzipping
```

Open the description with a simple explanation of the problem based on the user's original prompt, then briefly explain the solution. Do not lead with an implementation inventory:

BAD:

```
❌ Removed implicit workspace carry-over from every "new thread" entry point (cmd+n / cmd+shift+o, sidebar v1/v2 buttons, command palette). New threads inherit only the project from context; branch, worktree, and env mode always come from the configured defaults. Deleted buildContextualThreadOptions, startNewThreadInProjectFromContext, and the v1 sidebar's seed-context machinery.
```

GOOD:

```
✅ My "new worktree" default was ignored when starting new threads on existing worktrees. Super unintuitive. Now your preferences always apply.
```
