import * as systemActivityLogger from './systemActivityLogger.cjs';

export type ActivityLogEntry = {
  ts: string;
  type: string;
  message: string;
  meta?: Record<string, unknown>;
  raw?: string;
  error?: string;
};

interface SystemActivityLoggerModule {
  logEvent: (type: string, message: unknown, meta?: Record<string, unknown>) => void;
  readEvents: (limit?: number) => ActivityLogEntry[];
}

const moduleExports = systemActivityLogger as unknown as SystemActivityLoggerModule;

export const logEvent = moduleExports.logEvent;
export const readEvents = moduleExports.readEvents;
