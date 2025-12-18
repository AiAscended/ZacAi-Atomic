/**
 * File: src/ai/utils/github-app/config.ts
 * Loads and exposes GitHub App configuration from environment variables securely.
 *
 * This configuration includes only the variables currently used by the app.
 * 
 * Environment variables required:
 * - GITHUB_APP_ID: The GitHub App's numeric ID.
 * - GITHUB_APP_PRIVATE_KEY: The private key PEM string for signing JWTs.
 * 
 * Optional environment variables like clientId and webhookSecret 
 * are removed to keep the config minimal and focused.
 */

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
}

export function getGitHubAppConfig(): GitHubAppConfig {
  const appId = process.env.GITHUB_APP_ID ?? "";
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY ?? "";

  if (!appId || !privateKey) {
    throw new Error(
      "GitHub App configuration is incomplete: Both GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required"
    );
  }

  return {
    appId,
    privateKey,
  };
}
