/**
 * File: src/app/api/admin/ide-mode/route.ts
 * Purpose: API endpoint for IDE mode settings
 *
 * GET  - Get current IDE mode settings
 * POST - Update IDE mode settings
 */

import { NextRequest, NextResponse } from "next/server";
import { settingsStore } from "@/ai/shared/config/settingsStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ide-mode
 * Returns current IDE mode settings
 */
export async function GET() {
  try {
    const settings = await settingsStore.getIDEMode();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to get IDE mode settings:", error);
    return NextResponse.json(
      { error: "Failed to retrieve IDE mode settings" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/ide-mode
 * Update IDE mode settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await settingsStore.updateIDEMode(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update IDE mode settings:", error);
    return NextResponse.json(
      { error: "Failed to update IDE mode settings" },
      { status: 500 },
    );
  }
}
