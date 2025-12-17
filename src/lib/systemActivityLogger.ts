#!/usr/bin/env node

/**
 * systemActivityLogger.ts
 * Minimal system activity logger for audit/self-awareness.
 * Writes JSON lines to src/ai/data/system-activity.log and provides a reader.
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'ai', 'data');
const LOG_PATH = path.join(DATA_DIR, 'system-activity.log');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function logEvent(type: string, message: string | unknown, meta: Record<string, unknown> = {}) {
  ensureDataDir();
  const entry = buildEvent(type, message, meta);
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    // Best-effort logging; don't throw in production logger
    const errorMessage = err instanceof Error ? err.message : 'unknown error';
    console.error('systemActivityLogger: failed to write log', errorMessage);
  }
}

export function readEvents(limit = 200): unknown[] {
  ensureDataDir();
  if (!fs.existsSync(LOG_PATH)) return [];
  const lines = fs.readFileSync(LOG_PATH, 'utf-8').trim().split('\n');
  const last = lines.slice(-limit);
  return last.map(l => {
    try {
      return JSON.parse(l);
    } catch (error) {
      return { raw: l, error: error instanceof Error ? error.message : 'parse error' };
    }
  }).reverse();
}

// Default export for CommonJS compatibility
const logger = { logEvent, readEvents };
export default logger;

