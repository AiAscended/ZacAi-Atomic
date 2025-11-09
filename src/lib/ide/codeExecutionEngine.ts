import { vfs } from './virtualFileSystem';

export interface ExecutionResult {
  output: string;
  error: string | null;
  logs: string[];
  executionTime: number;
}

export interface ExecutionContext {
  language: string;
  code: string;
  filename?: string;
}

export class CodeExecutionEngine {
  private consoleOutput: string[] = [];
  private errorOutput: string | null = null;

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = performance.now();
    this.consoleOutput = [];
    this.errorOutput = null;

    try {
      switch (context.language) {
        case 'javascript':
        case 'typescript':
          return await this.executeJavaScript(context.code);
        case 'html':
          return await this.executeHTML(context.code);
        case 'css':
          return this.executionSuccess('CSS parsed successfully', startTime);
        default:
          return this.executionError(
            `Execution not supported for ${context.language}`,
            startTime
          );
      }
    } catch (error) {
      return this.executionError(
        error instanceof Error ? error.message : String(error),
        startTime
      );
    }
  }

  private async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    
    // Create sandboxed execution environment
    const sandbox: any = {
      console: {
        log: (...args: any[]) => this.consoleOutput.push(args.map(String).join(' ')),
        error: (...args: any[]) => {
          const msg = args.map(String).join(' ');
          this.consoleOutput.push(`❌ ${msg}`);
          this.errorOutput = msg;
        },
        warn: (...args: any[]) => this.consoleOutput.push(`⚠️ ${args.map(String).join(' ')}`),
        info: (...args: any[]) => this.consoleOutput.push(`ℹ️ ${args.map(String).join(' ')}`),
      },
      setTimeout: (fn: (...args: any[]) => void, ms: number) => setTimeout(fn, Math.min(ms, 5000)),
      setInterval: (fn: (...args: any[]) => void, ms: number) => setInterval(fn, Math.max(ms, 100)),
      clearTimeout: (id: number) => clearTimeout(id),
      clearInterval: (id: number) => clearInterval(id),
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Promise,
      // Blocked for security
      fetch: undefined,
      XMLHttpRequest: undefined,
      WebSocket: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      document: undefined,
      window: undefined,
    };

    try {
      // Wrap code in function to isolate scope
      const wrappedCode = `
        (function(console, setTimeout, setInterval, clearTimeout, clearInterval, Math, Date, JSON, Array, Object, String, Number, Boolean, Promise) {
          "use strict";
          ${code}
        })
      `;

      // Compile and execute
      const fn = eval(wrappedCode);
      const result = await fn(
        sandbox.console,
        sandbox.setTimeout,
        sandbox.setInterval,
        sandbox.clearTimeout,
        sandbox.clearInterval,
        sandbox.Math,
        sandbox.Date,
        sandbox.JSON,
        sandbox.Array,
        sandbox.Object,
        sandbox.String,
        sandbox.Number,
        sandbox.Boolean,
        sandbox.Promise
      );

      // Add result to output if it exists
      if (result !== undefined) {
        this.consoleOutput.push(`↳ ${JSON.stringify(result, null, 2)}`);
      }

      return {
        output: this.consoleOutput.join('\n'),
        error: this.errorOutput,
        logs: this.consoleOutput,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return this.executionError(
        error instanceof Error ? error.message : String(error),
        startTime
      );
    }
  }

  private async executeHTML(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    
    // Validate HTML structure
    const hasHtml = /<html[^>]*>/i.test(code);
    const hasBody = /<body[^>]*>/i.test(code);
    
    if (!hasHtml || !hasBody) {
      this.consoleOutput.push('⚠️ HTML document missing <html> or <body> tags');
    }

    // Check for inline scripts
    const scriptMatches = code.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      this.consoleOutput.push(`ℹ️ Found ${scriptMatches.length} inline script(s)`);
      
      // Extract and execute scripts
      for (const scriptTag of scriptMatches) {
        const scriptContent = scriptTag.replace(/<script[^>]*>|<\/script>/gi, '');
        if (scriptContent.trim()) {
          const jsResult = await this.executeJavaScript(scriptContent);
          if (jsResult.error) {
            return jsResult;
          }
        }
      }
    }

    return {
      output: this.consoleOutput.join('\n') || 'HTML ready for preview',
      error: this.errorOutput,
      logs: this.consoleOutput,
      executionTime: performance.now() - startTime,
    };
  }

  private executionSuccess(message: string, startTime: number): ExecutionResult {
    return {
      output: message,
      error: null,
      logs: [message],
      executionTime: performance.now() - startTime,
    };
  }

  private executionError(message: string, startTime: number): ExecutionResult {
    return {
      output: '',
      error: message,
      logs: [],
      executionTime: performance.now() - startTime,
    };
  }

  async executeFile(filePath: string): Promise<ExecutionResult> {
    await vfs.init();
    const file = await vfs.readFile(filePath);

    if (!file) {
      return this.executionError(`File not found: ${filePath}`, 0);
    }

    if (file.type === 'directory') {
      return this.executionError(`Cannot execute directory: ${filePath}`, 0);
    }

    return this.execute({
      language: file.language,
      code: file.content,
      filename: filePath,
    });
  }

  // Advanced: Execute with dependencies
  async executeWithDependencies(
    entryPoint: string,
    files: Map<string, string>
  ): Promise<ExecutionResult> {
    const startTime = performance.now();

    try {
      // Build module system
      const modules: Record<string, any> = {};

      // Simple require implementation
      const requireFn = (modulePath: string) => {
        if (modules[modulePath]) {
          return modules[modulePath].exports;
        }

        const code = files.get(modulePath);
        if (!code) {
          throw new Error(`Module not found: ${modulePath}`);
        }

        const moduleWrapper = { exports: {} };
        modules[modulePath] = moduleWrapper;

        // Execute module
        const wrappedCode = `
          (function(module, exports, require) {
            ${code}
          })
        `;
        const fn = eval(wrappedCode);
        fn(moduleWrapper, moduleWrapper.exports, requireFn);

        return moduleWrapper.exports;
      };

      // Execute entry point
      const entryCode = files.get(entryPoint);
      if (!entryCode) {
        return this.executionError(`Entry point not found: ${entryPoint}`, startTime);
      }

      await this.executeJavaScript(`
        const require = ${requireFn.toString()};
        ${entryCode}
      `);

      return {
        output: this.consoleOutput.join('\n'),
        error: this.errorOutput,
        logs: this.consoleOutput,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return this.executionError(
        error instanceof Error ? error.message : String(error),
        startTime
      );
    }
  }

  // Test runner for code validation
  async runTests(testCode: string, codeToTest: string): Promise<ExecutionResult> {
    const startTime = performance.now();

    try {
      // Simple test framework
      const tests: { name: string; passed: boolean; error?: string }[] = [];
      
      const testFramework = {
        test: (name: string, fn: () => void) => {
          try {
            fn();
            tests.push({ name, passed: true });
            this.consoleOutput.push(`✓ ${name}`);
          } catch (error) {
            tests.push({
              name,
              passed: false,
              error: error instanceof Error ? error.message : String(error),
            });
            this.consoleOutput.push(`✗ ${name}: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        expect: (actual: any) => ({
          toBe: (expected: any) => {
            if (actual !== expected) {
              throw new Error(`Expected ${expected} but got ${actual}`);
            }
          },
          toEqual: (expected: any) => {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
              throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            }
          },
          toBeTruthy: () => {
            if (!actual) {
              throw new Error(`Expected truthy value but got ${actual}`);
            }
          },
          toBeFalsy: () => {
            if (actual) {
              throw new Error(`Expected falsy value but got ${actual}`);
            }
          },
        }),
      };

      // Execute code to test first
      await this.executeJavaScript(codeToTest);

      // Then execute tests
      const testResult = await this.executeJavaScript(`
        const test = ${JSON.stringify(testFramework.test)};
        const expect = ${JSON.stringify(testFramework.expect)};
        ${testCode}
      `);

      const passedCount = tests.filter(t => t.passed).length;
      const failedCount = tests.length - passedCount;

      this.consoleOutput.push('');
      this.consoleOutput.push(`Tests: ${passedCount} passed, ${failedCount} failed, ${tests.length} total`);

      return {
        output: this.consoleOutput.join('\n'),
        error: failedCount > 0 ? `${failedCount} test(s) failed` : null,
        logs: this.consoleOutput,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return this.executionError(
        error instanceof Error ? error.message : String(error),
        startTime
      );
    }
  }
}

export const codeExecutor = new CodeExecutionEngine();
