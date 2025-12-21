/**
 * File: src/app/api/admin/dev-console/github/commit/route.ts
 * Purpose: API endpoint for committing changes via GitHubBranchManager
 * 
 * POST - Commit changes to a branch with reasoning
 */

import { NextRequest, NextResponse } from "next/server";
import { createGitHubBranchManager } from "@/lib/github/branchManager";
import { settingsStore } from "@/ai/shared/config/settingsStore";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/dev-console/github/commit
 * Commit changes to a GitHub branch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branch, message, files, reasoning } = body;

    // Validate required fields
    if (!branch || !message || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "branch, message, and files array are required" },
        { status: 400 }
      );
    }

    // Get GitHub App settings
    const githubSettings = await settingsStore.getGitHubApp();
    
    if (!githubSettings.appId || !process.env.GITHUB_APP_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "GitHub App credentials not configured" },
        { status: 400 }
      );
    }

    if (!githubSettings.installations || githubSettings.installations.length === 0) {
      return NextResponse.json(
        { error: "No GitHub App installations found" },
        { status: 400 }
      );
    }

    const installationId = parseInt(githubSettings.installations[0].installationId);
    const owner = process.env.GITHUB_REPOSITORY_OWNER || "your-org";
    const repo = process.env.GITHUB_REPOSITORY_NAME || "ZacAi-Atomic";

    // Create branch manager
    const manager = await createGitHubBranchManager({
      owner,
      repo,
      appId: githubSettings.appId,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId,
    });

    // Commit changes
    const result = await manager.commitChanges({
      branch,
      message,
      files,
      reasoning,
    });

    return NextResponse.json({
      success: true,
      sha: result.sha,
    });
  } catch (error) {
    console.error("Failed to commit changes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
