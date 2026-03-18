# src

Extension source. Entry: `extension.ts`. Core singleton: `container.ts`.

## Folders

| Folder | Purpose |
|--------|---------|
| **commands/** | Command handlers (diff, blame, fetch, quick pick, etc.) |
| **git/** | Git ops, shell, parsers, models, remotes |
| **views/** | Sidebar tree views + Kylin `commits-panel/` |
| **webviews/** | Rebase editor, settings, welcome; CSP via webpack |
| **annotations/** | Blame, heatmap, changes in editor gutter |
| **hovers/** | Line hover blame details |
| **quickpicks/** | Quick pick items for commits, repos, refs |
| **codelens/** | Code lens provider (authorship, recent change) |
| **api/** | Public API (`gitlens.d.ts`), action runners |
| **github/** | GitHub GraphQL API (avatars, PRs) |
| **controllers/** | Kylin: mainController for chart commands |
| **services/** | Kylin: Commit, Configuration, Output |
| **system/** | Utils: string, array, date, promise, decorators |
| **terminal/** | Terminal link provider (commit/branch links) |
| **trackers/** | Document/line/blame tracking |
| **utils/** | isBlank, isEmpty, constants |
| **vsls/** | Live Share integration |
| **@types/** | VS Code/Git API type declarations |
| **statusbar/** | Status bar blame controller |

## Key Files

- **extension.ts** – Activates extension, registers Kylin commands
- **container.ts** – DI: gitService, config, views, actionRunners
- **commands.ts** – Command registration, enum
- **configuration.ts** – Settings access
- **constants.ts** – Context keys, glyphs
