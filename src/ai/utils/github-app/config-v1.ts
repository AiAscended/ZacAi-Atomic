/**
 * src/ai/utils/github-app/config.ts
 * Loads and exposes GitHub App configuration from environment variables securely.
 */

export interface GitHubAppConfig {
  appId: string;
  clientId: string;
  webhookSecret: string;
  privateKey: string;
}

export function getGitHubAppConfig(): GitHubAppConfig {
  return {
    appId: process.env.GITHUB_APP_ID ?? "",
    clientId: process.env.GITHUB_APP_CLIENT_ID ?? "",
    webhookSecret: process.env.GITHUB_APP_WEBHOOK_SECRET ?? "",
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY ?? "",
  };
}
