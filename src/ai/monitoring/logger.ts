/**
 * File: src/ai/monitoring/logger.ts
 * Purpose: Centralized logging module for all AI system events
 * Depends on: None (atomic module)
 * Depended on by: All AI modules
 * Creator: Vercel v0 Coding Assistant
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  module: string
  message: string
  data?: unknown
}

/**
 * Centralized logger for AI system
 */
class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private minLevel: LogLevel = LogLevel.INFO

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, module: string, message: string, data?: unknown): void {
    if (level < this.minLevel) return

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      module,
      message,
      data,
    }

    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output
    const levelName = LogLevel[level]
    const prefix = `[${entry.timestamp.toISOString()}] [${levelName}] [${module}]`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || "")
        break
      case LogLevel.INFO:
        console.info(prefix, message, data || "")
        break
      case LogLevel.WARN:
        console.warn(prefix, message, data || "")
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, message, data || "")
        break
    }
  }

  debug(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, module, message, data)
  }

  info(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, module, message, data)
  }

  warn(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, module, message, data)
  }

  error(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, module, message, data)
  }

  critical(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.CRITICAL, module, message, data)
  }

  /**
   * Get recent logs
   */
  getLogs(count?: number): LogEntry[] {
    if (count) {
      return this.logs.slice(-count)
    }
    return [...this.logs]
  }

  /**
   * Get logs by module
   */
  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter((log) => log.module === module)
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }
}

// Singleton instance
export const logger = new Logger()
