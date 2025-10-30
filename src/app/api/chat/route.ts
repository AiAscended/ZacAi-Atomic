/**
 * File: src/app/api/chat/route.ts
 * API Route for handling chat messages and AI initialization.
 * Receives HTTP POST requests with JSON body containing `action` field.
 * Supports "initialize" to start session and "chat" to process prompt.
 *
 * Depends on:
 * - src/ai/orchestration/promptHandler.ts for AI orchestration backend
 */

import { NextRequest, NextResponse } from "next/server"
import { promptHandler } from "@/ai/orchestration/promptHandler"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body || !body.action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 })
    }

    switch (body.action) {
      case "initialize": {
        await promptHandler.initialize()
        // Generate session ID (secure uuid in production)
        const sessionId = `session-${Date.now()}`
        return NextResponse.json({ sessionId })
      }
      case "chat": {
        if (!body.message || !body.sessionId) {
          return NextResponse.json({ error: "Missing message or sessionId" }, { status: 400 })
        }
        const response = await promptHandler.handlePrompt(body.message, body.sessionId, body.context)
        return NextResponse.json(response)
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
