import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_ROOT = path.join(process.cwd(), "src", "data");
const ACTIVITY_LOG_FILE = path.join(DATA_ROOT, "system-activity.log");
const MAX_ACTIVITY_ENTRIES = 2000;

export interface SystemActivityEntry {
  id: string;
  timestamp: string;
  type: string;
  source?: string;
  message?: string;
  data?: Record<string, unknown> | string | string[] | number | null;
}

export type SystemActivityInput = Omit<SystemActivityEntry, "id" | "timestamp"> & {
  timestamp?: string;
};

export async function recordSystemActivity(entry: SystemActivityInput): Promise<void> {
  const payload: SystemActivityEntry = {
    id: crypto.randomUUID(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    type: entry.type,
    source: entry.source,
    message: entry.message,
    data: entry.data,
  };

  await ensureLogDirectory();
  await fs.appendFile(ACTIVITY_LOG_FILE, `${JSON.stringify(payload)}\n`, "utf8");
  await trimLogIfNeeded();
}

export async function getRecentActivity(limit = 50): Promise<SystemActivityEntry[]> {
  const lines = await readLogLines();
  if (lines.length === 0) {
    return [];
  }

  const recent = lines
    .slice(-limit)
    .map(line => line.trim())
    .filter(Boolean)
    .map(parseJsonSafe)
    .map(entry => normalizeEntry(entry))
    .filter((entry): entry is SystemActivityEntry => Boolean(entry));

  return recent.reverse();
}

export async function getActivityLogPath(): Promise<string> {
  await ensureLogDirectory();
  return ACTIVITY_LOG_FILE;
}

async function readLogLines(): Promise<string[]> {
  try {
    const content = await fs.readFile(ACTIVITY_LOG_FILE, "utf8");
    return content.split("\n");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function ensureLogDirectory(): Promise<void> {
  await fs.mkdir(DATA_ROOT, { recursive: true });
}

async function trimLogIfNeeded(): Promise<void> {
  const lines = await readLogLines();
  if (lines.length <= MAX_ACTIVITY_ENTRIES) {
    return;
  }

  const trimmed = lines.slice(-MAX_ACTIVITY_ENTRIES).filter(Boolean);
  await fs.writeFile(ACTIVITY_LOG_FILE, `${trimmed.join("\n")}\n`, "utf8");
}

function parseJsonSafe<T>(line: string): T | null {
  try {
    return JSON.parse(line) as T;
  } catch {
    return null;
  }
}

function normalizeEntry(entry: any): SystemActivityEntry | null {
  if (!entry) return null;
  const timestamp = entry.timestamp ?? entry.ts ?? new Date().toISOString();
  const message = entry.message ?? entry.msg ?? undefined;
  const data = entry.data ?? entry.meta ?? undefined;

  return {
    id: entry.id ?? crypto.randomUUID(),
    timestamp,
    type: entry.type ?? "unknown",
    source: entry.source,
    message,
    data,
  };
}
