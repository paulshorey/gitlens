# git

Git operations layer. Uses `execFile` (shell.ts) for process spawning.

| File / Folder | Purpose |
|---------------|---------|
| **gitService.ts** | Main service: repos, blame, log, fetch, diff |
| **git.ts** | Low-level Git ops (log, blame, diff, fetch); delegates to shell |
| **shell.ts** | `execFile` wrapper; PATH lookup, Windows script handling |
| **gitUri.ts** | `git:` / `gitlens:` URI parsing |
| **fsProvider.ts** | Git revision filesystem provider |
| **locator.ts** | Find Git executable |
| **search.ts** | Search commit messages, etc. |
| **models/** | Commit, branch, remote, blame, stash, etc. |
| **parsers/** | Parse git output (log, blame, branch, diff) |
| **formatters/** | Format models for display |
| **remotes/** | GitHub, GitLab, Bitbucket, Gerrit, Azure DevOps, Gitea, custom |
