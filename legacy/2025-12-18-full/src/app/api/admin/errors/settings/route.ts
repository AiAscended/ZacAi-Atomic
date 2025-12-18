import { NextRequest, NextResponse } from "next/server"
import { settingsStore } from "@/lib/settingsStore"

export const dynamic = "force-dynamic"

function serialize() {
  const system = settingsStore.getSystemSettings()
  return {
    autoResolveErrors: Boolean(system.autoResolveErrors),
    errorRecoveryStrategy: system.errorRecoveryStrategy === "rollback" ? "rollback" : "self-heal",
    maxAutoResolveAttempts: system.maxAutoResolveAttempts || 1,
  }
}

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: serialize() })
  } catch (error) {
    console.error("[Admin Error Settings] GET failed", error)
    return NextResponse.json(
      { success: false, error: "Unable to read error recovery settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const autoResolveErrors = Boolean(body?.autoResolveErrors)
    const errorRecoveryStrategy = body?.errorRecoveryStrategy === "rollback" ? "rollback" : "self-heal"
    const maxAutoResolveAttempts = Math.max(1, Math.min(5, Number(body?.maxAutoResolveAttempts) || 1))

    const updated = settingsStore.saveSystemSettings({
      autoResolveErrors,
      errorRecoveryStrategy,
      maxAutoResolveAttempts,
    })

    return NextResponse.json({
      success: true,
      data: {
        autoResolveErrors: updated.autoResolveErrors,
        errorRecoveryStrategy: updated.errorRecoveryStrategy,
        maxAutoResolveAttempts: updated.maxAutoResolveAttempts,
      },
    })
  } catch (error) {
    console.error("[Admin Error Settings] PUT failed", error)
    return NextResponse.json(
      { success: false, error: "Unable to update error recovery settings" },
      { status: 500 }
    )
  }
}
