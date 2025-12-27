import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'packages/web-terminal/logs');
try { fs.mkdirSync(logDir, { recursive: true }); } catch (e) {}

// Safe executor with timeout, max output size and whitelist
export async function runSafeCommand(cmd, opts = {}) {
  const timeoutMs = opts.timeoutMs || 10000;
  const maxBuffer = opts.maxBuffer || 200 * 1024; // 200KB
  const whitelist = opts.whitelist || ['status', 'health', 'diagnostics', 'uptime', 'ls', 'echo'];

  const base = cmd.split(' ')[0];
  if (!whitelist.includes(base)) {
    return { ok: false, output: `command not allowed: ${base}` };
  }

  return new Promise((resolve) => {
    const child = exec(cmd, { timeout: timeoutMs, maxBuffer }, (err, stdout, stderr) => {
      const out = (stdout || '').toString();
      const errOut = (stderr || '').toString();
      try {
        fs.appendFileSync(path.join(logDir, 'executor.log'), JSON.stringify({ ts: new Date().toISOString(), cmd, stdout: out.slice(0, 2000), stderr: errOut.slice(0,2000) }) + '\n');
      } catch (e) {}
      if (err) {
        const msg = err.killed ? 'timeout' : err.message;
        resolve({ ok: false, output: msg + (errOut ? '\n' + errOut : '') });
      } else {
        resolve({ ok: true, output: out });
      }
    });
  });
}

export default { runSafeCommand };
