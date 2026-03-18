# GitLens Codebase Overview

VS Code extension for Git visualization (blame, history, diff). Kylin fork of eamodio/vscode-gitlens v11.7.0.

## Child Folders & Key Files

| Folder / File | Purpose |
|---------------|---------|
| **src/** | Main extension source; see `src/AGENTS.md` |
| **resources/** | Chart.js bundles, logo; used by Kylin commit chart webviews |
| **scripts/** | Build-time: generateLicenses, generateEmojiShortcodeMap, applyPatchForInsiders |
| **images/** | Extension icons, view SVGs, docs/dark/light theme assets |
| **design/** | Logo PSD, screenshots; design assets |
| **.vscode/** | Launch config, tasks, recommended extensions |
| **.github/** | Issue templates, workflows (CD, CodeQL, stale) |
| **test/** | Extension tests |
| **package.json** | Extension manifest, commands, activation events |
| **webpack.config.js** | Bundles extension + webviews with CSP |

## Flow

```
extension.ts → Container → gitService, config, views
            → mainController → Commit.ts → chart panels
            → registerCommands → commands/*.ts
```
