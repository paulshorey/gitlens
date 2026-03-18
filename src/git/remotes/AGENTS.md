# git/remotes

Remote host adapters (GitHub, GitLab, Bitbucket, etc.).

- **provider.ts** – Base RemoteProvider; URL encoding
- **factory.ts** – Match URL → provider (GitHub, GitLab, Bitbucket, Azure, Gerrit, Gitea)
- **github.ts** – GitHub URLs (blob, commit, compare, PR)
- **gitlab.ts** – GitLab
- **bitbucket.ts** – Bitbucket Cloud
- **bitbucket-server.ts** – Bitbucket Server
- **azure-devops.ts** – Azure DevOps
- **gerrit.ts** – Gerrit
- **gitea.ts** – Gitea
- **custom.ts** – User-defined URL templates
