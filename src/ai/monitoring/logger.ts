import { logger } from "./logger-instance" // Assuming logger-instance is the module where logger is defined

export function logEvent(eventName: string, data: any): void {
  logger.info(eventName, data)
}

export function logError(errorName: string, error: any, context: any): void {
  logger.error(errorName, { error: error.message, stack: error.stack, ...context })
}
