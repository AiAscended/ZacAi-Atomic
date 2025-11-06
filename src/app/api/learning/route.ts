/**
 * Learning Metrics API Route
 * View learning statistics and metrics
 */

import { NextResponse } from 'next/server';
import { mainOrchestrator } from '@/ai/orchestration/mainOrchestrator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'statistics';
    
    if (action === 'statistics') {
      // Get learning statistics
      const statistics = await mainOrchestrator.getLearningStatistics();
      
      return NextResponse.json({
        success: true,
        statistics,
      });
    }
    
    if (action === 'exportForTraining') {
      // Export metrics suitable for training
      const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.7');
      const maxSamples = parseInt(searchParams.get('maxSamples') || '1000');
      
      const metrics = await mainOrchestrator.exportMetricsForTraining(minConfidence, maxSamples);
      
      return NextResponse.json({
        success: true,
        count: metrics.length,
        metrics,
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use: statistics or exportForTraining',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[Learning Metrics API] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'flush') {
      // Flush metrics to disk
      await mainOrchestrator.flushLearningMetrics();
      
      return NextResponse.json({
        success: true,
        message: 'Metrics flushed to disk',
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use: flush',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[Learning Metrics API] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
