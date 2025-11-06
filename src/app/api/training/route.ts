/**
 * Training API Route
 * Allows triggering training cycles and checking training status
 */

import { NextResponse } from 'next/server';
import { TrainingCoordinator } from '@/ai/training/trainingCoordinator';

const trainingCoordinator = new TrainingCoordinator();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, config } = body;
    
    if (action === 'train') {
      // Trigger training cycle
      const result = await trainingCoordinator.trainFromMetrics(config);
      
      return NextResponse.json({
        success: result.success,
        message: result.success 
          ? `Training completed: ${result.samplesUsed} samples, ${result.epochsCompleted} epochs`
          : `Training failed: ${result.error}`,
        result,
      });
    }
    
    if (action === 'status') {
      // Get training status
      const status = trainingCoordinator.getStatus();
      
      return NextResponse.json({
        success: true,
        status,
      });
    }
    
    if (action === 'canTrain') {
      // Check if training is possible
      const minSamples = config?.minSamples || 10;
      const canTrain = await trainingCoordinator.canTrain(minSamples);
      
      return NextResponse.json({
        success: true,
        canTrain,
        message: canTrain 
          ? `Training possible (${minSamples}+ samples available)`
          : `Not enough samples for training (need ${minSamples}+)`,
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use: train, status, or canTrain',
    }, { status: 400 });
    
  } catch (error) {
    console.error('[Training API] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const status = trainingCoordinator.getStatus();
    
    return NextResponse.json({
      success: true,
      status,
      message: status.isTraining 
        ? 'Training in progress'
        : 'No training in progress',
    });
  } catch (error) {
    console.error('[Training API] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
