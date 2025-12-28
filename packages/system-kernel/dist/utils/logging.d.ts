/**
 * Kernel Logging Utilities
 * Enterprise-grade logging for kernel operations
 */
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    scope: string;
    message: string;
    metadata?: Record<string, unknown>;
}
export declare class KernelLogger {
    private logs;
    private maxLogs;
    log(scope: string, message: string, level?: LogLevel, metadata?: Record<string, unknown>): void;
    getLogs(filter?: {
        level?: LogLevel;
        scope?: string;
    }): LogEntry[];
}
//# sourceMappingURL=logging.d.ts.map