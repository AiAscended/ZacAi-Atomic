/**/**

 * Metrics API Route * System Metrics API Route

 * Real-time performance monitoring for AI system * Real-time performance metrics for AI inference, system health, and diagnostics

 * Path: /api/admin/metrics */

 */

import { NextResponse } from 'next/server'

import { NextRequest, NextResponse } from 'next/server'import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator'

import { metricsCollector } from '@/ai/monitoring/metricsCollector'import { domainRegistry } from '@/ai/knowledge-domains/domainRegistry'



export const dynamic = 'force-dynamic'export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest) {/**

  try { * GET /api/admin/metrics

    const searchParams = request.nextUrl.searchParams * Get comprehensive system metrics

    const action = searchParams.get('action') || 'summary' */

    const timeRange = searchParams.get('timeRange') || '1h'export async function GET() {

  try {

    switch (action) {    const startTime = Date.now()

      case 'summary':    

        return await handleGetSummary(timeRange)    // Gather all metrics

          const domains = domainRegistry.getAllDomains()

      case 'domains':    const activeDomains = domains.filter(d => d.enabled)

        return await handleGetDomainMetrics(timeRange)    

          // Get memory usage (if available in Node.js environment)

      case 'performance':    const memoryUsage = process.memoryUsage ? process.memoryUsage() : null

        return await handleGetPerformanceMetrics(timeRange)    

          // Calculate uptime

      case 'realtime':    const uptime = process.uptime ? process.uptime() : null

        return await handleGetRealtimeMetrics()    

          // Get recent inference metrics

      case 'system':    const recentMetrics = await mainOrchestrator.exportMetricsForTraining(0, 100)

        return await handleGetSystemMetrics()    

          // Calculate performance stats

      default:    const avgProcessingTime = recentMetrics.length > 0

        return NextResponse.json(      ? recentMetrics.reduce((sum: number, m: any) => sum + (m.processingTime || 0), 0) / recentMetrics.length

          { error: 'Invalid action' },      : 0

          { status: 400 }    

        )    const avgConfidence = recentMetrics.length > 0

    }      ? recentMetrics.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / recentMetrics.length

  } catch (error) {      : 0

    console.error('[Metrics API] Error:', error)    

    return NextResponse.json(    // Domain usage statistics

      { error: error instanceof Error ? error.message : 'Unknown error' },    const domainUsage: Record<string, number> = {}

      { status: 500 }    recentMetrics.forEach((m: any) => {

    )      if (m.domains && Array.isArray(m.domains)) {

  }        m.domains.forEach((domain: string) => {

}          domainUsage[domain] = (domainUsage[domain] || 0) + 1

        })

/**      }

 * Get metrics summary    })

 */    

async function handleGetSummary(timeRange: string) {    const metrics = {

  const metrics = await metricsCollector.getSummary(timeRange)      system: {

          uptime: uptime ? Math.floor(uptime) : null,

  return NextResponse.json({        memory: memoryUsage ? {

    success: true,          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB

    timeRange,          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB

    summary: metrics,          external: Math.round(memoryUsage.external / 1024 / 1024), // MB

    timestamp: new Date().toISOString(),          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB

  })        } : null,

}        nodeVersion: process.version,

        platform: process.platform,

/**      },

 * Get domain-specific metrics      

 */      domains: {

async function handleGetDomainMetrics(timeRange: string) {        total: domains.length,

  const metrics = await metricsCollector.getDomainMetrics(timeRange)        active: activeDomains.length,

          inactive: domains.length - activeDomains.length,

  return NextResponse.json({        usage: domainUsage,

    success: true,        mostUsed: Object.entries(domainUsage)

    timeRange,          .sort(([,a], [,b]) => (b as number) - (a as number))

    domains: metrics,          .slice(0, 5)

    timestamp: new Date().toISOString(),          .map(([domain, count]) => ({ domain, count })),

  })      },

}      

      inference: {

/**        totalInferences: recentMetrics.length,

 * Get performance metrics        avgProcessingTime: Math.round(avgProcessingTime),

 */        avgConfidence: Math.round(avgConfidence * 100) / 100,

async function handleGetPerformanceMetrics(timeRange: string) {        highConfidenceRate: recentMetrics.length > 0

  const metrics = await metricsCollector.getPerformanceMetrics(timeRange)          ? Math.round((recentMetrics.filter((m: any) => m.confidence > 0.7).length / recentMetrics.length) * 100)

            : 0,

  return NextResponse.json({      },

    success: true,      

    timeRange,      models: {

    performance: metrics,        llm: {

    timestamp: new Date().toISOString(),          status: 'disabled', // Will be 'active' when LLM is fixed

  })          reason: 'Dimension mismatch (workaround active)',

}        },

        domains: activeDomains.map(d => ({

/**          name: d.name,

 * Get real-time metrics (last 5 minutes)          enabled: d.enabled,

 */          hasInference: true,

async function handleGetRealtimeMetrics() {        })),

  const metrics = await metricsCollector.getRealtimeMetrics()      },

        

  return NextResponse.json({      timestamp: new Date().toISOString(),

    success: true,      responseTime: Date.now() - startTime,

    realtime: metrics,    }

    timestamp: new Date().toISOString(),    

  })    return NextResponse.json({

}      success: true,

      metrics,

/**    })

 * Get system-level metrics  } catch (error) {

 */    console.error('[Metrics API] Error:', error)

async function handleGetSystemMetrics() {    return NextResponse.json(

  const { mainOrchestrator } = await import('@/ai/orchestration/mainOrchestrator')      { success: false, error: 'Failed to fetch metrics' },

        { status: 500 }

  // Get system component status    )

  const systemMetrics = {  }

    orchestrator: {}

      initialized: true,
      domains: 23,
      models: 1,
    },
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
      external: process.memoryUsage().external / 1024 / 1024, // MB
    },
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version,
  }
  
  return NextResponse.json({
    success: true,
    system: systemMetrics,
    timestamp: new Date().toISOString(),
  })
}
