/**
 * Kernel Logging Utilities
 * Enterprise-grade logging for kernel operations
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  scope: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class KernelLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(
    scope: string,
    message: string,
    level: LogLevel = LogLevel.INFO,
    metadata?: Record<string, unknown>
  ) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      scope,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Prevent memory bloat
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (process.env.KERNEL_DEBUG) {
      console.log(`[${entry.level}][${scope}]`, message, metadata);
    }
  }

  getLogs(filter?: { level?: LogLevel; scope?: string }): LogEntry[] {
    if (!filter) return [...this.logs];

    return this.logs.filter((log) => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.scope && log.scope !== filter.scope) return false;
      return true;
    });
  }
}

