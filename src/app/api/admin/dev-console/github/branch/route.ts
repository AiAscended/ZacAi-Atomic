/**
 * File: src/app/api/admin/dev-console/github/branch/route.ts
 * Purpose: API endpoint for GitHub branch management operations
 * 
 * POST - Create experimental or backup branches
 * GET  - List branches
 * DELETE - Delete experimental branches
 */

import { NextRequest, NextResponse } from "next/server";
import { createGitHubBranchManager } from "@/lib/github/branchManager";
import { settingsStore } from "@/ai/shared/config/settingsStore";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/dev-console/github/branch
 * Create a new experimental or backup branch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, featureName, description, version } = body;

    // Get GitHub App settings
    const githubSettings = await settingsStore.getGitHubApp();
    
    // Validate credentials
    if (!githubSettings.appId || !process.env.GITHUB_APP_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "GitHub App credentials not configured" },
        { status: 400 }
      );
    }

    // Get installation ID (assume first installation for now)
    if (!githubSettings.installations || githubSettings.installations.length === 0) {
      return NextResponse.json(
        { error: "No GitHub App installations found" },
        { status: 400 }
      );
    }

    const installationId = parseInt(githubSettings.installations[0].installationId);
    
    // Extract owner/repo from current repository
    // In production, this should come from settings or environment
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

    if (action === "experimental") {
      if (!featureName) {
        return NextResponse.json(
          { error: "featureName is required for experimental branches" },
          { status: 400 }
        );
      }

      result = await manager.createExperimentalBranch({
        featureName,
        description,
      });
    } else if (action === "backup") {
      result = await manager.createBackupBranch({
        version,
        description,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'experimental' or 'backup'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      branch: result.branchName,
      sha: result.sha,
    });
  } catch (error) {
    console.error("Failed to create branch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/dev-console/github/branch
 * List experimental branches
 */
export async function GET() {
  try {
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

    const manager = await createGitHubBranchManager({
      owner,
      repo,
      appId: githubSettings.appId,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId,
    });

    const branches = await manager.listExperimentalBranches();

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Failed to list branches:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/dev-console/github/branch
 * Delete an experimental branch
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchName = searchParams.get("branch");

    if (!branchName) {
      return NextResponse.json(
        { error: "branch parameter is required" },
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

    const manager = await createGitHubBranchManager({
      owner,
      repo,
      appId: githubSettings.appId,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId,
    });

    await manager.deleteExperimentalBranch(branchName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete branch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
