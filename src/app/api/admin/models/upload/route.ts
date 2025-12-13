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
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const model = formData.get("model") as string
    const type = formData.get("type") as string // 'weights' or 'config'

    if (!file || !model || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const targetDir = type === "weights" ? WEIGHTS_DIR : CONFIG_DIR
    const targetPath = path.join(targetDir, `${model}-${file.name}`)

    fs.writeFileSync(targetPath, buffer)

    return NextResponse.json({
      success: true,
      path: targetPath,
      size: buffer.length,
      filename: file.name,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
