#!/usr/bin/env node

/**
 * systemActivityLogger.cjs
 * CommonJS compatibility wrapper for system activity logging.
 * Writes JSON lines to data/system-activity.log, aligned with the TS logger.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LOG_PATH = path.join(DATA_DIR, 'system-activity.log');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function buildEvent(type, message, meta = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };
}

function logEvent(type, message, meta = {}) {
  ensureDataDir();
  const entry = buildEvent(type, message, meta);
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'unknown error';
    console.error('systemActivityLogger: failed to write log', errorMessage);
  }
}

function readEvents(limit = 200) {
  ensureDataDir();
  if (!fs.existsSync(LOG_PATH)) return [];
  const raw = fs.readFileSync(LOG_PATH, 'utf-8');
  if (!raw.trim()) return [];
  const lines = raw.trim().split('\n');
  const last = lines.slice(-limit);
  return last
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch (error) {
        return { raw: l, error: error instanceof Error ? error.message : 'parse error' };
      }
    })
    .reverse();
}

module.exports = { logEvent, readEvents };
