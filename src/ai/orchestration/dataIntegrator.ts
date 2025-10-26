/**
 * File: src/ai/orchestration/dataIntegrator.ts
 * Purpose: Helper to discover domains under `src/ai/data/*`, register them with
 * the domain registry, register their files with the dataRegistry and optionally
 * start watching for changes.
 */

import * as fs from 'fs';
import * as path from 'path';
import { registerDomain } from '../data/registry';
import dataRegistry from '../data/dataRegistry';
import { publish } from './eventBus';

export const discoverAndRegisterDomains = async (watchFiles = false) => {
  const base = path.join(process.cwd(), 'src', 'ai', 'data');
  let dirs: string[] = [];
  try {
    dirs = fs.readdirSync(base).filter((f) => fs.statSync(path.join(base, f)).isDirectory());
  } catch (e) {
    publish('error', { source: 'dataIntegrator', error: e });
    return [];
  }

  const registered: string[] = [];
  for (const d of dirs) {
    try {
      const metaPath = path.join(base, d, `${d}_meta.json`);
      const fallbackMetaPath = path.join(base, d, `${d}_meta.json`);
      let meta: Record<string, unknown> | null = null;
      if (fs.existsSync(metaPath)) meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      else if (fs.existsSync(fallbackMetaPath))
        meta = JSON.parse(fs.readFileSync(fallbackMetaPath, 'utf-8'));
      else {
        // attempt to build a small meta from discovered files
        const files = fs.readdirSync(path.join(base, d));
        meta = { name: d, files };
      }

      const domainName: string = (meta && (meta.name as string)) || d;
  const version: string | undefined = meta ? (meta.version as string | undefined) : undefined;
      registerDomain({ name: domainName, version });

      // Normalize file list and register with dataRegistry
      const fileList: string[] = ((meta && (meta.files as string[])) || []).map((f: string) =>
        path.join('src', 'ai', 'data', d, f.replace(/src\/ai\/data\//, ''))
      );
      // if meta.files is empty, register all files in folder
      if (fileList.length === 0) {
        const all = fs.readdirSync(path.join(base, d));
        for (const f of all) fileList.push(path.join('src', 'ai', 'data', d, f));
      }

      dataRegistry.registerDomainFiles(domainName, fileList);
      if (watchFiles) dataRegistry.watchDomainFiles(domainName);
      registered.push(domainName);
    } catch (e) {
      publish('error', { source: 'dataIntegrator', domain: d, error: e });
    }
  }
  publish('data:discovery', { domains: registered });
  return registered;
};

export default { discoverAndRegisterDomains };
