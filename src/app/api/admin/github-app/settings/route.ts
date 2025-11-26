/**
 * File: src/app/api/admin/github-app/settings/route.ts
 * Purpose: API endpoint for GitHub App settings management
 * 
 * GET  - Retrieve current GitHub App settings (non-sensitive data)
 * POST - Update GitHub App settings
 */

import { NextRequest, NextResponse } from "next/server";
import { settingsStore } from "@/ai/shared/config/settingsStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/github-app/settings
 * Returns non-sensitive GitHub App configuration
 * Auto-populates from environment variables if settings store is empty
 */
export async function GET() {
  try {
    const settings = await settingsStore.getGitHubApp();
    
    // Auto-populate from environment variables if not set in store
    // This enables seamless Codespaces integration where secrets are pre-configured
    const appId = settings.appId || process.env.GITHUB_APP_ID || "";
    const clientId = settings.clientId || process.env.GITHUB_APP_CLIENT_ID || "";
    const webhookUrl = settings.webhookUrl || process.env.GITHUB_APP_WEBHOOK_URL || "";
    
    // Indicate if credentials are loaded from environment
    const isAutoPopulated = !settings.appId && !!process.env.GITHUB_APP_ID;
    
    // Redact sensitive information
    const safeSettings = {
      appId,
      clientId,
      installations: settings.installations,
      webhookUrl,
      enableAutoCommit: settings.enableAutoCommit,
      enablePRCreation: settings.enablePRCreation,
      enableIssueSync: settings.enableIssueSync,
      defaultBranch: settings.defaultBranch,
      commitMessagePrefix: settings.commitMessagePrefix,
      isAutoPopulated, // Flag to show in UI
      hasPrivateKey: !!process.env.GITHUB_APP_PRIVATE_KEY,
      hasWebhookSecret: !!process.env.GITHUB_APP_WEBHOOK_SECRET,
      // Don't send: webhookSecret, privateKey
    };

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error("Failed to get GitHub App settings:", error);
    return NextResponse.json(
      { error: "Failed to retrieve settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/github-app/settings
 * Update GitHub App settings (metadata only, not secrets)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.appId || !body.clientId) {
      return NextResponse.json(
        { error: "appId and clientId are required" },
        { status: 400 }
      );
    }

    // Update settings (secrets come from env vars)
    const updated = await settingsStore.updateGitHubApp({
      appId: body.appId,
      clientId: body.clientId,
      webhookUrl: body.webhookUrl,
      enableAutoCommit: body.enableAutoCommit ?? false,
      enablePRCreation: body.enablePRCreation ?? true,
      enableIssueSync: body.enableIssueSync ?? true,
      defaultBranch: body.defaultBranch || "main",
      commitMessagePrefix: body.commitMessagePrefix || "[AI]",
    });

    // Redact sensitive information
    const safeSettings = {
      appId: updated.appId,
      clientId: updated.clientId,
      installations: updated.installations,
      webhookUrl: updated.webhookUrl,
      enableAutoCommit: updated.enableAutoCommit,
      enablePRCreation: updated.enablePRCreation,
      enableIssueSync: updated.enableIssueSync,
      defaultBranch: updated.defaultBranch,
      commitMessagePrefix: updated.commitMessagePrefix,
    };

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error("Failed to update GitHub App settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
