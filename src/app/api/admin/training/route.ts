/**
 * Training Automation API Route
 * Provides endpoints for managing training schedules and manual triggers
 * Path: /api/admin/training
 */

import { NextRequest, NextResponse } from 'next/server'
import { settingsStore } from '@/ai/shared/config/settingsStore'
import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/training
 * Get current training status and settings
 */
export async function GET() {
  try {
    const settings = await settingsStore.getTraining()
    
    // Get current metrics summary
    const metrics = await mainOrchestrator.exportMetricsForTraining(0.5, 10)
    
    return NextResponse.json({
      success: true,
      settings,
      metrics: {
        totalSamples: metrics.length,
        highConfidenceSamples: metrics.filter((m: any) => m.confidence > 0.7).length,
        lastTrainingRun: settings.lastTrainingRun || null,
        nextScheduledRun: settings.nextScheduledRun || null,
      },
    })
  } catch (error) {
    console.error('[Training API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/training
 * Update training settings or trigger manual training
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, settings } = body

    if (action === 'trigger') {
      // Manual training trigger
      console.log('[Training API] Triggering manual training...')
      
      const minConfidence = settings?.minConfidence || 0.7
      const maxSamples = settings?.maxSamples || 1000
      
      // Export training data
      const trainingData = await mainOrchestrator.exportMetricsForTraining(
        minConfidence,
        maxSamples
      )
      
      console.log(`[Training API] Exported ${trainingData.length} training samples`)
      
      // Update last training run timestamp
      const currentSettings = await settingsStore.getTraining()
      await settingsStore.updateTraining({
        ...currentSettings,
        lastTrainingRun: new Date().toISOString(),
      })
      
      return NextResponse.json({
        success: true,
        message: 'Training triggered successfully',
        samplesExported: trainingData.length,
      })
    } else if (action === 'updateSettings') {
      // Update training settings
      await settingsStore.updateTraining(settings)
      
      return NextResponse.json({
        success: true,
        message: 'Training settings updated',
        settings,
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Training API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process training request' },
      { status: 500 }
    )
  }
}
