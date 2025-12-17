/**
 * src/ai/utils/github-app/files.ts
 * Read, write, and update files in GitHub repositories.
 */

import { getInstallationAccessToken } from "./auth";
import { request } from "@octokit/request";

type AuthorizationHeader = {
  authorization: string;
};

type WriteFileParams = {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  branch?: string;
  sha?: string;
  headers: AuthorizationHeader;
};

type GitHubError = {
  status?: number;
};

/**
 * Reads the content of a file from a repo.
 */
export async function readFile(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  ref = "main",
): Promise<string> {
  const token = await getInstallationAccessToken(installationId);
  const response = await request("GET /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
    ref,
    headers: { authorization: `token ${token}` },
  });

  // Type guard: ensure we're dealing with a file, not a directory or array
  if (Array.isArray(response.data)) {
    throw new Error(`Path ${path} is a directory, not a file`);
  }
  if (!("content" in response.data)) {
    throw new Error(`No content found for ${path}`);
  }

  return Buffer.from(response.data.content, "base64").toString("utf-8");
}

/**
 * Writes a file (create or update) with commit message.
 */
export async function writeFile(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  message: string,
  content: string,
  sha?: string,
  branch = "main",
) {
  const token = await getInstallationAccessToken(installationId);
  const encoded = Buffer.from(content).toString("base64");

  const params: {
    owner: string
    repo: string
    path: string
    message: string
    content: string
    branch: string
    headers: { authorization: string }
    sha?: string
  } = {
    owner,
    repo,
    path,
    message,
    content: encoded,
    branch,
    headers: { authorization: `token ${token}` },
  };
  if (sha) {
    params.sha = sha;
  }

  const response = await request(
    "PUT /repos/{owner}/{repo}/contents/{path}",
    params,
  );
  return response.data;
}

/**
 * Retrieves the SHA for a file in the repo.
 */
export async function getFileSha(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  ref = "main",
): Promise<string | null> {
  try {
    const token = await getInstallationAccessToken(installationId);
    const response = await request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path,
        ref,
        headers: { authorization: `token ${token}` },
      },
    );

    // Type guard: ensure we're dealing with a file, not a directory or array
    if (Array.isArray(response.data)) {
      throw new Error(`Path ${path} is a directory, not a file`);
    }

    return response.data.sha;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

function isNotFoundError(error: unknown): error is GitHubError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "status" in error && (error as GitHubError).status === 404;
}
