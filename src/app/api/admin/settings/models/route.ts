/**
 * Model Settings API Route
 * 
 * Endpoints:
 * - GET /api/admin/settings/models - Get all model settings
 * - GET /api/admin/settings/models?name=orchestrator - Get specific model
 * - PUT /api/admin/settings/models - Update model settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsStore } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('name');

    if (modelName) {
      const settings = settingsStore.getModelSettings(modelName);
      return NextResponse.json({
        success: true,
        data: settings,
      });
    }

    const allModels = settingsStore.getAllModels();
    return NextResponse.json({
      success: true,
      data: allModels,
    });
  } catch (error) {
    console.error('[Model Settings API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve model settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelName, settings } = body;

    if (!modelName) {
      return NextResponse.json(
        { success: false, error: 'Model name is required' },
        { status: 400 }
      );
    }

    const updated = settingsStore.saveModelSettings(modelName, settings);
    
    return NextResponse.json({
      success: true,
      data: updated,
      message: `${modelName} settings saved successfully`,
    });
  } catch (error) {
    console.error('[Model Settings API] Error updating:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update model settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
