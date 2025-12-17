/**
 * Health Check API Endpoint
 * Enterprise-grade health monitoring for production readiness
 */

import { NextResponse } from 'next/server';
import { getHealthStatus, addSecurityHeaders, generateRequestId } from '@/lib/productionHardening';

export async function GET() {
  const requestId = generateRequestId();
  
  try {
    const health = await getHealthStatus();
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    
    const response = NextResponse.json(health, { status: statusCode });
    response.headers.set('X-Request-Id', requestId);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return addSecurityHeaders(response);
    
  } catch (error) {
    console.error('[Health API] GET error:', error);
    const response = NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        requestId,
      },
      { status: 503 }
    );
    
    response.headers.set('X-Request-Id', requestId);
    return addSecurityHeaders(response);
  }
}

// Also support HEAD requests for basic uptime monitoring
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
