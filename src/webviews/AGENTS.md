# webviews

Webview panels. Base: `webviewBase.ts`. CSP via webpack CspHtmlPlugin.

- **webviewBase.ts** – Base class; CSP nonce, postMessage
- **protocol.ts** – IPC message types
- **rebaseEditor.ts** – Interactive rebase editor (gitlens.rebase)
- **settingsWebview.ts** – Settings editor
- **welcomeWebview.ts** – Welcome page
- **apps/** – Webview app bundles (rebase, settings, welcome)
