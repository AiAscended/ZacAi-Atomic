import { vfs } from "./virtualFileSystem";

export interface ExecutionResult {
  output: string;
  error?: string;
  logs: string[];
  html?: string;
}

class CodeExecutionService {
  private logs: string[] = [];
  private iframe: HTMLIFrameElement | null = null;

  setIframe(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  async executeHTML(
    html: string,
    css?: string,
    js?: string,
  ): Promise<ExecutionResult> {
    this.logs = [];

    try {
      const fullHTML = this.buildFullHTML(html, css, js);

      if (this.iframe) {
        const doc =
          this.iframe.contentDocument || this.iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(fullHTML);
          doc.close();
        }
      }

      return {
        output: "Code executed successfully",
        html: fullHTML,
        logs: this.logs,
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "Execution failed",
        logs: this.logs,
      };
    }
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    this.logs = [];

    try {
      // Create a sandboxed console
      const sandboxConsole = {
        log: (...args: any[]) => this.logs.push(args.map(String).join(" ")),
        error: (...args: any[]) =>
          this.logs.push("ERROR: " + args.map(String).join(" ")),
        warn: (...args: any[]) =>
          this.logs.push("WARN: " + args.map(String).join(" ")),
        info: (...args: any[]) =>
          this.logs.push("INFO: " + args.map(String).join(" ")),
      };

      // Execute in sandboxed environment
      const func = new Function("console", code);
      func(sandboxConsole);

      return {
        output: "Execution completed",
        logs: this.logs,
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "Execution failed",
        logs: this.logs,
      };
    }
  }

  async executeReact(code: string): Promise<ExecutionResult> {
    this.logs = [];

    try {
      // Transform JSX to createElement calls (simplified)
      const transformed = this.transformJSX(code);

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${transformed}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

      if (this.iframe) {
        const doc =
          this.iframe.contentDocument || this.iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }

      return {
        output: "React component rendered",
        html,
        logs: this.logs,
      };
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "Execution failed",
        logs: this.logs,
      };
    }
  }

  async executeFromVFS(filePath: string): Promise<ExecutionResult> {
    try {
      const file = await vfs.readFile(filePath);

      if (!file) {
        return {
          output: "",
          error: "File not found",
          logs: [],
        };
      }

      // Determine execution method based on file type
      if (file.language === "html") {
        // Look for associated CSS and JS files
        const basePath = filePath.replace(/\.html$/, "");
        const cssFile = await vfs.readFile(basePath + ".css");
        const jsFile = await vfs.readFile(basePath + ".js");

        return this.executeHTML(
          file.content,
          cssFile?.content,
          jsFile?.content,
        );
      } else if (file.language === "javascript") {
        return this.executeJavaScript(file.content);
      } else if (
        file.language === "typescript" &&
        file.content.includes("React")
      ) {
        return this.executeReact(file.content);
      } else {
        return {
          output: "",
          error: "Unsupported file type for execution",
          logs: [],
        };
      }
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "Execution failed",
        logs: [],
      };
    }
  }

  private buildFullHTML(html: string, css?: string, js?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    ${css || ""}
  </style>
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ""}
  <script>
    // Capture console output and send to parent
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };
    
    ['log', 'error', 'warn', 'info'].forEach(method => {
      console[method] = function(...args) {
        originalConsole[method](...args);
        window.parent.postMessage({
          type: 'console',
          method,
          args: args.map(arg => {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }),
        }, '*');
      };
    });

    // Capture errors
    window.addEventListener('error', (event) => {
      window.parent.postMessage({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, '*');
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      window.parent.postMessage({
        type: 'error',
        message: 'Unhandled Promise Rejection: ' + event.reason,
      }, '*');
    });
  </script>
</body>
</html>`;
  }

  private transformJSX(code: string): string {
    // Very basic JSX transformation - in production, use Babel
    // This is just a placeholder for the concept
    return code
      .replace(/export\s+default\s+function\s+(\w+)/g, "function $1")
      .replace(/export\s+function\s+(\w+)/g, "function $1")
      .replace(/export\s+const\s+(\w+)/g, "const $1");
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const codeExecution = new CodeExecutionService();
