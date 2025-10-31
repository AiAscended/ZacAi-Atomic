/**
 * src/ai/utils/github-app/search.ts
 * Implements repository and code search.
 */

import { getInstallationAccessToken } from "./auth";
import { request } from "@octokit/request";

/**
 * Searches repositories by query.
 */
export async function searchRepos(
  installationId: number,
  query: string,
  perPage = 30,
  page = 1
) {
  const token = await getInstallationAccessToken(installationId);
  const response = await request("GET /search/repositories", {
    q: query,
    per_page: perPage,
    page,
    headers: { authorization: `token ${token}` },
  });
  return response.data.items;
}
