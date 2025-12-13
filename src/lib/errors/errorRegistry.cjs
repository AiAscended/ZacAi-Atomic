const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { readEvents } = require('../systemActivityLogger.cjs');

const DATA_DIR = path.join(process.cwd(), 'data', 'system');
const FILE_PATH = path.join(DATA_DIR, 'errors.json');
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings', 'system.json');

const DEFAULT_STATE = {
  meta: {
    lastActivityTimestamp: null,
  },
  items: [],
};

function ensureStateFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
  }
}

function readState() {
  ensureStateFile();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.meta) parsed.meta = { lastActivityTimestamp: null };
    if (!Array.isArray(parsed.items)) parsed.items = [];
    return parsed;
  } catch (error) {
    console.error('[errorRegistry] Failed to read state:', error.message);
    return { ...DEFAULT_STATE };
  }
}

function writeState(state) {
  ensureStateFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pushHistory(record, entry) {
  if (!Array.isArray(record.history)) {
    record.history = [];
  }
  record.history.push({
    id: entry.id || generateId(),
    timestamp: entry.timestamp || new Date().toISOString(),
    actor: entry.actor || 'system',
    action: entry.action || 'status_change',
    summary: entry.summary || '',
    metadata: entry.metadata || {},
  });
}

function buildRecord(payload) {
  const timestamp = new Date().toISOString();
  return {
    id: generateId(),
    domain: payload.domain || 'core',
    subsystem: payload.subsystem || 'runtime',
    source: payload.source || 'system-activity',
    message: payload.message,
    severity: payload.severity || 'error',
    status: 'open',
    detectedAt: payload.detectedAt || timestamp,
    updatedAt: timestamp,
    metadata: payload.metadata || {},
    resolution: {
      status: 'open',
      mode: 'manual',
      strategy: 'self-heal',
      attempts: 0,
    },
    history: [
      {
        id: generateId(),
        timestamp,
        actor: 'system',
        action: 'detected',
        summary: payload.message,
        metadata: {
          severity: payload.severity || 'error',
          subsystem: payload.subsystem || 'runtime',
        },
      },
    ],
  };
}

function listErrors(options = {}) {
  const state = readState();
  const { status = 'active', limit = 100 } = options;
  let items = state.items || [];

  if (status === 'active') {
    items = items.filter((item) => item.status === 'open' || item.status === 'resolving');
  } else if (status === 'resolved') {
    items = items.filter((item) => item.status === 'resolved');
  }

  const sorted = items.sort((a, b) => (a.detectedAt < b.detectedAt ? 1 : -1));
  return clone(sorted.slice(0, limit));
}

function getAllErrors() {
  const state = readState();
  return clone(state.items || []);
}

function findErrorById(id) {
  const state = readState();
  const match = (state.items || []).find((item) => item.id === id);
  return match ? clone(match) : null;
}

function saveRecord(updatedRecord) {
  const state = readState();
  const index = (state.items || []).findIndex((item) => item.id === updatedRecord.id);
  if (index === -1) {
    state.items.push(updatedRecord);
  } else {
    state.items[index] = updatedRecord;
  }
  writeState(state);
  return clone(updatedRecord);
}

function recordError(payload) {
  const record = buildRecord(payload);
  const state = readState();
  state.items.push(record);
  state.items.sort((a, b) => (a.detectedAt < b.detectedAt ? 1 : -1));
  writeState(state);
  return clone(record);
}

function markResolving(id, options = {}) {
  const record = findErrorById(id);
  if (!record) return null;

  record.status = 'resolving';
  record.updatedAt = new Date().toISOString();
  record.resolution.status = 'resolving';
  record.resolution.mode = options.mode || record.resolution.mode || 'manual';
  record.resolution.strategy = options.strategy || record.resolution.strategy;
  record.resolution.attempts = (record.resolution.attempts || 0) + 1;
  record.resolution.lastAttemptAt = record.updatedAt;

  pushHistory(record, {
    actor: options.actor || 'admin',
    action: 'auto_attempt',
    summary: options.summary || 'Resolution attempt started',
    metadata: options.metadata,
  });

  return saveRecord(record);
}

function completeResolution(id, result) {
  const record = findErrorById(id);
  if (!record) return null;

  record.status = result.success ? 'resolved' : 'failed';
  record.updatedAt = new Date().toISOString();
  record.resolution.status = record.status;
  record.resolution.lastResult = result.message;
  record.resolution.githubBackupBranch = result.githubBackupBranch || record.resolution.githubBackupBranch;

  pushHistory(record, {
    actor: result.actor || 'system',
    action: result.success ? 'auto_success' : 'auto_failure',
    summary: result.message || (result.success ? 'Issue resolved' : 'Resolution failed'),
    metadata: result.metadata,
  });

  return saveRecord(record);
}

function markManualResolution(id, note) {
  const record = findErrorById(id);
  if (!record) return null;

  record.status = 'resolved';
  record.updatedAt = new Date().toISOString();
  record.resolution.status = 'resolved';
  record.resolution.mode = 'manual';
  record.resolution.lastResult = note || 'Marked as resolved';

  pushHistory(record, {
    actor: 'admin',
    action: 'manual_resolve',
    summary: note || 'Issue resolved manually',
  });

  return saveRecord(record);
}

function syncFromActivityLog(limit = 200) {
  const state = readState();
  const events = readEvents(limit) || [];
  const lastTimestamp = state.meta.lastActivityTimestamp;
  let newestTimestamp = lastTimestamp;
  let created = 0;

  const newEvents = events
    .filter((event) => {
      if (!event || typeof event !== 'object') return false;
      if (!event.severity || !['error', 'critical'].includes(event.severity)) return false;
      if (!event.ts) return false;
      if (!lastTimestamp) return true;
      return event.ts > lastTimestamp;
    })
    .sort((a, b) => (a.ts > b.ts ? 1 : -1));

  if (!newEvents.length) {
    return { created: 0, lastActivityTimestamp: lastTimestamp };
  }

  for (const event of newEvents) {
    const payload = {
      domain: event.details?.domain || event.category || 'core',
      subsystem: event.category || event.type || 'runtime',
      source: event.action || 'system-activity',
      message: event.message || `${event.category || 'system'}:${event.action || 'event'}`,
      severity: event.severity,
      detectedAt: event.ts,
      metadata: {
        issueDescription: event.details?.issueDescription,
        affectedFiles: event.details?.affectedFiles,
        details: event.details,
        logReferences: event.details?.logReferences,
      },
    };

    recordError(payload);
    newestTimestamp = event.ts;
    created += 1;
  }

  const updatedState = readState();
  updatedState.meta.lastActivityTimestamp = newestTimestamp;
  writeState(updatedState);

  return { created, lastActivityTimestamp: newestTimestamp };
}

function getAutoResolveConfig() {
  const defaults = {
    autoResolveErrors: false,
    errorRecoveryStrategy: 'self-heal',
    maxAutoResolveAttempts: 1,
  };

  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return defaults;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      autoResolveErrors: Boolean(parsed.autoResolveErrors),
      errorRecoveryStrategy: parsed.errorRecoveryStrategy || 'self-heal',
      maxAutoResolveAttempts: parsed.maxAutoResolveAttempts || 1,
    };
  } catch (error) {
    console.warn('[errorRegistry] Failed to read system settings for auto resolve:', error.message);
    return defaults;
  }
}

module.exports = {
  listErrors,
  getAllErrors,
  findErrorById,
  recordError,
  markResolving,
  completeResolution,
  markManualResolution,
  syncFromActivityLog,
  getAutoResolveConfig,
};
