/**/**

 * Training API Route * Training Automation API Route

 * Handles manual training triggers and scheduling configuration * Provides endpoints for managing training schedules and manual triggers

 * Path: /api/admin/training */

 */

import { NextRequest, NextResponse } from 'next/server'

import { NextRequest, NextResponse } from 'next/server'import { settingsStore } from '@/ai/shared/config/settingsStore'

import { AutoTrainingScheduler } from '@/ai/training/autoTrainingScheduler'import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator'

import { settingsStore } from '@/ai/shared/config/settingsStore'

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

/**

export async function POST(request: NextRequest) { * GET /api/admin/training

  try { * Get current training status and settings

    const body = await request.json() */

    const { action } = bodyexport async function GET() {

  try {

    switch (action) {    const settings = await settingsStore.getTraining()

      case 'train_now':    

        return await handleTrainNow()    // Get current metrics summary

          const metrics = await mainOrchestrator.exportMetricsForTraining(0.5, 10)

      case 'get_metrics':    

        return await handleGetMetrics()    return NextResponse.json({

            success: true,

      case 'export_training_data':      settings,

        return await handleExportTrainingData(body)      metrics: {

              totalSamples: metrics.length,

      case 'update_schedule':        highConfidenceSamples: metrics.filter((m: any) => m.confidence > 0.7).length,

        return await handleUpdateSchedule(body)        lastTrainingRun: settings.lastTrainingRun || null,

              nextScheduledRun: settings.nextScheduledRun || null,

      default:      },

        return NextResponse.json(    })

          { error: 'Invalid action' },  } catch (error) {

          { status: 400 }    console.error('[Training API] Error:', error)

        )    return NextResponse.json(

    }      { success: false, error: 'Failed to fetch training status' },

  } catch (error) {      { status: 500 }

    console.error('[Training API] Error:', error)    )

    return NextResponse.json(  }

      { error: error instanceof Error ? error.message : 'Unknown error' },}

      { status: 500 }

    )/**

  } * POST /api/admin/training

} * Update training settings or trigger manual training

 */

export async function GET(request: NextRequest) {export async function POST(request: NextRequest) {

  try {  try {

    const searchParams = request.nextUrl.searchParams    const body = await request.json()

    const action = searchParams.get('action')    const { action, settings } = body



    switch (action) {    if (action === 'trigger') {

      case 'status':      // Manual training trigger

        return await handleGetStatus()      console.log('[Training API] Triggering manual training...')

            

      case 'settings':      const minConfidence = settings?.minConfidence || 0.7

        return await handleGetSettings()      const maxSamples = settings?.maxSamples || 1000

            

      case 'metrics':      // Export training data

        return await handleGetMetrics()      const trainingData = await mainOrchestrator.exportMetricsForTraining(

              minConfidence,

      default:        maxSamples

        return NextResponse.json(      )

          { error: 'Invalid action' },      

          { status: 400 }      // TODO: Integrate with actual training pipeline

        )      // For now, just save the exported data

    }      console.log(`[Training API] Exported ${trainingData.length} training samples`)

  } catch (error) {      

    console.error('[Training API] Error:', error)      // Update last training run timestamp

    return NextResponse.json(      const currentSettings = await settingsStore.getTraining()

      { error: error instanceof Error ? error.message : 'Unknown error' },      await settingsStore.updateTraining({

      { status: 500 }        ...currentSettings,

    )        lastTrainingRun: new Date().toISOString(),

  }      })

}      

      return NextResponse.json({

/**        success: true,

 * Trigger immediate training run        message: 'Training triggered successfully',

 */        samplesExported: trainingData.length,

async function handleTrainNow() {      })

  console.log('[Training API] Manual training triggered')    } else if (action === 'updateSettings') {

        // Update training settings

  const scheduler = new AutoTrainingScheduler()      await settingsStore.updateTraining(settings)

  const result = await scheduler.run()      

        return NextResponse.json({

  return NextResponse.json({        success: true,

    success: true,        message: 'Training settings updated',

    message: 'Training completed',        settings,

    result,      })

    timestamp: new Date().toISOString(),    } else {

  })      return NextResponse.json(

}        { success: false, error: 'Invalid action' },

        { status: 400 }

/**      )

 * Get current training metrics    }

 */  } catch (error) {

async function handleGetMetrics() {    console.error('[Training API] Error:', error)

  const { mainOrchestrator } = await import('@/ai/orchestration/mainOrchestrator')    return NextResponse.json(

        { success: false, error: 'Failed to process training request' },

  // Get metrics from learning tracker      { status: 500 }

  const metricsData = await mainOrchestrator.exportMetricsForTraining(0.0, 1000)    )

    }

  // Calculate statistics}

  const stats = {
    total: metricsData.length,
    highConfidence: metricsData.filter(m => m.confidence > 0.7).length,
    mediumConfidence: metricsData.filter(m => m.confidence >= 0.5 && m.confidence <= 0.7).length,
    lowConfidence: metricsData.filter(m => m.confidence < 0.5).length,
    avgConfidence: metricsData.reduce((sum, m) => sum + m.confidence, 0) / metricsData.length,
    avgProcessingTime: metricsData.reduce((sum, m) => sum + m.processingTime, 0) / metricsData.length,
    domains: [...new Set(metricsData.flatMap(m => m.domains))],
  }
  
  return NextResponse.json({
    success: true,
    stats,
    recentSamples: metricsData.slice(0, 10),
  })
}

/**
 * Export training data
 */
async function handleExportTrainingData(body: any) {
  const { minConfidence = 0.7, maxSamples = 1000 } = body
  
  const { mainOrchestrator } = await import('@/ai/orchestration/mainOrchestrator')
  const trainingData = await mainOrchestrator.exportMetricsForTraining(minConfidence, maxSamples)
  
  return NextResponse.json({
    success: true,
    data: trainingData,
    count: trainingData.length,
    minConfidence,
    maxSamples,
  })
}

/**
 * Update training schedule settings
 */
async function handleUpdateSchedule(body: any) {
  const { schedule } = body
  
  if (!schedule) {
    return NextResponse.json(
      { error: 'Schedule configuration required' },
      { status: 400 }
    )
  }
  
  // Save to settings store
  await settingsStore.updateTrainingSchedule(schedule)
  
  return NextResponse.json({
    success: true,
    message: 'Training schedule updated',
    schedule,
  })
}

/**
 * Get training status
 */
async function handleGetStatus() {
  const schedule = await settingsStore.getTrainingSchedule()
  const lastRun = await settingsStore.getLastTrainingRun()
  
  return NextResponse.json({
    success: true,
    status: {
      enabled: schedule?.enabled || false,
      frequency: schedule?.frequency || 'daily',
      lastRun: lastRun || null,
      nextRun: calculateNextRun(schedule, lastRun),
    },
    schedule,
  })
}

/**
 * Get training settings
 */
async function handleGetSettings() {
  const settings = await settingsStore.getTrainingSettings()
  
  return NextResponse.json({
    success: true,
    settings: settings || {
      minConfidenceForTraining: 0.7,
      maxTrainingSamples: 1000,
      enableAutoTraining: false,
      trainingFrequency: 'daily',
      trainingHour: 2,
    },
  })
}

/**
 * Calculate next training run time
 */
function calculateNextRun(schedule: any, lastRun: string | null): string | null {
  if (!schedule?.enabled) return null
  
  const lastRunDate = lastRun ? new Date(lastRun) : new Date()
  const nextRun = new Date(lastRunDate)
  
  switch (schedule.frequency) {
    case 'hourly':
      nextRun.setHours(nextRun.getHours() + 1)
      break
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(schedule.hour || 2, 0, 0, 0)
      break
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7)
      nextRun.setHours(schedule.hour || 2, 0, 0, 0)
      break
    default:
      return null
  }
  
  return nextRun.toISOString()
}
