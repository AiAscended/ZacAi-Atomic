/**
 * Admin Activity API
 * Provides read access to system activity logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { readEvents } from '@/lib/systemActivityLogger.cjs';
import { addSecurityHeaders, generateRequestId } from '@/lib/productionHardening';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    const events = readEvents(Math.min(limit, 1000)); // Cap at 1000 for safety
    
    const response = NextResponse.json({
      events,
      count: events.length,
      timestamp: new Date().toISOString(),
    });
    
    response.headers.set('X-Request-Id', requestId);
    return addSecurityHeaders(response);
    
  } catch (error) {
    const response = NextResponse.json(
      {
        error: 'Failed to read activity events',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
    
    response.headers.set('X-Request-Id', requestId);
    return addSecurityHeaders(response);
  }
}
