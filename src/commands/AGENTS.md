# commands

Command handlers; registered in `commands.ts`. Entry: `common.ts` (pickers, state).

- **common.ts** – Shared logic, state types, command helpers
- **gitCommands.ts** – Git command palette; **gitCommands.actions.ts** – Git actions
- **git/** – Git-specific: fetch, pull, push, stash, rebase, merge, etc.
- **diffWith*.ts** – Diff commands (previous, next, working, revision)
- **showQuick*.ts** – Quick pick commands (commit, file history, stash)
- **open*OnRemote.ts** – Open file/commit/repo on GitHub/GitLab
- **compareWith.ts**, **diffWith.ts** – Comparison flows
- **quickCommand.ts**, **quickCommand.steps.ts**, **quickCommand.buttons.ts** – Guided commands
