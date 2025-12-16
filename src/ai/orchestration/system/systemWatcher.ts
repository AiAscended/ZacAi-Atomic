/**
 * Hybrid AI System Watcher
 * Monitors the entire repository for changes and automatically rebuilds the
 * system registry to keep orchestrator components aware of the latest state.
 */

import path from "path";
import chokidar, { type FSWatcher } from "chokidar";
import { publish } from "../eventBus";
import {
  DEFAULT_SKIP_FILES,
  DEFAULT_SKIP_FOLDERS,
  SYSTEM_REGISTRY_FILE,
} from "./moduleConfigs";
import { clearRegistryCache, rebuildRegistry } from "./systemRegistry";
import type { SystemRegistry } from "./types";
import { recordSystemActivity } from "./systemActivityLog";

const REPO_ROOT = process.cwd();
const DEFAULT_DEBOUNCE_MS = 750;

export const SYSTEM_EVENT_TOPICS = {
  FILE_CHANGE: "system:file-change",
  REGISTRY_UPDATED: "system:registry-updated",
  REGISTRY_ERROR: "system:registry-error",
} as const;

export type SystemEventTopic = (typeof SYSTEM_EVENT_TOPICS)[keyof typeof SYSTEM_EVENT_TOPICS];

export interface SystemWatcherOptions {
  debounceMs?: number;
  autoRebuild?: boolean;
}

export interface RegistryUpdatePayload {
  reason: string;
  changedFiles: string[];
  registry: SystemRegistry;
  timestamp: string;
}

export interface SystemWatcherStatus {
  active: boolean;
  watchingRoot: string;
  options: Required<SystemWatcherOptions>;
  pendingChanges: number;
  rebuildInFlight: boolean;
}

class SystemWatcher {
  private watcher: FSWatcher | null = null;
  private started = false;
  private options: Required<SystemWatcherOptions> = {
    debounceMs: DEFAULT_DEBOUNCE_MS,
    autoRebuild: true,
  };
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private rebuilding = false;
  private rebuildQueued = false;
  private changeBuffer = new Set<string>();

  async start(options?: SystemWatcherOptions): Promise<void> {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    if (this.started) {
      return;
    }

    this.watcher = chokidar.watch(REPO_ROOT, {
      ignoreInitial: true,
      ignored: this.buildIgnoreList(),
      awaitWriteFinish: {
        stabilityThreshold: 250,
        pollInterval: 100,
      },
    });

    this.watcher.on("all", this.handleFsEvent);
    this.watcher.on("error", this.handleWatcherError);

    this.started = true;
    console.log("[system-watcher] Monitoring repository for changes");
    void recordSystemActivity({
      type: "watcher-started",
      source: "system-watcher",
      message: "System watcher activated",
      data: {
        options: this.options,
        root: REPO_ROOT,
      },
    });
  }

  async stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    this.started = false;
    this.changeBuffer.clear();
    void recordSystemActivity({
      type: "watcher-stopped",
      source: "system-watcher",
      message: "System watcher stopped",
    });
  }

  getStatus(): SystemWatcherStatus {
    return {
      active: this.started,
      watchingRoot: REPO_ROOT,
      options: this.options,
      pendingChanges: this.changeBuffer.size,
      rebuildInFlight: this.rebuilding,
    };
  }

  private handleFsEvent = (event: string, filePath: string): void => {
    if (!filePath) {
      return;
    }

    const relative = path.relative(REPO_ROOT, filePath) || filePath;
    this.changeBuffer.add(relative);

    publish(SYSTEM_EVENT_TOPICS.FILE_CHANGE, {
      event,
      path: relative,
      timestamp: new Date().toISOString(),
    });

    void recordSystemActivity({
      type: "file-change",
      source: "system-watcher",
      message: `${event} -> ${relative}`,
      data: {
        event,
        path: relative,
      },
    });

    if (this.options.autoRebuild) {
      this.scheduleRebuild(event);
    }
  };

  private handleWatcherError = (error: unknown): void => {
    publish(SYSTEM_EVENT_TOPICS.REGISTRY_ERROR, {
      error,
      timestamp: new Date().toISOString(),
    });

    void recordSystemActivity({
      type: "watcher-error",
      source: "system-watcher",
      message: "Filesystem watcher reported an error",
      data: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    this.scheduleRebuild("watcher-error");
  };

  private scheduleRebuild(reason: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.performRebuild(reason);
    }, this.options.debounceMs);
  }

  private async performRebuild(reason: string): Promise<void> {
    if (this.rebuilding) {
      this.rebuildQueued = true;
      return;
    }

    this.rebuilding = true;
    const changedFiles = Array.from(this.changeBuffer);
    this.changeBuffer.clear();

    try {
      clearRegistryCache();
      const registry = await rebuildRegistry();
      const payload: RegistryUpdatePayload = {
        reason,
        changedFiles,
        registry,
        timestamp: new Date().toISOString(),
      };

      publish(SYSTEM_EVENT_TOPICS.REGISTRY_UPDATED, payload);
      console.log(
        `[system-watcher] Registry rebuilt after ${changedFiles.length} change${changedFiles.length === 1 ? "" : "s"}`
      );

      void recordSystemActivity({
        type: "registry-rebuilt",
        source: "system-watcher",
        message: `Registry rebuilt via ${reason}`,
        data: {
          reason,
          changeCount: changedFiles.length,
          stats: registry.stats,
        },
      });
    } catch (error) {
      publish(SYSTEM_EVENT_TOPICS.REGISTRY_ERROR, {
        error,
        reason,
        timestamp: new Date().toISOString(),
      });
      console.error("[system-watcher] Registry rebuild failed", error);

      void recordSystemActivity({
        type: "registry-error",
        source: "system-watcher",
        message: `Registry rebuild failed (${reason})`,
        data: {
          error: error instanceof Error ? error.message : String(error),
          reason,
        },
      });
    } finally {
      this.rebuilding = false;
      if (this.rebuildQueued) {
        this.rebuildQueued = false;
        this.scheduleRebuild("queue-flush");
      }
    }
  }

  private buildIgnoreList(): Array<string | RegExp> {
    const folderGlobs = DEFAULT_SKIP_FOLDERS.map(folder => `**/${folder}/**`);
    const fileGlobs = DEFAULT_SKIP_FILES.map(file => `**/${file}`);
    const extras = [SYSTEM_REGISTRY_FILE, "package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
    return [...folderGlobs, ...fileGlobs, ...extras];
  }
}

let watcherInstance: SystemWatcher | null = null;

export function getSystemWatcher(): SystemWatcher {
  if (!watcherInstance) {
    watcherInstance = new SystemWatcher();
  }
  return watcherInstance;
}

export async function ensureSystemWatcher(options?: SystemWatcherOptions): Promise<SystemWatcher> {
  const watcher = getSystemWatcher();
  await watcher.start(options);
  return watcher;
}

export async function shutdownSystemWatcher(): Promise<void> {
  if (!watcherInstance) {
    return;
  }
  await watcherInstance.stop();
}
