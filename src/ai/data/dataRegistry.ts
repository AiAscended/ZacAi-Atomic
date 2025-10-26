/**
 * File: src/ai/data/dataRegistry.ts
 * Purpose: Track files that belong to knowledge domains, provide safe write/update APIs,
 * and publish change events on the orchestration event bus. This lets the orchestrator
 * and other modules react when domain data is added/updated/deleted.
 */

import { publish } from '../orchestration/eventBus';
import * as fs from 'fs';
import * as path from 'path';

type FileRecord = { path: string; lastModified: number; _watcher?: fs.FSWatcher | null };

const domainFiles = new Map<string, FileRecord[]>();

const safeNow = () => Date.now();

export const registerDomainFiles = (domain: string, files: string[]) => {
  const records = files.map((p) => ({ path: p, lastModified: safeNow() }));
  domainFiles.set(domain, records);
  publish('data:registered', { domain, files: records });
};

export const listDomainFiles = (domain?: string) => {
  if (!domain) {
    const out: Record<string, FileRecord[]> = {};
    for (const [k, v] of domainFiles.entries()) out[k] = v;
    return out;
  }
  return domainFiles.get(domain) ?? [];
};

export const getFileRecord = (domain: string, filePath: string) => {
  const files = domainFiles.get(domain) ?? [];
  return files.find((f) => f.path === filePath) ?? null;
};

export const updateFile = (domain: string, filePath: string, content: string): boolean => {
  try {
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    fs.writeFileSync(absolute, content, 'utf-8');

    const recs: FileRecord[] = domainFiles.get(domain) ?? [];
    const idx = recs.findIndex((r) => r.path === filePath);
    const now = safeNow();
    if (idx >= 0) recs[idx].lastModified = now;
    else recs.push({ path: filePath, lastModified: now });
    domainFiles.set(domain, recs);

    publish('data:changed', { domain, file: filePath, action: 'updated', timestamp: now });
    return true;
  } catch (e) {
    publish('data:error', { domain, file: filePath, error: e });
    return false;
  }
};

export const readFile = (filePath: string, domain?: string): string | null => {
  try {
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const raw = fs.readFileSync(absolute, 'utf-8');
    // publish a lightweight read event so listeners may observe reads
    publish('data:read', { domain, file: filePath, timestamp: safeNow() });
    return raw;
  } catch (e) {
    return null;
  }
};

// Optional: watch files on disk and publish change events. Not enabled by default.
export const watchDomainFiles = (domain: string) => {
  try {
    const recs = domainFiles.get(domain) ?? [];
    for (const r of recs) {
      const absolute = path.isAbsolute(r.path) ? r.path : path.join(process.cwd(), r.path);
      try {
        const watcher = fs.watch(absolute, (ev: string) => {
          publish('data:changed', {
            domain,
            file: r.path,
            action: 'fswatch:' + ev,
            timestamp: safeNow(),
          });
        });
        // store the watcher on the record for future use (not exposed here)
        r._watcher = watcher;
      } catch (e) {
        // ignore files that cannot be watched
      }
    }
    publish('data:watching', { domain, count: recs.length });
    return true;
  } catch (e) {
    publish('data:error', { domain, error: e });
    return false;
  }
};

export default {
  registerDomainFiles,
  listDomainFiles,
  getFileRecord,
  updateFile,
  readFile,
  watchDomainFiles,
};
