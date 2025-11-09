/**
 * File: src/ai/monitoring/requestLogger.ts
 * Simple request logging utility for telemetry and diagnostics,
 * capturing summary of incoming requests and responses.
 */

interface RequestLog {
  timestamp: number;
  method: string;
  path: string;
  durationMs: number;
  status: number;
}

export class RequestLogger {
  private logs: RequestLog[] = [];

  logRequestStart(method: string, path: string): number {
    return Date.now();
  }

  logRequestEnd(
    startTime: number,
    method: string,
    path: string,
    status: number,
  ) {
    const duration = Date.now() - startTime;
    this.logs.push({
      timestamp: Date.now(),
      method,
      path,
      durationMs: duration,
      status,
    });
  }

  getRecentLogs(count: number = 100): RequestLog[] {
    return this.logs.slice(-count);
  }
}
