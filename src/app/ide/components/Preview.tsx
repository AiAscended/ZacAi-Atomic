/**
 * File: src/app/ide/components/Preview.tsx
 * Purpose: HTML/JS preview panel with iframe sandbox
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Smartphone, Tablet, Monitor, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewProps {
  html?: string;
  css?: string;
  javascript?: string;
  className?: string;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'full';

const viewportSizes = {
  mobile: { width: '375px', height: '667px', icon: Smartphone },
  tablet: { width: '768px', height: '1024px', icon: Tablet },
  desktop: { width: '1440px', height: '900px', icon: Monitor },
  full: { width: '100%', height: '100%', icon: Eye },
};

export function Preview({ html = '', css = '', javascript = '', className }: PreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('full');
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Capture console logs
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
              window.parent.postMessage({
                type: 'console',
                level: 'log',
                message: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ')
              }, '*');
              originalLog.apply(console, args);
            };
            
            console.error = function(...args) {
              window.parent.postMessage({
                type: 'console',
                level: 'error',
                message: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ')
              }, '*');
              originalError.apply(console, args);
            };
            
            console.warn = function(...args) {
              window.parent.postMessage({
                type: 'console',
                level: 'warn',
                message: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ')
              }, '*');
              originalWarn.apply(console, args);
            };
            
            // Capture runtime errors
            window.addEventListener('error', function(event) {
              window.parent.postMessage({
                type: 'error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
              }, '*');
            });
          })();
          
          // User JavaScript
          ${javascript}
        </script>
      </body>
    </html>
  `;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const ViewportIcon = viewportSizes[viewport].icon;

  return (
    <div className={cn('flex flex-col h-full bg-ide-bg', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-ide-border bg-ide-sidebar-bg">
        <div className="flex items-center gap-1">
          {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
            const Icon = viewportSizes[size].icon;
            return (
              <Button
                key={size}
                variant={viewport === size ? 'default' : 'ghost'}
                size="icon"
                className="h-6 w-6"
                onClick={() => setViewport(size)}
                title={size}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview container */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div
          className="mx-auto bg-white dark:bg-gray-950 shadow-lg"
          style={{
            width: viewportSizes[viewport].width,
            height: viewportSizes[viewport].height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <iframe
            key={refreshKey}
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
