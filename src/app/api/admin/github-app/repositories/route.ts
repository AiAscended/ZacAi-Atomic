/**
 * File: src/app/api/admin/github-app/repositories/route.ts
 * Purpose: List repositories accessible to a GitHub App installation
 *
 * GET - Retrieve repositories for a specific installation
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/github-app/repositories?installationId=123
 * List repositories for an installation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installationId");

    if (!installationId) {
      return NextResponse.json(
        { error: "installationId query parameter is required" },
        { status: 400 },
      );
    }

    // Get installation token
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/github-app/installation-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId }),
      },
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return NextResponse.json(
        { error: error.error || "Failed to get installation token" },
        { status: 500 },
      );
    }

    const { token } = await tokenResponse.json();

    // Fetch repositories
    const response = await fetch(
      "https://api.github.com/installation/repositories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "ZacAI-Atomic",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch repositories from GitHub" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform to our format
    const formatted = data.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url,
      description: repo.description,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to get repositories:", error);
    return NextResponse.json(
      { error: "Failed to retrieve repositories" },
      { status: 500 },
    );
  }
}
