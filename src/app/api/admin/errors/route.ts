import { NextRequest, NextResponse } from "next/server"
import { listErrors, recordError, syncFromActivityLog, getAutoResolveConfig } from "@/lib/errors/errorRegistry"
import type { ErrorSeverity, ListErrorsOptions, RecordErrorPayload } from "@/lib/errors/types"

export const dynamic = "force-dynamic"

const VALID_SEVERITIES: ErrorSeverity[] = ["info", "warning", "error", "critical"]

function sanitizeSeverity(value?: string | null): ErrorSeverity {
  if (!value) return "error"
  return VALID_SEVERITIES.includes(value as ErrorSeverity) ? (value as ErrorSeverity) : "error"
}

function sanitizeStatus(value?: string | null): ListErrorsOptions["status"] {
  if (!value) return "active"
  if (["active", "resolved", "all"].includes(value)) {
    return value as ListErrorsOptions["status"]
  }
  return "active"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = sanitizeStatus(searchParams.get("status"))
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 250)

    // Pull fresh items from activity log before returning results
    syncFromActivityLog(500)

    const errors = listErrors({ status, limit })
    const allErrors = listErrors({ status: "all", limit: 1000 })
    const stats = {
      active: allErrors.filter((err) => err.status === "open" || err.status === "resolving").length,
      resolved: allErrors.filter((err) => err.status === "resolved").length,
      critical: allErrors.filter((err) => err.severity === "critical").length,
      warning: allErrors.filter((err) => err.severity === "warning").length,
    }

    return NextResponse.json({
      success: true,
      data: {
        errors,
        stats,
        autoResolve: getAutoResolveConfig(),
      },
    })
  } catch (error) {
    console.error("[Admin Errors API] GET failed", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load error registry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RecordErrorPayload>

    if (!body?.message || !body?.domain || !body?.subsystem) {
      return NextResponse.json(
        {
          success: false,
          error: "domain, subsystem, and message are required",
        },
        { status: 400 }
      )
    }

    const payload: RecordErrorPayload = {
      domain: body.domain,
      subsystem: body.subsystem,
      source: body.source || "manual",
      message: body.message,
      severity: sanitizeSeverity(body.severity),
      detectedAt: body.detectedAt,
      metadata: body.metadata,
    }

    const record = recordError(payload)

    return NextResponse.json({
      success: true,
      data: record,
    })
  } catch (error) {
    console.error("[Admin Errors API] POST failed", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
