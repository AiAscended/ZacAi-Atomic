/**
 * File: app/api/admin/models/upload/route.ts
 * Purpose: API for uploading model weights and configuration files
 */

import { NextRequest, NextResponse } from "next/server"
import * as fs from "node:fs"
import * as path from "node:path"

const WEIGHTS_DIR = path.join(process.cwd(), "data", "models", "weights")
const CONFIG_DIR = path.join(process.cwd(), "data", "models", "configs")

// Ensure directories exist
if (!fs.existsSync(WEIGHTS_DIR)) {
  fs.mkdirSync(WEIGHTS_DIR, { recursive: true })
}
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: "maintenance",
    message: "This endpoint is in maintenance mode. Core system functions remain online.",
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}
