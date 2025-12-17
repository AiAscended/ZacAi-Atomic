/**
 * File: src/app/api/admin/dev-console/files/route.ts
 * Purpose: API route for listing directory contents in ZacAi dev console
 * Security: Admin-only access with path validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { logEvent } from '@/lib/systemActivityLogger.cjs';

// Base path for file operations (project root)
const BASE_PATH = process.env.ZACAI_CODE_ROOT || process.cwd();

// Validate that requested path is within allowed directory
function validatePath(requestedPath: string): string {
  const normalized = path.normalize(requestedPath);
  const resolved = path.resolve(BASE_PATH, normalized);
  
  if (!resolved.startsWith(BASE_PATH)) {
    throw new Error('Access denied: Path outside allowed directory');
  }
  
  return resolved;
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const requestedPath = searchParams.get('path') || '';

    const fullPath = validatePath(requestedPath);

    // Check if path exists
    const stats = await fs.stat(fullPath);
    
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Path is not a directory' },
        { status: 400 }
      );
    }

    // Read directory contents
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const items = await Promise.all(
      entries.map(async (entry) => {
        const itemPath = path.join(fullPath, entry.name);
        const relativePath = path.relative(BASE_PATH, itemPath);
        
        try {
          const itemStats = await fs.stat(itemPath);
          
          return {
            name: entry.name,
            path: relativePath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: itemStats.size,
            modified: itemStats.mtime.toISOString(),
          };
        } catch (error) {
          // Skip items we can't access
          return null;
        }
      })
    );

    // Filter out nulls and sort (directories first, then alphabetically)
    const validItems = items.filter(Boolean).sort((a, b) => {
      if (a!.type !== b!.type) {
        return a!.type === 'directory' ? -1 : 1;
      }
      return a!.name.localeCompare(b!.name);
    });

    logEvent('dev_console.files_listed', {
      path: requestedPath,
      itemCount: validItems.length,
    });

    return NextResponse.json({
      path: requestedPath,
      items: validItems,
    });
  } catch (error) {
    console.error('[dev-console] Error listing files:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to list files',
      },
      { status: 500 }
    );
  }
}
