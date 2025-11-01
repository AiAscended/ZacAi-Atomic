/**
 * src/ai/utils/github-app/auth.ts
 * Handles authentication for GitHub App - Generates JWTs and obtains
 * installation access tokens, caching tokens to minimize API calls.
 */

import jwt from "jsonwebtoken";
import { request } from "@octokit/request";

const APP_ID = process.env.GITHUB_APP_ID ?? "";
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY ?? "";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Generate JWT for GitHub App authentication. Valid for 10 minutes.
 */
export function generateAppJwt(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: APP_ID,
  };
  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
  return token;
}

/**
 * Request and cache an installation access token for the given installation ID.
 */
export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }
  const appJwt = generateAppJwt();
  const response = await request('POST /app/installations/{installation_id}/access_tokens', {
    installation_id: installationId,
    headers: {
      authorization: `Bearer ${appJwt}`,
      accept: 'application/vnd.github+json',
    },
  });
  cachedToken = response.data.token;
  tokenExpiry = new Date(response.data.expires_at).getTime() - 60000; // Renew 1 min before expiry
  return cachedToken;
}
