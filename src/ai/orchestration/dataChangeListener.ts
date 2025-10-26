/**
 * File: src/ai/orchestration/dataChangeListener.ts
 * Purpose: Subscribe to data change events and notify the orchestrator or reload caches.
 */

import { subscribe } from './eventBus';
import { listModules } from './moduleRegistry';

export const startDataChangeListener = () => {
  // When domain data changes, log and optionally trigger module reload actions.
  subscribe('data:changed', (payload) => {
    try {
      // Basic handling: print, and if a module exposes a `onDomainDataChanged` callback, call it.
      // Keep this light-weight to avoid heavy synchronous work on the event loop.
      console.log('[dataChangeListener] data:changed', payload);

      const modules = listModules();
      for (const m of modules) {
        // try invoking reload hooks if present
        const instance = (m.factory && m.factory()) || null;
        if (
          instance &&
          typeof (instance as Record<string, unknown>)['onDomainDataChanged'] === 'function'
        ) {
          try {
            // call async-safe (fire-and-forget)
            const fn = (instance as Record<string, unknown>)['onDomainDataChanged'] as (
              p: unknown
            ) => unknown;
            void fn(payload);
          } catch (e) {
            // ignore per-module errors
          }
        }
      }
    } catch (e) {
      // swallow errors to avoid bubbling
    }
  });
};

// Auto-start when imported
try {
  startDataChangeListener();
} catch (e) {
  // ignore
}

export default startDataChangeListener;
