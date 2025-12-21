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
  return NextResponse.json({
    status: "maintenance",
    message: "This endpoint is in maintenance mode. Core system functions remain online.",
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: "maintenance",
    message: "This endpoint is in maintenance mode. Core system functions remain online.",
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}
