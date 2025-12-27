import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
try { fs.mkdirSync(logDir, { recursive: true }); } catch (e) {}

function _now() { return new Date().toISOString(); }

export function info(component, message, meta = {}) {
  _write('info', component, message, meta);
}

export function warn(component, message, meta = {}) {
  _write('warn', component, message, meta);
}

export function error(component, message, meta = {}) {
  _write('error', component, message, meta);
}

function _write(level, component, message, meta) {
  try {
    const line = JSON.stringify({ ts: _now(), level, component, message, meta }) + '\n';
    fs.appendFileSync(path.join(logDir, `${component}.log`), line);
  } catch (e) {
    // best-effort logging; do not throw
  }
}

export default { info, warn, error };
