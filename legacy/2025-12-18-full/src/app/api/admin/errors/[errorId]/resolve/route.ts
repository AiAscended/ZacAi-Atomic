import { NextRequest, NextResponse } from "next/server"
import { markManualResolution, markResolving, completeResolution, findErrorById } from "@/lib/errors/errorRegistry"
import type { ErrorResolutionMode } from "@/lib/errors/types"
import { settingsStore as adminSettingsStore } from "@/lib/settingsStore"
import { settingsStore as secureSettingsStore } from "@/ai/shared/config/settingsStore"
import { createSelfLearningWorkflow } from "@/lib/github/selfLearningWorkflow"

export const dynamic = "force-dynamic"

function resolveMode(requestedMode: string | null, autoEnabled: boolean): ErrorResolutionMode {
  if (requestedMode === "manual" || requestedMode === "auto") {
    return requestedMode
  }
  return autoEnabled ? "auto" : "manual"
}

async function ensureWorkflow() {
  const githubSettings = await secureSettingsStore.getGitHubApp()
  if (!githubSettings?.appId || !process.env.GITHUB_APP_PRIVATE_KEY) {
    throw new Error("GitHub App credentials not configured")
  }

  if (!githubSettings.installations?.length) {
    throw new Error("No GitHub App installations found")
  }

  const installationId = parseInt(githubSettings.installations[0].installationId)
  const owner = process.env.GITHUB_REPOSITORY_OWNER || "AiAscended"
  const repo = process.env.GITHUB_REPOSITORY_NAME || "ZacAi-Atomic"

  return createSelfLearningWorkflow({
    owner,
    repo,
    appId: githubSettings.appId,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    installationId,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { errorId: string } }
) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      mode?: string
      note?: string
      actor?: string
    }
    const errorId = params.errorId
    const record = findErrorById(errorId)

    if (!record) {
      return NextResponse.json({ success: false, error: "Error not found" }, { status: 404 })
    }

    const systemSettings = adminSettingsStore.getSystemSettings()
    const autoEnabled = Boolean(systemSettings.autoResolveErrors)
    const strategy = systemSettings.errorRecoveryStrategy === "rollback" ? "rollback" : "self-heal"
    const maxAttempts = systemSettings.maxAutoResolveAttempts || 1

    const mode = resolveMode(body?.mode ?? null, autoEnabled)

    if (mode === "auto" && record.resolution?.attempts >= maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          error: `Max auto-resolve attempts (${maxAttempts}) reached for this incident`,
        },
        { status: 409 }
      )
    }

    if (mode === "manual") {
      const updated = markManualResolution(errorId, body?.note)
      return NextResponse.json({ success: true, data: updated })
    }

    const resolving = markResolving(errorId, {
      mode: "auto",
      strategy,
      actor: "system",
      summary: `Attempting ${strategy} recovery via GitHub self-heal`,
      metadata: {
        requestedBy: body?.actor || "admin-ui",
      },
    })

    if (!resolving) {
      return NextResponse.json({ success: false, error: "Unable to update error state" }, { status: 500 })
    }

    const workflow = await ensureWorkflow()
    const description = record.metadata?.issueDescription || record.message
    const affectedFiles = record.metadata?.affectedFiles
    const result = await workflow.selfHeal(description, affectedFiles)

    const completed = completeResolution(errorId, {
      success: result.success,
      message: result.success
        ? `Self-heal complete${result.backupBranch ? ` (backup ${result.backupBranch})` : ""}`
        : result.error || "Self-heal attempt failed",
      githubBackupBranch: result.backupBranch,
      actor: "system",
      metadata: {
        issueDescription: description,
        strategy,
      },
    })

    const statusCode = result.success ? 200 : 500

    return NextResponse.json({
      success: result.success,
      data: completed,
    }, { status: statusCode })
  } catch (error) {
    console.error("[Admin Errors Resolve] Failure", error)
    if (params?.errorId) {
      completeResolution(params.errorId, {
        success: false,
        message: error instanceof Error ? error.message : "Resolution pipeline crashed",
        actor: "system",
      })
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to resolve error",
      },
      { status: 500 }
    )
  }
}
