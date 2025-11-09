#!/usr/bin/env node

/**
 * systemActivityLogger.cjs
 * Minimal system activity logger for audit/self-awareness.
 * Writes JSON lines to data/system-activity.log and provides a reader.
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LOG_PATH = path.join(DATA_DIR, 'system-activity.log');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function logEvent(type, message, meta = {}) {
  ensureDataDir();
  const entry = {
    ts: new Date().toISOString(),
    type,
    message: typeof message === 'string' ? message : JSON.stringify(message),
    meta,
  };
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf-8');
  } catch (err) {
    // Best-effort logging; don't throw in production logger
    console.error('systemActivityLogger: failed to write log', err.message);
  }
}

function readEvents(limit = 200) {
  ensureDataDir();
  if (!fs.existsSync(LOG_PATH)) return [];
  const lines = fs.readFileSync(LOG_PATH, 'utf-8').trim().split('\n');
  const last = lines.slice(-limit);
  return last.map(l => {
    try { return JSON.parse(l); } catch (e) { return { raw: l }; }
  }).reverse();
}

module.exports = { logEvent, readEvents };
