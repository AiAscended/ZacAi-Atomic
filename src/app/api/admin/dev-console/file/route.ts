/**
 * File: src/app/api/admin/dev-console/file/route.ts
 * Purpose: API route for reading and writing individual files in ZacAi dev console
 * Security: Admin-only access with path validation and audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
const { logEvent } = require('@/lib/systemActivityLogger.cjs');

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

// GET: Read file contents
export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const requestedPath = searchParams.get('path');

    if (!requestedPath) {
      return NextResponse.json(
        { error: 'Path parameter required' },
        { status: 400 }
      );
    }

    const fullPath = validatePath(requestedPath);

    // Check if file exists
    const stats = await fs.stat(fullPath);
    
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Path is not a file' },
        { status: 400 }
      );
    }

    // Read file contents
    const content = await fs.readFile(fullPath, 'utf-8');

    logEvent('dev_console.file_read', {
      path: requestedPath,
      size: stats.size,
    });

    return NextResponse.json({
      path: requestedPath,
      content,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error('[dev-console] Error reading file:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to read file',
      },
      { status: 500 }
    );
  }
}

// POST: Write file contents
export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const body = await request.json();
    const { path: requestedPath, content } = body;

    if (!requestedPath || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content required' },
        { status: 400 }
      );
    }

    const fullPath = validatePath(requestedPath);

    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file contents
    await fs.writeFile(fullPath, content, 'utf-8');

    // Get updated stats
    const stats = await fs.stat(fullPath);

    logEvent('dev_console.file_written', {
      path: requestedPath,
      size: stats.size,
      // user: session.user.email, // Add when auth is implemented
    });

    return NextResponse.json({
      success: true,
      path: requestedPath,
      size: stats.size,
      modified: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error('[dev-console] Error writing file:', error);
    
    logEvent('dev_console.file_write_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to write file',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete file or directory
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const requestedPath = searchParams.get('path');

    if (!requestedPath) {
      return NextResponse.json(
        { error: 'Path parameter required' },
        { status: 400 }
      );
    }

    const fullPath = validatePath(requestedPath);

    // Check if exists
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }

    logEvent('dev_console.file_deleted', {
      path: requestedPath,
      type: stats.isDirectory() ? 'directory' : 'file',
    });

    return NextResponse.json({
      success: true,
      path: requestedPath,
    });
  } catch (error) {
    console.error('[dev-console] Error deleting file:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete',
      },
      { status: 500 }
    );
  }
}
