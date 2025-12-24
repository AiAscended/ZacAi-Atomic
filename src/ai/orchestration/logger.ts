/**
 * File: src/ai/orchestration/logger.ts
 * Purpose: Minimal structured logger for the orchestration layer.
 */

type LogMeta = Record<string, unknown> | Error | string | number | boolean | null | undefined
type MessageArgs = [message: string, meta?: LogMeta]
type ContextArgs = [context: string, message: string, meta?: LogMeta]
type LogArgs = MessageArgs | ContextArgs

const formatLogArgs = (...args: LogArgs): { message: string; meta?: LogMeta } => {
  if (typeof args[1] === "string") {
    const [context, message, meta] = args as ContextArgs
    return { message: `[${context}] ${message}`, meta }
  }

  const [message, meta] = args as MessageArgs
  return { message, meta }
}

function log(level: "info" | "warn" | "error" | "debug", ...args: LogArgs): void {
  const { message, meta } = formatLogArgs(...args)
  const output = `[${level}] ${message}`

  switch (level) {
    case "info":
      meta !== undefined ? console.log(output, meta) : console.log(output)
      break
    case "warn":
      meta !== undefined ? console.warn(output, meta) : console.warn(output)
      break
    case "error":
      meta !== undefined ? console.error(output, meta) : console.error(output)
      break
    case "debug":
      meta !== undefined ? console.debug(output, meta) : console.debug(output)
      break
  }
}

export function info(message: string, meta?: LogMeta): void
export function info(context: string, message: string, meta?: LogMeta): void
export function info(...args: LogArgs): void {
  log("info", ...args)
}

export function warn(message: string, meta?: LogMeta): void
export function warn(context: string, message: string, meta?: LogMeta): void
export function warn(...args: LogArgs): void {
  log("warn", ...args)
}

export function error(message: string, meta?: LogMeta): void
export function error(context: string, message: string, meta?: LogMeta): void
export function error(...args: LogArgs): void {
  log("error", ...args)
}

// Export logger object for files that import { logger }
export function debug(message: string, meta?: LogMeta): void
export function debug(context: string, message: string, meta?: LogMeta): void
export function debug(...args: LogArgs): void {
  log("debug", ...args)
}

export const logger = {
  info,
  warn,
  error,
  debug,
}
