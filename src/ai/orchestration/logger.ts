/**
 * File: src/ai/orchestration/logger.ts
 * Purpose: Minimal structured logger for the orchestration layer.
 */

export const info = (msg: string, meta?: Record<string, unknown>) => {
  console.log(`[info] ${msg}`, meta ?? '');
};

export const warn = (msg: string, meta?: Record<string, unknown>) => {
  console.warn(`[warn] ${msg}`, meta ?? '');
};

export const error = (msg: string, meta?: Record<string, unknown>) => {
  console.error(`[error] ${msg}`, meta ?? '');
};

// Export logger object for files that import { logger }
export const logger = {
  info,
  warn,
  error,
  debug: (msg: string, meta?: Record<string, unknown>) => {
    console.debug(`[debug] ${msg}`, meta ?? '');
  },
};
