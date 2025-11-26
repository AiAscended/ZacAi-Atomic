/**
 * File: src/app/api/admin/dev-console/github/pr/route.ts
 * Purpose: API endpoint for creating pull requests
 * 
 * POST - Create a pull request with diagnostics
 */

import { NextRequest, NextResponse } from "next/server";
import { createGitHubBranchManager } from "@/lib/github/branchManager";
import { settingsStore } from "@/ai/shared/config/settingsStore";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/dev-console/github/pr
 * Create a pull request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branch,
      title,
      body: prBody,
      baseBranch,
      labels,
      featureName,
      reasoning,
      metrics,
      testResults,
    } = body;

    // Validate required fields
    if (!branch) {
      return NextResponse.json(
        { error: "branch is required" },
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

    let result;

    // Use experimental PR creation if feature info provided
    if (featureName && reasoning) {
      result = await manager.createExperimentalPR(
        branch,
        featureName,
        reasoning,
        metrics,
        testResults
      );
    } else {
      // Standard PR creation
      if (!title || !prBody) {
        return NextResponse.json(
          { error: "title and body are required for standard PRs" },
          { status: 400 }
        );
      }

      result = await manager.createPullRequest({
        branch,
        title,
        body: prBody,
        baseBranch,
        labels,
      });
    }

    return NextResponse.json({
      success: true,
      prNumber: result.number,
      prUrl: result.url,
    });
  } catch (error) {
    console.error("Failed to create PR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
