/**
 * System Settings API Route
 * 
 * Endpoints:
 * - GET /api/admin/settings/system - Get system settings
 * - PUT /api/admin/settings/system - Update system settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsStore } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = settingsStore.getSystemSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[System Settings API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve system settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = settingsStore.saveSystemSettings(body);
    
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'System settings saved successfully',
    });
  } catch (error) {
    console.error('[System Settings API] Error updating:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update system settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
