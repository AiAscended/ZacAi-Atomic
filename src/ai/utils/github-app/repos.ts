/**
 * src/ai/utils/github-app/repos.ts
 * GitHub repository management functions for the GitHub App.
 */

import { getInstallationAccessToken } from "./auth";
import { request } from "@octokit/request";

/**
 * Lists repositories accessible to the GitHub App installation.
 */
export async function listRepos(installationId: number) {
  const token = await getInstallationAccessToken(installationId);
  const response = await request("GET /installation/repositories", {
    headers: { authorization: `token ${token}` },
  });
  return response.data.repositories;
}

/**
 * Creates a new private repository in the installation's account.
 */
export async function createRepo(installationId: number, repoName: string) {
  const token = await getInstallationAccessToken(installationId);
  const response = await request("POST /user/repos", {
    name: repoName,
    private: true,
    headers: { authorization: `token ${token}` },
  });
  return response.data;
}
