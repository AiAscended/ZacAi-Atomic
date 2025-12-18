import { NextResponse } from "next/server";
import {
  ensureSystemWatcher,
  getSystemRegistry,
  getSystemWatcher,
  getRecentActivity,
} from "@/ai/orchestration/system";

export async function GET() {
  try {
    await ensureSystemWatcher();
    const [registry, watcherStatus, activity] = await Promise.all([
      getSystemRegistry(),
      Promise.resolve(getSystemWatcher().getStatus()),
      getRecentActivity(25),
    ]);

    return NextResponse.json({
      ok: true,
      registry: {
        stats: registry.stats,
        generatedAt: registry.generatedAt,
        totalFiles: registry.stats.totalFiles,
        totalModules: registry.stats.totalModules,
      },
      watcher: watcherStatus,
      activity,
    });
  } catch (error) {
    console.error("[system-status] Failed to gather system information", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
