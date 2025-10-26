/**
 * File: src/ai/orchestration/moduleLoaderFactory.ts
 * Purpose: Factory that returns module instances or singletons. Minimal implementation for MVP.
 */

import { registerModule, getModule } from './moduleRegistry';

const singletons = new Map<string, unknown>();

export const registerSingleton = (name: string, factory: () => unknown) => {
  registerModule(name, () => {
    if (!singletons.has(name)) singletons.set(name, factory());
    return singletons.get(name)!;
  });
};

export const loadModule = (name: string): unknown | null => getModule(name);
