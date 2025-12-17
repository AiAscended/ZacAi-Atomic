/**
 * File: src/app/api/github-app/token/route.ts
 * API route to exchange installation ID for GitHub installation access token.
 *
 * Responsibilities:
 * - Accept `installationId` in POST body.
 * - Use app JWT to request GitHub API for an installation access token.
 * - Return token JSON to caller.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAppJwt } from "@/ai/ai_utils/github-app-utils/auth";

export async function POST(request: NextRequest) {
  const { installationId } = await request.json();

  const appJwt = generateAppJwt();

  const githubResponse = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!githubResponse.ok) {
    return NextResponse.json(
      { error: "Failed to retrieve GitHub access token" },
      { status: 500 },
    );
  }

  const tokenData = await githubResponse.json();
  return NextResponse.json(tokenData);
}
