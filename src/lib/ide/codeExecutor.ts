/**
 * Code Execution Engine for IDE
 * Executes code in a sandboxed environment
 */

export interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  executionTime: number;
  logs: Array<{ type: 'log' | 'warn' | 'error'; message: string; timestamp: number }>;
}

export interface ExecutionOptions {
  timeout?: number; // milliseconds
  language?: 'javascript' | 'typescript' | 'html' | 'css';
}

export class CodeExecutor {
  private readonly MAX_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds

  /**
   * Execute JavaScript code in a sandboxed environment
   */
  async executeJavaScript(code: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = performance.now();
    const timeout = Math.min(options.timeout || this.DEFAULT_TIMEOUT, this.MAX_TIMEOUT);
    const logs: ExecutionResult['logs'] = [];

    try {
      // Create sandboxed execution context
      const sandbox = this.createSandbox(logs);
      
      // Wrap code with console capture
      const wrappedCode = `
        (async function() {
          ${code}
        })();
      `;

      // Execute with timeout
      const result = await this.executeWithTimeout(wrappedCode, sandbox, timeout);
      
      const executionTime = performance.now() - startTime;

      return {
        output: this.formatLogs(logs),
        exitCode: 0,
        executionTime,
        logs,
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logs.push({
        type: 'error',
        message: errorMessage,
        timestamp: Date.now(),
      });

      return {
        output: this.formatLogs(logs),
        error: errorMessage,
        exitCode: 1,
        executionTime,
        logs,
      };
    }
  }

  /**
   * Execute HTML/CSS/JS preview
   */
  async executePreview(html: string, css: string, js: string): Promise<string> {
    // Create a safe iframe-compatible document
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Sandbox console to send messages to parent
    (function() {
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
      };
      
      console.log = function(...args) {
        originalConsole.log.apply(console, args);
        window.parent.postMessage({ type: 'console', level: 'log', args }, '*');
      };
      
      console.error = function(...args) {
        originalConsole.error.apply(console, args);
        window.parent.postMessage({ type: 'console', level: 'error', args }, '*');
      };
      
      console.warn = function(...args) {
        originalConsole.warn.apply(console, args);
        window.parent.postMessage({ type: 'console', level: 'warn', args }, '*');
      };
      
      // Error handling
      window.addEventListener('error', function(e) {
        window.parent.postMessage({ 
          type: 'error', 
          message: e.message, 
          line: e.lineno, 
          col: e.colno 
        }, '*');
      });
      
      window.addEventListener('unhandledrejection', function(e) {
        window.parent.postMessage({ 
          type: 'error', 
          message: 'Unhandled Promise rejection: ' + e.reason 
        }, '*');
      });
    })();
    
    // User code
    try {
      ${js}
    } catch (error) {
      console.error('Runtime error:', error.message);
    }
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * Create a sandboxed execution environment
   */
  private createSandbox(logs: ExecutionResult['logs']) {
    return {
      console: {
        log: (...args: any[]) => {
          logs.push({
            type: 'log',
            message: args.map((arg) => this.formatValue(arg)).join(' '),
            timestamp: Date.now(),
          });
        },
        warn: (...args: any[]) => {
          logs.push({
            type: 'warn',
            message: args.map((arg) => this.formatValue(arg)).join(' '),
            timestamp: Date.now(),
          });
        },
        error: (...args: any[]) => {
          logs.push({
            type: 'error',
            message: args.map((arg) => this.formatValue(arg)).join(' '),
            timestamp: Date.now(),
          });
        },
      },
      // Provide safe global objects
      Math,
      Date,
      JSON,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Promise,
      setTimeout: (fn: (...args: unknown[]) => unknown, ms: number) => {
        return setTimeout(fn, Math.min(ms, 5000)); // Max 5s delay
      },
      setInterval: (fn: (...args: unknown[]) => unknown, ms: number) => {
        return setInterval(fn, Math.max(ms, 100)); // Min 100ms interval
      },
      clearTimeout,
      clearInterval,
    };
  }

  /**
   * Execute code with timeout
   */
  private async executeWithTimeout(
    code: string,
    sandbox: any,
    timeout: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeout}ms`));
      }, timeout);

      try {
        // Create function with sandbox context
        const keys = Object.keys(sandbox);
        const values = keys.map((key) => sandbox[key]);
        
        // Use Function constructor for safer execution
        const fn = new Function(...keys, code);
        const result = fn(...values);

        // Handle promise results
        if (result instanceof Promise) {
          result
            .then((value) => {
              clearTimeout(timeoutId);
              resolve(value);
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              reject(error);
            });
        } else {
          clearTimeout(timeoutId);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Format value for console output
   */
  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
    if (Array.isArray(value)) {
      return '[' + value.map((v) => this.formatValue(v)).join(', ') + ']';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }

  /**
   * Format logs for output
   */
  private formatLogs(logs: ExecutionResult['logs']): string {
    if (logs.length === 0) return '';
    
    return logs
      .map((log) => {
        const prefix = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : '✓';
        return `${prefix} ${log.message}`;
      })
      .join('\n');
  }

  /**
   * Execute TypeScript code (converts to JavaScript first)
   */
  async executeTypeScript(code: string, options: ExecutionOptions = {}): Promise<ExecutionResult> {
    // For now, we'll just strip type annotations and execute as JavaScript
    // In a full implementation, you'd use TypeScript compiler API
    
    const jsCode = this.stripTypeAnnotations(code);
    return this.executeJavaScript(jsCode, options);
  }

  /**
   * Simple TypeScript to JavaScript conversion (strips types)
   */
  private stripTypeAnnotations(code: string): string {
    // This is a very basic implementation
    // A real implementation would use TypeScript's compiler API
    return code
      .replace(/:\s*\w+(\[\])?(\s*[=,)])/g, '$2') // Remove type annotations
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
      .replace(/<\w+>/g, ''); // Remove generic types
  }

  /**
   * Validate code before execution
   */
  validateCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /import\s+/,
      /require\s*\(/,
      /__proto__/,
      /constructor\[/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Potentially dangerous code detected: ${pattern.source}`);
      }
    }

    // Check code length
    if (code.length > 100000) {
      errors.push('Code is too large (max 100KB)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return ['javascript', 'typescript', 'html', 'css'];
  }

  /**
   * Get execution limits
   */
  getExecutionLimits() {
    return {
      maxTimeout: this.MAX_TIMEOUT,
      defaultTimeout: this.DEFAULT_TIMEOUT,
      maxCodeSize: 100000, // 100KB
    };
  }
}

// Singleton instance
export const codeExecutor = new CodeExecutor();
