/**
 * File: src/ai/orchestration/errorHandler.ts
 *
 * Error Handler for ZacAi-Atomic
 * Provides graceful error handling, fallback strategies, and error recovery
 *
 * Responsibilities:
 * - Catch and log all system errors
 * - Provide fallback responses when models fail
 * - Graceful degradation strategies
 * - Error recovery and retry logic
 * - User-friendly error messages
 */

import { logger } from "./logger";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error types in the system
 */
export enum ErrorType {
  MODEL_ERROR = "model_error",
  DOMAIN_ERROR = "domain_error",
  API_ERROR = "api_error",
  NETWORK_ERROR = "network_error",
  TIMEOUT_ERROR = "timeout_error",
  VALIDATION_ERROR = "validation_error",
  INFERENCE_ERROR = "inference_error",
  INITIALIZATION_ERROR = "initialization_error",
  UNKNOWN_ERROR = "unknown_error",
}

/**
 * Structured error interface
 */
export interface StructuredError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: unknown;
  context?: Record<string, unknown>;
  timestamp: number;
  recoverable: boolean;
}

/**
 * Fallback response for errors
 */
export interface FallbackResponse {
  text: string;
  confidence: number;
  metadata: {
    isFallback: true;
    errorType: ErrorType;
    attemptedRecovery: boolean;
  };
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private errorHistory: StructuredError[] = [];
  private maxHistorySize = 100;
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  /**
   * Handle an error and return a fallback response
   */
  public handleError(
    error: unknown,
    context?: Record<string, unknown>,
  ): FallbackResponse {
    const structuredError = this.structureError(error, context);
    this.logError(structuredError);
    this.storeError(structuredError);

    // Attempt recovery if possible
    if (structuredError.recoverable) {
      const recovered = this.attemptRecovery(structuredError);
      if (recovered) {
        return this.createFallbackResponse(structuredError, true);
      }
    }

    return this.createFallbackResponse(structuredError, false);
  }

  /**
   * Structure raw error into standardized format
   */
  private structureError(
    error: unknown,
    context?: Record<string, unknown>,
  ): StructuredError {
    let type = ErrorType.UNKNOWN_ERROR;
    let severity = ErrorSeverity.MEDIUM;
    let message = "An unknown error occurred";
    let recoverable = false;

    if (error instanceof Error) {
      message = error.message;

      // Determine error type from message
      if (message.includes("model") || message.includes("inference")) {
        type = ErrorType.MODEL_ERROR;
        severity = ErrorSeverity.HIGH;
        recoverable = true;
      } else if (message.includes("domain")) {
        type = ErrorType.DOMAIN_ERROR;
        severity = ErrorSeverity.MEDIUM;
        recoverable = true;
      } else if (message.includes("network") || message.includes("fetch")) {
        type = ErrorType.NETWORK_ERROR;
        severity = ErrorSeverity.HIGH;
        recoverable = true;
      } else if (message.includes("timeout")) {
        type = ErrorType.TIMEOUT_ERROR;
        severity = ErrorSeverity.MEDIUM;
        recoverable = true;
      } else if (
        message.includes("validation") ||
        message.includes("invalid")
      ) {
        type = ErrorType.VALIDATION_ERROR;
        severity = ErrorSeverity.LOW;
        recoverable = false;
      } else if (message.includes("initialize")) {
        type = ErrorType.INITIALIZATION_ERROR;
        severity = ErrorSeverity.CRITICAL;
        recoverable = false;
      }
    }

    return {
      type,
      severity,
      message,
      originalError: error,
      context,
      timestamp: Date.now(),
      recoverable,
    };
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: StructuredError): void {
    const logData = {
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      recoverable: error.recoverable,
    };

    if (
      error.severity === ErrorSeverity.CRITICAL ||
      error.severity === ErrorSeverity.HIGH
    ) {
      logger.info(`[ERROR] ${error.type}`, logData);
    } else {
      logger.info(`[WARN] ${error.type}`, logData);
    }
  }

  /**
   * Store error in history
   */
  private storeError(error: StructuredError): void {
    this.errorHistory.push(error);

    // Prune old errors
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Attempt to recover from error
   */
  private attemptRecovery(error: StructuredError): boolean {
    const errorKey = `${error.type}_${error.message}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;

    if (attempts >= this.maxRetries) {
      logger.info(`Max retry attempts reached for ${error.type}`, {});
      return false;
    }

    this.retryAttempts.set(errorKey, attempts + 1);
    logger.info(`Attempting recovery for ${error.type}`, {
      attempt: attempts + 1,
    });

    // Recovery strategies based on error type
    switch (error.type) {
      case ErrorType.MODEL_ERROR:
        return this.recoverFromModelError(error);

      case ErrorType.DOMAIN_ERROR:
        return this.recoverFromDomainError(error);

      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return this.recoverFromNetworkError(error);

      default:
        return false;
    }
  }

  /**
   * Recover from model errors (use fallback model)
   */
  private recoverFromModelError(error: StructuredError): boolean {
    logger.info("Attempting model fallback", {});
    // Fallback logic will be handled by modelSelector
    return true;
  }

  /**
   * Recover from domain errors (use general domain)
   */
  private recoverFromDomainError(error: StructuredError): boolean {
    logger.info("Falling back to general domain", {});
    return true;
  }

  /**
   * Recover from network errors (retry with exponential backoff)
   */
  private recoverFromNetworkError(error: StructuredError): boolean {
    const errorKey = `${error.type}_${error.message}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;
    const backoffMs = Math.min(1000 * Math.pow(2, attempts), 10000);

    logger.info("Retrying after backoff", { backoffMs });

    // In production, this would trigger an actual retry
    // For now, we just indicate recovery is possible
    return true;
  }

  /**
   * Create fallback response for user
   */
  private createFallbackResponse(
    error: StructuredError,
    recoveryAttempted: boolean,
  ): FallbackResponse {
    let userMessage = "I encountered an issue processing your request. ";

    switch (error.type) {
      case ErrorType.MODEL_ERROR:
        userMessage +=
          "The AI model is temporarily unavailable. Please try again in a moment.";
        break;

      case ErrorType.DOMAIN_ERROR:
        userMessage +=
          "I'm having trouble accessing specialized knowledge for this request.";
        break;

      case ErrorType.NETWORK_ERROR:
        userMessage +=
          "There's a network connectivity issue. Please check your connection.";
        break;

      case ErrorType.TIMEOUT_ERROR:
        userMessage +=
          "The request took too long to process. Try a shorter prompt.";
        break;

      case ErrorType.VALIDATION_ERROR:
        userMessage +=
          "There's an issue with the input format. Please rephrase your request.";
        break;

      case ErrorType.INITIALIZATION_ERROR:
        userMessage +=
          "The AI system is initializing. Please wait a moment and try again.";
        break;

      default:
        userMessage += "Something went wrong. Please try again.";
    }

    if (recoveryAttempted) {
      userMessage +=
        " I've attempted to recover and can still help with simpler queries.";
    }

    return {
      text: userMessage,
      confidence: 0.1,
      metadata: {
        isFallback: true,
        errorType: error.type,
        attemptedRecovery: recoveryAttempted,
      },
    };
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: StructuredError[];
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const error of this.errorHistory) {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    }

    return {
      totalErrors: this.errorHistory.length,
      byType,
      bySeverity,
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  /**
   * Clear retry attempts for recovery
   */
  public clearRetryAttempts(errorKey?: string): void {
    if (errorKey) {
      this.retryAttempts.delete(errorKey);
    } else {
      this.retryAttempts.clear();
    }
  }

  /**
   * Reset error history
   */
  public resetHistory(): void {
    this.errorHistory = [];
    logger.info("Error history reset", {});
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
