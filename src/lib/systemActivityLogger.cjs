#!/usr/bin/env node

/**
 * systemActivityLogger.cjs
 * Minimal system activity logger for audit/self-awareness.
 * Writes JSON lines to data/system-activity.log and provides a reader.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LOG_PATH = path.join(DATA_DIR, 'system-activity.log');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function buildEvent(typeArg, messageArg, metaArg = {}) {
  const timestamp = new Date().toISOString();
  const normalizedMeta = (metaArg && typeof metaArg === 'object') ? metaArg : {};

  if (typeArg && typeof typeArg === 'object' && !Array.isArray(typeArg)) {
    const eventObj = typeArg;
    const severity = eventObj.severity || normalizedMeta.severity || 'info';
    const category = eventObj.category || eventObj.type || 'system';
    const action = eventObj.action || normalizedMeta.action || 'log';
    const message = eventObj.message || messageArg || `${category}:${action}`;

    return {
      ts: timestamp,
      type: category,
      category,
      action,
      severity,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      details: eventObj.details || normalizedMeta || {},
    };
  }

  const type = typeof typeArg === 'string' ? typeArg : 'event';
  const severity = normalizedMeta.severity || 'info';
  const message = typeof messageArg === 'string'
    ? messageArg
    : messageArg
    ? JSON.stringify(messageArg)
    : type;

  return {
    ts: timestamp,
    type,
    category: type,
    action: normalizedMeta.action || 'log',
    severity,
    message,
    details: normalizedMeta,
  };
}

function logEvent(type, message, meta = {}) {
  ensureDataDir();
  const entry = buildEvent(type, message, meta);
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
