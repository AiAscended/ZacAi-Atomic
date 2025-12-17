/**
 * File: src/app/api/admin/github-app/installations/route.ts
 * Purpose: List GitHub App installations
 * 
 * GET - Retrieve all installations for the GitHub App
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/github-app/installations
 * List all installations of the GitHub App
 */
export async function GET() {
  try {
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

    const { token } = await jwtResponse.json();

    // Fetch installations from GitHub API
    const response = await fetch("https://api.github.com/app/installations", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ZacAI-Atomic",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch installations from GitHub" },
        { status: response.status }
      );
    }

    const installations: GitHubInstallation[] = await response.json();

    // Transform to our format
    const formatted = installations.map((install: Record<string, unknown>) => ({
      installationId: (install.id as number).toString(),
      accountLogin: (install.account as Record<string, unknown>).login,
      accountType: (install.account as Record<string, unknown>).type,
      installedAt: install.created_at,
      repositories: [], // Will be populated on-demand
      permissions: install.permissions || {},
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to get installations:", error);
    return NextResponse.json(
      { error: "Failed to retrieve installations" },
      { status: 500 }
    );
  }
}
