import React from "react";
import { create } from "zustand";
import { useEditorStore } from "./editorStore";
import { codeExecutor, ExecutionResult } from "./codeExecutionEngine";

export interface PreviewState {
  htmlContent: string;
  consoleOutput: string[];
  errors: string[];
  isLoading: boolean;
  autoRefresh: boolean;
  deviceMode: "mobile" | "tablet" | "desktop";
  showConsole: boolean;

  // Actions
  refreshPreview: () => Promise<void>;
  setDeviceMode: (mode: "mobile" | "tablet" | "desktop") => void;
  toggleAutoRefresh: () => void;
  toggleConsole: () => void;
  clearConsole: () => void;
  addConsoleLog: (
    message: string,
    type?: "log" | "error" | "warn" | "info",
  ) => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  htmlContent: "",
  consoleOutput: [],
  errors: [],
  isLoading: false,
  autoRefresh: true,
  deviceMode: "desktop",
  showConsole: true,

  refreshPreview: async () => {
    set({ isLoading: true, errors: [], consoleOutput: [] });

    try {
      const editorStore = useEditorStore.getState();
      const activeTab = editorStore.getActiveTab();

      if (!activeTab) {
        set({
          htmlContent:
            '<div style="padding: 20px; text-align: center;">No file open</div>',
          isLoading: false,
        });
        return;
      }

      // Build preview based on file type
      let previewHTML = "";
      const { language, content } = activeTab;

      if (language === "html") {
        previewHTML = await generateHTMLPreview(content);
      } else if (language === "javascript" || language === "typescript") {
        previewHTML = await generateJavaScriptPreview(content);
      } else if (language === "css") {
        previewHTML = await generateCSSPreview(content);
      } else if (language === "markdown") {
        previewHTML = await generateMarkdownPreview(content);
      } else {
        previewHTML = `
          <div style="padding: 20px; font-family: monospace;">
            <h3>Preview not available for ${language} files</h3>
            <p>Supported formats: HTML, JavaScript, CSS, Markdown</p>
          </div>
        `;
      }

      set({ htmlContent: previewHTML, isLoading: false });
    } catch (error) {
      set({
        errors: [error instanceof Error ? error.message : "Unknown error"],
        isLoading: false,
      });
    }
  },

  setDeviceMode: (mode) => set({ deviceMode: mode }),

  toggleAutoRefresh: () =>
    set((state) => ({ autoRefresh: !state.autoRefresh })),

  toggleConsole: () => set((state) => ({ showConsole: !state.showConsole })),

  clearConsole: () => set({ consoleOutput: [], errors: [] }),

  addConsoleLog: (message, type = "log") => {
    const prefix =
      type === "error"
        ? "❌"
        : type === "warn"
          ? "⚠️"
          : type === "info"
            ? "ℹ️"
            : "▶";
    set((state) => ({
      consoleOutput: [...state.consoleOutput, `${prefix} ${message}`],
    }));
  },
}));

// Generate HTML preview with execution
async function generateHTMLPreview(html: string): Promise<string> {
  // Execute any inline scripts
  const result = await codeExecutor.execute({
    language: "html",
    code: html,
  });

  // Inject console capture
  const enhancedHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preview</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      </style>
      <script>
        // Capture console output
        (function() {
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
          };

          ['log', 'error', 'warn', 'info'].forEach(method => {
            console[method] = function(...args) {
              window.parent.postMessage({
                type: 'console',
                method: method,
                args: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ),
              }, '*');
              originalConsole[method].apply(console, args);
            };
          });

          // Capture errors
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'error',
              message: message,
              source: source,
              lineno: lineno,
              colno: colno,
            }, '*');
            return false;
          };

          // Notify ready
          window.addEventListener('load', () => {
            window.parent.postMessage({ type: 'ready' }, '*');
          });
        })();
      </script>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  return enhancedHTML;
}

// Generate JavaScript preview
async function generateJavaScriptPreview(code: string): Promise<string> {
  const result = await codeExecutor.execute({
    language: "javascript",
    code: code,
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>JavaScript Preview</title>
      <style>
        body {
          font-family: monospace;
          padding: 20px;
          background: #1e1e1e;
          color: #d4d4d4;
        }
        .output { 
          background: #252526; 
          padding: 15px; 
          border-radius: 5px; 
          white-space: pre-wrap; 
          margin-bottom: 10px;
        }
        .error { color: #f48771; }
        .success { color: #89d185; }
      </style>
    </head>
    <body>
      <h2>Execution Output:</h2>
      ${
        result.error
          ? `
        <div class="output error">
          <strong>Error:</strong><br>${result.error}
        </div>
      `
          : `
        <div class="output success">
          ${result.output || "(No output)"}
        </div>
      `
      }
      <small>Execution time: ${result.executionTime.toFixed(2)}ms</small>
      
      <script>
        // Re-execute in preview context
        try {
          ${code}
        } catch (error) {
          console.error('Preview execution error:', error);
        }
      </script>
    </body>
    </html>
  `;
}

// Generate CSS preview
async function generateCSSPreview(css: string): Promise<string> {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CSS Preview</title>
      <style>
        ${css}
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <h1>CSS Preview</h1>
        <p>This is a paragraph with your custom styles.</p>
        
        <div class="demo-box" style="padding: 20px; margin: 20px 0; border: 1px solid #ccc;">
          <h2>Demo Box</h2>
          <p>Apply your CSS classes to see the styles in action.</p>
          <button>Button</button>
          <a href="#">Link</a>
        </div>

        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
          <li>List item 3</li>
        </ul>

        <div style="margin-top: 20px;">
          <input type="text" placeholder="Input field" />
          <textarea placeholder="Textarea"></textarea>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate Markdown preview
async function generateMarkdownPreview(markdown: string): Promise<string> {
  // Simple markdown to HTML conversion
  const html = markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    // Code blocks
    .replace(
      /```(\w+)?\n([\s\S]*?)```/gim,
      '<pre><code class="language-$1">$2</code></pre>',
    )
    // Inline code
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    // Line breaks
    .replace(/\n/gim, "<br>");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Markdown Preview</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          color: #333;
        }
        h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
        h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        code { 
          background: #f6f8fa; 
          padding: 2px 6px; 
          border-radius: 3px; 
          font-family: monospace; 
          font-size: 0.9em;
        }
        pre { 
          background: #f6f8fa; 
          padding: 16px; 
          border-radius: 6px; 
          overflow-x: auto; 
        }
        pre code { background: none; padding: 0; }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        strong { font-weight: 600; }
        em { font-style: italic; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
}

// Hook for hot module reloading
export function useHotReload() {
  const { autoRefresh, refreshPreview } = usePreviewStore();

  React.useEffect(() => {
    if (!autoRefresh) return;

    const unsubscribe = useEditorStore.subscribe((state, prevState) => {
      const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
      const prevActiveTab = prevState.tabs.find(
        (t) => t.id === prevState.activeTabId,
      );

      // Refresh if active tab content changed
      if (
        activeTab &&
        prevActiveTab &&
        activeTab.content !== prevActiveTab.content
      ) {
        // Debounce refresh
        const timeoutId = setTimeout(() => {
          refreshPreview();
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    });

    return unsubscribe;
  }, [autoRefresh, refreshPreview]);
}
