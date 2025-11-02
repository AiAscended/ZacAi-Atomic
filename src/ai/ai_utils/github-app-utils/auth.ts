/**
 * File: src/ai/utils/github-app/auth.ts
 * GitHub App authentication utility functions.
 *
 * Responsibilities:
 * - Generate JWT tokens for GitHub App API authentication.
 *
 * Environment variables used:
 * - GITHUB_APP_ID (GitHub App numeric ID)
 * - GITHUB_APP_PRIVATE_KEY (PEM-format private key)
 *
 * Future extensions:
 * - OAuth token generation handled in separate OAuth module.
 * - Webhook verification handled separately in webhook API routes.
 */

import jwt from "jsonwebtoken";
import { request } from "@octokit/request";

const appId = process.env.GITHUB_APP_ID || "";
const privateKey = (process.env.GITHUB_APP_PRIVATE_KEY || "").replace(/\\n/g, "\n");

/**
 * Generates a signed JWT token for authenticating as GitHub App.
 */
export function generateAppJwt() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // issued at time minus 60 seconds to allow clock skew
    exp: now + 10 * 60, // expires 10 minutes after iat
    iss: appId,
  };
  return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}

/**
 * Get an installation access token for a GitHub App installation.
 * @param installationId - The installation ID
 * @returns The access token string
 */
export async function getInstallationAccessToken(installationId: number): Promise<string> {
  const jwt = generateAppJwt();
  const response = await request("POST /app/installations/{installation_id}/access_tokens", {
    installation_id: installationId,
    headers: {
      authorization: `Bearer ${jwt}`,
      accept: "application/vnd.github+json",
    },
  });
  return response.data.token;
}
