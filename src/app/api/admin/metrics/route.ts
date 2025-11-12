/**
 * System Metrics API Route
 * Real-time performance metrics for AI inference, system health, and diagnostics
 * Path: /api/admin/metrics
 */

import { NextResponse } from 'next/server'
import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator'
import { domainRegistry } from '@/ai/knowledge-domains/domainRegistry'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/metrics
 * Get comprehensive system metrics
 */
export async function GET() {
  try {
    const startTime = Date.now()
    
    // Gather all metrics
    const domains = domainRegistry.getAllDomains()
    const activeDomains = domains.filter(d => d.enabled)
    
    // Get memory usage (if available in Node.js environment)
    const memoryUsage = process.memoryUsage ? process.memoryUsage() : null
    
    // Calculate uptime
    const uptime = process.uptime ? process.uptime() : null
    
    // Get recent inference metrics
    const recentMetrics = await mainOrchestrator.exportMetricsForTraining(0, 100)
    
    // Calculate performance stats
    const avgProcessingTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum: number, m: any) => sum + (m.processingTime || 0), 0) / recentMetrics.length
      : 0
    
    const avgConfidence = recentMetrics.length > 0
      ? recentMetrics.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / recentMetrics.length
      : 0
    
    // Domain usage statistics
    const domainUsage: Record<string, number> = {}
    recentMetrics.forEach((m: any) => {
      if (m.domains && Array.isArray(m.domains)) {
        m.domains.forEach((domain: string) => {
          domainUsage[domain] = (domainUsage[domain] || 0) + 1
        })
      }
    })
    
    const metrics = {
      system: {
        uptime: uptime ? Math.floor(uptime) : null,
        memory: memoryUsage ? {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        } : null,
        nodeVersion: process.version,
        platform: process.platform,
      },
      
      domains: {
        total: domains.length,
        active: activeDomains.length,
        inactive: domains.length - activeDomains.length,
        usage: domainUsage,
        mostUsed: Object.entries(domainUsage)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([domain, count]) => ({ domain, count })),
      },
      
      inference: {
        totalInferences: recentMetrics.length,
        avgProcessingTime: Math.round(avgProcessingTime),
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        highConfidenceRate: recentMetrics.length > 0
          ? Math.round((recentMetrics.filter((m: any) => m.confidence > 0.7).length / recentMetrics.length) * 100)
          : 0,
      },
      
      models: {
        llm: {
          status: 'disabled',
          reason: 'Dimension mismatch (workaround active)',
        },
        domains: activeDomains.map(d => ({
          name: d.name,
          enabled: d.enabled,
          hasInference: true,
        })),
      },
      
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    }
    
    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    console.error('[Metrics API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
