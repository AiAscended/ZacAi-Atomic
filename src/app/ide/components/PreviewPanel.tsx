"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor, AlertCircle } from 'lucide-react';
import { codeExecutor } from '@/ide/codeExecutor';
import { useEditorStore } from '@/ide/editorStore';
import type { EditorTab } from '@/ide/editorStore';
import { useFileSystem } from '@/ide/useFileSystem';
import { ScrollArea } from '@/components/ui/scroll-area';

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

export function PreviewPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [previewContent, setPreviewContent] = useState('');
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { openFiles, activeFileId } = useEditorStore();
  const { fs } = useFileSystem();

  // Auto-refresh when active file changes
  useEffect(() => {
    handleRefresh();
  }, [activeFileId]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setConsoleMessages((prev) => [
          ...prev,
          {
            type: event.data.level,
            message: event.data.args.join(' '),
            timestamp: Date.now(),
          },
        ]);
        setShowConsole(true);
      } else if (event.data.type === 'error') {
        setConsoleMessages((prev) => [
          ...prev,
          {
            type: 'error',
            message: `${event.data.message} (Line: ${event.data.line}, Col: ${event.data.col})`,
            timestamp: Date.now(),
          },
        ]);
        setShowConsole(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setConsoleMessages([]);
    
    try {
      // Get active file
  const activeFile = openFiles.find((f: EditorTab) => f.id === activeFileId);
      
      if (!activeFile) {
        // Show default preview
        setPreviewContent(getDefaultPreview());
        return;
      }

      const filePath = activeFile.path;
      const extension = filePath.split('.').pop()?.toLowerCase();

      if (extension === 'html') {
        // HTML file - load as is with linked resources
        await generateHTMLPreview(filePath);
      } else if (extension === 'js' || extension === 'ts') {
        // JavaScript/TypeScript - execute and show results
        await generateJSPreview(activeFile.content);
      } else if (extension === 'css') {
        // CSS - create a demo HTML with the styles
        await generateCSSPreview(activeFile.content);
      } else if (['jsx', 'tsx'].includes(extension || '')) {
        // React components - show message about future support
        setPreviewContent(getReactPreview());
      } else {
        // Unsupported - show default
        setPreviewContent(getDefaultPreview());
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewContent(getErrorPreview(String(error)));
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateHTMLPreview = async (filePath: string) => {
    if (!fs) return;
    
    try {
      const htmlContent = await fs.read(filePath);
      if (htmlContent === null) {
        setPreviewContent(getErrorPreview('Failed to load HTML content.'));
        return;
      }
      
      // Try to load referenced CSS and JS files
      const dirPath = filePath.split('/').slice(0, -1).join('/');
      
      // Simple parsing for linked resources
      let processedHTML = htmlContent;
      
      // Find and inline CSS
      const cssMatches = htmlContent.match(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/g);
      if (cssMatches) {
        for (const match of cssMatches) {
          const hrefMatch = match.match(/href=["']([^"']+)["']/);
          if (hrefMatch) {
            const cssPath = `${dirPath}/${hrefMatch[1]}`;
            try {
              const cssContent = await fs.read(cssPath);
              if (cssContent) {
                processedHTML = processedHTML.replace(
                  match,
                  `<style>${cssContent}</style>`
                );
              }
            } catch {
              // CSS file not found, leave as is
            }
          }
        }
      }
      
      setPreviewContent(processedHTML);
    } catch (error) {
      setPreviewContent(getErrorPreview(`Failed to load HTML: ${error}`));
    }
  };

  const generateJSPreview = async (jsCode: string) => {
    const html = `
      <div style="font-family: 'Courier New', monospace; padding: 20px;">
        <h2>JavaScript Output</h2>
        <div id="output" style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
          <p style="color: #666;">Executing...</p>
        </div>
      </div>
    `;
    
    const js = `
      try {
        const output = document.getElementById('output');
        output.innerHTML = '';
        
        // Capture console.log output
        const originalLog = console.log;
        const logs = [];
        console.log = function(...args) {
          logs.push(args.map(arg => {
            if (typeof arg === 'object') {
              try { return JSON.stringify(arg, null, 2); }
              catch { return String(arg); }
            }
            return String(arg);
          }).join(' '));
          originalLog.apply(console, args);
        };
        
        // Execute user code
        ${jsCode}
        
        // Display logs
        if (logs.length > 0) {
          output.innerHTML = '<pre style="margin: 0;">' + logs.join('\\n') + '</pre>';
        } else {
          output.innerHTML = '<p style="color: #666; margin: 0;">No output</p>';
        }
        
        console.log = originalLog;
      } catch (error) {
        document.getElementById('output').innerHTML = 
          '<p style="color: #d32f2f; margin: 0;">Error: ' + error.message + '</p>';
      }
    `;
    
    const preview = await codeExecutor.executePreview(html, '', js);
    setPreviewContent(preview);
  };

  const generateCSSPreview = async (cssCode: string) => {
    const html = `
      <div class="demo-container">
        <h1>CSS Preview</h1>
        <p class="text-content">This is a sample paragraph to demonstrate the CSS styles.</p>
        <button class="demo-button">Sample Button</button>
        <div class="demo-box">Sample Box</div>
        <ul class="demo-list">
          <li>List Item 1</li>
          <li>List Item 2</li>
          <li>List Item 3</li>
        </ul>
      </div>
    `;
    
    const css = `
      body {
        font-family: system-ui, -apple-system, sans-serif;
        padding: 20px;
        margin: 0;
      }
      ${cssCode}
    `;
    
    const preview = await codeExecutor.executePreview(html, css, '');
    setPreviewContent(preview);
  };

  const getDefaultPreview = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 3rem;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
          }
          h1 { 
            color: #333;
            margin-bottom: 1rem;
          }
          p { 
            line-height: 1.6; 
            color: #666;
            margin-bottom: 1rem;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            padding: 0.5rem 0;
            color: #666;
          }
          li:before {
            content: "✓ ";
            color: #667eea;
            font-weight: bold;
            margin-right: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 ZacAi IDE Preview</h1>
          <p>Your code preview will appear here.</p>
          <p><strong>Phase 4: Completed!</strong></p>
          <ul>
            <li>Real-time code execution</li>
            <li>HTML/CSS/JS preview</li>
            <li>Console output capture</li>
            <li>Error boundaries</li>
            <li>Multiple device sizes</li>
          </ul>
        </div>
      </body>
      </html>
    `;
  };

  const getReactPreview = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Preview</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 2rem;
            margin: 0;
          }
          .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 1.5rem;
            border-radius: 4px;
          }
          h2 { color: #1976d2; margin-top: 0; }
          p { color: #555; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="info-box">
          <h2>⚛️ React Component Preview</h2>
          <p>React component rendering will be available in future updates.</p>
          <p>For now, you can:</p>
          <ul>
            <li>Test individual HTML/CSS/JS files</li>
            <li>Use the AI assistant to convert React to vanilla JS</li>
            <li>Build components in a separate HTML file</li>
          </ul>
        </div>
      </body>
      </html>
    `;
  };

  const getErrorPreview = (error: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview Error</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 2rem;
            margin: 0;
          }
          .error-box {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 1.5rem;
            border-radius: 4px;
          }
          h2 { color: #c62828; margin-top: 0; }
          pre { 
            background: #fff;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            color: #d32f2f;
          }
        </style>
      </head>
      <body>
        <div class="error-box">
          <h2>❌ Preview Error</h2>
          <pre>${error}</pre>
        </div>
      </body>
      </html>
    `;
  };

  const getDeviceDimensions = () => {
    switch (deviceSize) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dimensions = getDeviceDimensions();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Preview</span>
          <div className="flex items-center gap-1">
            <Button
              variant={deviceSize === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDeviceSize('mobile')}
              title="Mobile (375x667)"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceSize === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDeviceSize('tablet')}
              title="Tablet (768x1024)"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceSize === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDeviceSize('desktop')}
              title="Desktop (Full)"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Open in new tab">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-muted/30 p-4 overflow-auto">
          <div
            className="bg-background border rounded-lg shadow-lg transition-all duration-300"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full rounded-lg"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
              srcDoc={previewContent || getDefaultPreview()}
            />
          </div>
        </div>

        {/* Console Output */}
        {showConsole && consoleMessages.length > 0 && (
          <div className="border-t bg-background">
            <div className="flex items-center justify-between px-3 py-1 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Console</span>
                <span className="text-xs text-muted-foreground">
                  {consoleMessages.length} message{consoleMessages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setConsoleMessages([])}
              >
                Clear
              </Button>
            </div>
            <ScrollArea className="h-32">
              <div className="p-2 space-y-1 font-mono text-xs">
                {consoleMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded ${
                      msg.type === 'error'
                        ? 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
                        : msg.type === 'warn'
                        ? 'bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <span className="opacity-70 mr-2">
                      {msg.type === 'error' ? '❌' : msg.type === 'warn' ? '⚠️' : '›'}
                    </span>
                    {msg.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="p-2 border-t">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            ✅ Phase 4 Complete: Live preview with code execution
          </p>
          {consoleMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setShowConsole(!showConsole)}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {showConsole ? 'Hide' : 'Show'} Console
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
