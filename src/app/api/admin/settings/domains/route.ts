/**
 * Domain Settings API Route
 * 
 * Endpoints:
 * - GET /api/admin/settings/domains - Get all domain settings
 * - GET /api/admin/settings/domains?name=react - Get specific domain
 * - PUT /api/admin/settings/domains - Update domain settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsStore } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainName = searchParams.get('name');

    if (domainName) {
      const settings = settingsStore.getDomainSettings(domainName);
      return NextResponse.json({
        success: true,
        data: settings,
      });
    }

    const allDomains = settingsStore.getAllDomains();
    return NextResponse.json({
      success: true,
      data: allDomains,
    });
  } catch (error) {
    console.error('[Domain Settings API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve domain settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainName, settings } = body;

    if (!domainName) {
      return NextResponse.json(
        { success: false, error: 'Domain name is required' },
        { status: 400 }
      );
    }

    const updated = settingsStore.saveDomainSettings(domainName, settings);
    
    return NextResponse.json({
      success: true,
      data: updated,
      message: `${domainName} settings saved successfully`,
    });
  } catch (error) {
    console.error('[Domain Settings API] Error updating:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update domain settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
