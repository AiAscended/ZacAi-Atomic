/**
 * Admin Training Management API
 * 
 * Control automated training pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { trainingScheduler } from '@/ai/training/trainingManager';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'trigger':
        const result = await trainingScheduler.runTraining(params?.mode || 'full');
        return NextResponse.json({
          success: true,
          data: result,
          message: 'Training triggered successfully',
        });

      case 'stop':
        await trainingScheduler.stopTraining();
        return NextResponse.json({
          success: true,
          message: 'Training stopped',
        });

      case 'export':
        const exportedData = await trainingScheduler.exportMetrics();
        return NextResponse.json({
          success: true,
          data: exportedData,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Admin Training API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Training operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'status';

    switch (view) {
      case 'status':
        const status = trainingScheduler.getStatus();
        return NextResponse.json({
          success: true,
          data: status,
        });

      case 'history':
        const history = trainingScheduler.getHistory();
        return NextResponse.json({
          success: true,
          data: history,
        });

      case 'settings':
        const settings = trainingScheduler.getSettings();
        return NextResponse.json({
          success: true,
          data: settings,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid view parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Admin Training API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve training data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings are required' },
        { status: 400 }
      );
    }

    await trainingScheduler.updateSettings(settings);

    return NextResponse.json({
      success: true,
      message: 'Training settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('[Admin Training API] Error updating settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
