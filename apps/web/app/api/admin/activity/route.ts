/**
 * Admin Activity API
 * Provides read access to system activity logs
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "maintenance",
    message: "This endpoint is in maintenance mode. Core system functions remain online.",
    timestamp: new Date().toISOString(),
  }, { status: 503 });
}
