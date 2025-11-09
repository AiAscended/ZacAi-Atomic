/**
 * LLM Error Handling
 * Custom error classes and error handling utilities
 */

export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMTokenizationError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMTokenizationError';
  }
}

export class LLMInferenceError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMInferenceError';
  }
}

export class LLMTrainingError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMTrainingError';
  }
}

export class LLMConfigError extends LLMError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMConfigError';
  }
}

export function handleLLMError(error: unknown): void {
  if (error instanceof LLMError) {
    console.error(`[${error.name}] ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`[Error] ${error.message}`);
  } else {
    console.error('Unknown error occurred');
  }
}

const llmErrorHandling = {
  LLMError,
  LLMTokenizationError,
  LLMInferenceError,
  LLMTrainingError,
  LLMConfigError,
  handleLLMError,
};

export default llmErrorHandling;
