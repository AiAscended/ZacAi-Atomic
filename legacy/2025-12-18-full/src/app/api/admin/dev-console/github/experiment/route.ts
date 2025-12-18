/**
 * File: src/app/api/admin/dev-console/github/experiment/route.ts
 * Purpose: API endpoint for running automated self-learning experiments
 * 
 * POST - Run a complete experiment (branch + commit + PR)
 */

import { NextRequest, NextResponse } from "next/server";
import { createSelfLearningWorkflow } from "@/lib/github/selfLearningWorkflow";
import { settingsStore } from "@/ai/shared/config/settingsStore";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/dev-console/github/experiment
 * Run a self-learning experiment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureName, changes, reasoning, metrics } = body;

    // Validate required fields
    if (!featureName || !changes || !Array.isArray(changes) || !reasoning) {
      return NextResponse.json(
        { error: "featureName, changes array, and reasoning are required" },
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

    // Create workflow
    const workflow = await createSelfLearningWorkflow({
      owner,
      repo,
      appId: githubSettings.appId,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId,
      autoMergeToStaging: false,
      requireHumanApproval: true,
    });

    // Run experiment
    const result = await workflow.runExperiment(
      featureName,
      changes,
      reasoning,
      metrics
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to run experiment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
