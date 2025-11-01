/**
 * File: src/app/api/admin/github-app/installation-token/route.ts
 * Purpose: Exchange installation ID for an access token
 * 
 * POST - Get installation access token for making API calls on behalf of installation
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/github-app/installation-token
 * Exchange installation ID for an access token
 * 
 * Body: { installationId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { installationId } = body;

    if (!installationId) {
      return NextResponse.json(
        { error: "installationId is required" },
        { status: 400 }
      );
    }

    // Get JWT token from internal endpoint
    const jwtResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/github-app/jwt`, {
      method: "POST",
    });

    if (!jwtResponse.ok) {
      const error = await jwtResponse.json();
      return NextResponse.json(
        { error: error.error || "Failed to generate JWT" },
        { status: 500 }
      );
    }

    const { token: jwtToken } = await jwtResponse.json();

    // Exchange JWT for installation token
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ZacAI-Atomic",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", errorText);
      return NextResponse.json(
        { error: "Failed to create installation token" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      token: data.token,
      expiresAt: data.expires_at,
      permissions: data.permissions,
      repositorySelection: data.repository_selection,
    });
  } catch (error) {
    console.error("Failed to create installation token:", error);
    return NextResponse.json(
      { error: "Failed to create installation token" },
      { status: 500 }
    );
  }
}
