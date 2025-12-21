/**
 * Domain Settings API Route
 *
 * Endpoints:
 * - GET /api/admin/settings/domains - Get all domain settings
 * - GET /api/admin/settings/domains?name=react - Get specific domain
 * - PUT /api/admin/settings/domains - Update domain settings
 */

import { NextRequest, NextResponse } from "next/server";
import { settingsStore } from "@/lib/settingsStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "maintenance",
    message: "This endpoint is in maintenance mode. Core system functions remain online.",
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainName, settings } = body;

    if (!domainName) {
      return NextResponse.json(
        { success: false, error: "Domain name is required" },
        { status: 400 },
      );
    }

    const updated = settingsStore.saveDomainSettings(domainName, settings);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `${domainName} settings saved successfully`,
    });
  } catch (error) {
    console.error("[Domain Settings API] Error updating:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update domain settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
